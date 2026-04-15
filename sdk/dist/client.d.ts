import { Contract, type ContractTransactionResponse, type Provider, type Signer } from 'ethers';
import { type ClicksAddresses } from './addresses';
import type { AgentInfo, AgentYieldBalance, ClicksClientOptions, FeeInfo, QuickStartResult, SplitPreview, WithdrawResult, YieldInfo } from './types';
/**
 * High-level client for the Clicks Protocol.
 *
 * Wraps the on-chain contracts with a clean, typed API for AI agent operators.
 *
 * @example
 * ```ts
 * import { ClicksClient } from '@clicks-protocol/sdk';
 * import { ethers } from 'ethers';
 *
 * const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
 * const signer = new ethers.Wallet(PRIVATE_KEY, provider);
 * const clicks = new ClicksClient(signer);
 *
 * // Register your agent
 * await clicks.registerAgent('0xAgentAddress');
 *
 * // Receive a payment (splits automatically)
 * await clicks.receivePayment('100', '0xAgentAddress');
 * ```
 */
export declare class ClicksClient {
    /** Resolved contract addresses */
    readonly addresses: ClicksAddresses;
    /** Chain ID this client is configured for */
    readonly chainId: number;
    private readonly registry;
    private readonly splitter;
    private readonly yieldRouter;
    private readonly feeCollector;
    private readonly usdc;
    private readonly signerOrProvider;
    /**
     * Create a new ClicksClient.
     *
     * @param signerOrProvider - An ethers v6 Signer (for write ops) or Provider (read-only)
     * @param options - Optional chain ID and address overrides
     */
    constructor(signerOrProvider: Signer | Provider, options?: ClicksClientOptions);
    /**
     * One-call setup: register agent, approve USDC, and receive first payment.
     *
     * Combines registerAgent + approveUSDC("max") + receivePayment into a single call.
     * Skips steps that are already done (idempotent).
     *
     * @param amount - First payment amount in USDC (human-readable, e.g. "100")
     * @param agentAddress - The agent's wallet address
     * @param referrer - Optional referrer address for the referral program
     * @returns Summary of what was executed
     *
     * @example
     * ```ts
     * const clicks = new ClicksClient(signer);
     * await clicks.quickStart('100', agentAddress);
     * // Agent registered, USDC approved, 80 USDC liquid + 20 USDC earning yield
     * ```
     */
    quickStart(amount: string | bigint, agentAddress: string, referrer?: string, options?: {
        gasLimit?: bigint;
    }): Promise<QuickStartResult>;
    /**
     * Register an AI agent under the caller as operator.
     *
     * @param agentAddress - The agent's wallet address
     * @returns Transaction response
     *
     * @remarks The caller (signer) becomes the operator for this agent.
     */
    registerAgent(agentAddress: string): Promise<ContractTransactionResponse>;
    /**
     * Deregister an agent. Only the operator or contract owner can call this.
     *
     * @param agentAddress - The agent's wallet address
     * @returns Transaction response
     */
    deregisterAgent(agentAddress: string): Promise<ContractTransactionResponse>;
    /**
     * Receive a USDC payment and auto-split between agent wallet and yield.
     *
     * @param amount - Amount in USDC (human-readable, e.g. "100" for 100 USDC)
     * @param agentAddress - The agent that earned this payment
     * @returns Transaction response
     *
     * @remarks
     * The caller must have approved the splitter contract to spend their USDC.
     * Use {@link approveUSDC} to set the allowance.
     *
     * The split ratio is determined by the agent's operator yield percentage
     * (default 20%). For example, a 100 USDC payment with 20% yield:
     * - 80 USDC → agent wallet immediately
     * - 20 USDC → DeFi yield (Aave or Morpho)
     */
    receivePayment(amount: string | bigint, agentAddress: string, options?: {
        gasLimit?: bigint;
    }): Promise<ContractTransactionResponse>;
    /**
     * Withdraw yield + principal for an agent.
     *
     * @param agentAddress - The agent to withdraw for
     * @param amount - Amount of principal to withdraw in USDC (human-readable).
     *                 Omit or pass "0" to withdraw everything.
     * @returns Transaction and withdrawal details
     *
     * @remarks
     * Only the agent, their operator, or the contract owner can withdraw.
     * A 2% protocol fee is taken on yield earned (not on principal).
     */
    withdrawYield(agentAddress: string, amount?: string | bigint): Promise<WithdrawResult>;
    /**
     * Approve the splitter contract to spend USDC on behalf of the caller.
     *
     * @param amount - Amount in USDC (human-readable). Use "max" for unlimited approval.
     * @returns Transaction response
     */
    approveUSDC(amount: string | bigint): Promise<ContractTransactionResponse>;
    /**
     * Check the current USDC allowance for the splitter.
     *
     * @param owner - Address to check allowance for
     * @returns Allowance in raw USDC units (6 decimals)
     */
    getAllowance(owner: string): Promise<bigint>;
    /**
     * Get the USDC balance of an address.
     *
     * @param address - Address to check
     * @returns Balance in raw USDC units (6 decimals)
     */
    getUSDCBalance(address: string): Promise<bigint>;
    /**
     * Preview how a payment would be split for an agent.
     *
     * @param amount - Payment amount in USDC (human-readable)
     * @param agentAddress - The agent address
     * @returns Split breakdown: liquid (to wallet) and toYield (to DeFi)
     */
    simulateSplit(amount: string | bigint, agentAddress: string): Promise<SplitPreview>;
    /**
     * Get comprehensive info about an agent's on-chain state.
     *
     * @param agentAddress - The agent address to query
     * @returns Registration status, operator, deposited principal, yield pct
     */
    getAgentInfo(agentAddress: string): Promise<AgentInfo>;
    /**
     * Get the effective yield percentage for an agent.
     *
     * @param agentAddress - The agent address
     * @returns Yield percentage (e.g. 20 means 20%)
     */
    getYieldPct(agentAddress: string): Promise<bigint>;
    /**
     * Get all agents registered under an operator.
     *
     * @param operatorAddress - The operator address
     * @returns Array of agent addresses
     */
    getOperatorAgents(operatorAddress: string): Promise<string[]>;
    /**
     * Set a custom yield split percentage for the calling operator.
     *
     * @param pct - Yield percentage (5–50). Pass 0 to revert to default.
     * @returns Transaction response
     */
    setOperatorYieldPct(pct: number): Promise<ContractTransactionResponse>;
    /**
     * Get current yield protocol information (global, not per-agent).
     *
     * @returns Active protocol, APYs, total balance, total deposited
     */
    getYieldInfo(): Promise<YieldInfo>;
    /**
     * Get yield balance for a specific agent.
     *
     * Returns the agent's deposited principal and estimated current value
     * (principal + accrued yield) based on the protocol's total balance ratio.
     *
     * @param agentAddress - The agent address to query
     * @returns Object with deposited principal, estimated current value, and earned yield
     */
    getAgentYieldBalance(agentAddress: string): Promise<AgentYieldBalance>;
    /**
     * Get protocol fee information.
     *
     * @returns Total collected, pending fees, treasury address, fee rate
     */
    getFeeInfo(): Promise<FeeInfo>;
    /** Access the raw ClicksRegistry contract instance */
    get registryContract(): Contract;
    /** Access the raw ClicksSplitterV3 contract instance */
    get splitterContract(): Contract;
    /** Access the raw ClicksYieldRouter contract instance */
    get yieldRouterContract(): Contract;
    /** Access the raw ClicksFee contract instance */
    get feeCollectorContract(): Contract;
    /** Access the raw USDC contract instance */
    get usdcContract(): Contract;
}
//# sourceMappingURL=client.d.ts.map