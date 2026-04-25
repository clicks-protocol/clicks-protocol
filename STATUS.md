# Clicks Protocol Status

> Stand: 2026-04-25 (Berlin, evening)
> Priorität: P0
> Update-Rule: **Jede Session endet mit Aktualisierung dieser Datei, bevor Emma/Claude die Arbeit niederlegt.** Staleness > 48 h = Drift-Risiko.

## ⚠️ Contract-Versions (für alle Outreach / Pitches)

- **LIVE:** ClicksSplitterV4 `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` (Base Mainnet)
- **LIVE:** ClicksFeeV2, ClicksRegistry, ClicksYieldRouter, ClicksReferral (siehe CLAUDE.md)
- **NICHT deployed:** SplitterV5, ReputationMultiplierV1 (Prototypes, Ship-Gate offen)
- **Nie V3 pitchen** — existiert, wenn überhaupt, als Legacy.

## Aktueller Stand

**Positionierung:** Agent Commerce Settlement Router (nicht Yield-Protokoll). Router zwischen x402/ACP und DeFi-Vaults. Die 17 Yield Agents auf Cambrians Landscape sind Kunden, nicht Konkurrenten.

**Live auf Base Mainnet:**
- V4 Contracts: siehe CLAUDE.md (Safe Multisig `0xaD8228fE...`)
- ERC-8004 Identity: **agentId 45074**, owner Operator-Wallet `0xf873BB73...`
- Erste Schema-V1 Attestation: Tx `0x5aec2067...`, Block 44836647

**Prototype (nicht deployed):**
- ClicksReputationMultiplierV1 — ERC-8004-driven fee tiers (24 Tests)
- ClicksSplitterV5 — variable fee 1–3 % via Multiplier (14 Tests)

## Heute geshippt (2026-04-22)

**Content & Distribution:**
- **X:** 2 Video-Posts (Stat-Card 19 % [2046891433458569467](https://x.com/ClicksProtocol/status/2046891433458569467), Landscape-Router [2046891586617766027](https://x.com/ClicksProtocol/status/2046891586617766027)) + 2 Hashtag-Replies
- **X-Thread (5 Tweets, chained):** [Start 2046909664697172191](https://x.com/ClicksProtocol/status/2046909664697172191) — "19 % / 100 % idle / Circle's T-bill spread / settlement-router argument"
- **Dev.to:** Artikel live — https://dev.to/clicksprotocol/19-of-on-chain-activity-is-ai-agents-and-100-of-their-usdc-is-idle-by-default-2l2j

**Infra:**
- `x-pipeline/xurl-post.sh` — 2 Media-Upload-Bugs gefixt (ANSI-Parse + `--wait` für Video-Processing)
- Video-Pipeline: 2 neue Templates (`stat-card` 19%-Variant, `landscape-router.html` 30s/6-scenes)

**Research:**
- **Emma-Partner-Map** — 17 HIGH-Relevance-Targets (8 Tier-1, 9 Tier-2, 3 Watchlist) persistiert in [`marketing/drafts/outreach/partner-map-2026-04-22.md`](marketing/drafts/outreach/partner-map-2026-04-22.md) (gitignored, lokal only)

**Outreach-Drafts:**
- `marketing/drafts/outreach/cambrian-landscape-inclusion.md` — DM an @CambrianNetwork (nicht gesendet)
- `marketing/drafts/outreach/yield-agents/heyelsa.md` — Tier-1 #1 Draft (3 Versionen: Short DM, Opening DM, Follow-up Email + Talking Points + Send Plan). **Nicht gesendet.** (Emma-Session 14:30)
- `marketing/drafts/outreach/yield-agents/sail.md` — Tier-1 #2 Draft (3 Versionen + Talking Points + Send Plan). **Nicht gesendet.** (Emma-Session 14:30)
- Zentraler Tracker: `marketing/outreach-tracker.json` (gitignored)

**1-Pager (Pre-Outreach-Blocker gelöst, gerendert):**
- [`marketing/drafts/one-pagers/clicks-architecture-2026-04.md`](marketing/drafts/one-pagers/clicks-architecture-2026-04.md) — 9-Slide Marp-Reference (advisor source).
- [`marketing/drafts/one-pagers/clicks-architecture-2026-04.html`](marketing/drafts/one-pagers/clicks-architecture-2026-04.html) — Standalone landscape 1920×1080 HTML (eigenes CSS, kein Marp).
- [`marketing/drafts/one-pagers/clicks-architecture-2026-04.png`](marketing/drafts/one-pagers/clicks-architecture-2026-04.png) — gerendertes Outreach-Attachment (Puppeteer, deviceScaleFactor 2 = 3840×2160).
- [`marketing/drafts/one-pagers/clicks-architecture-2026-04.pdf`](marketing/drafts/one-pagers/clicks-architecture-2026-04.pdf) — gleiches Layout als PDF.
- [`marketing/drafts/one-pagers/render.mjs`](marketing/drafts/one-pagers/render.mjs) — Render-Script (puppeteer-core via video-pipeline, system-Chrome).
- **Inhalt:** Headline · Architektur-Flow (x402/ACP → SplitterV4 → 80/20 → {Liquid Ops, YieldRouter→Aave/Morpho}) · 3-Zeilen-SDK-Snippet · Proof-Row (agentId 45074 · Schema V1 · 227 tests · Base Mainnet · Apache-2.0). **Keine Contract-Adressen** auf dem 1-Pager (intentional — Adressen folgen separat im Evidence-Block der Follow-up-Email nach erstem Call).
- **Offene Entscheidung David:** one-pagers/ gitignoren wie outreach/, oder tracked lassen? Aktuell tracked.

## Package Versions

| Package | Version | Registry |
|---------|---------|----------|
| `@clicks-protocol/sdk` | 0.2.0 | npm |
| `@clicks-protocol/mcp-server` | 0.2.0 | npm |
| `@clicks-protocol/eliza-plugin` | 0.2.0 | npm |
| `agent-treasury` | 0.1.0 | npm |
| `clicks-langchain` | 0.2.0 | PyPI |
| `clicks-crewai` | 0.1.1 | PyPI |

## Offene Blocker

- **Virtuals ACP Alchemy Paymaster Bug** — Miratisu ohne Antwort seit 16.04.
- **AgentKit PR #1107** — @murrlincoln Review ausstehend seit 17.04. Ping 21.04. gesendet.
- **V5 Ship Gate:** MID-or-better ≥ 50 % der Clicks-Agents. Aktuell 0 %. Gate erreicht frühestens nach Virtuals-Validator-Whitelisting.
- ~~**1-Pager-PDF fehlt**~~ → DONE 2026-04-22 (PNG + PDF gerendert, V4-only, contract-address-frei).

## Services / Cron

**LaunchAgents (macOS):**
- `com.clicks.acp-service` — ACP Service Provider, läuft via launchd
- `com.clicks.tier-scanner` — Wöchentlich Do 09:00
- `com.clicks.yield-reporter` — geparked
- `com.clicks.x-post-asia` — Daily 06:15 Berlin, postet aus `queue.json` via `xurl-post.sh`
- `com.clicks.x-post-eu` — Daily 13:15 Berlin
- `com.clicks.x-post-us` — Daily 20:15 Berlin

**OpenClaw-Cron (Gateway):**
- X Mention Check (`60d3bc88`, 15:15) — enabled
- 3 X-Posting-Jobs (`a61f1671`/`d8dab48e`/`ccfecda8`) — **DISABLED** seit 20.04 (launchd ist Single-Actor)
- Tier-Scanner / Trending-Scanner / Health-Monitor / Morning-Briefing — enabled

**X-Pipeline:**
- Skript: `x-pipeline/xurl-post.sh` (Single Source of Truth fürs Posten; heute bugfixed)
- Queue: `x-pipeline/queue.json` (aktuell 20 Entries nach heutigen 2 Video-Posts, gitignored)
- Pool: `x-pipeline/final-tweets.md` (1-20) + `achievement-tweets.md` (21-40)
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

**Vorschlag 1 — Clicks-Skill für Conway-Research/skills**
- [`integrations/conway-research-skills/clicks-protocol/SKILL.md`](integrations/conway-research-skills/clicks-protocol/SKILL.md) — YAML-frontmatter + markdown skill nach Convention von [Conway-Research/skills](https://github.com/Conway-Research/skills)
- [`integrations/conway-research-skills/SKILLS.md.diff`](integrations/conway-research-skills/SKILLS.md.diff) — Index-Eintrag + PR-Body-Draft
- [`integrations/conway-research-skills/README.md`](integrations/conway-research-skills/README.md) — Fork+PR-Befehlssequenz
- **Status:** Draft komplett. Awaiting David go für Fork+PR (Rule #6).

**Vorschlag 3 — Cross-Attestation Strategy**
- [`strategy/CROSS-ATTESTATION-CONWAY.md`](strategy/CROSS-ATTESTATION-CONWAY.md) — Pattern A (we attest Conway agents), Pattern B (Conway agents attest us), Pattern C (deferred bilateral)
- [`scripts/seed-conway-attestations.ts`](scripts/seed-conway-attestations.ts) — Dry-run-only. `--execute` blockt absichtlich, weil signer-Frage offen
- [`scripts/conway-attestations.config.example.json`](scripts/conway-attestations.config.example.json) — Template. Hard Rule #1 enforced (Operator-Wallet als Attestor refused mit exit 3)
- **Status:** Phase 0 ready. Phase 1 (erste echte Attestation) braucht David go + dedicated trusted-attestor wallet.

**Vorschlag 5 — OpenX402 Facilitator Registration**
- [`strategy/OPENX402-REGISTRATION.md`](strategy/OPENX402-REGISTRATION.md) — Was wir wissen / nicht wissen / Phase-Plan
- [`scripts/openx402-register.ts`](scripts/openx402-register.ts) — Stub mit dry-run default
- **Status:** Verified `POST /api/register` existiert (returns `{"error":"Missing required fields"}`). Spec unklar. Phase 2 = Conway DM/Email für Spec.

## Nächste Schritte (priorisiert, 2026-04-25 → folgende Tage)

**Sofort (keine Abhängigkeit, davids Aktion):**
1. **HeyElsa-DM senden** — Version A (≤280 char) via X DM @heyelsa_ai. Draft: [`yield-agents/heyelsa.md`](marketing/drafts/outreach/yield-agents/heyelsa.md). 1-Pager-PNG attached bei Version C.
2. **Sail-DM senden** — Version A via X DM @sail_money. Draft: [`yield-agents/sail.md`](marketing/drafts/outreach/yield-agents/sail.md). 1-Pager-PNG attached bei Version C.
3. **Cambrian-DM senden** — Draft ready in `cambrian-landscape-inclusion.md`.
4. **Conway-Research PR** (Vorschlag 1) — Fork `Conway-Research/skills`, copy `clicks-protocol/SKILL.md`, open PR. Befehlssequenz in `integrations/conway-research-skills/README.md`.
5. **OpenX402-Spec-Anfrage** (Vorschlag 5) — DM/Reply an [@openx402](https://x.com/openx402), Email an root@conway.tech. Suggested message in `strategy/OPENX402-REGISTRATION.md`.
6. **Cross-Attestation Phase 1** (Vorschlag 3) — Dedicated trusted-attestor wallet anlegen + erste Conway-Attestation via Safe ausführen. Voraussetzung: 3+ Conway-Automaton-IDs auf Base mainnet identifiziert.

**Diese Woche:**
7. Rest Tier 1 (Mamo, ARMA, Bankr, Infinit, Deep42, LlamaAI) parallel über 1-2 Wochen

**Immer-offen:**
8. Miratisu-DM via Discord (ACP-Paymaster-Bug unblocken)
9. V5 NICHT deployen bis MID-or-better ≥ 50 %
10. Engagement-Monitoring der Content-Ships nach 24/48 h

## Sync-Regeln zwischen Emma & Claude (neu)

- **CLAUDE.md + STATUS.md sind SSoT.** Kein Widerspruch erlaubt.
- Jede Session endet mit STATUS.md-Update (Datum + "Heute geshippt"-Abschnitt).
- Research-Outputs (wie Emmas Partner-Map) werden **in den Repo persistiert**, nicht nur in Telegram — sonst verlieren wir sie.
- Bei Contract-Version-Referenzen: **IMMER CLAUDE.md lesen** bevor Outreach-Text geschrieben wird.
