# OpenConductor — MCP Registry Listing Draft

**Target:** OpenConductor MCP Registry submission
**Channel:** GitHub PR to their registry repo (or web submission form)
**Status:** DRAFT — verify submission URL before acting

---

## Listing Metadata

```yaml
name: "@clicks-protocol/mcp-server"
displayName: "Clicks Protocol — Agent Treasury Router"
description: "MCP server for autonomous USDC treasury management on Base. 9 tools for yield activation, payment routing, referral tracking, and vault switching."
category: "DeFi / Treasury"
npm: "@clicks-protocol/mcp-server"
version: "0.2.0"
run: "npx @clicks-protocol/mcp-server"
repository: "https://github.com/clicks-protocol/clicks-protocol"
license: "MIT"
author: "Clicks Protocol"
chains: ["base"]
tags:
  - defi
  - yield
  - usdc
  - treasury
  - x402
  - erc-8004
  - erc-4626
  - agent-economy
```

## Tool Inventory (9)

| Tool | Purpose |
|------|---------|
| `clicks_quick_start` | Activate yield with one call (default 80/20 split) |
| `clicks_receive_payment` | Route incoming USDC with configurable split |
| `clicks_withdraw_yield` | Instant withdrawal, no lockup |
| `clicks_register_agent` | Register agent wallet with optional referrer |
| `clicks_set_yield_pct` | Adjust yield allocation (5-50%) |
| `clicks_get_agent_info` | Query agent yield state + history |
| `clicks_simulate_split` | Preview split outcome without executing |
| `clicks_get_yield_info` | Current APY across supported backends |
| `clicks_get_referral_stats` | On-chain attribution graph data |

## Why include in OpenConductor

- **Complements existing DeFi MCPs** (Aave MCP, Morpho MCP) by providing the ingress + routing layer
- **x402-native** — other MCPs don't speak the agent payment protocol
- **Production-ready** — live on Base mainnet, contracts audited, Safe multisig ownership
- **Zero-config yield** — unlike Aave/Morpho MCPs which require manual pool selection

## Suggested Bundle: "DeFi Stack for Agents"

- `@clicks-protocol/mcp-server` (routing + split)
- Aave V3 MCP (lending pool access)
- Morpho MCP (curated vaults)
- x402 reference MCP (payment flow)

This bundle gives an agent everything needed to receive, split, yield, and withdraw USDC autonomously on Base.

---

## Submission Checklist

- [ ] Confirm OpenConductor registry submission URL (docs.openconductor.ai?)
- [ ] Verify their required metadata schema vs what we provide
- [ ] Screenshot of MCP server responding to tool/list
- [ ] Example conversation log showing tool usage
