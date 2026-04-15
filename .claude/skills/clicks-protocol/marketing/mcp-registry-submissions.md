# MCP Registry Submissions — Smithery.ai + Glama.ai

**Status:** Vorbereitet, NICHT submitted (Repo ist noch private)

---

## 1. Smithery.ai

### Submission-Prozess (recherchiert 16.03.2026)

**URL:** https://smithery.ai/servers/new

**Voraussetzungen:**
- Öffentliches GitHub Repo (oder npm-Package)
- MCP Server implementiert nach MCP-Spec
- `package.json` mit korrektem `name`, `description`, `version`
- README.md mit Installationsanleitung + Tool-Übersicht

**Prozess:**
1. "Publish MCP Server" auf Smithery.ai/servers/new
2. GitHub-Repo oder npm-Package-URL eingeben
3. Smithery crawlt automatisch:
   - package.json für Metadaten
   - README.md für Dokumentation
   - MCP-Server-Config (Tools, Prompts, Resources)
4. Preview → Submit
5. Automatisches Deployment auf `<slug>.run.tools`

**Features nach Publish:**
- Built-in OAuth für Auth-Flows
- Observability Dashboard (Tool-Usage)
- Protocol Gateway (automatische MCP-Spec-Updates)
- Verteilung über Smithery CLI (`smithery mcp add clicks-protocol`)

**Empfehlung für Clicks Protocol:**
- npm-Package: `@clicks-protocol/mcp-server`
- Slug: `clicks-protocol`
- Icon/Logo: Optional, via `icon.png` im Repo-Root oder in package.json
- Kategorie: "Finance" oder "Developer Tools"

**Erst submitten wenn:**
- [x] GitHub-Repo öffentlich
- [x] npm-Package published
- [x] README.md vollständig (Installation, Tools, Examples)
- [x] MCP Server getestet

---

## 2. Glama.ai

### Submission-Prozess (recherchiert 16.03.2026)

**URL:** https://glama.ai/mcp/connectors

**Status:** Glama ist primär ein MCP-Discovery-Directory, KEIN Publish-Portal wie Smithery.

**Prozess (vermutlich):**
- Glama crawlt öffentliche MCP Server automatisch von:
  - npm Registry (Packages mit `mcp` im Namen oder in Keywords)
  - GitHub (Topics: `mcp`, `model-context-protocol`)
  - Smithery.ai Registry (nachdem dort published)
- ODER: Manuelles Submit-Formular (nicht auf Homepage sichtbar → eventuell in Docs oder via Support)

**Recherche-Ergebnis:**
- Keine dedizierte "Submit"-Seite gefunden
- Glama zeigt MCP Connectors mit Kategorien (Finance, Search, Open Data)
- Vermutung: Auto-Indexing ODER Submit via E-Mail/Support

**Empfohlener Ansatz:**
1. Erst auf Smithery.ai publishen
2. Glama crawlt es automatisch ODER
3. Falls nach 1-2 Wochen nicht gelistet: Support kontaktieren (z.B. via Discord/X)

**Alternative:**
- GitHub-Repo mit Topic `mcp` taggen
- npm-Package mit Keywords: `["mcp", "model-context-protocol", "ai-agents", "yield", "base"]`
- `.well-known/mcp.json` Discovery Document im Repo (falls Glama danach scannt)

**Erst submitten wenn:**
- [x] GitHub-Repo öffentlich
- [x] npm-Package published mit korrekten Keywords
- [x] Auf Smithery.ai gelistet (erhöht Discoverability)

---

## 3. Checkliste vor Submission

### GitHub-Repo (`clicks-protocol/mcp-server`)
- [ ] Repo öffentlich (derzeit private)
- [ ] README.md vollständig:
  - [ ] Kurzbeschreibung (80% liquid, 20% earning, no lockup, Base)
  - [ ] Installation (`npm install @clicks-protocol/mcp-server`)
  - [ ] Konfiguration (Env-Vars, Wallet-Setup)
  - [ ] Tool-Liste mit Beschreibungen
  - [ ] Usage-Examples (Claude Desktop, Cline, etc.)
  - [ ] Links zu SDK + Docs
- [ ] LICENSE (MIT oder Apache-2.0)
- [ ] package.json korrekt:
  - [ ] `name`: `@clicks-protocol/mcp-server`
  - [ ] `description`: "MCP server for Clicks Protocol - autonomous yield for AI agents on Base"
  - [ ] `version`: Semantic versioning (z.B. `0.1.0`)
  - [ ] `keywords`: `["mcp", "model-context-protocol", "ai-agents", "yield", "base", "usdc", "defi"]`
  - [ ] `repository`: GitHub-URL
  - [ ] `homepage`: `https://clicksprotocol.xyz`
  - [ ] `author`: Clicks Protocol Team
- [ ] Optional: `icon.png` (für Smithery-Logo)
- [ ] GitHub Topics: `mcp`, `model-context-protocol`, `ai-agents`, `defi`, `base`

### npm-Package
- [ ] Published auf npm Registry
- [ ] Installierbar via `npm install @clicks-protocol/mcp-server`
- [ ] Getestet mit Claude Desktop / Cline / Zed

### Smithery.ai
- [ ] Submit via https://smithery.ai/servers/new
- [ ] Slug wählen: `clicks-protocol`
- [ ] Preview checken
- [ ] Submit → warten auf Approval/Auto-Publish

### Glama.ai
- [ ] Warten bis auf Smithery gelistet
- [ ] Falls nach 2 Wochen nicht auf Glama: Support kontaktieren
- [ ] Oder: GitHub-Repo mit `mcp`-Topic taggen und auto-crawling abwarten

---

## 4. Timeline (Vorschlag)

1. **Woche 1:** Repo öffentlich + npm publish + Smithery submit
2. **Woche 2:** Monitoring (Smithery-Approval + erste Installs)
3. **Woche 3:** Glama-Check + ggf. manuelles Submit
4. **Woche 4:** awesome-x402 PR öffnen (nach erfolgreicher Smithery-Listung)

---

## 5. Kontakte / Support (falls nötig)

- **Smithery Support:** https://smithery.ai/docs (oder Discord/GitHub Issues)
- **Glama Support:** Vermutlich via X (@GlamaAI) oder Discord
- **awesome-x402 Maintainer:** xpaysh (GitHub Issues im Repo)

---

**Wichtig:** Nicht submitten bevor Repo public ist. Sonst werden die Submissions abgelehnt oder der Crawling-Prozess schlägt fehl.
