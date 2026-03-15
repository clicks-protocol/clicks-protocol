# Hacker News: Show HN

**Title:** Show HN: Clicks Protocol, an autonomous yield layer for AI agent wallets (TypeScript SDK)

**Comment:**

Hi HN,

I built Clicks Protocol because AI agents are starting to hold money (USDC on Base) and there was no simple way for them to earn yield on idle funds without a human in the loop.

The SDK is one function call:

    const clicks = new ClicksClient(signer)
    await clicks.quickStart('5000', agentAddress)

This splits deposits: 80% stays liquid for the agent to spend, 20% gets routed to yield strategies (Aave, Compound, Morpho on Base). No lockup, withdrawable anytime.

Technical stack:
- 5 Solidity contracts on Base Mainnet (verified)
- TypeScript SDK (ethers.js v6)
- MCP server with 9 tools for LLM-native agents
- No proxy patterns, no admin keys on user funds

Why I built this: I run a business where AI agents handle payments. The agents hold USDC between transactions. I wanted them to earn yield without me logging into anything.

Code: [GitHub link]
SDK: npm install @clicks-protocol/sdk
Site: clicksprotocol.xyz

Happy to answer questions about the architecture, the yield routing, or the contracts.
