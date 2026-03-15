# Clicks Protocol — Security Self-Audit

**Date:** 2026-03-15
**Tool:** Slither v0.11.5
**Solidity:** ^0.8.20
**Contracts:** 5 production + 3 test/mock

## Summary

| Severity | Count | Action needed |
|----------|-------|---------------|
| 🔴 High | 1 | Fix before launch |
| 🟡 Medium | 3 | Evaluate, fix if feasible |
| 🟢 Low | 5 | Acceptable, document |
| ⚪ Info | 6 | No action needed |

## 🔴 High

### H-1: Reentrancy in YieldRouter.withdraw()

**File:** `ClicksYieldRouter.sol#178-246`
**Issue:** State variable `agentDeposited[agent]` is written AFTER external call to `morpho.withdraw()`. An attacker could reenter through a malicious Morpho callback.
**Risk:** Medium-High. Morpho is a trusted protocol, but the pattern is wrong.
**Fix:** Move `agentDeposited[agent] -= toWithdraw` and `totalDeposited -= toWithdraw` BEFORE the external call. Contract already uses ReentrancyGuard, but CEI pattern should still be followed.
**Status:** ⚠️ Fix required

## 🟡 Medium

### M-1: Locked Ether in 3 Contracts

**Files:** `ClicksFee.sol`, `ClicksSplitterV3.sol`, `ClicksYieldRouter.sol`
**Issue:** Functions marked `payable` for gas optimization, but no ETH withdrawal function exists. Any ETH sent to these contracts is permanently locked.
**Risk:** Low-Medium. These contracts handle USDC, not ETH. The `payable` is a gas optimization (saves ~200 gas per call by skipping msg.value check).
**Fix:** Either (a) add `rescueETH()` admin function, or (b) remove `payable` modifier (costs ~200 gas more per call).
**Recommendation:** Add `rescueETH()` to ClicksFee (owner-only). For Splitter/Router, the gas savings are intentional.

### M-2: Divide-Before-Multiply in getMorphoAPY()

**File:** `ClicksYieldRouter.sol#262-278`
**Issue:** `utilization = (totalBorrow * 1e18) / totalSupply` then `apyBps = (utilization * 1500) / 1e18`. Precision loss from first division.
**Risk:** Low. This is a view function for APY estimation, not used in any state-changing logic. Precision loss is negligible.
**Fix:** Could be rewritten as `(totalBorrow * 1500) / totalSupply` but risk of overflow with large values.
**Recommendation:** Acceptable as-is. Document that APY is an estimate.

### M-3: Dangerous Strict Equality (balance == 0)

**Files:** `ClicksFee.sol#73`, `ClicksYieldRouter.sol#346`
**Issue:** Using `==` for balance checks. An attacker could send 1 wei to bypass the check.
**Risk:** Low. `sweep()` is owner-only. `_rebalance` with `aBalance == 0` just skips Aave withdrawal when nothing deposited.
**Fix:** Use `<=` instead of `==` where appropriate.
**Recommendation:** Acceptable, but consider changing to `<=` for robustness.

## 🟢 Low

### L-1: Uninitialized Local Variables

**Files:** `ClicksYieldRouter.sol#341`, `ClicksRegistry.sol#64`
**Issue:** `balance` and `idx` start at 0 by default.
**Risk:** None. Solidity initializes to 0. Values are assigned before use.

### L-2: Unused Return Values

**File:** `ClicksYieldRouter.sol` (constructor + withdraw + supply)
**Issue:** Return values from `approve()`, `morpho.withdraw()`, `morpho.supply()` not checked.
**Risk:** Low. Using SafeERC20 for transfers. Morpho calls revert on failure.

### L-3: Dead Code

**File:** `ClicksYieldRouter.sol#321-333, #339-365`
**Issue:** `_depositAave()` and `_rebalance()` are never called.
**Risk:** None for security. Gas waste in deployment.
**Recommendation:** Remove before launch to save deployment gas, or keep for future rebalance feature.

### L-4: Costly Loop in distributeReferralYield()

**File:** `ClicksReferral.sol#242-267`
**Issue:** `totalReferralsPaid += reward` inside loop (up to MAX_LEVELS = 3).
**Risk:** None. Loop is bounded at 3 iterations max.

### L-5: Timestamp Comparisons in ClicksReferral

**File:** `ClicksReferral.sol`
**Issue:** Uses `block.timestamp` for discovery expiration.
**Risk:** Miners can manipulate timestamp by ~15 seconds. Not meaningful for expiration windows.

## ⚪ Informational

- **I-1:** Solc version warnings for OpenZeppelin interfaces (>=0.4.16, >=0.6.2). These are OZ defaults, not our code.
- **I-2:** Local variable shadowing in Mock contracts (test only).
- **I-3:** Assembly usage in gas-optimized functions. Intentional.
- **I-4:** Too-many-digits warnings for function selectors in assembly. Intentional.
- **I-5:** Missing inheritance in MockAavePool. Test contract only.
- **I-6:** Naming convention deviations (`_authorized`, `_id`). Minor style issue.

## DeFi Attack Vector Checklist

| Attack | Risk | Mitigation |
|--------|------|-----------|
| Reentrancy | Medium | ReentrancyGuard on all external functions. CEI violation in withdraw() needs fix (H-1). |
| Flash Loan | None | No price oracles, no liquidations, no flash-loan-sensitive logic. |
| Oracle Manipulation | None | No oracles used. APY view function is informational only. |
| Front-Running | Low | receivePayment and withdrawYield are user-specific. No MEV opportunity. |
| Integer Overflow | None | Solidity 0.8+ built-in overflow checks. Assembly blocks use manual checks. |
| Access Control | None | Ownable pattern. Agent operators properly scoped. |
| Denial of Service | Low | No unbounded loops in production contracts. Referral loop bounded at 3. |
| Proxy/Upgrade | None | No proxy pattern. Contracts are immutable. |
| Token Approval | Low | Infinite approval to Aave/Morpho in constructor. Standard DeFi pattern. |

## Required Actions Before Launch

1. **H-1:** Fix CEI violation in `withdraw()`. Move state updates before external call.
2. **M-1:** Consider adding `rescueETH()` to ClicksFee.
3. **L-3:** Decide on dead code: remove or keep for future use.

## Conclusion

No critical vulnerabilities found. One high-severity pattern issue (H-1: reentrancy pattern) is mitigated by ReentrancyGuard but should still be fixed for correctness. The contracts are overall well-structured with proper access controls, no proxy patterns, and bounded loops.

Third-party audit recommended before significant TVL.
