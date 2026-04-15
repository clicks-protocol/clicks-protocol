// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClicksFee
/// @notice Collects and manages the 2% protocol fee on agent yield
/// @dev Receives fee USDC from ClicksSplitter on every yield withdrawal
contract ClicksFee is Ownable {
    using SafeERC20 for IERC20;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice USDC token
    IERC20 public immutable usdc;

    /// @notice Address fees are swept to (protocol treasury)
    address public treasury;

    /// @notice Total fees collected since deployment
    uint256 public totalCollected;

    /// @notice Authorized callers (ClicksSplitter)
    mapping(address => bool) public authorized;

    // ─── Events ───────────────────────────────────────────────────────────────

    event FeeCollected(address indexed agent, uint256 amount);
    event FeeSwept(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event AuthorizationUpdated(address indexed caller, bool authorized);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotAuthorized();
    error ZeroAddress();
    error ZeroAmount();
    error NothingToSweep();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _usdc USDC token address
    /// @param _treasury Initial treasury address
    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Record a fee collection (USDC must be pre-transferred)
    /// @dev Called by ClicksSplitter after transferring fee USDC to this contract
    /// @param agent Agent address the fee relates to
    /// @param amount Fee amount collected
    function collectFee(address agent, uint256 amount) external payable {
        if (!authorized[msg.sender]) revert NotAuthorized();
        // amount > 0 guaranteed by caller (splitter checks fee > 0)
        unchecked { totalCollected += amount; }
        assembly {
            mstore(0, amount)
            log2(0, 32, 0x06c5efeff5c320943d265dc4e5f1af95ad523555ce0c1957e367dda5514572df, agent)
        }
    }

    /// @notice Sweep all accumulated fees to treasury
    /// @dev Anyone can call — always goes to treasury
    function sweep() external {
        uint256 balance = usdc.balanceOf(address(this));
        if (balance == 0) revert NothingToSweep();
        usdc.safeTransfer(treasury, balance);
        emit FeeSwept(treasury, balance);
    }

    /// @notice Sweep a specific amount to treasury
    function sweepAmount(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        usdc.safeTransfer(treasury, amount);
        emit FeeSwept(treasury, amount);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Update treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @notice Authorize or deauthorize a caller (e.g. new Splitter)
    function setAuthorized(address caller, bool _authorized) external onlyOwner {
        if (caller == address(0)) revert ZeroAddress();
        authorized[caller] = _authorized;
        emit AuthorizationUpdated(caller, _authorized);
    }

    /// @notice Current USDC balance held in this contract
    function pendingFees() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
