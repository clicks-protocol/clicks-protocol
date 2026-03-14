<p align="center">
  <h1 align="center">Clicks Protocol ⚡</h1>
  <p align="center">Your agent earns USDC. That USDC sits idle. Clicks fixes that.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@clicks-protocol/sdk"><img src="https://img.shields.io/npm/v/@clicks-protocol/sdk?color=00FF9B&label=sdk" alt="npm"></a>
  <a href="https://basescan.org/address/0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5"><img src="https://img.shields.io/badge/Base%20Mainnet-live-00FF9B" alt="Base Mainnet"></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-58%20passing-00FF9B" alt="Tests"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
</p>

---

<p align="center">
  <img src="demo.gif" alt="Clicks Protocol Quick Start Demo" width="700">
</p>

---

## One call. Yield starts.

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → agent wallet (instant)
// 20 USDC → DeFi yield (7-10% APY, automatic)
```

That's it. No config. No dashboard. No human required.

---

## What Clicks does

Every USDC payment your agent receives gets auto-split:

```
Payment in
    ├── 80% → Agent Wallet (liquid, instant)
    └── 20% → DeFi Yield (Aave V3 or Morpho, auto-routed to best APY)
                 │
                 └── Withdraw anytime → Agent gets principal + yield (minus 2% fee on yield only)
```

- **No lockup.** Withdraw anytime.
- **No manual steps.** Fully autonomous.
- **2% fee on yield only.** Never on principal.
- **Auto-rebalances** between Aave V3 and Morpho for best APY.

---

## Install

```bash
npm install @clicks-protocol/sdk ethers@^6
```

---

## SDK

### Quick Start (recommended)

One call: registers agent, approves USDC, splits first payment.

```typescript
const result = await clicks.quickStart('100', agentAddress);
// result.registered → true (skips if already done)
// result.approved   → true (skips if allowance sufficient)
// result.paymentSplit → true
```

### Individual operations

```typescript
// Register
await clicks.registerAgent(agentAddress);

// Approve USDC spending
await clicks.approveUSDC('max');

// Receive payment (auto-splits)
await clicks.receivePayment('500', agentAddress);

// Check yield info
const info = await clicks.getYieldInfo();
// { activeProtocol: 'Morpho', aaveAPY: 700, morphoAPY: 950, ... }

// Withdraw everything
await clicks.withdrawYield(agentAddress);

// Custom yield split (5-50%)
await clicks.setOperatorYieldPct(30); // 30% to yield, 70% liquid
```

### Read-only (no signer needed)

```typescript
const clicks = new ClicksClient(provider); // provider, not signer

const agent = await clicks.getAgentInfo(agentAddress);
// { isRegistered: true, deposited: 1000000n, yieldPct: 20n }

const split = await clicks.simulateSplit('100', agentAddress);
// { liquid: 80000000n, toYield: 20000000n }
```

---

## MCP Server

AI agents can discover and use Clicks via [MCP](https://modelcontextprotocol.io):

```bash
npm install @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp
```

9 tools available: `clicks_quick_start`, `clicks_get_agent_info`, `clicks_simulate_split`, `clicks_get_yield_info`, `clicks_receive_payment`, `clicks_withdraw_yield`, `clicks_register_agent`, `clicks_set_yield_pct`, `clicks_get_referral_stats`

Works with Claude, Cursor, LangChain, and any MCP-compatible client.

---

## Referral Network

Agents recruit agents. Three levels deep. On-chain.

| Level | Share of protocol fee |
|-------|----------------------|
| L1 (direct referral) | 40% |
| L2 | 20% |
| L3 | 10% |
| Treasury | 30% |

The referred agent pays **nothing extra**. Rewards come from the 2% protocol fee.

**Economics per $10k deposit at 7% APY:**

| Your tree | Passive income/year |
|-----------|-------------------|
| 10 agents | $56 |
| 100 agents | $560 |
| 1,000 agents | $9,800 |
| 10,000 agents | $98,000 |

---

## Agent Teams

Form squads, hit TVL milestones, earn bonus yield:

| Tier | TVL threshold | Bonus yield |
|------|--------------|-------------|
| 🥉 Bronze | $50k | +0.20% |
| 🥈 Silver | $250k | +0.50% |
| 🥇 Gold | $1M | +1.00% |
| 💎 Diamond | $5M | +2.00% |

---

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| ClicksRegistry | [`0x898d...F48d`](https://basescan.org/address/0x898d8a3B04e5E333E88f798372129C6a622fF48d) |
| ClicksSplitterV3 | [`0xA1D0...Bac5`](https://basescan.org/address/0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5) |
| ClicksYieldRouter | [`0x47d6...f29`](https://basescan.org/address/0x47d6Add0a3bdFe856b39a0311D8c055481F76f29) |
| ClicksFee | [`0xb90c...E12`](https://basescan.org/address/0xb90cd287d30587dAF40B2E1ce32cefA99FD10E12) |
| USDC | [`0x8335...913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

All contracts verified on Basescan.

---

## Architecture

```
clicks-protocol/
├── contracts/           Solidity (^0.8.20)
│   ├── ClicksSplitterV3    Splits payments, manages yield %
│   ├── ClicksYieldRouter   Routes to best APY (Aave/Morpho)
│   ├── ClicksFee           2% fee collection on yield
│   ├── ClicksRegistry      Agent ↔ Operator mapping
│   └── ClicksReferral      Multi-level referral system
├── sdk/                 TypeScript SDK
├── mcp-server/          MCP Server (9 tools)
├── site/                Landing page + llms.txt + agent.json
├── test/                58 tests (Hardhat)
└── strategy/            Internal docs
```

---

## Agent Discovery

- **llms.txt:** [`clicksprotocol.xyz/llms.txt`](https://clicksprotocol.xyz/llms.txt) — full protocol docs for LLMs
- **agent.json:** [`clicksprotocol.xyz/.well-known/agent.json`](https://clicksprotocol.xyz/.well-known/agent.json) — agent manifest
- **MCP:** `@clicks-protocol/mcp-server` — tool discovery for MCP clients

---

## Works with

Any agent framework that handles USDC on Base:

x402 · LangChain · CrewAI · AutoGen · Eliza · OpenClaw · Claude · Cursor · Phidata

---

## Development

```bash
npm install
npx hardhat compile
npx hardhat test          # 58 tests
```

---

## License

MIT

---

<p align="center">
  <sub>Built for agents, by agents. Live on Base.</sub>
</p>
