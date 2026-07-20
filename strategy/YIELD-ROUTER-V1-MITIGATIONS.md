# YieldRouter V1 — Interim Mitigations

Status: DRAFT 2026-05-21. Begleitet `strategy/YIELD-ROUTER-V2-DESIGN.md`. Beantwortet: was tun mit dem deployten V1-Router bis V2 fertig ist?

V1 Address: `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` (Base mainnet)

## Stand jetzt (2026-05-21 ~10:00 GMT+2)

On-chain Triage:

- `totalDeposited` = 1.030000 USDC
- `activeProtocol` = 2 (Morpho)
- Morpho-Position = 1.035885 USDC → **Orphaned Yield = 0.005885 USDC** ($0.006)
- aUSDC = 0
- 3 Deposit-Events (2x deployer self-test 0.02 + 0.01, 1x echter Agent 1.00) — alle direkt nach Morpho
- 0 Withdraw-Events, 0 Rebalance-Events

**Wichtig**: Bug 1 (Backend-Drift) ist in Production noch **nicht materialisiert**. Aave-Position ist seit Deploy 0. Bug 2 ist materialisiert (Yield orphaned), aber Magnitude < $0.01.

Bug 1 würde sich aktivieren sobald:
1. `getMorphoAPY()` < `getAaveAPY()` um mehr als 50bps → nächster Deposit ginge nach Aave und überschriebe `activeProtocol = 1`, während noch Funds in Morpho liegen.
2. Aktuell: `getMorphoAPY` ist ein utilization-Proxy bis 15% Ceiling. Bei realistischer Morpho-USDC-Utilization (~70-90%) gibt das ~10-13% scheinbare APY, während Aave ~3-5% real macht. Daher routet V1 de facto immer nach Morpho. Bug 1 ist latent, nicht aktiv.

---

## Mitigations-Optionen

### Option A — Splitter `yieldPct` per Operator auf 0 setzen

**Was**: `SplitterV4.setOperatorYieldPct(operator, 0)` für aktive Operatoren. Neue Inflows gehen 100% liquid an Agents, kein neuer Cent in den Yield-Router.

**Pro**:
- Stopt sofort weiteren Schaden bei neuen Deposits.
- Reversibel.
- Owner-Action, kein Vertragsupgrade.

**Contra**:
- `SplitterV4` enforced `MIN_YIELD_PCT = 5` (`:25`). `setOperatorYieldPct(op, 0)` → triggert `InvalidYieldPct`. Lesen wir den Code: `setOperatorYieldPct` validiert `pct == 0 || (pct ≥ MIN && pct ≤ MAX)`. Erlauben "0 = use default" als sentinel — das **erhöht** den Yield auf default 20%, nicht reduziert. Setter umgehen heißt: SplitterV4 selbst nachbauen oder `setDefaultYieldPct(MIN_YIELD_PCT=5)`.
- Bricht Marketing-Narrative ("get yield on your idle USDC"). Externe Wahrnehmung: "Clicks hat Yield abgeschaltet" → Vertrauensbruch.

**Aufwand**: 1 TX, wenn überhaupt möglich. Splitter-Code-Review nötig vor Ausführung.

**Empfehlung**: **Nur als Last-Resort** wenn Bug 1 aktiv getriggert wird.

### Option B — Status Quo + transparente Kommunikation

**Was**: V1 läuft weiter, wir geben aktiv bekannt: "Wir haben zwei bekannte Bugs (Backend-Drift, Yield-Sweep). V2 in Arbeit. V1 hat aktuell $0.006 orphaned Yield und 1.03 USDC TVL." Im Outreach (Twitter, Website-Banner, README) verlinken.

**Pro**:
- Ehrlichkeit > Verschleierung. Bei einem $1 TVL ist Kommunikation billiger als technical Patch.
- Researcher (0xAnmol) sieht: wir haben das gesehen, V2 ist in Arbeit. Vermeidet PR-Eskalation.

**Contra**:
- Tut weh wenn wir gleichzeitig Outreach machen für neue Agents/Partner.
- Risk: Researcher posted öffentlich bevor wir kommunizieren → wir sehen reaktiv aus.

**Aufwand**: 1-2h für Banner + Tweet + README-Update.

**Empfehlung**: **Default-Pfad** wenn V2 in < 2 Wochen ready ist.

### Option C — Owner-Rebalance bei jedem Backend-Switch

**Was**: Off-chain Watcher (cron) monitort `_getBestProtocol()`-Result. Sobald es flippt, ruft Owner-EOA `rebalance(neuesProtocol)` BEVOR der erste Splitter-Deposit ins neue Backend geht.

**Pro**:
- Verhindert Bug 1 prozedural.

**Contra**:
- Race-Condition: Splitter-Deposit kann zwischen Watcher-Check und Owner-Rebalance fallen. MEV-Bots können das gezielt ausnutzen.
- Bug 2 bleibt unberührt.
- Operativer Overhead (Watcher + Keeper-Funds).
- Bei aktuell V1-Volumen ($1 TVL) nicht wirtschaftlich.

**Aufwand**: 2-3 Tage Engineering + ongoing Keeper-Kosten.

**Empfehlung**: **Verwerfen.** Wirtschaftlichkeit nicht gegeben, MEV-Risk.

### Option D — Splitter V4.1 Hot-Patch, umgeht YieldRouter

**Was**: Neuen Splitter (V4.1 oder V5) deployen, der `yieldRouter`-Calls auskommentiert. 100% Liquid Routing. YieldRouter V1 bleibt mit den 1.03 USDC stehen, von Außen unerreichbar für neue Inflows.

**Pro**:
- Strukturell sauberer als A (kein "yieldPct=0"-Trick).
- Kann parallel zu V2-Development laufen.

**Contra**:
- SplitterV4's `yieldRouter` ist `immutable` → neuer Deploy zwingend.
- Existierende V1-Funds (1.03 USDC) bleiben in V1; müssen vor V2-Cutover manuell rausgezogen werden (siehe Migration M1 im Design-Doc).
- Frontend / Agents müssen auf neue Splitter-Address geupdated werden.

**Aufwand**: 1 Tag Deploy + Frontend-Update.

**Empfehlung**: **Wenn V2 noch > 4 Wochen weg ist**. Sonst direkt V2-Splitter.

### Option E — Drain via rescueTokens + manuelle Yield-Distribution

**Was**: Owner ruft `rescueTokens(aUsdc, balance, ownerEOA)` (geht nicht, da aUSDC=0 — also via Morpho-Withdraw stattdessen). Verteilt off-chain pro-rata an die 3 Deposit-Events nach Logik aus V2-Design (pro-rata anhand Principal × Time-In-Pool).

**Pro**:
- Sauberer Abschluss von V1.

**Contra**:
- `rescueTokens` ruft `_rawTransfer(token, to, amount)`. Funktioniert nur für ERC20-Token, die der Vertrag direkt hält. aUSDC=0 → nichts zu rescuen. Morpho-Position ist Shares, nicht Asset-Balance — `rescueTokens` kann Shares nicht direkt transferieren, müsste vorher via `morpho.withdraw(...)` in USDC umwandeln.
- Owner muss `morpho.withdraw(params, 0, supplyShares, router, owner)` aufrufen — geht nicht direkt, `rescueTokens` macht nur ERC20-Transfer, nicht Morpho-Call.
- Es gibt keinen Path um die Morpho-Position aus V1 ohne Agent-Withdraw zu drainen. → Option E erfordert dass die 3 Depositors selbst withdrawen, oder ein neuer Owner-Path im Vertrag — den V1 nicht hat.
- **De facto nicht durchführbar mit aktuellem V1-Code.**

**Aufwand**: Nicht durchführbar ohne Vertragsänderung. Verwerfen.

---

## Empfehlung

Bei 1.03 USDC TVL und Bug 1 nicht aktiv getriggert: **Option B (Status Quo + Kommunikation)** mit V2-Sprint forciert auf < 2 Wochen.

Fallback: **Option D (Splitter V4.1 / direkt V5)** wenn V2-Sprint slipt oder externe Sichtbarkeit auf den Bug entsteht (Researcher veröffentlicht, jemand exploitiert, etc.).

Sofort-Aktion empfohlen:
1. V2-Design freezen (siehe `YIELD-ROUTER-V2-DESIGN.md`).
2. Test-Vektoren-Doc reviewen (siehe `contracts/test/test-vectors-yield-router-v2.md`).
3. V2-Implementation-Sprint: Estimate 2 Wochen (1 Woche Code + Mocks + Tests, 1 Woche Audit-Buffer + Deploy + Frontend).
4. Externe Kommunikation noch **nicht** rausschicken — erst nach interner V2-Bestätigung. Falls Researcher inzwischen public geht: defensiver Public-Statement-Draft bereithalten.

Sofort-Aktion **nicht** empfohlen:
- Keine Splitter-Config-Änderungen ohne explizite Freigabe (David, 2026-05-21 10:20).
- Keine Mainnet-TX ohne explizite Freigabe.
- Keine Antwort an 0xAnmol (David, 2026-05-21 09:52).

---

## Worst-Case-Plan (wenn Bug 1 aktiv getriggert wird)

Trigger: `getMorphoAPY()` Drift, sodass `_getBestProtocol()` zu Aave switcht UND ein Splitter-Deposit kommt, BEVOR Owner rebalancen kann. Resultat: Morpho-Position bleibt liegen, neue Funds in Aave, Withdraws aus alten Morpho-Depositors revert.

Sequenz:
1. SOFORT: Owner ruft `rebalance(2)` (zurück nach Morpho, wo die größere Position liegt). Reverted falls Aave-Position bereits > 0 — dann erst `rebalance(1)` um alles in Aave zu konsolidieren.
2. Notfall-Splitter-Update (Option D — Splitter V4.1 ohne YieldRouter-Call) deployen.
3. Public Disclosure: "We patched X, no funds lost". Vorher: prüfen ob 0xAnmol noch responsibel ist, ggf. preempt-Communication.
