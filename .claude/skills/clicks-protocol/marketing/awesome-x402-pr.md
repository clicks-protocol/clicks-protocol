# awesome-x402 PR — Clicks Protocol

## Kategorie
**🌟 Ecosystem Projects** (unter der Sektion "Projects building with or extending x402")

## PR Title
```
Add Clicks Protocol - Autonomous yield for AI agents
```

## PR Description
```
# Add Clicks Protocol

**What:** Clicks Protocol provides autonomous yield infrastructure for AI agents.

**Key Features:**
- 80% liquid, 20% earning (no lockup)
- Built on Base mainnet
- MCP server for agent integration
- TypeScript SDK + comprehensive docs

**Links:**
- Website: https://clicksprotocol.xyz
- GitHub: https://github.com/clicks-protocol
- MCP Server: @clicks-protocol/mcp-server
- SDK: @clicks-protocol/sdk

**x402 Integration:**
- Discovery document at https://clicksprotocol.xyz/.well-known/x402.json
- Chain: Base (8453)
- Token: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- Contracts: Registry, Fee, YieldRouter, Splitter (all deployed on Base)

This fits the "Ecosystem Projects" section as infrastructure for AI agent payments and yield.
```

## Exact Markdown Line to Add

**Position:** In der Sektion `## 🌟 Ecosystem Projects`, nach den bestehenden Einträgen (z.B. nach Cred Protocol, vor Signet).

**Format:**
```markdown
- [Clicks Protocol](https://clicksprotocol.xyz) - Autonomous yield infrastructure for AI agents. 80% liquid, 20% earning with no lockup. Built on Base with MCP server integration (@clicks-protocol/mcp-server) and TypeScript SDK. USDC on Base.
```

**Alternative (falls die Sektion einen anderen Stil hat):**
```markdown
- **Clicks Protocol** - Autonomous yield infrastructure for AI agents. 80% liquid, 20% earning with no lockup. Built on Base with MCP server integration and TypeScript SDK. USDC on Base. ([Website](https://clicksprotocol.xyz) | [MCP](https://www.npmjs.com/package/@clicks-protocol/mcp-server) | [SDK](https://www.npmjs.com/package/@clicks-protocol/sdk))
```

---

## Notizen
- Format ist konsistent mit anderen Einträgen in "Ecosystem Projects" (Name, Kurzbeschreibung, Tech Stack, Chain)
- Links folgen dem Pattern: Hauptlink = Website, optionale Links in Klammern
- Betonung auf Agent-Fokus passt zur x402-Ausrichtung auf autonome Agent-Payments
- Discovery Document ist valide nach x402scan-Spec (version + optionale Felder)
