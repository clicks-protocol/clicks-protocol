# Introducing Clicks Protocol

Your AI agent holds USDC. Between tasks, that money does nothing. Clicks changes that.

## The Problem

AI agents are getting wallets. They pay for compute, APIs, data. But most of the time, their funds sit idle. An agent that spends $200/month on API calls might hold $5,000 in USDC. That's $4,800 earning zero.

Treasury management for humans has existed for decades. Sweep accounts, money market funds, overnight lending. For AI agents? Nothing. No SDK exists that lets an agent deposit idle funds and withdraw them when needed, without a human clicking buttons.

## What Clicks Does

Clicks Protocol is an on-chain yield layer for AI agents on Base. One SDK call splits your agent's USDC into two buckets:

- **80% stays liquid.** Your agent can spend it immediately. No delay, no unlock period.
- **20% earns yield.** Routed to on-chain strategies (Aave, Compound, Morpho). Currently 4-10% APY.

The split is automatic. Deposits, withdrawals, yield collection: all happen through the SDK. No dashboard. No approval flow. No human required.

```typescript
import { ClicksClient } from '@clicks-protocol/sdk'

const clicks = new ClicksClient(signer)
await clicks.quickStart('5000', agentAddress)
// Done. 80% liquid, 20% earning yield.
```

## How It Works

Five contracts on Base Mainnet:

1. **ClicksRegistry** registers agents and tracks their splits
2. **ClicksSplitterV3** handles the 80/20 split on every deposit
3. **ClicksYieldRouter** moves the 20% into yield strategies
4. **ClicksFee** takes a small protocol fee from earned yield (not from principal)
5. **USDC** (native Base USDC) is the only supported asset

When your agent calls `receivePayment()`, funds are automatically split. The liquid portion is available instantly. The yield portion starts earning. When the agent needs more funds, `withdrawYield()` pulls from the yield pool.

No lockup period. No minimum deposit. No governance votes.

## The SDK

Three lines to start:

```bash
npm install @clicks-protocol/sdk
```

```typescript
const clicks = new ClicksClient(signer)
await clicks.quickStart('1000', agentAddress)
```

`quickStart()` is idempotent. Call it once or call it a hundred times. It registers your agent (if not already registered), sets the yield split, and makes the first deposit. One function, three operations.

For MCP-compatible agents, there's `@clicks-protocol/mcp-server` with 9 tools (4 read, 5 write) that plug into any MCP client.

## Why Base

Low gas costs. Sub-cent transactions. USDC is native (not bridged). Coinbase backing means institutional trust. Most AI agent frameworks already support Base through standard Ethereum tooling.

## What's Next

Clicks is open source. The contracts are deployed and verified. The SDK works. The MCP server works.

What we're building next:

- **Agent-to-Agent transit yield.** When Agent A pays Agent B, the funds earn yield while in transit.
- **Multi-strategy routing.** The yield router will support multiple strategies with automatic rebalancing.
- **Fiat bridge.** USDC on-ramp and off-ramp for agents that interact with traditional payment rails.

## Get Started

The code is on GitHub. The SDK is on npm. The contracts are on Base Mainnet.

- GitHub: github.com/clicks-protocol
- npm: @clicks-protocol/sdk
- Contracts: Verified on Basescan
- Docs: clicksprotocol.xyz

If your agent holds USDC, it should be earning yield. That's the whole idea.
