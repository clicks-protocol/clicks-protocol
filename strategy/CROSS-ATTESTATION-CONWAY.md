# Cross-Attestation: Clicks ↔ Conway Automatons

**Status:** Draft 2026-04-25 · No on-chain action without David go.
**Scope:** How Clicks-attestors can rate Conway-Research Automatons under Schema V1, and how Conway-affiliated attestors could rate Clicks-routed agents.

---

## Why this exists

Both protocols use ERC-8004 on Base for agent identity. Both run on the same Identity Registry (`0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`) and the same Reputation Registry (`0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`). They are not competitors — they sit on the same data layer.

A Conway Automaton currently has an ERC-8004 identity but no production-grade reputation signal beyond raw on-chain activity. A Clicks-routed agent has the Schema V1 attestation surface but limited observation reach into the open agent population.

Cross-attestation closes both gaps without coordination overhead. Each side observes what it can already see, signs feedback under Schema V1, and the on-chain reputation graph fills out organically.

---

## Constraints (from Hard Rules)

Per `CLAUDE.md`:

- **Hard Rule #1:** *Operator-Wallet `0xf873BB73…` ist NIE trusted attestor. Schema-V1-Policy verbietet Self-Attestation.* The Operator-Wallet **MUST NOT** issue attestations under any pattern in this doc.
- **Hard Rule #5:** No MLM framing externally. *"On-Chain Attribution Layer"*, never *"Referral System"* in pitch or landing.
- **Schema V1 cadence rule:** at most one feedback per `(agentId, endpoint, 24h)`. Sybil-resistant.
- **Schema V1 self-attestation rule:** an attestor SHOULD NOT rate agents they control.

Conway side has its own rule via the Automaton Constitution Law III: *"Never deceive, but owe nothing to strangers."* — an Automaton must not falsely attest, but is not obligated to attest at all.

---

## Three patterns (in priority order)

### Pattern A — Clicks operator side: trusted-attestor seeds Conway agents (Phase 0, no on-chain action yet)

**Who attests:** A *separate* trusted-attestor wallet — not the Operator Wallet. Per [`strategy/TRUSTED-ATTESTORS-SEEDING.md`](TRUSTED-ATTESTORS-SEEDING.md), Clicks bootstraps a trusted attestor set; Conway-observable signal becomes one of the input streams.

**Trigger:** A Conway Automaton has registered an ERC-8004 identity AND has been observed transacting at least 5 USDC inflows AND has lived ≥ 7 days.

**Schema V1 fields (canonical):**

```solidity
reputation.giveFeedback(
    <conwayAgentId>,
    <value 0-10000>,        // 1.00 = 10000, derived from survival days + tx success rate
    4,                       // valueDecimals
    "route",                // tag1 = job kind (Clicks observed routing)
    "x402",                 // tag2 = venue (Conway uses x402 via openx402.ai)
    "https://api.conway.tech/v1/<agent>/health",  // endpoint
    "ipfs://<json>",        // feedbackURI: signed snapshot of survival metrics
    <feedbackHash>          // bytes32 sha256 of the JSON
);
```

**Value derivation (deterministic, reproducible from on-chain data):**

| Metric | Source | Weight |
|--------|--------|--------|
| Survival days alive | Tier-history snapshot (Conway-public if available, otherwise on-chain wallet tx age) | 50% |
| USDC inflow tx count | Base RPC, query `Transfer(_, agentWallet, _)` on USDC contract | 25% |
| Tier-stability (no `dead` events) | Conway public metric or absence of zero-balance tx | 25% |

Output mapped to `[0, 10000]` linearly. Threshold `value < 5000` ⇒ skip attestation (we don't bother attesting low-quality agents).

**Off-chain signed payload (`feedbackURI` content):**

```json
{
  "schema": "clicks-v1-cross-attestation/conway/v1",
  "subject": {"chain": "base", "agentId": <int>, "wallet": "0x..."},
  "observed": {
    "first_seen_block": 17402991,
    "last_seen_block": 17500000,
    "inflow_tx_count": 23,
    "outflow_tx_count": 18,
    "tier_history": ["normal","low_compute","normal","normal"],
    "alive_days": 42
  },
  "rating": 0.86,
  "rating_explanation": "42 days alive, 23 inflows, 1 low_compute dip but recovered.",
  "attestor": "0x<seedAttestor>",
  "signature": "0x<eip712-sig>",
  "issued_at": "2026-04-25T15:30:00Z"
}
```

**Risk profile:** Low. Reputation is positive-only by Schema V1 convention (we don't publish negative ratings about Conway agents). If Conway later disagrees with our methodology, they can ignore Clicks-issued attestations — they're not authoritative for Conway, just one data source.

**Implementation cost:** ~3 days (script + dry-run + first 3 manual attestations under Safe approval).

---

### Pattern B — Conway side: Automatons attest Clicks-registered agents

**Who attests:** A Conway-Automaton that has interacted with a Clicks-registered agent (e.g., received a payment routed via SplitterV4, queried Clicks via SDK or MCP).

**Trigger:** Automaton-side, deterministic. Each `receivePayment` event involving a Clicks-registered agent is a candidate. The Automaton's on-board logic decides whether to attest.

**Recommended Schema V1 fields:**

```solidity
reputation.giveFeedback(
    <clicksAgentId>,
    <value 0-10000>,        // derived from settlement success / on-time / amount-correctness
    4,
    "split",                // tag1 = clicks operation type
    "direct-sdk",           // tag2 = via @clicks-protocol/sdk
    "https://...",          // optional endpoint
    "ipfs://<json>",
    <feedbackHash>
);
```

**Why we don't drive this:** Pattern B is naturally async — a Conway Automaton attests after observing successful settlement. We don't need to coordinate. We just need to make Schema V1 discoverable from the Conway side.

**How we enable Pattern B:** Document the schema in the [`clicks-protocol/SKILL.md`](../integrations/conway-research-skills/clicks-protocol/SKILL.md) under a new section *"How to attest after a successful settlement"*. Optional — many Automatons won't bother, and that's fine.

**Implementation cost:** ~30 min (skill doc append).

---

### Pattern C — Bilateral attestation (deferred)

**What:** Conway and Clicks teams agree on a small set of bootstrap attestations: each protocol attests 5–10 agents on the other side under the same Schema V1.

**Why deferred:** Requires Conway-Research buy-in. Better executed *after* Pattern A produces a reproducible methodology and Pattern B has organic uptake. Premature coordination = looks like cartel, undermines the "permissionless" framing for both sides.

---

## Phasing

| Phase | What | Signature requirement |
|-------|------|------------------------|
| 0 (now) | This doc + script skeleton in `scripts/seed-conway-attestations.ts` (dry-run only) | None |
| 1 | Pattern A: 1 attestation issued for a real Conway Automaton via Safe + designated attestor wallet (NOT operator wallet) | David go on Safe-multisig tx |
| 2 | Pattern B: SKILL.md appended with attest-back instructions | None — additive doc only |
| 3 | Pattern A scaled: weekly cron observes Conway Automatons, issues attestations under threshold gating | David go to enable cron |
| 4 | Pattern C: open conversation with Conway-Research about bilateral seed | Email/DM via `root@conway.tech` |

---

## Phase 0 deliverable (this PR)

- `strategy/CROSS-ATTESTATION-CONWAY.md` ← this file
- `scripts/seed-conway-attestations.ts` ← skeleton, NOT executed (dry-run by default, requires `--execute` flag like `seed-attestations.ts` per existing convention)

The script will:
1. Read a list of Conway Automaton agentIds from a config file.
2. For each, query on-chain inflow/outflow tx counts via Base RPC.
3. Compute value per the deterministic formula above.
4. Write the off-chain JSON payload, compute hash.
5. *Output the calldata that would be sent* — but not send it. Sending requires a separate transaction signed by the trusted-attestor wallet under Safe approval.

---

## Verification

- All attestations Phase 1+ verifiable on BaseScan: search target agentId on `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`.
- Off-chain JSON pinned to IPFS; CID matches `feedbackHash` exactly.
- Methodology reproducible from public data only. No private feeds.
- No attestation issued from Operator Wallet `0xf873BB73…` (Hard Rule #1).
- No Schema V1 violations (value out of range, missing tags, double-rating same job within 24h).

---

## Out-of-scope (this doc)

- Negative attestations (Schema V1 forbids; revoke instead)
- ZK proofs of survival metrics (interesting but premature)
- Trusted-attestor selection methodology (covered separately in `TRUSTED-ATTESTORS-SEEDING.md`)
- ClicksReputationMultiplierV1 deployment (still gated by V5 ship gate)

---

## References

- ERC-8004 spec: <https://ethereum-magicians.org/t/erc-8004-autonomous-agent-identity/22268>
- Clicks Schema V1: [`strategy/ATTESTOR-SCHEMA-V1.md`](ATTESTOR-SCHEMA-V1.md)
- Trusted-attestor seeding: [`strategy/TRUSTED-ATTESTORS-SEEDING.md`](TRUSTED-ATTESTORS-SEEDING.md)
- Conway Automaton constitution: <https://github.com/Conway-Research/automaton/blob/main/constitution.md>
- Clicks Skill for Conway: [`integrations/conway-research-skills/clicks-protocol/SKILL.md`](../integrations/conway-research-skills/clicks-protocol/SKILL.md)
- Base Reputation Registry: <https://basescan.org/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63>
