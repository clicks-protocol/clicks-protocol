# SEO Log — Clicks Protocol

## 2026-03-16 (Abend-Check)

### Aktueller Stand

**Indexierung:** `noindex, nofollow` (Stealth-Modus bis Launch Day ~21.-25.03.)
- Bewusste Entscheidung, kein SEO-Problem. Muss am Launch Day sofort auf `index, follow` umgestellt werden.

**Vorhandene SEO-Assets:**
- ✅ Canonical URL gesetzt (https://clicksprotocol.xyz)
- ✅ OG Tags (Title, Description, Image, URL, Type)
- ✅ Twitter Card (summary_large_image)
- ✅ Meta Description + Keywords
- ✅ Schema.org/JSON-LD: SoftwareApplication + HowTo
- ✅ llms.txt (Agent Discovery Optimization)
- ✅ agent.json (Link im Head)
- ✅ Web App Manifest
- ✅ Favicons (SVG, PNG, Apple Touch Icon)
- ✅ Docs-Seite (docs/index.html)

### Heute optimiert
- Kein SEO-spezifisches Update heute (Fokus lag auf GoHiring-Prozess und Lead-Pipeline)

### Schema.org/JSON-LD Analyse + Verbesserungsplan

**Vorhanden:**
1. `SoftwareApplication` — SDK-Beschreibung, Preis, Version, Sprache
2. `HowTo` — 3-Step Quick Start

**Fehlt / sollte ergänzt werden (Prio-Reihenfolge):**

1. **`Organization`** (P1) — Clicks Protocol als Entität. Name, URL, Logo, Social Links (X, Discord, GitHub, Medium). Wichtig für Knowledge Graph.

2. **`WebSite` mit `SearchAction`** (P2) — Docs durchsuchbar machen wenn Docs wachsen. Aktuell noch nicht nötig (nur 1 Docs-Seite).

3. **`FAQPage`** (P2) — "What is Clicks?", "How does the 80/20 split work?", "Is there a lockup?", "What's the protocol fee?" usw. Google zeigt FAQs prominent in SERPs. Kann als Section auf der Landing Page oder als eigene Seite.

4. **`BreadcrumbList`** (P3) — Wenn Docs/Blog wachsen, Breadcrumbs für Navigation. Aktuell nur 2 Seiten, noch nicht nötig.

5. **`Article`/`BlogPosting`** (P3) — Für den Medium-Blog und eventuelle eigene Blog-Seite. Autor, Datum, Publisher.

### Offene SEO Tasks (Prio für morgen)

| Prio | Task | Aufwand | Notiz |
|------|------|---------|-------|
| P0 | `noindex` → `index` am Launch Day | 1 Min | Nicht vergessen! |
| P1 | Organization JSON-LD hinzufügen | 10 Min | Logo-URL, Social Links |
| P1 | `twitter:site` Meta Tag fehlt | 1 Min | `@ClicksProtocol` |
| P1 | `twitter:creator` Meta Tag fehlt | 1 Min | `@ClicksProtocol` |
| P2 | FAQ Section + FAQPage Schema | 30 Min | 5-8 Fragen aus llms.txt ableiten |
| P2 | `og:site_name` Meta Tag fehlt | 1 Min | "Clicks Protocol" |
| P2 | Docs-Seite: eigene Meta Tags + Schema | 15 Min | Aktuell wahrscheinlich ohne |
| P2 | Sitemap.xml erstellen | 5 Min | 2-3 URLs, für Google Search Console |
| P2 | robots.txt erstellen | 2 Min | Allow all + Sitemap-Link (nach Launch) |
| P3 | Strukturierte Daten Testing Tool laufen lassen | 5 Min | Google Rich Results Test |
| P3 | Page Speed / Core Web Vitals Check | 10 Min | Lighthouse, nach Launch |

### Keyword-Fokus (Pre-Launch)

Primär-Keywords (Long-Tail, wenig Konkurrenz):
- "AI agent yield protocol"
- "autonomous DeFi yield AI agents"
- "USDC yield SDK AI"
- "agent commerce DeFi Base"

Sekundär (kompetitiv, langfristig):
- "AI agent DeFi"
- "agent yield"
- "autonomous finance"

### Notizen
- Landing Page ist technisch sauber: semantic HTML, good contrast, mobile responsive, accessibility (ARIA, noscript fallback)
- llms.txt ist sehr gut geschrieben, alle relevanten Infos für AI Discovery
- Kein Google Search Console Setup möglich solange noindex aktiv
- Launch Day SEO-Checklist: noindex entfernen, GSC verifizieren, Sitemap submitten, Social Posts mit Links
