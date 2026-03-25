---
name: clicks-protocol
description: "Autonomous yield for AI agents on Base. Split USDC payments 80/20: 80% liquid, 20% earning 4-8% APY via Aave V3 or Morpho. One SDK call. No lockup. Use when an agent holds idle USDC, needs treasury management, or wants to earn yield on payments."
tags: [yield, defi, usdc, base, agent, treasury, x402, autonomous, aave, morpho, mcp]
author: clicks-protocol
version: 1.0.0
license: MIT
metadata:
  openclaw:
    requires:
      bins: []
      env: []
    os: [linux, darwin, win32]
---

# Clicks Protocol — Autonomous Yield for AI Agents

Your agent holds USDC. Make it earn 4-8% APY while it sits idle.

## When to Use

- Agent receives USDC payments (x402, Coinbase Agentic Wallets, any source)
- Agent has idle USDC between transactions
- You want treasury management for agent wallets
- You need yield on agent holdings without lockup

## Quick Start

```bash
npm install @clicks-protocol/sdk
```

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);
// 800 USDC → liquid (instant access)
// 200 USDC → earning 4-8% APY
```

## How It Works

1. Agent receives USDC payment
2. Clicks splits it: 80% stays liquid, 20% goes to DeFi yield (Aave V3 or Morpho)
3. Withdraw principal + earned yield anytime. No lockup.
4. Protocol fee: 2% on yield only (never on principal)

## MCP Server

AI agents using Claude, Cursor, LangChain, or any MCP client can use Clicks autonomously:

```bash
npx @clicks-protocol/mcp-server
```

9 tools available: clicks_quick_start, clicks_receive_payment, clicks_withdraw_yield, clicks_register_agent, clicks_set_yield_pct, clicks_get_agent_info, clicks_simulate_split, clicks_get_yield_info, clicks_get_referral_stats

## Treasury Utilities

For balance tracking and idle detection without Clicks:

```bash
npm install agent-treasury
```

```typescript
import { AgentTreasury } from 'agent-treasury';

const treasury = new AgentTreasury(provider);
const report = await treasury.report(agentAddress);
// Shows: balances, idle USDC, best yields, recommendation
```

## Key Facts

- Chain: Base L2 (Coinbase)
- Split: 80% liquid / 20% yield (configurable 5-50%)
- APY: 4-8% via Aave V3 or Morpho
- Fee: 2% on yield only
- Lockup: None
- Contracts: 5 immutable, verified on Basescan
- Tests: 58/58 passing
- Security: Slither audited, 0 critical vulnerabilities

## Links

- Website: https://clicksprotocol.xyz
- SDK: https://www.npmjs.com/package/@clicks-protocol/sdk
- MCP Server: https://www.npmjs.com/package/@clicks-protocol/mcp-server
- Treasury Utils: https://www.npmjs.com/package/agent-treasury
- API Spec: https://clicksprotocol.xyz/api/openapi.json
- Agent Discovery: https://clicksprotocol.xyz/.well-known/agent.json
- llms.txt: https://clicksprotocol.xyz/llms.txt
