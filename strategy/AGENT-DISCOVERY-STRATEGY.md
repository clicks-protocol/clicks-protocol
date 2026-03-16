# Clicks Protocol — Agent Discovery Strategy (ADO)

> Stand: 2026-03-09
> Autor: Emma + David
> Status: ENTWURF — David-Review nötig

---

## Kernidee

Agents suchen nicht wie Menschen. Menschen googeln.  Agents crawlen Registries, lesen Docs, scannen npm, durchsuchen GitHub Topics, fragen MCP-Server ab. 

Wir optimieren nicht für Google. **Wir optimieren für Agent Discovery.**

AEO (Answer Engine Optimization) = Menschen fragen KI, KI gibt Clicks als Antwort.
ADO (Agent Discovery Optimization) = Agents suchen autonom nach Tools, finden Clicks als Integration.

**Beides machen. ADO ist unser Unfair Advantage — das macht noch niemand.**

---

## Zielgruppen

| Zielgruppe | Wie sie Clicks finden | Was sie brauchen |
|---|---|---|
| **Autonome Agents** | npm Registry, MCP Registry, GitHub, API Docs | SDK, MCP Server, klare API |
| **Agent-Entwickler** | GitHub, npm, Stack Overflow, Reddit, Discord | Docs, Examples, 3-Zeilen-Integration |
| **LLM-Suchmaschinen** | Website Content, llms.txt, Schema Markup | Strukturierte Antworten, klare Value Prop |
| **Crypto/DeFi Community** | Twitter/X, Discord, Farcaster, Mirror | Pitch, Numbers, TVL, APY |
| **Investoren / Grants** | Landing Page, Pitch Deck, Basescan | Traction, Unique Angle, Team |

---

## Kanal-Strategie: Wo wir Breadcrumbs legen

### Tier 1 — Agent-Native Kanäle (höchste Priorität)

Diese Kanäle werden direkt von Agents und deren Toolchains konsumiert.

#### 1. npm Registry
**Was:** `@clicks-protocol/sdk` publishen
**Warum:** npm ist die #1 Dependency-Quelle. Coding Agents (Claude Code, Codex, Cursor) suchen hier nach Packages.
**Keywords in package.json:**
```json
{
  "keywords": [
    "agent", "ai-agent", "yield", "defi", "usdc", 
    "x402", "base", "aave", "morpho", "agent-payments",
    "agent-yield", "stablecoin-yield", "auto-compound",
    "mcp", "openclaw", "agent-treasury", "float"
  ]
}
```
**README:** Kurz, 3-Zeilen-Quickstart, klare API-Docs. Agents lesen READMEs.
**Aufwand:** Niedrig (SDK existiert, nur publishen)
**Impact:** Hoch — jeder `npm search agent yield` findet uns

#### 2. MCP Registry
**Was:** `clicks-mcp` Server registrieren auf registry.modelcontextprotocol.io
**Warum:** MCP wird Standard (Xcode, Claude Code, OpenClaw). Agents entdecken Tools über MCP.
**Tools die der Server exposed:**
- `clicks.get_apy` — aktuelle Yield-Rates
- `clicks.get_balance` — Agent Balance abfragen
- `clicks.simulate_split` — Was bringt mir Clicks bei X USDC?
- `clicks.deposit` — USDC einzahlen
- `clicks.withdraw` — Yield abheben
**Aufwand:** Mittel (MCP Server bauen = Phase 3 API + MCP Wrapper)
**Impact:** Hoch — jeder MCP-kompatible Agent kann Clicks als Tool nutzen

#### 3. ClawHub (OpenClaw Skills Marketplace)
**Was:** `clicks-yield` Skill publishen
**Warum:** 220k+ OpenClaw-Instanzen (laut Kimi Claw Marketing). Ein `openclaw install clicks-yield` und der Agent verdient passiv.
**Skill-Inhalt:**
- SKILL.md: Was ist Clicks, wie aktivieren
- Scripts: Auto-Setup (Wallet verbinden, Split konfigurieren)
- References: APY-Daten, FAQ
**Aufwand:** Niedrig (Skill-Format kennen wir, SDK existiert)
**Impact:** Sehr hoch — direkter Zugang zum größten Agent-Ökosystem

#### 4. GitHub
**Was:** `clicks-protocol` Repo public machen, optimierte Topics + README
**Warum:** GitHub ist die #1 Quelle für Coding Agents. Claude Code, Codex, Cursor — alle crawlen GitHub.
**Topics:** `agent-payments` `yield-protocol` `x402` `base-chain` `defi` `ai-agents` `usdc` `aave` `morpho` `smart-contracts` `agent-treasury` `stablecoin-yield`
**README Struktur:**
1. One-Liner Pitch
2. 3-Zeilen Quickstart
3. Architektur-Diagram (Mermaid — wird von LLMs geparst)
4. Contract-Adressen
5. APY-Daten (live Badge wenn möglich)
6. Links zu SDK, MCP, ClawHub
**Aufwand:** Niedrig (Repo existiert, nur public + optimieren)
**Impact:** Hoch

#### 5. x402 Ecosystem
**Was:** Middleware die sich in bestehende x402-Zahlungen einklinkt
**Warum:** x402 ist DER Payment-Standard für Agents. Jede x402-Zahlung die durch unsere Middleware geht, geht automatisch durch Clicks.
**Integration:**
```typescript
// Vorher (ohne Clicks):
app.use(x402Middleware({ wallet }))

// Nachher (mit Clicks — eine Zeile mehr):
app.use(clicksMiddleware({ signer, agent }))
app.use(x402Middleware({ wallet }))
```
**Aufwand:** Niedrig (Middleware existiert in SDK)
**Impact:** Sehr hoch — jede x402-Integration ist ein potentieller Clicks-User

---

### Tier 2 — Developer Discovery Kanäle

Diese Kanäle erreichen die Entwickler die Agents bauen.

#### 6. llms.txt auf clicks-website
**Was:** Eine maschinenlesbare Datei auf der Website die LLMs direkt lesen
**Format:** https://llmstxt.org — wird zunehmend Standard
**Inhalt:**
```
# Clicks Protocol
> On-chain yield for AI agent payments. Auto-split USDC: 80% liquid, 20% DeFi yield.

## What Clicks Does
Every USDC payment to an agent is automatically split...

## Quick Start  
npm install @clicks-protocol/sdk

## API
- receivePayment(amount, agent): Split and route payment
- withdrawYield(agent): Withdraw earned yield
- getAPYs(): Current Aave/Morpho rates

## Links
- SDK: npm.js/package/@clicks-protocol/sdk
- MCP: registry.modelcontextprotocol.io/clicks
- GitHub: github.com/protogenos/clicks-protocol
- Docs: clicks.xyz/docs
```
**Aufwand:** Minimal (eine Datei)
**Impact:** Mittel — LLMs die Websites zusammenfassen nutzen das

#### 7. Schema.org / JSON-LD auf Website
**Was:** Strukturierte Daten die Crawler sofort parsen
**Typen:**
- `SoftwareApplication` — Clicks SDK
- `APIReference` — Contract Adressen, Endpoints
- `FAQPage` — "Wie verdient mein Agent Yield?"
- `Organization` — Clicks Protocol / protogenos
**Aufwand:** Niedrig (in Next.js Landing Page einbauen)
**Impact:** Mittel — Google, Bing, Perplexity, ChatGPT Search

#### 8. Developer Forums + Q&A
**Was:** Antworten auf echte Fragen die Agent-Entwickler stellen
**Wo:**
- Stack Overflow: Tags `x402`, `ai-agents`, `defi`, `usdc`
- GitHub Discussions: In x402, OpenClaw, Base Repos
- Reddit: r/cryptocurrency, r/defi, r/artificial, r/LocalLLaMA
- Discord: Base, OpenClaw, Virtuals, CDP
**Regel:** Keine Werbung. Echte Antworten auf echte Probleme. "Wie handle ich idle USDC in meinem Agent?" → Clicks als Lösung nennen, mit Code-Beispiel.
**Aufwand:** Laufend, 2-3 Posts pro Woche
**Impact:** Hoch — authentische Breadcrumbs die Agents und Entwickler finden

#### 9. Integration Examples / Templates
**Was:** Fertige Templates die andere Projekte als Ausgangspunkt nutzen
**Beispiele:**
- `clicks-x402-template` — x402 Agent mit Clicks Yield in 5 Minuten
- `clicks-openclaw-template` — OpenClaw Agent mit automatischem Yield
- `clicks-vercel-template` — "Deploy to Vercel" Button für Agent-APIs mit Clicks
**Warum:** Templates werden kopiert. Jede Kopie ist ein neuer Clicks-User.
**Aufwand:** Mittel
**Impact:** Hoch — Netzwerkeffekt durch Reproduktion

---

### Tier 3 — Human Marketing (klassisch, aber sekundär)

#### 10. Landing Page (clicks.xyz oder ähnlich)
- Hero: "Your agents earn money. Clicks makes that money earn more."
- Live APY Badge
- 3-Step Quickstart
- Calculator: "100 Agents × $1000 USDC/Monat = $X Yield/Jahr"
- llms.txt + Schema Markup + Open Graph

#### 11. Twitter/X Thread
- "Tether macht $6.5B Profit auf deinem Geld. Clicks gibt es zurück."
- Thread mit Architektur, Zahlen, Code-Beispiel
- Pin auf @protogenos Profil

#### 12. Base Ecosystem Grant
- Base fördert Projekte auf ihrer Chain
- Clicks = DeFi Infrastruktur für Agent Economy = genau ihr Fokus
- Grant-Antrag mit TVL-Projektion und Roadmap

#### 13. Farcaster / Mirror
- Crypto-native Plattformen
- Long-Form Artikel über Agent Economy + Yield
- Farcaster Frames für interaktive Demos

---

## Prioritäten-Matrix

| # | Kanal | Aufwand | Impact | Priorität | Wann |
|---|-------|---------|--------|-----------|------|
| 1 | ClawHub Skill | Niedrig | Sehr hoch | 🔴 SOFORT | Woche 1 |
| 2 | npm publish | Niedrig | Hoch | 🔴 SOFORT | Woche 1 |
| 3 | GitHub public + optimiert | Niedrig | Hoch | 🔴 SOFORT | Woche 1 |
| 4 | x402 Middleware Docs | Niedrig | Sehr hoch | 🔴 SOFORT | Woche 1 |
| 5 | Landing Page + llms.txt | Mittel | Hoch | 🟡 BALD | Woche 2-3 |
| 6 | MCP Server + Registry | Mittel | Hoch | 🟡 BALD | Woche 3-4 |
| 7 | Integration Templates | Mittel | Hoch | 🟡 BALD | Woche 3-4 |
| 8 | Developer Forums | Laufend | Hoch | 🟡 BALD | Ab Woche 2 |
| 9 | Twitter/X Launch Thread | Niedrig | Mittel | 🟢 LAUNCH | Monat 2 |
| 10 | Base Grant | Mittel | Hoch | 🟢 LAUNCH | Monat 2 |
| 11 | Schema.org / JSON-LD | Niedrig | Mittel | 🟢 LAUNCH | Mit Landing Page |
| 12 | Farcaster / Mirror | Niedrig | Mittel | 🔵 LATER | Monat 3+ |

---

## Metriken

| Metrik | Ziel (Monat 1) | Ziel (Monat 3) |
|--------|----------------|----------------|
| npm weekly downloads | 50 | 500 |
| GitHub Stars | 100 | 1.000 |
| ClawHub Installs | 20 | 200 |
| MCP Registry Queries | — | 100/Woche |
| Registered Agents (on-chain) | 5 | 50 |
| TVL (USDC) | $10k | $100k |
| Protocol Revenue (2% Yield Fee) | $14/Monat | $140/Monat |

---

## Kernprinzip

**ADO ≠ Marketing. ADO = Infrastruktur.**

Wir bauen keine Werbung. Wir bauen Touchpoints die Agents und ihre Entwickler natürlich finden:
- Ein npm Package das ein Problem löst
- Ein MCP Tool das eine Frage beantwortet  
- Ein Skill das mit einem Befehl installiert wird
- Eine Middleware die sich in einen bestehenden Stack einfügt

**Je weniger es nach Marketing aussieht, desto besser funktioniert es.**

Die beste Werbung für Clicks ist ein Agent der seinem Entwickler sagt: "Ich habe ein Tool gefunden das deinen idle USDC 7% Yield bringt. Soll ich es aktivieren?"

---

## Nächste Schritte

1. [ ] Domain sichern (clicks.xyz? clicksprotocol.xyz? useclicks.dev?)
2. [ ] GitHub Repo public machen + Topics + README optimieren
3. [ ] npm Package publishen
4. [ ] ClawHub Skill bauen + publishen
5. [ ] Landing Page (Next.js + Vercel) mit llms.txt
6. [ ] MCP Server bauen
7. [ ] Erste 10 Agents persönlich onboarden

---

*"With Speck fängt man Mäuse." — David, 09.03.2026*
*"ADO is the new SEO." — Emma*
