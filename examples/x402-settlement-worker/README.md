# x402 Settlement Metadata Worker

This repository-stage example shows how an upstream x402 payment handler can normalize an already verified payment event into Clicks Receipt V2 metadata.

It does not implement x402 payment verification, move USDC, call Clicks contracts or retry settlements. The caller must verify the x402 payment using its chosen x402 stack before invoking this adapter.

## Flow

1. x402 middleware verifies payment authorization and payment evidence.
2. The worker receives the verified event plus policy and authorization references.
3. `createX402SettlementReceipt()` creates a `planned` Receipt V2.
4. The application stores it in an append-only ledger before any post-payment routing.
5. A separate authorized service may route funds and append a new receipt version.
6. Unknown outcomes enter reconciliation. They are never retried automatically.

This example intentionally stops at step 3. It is safe to use as a schema adapter, not as a production payment endpoint.
