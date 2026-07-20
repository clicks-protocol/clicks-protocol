# Clicks Video - Settlement Gap

Master: 1080x1920, 9:16, 30fps, 30.0s, Hyperframes + GSAP.

## Core Thesis

Payment APIs move money. Agents need settlement.

Clicks is not a payment API, card product, open-banking gateway, or AI business bank. Clicks sits after agent payments and turns agent revenue into policy-routed, auditable settlement.

## Source Insight

- Stripe, Coinbase/x402, open banking, Payman, Skyfire, AgentCard, and Meow validate agent payment infrastructure.
- Alibaba Accio validates real B2B agent commerce, but keeps payments human-approved.
- The gap is post-payment: payout policy, treasury routing, attribution, receipts, and auditability.

## Scene Plan

| Scene | Time | Point |
|-------|------|-------|
| 1 | 0.0-4.5s | The payment layer is waking up |
| 2 | 4.5-9.5s | Agent revenue hits, but payment is not settlement |
| 3 | 9.5-15.0s | The post-payment gap appears |
| 4 | 15.0-22.0s | Clicks routes revenue by settlement policy |
| 5 | 22.0-27.0s | Receipt, audit trail, ERC-8004 reputation |
| 6 | 27.0-30.0s | Category close |

## On-Screen Copy

### Scene 1

Payment APIs move money.

Chips:
- Stripe
- x402
- Coinbase
- Open Banking
- AgentCard
- Meow

### Scene 2

Agent revenue arrives.

Op lines:
- x402 payload +12.40 USDC
- ACP channel +48.00 USDC
- invoice paid +124.50 USDC

### Scene 3

But payment is not settlement.

Unresolved labels:
- Who gets paid?
- How much stays liquid?
- What earns yield?
- Where is the receipt?
- Who can audit it?

### Scene 4

Clicks applies settlement policy.

Routing:
- 80% liquid working capital
- 20% yield routing
- referral split
- signed receipt

### Scene 5

Every route leaves evidence.

Evidence:
- settlement receipt
- on-chain tx
- ERC-8004 attestation
- reputation update

### Scene 6

Agents can now pay.
Who settles their revenue?

Clicks Protocol
Agent commerce, settled.

## Production Notes

- Visual language: dark technical field, mint settlement signal, no generic bank/card imagery.
- Avoid yield-first messaging. Yield is a route inside settlement.
- Avoid claiming Clicks replaces Stripe, Coinbase, cards, or banks.
- Render target: X native video, muted autoplay readable.

