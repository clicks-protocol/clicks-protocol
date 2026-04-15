/**
 * Contract ABIs for the Clicks Protocol.
 *
 * These are minimal human-readable ABIs covering the functions used by the SDK.
 * For the full ABIs, import from the artifacts directory.
 */

/** ERC-20 subset needed for USDC approve/allowance */
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
] as const;

/** ClicksRegistry ABI */
export const REGISTRY_ABI = [
  'function registerAgent(address agent)',
  'function deregisterAgent(address agent)',
  'function isRegistered(address agent) view returns (bool)',
  'function getOperator(address agent) view returns (address)',
  'function getAgents(address operator) view returns (address[])',
  'function getAgentCount(address operator) view returns (uint256)',
  'function totalAgents() view returns (uint256)',
  'function agentOperator(address agent) view returns (address)',
  'event AgentRegistered(address indexed agent, address indexed operator)',
  'event AgentDeregistered(address indexed agent, address indexed operator)',
] as const;

/** ClicksSplitterV3 ABI */
export const SPLITTER_ABI = [
  'function receivePayment(uint256 amount, address agent)',
  'function withdrawYield(address agent, uint256 amount)',
  'function simulateSplit(uint256 amount, address agent) view returns (uint256 liquid, uint256 toYield)',
  'function getYieldPct(address agent) view returns (uint256)',
  'function setOperatorYieldPct(uint256 pct)',
  'function defaultYieldPct() view returns (uint256)',
  'function operatorYieldPct(address operator) view returns (uint256)',
  'function FEE_BPS() view returns (uint256)',
  'function BPS() view returns (uint256)',
  'function MIN_YIELD_PCT() view returns (uint256)',
  'function MAX_YIELD_PCT() view returns (uint256)',
  'function usdc() view returns (address)',
  'function yieldRouter() view returns (address)',
  'function feeCollector() view returns (address)',
  'function registry() view returns (address)',
  'event PaymentReceived(address indexed agent, address indexed operator, uint256 total, uint256 liquid, uint256 toYield)',
  'event YieldWithdrawn(address indexed agent, uint256 principal, uint256 yieldEarned, uint256 fee)',
] as const;

/** ClicksYieldRouter ABI */
export const YIELD_ROUTER_ABI = [
  'function agentDeposited(address agent) view returns (uint256)',
  'function totalDeposited() view returns (uint256)',
  'function activeProtocol() view returns (uint8)',
  'function getAaveAPY() view returns (uint256)',
  'function getMorphoAPY() view returns (uint256)',
  'function getAPYs() view returns (uint256 aaveAPY, uint256 morphoAPY)',
  'function getBestProtocol() view returns (uint8)',
  'function getTotalBalance() view returns (uint256)',
  'function REBALANCE_THRESHOLD() view returns (uint256)',
  'event Deposited(address indexed agent, uint256 amount, uint8 protocol)',
  'event Withdrawn(address indexed agent, uint256 amount, uint256 yield)',
  'event Rebalanced(uint8 fromProtocol, uint8 toProtocol, uint256 amount)',
] as const;

/** ClicksFee ABI */
export const FEE_ABI = [
  'function totalCollected() view returns (uint256)',
  'function pendingFees() view returns (uint256)',
  'function treasury() view returns (address)',
  'event FeeCollected(address indexed agent, uint256 amount)',
  'event FeeSwept(address indexed to, uint256 amount)',
] as const;
