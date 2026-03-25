#!/usr/bin/env node
/**
 * Clicks Protocol MCP Server
 *
 * Exposes Clicks Protocol operations as MCP tools for AI agents.
 * Any MCP-compatible client (Claude, Cursor, LangChain, etc.) can
 * discover and use these tools to earn yield on idle USDC.
 *
 * Usage:
 *   CLICKS_PRIVATE_KEY=0x... clicks-mcp
 *   CLICKS_RPC_URL=https://mainnet.base.org clicks-mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Contract, JsonRpcProvider, Wallet, parseUnits, formatUnits } from 'ethers';

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
  'function getReferralStats(address agent) external view returns (uint32 directCount, uint256 totalEarned, uint256 claimable, address referrer)',
  'function getReferralChain(address agent) external view returns (address[3])',
  'function claimReferralRewards() external returns (uint256)',
  'function getTeamBonusYield(address agent) external view returns (uint16)',
];

// ─── Addresses (Base Mainnet) ─────────────────────────────────────────────

const ADDRESSES = {
  registry: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
  feeCollector: '0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE',
  yieldRouter: '0x4E29571FCCE958823c0B184a66EEb7bCbe1c849F',
  splitter: '0x24323A30626BBE78C00beA45A3c0eE36bA31FcB4',
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  referral: '', // Will be set after deployment
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function getProvider(): JsonRpcProvider {
  const rpc = process.env.CLICKS_RPC_URL || 'https://mainnet.base.org';
  return new JsonRpcProvider(rpc);
}

function getSigner(): Wallet {
  const key = process.env.CLICKS_PRIVATE_KEY;
  if (!key) throw new Error('CLICKS_PRIVATE_KEY environment variable required for write operations');
  return new Wallet(key, getProvider());
}

function formatUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

// ─── Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'clicks-protocol',
  version: '0.1.0',
});

// ─── Read Tools ───────────────────────────────────────────────────────────

server.tool(
  'clicks_get_agent_info',
  'Get comprehensive info about an AI agent registered with Clicks Protocol: registration status, operator, deposited principal, yield percentage, and USDC balance.',
  { agent_address: z.string().describe('Ethereum address of the AI agent') },
  async ({ agent_address }) => {
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
        type: 'text' as const,
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
  },
);

server.tool(
  'clicks_simulate_split',
  'Preview how a USDC payment would be split for an agent: how much goes to wallet (liquid) and how much to DeFi yield.',
  {
    amount: z.string().describe('Payment amount in USDC (e.g. "100" for 100 USDC)'),
    agent_address: z.string().describe('Ethereum address of the AI agent'),
  },
  async ({ amount, agent_address }) => {
    const provider = getProvider();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, provider);
    const amountWei = parseUnits(amount, 6);
    const [liquid, toYield] = await splitter.simulateSplit(amountWei, agent_address);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          payment_usdc: amount,
          liquid_usdc: formatUSDC(liquid),
          to_yield_usdc: formatUSDC(toYield),
          explanation: `${formatUSDC(liquid)} USDC goes to agent wallet immediately, ${formatUSDC(toYield)} USDC is routed to DeFi yield.`,
        }, null, 2),
      }],
    };
  },
);

server.tool(
  'clicks_get_yield_info',
  'Get current yield protocol information: active protocol (Aave or Morpho), APYs, total balance, and total deposited across all agents.',
  {},
  async () => {
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

    const protocolNames: Record<number, string> = { 0: 'None', 1: 'Aave V3', 2: 'Morpho' };

    return {
      content: [{
        type: 'text' as const,
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
  },
);

server.tool(
  'clicks_get_referral_stats',
  'Get referral network stats for an agent: direct referrals count, total earned from referrals, claimable rewards, and referral chain.',
  { agent_address: z.string().describe('Ethereum address of the AI agent') },
  async ({ agent_address }) => {
    if (!ADDRESSES.referral) {
      return {
        content: [{ type: 'text' as const, text: 'Referral contract not yet deployed. Coming soon.' }],
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
        type: 'text' as const,
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
  },
);

// ─── Write Tools ──────────────────────────────────────────────────────────

server.tool(
  'clicks_quick_start',
  'One-call setup: register agent, approve USDC, and receive first payment. The fastest way to start earning yield. Skips already-done steps.',
  {
    amount: z.string().describe('First payment amount in USDC (e.g. "100")'),
    agent_address: z.string().describe('Ethereum address of the AI agent'),
    referrer: z.string().optional().describe('Optional: address of the agent who referred you (earns 40% of your protocol fee)'),
  },
  async ({ amount, agent_address, referrer }) => {
    const signer = getSigner();
    const registry = new Contract(ADDRESSES.registry, REGISTRY_ABI, signer);
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const usdc = new Contract(ADDRESSES.usdc, ERC20_ABI, signer);
    const amountWei = parseUnits(amount, 6);
    const steps: string[] = [];
    const txHashes: string[] = [];

    // Step 1: Register
    const isRegistered = await registry.isRegistered(agent_address);
    if (!isRegistered) {
      const tx = await registry.registerAgent(agent_address);
      await tx.wait();
      steps.push('Registered agent');
      txHashes.push(tx.hash);
    } else {
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
    } else {
      steps.push('USDC already approved (skipped)');
    }

    // Step 3: Payment
    const tx = await splitter.receivePayment(amountWei, agent_address);
    await tx.wait();
    steps.push(`Payment split: ${amount} USDC`);
    txHashes.push(tx.hash);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          steps,
          txHashes,
          message: `Agent ${agent_address} is now earning yield on ${amount} USDC. Yield is automatic — no further action needed.`,
        }, null, 2),
      }],
    };
  },
);

server.tool(
  'clicks_receive_payment',
  'Split a USDC payment for an agent: 80% liquid to wallet, 20% to DeFi yield. Agent must be registered first.',
  {
    amount: z.string().describe('Payment amount in USDC (e.g. "100")'),
    agent_address: z.string().describe('Ethereum address of the AI agent'),
  },
  async ({ amount, agent_address }) => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const amountWei = parseUnits(amount, 6);
    const tx = await splitter.receivePayment(amountWei, agent_address);
    const receipt = await tx.wait();

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          txHash: tx.hash,
          amount_usdc: amount,
          agent: agent_address,
          message: `Payment of ${amount} USDC split successfully. ~80% to wallet, ~20% earning yield.`,
        }, null, 2),
      }],
    };
  },
);

server.tool(
  'clicks_withdraw_yield',
  'Withdraw yield + principal for an agent. Only the agent, their operator, or contract owner can withdraw.',
  {
    agent_address: z.string().describe('Ethereum address of the AI agent'),
    amount: z.string().optional().describe('Amount to withdraw in USDC. Omit to withdraw everything.'),
  },
  async ({ agent_address, amount }) => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const amountWei = amount ? parseUnits(amount, 6) : 0n;
    const tx = await splitter.withdrawYield(agent_address, amountWei);
    await tx.wait();

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          txHash: tx.hash,
          agent: agent_address,
          amount_usdc: amount || 'all',
          message: `Withdrawal complete. USDC returned to agent wallet (2% fee on yield only).`,
        }, null, 2),
      }],
    };
  },
);

server.tool(
  'clicks_register_agent',
  'Register a new AI agent with Clicks Protocol. The caller becomes the operator.',
  {
    agent_address: z.string().describe('Ethereum address of the AI agent to register'),
  },
  async ({ agent_address }) => {
    const signer = getSigner();
    const registry = new Contract(ADDRESSES.registry, REGISTRY_ABI, signer);
    const tx = await registry.registerAgent(agent_address);
    await tx.wait();

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          txHash: tx.hash,
          agent: agent_address,
          operator: await signer.getAddress(),
          message: `Agent registered. Now use clicks_receive_payment or clicks_quick_start to start earning yield.`,
        }, null, 2),
      }],
    };
  },
);

server.tool(
  'clicks_set_yield_pct',
  'Set custom yield split percentage for the calling operator. Controls how much of each payment goes to DeFi yield vs agent wallet.',
  {
    pct: z.number().min(5).max(50).describe('Yield percentage (5-50). Default is 20.'),
  },
  async ({ pct }) => {
    const signer = getSigner();
    const splitter = new Contract(ADDRESSES.splitter, SPLITTER_ABI, signer);
    const tx = await splitter.setOperatorYieldPct(pct);
    await tx.wait();

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          txHash: tx.hash,
          yield_pct: pct,
          message: `Yield split set to ${pct}%. Payments will now split: ${100 - pct}% liquid, ${pct}% to DeFi yield.`,
        }, null, 2),
      }],
    };
  },
);

// ─── Resources ────────────────────────────────────────────────────────────

server.resource(
  'protocol-info',
  'clicks://info',
  async () => ({
    contents: [{
      uri: 'clicks://info',
      mimeType: 'text/plain',
      text: `Clicks Protocol — Autonomous DeFi Yield for AI Agent Treasuries

How it works:
1. Agent receives USDC payment
2. Clicks auto-splits: 80% to wallet, 20% to DeFi yield (Aave V3 or Morpho)
3. Agent earns 7-10% APY on idle treasury automatically
4. Withdraw anytime, no lockup

Fee: 2% on yield only, never on principal.

Referral: Recruit agents → earn 40% (L1), 20% (L2), 10% (L3) of their protocol fee.

Contracts: Base Mainnet (Chain ID 8453)
- ClicksRegistry: ${ADDRESSES.registry}
- ClicksSplitterV3: ${ADDRESSES.splitter}
- ClicksYieldRouter: ${ADDRESSES.yieldRouter}
- ClicksFee: ${ADDRESSES.feeCollector}

SDK: npm install @clicks-protocol/sdk
Docs: https://clicksprotocol.xyz/llms.txt`,
    }],
  }),
);

// ─── Start Server ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Clicks Protocol MCP Server running on stdio');
}

main().catch(console.error);
