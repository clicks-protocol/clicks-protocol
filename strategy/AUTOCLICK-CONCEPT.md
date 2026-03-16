# AutoClick — Autoresearch Pattern für Clicks Protocol

> Stand: 2026-03-10
> Inspiriert von: karpathy/autoresearch
> Status: Konzept — David-Review

---

## Das Pattern

```
autoresearch:  Agent → ändert train.py → trainiert 5 Min → misst val_bpb → behält/verwirft → repeat
autoclick:     Agent → ändert [target] → testet → misst [metrik] → behält/verwirft → repeat
```

Karpathys Genie: Der Mensch programmiert nicht den Code. Er programmiert `program.md` — die Anweisungen für den Agent. Dann schläft er.

---

## 3 AutoClick-Loops für Clicks

### Loop 1: AutoYield — Yield-Strategie-Optimierung
**Was der Agent iteriert:** `strategy.ts` — Pool-Allokation, Split-Ratio, Rebalancing-Logik
**Metrik:** Simulierter APY über historische Daten (Aave + Morpho Rates der letzten 90 Tage)
**Zyklus:** 2 Min pro Experiment → ~30/Stunde → ~250 über Nacht

```
// strategy.ts — der Agent ändert NUR diese Datei
export const config = {
  splitRatio: 0.20,           // Agent testet 0.10–0.50
  pools: ['aave-v3'],         // Agent testet Kombinationen
  rebalanceThreshold: 0.02,   // Agent optimiert
  minDeposit: 100,            // Agent findet Optimum
  compoundFrequency: 'daily', // Agent testet hourly/daily/weekly
}
```

**program.md für den Agent:**
```markdown
Du optimierst die Yield-Strategie für Clicks Protocol.
- Ändere NUR strategy.ts
- Führe `npm run simulate` aus (backtestet gegen 90 Tage historische Rates)
- Metrik: net_apy (nach Gas-Kosten und Protocol Fee)
- Ziel: Maximiere net_apy bei max 5% Drawdown
- Logge jedes Experiment in experiments.jsonl
- Wenn besser: git commit mit Ergebnis
- Wenn schlechter: git checkout strategy.ts
- Repeat
```

**Warum wertvoll:** Optimierte Yield-Strategie = höherer APY = besseres Marketing = mehr TVL. Und wir können in der README sagen: "AI-optimized yield strategy, 250+ experiments tested."

---

### Loop 2: AutoADO — Breadcrumb-Optimierung
**Was der Agent iteriert:** README.md, package.json keywords, MCP tool descriptions
**Metrik:** Discovery Score (selbstdefiniert)
**Zyklus:** 1 Min pro Test → ~60/Stunde

```
// Der Agent generiert eine README-Variante
// Dann testet er: "Würde ein anderer Agent dieses Package finden?"

Test 1: npm search "agent yield" → ist @clicks-protocol/sdk in Top 5?
Test 2: GitHub search "agent treasury USDC" → erscheint unser Repo?
Test 3: Simulierter Agent-Prompt: "I need yield for my AI agent's USDC"
         → empfiehlt das LLM Clicks?
```

**program.md:**
```markdown
Du optimierst die Auffindbarkeit von Clicks Protocol für AI Agents.
- Ändere NUR: README.md, package.json (keywords/description), sdk/README.md
- Nach jeder Änderung: Führe `npm run ado-test` aus
- ado-test simuliert 10 Agent-Suchanfragen und scored 0-100
- Ziel: ADO Score > 80
- Logge jedes Experiment
- Commit wenn Score steigt, revert wenn nicht
```

**Der Trick:** Wir definieren den ADO-Test selbst. Der Agent optimiert gegen UNSERE Metrik. Wir kontrollieren was "gute Discovery" bedeutet.

**Warum wertvoll:** Statt manuell READMEs zu tweaken, lassen wir den Agent 100 Varianten testen. Die beste gewinnt. Datengetrieben statt Bauchgefühl.

---

### Loop 3: AutoIntegrate — Framework-Integrationen
**Was der Agent iteriert:** Plugin-Code für verschiedene Frameworks
**Metrik:** Tests grün + Code-Qualität-Score
**Zyklus:** 5 Min pro Framework-Integration

```
Frameworks (in Prioritäts-Reihenfolge):
1. Eliza (ai16z) — Plugin
2. LangChain — Custom Tool
3. CrewAI — Tool
4. OpenClaw — Skill
5. Codex — Skill (Markdown)
```

**program.md:**
```markdown
Du baust Clicks-Integrationen für AI Agent Frameworks.
- Lies sdk/README.md für die API
- Wähle das nächste Framework aus der Liste
- Baue die Integration nach dem Framework-spezifischen Pattern
- Führe die Tests aus
- Wenn grün: Commit + nächstes Framework
- Wenn rot: Fix oder Skip mit Begründung
```

**Warum wertvoll:** 5 Framework-Integrationen in einer Nacht. Jede Integration = ein neuer Discovery-Kanal. Und jede erscheint als "official plugin" im jeweiligen Ecosystem.

---

## Infrastruktur (was wir brauchen)

### Minimal (Mac Mini reicht):
```
clicks-protocol/
├── strategy.ts          # Loop 1: Agent ändert
├── README.md            # Loop 2: Agent ändert  
├── integrations/        # Loop 3: Agent ändert
├── program.md           # Wir schreiben
├── simulate.ts          # Yield-Backtester (einmal bauen)
├── ado-test.ts          # ADO-Score-Berechnung (einmal bauen)
└── experiments.jsonl    # Agent loggt alles
```

### Agent-Setup:
- **Claude Code** oder **Codex** im Repo mit `program.md`
- Permissions: nur Dateien im Repo ändern, npm/git ausführen
- Kein Internet-Zugang nötig (alles lokal)
- Overnight laufen lassen

### Was wir einmal bauen müssen:
1. **simulate.ts** — Yield-Backtester mit historischen Aave/Morpho Rates
2. **ado-test.ts** — ADO Score Berechnung (10 simulierte Suchanfragen)
3. **program.md** — Die "Forschungsanweisungen" für den Agent

---

## Priorität & Reihenfolge

| # | Loop | Impact | Aufwand (Setup) | Laufzeit |
|---|------|--------|-----------------|----------|
| 1 | **AutoADO** | 🔴 Höchste | 2-3h (ado-test bauen) | Über Nacht |
| 2 | **AutoIntegrate** | 🔴 Hoch | 1h (program.md) | Über Nacht |
| 3 | **AutoYield** | 🟡 Mittel | 4-5h (Backtester) | Über Nacht |

**AutoADO zuerst** — weil Discovery jetzt der Engpass ist. Kein Mensch kennt Clicks. Kein Agent findet Clicks. Das muss sich ändern bevor alles andere Sinn macht.

---

## Das Bigger Picture

```
Heute:    1 Agent (Emma) arbeitet an Clicks wenn David fragt
Morgen:   3 Loops laufen autonom über Nacht
Übermorgen: Agent-Schwarm optimiert Clicks 24/7

David schläft → Agents optimieren Yield-Strategie
David schläft → Agents testen 100 README-Varianten  
David schläft → Agents bauen 5 Framework-Plugins
David wacht auf → besseres Produkt, mehr Discovery, höherer APY
```

Das ist Karpathys Vision, angewandt auf ein DeFi-Produkt statt auf ML-Forschung. Gleiche Mechanik, anderes Ziel.

---

## Erster Schritt (heute Abend möglich)

1. `program.md` für AutoADO schreiben (30 Min)
2. `ado-test.ts` bauen — 10 Suchanfragen simulieren (2h)
3. Claude Code / Codex im Clicks-Repo starten mit `program.md`
4. Schlafen gehen
5. Morgens Ergebnisse reviewen

**Benötigte Entscheidung von David:**
- Repo public machen? (sonst kann npm search nicht getestet werden)
- Welchen Agent nutzen? (Claude Code empfohlen — Codex hat Token-Limits)
