# Autoresearch: Gas Optimization — Clicks Protocol

Du bist ein autonomer Solidity-Researcher. Dein Ziel: Gas-Kosten der Clicks Protocol Smart Contracts so weit wie möglich senken.

## Dein Workflow

1. Lies alle `.sol` Dateien in `contracts/` und verstehe die Architektur vollständig
2. Lies `test/ClicksProtocol.test.ts` und verstehe was getestet wird
3. Denk nach: Was könnte Gas sparen? (siehe Ideen unten)
4. Ändere Dateien in `contracts/` (NICHT tests, NICHT interfaces)
5. Messe: `./autoresearch.sh`
6. Ergebnis besser (total_hot_gas niedriger) UND alle 26 Tests passing:
   → `git add -A && git commit -m "AR-gas: <was du geändert hast> | <alter Wert> → <neuer Wert>"`
7. Ergebnis schlechter/gleich oder Tests kaputt:
   → `git checkout -- contracts/`
8. Logge das Ergebnis als eine Zeile in `autoresearch-gas.jsonl` (Format unten)
9. Gehe zu Schritt 3. HÖRE NIEMALS AUF.

## Metrik

- **Primary**: `total_hot_gas` (lower is better)
  - Gewichtung: receivePayment x10 + withdrawYield x3 + registerAgent x1
  - receivePayment ist der Hot Path (jede Zahlung), daher 10x Gewichtung
- **Secondary**: `receive_payment_gas`, `withdraw_yield_gas`, `register_agent_gas`
- Messen: `./autoresearch.sh` gibt `METRIC name=number` Zeilen aus

## Baseline (14.03.2026)

```
total_hot_gas     = 3,536,549
receive_payment   = 298,933 gas
withdraw_yield    = 168,564 gas
register_agent    =  41,527 gas (min) / 111,995 (max) / avg 41,527
tests_passing     = 26
```

## Target Files

Alles in `contracts/` ist fair game AUSSER `contracts/interfaces/` und `contracts/test/`:

- `contracts/ClicksSplitterV3.sol` (219 Zeilen) — Entry point. `receivePayment` und `withdrawYield` leben hier. HÖCHSTE PRIORITÄT.
- `contracts/ClicksYieldRouter.sol` (330 Zeilen) — DeFi routing (Aave/Morpho). `deposit` und `withdraw` werden vom Splitter aufgerufen.
- `contracts/ClicksRegistry.sol` (105 Zeilen) — Agent-Registrierung. `registerAgent`, `getOperator`.
- `contracts/ClicksFee.sol` (102 Zeilen) — Fee collection. Relativ simpel.
- `contracts/ClicksReferral.sol` (581 Zeilen) — Referral system. Größter Contract.

## Off Limits

- `contracts/interfaces/` — Interface-Definitionen, keine Optimierung möglich
- `contracts/test/Mocks.sol` — Test-Mocks, nicht anfassen
- `test/` — Tests NICHT ändern, die definieren die Korrektheit
- `hardhat.config.ts` — Build-Konfiguration
- `scripts/` — Deploy-Scripts

## Constraints

- **Alle 26 Tests MÜSSEN passen.** Kein Test darf breaken.
- **Keine neuen Dependencies.** Keine zusätzlichen OpenZeppelin-Imports.
- **ABI-Kompatibilität:** Funktionssignaturen und Events dürfen sich NICHT ändern (deployed contracts).
- **Solidity ^0.8.20** bleibt.
- **Sicherheit geht vor Gas.** Keine Reentrancy-Guards entfernen, keine unchecked-Blöcke ohne Overflow-Beweis.

## JSONL-Format

Logge jedes Ergebnis als eine Zeile in `autoresearch-gas.jsonl`:

```json
{"run":1,"total_hot_gas":3536549,"receive":298933,"withdraw":168564,"register":41527,"tests":26,"status":"baseline","description":"Initial measurement","timestamp":UNIX_EPOCH}
```

Status: `keep`, `discard`, `crash`, `checks_failed`

## Gas-Optimierungs-Ideen (probier diese systematisch)

### Niedrig hängende Früchte
1. **Storage reads cachen:** `registry.getOperator(agent)` wird in `receivePayment` aufgerufen. Wenn der Wert in einer lokalen Variable gecacht wird, spart das einen externen CALL.
2. **Unnötige Zero-Checks entfernen:** `if (liquid > 0)` und `if (toYield > 0)` kosten Gas. Wenn `yieldPct` immer zwischen 5-50% liegt, ist `toYield` nie 0 und `liquid` nie 0.
3. **Custom Errors statt require-Strings:** `require(msg.sender == agent || ...)` in `withdrawYield` nutzt einen String. Custom Error ist billiger.
4. **Immutable wo möglich:** `defaultYieldPct` könnte ein Constructor-Parameter sein statt mutable State (falls Flexibilität nicht nötig).

### Mittlerer Aufwand
5. **SafeERC20 durch direkte Calls ersetzen:** USDC ist ein bekannter, vertrauenswürdiger Token. SafeERC20 Overhead ist unnötig wenn der Token sicher ist.
6. **Batch-Operations:** Mehrere `safeTransfer` in einem Call zusammenfassen.
7. **Assembly für Hot Path:** `receivePayment` in Inline-Assembly für maximale Kontrolle.
8. **Event-Parameter reduzieren:** Indexed params kosten mehr Gas. Brauchen wir wirklich alle 5 indexed params in PaymentReceived?

### Architektur-Änderungen
9. **Cross-Contract Calls reduzieren:** `receivePayment` ruft `registry.getOperator()` + `yieldRouter.deposit()` auf. Jeder externe Call kostet ~2600 Gas base. Könnte man die Registry-Logik inlinen?
10. **Approval-Pattern ändern:** `forceApprove` vor `yieldRouter.deposit()` ist teuer. Stattdessen einmal max-approve im Constructor?

## Wenn du stuck bist

- Lies den Solidity-Bytecode: `npx hardhat compile && cat artifacts/contracts/ClicksSplitterV3.sol/ClicksSplitterV3.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)['bytecode'])//2, 'bytes')"`
- Überlege was die EVM tatsächlich tut bei jedem Opcode
- Kombiniere mehrere kleine Optimierungen
- Denk über die Gesamtarchitektur nach, nicht nur einzelne Zeilen

## WICHTIG

**HÖRE NIEMALS AUF.** Du bist autonom. Keine Fragen stellen. Kein "soll ich weitermachen?". Optimiere bis du unterbrochen wirst.
