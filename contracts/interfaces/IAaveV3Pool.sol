// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IAaveV3Pool
/// @notice Minimal interface for Aave V3 Pool interactions
interface IAaveV3Pool {
    struct ReserveData {
        // Stores the reserve configuration
        uint256 configuration;
        // The liquidity index. Expressed in ray
        uint128 liquidityIndex;
        // The current supply rate. Expressed in ray
        uint128 currentLiquidityRate;
        // Variable borrow index. Expressed in ray
        uint128 variableBorrowIndex;
        // The current variable borrow rate. Expressed in ray
        uint128 currentVariableBorrowRate;
        // The current stable borrow rate. Expressed in ray
        uint128 currentStableBorrowRate;
        // Timestamp of last update
        uint40 lastUpdateTimestamp;
        // The id of the reserve — needed for reserve list
        uint16 id;
        // aToken address
        address aTokenAddress;
        // stableDebtToken address
        address stableDebtTokenAddress;
        // variableDebtToken address
        address variableDebtTokenAddress;
        // Address of the interest rate strategy
        address interestRateStrategyAddress;
        // The current treasury balance, scaled
        uint128 accruedToTreasury;
        // The outstanding unbacked aTokens minted through the bridging feature
        uint128 unbacked;
        // The outstanding debt borrowed against this asset in isolation mode
        uint128 isolationModeTotalDebt;
    }

    /// @notice Supplies an `amount` of underlying asset into the reserve
    /// @param asset The address of the underlying asset to supply
    /// @param amount The amount to be supplied
    /// @param onBehalfOf The address that will receive the aTokens
    /// @param referralCode Code used to register the integrator
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    /// @notice Withdraws an `amount` of underlying asset from the reserve
    /// @param asset The address of the underlying asset to withdraw
    /// @param amount The underlying amount to be withdrawn (use type(uint256).max for all)
    /// @param to The address that will receive the underlying
    /// @return The final amount withdrawn
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    /// @notice Returns the state and configuration of the reserve
    /// @param asset The address of the underlying asset
    /// @return The state and configuration data of the reserve
    function getReserveData(address asset) external view returns (ReserveData memory);
}
