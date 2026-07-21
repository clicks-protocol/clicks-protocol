/**
 * @clicks-protocol/sdk
 *
 * TypeScript SDK for Clicks Protocol, the agent commerce settlement router on Base.
 *
 * @packageDocumentation
 */
export { ClicksClient } from './client';
export type { ClicksClientOptions, AgentInfo, AgentYieldBalance, QuickStartResult, QuickStartWithReferralResult, ReferralApprovalTypedData, ReferralRegistrationResult, SplitPreview, WithdrawResult, YieldInfo, FeeInfo, } from './types';
export { createSettlementReceipt, hashSettlementPolicy, type SettlementExecution, type SettlementFalsifiability, type SettlementIngress, type SettlementPolicySnapshot, type SettlementPreconditionSnapshot, type SettlementReceiptInput, type SettlementReceiptStatus, type SettlementReceiptV1, } from './receipts';
export { BASE_MAINNET, BASE_SEPOLIA, ADDRESSES_BY_CHAIN, type ClicksAddresses, } from './addresses';
export { ERC20_ABI, REGISTRY_ABI, SPLITTER_ABI, YIELD_ROUTER_ABI, FEE_ABI, REFERRAL_ABI, } from './abis';
//# sourceMappingURL=index.d.ts.map