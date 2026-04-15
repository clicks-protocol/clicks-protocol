"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClicksClient = void 0;
const ethers_1 = require("ethers");
const addresses_1 = require("./addresses");
const abis_1 = require("./abis");
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
class ClicksClient {
    /** Resolved contract addresses */
    addresses;
    /** Chain ID this client is configured for */
    chainId;
    // Contracts
    registry;
    splitter;
    yieldRouter;
    feeCollector;
    usdc;
    signerOrProvider;
    /**
     * Create a new ClicksClient.
     *
     * @param signerOrProvider - An ethers v6 Signer (for write ops) or Provider (read-only)
     * @param options - Optional chain ID and address overrides
     */
    constructor(signerOrProvider, options) {
        this.signerOrProvider = signerOrProvider;
        this.chainId = options?.chainId ?? 8453;
        // Resolve addresses: defaults + overrides
        const defaults = addresses_1.ADDRESSES_BY_CHAIN[this.chainId] ?? addresses_1.BASE_MAINNET;
        this.addresses = { ...defaults, ...options?.addresses };
        // Instantiate contracts
        this.registry = new ethers_1.Contract(this.addresses.registry, abis_1.REGISTRY_ABI, signerOrProvider);
        this.splitter = new ethers_1.Contract(this.addresses.splitter, abis_1.SPLITTER_ABI, signerOrProvider);
        this.yieldRouter = new ethers_1.Contract(this.addresses.yieldRouter, abis_1.YIELD_ROUTER_ABI, signerOrProvider);
        this.feeCollector = new ethers_1.Contract(this.addresses.feeCollector, abis_1.FEE_ABI, signerOrProvider);
        this.usdc = new ethers_1.Contract(this.addresses.usdc, abis_1.ERC20_ABI, signerOrProvider);
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
    async quickStart(amount, agentAddress, referrer, options) {
        const result = {
            registered: false,
            approved: false,
            paymentSplit: false,
            txHashes: [],
        };
        // Step 1: Register if not already registered
        const isRegistered = await this.registry.isRegistered(agentAddress);
        if (!isRegistered) {
            const tx = await this.registerAgent(agentAddress);
            await tx.wait();
            result.registered = true;
            result.txHashes.push(tx.hash);
        }
        // Step 2: Approve USDC if allowance is insufficient
        const signer = this.signerOrProvider;
        const signerAddress = await signer.getAddress();
        const amountWei = typeof amount === 'string' ? (0, ethers_1.parseUnits)(amount, 6) : amount;
        const currentAllowance = await this.getAllowance(signerAddress);
        if (currentAllowance < amountWei) {
            const tx = await this.approveUSDC('max');
            await tx.wait();
            result.approved = true;
            result.txHashes.push(tx.hash);
        }
        // Step 3: Receive payment
        const tx = await this.receivePayment(amount, agentAddress, options);
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
    async registerAgent(agentAddress) {
        return this.registry.registerAgent(agentAddress);
    }
    /**
     * Deregister an agent. Only the operator or contract owner can call this.
     *
     * @param agentAddress - The agent's wallet address
     * @returns Transaction response
     */
    async deregisterAgent(agentAddress) {
        return this.registry.deregisterAgent(agentAddress);
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
    async receivePayment(amount, agentAddress, options) {
        const amountWei = typeof amount === 'string' ? (0, ethers_1.parseUnits)(amount, 6) : amount;
        // Default gas limit for cross-contract calls (Splitter → YieldRouter → Morpho)
        // The standard estimation fails for deep contract calls, so we set a safe default
        const gasLimit = options?.gasLimit ?? 500000n;
        return this.splitter.receivePayment(amountWei, agentAddress, { gasLimit });
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
    async withdrawYield(agentAddress, amount) {
        const amountWei = amount
            ? typeof amount === 'string' ? (0, ethers_1.parseUnits)(amount, 6) : amount
            : 0n;
        const tx = await this.splitter.withdrawYield(agentAddress, amountWei);
        return { tx };
    }
    // ─── USDC Approval ────────────────────────────────────────────────────────
    /**
     * Approve the splitter contract to spend USDC on behalf of the caller.
     *
     * @param amount - Amount in USDC (human-readable). Use "max" for unlimited approval.
     * @returns Transaction response
     */
    async approveUSDC(amount) {
        const amountWei = amount === 'max'
            ? 2n ** 256n - 1n
            : typeof amount === 'string'
                ? (0, ethers_1.parseUnits)(amount, 6)
                : amount;
        return this.usdc.approve(this.addresses.splitter, amountWei);
    }
    /**
     * Check the current USDC allowance for the splitter.
     *
     * @param owner - Address to check allowance for
     * @returns Allowance in raw USDC units (6 decimals)
     */
    async getAllowance(owner) {
        return this.usdc.allowance(owner, this.addresses.splitter);
    }
    /**
     * Get the USDC balance of an address.
     *
     * @param address - Address to check
     * @returns Balance in raw USDC units (6 decimals)
     */
    async getUSDCBalance(address) {
        return this.usdc.balanceOf(address);
    }
    // ─── View: Split Simulation ───────────────────────────────────────────────
    /**
     * Preview how a payment would be split for an agent.
     *
     * @param amount - Payment amount in USDC (human-readable)
     * @param agentAddress - The agent address
     * @returns Split breakdown: liquid (to wallet) and toYield (to DeFi)
     */
    async simulateSplit(amount, agentAddress) {
        const amountWei = typeof amount === 'string' ? (0, ethers_1.parseUnits)(amount, 6) : amount;
        const [liquid, toYield] = await this.splitter.simulateSplit(amountWei, agentAddress);
        const yieldPct = await this.splitter.getYieldPct(agentAddress);
        return {
            liquid: liquid,
            toYield: toYield,
            yieldPct: yieldPct,
        };
    }
    // ─── View: Agent Info ─────────────────────────────────────────────────────
    /**
     * Get comprehensive info about an agent's on-chain state.
     *
     * @param agentAddress - The agent address to query
     * @returns Registration status, operator, deposited principal, yield pct
     */
    async getAgentInfo(agentAddress) {
        const [isRegistered, operator, deposited, yieldPct] = await Promise.all([
            this.registry.isRegistered(agentAddress),
            this.registry.getOperator(agentAddress),
            this.yieldRouter.agentDeposited(agentAddress),
            this.splitter.getYieldPct(agentAddress),
        ]);
        return { isRegistered, operator, deposited, yieldPct };
    }
    /**
     * Get the effective yield percentage for an agent.
     *
     * @param agentAddress - The agent address
     * @returns Yield percentage (e.g. 20 means 20%)
     */
    async getYieldPct(agentAddress) {
        return this.splitter.getYieldPct(agentAddress);
    }
    // ─── View: Operator ───────────────────────────────────────────────────────
    /**
     * Get all agents registered under an operator.
     *
     * @param operatorAddress - The operator address
     * @returns Array of agent addresses
     */
    async getOperatorAgents(operatorAddress) {
        return this.registry.getAgents(operatorAddress);
    }
    /**
     * Set a custom yield split percentage for the calling operator.
     *
     * @param pct - Yield percentage (5–50). Pass 0 to revert to default.
     * @returns Transaction response
     */
    async setOperatorYieldPct(pct) {
        return this.splitter.setOperatorYieldPct(pct);
    }
    // ─── View: Yield Router ───────────────────────────────────────────────────
    /**
     * Get current yield protocol information (global, not per-agent).
     *
     * @returns Active protocol, APYs, total balance, total deposited
     */
    async getYieldInfo() {
        const [activeProtocol, aaveAPY, morphoAPY, totalBalance, totalDeposited] = await Promise.all([
            this.yieldRouter.activeProtocol(),
            this.yieldRouter.getAaveAPY(),
            this.yieldRouter.getMorphoAPY(),
            this.yieldRouter.getTotalBalance(),
            this.yieldRouter.totalDeposited(),
        ]);
        return { activeProtocol, aaveAPY, morphoAPY, totalBalance, totalDeposited };
    }
    /**
     * Get yield balance for a specific agent.
     *
     * Returns the agent's deposited principal and estimated current value
     * (principal + accrued yield) based on the protocol's total balance ratio.
     *
     * @param agentAddress - The agent address to query
     * @returns Object with deposited principal, estimated current value, and earned yield
     */
    async getAgentYieldBalance(agentAddress) {
        const [deposited, totalDeposited, totalBalance, activeProtocol] = await Promise.all([
            this.yieldRouter.agentDeposited(agentAddress),
            this.yieldRouter.totalDeposited(),
            this.yieldRouter.getTotalBalance(),
            this.yieldRouter.activeProtocol(),
        ]);
        // Estimate agent's share of the yield pool
        // currentValue = (agentDeposited / totalDeposited) * totalBalance
        let currentValue = deposited;
        let yieldEarned = 0n;
        if (totalDeposited > 0n && deposited > 0n) {
            currentValue = (deposited * totalBalance) / totalDeposited;
            yieldEarned = currentValue > deposited ? currentValue - deposited : 0n;
        }
        return { deposited, currentValue, yieldEarned, activeProtocol };
    }
    // ─── View: Fees ───────────────────────────────────────────────────────────
    /**
     * Get protocol fee information.
     *
     * @returns Total collected, pending fees, treasury address, fee rate
     */
    async getFeeInfo() {
        const [totalCollected, pendingFees, treasury, feeBps] = await Promise.all([
            this.feeCollector.totalCollected(),
            this.feeCollector.pendingFees(),
            this.feeCollector.treasury(),
            this.splitter.FEE_BPS(),
        ]);
        return { totalCollected, pendingFees, treasury, feeBps };
    }
    // ─── Advanced: Raw Contract Access ────────────────────────────────────────
    /** Access the raw ClicksRegistry contract instance */
    get registryContract() {
        return this.registry;
    }
    /** Access the raw ClicksSplitterV3 contract instance */
    get splitterContract() {
        return this.splitter;
    }
    /** Access the raw ClicksYieldRouter contract instance */
    get yieldRouterContract() {
        return this.yieldRouter;
    }
    /** Access the raw ClicksFee contract instance */
    get feeCollectorContract() {
        return this.feeCollector;
    }
    /** Access the raw USDC contract instance */
    get usdcContract() {
        return this.usdc;
    }
}
exports.ClicksClient = ClicksClient;
//# sourceMappingURL=client.js.map