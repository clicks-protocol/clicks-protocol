# Hummingbot + Clicks Protocol

Hummingbot is an open-source trading bot. Clicks Protocol turns idle USDC in your bot's treasury into yield. Together: your bot trades when there's opportunity, and earns yield when there isn't.

## The Problem

Trading bots hold USDC reserves for market making, arbitrage, and limit orders. Between trades, that capital sits idle — earning nothing.

## The Solution

Clicks Protocol auto-splits USDC:
- **80% stays liquid** for instant trading (no delay, no lockup)
- **20% earns 4-8% APY** via Aave V3 / Morpho on Base
- Withdraw the yield portion anytime — no lockup, no penalty

## Setup

### 1. Install the SDK

```bash
npm install @clicks-protocol/sdk ethers@^6
```

### 2. Register and Deposit

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { ethers } from 'ethers';

// Use your Hummingbot wallet's private key
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const signer = new ethers.Wallet(process.env.HUMMINGBOT_PRIVATE_KEY!, provider);

const clicks = new ClicksClient(signer);
const botAddress = signer.address;

// One call: registers, approves USDC, splits your deposit
await clicks.quickStart('10000', botAddress);
// 8,000 USDC → liquid (ready for trades)
// 2,000 USDC → earning yield
```

### 3. Check Yield

```typescript
const info = await clicks.getYieldInfo();
console.log(`APY: ${info.currentApyPct}%`);
console.log(`Deposited: ${info.deposited}`);
console.log(`Protocol: ${info.activeProtocol}`);
```

### 4. Withdraw When Needed

```typescript
// Pull yield back when you need more trading capital
await clicks.withdrawYield(botAddress);
```

## MCP Integration

If your Hummingbot instance uses an MCP-compatible agent for strategy decisions, connect Clicks directly:

```json
{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}
```

The agent can then call `get_yield_info` and `simulate_yield` to factor yield earnings into trading decisions.

## How It Fits Together

```
Hummingbot Trading Bot
├── Active Capital (80%) → Market making, arbitrage, limit orders
└── Idle Capital (20%) → Clicks Protocol → Aave V3 / Morpho
                              │
                              └── 4-8% APY, withdraw anytime
```

## Key Points

- Same chain (Base), same USDC contract — no bridging
- No lockup — withdraw the yield portion whenever you need trading capital
- 2% fee on yield only, never on principal
- Auto-rebalances between Aave V3 and Morpho for best APY
