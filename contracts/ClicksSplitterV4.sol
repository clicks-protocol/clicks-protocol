// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ClicksYieldRouter.sol";
import "./ClicksFeeV2.sol";
import "./ClicksRegistry.sol";

/// @title ClicksSplitterV4
/// @notice Entry point for Clicks Protocol V2. Receives agent USDC and auto-splits.
/// @dev Identical to V3 except uses ClicksFeeV2 (with referral distribution).
///      On every receivePayment():
///      - (100 - yieldPct)% → agent wallet immediately
///      - yieldPct% → ClicksYieldRouter → best DeFi yield
///      On withdrawal:
///      - principal + yield returned to agent
///      - 2% of yield taken as protocol fee → ClicksFeeV2 → referral distribution
contract ClicksSplitterV4 is Ownable {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant FEE_BPS = 200;    // 2% protocol fee on yield
    uint256 public constant BPS = 10000;
    uint256 public constant MIN_YIELD_PCT = 5;
    uint256 public constant MAX_YIELD_PCT = 50;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;
    ClicksYieldRouter public immutable yieldRouter;
    ClicksFeeV2 public immutable feeCollector;
    ClicksRegistry public immutable registry;

    uint256 public defaultYieldPct = 20;
    uint256 private immutable _defaultYieldPctCached;

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
        feeCollector = ClicksFeeV2(_feeCollector);
        registry = ClicksRegistry(_registry);

        _defaultYieldPctCached = 20;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Receive a USDC payment on behalf of an agent
    function receivePayment(uint256 amount, address agent)
        external
        payable
    {
        if (amount == 0) revert ZeroAmount();
        if (agent == address(0)) revert ZeroAddress();

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

        uint256 toYield;
        uint256 liquid;
        unchecked {
            toYield = (amount * yieldPct) / 100;
            liquid = amount - toYield;
        }

        address _usdc = address(usdc);
        _transferFrom(_usdc, msg.sender, agent, liquid);

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

        assembly {
            let ptr := mload(0x40)
            mstore(ptr, amount)
            mstore(add(ptr, 32), liquid)
            mstore(add(ptr, 64), toYield)
            log3(ptr, 96, 0xc7b46480d33c7777f384469a19809970cd36d96f3f1fc921e4b6a304e4b761f9, agent, operator)
        }
    }

    /// @notice Agent withdraws accumulated yield + principal
    /// @dev Fee goes to ClicksFeeV2 which handles referral distribution
    function withdrawYield(address agent, uint256 amount)
        external
        payable
    {
        if (agent == address(0)) revert ZeroAddress();

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

        uint256 yieldEarned;
        uint256 fee;
        uint256 agentReceives;
        unchecked {
            yieldEarned = received > withdrawPrincipal ? received - withdrawPrincipal : 0;
            fee = yieldEarned / 50; // 2%
            agentReceives = received - fee;
        }

        // Transfer fee to ClicksFeeV2 (which handles referral distribution)
        if (fee > 0) {
            address _feeCollector = address(feeCollector);
            _transfer(address(usdc), _feeCollector, fee);
            // Call collectFee — FeeV2 will distribute referral rewards
            assembly {
                let fmp := mload(0x40)
                mstore(0, 0x2ec0ff6c00000000000000000000000000000000000000000000000000000000)
                mstore(4, agent)
                mstore(0x24, fee)
                if iszero(call(gas(), _feeCollector, 0, 0, 68, 0, 0)) { revert(0, 0) }
                mstore(0x40, fmp)
            }
        }

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

    function getYieldPct(address agent) external view returns (uint256) {
        address operator = registry.getOperator(agent);
        return _getYieldPct(operator);
    }

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

    function setDefaultYieldPct(uint256 pct) external onlyOwner {
        if (pct < MIN_YIELD_PCT || pct > MAX_YIELD_PCT) revert InvalidYieldPct();
        emit DefaultYieldPctUpdated(defaultYieldPct, pct);
        defaultYieldPct = pct;
    }

    function setOperatorYieldPct(uint256 pct) external {
        if (pct != 0 && (pct < MIN_YIELD_PCT || pct > MAX_YIELD_PCT)) revert InvalidYieldPct();
        operatorYieldPct[msg.sender] = pct;
        emit OperatorYieldPctUpdated(msg.sender, pct);
    }
}
