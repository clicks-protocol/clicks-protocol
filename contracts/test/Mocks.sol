// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @dev Minimal ERC20 mock for USDC simulation in tests
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_)
        ERC20(name, symbol)
    {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/// @dev Mock Aave V3 Pool — stores USDC and mints aTokens 1:1
contract MockAavePool {
    using SafeERC20 for IERC20;

    IERC20 public usdc;
    MockERC20 public aToken;

    // Simulate 7% APY in ray (1e27)
    // 7% = 0.07 = 7e25 in ray
    uint128 public currentLiquidityRate = 70_000_000_000_000_000_000_000_000; // 7e25

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        aToken = new MockERC20("Aave USDC", "aUSDC", 6);
    }

    function supply(address, uint256 amount, address onBehalfOf, uint16) external {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(address, uint256 amount, address to) external returns (uint256) {
        uint256 actual = amount == type(uint256).max
            ? aToken.balanceOf(msg.sender)
            : amount;

        // Simulate yield: return proportional share of total USDC held
        uint256 totalATokens = aToken.totalSupply();
        uint256 totalUSDC = usdc.balanceOf(address(this));
        uint256 usdcToReturn = totalATokens > 0
            ? (actual * totalUSDC) / totalATokens
            : actual;

        aToken.burn(msg.sender, actual);
        usdc.safeTransfer(to, usdcToReturn);
        return usdcToReturn;
    }

    struct ReserveData {
        uint256 configuration;
        uint128 liquidityIndex;
        uint128 currentLiquidityRate;
        uint128 variableBorrowIndex;
        uint128 currentVariableBorrowRate;
        uint128 currentStableBorrowRate;
        uint40 lastUpdateTimestamp;
        uint16 id;
        address aTokenAddress;
        address stableDebtTokenAddress;
        address variableDebtTokenAddress;
        address interestRateStrategyAddress;
        uint128 accruedToTreasury;
        uint128 unbacked;
        uint128 isolationModeTotalDebt;
    }

    function getReserveData(address) external view returns (ReserveData memory) {
        return ReserveData({
            configuration: 0,
            liquidityIndex: 1e27,
            currentLiquidityRate: currentLiquidityRate,
            variableBorrowIndex: 0,
            currentVariableBorrowRate: 0,
            currentStableBorrowRate: 0,
            lastUpdateTimestamp: uint40(block.timestamp),
            id: 0,
            aTokenAddress: address(aToken),
            stableDebtTokenAddress: address(0),
            variableDebtTokenAddress: address(0),
            interestRateStrategyAddress: address(0),
            accruedToTreasury: 0,
            unbacked: 0,
            isolationModeTotalDebt: 0
        });
    }
}

/// @dev Mock Morpho Blue — stores USDC, tracks shares
contract MockMorpho {
    using SafeERC20 for IERC20;

    struct MarketParams {
        address loanToken;
        address collateralToken;
        address oracle;
        address irm;
        uint256 lltv;
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

    mapping(bytes32 => Market) private _markets;
    mapping(bytes32 => mapping(address => Position)) private _positions;

    function id(MarketParams memory params) external pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }

    function supply(
        MarketParams memory params,
        uint256 assets,
        uint256,
        address onBehalf,
        bytes memory
    ) external returns (uint256, uint256) {
        IERC20(params.loanToken).safeTransferFrom(msg.sender, address(this), assets);
        bytes32 marketId = keccak256(abi.encode(params));
        _markets[marketId].totalSupplyAssets += uint128(assets);
        _markets[marketId].totalSupplyShares += uint128(assets); // 1:1 for mock
        _positions[marketId][onBehalf].supplyShares += assets;
        return (assets, assets);
    }

    function withdraw(
        MarketParams memory params,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        address receiver
    ) external returns (uint256, uint256) {
        bytes32 marketId = keccak256(abi.encode(params));
        uint256 actual = shares > 0 ? shares : assets;
        _positions[marketId][onBehalf].supplyShares -= actual;
        _markets[marketId].totalSupplyAssets -= uint128(actual);
        _markets[marketId].totalSupplyShares -= uint128(actual);
        IERC20(params.loanToken).safeTransfer(receiver, actual);
        return (actual, actual);
    }

    function market(bytes32 _id) external view returns (Market memory) {
        return _markets[_id];
    }

    function position(bytes32 _id, address account) external view returns (Position memory) {
        return _positions[_id][account];
    }
}
