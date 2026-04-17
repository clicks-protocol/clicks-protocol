# Clicks Protocol Status

> Stand: 2026-04-18
> Prioritaet: P0

## Aktueller Stand

**Positionierung:** Agent Commerce Settlement Router (nicht Yield-Protokoll). Router zwischen x402/ACP und DeFi-Vaults.

**Live auf Base Mainnet:**
- V2 Contracts: ClicksFeeV2 `0x8C4E07bB...`, ClicksSplitterV4 `0xB7E0016d...`
- Safe Multisig Owner: `0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9`
- ERC-8004 Identity: **agentId 45074**, owner Operator-Wallet `0xf873BB73...`
- Erste Schema-V1 Attestation: Tx `0x5aec2067...`, Block 44836647

**Prototype (nicht deployed):**
- ClicksReputationMultiplierV1 — ERC-8004-driven fee tiers (24 Tests)
- ClicksSplitterV5 — variable fee 1–3 % via Multiplier (14 Tests)

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
- **AgentKit PR #1107** — @murrlincoln Review ausstehend seit 17.04. Ping heute gesendet.
- **V5 Ship Gate:** MID-or-better ≥ 50 % der Clicks-Agents. Aktuell 0 %. Gate erreicht frühestens nach Virtuals-Validator-Whitelisting.

## Services / Cron

- `com.clicks.acp-service` — ACP Service Provider, läuft via launchd (PID 30998)
- `com.clicks.tier-scanner` — Wöchentlich Do 09:00, schätzt Tier-Distribution
- `com.clicks.yield-reporter` — geparked (PID `-`)

## Public Presence

- Landing: https://clicksprotocol.xyz mit ERC-8004 Badge
- Schema V1: https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md
- Seeding-Strategie: https://clicksprotocol.xyz/strategy/TRUSTED-ATTESTORS-SEEDING.md
- Dev.to: https://dev.to/clicksprotocol/x402-solved-payments-who-solves-treasury-531h
- Farcaster Mini App: https://clicksprotocol.xyz/miniapp/
- BaseScan Identity: https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074

## Nächste Schritte (priorisiert)

1. Miratisu-DM via Discord senden (Entwurf in `marketing/drafts/outreach/miratisu-virtuals-attestor.md`)
2. Artikel-Distribution: X-Thread, Farcaster-Cast
3. Zyfai Partnership DM (Entwurf vorhanden)
4. OpenConductor MCP Registry Submission (Entwurf vorhanden)
5. V5 NICHT deployen bis Prerequisites erfüllt (siehe `strategy/SPLITTER-V5-DESIGN.md`)
