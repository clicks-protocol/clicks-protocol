import {
  Contract,
  parseUnits,
  type ContractTransactionResponse,
  type Provider,
  type Signer,
} from 'ethers';

import { ADDRESSES_BY_CHAIN, BASE_MAINNET, type ClicksAddresses } from './addresses';
import { ERC20_ABI, FEE_ABI, REGISTRY_ABI, SPLITTER_ABI, YIELD_ROUTER_ABI } from './abis';
import type {
  AgentInfo,
  ClicksClientOptions,
  FeeInfo,
  QuickStartResult,
  SplitPreview,
  WithdrawResult,
  YieldInfo,
} from './types';

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
export class ClicksClient {
  /** Resolved contract addresses */
  public readonly addresses: ClicksAddresses;

  /** Chain ID this client is configured for */
  public readonly chainId: number;

  // Contracts
  private readonly registry: Contract;
  private readonly splitter: Contract;
  private readonly yieldRouter: Contract;
  private readonly feeCollector: Contract;
  private readonly usdc: Contract;

  private readonly signerOrProvider: Signer | Provider;

  /**
   * Create a new ClicksClient.
   *
   * @param signerOrProvider - An ethers v6 Signer (for write ops) or Provider (read-only)
   * @param options - Optional chain ID and address overrides
   */
  constructor(signerOrProvider: Signer | Provider, options?: ClicksClientOptions) {
    this.signerOrProvider = signerOrProvider;
    this.chainId = options?.chainId ?? 8453;

    // Resolve addresses: defaults + overrides
    const defaults = ADDRESSES_BY_CHAIN[this.chainId] ?? BASE_MAINNET;
    this.addresses = { ...defaults, ...options?.addresses };

    // Instantiate contracts
    this.registry = new Contract(this.addresses.registry, REGISTRY_ABI, signerOrProvider);
    this.splitter = new Contract(this.addresses.splitter, SPLITTER_ABI, signerOrProvider);
    this.yieldRouter = new Contract(this.addresses.yieldRouter, YIELD_ROUTER_ABI, signerOrProvider);
    this.feeCollector = new Contract(this.addresses.feeCollector, FEE_ABI, signerOrProvider);
    this.usdc = new Contract(this.addresses.usdc, ERC20_ABI, signerOrProvider);
  }

  // ─── Quick Start ───────────────────────────────────────────────────────────

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
  async quickStart(
    amount: string | bigint,
    agentAddress: string,
    referrer?: string,
  ): Promise<QuickStartResult> {
    const result: QuickStartResult = {
      registered: false,
      approved: false,
      paymentSplit: false,
      txHashes: [],
    };

    // Step 1: Register if not already registered
    const isRegistered = await this.registry.isRegistered(agentAddress) as boolean;
    if (!isRegistered) {
      const tx = await this.registerAgent(agentAddress);
      await tx.wait();
      result.registered = true;
      result.txHashes.push(tx.hash);
    }

    // Step 2: Approve USDC if allowance is insufficient
    const signer = this.signerOrProvider as Signer;
    const signerAddress = await signer.getAddress();
    const amountWei = typeof amount === 'string' ? parseUnits(amount, 6) : amount;
    const currentAllowance = await this.getAllowance(signerAddress);

    if (currentAllowance < amountWei) {
      const tx = await this.approveUSDC('max');
      await tx.wait();
      result.approved = true;
      result.txHashes.push(tx.hash);
    }

    // Step 3: Receive payment
    const tx = await this.receivePayment(amount, agentAddress);
    await tx.wait();
    result.paymentSplit = true;
    result.txHashes.push(tx.hash);

    return result;
  }

  // ─── Agent Registration ───────────────────────────────────────────────────

  /**
   * Register an AI agent under the caller as operator.
   *
   * @param agentAddress - The agent's wallet address
   * @returns Transaction response
   *
   * @remarks The caller (signer) becomes the operator for this agent.
   */
  async registerAgent(agentAddress: string): Promise<ContractTransactionResponse> {
    return this.registry.registerAgent(agentAddress) as Promise<ContractTransactionResponse>;
  }

  /**
   * Deregister an agent. Only the operator or contract owner can call this.
   *
   * @param agentAddress - The agent's wallet address
   * @returns Transaction response
   */
  async deregisterAgent(agentAddress: string): Promise<ContractTransactionResponse> {
    return this.registry.deregisterAgent(agentAddress) as Promise<ContractTransactionResponse>;
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

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
  async receivePayment(
    amount: string | bigint,
    agentAddress: string,
  ): Promise<ContractTransactionResponse> {
    const amountWei = typeof amount === 'string' ? parseUnits(amount, 6) : amount;
    return this.splitter.receivePayment(amountWei, agentAddress) as Promise<ContractTransactionResponse>;
  }

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
  async withdrawYield(
    agentAddress: string,
    amount?: string | bigint,
  ): Promise<WithdrawResult> {
    const amountWei = amount
      ? typeof amount === 'string' ? parseUnits(amount, 6) : amount
      : 0n;
    const tx = await this.splitter.withdrawYield(agentAddress, amountWei) as ContractTransactionResponse;
    return { tx };
  }

  // ─── USDC Approval ────────────────────────────────────────────────────────

  /**
   * Approve the splitter contract to spend USDC on behalf of the caller.
   *
   * @param amount - Amount in USDC (human-readable). Use "max" for unlimited approval.
   * @returns Transaction response
   */
  async approveUSDC(amount: string | bigint): Promise<ContractTransactionResponse> {
    const amountWei =
      amount === 'max'
        ? 2n ** 256n - 1n
        : typeof amount === 'string'
          ? parseUnits(amount, 6)
          : amount;

    return this.usdc.approve(this.addresses.splitter, amountWei) as Promise<ContractTransactionResponse>;
  }

  /**
   * Check the current USDC allowance for the splitter.
   *
   * @param owner - Address to check allowance for
   * @returns Allowance in raw USDC units (6 decimals)
   */
  async getAllowance(owner: string): Promise<bigint> {
    return this.usdc.allowance(owner, this.addresses.splitter) as Promise<bigint>;
  }

  /**
   * Get the USDC balance of an address.
   *
   * @param address - Address to check
   * @returns Balance in raw USDC units (6 decimals)
   */
  async getUSDCBalance(address: string): Promise<bigint> {
    return this.usdc.balanceOf(address) as Promise<bigint>;
  }

  // ─── View: Split Simulation ───────────────────────────────────────────────

  /**
   * Preview how a payment would be split for an agent.
   *
   * @param amount - Payment amount in USDC (human-readable)
   * @param agentAddress - The agent address
   * @returns Split breakdown: liquid (to wallet) and toYield (to DeFi)
   */
  async simulateSplit(amount: string | bigint, agentAddress: string): Promise<SplitPreview> {
    const amountWei = typeof amount === 'string' ? parseUnits(amount, 6) : amount;
    const [liquid, toYield] = await this.splitter.simulateSplit(amountWei, agentAddress);
    const yieldPct = await this.splitter.getYieldPct(agentAddress);
    return {
      liquid: liquid as bigint,
      toYield: toYield as bigint,
      yieldPct: yieldPct as bigint,
    };
  }

  // ─── View: Agent Info ─────────────────────────────────────────────────────

  /**
   * Get comprehensive info about an agent's on-chain state.
   *
   * @param agentAddress - The agent address to query
   * @returns Registration status, operator, deposited principal, yield pct
   */
  async getAgentInfo(agentAddress: string): Promise<AgentInfo> {
    const [isRegistered, operator, deposited, yieldPct] = await Promise.all([
      this.registry.isRegistered(agentAddress) as Promise<boolean>,
      this.registry.getOperator(agentAddress) as Promise<string>,
      this.yieldRouter.agentDeposited(agentAddress) as Promise<bigint>,
      this.splitter.getYieldPct(agentAddress) as Promise<bigint>,
    ]);

    return { isRegistered, operator, deposited, yieldPct };
  }

  /**
   * Get the effective yield percentage for an agent.
   *
   * @param agentAddress - The agent address
   * @returns Yield percentage (e.g. 20 means 20%)
   */
  async getYieldPct(agentAddress: string): Promise<bigint> {
    return this.splitter.getYieldPct(agentAddress) as Promise<bigint>;
  }

  // ─── View: Operator ───────────────────────────────────────────────────────

  /**
   * Get all agents registered under an operator.
   *
   * @param operatorAddress - The operator address
   * @returns Array of agent addresses
   */
  async getOperatorAgents(operatorAddress: string): Promise<string[]> {
    return this.registry.getAgents(operatorAddress) as Promise<string[]>;
  }

  /**
   * Set a custom yield split percentage for the calling operator.
   *
   * @param pct - Yield percentage (5–50). Pass 0 to revert to default.
   * @returns Transaction response
   */
  async setOperatorYieldPct(pct: number): Promise<ContractTransactionResponse> {
    return this.splitter.setOperatorYieldPct(pct) as Promise<ContractTransactionResponse>;
  }

  // ─── View: Yield Router ───────────────────────────────────────────────────

  /**
   * Get current yield protocol information.
   *
   * @returns Active protocol, APYs, total balance, total deposited
   */
  async getYieldInfo(): Promise<YieldInfo> {
    const [activeProtocol, aaveAPY, morphoAPY, totalBalance, totalDeposited] = await Promise.all([
      this.yieldRouter.activeProtocol() as Promise<number>,
      this.yieldRouter.getAaveAPY() as Promise<bigint>,
      this.yieldRouter.getMorphoAPY() as Promise<bigint>,
      this.yieldRouter.getTotalBalance() as Promise<bigint>,
      this.yieldRouter.totalDeposited() as Promise<bigint>,
    ]);

    return { activeProtocol, aaveAPY, morphoAPY, totalBalance, totalDeposited };
  }

  // ─── View: Fees ───────────────────────────────────────────────────────────

  /**
   * Get protocol fee information.
   *
   * @returns Total collected, pending fees, treasury address, fee rate
   */
  async getFeeInfo(): Promise<FeeInfo> {
    const [totalCollected, pendingFees, treasury, feeBps] = await Promise.all([
      this.feeCollector.totalCollected() as Promise<bigint>,
      this.feeCollector.pendingFees() as Promise<bigint>,
      this.feeCollector.treasury() as Promise<string>,
      this.splitter.FEE_BPS() as Promise<bigint>,
    ]);

    return { totalCollected, pendingFees, treasury, feeBps };
  }

  // ─── Advanced: Raw Contract Access ────────────────────────────────────────

  /** Access the raw ClicksRegistry contract instance */
  get registryContract(): Contract {
    return this.registry;
  }

  /** Access the raw ClicksSplitterV3 contract instance */
  get splitterContract(): Contract {
    return this.splitter;
  }

  /** Access the raw ClicksYieldRouter contract instance */
  get yieldRouterContract(): Contract {
    return this.yieldRouter;
  }

  /** Access the raw ClicksFee contract instance */
  get feeCollectorContract(): Contract {
    return this.feeCollector;
  }

  /** Access the raw USDC contract instance */
  get usdcContract(): Contract {
    return this.usdc;
  }
}
