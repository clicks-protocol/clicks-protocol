# Clicks Protocol — Agent Brief

> Read this first. 60 seconds to working state. For depth: `STATUS.md` (snapshot), `SESSION-LOG.md` (history), `strategy/*.md` (design docs).

**Mission:** Agent Commerce Settlement Router auf Base. Not a yield protocol — we route x402 / ACP payments into liquid and yield, we don't operate vaults ourselves.

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

## Packages (npm / PyPI, alle 0.2.0 außer markiert)

`@clicks-protocol/sdk` · `@clicks-protocol/mcp-server` · `@clicks-protocol/eliza-plugin` · `clicks-langchain` · `agent-treasury` (0.1.0) · `clicks-crewai` (PyPI 0.1.1)

## Running Services (launchd)

- `com.clicks.acp-service` — ACP Service Provider für Virtuals (blockiert durch Alchemy Paymaster Bug)
- `com.clicks.tier-scanner` — Tier-Distribution-Scanner, Do 09:00 wöchentlich
- `com.clicks.yield-reporter` — geparked

## Public Presence

- Landing: https://clicksprotocol.xyz (mit ERC-8004 Badge)
- Dev.to: https://dev.to/clicksprotocol/x402-solved-payments-who-solves-treasury-531h
- Farcaster Mini App: https://clicksprotocol.xyz/miniapp/
- GitHub: https://github.com/clicks-protocol/clicks-protocol
- BaseScan Identity NFT: https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074

## Hard Rules (für Emma)

1. **Operator-Wallet `0xf873...` ist NIE trusted attestor.** Schema-V1-Policy verbietet Self-Attestation. Keine Ausnahme.
2. **V5 nicht deployen** bis MID-or-better ≥ 50 %. Vorher = Fee-Erhöhung für jeden Agent, kaputter Case.
3. **Mainnet-Tx immer mit David absprechen.** Sandbox fragt selbst nach, Emma soll aktiv bestätigen bevor ausgeführt.
4. **Reputation Registry ist 1-indexed.** Falscher Index revertet — immer bei 1 starten.
5. **Kein MLM-Framing in externen Texten.** Intern "On-Chain Attribution Layer", nie "Referral-System" in Pitch oder Landing.
6. **Cloudflare-Deploy + externe Posts (Dev.to, X, Farcaster, Discord DMs) brauchen explizites Go pro Aktion**, auch im Auto-Mode.

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

## Bekannte Blocker

- **Virtuals ACP Alchemy Paymaster Bug** — Miratisu ohne Antwort seit 16.04. Blockiert ACP Buyer-Test.
- **AgentKit PR #1107** — @murrlincoln Review ausstehend, letzter Ping 17.04.
- **Miratisu Tier-1 Attestor Anfrage** — Draft in `marketing/drafts/outreach/miratisu-virtuals-attestor.md`, nicht gesendet.

## Verweise

- Detail-Snapshot: `STATUS.md`
- Session-Historie: `SESSION-LOG.md`
- Design & Roadmap: `strategy/SPLITTER-V5-DESIGN.md`, `strategy/ATTESTOR-SCHEMA-V1.md`, `strategy/TRUSTED-ATTESTORS-SEEDING.md`, `strategy/REPUTATION-YIELD-MULTIPLIER.md`
- Public Manifest: `landing-v3/public/.well-known/agent-registration.json`
