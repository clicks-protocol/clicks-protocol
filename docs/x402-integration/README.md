# Clicks Protocol x402 Integration Guide

> Settlement routing for x402-linked agent revenue on Base

## Overview

Clicks can sit **after** an x402 payment flow. It does not automatically intercept x402 payments on its own.

Use it like this:

1. Your agent or service receives USDC on Base
2. You decide which inflows should follow the Clicks treasury policy
3. You call Clicks explicitly through the SDK or MCP tools
4. Clicks applies the 80/20 settlement split
   - 80% stays liquid
   - 20% routes into yield

That makes Clicks a post-payment settlement layer, not a drop-in x402 replacement.

## What Is Real Today

- `ClicksClient` is initialized with a signer or provider
- `quickStart(amount, agentAddress)` handles first-time setup plus first split
- `receivePayment(amount, agentAddress)` applies the same split on later inflows
- `getAgentInfo()`, `simulateSplit()`, `getYieldInfo()`, and `getAgentYieldBalance()` are available for reads
- `withdrawYield(agentAddress, amount?)` withdraws from the yield side

## What This Guide Does Not Claim

- no automatic x402 interception
- no built-in x402 payment verification
- no `getYieldStatus()` helper
- no `verifyPayment()` helper
- no `routeToYield()` helper

If you need those patterns, build them in your own application logic around the current SDK surface.

## Installation

```bash
npm install @clicks-protocol/sdk
```

## SDK Setup

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const clicks = new ClicksClient(signer);
```

## First-Time Setup

Use `quickStart()` once when an agent is first being configured for Clicks:

```typescript
const agentAddress = '0xYourAgentAddress';

const result = await clicks.quickStart('1000', agentAddress);
console.log(result);
```

What happens in the current SDK path:

1. register the agent if needed
2. approve USDC if allowance is missing
3. split the first payment through Clicks

## Recurring x402-Linked Revenue

If your x402 stack settles revenue into a Base wallet, apply Clicks explicitly after receipt:

```typescript
async function settleAgentRevenue(amount: string, agentAddress: string) {
  await clicks.receivePayment(amount, agentAddress);
}
```

This is the clean mental model:

- `x402` handles payment authorization and transfer flow
- `Clicks` handles treasury settlement once USDC is available on Base

## Read Operations

```typescript
const agent = await clicks.getAgentInfo(agentAddress);
const preview = await clicks.simulateSplit('250', agentAddress);
const yieldInfo = await clicks.getYieldInfo();
const balance = await clicks.getAgentYieldBalance(agentAddress);
```

Useful fields:

- `getAgentInfo()` -> registration, operator, deposited principal, yield percentage
- `simulateSplit()` -> liquid amount, yield amount, active yield percentage
- `getYieldInfo()` -> global protocol APY snapshot and balances
- `getAgentYieldBalance()` -> deposited principal, estimated current value, earned yield

## Withdrawals

```typescript
await clicks.withdrawYield(agentAddress);
```

Or specify an amount:

```typescript
await clicks.withdrawYield(agentAddress, '10');
```

## Service Provider Example

If you run a paid API that settles revenue in Base USDC:

```typescript
app.post('/api/paid-data', async (req, res) => {
  const amount = '0.01';
  const agentAddress = '0xYourAgentAddress';

  // Your app verifies and settles the x402 payment.
  // After funds are actually available, apply Clicks.
  await clicks.receivePayment(amount, agentAddress);

  res.json({ ok: true });
});
```

## MCP Option

For MCP-compatible agents:

```bash
npx @clicks-protocol/mcp-server
```

Useful tools:

- `clicks_quick_start`
- `clicks_receive_payment`
- `clicks_get_agent_info`
- `clicks_simulate_split`
- `clicks_get_yield_info`
- `clicks_withdraw_yield`

## Live Base Addresses

- `ClicksRegistry`: `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3`
- `ClicksSplitterV4`: `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8`
- `ClicksYieldRouter`: `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD`
- `ClicksFeeV2`: `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5`
- `ClicksReferral`: `0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC`

## Recommended Positioning

The safest current sentence is:

> x402 can get the agent paid. Clicks decides how that USDC is settled after receipt.

That is accurate to the current code surface.
