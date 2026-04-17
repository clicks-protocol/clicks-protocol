// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ClicksYieldRouter.sol";
import "./ClicksFeeV2.sol";
import "./ClicksRegistry.sol";
import "./ClicksReputationMultiplierV1.sol";
import "./interfaces/IERC8004.sol";

/// @title ClicksSplitterV5
/// @notice V4 behaviour plus reputation-driven fee tiers.
/// @dev Fee on yield is variable:
///      - FEE_COLD 3% for agents without a registered agentId or without
///        attested reputation
///      - down to FEE_ELITE 1% for agents with strong ERC-8004 reputation
///
///      Everything else — 80/20 split, referral flow via ClicksFeeV2,
///      yield routing — is unchanged from V4.
///
///      AgentId resolution: agents opt in via `registerAgentId` once.
///      The splitter verifies ownership via the Identity Registry and
///      stores the mapping. Unregistered agents default to the cold tier.
contract ClicksSplitterV5 is Ownable {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant BPS = 10_000;
    uint256 public constant MIN_YIELD_PCT = 5;
    uint256 public constant MAX_YIELD_PCT = 50;

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;
    ClicksYieldRouter public immutable yieldRouter;
    ClicksFeeV2 public immutable feeCollector;
    ClicksRegistry public immutable registry;
    ClicksReputationMultiplierV1 public immutable multiplier;
    IIdentityRegistry public immutable identity;

    uint256 public defaultYieldPct = 20;

    mapping(address => uint256) public operatorYieldPct;
    mapping(address => uint256) public agentToId;

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
        uint256 fee,
        uint16 feeBps
    );
    event AgentIdRegistered(address indexed agent, uint256 agentId);
    event AgentIdUnregistered(address indexed agent, uint256 agentId);
    event DefaultYieldPctUpdated(uint256 oldPct, uint256 newPct);
    event OperatorYieldPctUpdated(address indexed operator, uint256 pct);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAmount();
    error ZeroAddress();
    error InvalidYieldPct();
    error NotAuthorized();
    error NotAgentIdOwner();
    error AgentIdNotSet();
    error AgentIdAlreadySet();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _usdc,
        address _yieldRouter,
        address _feeCollector,
        address _registry,
        address _multiplier,
        address _identity
    ) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_yieldRouter == address(0)) revert ZeroAddress();
        if (_feeCollector == address(0)) revert ZeroAddress();
        if (_registry == address(0)) revert ZeroAddress();
        if (_multiplier == address(0)) revert ZeroAddress();
        if (_identity == address(0)) revert ZeroAddress();

        usdc = IERC20(_usdc);
        yieldRouter = ClicksYieldRouter(_yieldRouter);
        feeCollector = ClicksFeeV2(_feeCollector);
        registry = ClicksRegistry(_registry);
        multiplier = ClicksReputationMultiplierV1(_multiplier);
        identity = IIdentityRegistry(_identity);
    }

    // ─── Agent identity — self-registration ───────────────────────────────────

    /// @notice Bind an ERC-8004 agentId to the caller's wallet.
    /// @dev Caller must own the Identity NFT for `agentId`.
    function registerAgentId(uint256 agentId) external {
        if (agentToId[msg.sender] != 0) revert AgentIdAlreadySet();
        if (identity.ownerOf(agentId) != msg.sender) revert NotAgentIdOwner();
        agentToId[msg.sender] = agentId;
        emit AgentIdRegistered(msg.sender, agentId);
    }

    /// @notice Clear a stale agentId mapping so a new owner can take over.
    /// @dev Either the current wallet OR the live NFT owner may unregister.
    function unregisterAgentId(address agent) external {
        uint256 current = agentToId[agent];
        if (current == 0) revert AgentIdNotSet();

        address nftOwner = identity.ownerOf(current);
        if (msg.sender != agent && msg.sender != nftOwner) revert NotAuthorized();

        agentToId[agent] = 0;
        emit AgentIdUnregistered(agent, current);
    }

    /// @notice Re-point the mapping to a new agentId. Caller must own the new NFT.
    function refreshAgentId(uint256 newAgentId) external {
        if (identity.ownerOf(newAgentId) != msg.sender) revert NotAgentIdOwner();
        uint256 old = agentToId[msg.sender];
        agentToId[msg.sender] = newAgentId;
        if (old != 0) emit AgentIdUnregistered(msg.sender, old);
        emit AgentIdRegistered(msg.sender, newAgentId);
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    /// @notice Receive a USDC payment on behalf of an agent.
    function receivePayment(uint256 amount, address agent) external payable {
        if (amount == 0) revert ZeroAmount();
        if (agent == address(0)) revert ZeroAddress();

        address operator = registry.getOperator(agent);
        uint256 yieldPct = _getYieldPct(operator);

        uint256 toYield;
        uint256 liquid;
        unchecked {
            toYield = (amount * yieldPct) / 100;
            liquid = amount - toYield;
        }

        _transferFrom(address(usdc), msg.sender, agent, liquid);
        _transferFrom(address(usdc), msg.sender, address(yieldRouter), toYield);
        yieldRouter.deposit(toYield, agent);

        emit PaymentReceived(agent, operator, amount, liquid, toYield);
    }

    /// @notice Agent withdraws accumulated yield + principal.
    /// @dev Fee rate comes from the reputation multiplier. Fee goes to
    ///      ClicksFeeV2 which handles referral distribution (unchanged).
    function withdrawYield(address agent, uint256 amount) external payable {
        if (agent == address(0)) revert ZeroAddress();

        address operator = registry.getOperator(agent);
        if (msg.sender != agent && msg.sender != operator && msg.sender != owner())
            revert NotAuthorized();

        uint256 principalBefore = yieldRouter.agentDeposited(agent);
        uint256 withdrawPrincipal = (amount == 0 || amount >= principalBefore)
            ? principalBefore
            : amount;

        uint256 received = yieldRouter.withdraw(withdrawPrincipal, agent);

        uint256 yieldEarned = received > withdrawPrincipal ? received - withdrawPrincipal : 0;
        uint16 feeBps = _feeBpsFor(agent);
        uint256 fee = (yieldEarned * feeBps) / BPS;
        uint256 agentReceives = received - fee;

        if (fee > 0) {
            _transfer(address(usdc), address(feeCollector), fee);
            feeCollector.collectFee(agent, fee);
        }

        _transfer(address(usdc), agent, agentReceives);

        emit YieldWithdrawn(agent, withdrawPrincipal, yieldEarned, fee, feeBps);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

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

    /// @notice Preview the fee rate that would apply to this agent's next withdrawal.
    function feeBpsFor(address agent) external view returns (uint16) {
        return _feeBpsFor(agent);
    }

    /// @notice Preview the fee amount on a hypothetical yield figure.
    function previewFee(address agent, uint256 yieldAmount)
        external
        view
        returns (uint16 feeBps, uint256 fee)
    {
        feeBps = _feeBpsFor(agent);
        fee = (yieldAmount * feeBps) / BPS;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _feeBpsFor(address agent) internal view returns (uint16) {
        uint256 agentId = agentToId[agent];
        if (agentId == 0) return multiplier.FEE_COLD();
        return multiplier.feeBpsFor(agent, agentId);
    }

    function _getYieldPct(address operator) internal view returns (uint256) {
        uint256 custom = operatorYieldPct[operator];
        return custom > 0 ? custom : defaultYieldPct;
    }

    function _transfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer failed");
    }

    function _transferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transferFrom failed");
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
