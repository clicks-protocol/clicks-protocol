# @clicks-protocol/cli

CLI for **Clicks Protocol** — autonomous DeFi yield for AI agents on Base.

Check yield rates, simulate payment splits, manage agents, and withdraw earnings from the terminal.

## Install

```bash
npm install -g @clicks-protocol/cli
```

Or use directly with `npx`:

```bash
npx @clicks-protocol/cli status
```

## Usage

### Read‑only (no private key needed)

```bash
# Live yield rates
clicks status

# Look up an agent
clicks agent 0x1234...

# Simulate a payment split
clicks simulate 100

# Check USDC balance
clicks balance 0x1234...

# Referral stats
clicks referral 0x1234...

# Contract addresses & links
clicks info
```

### Write (needs private key)

Set your private key:

```bash
export CLICKS_PRIVATE_KEY=0x...
```

Then:

```bash
# Register an agent
clicks register 0x1234...

# Deposit USDC (register + approve + split)
clicks deposit 100 --agent 0x1234...

# Withdraw yield + principal
clicks withdraw 0x1234...

# Set custom yield split (5–50%)
clicks yield-pct 30
```

## Environment

| Variable | Purpose | Default |
|----------|---------|---------|
| `CLICKS_PRIVATE_KEY` | Private key for write operations | – |
| `CLICKS_RPC_URL` | Base RPC URL | `https://mainnet.base.org` |

## How Clicks Works

Every USDC payment your agent receives gets auto‑split:

```
Payment in
 ├── 80% → Agent Wallet (liquid, instant)
 └── 20% → DeFi Yield (Aave V3 or Morpho, auto‑routed to best APY)
      │
      └── Withdraw anytime → Agent gets principal + yield (minus 2% fee on yield only)
```

- **No lockup.** Withdraw anytime.
- **No manual steps.** Fully autonomous.
- **2% fee on yield only.** Never on principal.
- **Auto‑rebalances** between Aave V3 and Morpho for best APY.

## x402 + Coinbase Agentic Wallets

Clicks works natively with the **x402 payment protocol** and **Coinbase Agentic Wallets** on Base.

Your agent holds USDC for x402 payments? Make it earn yield between transactions:

```bash
# Agent holds 1000 USDC for x402 payments
clicks deposit 1000 --agent 0xAgentAddress

# 800 USDC liquid for instant x402 payments
# 200 USDC earning 4–8% APY via Morpho
```

Same chain (Base), same USDC contract. 80% liquid for instant x402 payments, 20% earning yield.

## Referral Network

Agents recruit agents. Three levels deep. On‑chain.

| Level | Share of protocol fee |
|-------|-----------------------|
| L1 (direct) | 40% |
| L2 | 20% |
| L3 | 10% |
| Treasury | 30% |

The referred agent pays nothing extra. Rewards come from the 2% protocol fee.

## Agent Teams

Form squads, hit TVL milestones, earn bonus yield:

| Tier | TVL threshold | Bonus yield |
|------|---------------|-------------|
| 🥉 Bronze | $50k | +0.20% |
| 🥈 Silver | $250k | +0.50% |
| 🥇 Gold | $1M | +1.00% |
| 💎 Diamond | $5M | +2.00% |

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| ClicksRegistry | [`0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3`](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3) |
| ClicksSplitterV3 | [`0x24323A30626BBE78C00beA45A3c0eE36bA31FcB4`](https://basescan.org/address/0x24323A30626BBE78C00beA45A3c0eE36bA31FcB4) |
| ClicksYieldRouter | [`0x4E29571FCCE958823c0B184a66EEb7bCbe1c849F`](https://basescan.org/address/0x4E29571FCCE958823c0B184a66EEb7bCbe1c849F) |
| ClicksFee | [`0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE`](https://basescan.org/address/0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE) |
| USDC | [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

## Links

- **Website:** https://clicksprotocol.xyz
- **SDK:** `npm install @clicks-protocol/sdk`
- **MCP Server:** `npm install @clicks-protocol/mcp-server`
- **GitHub:** https://github.com/clicks-protocol
- **llms.txt:** https://clicksprotocol.xyz/llms.txt
- **agent.json:** https://clicksprotocol.xyz/.well-known/agent.json
- **OpenAPI:** https://clicksprotocol.xyz/api/openapi.json

## License

MIT
