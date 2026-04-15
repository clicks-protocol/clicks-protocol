# Thread: Why AI Agents Need Yield

**Format:** Educational thread, 11 tweets
**When to post:** Week 1, Day 3 (Wednesday) morning slot
**All facts sourced from about.md and security.md**

---

### Tweet 1/11

```
AI agents are holding billions in idle USDC.

Every x402 payment balance. Every Coinbase Agentic Wallet. Every agent treasury.

That money generates yield for someone. Just not for the agent.

A thread on the $12B problem no one talks about. 🧵
```

### Tweet 2/11

```
Circle earned $1.7 billion in revenue in 2023. Primarily from interest on USDC reserves.

Tether reported $6.2 billion in profit the same year.

Combined, stablecoin issuers capture north of $12 billion annually from the float that users and agents provide.
```

### Tweet 3/11

```
The agents holding that USDC? They get exactly 0%.

As the agentic economy scales, agent-held USDC will grow from millions to billions. Every dollar an agent holds for x402 payments or API calls is a dollar generating yield for Circle, not for the agent or its operator.
```

### Tweet 4/11

```
The tools to fix this already exist. DeFi lending protocols on Base offer 4-10% APY on USDC.

But integrating with Aave or Morpho directly means: custom smart contract logic, managing approvals, tracking positions, handling withdrawals, monitoring APY.

No agent framework does this.
```

### Tweet 5/11

```
The friction is too high, so the money stays idle.

We built Clicks Protocol to remove that friction entirely.
```

### Tweet 6/11

```
Clicks is an on-chain yield layer for AI agents on Base.

It takes USDC and splits it automatically:
→ 80% stays liquid in the agent's wallet
→ 20% gets routed into DeFi yield via Aave V3 or Morpho (whichever offers better APY)

One SDK call. No config.
```

### Tweet 7/11

```
The entire integration:

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);

// 800 USDC → liquid (instant access)
// 200 USDC → earning 4-8% APY

The protocol handles registration, approval, splitting, and yield routing.
```

### Tweet 8/11

```
Key design decisions:

- No lockup. Withdraw principal + yield anytime.
- Yield split configurable: 5% to 50%.
- 2% fee on yield only. Never on principal.
- Non-custodial. No admin can move your funds.
- Immutable contracts. No proxy pattern, no upgrade keys.
```

### Tweet 9/11

```
Security: 58/58 tests passing. Slither audit: 0 critical vulnerabilities. ReentrancyGuard on all external functions. No price oracles means zero flash loan risk.

All contract source verified on Basescan. Third-party audit planned before significant TVL.
```

### Tweet 10/11

```
Clicks also ships an MCP server with 9 tools.

AI agents using Claude, Cursor, LangChain, or any MCP-compatible client can discover and use the protocol autonomously.

Agent discovery via llms.txt, agent.json, and MCP. No human in the loop.
```

### Tweet 11/11

```
Your agent earns USDC. That USDC sits idle. Clicks fixes that.

npm install @clicks-protocol/sdk

Docs: clicksprotocol.xyz
GitHub: github.com/clicks-protocol
Discord: discord.gg/clicks-protocol

Open source. MIT license. Built for agents, by builders.
```

---

## Thread Posting Notes

- Post tweet 1, then reply to it with each subsequent tweet
- Space tweets 1-2 minutes apart to avoid rate limits
- Pin tweet 1 if using as the primary pinned content
- Add code snippet image to tweet 7
- Each tweet is under 280 characters ✅
