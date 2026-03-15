import type { ContractTransactionResponse } from 'ethers';
import type { ClicksAddresses } from './addresses';
export interface ClicksClientOptions {
    /** Chain ID. Defaults to 8453 (Base Mainnet). Use 84532 for Base Sepolia. */
    chainId?: number;
    /** Override contract addresses (e.g. for local fork or custom deployment). */
    addresses?: Partial<ClicksAddresses>;
}
/** Result of quickStart() */
export interface QuickStartResult {
    /** Whether the agent was newly registered */
    registered: boolean;
    /** Whether USDC approval was set */
    approved: boolean;
    /** Whether the first payment was split */
    paymentSplit: boolean;
    /** Transaction hashes for each step executed */
    txHashes: string[];
}
/** Result of simulateSplit() */
export interface SplitPreview {
    /** Amount sent directly to the agent wallet (USDC, 6 decimals) */
    liquid: bigint;
    /** Amount routed to DeFi yield (USDC, 6 decimals) */
    toYield: bigint;
    /** Yield percentage applied */
    yieldPct: bigint;
}
/** Agent information from on-chain state */
export interface AgentInfo {
    /** Whether the agent is registered in ClicksRegistry */
    isRegistered: boolean;
    /** Operator address (zero address if not registered) */
    operator: string;
    /** Total USDC principal currently deposited in yield (6 decimals) */
    deposited: bigint;
    /** Effective yield split percentage for this agent */
    yieldPct: bigint;
}
/** Result of withdrawYield() */
export interface WithdrawResult {
    /** Transaction response */
    tx: ContractTransactionResponse;
}
/** Protocol yield information */
export interface YieldInfo {
    /** Active protocol: 0 = none, 1 = Aave, 2 = Morpho */
    activeProtocol: number;
    /** Aave V3 supply APY in basis points */
    aaveAPY: bigint;
    /** Morpho supply APY in basis points */
    morphoAPY: bigint;
    /** Total USDC balance across active protocol (principal + yield) */
    totalBalance: bigint;
    /** Total principal deposited across all agents */
    totalDeposited: bigint;
}
/** Protocol fee information */
export interface FeeInfo {
    /** Total fees collected since deployment (USDC, 6 decimals) */
    totalCollected: bigint;
    /** Fees pending sweep to treasury (USDC, 6 decimals) */
    pendingFees: bigint;
    /** Treasury address */
    treasury: string;
    /** Protocol fee in basis points (200 = 2%) */
    feeBps: bigint;
}
//# sourceMappingURL=types.d.ts.map