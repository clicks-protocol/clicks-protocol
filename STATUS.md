# Clicks Protocol Status

> Stand: 2026-04-22 (Berlin, afternoon)
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
- Zentraler Tracker: `marketing/outreach-tracker.json` (gitignored)

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
- **1-Pager-PDF fehlt** — Emma empfiehlt: vor dem ersten Tier-1-Outreach-Send braucht's einen visuellen 1-Pager (SplitterV4 + YieldRouter + x402-Flow in einem Diagramm). Sonst Cold-DMs im "Was ist das konkret?"-Loop.

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

## Nächste Schritte (priorisiert, 2026-04-22 → folgende Tage)

**Sofort (keine Abhängigkeit):**
1. **1-Pager-Visual erstellen** — Markdown + Diagramm als HTML → PNG via video-pipeline-Puppeteer oder Marp/WeasyPrint zu PDF. Ohne das blockieren alle 8 Tier-1-Outreach.
2. **Cambrian-DM senden** — Draft ready in `cambrian-landscape-inclusion.md`. Manuelle Aktion von David.

**Nach 1-Pager (diese Woche):**
3. **HeyElsa-Outreach-Draft** (Emmas Top-1-Empfehlung, x402+Base+Coinbase-Backing)
4. **Sail-Outreach-Draft** (Revenue-Problem, wir lösen es)
5. Rest Tier 1 (Mamo, ARMA, Bankr, Infinit, Deep42, LlamaAI) parallel über 1-2 Wochen

**Immer-offen:**
6. Miratisu-DM via Discord (ACP-Paymaster-Bug unblocken)
7. V5 NICHT deployen bis MID-or-better ≥ 50 %
8. Engagement-Monitoring der heutigen Content-Ships nach 24/48 h

## Sync-Regeln zwischen Emma & Claude (neu)

- **CLAUDE.md + STATUS.md sind SSoT.** Kein Widerspruch erlaubt.
- Jede Session endet mit STATUS.md-Update (Datum + "Heute geshippt"-Abschnitt).
- Research-Outputs (wie Emmas Partner-Map) werden **in den Repo persistiert**, nicht nur in Telegram — sonst verlieren wir sie.
- Bei Contract-Version-Referenzen: **IMMER CLAUDE.md lesen** bevor Outreach-Text geschrieben wird.
