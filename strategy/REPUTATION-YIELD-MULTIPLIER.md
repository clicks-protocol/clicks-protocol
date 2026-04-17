# Reputation-Yield Multiplier — V3 Design

**Status:** Design sketch, not implemented
**Prerequisite:** ERC-8004 mint complete (depends on Block 3)
**Target contract:** `ClicksReputationMultiplierV1.sol`

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

## Open questions

1. **Score source** — does ERC-8004 Reputation Registry expose a clean `scoreOf` view, or do we need to compute from feedback events? **Action:** read Reputation Registry ABI before implementing.
2. **Agents without ERC-8004 ID** — they get cold-start fee (3%). Alternative: fall back to referral-depth as a proxy signal.
3. **Upgrade path** — deploy as immutable standalone, or make `ClicksFeeV2` upgradable to swap multiplier? **Preference:** standalone immutable, wire via `ClicksFeeV2.setMultiplier()` (add setter if not present).
4. **Gaming risk** — can an agent inflate their score cheaply? ERC-8004 score is driven by paid validations and ACP job completions, so it costs real USDC to move. Acceptable surface.

## Verification plan

- Unit tests: fee computation per score tier, boundary conditions, agent without registration
- Fork test against live Reputation Registry on Base with known-score agent
- Simulated yield accrual with mixed fee tiers in a single block
