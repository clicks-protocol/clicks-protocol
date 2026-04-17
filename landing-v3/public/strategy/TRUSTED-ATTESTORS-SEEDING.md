# Trusted Attestors — Seeding Strategy

**Status:** Strategy note, not a commitment. No attestor has been added to `ClicksReputationMultiplierV1.addAttestor()` yet — the multiplier isn't even deployed. This document proposes the admission order for when it is.
**Owner:** Clicks Safe `0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9`
**Schema:** `strategy/ATTESTOR-SCHEMA-V1.md`

---

## What an attestor is responsible for

A trusted attestor commits to:
1. Emit `giveFeedback` exclusively in Schema V1 format (value 0..10000, decimals=4, tag enum).
2. Attest only to agents they do **not** control.
3. Attest based on observable behaviour (ACP job outcomes, x402 success rates, SDK response quality) — not sentiment.
4. Accept removal without appeal if Schema V1 is violated.

The trust is narrow: we don't trust their overall judgement, we trust that their feedback conforms to Schema V1. Quality of judgement is weighed by whether the aggregate signal correlates with observed outcomes.

## Candidate pool

### Tier 1 — Day-0 candidates (ship when multiplier deploys)

| Candidate | Address / source | Why include | Why NOT include | Decision |
|-----------|------------------|-------------|-----------------|----------|
| **Virtuals ACP validator wallet** | tbd (ask Miratisu) | Attests every ACP job outcome; highest volume signal in the market today | Depends on Virtuals uptime; their validator format may not match Schema V1 off-the-shelf | **Ask** — DM Miratisu for validator addr + confirm they can emit Schema V1. If yes: add. |
| **Clicks Safe signers (individual wallets)** | each signer's personal EOA | Humans with direct product context; cheap to operate | Small team, low throughput; risk of sentiment-driven ratings | **Defer** — only if volume demands it after month 1 |
| **Coinbase AgentKit example wallet** | public Coinbase attestation wallet (verify on their docs) | Trusted brand; Coinbase already has AgentKit reputation tooling | Probably doesn't exist as a distinct attestor wallet yet | **Check** — if Coinbase publishes such a wallet, add. Otherwise skip. |

### Tier 2 — Month 1 candidates (add as volume grows)

| Candidate | Rationale | Gate |
|-----------|-----------|------|
| Eliza Plugin operators who use Clicks | They see direct agent behaviour via our plugin | Must have published at least 100 attestations in Schema V1 format first |
| ERC-8004 validator services (TrustLayer, etc., if any exist on Base) | Professional attestors with explicit quality SLA | Confirm their data format matches Schema V1 |
| Known OpenClaw/ClawHub operators | Already in our ecosystem, know the agent space | Public announcement of schema compliance first |

### Tier 3 — Do not include

| Candidate | Why rejected |
|-----------|-------------|
| **Clicks operator wallet `0xf873...`** | Controls most Clicks-adopted agents de facto via the SDK. Would be self-attestation at scale. Explicit Schema V1 violation. |
| **Any wallet that holds the ACP wallet MPC share** | Same conflict as above. |
| **Anonymous Twitter accounts / random EOAs offering attestations** | No accountability, easy to sybil |
| **Wallets attested only by feedback-for-feedback (quid pro quo)** | Gameable loop |

## Admission process

Codified from `strategy/ATTESTOR-SCHEMA-V1.md` with Clicks-specific steps:

1. **Candidate announces** on-chain compliance (tweet, blog post, or signed message referencing Schema V1 URL).
2. **Clicks off-chain reviews** their last 10 `giveFeedback` calls (if any) for format compliance.
3. **Safe proposes `addAttestor(addr)`** transaction; 2-of-N signer threshold.
4. **Scanner fires next day** — `scripts/scan-tier-distribution.ts` re-runs. Adding an attestor should not cause sudden mass tier shifts. If > 20% of agents shift tier within 24h of admission, pause and investigate.
5. **Safe can `removeAttestor(addr)` unilaterally** if Schema V1 is broken. No appeal.

## Seeding the first real data

The chicken-and-egg problem: we cannot add Tier 1 attestors until they emit feedback, but they won't emit feedback until there's an incentive. Clicks solves this by:

1. **Emit our own non-critical attestations first** (via `scripts/seed-attestations.ts`). These are not consumed by the multiplier — they are public demonstrations of Schema V1. The operator wallet `0xf873...` stays off the whitelist; our attestations exist as reference implementations only.
2. **Document the tier outcomes** via `scripts/scan-tier-distribution.ts` and publish the CSV. This gives prospective attestors evidence that the pipeline works end-to-end.
3. **Approach Miratisu / Virtuals** with concrete data: "here are 10 live Clicks agents, here is what their tier would be under a Virtuals-seeded whitelist. Will you emit in Schema V1?"

## Monitoring after admission

- Scanner runs weekly (`com.clicks.tier-scanner` launchd agent, Thursdays 09:00).
- MID-or-better % is the headline metric; track over time.
- Per-attestor attribution: fork the scanner later to report "tier distribution with/without attestor X" so the impact of each attestor is measurable.
- Any attestor whose feedback moves the distribution by > 10 percentage points in a single week is investigated for gaming.

## First-90-day goalpost

- **Week 1:** Multiplier deployed, one Tier-1 attestor admitted (Virtuals, ideally), at least 3 agents registered via SplitterV5 on testnet.
- **Week 4:** MID-or-better ≥ 20% across Clicks agents.
- **Day 90:** MID-or-better ≥ 50% → V5 flip-live on `ClicksYieldRouter`, V4 deprecated over the following 30 days.

Miss the Day-90 mark → reassess whether V5 is the right direction or whether the reputation economy isn't mature enough and Clicks stays on a flat-fee V4 indefinitely.
