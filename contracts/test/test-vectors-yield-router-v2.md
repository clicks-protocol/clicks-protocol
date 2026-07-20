# YieldRouter V2 — Test Vectors

Status: DRAFT 2026-05-21. Companion zu `strategy/YIELD-ROUTER-V2-DESIGN.md`. Liste aller Szenarien die V2 abdecken muss; jede Zeile ist ein eigener Test-Case.

Notation: `A`, `B`, `C` = Agents; `op` = aktuelles best-Protocol (1=Aave, 2=Morpho); `Δ` = APY-Difference; `T` = elapsed time since last action. Alle Beträge in USDC (6 dec).

---

## 1. Single-Agent Single-Backend (Sanity)

| # | Setup | Action | Expected |
|---|---|---|---|
| 1.1 | empty router, op=1 (Aave) | A deposits 100 | aaveDeposited[A]=100, morphoDeposited[A]=0, aUSDC≈100, no Morpho-position |
| 1.2 | nach 1.1, T+30d, Aave-Yield ~0.5 | A withdraw(0)  | A receives ≈100.5, aaveDeposited[A]=0, aUSDC=0 (oder dust) |
| 1.3 | empty router, op=2 (Morpho) | A deposits 100 | morphoDeposited[A]=100, aaveDeposited[A]=0, Morpho-supplyShares > 0 |
| 1.4 | nach 1.3, T+30d, Morpho-Yield ~0.5 | A withdraw(0) | A receives ≈100.5, morphoDeposited[A]=0, Morpho-position=0 |

## 2. Single-Agent Mixed Backend (Bug 1 Regression)

| # | Setup | Action | Expected |
|---|---|---|---|
| 2.1 | op=1 | A deposit 100 | aaveDeposited[A]=100 |
| 2.2 | nach 2.1, Δ flippt → op=2 | A deposit 50 | aaveDeposited[A]=100, morphoDeposited[A]=50, beide Positionen aktiv |
| 2.3 | nach 2.2 | A withdraw(80) | zieht zuerst aus einem (z.B. dem aktuellen op=Morpho), Rest aus dem anderen. Empfangener Betrag ≈80 + anteiliger Yield aus beiden Backends |
| 2.4 | nach 2.2 | A withdraw(0) | zieht alles aus beiden Backends, A erhält 150 + Yield |
| 2.5 | nach 2.4 | A.aaveDeposited == 0 && A.morphoDeposited == 0; aUSDC≈0, Morpho-pos≈0 |

## 3. Multi-Agent, Disjunkte Backends

| # | Setup | Action | Expected |
|---|---|---|---|
| 3.1 | op=1 → A deposit 100; flip → op=2 → B deposit 100 | — | aaveDeposited[A]=100, morphoDeposited[B]=100, aaveTotal=100, morphoTotal=100 |
| 3.2 | nach 3.1, T+30d | A withdraw(0) | A erhält 100+Yield aus Aave; B-Position unangetastet |
| 3.3 | nach 3.2 | B withdraw(0) | B erhält 100+Yield aus Morpho |

## 4. Multi-Agent, Cross-Backend Withdraw

| # | Setup | Action | Expected |
|---|---|---|---|
| 4.1 | op=1 → A dep 100, B dep 100 (beide Aave); flip → op=2 → C dep 50 (Morpho) | — | aaveTotal=200, morphoTotal=50 |
| 4.2 | nach 4.1, T+30d | A withdraw(0) | A bekommt 100 + (A's pro-rata Anteil von Aave-Yield), aUSDC sinkt, B unverändert |
| 4.3 | nach 4.2 | B withdraw(0) | B bekommt 100 + restlichen Aave-Yield-Anteil von B, aUSDC ≈ 0 |
| 4.4 | nach 4.3 | C withdraw(0) | C bekommt 50 + voller Morpho-Yield, Morpho-pos ≈ 0 |

## 5. Backend-Switch zwischen mehreren Deposits

| # | Setup | Action | Expected |
|---|---|---|---|
| 5.1 | op=1 | A dep 30 | aaveDeposited[A]=30 |
| 5.2 | flip op=2 | A dep 30 | aaveDeposited[A]=30, morphoDeposited[A]=30 |
| 5.3 | flip op=1 | A dep 30 | aaveDeposited[A]=60, morphoDeposited[A]=30 |
| 5.4 | nach 5.3 | A withdraw(45) | 45 wird zwischen Backends verteilt (z.B. 30 Morpho + 15 Aave); aaveDeposited[A]=45, morphoDeposited[A]=0 |
| 5.5 | nach 5.4 | A withdraw(0) | zieht restliche 45 aus Aave, A.balance=0 in beiden, kein orphaned dust für A |

## 6. Yield-Akkumulation Pro-Rata

| # | Setup | Action | Expected |
|---|---|---|---|
| 6.1 | op=1, A dep 100 bei T=0, B dep 100 bei T=15d, T jetzt=30d | A withdraw(0) | A bekommt Yield für 30d auf 100, B's Position unangetastet (er bekommt nur Yield für 15d in 6.2) |
| 6.2 | nach 6.1 | B withdraw(0) | B bekommt 100 + Yield für 15d (oder genauer: pro-rata anhand aUSDC/aaveTotal-Verhältnis) |
| 6.3 | op=2, A dep 100, B dep 100 gleichzeitig | T+30d, A withdraw(0) | A bekommt 100 + 50% des accrued Morpho-Yields |
| 6.4 | A dep 100, B dep 300 in Aave | T+30d, A withdraw(0), B withdraw(0) | A:B Yield-Verhältnis = 1:3 |

## 7. Final-Withdraw / Dust-Handling

| # | Setup | Action | Expected |
|---|---|---|---|
| 7.1 | A,B,C alle in Aave, alle withdrawen sequenziell | nach C-withdraw | aaveTotal=0, aUSDC=0 (letzter Withdrawer bekommt restlichen Dust) |
| 7.2 | A,B in Morpho, beide withdrawen | nach B-withdraw | morphoTotal=0, Morpho-supplyShares=0 |
| 7.3 | A,B,C in Aave; A withdrawt komplett | aaveTotal_after = aaveDeposited[B]+aaveDeposited[C]; aUSDC ≥ aaveTotal_after |
| 7.4 | aUSDC rounding-dust nach all-withdraw | letzter Agent bekommt actual aUSDC-Balance, nicht nur sein rechnerischer Share |

## 8. Edge Cases / Defensive Checks

| # | Setup | Action | Expected |
|---|---|---|---|
| 8.1 | jeder Stand | deposit(0, A) | revert ZeroAmount |
| 8.2 | jeder Stand | deposit(100, 0x0) | revert ZeroAddress |
| 8.3 | A hat 0 in beiden Backends | withdraw(0, A) | **revert InsufficientBalance** (Decision in V2-Design §3) — kein silent no-op |
| 8.4 | A.aaveDeposited=10, A.morphoDeposited=0 | withdraw(100, A) | zieht 10 (capped auf principal), kein revert für over-request |
| 8.5 | nicht-splitter caller | deposit / withdraw direkt | revert OnlySplitter |
| 8.6 | Splitter-Address per setSplitter geändert | alter Splitter ruft deposit | revert OnlySplitter |
| 8.7 | Owner setzt invalid Morpho-Markt | nächster Morpho-deposit | revert in Morpho.supply (vorhersehbar) |
| 8.8 | Aave Pool reverts (z.B. wegen Liquiditätsknappheit beim Withdraw) | A withdraw | revert propagiert, kein State-Update, A's Principal bleibt erhalten |

## 9. Reentrancy / CEI

| # | Szenario | Expected |
|---|---|---|
| 9.1 | Malicious Splitter, der bei deposit() callback macht | State ist konsistent vor external call, kein Re-Entry-Vorteil |
| 9.2 | Malicious USDC-Transfer-Hook bei Withdraw | aaveDeposited[A] / morphoDeposited[A] sind bereits dekrementiert, kein doppelter Drain möglich |
| 9.3 | Reentrancy auf rescueTokens (während Withdraw active) | Owner-only Modifier blockiert |

## 10. Migration / Owner-Operations

| # | Szenario | Expected |
|---|---|---|
| 10.1 | Owner ruft `rebalance(2)` während `aaveTotal > 0` | **revert OriginBucketNotEmpty** (Decision in V2-Design §2). Owner muss erst auf natürlichen Drain warten oder `forceMigrateAgents` (V2.1) nutzen. |
| 10.1b | `rebalance(2)` mit `aaveTotal == 0` (cold-start oder nach Drain) | zieht ggf. residual idle USDC im Router nach Morpho (sollte 0 sein), setzt `activeProtocol = 2`. Keine Per-Agent-State-Migration nötig. |
| 10.2 | Owner ruft `rescueTokens(usdc, ...)` mit funds in Backend | sollte revert oder explizit warning, da gefährlich |
| 10.3 | Owner setzt neuen Morpho-Markt während morphoDeposited > 0 | revert (oder Pflicht zu erst `rebalance(1)`) |

## 11. Real-Morpho-APY Verifikation

| # | Szenario | Expected |
|---|---|---|
| 11.1 | `getMorphoAPY()` integriert echten IRM | Wert ist innerhalb 5% Toleranz zu off-chain berechneter Morpho-supplyAPY (vergleiche gegen Morpho-Frontend-Wert für selben Markt) |
| 11.2 | Aave APY > Morpho APY um mehr als REBALANCE_THRESHOLD | `_getBestProtocol()` returnt 1 |
| 11.3 | Morpho APY > Aave APY um genau REBALANCE_THRESHOLD - 1 | returnt 1 (Aave default) |
| 11.4 | Morpho APY > Aave APY um exakt REBALANCE_THRESHOLD | returnt 2 |

## 12. Gas Targets (Referenz aus V1 für Vergleich)

Aus `clicks-protocol/program-gas.md` / Recent commits (`ad1ba95`, `fecdcf6`):

- V1 receivePayment Yield-Path: ~2_592_599 gas (Stand 2026-04 nach AR-gas Optimierungen)
- V1 withdrawYield: nicht im Heartbeat dokumentiert — benchmarken vor V2

V2 Target:
- Deposit: ≤ V1 + 10% (Tradeoff durch Per-Backend State akzeptiert)
- Withdraw single-backend: ≈ V1
- Withdraw mixed-backend: ≤ 2x V1-Withdraw (zwei Backend-Calls)

## 13. Property-Based / Invariant Tests

Invariants die zu jeder Zeit gelten müssen:

- **I1**: `Σ_a aaveDeposited[a] == aaveTotal`
- **I2**: `Σ_a morphoDeposited[a] == morphoTotal`
- **I3**: `aUSDC.balanceOf(router) ≥ aaveTotal` (Yield ist die positive Differenz). Bei `aaveTotal == 0` muss `aUSDC.balanceOf(router) == 0` gelten (final-withdraw räumt Dust).
- **I4**: `assetsFromShares(morpho.position(router).supplyShares) ≥ morphoTotal`
- **I5**: nach Withdraw(A, x): `aaveDeposited[A] + morphoDeposited[A]` ist um exakt `deltaPrincipal` reduziert wobei `deltaPrincipal = (x * prior_total) / agentShareUSDC` für partiellen Withdraw, oder `prior_total` für vollständigen Withdraw.
- **I6**: nach Withdraw(A, 0): A's beide Counter = 0
- **I7**: kein USDC sitzt idle im Router (außer transient während Withdraw): `usdc.balanceOf(router) == 0` zwischen Transaktionen
- **I8** (rebalance constraint): `rebalance(2)` reverts wenn `aaveTotal > 0`; `rebalance(1)` reverts wenn `morphoTotal > 0`
- **I9** (no-drain): kein einzelner Withdraw-Call kann mehr als `agentShareUSDC` aus dem aktiven Backend ziehen. Property-Check: für jeden Withdraw die emittierte `received`-Menge ≤ `agentShareUSDC_priorToCall`

Foundry/Echidna fuzz-runs für jeden Invariant, mind. 10_000 calls.

---

## Implementation-Plan

Tests werden in `contracts/test/YieldRouterV2.t.sol` (foundry) implementiert. Mocks für Aave V3 Pool und Morpho aus `contracts/test/Mocks.sol` erweitern um:

- Mock-Aave mit programmierbarer `currentLiquidityRate`
- Mock-Morpho mit programmierbarem IRM
- Yield-Accrual-Simulation via `vm.warp` + Index-Updates

Initialer Test-Setup-Sprint: ~1 Tag für Mocks, ~2 Tage für die Test-Vektoren oben.
