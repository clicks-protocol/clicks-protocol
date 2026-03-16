# SEO Log — Clicks Protocol

## 2026-03-15 09:00 — Morgen-Check #1

### Landing Page SEO Audit (site/index.html)

**Meta Tags: ✅ Solide Basis**
- title: "Clicks Protocol — Autonomous Yield for AI Agents" ✅ (55 Zeichen, Keyword-vorne)
- meta description: "Clicks Protocol lets AI agents earn yield on idle USDC..." ✅ (107 Zeichen, gut)
- canonical: https://clicksprotocol.xyz ✅
- OG Tags: title, description, url, type, image ✅ komplett
- Twitter Card: summary_large_image ✅ mit eigenem Image
- robots: index, follow ✅
- favicon: SVG + PNG Fallback ✅
- lang="en" ✅

**Structured Data: ✅ Zwei Schema.org Blöcke**
1. SoftwareApplication (SDK) mit name, category, description, version, offers (free)
2. HowTo (Quick Start) mit 3 Steps: Install, Initialize, Register & Deposit
- Beides valide JSON-LD, korrekt eingebettet

**Keywords im Content:**
- Primär: "AI agents", "yield", "USDC", "Base", "DeFi", "autonomous" — alle im Hero + Description
- Sekundär: "SDK", "Aave", "Morpho", "referral", "treasury" — in Sections
- Fehlend: Kein h2/h3 mit "AI agent yield" als Phrase, kein FAQ-Section, kein Blog/Content Hub

**Technisches SEO:**
- Kein sitemap.xml gefunden
- Kein robots.txt gefunden
- Keine hreflang Tags (nur EN, akzeptabel)
- Keine Breadcrumbs (Single-Page, nicht nötig)
- llms.txt vorhanden und korrekt ✅ (agent.json Link in Footer)
- Kein Web Analytics (kein GA, kein Plausible, kein Fathom)

### Probleme & Empfehlungen

**P1 — Fehlende SEO-Infrastruktur:**
- [ ] `robots.txt` erstellen (Allow: /, Sitemap-Verweis)
- [ ] `sitemap.xml` erstellen (mindestens index.html + llms.txt)
- [ ] Analytics einbauen (Plausible oder Fathom empfohlen, privacy-freundlich)

**P2 — Content-Lücken für organischen Traffic:**
- [ ] FAQ-Section mit Schema.org FAQPage Markup hinzufügen
  - "What is Clicks Protocol?", "How do AI agents earn yield?", "What are the fees?", "Is there a lockup?"
- [ ] Blog/Content Hub planen (Launch erst nach Cloudflare Deploy)
  - Target-Keywords: "AI agent treasury management", "DeFi yield for bots", "autonomous agent finance"
- [ ] Docs als separate /docs Seite (bessere Indexierung als GitHub README)

**P3 — On-Page Optimierungen:**
- [ ] H2 "How It Works" → "How AI Agents Earn Yield with Clicks" (Keyword in Heading)
- [ ] H2 "Why Clicks" → "Why AI Agents Choose Clicks Protocol" (longtail)
- [ ] Alt-Text für alle visuellen Elemente (Emoji-Icons haben aria-label ✅, aber keine Images mit alt)
- [ ] Internal linking fehlt komplett (nur 1 Page, aber Anchor-Links könnten benannt werden)

**P4 — Fake Stats Problem:**
- Die Stat-Cards zeigen "$2.4M TVL", "1,247 Agents", "$84K Yield Earned" mit "Live data from Base Mainnet"
- Das ist irreführend wenn die echten Zahlen anders sind. Vor Launch: entweder echte Daten per Contract-Read oder Stats-Section entfernen/als "projected" kennzeichnen.

### Backlink-Chancen (ohne Web Search, basierend auf Projekt-Kontext)

**Sofort machbar (Tag 1-2):**
1. **npm Registry:** `@clicks-protocol/sdk` publish → npm zeigt README mit Links, wird von Copilot/Cursor indexiert
2. **GitHub Public Repo:** README mit clicksprotocol.xyz Link → DA ~95
3. **ClawHub Skill:** Publish = Link von clawhub.com
4. **MCP Registries:** modelcontextprotocol.io, glama.ai — MCP Server anmelden

**Post-Launch:**
5. **DeFi Aggregator Listings:** DeFiLlama, DeBank, Zapper (braucht echtes TVL)
6. **Base Ecosystem Page:** base.org/ecosystem — Application einreichen
7. **Aave/Morpho Integration Lists:** Als Integrator listen lassen
8. **Dev-Community Posts:** dev.to, hashnode, medium — "How to add yield to your AI agent in 3 lines"
9. **Crypto-News:** Pitches an The Block, Decrypt, CoinDesk (Launch Day)

**Content-Marketing Keywords (Longtail, low competition):**
- "AI agent treasury management" — quasi null Konkurrenz
- "USDC yield for autonomous agents" — neue Nische
- "DeFi yield SDK" — mittel
- "agent commerce protocol" — aufkommend
- "x402 payment yield" — hyper-nische, aber relevant

### Blocker
- ❌ Brave Search API Key fehlt → kein Wettbewerber-Monitoring, kein SERP-Tracking möglich
- ❌ Cloudflare Pages nicht deployed → Site noch nicht live/indexierbar
- ❌ Kein X/Discord Account → keine Social Signals für SEO

### Nächste Schritte (Prio-Reihenfolge)
1. robots.txt + sitemap.xml erstellen (5 Min)
2. FAQ-Section mit Schema.org Markup hinzufügen (30 Min)
3. H2-Headings keyword-optimieren (10 Min)
4. Stats-Section überarbeiten (fake → real oder entfernen)
5. Post-Deploy: Google Search Console einrichten
6. Post-Deploy: Base Ecosystem Application einreichen

---

## 2026-03-15 14:00 — Mittag-Check #2

### Keyword-Recherche: Vertiefung

**Marktkontext (aus Web-Recherche):**
- AI Agents managen ~35% aller DeFi Yield Strategies (CoinDesk, Jan 2026)
- $47B TVL in AI Yield Vaults, +210% YoY
- BlackRock/Fidelity bieten AI-managed Yield Vaults ($12B AUM seit Q3 2025)
- Noks: 5.000+ AI Trading Agents deployed, 200k+ Trades autonom
- ERC-8004 "Trustless Agents" + x402 = der neue Standard-Stack (Crypto.com Research, Feb 2026)
- SEC "Safe Harbor for Autonomous Agents" Framework reduziert Rechtsunsicherheit

**Keyword-Cluster (aktualisiert):**

| Cluster | Keywords | Wettbewerb | Clicks-Relevanz |
|---------|----------|------------|-----------------|
| Core | "AI agent yield", "autonomous agent yield" | Niedrig-Mittel | ★★★★★ |
| DeFi SDK | "DeFi SDK", "DeFi yield SDK", "agent DeFi SDK" | Null ("DeFi SDK" = 0 Exact-Match-Ergebnisse) | ★★★★★ |
| Agent Payments | "agent payments crypto", "x402 agent payments" | Niedrig | ★★★★ |
| Treasury | "AI agent treasury management", "agent idle USDC" | Quasi Null | ★★★★★ |
| Agentic DeFi | "agentic DeFi", "DeFAI", "autonomous DeFi" | Mittel (mehrere Artikel) | ★★★★ |
| Agent Wallet | "autonomous wallet", "ERC-8004 trustless agents" | Niedrig-Mittel | ★★★ |
| Yield Protocol | "USDC yield protocol", "Base chain yield" | Mittel | ★★★ |

**Neue Keywords (aus Competitor-Analyse):**
- "agent commerce protocol" — aufkommend, kein Wettbewerb
- "protocol-owned intelligence" — Cryptonium nutzt den Term, SEO-wert
- "agentic economy" — Crypto.com Research pusht das Narrativ
- "AI yield vault" — $47B TVL zeigt: der Term existiert, aber für Trading-Agents, nicht Infrastructure
- "agent transaction float" — unser einzigartiger Angle, 0 Konkurrenz

### Competitor SEO Analyse

**Direkte Competitors (Yield-for-Agents Nische):**
- Keiner gefunden. Clicks hat die Nische "passive yield on agent float" aktuell allein.
- Alle Ergebnisse für "AI agent yield" zeigen Trading/Active-Management Agents, NICHT passive Treasury Yield.
- Das ist Clicks' SEO-Chance: Wir definieren eine neue Kategorie.

**Indirekte Competitors (Content-Ebene):**

| Source | URL | DA (geschätzt) | Keyword-Fokus |
|--------|-----|----------------|---------------|
| Calmops | calmops.com/web3/ai-defi-trading-agents-complete-guide-2026/ | ~30 | "AI DeFi trading agents" — Fokus auf aktives Trading, nicht Yield |
| CryptoCoinVenture | cryptocoinventure.com/ai-agents-the-2026-yield-narrative/ | ~40 | "AI agents yield 2026" — Token-Analyse, nicht Infrastructure |
| Crypto.com Research | crypto.com/en/research/rise-of-autonomous-wallet-feb-2026 | ~90 | ERC-8004 + x402 — genau unser Stack. Erwähnt Clicks nicht. |
| Cryptonium | cryptonium.cloud/articles/... | ~25 | "Protocol-Owned Intelligence", "Sentient DeFi" — akademisch |
| Cleansky | cleansky.io/blog/ai-trading-agents-2026/ | ~20 | "AI trading agents 2026" — Performance-Analyse |
| LinkedIn (DeFAI) | linkedin.com/pulse/defai-2026-... | ~95 | "DeFAI" — Narrativ-Artikel, nicht technisch |

**Wichtigstes Finding:** Crypto.com Research (DA ~90) hat den ERC-8004 + x402 Report veröffentlicht. Clicks baut genau auf diesem Stack. Der Report erwähnt keine Yield-on-Float Lösung. Das ist die Lücke.

### Programmatic SEO: Content-Ideen

**Sofort umsetzbar (Landing Pages / Blog Posts):**

1. **"What is Agent Treasury Yield?"** (Definition Page)
   - Ziel: Eigenen Term definieren bevor Konkurrenz aufkommt
   - Keywords: "agent treasury yield", "AI agent idle funds", "USDC float yield"
   - Format: 1.500 Wörter, FAQ-Schema, Calculator Widget

2. **"AI Agent Yield vs AI Agent Trading: What's the Difference?"**
   - Ziel: Differenzierung von Trading-Bots (alle Competitor-Content)
   - Keywords: "AI agent yield vs trading", "passive DeFi yield agents"
   - Format: Vergleichstabelle, klare Positionierung

3. **"How x402 Agents Can Earn Yield on Every Payment"**
   - Ziel: x402-Community abgreifen (Coinbase-backed, growing)
   - Keywords: "x402 yield", "x402 agent payments yield"
   - Format: Tutorial mit Code-Beispiel (quickStart)

4. **"ERC-8004 + Clicks: Trustless Agent Yield in 3 Lines of Code"**
   - Ziel: ERC-8004 Search Traffic (Crypto.com Report treibt Interesse)
   - Keywords: "ERC-8004 yield", "trustless agent DeFi"
   - Format: Dev-Tutorial, GitHub Gist

**Programmatic SEO (skalierbar):**

5. **"/yield/{protocol}" Pages** — z.B. /yield/aave, /yield/morpho
   - Auto-generiert aus on-chain Daten (APY, TVL, historische Rates)
   - Keywords: "{protocol} yield rate", "{protocol} APY 2026"

6. **"/compare/{protocol-a}-vs-{protocol-b}" Pages**
   - Aave vs Morpho, Clicks vs manuelles Staking
   - Keywords: "Aave vs Morpho yield", "best DeFi yield 2026"

7. **"/glossary/{term}" Pages** — Agent Commerce Glossar
   - Terms: Float, TVL, APY, Split Ratio, Protocol Fee, Agent Wallet
   - Jeder Term = eigene Seite mit Schema.org DefinedTerm Markup

### Status-Delta seit Morgen-Check

| Item | 09:00 Status | 14:00 Status |
|------|-------------|-------------|
| robots.txt | ❌ Fehlt | ❌ Fehlt (Cloudflare Deploy blockt) |
| sitemap.xml | ❌ Fehlt | ❌ Fehlt |
| FAQ-Section | ❌ Fehlt | ❌ Fehlt |
| Brave API Key | ❌ Fehlt | ❌ Fehlt (DDG als Fallback, rate-limited) |
| Competitor-Map | Nicht begonnen | ✅ 6 Competitors analysiert |
| Keyword-Cluster | 5 Longtails | ✅ 7 Cluster, 15+ Keywords |
| Content-Plan | Nicht begonnen | ✅ 7 Content-Ideen (4 Blog + 3 Programmatic) |

### Blocker (unverändert)
- ❌ Brave Search API Key fehlt → SERP-Tracking unmöglich
- ❌ Cloudflare Pages nicht deployed → nichts indexierbar
- ❌ Kein X/Discord → keine Social Signals
- ❌ DDG rate-limited (Captcha nach 2 Queries) → Web-Recherche eingeschränkt

### Empfehlung an David
1. **Brave API Key konfigurieren** — ohne Search API ist SEO-Monitoring blind
2. **Cloudflare Deploy** — alles SEO-Arbeit ist wertlos solange die Site nicht live ist
3. **Content-Hub priorisieren** — die Nische "agent treasury yield" ist LEER. First-Mover-Advantage ist jetzt.

---

## 2026-03-15 19:00 — Abend-Check #3

### Tages-Summary

**Was wurde heute optimiert:**
- Vollständiger SEO Audit der Landing Page durchgeführt (Meta, Schema.org, Keywords, Technik)
- 7 Keyword-Cluster mit 15+ Keywords identifiziert und priorisiert
- 6 indirekte Competitors analysiert (kein direkter Competitor in der Nische)
- 7 Content-Ideen entwickelt (4 Blog + 3 Programmatic SEO)
- Key Finding: "Agent Treasury Yield" Nische ist komplett leer. Clicks ist First Mover.

**Was NICHT optimiert wurde (Blocker):**
- Kein robots.txt, kein sitemap.xml, kein FAQ-Schema erstellt (wartend auf Cloudflare Deploy)
- H2-Headings nicht keyword-optimiert (Entscheidung: zusammen mit FAQ-Section machen)
- Stats-Section (Fake-Daten) nicht überarbeitet
- Kein Analytics eingebaut

**Grund:** Alle On-Page-Änderungen bringen null Wert solange die Site nicht deployed ist. Cloudflare Pages Deploy ist der Blocker für alles.

### Offene SEO Tasks für Morgen (Prio-Reihenfolge)

**P0 (Blocker-abhängig, sofort nach Deploy):**
1. `robots.txt` erstellen: `User-agent: * / Allow: / / Sitemap: https://clicksprotocol.xyz/sitemap.xml`
2. `sitemap.xml` erstellen: index.html, docs/index.html, llms.txt
3. Google Search Console einrichten + Sitemap einreichen

**P1 (Kann ohne Deploy vorbereitet werden):**
4. FAQ-Section mit FAQPage Schema.org Markup schreiben (4-6 Fragen)
5. H2-Headings keyword-optimieren ("How AI Agents Earn Yield with Clicks", etc.)
6. Stats-Section: Fake-Daten entfernen oder als "projected" kennzeichnen

**P2 (Content-Pipeline starten):**
7. Blog-Post #1 draften: "What is Agent Treasury Yield?" (Definition Page, 1.500 Wörter)
8. Glossary-Struktur planen: /glossary/{term} mit DefinedTerm Schema

**P3 (Backlinks vorbereiten):**
9. npm publish `@clicks-protocol/sdk` → automatischer Backlink (DA ~95)
10. Base Ecosystem Application vorbereiten

### Schema.org/JSON-LD Verbesserungen (Plan)

**Aktuell vorhanden:**
- ✅ SoftwareApplication (SDK)
- ✅ HowTo (Quick Start, 3 Steps)

**Geplante Ergänzungen:**

| Schema Type | Zweck | Prio | Status |
|-------------|-------|------|--------|
| FAQPage | FAQ-Section (4-6 Fragen) | P1 | Noch nicht erstellt |
| Organization | Clicks Protocol als Entity (name, url, logo, sameAs) | P1 | Noch nicht erstellt |
| WebSite | Site-Level Schema mit SearchAction | P2 | Noch nicht erstellt |
| DefinedTerm | Glossar-Einträge (Float, TVL, APY, Split Ratio) | P2 | Konzept steht |
| Article | Blog Posts (wenn Content-Hub live) | P3 | Wartend auf Blog |
| BreadcrumbList | Navigation (wenn Multi-Page) | P3 | Nicht relevant für Single-Page |

**FAQ-Schema Draft (zur Vorbereitung):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Clicks Protocol?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Clicks Protocol is an on-chain yield layer for AI agents. It splits incoming USDC 80/20: 80% stays liquid for the agent, 20% earns DeFi yield through Aave V3 and Morpho on Base. Agents can withdraw anytime with no lockup."
      }
    },
    {
      "@type": "Question",
      "name": "How do AI agents earn yield with Clicks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Agents call quickStart() from the Clicks SDK with their USDC amount. The protocol automatically splits funds 80/20, routes the yield portion to audited DeFi strategies, and the agent earns 4-10% APY on the deposited portion."
      }
    },
    {
      "@type": "Question",
      "name": "What are the fees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Clicks charges a 2% protocol fee on yield earned only. There is no fee on deposits, withdrawals, or principal. If the agent earns zero yield, Clicks earns zero fees."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a lockup period?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Agents can withdraw their full balance (80% liquid + 20% yield portion) at any time. There is no lockup, no vesting, and no penalties for early withdrawal."
      }
    },
    {
      "@type": "Question",
      "name": "Which chains does Clicks support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Clicks Protocol is deployed on Base (Coinbase L2). Base was chosen for low gas fees, fast finality, and strong DeFi infrastructure including Aave V3 and Morpho."
      }
    }
  ]
}
```

**Organization Schema Draft:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Clicks Protocol",
  "url": "https://clicksprotocol.xyz",
  "description": "Autonomous yield layer for AI agents on Base",
  "foundingDate": "2026"
}
```

### Tages-Bilanz

| Metrik | Wert |
|--------|------|
| SEO-Checks heute | 3 (Morgen, Mittag, Abend) |
| On-Page-Änderungen live | 0 (Blocker: Deploy) |
| Keywords identifiziert | 15+ in 7 Clustern |
| Competitors analysiert | 6 (0 direkt) |
| Content-Ideen | 7 |
| Schema.org Blöcke geplant | 4 neue (FAQ, Org, WebSite, DefinedTerm) |
| Größte Chance | "Agent Treasury Yield" Nische ist leer |
| Größter Blocker | Cloudflare Pages Deploy |

### Empfehlung

Die SEO-Arbeit ist inhaltlich solide vorbereitet. Keyword-Cluster, Competitor-Map, Content-Plan und Schema-Drafts stehen. Alles wartet auf einen einzigen Trigger: **Cloudflare Pages Deploy**. Ohne Deploy ist jede weitere SEO-Optimierung theoretisch. Morgen: P1-Tasks (FAQ + H2-Headings) als fertige Code-Blöcke vorbereiten, damit sie sofort eingefügt werden können wenn deployed wird.

---

## 2026-03-16 09:00 — Morgen-Check #4

### Mission Control Tasks Status

**Blocker aus letztem Check (15.03. Abend):**
| Task | 15.03. Status | 16.03. Status | Delta |
|------|---------------|---------------|-------|
| Cloudflare Deploy | ❌ Nicht live | ✅ **LIVE** (clicksprotocol.xyz antwortet mit 200) | 🎉 Deployed! |
| robots.txt | ❌ Fehlt | ❌ Fehlt (URL liefert index.html als Catch-All) | Kein Fortschritt |
| sitemap.xml | ❌ Fehlt | ❌ Fehlt (URL liefert index.html als Catch-All) | Kein Fortschritt |
| Brave API Key | ❌ Fehlt | ❌ Fehlt | Kein Fortschritt |
| npm publish SDK | ❌ Nicht publiziert | ❌ Nicht publiziert (npmjs.com/package/@clicks-protocol/sdk zeigt Sign-In, kein Package) | Kein Fortschritt |
| GitHub Org Public Repo | ❌ Kein Public Repo | ❌ Org existiert (github.com/clicksprotocol), aber kein öffentliches Repo sichtbar | Kein Fortschritt |
| Google Search Console | ❌ Nicht eingerichtet | ❌ Nicht eingerichtet | Kein Fortschritt |

### Landing Page SEO Audit (Live-Site)

**🚨 KRITISCH: Meta Robots = `noindex, nofollow`**

Die Live-Site hat im `<head>`:
```html
<meta name="robots" content="noindex, nofollow">
```
Das bedeutet: Google wird die Seite NICHT indexieren. Alle anderen SEO-Maßnahmen sind wertlos solange das nicht auf `index, follow` geändert wird.

Dieses Tag steht auch in der LAUNCH-CHECKLIST.md als To-Do:
> `site/index.html: noindex → index, follow ändern`

**Empfehlung: Das ist der #1 SEO-Blocker. Muss vor allem anderen gefixt werden.**

**Meta Tags (Rest unverändert, weiterhin solide):**
- title: "Clicks Protocol — Autonomous Yield for AI Agents" ✅
- description: ✅ (107 Zeichen)
- canonical: https://clicksprotocol.xyz ✅
- OG Tags: ✅ komplett
- Twitter Card: ✅
- Structured Data: ✅ (SoftwareApplication + HowTo)

**Stats-Section: ✅ Gefixt seit letztem Check**
- Alte Fake-Stats ("$2.4M TVL", "1,247 Agents") sind entfernt
- Neue Stats sind Protokoll-Fakten: "80/20 Split", "1 Call", "0 Lockup", "Base L2"
- Kein "Live data from Base Mainnet" Disclaimer mehr nötig
- Gute Entscheidung: faktisch korrekt und irreführungsfrei

**Fehlende SEO-Infrastruktur (weiterhin):**
- ❌ robots.txt (Cloudflare liefert index.html für alle unbekannten Pfade)
- ❌ sitemap.xml
- ❌ FAQ-Section (Schema-Draft liegt bereit, siehe 15.03. Abend-Check)
- ❌ Organization Schema.org Block
- ❌ Analytics (kein GA, Plausible, Fathom)
- ❌ H2-Headings nicht keyword-optimiert

### On-Page Findings (neu)

**Positiv:**
- Logo-SVG hat `alt="Clicks Protocol"` ✅
- Footer-Links zu Docs, GitHub, npm, Contact, llms.txt, agent.json ✅
- Docs-Seite existiert unter /docs/index.html ✅
- agent.json + llms.txt weiterhin korrekt verlinkt ✅

**Problematisch:**
- GitHub-Links zeigen auf `github.com/openclawemmaschneider/clicks-protocol` (nicht die clicksprotocol Org)
  - Hero: "Read Docs" → openclawemmaschneider Repo
  - SDK Section: "Read the Docs" → openclawemmaschneider Repo
  - Footer: "GitHub" → github.com/clicksprotocol (korrekt, aber Org hat kein Public Repo)
  - Inkonsistenz: Docs-Links gehen zu einem persönlichen Account, Footer geht zur Org

### Backlink-Status

| Kanal | Status | Aktion nötig |
|-------|--------|-------------|
| npm Registry (@clicks-protocol/sdk) | ❌ Nicht publiziert | Publish = automatischer DA-95-Backlink |
| GitHub (clicksprotocol Org) | ⚠️ Org existiert, kein Public Repo | Repo public machen + Transfer |
| Cloudflare Pages (Site) | ✅ Live | robots.txt + noindex-Fix nötig |
| Base Ecosystem | ❌ Nicht beantragt | Nach noindex-Fix einreichen |
| MCP Registries | ❌ Nicht eingetragen | MCP Server existiert lokal, könnte gelistet werden |
| ClawHub | ❌ Nicht publiziert | Skill publish = Backlink |

### Backlink-Chancen (Web-Recherche nicht möglich, Brave API fehlt)

Ohne Web Search API kann ich keine neuen Backlink-Chancen recherchieren. Die Liste vom 15.03. bleibt aktuell. Prioritäten unverändert:
1. npm publish (sofortiger DA-95-Backlink)
2. GitHub Repo public machen (DA-95)
3. Base Ecosystem Application
4. MCP Registry Listings

### Offene SEO-Tasks (aktualisiert)

**P0 (KRITISCH, sofort):**
1. ❗ `noindex, nofollow` → `index, follow` in site/index.html ändern + deployen
2. robots.txt als eigene Datei im site/ Ordner erstellen
3. sitemap.xml erstellen

**P1 (Nach noindex-Fix):**
4. Google Search Console einrichten + Sitemap einreichen
5. GitHub-Links in index.html konsistent machen (alle auf clicksprotocol Org)
6. FAQ-Section mit FAQPage Schema einfügen (Draft liegt bereit)
7. Organization Schema.org Block hinzufügen (Draft liegt bereit)
8. H2-Headings keyword-optimieren

**P2 (Backlinks):**
9. npm publish SDK
10. GitHub Repo zu clicksprotocol Org transferieren + public
11. Base Ecosystem Application
12. MCP Registry Listings

**P3 (Content):**
13. Blog Post #1 "What is Agent Treasury Yield?" draften
14. Analytics einbauen (Plausible empfohlen)

### Tages-Zusammenfassung

Die größte Entwicklung seit dem letzten Check: **Die Site ist live.** Cloudflare Pages funktioniert, clicksprotocol.xyz antwortet mit HTTP 200. Die Stats-Section wurde ebenfalls verbessert (keine Fake-Zahlen mehr).

Aber: Die Site blockiert aktiv ihre eigene Indexierung durch `noindex, nofollow`. Solange das Tag drin ist, existiert die Seite für Google nicht. Das ist der einzige Blocker, der alles andere aufhält.

Zweites Problem: robots.txt und sitemap.xml existieren nicht als eigene Dateien. Cloudflare liefert für alle unbekannten Pfade die index.html zurück (SPA-Catch-All), was bedeutet dass Suchmaschinen keine gültige robots.txt oder Sitemap finden.

**Empfehlung an David:**
1. **noindex → index,follow** ändern: Eine Zeile in site/index.html, dann commit + push. 2 Minuten Arbeit, aber ohne das passiert SEO-seitig gar nichts.
2. **robots.txt + sitemap.xml** als statische Dateien in den site/ Ordner legen
3. **Brave API Key konfigurieren** für SERP-Tracking und Competitor-Monitoring

---

## 2026-03-16 14:00 — Mittag-Check #5

### Site-Status

- clicksprotocol.xyz: ✅ Live (HTTP 200)
- 🚨 `noindex, nofollow` IMMER NOCH AKTIV. Tag 2 ohne Fix. Google ignoriert die Seite komplett.
- robots.txt: ❌ Fehlt (liefert index.html als Catch-All)
- sitemap.xml: ❌ Fehlt (liefert index.html als Catch-All)
- Stats-Section: ✅ Weiterhin korrekt (80/20, 1 Call, 0 Lockup, Base L2)

### Keyword-Recherche: Vertiefung (Tag 2)

**Recherche-Einschränkung:** Brave API Key fehlt weiterhin. DDG blockiert (Captcha). Brave Search Web-Scraping als Fallback genutzt, liefert begrenzte aber verwertbare Ergebnisse.

**Neue Keyword-Erkenntnisse:**

| Keyword/Phrase | Wettbewerb | Notizen |
|----------------|------------|---------|
| "autonomous treasury" | Niedrig-Mittel | Robot Money nutzt "Autonomous Treasury for the Agent Economy" als H1. Direkt-Competitor-Term. |
| "agent economy yield" | Niedrig | Robot Money positioniert sich hier. Clicks sollte den Term auch besetzen. |
| "activate idle capital" / "idle balances" | Mittel | Ampli nutzt "Turn idle balances into self-optimizing capital". Überschneidung mit Clicks' "idle USDC" Messaging. |
| "agentic yield optimization" | Quasi Null | Ampli hat den Term eingeführt. Clicks sollte ihn für SEO claimen bevor er besetzt wird. |
| "DeFAI" | Mittel-Hoch | OneKey hat einen umfassenden Erklärartikel. Term wird breiter, aber Clicks' Nische (passive yield, nicht Trading) ist unterrepräsentiert. |
| "x402 ecosystem" | Niedrig | x402.org hat eine Ecosystem-Seite. Clicks fehlt dort. Listing = Backlink + Traffic. |

**Keyword-Cluster Update (7 → 9 Cluster):**

| # | Cluster | Neue Keywords (kumulativ) | Wettbewerb | Clicks-Relevanz |
|---|---------|--------------------------|------------|-----------------|
| 1 | Core | "AI agent yield", "autonomous agent yield" | Niedrig-Mittel | ★★★★★ |
| 2 | DeFi SDK | "DeFi SDK", "DeFi yield SDK", "agent DeFi SDK", "orchestrator SDK" | Niedrig | ★★★★★ |
| 3 | Agent Payments | "agent payments crypto", "x402 agent payments", "x402 ecosystem" | Niedrig | ★★★★ |
| 4 | Treasury | "AI agent treasury management", "agent idle USDC", "autonomous treasury" | Niedrig | ★★★★★ |
| 5 | Agentic DeFi | "agentic DeFi", "DeFAI", "autonomous DeFi" | Mittel | ★★★★ |
| 6 | Agent Wallet | "autonomous wallet", "ERC-8004 trustless agents" | Niedrig-Mittel | ★★★ |
| 7 | Yield Protocol | "USDC yield protocol", "Base chain yield" | Mittel | ★★★ |
| 8 | **NEU: Idle Capital** | "idle balances yield", "activate idle capital", "self-optimizing capital" | Niedrig | ★★★★ |
| 9 | **NEU: Agent Economy** | "agent economy", "agent economy yield", "tokenized agents treasury" | Niedrig-Mittel | ★★★★ |

### Competitor SEO Analyse: 3 NEUE Competitors entdeckt

**🚨 Gestern: "Keine direkten Competitors." Heute: DREI gefunden.**

Die gestrige Einschätzung ("Clicks hat die Nische allein") war falsch. Die Recherche hat drei Projekte aufgedeckt, die im selben oder angrenzenden Raum operieren:

#### 1. Robot Money (robotmoney.net) — DIREKT-COMPETITOR

- **Positioning:** "Autonomous Treasury for the Agent Economy"
- **Was sie tun:** ERC-4626 Vault auf Base. Agents/Humans deponieren USDC, Kapital wird in 3 Buckets allokiert:
  - Bucket A (33%): Stable Yield (Aave, Compound, Morpho) — 3-6% APY
  - Bucket B (33%): Agent-Token Trading (aktiv, on-chain Signals)
  - Bucket C (33%): Revenue Liquid Tokens (EtherFi, Hyperliquid, Virtuals)
- **Fee:** 2% annual management fee + 40% Token Swap Fees
- **Differenzierung zu Clicks:**
  - Robot Money = aktiv gemanagter Vault (inkl. Trading). Clicks = passive Yield-Infrastruktur (SDK-Call)
  - Robot Money hat ein eigenes Token-Governance-Modell. Clicks hat kein Token.
  - Robot Money zielt auf "18,000 tokenized agents on Base" als Markt
  - Robot Money nutzt Coinbase Agentic Wallet für Prop Wallet
- **SEO-Stärke:** Starke Landing Page, klare Messaging, eigene Domain
- **SEO-Schwäche:** Seite ist ein "Design Document" / "First Experiment", noch kein echtes Produkt
- **Bedrohungslevel für Clicks:** ★★★★ (hoch, gleiche Nische, gleiche Chain)

#### 2. Ampli (ampli.net) — INDIREKTER COMPETITOR

- **Positioning:** "Where capital becomes intelligent" / "activate your capital"
- **Was sie tun:** Full-Stack SDK + Service Platform für "intelligent, agentic money management"
  - Multi-Platform SDKs (Core, React, React Native)
  - Smart Account + MPC Wallet Infrastructure
  - Agent Authorization Layer
  - Built-in KYC, Fiat on/off-ramps, Compliance Tools
- **Zielgruppe:** Institutionen und Businesses (Enterprise)
- **Fee:** Nicht öffentlich
- **Differenzierung zu Clicks:**
  - Ampli = Enterprise-Grade, Compliance-fokussiert. Clicks = Developer-first, Crypto-native.
  - Ampli hat KYC/Fiat-Ramps. Clicks hat keine.
  - Ampli = breiterer Scope (Treasury Management Platform). Clicks = fokussierter (1 SDK Call, Yield on Float).
- **SEO-Stärke:** Professionelle Site, SDK-Dokumentation, klare Value Prop
- **SEO-Schwäche:** Sehr Enterprise, wenig Content/Blog
- **Bedrohungslevel für Clicks:** ★★★ (mittel, anderes Segment, aber gleiche Keywords)

#### 3. Norexa (norexa.ai) — TOT/INAKTIV

- **Positioning:** "Autonomous DeFi Agents. Maximized Yield."
- **Status:** Domain liefert 404 (Vercel Deployment not found)
- **Relevanz:** Zeigt dass der Markt existiert, aber Execution scheitert. Norexa hat den Brave-Index mit guten Keywords, die Site ist aber tot.
- **SEO-Opportunity:** Norexa's Keywords ("autonomous DeFi agents", "treasury ops") sind jetzt verwaist. Clicks kann sie besetzen.
- **Bedrohungslevel für Clicks:** ★ (tot, aber Keywords bleiben als Chance)

**Competitor-Vergleichsmatrix (aktualisiert):**

| Feature | Clicks Protocol | Robot Money | Ampli |
|---------|----------------|-------------|-------|
| Zielgruppe | AI Agents (Devs) | Agents + Humans | Institutions |
| Integration | 1 SDK Call | 1 USDC Transfer | Full SDK Suite |
| Yield Strategy | Passive (Aave/Morpho) | Aktiv (3 Buckets) | Aktiv (Orchestrator) |
| Chain | Base | Base | EVM (Multi) |
| Token | Nein | Ja (Governance) | Nein |
| KYC/Compliance | Nein | Nein | Ja |
| Fee | 2% on Yield only | 2% annual + 40% swap | Nicht öffentlich |
| Status | Live (mit noindex) | Design Document | Live |
| Unique Angle | Simplicity (1 Call) | Agent-Token Trading | Enterprise Compliance |

### Programmatic SEO: Content-Ideen (aktualisiert)

**Neue Ideen basierend auf Competitor-Analyse:**

8. **"Clicks Protocol vs Robot Money: Passive Yield vs Active Treasury"**
   - Ziel: Comparison-Traffic abgreifen (beide auf Base, gleiche Nische)
   - Keywords: "clicks protocol vs robot money", "agent treasury yield comparison"
   - Format: Ehrliche Vergleichstabelle, Clicks' Simplicity-Angle betonen

9. **"Why Passive Yield Beats Active Management for AI Agents"**
   - Ziel: Positionierung gegen Robot Money's 3-Bucket-Modell
   - Keywords: "passive vs active yield agents", "agent treasury risk"
   - Argument: Agents brauchen Liquidität und Vorhersagbarkeit, nicht Alpha-Jagd

10. **"The Agent Economy Needs Yield Infrastructure, Not Another Vault"**
    - Ziel: Thought Leadership, Kategorie definieren
    - Keywords: "agent economy infrastructure", "DeFi yield infrastructure"
    - Format: Op-Ed / Medium Post

11. **"x402 + Clicks: Earn Yield on Every API Payment"**
    - Ziel: x402 Ecosystem Traffic (x402.org hat Ecosystem-Seite, Clicks fehlt)
    - Keywords: "x402 yield", "x402 payment float"
    - Aktion: Clicks bei x402.org/ecosystem listen lassen (Backlink!)

**Programmatic SEO (skalierbar, unverändert):**
- /yield/{protocol} Pages (Aave, Morpho APY Tracking)
- /compare/{a}-vs-{b} Pages (nun auch Clicks vs Robot Money)
- /glossary/{term} Pages (Agent Commerce Glossar)

### Backlink-Chancen (NEU)

| Kanal | Aktion | Erwarteter DA | Aufwand |
|-------|--------|---------------|---------|
| x402.org/ecosystem | Clicks als Ecosystem-Projekt einreichen | ~40-50 | Niedrig (Form/PR) |
| DeFiLlama | Vault/Yield-Daten einreichen (braucht echtes TVL) | ~80 | Mittel |
| Base Ecosystem (base.org) | Application einreichen | ~70 | Niedrig |
| npm Registry | @clicks-protocol/sdk publish | ~95 | Niedrig |
| GitHub (clicksprotocol) | Public Repo + README mit Link | ~95 | Niedrig |

### Status-Delta seit Morgen-Check

| Item | 09:00 Status | 14:00 Status | Delta |
|------|-------------|-------------|-------|
| noindex Tag | ❌ Aktiv | ❌ IMMER NOCH AKTIV (Tag 2!) | 🚨 Kritisch |
| robots.txt | ❌ Fehlt | ❌ Fehlt | Kein Fortschritt |
| sitemap.xml | ❌ Fehlt | ❌ Fehlt | Kein Fortschritt |
| Brave API Key | ❌ Fehlt | ❌ Fehlt | Brave Web-Scraping als Workaround |
| Competitor-Map | 6 indirekte | ✅ **+3 neue** (1 direkt, 1 indirekt, 1 tot) | Major Update |
| Keyword-Cluster | 7 Cluster | ✅ **9 Cluster**, 20+ Keywords | +2 neue Cluster |
| Content-Plan | 7 Ideen | ✅ **11 Ideen** (7 Blog + 4 Programmatic) | +4 neue |
| x402 Ecosystem | Nicht geprüft | ✅ Chance identifiziert | Backlink-Opportunity |

### Kritische Empfehlungen an David

1. **🚨 noindex entfernen (Tag 2!):** Das ist der absolute Showstopper. Jeder Tag mit noindex = ein verlorener Tag für Google-Indexierung. Die Site existiert für Suchmaschinen nicht.

2. **Robot Money als Competitor ernst nehmen:** Gleiche Nische (Agent Treasury auf Base), ähnliche Keywords. Clicks' Vorteil ist Simplicity (1 Call vs komplexer Vault). Dieser Angle muss in Content und SEO betont werden.

3. **x402.org Ecosystem Listing:** Einfacher Backlink, direkter Traffic von x402-Community. Sollte als erstes gemacht werden.

4. **Content sofort starten:** "Agent Treasury Yield" war gestern leer, aber Robot Money besetzt den Raum bereits. First-Mover-Vorteil schrumpft mit jedem Tag.

---
*Nächster Check: Mo 16.03. 19:00*
