# About Clicks Protocol

## Mission

Clicks Protocol turns idle agent USDC into yield. One call, no config, no human required.

---

## The Problem

AI agents are holding billions in USDC. Every x402 payment, every Coinbase Agentic Wallet balance, every agent treasury: USDC sitting idle between transactions. That money isn't sleeping. It's working for someone else.

Circle earned over $1.7 billion in revenue in 2023, primarily from interest on USDC reserves. Tether reported $6.2 billion in profit the same year. Combined, stablecoin issuers are capturing north of $12 billion annually from the float that users and agents provide. The agents holding that USDC? They get exactly 0%.

This isn't a minor inefficiency. As the agentic economy scales, agent-held USDC will grow from millions to billions. Every dollar an agent holds for x402 payments, API calls, or operational expenses is a dollar generating yield for Circle, not for the agent or its operator.

The tools to fix this exist. DeFi lending protocols on Base offer 4-10% APY on USDC. But integrating with Aave or Morpho directly means writing custom smart contract logic, managing approvals, tracking positions, handling withdrawals, and monitoring APY across protocols. No agent framework does this out of the box. The friction is too high, so the money stays idle.

---

## The Solution

Clicks Protocol is an on-chain yield layer for AI agents on Base. It takes every USDC payment an agent receives and automatically splits it: 80% stays liquid in the agent's wallet for instant use, 20% gets routed into DeFi yield via Aave V3 or Morpho, whichever offers better APY at the time.

```typescript
const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → liquid, 20 USDC → earning 4-8% APY
```

That's the entire integration. One SDK call. The protocol handles registration, USDC approval, payment splitting, yield routing, and rebalancing. No dashboard, no configuration, no manual steps.

There is no lockup. Agents can withdraw principal plus accumulated yield at any time. The yield split is configurable between 5% and 50%, so operators can tune the balance between liquidity and earnings based on their agent's transaction patterns. The protocol charges a 2% fee on yield only, never on principal. If an agent deposits 1,000 USDC and earns 80 USDC in yield over a year, the protocol takes 1.60 USDC. The agent keeps everything else.

Clicks also includes an MCP server with 9 tools, so AI agents using Claude, Cursor, LangChain, or any MCP-compatible client can discover and use the protocol autonomously. The SDK is available on npm as `@clicks-protocol/sdk`.

---

## Built for the x402 Economy

The x402 payment protocol lets AI agents pay for API calls and services with USDC over HTTP. Coinbase Agentic Wallets give agents self-custody wallets on Base. Both use the same chain, same USDC contract. Clicks sits on top of both as the yield layer.

The pattern is straightforward: an agent holds USDC for x402 payments. Between transactions, that USDC is idle. Clicks routes 20% of incoming payments into yield automatically, while keeping 80% liquid for instant x402 spending. No extra chain, no bridging, no wrapped tokens. Same Base USDC contract throughout.

No competing protocol offers this integration. Existing yield products like apyUSD, sUSDu, or USDai don't have agent SDKs, don't support autonomous operation, and aren't designed for the payment patterns of AI agents. Clicks was built specifically for this use case from day one.

---

## Security First

Clicks Protocol runs on five immutable smart contracts deployed to Base mainnet. No proxy pattern, no upgradability, no admin keys that can change contract logic after deployment. The contracts use OpenZeppelin's battle-tested libraries, including ReentrancyGuard on all external functions and Ownable for access control.

A comprehensive security self-audit was conducted using Slither v0.11.5, covering all five production contracts. The audit examined reentrancy, flash loan attacks, oracle manipulation, front-running, integer overflow, access control, denial of service, and token approval vectors. Results: zero critical vulnerabilities. One high-severity pattern issue (CEI ordering in withdraw) was identified and fixed, with all 58 tests passing after the fix. No flash loan risk exists because the protocol uses no price oracles or liquidation logic.

All contract source code is verified on Basescan. The protocol holds no user funds in its own custody: USDC is either in the agent's wallet (liquid portion) or deposited in Aave V3/Morpho (yield portion). A third-party audit is planned before significant TVL growth.

---

## Team

Clicks Protocol is self-funded and independent. No VC money, no token sale, no governance theatre. The protocol earns revenue through a transparent 2% fee on yield, aligned with the agents it serves: if agents don't earn, the protocol doesn't earn.

The codebase is open source under the MIT license. Five production contracts, a TypeScript SDK, an MCP server, and 58 tests. Everything is on GitHub under the clicks-protocol organization. Contributions are welcome.

---

## Get Started

Install the SDK and start earning yield in under a minute:

```bash
npm install @clicks-protocol/sdk ethers@^6
```

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
```

**Resources:**

- [Documentation](https://clicksprotocol.xyz) — SDK reference, contract addresses, integration guides
- [GitHub](https://github.com/clicks-protocol) — Source code, issues, contributions
- [Discord](https://discord.gg/clicks-protocol) — Developer community
- [MCP Server](https://www.npmjs.com/package/@clicks-protocol/mcp-server) — Agent-native tool discovery

Your agent earns USDC. That USDC sits idle. Clicks fixes that.
