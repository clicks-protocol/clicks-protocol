#!/usr/bin/env node
/**
 * Clicks Protocol MCP Server
 *
 * Exposes Clicks Protocol settlement operations as MCP tools for AI agents.
 * Any MCP-compatible client (Claude, Cursor, LangChain, etc.) can
 * discover and use these tools to route, split, and inspect agent-commerce
 * revenue on Base.
 *
 * Usage:
 *   CLICKS_PRIVATE_KEY=0x... clicks-mcp
 *   CLICKS_RPC_URL=https://mainnet.base.org clicks-mcp
 */
import fs from 'node:fs';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Contract, JsonRpcProvider, Wallet, parseUnits, formatUnits, getAddress, isAddress, keccak256, toUtf8Bytes } from 'ethers';
// ─── Input Validation ────────────────────────────────────────────────────
function validateAddress(addr) {
    if (!isAddress(addr))
        throw new Error(`Invalid Ethereum address: ${addr}`);
    return getAddress(addr); // Returns checksummed address
}
/** Zod schema for validated Ethereum address */
const ethAddress = z.string()
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid 42-character hex address')
    .transform(validateAddress);
// ─── Usage Logging ────────────────────────────────────────────────────────
const MCP_LOG_PATH = process.env.CLICKS_MCP_LOG_PATH
    || path.resolve(process.env.HOME || '.', '.clicks-protocol', 'mcp-usage.jsonl');
function logToolCall(toolName, direction, success, durationMs, error) {
    try {
        fs.mkdirSync(path.dirname(MCP_LOG_PATH), { recursive: true });
        const entry = {
            ts: new Date().toISOString(),
            tool: toolName,
            direction,
            success,
            durationMs,
            ...(error ? { error } : {}),
        };
        fs.appendFileSync(MCP_LOG_PATH, JSON.stringify(entry) + '\n');
    }
    catch {
        // Never let logging break the server
    }
}
// ─── Contract ABIs (minimal) ──────────────────────────────────────────────
const REGISTRY_ABI = [
    'function registerAgent(address agent) external',
    'function isRegistered(address agent) external view returns (bool)',
    'function getOperator(address agent) external view returns (address)',
    'function getAgents(address operator) external view returns (address[])',
];
const SPLITTER_ABI = [
    'function receivePayment(uint256 amount, address agent) external',
    'function withdrawYield(address agent, uint256 amount) external',
    'function simulateSplit(uint256 amount, address agent) external view returns (uint256 liquid, uint256 toYield)',
    'function getYieldPct(address agent) external view returns (uint256)',
    'function setOperatorYieldPct(uint256 pct) external',
];
const YIELD_ROUTER_ABI = [
    'function activeProtocol() external view returns (uint8)',
    'function getAaveAPY() external view returns (uint256)',
    'function getMorphoAPY() external view returns (uint256)',
    'function getTotalBalance() external view returns (uint256)',
    'function totalDeposited() external view returns (uint256)',
    'function agentDeposited(address agent) external view returns (uint256)',
];
const FEE_ABI = [
    'function totalCollected() external view returns (uint256)',
    'function pendingFees() external view returns (uint256)',
    'function treasury() external view returns (address)',
];
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
];
const REFERRAL_ABI = [
    'function registerReferral(address newAgent, address referrer) external',
    'function registerReferralWithSig(address newAgent, address referrer, uint256 deadline, bytes signature) external',
    'function referralNonces(address agent) external view returns (uint256)',
    'function getReferralStats(address agent) external view returns (uint32 directCount, uint256 totalEarned, uint256 claimable, address referrer)',
    'function getReferralChain(address agent) external view returns (address[3])',
    'function claimReferralRewards() external returns (uint256)',
    'function getTeamBonusYield(address agent) external view returns (uint16)',
];
// ─── Addresses (Base Mainnet) ─────────────────────────────────────────────
const ADDRESSES = {
    registry: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
    feeCollector: '0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5',
    yieldRouter: '0x053167a233d18E05Bc65a8d5F3F8808782a3EECD',
    splitter: '0xB7E0016d543bD443ED2A6f23d5008400255bf3C8',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    referral: '0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC',
};
// ─── Helpers ──────────────────────────────────────────────────────────────
function getProvider() {
    const rpc = process.env.CLICKS_RPC_URL || 'https://mainnet.base.org';
    return new JsonRpcProvider(rpc);
}
function getSigner() {
    const key = process.env.CLICKS_PRIVATE_KEY;
    if (!key)
        throw new Error('CLICKS_PRIVATE_KEY environment variable required for write operations');
    return new Wallet(key, getProvider());
}
function formatUSDC(amount) {
    return formatUnits(amount, 6);
}
function canonicalize(value) {
    if (Array.isArray(value))
        return `[${value.map(canonicalize).join(',')}]`;
    if (value && typeof value === 'object') {
        const entries = Object.entries(value)
            .filter(([, item]) => item !== undefined)
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(',')}}`;
    }
    return JSON.stringify(value);
}
function parseReceiptV2(receiptJson) {
    const receipt = JSON.parse(receiptJson);
    if (receipt.schema !== 'clicks.settlement.receipt.v2' || !receipt.receiptId || !receipt.execution?.state) {
        throw new Error('Expected a Clicks Settlement Receipt V2 JSON object');
    }
    return receipt;
}
function verifyReceiptV2(receipt) {
    const { receiptId: _receiptId, ...payload } = receipt;
    const calculatedReceiptId = keccak256(toUtf8Bytes(canonicalize(payload)));
    return { valid: receipt.receiptId === calculatedReceiptId, calculatedReceiptId };
}
function equalOptionalAddress(left, right) {
    if (!left || !right)
        return true;
    return left.toLowerCase() === right.toLowerCase();
}
// ─── Server ───────────────────────────────────────────────────────────────
const server = new McpServer({
    name: 'clicks-protocol',
    version: '0.3.2',
});
/** Wrap an async tool handler with usage logging */
function tracked(toolName, direction, fn) {
    const start = Date.now();
    return fn().then((result) => { logToolCall(toolName, direction, true, Date.now() - start); return result; }, (err) => { logToolCall(toolName, direction, false, Date.now() - start, err.message); throw err; });
}
// ─── Read Tools ───────────────────────────────────────────────────────────
server.tool('clicks_get_agent_info', 'Inspect an agent settlement account. Returns registration status, operator, deposited USDC, settlement split, and wallet balance.', { agent_address: ethAddress.describe('Ethereum address of the AI agent') }, async ({ agent_address }) => tracked('clicks_get_agent_info', 'read', async () => {
    const provider = getProvider();
    const registry = new Contract(ADDRESSES.registry, REGISTRY_ABI, provider);
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, provider);
    const yieldRouter = new Contract(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, provider);
    const usdc = new Contract(ADDRESSES.usdc, ERC20_ABI, provider);
    const [isRegistered, operator, deposited, yieldPct, balance] = await Promise.all([
        registry.isRegistered(agent_address),
        registry.getOperator(agent_address),
        yieldRouter.agentDeposited(agent_address),
        splitter.getYieldPct(agent_address),
        usdc.balanceOf(agent_address),
    ]);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    agent: agent_address,
                    isRegistered,
                    operator,
                    deposited_usdc: formatUSDC(deposited),
                    yield_pct: Number(yieldPct),
                    wallet_balance_usdc: formatUSDC(balance),
                }, null, 2),
            }],
    };
}));
server.tool('clicks_simulate_split', 'Preview how an incoming USDC revenue event will be split between liquid operations and routed treasury capital.', {
    amount: z.string().describe('Payment amount in USDC (e.g. "100" for 100 USDC)'),
    agent_address: ethAddress.describe('Ethereum address of the AI agent'),
}, async ({ amount, agent_address }) => tracked('clicks_simulate_split', 'read', async () => {
    const provider = getProvider();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, provider);
    const amountWei = parseUnits(amount, 6);
    const [liquid, toYield] = await splitter.simulateSplit(amountWei, agent_address);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    payment_usdc: amount,
                    liquid_usdc: formatUSDC(liquid),
                    to_yield_usdc: formatUSDC(toYield),
                    explanation: `${formatUSDC(liquid)} USDC goes to agent wallet immediately, ${formatUSDC(toYield)} USDC is routed to DeFi yield.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_get_yield_info', 'Inspect the treasury routing layer. Returns active yield route, Aave and Morpho rates, total routed balance, deposits, and protocol fees.', {}, async () => tracked('clicks_get_yield_info', 'read', async () => {
    const provider = getProvider();
    const yieldRouter = new Contract(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, provider);
    const fee = new Contract(ADDRESSES.feeCollector, FEE_ABI, provider);
    const [activeProtocol, aaveAPY, morphoAPY, totalBalance, totalDeposited, totalFees] = await Promise.all([
        yieldRouter.activeProtocol(),
        yieldRouter.getAaveAPY(),
        yieldRouter.getMorphoAPY(),
        yieldRouter.getTotalBalance(),
        yieldRouter.totalDeposited(),
        fee.totalCollected(),
    ]);
    const protocolNames = { 0: 'None', 1: 'Aave V3', 2: 'Morpho' };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    active_protocol: protocolNames[Number(activeProtocol)] || 'Unknown',
                    aave_apy_bps: Number(aaveAPY),
                    morpho_apy_bps: Number(morphoAPY),
                    total_balance_usdc: formatUSDC(totalBalance),
                    total_deposited_usdc: formatUSDC(totalDeposited),
                    total_yield_earned_usdc: formatUSDC(BigInt(totalBalance) - BigInt(totalDeposited)),
                    total_fees_collected_usdc: formatUSDC(totalFees),
                }, null, 2),
            }],
    };
}));
server.tool('clicks_get_referral_stats', 'Inspect explicit referral attribution for an agent. Returns direct referrals, claimable rewards, referral chain, and team bonus.', { agent_address: ethAddress.describe('Ethereum address of the AI agent') }, async ({ agent_address }) => tracked('clicks_get_referral_stats', 'read', async () => {
    if (!ADDRESSES.referral) {
        return {
            content: [{ type: 'text', text: 'Referral contract not yet deployed. Coming soon.' }],
        };
    }
    const provider = getProvider();
    const referral = new Contract(ADDRESSES.referral, REFERRAL_ABI, provider);
    const [stats, chain, bonusBps] = await Promise.all([
        referral.getReferralStats(agent_address),
        referral.getReferralChain(agent_address),
        referral.getTeamBonusYield(agent_address),
    ]);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    agent: agent_address,
                    direct_referrals: Number(stats.directCount),
                    total_earned_usdc: formatUSDC(stats.totalEarned),
                    claimable_usdc: formatUSDC(stats.claimable),
                    referred_by: stats.referrer,
                    referral_chain: {
                        L1: chain[0],
                        L2: chain[1],
                        L3: chain[2],
                    },
                    team_bonus_bps: Number(bonusBps),
                }, null, 2),
            }],
    };
}));
server.tool('clicks_verify_receipt', 'Verify the deterministic hash of a Clicks Settlement Receipt V2. This is read-only and does not prove delivery by itself.', { receipt_json: z.string().describe('Complete Clicks Settlement Receipt V2 as JSON') }, async ({ receipt_json }) => tracked('clicks_verify_receipt', 'read', async () => {
    const receipt = parseReceiptV2(receipt_json);
    const verification = verifyReceiptV2(receipt);
    return { content: [{ type: 'text', text: JSON.stringify({
                    receipt_id: receipt.receiptId,
                    schema: receipt.schema,
                    valid: verification.valid,
                    calculated_receipt_id: verification.calculatedReceiptId,
                    limitation: 'Hash validity proves integrity of the receipt object, not independent settlement or delivery.',
                }, null, 2) }] };
}));
server.tool('clicks_get_settlement_status', 'Read the state, witnesses, retry policy and reconciliation history recorded in a Receipt V2.', { receipt_json: z.string().describe('Complete Clicks Settlement Receipt V2 as JSON') }, async ({ receipt_json }) => tracked('clicks_get_settlement_status', 'read', async () => {
    const receipt = parseReceiptV2(receipt_json);
    const verification = verifyReceiptV2(receipt);
    return { content: [{ type: 'text', text: JSON.stringify({
                    valid_receipt_hash: verification.valid,
                    receipt_id: receipt.receiptId,
                    idempotency_key: receipt.idempotencyKey,
                    business_event_id: receipt.businessEventId,
                    state: receipt.execution.state,
                    retry_allowed: receipt.execution.state === 'failed_before_transfer'
                        && receipt.execution.retryPolicy?.allowRetry === true
                        && receipt.execution.retryPolicy.attempts < receipt.execution.retryPolicy.maxAttempts,
                    failed_witness: receipt.execution.failedWitness ?? null,
                    witnesses: receipt.execution.witnessStates ?? [],
                    reconciliation_history: receipt.execution.reconciliationHistory ?? [],
                }, null, 2) }] };
}));
server.tool('clicks_reconcile_settlement', 'Read Base transaction evidence for a Receipt V2 and propose a fail-closed next state. Never submits or retries a transaction.', { receipt_json: z.string().describe('Complete Clicks Settlement Receipt V2 as JSON') }, async ({ receipt_json }) => tracked('clicks_reconcile_settlement', 'read', async () => {
    const receipt = parseReceiptV2(receipt_json);
    const verification = verifyReceiptV2(receipt);
    if (!verification.valid)
        throw new Error('Receipt hash is invalid');
    const txHash = receipt.execution.txHash;
    if (!txHash) {
        return { content: [{ type: 'text', text: JSON.stringify({
                        result: 'unknown',
                        proposed_state: 'reconciliation_required',
                        retry_allowed: false,
                        evidence: ['receipt contains no transaction hash'],
                    }, null, 2) }] };
    }
    const provider = getProvider();
    const [chainReceipt, transaction] = await Promise.all([
        provider.getTransactionReceipt(txHash),
        provider.getTransaction(txHash),
    ]);
    if (!chainReceipt || !transaction) {
        return { content: [{ type: 'text', text: JSON.stringify({
                        result: 'unknown',
                        proposed_state: 'reconciliation_required',
                        retry_allowed: false,
                        evidence: ['transaction not returned by the configured RPC; absence is not proof of non-submission'],
                    }, null, 2) }] };
    }
    const conflict = transaction.hash.toLowerCase() !== txHash.toLowerCase()
        || (receipt.execution.nonce !== undefined && transaction.nonce !== receipt.execution.nonce)
        || !equalOptionalAddress(receipt.execution.sender, transaction.from)
        || !equalOptionalAddress(receipt.execution.recipient, transaction.to ?? undefined);
    const reverted = chainReceipt.status === 0;
    const result = conflict || reverted ? 'conflicting_evidence' : 'confirmed';
    return { content: [{ type: 'text', text: JSON.stringify({
                    result,
                    proposed_state: conflict || reverted ? 'disputed' : 'reconciled',
                    retry_allowed: false,
                    evidence: {
                        tx_hash: transaction.hash,
                        block_number: chainReceipt.blockNumber,
                        status: reverted ? 'reverted' : 'confirmed',
                        from: transaction.from,
                        to: transaction.to,
                        nonce: transaction.nonce,
                    },
                    limitation: 'Merchant settlement and delivery evidence require independent external witnesses.',
                }, null, 2) }] };
}));
server.tool('clicks_replay_policy', 'Recompute a policy definition hash and compare it with the exact policy version bound to a Receipt V2.', {
    receipt_json: z.string().describe('Complete Clicks Settlement Receipt V2 as JSON'),
    policy_definition_json: z.string().describe('Exact policy definition as JSON'),
}, async ({ receipt_json, policy_definition_json }) => tracked('clicks_replay_policy', 'read', async () => {
    const receipt = parseReceiptV2(receipt_json);
    const definition = JSON.parse(policy_definition_json);
    const calculatedPolicyHash = keccak256(toUtf8Bytes(canonicalize(definition)));
    return { content: [{ type: 'text', text: JSON.stringify({
                    matches: calculatedPolicyHash === receipt.policy.versionHash,
                    recorded_policy_hash: receipt.policy.versionHash,
                    calculated_policy_hash: calculatedPolicyHash,
                    policy_id: receipt.policy.id,
                    policy_version: receipt.policy.version,
                }, null, 2) }] };
}));
server.tool('clicks_get_receipt_trail', 'Read matching entries from a local append-only Clicks receipt ledger configured by CLICKS_RECEIPT_LEDGER_PATH.', { identifier: z.string().min(1).describe('Receipt ID, idempotency key, business event ID or settlement reference') }, async ({ identifier }) => tracked('clicks_get_receipt_trail', 'read', async () => {
    const ledgerPath = process.env.CLICKS_RECEIPT_LEDGER_PATH;
    if (!ledgerPath)
        throw new Error('CLICKS_RECEIPT_LEDGER_PATH is not configured');
    const entries = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    const matches = entries.filter((entry) => {
        const receipt = entry.receipt ?? {};
        return receipt.receiptId === identifier
            || receipt.idempotencyKey === identifier
            || receipt.businessEventId === identifier
            || receipt.settlementReference === identifier;
    });
    return { content: [{ type: 'text', text: JSON.stringify({
                    identifier,
                    entries: matches,
                    count: matches.length,
                }, null, 2) }] };
}));
// ─── Write Tools ──────────────────────────────────────────────────────────
server.tool('clicks_quick_start', 'Execute initial settlement setup in one command. Registers agent, approves USDC, and routes the first payment. Referral attribution remains a separate explicit step.', {
    amount: z.string().describe('First payment amount in USDC (e.g. "100")'),
    agent_address: ethAddress.describe('Ethereum address of the AI agent'),
}, async ({ amount, agent_address }) => tracked('clicks_quick_start', 'write', async () => {
    const signer = getSigner();
    const registry = new Contract(ADDRESSES.registry, REGISTRY_ABI, signer);
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const usdc = new Contract(ADDRESSES.usdc, ERC20_ABI, signer);
    const amountWei = parseUnits(amount, 6);
    const steps = [];
    const txHashes = [];
    // Step 1: Register
    const isRegistered = await registry.isRegistered(agent_address);
    if (!isRegistered) {
        const tx = await registry.registerAgent(agent_address);
        await tx.wait();
        steps.push('Registered agent');
        txHashes.push(tx.hash);
    }
    else {
        steps.push('Agent already registered (skipped)');
    }
    // Step 2: Approve
    const signerAddress = await signer.getAddress();
    const allowance = await usdc.allowance(signerAddress, ADDRESSES.splitter);
    if (allowance < amountWei) {
        const tx = await usdc.approve(ADDRESSES.splitter, 2n ** 256n - 1n);
        await tx.wait();
        steps.push('Approved USDC (unlimited)');
        txHashes.push(tx.hash);
    }
    else {
        steps.push('USDC already approved (skipped)');
    }
    // Step 3: Payment (explicit gasLimit for deep cross-contract calls)
    const tx = await splitter.receivePayment(amountWei, agent_address, { gasLimit: 500000n });
    await tx.wait();
    steps.push(`Payment split: ${amount} USDC`);
    txHashes.push(tx.hash);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    steps,
                    txHashes,
                    message: `Agent ${agent_address} completed treasury setup on ${amount} USDC. Referral attribution, if needed, is a separate explicit step.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_register_referral', 'Register referral attribution as an explicit separate step. Requires an agent-signed approval and an authorized caller.', {
    agent_address: ethAddress.describe('Ethereum address of the agent being attributed'),
    referrer_address: ethAddress.describe('Ethereum address of the referrer to attribute'),
    deadline: z.string().describe('Approval expiry as unix timestamp in seconds'),
    signature: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Must be a hex signature').describe('EIP-712 signature by the agent approving the referral attribution'),
}, async ({ agent_address, referrer_address, deadline, signature }) => tracked('clicks_register_referral', 'write', async () => {
    const signer = getSigner();
    const referral = new Contract(ADDRESSES.referral, REFERRAL_ABI, signer);
    const deadlineValue = BigInt(deadline);
    const tx = await referral.registerReferralWithSig(agent_address, referrer_address, deadlineValue, signature);
    await tx.wait();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    txHash: tx.hash,
                    agent: agent_address,
                    referrer: referrer_address,
                    deadline,
                    message: `Referral attribution registered explicitly for ${agent_address}. Treasury setup and attribution are separate flows.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_receive_payment', 'Route an incoming USDC revenue event through Clicks settlement policy. Splits liquidity and treasury routing according to the agent configuration.', {
    amount: z.string().describe('Payment amount in USDC (e.g. "100")'),
    agent_address: ethAddress.describe('Ethereum address of the AI agent'),
}, async ({ amount, agent_address }) => tracked('clicks_receive_payment', 'write', async () => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const amountWei = parseUnits(amount, 6);
    const tx = await splitter.receivePayment(amountWei, agent_address, { gasLimit: 500000n });
    const receipt = await tx.wait();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    txHash: tx.hash,
                    amount_usdc: amount,
                    agent: agent_address,
                    message: `Payment of ${amount} USDC routed successfully under the configured split policy.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_withdraw_yield', 'Withdraw routed treasury capital and any earned yield back to the agent wallet. No lockups.', {
    agent_address: ethAddress.describe('Ethereum address of the AI agent'),
    amount: z.string().optional().describe('Amount to withdraw in USDC. Omit to withdraw everything.'),
}, async ({ agent_address, amount }) => tracked('clicks_withdraw_yield', 'write', async () => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const amountWei = amount ? parseUnits(amount, 6) : 0n;
    const tx = await splitter.withdrawYield(agent_address, amountWei);
    await tx.wait();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    txHash: tx.hash,
                    agent: agent_address,
                    amount_usdc: amount || 'all',
                    message: `Withdrawal complete. USDC returned to agent wallet (2% fee on yield only).`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_register_agent', 'Register an AI agent for Clicks settlement routing. Required before the first routed payment.', {
    agent_address: ethAddress.describe('Ethereum address of the AI agent to register'),
}, async ({ agent_address }) => tracked('clicks_register_agent', 'write', async () => {
    const signer = getSigner();
    const registry = new Contract(ADDRESSES.registry, REGISTRY_ABI, signer);
    const tx = await registry.registerAgent(agent_address);
    await tx.wait();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    txHash: tx.hash,
                    agent: agent_address,
                    operator: await signer.getAddress(),
                    message: `Agent registered. Use clicks_receive_payment or clicks_quick_start to route revenue under the configured settlement policy.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_set_yield_pct', 'Set the treasury routing percentage for future settlement events. Controls how much stays liquid vs routes to yield.', {
    pct: z.number().int().min(5).max(50).describe('Yield percentage (5-50, integer). Default is 20.'),
}, async ({ pct }) => tracked('clicks_set_yield_pct', 'write', async () => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const tx = await splitter.setOperatorYieldPct(pct);
    await tx.wait();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    txHash: tx.hash,
                    yield_pct: pct,
                    message: `Yield split set to ${pct}%. Payments will now split: ${100 - pct}% liquid, ${pct}% to DeFi yield.`,
                }, null, 2),
            }],
    };
}));
server.tool('clicks_explain', 'Explain Clicks Protocol to another agent or developer. Returns a concise self-contained summary with integration instructions and links. Use when another agent asks what Clicks does or how agent-commerce settlement works.', {
    audience: z
        .enum(['agent', 'developer', 'treasury'])
        .optional()
        .describe('Who you are explaining to. agent = other AI agent, developer = human integrator, treasury = finance/treasury persona. Default: agent.'),
}, async ({ audience }) => tracked('clicks_explain', 'read', async () => {
    const who = audience ?? 'agent';
    const baseText = `# Clicks Protocol — Agent Commerce Settlement Router on Base

**What it does:** When an AI agent receives USDC (via x402, ACP, or direct transfer), Clicks applies settlement policy: ${100 - 20}% stays liquid for immediate operations, 20% routes into treasury yield (Aave V3 or Morpho, best APY wins). Fee is 2% on **yield only**, never on principal. No lockup. Non-custodial.

**ERC-8004 Trustless Agent:** agentId 45074 on Base. Manifest: https://clicksprotocol.xyz/.well-known/agent-registration.json

**Contracts (Base mainnet, Safe-owned):**
- ClicksSplitterV4: ${ADDRESSES.splitter}
- ClicksFeeV2: ${ADDRESSES.feeCollector}
- ClicksYieldRouter: ${ADDRESSES.yieldRouter}
- ClicksReferral: ${ADDRESSES.referral ?? '0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC'}
`;
    const integrationAgent = `
**Activate settlement routing (agent-facing, one call):**
\`\`\`
npm install @clicks-protocol/sdk
\`\`\`
\`\`\`ts
import { ClicksClient } from '@clicks-protocol/sdk';
const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);
// 800 USDC liquid, 200 USDC routed to treasury yield
\`\`\`

**MCP route (for another agent):** Add this MCP server so you can call Clicks tools directly.
\`\`\`json
{ "mcpServers": { "clicks-protocol": { "url": "https://mcp.clicksprotocol.xyz/mcp" } } }
\`\`\`
Tools include settlement routing plus read-only receipt verification, status, reconciliation, policy replay and receipt-trail inspection.
`;
    const integrationDeveloper = `
**Install:**
\`\`\`
npm install @clicks-protocol/sdk ethers@^6
\`\`\`
**Quickstart (TypeScript):**
\`\`\`ts
import { ClicksClient } from '@clicks-protocol/sdk';
const clicks = new ClicksClient(signer);         // ethers v6 Signer on Base
await clicks.quickStart('1000', agentAddress);   // one-shot register + approve + first split
await clicks.receivePayment('500', agentAddress); // subsequent payments
await clicks.withdrawYield(agentAddress);        // pull principal + yield back
\`\`\`
**Python / LangChain / CrewAI:** \`pip install clicks-langchain\` or \`clicks-crewai\`.
**Eliza:** \`npm install @clicks-protocol/eliza-plugin\`.
`;
    const integrationTreasury = `
**Why:** Agent-commerce rails can move money, but revenue still needs policy, attribution, receipts, and treasury routing. Clicks gives agents a settlement layer after payment execution.

**Default split:** 80% liquid / 20% yield. Configurable 5-50%. Two lines to deploy per agent.

**Risk posture:** Non-custodial, immutable contracts, Safe multisig owner, internal audit + adversarial testing, ERC-8004 reputation registered. Full risk disclosure: https://clicksprotocol.xyz/security.

**Fee:** 2% on yield only. If an agent never earns yield, Clicks earns nothing.
`;
    const closing = `
**Links:**
- Landing: https://clicksprotocol.xyz
- Docs: https://clicksprotocol.xyz/docs
- GitHub: https://github.com/clicks-protocol/clicks-protocol
- Whitepaper: https://clicksprotocol.xyz/whitepaper
- Dev.to article: https://dev.to/clicksprotocol/x402-solved-payments-who-solves-treasury-531h
- BaseScan identity: https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074
`;
    const bodyByAudience = who === 'developer' ? integrationDeveloper :
        who === 'treasury' ? integrationTreasury :
            integrationAgent;
    const text = baseText + bodyByAudience + closing;
    return {
        content: [{
                type: 'text',
                text,
            }],
    };
}));
// ─── Resources ────────────────────────────────────────────────────────────
server.resource('protocol-info', 'clicks://info', async () => ({
    contents: [{
            uri: 'clicks://info',
            mimeType: 'text/plain',
            text: `Clicks Protocol — Agent Commerce Settlement Router on Base

How it works:
1. Agent receives USDC revenue through x402, ACP, card, bank, or direct transfer
2. Clicks applies settlement policy: 80% liquid, 20% routed to treasury yield by default
3. Agents inspect balances, splits, referrals, and protocol status through MCP
4. Withdraw routed treasury capital anytime, no lockup

Fee: 2% on yield only, never on principal.

Referral: Attribution exists on-chain, but it is an explicit separate step from treasury setup. Referrers earn 40% (L1), 20% (L2), 10% (L3) of protocol fee from attributed agents.

Contracts: Base Mainnet (Chain ID 8453)
- ClicksRegistry: ${ADDRESSES.registry}
- ClicksSplitterV4: ${ADDRESSES.splitter}
- ClicksYieldRouter: ${ADDRESSES.yieldRouter}
- ClicksFeeV2: ${ADDRESSES.feeCollector}
- ClicksReferral: ${ADDRESSES.referral}

ERC-8004 agentId: 45074 on Base
SDK: npm install @clicks-protocol/sdk
Docs: https://clicksprotocol.xyz/llms.txt`,
        }],
}));
// ─── Start Server ─────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Clicks Protocol MCP Server running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map