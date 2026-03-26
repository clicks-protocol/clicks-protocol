// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMorpho
/// @notice Minimal interface for Morpho Blue interactions on Base
interface IMorpho {
    struct MarketParams {
        address loanToken;       // USDC
        address collateralToken;
        address oracle;
        address irm;             // interest rate model
        uint256 lltv;            // loan-to-value ratio (1e18 scale)
    }

    struct Position {
        uint256 supplyShares;
        uint128 borrowShares;
        uint128 collateral;
    }

    struct Market {
        uint128 totalSupplyAssets;
        uint128 totalSupplyShares;
        uint128 totalBorrowAssets;
        uint128 totalBorrowShares;
        uint128 lastUpdate;
        uint128 fee;
    }

    /// @notice Supply assets to a Morpho market
    /// @param marketParams Market parameters identifying the market
    /// @param assets Amount of assets to supply
    /// @param shares Amount of shares to mint (use 0 if specifying assets)
    /// @param onBehalf Address that will own the supplied position
    /// @param data Arbitrary data passed to callback (use "" if none)
    /// @return assetsSupplied Actual assets supplied
    /// @return sharesSupplied Shares minted
    function supply(
        MarketParams memory marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        bytes memory data
    ) external returns (uint256 assetsSupplied, uint256 sharesSupplied);

    /// @notice Withdraw assets from a Morpho market
    /// @param marketParams Market parameters identifying the market
    /// @param assets Amount of assets to withdraw (use 0 if specifying shares)
    /// @param shares Amount of shares to burn
    /// @param onBehalf Address from which to withdraw
    /// @param receiver Address that will receive the assets
    /// @return assetsWithdrawn Actual assets withdrawn
    /// @return sharesWithdrawn Shares burned
    function withdraw(
        MarketParams memory marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        address receiver
    ) external returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn);

    /// @notice Get market state
    /// @param id Market ID (keccak256 of MarketParams)
    function market(bytes32 id) external view returns (
        uint128 totalSupplyAssets,
        uint128 totalSupplyShares,
        uint128 totalBorrowAssets,
        uint128 totalBorrowShares,
        uint128 lastUpdate,
        uint128 fee
    );

    /// @notice Get position of an account in a market
    /// @param id Market ID
    /// @param account Account address
    function position(bytes32 id, address account) external view returns (
        uint256 supplyShares,
        uint128 borrowShares,
        uint128 collateral
    );
}
