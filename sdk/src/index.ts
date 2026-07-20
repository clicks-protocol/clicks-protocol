/**
 * @clicks-protocol/sdk
 *
 * TypeScript SDK for Clicks Protocol, the agent commerce settlement router on Base.
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
  QuickStartWithReferralResult,
  ReferralApprovalTypedData,
  ReferralRegistrationResult,
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
  REFERRAL_ABI,
} from './abis';
