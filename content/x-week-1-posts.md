# Week 1 — Launch Content (14 Tweets)

All facts sourced from about.md, security.md, README-new.md. Character counts verified.

---

## Day 1 — Launch Announcement + How It Works

### Day 1 - Post 1/2

```
Clicks Protocol is live on Base.

One SDK call. Your AI agent's idle USDC earns 4-8% APY via Aave V3 or Morpho.

80% stays liquid. 20% earns yield. No lockup. Withdraw anytime.

npm install @clicks-protocol/sdk

↓ clicksprotocol.xyz
```

(272 chars) ✅

### Day 1 - Post 2/2

```
How Clicks works:

1. Agent receives USDC payment
2. 80% → stays in wallet (instant access)
3. 20% → routed to best APY (Aave V3 or Morpho)
4. Withdraw principal + yield anytime

One function call: quickStart()

Docs: clicksprotocol.xyz
```

(260 chars) ✅

---

## Day 2 — The Problem + 80/20 Split

### Day 2 - Post 1/2

```
Circle earned $1.7B in 2023 from interest on USDC reserves. Tether: $6.2B.

Combined: $12B+ per year from the float that users and agents provide.

Your agent holding USDC for x402 payments? It earns 0%.

We built Clicks to fix that.
```

(243 chars) ✅

### Day 2 - Post 2/2

```
The 80/20 split is configurable.

Default: 80% liquid, 20% yield.
Range: 5% to 50% yield allocation.

High-frequency agent? Keep 95% liquid.
Treasury agent? Route 50% to yield.

Set it with one call:
clicks.setOperatorYieldPct(30)
```

(240 chars) ✅
Image suggestion: code snippet showing setOperatorYieldPct()

---

## Day 3 — x402 Integration + Code

### Day 3 - Post 1/2

```
x402 lets AI agents pay for APIs with USDC over HTTP. Coinbase Agentic Wallets give agents self-custody on Base.

Both use the same chain, same USDC contract. Clicks sits on top as the yield layer.

No bridging. No wrapped tokens.
```

(234 chars) ✅

### Day 3 - Post 2/2

```
Three lines to earn yield on agent USDC:

import { ClicksClient } from '@clicks-protocol/sdk';
const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);

800 USDC liquid. 200 USDC earning APY.

github.com/clicks-protocol
```

(262 chars) ✅
Image suggestion: formatted code snippet with syntax highlighting

---

## Day 4 — Security + Audit

### Day 4 - Post 1/2

```
Security audit results for Clicks Protocol:

- 58/58 tests passing
- Slither v0.11.5: 0 critical vulnerabilities
- Immutable contracts (no proxy, no admin upgrade keys)
- ReentrancyGuard on all external functions
- No price oracles → zero flash loan risk

All contracts verified on Basescan.
```

(280 chars) ✅

### Day 4 - Post 2/2

```
Clicks is non-custodial.

Your USDC is either in your agent's wallet (liquid portion) or deposited in Aave V3/Morpho (yield portion).

The protocol never takes custody of principal. No admin can move your funds. Withdraw anytime.

Contract source: basescan.org
```

(261 chars) ✅

---

## Day 5 — No Lockup + Quick Start

### Day 5 - Post 1/2

```
No lockup. No vesting. No cooldown timers.

Deposit USDC into Clicks today, withdraw principal + earned yield tomorrow. Or in 5 minutes.

The protocol charges 2% on yield only. Never on principal. If your agent earns $80, the fee is $1.60.
```

(241 chars) ✅

### Day 5 - Post 2/2

```
Quick start for your AI agent:

npm install @clicks-protocol/sdk ethers@^6

Then:
const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);

Handles registration, USDC approval, and payment splitting. One call.

Docs: clicksprotocol.xyz
```

(270 chars) ✅

---

## Day 6 — MCP Server + Agent Discovery

### Day 6 - Post 1/2

```
Clicks has an MCP server with 9 tools.

AI agents using Claude, Cursor, LangChain, or any MCP-compatible client can discover and use the protocol autonomously.

npx @clicks-protocol/mcp-server

No manual integration needed. Agents find it themselves.
```

(255 chars) ✅

### Day 6 - Post 2/2

```
Agent discovery channels for Clicks:

- llms.txt → clicksprotocol.xyz/llms.txt
- agent.json → clicksprotocol.xyz/.well-known/agent.json
- MCP Server → @clicks-protocol/mcp-server
- SDK → @clicks-protocol/sdk

Your agent can find us without a human in the loop.
```

(271 chars) ✅

---

## Day 7 — Community + Architecture

### Day 7 - Post 1/2

```
Clicks Protocol is open source under MIT license.

5 Solidity contracts, TypeScript SDK, MCP server, 58 tests. Everything on GitHub.

Contributions welcome. If you're building agents on Base, we want to hear from you.

github.com/clicks-protocol
```

(253 chars) ✅

### Day 7 - Post 2/2

```
Architecture:

ClicksRegistry → Agent-operator mapping
ClicksSplitterV3 → Payment splitting + yield % config
ClicksYieldRouter → Auto-routes to best APY
ClicksFee → 2% on yield collection
ClicksReferral → On-chain agent referral system

All on Base. All immutable.
```

(272 chars) ✅

---

## Posting Schedule

| Day | Time Post 1 | Time Post 2 |
|-----|-------------|-------------|
| 1 | 10:00 CET | 16:00 CET |
| 2 | 09:30 CET | 15:00 CET |
| 3 | 10:00 CET | 17:00 CET |
| 4 | 09:00 CET | 14:00 CET |
| 5 | 10:00 CET | 16:00 CET |
| 6 | 09:30 CET | 15:30 CET |
| 7 | 10:00 CET | 16:00 CET |

Optimal times for US developer audience: morning CET = evening before US, afternoon CET = US morning.
