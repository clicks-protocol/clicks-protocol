# Clicks Protocol MCP Server

MCP tools for agent-commerce settlement routing and inspection on Base.

## Receipt V2 read tools

- `clicks_verify_receipt`: verifies deterministic Receipt V2 integrity.
- `clicks_get_settlement_status`: reads state, witnesses and retry policy.
- `clicks_reconcile_settlement`: reads Base evidence and proposes a fail-closed state. It never submits or retries a transaction.
- `clicks_replay_policy`: compares an exact policy definition with the policy hash bound to a receipt.
- `clicks_get_receipt_trail`: reads matching versions from a configured local append-only ledger.

Set `CLICKS_RECEIPT_LEDGER_PATH` to use receipt-trail inspection. The other Receipt V2 tools accept a complete receipt JSON object directly and do not require a private key.

## Safety boundary

Receipt hash validity proves object integrity only. It does not prove delivery or commercial intent. Missing RPC data is treated as unknown, not as proof that no transaction was submitted. Only the SDK state `failed_before_transfer`, established with independent evidence, can permit a bounded retry.

Write tools still require `CLICKS_PRIVATE_KEY`. Keep write-enabled MCP servers isolated from public or untrusted clients.
