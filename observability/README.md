# Clicks Protocol Observability v1

Minimal observability foundation for Clicks Protocol on Base mainnet.

## What v1 does
- backfills and resumes the 4 core on-chain events:
  - `AgentRegistered`
  - `PaymentReceived`
  - `YieldWithdrawn`
  - `FeeCollected`
- snapshots the current protocol state into SQLite
- stores raw events and domain-specific tables in parallel
- computes a structured usage summary for alerts
- formats Telegram-ready text without sending it

## Core metrics covered in v1
- new agents
- current TVL via `ClicksYieldRouter.getTotalBalance()`
- new `PaymentReceived` events and volume
- new `YieldWithdrawn` events
- new `FeeCollected` events and amount
- current `pendingFees`

## Data sources
- `deployments/base.json`
- minimal human-readable ABIs and event signatures derived from the existing repo contracts
- Base mainnet RPC via `BASE_RPC_URL`

## What is intentionally not included yet
- dashboard or UI
- public metrics API
- Telegram delivery client
- cron definitions
- MCP usage collector implementation
- daily report job
- anomaly detection
- referral analytics
- website / GitHub / npm funnel tracking

## Job flow
1. `backfill-chain` ingests on-chain events into `chain_events` and specialized tables.
2. `collect-state` stores a point-in-time `protocol_state_snapshots` row.
3. `usage-monitor` reads SQLite, computes deltas, writes `daily_metrics`, and returns a structured alert summary plus formatted Telegram text.

## Notes
- All timestamps are stored in UTC ISO-8601 format.
- USDC values are stored as integer strings in 6 decimals.
- `BASE_START_BLOCK` should be set for the first real backfill. Without it, the job cannot infer a safe historical start point.
- This package currently uses Node's experimental `node:sqlite` runtime module, so the first live run should use a Node version that exposes it.
