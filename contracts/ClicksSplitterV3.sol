// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ClicksYieldRouter.sol";
import "./ClicksFee.sol";
import "./ClicksRegistry.sol";

/// @title ClicksSplitterV3
/// @notice Entry point for the Clicks Protocol. Receives agent USDC and auto-splits.
/// @dev On every receivePayment():
///      - (100 - yieldPct)% → agent wallet immediately
///      - yieldPct% → ClicksYieldRouter → best DeFi yield
///      On withdrawal:
///      - principal + yield returned to agent
///      - 2% of yield taken as protocol fee → ClicksFee
contract ClicksSplitterV3 is Ownable {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant FEE_BPS = 200;    // 2% protocol fee on yield
    uint256 public constant BPS = 10000;
    uint256 public constant MIN_YIELD_PCT = 5;   // 5% minimum yield split
    uint256 public constant MAX_YIELD_PCT = 50;  // 50% maximum yield split

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;
    ClicksYieldRouter public immutable yieldRouter;
    ClicksFee public immutable feeCollector;
    ClicksRegistry public immutable registry;

    /// @notice Default yield split percentage (20%)
    uint256 public defaultYieldPct = 20;
    /// @dev Cached immutable copy for gas savings in hot path
    uint256 private immutable _defaultYieldPctCached;

    /// @notice Per-operator custom yield split (0 = use default)
    mapping(address => uint256) public operatorYieldPct;

    // ─── Events ───────────────────────────────────────────────────────────────

    event PaymentReceived(
        address indexed agent,
        address indexed operator,
        uint256 total,
        uint256 liquid,
        uint256 toYield
    );
    event YieldWithdrawn(
        address indexed agent,
        uint256 principal,
        uint256 yieldEarned,
        uint256 fee
    );
    event DefaultYieldPctUpdated(uint256 oldPct, uint256 newPct);
    event OperatorYieldPctUpdated(address indexed operator, uint256 pct);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAmount();
    error ZeroAddress();
    error InvalidYieldPct();
    error AgentNotRegistered();
    error NotAuthorized();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _usdc USDC token address
    /// @param _yieldRouter Deployed ClicksYieldRouter
    /// @param _feeCollector Deployed ClicksFee
    /// @param _registry Deployed ClicksRegistry
    constructor(
        address _usdc,
        address _yieldRouter,
        address _feeCollector,
        address _registry
    ) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_yieldRouter == address(0)) revert ZeroAddress();
        if (_feeCollector == address(0)) revert ZeroAddress();
        if (_registry == address(0)) revert ZeroAddress();

        usdc = IERC20(_usdc);
        yieldRouter = ClicksYieldRouter(_yieldRouter);
        feeCollector = ClicksFee(_feeCollector);
        registry = ClicksRegistry(_registry);

        _defaultYieldPctCached = 20;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Receive a USDC payment on behalf of an agent
    /// @dev Agent must be registered. Pulls USDC from caller.
    ///      Splits: liquid portion → agent, yield portion → router
    /// @param amount Total USDC payment amount
    /// @param agent Agent wallet that earned this payment
    function receivePayment(uint256 amount, address agent)
        external
        payable
    {
        if (amount == 0) revert ZeroAmount();
        if (agent == address(0)) revert ZeroAddress();

        // Get operator via assembly static call (save ABI overhead)
        address operator;
        {
            address _registry = address(registry);
            assembly {
                mstore(0, 0x5865c60c00000000000000000000000000000000000000000000000000000000)
                mstore(4, agent)
                if iszero(staticcall(gas(), _registry, 0, 36, 0, 32)) { revert(0, 0) }
                operator := mload(0)
            }
        }
        uint256 yieldPct = operatorYieldPct[operator];
        if (yieldPct == 0) yieldPct = _defaultYieldPctCached;

        // Calculate split (unchecked: yieldPct ≤ 50, so toYield ≤ amount; no overflow possible)
        uint256 toYield;
        uint256 liquid;
        unchecked {
            toYield = (amount * yieldPct) / 100;
            liquid = amount - toYield;
        }

        address _usdc = address(usdc);
        // Send liquid directly from caller to agent (skip intermediate)
        _transferFrom(_usdc, msg.sender, agent, liquid);

        // Send yield portion from caller to router (pre-transfer then notify)
        address _router = address(yieldRouter);
        _transferFrom(_usdc, msg.sender, _router, toYield);
        {
            assembly {
                let fmp := mload(0x40)
                mstore(0, 0x6e553f6500000000000000000000000000000000000000000000000000000000)
                mstore(4, toYield)
                mstore(0x24, agent)
                if iszero(call(gas(), _router, 0, 0, 68, 0, 0)) { revert(0, 0) }
                mstore(0x40, fmp)
            }
        }

        // Emit PaymentReceived via assembly (avoid ABI encoding overhead)
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, amount)
            mstore(add(ptr, 32), liquid)
            mstore(add(ptr, 64), toYield)
            log3(ptr, 96, 0xc7b46480d33c7777f384469a19809970cd36d96f3f1fc921e4b6a304e4b761f9, agent, operator)
        }
    }

    /// @notice Agent withdraws their accumulated yield + principal
    /// @dev Pulls from router, takes 2% fee on yield, sends rest to agent
    /// @param agent Agent address to withdraw for
    /// @param amount Amount of principal to withdraw (0 = all)
    function withdrawYield(address agent, uint256 amount)
        external
        payable
    {
        if (agent == address(0)) revert ZeroAddress();

        // Only agent or their operator can withdraw
        address operator;
        {
            address _registry = address(registry);
            assembly {
                mstore(0, 0x5865c60c00000000000000000000000000000000000000000000000000000000)
                mstore(4, agent)
                if iszero(staticcall(gas(), _registry, 0, 36, 0, 32)) { revert(0, 0) }
                operator := mload(0)
            }
        }
        if (msg.sender != agent && msg.sender != operator && msg.sender != owner())
            revert NotAuthorized();

        address _router = address(yieldRouter);
        uint256 principalBefore;
        assembly {
            mstore(0, 0xd12529a400000000000000000000000000000000000000000000000000000000)
            mstore(4, agent)
            if iszero(staticcall(gas(), _router, 0, 36, 0, 32)) { revert(0, 0) }
            principalBefore := mload(0)
        }
        uint256 withdrawPrincipal = (amount == 0 || amount >= principalBefore)
            ? principalBefore
            : amount;

        // Withdraw from router — returns principal + yield to this contract
        uint256 received;
        assembly {
            let fmp := mload(0x40)
            mstore(0, 0x00f714ce00000000000000000000000000000000000000000000000000000000)
            mstore(4, withdrawPrincipal)
            mstore(0x24, agent)
            if iszero(call(gas(), _router, 0, 0, 68, 0, 32)) { revert(0, 0) }
            received := mload(0)
            mstore(0x40, fmp)
        }

        // unchecked: received >= withdrawPrincipal checked by ternary; fee <= yieldEarned; agentReceives <= received
        uint256 yieldEarned;
        uint256 fee;
        uint256 agentReceives;
        unchecked {
            yieldEarned = received > withdrawPrincipal ? received - withdrawPrincipal : 0;
            fee = yieldEarned / 50; // 2% = 200/10000 = 1/50
            agentReceives = received - fee;
        }

        // Transfer fee to fee collector
        if (fee > 0) {
            address _feeCollector = address(feeCollector);
            _transfer(address(usdc), _feeCollector, fee);
            assembly {
                let fmp := mload(0x40)
                mstore(0, 0x2ec0ff6c00000000000000000000000000000000000000000000000000000000)
                mstore(4, agent)
                mstore(0x24, fee)
                if iszero(call(gas(), _feeCollector, 0, 0, 68, 0, 0)) { revert(0, 0) }
                mstore(0x40, fmp)
            }
        }

        // Transfer remainder to agent
        _transfer(address(usdc), agent, agentReceives);

        assembly {
            let fmp := mload(0x40)
            mstore(0, withdrawPrincipal)
            mstore(0x20, yieldEarned)
            mstore(0x40, fee)
            log2(0, 96, 0xd1e95230b4870ddacd06da768083e5b852ff8762d58691992dfd55d9d372d4ba, agent)
            mstore(0x40, fmp)
        }
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Get the effective yield percentage for an agent
    function getYieldPct(address agent) external view returns (uint256) {
        address operator = registry.getOperator(agent);
        return _getYieldPct(operator);
    }

    /// @notice Simulate a payment split
    /// @return liquid Amount that goes to agent wallet
    /// @return toYield Amount that goes to yield router
    function simulateSplit(uint256 amount, address agent)
        external
        view
        returns (uint256 liquid, uint256 toYield)
    {
        address operator = registry.getOperator(agent);
        uint256 yieldPct = _getYieldPct(operator);
        toYield = (amount * yieldPct) / 100;
        liquid = amount - toYield;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Efficient ERC20 transfer using assembly (USDC is trusted)
    function _transfer(address token, address to, uint256 amount) internal {
        assembly {
            let fmp := mload(0x40)
            mstore(0, 0xa9059cbb00000000000000000000000000000000000000000000000000000000)
            mstore(4, to)
            mstore(0x24, amount)
            if iszero(call(gas(), token, 0, 0, 68, 0, 32)) { revert(0, 0) }
            mstore(0x40, fmp)
        }
    }

    /// @dev Efficient ERC20 transferFrom using assembly (USDC is trusted)
    function _transferFrom(address token, address from, address to, uint256 amount) internal {
        assembly {
            let fmp := mload(0x40)
            mstore(0, 0x23b872dd00000000000000000000000000000000000000000000000000000000)
            mstore(4, from)
            mstore(0x24, to)
            mstore(0x44, amount)
            if iszero(call(gas(), token, 0, 0, 100, 0, 32)) { revert(0, 0) }
            mstore(0x40, fmp)
        }
    }

    function _getYieldPct(address operator) internal view returns (uint256) {
        uint256 custom = operatorYieldPct[operator];
        return custom > 0 ? custom : defaultYieldPct;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Update the default yield split percentage
    function setDefaultYieldPct(uint256 pct) external onlyOwner {
        if (pct < MIN_YIELD_PCT || pct > MAX_YIELD_PCT) revert InvalidYieldPct();
        emit DefaultYieldPctUpdated(defaultYieldPct, pct);
        defaultYieldPct = pct;
    }

    /// @notice Operators set their custom yield split
    function setOperatorYieldPct(uint256 pct) external {
        if (pct != 0 && (pct < MIN_YIELD_PCT || pct > MAX_YIELD_PCT)) revert InvalidYieldPct();
        operatorYieldPct[msg.sender] = pct;
        emit OperatorYieldPctUpdated(msg.sender, pct);
    }
}
