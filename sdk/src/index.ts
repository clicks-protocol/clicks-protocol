/**
 * @clicks-protocol/sdk
 *
 * TypeScript SDK for the Clicks Protocol — on-chain yield for AI agents on Base.
 *
 * @packageDocumentation
 */

// Main client
export { ClicksClient } from './client';

// Types
export type {
  ClicksClientOptions,
  AgentInfo,
  AgentYieldBalance,
  QuickStartResult,
  SplitPreview,
  WithdrawResult,
  YieldInfo,
  FeeInfo,
} from './types';

// Addresses
export {
  BASE_MAINNET,
  BASE_SEPOLIA,
  ADDRESSES_BY_CHAIN,
  type ClicksAddresses,
} from './addresses';

// ABIs (for advanced users)
export {
  ERC20_ABI,
  REGISTRY_ABI,
  SPLITTER_ABI,
  YIELD_ROUTER_ABI,
  FEE_ABI,
} from './abis';
