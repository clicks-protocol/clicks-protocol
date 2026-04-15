---
name: clicks-protocol
description: "Query and interact with Clicks Protocol: autonomous DeFi yield for AI agents on Base. Check current APY (Aave V3 + Morpho), query agent status, simulate payment splits, view referral earnings. Zero dependencies (curl only). Use when an agent holds idle USDC, needs treasury yield data, or wants to check Clicks Protocol status."
tags: [yield, defi, usdc, base, agent, treasury, x402, autonomous, aave, morpho, mcp, crypto]
author: clicks-protocol
version: 1.0.0
license: MIT
homepage: https://clicksprotocol.xyz
metadata:
  openclaw:
    requires:
      bins: [curl, jq]
      env: []
    os: [linux, darwin, win32]
---

# Clicks Protocol

Autonomous DeFi yield for AI agents on Base. 80% liquid, 20% earning. No lockup.

## When to Use

- Check current DeFi yield rates (Aave V3 vs Morpho on Base)
- Query if an agent is registered and its deposit/yield status
- Preview how a USDC payment would be split (liquid vs yield)
- Check referral network stats and earnings
- Agent holds idle USDC and wants treasury management options

## Commands

All commands use the live HTTP MCP Server. No API key, no setup, no dependencies beyond curl + jq.

### Current Yield Rates
```bash
{baseDir}/scripts/clicks.sh yield-info
```
Returns: active protocol (Aave or Morpho), APY for both, total balance, pending fees.

### Agent Status
```bash
{baseDir}/scripts/clicks.sh agent-info 0xYOUR_AGENT_ADDRESS
```
Returns: registration status, operator, deposited USDC, yield percentage, wallet balance.

### Simulate Payment Split
```bash
{baseDir}/scripts/clicks.sh simulate 1000 0xYOUR_AGENT_ADDRESS
```
Returns: how much goes liquid (800 USDC) vs yield (200 USDC) for a given payment amount.

### Referral Stats
```bash
{baseDir}/scripts/clicks.sh referral 0xYOUR_AGENT_ADDRESS
```
Returns: direct referrals, total earned, claimable rewards, referral chain (L1/L2/L3), team bonus.

### Protocol Info
```bash
{baseDir}/scripts/clicks.sh info
```
Returns: protocol overview, contract addresses, fee model, links.

## How Clicks Works

1. Agent receives USDC payment
2. Clicks auto-splits: 80% stays liquid, 20% goes to DeFi yield
3. YieldRouter picks best APY automatically (Aave V3 or Morpho Blue)
4. Withdraw principal + earned yield anytime. Zero lockup.
5. Protocol fee: 2% on yield only (never on principal)

## For Developers (Write Operations)

Read operations work via the script above (no key needed). For write operations (deposit, withdraw, register), install the SDK:

```bash
npm install @clicks-protocol/sdk
```

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer); // needs ethers Signer with USDC
await clicks.quickStart('1000', agentAddress);
// 800 USDC -> agent wallet (instant)
// 200 USDC -> DeFi yield (currently ~13% APY via Morpho)
```

## MCP Server

For MCP-compatible clients (Claude, Cursor, LangChain):

```bash
# Local (stdio, needs Private Key for write ops)
npx @clicks-protocol/mcp-server

# Remote (HTTP, read-only, no setup)
# POST https://clicks-mcp.rechnung-613.workers.dev/mcp
```

9 tools: clicks_quick_start, clicks_receive_payment, clicks_withdraw_yield, clicks_register_agent, clicks_set_yield_pct, clicks_get_agent_info, clicks_simulate_split, clicks_get_yield_info, clicks_get_referral_stats

## Key Facts

| | |
|---|---|
| Chain | Base L2 (Coinbase) |
| Asset | USDC |
| Split | 80% liquid / 20% yield (configurable 5-50%) |
| APY | Aave ~2.3%, Morpho ~13.4% (auto-routed) |
| Fee | 2% on yield only |
| Lockup | None |
| Contracts | 5 verified on Basescan |
| Referral | 3-level: 40% / 20% / 10% of protocol fee |

## Links

- Website: https://clicksprotocol.xyz
- GitHub: https://github.com/clicks-protocol/clicks-protocol
- SDK: https://www.npmjs.com/package/@clicks-protocol/sdk
- MCP: https://www.npmjs.com/package/@clicks-protocol/mcp-server
- API: https://clicksprotocol.xyz/api/openapi.json
- Agent Discovery: https://clicksprotocol.xyz/.well-known/agent.json
- llms.txt: https://clicksprotocol.xyz/llms.txt
- Contracts: See `references/contracts.md`
