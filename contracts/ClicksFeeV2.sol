// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IClicksReferral {
    function distributeReferralYield(address agent, uint256 feeAmount) external returns (uint256 treasuryAmount);
    function getReferralChain(address agent) external view returns (address[3] memory chain);
}

/// @title ClicksFeeV2
/// @notice Collects protocol fees AND distributes referral rewards in USDC.
/// @dev Replaces ClicksFee. Key difference: integrates with ClicksReferral
///      to split fees between treasury and referrers, and holds USDC for claiming.
///
///      Fee flow:
///      1. ClicksSplitterV4 transfers fee USDC here + calls collectFee(agent, amount)
///      2. We read the agent's referral chain from ClicksReferral
///      3. We call ClicksReferral.distributeReferralYield() for accounting
///      4. We compute each referrer's share (same formula: L1=40%, L2=20%, L3=10%)
///      5. We track claimable USDC per referrer in THIS contract
///      6. Referrers call claimReward() to receive USDC
///      7. Treasury portion can be swept separately
contract ClicksFeeV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    uint16 public constant L1_SHARE_BPS = 4000; // 40% of fee
    uint16 public constant L2_SHARE_BPS = 2000; // 20% of fee
    uint16 public constant L3_SHARE_BPS = 1000; // 10% of fee
    uint16 public constant BPS = 10000;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;
    IClicksReferral public immutable referral;
    address public treasury;

    uint256 public totalCollected;
    uint256 public totalReferralDistributed;
    uint256 public totalReferralClaimed;

    /// @notice Claimable referral rewards per referrer address
    mapping(address => uint256) public claimable;

    /// @notice Authorized callers (ClicksSplitterV4)
    mapping(address => bool) public authorized;

    // ─── Events ───────────────────────────────────────────────────────────────

    event FeeCollected(address indexed agent, uint256 totalFee, uint256 referralPortion, uint256 treasuryPortion);
    event ReferralRewardTracked(address indexed referrer, uint256 amount, uint8 level);
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event FeeSwept(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event AuthorizationUpdated(address indexed caller, bool status);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotAuthorized();
    error ZeroAddress();
    error NothingToSweep();
    error NothingToClaim();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _usdc, address _referral, address _treasury) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_referral == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
        referral = IClicksReferral(_referral);
        treasury = _treasury;
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    /// @notice Collect fee and distribute referral rewards.
    /// @dev Called by ClicksSplitterV4 after transferring fee USDC here.
    ///      Reads the referral chain, computes each level's share,
    ///      tracks claimable USDC locally, and updates ClicksReferral accounting.
    function collectFee(address agent, uint256 amount) external payable {
        if (!authorized[msg.sender]) revert NotAuthorized();

        unchecked { totalCollected += amount; }

        // Read the referral chain for this agent
        address[3] memory chain = referral.getReferralChain(agent);

        // Update accounting in ClicksReferral (tracks totalEarned, claimable internally)
        uint256 treasuryAmount = referral.distributeReferralYield(agent, amount);

        // Compute and track each referrer's USDC share locally
        uint16[3] memory shares = [L1_SHARE_BPS, L2_SHARE_BPS, L3_SHARE_BPS];
        uint256 totalReferral;

        for (uint8 i = 0; i < 3; i++) {
            if (chain[i] == address(0)) break;
            uint256 reward = (amount * shares[i]) / BPS;
            if (reward > 0) {
                claimable[chain[i]] += reward;
                totalReferral += reward;
                emit ReferralRewardTracked(chain[i], reward, i + 1);
            }
        }

        unchecked { totalReferralDistributed += totalReferral; }

        emit FeeCollected(agent, amount, totalReferral, treasuryAmount);
    }

    /// @notice Referrer claims their accumulated USDC rewards.
    function claimReward() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToClaim();

        claimable[msg.sender] = 0;
        unchecked { totalReferralClaimed += amount; }

        usdc.safeTransfer(msg.sender, amount);
        emit ReferralClaimed(msg.sender, amount);
    }

    /// @notice Sweep treasury portion (balance minus unclaimed referral rewards).
    function sweep() external {
        uint256 balance = usdc.balanceOf(address(this));
        uint256 reserved = totalReferralDistributed - totalReferralClaimed;
        if (balance <= reserved) revert NothingToSweep();

        uint256 sweepable;
        unchecked { sweepable = balance - reserved; }
        usdc.safeTransfer(treasury, sweepable);
        emit FeeSwept(treasury, sweepable);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function pendingFees() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function pendingReferralRewards() external view returns (uint256) {
        return totalReferralDistributed - totalReferralClaimed;
    }

    function sweepableAmount() external view returns (uint256) {
        uint256 balance = usdc.balanceOf(address(this));
        uint256 reserved = totalReferralDistributed - totalReferralClaimed;
        return balance > reserved ? balance - reserved : 0;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setAuthorized(address caller, bool _authorized) external onlyOwner {
        if (caller == address(0)) revert ZeroAddress();
        authorized[caller] = _authorized;
        emit AuthorizationUpdated(caller, _authorized);
    }
}
