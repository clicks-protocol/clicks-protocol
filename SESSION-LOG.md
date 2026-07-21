# Clicks Protocol Session Log

> Append-only. Neue Sessions unten anfuegen. Nie altes loeschen.

---

## 2026-04-10 — Initiale Erstellung

- **Aktion:** SESSION-LOG.md erstellt (fehlte trotz AGENTS.md:355 Pflicht)
- **Aktueller Stand:** Siehe STATUS.md
- **Kontext:** PR #26 offen, Builder Code bc_tnbja5eg, naechster Schritt ERC-8021

---

## 2026-04-17 — V2 Fixes + Positionierung + ACP + ERC-8004 Mint

**Highlights:**
- V2 Contracts live (ClicksFeeV2 + ClicksSplitterV4), Referral-Bug K1 gefixt
- Safe Multisig ownership transfer complete (K2 gefixt)
- Sämtliche npm/PyPI-Packages auf 0.2.0 gebumpt
- Farcaster Mini App registriert
- ACP Service Provider als `auto_yield_treasury` gelauncht (Alchemy-Paymaster-Bug blockiert Buyer-Test)
- Deep-Research zur Agent-Finance-Landschaft → Neupositionierung: "Agent Commerce Settlement Router"
- ERC-8004 Identity Mint: **agentId 45074** auf Base, Tx `0x76123d72...`
- Landing-Redeploy mit `/.well-known/agent-registration.json`
- ElizaOS Plugin publiziert (`@clicks-protocol/eliza-plugin@0.2.0`)

**Merged heute:** PR #5, #6

---

## 2026-04-18 — V5 Prototype + Attestor Tooling + Distribution

**Highlights:**
- `ClicksReputationMultiplierV1` geshippt (24 Tests) — Tier-Mapping via ERC-8004 Reputation
- Live-ABI-Verifikation: Reputation Registry braucht non-empty attestor-array → Whitelist-Design essentiell
- `ClicksSplitterV5` Prototype (14 Tests, 227/227 Regression grün)
- **Erste Schema-V1 Attestation on-chain:** Tx `0x5aec2067...`, readFeedback verifiziert
- Registry ist 1-indexed (wichtig für Reader)
- Attestor Schema V1 publiziert (strategy/ + /strategy/ auf clicksprotocol.xyz)
- Trusted-Attestors-Seeding-Strategie dokumentiert
- Tier-Scanner wöchentlicher launchd-Cron (`com.clicks.tier-scanner`)
- Landing mit ERC-8004 Badge + Identity-NFT-Link
- Dev.to Artikel publiziert: "X402 Solved Payments. Who Solves Treasury?"
- Miratisu/Virtuals DM-Draft fertig (unsent)

**Merged heute:** PR #7, #8, #9, #10

**Wichtiger strategischer Befund:** Live-Simulation zeigt: ERC-8004 Reputation-Graph auf Base ist im April 2026 praktisch leer. Wenn V5 jetzt deployen würde, landet quasi jeder Agent in COLD (3 %) — Fee-Erhöhung statt Senkung. V5-Ship-Gate daher: MID-or-better ≥ 50 % der Clicks-Agents. Aktuell 0 %.

**Blocker/Offen:**
- Miratisu-Antwort zum ACP-Paymaster-Bug weiterhin offen
- AgentKit PR #1107 Review ausstehend
- G1 DM an Miratisu per Discord manuell senden
- Artikel-Distribution (X/Farcaster) per H1 ausstehend

---

## 2026-04-22 — Content & Distribution Day + Partner-Map + Outreach-Drafts

**Highlights:**
- 2 Video-Posts auf X (Stat-Card 19%, Landscape-Router 30s) + 5er-Thread
- Dev.to Artikel #2 live
- Partner-Map: 17 HIGH-Relevance-Targets (8 Tier-1, 9 Tier-2)
- Outreach-Drafts: HeyElsa, Sail, Cambrian (alle fertig, NICHT gesendet)
- 1-Pager PNG + PDF gerendert (V4-only, contract-address-frei)
- xurl-post.sh Media-Upload-Bugs gefixt (ANSI-Parse + --wait)

---

## 2026-04-25 — Conway Research Integration + V4 Outreach Prep

**Highlights:**
- Conway Research: 3 permissionless Tracks (Skill-PR, Cross-Attestation, OpenX402-Registration) — alle awaiting David Go
- Outreach-Tracker JSON angelegt
- STATUS.md umfassend aktualisiert

---

## 2026-04-26 — X-Carousel Video #2 gepostet

**Highlights:**
- `agent-pov-v3-review.mp4` (30s, 9:16) auf @ClicksProtocol via xurl
- Tweet: https://x.com/ClicksProtocol/status/2048177422386778566
- Hashtags: #AIagents #Base #x402 #onchain (#DeFi raus auf Davids Wunsch)

---

## 2026-05-13 — Vollständige Diagnose nach 18 Tagen Stillstand

**Trigger:** Gateway-Neustart + David fragt nach Status. MEMORY.md war 6 Tage veraltet, Projekt-Doku 18–23 Tage.

**Diagnose-Ergebnisse:**
- Infrastruktur: Alles läuft (Website, npm, ACP Service, Cron Jobs, Contracts)
- GITHUB_PAT: 401 Bad Credentials — Token expired, muss erneuert werden
- X: Letzter Post 26.04., 2 unbeantwortete Mentions (Fortunezxz, KYD_crypto001)
- Repo: Letzter Push 25.04., 0 offene Issues/PRs

**Blocker-Recherche:**
- Virtuals ACP Bug: GitHub-Issue geschlossen (30.04.) via Client-Side-Workaround. Upstream nicht gefixt. Anwendbarkeit für Clicks Buyer-Flow unklar.
- AgentKit PR #1107: Offen, 0 Reviews, 26 Tage stale. Wird ignoriert.
- Miratisu Attestor: Dead End. 26 Tage ohne Antwort. Alternativ-Attestor nötig.

**Aktion:** Alle 4 Doku-Dateien (CLAUDE.md, STATUS.md, SESSION-LOG.md, DASHBOARD.md) auf Stand gebracht.

---

## 2026-07-13 — Kanalcheck, Queue-Refill, Messaging-Drift korrigiert

**Trigger:** David wollte den aktuellen Stand auf allen Clicks-Kanaelen sehen und direkt die Punkte 1 bis 3 abarbeiten: X-Queue auffuellen, API-Fehler eingrenzen, Messaging-Drift beheben.

**Verifiziert:**
- X lebt weiter ueber launchd. Verifizierte Posting-Zeiten aus den Logs: 12.07. 20:15 sowie 13.07. 06:15 und 13:15 Berlin.
- `api.clicksprotocol.xyz/`, `/lab` und `/api/public/metrics` lieferten beim Re-Check alle `200`. Das frueher beobachtete `502`-Bild war in dieser Session nicht reproduzierbar und ist derzeit als intermittenter Fehler zu behandeln.
- Repo bleibt oeffentlich erreichbar, oeffentlicher Push-Stand aber weiter 25.04.

**Geliefert:**
- Neue `x-pipeline/queue.json` mit 9 frischen Settlement-Router-Posts plus Reply-Texte.
- Public Copy in `landing-v3/app/layout.tsx`, `landing-v3/app/docs/page.tsx`, `landing-v3/app/docs/getting-started/page.tsx`, `landing-v3/components/calculator.tsx` und Content-Drafts auf Settlement-Router-Positionierung gezogen.
- Treasury-Lab- und Launch-Texte jetzt konsistenter: liquid working capital + routed yield statt reines Yield-Produkt-Framing.
- Launchd-X-Pipeline verifiziert: `com.clicks.x-post-{asia,eu,us}` sind geladen, lesen `queue.json` und decken die 9 Posts exakt fuer die Slots 13.07. 20:15 bis 16.07. 13:15 Berlin ab.
- GitHub wieder lauffaehig gemacht: `.env`-Variablen `GITHUB_PAT` und `GITHUB_TOKEN` auf den funktionierenden lokalen `gh auth`-Token synchronisiert, Hardcodes in Scanner-Skripten entfernt.
- Discord repariert: alter Invite `clicks-protocol` ist tot (`Unknown Invite`), neuer Invite `FfmJGUcxfe` per Bot-API erzeugt und in Live-Surfaces ersetzt.

**Offen nach der Session:**
- Queue reicht nur fuer rund 3 Tage bei 3 Slots pro Tag.
- Discord-Invite funktioniert jetzt wieder, aber echter Betriebszustand bleibt duenn: Server hat aktuell 3 Mitglieder, 1 online, und die dedizierte User-Automation fehlt weiter.
- Die GitHub-Dual-Token-Struktur ist nur temporaer ueberbrueckt und spaeter sauber zu trennen.

---

## 2026-07-13 — Hyperframes-Queue verdrahtet, GitHub-Rollen geklaert, Discord-Login verifiziert

**Trigger:** David wollte die 9er-X-Queue auch als Hyperframes haben, GitHub sauberer getrennt sehen und Discord-Browser-Automation wirklich bis zum Login-Status geklaert haben.

**Geliefert:**
- Neue Hyperframes-Kampagnen-Template `video-pipeline/templates/settlement-queue-card.html` gebaut.
- Batch-Renderer `video-pipeline/render-settlement-router-queue.ts` gebaut und ausgefuehrt.
- 9 MP4s erfolgreich gerendert nach `media/renders/settlement-router-queue/tweet-01.mp4` bis `tweet-09.mp4`.
- `x-pipeline/queue.json` jetzt fuer alle 9 Posts mit `media_path` auf die gerenderten MP4s verdrahtet. LaunchAgents koennen die Queue damit direkt als Media-Posts abarbeiten.
- GitHub-Resolver `scripts/github_auth.py` angelegt. `run_trending_scanner.py`, `test_scanner_fixed.py` und `run_trending_scanner.sh` lesen jetzt rollenbasiert statt einen toten oder zufaelligen Token-Fallback zu nehmen.
- `discord-automation/README.md` auf Realitaet gezogen: Invite ist live, aber Browser-Login fehlt.

**Verifiziert:**
- Render-Output existiert fuer alle 9 Assets, Dateigroessen grob 935 KB bis 1.1 MB.
- `queue.json` zeigt jetzt fuer jeden Post einen `media_path`.
- `openclaw`-Browserprofil laeuft, aber `https://discord.com/app` zeigt aktuell die Loginmaske `Willkommen zurueck!` mit E-Mail/Telefon, Passwort und QR-Login. Heisst: keine persistente Discord-User-Session vorhanden.

**Offen:**
- Fuer echte Discord-Automation fehlt weiterhin entweder eine gespeicherte User-Session im `openclaw`-Profil oder belastbare User-Credentials/QR-Freigabe.
- Die saubere Zwei-Token-Trennung ist im Code vorbereitet, aber faktisch noch nicht vollstaendig, weil der Secondary-Token fuer `openclawemmaschneider` lokal weiterhin nicht erneuert verifiziert werden konnte.

---

## 2026-07-13 — Endstand festgezogen nach Review der Hyperframes

**Trigger:** David hat die 9 Hyperframes gesichtet, freigegeben und wollte den aktuellsten Stand explizit in einer Markdown-Datei festgehalten haben.

**Finaler Stand:**
- X ist fuer den aktuellen Lauf komplett vorbereitet: 9 Slots, 9 Hauptposts, 9 Replies, 9 Hyperframes-MP4s.
- Hyperframes liegen unter `media/renders/settlement-router-queue/` und sind direkt in `x-pipeline/queue.json` ueber `media_path` verdrahtet.
- Die Clips sind bewusst stumm. Kein Audio-Track, damit die Visuals als X-Media ohne Sound-Abhaengigkeit funktionieren.
- GitHub ist kurzfristig wieder funktionsfaehig, aber die echte Zwei-Token-Trennung bleibt als Follow-up offen.
- Discord-Invite ist live und gueltig, aber die Browser-Automation ist noch nicht eingeloggt und damit nicht operativ.

**Nicht mehr anfassen ohne neuen Auftrag:**
- Die 9 Posts selbst
- Die 9 Replies
- Die 9 Hyperframes fuer den aktuellen 3-Tage-Lauf

---

## 2026-07-13 — Strategische Neupackung nach Markt-Scan

**Trigger:** David wollte die neue x402-, wallet- und agent-commerce-Landschaft in konkrete Clicks-Strategie uebersetzt haben.

**Geliefert:**
- `strategy/X402-SETTLEMENT-EXTENSION.md`
- `strategy/MARKET-MAP-2026-07.md`
- `strategy/PRODUCT-OPPORTUNITIES.md`

**Kernaussage:**
- Clicks soll nicht als Payment-Rail oder Yield-App gelesen werden.
- Clicks soll als `post-payment operating system` fuer Agent Revenue geschaerft werden.
- Das neue strategische Kernmodell lautet: `x402 -> Clicks -> Treasury Policy -> Identity/Reputation`.

**Wichtigster Schluss:**
- `x402` und verwandte facilitator/payment layers sind eher Upstream-Partner als Kerngegner.
- Die eigentliche Differenzierung fuer Clicks liegt in Settlement, Treasury-Policy, Identity, Reputation und spaeter attested receipts bzw. dispute-readiness.

---

## 2026-07-13 — Core-Path-Audit mit harten Widerspruechen

**Trigger:** David wollte keinen oberflaechlichen Blick mehr, sondern einen echten Audit der Kernpfade `contracts`, `sdk`, `mcp-server`, `acp-service`, `landing-v3` und `clawhub-skill`.

**Geliefert:**
- Review-Dokument `reviews/2026-07-13-core-path-audit.md`

**Wichtigste Findings:**
- `sdk.quickStart(..., referrer)` nimmt zwar einen Referrer an, nutzt ihn aber aktuell nicht fuer echte Referral-Registrierung.
- `acp-service` verkauft genau diesen Flow trotzdem als funktionierendes Referral-Onboarding und baut sein Narrativ darauf auf.
- `docs/x402-integration/README.md` beschreibt teils einen anderen, nicht existierenden SDK-Surface.
- README, Skill, Clawhub und Landing sind in Positionierung, Testzahlen und teils Links nicht sauber synchron.

**Schluss:**
- Das groesste aktuelle Risiko liegt nicht primaer im Contract-Core, sondern in der Drift zwischen Code, Doku und Public Surface.
- Vor weiterem Push sollte die Truth Surface bereinigt werden.

---

## 2026-07-13 — Fix-Priorisierung nach dem Audit festgezogen

**Trigger:** David wollte nach dem Audit keine lose Meinung, sondern eine harte Reihenfolge: was zuerst, was spaeter, was nur Wording.

**Geliefert:**
- Review-Dokument `reviews/2026-07-13-fix-priority-plan.md`

**Priorisierung:**
- `P0`: Referral-Claim geradeziehen, x402-Doku auf echten SDK-Stand ziehen, ACP-Service sprachlich und sachlich entgiften
- `P1`: README, Skills, Clawhub, Testzahlen und Security-Claims synchronisieren
- `P2`: Landing-Feinschliff und reines Messaging/Wording

**Wichtigster Beschluss:**
- Kein neuer Push und kein neues Produkt-Storytelling, bevor die Truth Surface wieder sauber ist.

---

## 2026-07-13 — P0 gestartet: Truth-Surface gegen echten Code gezogen

**Trigger:** David wollte nicht nur Priorisierung, sondern den unmittelbaren Start von `P0`.

**Geliefert:**
- `sdk/src/client.ts` Docstring fuer `quickStart` auf ehrlichen Stand gezogen
- `docs/x402-integration/README.md` komplett neu geschrieben, jetzt als ehrliche post-payment-Settlement-Guide statt Wunsch-API
- `acp-service/service.ts` von Referral-Onboarding-Narrativ befreit und auf echten Treasury-Setup-Scope reduziert
- Referral-Claims in `README.md`, `clawhub-skill/SKILL.md`, `skills/clicks-protocol/SKILL.md`, `agent-skill/SKILL.md` und `landing-v3/app/docs/api/page.tsx` abgeschaerft
- Veraltete Discord-Links im Root-README auf den live Invite `FfmJGUcxfe` gezogen

**Wichtigste inhaltliche Korrektur:**
- `quickStart(..., referrer)` wird jetzt nicht mehr als aktiver Onboarding-Pfad fuer Referral-Attribution dargestellt, sondern als reservierter Parameter bzw. als Flow, der eine spaetere dedizierte Referral-Registrierung braucht.

**Rest in P0:**
- weitere direkte Public Surfaces auf denselben Wahrheitsstand ziehen, falls wir noch tiefer in Landing, `llms.txt` oder andere Discovery-Flaechen gehen wollen

---

## 2026-07-13 — Referrer v2 als technische Zielarchitektur beschrieben

**Trigger:** David wollte das Referrer-Konzept nicht nur verbal eingeordnet haben, sondern als saubere technische Zielarchitektur ins Repo ziehen.

**Geliefert:**
- `strategy/REFERRER-V2-SPEC.md`

**Kern der Spec:**
- `quickStart()` bleibt treasury-only
- Attribution wird in einen eigenen expliziten Referral-Registrierungsflow ausgelagert
- optionaler Wrapper `quickStartWithReferral()` erst spaeter als UX-Sugar
- bevorzugte Richtung: `onlyAuthorized` beibehalten und Referral ueber signaturbasierten Authorized-Caller-Flow registrieren

**Wichtiger Ist-Befund:**
- `ClicksReferral.registerReferral()` existiert bereits, aber der aktuelle Kommentar ist irrefuehrend: direkte Agent-Nutzung wird behauptet, technisch verhindert `onlyAuthorized` das heute.

**Produktschluss:**
- Der urspruengliche Clicks-Clou bleibt erhalten: Distribution sitzt am Treasury-Eintrittspunkt.
- Aber in V2 wird das explizit, auditierbar und zustimmungspflichtig modelliert statt versteckt im Helper.

---

## 2026-04-20 — X-Pipeline Redesign (Phase 0 live)

**Trigger:** OpenClaw-LLM-Cron postete unzuverlässig — LLM (oft `openrouter/free` als Fallback) halluzinierte "Tweet erfolgreich gepostet" ohne `xurl-post.sh` tatsächlich aufzurufen. Beweis im Run-Log [a61f1671...jsonl](../../cron/runs/a61f1671-6ad2-4c37-a977-a2620095c6f1.jsonl) Z.21+23: rohes `TOOLCALL>...` als Text statt Execute. queue.json war seit 19.04 leer.

**Architektur-Entscheidung:** LLM = Advisor, Skript = Actor. LLM darf NIE selbst externe Aktionen ausführen — wählt nur aus, gibt JSON zurück. Wrapper-Skript ruft xurl deterministisch auf und verifiziert Response. Halluzinationen sind unmöglich.

**Karpathy-Pattern korrekt aufgesetzt:** Echtes modify→measure→keep mit OBJEKTIVER Metrik (X-Engagement nach 24h: impressions × likes × reposts × replies). Self-Score 1-10 ist Cargo-Cult, kein echter Loop. Bestehender "Autoresearch Night Session" Job (4aebebcd) Block 1 bleibt deshalb DISABLED.

**Phase 0 live (heute ~12:00):**
- 3 OpenClaw-Cron-X-Posting-Jobs DISABLED (`a61f1671`, `d8dab48e`, `ccfecda8`) via `openclaw cron disable`
- Mention-Check (`60d3bc88`, 15:15) bleibt enabled — wird Phase 4 erweitert
- 3 LaunchAgents erstellt + loaded: `com.clicks.x-post-{asia,eu,us}` (06:15/13:15/20:15 Berlin)
- queue.json refüllt mit 25 Tweets (Mix aus final-tweets.md APPROVED + achievement-tweets.md DRAFT) → 8.3 Tage Buffer
- xurl-post.sh unverändert (nutzt `xurl --app clicks post`, OAuth in `~/.xurl`)
- Erste reguläre Verifikation steht aus: 13:15 EU-Run heute

**Roadmap Phasen 1–4:**
- P1: Tweet-Tagging (hook/audience/cta YAML-Frontmatter)
- P2: Metrics-Capture LaunchAgent (stündlich, ~3 reads/day = 90/Mo, 6% von 1500 X-API Free Tier)
- P3: Selector-Skript mit `claude -p --output-format json` (LLM wählt Index, Wrapper postet)
- P4: Learning-LaunchAgent + Telegram-Mention-Reply-Bot mit Inline-Buttons

**Bewusst NICHT im Plan:**
- Auto-Reply auf Mentions (Halluzinations-Risiko)
- Voll-autonomes LLM-Refill in queue.json (statt echtem Engagement-Loop)
- Multi-Account-Posting

**Plan-Datei:** `~/.claude/plans/erkunde-auf-meiner-opneclaw-jolly-chipmunk.md`

**Emma — Hard Rule für X-Pipeline:**
- Cron-Wrapper für externe Aktionen (Tweet/Email/Push/Deploy): IMMER LLM = Advisor, Skript = Actor
- xurl-post.sh ist Single Source of Truth fürs Posten — KEIN LLM-Cron-Job darf direkt xurl aufrufen oder "Tweet gepostet" ohne Skript-Verification melden
- queue.json wird durch Pipeline rotiert — manuelle Edits nur wenn Pipeline gestoppt

---

## 2026-07-13 — Referrer v2 von Spec auf Build-Plan gezogen

**Trigger:** David wollte nach der Spec nicht nur Architektur, sondern die konkrete Contract- und SDK-Todo-Liste.

**Geliefert:**
- `strategy/REFERRER-V2-IMPLEMENTATION-PLAN.md`

**Wichtigste Festlegungen:**
- `quickStart()` bleibt treasury-only
- Contract zuerst, danach SDK, dann MCP, dann ACP
- `quickStartWithReferral()` kommt bewusst erst nach dem echten Attribution-Write-Flow
- bevorzugte Richtung bleibt `registerReferralWithSig(...)` bei beibehaltetem `onlyAuthorized`

**Neue technische Befunde:**
- SDK hat aktuell keinen Referral-ABI und keinen Referral-Write-Surface
- MCP hat bereits Referral-Read-Tools, aber noch keinen sauberen Referral-Write-Pfad
- `clicks_quick_start` nimmt in MCP weiter `referrer` an, obwohl der Flow technisch nicht existiert

**Naechster Implementierungszug:**
- `contracts/ClicksReferral.sol` aufmachen und den signaturbasierten Pfad plus Testfaelle wirklich bauen

---

## 2026-07-13 — Referrer v2 Phase 1 im Contract gebaut

**Trigger:** David gab direkt Go fuer Phase 1 im Contract.

**Geliefert:**
- `contracts/ClicksReferral.sol`
- `test/ClicksReferral.test.ts`

**Was gebaut wurde:**
- neuer Contract-Pfad `registerReferralWithSig(address newAgent, address referrer, uint256 deadline, bytes signature)`
- typed approval ueber EIP-712-Pattern mit lokalem Domain-Separator im Contract
- Replay-Schutz ueber `referralNonces`
- Ablaufkontrolle ueber `deadline`
- alter `registerReferral(...)`-Pfad bleibt als authorized-only Legacy/Explicit-Path bestehen
- irrefuehrender Kommentar an `registerReferral(...)` auf ehrlichen Stand gezogen

**Wichtige Implementierungsentscheidung:**
- In dieser ersten echten Scheibe signiert **der Agent selbst**
- nicht der Operator
- Grund: `ClicksReferral.sol` kennt heute keinen Registry-Operator-Context; Operator-Signaturen wuerden die Contract-Surface sofort breiter aufreissen

**Teststand:**
- `npx hardhat compile` gruen
- `npx hardhat test test/ClicksReferral.test.ts` gruen
- Ergebnis: **37 passing**

**Neue Testfaelle:**
- gueltige Signatur
- abgelaufene Signatur
- falscher Signer
- Replay derselben Signatur
- unauthorized caller trotz gueltiger Signatur

**Naechster sinnvoller Zug:**
- SDK auf denselben Write-Flow ziehen: `REFERRAL_ABI`, Result-Type und `registerReferralWithSig(...)`

---

## 2026-07-13 — Referrer v2 Phase 2 ins SDK gezogen

**Trigger:** David gab direkt Go fuer Phase 2 nach dem grünen Contract-Pfad.

**Geliefert:**
- `sdk/src/abis.ts`
- `sdk/src/types.ts`
- `sdk/src/client.ts`
- `sdk/src/index.ts`

**Was gebaut wurde:**
- `REFERRAL_ABI` fuer den neuen Contract-Pfad
- neue SDK-Typen:
  - `ReferralApprovalTypedData`
  - `ReferralRegistrationResult`
- neue Client-Methoden:
  - `getReferralNonce()`
  - `buildReferralApprovalTypedData()`
  - `signReferralApproval()`
  - `registerReferralWithSig()`
- raw `referralContract` im Client freigelegt

**Wichtige Produktgrenze:**
- `quickStart(..., referrer)` bleibt deprecated bzw. reserved
- kein heimliches Reaktivieren des alten impliziten Flows
- `quickStartWithReferral()` wurde bewusst noch nicht gebaut

**Verifikation:**
- `npx tsc --noEmit --module commonjs --target ES2020 --esModuleInterop --strict --skipLibCheck sdk/src/*.ts` gruen
- `npx hardhat compile` weiter gruen

**Naechster sinnvoller Zug:**
- MCP auf denselben Wahrheitsstand ziehen:
  - `clicks_register_referral`
  - `clicks_quick_start` um `referrer` bereinigen

---

## 2026-07-13 — Referrer v2 Phase 3 im MCP gebaut

**Trigger:** David gab Go fuer Phase 3 direkt nach dem SDK.

**Geliefert:**
- `mcp-server/src/index.ts`

**Was gebaut wurde:**
- `clicks_quick_start` bereinigt:
  - kein `referrer`-Input mehr
  - Scope jetzt explizit nur Treasury-Setup
- neues Write-Tool:
  - `clicks_register_referral`
  - Inputs: `agent_address`, `referrer_address`, `deadline`, `signature`
- `REFERRAL_ABI` im MCP um `registerReferralWithSig(...)` und `referralNonces(...)` erweitert
- Explain-Surface und Tool-Liste auf den neuen Stand gezogen

**Wichtige Produktgrenze:**
- MCP behauptet jetzt nicht mehr, dass `quick_start` still Attribution setzt
- Attribution ist auch im MCP ab jetzt ein eigener expliziter Flow

**Verifikation:**
- `npm run build` in `mcp-server/` gruen

**Naechster sinnvoller Zug:**
- ACP-Service auf denselben Wahrheitsstand ziehen oder direkt `quickStartWithReferral()` als spaeteren Wrapper vorbereiten

---

## 2026-07-13 — Referrer v2 Phase 4 im ACP-Service gebaut

**Trigger:** David gab direkt Go fuer Phase 4 nach dem grünen MCP-Pfad.

**Geliefert:**
- `acp-service/service.ts`

**Was gebaut wurde:**
- Treasury-Setup bleibt der Standardpfad ueber `clicks.quickStart()`
- optionaler Referral-Schritt laeuft jetzt explizit und getrennt danach
- neue optionale Requirement-Felder:
  - `referrerAddress`
  - `referralDeadline`
  - `referralSignature`
- der ACP-Service prueft vor Attribution:
  - sind alle Referral-Inputs da
  - ist die Referrer-Adresse valide
  - ist der lokale ACP-Caller auf `ClicksReferral` ueberhaupt autorisiert
- wenn die Autorisierung fehlt, bleibt Treasury erfolgreich und der Deliverable-Text sagt sauber, dass Attribution nicht ausgefuehrt wurde

**Wichtige Implementierungsentscheidung:**
- Referral-Write im ACP laeuft bewusst ueber den raw `ethers.Contract`-Call auf `registerReferralWithSig(...)`
- nicht ueber einen impliziten Helper-Pfad
- Grund: das lokal installierte ACP-SDK-Dependency zeigt noch nicht automatisch auf die neue Monorepo-Surface

**Verifikation:**
- `npx tsc --noEmit service.ts --module esnext --moduleResolution bundler --target ES2022 --esModuleInterop --strict --skipLibCheck` gruen

**Wichtiger Nebenbefund:**
- der rohe CJS-`tsc`-Check fuer `acp-service/` ist generell irrefuehrend, weil das Package heute in einem ESM/CJS-Mix steckt
- fuer diese Session war der bundler-/ESM-nahe Check der aussagekraeftigere Validierungspfad

**Naechster sinnvoller Zug:**
- `quickStartWithReferral()` als bewussten Convenience-Wrapper erst jetzt bauen, weil Contract, SDK, MCP und ACP dafuer nun die getrennte Wahrheit sprechen

---

## 2026-07-13 — `quickStartWithReferral()` als ehrlicher Wrapper gebaut

**Trigger:** David gab direkt Go fuer den Combined Wrapper nach den vier getrennten Phasen.

**Geliefert:**
- `sdk/src/types.ts`
- `sdk/src/client.ts`
- `sdk/src/index.ts`
- `sdk/README.md`

**Was gebaut wurde:**
- neuer Return-Type `QuickStartWithReferralResult`
- neue Client-Methode `quickStartWithReferral(amount, agentAddress, referrerAddress, deadline, signature, options?)`
- Reihenfolge im Wrapper:
  1. `quickStart()` fuer Treasury-Setup
  2. `registerReferralWithSig()` fuer Attribution

**Wichtige Produktentscheidung:**
- der Wrapper ist bewusst **nicht atomar**
- wenn Treasury klappt und Referral danach scheitert, wird das nicht versteckt
- Rueckgabe zeigt deshalb getrennt:
  - `treasury`
  - `referralRegistered`
  - `referralTxHash`
  - `referralError`

**README-Surface:**
- SDK-README enthaelt jetzt den kombinierten Example-Flow mit `signReferralApproval()` plus `quickStartWithReferral()`

**Verifikation:**
- `npx tsc --noEmit --module commonjs --target ES2020 --esModuleInterop --strict --skipLibCheck sdk/src/*.ts` gruen
- `npm run build` in `sdk/` gruen

**Naechster sinnvoller Zug:**
- Public Docs und Skill-Surfaces auf die neue Combined-Option ziehen, aber nur dort, wo wir den expliziten Zwei-Schritt-Charakter klar sagen

---

## 2026-07-13 — Public Surfaces auf Referrer-v2-Realitaet synchronisiert

**Trigger:** David gab direkt Go nach `quickStartWithReferral()` fuer den naechsten Surface-Sync.

**Geliefert:**
- `README.md`
- `sdk/README.md`
- `agent-skill/SKILL.md`
- `skills/clicks-protocol/SKILL.md`
- `clawhub-skill/SKILL.md`
- `landing-v3/app/docs/api/page.tsx`
- `landing-v3/public/llms.txt`
- `landing-v3/public/api/openapi.json`

**Was nachgezogen wurde:**
- Combined Referral-Flow jetzt ueberall ehrlich beschrieben:
  - `quickStart()` = Treasury-Setup
  - `registerReferralWithSig()` = explizite Attribution
  - `quickStartWithReferral()` = Convenience-Wrapper, nicht atomar
- Root-README und Skill-Surfaces zeigen jetzt den neuen Combined Example-Flow
- Landing-API-Doku hat jetzt eigene Methodensections fuer Referral-Write und Combined Wrapper
- MCP-Toollisten auf 11 Tools korrigiert, inklusive `clicks_register_referral` und `clicks_explain`
- `openapi.json` fuehrt fuer `quickStart` keinen irrefuehrenden `referrer`-Query-Parameter mehr

**Wichtiger Effekt:**
- Contract, SDK, MCP, ACP und die zentralen Public Discovery-Surfaces sprechen jetzt denselben Referral-Wahrheitsstand

**Verifikation:**
- Surface-Check per `rg` gegen die geaenderten Dateien
- kein Build noetig, da nur Docs und Discovery-Metadaten angepasst wurden

---

## 2026-07-13 — Landing-Restflaechen auf Referrer-v2-Stand gezogen

**Trigger:** Direktes `go` fuer den naechsten Surface-Sync nach Docs und Skills.

**Geliefert:**
- `landing-v3/app/about/page.tsx`
- `landing-v3/app/layout.tsx`
- `landing-v3/app/docs/getting-started/page.tsx`
- `landing-v3/app/whitepaper/page.tsx`
- `landing-v3/public/llms.txt`
- `README.md`

**Was nachgezogen wurde:**
- Landing-About beschreibt Clicks jetzt als `agent commerce settlement router` statt nur als Yield-Layer
- Getting-Started und Landing-Meta sprechen jetzt von 11 MCP-Tools
- `clicks_register_referral` und `clicks_explain` sind in den Toollisten sichtbar
- Whitepaper-Referral-Kapitel beschreibt jetzt den echten Flow:
  - Treasury-Setup zuerst
  - Attribution explizit danach
  - `registerReferralWithSig(...)` als agent-signierter Submit-Pfad
  - `quickStartWithReferral()` als nicht-atomarer Wrapper
- `llms.txt`-Header fuer MCP ebenfalls auf 11 Tools korrigiert

**Verifikation:**
- `npm run build` in `landing-v3/` gruen
- bestehender Hinweis von Next.js: mehrfach vorhandene `package-lock.json`, aber kein Build-Fehler

---

## 2026-07-13 — Discovery- und Static-Artefakte auf Referrer-v2-Stand gezogen

**Trigger:** Direktes `go` fuer den naechsten Cleanup-Pass nach Landing und Whitepaper.

**Geliefert:**
- `landing-v3/public/.well-known/agent.json`
- `landing-v3/public/.well-known/ai-plugin.json`
- `landing-v3/public/.well-known/clicks-protocol.json`
- `landing-v3/public/.well-known/mcp.json`
- `landing-v3/public/.well-known/x402.json`
- `landing-v3/public/mcp/server.json`
- `landing-v3/public/llms.txt`
- `landing-v3/public/api/openapi.json`
- `landing-v3/public/miniapp/index.html`
- `landing-v3/app/whitepaper/page.tsx`

**Was nachgezogen wurde:**
- `.well-known`-Manifeste sprechen jetzt denselben Settlement-Router-Frame
- alter Discord-Invite in Discovery-Dateien entfernt
- MCP-Manifest und Agent-Manifest auf 11 Tools aktualisiert
- `clicks_register_referral` und `clicks_explain` sind in Discovery-Surfaces sichtbar
- `openapi.json` auf Treasury-Entry-Point + explizite Attribution ausgerichtet und syntaktisch repariert
- Miniapp-Messaging auf explizite Referral-Logik statt impliziten Growth-Claim gezogen
- Whitepaper-Reste auf `agent commerce settlement router` und 11 MCP-Tools korrigiert

**Wichtiger Befund:**
- Der JSON-Parse-Check hat einen echten Fehler in `public/api/openapi.json` gefunden und damit einen realen Static-Bug aufgedeckt, der in derselben Runde behoben wurde

**Verifikation:**
- JSON-Parse fuer alle geaenderten Manifest-Dateien gruen
- `npm run build` in `landing-v3/` erneut gruen
- verbleibender Build-Hinweis weiter nur: Next.js moniert mehrere `package-lock.json`

---

## 2026-07-13 — Deploy versucht, Cloudflare-Auth blockiert, Package-Metadaten vorbereitet

**Trigger:** Direktes `go` nach abgeschlossenem Landing- und Discovery-Sync.

**Deploy-Versuch:**
- `wrangler pages deploy out --project-name=clicks-protocol --commit-dirty=true`

**Ergebnis:**
- Build-Output war bereit
- Wrangler selbst laeuft lokal
- aber der auffindbare Cloudflare-Token reicht nicht fuer Pages-Operationen
- sowohl Deploy als auch `wrangler pages project list` enden mit Cloudflare API Fehler `Authentication error [code: 10000]`

**Wichtiger Befund:**
- Das ist kein Build- oder Source-Problem mehr
- der naechste echte Shipping-Blocker ist jetzt nur noch korrekte Cloudflare Pages Auth

**Parallel sinnvoll vorgezogen:**
- lokale Publish- und Registry-Metadaten auf Settlement-Router-Stand gezogen:
  - `sdk/package.json`
  - `mcp-server/package.json`
  - `mcp-server/server.json`
  - `integrations/eliza/package.json`
  - `agent-treasury/package.json`
  - `acp-service/package.json`
  - Root-`package.json`

**Was dort angepasst wurde:**
- Beschreibungen von Yield-first auf Settlement-Router / Treasury / explicit attribution gezogen
- Keywords bei SDK, MCP und Eliza entsprechend bereinigt

**Verifikation:**
- alle geaenderten `package.json` und `server.json` parsebar

---

## 2026-07-14 — Landing Production Deploy nach Cloudflare-Token-Fix

**Trigger:** David hat im Clicks-Telegram-Topic einen neuen Cloudflare Pages API Token erzeugt, nachdem der Deploy am 13.07. nur an Cloudflare-Auth blockierte.

**Geliefert:**
- Cloudflare Pages Token lokal in `.env` und `projects/clicks-protocol/.env` als `CLOUDFLARE_API_TOKEN` gesetzt
- `CLOUDFLARE_ACCOUNT_ID=613482732d4af6ca8f094e90fcea3169` gesetzt
- Cloudflare Token Verify gegen `/accounts/{account_id}/tokens/verify` erfolgreich
- `landing-v3/` neu gebaut
- Pages Preview Deploy auf Branch `feat/video-pipeline-hyperframes` erfolgreich
- Danach Production Deploy explizit mit `--branch main` erfolgreich

**Production-Deployment:**
- Deployment ID: `97b7b52d-f43b-4dc4-910b-491c4abecd6a`
- URL: `https://97b7b52d.clicks-protocol.pages.dev`
- Environment: `production`
- Branch: `main`
- Aliases: `https://clicksprotocol.xyz`, `https://www.clicksprotocol.xyz`

**Verifikation:**
- `npm run build` in `landing-v3/` gruen
- `npx wrangler pages deploy out --project-name=clicks-protocol --branch main --commit-dirty=true` gruen
- Cloudflare Pages API: latest deployment `production`, branch `main`, deploy stage `success`
- `https://clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`
- `https://www.clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`
- `https://clicksprotocol.xyz/docs/api/` HTTP 200
- `https://clicksprotocol.xyz/.well-known/agent.json` HTTP 200
- `https://clicksprotocol.xyz/api/openapi.json` HTTP 200 und beschreibt den Agent-Commerce-Settlement-Router

**Befund:**
- Der erste Deploy war nur Preview, weil der lokale Git-Branch `feat/video-pipeline-hyperframes` ist. Production braucht bei manuellem Deploy explizit `--branch main`.
- Die Custom Domain hing direkt nach Production kurz am alten HTML-Title. Cache-busted URLs waren sofort frisch, wenige Sekunden spaeter auch die nackten URLs.

---

## 2026-07-14 — Analytics-Hook, Discovery-Surfaces und Distribution-Draft

**Trigger:** David wollte nach dem Cloudflare-Fix die Punkte Landing-Analytics, Discovery-Surfaces und Distribution abarbeiten. GitHub-Traffic-Snapshot wurde bewusst ausgelassen.

**Geliefert:**
- Optionalen Analytics-Hook in `landing-v3/components/analytics.tsx` gebaut
- Root-Layout lädt Analytics nur, wenn Build-Env gesetzt ist:
  - `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- Cloudflare Pages API geprueft: aktuelles Project hat `web_analytics_tag=null` und `web_analytics_token=null`
- GitHub-Repo-About live auf Settlement-Router-Positionierung aktualisiert
- `README-CN.md` Discord-Links auf gueltigen Invite `FfmJGUcxfe` gezogen
- Agent-Skill-Surfaces lokal auf Settlement-Router, 11 MCP-Tools, aktuellen Referral-Flow und 227 Tests korrigiert
- Whitepaper-Seitentitel lokal auf `Clicks Protocol: Agent Commerce Settlement Router` korrigiert
- Distribution-Draft angelegt: `marketing/drafts/settlement-router-distribution-2026-07-14.md`

**Nicht getan:**
- Kein GitHub-Traffic-Snapshot gebaut, auf Davids Wunsch
- Kein X/Dev/GitHub-Post live gesendet
- Kein neuer Cloudflare Pages Deploy, weil Cloudflare Web Analytics ohne Site-Token noch nicht aktiv waere

**Verifikation:**
- `npm run build` in `landing-v3/` gruen
- GitHub-Repo-About per `gh repo view` zurueckgelesen
- Stale-Pattern-Check auf Discovery-Dateien gruen fuer alte Yield-Claims, alte Discord-Invite-URLs, alte Toolzahlen und `58/58`

---

## 2026-07-14 — Cloudflare Web Analytics live deployed

**Trigger:** David hat den Cloudflare Web Analytics Snippet-Token aus dem RUM-Dashboard geschickt.

**Geliefert:**
- `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` lokal in `projects/clicks-protocol/.env` und `landing-v3/.env.local` gesetzt
- `landing-v3` mit aktivem Cloudflare Beacon neu gebaut
- Production-Deploy explizit mit `--branch main` ausgefuehrt
- Nach erstem Deploy noch zwei Discovery-Altformulierungen bereinigt:
  - `landing-v3/public/.well-known/agent.json`
  - `landing-v3/public/llms.txt`
- Zweiter Production-Deploy mit bereinigten Discovery-Dateien ausgefuehrt

**Production-Deployment:**
- Deployment ID: `93013768-58cb-4a59-8aed-5081130f2afa`
- URL: `https://93013768.clicks-protocol.pages.dev`
- Environment: `production`
- Aliases: `https://clicksprotocol.xyz`, `https://www.clicksprotocol.xyz`

**Verifikation:**
- `npm run build` in `landing-v3/` gruen
- Cloudflare Pages API: latest deployment `production`, deploy stage `success`
- `https://clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`, Beacon-Matches `2`
- `https://www.clicksprotocol.xyz/` HTTP 200, Title `Clicks Protocol — Agent Commerce Settlement Router`, Beacon-Matches `2`
- Live-Checks HTTP 200 fuer `/docs/`, `/docs/api/`, `/whitepaper/`, `/.well-known/agent.json`, `/.well-known/agent-skills/clicks-protocol/SKILL.md`, `/api/openapi.json`, `/llms.txt`, `/mcp/server.json`
- `/.well-known/agent.json` zeigt jetzt `Clicks Protocol settlement routing`
- `/llms.txt` zeigt jetzt `optional Clicks Protocol settlement routing`

**Befund:**
- Cloudflare Pages API zeigt weiter `web_analytics_tag=null` und `web_analytics_token=null`.
- Tracking laeuft trotzdem, weil der Snippet-Token direkt im Static-Build als Cloudflare Beacon eingebunden ist.

---

## 2026-07-14 — Discovery Directories geprueft und soweit moeglich nachgezogen

**Trigger:** David wollte Punkt 4 aus dem Plan fertig haben: Glama, ClawHub, npm, MCP Directory und Cursor/Agent-Surfaces.

**Geprueft:**
- npm Registry API fuer `@clicks-protocol/sdk`, `@clicks-protocol/mcp-server`, `@clicks-protocol/eliza-plugin`, `agent-treasury`
- Glama API fuer Server `nzxrrz4y5c`
- ClawHub Skill Card via `openclaw skills verify @protogenosone/clicks-protocol --card`
- Offizielle MCP Registry mit `mcp-publisher validate`
- Cursor Directory URLs aus README und Cursor-Domain

**Geliefert:**
- GitHub `main` mit Discovery-Fix commit `106a62c8d1bffca995f56d76b8570ae517fd26e3`
- Aktualisierte Dateien auf GitHub `main`:
  - `README.md`
  - `glama.json`
  - `mcp-server/server.json`
  - `clawhub-skill/SKILL.md`
- README korrigiert: keine falschen Badges mehr fuer `MCP Registry published` oder `Cursor Directory approved`
- `glama.json` auf Settlement-Router-Metadaten erweitert
- `mcp-server/server.json` und Live-Kopie unter `landing-v3/public/mcp/server.json` auf registry-valide Beschreibung gekuerzt
- Landing Production Deploy `16c28dfd-b572-4aaf-9382-30363a3518bc` live gebracht
- Live `https://clicksprotocol.xyz/mcp/server.json` validiert gegen offizielle MCP Registry
- Npm-Patch-Releases lokal vorbereitet:
  - SDK `0.2.1`
  - MCP Server `0.3.1`
  - Eliza Plugin `0.2.1`
  - Agent Treasury `0.1.1`
- Builds gruen fuer SDK, MCP Server, Eliza Plugin und Agent Treasury

**Blocker:**
- npm: `npm whoami` liefert `401 Unauthorized`. Der Token in `~/.npmrc` ist ungueltig. Kein npm Token in Workspace `.env`, Clicks `.env` oder Keychain gefunden.
- MCP Registry: lokaler Registry-JWT ist abgelaufen. `mcp-publisher login github` haengt im non-interaktiven Lauf ohne Device-Code-Ausgabe. Publish noch nicht live.
- ClawHub: Auth als Protogenosone funktioniert, aber Publish blockiert an notwendiger MIT-0 Terms Acceptance.
- Glama: API-Key funktioniert lesend, aber Glama zeigt weiterhin alten Text und `tools=0`. Doku sagt: Nach `glama.json` muss der Claim-Flow in der UI erneut ausgefuehrt werden, um Sync auszulosen.
- Cursor: aktuelle Cursor-Directory-URLs liefern 404 beziehungsweise Security-Checkpoint. Kein direkter Publish-Pfad gefunden. Wahrscheinlich erst ueber MCP Registry oder Glama sichtbar, sobald dort live.

**Verifikation:**
- GitHub Commit zurueckgelesen: `https://github.com/clicks-protocol/clicks-protocol/commit/106a62c8d1bffca995f56d76b8570ae517fd26e3`
- Raw GitHub-Dateien zeigen Settlement-Router-Wording
- Live `mcp/server.json`: Version `1.0.1`, Package `@clicks-protocol/mcp-server@0.3.0`, Remote `https://mcp.clicksprotocol.xyz/mcp`
- Cloudflare Pages latest deployment: `16c28dfd-b572-4aaf-9382-30363a3518bc`, production, deploy success

---

## 2026-07-20 - npm Patch-Releases live, X-Pipeline repariert, Agent Commerce Research erweitert

**Trigger:** David lieferte erst einen npm Token ohne Publish-2FA-Bypass, danach einen publishfaehigen npm Token. Parallel sollte die X-Pipeline wegen Doppelposts repariert und die Agent-Commerce-Rails-Recherche erweitert werden.

**Geliefert:**
- Research-Datei erweitert: `strategy/AGENT-COMMERCE-RAILS-RESEARCH-2026-07-20.md`
- Positionierung bestaetigt: Clicks ist Agent Commerce Settlement Router, nicht Payment API, nicht Open-Banking-Gateway, nicht BaaS-Marketplace
- X-Duplikate geloescht und `x-pipeline/xurl-post.sh` repariert
- Npm Auth als `clicks-protocol` verifiziert
- Vier Patch-Releases gebaut, per `npm pack --dry-run` geprueft und publiziert:
  - `@clicks-protocol/sdk@0.2.1`
  - `@clicks-protocol/mcp-server@0.3.1`
  - `@clicks-protocol/eliza-plugin@0.2.1`
  - `agent-treasury@0.1.1`

**X-Pipeline-Fix:**
- Ursache: Queue-Eintrag wurde erst nach Haupttweet plus Reply entfernt. Wenn ein Teilfehler danach kam, blieb derselbe Haupttweet vorne und wurde erneut gepostet.
- Fix: Lock gegen parallele Runs, Media-Upload Retry/Backoff, Queue-Shift direkt nach erfolgreichem Haupttweet, Reply best-effort danach.
- Live-Duplikate geloescht: 2078181732843397579, 2076732184459608100, 2057525609270522307, 2057163211976143206, 2056951835630391365, 2056800832645939643 plus zugehoerige Replies.
- Erster offener Post nach Fix live: Haupttweet `2079214757739950100`, Reply `2079214769211404716`.
- Queue danach 4 offene Posts, Einmal-Jobs bis 20:35 Berlin geplant.

**Npm-Verifikation:**
- `npm whoami` mit neuem Token: `clicks-protocol`
- Build gruen fuer SDK, MCP Server, Eliza Plugin und Agent Treasury
- `npm view @clicks-protocol/sdk version` -> `0.2.1`
- `npm view @clicks-protocol/mcp-server version` -> `0.3.1`
- `npm view @clicks-protocol/eliza-plugin version` -> `0.2.1`
- `npm view agent-treasury version` -> `0.1.1`
- Token wurde nicht in npm-Logs oder Projektdateien gefunden.

**Befund:**
- Der erste Token war gueltig, aber blockierte mit npm `E403`, weil Publish 2FA-Bypass erforderte.
- Der zweite Token war publishfaehig.
- npm normalisiert beim Publish `repository.url`. Das ist kosmetisch und kann spaeter bereinigt werden.

**Weiter offen:**
- MCP Registry Publish
- ClawHub Terms Acceptance und Publish
- Glama Claim/Rescan
- X-Pipeline nach den geplanten Slots live kontrollieren

---

## 2026-07-20 - MCP Registry Publish live

**Trigger:** David autorisierte GitHub Device Login fuer MCP Registry. Der interaktive CLI-State ging im Telegram/TTY-Flow verloren, daher wurde der robuste Token-Pfad genutzt.

**Geliefert:**
- GitHub-Token lokal verifiziert: `/user` = `clicksprotocol`, Scopes enthalten `read:org`.
- `mcp-publisher login github` erfolgreich mit `MCP_GITHUB_TOKEN` aus dem validen `clicksprotocol` Token.
- `mcp-server/server.json` auf Registry-Version `1.0.2` und Package `@clicks-protocol/mcp-server@0.3.1` aktualisiert.
- `landing-v3/public/mcp/server.json` lokal ebenfalls auf `1.0.2` und Package `0.3.1` aktualisiert. Noch kein Landing-Deploy in dieser Session.
- `mcp-publisher validate mcp-server/server.json` gruen.
- `mcp-publisher publish mcp-server/server.json` erfolgreich.

**Live-Verifikation:**
- Registry Search `https://registry.modelcontextprotocol.io/v0/servers?search=clicksprotocol` liefert `io.github.clicksprotocol/mcp-server` Version `1.0.2`.
- Status `active`, `isLatest: true`, `publishedAt` / `updatedAt` `2026-07-20T15:36:39.595753Z`.
- Package in Registry: `@clicks-protocol/mcp-server@0.3.1`.

**Befund:**
- Der GitHub Device-Code-Flow funktioniert im Browser, ist aber fuer den Telegram-Resume unzuverlaessig, weil der wartende `mcp-publisher` Prozess seinen State verliert.
- Fuer zukuenftige MCP Registry GitHub-Auth ist der robuste Weg: validen `clicksprotocol` GitHub-Token als `MCP_GITHUB_TOKEN` setzen und dann `mcp-publisher login github` ausfuehren.

**Weiter offen:**
- ClawHub Terms Acceptance und Publish.
- Glama Claim/Rescan.
- X-Pipeline nach den geplanten Slots live kontrollieren.
- Landing neu deployen, damit `https://clicksprotocol.xyz/mcp/server.json` ebenfalls Version `1.0.2` / Package `0.3.1` ausliefert.

---

## 2026-07-20 - Landing Manifest auf MCP Registry Version deployed

**Trigger:** Nach erfolgreichem MCP Registry Publish sollte auch die oeffentliche Landing-Kopie unter `/mcp/server.json` auf Version `1.0.2` und npm Package `0.3.1` gebracht werden.

**Geliefert:**
- `landing-v3/public/mcp/server.json` war lokal bereits auf Registry-Version `1.0.2` und Package `@clicks-protocol/mcp-server@0.3.1`.
- `npm run build` in `landing-v3/` gruen. Einziger Hinweis: bekannte Next.js-Warnung wegen mehrerer `package-lock.json`.
- Erster `wrangler pages deploy` ohne geladene `.env` scheiterte, weil `CLOUDFLARE_API_TOKEN` in der Shell fehlte.
- Danach `projects/clicks-protocol/.env` geladen und Production-Deploy erfolgreich ausgefuehrt.

**Live-Verifikation:**
- Cloudflare Pages Deployment `e4aeabe3-8a32-48c5-a148-5e31f13d57a5`
- Environment `production`, Stage `deploy: success`
- Aliases: `https://clicksprotocol.xyz`, `https://www.clicksprotocol.xyz`
- `https://clicksprotocol.xyz/mcp/server.json` liefert Version `1.0.2`, Package `@clicks-protocol/mcp-server@0.3.1`, Remote `https://mcp.clicksprotocol.xyz/mcp`
- `https://www.clicksprotocol.xyz/mcp/server.json` liefert denselben Stand.

**Weiter offen:**
- ClawHub Publish blockiert weiter mit `MIT-0 license terms must be accepted to publish skills`, CLI Account `Protogenosone`. Der Skill-Ordner selbst wurde auf Version `1.2.3` publish-ready gezogen: `license=MIT-0`, alter Yield-Pitch aus `info` entfernt, stale APY-Zahlen entfernt, JSON-Erzeugung in `scripts/clicks.sh` robust gemacht. Checks gruen: `bash -n`, Frontmatter-Parse, stale-pattern Check, `info`, `yield-info`.
- Glama API zeigt weiter alten Yield-Text und `tools=[]`.
- X-Pipeline Queue ist um 17:48 Berlin auf 3 offene Posts gefallen. Geplante Einmal-Jobs weiter beobachten.

---

## 2026-07-20 - ClawHub Publish 1.2.3 angenommen

**Trigger:** David war im ClawHub Account `Protogenosone` eingeloggt, fand aber die MIT-0 Terms nicht. Danach wurde der neue Device-Code-Login der ClawHub CLI genutzt.

**Geliefert:**
- `clawhub` CLI auf `0.23.1` aktualisiert. Der alte Browser-Callback-Login ist deprecated; neuer Flow ist Device-Code.
- Login als `Protogenosone` verifiziert via `clawhub whoami`.
- `clawhub publish /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/clawhub-skill --owner Protogenosone --slug clicks-protocol --version 1.2.3 --changelog "Reposition as Agent Commerce Settlement Router and update MCP package references"` erfolgreich.

**Verifikation:**
- CLI Publish-Antwort: `OK. Published clicks-protocol@1.2.3 (k979xt0kemvn31bg6vgatqk3zx8axx1h)`.
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.3` findet die neue Version und die erwarteten Dateien:
  - `SKILL.md`
  - `references/contracts.md`
  - `scripts/clicks.sh`
- Status fuer `1.2.3` ist noch nicht final gruen: `security.pending`, `card.missing`. Statischer Scan ist bereits `clean`, VirusTotal/SkillSpector/Card fehlen noch.

**Befund:**
- Terms-Blocker ist geloest. ClawHub hat die Version angenommen.
- Live-Card und `latest` zeigen aktuell noch `1.2.1` mit altem Yield-Text, weil 1.2.3 noch im Security/Card-Scan haengt.

**Weiter offen:**
- ClawHub spaeter erneut pruefen, bis `clawhub skill verify protogenosone/clicks-protocol` auf Version `1.2.3` zeigt und die Card verfuegbar ist.
- Glama Claim/Rescan.
- X-Pipeline nach geplanten Slots kontrollieren.

---

## 2026-07-20 - ClawHub 1.2.4 Safety Patch published

**Trigger:** Nach dem erfolgreichen `1.2.3` Publish wechselte ClawHub Security von `pending` auf `suspicious`. Begründung: live USDC-moving operations mit zu wenig Guardrails plus `card.missing`.

**Geliefert:**
- `clawhub-skill/SKILL.md` auf Version `1.2.4` gezogen.
- Safety Boundary ergänzt: ClawHub-Skill ist read-only by default, keine Private Keys, keine Signaturen, keine Broadcasts, keine state-changing Treasury-Actions.
- Direkte SDK-Write-Beispiele und konkrete Write-Toolliste aus der ClawHub-Fassung entfernt.
- `references/contracts.md` entschärft: Write-Operationen nur noch als operator-genehmigte SDK-Flows erwähnt.
- `scripts/clicks.sh info` gibt jetzt ebenfalls eine Read-only-Sicherheitsgrenze aus.
- Lokale `skill-card.md` ergänzt, danach CLI-Quelle geprüft.

**Verifikation:**
- `bash -n clawhub-skill/scripts/clicks.sh` grün.
- `./clawhub-skill/scripts/clicks.sh info` gibt lokalen Settlement-Router-Text plus Safety Boundary aus.
- `clawhub publish --dry-run ... --version 1.2.4` grün.
- Publish erfolgreich: `status=published`, Version-ID `k97cphs45ra5y701qqze8v1aj18ax7t3`.
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.4` findet Version `1.2.4`, statischer Scan `clean`, Security `clean`.
- Ungepinntes `clawhub skill verify protogenosone/clicks-protocol` resolved ebenfalls auf `1.2.4`.
- Öffentliche ClawHub-Seite zeigt neue Settlement-Description und OG-Version `1.2.4`.

**Befund:**
- `card.missing` bleibt nach `1.2.4` bestehen. Die ClawHub CLI filtert `skill-card.md` beim Publish bewusst aus (`stripGeneratedSkillCards` in `/opt/homebrew/lib/node_modules/clawhub/dist/cli/commands/publish.js`). Card ist also serverseitig generiert/verfügbar, nicht durch lokalen Datei-Upload lösbar.
- Glama API zeigt nach Davids Save/Sync weiter alten Yield-Text und `tools=0`.
- X-Pipeline war um 18:35 Berlin leer, die offenen Posts sind verarbeitet.

**Weiter offen:**
- ClawHub Card-Generierung klären oder abwarten, bis `card.missing` verschwindet.
- Glama Admin nach Sync-Abschluss erneut prüfen und falls nötig nochmal Rescan/Repository Sync auslösen.

---

## 2026-07-20 - Hyperframes Content: Payment APIs Need Settlement

**Trigger:** David gab Go fuer neuen Content auf Basis der heutigen Research. Ziel: neuen Hyperframes-Post zur Settlement-Kategorie bauen.

**Geliefert:**
- Neuer Produktionsstrang angelegt: `video-pipeline/x-settlement-gap/`.
- `STORYBOARD.md` geschrieben mit Kernthese: `Payment APIs move money. Agents need settlement.`
- `index.html` als 30s 9:16 Hyperframes/GSAP-Composition gebaut.
- `hyperframes.json` ergaenzt und `brand-icon.png` aus bestehender Pipeline uebernommen.

**Content-Strategie im Asset:**
- Szene 1: Payment APIs move money, mit Stripe, x402, Coinbase, Open Banking, AgentCard, Meow.
- Szene 2: Agent revenue arrives, mit x402/ACP/Invoice-Inflow.
- Szene 3: Payment is not settlement, Post-Payment-Gap.
- Szene 4: Clicks applies settlement policy, liquid/yield/referral/receipt.
- Szene 5: Evidence Layer mit Settlement Receipt, Tx und ERC-8004 Attestation.
- Szene 6: Close: `Agents can now pay. Who settles their revenue?`

**Verifikation:**
- `npx hyperframes lint --strict-all` gruen: 0 Fehler, 0 Warnungen.
- Draft gerendert: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-draft.mp4`.
- High-Render erstellt: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-high.mp4`.
- `ffprobe` verifiziert fuer Draft und High: 1080x1920, 30.0s, 900 Frames, H.264, 9:16. High-Render ist H.264 High Profile.
- Proof-Frames extrahiert und Contact Sheet erstellt: `video-pipeline/x-settlement-gap/snapshots/final-proof-contact-sheet.png`.

**Befund:**
- Draft ist reviewfaehig und visuell nicht leer. Keine Text-Overlaps in den Proof-Frames.
- Noch nicht extern gepostet. Externes X-Posting braucht gesondertes Go.

---

## 2026-07-20 - X-Post Auth-Check korrigiert und Hyperframes-Post live

**Trigger:** David gab Go, den neuen Hyperframes-Post zu posten.

**Ablauf:**
- Queue war leer.
- Geplanter Queue-Eintrag fuer `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-high.mp4` wurde vorbereitet.
- Erster Auth-Check war falsch: `xurl --app clicks --auth oauth1 user me` sucht den oeffentlichen User `@Me` und prueft nicht die aktive Auth.
- Korrekte Pruefung ist `xurl --app clicks --auth oauth1 whoami`. Diese zeigte `username=ClicksProtocol`, `author_id=2033251448105115649`.
- Danach wurde der Queue-Eintrag wieder gesetzt und `./xurl-post.sh` ausgefuehrt.

**Live-Verifikation:**
- Media Upload erfolgreich: Media ID `2079267113898741760`.
- Haupttweet live: `2079267140067094640`, URL `https://x.com/ClicksProtocol/status/2079267140067094640`.
- Reply live: `2079267151454626289`.
- `xurl read` zeigt beide Tweets mit `author_id=2033251448105115649`, `username=ClicksProtocol`.
- `queue.json` danach `length=0`.

**Weiter offen:**
- X-Link-Preview fuer den Reply zeigt noch alten Landing-OG-Title `Clicks Protocol — Autonomous Yield for AI Agents`. Live-Site ist Settlement-Router, aber X Card Cache ist stale.

---

## 2026-07-20 - Post-Publish Standcheck

**Live-Checks:**
- Glama API bleibt alt: Description weiter `Autonomous DeFi yield...`, `tools=0`, `updatedAt=null`.
- ClawHub ist jetzt komplett gruen: `clawhub skill verify protogenosone/clicks-protocol` resolved auf `1.2.4`, `decision=pass`, Security `clean`, Card `available=true`.
- X-Queue ist leer: `queue.json length=0`.
- Neuer Hyperframes-Post live auf `@ClicksProtocol`: `2079267140067094640`; Reply `2079267151454626289`.
- Frueher X-KPI-Check um 20:48 Berlin: 13 Impressions, 1 Like, 1 Reply, 0 Reposts.
- Clicks-Repo bleibt stark dirty: 139 Eintraege im `git status --short`.

**Weiter offen:**
- Glama Claim/Rescan weiter blockiert oder nicht verarbeitet.
- X Card Cache fuer `clicksprotocol.xyz` zeigt alten Yield-Title.
- Repo-Aufraeumen in saubere Commits/PRs.

---

## 2026-07-20 - MCP 1.0.3 / mcp-server 0.3.2 Glama-Prep

**Trigger:** Glama blieb trotz Profil-Save und Repository-Sync auf altem Yield-Text und `tools=0`.

**Befund:**
- Live-Glama API zeigte weiter: `Autonomous DeFi yield...`, `tools=[]`, `updatedAt=null`.
- Lokale Ursache/Verstaerker: `mcp-server/src/index.ts` hatte noch Yield-first Toolbeschreibungen und `serverInfo.version=0.1.0`, obwohl Registry/Landing bereits auf Settlement-Positionierung standen.
- Glama synced laut eigener Methodology aus GitHub-Repositories. Der Fix musste deshalb auf GitHub `main`, nicht nur lokal oder im Registry-Publish landen.

**Geliefert:**
- `@clicks-protocol/mcp-server` auf `0.3.2` gezogen.
- MCP Runtime-Beschreibungen Settlement-first gemacht:
  - Toolbeschreibungen sprechen jetzt von Settlement Account, incoming USDC revenue event, treasury routing, referral attribution.
  - `clicks://info` spricht jetzt von `Agent Commerce Settlement Router on Base`.
  - `serverInfo.version` jetzt `0.3.2`.
- `mcp-server/server.json` und `landing-v3/public/mcp/server.json` auf Registry-Version `1.0.3` und Package `@clicks-protocol/mcp-server@0.3.2`.
- GitHub `main` gezielt aktualisiert mit Commit `6b0f2b1` (`fix(mcp): publish settlement metadata for discovery`).

**Verifikation:**
- `npm ci` in `mcp-server/` gruen.
- `npm run build` in `mcp-server/` gruen.
- `npm pack --dry-run` fuer `@clicks-protocol/mcp-server@0.3.2` gruen.
- Lokale MCP-Introspection: 11 Tools, erste Toolbeschreibung `Inspect an agent settlement account...`, `serverInfo.version=0.3.2`.
- `npm publish --access public` erfolgreich. Live `npm view @clicks-protocol/mcp-server@0.3.2` zeigt Version `0.3.2` und Settlement-Router-Description.
- `mcp-publisher validate mcp-server/server.json` gruen.
- `mcp-publisher publish mcp-server/server.json` erfolgreich. Live Registry: Version `1.0.3`, `active`, `isLatest=true`, Package `0.3.2`.
- `landing-v3` Build gruen.
- Cloudflare Pages Production-Deploy `3ffa4415-297d-41cc-b143-26f352515e97` erfolgreich, Aliases `clicksprotocol.xyz` und `www`.
- Live `https://clicksprotocol.xyz/mcp/server.json` und `https://www.clicksprotocol.xyz/mcp/server.json` liefern `version=1.0.3`, Package `0.3.2`.
- Raw GitHub `main/mcp-server/server.json`, `main/landing-v3/public/mcp/server.json` und `main/glama.json` sind Settlement-first.

**Weiter offen:**
- Glama API bleibt nach Polling weiter alt: Yield-Text, `tools=0`, `updatedAt=null`.
- Naechster Schritt: In Glama Admin nochmal `Repository -> Sync Server` ausloesen. Falls danach weiter alt: Support/Rescan anfragen, weil Code, npm, MCP Registry, Landing und GitHub `main` korrekt sind.

---

## 2026-07-20 - ClawHub DisplayName-Fix versucht

**Trigger:** David fragte, warum ClawHub den Skill als `Clawhub Skill` statt `Clicks Protocol` anzeigt, und gab Go fuer den Fix.

**Befund:**
- `clawhub-skill/SKILL.md` war lokal korrekt: `name: clicks-protocol`, H1 `Clicks Protocol`, Settlement-first Description.
- ClawHub Publish-CLI hat eine explizite Option `--name <name>`.
- Dry-run fuer `1.2.5` bestaetigte: `displayName=Clicks Protocol`.

**Geliefert:**
- `clawhub-skill/SKILL.md` erst auf `1.2.5` gezogen und mit `--name "Clicks Protocol"` published.
- Publish-Response: `status=published`, `displayName=Clicks Protocol`, Version-ID `k9738xmy4f6etch9ncdrthre718awhdf`.
- Danach Gegenprobe: `clawhub-skill/SKILL.md` auf `1.2.6` gezogen, temporaere Publish-Kopie unter `/tmp/clawhub-publish-clicks/clicks-protocol` erstellt und erneut mit `--name "Clicks Protocol"` published.
- Publish-Response: `status=published`, `displayName=Clicks Protocol`, Version-ID `k97aw7w0r7vfk9hazpp3vt6kzs8awmpq`.

**Verifikation:**
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.6` zeigt weiter `displayName=Clawhub Skill`, `security.pending`, `card.missing`.
- `clawhub inspect protogenosone/clicks-protocol --json` zeigt weiter Skill-Level `displayName=Clawhub Skill`, `latest=1.2.4`.
- Oeffentliche HTML-Seite und OG-Meta zeigen weiter `Clawhub Skill`.
- API-PATCH/PUT-Tests auf `/api/v1/skills/clicks-protocol?ownerHandle=protogenosone` liefern 404.
- Web-UI-Bundle geprueft: Settings-Seite kann Summary und Catalog-Metadata aendern, aber keinen DisplayName.

**Entscheidung:**
- Das ist kein lokales `SKILL.md`-, `--name`- oder Ordnernamenproblem mehr. ClawHub haelt den initialen Skill-Level-`displayName` serverseitig fest und aktualisiert ihn beim Republish nicht.
- Kein Delete/Recreate ausgefuehrt. Das waere riskant, weil ClawHub Delete laut CLI den Owner-Slug 30 Tage reservieren kann.

**Weiter offen:**
- ClawHub Support/Issue: Skill-Level-DisplayName fuer `protogenosone/clicks-protocol` von `Clawhub Skill` auf `Clicks Protocol` setzen lassen oder Metadata-Update-Route erfragen.
- `1.2.6` nach Scan nochmal pruefen. Wenn `latest` auf `1.2.6` springt und DisplayName weiter alt bleibt, ist der Server-Bug endgueltig bestaetigt.

**Nachtrag 22:43 Berlin:**
- Scan fuer `1.2.6` ist weitergelaufen und hat den DisplayName doch noch uebernommen.
- `clawhub inspect protogenosone/clicks-protocol --json` zeigt jetzt `displayName=Clicks Protocol`, `latest=1.2.6`.
- Oeffentliche HTML- und OG-Meta zeigen `Clicks Protocol - ClawHub`, Version `1.2.6`.
- `clawhub skill verify protogenosone/clicks-protocol --version 1.2.6` zeigt Security `clean`, aber `decision=fail` wegen `card.missing`.
- Schluss: Name ist erledigt. Offen bleibt nur ClawHub Card-Generierung fuer `1.2.6`; `1.2.4` bleibt die letzte voll gruene Version mit Card und Verify pass.

---

## 2026-07-20 - Homepage Settlement-Hero Deploy

**Trigger:** David bat um Website-Check und danach um Backup plus Aenderung der sichtbaren Homepage-Copy.

**Befund:**
- Live `clicksprotocol.xyz`, `www`, Docs, API Docs, Whitepaper, MCP Manifest, OpenAPI und Well-known Files waren technisch gesund.
- `/mcp/server.json` war korrekt auf Registry-Version `1.0.3` und Package `@clicks-protocol/mcp-server@0.3.2`.
- Die sichtbare Homepage war aber noch Yield-first: `Autonomous Yield for AI Agents`, CTA `Start Earning Yield`, Code-Kommentar `DeFi yield (4-8% APY)`.
- Meta/OG und Discovery-Surfaces waren bereits Settlement-first. Der Widerspruch lag in der Hero-Copy.

**Geliefert:**
- Backup vor Deploy erstellt: `backups/landing-v3-settlement-hero-20260720-2253.patch`.
- Hero-Copy in `landing-v3/content/i18n/{en,cn,ja,ko}.ts` auf Settlement-first geaendert.
- CopyButton-Code in `landing-v3/components/hero.tsx` von hartem APY/Yield-Kommentar auf `treasury yield route` geaendert.
- `landing-v3/public/x-banner.html` von `Autonomous Yield for AI Agents` auf `Agent Commerce Settlement Router` geaendert.
- Cloudflare Pages Production-Deploy `83f77a15-59b2-4892-bf98-991ac3a9317e` ausgefuehrt.

**Verifikation:**
- `git diff --check` fuer die geaenderten Landing-Dateien sauber.
- `npm run build` in `landing-v3` gruen. Nur bekannte Next.js-Warnung wegen mehrerer Lockfiles.
- Cloudflare API Rueckcheck: Deployment `83f77a15-59b2-4892-bf98-991ac3a9317e`, `environment=production`, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Live-Rueckcheck Root und `www`: `Agent Commerce Settlement Router`, `Start Settling Revenue`, `treasury yield route`.
- Live-Rueckcheck `/cn`, `/ja`, `/ko`: lokale Hero-Copy ebenfalls Settlement-first.
- `www` hing fuer einen Moment ohne Query-String am alten HTML, war mit Cache-Buster frisch und danach auch ohne Query-String frisch.

**Weiter offen:**
- X Card Cache kann weiterhin alten Title zeigen. Live-Site selbst ist jetzt korrekt.

---

## 2026-07-20 - x402 Revenue Settlement Cleanup

**Trigger:** David gab nach x402/Agent-Commerce-Research ein GO fuer P0 Cleanup: Discord bereinigen, Glama checken, Repo sichern und Public Claims pruefen.

**Strategische Entscheidung:**
- Clicks baut nicht noch einen x402 Facilitator und keine neue Payment API.
- Clicks positioniert sich als Post-Payment-Schicht: x402 handles payment. Clicks handles settlement.
- Geplanter Produktfokus: eingehende x402-USDC erfassen, Split/Policy routen, Receipts/Ledger/Attribution liefern, SDK/MCP-Adapter bauen.
- Bis Adapter live ist, werden keine `supports x402`, Auto-Interception- oder harte APY-Claims gemacht.

**Discord Cleanup:**
- Eigene Bot-Core-Posts in `#welcome`, `#resources`, `#sdk-help`, `#mcp-server` aktualisiert.
- Inhalte jetzt Settlement-first mit aktuellen Package-/Contract-Fakten.
- x402 Adapter ist klar als Roadmap/nicht live markiert.
- Rueckscan der relevanten Channels ohne eigene Bot-Post-Treffer fuer alte Begriffe wie `Autonomous`, `DeFi yield`, `yield-earning`, `4-8`, `v0.1`, `9 tools`, `ClicksSplitterV3`.

**Glama Check:**
- Glama Server `nzxrrz4y5c` bleibt stale.
- API zeigt weiter alte Yield-Description, `tools=0`, `updatedAt=null`.
- Code, npm, MCP Registry, Landing und GitHub `main` sind bereits korrekt.
- Naechster Schritt bleibt Glama UI `Repository -> Sync Server` oder Support/Rescan.

**Repo-Schutz:**
- Tracked Dirty-Diff gesichert: `backups/dirty-tracked-20260720-2344.patch`.
- Untracked Registry-Token-Dateien `.mcpregistry_github_token` und `.mcpregistry_registry_token` nicht gelesen.
- Beide Token-Dateien in `.gitignore` aufgenommen.

**Public Claim-Cleanup:**
- Bereinigt: `landing-v3/content/i18n/{en,cn,ja,ko}.ts`, About, Docs, API Docs, Getting Started, Yield Calculator Footer, README, Eliza-Integration, `docs/x402-integration/BASE-DOCS-INTEGRATION.md`, `landing-v3/public/llms.txt`, `landing-v3/public/.well-known/x402.json`.
- `/.well-known/x402.json` beschreibt Clicks jetzt als Post-Payment-Settlement-Router.
- Status dort explizit: `automatic_x402_interception=false`, `built_in_x402_payment_verification=false`, `x402_revenue_adapter=planned`.

**Build und Deploy:**
- `npm run build` in `landing-v3` gruen. Nur bekannte Next.js-Warnung wegen mehrerer Lockfiles.
- Cloudflare Pages Production-Deploy `8d04aefe-1bfe-4413-aa18-0d60d1628452` erfolgreich.
- Cloudflare API Rueckcheck: `environment=production`, Stage `deploy: success`, Aliases `https://clicksprotocol.xyz` und `https://www.clicksprotocol.xyz`.
- Targeted Cloudflare Cache Purge mit Pages-Token scheiterte mit Auth-Fehler. War nicht blockierend, weil Custom Domain danach ohne Query-String frische HTML-Version lieferte.

**Live-Verifikation:**
- HTTP 200 fuer Root, `www`, About, Docs, API Docs, Getting Started, CN/JA/KO, `/.well-known/x402.json`, `/llms.txt`.
- Live-Stale-Scan ohne Treffer fuer `works natively`, `x402 compatible`, `supports x402`, `intercepts x402`, `earning 4-8`, `earning 7-13`, `4-8% APY`, `7-13% APY`, `Autonomous Yield`, `Start Earning Yield`, `Your AI agent's USDC`, `DeFi yield (4-8`.

**Weiter offen:**
- Glama UI/Support bleibt offen.
- Repo ist weiter stark dirty und muss in sinnvolle Commits/PRs aufgeteilt werden.
- x402 Adapter ist noch nicht gebaut. Bis dahin kein harter x402-Support-Claim.

---

## 2026-07-21 - Settlement Router Cleanup PR gemerged

**Trigger:** David gab Go, den aufgeraeumten lokalen Repo-Stand ordentlich remote zu sichern und danach Glama erneut zu pruefen.

**Geliefert:**
- GitHub-Auth vor schreibenden Aktionen geprueft: `GITHUB_PAT` und `gh` laufen als Account `clicksprotocol`, Scope enthaelt `repo` und `workflow`.
- Branch `feat/video-pipeline-hyperframes` gepusht und PR #32 erstellt: `https://github.com/clicks-protocol/clicks-protocol/pull/32`.
- PR war initial wegen Drift zu `main` nicht mergebar. Rebase auf `origin/main` durchgefuehrt.
- Lokale ignorierte Outreach-Dateien vor Rebase gesichert und danach wiederhergestellt:
  - `/tmp/clicks-rebase-local-backup-20260721-0005/marketing/drafts/outreach/cambrian-landscape-inclusion.md`
  - `/tmp/clicks-rebase-local-backup-20260721-0005/marketing/outreach-tracker.json`
- Rebase-Konflikt in `clawhub-skill/SKILL.md` geloest. Behalten wurde die Settlement-first, MIT-0, read-only Safety-Boundary-Version fuer ClawHub `1.2.6`.
- PR nach Rebase erfolgreich gemerged. Merge-Commit: `ac1d837d103d22d0d10d035f0c4c49d4e6274df9`, Subject `Merge settlement router cleanup`.
- Lokaler `main` wurde per Fast-Forward auf `origin/main` gezogen.

**Security-Fund:**
- Beim PR-Audit wurde ein Moltbook API-Key in `x-pipeline/moltbook_post.py` gefunden.
- Der Key wurde aus dem Code entfernt, Branch-History wurde per autosquash/rebase bereinigt und per `--force-with-lease` neu gepusht.
- Finaler PR-Diff und `origin/main` enthalten den Key nicht.
- Der Key war kurz auf GitHub im Branch sichtbar. Der Moltbook-Key muss rotiert werden.

**Verifikation:**
- Vor PR-Erstellung gruen: `git diff --check HEAD`, `landing-v3 npm run build`, root `npm test -- --grep Referral` mit 49 passing, Builds in `sdk`, `mcp-server`, `integrations/eliza`, `agent-treasury`.
- Nach Rebase gruen: `git diff --check HEAD`, Konfliktmarker-Scan, Secret-Pattern-Scan fuer den Moltbook-Key-Prefix.
- PR #32 war vor Merge `MERGEABLE`, `fileCount=100`, `commitCount=19`.
- GitHub meldete keine CI-Checks fuer den Branch: `no checks reported`.
- Nach Merge zeigt `origin/main` als Kopf `ac1d837 Merge settlement router cleanup`.

**Glama Nachcheck:**
- Glama Server `nzxrrz4y5c` bleibt auch nach Main-Merge stale.
- API zeigt weiter alte Yield-Description, `tools=0`, `updatedAt=null`.
- GitHub `main/glama.json` ist korrekt Settlement-first.
- Naechster Schritt: Glama UI `Repository -> Sync Server` oder Support/Rescan.

## 2026-07-21: ACP-Recovery, Glama-Rescan und Moltbook-Rotation vorbereitet

- David gab die Punkte Moltbook-Key-Rotation, ACP-Service-Reparatur ohne Transaktion und Glama-Rescan beziehungsweise Support frei.
- ACP-Ursache vollstaendig behoben: launchd fand zuerst `npx` nicht und danach den Node-Interpreter aus dessen Shebang nicht. `run.sh` nutzt jetzt den absoluten Node-22-npx-Pfad und exportiert den passenden Node-Pfad.
- Startup-Guard in `service.ts` ergaenzt. Bereits vorhandene funded Jobs werden waehrend der SDK-Hydrierung nicht ausgefuehrt.
- TypeScript-Pruefung gruen. LaunchAgent danach kontrolliert neu gestartet und verifiziert: genau eine Instanz, Zustand `running`, `0 active job(s): none`.
- Kein ACP-Testauftrag, keine Wallet-Signatur und keine Onchain-Transaktion ausgefuehrt.
- Glama API vor dem Support-Request erneut mit HTTP 200 gelesen. Sie liefert weiter alten Yield-Text, `tools=0` und `updatedAt=null`.
- Offizielles Glama-Formular `Report Issue` mit Server-ID `nzxrrz4y5c`, Repository, aktuellem MCP-Paketstand und Kontaktadresse abgesendet.
- Moltbook-Agent und alter Key sind noch gueltig. Owner-Email und X-Account wurden verifiziert. Der letzte Schritt wuerde ein Owner-Konto `ClicksProtocol` erstellen und wartet deshalb auf Davids separate Account-Freigabe. Der Key wurde noch nicht rotiert.

**Weiter offen:**
- Moltbook-Key rotieren.
- Glama UI/Support anstossen.
- Danach P1 starten: x402 Revenue Settlement Adapter als Prototyp.

---

## 2026-07-21 - Moltbook Pipeline reaktiviert

**Trigger:** David lieferte neuen Moltbook-Key und gab den Auftrag, die Moltbook Pipeline neu zu befuellen, weil der Kanal wieder aktiv genutzt werden soll.

**Befund vor Refill:**
- Moltbook ist ein alter Clicks-Crosspost-Kanal fuer text-only Posts in AI-Agent- und Agent-Commerce-Submolts.
- Account laut Doku: Bot `clicksprotocol`, Owner `DEVStarClicks`.
- LaunchAgent `com.clicks.moltbook-crosspost` ist geladen und startet stuendlich Minute 07.
- `bots/moltbook-state.json` zeigte `nextIndex=14`, letzter echter Post `2026-05-20T09:07:02Z`.
- Logs zeigten nur noch `Source exhausted (14 posts). Nothing to do.`

**Geliefert:**
- Neuer Moltbook-Key lokal in Workspace-`.env` und Projekt-`.env` gesetzt. Key-Wert nicht in Doku oder Memory gespeichert.
- `bots/moltbook-source.json` lokal mit 14 neuen Settlement-first Posts befuellt.
- `bots/submolt-routing.json` auf neue Settlement-first Routen aktualisiert und auf `main` gepusht.
- `bots/moltbook-state.json` lokal auf `nextIndex=0` gesetzt.

**Content-Regeln fuer den Refill:**
- Keine URLs im Postbody.
- Keine Hashtags.
- Keine APY-Claims.
- Kein `supports x402`, keine automatische x402-Interception und keine built-in x402 Verification behauptet.
- Fokus: x402 Payment versus Settlement, Seller-Side Revenue, Receipts, Treasury Policy, MCP-Queries und Audit.

**Verifikation:**
- JSON valid fuer Source, Routing und State.
- 14 Posts, 14 Routen, alle Indizes abgedeckt.
- Claim/Humanizer-Scan sauber: keine URLs, keine Hashtags, keine APY-Claims, keine harten x402-Support-Claims, keine Gedankenstriche im Content.
- Naechster Post: Index 0 nach `agentcommerce`, Title `I keep seeing teams celebrate when they add x402 to an endpoint.`
- Aktueller `origin/main` nach Routing-Commit: `b9be85a chore(bots): update moltbook settlement routing`.

**Weiter offen:**
- Nach dem 01:07-Berlin-Tick Logs pruefen und ersten Moltbook-Post zuruecklesen.
- Wenn Spam-Flag kommt: Frequenz senken oder Engagement-First-Posts ohne Produktbezug bauen.

---

## 2026-07-21 - Moltbook Kommentar-Monitor gebaut

**Trigger:** David fragte, ob Kommentare auf Moltbook-Postings gesehen wurden, warum nicht reagiert wurde und warum es keine Benachrichtigung gab.

**Befund:**
- Nein, es gab bisher keinen Kommentar-Monitor. Die Moltbook-Automation war nur ein One-Way-Crossposter.
- `bots/moltbook-crosspost.py` schrieb nur `moltbook-state.json`, aber keine Post-ID-Registry.
- Im Code gab es keinen Kommentar-API-Call, keine Inbox-Pruefung und keinen Telegram-Alert.
- Alte per Websuche gefundene Clicks-Moltbook-Post-IDs liessen sich ueber `/api/v1/posts/{id}` lesen. Sie waren alte Yield-first Posts, teilweise `is_spam=true`, und die geprueften IDs hatten `comment_count=0`.

**Geliefert:**
- `bots/moltbook-crosspost.py` erweitert: erfolgreiche Posts werden jetzt in lokales `bots/moltbook-posts.json` geschrieben.
- `bots/moltbook-monitor.py` neu gebaut: liest getrackte Post-IDs, prueft `/api/v1/posts/{id}` und `/api/v1/posts/{id}/comments`, speichert gesehene Kommentar-IDs lokal in `bots/moltbook-monitor-state.json`.
- `bots/moltbook-comment-alert.sh` neu gebaut: ruft den Monitor im Quiet-Modus auf und sendet nur bei `NEW_COMMENTS` eine Telegram-Nachricht in den Clicks-Topic.
- LaunchAgent `com.clicks.moltbook-comment-monitor` lokal installiert und geladen. Schedule: Minute 17 und 47.
- `bots/moltbook-posts.json` in `.gitignore` aufgenommen, weil es Runtime-State mit Post-URLs ist.

**Verifikation:**
- `python3 -m py_compile bots/moltbook-crosspost.py bots/moltbook-monitor.py` gruen.
- `python3 bots/moltbook-monitor.py --quiet` bei noch keiner neuen getrackten Post-ID: exit 0, keine Ausgabe.
- Alert-Runner Trockenlauf: exit 0, keine leere Telegram-Nachricht.
- `plutil -lint` fuer LaunchAgent: OK.
- `launchctl print gui/501/com.clicks.moltbook-comment-monitor`: geladen, Trigger Minute 17 und 47.
- Commit auf `main`: `eec4a23 chore(bots): monitor moltbook comments`.

**Offen:**
- Nach dem ersten neuen Moltbook-Post ab 01:07 Berlin pruefen, ob `bots/moltbook-posts.json` die Post-ID enthaelt.
- Falls David konkrete Kommentare in der UI sieht, aber die API keine liefert: Post-URL manuell pruefen und API-Fallback bauen.

## 2026-07-21: X MCP dauerhaft installiert

**Geliefert:**
- OAuth 2.0 der X-App `clicks` als `@ClicksProtocol` verifiziert.
- Homebrew-Tap `xdevplatform/tap` gegen `https://github.com/xdevplatform/homebrew-tap` geprueft und vertraut.
- Dauerhafte `xurl`-Installation von 1.0.3 auf 1.2.3 aktualisiert.

**Verifikation:**
- `/opt/homebrew/bin/xurl` zeigt auf `/opt/homebrew/Caskroom/xurl/1.2.3/xurl`.
- `xurl version` liefert `xurl 1.2.3`.
- `xurl auth status --app clicks`: OAuth 2.0 `ClicksProtocol`, OAuth 1.0a und Bearer vorhanden.
- `xurl --app clicks whoami`: verifizierter Account `@ClicksProtocol`, User-ID `2033251448105115649`.
- X-MCP-Handshake und Tool-Discovery gegen `https://api.x.com/mcp` waren bereits mit 1.2.3 erfolgreich verifiziert.

## 2026-07-21: X Echtzeit-Monitoring und Reply-Vorschlaege

**Geliefert:**
- XAA-Subscription `post.mention.create` fuer `@ClicksProtocol` erstellt, Subscription-ID `2079565599873671168`.
- Live-Befund dokumentiert: XAA-Subscription fuer private Mentions verlangt OAuth 2.0 User Context, `/2/activity/stream` akzeptiert nur App-only und sieht die Subscription nicht.
- Offiziellen Filtered Stream als Echtzeit-Delivery-Fallback eingerichtet. Regel-ID `2079566488516661248`, Query `@ClicksProtocol`.
- `bots/x-activity-monitor.py` gebaut: persistenter Stream, Reconnect mit Backoff, Event-Deduplizierung, Post-Aufloesung und Telegram-Alert in Topic 49.
- Reply-Vorschlaege sind deterministisch und faktenfest fuer Fragen, Bugs, x402, Integrationen und allgemeine Mentions. Freie LLM-Generierung wurde nach einem Halluzinations-Test bewusst entfernt.
- LaunchAgent `com.clicks.x-activity-monitor` installiert, geladen und auf `KeepAlive` gesetzt.
- Sicherheitsgrenze: Der Monitor hat keine X-Posting- oder Reply-Funktion. Externe Antworten bleiben freigabepflichtig.

**Verifikation:**
- XAA-Subscription per GET zurueckgelesen.
- Filtered-Stream-Regel per GET zurueckgelesen.
- Echte Filtered-Stream-Verbindung erfolgreich offen gehalten.
- `python3 -m py_compile bots/x-activity-monitor.py` gruen.
- Parser-Test fuer reales Filtered-Stream-Payloadformat gruen.
- Fuenf Reply-Vorschlagsklassen getestet, jeweils unter 240 Zeichen.
- `plutil -lint` fuer LaunchAgent: OK.
- `launchctl print gui/501/com.clicks.x-activity-monitor`: `state=running`.
- Prozessbaum verifiziert: Python-Monitor plus `xurl` Filtered Stream aktiv.
- Error-Log leer.

### Nachpruefung 16:13

- Davids Rueckfrage zur sichtbaren Bash-Warnung aus dem manuellen Stream-Test zum Anlass fuer eine erneute Live-Pruefung genommen.
- Echten Parserfehler gefunden: `xurl` liefert Stream-Events und Fehler mehrzeilig, der erste Parser behandelte einzelne `{`-Zeilen als vollstaendiges JSON.
- Parser auf akkumuliertes Mehrzeilen-JSON plus SSE-`data:` umgestellt und mit realistischem Payload getestet.
- Weiterer Live-Befund: X meldet `TooManyConnections`; ein zuvor beendeter Stream-Slot ist serverseitig noch belegt.
- Reconnect-Backoff korrigiert. Fehler-JSON setzt den Backoff nicht mehr zurueck. Maximum 300 Sekunden.
- 60-Sekunden-Polling ueber `/2/users/2033251448105115649/mentions` als Ausfallsicherung eingebaut.
- Erstlauf-Baseline verhindert Alerts fuer alte Mentions. Polling-Health wird im lokalen State protokolliert.
- Polling live verifiziert: `last_poll_status=ok`. LaunchAgent laeuft. Stream reconnectet weiter, bis X den Slot freigibt.
- Fix-Commit: `afa8e90 fix(bots): harden X stream reconnect and polling fallback`.

### End-to-End-Test 16:23

- David postete von `@CRYPTO_DAVIDSKI`: `@ClicksProtocol monitoring test`.
- Mention-ID `2079572038650397050` wurde ueber die Mentions-API erkannt.
- LaunchAgent-Umgebung korrigiert: PATH enthaelt jetzt `/opt/homebrew/opt/node@22/bin`, damit `openclaw message send` Node findet.
- Polling in separaten Thread verschoben, damit ein blockierter Stream den 60-Sekunden-Fallback nicht anhaelt.
- State-Writes mit Lock plus einzigartiger atomarer Temp-Datei gegen Stream/Polling-Races gesichert.
- End-to-End verifiziert: Mention erkannt, Autor/Text aufgeloest, Telegram-Alert mit Reply-Vorschlag erfolgreich gesendet, danach erst als gesehen gespeichert.
- State-Beweis: `poll_since_id=2079572038650397050`, `last_poll_status=ok`, `last_event_at=2026-07-21T14:23:47Z`, `seen_count=1`.
- Filtered Stream bleibt wegen X `TooManyConnections` noch im Reconnect. Zuverlaessige Delivery ist aktuell per Polling mit maximal 60 Sekunden Verzoegerung bestaetigt.

### Stream-Slot-Recovery 16:31

- Lokal verifiziert: nur ein Python-Monitor und kein konkurrierender `xurl` Stream-Prozess aktiv.
- LaunchAgent kontrolliert gestoppt, damit waehrend der Abkuehlphase keine Reconnects entstehen.
- Nach 45 Sekunden ohne Verbindung nahm X einen manuellen Filtered Stream wieder an und hielt ihn mindestens 20 Sekunden stabil offen.
- Manuellen Test sauber beendet, acht Sekunden gewartet und den LaunchAgent erneut geladen.
- Prozessbaum danach verifiziert: genau ein `xurl 1.2.3` Kindprozess am Filtered Stream, LaunchAgent `state=running`, Polling weiter `last_poll_status=ok`.
- `TooManyConnections` ist damit behoben. Ursache war ein serverseitig noch belegter Slot, der durch fortlaufende Reconnects nicht sauber auslief.

## 2026-07-21: X Profil, Redaktionsrhythmus und Analytics

- `@ClicksProtocol` Bio von Yield-first auf Settlement-first geaendert und live ueber X zurueckgelesen.
- Endgueltige Bio: `Settlement infrastructure for AI agents. Route USDC revenue, enforce split policy and verify receipts on Base. Open source SDK + MCP.`
- Beim ersten Profil-Write wurde wegen einer nicht exportierten Shell-Variable die Bio kurz leer gesetzt. Ursache korrigiert, Update danach mit korrekt signiertem OAuth-1.0a-Form-Request ausgefuehrt und live verifiziert.
- Alte X-Launchd-Frequenz 3-mal taeglich beendet. Bestehende drei LaunchAgents neu geladen mit Mo/Mi/Fr jeweils 17:30 Berlin.
- Inhaltliche Slots: Monday Original, Wednesday Settlement Report/Thread, Friday Demo/Visual. `queue.json` ist leer; es wird nur vorher freigegebener Content veroeffentlicht.
- Alle drei Plists mit `plutil -lint` geprueft und per `launchctl print` zurueckgelesen: Weekdays 2/4/6, 17:30, nicht laufend bis zum naechsten Slot.
- X Analytics API mit OAuth 2.0 verifiziert. Eigene Posts liefern `public_metrics`, `non_public_metrics` und `organic_metrics`, darunter Impressions, Engagements, Profilklicks und Linkklicks.
- Premium+ ist fuer `@ClicksProtocol` aktiv und der Account ist blue-verified. Das Web-Analytics-Dashboard bleibt bis 50 Followern auf eingeschraenkter Account-Ebene; Screenshot zeigt 16 Follower und 6 Checkmark-Follower.

## 2026-07-21: X Markenbanner live

- David gab den kontrollierten 1500x500-Entwurf aus `assets/banners/x-profile-2026/settlement-banner-1500x500.png` ausdruecklich fuer das X-Profil frei.
- Zwei Versuche ueber `xurl -F` wurden von X mit HTTP 400 abgelehnt, weil `xurl` das benoetigte Multipart-Feld `banner` nicht korrekt uebergab. Ein Form-Body-Versuch scheiterte mit HTTP 401 wegen abweichender OAuth-Signatur.
- Finaler Upload ueber einen korrekt signierten OAuth-1.0a-Multipart-Request erfolgreich: HTTP 201, leerer Erfolgsbody.
- Rueckpruefung ueber X API v2: `@ClicksProtocol` liefert eine neue `profile_banner_url` mit Upload-Zeitstempel `1784648532`.
- Eingesetzt wurde der kontrollierte Markenentwurf mit echtem Clicks-Logo, Settlement-first Text, Routing-Grafik und X-Safe-Zone. Keine der verworfenen KI-Varianten wurde veroeffentlicht.

## 2026-07-21: To-do-Ausfuehrung, Analytics und Receipt V1

- X Analytics automatisiert: taeglicher lokaler Snapshot um 18:45, Telegram-Wochenbericht Freitag 19:00.
- Verifizierten-Follower-Parser korrigiert. X liefert bei nicht verifizierten Accounts Stringwerte `none` beziehungsweise `None`, die nicht als wahr behandelt werden duerfen.
- Ausgangspunkt live gemessen: 16 Follower, davon 6 verifiziert oder Premium; 3.099 Impressionen, 273 Engagements, 62 Profilklicks und 7 Linkklicks in 90 Tagen.
- Drei humanizer-gepruefte X-Entwuerfe separat als `pending-approval` abgelegt. Aktive Queue bleibt leer.
- Moltbook-Kommentar-Alert um Homebrew-Node-PATH ergaenzt und mit Exit 0 geprueft. Sieben neue Moltbook-Post-IDs sind im lokalen Monitor erfasst.
- ClawHub 1.2.6 live geprueft: Card vorhanden, Verify pass, Security clean. Lokalen Settlement-first Cleanup als Version 1.2.7 vorbereitet, nicht publiziert.
- Glama live per API geprueft: HTTP 200, aber weiter alter Yield-Text, null Tools und `updatedAt=null`.
- Package-Repository-URLs fuer SDK, MCP, Eliza und Agent Treasury korrigiert. Vier `npm pack --dry-run` Durchlaeufe gruen.
- Receipt V1 im SDK implementiert: Precondition Snapshot, Policy-Version-Hash, Falsifiability und deterministische Receipt-ID. SDK-Build und deterministischer Laufzeittest gruen.
- Landing-Quelltext lokal von unbelegten Claims bereinigt: keine live behaupteten Reputation Fees, kein Audit-Claim, kein `no human required`. Next.js Production-Build gruen. Kein Deploy ausgefuehrt.
- Alle vier Package-Builds gruen. Referral-Testauswahl 49 passing. `git diff --check` gruen.
- Nebenbefund: `com.clicks.acp-service` loopt mit Exit 127, weil launchd `npx` nicht findet. Kein Restart oder produktiver Service-Fix ohne separate Freigabe.
- Lokaler Sicherungscommit mit Subject `feat: add settlement analytics and receipt model`. Kein Push ausgefuehrt.
## 2026-07-21: Settlement public release

- David approved the four external actions: X explainer plus pin, landing deploy, ClawHub 1.2.7 publish and GitHub push.
- Published the branded `Payment is not settlement` visual post as `@ClicksProtocol` and pinned tweet `2079647031191122072` to the profile.
- X API readback confirms `pinned_tweet_id=2079647031191122072`.
- Built and deployed the corrected landing page to Cloudflare Pages. Production custom domain returned HTTP 200 with the corrected settlement, reputation-prototype and public-test wording.
- Production deployment URL: `https://4cec05c2.clicks-protocol.pages.dev`.
- Published ClawHub skill `protogenosone/clicks-protocol` version 1.2.7 with settlement-first text and explicit undeployed boundaries.
- Pushed `main` to GitHub and verified remote commit `9bace6796e0b39594369087fe1bb7a30083ab6a4` before the documentation follow-up.

## 2026-07-21: Moltbook Agent Commerce Research Loop

- Bestehenden Moltbook-Kommentar-Monitor um eine vollstaendige, deduplizierte Research-Evidence-Inbox erweitert. Telegram-Vorschauen bleiben auf 240 Zeichen begrenzt, die lokale Research-Kopie behaelt den vollstaendigen Kommentartext.
- Neue Runtime-Datei `research/moltbook-signals.jsonl` ist gitignored. Gespeichert werden Quelle, Kommentar-ID, Autor, Volltext, Post-Kontext, Evidence-Level und Pilotstatus. Keine Secrets oder Wallet-Daten werden erfasst.
- Reproduzierbaren Report-Generator `bots/moltbook-research-report.py` gebaut. Er gruppiert Themen, zaehlt Signale und unabhaengige Autoren und markiert Themen ab drei unabhaengigen Autoren als Validierungskandidaten.
- Prozess und Guardrails in `research/MOLTBOOK-RESEARCH-LOOP.md` dokumentiert: Signal ist kein Roadmap-Item; Promotion erst bei drei unabhaengigen Autoren, einem realen wirtschaftlichen Flow oder einem bestaetigten Pilot.
- Backfill der aktuell getrackten Posts ausgefuehrt: 23 Evidence Records. Wiederholte Themen: Receipt Trail 17 Signale/15 Autoren, Policy-Provenienz 11/9, Attribution 5/4, Delivery Proof 5/5, Unknown Settlement 3/3, Idempotency 3/3, Privacy 1/1.
- `python3 -m py_compile bots/moltbook-monitor.py bots/moltbook-research-report.py` gruen. Report erfolgreich aus dem Backfill erzeugt.

## 2026-07-21: Receipt V2 und Settlement-State-Machine

- Phase 1 der aus Moltbook-Evidence abgeleiteten Entwicklungsarbeit begonnen und als reine SDK-Erweiterung umgesetzt. Keine Contract-Aenderung, kein Deploy und kein automatischer Retry.
- Bestehendes Receipt V1 unveraendert kompatibel gelassen. Neue API `createSettlementReceiptV2` mit Idempotency-Key, Business-Event-ID, Authorization Reference, Request-/Quote-Hash, Settlement Reference, Witness States, Retry Policy, Delivery Evidence und Reconciliation History ergaenzt.
- Neue Settlement-State-Machine mit `planned`, `submitted`, `chain_confirmed`, `settled`, `unknown_settled`, `reconciliation_required`, `reconciled`, `failed_before_transfer` und `disputed` gebaut.
- Fail-closed Retry-Guard implementiert: Nur `failed_before_transfer` darf innerhalb einer expliziten Retry Policy erneut eingereicht werden. `unknown_settled` wird immer blockiert.
- SDK-README um V2-Beispiel und klare Repository-Stage-Grenzen ergaenzt.
- Verifikation: sieben neue Node-SDK-Tests gruen; `npm test` im Root mit 232 bestehenden Hardhat-Tests gruen; `git diff --check` gruen.

## 2026-07-21: Settlement Safety Stack komplettiert

- Read-only Reconciliation Engine gebaut. Sie prueft Chain- und optionale externe Witness-Evidence, loest keine Zahlung aus und behandelt einen einfachen RPC-Miss weiterhin als unbekannt. Nur explizit bewiesene Nicht-Ausfuehrung kann `failed_before_transfer` ergeben.
- Append-only Receipt Ledger gebaut. Jede Version ist per Hash mit der vorherigen verkettet. Import und Neustart pruefen die gesamte Kette. Geaenderter Betrag, Event, Agent, Asset oder Request unter demselben Idempotency-Key wird blockiert.
- Fuenf MCP Read-Tools ergaenzt: Receipt-Verifikation, Settlement-Status, read-only Reconciliation, Policy-Replay und Receipt-Trail. MCP-Tool-Discovery liefert jetzt 16 Tools. Ein echtes stdio-Tool-Invocation mit SDK-generiertem Receipt V2 war gueltig.
- ACP-Code an Receipt V2 und das lokale Ledger angebunden. Ein Job wird vor einer moeglichen Ausfuehrung geplant und dedupliziert. Mehrdeutige Fehler enden in `unknown_settled` ohne Retry. Der laufende Service wurde nicht neu gestartet.
- Metadaten-Adapter fuer direkte, ACP- und x402-Ingress-Events sowie ein Cloudflare-Worker-Beispiel gebaut. Das x402-Beispiel akzeptiert nur bereits upstream verifizierte Events und fuehrt weder Payment-Verifikation noch Routing oder Contract-Calls aus.
- Privacy-Modell dokumentiert: oeffentliche, gehashte und private Felder, kontrollierte Evidence-Offenlegung und klare Grenze, dass selektive Offenlegung noch nicht implementiert ist.
- Alte MCP-Formulierung `start earning yield` entfernt und auf Settlement-first gezogen.
- Verifikation: 22 SDK-Tests gruen, 232 Hardhat-Tests gruen, MCP-Build und ACP-ESM-Bundle-Check gruen, `git diff --check` sauber. Kein Deploy, npm-Publish, Service-Restart, GitHub-Push oder Onchain-Write.
- Security-Nebenbefund: `npm audit` im ACP-Service meldet 31 bekannte Abhaengigkeitsprobleme, davon 9 high und keine critical. Die High-Funde liegen ueberwiegend in Virtuals/Account-Kit-Transitivitaet ohne verfuegbaren Fix. Kein riskanter Auto-Fix ausgefuehrt.

## 2026-07-21: Security Cleanup und partieller Release

- Reachability und Abhaengigkeitspfade aller ACP-Findings geprueft. Virtuals ACP Node auf `0.1.8`, Account Kit auf `4.88.4`, ethers auf `6.17.0` und viem auf `2.55.5` aktualisiert.
- Verwundbare transitive Versionen von axios, form-data, fast-uri, js-cookie, ws und engine.io-client gezielt auf reparierte Versionen gepinnt. Kein pauschaler `npm audit fix`.
- Ergebnis: ACP 0 high/0 critical, SDK 0 Findings, MCP 0 Findings. Builds, 22 SDK-Tests, 232 Hardhat-Tests, Package-Dry-Runs und Landing-Build gruen.
- Vier lokale Feature- und Release-Commits auf GitHub `main` gepusht und Remote-SHA verifiziert. MCP-Tool-Dokumentation auf 16 Tools aktualisiert.
- npm-Authentifizierung danach korrekt vor jedem Publish geprueft. `npm whoami` lieferte HTTP 401. Kein Package wurde veroeffentlicht.
- Um keine nicht existente npm-Version zu bewerben, Registry-Manifest wieder auf die tatsaechlich live veroeffentlichten Versionen Registry `1.0.3` und MCP `0.3.2` gesetzt und ebenfalls gepusht.
- Gemäss vereinbarter Reihenfolge wurden MCP Registry und ACP-Neustart nicht ausgefuehrt. Kein Auftrag, keine Transaktion und kein Deploy.
