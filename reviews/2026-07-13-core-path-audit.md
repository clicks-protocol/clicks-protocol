# Clicks Core Path Audit

**Datum:** 2026-07-13
**Scope:** `contracts`, `sdk`, `mcp-server`, `acp-service`, `landing-v3`, `clawhub-skill`
**Ziel:** Prüfen, was in Clicks technisch und kommunikativ wirklich stimmt, was nicht stimmt, was riskant ist und was sofort bereinigt werden sollte.

---

## Kurzurteil

Clicks ist kein loses Konzept. Der Kern-Stack ist real:
- Live-Contracts auf Base
- funktionierender SDK-Kern
- MCP-Server
- Landing
- Skill-Surfaces
- ACP-Service-Ansatz

Der Hauptschaden sitzt aktuell **nicht** primär im Contract-Core, sondern in der Drift zwischen:
- echtem Code
- öffentlicher Doku
- Skill/Clawhub-Surface
- ACP-Monetisierungsstory
- neuer interner Positionierung

Die gefährlichste konkrete Lücke ist: **Referral wird öffentlich als live und durch `quickStart(..., referrer)` aktiviert verkauft, aber der aktuelle SDK-QuickStart nutzt den Referrer gar nicht.**

---

## Stimmt

### Contracts

- **Registry, SplitterV4, YieldRouter, FeeV2, Referral und ReputationMultiplier existieren real** und sind keine reine Mock-Story.
- **SplitterV4 bildet die Kernlogik sauber ab**: Payment rein, Liquid-Teil direkt an Agent, Yield-Teil an Router, Fee nur auf Yield. Siehe [ClicksSplitterV4.sol](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/contracts/ClicksSplitterV4.sol).
- **FeeV2 und Referral sind tatsächlich verdrahtet.** `ClicksFeeV2.collectFee()` liest die Referral-Chain und trackt claimable Rewards. Siehe [ClicksFeeV2.sol](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/contracts/ClicksFeeV2.sol).
- **V5 ist als echte Erweiterung vorhanden**, nicht nur als Idee. Es baut auf V4 auf und ergänzt Reputation-Tiers. Siehe [ClicksSplitterV5.sol](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/contracts/ClicksSplitterV5.sol).

### SDK / MCP

- **Der SDK-Kern ist echt und konsistent für die Basisfälle** `registerAgent`, `approveUSDC`, `receivePayment`, `withdrawYield`, `simulateSplit`, `getAgentInfo`.
- **Der MCP-Server ist nicht Fakeware.** Es sind tatsächlich 10 Tools registriert, inklusive `clicks_explain`. Siehe [mcp-server/src/index.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/mcp-server/src/index.ts:147) und [mcp-server/src/index.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/mcp-server/src/index.ts:461).
- **Landing v3 ist teilweise bereits auf die neue Positionierung gezogen.** Metadata und Schema sprechen schon `Agent Commerce Settlement Router`. Siehe [landing-v3/app/layout.tsx](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/landing-v3/app/layout.tsx:9).

### Strategische Richtung

- **Die neue Erweiterungslogik passt technisch zu Clicks.** `x402 -> Clicks -> Treasury Policy -> Identity/Reputation` ist eine Erweiterung des bestehenden Stacks, kein kompletter Produktbruch.

---

## Stimmt Nicht

### 1. Referral-Aktivierung über `quickStart(..., referrer)` stimmt aktuell nicht

- Der SDK-QuickStart akzeptiert `referrer?`, nutzt ihn aber nicht.
- Beleg: [sdk/src/client.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/sdk/src/client.ts:101)
- In der Methode wird nur:
  - registriert
  - USDC approved
  - `receivePayment(...)` aufgerufen
- Es gibt **keinen** Aufruf von `ClicksReferral.registerReferral(...)`.

**Folge:** Öffentliche Claims zur Referral-Aktivierung über QuickStart sind derzeit falsch.

### 2. Die x402-Integrationsdoku beschreibt einen anderen SDK als den echten

- Die Doku in [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md:56) nutzt einen Objekt-Konstruktor:
  - `new ClicksClient({ chainId, wallet, yieldPercentage })`
- Der echte SDK erwartet:
  - `new ClicksClient(signerOrProvider, options?)`
- Beleg echter Konstruktor: [sdk/src/client.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/sdk/src/client.ts:70)

Zusätzlich referenziert die Doku Methoden, die im aktuellen SDK nicht sichtbar vorhanden sind:
- `getYieldStatus()`
- `verifyPayment()`
- `routeToYield()`

Beleg: [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md:89), [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md:177), [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md:198)

### 3. Testzahlen und Sicherheitsclaims sind inkonsistent

Im Repo kursieren gleichzeitig:
- `227 tests passing` in [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:14), [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:249)
- `58/58 tests passing` in [agent-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/agent-skill/SKILL.md:209), [skills/clicks-protocol/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/skills/clicks-protocol/SKILL.md:234)
- `32 dedicated tests passing` für Referral im Whitepaper in [landing-v3/app/whitepaper/page.tsx](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/landing-v3/app/whitepaper/page.tsx:621)

Das kann alles gleichzeitig irgendwie erklärbar sein, ist aber öffentlich **nicht sauber kommuniziert** und wirkt aktuell widersprüchlich.

### 4. Public Surface ist noch nicht einheitlich auf die neue Positionierung gezogen

- Root-README ist immer noch stark `yield-first`. Siehe [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:41)
- Clawhub-Skill pitcht weiterhin `Autonomous DeFi yield for AI agents`. Siehe [clawhub-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/clawhub-skill/SKILL.md:19)
- Die Landing-Metadata ist schon weiter als README und Skill.

**Folge:** Es gibt aktuell keine einzige wirklich konsistente Public Story über alle Oberflächen hinweg.

### 5. Root-README enthält mindestens einen veralteten Discord-Link

- Badge-Link: [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:17)
- Text-Link: [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:25)

Beides weicht vom neu verifizierten Invite `FfmJGUcxfe` ab.

---

## Gefährlich

### 1. ACP-Service verkauft ein Referral-Onboarding, das technisch derzeit nicht belegt ist

Der ACP-Service ist nicht nur optimistisch formuliert, sondern baut sein Value Prop genau auf dem Referrer-Claim auf.

Belege:
- `The Trojan Horse` Kommentar in [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts:9)
- `clicks.quickStart(amount, clientAgentAddress, referrer)` in [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts:121)

Wenn QuickStart den Referrer nicht tatsächlich registriert, dann ist der Kernclaim des ACP-Service aktuell:
- technisch ungesichert
- kommunikativ riskant
- bei externer Nutzung potenziell irreführend

### 2. Skill und Clawhub können falsche Integrationsanleitungen verbreiten

Die Skill-Surfaces sind Discovery-Flächen. Wenn dort falsche SDK- oder Referral-Claims stehen, wird falsches Wissen repliziert:
- in Agents
- in Tool Lists
- in Clawhub
- potenziell in fremde Automationen

Das ist gefährlicher als eine einzelne veraltete Landing-Passage, weil es maschinell weitergetragen werden kann.

### 3. Morpho-APY ist im Router weiter eine Heuristik, nicht echte IRM-Auswertung

Beleg: [ClicksYieldRouter.sol](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/contracts/ClicksYieldRouter.sol:252)

`getMorphoAPY()` nutzt aktuell:
- Utilization-Proxy
- hartcodiertes `15%` Ceiling
- eigenes TODO für echte IRM-Integration

Das ist kein unmittelbarer Totalschaden, aber es ist gefährlich, wenn außen daraus zu harte APY- oder „best route“-Claims gemacht werden.

### 4. Security Claims wirken über mehrere Surfaces nicht synchron

Wenn eine Surface `227 tests`, die andere `58/58`, die nächste `all five production contracts`, die nächste `six contracts` kommuniziert, leidet:
- Glaubwürdigkeit
- Auditierbarkeit
- Vertrauen bei technischen Partnern

Das ist kein Smart-Contract-Hack-Risiko, aber ein ernstes Vertrauensrisiko.

---

## Sofort Fixen

### 1. Referral-Flow technisch oder kommunikativ geradeziehen

**Entweder:**
- `quickStart(..., referrer)` wirklich implementieren

**Oder:**
- überall die Referral-Aktivierung aus `quickStart` rausnehmen, bis sie real ist

Betroffene Flächen:
- [sdk/src/client.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/sdk/src/client.ts:101)
- [README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/README.md:176)
- [clawhub-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/clawhub-skill/SKILL.md:93)
- [skills/clicks-protocol/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/skills/clicks-protocol/SKILL.md:93)
- [agent-skill/SKILL.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/agent-skill/SKILL.md:93)
- [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts:121)

### 2. x402-Doku auf echten SDK-Stand ziehen

Die Datei [docs/x402-integration/README.md](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/docs/x402-integration/README.md:1) muss auf den realen `ClicksClient` umgeschrieben werden.

Konkret raus oder korrigieren:
- Objekt-Konstruktor
- `getYieldStatus`
- `verifyPayment`
- `routeToYield`
- jede Behauptung von „automatic interception“, die es so im Code nicht gibt

### 3. Root-README und Skill-Surfaces synchronisieren

Pflichtänderungen:
- Discord-Link auf gültigen Invite ziehen
- Yield-first-Headline gegen aktuelle Positionierung abgleichen
- Testzahlen vereinheitlichen oder präzisieren
- Claim-Set an `CLAUDE.md` + `STATUS.md` angleichen

### 4. ACP-Service-Kommentare entschärfen

`The Trojan Horse` in [acp-service/service.ts](/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/acp-service/service.ts:9) ist intern vielleicht witzig, aber:
- tonal schlecht
- strategisch unnötig
- bei späterer Außenwirkung riskant

Das sollte raus oder nüchtern auf echtes Treasury/Referral-Onboarding umgeschrieben werden.

### 5. Test- und Security-Claims zentralisieren

Es braucht eine einzige Referenz für:
- wie viele Tests aktuell in welchem Scope grün sind
- welche Sicherheitsprüfung wirklich gemacht wurde
- welche Contracts live sind

Am besten:
- eine zentrale Security/Verification-Datei
- alle README/Skill/Landing-Claims verweisen darauf

---

## Pfadweise Bewertung

### `contracts`

**Urteil:** Kern technisch ernsthaft. Nicht perfekt, aber real.

- Stärken:
  - klarer Produktkern
  - V4 live und verständlich
  - V5 als Erweiterung statt Bruch
  - Fee + Referral + Reputation modular
- Schwächen:
  - Morpho-APY-Proxy
  - potenziell zu viel öffentliche Behauptung um noch nicht komplett ausgerollte Features

### `sdk`

**Urteil:** Nutzbar, aber an einer kritischen Stelle inkonsistent mit der Story.

- Stärken:
  - einfacher Basiskern
  - Signer/Provider sauber getrennt
  - realistischer `quickStart`
- Schwächen:
  - `referrer`-Parameter ohne echte Wirkung

### `mcp-server`

**Urteil:** Echte Substanz. Weniger problematisch als Docs/Skill.

- Stärken:
  - echter Tool-Surface
  - reale Read/Write-Trennung
  - Usage Logging
- Schwächen:
  - öffentliche Claims darum herum müssen besser auf den tatsächlichen Capabilities bleiben

### `acp-service`

**Urteil:** Strategisch spannend, aktuell aber der riskanteste Pfad im Scope.

- Stärken:
  - echtes Produktdenken
  - reale Verbindung zwischen ACP und Clicks
- Schwächen:
  - zu starke Referral-Story bei unbewiesenem Flow
  - unnötig aggressive interne Sprache

### `landing-v3`

**Urteil:** Am weitesten in der neuen Positionierung, aber nicht sauber konsolidiert.

- Stärken:
  - neue Router-Story schon drin
  - Discovery-Surfaces vorhanden
- Schwächen:
  - Test-/Security-Zahlen nicht konsistent
  - Whitepaper und andere Subpages ziehen noch ältere Narrative mit

### `clawhub-skill`

**Urteil:** Wichtig, aber aktuell nicht verlässlich genug als öffentliche Truth Surface.

- Stärken:
  - gute Discovery
  - breite Integrationsfläche
- Schwächen:
  - alte Yield-Story
  - falscher oder ungesicherter Referral-Claim
  - Test-/Security-Claims nicht sauber synchronisiert

---

## Endfazit

Clicks ist in der Tiefe **mehr echt als oberflächlich sichtbar**. Das ist die gute Nachricht.

Die schlechte Nachricht:

Das Projekt sagt nach außen gerade nicht überall das, was es innen wirklich ist oder wirklich kann.

Die Priorität ist deshalb nicht:
- neuer Pitch
- neue Features
- neue Threads

sondern erst:
- Truth Surface säubern
- Referral-Realität klären
- x402-Doku auf echten Code zurückführen
- Skill, README und Landing synchronisieren

Wenn diese vier Dinge sauber sind, kann der neue strategische Frame glaubwürdig wachsen.
