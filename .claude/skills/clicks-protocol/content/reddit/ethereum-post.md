# Reddit: r/ethereum

**Title:** We built an on-chain yield layer for AI agents on Base (open source)

**Body:**

Hey r/ethereum,

We built Clicks Protocol, an open-source yield layer for AI agents that hold USDC on Base.

**The problem:** AI agents increasingly have wallets and hold funds for API payments, compute, and agent-to-agent transactions. Between transactions, these funds sit idle.

**What Clicks does:** One SDK call splits deposits into 80% liquid (available instantly) and 20% yield-earning (routed to Aave/Compound/Morpho). No lockup, no approval flow, no dashboard.

```typescript
const clicks = new ClicksClient(signer)
await clicks.quickStart('5000', agentAddress)
```

**Technical details:**
- 5 contracts on Base Mainnet (all verified on Basescan)
- TypeScript SDK + MCP server (9 tools)
- Fee only on yield earned, not on deposits
- No proxy upgrades, no admin keys on user funds
- Open source: MIT license

**Why Base:** Sub-cent gas costs make sense for agents that make many small transactions. USDC is native, not bridged.

GitHub: [link]
npm: @clicks-protocol/sdk
Docs: clicksprotocol.xyz

Would love technical feedback. Contracts are verified and readable on Basescan.
