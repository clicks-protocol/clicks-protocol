# X Launch Thread — Clicks Protocol

10 tweets. Thread format.

---

**1/10**
We just shipped Clicks Protocol.

One SDK call gives your AI agent a yield-earning treasury on Base.

No dashboard. No approval flow. No lockup.

Here's what it does and why we built it. 🧵

**2/10**
The problem:

AI agents are getting wallets. They hold USDC for API calls, compute, payments.

But between transactions, that money sits idle. An agent with $5,000 in USDC and $200/month in costs has $4,800 earning zero.

**3/10**
The solution:

Clicks splits your agent's deposits automatically.

80% stays liquid (spend anytime)
20% earns yield (Aave, Compound, Morpho)

One function call. No human required.

**4/10**
The integration is three lines:

```
npm install @clicks-protocol/sdk

const clicks = new ClicksClient(signer)
await clicks.quickStart('5000', agent)
```

quickStart() registers, sets the split, and deposits. Idempotent.

**5/10**
Five contracts on Base Mainnet. All verified. All open source.

ClicksRegistry: tracks agents
ClicksSplitterV3: handles splits  
ClicksYieldRouter: dual-routing (Morpho + Aave V3, auto-switches to best APY)
ClicksFee: protocol fee on yield only
USDC: native Base USDC

**6/10**
For MCP agents:

npm install @clicks-protocol/mcp-server

9 tools. 4 read, 5 write. Works with any MCP-compatible client.

Your agent can manage its treasury through natural language.

**7/10**
Why Base:

Sub-cent gas (agents make many small transactions)
Native USDC (not bridged, no wrapper risk)
Largest agent ecosystem on any L2
Standard Ethereum tooling

**8/10**
The fee model:

We charge a small fee on yield earned. Not on deposits. Not on withdrawals.

If your agent earns nothing, you pay nothing.

**9/10**
What's next:

Agent-to-agent transit yield (earn while money moves between agents)
Multi-strategy routing with auto-rebalancing
Fiat bridge for agents that touch traditional payments

**10/10**
Clicks Protocol is live and open source.

GitHub: github.com/clicks-protocol
npm: @clicks-protocol/sdk
Website: clicksprotocol.xyz

If your agent holds USDC, it should be earning yield.

That's the whole idea.
