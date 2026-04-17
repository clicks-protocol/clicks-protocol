# ClicksSplitterV5 — Design

**Status:** Prototype contract drafted, not deployed
**Prerequisite:** `ClicksReputationMultiplierV1` (✅ shipped, 24 tests passing)
**Target:** Replace hardcoded `FEE_BPS = 200` in V4 with per-agent tier lookup

---

## What changes vs V4

| Aspect | V4 (current) | V5 (new) |
|--------|--------------|----------|
| Fee rate | hardcoded 2.00% on yield | variable 1.00–3.00% via reputation tier |
| Agent identity | wallet address | wallet + ERC-8004 agentId |
| Tier source | none | `ClicksReputationMultiplierV1.feeBpsFor()` |
| Fee floor | 2.00% | 1.00% (elite tier) |
| Fee ceiling | 2.00% | 3.00% (cold tier) |

Everything else (80/20 split, referral flow via `ClicksFeeV2`, yield routing via `ClicksYieldRouter`) stays identical. V5 is a fee-rate swap, not a reshuffle.

## AgentId resolution

The multiplier needs `(agent, agentId)`. Options considered:

| Option | Pros | Cons |
|--------|------|------|
| Caller passes agentId per tx | flexible | ergonomic cost, agents can game by passing 0 for lower fee — NO, low agentId doesn't help, cold tier is highest |
| Enumerable NFT lookup | no state | Identity Registry is not ERC-721 Enumerable |
| Off-chain reverse index | simple | not on-chain truth |
| **Self-registration setter** | ergonomic, on-chain truth, checks ownership | one extra tx per agent — acceptable one-time cost |

**Chosen: self-registration.**

Agent calls `V5.registerAgentId(uint256 agentId)` once. The splitter verifies `identity.ownerOf(agentId) == msg.sender` and stores in `mapping(address => uint256) agentToId`. Agents without a registered id get `FEE_COLD` (3%) — a gentle incentive to register.

The registration is transferable: if an agent loses control of its NFT, `agentToId` can become stale. We add `unregisterAgentId()` and `refreshAgentId()` so the live owner can always take over.

## Fee computation flow

```
receivePayment(from, amount)
  ↓
transfer amount into splitter
  ↓
route yieldPortion via ClicksYieldRouter (unchanged)
  ↓
on yield realisation:
  agentId = agentToId[agent]              // 0 if unregistered → cold
  feeBps = multiplier.feeBpsFor(agent, agentId)
  fee = yieldEarned * feeBps / 10_000
  agentReceives = received - fee
  transfer fee → ClicksFeeV2.collectFee()  (unchanged)
```

Fee never touches principal. Referral distribution via `ClicksFeeV2` works unchanged because it only cares about the total fee USDC, not the rate.

## Open-question resolutions

- **Why not force-register on first deposit?** Extra gas on the hot path. Voluntary keeps the hot path fast; unregistered agents self-select into cold.
- **Why allow agentId = 0 as the sentinel?** ERC-8004 agentIds start at 1. Zero is a safe "unset" marker.
- **What happens if the multiplier registry is paused/upgraded?** The multiplier wraps both registry calls in try/catch and returns cold on revert. V5 inherits that safety.
- **Migration from V4?** No forced migration. V5 deploys alongside V4; `ClicksYieldRouter` points to the new splitter. Existing agents keep earning on V4 until router switches.

## Upgradability

V5 is immutable, like V4. Tier-table changes require V6. The multiplier reference is set at construction and cannot be changed. That is the explicit trade-off: no surprise fee changes, no governance surface, no upgrade proxies.

## Market readiness — DO NOT deploy V5 yet

Live simulation against Base mainnet (17.04.2026, `scripts/simulate-multiplier-live.ts`):

- Our own agent 45074 has 0 feedback → COLD tier (as expected for a fresh mint)
- Agent #1 (the registry seed) has 12 attestors, but most individual `getSummary` calls only return 1 entry each, values are integers (e.g. 100) with `decimals=0` — nobody follows a normalized 0..1 rating convention
- A broader probe across mid/high agentIds found **zero** agents with both an Identity NFT and attestor feedback
- Conclusion: ERC-8004 reputation traffic on Base mainnet is essentially empty as of mid-April 2026

**If we shipped V5 today, nearly every agent would land in `COLD` = 3.0% fee.** That is a fee **increase** over V4's flat 2.0%, not a decrease. V5 is a net negative at launch without seed liquidity in the reputation graph.

### Ship prerequisites

1. **Whitelist design finalised.** Open question: do we accept non-normalized values from whitelisted attestors, or require them to respect a 0..1 schema? Leaning toward the latter: publish a Clicks feedback schema, whitelist only attestors who attest that schema.
2. **Seed attestation program.** Clicks itself (via the operator wallet) should give feedback to a cohort of known-good agents to bootstrap the graph. This is cheap (on-chain cost only) and creates the signal.
3. **Partnership attestors.** Virtuals, Eliza, or Coinbase Agentic Wallet as trusted attestors once they start emitting feedback at volume.
4. **Countdown trigger.** Switch from V4 to V5 only when ≥ 50% of active Clicks agents have ≥ COUNT_LOW (10) entries from the whitelist. Anything earlier punishes our own users.

## Verification plan

1. Unit tests mirroring V4 test coverage + new tests for:
   - `registerAgentId` happy path and ownership-rejection
   - Unregistered agent gets cold tier
   - Multiplier revert falls through to cold
   - Fee tier changes reflected live when reputation mock is bumped
2. Fork test against Base mainnet:
   - Register real agentId 45074
   - Mock a single attestor whose feedback is on-chain
   - Confirm live tier matches expectation
3. Gas snapshot — must stay within V4 + ~5k gas per deposit

## Deploy plan (future)

1. Deploy `ClicksReputationMultiplierV1` with Safe as owner
2. Seed attestor set — start with 2 known: Virtuals validator + Clicks operator
3. Deploy `ClicksSplitterV5` pointing at multiplier + existing `ClicksFeeV2` + `ClicksYieldRouter` + `ClicksReferral`
4. Authorize SplitterV5 on `ClicksFeeV2`
5. Point `ClicksYieldRouter` at V5 (owner tx)
6. Keep V4 alive for 30 days, then revoke authorization

No emergency stop — same as V4. The try/catch protection plus fee bounds (1–3%) keeps the blast radius small.
