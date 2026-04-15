# How x402 Agents Earn Yield on Idle USDC with Clicks Protocol

*Your AI agent gets paid via x402. Then the USDC sits there doing nothing. Here's how to fix that.*

## The Problem: 400K+ Agents, 0% Yield

The x402 HTTP payment protocol changed how AI agents get paid. Instead of subscriptions or API keys, agents receive USDC directly for every request they serve. A single x402 header, a Base transaction, done.

But there's a gap nobody's talking about: what happens to the money after it lands?

Right now, the answer is nothing. An agent earns 500 USDC serving requests on Monday. By Friday, those funds are still sitting in the same wallet, earning exactly 0%. Multiply that by 400,000 x402-equipped agents and you have hundreds of millions in idle capital generating zero return.

Traditional finance would call this a cash drag. In DeFi, it's an opportunity.

## The x402 Payment Flow (Before Clicks)

Here's a typical x402 interaction:

```
Client                    Agent Server               Base
  |--- GET /api/data ------->|                         |
  |<-- 402 + payment info ---|                         |
  |--- x402 payment header --|--- USDC transfer ------>|
  |<-- 200 + response -------|                         |
```

The agent receives USDC into its wallet. Then... it waits for the next request. Between requests, the USDC is idle. Over days and weeks, this adds up.

## Enter Clicks Protocol: Autonomous Yield on Base

Clicks Protocol sits between the payment receipt and the idle waiting. When USDC arrives, it gets split automatically:

- **80% stays liquid** in the agent's wallet, available instantly for operations
- **20% is deposited** into Aave V3 or Morpho on Base, earning 4-8% APY

No human intervention. No treasury management decisions. The split happens on-chain, governed by audited smart contracts.

```
Client --- x402 payment ---> Agent Wallet
                                |
                          Clicks Splitter
                           /          \
                     80% liquid    20% yield
                     (wallet)     (Aave/Morpho)
```

## Integration: 5 Lines of Code

Using the Clicks SDK with an x402 agent server:

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { ethers } from 'ethers';

// Initialize once
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const signer = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);
const clicks = new ClicksClient(signer);

// In your x402 payment handler:
async function onPaymentReceived(amount: string, agentAddress: string) {
  // First time: registers agent + approves USDC + splits payment
  // Subsequent: just splits the payment
  await clicks.quickStart(amount, agentAddress);
}
```

That's it. Every x402 payment now automatically earns yield on the idle portion.

## What Happens On-Chain

When `quickStart` executes:

1. **ClicksRegistry** checks if the agent is registered. If not, registers it.
2. **ClicksSplitterV3** splits the USDC: 80% goes directly to the agent wallet, 20% goes to the yield router.
3. **ClicksYieldRouter** deposits the 20% into the highest-yielding protocol (Aave V3 or Morpho) on Base.
4. **ClicksFee** takes a 2% fee on yield earned (not on principal). The agent keeps 98% of earnings.

All five contracts are deployed and verified on Base Mainnet:

| Contract | Address |
|----------|---------|
| ClicksRegistry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` |
| ClicksSplitterV4 | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` |
| ClicksYieldRouter | `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` |
| ClicksFeeV2 | `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5` |
| ClicksReferral | `0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC` |

## The Numbers

Let's model a typical x402 agent:

| Metric | Value |
|--------|-------|
| Monthly revenue | 2,000 USDC |
| Average idle balance | 1,500 USDC |
| Yield portion (20%) | 300 USDC deposited |
| APY (Aave V3 current) | ~5.5% |
| Annual yield earned | ~16.50 USDC |
| Protocol fee (2% of yield) | ~0.33 USDC |
| Net yield to agent | ~16.17 USDC |

For a single agent, this is modest. For a fleet of 1,000 agents each processing 2,000 USDC/month, that's over 16,000 USDC in annual yield from capital that was previously earning zero.

For the entire x402 ecosystem of 400,000+ agents, even conservative estimates put the addressable idle capital in the hundreds of millions.

## Checking Your Status

Agents can monitor their yield position:

```typescript
// Get full treasury status
const info = await clicks.getAgentInfo(agentAddress);
console.log(`Registered: ${info.isRegistered}`);
console.log(`Deposited: ${info.deposited}`);

// Get yield balance details
const balance = await clicks.getAgentYieldBalance(agentAddress);
console.log(`Principal: ${balance.deposited}`);
console.log(`Current value: ${balance.currentValue}`);
console.log(`Yield earned: ${balance.yieldEarned}`);

// Get current protocol APY
const yieldInfo = await clicks.getYieldInfo();
const activeAPY = yieldInfo.activeProtocol === 1
  ? yieldInfo.aaveAPY
  : yieldInfo.morphoAPY;
console.log(`Current APY: ${Number(activeAPY) / 100}%`);
```

## Withdrawing When Needed

When an agent needs maximum liquidity (e.g., large outgoing payment):

```typescript
// Withdraw all yield + principal back to wallet
await clicks.withdrawYield(agentAddress);
// All funds now liquid. Re-activate anytime with quickStart.
```

## Framework Support

Clicks integrates with the major AI agent frameworks:

- **LangChain**: `from clicks_langchain import get_clicks_tools`
- **CrewAI**: `from clicks_crewai import get_all_tools`
- **Eliza (ai16z)**: `import { clicksPlugin } from "@clicks-protocol/eliza-plugin"`
- **Coinbase AgentKit**: PR #1107 submitted

Plus an MCP Server for any MCP-compatible agent.

## Why This Matters for x402

x402 solved the payment layer for AI agents. Clicks solves the treasury layer. Together, they create a complete financial stack:

1. **x402** handles earning: agents get paid in USDC for services
2. **Clicks** handles idle capital: USDC earns yield between transactions
3. **Base** handles settlement: low fees make micro-splits economical

The result: AI agents that don't just earn money, but make their money work for them. Autonomously, on-chain, with no human in the loop.

## Get Started

- SDK: `npm install @clicks-protocol/sdk`
- MCP Server: `npm install @clicks-protocol/mcp-server`
- Docs: [clicksprotocol.xyz](https://clicksprotocol.xyz)
- GitHub: [clicks-protocol/clicks-protocol](https://github.com/clicks-protocol/clicks-protocol)
- 58/58 tests passing, MIT licensed, fully open source

---

*Clicks Protocol is live on Base Mainnet. Your idle USDC is waiting.*
