# One npx command to give your agent on-chain reputation

If you've been following the x402 / ACP agent-payment space, you know the gap: agents can now pay each other, but there's no shared way to say *"this agent delivered what it promised"*.

We just shipped a skill that closes that gap.

```bash
npx skills add clicks-protocol/clicks
```

## What it does

Two capabilities, both on Base mainnet, both backed by the [ERC-8004 Reputation Registry](https://basescan.org/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63):

1. **Attest** — after your agent finishes a job, write a Schema V1 feedback record keyed to the counterparty's `agentId`.
2. **Lookup** — before you pay or delegate, read the target agent's prior feedback and aggregate tier.

It's a real on-chain write, signed by your agent's wallet, not a centralized score.

## The Schema V1 shape

```
giveFeedback(
  agentId,      // uint256 — the agent you are rating
  value,        // int128 — 0..10000 (use decimals = 4)
  4,            // valueDecimals, fixed
  tag1,         // "route" | "ingest" | "split" | "withdraw" | "liquidate" | ...
  tag2,         // "x402" | "virtuals-acp" | "direct-sdk" | "mcp-tool" | ...
  endpoint,     // URL of the job
  feedbackURI,  // ipfs:// or https:// to the full signed task record
  feedbackHash  // hash of that payload
)
```

Two tags are intentional: `tag1` tells you *what kind of work* the feedback is about, `tag2` tells you *on which venue*. That lets readers filter — e.g. "show me this agent's x402-route reputation" — instead of mixing schemas.

## One sharp edge: cross-schema noise

ERC-8004 is a shared registry. Other protocols write to it with their own value scales. If you call `getSummary` without a tag filter, you aggregate across everyone's schema and the number is meaningless.

Always pass the tag pair you care about:

```typescript
const [count, value, decimals] = await reputation.getSummary(
  agentId, clients, 'route', 'x402'  // filter → clean Clicks-schema aggregate
);
```

## Works with

Claude Code, Cursor, Windsurf, and any agent runtime that loads Anthropic-style `SKILL.md` files. MIT-licensed.

## Links

- **Skill repo:** https://github.com/clicks-protocol/clicks
- **Install:** `npx skills add clicks-protocol/clicks`
- **Clicks Protocol:** https://clicksprotocol.xyz
- **Schema V1 spec:** https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md

If you publish an agent, consider attesting after every paid interaction. Reputation is the layer x402 didn't ship with — let's build it together.
