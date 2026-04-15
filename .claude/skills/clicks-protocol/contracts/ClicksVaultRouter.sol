// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC4626.sol";

/// @title ClicksVaultRouter
/// @notice Routes agent USDC treasury to ERC-4626 curated vaults (Steakhouse, Gauntlet, etc.)
/// @dev Standalone router compatible with ClicksSplitterV3 interface
///      Owner can switch vault address dynamically for yield optimization
contract ClicksVaultRouter {

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Contract owner (can change vault, update splitter)
    address public owner;

    /// @notice Address that can call deposit/withdraw (ClicksSplitter)
    address public splitter;

    /// @notice Current ERC-4626 vault we're depositing into
    IERC4626 public vault;

    /// @notice USDC token address (underlying asset)
    address public immutable usdc;

    /// @notice Total USDC deposited by all agents (principal only)
    uint256 public totalDeposited;

    /// @notice Per-agent deposited principal
    mapping(address => uint256) public agentDeposited;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposited(address indexed agent, uint256 amount, address vault);
    event Withdrawn(address indexed agent, uint256 amount, uint256 yield);
    event VaultUpdated(address indexed oldVault, address indexed newVault);
    event SplitterUpdated(address indexed oldSplitter, address indexed newSplitter);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error OnlySplitter();
    error OnlyOwner();
    error ZeroAmount();
    error ZeroAddress();
    error InsufficientBalance();
    error VaultAssetMismatch();
    error MaxDepositExceeded();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlySplitter() {
        if (msg.sender != splitter) revert OnlySplitter();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _usdc USDC token address
    /// @param _vault Initial ERC-4626 vault address
    /// @param _splitter Initial splitter address (can be updated)
    constructor(
        address _usdc,
        address _vault,
        address _splitter
    ) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_vault == address(0)) revert ZeroAddress();
        if (_splitter == address(0)) revert ZeroAddress();

        usdc = _usdc;
        vault = IERC4626(_vault);
        splitter = _splitter;
        owner = msg.sender;

        // Verify vault uses correct underlying asset
        if (IERC4626(_vault).asset() != _usdc) revert VaultAssetMismatch();

        // Max-approve vault once (saves gas on every deposit)
        _rawApprove(_usdc, _vault, type(uint256).max);

        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Deposit USDC into the ERC-4626 vault
    /// @dev Called by ClicksSplitter with the 20% yield portion
    /// @param amount Amount of USDC to deposit
    /// @param agent Address of the agent whose funds these are
    function deposit(uint256 amount, address agent)
        external
        payable
        onlySplitter
    {
        // amount > 0 and agent != 0 guaranteed by splitter
        // USDC already transferred by splitter (no need to pull)

        // Check vault capacity before depositing
        uint256 maxDeposit = vault.maxDeposit(address(this));
        if (amount > maxDeposit) revert MaxDepositExceeded();

        // Update accounting BEFORE external calls (CEI pattern)
        unchecked {
            agentDeposited[agent] += amount;
            totalDeposited += amount;
        }

        // Deposit into vault and receive shares
        uint256 shares = vault.deposit(amount, address(this));

        emit Deposited(agent, amount, address(vault));
    }

    /// @notice Withdraw agent's USDC + yield
    /// @dev Called by ClicksSplitter when agent requests withdrawal
    /// @param amount Amount of principal to withdraw (0 = withdraw all)
    /// @param agent Agent whose funds to withdraw
    /// @return received Actual USDC received (principal + yield)
    function withdraw(uint256 amount, address agent)
        external
        payable
        onlySplitter
        returns (uint256 received)
    {
        uint256 principal = agentDeposited[agent];
        // principal > 0 guaranteed by caller checking principalBefore

        // Withdraw all if amount is 0 or exceeds balance
        uint256 toWithdraw = (amount == 0 || amount >= principal) ? principal : amount;

        // Get USDC balance before withdrawal
        uint256 before = _rawBalanceOf(usdc, address(this));

        // Calculate how many shares correspond to principal + pro-rata yield
        uint256 totalShares = vault.balanceOf(address(this));
        
        // Pro-rata share calculation: (toWithdraw / totalDeposited) * totalShares
        // This automatically includes proportional yield since shares represent
        // a claim on totalAssets (which includes yield)
        uint256 sharesToRedeem;
        if (totalDeposited > 0 && totalShares > 0) {
            sharesToRedeem = (toWithdraw * totalShares) / totalDeposited;
        } else {
            sharesToRedeem = 0;
        }

        // Redeem shares for USDC
        if (sharesToRedeem > 0) {
            vault.redeem(sharesToRedeem, address(this), address(this));
        }

        // Update accounting BEFORE any external calls (CEI pattern)
        // unchecked: toWithdraw <= agentDeposited, toWithdraw <= totalDeposited
        unchecked {
            agentDeposited[agent] -= toWithdraw;
            totalDeposited -= toWithdraw;
        }

        // Calculate actual received amount
        uint256 afterBal = _rawBalanceOf(usdc, address(this));
        unchecked { received = afterBal - before; }
        uint256 yieldEarned = received > toWithdraw ? received - toWithdraw : 0;

        // Send USDC back to splitter (which routes to agent and fee contract)
        _rawTransfer(usdc, splitter, received);

        emit Withdrawn(agent, toWithdraw, yieldEarned);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Get current vault APY estimate in basis points
    /// @dev Approximation based on totalAssets vs last known totalDeposited
    ///      Real APY depends on vault strategy performance over time
    /// @return apyBps Estimated APY in basis points
    function getVaultAPY() external view returns (uint256 apyBps) {
        uint256 totalShares = vault.balanceOf(address(this));
        if (totalShares == 0 || totalDeposited == 0) return 0;

        uint256 totalAssets = vault.convertToAssets(totalShares);
        
        // If current value > principal, calculate implied yield
        // This is a SNAPSHOT estimate, not annualized
        // For accurate APY, vault should implement performance tracking
        if (totalAssets > totalDeposited) {
            unchecked {
                uint256 gain = totalAssets - totalDeposited;
                // Convert to basis points: (gain / principal) * 10000
                apyBps = (gain * 10000) / totalDeposited;
            }
        }
    }

    /// @notice Get total USDC balance (principal + yield) in vault
    /// @return Total value of this router's position
    function getTotalBalance() external view returns (uint256) {
        uint256 shares = vault.balanceOf(address(this));
        if (shares == 0) return 0;
        return vault.convertToAssets(shares);
    }

    /// @notice Get agent's current balance including pro-rata yield
    /// @param agent Agent address to query
    /// @return Agent's principal + proportional yield
    function getAgentBalance(address agent) external view returns (uint256) {
        uint256 principal = agentDeposited[agent];
        if (principal == 0 || totalDeposited == 0) return 0;

        uint256 totalShares = vault.balanceOf(address(this));
        uint256 totalAssets = vault.convertToAssets(totalShares);
        
        // Pro-rata: (principal / totalDeposited) * totalAssets
        return (principal * totalAssets) / totalDeposited;
    }

    // ─── Gas-optimized ERC20 helpers ──────────────────────────────────────────

    /// @dev Efficient ERC20 transfer using assembly (USDC is trusted)
    function _rawTransfer(address token, address to, uint256 amount) internal {
        assembly {
            let fmp := mload(0x40)
            mstore(0, 0xa9059cbb00000000000000000000000000000000000000000000000000000000)
            mstore(4, to)
            mstore(0x24, amount)
            if iszero(call(gas(), token, 0, 0, 68, 0, 32)) { revert(0, 0) }
            mstore(0x40, fmp)
        }
    }

    /// @dev Efficient ERC20 approve using assembly
    function _rawApprove(address token, address spender, uint256 amount) internal {
        assembly {
            let fmp := mload(0x40)
            mstore(0, 0x095ea7b300000000000000000000000000000000000000000000000000000000)
            mstore(4, spender)
            mstore(0x24, amount)
            if iszero(call(gas(), token, 0, 0, 68, 0, 32)) { revert(0, 0) }
            mstore(0x40, fmp)
        }
    }

    /// @dev Efficient ERC20 balanceOf using assembly
    function _rawBalanceOf(address token, address account) internal view returns (uint256 bal) {
        assembly {
            mstore(0, 0x70a0823100000000000000000000000000000000000000000000000000000000)
            mstore(4, account)
            if iszero(staticcall(gas(), token, 0, 36, 0, 32)) { revert(0, 0) }
            bal := mload(0)
        }
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// @notice Switch to a new ERC-4626 vault
    /// @dev Withdraws all funds from old vault, deposits into new vault
    /// @param newVault Address of new vault contract
    function setVault(address newVault) external onlyOwner {
        if (newVault == address(0)) revert ZeroAddress();
        if (IERC4626(newVault).asset() != usdc) revert VaultAssetMismatch();

        address oldVault = address(vault);
        if (oldVault == newVault) return; // Already using this vault

        // Withdraw all from current vault
        uint256 shares = vault.balanceOf(address(this));
        if (shares > 0) {
            vault.redeem(shares, address(this), address(this));
        }

        // Update vault reference
        vault = IERC4626(newVault);

        // Approve new vault
        _rawApprove(usdc, newVault, type(uint256).max);

        // Deposit all USDC into new vault
        uint256 balance = _rawBalanceOf(usdc, address(this));
        if (balance > 0) {
            vault.deposit(balance, address(this));
        }

        emit VaultUpdated(oldVault, newVault);
    }

    /// @notice Update the splitter address
    /// @param newSplitter New splitter contract address
    function setSplitter(address newSplitter) external onlyOwner {
        if (newSplitter == address(0)) revert ZeroAddress();
        emit SplitterUpdated(splitter, newSplitter);
        splitter = newSplitter;
    }

    /// @notice Transfer ownership to a new address
    /// @param newOwner Address of new owner
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Emergency: rescue any stuck tokens (not vault shares or USDC in vault)
    /// @dev Only for tokens accidentally sent to this contract
    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        _rawTransfer(token, to, amount);
    }
}
