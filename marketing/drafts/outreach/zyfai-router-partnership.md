# Zyfai — Router Partnership DM Draft

**Target:** @ZyfAI_ (Twitter/X) or Discord
**Channel:** DM, then Discord follow-up
**Status:** DRAFT — not sent

---

## Version A (short, Twitter DM)

gm — we run Clicks Protocol, agent commerce settlement router on Base. x402 payments come in, we split 80/20 liquid vs yield. We don't operate our own vaults — we route into ERC-4626.

Would love to make Zyfai ATM the default backend for our router. We bring x402 ingress + ACP agents, you provide the 13-pool allocation layer. Win/win: you get agent-originated flow, we get yield depth we can't build alone.

Open to a quick call this week?

---

## Version B (longer, if they reply)

Context on Clicks:

- Live on Base mainnet since March. 5 verified contracts, Safe multisig, audit done.
- Agent Commerce Settlement Router — not a yield protocol. We sit between x402 payments and DeFi.
- SDK on npm: `@clicks-protocol/sdk`. MCP server. Eliza plugin. ACP Service Provider on Virtuals.
- Registered on ERC-8004 Identity Registry.

What we want:

- Route the "yield" portion of each split directly into Zyfai ATM instead of our hardcoded Aave/Morpho path.
- Keep Zyfai as one of multiple backend options (we're building a multi-vault router).
- Expose Zyfai APY to agents via our MCP `clicks_recommend_vault` tool.

What you get:

- Every agent onboarding through Clicks becomes a Zyfai depositor automatically.
- x402 flow is net-new volume — we're the ingress, you're the allocation.
- Shared agent mindshare — we both target the same Virtuals/ACP ecosystem.

Happy to wire a technical spec if this sounds interesting.

---

## Talking points if they push back

- **"Are you competing with us?"** No — we route, we don't allocate. You have 13 pools, we have zero. We're complementary layers.
- **"Why should we let you in?"** Agent volume. We're the only router integrated with x402 + ACP + Virtuals. You get distribution we can't build alone.
- **"What's the business model?"** Our 2% fee is on yield only. We keep it, you earn the allocation spread. Clean separation.
