# agent-treasury

Treasury management utilities for AI agents.

Your agent earns USDC. It sits idle. You earn 0%.

`agent-treasury` fixes that. Track balances across chains, compare DeFi yields in real time, get alerts when funds go idle, and activate earning with one call.

## Install

```bash
npm install agent-treasury ethers
```

## Quick Start

```ts
import { AgentTreasury } from "agent-treasury";

const treasury = new AgentTreasury();
const report = await treasury.report("0xYourAgentWallet");
console.log(report.recommendation);
// → "500.00 USDC is idle. Best yield: 4.2% APY (~$21.00/year). Consider activating yield."
```

## Features

### Balance Tracker

Check USDC balances across Base, Ethereum, Arbitrum, and Optimism in a single call.

```ts
const balances = await treasury.getBalances("0x...");
console.log(balances.totalFormatted); // "1250.00"
console.log(balances.balances);       // per-chain breakdown
```

### Yield Finder

Compare live supply APY across Aave V3, Compound V3, and Morpho on Base.

```ts
const yields = await treasury.compareYields();
console.log(yields.best);
// → { protocol: "aave-v3", supplyAPY: 4.2, asset: "USDC", chain: "base" }
```

### Idle Balance Detection

Get alerted when USDC sits idle too long.

```ts
// One-time check
const idle = await treasury.getIdleBalance("0x...");

// Continuous monitoring
treasury.watchIdle("0x...", (alert) => {
  console.log(`${alert.totalIdleFormatted} USDC idle for ${alert.idleDurationHuman}`);
});
```

Configure thresholds:

```ts
const treasury = new AgentTreasury({
  idleThresholdUsdc: 50,          // Alert when > 50 USDC
  idleTimeMs: 30 * 60 * 1000,    // idle for > 30 minutes
});
```

### Activate Yield

Put idle USDC to work with one call.

```ts
import { ClicksActivator } from "agent-treasury";

const clicks = new ClicksActivator();
const result = await clicks.deposit(signer, "500.00");
// → Deposits 500 USDC into optimized yield strategy
```

### Full Report

Get a complete treasury overview: balances, yields, idle status, and recommendations.

```ts
const report = await treasury.report("0x...");
// {
//   balances: { totalFormatted: "500.00", ... },
//   yields: { best: { protocol: "aave-v3", supplyAPY: 4.2 }, ... },
//   idleStatus: { idleDurationHuman: "3d 2h", ... },
//   recommendation: "500.00 USDC is idle. Best yield: 4.2% APY..."
// }
```

## Configuration

```ts
const treasury = new AgentTreasury({
  // Custom RPC endpoints
  rpcs: {
    base: "https://your-base-rpc.com",
    ethereum: "https://your-eth-rpc.com",
  },
  // Track specific chains only
  chains: ["base", "ethereum"],
  // Yield protocols to compare
  protocols: ["aave-v3", "compound-v3"],
  // Idle detection settings
  idleThresholdUsdc: 100,
  idleTimeMs: 60 * 60 * 1000,
});
```

## API

| Method | Description |
|--------|-------------|
| `getBalances(address)` | Multi-chain USDC balances |
| `compareYields()` | Compare DeFi APYs on Base |
| `getBestYield()` | Get highest current APY |
| `getIdleBalance(address)` | Check if balance is idle |
| `watchIdle(address, callback)` | Monitor for idle balances |
| `unwatchIdle(address)` | Stop monitoring |
| `report(address)` | Full treasury report |

## How It Works

1. **Balance Tracker** reads USDC balances via public RPC on Base, Ethereum, Arbitrum, and Optimism
2. **Yield Finder** queries Aave V3 and Compound V3 smart contracts on Base for current supply rates
3. **Idle Detector** compares balance snapshots over time to detect stagnant funds
4. **Activate** (optional) connects to Clicks Protocol to deposit idle USDC into yield strategies

Balance tracking and yield comparison work entirely standalone. The Clicks integration is an optional feature for agents that want automated yield activation.

## License

MIT

---

Powered by [Clicks Protocol](https://clicksprotocol.xyz)
