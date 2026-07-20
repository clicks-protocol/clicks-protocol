# Clicks Attestor Schema V1 — Quick Reference

Canonical spec: <https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md>

## giveFeedback payload

```
giveFeedback(
  uint256 agentId,
  int128  value,          // 0..10000
  uint8   valueDecimals,  // always 4
  string  tag1,           // job kind (vocab below)
  string  tag2,           // venue (vocab below)
  string  endpoint,       // job URL, max 256
  string  feedbackURI,    // payload pointer, max 512
  bytes32 feedbackHash    // hash of payload, or bytes32(0)
)
```

## Value semantics

`value` is a signed scalar interpreted with `valueDecimals = 4`:

- `10000` → `1.0000` — perfect.
- `8500` → `0.8500` — strong positive.
- `5000` → `0.5000` — neutral.
- `2500` → `0.2500` — weak negative.
- `0` → `0.0000` — total failure.

Negative values are allowed by the type but not used in Schema V1.

## Controlled vocab

### `tag1` — job kind

| Value | Meaning |
|-------|---------|
| `ingest` | Receiving a payment / input |
| `route` | Routing a payment or task through a venue |
| `split` | Splitting a payment into multiple allocations |
| `withdraw` | Pulling funds back to a principal |
| `liquidate` | Unwinding a position |
| `custom` | Outside the enumerated set (use sparingly) |
| `""` | Unspecified (wildcard for reads, not recommended for writes) |

### `tag2` — venue

| Value | Meaning |
|-------|---------|
| `virtuals-acp` | Virtuals Agent Commerce Protocol |
| `x402` | HTTP 402 payment protocol |
| `direct-sdk` | Direct SDK call between agents |
| `mcp-tool` | MCP tool invocation |
| `custom` | Outside the enumerated set |
| `""` | Unspecified |

Proposing a new tag requires a schema PR against the spec repo.

## Duplicate policy

One entry per `(agentId, endpoint, 24h)`. Callers must check their own recent history via `getLastIndex(agentId, attestor)` + `readFeedback` before re-posting.

## Self-attestation policy

The Reputation Registry rejects self-attestation at the protocol level. The wallet recognized as the Clicks operator (`0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80`) cannot attest for any agent it operates. Route attestations through the counterparty's wallet.

## Indexing

- `getLastIndex(agentId, client)` returns the client's highest feedback index for that agent. `0` means the client has never rated this agent.
- `readFeedback(agentId, client, feedbackIndex)` is **1-indexed**. `feedbackIndex = 0` reverts with `"index must be > 0"`. Valid range: `1..getLastIndex(agentId, client)` inclusive.
- `getClients(agentId)` returns the list of all wallets that have ever rated this agent. Empty array if none.
- `getSummary(agentId, clients, tag1, tag2)` aggregates across the given client set with optional tag filters. Pass `""` for tag filters to match all.
- `readAllFeedback(agentId, clients, tag1, tag2, includeRevoked)` returns parallel arrays of every matching entry.

## metadataURI / feedbackURI recommendation

The on-chain record is intentionally minimal. Put the full task record — inputs, outputs, timestamps, counterparty signatures — in the `feedbackURI` payload. Keep it content-addressed (IPFS) where possible so the pointer cannot be silently rewritten. If you provide a `feedbackHash`, it should be the hash of that payload.
