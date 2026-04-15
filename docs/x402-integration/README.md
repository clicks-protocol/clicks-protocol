# Clicks Protocol x402 Integration Guide

> Yield infrastructure for AI agents on Base x402 payments

## Overview

Clicks Protocol provides **autonomous yield infrastructure** for AI agents using Base's x402 payment standard. When your agent makes or receives x402 payments, Clicks automatically:

1. **Routes 20% to yield strategies** - Earn APY on a portion of payments
2. **Keeps 80% liquid** - Immediate availability for agent operations
3. **Accumulates yield in USDC** - Compounding returns over time

### How It Works

```
Agent x402 Payment Flow with Clicks:
1. Agent → x402 API Request
2. API → 402 Payment Required (0.001 USDC)
3. Agent → Pays 0.001 USDC via Wallet
   ├── 0.0008 USDC (80%) → Liquid for immediate use
   └── 0.0002 USDC (20%) → Clicks Yield Strategy
4. Clicks → Earns yield on 20% portion
5. Agent → Can withdraw accumulated yield anytime
```

## Installation

### 1. Install Clicks Protocol Skill

```bash
# From Base Skills (once PR #26 is merged)
npx skills add base/skills@clicks-protocol

# Or directly from GitHub
npx skills add clicks-protocol/skills@clicks-protocol
```

### 2. Configure Your Agent Wallet

Clicks works with any x402-compatible wallet:

#### CDP Agentic Wallet
```bash
npx skills add coinbase/agentic-wallet-skills
# Follow authentication prompts
```

#### Sponge Wallet
```bash
# Set up Sponge Wallet
export SPONGE_API_KEY=your_api_key
```

### 3. Connect Wallet to Clicks

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient({
  chainId: 8453, // Base
  wallet: yourAgentWallet, // CDP or Sponge wallet instance
  yieldPercentage: 20, // Default: 20% to yield
});
```

## Usage

### Automatic Yield on x402 Payments

Once configured, Clicks works automatically:

```bash
# Your agent makes x402 payments as usual
npx awal@latest x402 pay https://api.example.com/data

# Clicks automatically:
# 1. Intercepts the payment
# 2. Routes 20% to yield strategies
# 3. Keeps 80% liquid in wallet
```

### Check Yield Status

```bash
# Check your agent's yield position
npx skills run clicks-protocol status

# Or use the SDK
const status = await clicks.getYieldStatus();
console.log(`APY: ${status.apy}%`);
console.log(`Total Yield: ${status.totalYield} USDC`);
console.log(`Liquid Balance: ${status.liquidBalance} USDC`);
```

### Withdraw Yield

```bash
# Withdraw accumulated yield
npx skills run clicks-protocol withdraw --amount 10.0

# Or programmatically
const tx = await clicks.withdrawYield({
  amount: "10.0", // USDC
  recipient: agentWalletAddress,
});
```

## Integration Examples

### Example 1: Basic x402 Payment with Yield

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { CDPWallet } from '@coinbase/agentic-wallet-sdk';

// 1. Setup wallet
const wallet = new CDPWallet({
  apiKey: process.env.CDP_API_KEY,
});

// 2. Setup Clicks with 20% yield
const clicks = new ClicksClient({
  chainId: 8453,
  wallet,
  yieldPercentage: 20,
});

// 3. Make x402 payment (Clicks intercepts automatically)
const response = await fetch('https://paid-api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  },
});

if (response.status === 402) {
  // Clicks handles payment + yield routing automatically
  const payment = await wallet.pay402(response);
  // 20% routed to yield, 80% stays liquid
}
```

### Example 2: Custom Yield Percentage

```typescript
const clicks = new ClicksClient({
  chainId: 8453,
  wallet,
  yieldPercentage: 30, // 30% to yield, 70% liquid
});

// For high-frequency agents: lower yield percentage
const highFreqClicks = new ClicksClient({
  chainId: 8453,
  wallet,
  yieldPercentage: 10, // 10% to yield, 90% liquid
});
```

### Example 3: Service Provider (Earning Yield)

If you're building an x402 API service:

```typescript
// Your x402 API endpoint
app.post('/api/paid-data', async (req, res) => {
  // 1. Check for payment
  const paymentSig = req.headers['x-payment-signature'];
  if (!paymentSig) {
    return res.status(402).json({
      amount: "0.01",
      asset: "USDC",
      network: "base",
    });
  }

  // 2. Verify payment (Clicks can help here)
  const isValid = await clicks.verifyPayment(paymentSig);
  if (!isValid) {
    return res.status(402).json({
      error: "Invalid payment",
    });
  }

  // 3. Service provider ALSO earns yield on received payments!
  // Clicks routes 20% of YOUR revenue to yield automatically
  const serviceRevenue = "0.01"; // USDC
  const yieldAmount = await clicks.routeToYield(serviceRevenue);

  // 4. Return data
  res.json({ data: "your paid data here" });
});
```

## API Reference

### ClicksClient

```typescript
class ClicksClient {
  constructor(config: {
    chainId: number;
    wallet: WalletInterface;
    yieldPercentage?: number; // 0-100, default: 20
    registryAddress?: string; // Clicks Registry contract
  });

  // Get current yield status
  getYieldStatus(): Promise<YieldStatus>;

  // Withdraw accumulated yield
  withdrawYield(options: {
    amount: string; // USDC amount
    recipient: string; // Wallet address
  }): Promise<TransactionResult>;

  // Verify x402 payment signature
  verifyPayment(signature: string): Promise<boolean>;

  // Manually route funds to yield
  routeToYield(amount: string): Promise<TransactionResult>;
}
```

### YieldStatus Interface

```typescript
interface YieldStatus {
  apy: number; // Current APY percentage
  totalYield: string; // Total USDC earned
  liquidBalance: string; // Available USDC balance
  yieldBalance: string; // USDC in yield strategies
  pendingYield: string; // Yield pending distribution
  lastUpdate: Date; // Last yield calculation
}
```

## Configuration

### Environment Variables

```bash
# Required for SDK
CLICKS_REGISTRY_ADDRESS=0x...  # Clicks Registry on Base
CLICKS_RPC_URL=https://base-mainnet.infura.io/v3/...

# Optional
CLICKS_YIELD_PERCENTAGE=20     # Default yield percentage
CLICKS_MIN_YIELD_AMOUNT=0.001  # Minimum amount to route to yield
```

### Smart Contract Addresses (Base Mainnet)

- **Registry**: `0x...` (Clicks Protocol Registry)
- **Fee Contract**: `0x...` (Fee Distribution)
- **Yield Router**: `0x...` (Yield Strategy Router)
- **Splitter**: `0x...` (80/20 Splitter)

## Troubleshooting

### Common Issues

#### "Payment not intercepted by Clicks"
1. Ensure ClicksClient is initialized with correct wallet
2. Check that yieldPercentage > 0
3. Verify wallet has sufficient USDC balance

#### "Yield not accumulating"
1. Check APY status: `npx skills run clicks-protocol status`
2. Ensure minimum yield amount (0.001 USDC) is reached
3. Verify contract addresses are correct

#### "Withdrawal failed"
1. Check recipient address is valid
2. Ensure sufficient yield balance
3. Verify network gas fees are covered

### Debug Mode

```typescript
const clicks = new ClicksClient({
  chainId: 8453,
  wallet,
  yieldPercentage: 20,
  debug: true, // Enable debug logging
});

// Check debug logs
clicks.on('debug', (message) => {
  console.log('[Clicks Debug]', message);
});
```

## Best Practices

### For High-Frequency Agents
- Set `yieldPercentage: 10-15%` for more liquidity
- Monitor yield accumulation weekly
- Withdraw yield during low-gas periods

### For Service Providers
- Set `yieldPercentage: 20-30%` for revenue optimization
- Implement payment verification with Clicks
- Offer yield statistics to your users

### Security Considerations
1. **Never share private keys** - Clicks uses wallet signatures only
2. **Verify contract addresses** - Use official Clicks addresses
3. **Monitor for updates** - Follow @ClicksProtocol for security updates

## Resources

- **Website**: https://clicksprotocol.xyz
- **GitHub**: https://github.com/clicks-protocol
- **SDK**: https://www.npmjs.com/package/@clicks-protocol/sdk
- **MCP Server**: https://www.npmjs.com/package/@clicks-protocol/mcp-server
- **Discord**: https://discord.gg/clicks-protocol
- **Twitter**: @ClicksProtocol

## Support

- **Documentation**: https://docs.clicksprotocol.xyz
- **Issues**: https://github.com/clicks-protocol/sdk/issues
- **Email**: support@clicksprotocol.xyz

---

**Clicks Protocol** — Yield infrastructure for the agent economy. Automatically earn yield on your x402 payments while maintaining liquidity for agent operations.