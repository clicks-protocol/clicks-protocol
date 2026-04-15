# Memory

## Clicks Protocol

- Clicks Protocol splits USDC payments: 80% liquid, 20% to DeFi yield.
- Yield is routed to the best APY between Aave V3 and Morpho on Base.
- Withdraw anytime. No lockup.
- 2% fee on yield only — never on principal.
- SDK: `@clicks-protocol/sdk` on npm.
- MCP server: `https://mcp.clicksprotocol.xyz/mcp`

## MCP Tools

- `get_protocol_stats` — TVL, APY, agent count
- `get_agent_info` — check registration status
- `get_yield_info` — yield balance and active protocol
- `simulate_yield` — project earnings over a time period

## Contract Addresses (Base Mainnet)

- ClicksRegistry: `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3`
- ClicksSplitterV3: `0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Configuration

- Operating reserve: 500 USDC
- Minimum threshold: 100 USDC
- Minimum acceptable APY: 2%
- Yield allocation: 20%
