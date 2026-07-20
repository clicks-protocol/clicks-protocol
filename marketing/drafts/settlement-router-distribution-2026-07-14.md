# Settlement Router Distribution Draft

Date: 2026-07-14
Status: draft, not posted

## X Main Post

Payment rails let agents receive USDC.

That is not the full commerce loop.

The missing layer is settlement policy:

what stays liquid,
what can route to yield,
what fees apply,
what attribution gets recorded,
what can be withdrawn later.

Clicks Protocol is that router on Base.

## X Reply

Open source, Base mainnet, ERC-8004 agentId 45074.

SDK, MCP server, x402 discovery, explicit referral attribution, Safe-owned contracts.

Docs:
https://clicksprotocol.xyz/docs

GitHub:
https://github.com/clicks-protocol/clicks-protocol

## GitHub / Dev Short Post

Clicks Protocol is now positioned as an Agent Commerce Settlement Router on Base.

It connects agent payment ingress with programmable treasury policy:

- keep working capital liquid
- route the idle slice into Aave V3 or Morpho
- collect protocol fees only on yield
- register explicit referral attribution
- expose the flow through SDK, MCP, OpenAPI, x402 discovery and ERC-8004 identity

This is not a new stablecoin or a vault operator. It is the settlement layer between x402 or ACP payments and onchain treasury routing.

Start here:
https://clicksprotocol.xyz/docs

Repo:
https://github.com/clicks-protocol/clicks-protocol

## Tracking Links

Use these when the channel allows URLs without hurting reach:

- Docs: `https://clicksprotocol.xyz/docs?utm_source=x&utm_medium=social&utm_campaign=settlement-router`
- GitHub: `https://github.com/clicks-protocol/clicks-protocol`
- Agent manifest: `https://clicksprotocol.xyz/.well-known/agent.json`
