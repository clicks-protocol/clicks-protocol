// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC4626
/// @notice Minimal ERC-4626 Tokenized Vault Standard interface
/// @dev https://eips.ethereum.org/EIPS/eip-4626
interface IERC4626 {
    // ─── Core Vault Operations ────────────────────────────────────────────────

    /// @notice Deposit assets into the vault
    /// @param assets Amount of underlying asset to deposit
    /// @param receiver Address that will receive vault shares
    /// @return shares Amount of shares minted
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    /// @notice Withdraw assets from the vault
    /// @param assets Amount of underlying asset to withdraw
    /// @param receiver Address that will receive withdrawn assets
    /// @param owner Address that owns the shares being burned
    /// @return shares Amount of shares burned
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);

    /// @notice Redeem shares for underlying assets
    /// @param shares Amount of shares to burn
    /// @param receiver Address that will receive withdrawn assets
    /// @param owner Address that owns the shares being burned
    /// @return assets Amount of assets withdrawn
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);

    // ─── Accounting View Functions ────────────────────────────────────────────

    /// @notice Convert shares to equivalent amount of assets
    /// @param shares Amount of vault shares
    /// @return assets Equivalent amount of underlying assets
    function convertToAssets(uint256 shares) external view returns (uint256 assets);

    /// @notice Convert assets to equivalent amount of shares
    /// @param assets Amount of underlying assets
    /// @return shares Equivalent amount of vault shares
    function convertToShares(uint256 assets) external view returns (uint256 shares);

    /// @notice Total assets controlled by the vault
    /// @return totalManagedAssets Total amount of underlying asset
    function totalAssets() external view returns (uint256 totalManagedAssets);

    /// @notice Address of the underlying asset token
    /// @return assetTokenAddress Address of the ERC20 asset
    function asset() external view returns (address assetTokenAddress);

    /// @notice Get vault share balance of an account
    /// @param account Address to query
    /// @return balance Amount of vault shares owned
    function balanceOf(address account) external view returns (uint256 balance);

    // ─── Deposit/Withdraw Limits ───────────────────────────────────────────────

    /// @notice Maximum amount of assets that can be deposited for a receiver
    /// @param receiver Address that would receive the shares
    /// @return maxAssets Maximum deposit amount (type(uint256).max = no limit)
    function maxDeposit(address receiver) external view returns (uint256 maxAssets);

    /// @notice Preview how many shares would be minted for an asset deposit
    /// @param assets Amount of assets to deposit
    /// @return shares Amount of shares that would be minted
    function previewDeposit(uint256 assets) external view returns (uint256 shares);
}
