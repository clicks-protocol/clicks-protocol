# Agent Commerce Rails Research - 2026-07-20

## Decision

Clicks should stay positioned as an **Agent Commerce Settlement Router**, not as a generic payment API, open banking gateway, or BaaS marketplace.

The strongest product line is:

> Payments are becoming programmable. Agent commerce still needs settlement policy, treasury routing, identity, and auditability after the payment happens.

## Source Set

- Dev.to / Atoa CTO: `Your Payment API Wasn't Built for AI Agents. Open Banking Might Be the Fix`
- Atoa docs: Open Banking Pay by Bank for UK merchants
- Treasury Prime AI Marketplace press release
- Treasury Prime transparency blog
- Alibaba Accio Work article, verified against Reuters, Digital Commerce 360, Alibaba PR
- Infosys SLM in financial services
- Fast.io payment APIs for AI agents
- AgentCard / Agentcard virtual cards for AI agents
- Meow AI-native business banking and treasury

## What The Sources Prove

1. Card rails are a weak fit for agents.
   - 3DS, OTP, CAPTCHA, chargebacks, and delayed settlement assume a human-in-the-loop.
   - Stripe and card-network agent tooling helps, but it still inherits the card stack.

2. Open banking is a real adjacent.
   - Atoa validates Pay by Bank as lower-cost and faster than card rails, especially in the UK.
   - Open banking is not global, not on-chain, and not agent-native by itself.
   - It is best treated as an input rail, not Clicks' core product.

3. BaaS and embedded finance are becoming AI-assisted, not settlement-native.
   - Treasury Prime uses AI for matching, partner discovery, and transparency narratives.
   - It does not solve agent commerce execution or on-chain settlement.
   - Clicks can differentiate with on-chain auditability instead of AI-blackbox matching.

4. B2B agent commerce is real.
   - Alibaba Accio Work is the strongest validation signal.
   - Accio can run sourcing, RFQs, supplier negotiation, compliance, and logistics.
   - Alibaba keeps payments human-approved. That is the gap Clicks can own: settlement, payout, treasury policy, and approval-controlled autonomy.

5. Enterprise finance will prefer smaller, private models for sensitive workflows.
   - Infosys' SLM article is vendor-biased, but the point is directionally useful.
   - Treasury agents need low latency, compliance controls, privacy, explainability, and predictable cost.
   - This supports a "private finance agent" story, but it is not the core product today.

6. Payment API maps miss the post-payment layer.
   - Fast.io lists Stripe Agent Toolkit, Coinbase/x402, Lightning L402, Skyfire, Nevermined, and Payman.
   - The list focuses on payment execution, spend controls, wallets, and agent identity.
   - It misses settlement policy, treasury routing, and auditable revenue flows. That is Clicks' gap.

7. Agent virtual cards are real and moving fast.
   - `agentcard.ai` is Alchemy/Visa: virtual payment and identity platform for AI agents, with card token, email, phone, and wallet as the agent's operating identity.
   - `agentcard.sh` is a separate live card-issuing product: single-use virtual Visa cards for agents, MCP-native, CLI-enabled, wallet-funded, YC-visible.
   - These products validate agent checkout, but they are spend-side products. They do not own post-payment revenue routing, treasury policy, or on-chain settlement.

8. AI-native business banking is now an active competitor category.
   - Meow offers AI-native business banking via MCP: accounts, corporate cards, ACH/wires/checks, invoicing, crypto rails, and commercial-paper yield.
   - Meow is the strongest Web2 benchmark for "AI agents need a bank account."
   - It competes with Clicks at the treasury narrative level, but from regulated banking custody. Clicks should stay on-chain, self-custody, global, and settlement-native.

## Positioning Implication

Do not say:

- "Clicks is a payment API"
- "Clicks is an open banking bridge"
- "Clicks is a BaaS marketplace"
- "Clicks competes with Stripe"
- "Clicks gives agents cards"
- "Clicks is an AI business bank"

Say:

- "Clicks sits after agent payments."
- "Clicks routes agent revenue into liquid working capital and yield."
- "Clicks adds settlement policy, treasury routing, and on-chain auditability to x402 and ACP flows."
- "Open banking and card APIs move money. Clicks decides how agent revenue is settled."
- "AgentCard gives agents purchasing power. Clicks gives agent revenue a settlement policy."
- "Meow gives agents banking rails. Clicks gives agents on-chain settlement and treasury autonomy."

## Product Implications

### Near-Term

1. Keep pushing SDK, MCP, and Discovery distribution.
2. Fix npm, MCP Registry, ClawHub, and Glama first. Distribution unlocks the existing product.
3. Stabilize X-pipeline and publish content around the "payment APIs are not enough" thesis.

### Product Backlog

1. Agent Settlement API
   - Simple API wrapper around current SDK/MCP flows.
   - Input: payment/revenue event, agent, policy, recipient.
   - Output: settlement route, on-chain tx, receipt, webhook.

2. Multi-Rail Adapter Design
   - Do not build open banking now.
   - Design Clicks so open banking, x402, ACP, Coinbase wallets, and future card flows can all become input events.

3. On-Chain Transparency Layer
   - Use ERC-8004 identity and reputation as the visible audit layer.
   - Contrast this with centralized AI marketplace blackboxes.

4. Approval-Controlled Autonomy
   - Alibaba Accio keeps payments human-approved.
   - Clicks should support policy-bounded autonomy: limits, approvals, receipts, and emergency off-switches.

5. Card-Rail Integration Stance
   - Do not build card issuing.
   - Treat AgentCard-style products as possible spend-side partners or rails.
   - Clicks should receive payment/revenue events and create settlement receipts, not expose PAN/CVV flows.

6. Banking-Rail Integration Stance
   - Do not chase banking licenses or custodial bank accounts.
   - Treat Meow as the Web2 benchmark for UX, guardrails, and MCP accessibility.
   - Clicks' counter-position: lower entry threshold, self-custody, global USDC settlement, on-chain audit trail.

## Content Angles

1. "Payment APIs Move Money. Agents Need Settlement."
2. "Open Banking Settles in Seconds. Crypto Settles in Blocks. Both Beat Cards."
3. "Alibaba Built the Sourcing Agent. Who Settles the Agent's Revenue?"
4. "AI Marketplaces Are Black Boxes. Settlement Needs Receipts."
5. "Why Agent Commerce Needs Treasury Policy, Not Just Wallets."
6. "AgentCard Gives Agents Cards. Who Handles Their Revenue?"
7. "Meow Gives Agents Bank Accounts. Clicks Gives Agents Settlement."

## Competitor / Partner Watch

High priority:

- Coinbase Agentic Wallets and x402
- Skyfire
- Payman
- Nevermined
- Alibaba Accio Work
- AgentCard by Alchemy
- Agentcard.sh
- Meow

Medium priority:

- Atoa
- TrueLayer
- Yapily
- Treasury Prime
- Fast.io
- Infosys Topaz Banking SLM

## Recommended Next Step

Ship one new distribution piece after registry/package cleanup:

Title candidate:

> Payment APIs Move Money. Agents Need Settlement.

Core thesis:

> Stripe, Coinbase, open banking, and x402 can trigger payments. Clicks handles what happens next: working capital, yield routing, referrals, receipts, and auditability.
