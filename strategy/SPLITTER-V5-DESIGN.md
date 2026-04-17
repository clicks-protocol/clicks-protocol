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
