# Clicks Attestor Schema V1

**Status:** Published 2026-04-17
**Scope:** Defines the format of ERC-8004 `giveFeedback` calls that the
`ClicksReputationMultiplierV1` contract treats as signal. Attestors who
follow this schema are eligible to be added to the multiplier's trusted
attestor set. Feedback that deviates from this schema is technically
still on-chain, but our multiplier will either cap it, ignore it, or
push the target agent into COLD tier.

---

## Why a schema is needed

ERC-8004's `giveFeedback(agentId, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash)` is a generic transport. It does not fix a value scale, does not define tag semantics, and does not constrain cadence. Without conventions, one attestor rates 0–1, another rates 0–100, a third uses 0–5 stars. The multiplier cannot aggregate those into a meaningful tier.

Live data on Base as of 17.04.2026 confirms this: the existing feedback entries for agent #1 mix integer values with `decimals=0`, which breaks any 0..1 assumption. We refuse to guess.

## The contract

If an attestor wants their feedback to count for Clicks tier computation, they commit to this schema for every `giveFeedback` call. Period.

### Value and decimals

- `value` is a rating on the interval **[0, 1]**, expressed as an integer with a fixed `valueDecimals`.
- **`valueDecimals` MUST equal `4`.** So `value = 10000` means 1.00 (perfect). `value = 5000` means 0.50 (neutral). `value = 0` means 0.00 (worst).
- Negative values are not permitted. Attestors who want to "warn" the ecosystem about a bad actor should revoke prior positive feedback and emit a single `value = 0` entry rather than going negative. The multiplier treats negatives as COLD and does not distinguish degrees of dislike.

### Tag conventions

- `tag1` carries the **job kind**: `ingest`, `route`, `split`, `withdraw`, `liquidate`, `custom`. Empty string allowed for uncategorized feedback.
- `tag2` carries the **venue**: `virtuals-acp`, `x402`, `direct-sdk`, `mcp-tool`, `custom`. Empty string allowed.
- Tag values are case-sensitive ASCII, max 32 bytes.
- Unknown tags are not an error — the multiplier ignores tag filtering entirely in V1 — but schema compliance helps future versions.

### Endpoint, URI, hash

- `endpoint` is the API/URL the job hit, if any. Free-form string, max 256 bytes. Empty string allowed.
- `feedbackURI` is a pointer to additional context (an IPFS document, an HTTPS JSON blob, an on-chain Storage slot). Free-form, max 512 bytes.
- `feedbackHash` is a `bytes32` integrity hash of whatever `feedbackURI` resolves to. Zero allowed if no off-chain payload exists.

### Cadence and Sybil resistance

- Each attestor SHOULD give at most **one feedback entry per (agentId, endpoint, 24h)**. Double-rating the same job is not forbidden on-chain but will cause Clicks to downgrade the attestor's weighting in future multiplier versions.
- Attestors SHOULD not attest to agents they control. The ERC-8004 contract does not enforce this, so we rely on honest attestor selection.
- If an attestor is found to give systematically miscalibrated ratings, they are removed from the trusted set by `ClicksReputationMultiplierV1.removeAttestor()`.

### Revocation

- Attestors can revoke their own feedback via `revokeFeedback(agentId, feedbackIndex)`. Clicks respects this — the revoked entry drops from the attested count, which can move an agent from ELITE → HIGH → etc.

## Canonical examples

### Happy-path rating (rate agent #45074 after a successful x402 job)

```solidity
reputation.giveFeedback(
    45074,              // agentId
    10000,              // value: 1.00 (perfect)
    4,                  // valueDecimals: 1.0000
    "route",            // tag1: job kind
    "x402",             // tag2: venue
    "https://agent.example.com/x402/job/42",  // endpoint
    "ipfs://bafy.../feedback.json",           // feedbackURI
    0x1234...abcd       // feedbackHash
);
```

### Neutral rating (job completed but slow)

```solidity
reputation.giveFeedback(
    45074, 7500, 4, "route", "x402",
    "https://agent.example.com/x402/job/43",
    "ipfs://bafy.../feedback.json",
    0x1234...abcd
);
```

### Worst rating (job failed — agent produced wrong deliverable)

```solidity
reputation.giveFeedback(
    45074, 0, 4, "route", "x402",
    "https://agent.example.com/x402/job/44",
    "ipfs://bafy.../feedback.json",
    0x1234...abcd
);
```

## Attestor admission process

1. Attestor publishes a short public statement that they follow Schema V1 for feedback directed at Clicks-adopted agents.
2. Clicks Safe (owner of the multiplier) calls `addAttestor(attestorAddress)`.
3. Attestor begins emitting feedback against the canonical examples. Clicks reviews the first 10 entries off-chain for schema compliance.
4. If compliant: attestor stays whitelisted indefinitely.
5. If non-compliant: Safe calls `removeAttestor(attestorAddress)`. No appeal path in V1.

## Changes from V1 require a V2 schema

- Different value scale
- Signed values
- Tag-based filtering in the multiplier
- Decay functions (old feedback weighs less)

Any of these lands in `ClicksReputationMultiplierV2` with a new schema document.

## Off-chain verification tool

`scripts/scan-tier-distribution.ts` reads the live registry and reports which agents would land in which tier under V1 with a given attestor whitelist. Use this before flipping SplitterV5 live to sanity-check the tier spread.
