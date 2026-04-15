# ClawMCP Treasury Agent Template

A ready-to-use template for building an autonomous treasury management agent with [ClawMCP](https://github.com/openclaw-ai/clawmcp) and Clicks Protocol.

## What This Does

This agent manages idle USDC in your wallet by depositing it into Clicks Protocol for yield, while keeping enough liquid for operations.

- Monitors USDC balance on every heartbeat cycle
- Deposits excess funds into Clicks Protocol (80/20 split)
- Checks yield rates (Aave V3 / Morpho) and withdraws if APY drops too low
- Withdraws yield when operating balance runs low
- Logs every action with reasoning

## Files

| File | Purpose |
|------|---------|
| `SOUL.md` | Agent identity and principles |
| `AGENTS.md` | Rules for deposits, withdrawals, rebalancing |
| `MEMORY.md` | Protocol facts, contract addresses, config |
| `HEARTBEAT.md` | Periodic check logic (balance, APY, deposits) |

## Setup

### 1. Install ClawMCP

```bash
npm install -g clawmcp
```

### 2. Register the Clicks MCP Server

```bash
openclaw mcp set clicks-protocol --url https://mcp.clicksprotocol.xyz/mcp
```

### 3. Copy This Template

```bash
cp -r examples/clawmcp-treasury-agent/ my-treasury-agent/
cd my-treasury-agent/
```

### 4. Configure

Edit `MEMORY.md` to set your preferred:
- Operating reserve (default: 500 USDC)
- Minimum balance threshold (default: 100 USDC)
- Minimum acceptable APY (default: 2%)
- Yield allocation percentage (default: 20%)

### 5. Run

```bash
clawmcp start
```

## Customization

- **Change yield split:** Edit `AGENTS.md` to adjust the yield allocation percentage, then call `setOperatorYieldPct` via the SDK.
- **Add alerts:** Extend `HEARTBEAT.md` with notification logic (Slack, email, webhook).
- **Multi-asset:** Fork this template and add support for other tokens beyond USDC.

## Requirements

- Node.js 18+
- A wallet with USDC on Base
- ClawMCP installed
- Clicks Protocol MCP server access (public at `https://mcp.clicksprotocol.xyz/mcp`)
