# Clicks Protocol

Read-only settlement intelligence for AI agent commerce on Base.

Clicks Protocol helps agents and operators inspect treasury state, preview USDC payment splits, check routed-yield status, and understand on-chain attribution before any transaction is signed.

## What This Skill Does

- Inspect registered agent treasury state on Base
- Simulate USDC settlement splits before payment routing
- Check live routed-yield protocol status
- Inspect referral and attribution stats
- Explain Clicks Protocol as an agent-commerce settlement layer

## Safety

This ClawHub skill is read-only by default. The bundled script calls only remote read-only MCP tools and never handles private keys, signs transactions, broadcasts transactions, or performs state-changing treasury actions.

Any write-capable SDK or local MCP flow must require explicit human approval before signing. Show chain, contract, method, asset, amount, recipient, fees, and expected state change first.

## Requirements

- `curl`
- `jq`
- Network access to `https://mcp.clicksprotocol.xyz/mcp`

## Links

- Website: https://clicksprotocol.xyz
- MCP package: https://www.npmjs.com/package/@clicks-protocol/mcp-server
- SDK: https://www.npmjs.com/package/@clicks-protocol/sdk
- OpenAPI: https://clicksprotocol.xyz/api/openapi.json
- GitHub: https://github.com/clicks-protocol/clicks-protocol
