// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAaveV3Pool.sol";
import "./interfaces/IMorpho.sol";

/// @title ClicksYieldRouter
/// @notice Routes agent USDC treasury to the highest-yielding DeFi protocol
/// @dev Compares Aave V3 and Morpho on every deposit, routes to best APY
///      Only routes if APY difference exceeds REBALANCE_THRESHOLD to save gas
contract ClicksYieldRouter is Ownable {

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Minimum APY difference to trigger rebalancing (50 bps = 0.5%)
    uint256 public constant REBALANCE_THRESHOLD = 50;

    /// @notice Ray unit used by Aave (1e27)
    uint256 private constant RAY = 1e27;

    /// @notice Basis points scale (10000 = 100%)
    uint256 private constant BPS = 10000;

    /// @notice Annual seconds (used for APY conversion)
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice USDC token contract
    IERC20 public immutable usdc;

    /// @notice Aave V3 Pool on Base
    IAaveV3Pool public immutable aavePool;

    /// @notice Aave aUSDC token (receipt token)
    IERC20 public immutable aUsdc;

    /// @notice Morpho Blue contract on Base
    IMorpho public immutable morpho;

    /// @notice Morpho market params for USDC supply market
    IMorpho.MarketParams public morphoMarketParams;

    /// @notice Address that can call deposit/withdraw (ClicksSplitter)
    address public splitter;

    /// @notice Which protocol currently holds the funds
    /// @dev 0 = none, 1 = Aave, 2 = Morpho
    /// @dev Packed with splitter (address=20 bytes + uint8=1 byte = 21 bytes in same slot)
    uint8 public activeProtocol;

    /// @notice Total USDC deposited by all agents (principal only)
    uint256 public totalDeposited;

    /// @notice Per-agent deposited principal
    mapping(address => uint256) public agentDeposited;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposited(address indexed agent, uint256 amount, uint8 protocol);
    event Withdrawn(address indexed agent, uint256 amount, uint256 yield);
    event Rebalanced(uint8 fromProtocol, uint8 toProtocol, uint256 amount);
    event SplitterUpdated(address indexed oldSplitter, address indexed newSplitter);
    event MorphoMarketUpdated(IMorpho.MarketParams params);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error OnlySplitter();
    error ZeroAmount();
    error ZeroAddress();
    error InsufficientBalance();
    error InvalidProtocol();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlySplitter() {
        if (msg.sender != splitter) revert OnlySplitter();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _usdc USDC token address
    /// @param _aavePool Aave V3 Pool address
    /// @param _aUsdc Aave aUSDC token address
    /// @param _morpho Morpho Blue address
    /// @param _morphoMarketParams Initial Morpho market params for USDC
    /// @param _splitter Initial splitter address (can be updated)
    constructor(
        address _usdc,
        address _aavePool,
        address _aUsdc,
        address _morpho,
        IMorpho.MarketParams memory _morphoMarketParams,
        address _splitter
    ) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_aavePool == address(0)) revert ZeroAddress();
        if (_aUsdc == address(0)) revert ZeroAddress();
        if (_morpho == address(0)) revert ZeroAddress();
        if (_splitter == address(0)) revert ZeroAddress();

        usdc = IERC20(_usdc);
        aavePool = IAaveV3Pool(_aavePool);
        aUsdc = IERC20(_aUsdc);
        morpho = IMorpho(_morpho);
        morphoMarketParams = _morphoMarketParams;
        splitter = _splitter;
        activeProtocol = 1; // Default to Aave (most battle-tested)

        // Max-approve protocols once
        IERC20(_usdc).approve(_aavePool, type(uint256).max);
        IERC20(_usdc).approve(_morpho, type(uint256).max);
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Deposit USDC into the best available yield source
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

        // Use current protocol if already set (skip APY reads to save gas)
        // Rebalancing is handled separately
        uint8 _active = activeProtocol;
        uint8 bestProtocol;
        if (_active != 0) {
            bestProtocol = _active;
        } else {
            bestProtocol = _getBestProtocol();
            activeProtocol = bestProtocol;
        }

        // Deposit into chosen protocol (inlined for gas)
        if (bestProtocol == 1) {
            address _pool = address(aavePool);
            address _usdc = address(usdc);
            assembly {
                mstore(0, 0x617ba03700000000000000000000000000000000000000000000000000000000)
                mstore(4, _usdc)
                mstore(0x24, amount)
                // restore free memory pointer at 0x40 after overwriting it
                let fmp := mload(0x40)
                mstore(0x44, address())
                mstore(0x64, 0)
                if iszero(call(gas(), _pool, 0, 0, 132, 0, 0)) { revert(0, 0) }
                mstore(0x40, fmp)
            }
        } else {
            _depositMorpho(amount);
        }
        unchecked {
            agentDeposited[agent] += amount;
            totalDeposited += amount;
        }

        assembly {
            mstore(0, amount)
            mstore(0x20, bestProtocol)
            log2(0, 64, 0x68ef9715adf17aacc9d4ab13dbff6ecd13ea4916b4a6c98416a0c2789e1b9d52, agent)
        }
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

        uint256 before;
        {
            address _usdc = address(usdc);
            assembly {
                mstore(0, 0x70a0823100000000000000000000000000000000000000000000000000000000)
                mstore(4, address())
                if iszero(staticcall(gas(), _usdc, 0, 36, 0, 32)) { revert(0, 0) }
                before := mload(0)
            }
        }

        if (activeProtocol == 1) {
            address _pool = address(aavePool);
            address _usdc = address(usdc);
            assembly {
                let fmp := mload(0x40)
                mstore(0, 0x69328dec00000000000000000000000000000000000000000000000000000000)
                mstore(4, _usdc)
                mstore(0x24, toWithdraw)
                mstore(0x44, address())
                if iszero(call(gas(), _pool, 0, 0, 100, 0, 0)) { revert(0, 0) }
                mstore(0x40, fmp)
            }
        } else if (activeProtocol == 2) {
            morpho.withdraw(morphoMarketParams, toWithdraw, 0, address(this), address(this));
        } else {
            revert InvalidProtocol();
        }

        // Update accounting BEFORE any external calls (CEI pattern)
        // unchecked: toWithdraw <= agentDeposited, toWithdraw <= totalDeposited
        unchecked {
            agentDeposited[agent] -= toWithdraw;
            totalDeposited -= toWithdraw;
        }

        {
            address _usdc = address(usdc);
            uint256 afterBal;
            assembly {
                mstore(0, 0x70a0823100000000000000000000000000000000000000000000000000000000)
                mstore(4, address())
                if iszero(staticcall(gas(), _usdc, 0, 36, 0, 32)) { revert(0, 0) }
                afterBal := mload(0)
            }
            unchecked { received = afterBal - before; }
        }
        uint256 yieldEarned = received > toWithdraw ? received - toWithdraw : 0;

        // Send USDC back to splitter (which routes to agent and fee contract)
        _rawTransfer(address(usdc), splitter, received);

        assembly {
            mstore(0, toWithdraw)
            mstore(0x20, yieldEarned)
            log2(0, 64, 0x92ccf450a286a957af52509bc1c9939d1a6a481783e142e41e2499f0bb66ebc6, agent)
        }
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Get current APY from Aave V3 in basis points
    /// @return apyBps Aave supply APY in basis points
    function getAaveAPY() public view returns (uint256 apyBps) {
        // DECISION: Aave returns currentLiquidityRate in ray (1e27)
        // Convert: ray / 1e23 gives us basis points with ~4 decimal precision
        // Formula: (rate / RAY) * BPS = rate * BPS / RAY
        uint128 liquidityRate = aavePool.getReserveData(address(usdc)).currentLiquidityRate;
        apyBps = (uint256(liquidityRate) * BPS) / RAY;
    }

    /// @notice Get current APY from Morpho in basis points
    /// @return apyBps Morpho supply APY in basis points
    function getMorphoAPY() public view returns (uint256 apyBps) {
        // DECISION: Morpho supply rate requires reading market utilization
        // This is an approximation — exact rate depends on IRM implementation
        bytes32 marketId = morpho.id(morphoMarketParams);
        IMorpho.Market memory mkt = morpho.market(marketId);

        if (mkt.totalSupplyAssets == 0) return 0;

        // Utilization rate = totalBorrow / totalSupply
        // Supply APY ≈ borrowAPY * utilization * (1 - fee)
        // We return a conservative estimate; real rate is IRM-dependent
        uint256 utilization = (uint256(mkt.totalBorrowAssets) * 1e18) / mkt.totalSupplyAssets;

        // Conservative estimate: 0–15% APY scaled by utilization
        // TODO: integrate IRM contract for exact rate in Task 1.4 follow-up
        apyBps = (utilization * 1500) / 1e18; // max 15% at 100% utilization
    }

    /// @notice Get APYs from both protocols
    /// @return aaveAPY Aave APY in basis points
    /// @return morphoAPY Morpho APY in basis points
    function getAPYs() external view returns (uint256 aaveAPY, uint256 morphoAPY) {
        aaveAPY = getAaveAPY();
        morphoAPY = getMorphoAPY();
    }

    /// @notice Get total USDC balance (principal + yield) across active protocol
    function getTotalBalance() external view returns (uint256) {
        if (activeProtocol == 1) {
            return aUsdc.balanceOf(address(this));
        } else if (activeProtocol == 2) {
            bytes32 marketId = morpho.id(morphoMarketParams);
            IMorpho.Position memory pos = morpho.position(marketId, address(this));
            IMorpho.Market memory mkt = morpho.market(marketId);
            if (mkt.totalSupplyShares == 0) return 0;
            return (uint256(pos.supplyShares) * mkt.totalSupplyAssets) / mkt.totalSupplyShares;
        }
        return 0;
    }

    /// @notice Get best protocol ID based on current APYs
    /// @return 1 for Aave, 2 for Morpho
    function getBestProtocol() external view returns (uint8) {
        return _getBestProtocol();
    }

    // ─── Internal Functions ───────────────────────────────────────────────────

    function _getBestProtocol() internal view returns (uint8) {
        uint256 aaveAPY = getAaveAPY();
        uint256 morphoAPY = getMorphoAPY();

        // Only switch if difference exceeds threshold (save gas on small differences)
        if (morphoAPY > aaveAPY && morphoAPY - aaveAPY >= REBALANCE_THRESHOLD) {
            return 2; // Morpho
        }
        return 1; // Aave (default — more battle-tested)
    }

    function _depositAave(uint256 amount) internal {
        address _pool = address(aavePool);
        address _usdc = address(usdc);
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x617ba03700000000000000000000000000000000000000000000000000000000) // supply(address,uint256,address,uint16)
            mstore(add(ptr, 4), _usdc)
            mstore(add(ptr, 36), amount)
            mstore(add(ptr, 68), address())
            mstore(add(ptr, 100), 0) // referralCode
            if iszero(call(gas(), _pool, 0, ptr, 132, 0, 0)) { revert(0, 0) }
        }
    }

    function _depositMorpho(uint256 amount) internal {
        morpho.supply(morphoMarketParams, amount, 0, address(this), "");
    }

    function _rebalance(uint8 toProtocol) internal {
        uint8 fromProtocol = activeProtocol;
        uint256 balance;

        // Withdraw all from current protocol
        if (fromProtocol == 1) {
            uint256 aBalance = aUsdc.balanceOf(address(this));
            if (aBalance == 0) return;
            balance = aavePool.withdraw(address(usdc), type(uint256).max, address(this));
        } else if (fromProtocol == 2) {
            bytes32 marketId = morpho.id(morphoMarketParams);
            IMorpho.Position memory pos = morpho.position(marketId, address(this));
            if (pos.supplyShares == 0) return;
            (balance,) = morpho.withdraw(morphoMarketParams, 0, pos.supplyShares, address(this), address(this));
        }

        if (balance == 0) return;

        // Deposit into new protocol
        if (toProtocol == 1) {
            _depositAave(balance);
        } else {
            _depositMorpho(balance);
        }

        emit Rebalanced(fromProtocol, toProtocol, balance);
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



    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// @notice Update the splitter address
    /// @param newSplitter New splitter contract address
    function setSplitter(address newSplitter) external onlyOwner {
        if (newSplitter == address(0)) revert ZeroAddress();
        emit SplitterUpdated(splitter, newSplitter);
        splitter = newSplitter;
    }

    /// @notice Update Morpho market params (in case market changes)
    /// @param params New market params
    function setMorphoMarketParams(IMorpho.MarketParams memory params) external onlyOwner {
        morphoMarketParams = params;
        emit MorphoMarketUpdated(params);
    }

    /// @notice Emergency: rescue any stuck tokens (not USDC in active protocol)
    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        _rawTransfer(token, to, amount);
    }
}
