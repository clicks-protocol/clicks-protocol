# Clicks Protocol — Eliza Plugin

On-chain yield management plugin for Eliza (ai16z) agents on Base.

Powered by [Clicks Protocol](https://clicksprotocol.xyz)

## What It Does

Enables Eliza agents to autonomously earn yield on idle USDC. The plugin splits funds 80/20 via Clicks Protocol: 80% stays liquid for agent operations, 20% earns 4-8% APY on-chain on Base.

## Installation

```bash
npm install @clicks-protocol/eliza-plugin
```

Or add to your Eliza project:

```bash
cd your-eliza-project
npm install @clicks-protocol/eliza-plugin @clicks-protocol/sdk ethers
```

## Configuration

Add to your Eliza agent's `.env` or settings:

```env
CLICKS_PRIVATE_KEY=your-agent-wallet-private-key
CLICKS_RPC_URL=https://mainnet.base.org
```

## Quick Start

```typescript
import { clicksPlugin } from "@clicks-protocol/eliza-plugin";

// Add to your Eliza agent configuration
const agent = {
  name: "TreasuryBot",
  plugins: [clicksPlugin],
  settings: {
    CLICKS_PRIVATE_KEY: process.env.CLICKS_PRIVATE_KEY,
    CLICKS_RPC_URL: process.env.CLICKS_RPC_URL,
  },
};
```

## Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| `ACTIVATE_YIELD` | "Put 5000 USDC to work" | Split USDC 80/20 to earn yield |
| `WITHDRAW_YIELD` | "Withdraw my yield" | Pull all funds back to wallet |
| `CHECK_YIELD_BALANCE` | "What's my yield status?" | View liquid vs. yield balances |
| `GET_CLICKS_APY` | "What's the current APY?" | Get current yield rate |

## Providers

The plugin includes two providers that automatically inject context into the agent's state:

- **walletBalanceProvider**: Injects current wallet balance, liquid/deposited amounts, and accrued yield
- **yieldInfoProvider**: Injects current APY rate, split ratio, and protocol info

These providers run automatically so the agent always has up-to-date treasury context.

## Example Conversations

```
User: I have 10000 USDC doing nothing. Can you earn some yield on it?
Agent: Activating yield on 10000 USDC via Clicks Protocol.
       Liquid (80%): 8000 USDC — available immediately
       Yield (20%): 2000 USDC — earning ~6% APY on Base
       TX: 0x...

User: What's my yield status?
Agent: Clicks Protocol Treasury Status:
       Liquid USDC: 8000 (available now)
       Deposited: 2000 (earning yield)
       Accrued Yield: 12.50
       Current APY: 5.8%

User: Pull everything back, I need it all.
Agent: Withdrawing all yield and deposits from Clicks Protocol.
       Amount returned: 2012.50 USDC
       All funds are now liquid in your wallet.
```

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| Registry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` |
| Splitter | `0x24323A30626BBE78C00beA45A3c0eE36bA31FcB4` |
| YieldRouter | `0x4E29571FCCE958823c0B184a66EEb7bCbe1c849F` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## License

MIT

---

Built for autonomous AI agents. Powered by [Clicks Protocol](https://clicksprotocol.xyz).
