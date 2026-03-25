// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC4626.sol";

/// @title MockERC4626Vault
/// @notice Minimal ERC-4626 vault for testing
/// @dev Simplified implementation without full ERC20 compliance
contract MockERC4626Vault is IERC4626 {
    address public immutable override asset;
    
    uint256 public totalSupply; // Total vault shares
    uint256 public totalAssets; // Total underlying assets
    uint256 public maxDepositLimit = type(uint256).max;
    
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    constructor(address _asset) {
        asset = _asset;
    }

    // ─── ERC-4626 Core Functions ──────────────────────────────────────────────

    function deposit(uint256 assets, address receiver) external override returns (uint256 shares) {
        // Transfer assets from caller
        _transferFrom(asset, msg.sender, address(this), assets);

        // Calculate shares to mint (1:1 if first deposit, otherwise proportional)
        shares = totalSupply == 0 ? assets : (assets * totalSupply) / totalAssets;

        // Update state
        totalAssets += assets;
        totalSupply += shares;
        balanceOf[receiver] += shares;

        emit Deposit(msg.sender, receiver, assets, shares);
        emit Transfer(address(0), receiver, shares);
    }

    function withdraw(uint256 assets, address receiver, address owner)
        external
        override
        returns (uint256 shares)
    {
        // Calculate shares to burn
        shares = convertToShares(assets);

        // Check allowance if not owner
        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender];
            if (allowed != type(uint256).max) {
                allowance[owner][msg.sender] = allowed - shares;
            }
        }

        // Update state before transfer
        balanceOf[owner] -= shares;
        totalSupply -= shares;
        totalAssets -= assets;

        // Transfer assets to receiver
        _transfer(asset, receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        emit Transfer(owner, address(0), shares);
    }

    function redeem(uint256 shares, address receiver, address owner)
        external
        override
        returns (uint256 assets)
    {
        // Check allowance if not owner
        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender];
            if (allowed != type(uint256).max) {
                allowance[owner][msg.sender] = allowed - shares;
            }
        }

        // Calculate assets to withdraw
        assets = convertToAssets(shares);

        // Update state before transfer
        balanceOf[owner] -= shares;
        totalSupply -= shares;
        totalAssets -= assets;

        // Transfer assets to receiver
        _transfer(asset, receiver, assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        emit Transfer(owner, address(0), shares);
    }

    // ─── ERC-4626 Accounting ──────────────────────────────────────────────────

    function convertToAssets(uint256 shares) public view override returns (uint256) {
        if (totalSupply == 0) return shares; // 1:1 if vault is empty
        return (shares * totalAssets) / totalSupply;
    }

    function convertToShares(uint256 assets) public view override returns (uint256) {
        if (totalSupply == 0) return assets; // 1:1 if vault is empty
        return (assets * totalSupply) / totalAssets;
    }

    function maxDeposit(address) external view override returns (uint256) {
        return maxDepositLimit;
    }

    function previewDeposit(uint256 assets) external view override returns (uint256) {
        return convertToShares(assets);
    }

    // ─── Test Helpers ─────────────────────────────────────────────────────────

    /// @notice Add yield to the vault (simulates earning returns)
    function addYield(uint256 yieldAmount) external {
        _transferFrom(asset, msg.sender, address(this), yieldAmount);
        totalAssets += yieldAmount;
    }

    /// @notice Set max deposit limit (for testing deposit caps)
    function setMaxDeposit(uint256 limit) external {
        maxDepositLimit = limit;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _transfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _transferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    // ─── ERC20-like Functions (minimal) ───────────────────────────────────────

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
