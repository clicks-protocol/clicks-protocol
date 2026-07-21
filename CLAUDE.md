# Clicks Protocol — Agent Brief

> Read this first. 60 seconds to working state. For depth: `STATUS.md` (snapshot), `SESSION-LOG.md` (history), `strategy/*.md` (design docs).

**Mission:** Agent Commerce Settlement Router auf Base. Not a yield protocol. Clicks routes USDC revenue after x402-style or ACP-style payment flows into working capital, treasury policy, receipts, and optional yield routing.

## Live Contracts (Base Mainnet, owned by Safe)

| Contract | Address |
|----------|---------|
| ClicksRegistry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` |
| ClicksSplitterV4 | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` |
| ClicksYieldRouter | `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` |
| ClicksFeeV2 | `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5` |
| ClicksReferral | `0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Wallets

- **Safe Multisig (Owner aller Contracts):** `0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9`
- **Operator Wallet (on-chain caller, Builder Code bc_tnbja5eg):** `0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80`
- **ACP Agent Wallet (Virtuals, Alchemy MPC):** `0x06ef9de072d09906945747da6b99f1d2c2c23ed4`

## ERC-8004 Trustless Agent

- **agentId: 45074** auf Base, Owner = Operator-Wallet
- Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Reputation Registry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- **Registry ist 1-indexed.** `readFeedback(agentId, client, 0)` revertet mit "index must be > 0". Immer bei Index ≥ 1 lesen.
- Erste Schema-V1 Attestation: Tx `0x5aec2067384c68421c4964682fec5e5c8e987a44e69b22460eaabdaa213f9578`, Block 44836647
- Manifest: https://clicksprotocol.xyz/.well-known/agent-registration.json
- Schema V1: https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md

## Prototypes (Repo only, NICHT deployed)

- `contracts/ClicksReputationMultiplierV1.sol` — ERC-8004 Tier-Mapping (24 Tests)
- `contracts/ClicksSplitterV5.sol` — Variable Fee 1–3 % basierend auf Reputation (14 Tests)
- Full suite: 227/227 grün

## V5 Ship Gate

**MID-or-better ≥ 50 % der Clicks-Agents.** Aktuell 0 %.
Messung via `scripts/scan-tier-distribution.ts` (weekly launchd cron).
Nicht deployen bis Gate erfüllt.

## Packages (npm / PyPI)

`@clicks-protocol/sdk` (0.2.1) · `@clicks-protocol/mcp-server` (0.3.2) · `@clicks-protocol/eliza-plugin` (0.2.1) · `clicks-langchain` (0.2.0) · `agent-treasury` (0.1.1) · `clicks-crewai` (PyPI 0.1.1)

## Running Services (launchd)

- `com.clicks.acp-service` — ACP Service Provider für Virtuals (blockiert durch Alchemy Paymaster Bug)
- `com.clicks.tier-scanner` — Tier-Distribution-Scanner, Do 09:00 wöchentlich
- `com.clicks.yield-reporter` — geparked
- `com.clicks.x-post-{asia,eu,us}` — freigegebene X-Queue nur Mo/Mi/Fr 17:30 Berlin: Original, Settlement Report/Thread, Demo/Visual. Alte taegliche 06:15/13:15/20:15-Automation seit 21.07. beendet
- `com.clicks.x-activity-monitor` — Mention-Monitor fuer `@ClicksProtocol`; End-to-End mit echter Mention `2079572038650397050` verifiziert. Filtered Stream seit 21.07. 16:31 CEST wieder aktiv, 60-Sekunden-Polling bleibt als Ausfallsicherung; Telegram-Alert plus faktenfester Reply-Vorschlag, keine automatische X-Antwort

## Public Presence

- Landing: https://clicksprotocol.xyz (Settlement-first Homepage, ERC-8004 Badge, x402 claims cleaned, Production-Deploy `8d04aefe-1bfe-4413-aa18-0d60d1628452`)
- GitHub main: PR #32 `chore: align Clicks settlement router state` merged, merge commit `ac1d837d103d22d0d10d035f0c4c49d4e6274df9`
- MCP Registry: `io.github.clicksprotocol/mcp-server` Version `1.0.3`, active/latest, npm package `@clicks-protocol/mcp-server@0.3.2`
- ClawHub: `protogenosone/clicks-protocol` Version `1.2.6` ist latest und zeigt korrekt `Clicks Protocol`. Skill Card ist vorhanden, Verify `decision=pass`, Security `clean`. Der oeffentliche Skilltext braucht noch einen Settlement-first Cleanup.
- Dev.to: https://dev.to/clicksprotocol/x402-solved-payments-who-solves-treasury-531h
- Farcaster Mini App: https://clicksprotocol.xyz/miniapp/
- GitHub: https://github.com/clicks-protocol/clicks-protocol
- BaseScan Identity NFT: https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074
- Moltbook: local launchd `com.clicks.moltbook-crosspost` active hourly at minute 07. Queue refilled locally with 14 Settlement-first text posts on 2026-07-21, next route `agentcommerce`. Queue/state files are intentionally gitignored runtime data. Comment monitor `com.clicks.moltbook-comment-monitor` runs at minutes 17 and 47, checks tracked post IDs, and sends Telegram alerts only when new comments exist.

## x402 Revenue Settlement

- x402 handles authorization/payment. Clicks handles post-payment settlement.
- Current status: research and public claim cleanup done. Adapter is planned, not released.
- Do not claim `supports x402`, automatic x402 interception, or built-in x402 verification before the adapter exists.
- Build direction: x402 revenue event intake, settlement receipt ledger, SDK/MCP adapter, Cloudflare Worker example.
- Glama still stale after main merge: old Yield description, `tools=0`, `updatedAt=null`. Needs UI `Repository -> Sync Server` or support.
- Security note: a Moltbook API key was briefly exposed in the PR branch and removed before merge. Rotate the Moltbook key.

## Current Content Asset

- Hyperframes high render: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-high.mp4`
- Hyperframes draft: `video-pipeline/x-settlement-gap/output/payment-apis-need-settlement-v1-draft.mp4`
- Live X post: https://x.com/ClicksProtocol/status/2079267140067094640
- Thesis: `Payment APIs Move Money. Agents Need Settlement.`
- Strategy: category creation, not yield-first. Contrast against payment/card/banking rails: Stripe/x402/Coinbase/Open Banking/AgentCard/Meow move or custody money; Clicks handles post-payment settlement policy, treasury routing, receipts, and auditability.

## Hard Rules (für Emma)

1. **Operator-Wallet `0xf873...` ist NIE trusted attestor.** Schema-V1-Policy verbietet Self-Attestation. Keine Ausnahme.
2. **V5 nicht deployen** bis MID-or-better ≥ 50 %. Vorher = Fee-Erhöhung für jeden Agent, kaputter Case.
3. **Mainnet-Tx immer mit David absprechen.** Sandbox fragt selbst nach, Emma soll aktiv bestätigen bevor ausgeführt.
4. **Reputation Registry ist 1-indexed.** Falscher Index revertet — immer bei 1 starten.
5. **Kein MLM-Framing in externen Texten.** Intern "On-Chain Attribution Layer", nie "Referral-System" in Pitch oder Landing.
6. **Cloudflare-Deploy + externe Posts (Dev.to, X, Farcaster, Discord DMs) brauchen explizites Go pro Aktion**, auch im Auto-Mode.
7. **X-Pipeline: LLM = Advisor, Skript = Actor.** Externes Posting (xurl) NIE direkt aus LLM-Cron — immer launchd → `xurl-post.sh`. LLM darf nur JSON zur Auswahl/Reply-Draft zurückgeben, nicht "Tweet gepostet" melden ohne Skript-Verification (Halluzinations-Schutz, Lesson 20.04). queue.json wird durch Pipeline rotiert — manuelle Edits nur bei gestoppter Pipeline.
8. **Vor jedem X-Post Auth pruefen:** `xurl --app clicks --auth oauth1 whoami` muss `username=ClicksProtocol` zeigen. Nicht `xurl user me` verwenden, das sucht nur den oeffentlichen User `@Me` und ist kein Auth-Check.

## Was Clicks NICHT ist

- Kein eigener Vault-Operator (wir routen, wir allocieren nicht)
- Kein Stablecoin-Emittent (wir bauen keinen cUSDC)
- Keine Governance-Token-Ausgabe geplant
- Keine Multi-Chain-Rollouts vor Base-Product-Market-Fit

## Quick Commands

```bash
# ERC-8004 ABI live verifizieren
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol
npx tsx scripts/verify-erc8004-abi.ts

# Tier-Distribution scannen (V5 Ship-Gate Metrik)
npx tsx scripts/scan-tier-distribution.ts

# Seed-Attestation Dry-Run (Execute braucht extra Go + --execute)
source /Users/davidbairaktaridis/.openclaw/workspace/.env
npx tsx scripts/seed-attestations.ts
```

## Bekannte Blocker (Stand 13.05.2026)

- **Virtuals ACP Alchemy Paymaster Bug** — GitHub-Issue `Virtual-Protocol/dgclaw-skill#10` am 30.04. GESCHLOSSEN via Client-Side-Workaround (`wallet_sendPreparedCalls` Bypass). Upstream-Paymaster-Policy (186aaa4a) wurde NICHT gefixt. Ob der Workaround auch für den Clicks Buyer-Flow (Wallet `0x956e0...c457`) gilt: UNKLAR. Muss getestet werden.
- **AgentKit PR #1107** — OFFEN, 0 Reviews, stale seit 26 Tagen. Letzter Ping von clicksprotocol am 17.04. ohne Reaktion. Repo ist aktiv (andere PRs werden gemerged), unsere wird ignoriert.
- **Miratisu Tier-1 Attestor Anfrage** — DEAD END. DM seit ~26 Tagen unbeantwortet. Haym (CM) hat Kontext wiederholt verloren. Kein Fortschritt auf Virtuals-Seite sichtbar.
- **GITHUB_PAT (clicksprotocol)** — funktioniert wieder. Am 20.07. fuer MCP Registry Login verifiziert: GitHub API `/user` = `clicksprotocol`, Scope enthaelt `read:org`.

## Verweise

- Detail-Snapshot: `STATUS.md`
- Session-Historie: `SESSION-LOG.md`
- Design & Roadmap: `strategy/SPLITTER-V5-DESIGN.md`, `strategy/ATTESTOR-SCHEMA-V1.md`, `strategy/TRUSTED-ATTESTORS-SEEDING.md`, `strategy/REPUTATION-YIELD-MULTIPLIER.md`
- Public Manifest: `landing-v3/public/.well-known/agent-registration.json`
