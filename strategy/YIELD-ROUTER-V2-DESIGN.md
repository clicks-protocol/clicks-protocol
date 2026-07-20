# YieldRouter V2 — Design Doc

Status: DRAFT — written 2026-05-21 in response to external responsible-disclosure (see "External Reports" below). No code committed. No deploy planned in this doc.

V1 contract under review: `ClicksYieldRouter` deployed at `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` (Base mainnet, deploy 2026-03-26, commit `40cb521e`).

---

## 1. Bug Catalog

### Bug 1 — Backend-Drift bei Deposit ohne Rebalance (critical for liveness)

`ClicksYieldRouter.deposit()` (`contracts/ClicksYieldRouter.sol:124-162`) routet jeden Einzahlung an `_getBestProtocol()` und überschreibt anschließend `activeProtocol`, ohne bestehende Bestände aus dem alten Backend zu rebalancen.

Folgesequenz:

1. t0: `activeProtocol = 1` (Aave), 1000 USDC in Aave gestaked.
2. t1: Agent zahlt 100 USDC. `_getBestProtocol() == 2` (Morpho). 100 USDC gehen nach Morpho. `activeProtocol := 2`.
3. t2: Ein Agent mit Aave-Principal ruft `withdraw()`. `withdraw()` liest `activeProtocol == 2`, versucht aus Morpho zu ziehen → reverts mit InsufficientBalance (Morpho hat nur 100 USDC).

Konsequenz: User-Funds in beiden Protokollen, aber Router nimmt nur eines an. Withdrawals locken sich aus, sobald Backend-Drift einmal auftrat. Owner kann via `rebalance()` reparieren, aber wenn der Drift bei jedem Deposit re-auftritt, ist das ein permanentes Race.

### Bug 2 — Orphaned Yield ("toWithdraw = principal", kein Yield-Sweep)

`withdraw()` (`contracts/ClicksYieldRouter.sol:169-238`) ruft `aavePool.withdraw(usdc, toWithdraw, address(this))` mit `toWithdraw = principal`. Aave V3 gibt **exakt** den angeforderten Asset-Betrag zurück; der Yield bleibt als aUSDC-Excess im Vertrag. Analog für Morpho mit `withdraw(params, toWithdraw, 0, …)`.

Resultat: `received ≈ toWithdraw`, `yieldEarned ≈ 0` in 100% der Fälle (außer bei Rundungsdrift). User bekommen **nie ihren Yield-Anteil**.

Wenn `totalDeposited` → 0 läuft, sitzt der gesamte akkumulierte Yield als aUSDC/Morpho-Shares fest. Theoretisch via `rescueTokens()` (`:422`) Owner-zugreifbar — das macht den Yield aber zu Owner-Captured-Revenue statt User-Yield und widerspricht dem Splitter-Versprechen "principal + yield returned to agent" (`ClicksSplitterV4` `withdrawYield()` rechnet `yieldEarned = received - withdrawPrincipal`, kommt also auf 0 aus dem Router).

### Bug 3 — `getMorphoAPY` ist eine fest-codierte TODO-Schätzung

`getMorphoAPY()` (`:254-276`) ist mit eigenem `TODO: integrate IRM contract` markiert: `apyBps = (utilization * 1500) / 1e18`. Das ist keine APY-Berechnung, sondern ein utilization-Proxy mit hartcodiertem 15%-Ceiling.

Folge: Bei realen Marktbedingungen schlägt der 50bps-Rebalance-Threshold (`REBALANCE_THRESHOLD`) fast nie an, Routing wählt de facto immer Aave. "Best protocol routing" ist nicht haltbar — nicht security-kritisch, aber Marketing-Risk und Argument für sauberen V2-Rewrite.

---

## 2. State-Architecture-Optionen

| | **Option A** — Per-Backend State | **Option B** — Single State + Force-Rebalance | **Option C** — Auto-Drain bei Switch |
|---|---|---|---|
| Per-agent storage | `aaveDeposited[a]` + `morphoDeposited[a]` | `agentDeposited[a]` (single) | `agentDeposited[a]` (single) |
| Bei Deposit | route ins beste Backend, increment richtiger Counter | wenn `bestProtocol != activeProtocol`: rebalance ALL first, dann deposit | wenn `bestProtocol != activeProtocol`: drain ALL aus altem Backend in den Vertrag, dann reposit + neue Deposit ins neue Backend |
| Bei Withdraw | iteriere beide Backends, ziehe nach Verfügbarkeit | nur aus `activeProtocol` ziehen, garantiert sufficient | nur aus `activeProtocol` ziehen |
| Gas Deposit | medium (1 backend call) | hoch (rebalance ist eine zusätzliche Komplett-Migration) | hoch (drain + redeposit) |
| Gas Withdraw | medium-hoch (potenziell 2 backend calls) | low | low |
| Funds-Lock-Risiko | **nein** (jeder Withdraw zieht aus seinem Backend) | nein (alle Funds immer in einem Backend) | nein |
| Implementierungs-Komplexität | medium | low-medium | medium |
| MEV/Front-Run | normal | rebalance-Transaktionen sind teure Hot-Path-Calls | dito |

**Empfehlung: Option A.**

Begründung:
- Eliminiert Bug 1 strukturell, nicht prozedural.
- Deposits sind die häufige Operation (Hot Path im Splitter), Withdraws die seltene. Gas-Kosten in der seltenen Operation hochziehen ist akzeptabel.
- Verhindert teure Hot-Path-Migrationen bei jedem 0.5%-APY-Flip.
- Erlaubt parallele Positions in beiden Backends als Feature (z.B. Risk-Diversifikation), nicht als Bug.
- Owner-`rebalance()` bleibt verfügbar für gezielte Konsolidierung — siehe Constraint unten.

**rebalance()-Semantik in Option A** (resolves Test-Vector 10.1):

`rebalance(toProtocol)` ist nur erlaubt wenn die Origin-Side bereits leer ist:
- für `toProtocol=2` (Aave→Morpho): require `aaveTotal == 0`
- für `toProtocol=1` (Morpho→Aave): require `morphoTotal == 0`

Andernfalls revert `OriginBucketNotEmpty`. Owner kann nicht Per-Agent-Mappings im Hot Path umindexieren (unbounded gas). Forced bulk-Migration kommt in V2.1 als gepagter `forceMigrateAgents(address[])`-Endpoint mit Bounded Iteration. Volle Begründung in §3 "Open Question Decision: rebalance() bei nicht-leerem Origin-Bucket".

---

## 3. Yield-Distribution

### Wann wird Yield realisiert

**Per-Withdraw mit aTokenBalance-Diff.** Beim Withdraw eines Agents zieht V2 anteilig seinen pro-rata-Share an aUSDC/Morpho-Shares, nicht einen festen USDC-Asset-Betrag.

**Aave-Withdraw, vollständig (`requested == 0` ODER `requested >= agentShareUSDC`):**

```
aaveTotal      = Σ_a aaveDeposited[a]
aTokenBalance  = aUsdc.balanceOf(address(this))
agentShareUSDC = (aaveDeposited[agent] * aTokenBalance) / aaveTotal
                 // = agent's Principal + sein pro-rata Yield, in USDC-Asset-Einheiten

aavePool.withdraw(usdc, agentShareUSDC, address(this))
                 // KEIN type(uint256).max — würde Multi-Agent-Pool drainen
                 // Wir ziehen exakt agentShareUSDC USDC; Aave burnt entsprechend viel aUSDC

aaveTotal_internal -= aaveDeposited[agent]
aaveDeposited[agent] = 0
```

**Aave-Withdraw, partiell (`0 < requested < agentShareUSDC`):**

```
agentShareUSDC = (aaveDeposited[agent] * aTokenBalance) / aaveTotal
require(requested <= agentShareUSDC, "InsufficientBalance")

// proportionaler Principal-Abbau
deltaPrincipal = (requested * aaveDeposited[agent]) / agentShareUSDC

aavePool.withdraw(usdc, requested, address(this))

aaveTotal_internal       -= deltaPrincipal
aaveDeposited[agent]     -= deltaPrincipal
```

**Morpho-Withdraw, vollständig**:

```
marketId       = computeId(morphoMarketParams)
(routerShares, , ) = morpho.position(marketId, address(this))
morphoTotal    = Σ_a morphoDeposited[a]
agentSharesToBurn = (morphoDeposited[agent] * routerShares) / morphoTotal

morpho.withdraw(morphoMarketParams, 0, agentSharesToBurn, address(this), address(this))
                 // shares-basiert, exakter Anteil — Yield ist implizit drin

morphoTotal_internal -= morphoDeposited[agent]
morphoDeposited[agent] = 0
```

**Morpho-Withdraw, partiell**: Wir kennen ex-ante nicht den exakten USDC-Wert der Shares (drift zwischen Block-Compounding und Read). Pragmatischer Ansatz: Convert `requested` USDC → required shares via `morpho.market()`-Read im selben Tx, dann `morpho.withdraw(..., 0, requiredShares, ...)`.

```
(totalSupplyAssets, totalSupplyShares, , , ,) = morpho.market(marketId)
requiredShares  = (requested * totalSupplyShares) / totalSupplyAssets
deltaPrincipal  = (requested * morphoDeposited[agent]) / agentSharesUSDC_view
                  // agentSharesUSDC_view = view-only Compute, akzeptiert minimalen drift

morpho.withdraw(morphoMarketParams, 0, requiredShares, address(this), address(this))
morphoTotal_internal -= deltaPrincipal
morphoDeposited[agent] -= deltaPrincipal
```

Wichtig in beiden Fällen:
- **Niemals `type(uint256).max` als Aave-amount** oder `routerShares` als Morpho-shares — würde den gesamten Pool zugunsten eines einzelnen Agents drainen.
- aTokenBalance ist immer ≥ aaveTotal (Yield ist die positive Differenz); aufrund-Edge-Cases (Aave burnt 1 wei aUSDC mehr als rechnerisch) lassen wir in der `aaveTotal_internal`-Bookkeeping unangetastet — die nächste Withdraw-Anteilberechnung normalisiert das automatisch via aTokenBalance/aaveTotal.

### Open Question Decision: rebalance() bei nicht-leerem Origin-Bucket

**Entscheidung**: `rebalance(toProtocol)` ist NUR erlaubt wenn die Origin-Side bereits 0 ist (`aaveTotal == 0` für Aave→Morpho-Switch, `morphoTotal == 0` umgekehrt). Andernfalls revert mit `OriginBucketNotEmpty`.

Begründung:
- Migration des per-agent-Mappings (`aaveDeposited[a] → morphoDeposited[a]` für alle Agents) ist unbounded gas, revert-prone.
- Alternative "merge mappings without per-agent loop" verletzt Invariant I3 (`aUSDC ≥ aaveTotal`), weil aUSDC dann 0 wäre aber aaveDeposited[a] > 0.
- Owner kann gezielt durch natürliche Drains (Agent-Withdraws) oder durch eine dedizierte `forceMigrateAgent(agent[])`-Funktion (V2.1 oder paged) migrieren.

V2-Scope: nur leere-Bucket-Restriction. Forced-Migration kommt in V2.1 sobald TVL Skalierung erfordert.

### Open Question Decision: withdraw bei Null-Balance

**Entscheidung**: `withdraw(_, agent)` revertet mit `InsufficientBalance` wenn `aaveDeposited[agent] == 0 && morphoDeposited[agent] == 0`. Kein silent no-op.

Begründung:
- Splitter (`SplitterV4.withdrawYield`) macht bereits `principalBefore`-Read und sollte gar nicht erst Router aufrufen wenn 0. Revert macht Splitter-Bugs sichtbar.
- Silent no-op return 0 maskiert UX-Bugs (User sieht "withdraw success" obwohl nichts passierte).
- Gas-Kosten von revert sind niedriger als die `_rawTransfer(0)`-Sequenz im no-op-Pfad.

Splitter-Anpassung erforderlich: Splitter V5 sollte vor Router-Call prüfen `(aaveDeposited[a] + morphoDeposited[a]) > 0` — sonst eigenen `NoBalance`-Revert werfen, damit Splitter-Caller einen klaren Error sieht.

### Pro-rata vs. Timestamp-Snapshot

- **Pro-rata (gewählt):** Yield wird nach aktuellem Stake-Anteil verteilt. Letzte Depositors bekommen weniger pro USDC, weil sie weniger lange im Pool waren.
- **Timestamp-Snapshot (rejected):** Erfordert per-Deposit Index-Tracking (à la Aave's `liquidityIndex`). Realistisch, aber 4x höhere Storage-Kosten pro Deposit.

Pro-rata ist die Standard-Lösung in Vault-Designs (ERC-4626). Wir akzeptieren den "Last-In-Weniger-Yield"-Effekt als feature: Frühe Depositors werden für Time-In-Pool belohnt, was die Adoption-Anreize richtig setzt.

### Wer bekommt Last-aUSDC-Dust (Final-Withdraw)

Wenn `aaveDeposited_total == 0` (alle Agents raus), kann durch Rundung 1-2 wei aUSDC im Vertrag liegen. Behandlung:

1. Letzter Agent bekommt **gesamten** verbleibenden aTokenBalance (nicht nur seinen rechnerischen Share). Verhindert Trapped Dust.
2. Fallback: `rescueTokens(aUsdc, ...)` für extreme Edge-Cases bleibt Owner-only.

---

## 4. Real Morpho APY

Morpho Blue's IRM ist marktspezifisch. Für USDC-Loan-Märkte auf Base wird typischerweise der `AdaptiveCurveIrm` verwendet.

**Action Item:** Abklären, welcher IRM-Contract aktuell für unseren USDC-Markt aktiv ist. Lesen via `morphoMarketParams.irm`. Aktueller Marktparam-State im Router muss vor V2-Design abgefragt werden.

Sobald IRM bekannt: das IRM-Interface bietet `borrowRateView(marketParams, market)` (oder `borrowRate(...)` non-view) das den aktuellen Borrow-Rate in ray (1e27/sec) zurückgibt. Supply-APY ergibt sich aus:

```
supplyRate = borrowRate * utilization * (1 - fee/1e18)
supplyAPYbps = supplyRate * 365 days * BPS / RAY
```

Wenn IRM-Integration zu invasiv ist (z.B. weil neue Markt-IDs Refactoring erfordern), Fallback-Plan:

- Off-chain Keeper (z.B. cron-job in `bots/`) berechnet beide APYs alle 4h und ruft eine `setExpectedAPYs(uint256 aave, uint256 morpho)`-Setter auf, der nur vom Keeper aufgerufen werden kann.
- Trade-off: Trust-Assumption auf Keeper, dafür kein on-chain IRM-Read.

Entscheidung: V2 implementiert IRM-Integration on-chain, mit Fallback auf off-chain Keeper als Phase-2.

---

## 5. Migration-Plan V1 → V2

### Bestand in V1 (Stand 2026-05-21 ~10:00 GMT+2)

On-chain ausgelesen (via `cast`-Äquivalent über RPC):

| Wert | Lesung |
|---|---|
| `totalDeposited` | 1_030_000 (= 1.030000 USDC) |
| `activeProtocol` | 2 (Morpho) |
| `getTotalBalance()` (Morpho-Position) | 1_035_885 (= 1.035885 USDC) |
| `aUsdc.balanceOf(router)` | 0 |
| `usdc.balanceOf(router)` (idle) | 0 |

→ Tatsächlich Orphaned Yield in V1 zum Snapshot: **5_885 micro-USDC ≈ $0.005885**.

→ aUSDC = 0 bestätigt: keine paralleler Aave-Position. Backend-Drift ist Stand jetzt noch **nicht** materialisiert (entweder noch nie aus Aave nach Morpho gewechselt mit Deposits, oder via Owner-`rebalance()` sauber umgezogen). Event-Triage (Deposited/Withdrawn/Rebalanced) läuft noch — Resultate werden separat ergänzt.

### Migration-Optionen

**Option M1 — Greenfield V2 Deploy + manuelle Drain.**

1. V2 deployen (neue Contract-Address).
2. SplitterV4 / SplitterV5 auf V2 umstellen (via `setSplitter` im neuen Router, plus Splitter selbst kennt YieldRouter immutable → erfordert auch Splitter-Redeploy, **wenn yieldRouter immutable bleibt**).
3. V1 `rebalance(activeProtocol)` als no-op, dann `withdraw()` jedes Agents → V1 leer.
4. Aktuell betroffene Agents (Auflistung aus Deposited-Events) bekommen ihre USDC aus V1 zurück + Yield-Anteil manuell aus dem 5_885 micro-USDC-Pool.

Pro: Sauber. V2-State-Schema unterscheidet sich (Option A), kein In-Place-Upgrade möglich.
Contra: SplitterV4 hat `yieldRouter` als `immutable` (siehe `ClicksSplitterV4.sol:32`) → Splitter muss ebenfalls neu deployed werden. Bei aktuell 1.03 USDC TVL ist das tolerierbar.

**Option M2 — V2-Address-Swap via Proxy.**

Erfordert dass V1 hinter einem Proxy läge. Tut es nicht. Verwerfen.

**Option M3 — In-Place Patch V1.**

Nicht möglich, V1 ist nicht upgradeable.

### Empfehlung

**Option M1.** Bei aktuell 1.03 USDC TVL ist Greenfield-Deploy die richtige Wahl. Migration-Plan:

1. V2-Router + Splitter-V4.1 (oder direkt V5) auf testnet → smoke tests.
2. V2-Suite auf mainnet deployen.
3. Off-chain Anweisung an aktuelle Agents: "Trigger withdraw, neue Deposits gehen ab Block X an die neue Splitter-Address."
4. V1 als deprecated markieren in README + Frontend.
5. Owner-Side: V1 `rescueTokens(aUsdc, residual, treasury)` nachdem alle Agent-Withdraws durch sind.

Die 1.03 USDC sind weniger als die Gas-Kosten eines Withdraws auf Base. Realistischere Annahme: Wir absorbieren die 1.03 USDC als Test-Verlust und kommunizieren transparent: "V1 had two accounting bugs, V2 fixes them, V1 funds for known testnet-like volumes will be reimbursed manually."

---

## 6. External Reports

### 2026-05-21 — 0xAnmol / Slayer Security Disclosure

- **Quelle**: Email an `security@clicksprotocol.xyz` (Cloudflare-Email-Routing-Alias, forwarded an `emma@joptimal.de`).
- **Vollständiger Email-Text**: in Telegram CLAW GROUP Topic 49, Message #4907 (2026-05-21 09:39 GMT+2), Sender `busy b` (= David, forwardet).
- **Researcher-Identität**:
  - X-Handle: `https://x.com/0xAnmol_`
  - Firma/Affiliation: Slayer Security (`https://slayer-security.xyz/`) — Reviewer auf der Hero-Case-Study der Firmen-Landingpage.
  - Sherlock Watson Profil: `audits.sherlock.xyz/watson/0xAnmol` — Rank #1270 all-time, 14 contests, 16 Highs + 19 Mediums, aktiv seit Juli 2023.
  - Code4rena Warden `0xanmol`: `code4rena.com/@0xanmol` — 3H + 6M findings, 4. Platz Intuition Audit März 2026, Ondo Finance, Salty.IO, Ethereum Credit Guild, Size.
- **Referenzierter Commit**: `40cb521ecdb4f0ed62eb79c58030d7e49592d987` im public Repo (Researcher hat über public main-Branch reviewed).
- **Disclosure-Sprache**: Englisch, Standard-Responsible-Disclosure-Format. Bittet um Security-Kontakt-Bestätigung vor Sharing von PoC/Repro-Steps. Keine Bounty-Forderung.
- **Prompt-Injection-Scan**: keine versteckten Instruktionen, keine Zero-Width-Chars, keine Tool-Call-Patterns. Saubere Mail.
- **Findings im Text**: "withdrawals redeem principal versus the full yield-bearing position", "withdrawals may use the wrong backend", "leave accrued yield unassigned after principal accounting is cleared".
- **Eigenständige Bestätigung (David, 2026-05-21 10:00-10:20)**: Findings decken sich exakt mit Bug 1 + Bug 2 aus eigener Code-Analyse. Bug 3 (Morpho-APY TODO) zusätzlich von uns aufgedeckt, nicht im Researcher-Text genannt.

**Hat 0xAnmol weitere Findings die wir nicht gesehen haben?**

Unbekannt — Researcher hat in der Email keine PoCs / Detail-Reports geteilt, um Bestätigung des Disclosure-Kanals abzuwarten. Davids Entscheidung 2026-05-21 09:52 GMT+2: "Wir antworten nicht darauf." → Wir bekommen keine weiteren Details über diesen Kanal.

Public Profil-Scan (Sherlock + Code4rena) zeigt: keine öffentlichen Clicks-Protocol-Findings unter 0xAnmols Handle. Disclosure ist privat zu uns gekommen.

**Status**: Antwort an Researcher per David-Entscheid suspended. Findings dennoch ernst genommen und in V2-Design eingearbeitet.

---

## 7. Offene Punkte für nächste Iteration

1. Event-Triage finishen (`Deposited` / `Withdrawn` / `Rebalanced` Counts aus V1 — Script läuft, RPC-Rate-Limit-Issue, kommt in Status-Update).
2. Aktive Morpho-Marktparams (`morphoMarketParams.irm`) on-chain auslesen → IRM-Contract identifizieren.
3. SplitterV5-Design (`strategy/SPLITTER-V5-DESIGN.md`) auf YieldRouter-V2-Interface abklopfen — ggf. Splitter-V5 schon auf V2 ausrichten.
4. Test-Vektoren (separates Doc: `contracts/test/test-vectors-yield-router-v2.md`).
5. V1-Mitigationen für die Übergangszeit (separates Doc: `strategy/YIELD-ROUTER-V1-MITIGATIONS.md`).
