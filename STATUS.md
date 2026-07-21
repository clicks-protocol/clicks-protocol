# Clicks Protocol Status

> Stand: 2026-07-21 (Berlin, X Settlement-first Profil live, ACP-Service kontrolliert repariert, Glama-Rescan angefragt)
> Priorität: P0
> Update-Rule: **Jede Session endet mit Aktualisierung dieser Datei, bevor Emma/Claude die Arbeit niederlegt.** Staleness > 48 h = Drift-Risiko.
> ⚠️ **Diese Datei war zwischen 13.05. und 13.07. veraltet. Heute auf Stand gezogen.**

## ⚠️ Contract-Versions (für alle Outreach / Pitches)

- **LIVE:** ClicksSplitterV4 `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` (Base Mainnet)
- **LIVE:** ClicksFeeV2, ClicksRegistry, ClicksYieldRouter, ClicksReferral (siehe CLAUDE.md)
- **NICHT deployed:** SplitterV5, ReputationMultiplierV1 (Prototypes, Ship-Gate offen)
- **Nie V3 pitchen** - existiert, wenn überhaupt, als Legacy.

## Aktueller Stand

**Positionierung:** Agent Commerce Settlement Router (nicht Yield-Protokoll). Router zwischen x402/ACP und DeFi-Vaults. Die 17 Yield Agents auf Cambrians Landscape sind Kunden, nicht Konkurrenten.

**Landing live:** `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz` zeigen den Settlement-Router-Stand mit Cloudflare Web Analytics Beacon. Neuester Production-Deploy `8d04aefe-1bfe-4413-aa18-0d60d1628452`, Cloudflare Pages Environment `production`.

**GitHub main:** PR #32 `chore: align Clicks settlement router state` ist gemerged. Merge-Commit `ac1d837d103d22d0d10d035f0c4c49d4e6274df9`. Der bereinigte Settlement-first Stand ist damit remote auf `main`.

**Security note:** Beim PR-Audit wurde ein Moltbook API-Key in einem Branch-Commit entdeckt. Der Commit wurde vor Merge aus der Branch-History entfernt und `main` enthaelt den Key nicht. Die Rotation ist vorbereitet. Email und X sind verifiziert, aber die abschliessende Erstellung des Moltbook-Owner-Kontos `ClicksProtocol` wartet wegen des Account-Hardblocks auf Davids Freigabe.

**Moltbook:** Neuer Key lokal gesetzt in Workspace-`.env` und Projekt-`.env`. LaunchAgent `com.clicks.moltbook-crosspost` ist aktiv und laeuft stuendlich Minute 07. Queue lokal mit 14 Settlement-first Textposts neu befuellt, `nextIndex=0`, naechster Ziel-Submolt `agentcommerce`. `bots/*-source.json` und `bots/*-state.json` bleiben absichtlich gitignored. Kommentar-Monitor ist jetzt aktiv: `com.clicks.moltbook-comment-monitor` laeuft Minute 17 und 47, prueft getrackte Post-IDs und sendet nur bei neuen Kommentaren in den Telegram-Clicks-Topic.

**X MCP:** OAuth 2.0 fuer die App `clicks` ist als `@ClicksProtocol` autorisiert. `xurl` 1.2.3 ist dauerhaft ueber Homebrew installiert, OAuth 2.0/OAuth 1.0a/Bearer sind vorhanden, der MCP-Handshake und die Tool-Discovery gegen `https://api.x.com/mcp` sind verifiziert. Token-Refresh laeuft ueber den lokalen `xurl mcp` Bridge.

**X Profil und Publishing:** Bio ist jetzt Settlement-first: `Settlement infrastructure for AI agents. Route USDC revenue, enforce split policy and verify receipts on Base. Open source SDK + MCP.` Der kontrollierte 1500x500-Markenbanner `assets/banners/x-profile-2026/settlement-banner-1500x500.png` ist live auf `@ClicksProtocol`; X bestaetigte den Upload mit HTTP 201 und lieferte danach eine neue `profile_banner_url` mit Zeitstempel `1784648532`. Die alte taegliche 06:15/13:15/20:15-Automation wurde beendet. Die drei LaunchAgents laufen nur noch Montag, Mittwoch und Freitag um 17:30 Berlin und veroeffentlichen ausschliesslich vorher in `x-pipeline/queue.json` freigegebene Inhalte. Queue ist aktuell leer. Slots: Monday Original, Wednesday Settlement Report/Thread, Friday Demo/Visual.

**X Analytics:** OAuth-2-API-Zugriff auf eigene `public_metrics`, `non_public_metrics` und `organic_metrics` ist live verifiziert, inklusive Impressions, Engagements, Profilklicks und Linkklicks pro Post. `x-pipeline/analytics-report.mjs` schreibt taeglich um 18:45 einen lokalen 90-Tage-Snapshot. Freitags um 19:00 sendet `analytics-alert.sh` den Wochenstand in Telegram. Ausgangspunkt am 21.07.: 16 Follower, davon 6 verifiziert oder Premium, 3.099 Impressionen aus 106 Posts in 90 Tagen, 273 Engagements, 62 Profilklicks und 7 Linkklicks.

**X Content Freigabe:** Drei Settlement-first Entwuerfe liegen in `x-pipeline/pending-approval-2026-07-21.json`. Sie sind nicht in der aktiven Queue und koennen daher nicht automatisch veroeffentlicht werden.

**X Mention Monitor:** End-to-End verifiziert mit echter Mention `2079572038650397050` von `@CRYPTO_DAVIDSKI`: Erkennung, Telegram-Alert, Reply-Vorschlag und Deduplizierung erfolgreich. XAA-Subscription `post.mention.create` ist angelegt. Der XAA-Persistent-Stream bleibt durch einen Auth-Widerspruch bei X unbrauchbar: Private Subscription verlangt User-OAuth, Stream verlangt App-only und sieht die User-OAuth-Subscription nicht. Delivery nutzt deshalb den offiziellen Filtered Stream mit Regel `@ClicksProtocol`. Der zuvor serverseitig belegte Stream-Slot wurde durch kontrolliertes Stoppen aller Reconnects und eine 45-Sekunden-Abkuehlphase freigegeben. Seit 16:31 CEST haelt der LaunchAgent genau eine aktive `xurl 1.2.3` Stream-Verbindung. Das unabhaengige 60-Sekunden-Polling bleibt als Ausfallsicherung aktiv. Der Dienst besitzt keine Posting-Logik und antwortet nie automatisch.

**X API Reply-Grenze:** Proaktive Replies oder Quotes auf fremde Posts ohne Mention werden von X aktuell mit HTTP 403 abgelehnt: `You can only reply to or quote posts where you are mentioned or are the author.` Mention-Replies funktionieren und sind End-to-End verifiziert. Proaktive Growth-Replies brauchen eine als `@ClicksProtocol` eingeloggte X-Weboberflaeche.

**Live auf Base Mainnet:**
- V4 Contracts: siehe CLAUDE.md (Safe Multisig `0xaD8228fE...`)
- ERC-8004 Identity: **agentId 45074**, owner Operator-Wallet `0xf873BB73...`

**Receipt V1, Repository-Stage:** `sdk/src/receipts.ts` definiert einen deterministischen Settlement-Nachweis mit Precondition Snapshot, Policy-Version-Hash und Falsifiability-Feldern. SDK-Build und deterministischer Hash-Test sind gruen. Noch nicht als npm-Version veroeffentlicht und kein On-Chain-Receipt-Vertrag.

**ACP Service:** `com.clicks.acp-service` laeuft wieder kontrolliert als genau eine Instanz. `run.sh` nutzt den absoluten Node-22-Pfad und erweitert `PATH`, damit `npx` und dessen Node-Interpreter unter launchd verfuegbar sind. Der Start unterdrueckt die Ausfuehrung bereits vorhandener funded Jobs waehrend der Hydrierung. Verifizierter Startcheck: `0 active job(s): none`. Es wurde kein Auftrag simuliert und keine Onchain-Transaktion ausgeloest.

**Glama:** Das oeffentliche Profil ist weiterhin inhaltlich stale. Die API liefert alten Yield-Text, `tools=0` und `updatedAt=null`. Ein Rescan-Supportticket mit Server-ID, Repository und Kontaktadresse wurde am 21.07. ueber das offizielle `Report Issue`-Formular abgesendet.
- Erste Schema-V1 Attestation: Tx `0x5aec2067...`, Block 44836647

**Prototype (nicht deployed):**
- ClicksReputationMultiplierV1 - ERC-8004-driven fee tiers (24 Tests)
- ClicksSplitterV5 - variable fee 1-3 % via Multiplier (14 Tests)

## Aktueller Eingriff (20.07.2026)

**x402 Revenue Settlement Research und Claim-Cleanup:**
- Recherche zu Linux Foundation x402, x402.org, Blockscout x402 Pro API, Cloudflare Monetization Gateway, Cloudflare Agents x402 Docs, Coinbase CDP x402 Docs, Bitcoin Magazine und X-Signalen abgeschlossen.
- Entscheidung: Clicks baut keinen x402 Facilitator und keine Payment API. Clicks baut die Schicht danach: `x402 revenue settlement` fuer Seller/Agents.
- Zielprodukt: eingehende x402-USDC erfassen, Split/Policy routen, Receipts/Ledger/Attribution liefern, SDK/MCP-Adapter bereitstellen.
- Claim-Regel: Keine `supports x402`-, Auto-Interception- oder harte APY-Claims, bevor ein Adapter wirklich live ist.
- Public Claim-Cleanup umgesetzt in Landing, About, Docs, API Docs, Getting Started, README, Eliza-Integration, x402-Docs, `llms.txt` und `/.well-known/x402.json`.
- `/.well-known/x402.json` beschreibt Clicks jetzt explizit als Post-Payment-Settlement-Router. `automatic_x402_interception=false`, `built_in_x402_payment_verification=false`, `x402_revenue_adapter=planned`.
- `npm run build` in `landing-v3` gruen.
- Cloudflare Pages Production-Deploy `8d04aefe-1bfe-4413-aa18-0d60d1628452` erfolgreich, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Live-Checks fuer Root, `www`, About, Docs, API Docs, Getting Started, CN/JA/KO, `/.well-known/x402.json` und `/llms.txt` HTTP 200.
- Live-Stale-Scan ohne Treffer fuer alte Yield/x402-Claim-Phrasen wie `works natively`, `supports x402`, `intercepts x402`, `4-8% APY`, `7-13% APY`, `Autonomous Yield`, `Start Earning Yield`.

**Discord Cleanup:**
- Eigene Bot-Core-Posts in `#welcome`, `#resources`, `#sdk-help`, `#mcp-server` aktualisiert.
- Discord ist jetzt Settlement-first und enthaelt aktuelle Package-/Contract-Fakten.
- x402 Adapter ist dort klar als Roadmap/nicht live markiert.
- Rueckscan der relevanten Channels: keine eigenen Bot-Posts mehr mit alten Yield-first Begriffen, V3-/v0.1-/9-Tools-Claims oder harten APY-Aussagen.

**Repo-Schutz:**
- Tracked Dirty-Diff gesichert: `backups/dirty-tracked-20260720-2344.patch`.
- Untracked Registry-Token-Dateien `.mcpregistry_github_token` und `.mcpregistry_registry_token` wurden nicht gelesen und in `.gitignore` aufgenommen.

**Npm Patch-Releases live:**
- Neuer npm Automation/2FA-Bypass-Token von David erhalten und verifiziert: `npm whoami` = `clicks-protocol`
- Builds vor Publish gruen:
  - `@clicks-protocol/sdk@0.2.1`
  - `@clicks-protocol/mcp-server@0.3.2`
  - `@clicks-protocol/eliza-plugin@0.2.1`
  - `agent-treasury@0.1.1`
- `npm pack --dry-run` fuer alle vier Packages sauber.
- Alle vier Packages erfolgreich auf npm publiziert und per `npm view ... version` live zurueckgelesen.
- npm Publish-Blocker vom 14.07. ist erledigt.
- Hinweis: npm normalisiert beim Publish weiterhin `repository.url`. Das ist kosmetisch, sollte spaeter mit `npm pkg fix` oder manueller package.json-Korrektur bereinigt werden.

**MCP Registry live:**
- GitHub-Device-Flow war im Telegram/TTY-Flow unzuverlaessig. Loesung: `mcp-publisher login github` mit lokalem `MCP_GITHUB_TOKEN` aus dem validen `clicksprotocol` GitHub-Token.
- `mcp-server/server.json` auf Registry-Version `1.0.3` und npm-Package `@clicks-protocol/mcp-server@0.3.2` aktualisiert.
- `landing-v3/public/mcp/server.json` ebenfalls auf `1.0.3` und Package `0.3.2` aktualisiert.
- `mcp-publisher validate mcp-server/server.json` gruen.
- `mcp-publisher publish mcp-server/server.json` erfolgreich.
- Live-Rueckcheck ueber `https://registry.modelcontextprotocol.io/v0/servers?search=clicksprotocol`: `io.github.clicksprotocol/mcp-server` Version `1.0.3`, Status `active`, `isLatest: true`, Package `0.3.2`.
- GitHub `main` gezielt aktualisiert mit Commit `6b0f2b1`: MCP Runtime/Dist, Package, Registry-Manifest und Landing-Manifest. Grund: Glama synced vom Default-Branch und braucht dort die Settlement-first MCP-Metadaten.

**Landing Manifest Deploy live:**
- `landing-v3` Build gruen. Einziger Hinweis bleibt die bekannte Next.js-Warnung wegen mehrerer `package-lock.json`.
- Cloudflare Pages Production-Deploy `3ffa4415-297d-41cc-b143-26f352515e97` erfolgreich.
- Cloudflare API Rueckcheck: `environment=production`, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Live `https://clicksprotocol.xyz/mcp/server.json` und `https://www.clicksprotocol.xyz/mcp/server.json` liefern Version `1.0.3`, Package `@clicks-protocol/mcp-server@0.3.2`, Remote `https://mcp.clicksprotocol.xyz/mcp`.

**Homepage Settlement-Hero live:**
- Live-Befund vor Fix: technische Surfaces waren gesund, aber die sichtbare Homepage war noch Yield-first (`Autonomous Yield for AI Agents`, `Start Earning Yield`, `4-8% APY`).
- Backup vor Deploy erstellt: `backups/landing-v3-settlement-hero-20260720-2253.patch`.
- Geaendert: `landing-v3/content/i18n/{en,cn,ja,ko}.ts`, `landing-v3/components/hero.tsx`, `landing-v3/public/x-banner.html`.
- Hero ist jetzt Settlement-first: `Agent Commerce Settlement Router`, CTA `Start Settling Revenue`, Code-Kommentar `treasury yield route`.
- `npm run build` in `landing-v3` gruen.
- Cloudflare Pages Production-Deploy `83f77a15-59b2-4892-bf98-991ac3a9317e` erfolgreich, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Live verifiziert: Root, `www`, `/cn`, `/ja`, `/ko` zeigen Settlement-first Hero-Copy; alte Hero-Phrasen `Autonomous Yield for AI Agents`, `Start Earning Yield` und `DeFi yield (4-8% APY)` sind aus der Live-Homepage raus.

**X-Pipeline repariert:**
- Ursache fuer doppelte Posts gefunden: `xurl-post.sh` entfernte Queue-Eintraege erst nach Haupttweet plus Reply. Bei Teilfehlern blieb der gleiche Haupttweet vorne und wurde erneut gepostet.
- Live-Duplikate inklusive Replies geloescht.
- `xurl-post.sh` repariert: Lock gegen parallele Runs, Media-Upload Retry/Backoff, Queue-Shift direkt nach erfolgreichem Haupttweet, Reply danach best-effort.
- Erster offener Post nach Reparatur live: `2079214757739950100`, Reply `2079214769211404716`.
- Queue danach 4 offene Posts, zusaetzliche Einmal-Jobs bis 20:35 Berlin geplant.

**Research / Positionierung:**
- Marktanalyse erweitert und persistiert in `strategy/AGENT-COMMERCE-RAILS-RESEARCH-2026-07-20.md`.
- Quellen unter anderem: Open Banking / Atoa, Treasury Prime, Alibaba Accio Work, Infosys SLM, Fast.io, AgentCard, Meow.
- Entscheidung bestaetigt: Clicks bleibt Agent Commerce Settlement Router. Keine Karten, kein Bankkonto, kein Payment API Pitch.
- Kernpositionierung: AgentCard gives agents cards. Meow gives agents bank accounts. Clicks gives agents settlement.

**Hyperframes Content:**
- Neuer Content-Strang angelegt: `video-pipeline/x-settlement-gap/`.
- These: `Payment APIs Move Money. Agents Need Settlement.`
- Storyboard und Composition gebaut fuer 30s 9:16 X-native Motion-Post.
- Draft-Render verifiziert: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-draft.mp4`, 1080x1920, 30.0s, 900 Frames, H.264.
- High-Render erstellt und verifiziert: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-high.mp4`, 1080x1920, 30.0s, 900 Frames, H.264 High Profile.
- Hyperframes Lint mit `--strict-all` sauber: 0 Fehler, 0 Warnungen.
- Proof-Frames liegen unter `video-pipeline/x-settlement-gap/snapshots/final-proof-contact-sheet.png`.

**ClawHub Publish:**
- `clawhub` CLI auf `0.23.1` aktualisiert. Neuer Login laeuft ueber Device-Code, nicht mehr ueber Browser-Callback.
- Login als `Protogenosone` verifiziert.
- Publish erfolgreich: `clawhub publish ...` meldete `OK. Published clicks-protocol@1.2.3 (k979xt0kemvn31bg6vgatqk3zx8axx1h)`.
- Nach `1.2.3` wurde `security.suspicious` wegen USDC-moving Guardrails festgestellt. Fix als `1.2.4` published: read-only Safety Boundary in `SKILL.md`, direkte Write-Beispiele entfernt, `scripts/clicks.sh info` mit Sicherheitsgrenze, lokale `skill-card.md` ergaenzt.
- Publish erfolgreich: `clawhub publish ... --version 1.2.4` meldete `status=published`, Version-ID `k97cphs45ra5y701qqze8v1aj18ax7t3`.
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.4` findet Version `1.2.4`, statischer Scan ist `clean`, Security ist jetzt `clean`.
- ClawHub Card ist serverseitig fuer `1.2.4` verfuegbar. `clawhub skill verify protogenosone/clicks-protocol --version 1.2.4` resolved mit `decision=pass`, Card `available=true`, Security `clean`.
- Display-Name-Fix: `1.2.5` mit `--name "Clicks Protocol"` und `1.2.6` aus temporaer korrekt benanntem Ordner `/tmp/clawhub-publish-clicks/clicks-protocol` published. Nach Scan-Abschluss hat ClawHub den Anzeigenamen uebernommen.
- Aktuell: `clawhub inspect protogenosone/clicks-protocol --json` zeigt `displayName=Clicks Protocol`, `latest=1.2.6`. Oeffentliche HTML- und OG-Meta zeigen `Clicks Protocol - ClawHub`, Version `1.2.6`.
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.6` zeigt Security `clean`, aber `decision=fail` wegen `card.missing`. Das ist nur noch die ClawHub-Card-Generierung fuer die neue Version, nicht mehr der Name.

**Weiter offen:**
- Glama Rescan/Claim bleibt offen. Code, npm, MCP Registry, Landing und GitHub `main` sind jetzt korrekt; Glama API zeigt aber weiter alten Yield-Text, `tools=0`, `updatedAt=null`.
- Moltbook ersten neuen Post nach 01:07 Berlin zuruecklesen. Danach muss `bots/moltbook-posts.json` lokal die Post-ID enthalten, damit der Kommentar-Monitor live greift.
- ClawHub `1.2.6` nochmal pruefen, bis `card.missing` verschwindet und Verify wieder `decision=pass` liefert. Falls Card laenger haengt: ClawHub Support/Issue.
- X-Pipeline ist nach 18:35 Berlin leer, die offenen Posts sind verarbeitet.
- X-Link-Preview fuer `clicksprotocol.xyz` zeigt in der X-Entity weiter alten OG-Title `Clicks Protocol — Autonomous Yield for AI Agents`. Live-Site ist bereits Settlement-Router, aber X Card Cache muss separat refreshed/umgangen werden.
- Neuer Hyperframes-X-Post ist live: `https://x.com/ClicksProtocol/status/2079267140067094640`, Reply `https://x.com/ClicksProtocol/status/2079267151454626289`. Queue danach 0. Frueher KPI-Check 20:48 Berlin: 13 Impressions, 1 Like, 1 Reply, 0 Reposts.

## Vorheriger Eingriff (14.07.2026)

**Analytics / Discovery / Distribution nach Cloudflare-Fix:**
- Landing-Code hat jetzt einen optionalen Analytics-Hook:
  - `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` aktiviert Cloudflare Web Analytics Beacon
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` aktiviert Plausible
  - Ohne Token bleibt der Build unveraendert und bricht nicht
- Cloudflare Web Analytics Snippet-Token wurde lokal gesetzt und in den Static-Build eingebacken. Live-HTML auf `clicksprotocol.xyz` und `www.clicksprotocol.xyz` enthaelt `static.cloudflareinsights.com` und `data-cf-beacon`.
- Cloudflare Pages API zeigt aktuell weiter `web_analytics_tag=null` und `web_analytics_token=null`. Tracking laeuft deshalb ueber unser eingebautes JS-Snippet, nicht ueber Pages-Auto-Injection.
- GitHub-Repo-About live aktualisiert:
  - Beschreibung: `Agent commerce settlement router for AI agents on Base. Split USDC into liquid working capital and routed yield.`
  - Neue Topics: `agent-commerce`, `settlement-router`, `treasury`, `working-capital`
- Discovery-Surfaces lokal bereinigt:
  - `README-CN.md` Discord-Invite auf `FfmJGUcxfe`
  - Agent-Skill-Surfaces von `autonomous yield` auf `settlement routing`
  - Public Agent-Skill auf 11 MCP-Tools, aktuellen Referral-Flow und 227 Tests gezogen
  - Whitepaper-Seitentitel von `Autonomous Yield` auf `Agent Commerce Settlement Router`
- Distribution-Draft vorbereitet: `marketing/drafts/settlement-router-distribution-2026-07-14.md`. Noch nicht gepostet.

**Verifikation:**
- `npm run build` in `landing-v3/` gruen. Einziger Hinweis bleibt die bekannte Next.js-Warnung wegen mehrerer `package-lock.json`.
- Production-Deploy verifiziert ueber Cloudflare API: Deployment `93013768-58cb-4a59-8aed-5081130f2afa`, Environment `production`, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Live-Checks gruen: `/`, `/docs/`, `/docs/api/`, `/whitepaper/`, `/.well-known/agent.json`, `/.well-known/agent-skills/clicks-protocol/SKILL.md`, `/api/openapi.json`, `/llms.txt`, `/mcp/server.json`.
- `/.well-known/agent.json` und `/llms.txt` wurden nach dem ersten Analytics-Deploy nochmal bereinigt: `Clicks Protocol yield activation` ist jetzt `Clicks Protocol settlement routing`.
- Stale-Pattern-Check fuer die geaenderten Discovery-Dateien gruen: keine Treffer mehr fuer `Autonomous Yield`, `on-chain yield layer`, `Provides 9 tools`, `58/58`, alte Discord-Invite-URLs oder `9 tools`.

**Discovery-Directory-Check und Nacharbeit:**
- GitHub `main` gezielt aktualisiert mit Commit `106a62c8d1bffca995f56d76b8570ae517fd26e3`: `README.md`, `glama.json`, `mcp-server/server.json`, `clawhub-skill/SKILL.md`.
- README behauptet nicht mehr faelschlich `MCP Registry published` oder `Cursor Directory approved`. Badge zeigt jetzt nur noch `MCP metadata valid`.
- `glama.json` enthaelt jetzt Settlement-Router-Metadaten und Maintainer `clicksprotocol`.
- Historischer Stand am 14.07.: `https://clicksprotocol.xyz/mcp/server.json` war damals noch Version `1.0.1`, Package `@clicks-protocol/mcp-server@0.3.0`. Seit 20.07.17:48 Berlin ist die Live-URL auf Version `1.0.2`, Package `@clicks-protocol/mcp-server@0.3.1` deployed.
- Npm-Patch-Releases lokal vorbereitet und Builds gruen, seit 20.07. live auf npm:
  - `@clicks-protocol/sdk@0.2.1`
  - `@clicks-protocol/mcp-server@0.3.1`
  - `@clicks-protocol/eliza-plugin@0.2.1`
  - `agent-treasury@0.1.1`
- MCP Registry Publish ist seit 20.07.2026 live: Registry-Version `1.0.2`, Package `@clicks-protocol/mcp-server@0.3.1`, `isLatest: true`.
- Npm Publish ist erledigt seit 20.07.2026. Alle vier Patch-Releases sind live verifiziert.
- ClawHub Publish ist seit 20.07.2026 nicht mehr am Terms-Gate blockiert. Version `1.2.3` wurde angenommen, danach wegen `security.suspicious` abgeschaerft und als `1.2.4` republished. `1.2.4` ist aktuell `security.clean`, `card.missing`; ungepinnter Verify resolved auf `1.2.4`, öffentliche Seite zeigt neue Settlement-Description.
- Glama API zeigt weiter alten Text und `tools=0`. `glama.json` ist jetzt auf GitHub `main`, aber Glama-Doku verlangt danach den Claim-Flow in der UI, um einen Rescan anzustossen.

**Landing-Deploy:**
- Neuer Cloudflare Pages API Token fuer `clicks-protocol` wurde lokal in `.env` und `projects/clicks-protocol/.env` als `CLOUDFLARE_API_TOKEN` gespeichert. Account ID: `613482732d4af6ca8f094e90fcea3169`.
- Cloudflare Verify-Call erfolgreich: HTTP 200, Token valid and active.
- `npm run build` in `landing-v3/` erneut gruen. Einziger Hinweis bleibt die bekannte Next.js-Warnung wegen mehrerer `package-lock.json`.
- Erster `wrangler pages deploy` lief als Preview auf Branch `feat/video-pipeline-hyperframes`, danach derselbe Build explizit mit `--branch main` als Production deployed.
- Production-Deploy verifiziert ueber Cloudflare API: Deployment `97b7b52d-f43b-4dc4-910b-491c4abecd6a`, Environment `production`, Branch `main`, Stage `deploy: success`.
- Live-Checks gruen:
  - `https://clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`
  - `https://www.clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`
  - `https://clicksprotocol.xyz/docs/api/` HTTP 200
  - `https://clicksprotocol.xyz/.well-known/agent.json` HTTP 200
  - `https://clicksprotocol.xyz/api/openapi.json` HTTP 200

**Wichtiger Befund:**
- Direkt nach dem Production-Deploy hing die nackte Custom Domain kurz am alten HTML-Title. Cache-busted URLs und die Production-Pages-URL waren bereits frisch. Nach kurzem Re-Check waren auch `clicksprotocol.xyz` und `www` ohne Query-String frisch.

## Vorheriger Eingriff (13.07.2026)

**Kanalcheck:**
- X postet weiter live ueber launchd. Verifizierte Runs am 12.07. 20:15 sowie 13.07. 06:15 und 13:15 Berlin.
- `api.clicksprotocol.xyz/`, `/lab` und `/api/public/metrics` antworteten beim Re-Check heute alle mit `200`. Der fruehere `502` war heute nicht reproduzierbar und wirkt derzeit intermittent.
- GitHub-Repo weiter oeffentlich erreichbar, aber oeffentlicher Code-Stand bleibt alt. Letzter sichtbarer Push weiterhin 25.04.

**Heute gefixt:**
- `x-pipeline/queue.json` neu angelegt und mit 9 frischen Posts befuellt. Fokus jetzt auf Settlement-Router statt reinem Yield-Pitch.
- Fuer diese 9 Queue-Posts wurden jetzt auch 9 Hyperframes-MP4s gerendert und direkt als `media_path` in `queue.json` verdrahtet. Output liegt unter `media/renders/settlement-router-queue/`.
- Public Copy in Landing-Metadata, Docs, Getting Started, Treasury Lab und Content-Drafts auf die interne Positionierung gezogen: Settlement zuerst, Yield als Teil des Flows.
- Launchd-X-Pipeline verifiziert: die 9 Queue-Posts decken exakt die Slots 13.07. 20:15 bis 16.07. 13:15 Berlin ab.
- GitHub-Env repariert: `GITHUB_PAT` und `GITHUB_TOKEN` antworten wieder mit `200` und Login `clicksprotocol`.
- Neuer Discord-Invite erstellt und in die Live-Surfaces gezogen: `https://discord.gg/FfmJGUcxfe`
- GitHub-Token-Aufloesung auf Rollenbasis nachgezogen: neuer Helper `scripts/github_auth.py`, Scanner-Wrapper lesen jetzt sauber `read` statt stumpf denselben Fallback zu duplizieren.
- Hyperframes von David geprueft und freigegeben. Der aktuelle X-Lauf bleibt unveraendert: 9 MP4s, 9 Hauptposts, 9 Replies, keine Audio-Track-Spur.
- Drei neue Strategie-Dokumente ins Repo gezogen: `strategy/X402-SETTLEMENT-EXTENSION.md`, `strategy/MARKET-MAP-2026-07.md`, `strategy/PRODUCT-OPPORTUNITIES.md`. Kernbild dort: Clicks nicht als Payment-Rail, sondern als post-payment operating system fuer Agent Revenue.
- Vollstaendiger Kernpfad-Audit gestartet und als Review persistiert: `reviews/2026-07-13-core-path-audit.md`. Wichtigste Findings: Referral-Claim ueber `quickStart(..., referrer)` aktuell technisch nicht belegt, x402-Integrationsdoku beschreibt teils einen nicht existenten SDK-Surface, Public Story driftet zwischen README, Skill, Clawhub und Landing.
- Priorisierte Fix-Reihenfolge daraus abgeleitet und als Review persistiert: `reviews/2026-07-13-fix-priority-plan.md`. Reihenfolge jetzt klar: zuerst falsche technische Claims stoppen, dann Docs/Skills auf echten Code ziehen, erst danach Public Surface und Wording feinziehen.
- `P0` begonnen und erste Truth-Surface bereits bereinigt: SDK-Docstring fuer `quickStart`, Root-README, `docs/x402-integration/README.md`, ACP-Service-Description, Clawhub-Skill, Agent-Skill, Repo-Skill und Landing-API-Doku wurden auf den aktuellen Code-Stand gezogen. Kernkorrektur: `quickStart(..., referrer)` wird nicht mehr als bestehender Referral-Onboarding-Flow dargestellt.
- `Referrer v2` jetzt als technische Zielarchitektur festgehalten in `strategy/REFERRER-V2-SPEC.md`. Kernentscheidung dort: Treasury-Setup und Attribution trennen, `quickStart()` treasury-only halten, Referral ueber eigenen expliziten Flow oder signaturbasierten Authorized-Caller-Flow setzen. Wichtiger Ist-Befund: `ClicksReferral.registerReferral()` behauptet im Kommentar direkte Agent-Nutzung, ist wegen `onlyAuthorized` aber aktuell faktisch facilitator-/contract-only.

**Weiter offen:**
- X-Queue ist nur kurzfristig gefuellt. Reicht fuer 3 Tage bei 3 Slots pro Tag.
- Die Zwei-Token-Trennung ist temporaer aufgehoben. Beide Env-Variablen zeigen aktuell auf den funktionierenden `clicksprotocol`-Token, bis ein separater Secondary-Token erneuert ist.
- Discord-Invite ist jetzt wieder gueltig, aber Automation bleibt unvollstaendig: das `openclaw`-Browserprofil landet aktuell auf der Discord-Loginmaske. Es gibt noch keine persistente User-Session fuer Read/Post/Monitor.
- Naechster operativer Schritt fuer Discord bleibt ein echter Login im `openclaw`-Profil oder belastbare User-Credentials fuer die Browser-Automation.
- Aus der neuen Marktanalyse ergibt sich als klare Produktprioritaet: `x402 -> Clicks -> Treasury Policy -> Identity/Reputation`.
- Neue Prioritaet vor weiterem externen Push: Truth-Surfaces bereinigen, Referral-Flow klarziehen, x402-Doku auf echten Code zurueckfuehren.

## Letzter aktiver Zeitraum vor dem heutigen Eingriff (22.04.–26.04.)

**Content & Distribution:**
- X: 2 Video-Posts (Stat-Card 19%, Landscape-Router) + 5er-Thread + Hashtag-Replies (22.04.)
- X-Carousel Video #2 (`agent-pov-v3-review.mp4`, 30s, 9:16) gepostet am 26.04. — [Tweet](https://x.com/ClicksProtocol/status/2048177422386778566)
- Dev.to: 2 Artikel live
- Video-Pipeline: stat-card + landscape-router Templates + x-carousel-agent-pov v3

**Research & Outreach (alles UNSENT):**
- Partner-Map: 17 HIGH-Relevance-Targets (8 Tier-1, 9 Tier-2, 3 Watchlist)
- DM-Drafts: HeyElsa, Sail, Cambrian — alle fertig, KEINER gesendet
- 1-Pager: PNG + PDF gerendert (V4-only, contract-address-frei)
- Conway Research: 3 Vorschläge (Skill-PR, Cross-Attestation, OpenX402) — alle awaiting Go

**Infra:**
- X-Pipeline Phase 0 live seit 20.04. (launchd statt OpenClaw-Cron)
- xurl-post.sh Media-Upload-Bugs gefixt

## Seit 26.04.: Oeffentlicher Code-Stillstand, aber X lief weiter

**Code/Push:** Letzter Git-Push bleibt 25.04.
**Distribution:** X lief im Juli weiter ueber launchd, aber die Queue war am 13.07. leer und wurde heute manuell neu befuellt.

**Unbeantwortete X-Mentions:**
- @Fortunezxz (07.05.): „Your dm is locked. Is there another way I can reach you guys?“
- @KYD_crypto001 (28./29.04.): „See dm man“ (2x)

## Package Versions

| Package | Version | Registry |
|---------|---------|----------|
| `@clicks-protocol/sdk` | 0.2.1 | npm |
| `@clicks-protocol/mcp-server` | 0.3.2 | npm |
| `@clicks-protocol/eliza-plugin` | 0.2.1 | npm |
| `agent-treasury` | 0.1.1 | npm |
| `clicks-langchain` | 0.2.0 | PyPI |
| `clicks-crewai` | 0.1.1 | PyPI |

## Offene Blocker (recherchiert 13.05.2026)

- **Virtuals ACP Alchemy Paymaster Bug** — GitHub `dgclaw-skill#10` am 30.04. GESCHLOSSEN via Client-Side-Workaround (`wallet_sendPreparedCalls` Bypass). Upstream-Policy NICHT gefixt. Ob Workaround für Clicks Buyer-Flow anwendbar: UNKLAR, muss getestet werden.
- **AgentKit PR #1107** — OFFEN, 0/1 Reviews, stale seit 26 Tagen. Coinbase-Repo ist aktiv (andere PRs werden gemerged), unsere wird ignoriert. Eskalation oder Re-Ping nötig.
- **Miratisu Attestor** — DEAD END. DM seit 26 Tagen unbeantwortet. Haym (CM) hat Context verloren. Kein Fortschritt sichtbar. Alternativen Attestor suchen.
- **GITHUB_PAT** — funktioniert wieder. Aktuell auf den lokal gueltigen `gh auth`-Token von `clicksprotocol` synchronisiert.
- **GITHUB_TOKEN** — funktioniert wieder, zeigt temporaer auf denselben `clicksprotocol`-Token.
- **V5 Ship Gate:** MID-or-better ≥ 50 %. Aktuell 0 %. Kein Fortschritt seit 18.04.
- ~~**1-Pager-PDF fehlt**~~ → DONE 2026-04-22.

## Services / Cron

**LaunchAgents (macOS):**
- `com.clicks.acp-service` - ACP Service Provider, läuft via launchd
- `com.clicks.tier-scanner` - Wöchentlich Do 09:00
- `com.clicks.yield-reporter` - geparked
- `com.clicks.x-post-asia` - Daily 06:15 Berlin, postet aus `queue.json` via `xurl-post.sh`
- `com.clicks.x-post-eu` - Daily 13:15 Berlin
- `com.clicks.x-post-us` - Daily 20:15 Berlin

**OpenClaw-Cron (Gateway):**
- X Mention Check (`60d3bc88`, 15:15) - enabled
- 3 X-Posting-Jobs (`a61f1671`/`d8dab48e`/`ccfecda8`) - **DISABLED** seit 20.04 (launchd ist Single-Actor)
- Tier-Scanner / Trending-Scanner / Health-Monitor / Morning-Briefing - enabled

**X-Pipeline:**
- Skript: `x-pipeline/xurl-post.sh` (Single Source of Truth fuers Posten)
- Queue: `x-pipeline/queue.json` (am 13.07. neu angelegt, aktuell 9 Entries)
- Pool: `x-pipeline/queue.json.bak-before-skill-launch` + `queue-week-2026-05-19.md` als Altmaterial
- Logs: `x-pipeline/launchd-logs/{asia,eu,us}-{stdout,stderr}.log`

## Public Presence

- Landing: https://clicksprotocol.xyz mit ERC-8004 Badge
- Schema V1: https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md
- Seeding-Strategie: https://clicksprotocol.xyz/strategy/TRUSTED-ATTESTORS-SEEDING.md
- Dev.to (2 Artikel):
  - https://dev.to/clicksprotocol/x402-solved-payments-who-solves-treasury-531h
  - https://dev.to/clicksprotocol/19-of-on-chain-activity-is-ai-agents-and-100-of-their-usdc-is-idle-by-default-2l2j
- Farcaster Mini App: https://clicksprotocol.xyz/miniapp/
- BaseScan Identity: https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074
- Cursor Directory: listed (April 2026)

## Conway Research / Automaton Integration (Stage 1, 2026-04-25)

Three permissionless tracks built today (no Conway-Research-Buy-In erforderlich):

**Vorschlag 1 - Clicks-Skill für Conway-Research/skills**
- [`integrations/conway-research-skills/clicks-protocol/SKILL.md`](integrations/conway-research-skills/clicks-protocol/SKILL.md) - YAML-frontmatter + markdown skill nach Convention von [Conway-Research/skills](https://github.com/Conway-Research/skills)
- [`integrations/conway-research-skills/SKILLS.md.diff`](integrations/conway-research-skills/SKILLS.md.diff) - Index-Eintrag + PR-Body-Draft
- [`integrations/conway-research-skills/README.md`](integrations/conway-research-skills/README.md) - Fork+PR-Befehlssequenz
- **Status:** Draft komplett. Awaiting David go für Fork+PR (Rule #6).

**Vorschlag 3 - Cross-Attestation Strategy**
- [`strategy/CROSS-ATTESTATION-CONWAY.md`](strategy/CROSS-ATTESTATION-CONWAY.md) - Pattern A (we attest Conway agents), Pattern B (Conway agents attest us), Pattern C (deferred bilateral)
- [`scripts/seed-conway-attestations.ts`](scripts/seed-conway-attestations.ts) - Dry-run-only. `--execute` blockt absichtlich, weil signer-Frage offen
- [`scripts/conway-attestations.config.example.json`](scripts/conway-attestations.config.example.json) - Template. Hard Rule #1 enforced (Operator-Wallet als Attestor refused mit exit 3)
- **Status:** Phase 0 ready. Phase 1 (erste echte Attestation) braucht David go + dedicated trusted-attestor wallet.

**Vorschlag 5 - OpenX402 Facilitator Registration**
- [`strategy/OPENX402-REGISTRATION.md`](strategy/OPENX402-REGISTRATION.md) - Was wir wissen / nicht wissen / Phase-Plan
- [`scripts/openx402-register.ts`](scripts/openx402-register.ts) - Stub mit dry-run default
- **Status:** Verified `POST /api/register` existiert (returns `{"error":"Missing required fields"}`). Spec unklar. Phase 2 = Conway DM/Email für Spec.

## Nächste Schritte (priorisiert, Stand 13.05.2026)

**David muss:**
1. **Secondary GitHub-Token trennen** — langfristig wieder separates `GITHUB_TOKEN` fuer `openclawemmaschneider` statt Shared-Fallback.
2. **Entscheiden: Clicks weiter P0 oder bewusst pausiert?** — 18 Tage Stillstand ohne explizite Pause.
3. **Outreach Go/No-Go:** HeyElsa, Sail, Cambrian DMs sind seit 22.04. fertig und ungesendet.
4. **Conway-Research PR:** Fork+PR ready seit 25.04., wartet auf Go.

**Emma kann autonom:**
5. X-Mentions beantworten (Fortunezxz + KYD_crypto001)
6. AgentKit PR #1107 erneut pingen oder Eskalationsstrategie ändern
7. ACP Buyer-Flow mit dgclaw-Workaround testen
8. Alternativen Attestor zu Miratisu recherchieren
9. queue.json erneut vor Ablauf pruefen und X-Pipeline weiter befuellen

**Weiterhin geltend:**
10. V5 NICHT deployen bis MID-or-better ≥ 50 %

## Sync-Regeln zwischen Emma & Claude (neu)

- **CLAUDE.md + STATUS.md sind SSoT.** Kein Widerspruch erlaubt.
- Jede Session endet mit STATUS.md-Update (Datum + "Heute geshippt"-Abschnitt).
- Research-Outputs (wie Emmas Partner-Map) werden **in den Repo persistiert**, nicht nur in Telegram - sonst verlieren wir sie.
- Bei Contract-Version-Referenzen: **IMMER CLAUDE.md lesen** bevor Outreach-Text geschrieben wird.

## Heute geshippt, 2026-07-13, Referrer v2

- Neue Build-Datei: `strategy/REFERRER-V2-IMPLEMENTATION-PLAN.md`
- Build-Reihenfolge jetzt festgezogen:
  1. `ClicksReferral.sol` Kommentar plus Signatur-Flow
  2. SDK `REFERRAL_ABI`, Result-Types und `registerReferralWithSig(...)`
  3. MCP `clicks_register_referral`
  4. ACP `treasury_setup_with_referral`
  5. erst danach `quickStartWithReferral(...)`
- Wichtigster technischer Zusatzbefund:
  - SDK hat heute noch keinen Referral-Write-Surface
  - MCP hat Read-Surface, aber keinen ehrlichen Referral-Write-Pfad
  - `clicks_quick_start` nimmt in MCP weiter `referrer` an und muss in der Umsetzung bereinigt werden
- Phase 1 jetzt wirklich gebaut:
  - `contracts/ClicksReferral.sol` hat einen neuen `registerReferralWithSig(...)`-Pfad
  - EIP-712-Approval lokal im Contract gehasht, ohne Compiler-Bump auf `^0.8.24`
  - Replay-Schutz ueber `referralNonces`
  - Ablaufschutz ueber `deadline`
  - Signer ist in der ersten ehrlichen Scheibe der **Agent selbst**, noch nicht der Operator
- Verifikation:
  - `npx hardhat compile` gruen
  - `npx hardhat test test/ClicksReferral.test.ts` gruen mit **37 passing**
- Phase 2 jetzt im SDK gebaut:
  - neuer `REFERRAL_ABI` in `sdk/src/abis.ts`
  - neue Typen `ReferralApprovalTypedData` und `ReferralRegistrationResult`
  - `ClicksClient` kennt jetzt `getReferralNonce()`, `buildReferralApprovalTypedData()`, `signReferralApproval()` und `registerReferralWithSig()`
  - raw `referralContract` ist jetzt ebenfalls im Client exponiert
  - `quickStart(..., referrer)` ist weiter nur deprecated/reserved, nicht wieder heimlich aktiviert
- SDK-Verifikation:
  - `npx tsc --noEmit --module commonjs --target ES2020 --esModuleInterop --strict --skipLibCheck sdk/src/*.ts` gruen
  - `npx hardhat compile` danach weiter gruen
- Phase 3 jetzt im MCP gebaut:
  - `clicks_quick_start` nimmt keinen `referrer` mehr an
  - neuer Write-Toolpfad `clicks_register_referral`
  - MCP-Descriptions sprechen jetzt dieselbe Wahrheit: Treasury-Setup und Attribution sind getrennte Schritte
  - `clicks_explain` Tool-Liste auf den neuen MCP-Surface gezogen
- Phase 5 Public Surface Sync jetzt nachgezogen:
  - `sdk/README.md` dokumentiert jetzt `registerReferralWithSig()` und `quickStartWithReferral()` sauber als expliziten Zwei-Schritt-Flow
  - Root-README zeigt den empfohlenen Combined-Flow und korrigiert die MCP-Toolliste auf 11 Tools
  - `agent-skill/`, `skills/clicks-protocol/` und `clawhub-skill/` nennen jetzt den ehrlichen Referral-Wrapper statt nur den reservierten `quickStart(..., referrer)`-Pfad
  - Landing-API-Doku enthaelt jetzt eigene Sections fuer `registerReferralWithSig()` und `quickStartWithReferral()`
  - `landing-v3/public/llms.txt` und `landing-v3/public/api/openapi.json` wurden auf den neuen Surface gezogen, inklusive Entfernen des alten `referrer`-Query-Parameters aus `quickStart`
- Restliche Landing-Surfaces jetzt ebenfalls synchronisiert:
  - `about/page.tsx`, `docs/getting-started/page.tsx`, `app/layout.tsx`, `app/whitepaper/page.tsx` und `landing-v3/public/llms.txt` sprechen jetzt denselben Referrer-v2-Stand
  - Whitepaper beschreibt Referral jetzt als explizite Attribution nach Treasury-Setup statt als impliziten Quickstart-Nebeneffekt
  - alte MCP-Zaehlungen in Landing, README-Architektur und Discovery-Texten auf 11 Tools korrigiert
- Verifikation:
  - `npm run build` in `landing-v3/` gruen
  - einziger Build-Hinweis war ein bestehender Next.js-Workspace-Root-Warning wegen mehrfacher `package-lock.json`
- Discovery- und Static-Artefakte jetzt ebenfalls bereinigt:
   - `.well-known/agent.json`, `ai-plugin.json`, `clicks-protocol.json`, `mcp.json`, `x402.json`
   - `public/mcp/server.json`
   - `public/llms.txt`
   - `public/api/openapi.json`
   - `public/miniapp/index.html`
 - Wichtige Korrekturen dort:
   - Yield-first-Claims auf Settlement-Router-Frame gezogen
   - alter Discord-Invite entfernt
   - MCP-Surfaces auf 11 Tools inklusive `clicks_register_referral` und `clicks_explain`
   - `openapi.json` syntaktisch repariert und weiter auf ehrlichen Treasury-/Referral-Flow gezogen
   - Miniapp-Referral-Box spricht jetzt nicht mehr von impliziter Referral-Logik
- Zusätzliche Verifikation:
  - alle geänderten JSON-Dateien parsebar
  - erneuter `npm run build` in `landing-v3/` gruen
 - Deploy-Versuch gemacht, aber aktuell blockiert:
   - `wrangler pages deploy out --project-name=clicks-protocol --commit-dirty=true` scheitert derzeit an Cloudflare Pages Auth
   - der im Workspace auffindbare Token reicht nicht fuer Pages-Write oder sogar `wrangler pages project list` und liefert API-Fehler `Authentication error [code: 10000]`
 - Nicht-landingnahe Publish-Metadaten bereits vorbereitet:
   - `sdk/package.json`
   - `mcp-server/package.json`
   - `mcp-server/server.json`
   - `integrations/eliza/package.json`
   - `agent-treasury/package.json`
   - `acp-service/package.json`
   - Root-`package.json`
 - Diese Package-Surfaces sprechen jetzt ebenfalls Settlement Router statt Yield-first
- MCP-Verifikation:
  - `npm run build` in `mcp-server/` gruen
- Phase 4 jetzt im ACP-Service gebaut:
  - Treasury-Setup bleibt der Default-Flow
  - optionaler expliziter Referral-Schritt nur mit `referrerAddress`, `referralDeadline` und `referralSignature`
  - ACP prueft jetzt vor Attribution, ob der lokale Caller auf `ClicksReferral` ueberhaupt autorisiert ist
  - wenn nicht, bleibt Treasury erfolgreich und Referral wird sauber als nicht ausgefuehrt gemeldet
  - Referral-Write im ACP laeuft bewusst ueber den raw Contract-Call, nicht ueber einen stillen Quickstart-Hook
- ACP-Verifikation:
  - `npx tsc --noEmit service.ts --module esnext --moduleResolution bundler --target ES2022 --esModuleInterop --strict --skipLibCheck` gruen
  - wichtiger Nebenbefund: der rohe CJS-`tsc`-Pfad des ACP-Service ist generell irrefuehrend wegen altem ESM/CJS-Mix, auch unabhaengig vom Referral-Change
- Combined Wrapper jetzt gebaut:
  - `sdk/src/client.ts` hat jetzt `quickStartWithReferral(...)`
  - neue Return-Type `QuickStartWithReferralResult`
  - Wrapper fuehrt bewusst erst Treasury-Setup, dann Attribution aus
  - wenn Attribution scheitert, bleibt Treasury-Erfolg sichtbar und der Fehler wird separat zurueckgegeben
  - `sdk/README.md` ist auf den neuen Flow gezogen
- Wrapper-Verifikation:
  - `npx tsc --noEmit --module commonjs --target ES2020 --esModuleInterop --strict --skipLibCheck sdk/src/*.ts` gruen
  - `npm run build` in `sdk/` gruen
## External releases, 2026-07-21

- X explainer `Payment is not settlement` published and pinned: https://x.com/ClicksProtocol/status/2079647031191122072
- Settlement claim cleanup deployed to production: https://clicksprotocol.xyz
- Cloudflare Pages deployment: https://4cec05c2.clicks-protocol.pages.dev
- ClawHub `protogenosone/clicks-protocol` 1.2.7 published. Security scan is asynchronous.
- GitHub `main` pushed through commit `9bace6796e0b39594369087fe1bb7a30083ab6a4`.
