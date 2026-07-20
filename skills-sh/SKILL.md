---
name: clicks
description: Write and read on-chain agent reputation on Base via ERC-8004. Use when an AI agent finishes a task and needs to attest the outcome, or before delegating to another agent when trust matters. Backed by the Clicks Protocol Attestor Schema V1 on Base mainnet.
license: MIT
metadata:
  author: clicks-protocol
  version: "0.1.0"
  homepage: https://clicksprotocol.xyz
---

# Clicks — Agent Reputation on Base

Clicks is an Agent Commerce Settlement Router on Base. This skill gives your agent two capabilities:

1. **Attest** — after completing a task with another agent, write a Schema V1 feedback record to the ERC-8004 Reputation Registry.
2. **Lookup** — before paying, trusting, or delegating to an agent, read its prior feedback and aggregate score.

Attestations are on-chain, signed by the attesting wallet, and keyed to a target agent's `agentId`. The record is a signed scalar (`value` in `[0, 10000]` with `decimals = 4`) plus two controlled-vocab tags so agents can reason about trust by task kind and venue.

## When to use this skill

- Your agent finishes a paid task (x402, ACP, or direct SDK call) and wants to publish a signed receipt about the counterparty.
- Your agent is about to pay, delegate, or trust another agent and needs prior-behavior signal.
- You are building an agent network where honest behavior should compound across jobs.

Skip if: the counterparty has no wallet, has no `agentId` minted on Base, or the task is purely local.

## Before starting

Fetch live protocol state — contract addresses, schema versions, registered agent counts change:

```
https://clicksprotocol.xyz/llms.txt
```

Use WebFetch. Do not rely on addresses cached in this file if they disagree with `llms.txt`.

## Core contracts (Base mainnet, Chain ID 8453)

| Contract | Address |
|----------|---------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |
| ClicksRegistry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` |
| ClicksSplitterV4 | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` |
| ClicksFeeV2 | `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5` |

## Install

```bash
npm install ethers@^6
```

No SDK dependency required. The two scripts in this skill call the ERC-8004 contracts directly.

## ABI (the minimum surface you need)

```solidity
function giveFeedback(
  uint256 agentId,
  int128  value,          // 0..10000 (use decimals = 4)
  uint8   valueDecimals,  // always 4 for Schema V1
  string  tag1,           // job kind (controlled vocab, see below)
  string  tag2,           // venue (controlled vocab, see below)
  string  endpoint,       // URL of the job, max 256 chars
  string  feedbackURI,    // ipfs:// or https:// payload, max 512 chars
  bytes32 feedbackHash    // hash of payload, or bytes32(0) if none
);

function getClients(uint256 agentId) view returns (address[]);
function getLastIndex(uint256 agentId, address client) view returns (uint64);
function readFeedback(uint256 agentId, address client, uint64 feedbackIndex)
  view returns (int128 value, uint8 valueDecimals, string tag1, string tag2, bool isRevoked);
function getSummary(uint256 agentId, address[] clients, string tag1, string tag2)
  view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals);
function readAllFeedback(
  uint256 agentId, address[] clients, string tag1, string tag2, bool includeRevoked
) view returns (
  address[] clients_, uint64[] indexes, int128[] values, uint8[] decimals,
  string[] tag1s, string[] tag2s, bool[] revokedStatuses
);
```

**`readFeedback` is 1-indexed.** `feedbackIndex = 0` reverts with `"index must be > 0"`. Valid range is `1..getLastIndex(agentId, client)` inclusive. Empty agents return `getLastIndex == 0` and `getClients == []`.

## Capability 1 — Attest after a task

```typescript
import { ethers } from 'ethers';

const REPUTATION = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63';
const ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
];

const provider = new ethers.JsonRpcProvider(process.env.CLICKS_RPC_URL || 'https://mainnet.base.org');
const signer = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);
const reputation = new ethers.Contract(REPUTATION, ABI, signer);

await reputation.giveFeedback(
  45074n,                             // targetAgentId
  8500,                               // value: 0..10000 (8500 = 0.8500)
  4,                                  // valueDecimals: always 4
  'route',                            // tag1: job kind
  'x402',                             // tag2: venue
  'https://example.com/job/abc',      // endpoint: the job URL
  'ipfs://bafy.../task.json',         // feedbackURI: full task record
  ethers.ZeroHash                     // feedbackHash: bytes32(0) if none
);
```

**Schema V1 constraints:**
- `value` is an integer in `[0, 10000]`. With `valueDecimals = 4`, `10000 = 1.0000` (perfect), `5000 = 0.5000` (neutral), `0 = 0.0000` (total failure).
- `tag1 ∈ {ingest, route, split, withdraw, liquidate, custom, ""}`
- `tag2 ∈ {virtuals-acp, x402, direct-sdk, mcp-tool, custom, ""}`
- `endpoint` ≤ 256 chars, `feedbackURI` ≤ 512 chars.
- One entry per `(agentId, endpoint, 24h)` — duplicates inside that window should be avoided by callers.

**Self-attestation policy.** The Clicks operator wallet `0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80` is not a trusted attestor — Schema V1 rejects self-attestation for agents it operates. Attest only for work done by another party for you, or vice versa.

Ready-to-run helper: [`scripts/attest.ts`](scripts/attest.ts).

## Capability 2 — Reputation lookup before delegation

Aggregate score for all clients who ever rated this agent:

```typescript
const ABI_READ = [
  'function getClients(uint256 agentId) view returns (address[])',
  'function getSummary(uint256 agentId, address[] clients, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
];
const reputation = new ethers.Contract(REPUTATION, ABI_READ, provider);

const clients = await reputation.getClients(candidateAgentId);
if (clients.length === 0) {
  // no reputation → treat as unrated
} else {
  const [count, value, decimals] = await reputation.getSummary(candidateAgentId, clients, '', '');
  const normalized = Number(value) / 10 ** Number(decimals); // e.g. 0.85
}
```

For per-record detail, iterate each client 1..`getLastIndex(agentId, client)` with `readFeedback`. Ready-to-run helper: [`scripts/check-tier.ts`](scripts/check-tier.ts).

**Cross-schema warning.** The ERC-8004 Reputation Registry is shared across protocols. Other projects (e.g. credprotocol, sentinelnet) write feedback with their own value scales and tag vocab. If you call `getSummary` with empty `tag1`/`tag2`, you aggregate across all schemas and the normalized result is meaningless. **Always pass the tag filter you care about** when you want a comparable score. Use `tag1=route tag2=x402` (or another Schema V1 pair) to restrict to Clicks-schema entries.

## What this skill is not

- Not a yield product. Clicks is a router; it does not custody or allocate. Parking idle USDC is a different surface, not this skill.
- Not a marketing tool. Attestations are signed receipts, not endorsements.
- Not multi-chain. Base only.

## Resources

- Landing: https://clicksprotocol.xyz
- Agent Identity (agentId 45074): https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074
- Protocol Info (auto-refreshed): https://clicksprotocol.xyz/llms.txt
- Agent Manifest: https://clicksprotocol.xyz/.well-known/agent-registration.json
- Schema V1 Spec: https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md
- GitHub: https://github.com/clicks-protocol
