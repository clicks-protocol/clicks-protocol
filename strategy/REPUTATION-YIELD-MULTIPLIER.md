# Reputation-Yield Multiplier — V3 Design

**Status:** V1 shipped 2026-04-17 — contract + 18 unit tests passing
**Contract:** [`contracts/ClicksReputationMultiplierV1.sol`](../contracts/ClicksReputationMultiplierV1.sol)
**Tests:** [`test/ClicksReputationMultiplierV1.test.ts`](../test/ClicksReputationMultiplierV1.test.ts)

---

## Core idea

Agents with higher ERC-8004 reputation scores receive a higher share of the yield their principal generates. Clicks keeps a smaller protocol fee on high-reputation agents.

This is not a bonus paid from protocol reserves. It is a variable fee split based on a trust-graph signal the agent already cares about.

## Why it matters

- **Alignment loop:** Agents that care about yield now care about reputation. Reputation behavior = honest delivery, timely ACP settlements, no spam. These are the behaviors Virtuals / ERC-8004 validators reward.
- **Flywheel for Clicks:** Agents with reputation bring downstream agents. Downstream agents earn less until they build reputation. Protocol fee rises on the tail, falls on the head.
- **Defensive:** Competitors can copy the router. They cannot copy the reputation integration without doing the same ERC-8004 work we already did.

## Fee curve

| ERC-8004 Score | Protocol Fee on Yield |
|----------------|----------------------|
| < 10           | 3.0% (cold-start penalty) |
| 10–49          | 2.5%                  |
| 50–99          | 2.0% (current default) |
| 100–249        | 1.5%                  |
| 250+           | 1.0% (reputation-elite) |

- Score is read from Reputation Registry `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- Fee is applied at yield accrual time, not at deposit
- Fee only touches yield, never principal (unchanged from V2)

## Contract sketch

```solidity
interface IERC8004Reputation {
    function scoreOf(uint256 agentId) external view returns (uint256);
    function agentIdOf(address wallet) external view returns (uint256);
}

contract ClicksReputationMultiplierV1 {
    IERC8004Reputation public immutable reputation;

    // bps, basis points
    uint16 public constant FEE_COLD   = 300;  // 3.0%
    uint16 public constant FEE_LOW    = 250;  // 2.5%
    uint16 public constant FEE_MID    = 200;  // 2.0%
    uint16 public constant FEE_HIGH   = 150;  // 1.5%
    uint16 public constant FEE_ELITE  = 100;  // 1.0%

    function feeBpsFor(address agent) public view returns (uint16) {
        uint256 agentId = reputation.agentIdOf(agent);
        if (agentId == 0) return FEE_COLD;
        uint256 score = reputation.scoreOf(agentId);
        if (score >= 250) return FEE_ELITE;
        if (score >= 100) return FEE_HIGH;
        if (score >= 50)  return FEE_MID;
        if (score >= 10)  return FEE_LOW;
        return FEE_COLD;
    }
}
```

## Integration points

- `ClicksFeeV2` → replace hardcoded `feeBps = 200` with call to `ClicksReputationMultiplierV1.feeBpsFor(agent)`
- Cache score per block to avoid double-lookup per tx
- Emit `FeeBpsApplied(address agent, uint16 bps)` event for indexers

## Resolved in V1

1. **Score source** — Reputation Registry exposes `getSummary(agentId, clients[], tag1, tag2) → (count, int128 value, uint8 decimals)`; no simple `scoreOf`. We aggregate across all clients with no tag filter and translate into bps.
2. **Agents without ERC-8004 ID** — cold-start 3%. Ownership mismatch also → cold.
3. **Registry revert** — caught with try/catch → cold. Safe for caller contracts.
4. **int128 edge cases** — negative summary = cold, decimals clamped to 18, avg capped at 10_000 bps.

## Still open

1. **SplitterV5 integration** — V4 has hardcoded `FEE_BPS = 200`. V5 would read `feeBpsFor(agent, agentId)` per deposit. Requires: agentId resolution path (self-registered map? setter?).
2. **Fork test against live Reputation Registry** — mocks cover logic, but the exact int128 decimal convention on Base mainnet is assumption-driven. Before wiring to V5, run a fork test pulling `getSummary(45074, [], "", "")` and verify decoded shape.
3. **Upgrade path for the tier table** — immutable for now. V2 bumps tiers.
4. **Gaming risk** — ERC-8004 feedback costs real USDC to emit, so the surface is acceptable. Monitor for Sybil attestation rings after launch.

## Verification plan

- Unit tests: fee computation per score tier, boundary conditions, agent without registration
- Fork test against live Reputation Registry on Base with known-score agent
- Simulated yield accrual with mixed fee tiers in a single block
