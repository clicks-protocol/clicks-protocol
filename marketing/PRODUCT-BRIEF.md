# Clicks Protocol — Product Brief

## One-Liner
**Autonomous DeFi yield for AI agents on Base.** Auto-splits USDC deposits 80/20: 80% liquid, 20% earning via Morpho (~13% APY) or Aave V3 (~2.3%). No lockup, 2% fee on yield only.

## Target Audience
1. **AI Agent Developers** (Claude Code, Codex, Pi, OpenCode) — building agents that need treasury management
2. **DeFi Builders** — looking for composable yield primitives
3. **Web3 Developers** — integrating yield into their dApps
4. **Agent Economy Enthusiasts** — x402, MCP, AI x Crypto community

## Core Value Proposition
- **Set-and-forget yield**: Deposit once, earn automatically
- **No lockup**: 80% stays liquid for agent operations
- **Auto-routing**: Chooses best APY between Morpho and Aave
- **Agent-first**: Built for AI agents via MCP tools (9 tools: 4 read, 5 write)
- **On-chain transparency**: All contracts verified on Base

## Pricing
- **Fee**: 2% on yield only (not on principal)
- **No deposit/withdrawal fees**
- **No subscription**
- **Free for agents**: Read-only tools free, write tools require deposit

## Key Metrics (Launch Baseline)
- **TVL Goal**: $10K in first month
- **Active Agents**: 5-10 in first week
- **MCP Tool Calls**: 100/day
- **GitHub Stars**: 50 in first month
- **X Followers**: 100 in first week

## Competitors
| Name | Approach | Fee | Lockup | Notes |
|------|----------|-----|--------|-------|
| **Clicks Protocol** | Auto-split 80/20, Morpho/Aave | 2% on yield | None | AI agent native, MCP tools |
| **Yearn Finance** | Vault strategies | 20% on yield | Yes | Complex, not agent-friendly |
| **Aave V3** | Direct lending | 0% | No | Low APY (~2.3%), no auto-compounding |
| **Morpho Blue** | Peer-to-peer | 0% | No | High APY (~13%), manual management |
| **EigenLayer** | Restaking | 10-20% | Yes | ETH only, not USDC |

## Tech Stack
- **Blockchain**: Base (Layer 2)
- **Contracts**: Solidity 0.8.28, 5 contracts (SplitterV3, YieldRouter, AgentRegistry, Referral, Treasury)
- **SDK**: TypeScript, npm `@clicks-protocol/sdk`
- **MCP Server**: npm `@clicks-protocol/mcp-server` + HTTP endpoint
- **Frontend**: Static HTML (Cloudflare Pages)
- **Docs**: GitHub Pages

## Links
- **Website**: https://clicksprotocol.xyz
- **GitHub**: https://github.com/clicks-protocol/clicks-protocol
- **npm SDK**: https://www.npmjs.com/package/@clicks-protocol/sdk
- **npm MCP**: https://www.npmjs.com/package/@clicks-protocol/mcp-server
- **HTTP MCP**: https://clicks-mcp.rechnung-613.workers.dev/mcp
- **X**: https://x.com/ClicksProtocol
- **Discord**: https://discord.gg/4a7vQ4pW

## Launch Status
- ✅ Contracts deployed (Base Mainnet)
- ✅ SDK v0.1.1 published
- ✅ MCP Server v0.1.1 published
- ✅ Website live (clicksprotocol.xyz)
- ✅ Discovery files deployed (llms.txt, agent.json, ai-plugin.json, x402.json)
- ✅ Registry submissions (ClawHub, Smithery, Glama, mcp.so, mcpservers.org, APIs.guru, x402.org)
- ✅ 8 Awesome-List PRs submitted
- ❌ Launch content not posted yet

## Next Milestones
1. **Launch Day**: X Thread + Reddit + HN + Medium
2. **Week 1**: Daily X posts, community building
3. **Week 2**: First agent integrations, feedback collection
4. **Month 1**: TVL $10K, 5+ active agents