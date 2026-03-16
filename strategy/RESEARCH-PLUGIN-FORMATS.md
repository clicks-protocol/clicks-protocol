# Plugin/Skill Ecosystem Research for Clicks Protocol Integration

> Research date: 2026-03-09
> Purpose: Understand 3 major agent ecosystems to build Clicks Protocol plugins/skills for each.

---

## Table of Contents

1. [OpenAI Codex Skills](#1-openai-codex-skills)
2. [ElizaOS Plugin Architecture](#2-elizaos-plugin-architecture)
3. [LangChain Custom Tools](#3-langchain-custom-tools)
4. [Clicks Protocol — Concrete Plugin Designs](#4-clicks-protocol-concrete-plugin-designs)
5. [Comparison Matrix](#5-comparison-matrix)

---

## 1. OpenAI Codex Skills

### Overview

Codex skills follow the open [Agent Skills Standard](https://agentskills.io). A skill is a **folder of Markdown instructions + optional scripts** — no compiled code required. Codex uses progressive disclosure: it reads only metadata (name, description) at boot, then loads the full `SKILL.md` on activation.

### Directory Structure

```
clicks-treasury/
├── SKILL.md                    # REQUIRED — frontmatter + instructions
├── agents/
│   └── openai.yaml             # OPTIONAL — UI metadata, MCP deps, invocation policy
├── scripts/                    # OPTIONAL — executable helper scripts
│   └── check_treasury.sh
├── references/                 # OPTIONAL — detailed docs loaded on demand
│   ├── api-reference.md
│   └── error-codes.md
├── assets/                     # OPTIONAL — icons, templates, images
│   ├── clicks-small.svg
│   └── clicks.png
└── LICENSE.txt                 # Per-skill license
```

### SKILL.md Format

The file has YAML frontmatter (name + description required) followed by Markdown body:

```markdown
---
name: clicks-treasury
description: >-
  Interact with the Clicks Protocol treasury on Solana. Use when the user wants
  to check treasury balance, view allocation history, propose distributions,
  or query DAO governance status. NOT for: general Solana wallet operations,
  non-Clicks tokens, or off-chain analytics.
metadata:
  short-description: Manage Clicks Protocol treasury operations
---

# Clicks Treasury

## Overview
This skill provides structured workflows for interacting with the Clicks Protocol
treasury smart contracts on Solana.

## Prerequisites
- Solana CLI or web3.js available
- Wallet keypair configured or Phantom accessible
- RPC endpoint set (default: mainnet-beta)

## Required Workflow
**Follow these steps in order. Do not skip steps.**

### Step 1: Verify Connection
```bash
solana config get
solana balance
```

### Step 2: Check Treasury Status
Query the treasury PDA for current balances and allocation state...

### Step 3: Execute Operation
Based on user intent, choose the appropriate action...

## Available Operations
| Operation | Description | Auth Required |
|-----------|-------------|---------------|
| `balance` | View treasury SOL + token balances | None |
| `allocations` | View current allocation percentages | None |
| `propose` | Submit new distribution proposal | Signer |
| `vote` | Vote on active proposal | DAO member |
| `execute` | Execute approved distribution | Any (after timelock) |

## References
- Treasury contract details: `references/treasury-contract.md`
- Governance rules: `references/governance.md`
- Error codes: `references/error-codes.md`
```

### agents/openai.yaml Format

```yaml
interface:
  display_name: "Clicks Treasury"
  short_description: "Manage Clicks Protocol treasury on Solana"
  icon_small: "./assets/clicks-small.svg"
  icon_large: "./assets/clicks.png"
  brand_color: "#FF6B35"
  default_prompt: "Check the Clicks treasury status and report balances, active proposals, and next distribution date."

policy:
  allow_implicit_invocation: true  # default; set false to require explicit $clicks-treasury

dependencies:
  tools: []
  # If using an MCP server for Clicks:
  # - type: "mcp"
  #   value: "clicks-treasury"
  #   description: "Clicks Protocol MCP server"
  #   transport: "streamable_http"
  #   url: "https://mcp.clicksprotocol.com/mcp"
```

### Skill Discovery & Installation

| Tier | Location | Who manages |
|------|----------|-------------|
| `.system` | Bundled with Codex | OpenAI |
| `.curated` | `github.com/openai/skills` — install via `$skill-installer <name>` | OpenAI-reviewed PRs |
| `.experimental` | Same repo, less reviewed | Community PRs |
| User | `~/.agents/skills/` or `~/.codex/skills/` | User |
| Repo | `.agents/skills/` in any git repo | Team |
| Admin | `/etc/codex/skills/` | Sysadmin |

**Submission process:** PR to `github.com/openai/skills`. Curated skills get reviewed by OpenAI. Experimental skills have a lower bar.

### Key Takeaways for Clicks

- **No code compilation needed** — pure Markdown + optional shell scripts
- **Progressive disclosure** — description triggers loading; keep description precise
- **Can depend on MCP servers** via `agents/openai.yaml` → great for a Clicks MCP
- **Works across Codex CLI, IDE extension, and Codex App**
- **Lowest barrier to entry** of the three ecosystems

---

## 2. ElizaOS Plugin Architecture

### Overview

ElizaOS (formerly ai16z/eliza) uses a **TypeScript plugin system** with a rich component model. Plugins are npm packages that register Actions, Providers, Evaluators, and Services with the agent runtime. The ecosystem is heavily crypto/DeFi-oriented — ideal for Clicks.

### Plugin Interface (Core Contract)

```typescript
import { Plugin } from '@elizaos/core';

const clicksPlugin: Plugin = {
  name: '@clicks/plugin-treasury',
  description: 'Clicks Protocol treasury management for ElizaOS agents',
  
  // What the agent can DO
  actions: [
    checkBalanceAction,
    proposeDistributionAction,
    voteOnProposalAction,
    executeDistributionAction,
  ],
  
  // What the agent can SEE (context injected before decisions)
  providers: [
    treasuryStateProvider,    // Current balances, allocation %
    activeProposalsProvider,  // Open governance proposals
  ],
  
  // What the agent LEARNS from conversations
  evaluators: [
    transactionEvaluator,    // Extract tx details from conversations
  ],
  
  // Stateful connections
  services: [
    ClicksSolanaService,     // Manages RPC connection + wallet
  ],

  // Optional
  config: {
    defaultRpc: 'https://api.mainnet-beta.solana.com',
    treasuryPda: 'CLICKS_TREASURY_PDA_ADDRESS',
  },
  
  dependencies: ['@elizaos/plugin-sql'],
  priority: 50,
  
  // Optional HTTP endpoints
  routes: [
    {
      name: 'treasury-status',
      path: '/clicks/treasury',
      type: 'GET',
      handler: async (req, res, runtime) => {
        const balance = await getTreasuryBalance(runtime);
        res.json({ balance });
      }
    }
  ],
  
  // Optional event handlers
  events: {
    MESSAGE_RECEIVED: [handleClicksMention],
  },
};

export default clicksPlugin;
```

### Component Deep Dive

#### Actions (what the agent can DO)

```typescript
import { Action, ActionResult, IAgentRuntime, Memory } from '@elizaos/core';

const checkBalanceAction: Action = {
  name: 'CHECK_CLICKS_TREASURY',
  description: 'Check the Clicks Protocol treasury balance and allocation status',
  similes: ['TREASURY_BALANCE', 'CLICKS_BALANCE', 'CHECK_TREASURY', 'TREASURY_STATUS'],
  
  examples: [[
    { name: '{{user}}', content: { text: 'What is the Clicks treasury balance?' } },
    { name: '{{agent}}', content: { text: 'Let me check the treasury...', actions: ['CHECK_CLICKS_TREASURY'] } }
  ]],
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Check if Solana RPC is configured
    const rpc = runtime.getSetting('SOLANA_RPC_URL');
    return !!rpc;
  },
  
  handler: async (runtime, message, state, options, callback): Promise<ActionResult> => {
    try {
      const service = runtime.getService<ClicksSolanaService>('clicks-solana');
      const balance = await service.getTreasuryBalance();
      const allocations = await service.getAllocations();
      
      const text = `💰 Clicks Treasury Status:
• SOL Balance: ${balance.sol} SOL
• CLICKS Token: ${balance.clicks} CLICKS
• Current Allocations: ${JSON.stringify(allocations, null, 2)}`;
      
      if (callback) await callback({ text }, []);
      return { success: true, text, data: { balance, allocations } };
    } catch (error) {
      return { success: false, text: `Failed to query treasury: ${error.message}` };
    }
  }
};
```

#### Providers (context injected before decisions)

```typescript
import { Provider, ProviderResult } from '@elizaos/core';

const treasuryStateProvider: Provider = {
  name: 'CLICKS_TREASURY_STATE',
  description: 'Current Clicks treasury balances and allocation percentages',
  dynamic: true,  // Re-fetched each time (live on-chain data)
  position: 10,   // Load after core providers
  
  get: async (runtime, message, state): Promise<ProviderResult> => {
    const service = runtime.getService<ClicksSolanaService>('clicks-solana');
    const balance = await service.getTreasuryBalance();
    
    return {
      text: `Clicks Treasury: ${balance.sol} SOL, ${balance.clicks} CLICKS tokens`,
      data: { treasuryBalance: balance },
    };
  }
};
```

#### Services (stateful connections)

```typescript
import { Service, IAgentRuntime, logger } from '@elizaos/core';
import { Connection, PublicKey } from '@solana/web3.js';

export class ClicksSolanaService extends Service {
  static serviceType = 'clicks-solana';
  capabilityDescription = 'Solana RPC connection for Clicks Protocol treasury';
  
  private connection: Connection;
  private treasuryPda: PublicKey;
  
  constructor(protected runtime: IAgentRuntime) {
    super();
  }
  
  static async start(runtime: IAgentRuntime): Promise<ClicksSolanaService> {
    const service = new ClicksSolanaService(runtime);
    const rpcUrl = runtime.getSetting('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    service.connection = new Connection(rpcUrl);
    service.treasuryPda = new PublicKey(runtime.getSetting('CLICKS_TREASURY_PDA'));
    logger.info('ClicksSolanaService initialized');
    return service;
  }
  
  async stop(): Promise<void> {
    logger.info('ClicksSolanaService stopped');
  }
  
  async getTreasuryBalance() {
    const balance = await this.connection.getBalance(this.treasuryPda);
    return { sol: balance / 1e9 };
  }
  
  async getAllocations() {
    // Deserialize treasury account data...
    return { development: 40, marketing: 30, community: 20, reserve: 10 };
  }
}
```

### Package Structure

```
plugin-clicks-treasury/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Plugin export
│   ├── actions/
│   │   ├── checkBalance.ts
│   │   ├── propose.ts
│   │   ├── vote.ts
│   │   └── execute.ts
│   ├── providers/
│   │   ├── treasuryState.ts
│   │   └── proposals.ts
│   ├── services/
│   │   └── ClicksSolanaService.ts
│   ├── evaluators/
│   │   └── transactionEvaluator.ts
│   └── __tests__/
│       └── plugin.test.ts
└── dist/                     # Built output
```

### Plugin Discovery & Installation

Plugins are added to an agent's `character.ts` config:

```typescript
// By npm package name
plugins: ['@elizaos/plugin-bootstrap', '@clicks/plugin-treasury']

// Or local path during development
plugins: ['./plugin-clicks-treasury']
```

Conditional loading based on env vars:

```typescript
plugins: [
  '@elizaos/plugin-bootstrap',
  ...(process.env.CLICKS_TREASURY_PDA ? ['@clicks/plugin-treasury'] : []),
]
```

Published to npm as `@clicks/plugin-treasury` or listed in [ElizaOS Plugin Registry](https://docs.elizaos.ai/plugin-registry/overview).

### Key Takeaways for Clicks

- **Full TypeScript** — compiled code, type-safe, testable
- **Rich component model** — Actions + Providers + Evaluators + Services
- **Crypto-native ecosystem** — many DeFi plugins exist as reference
- **Agent-first** — plugins shape agent behavior, not just provide tools
- **Higher effort** than Codex skills but much more powerful

---

## 3. LangChain Custom Tools

### Overview

LangChain tools are **Python functions** with type-annotated inputs that agents can call. The `@tool` decorator is the simplest path. Tools are framework-agnostic and work with any LangChain-compatible model.

### Minimal Tool (Decorator Pattern)

```python
from langchain.tools import tool

@tool
def check_clicks_treasury(network: str = "mainnet-beta") -> str:
    """Check the Clicks Protocol treasury balance and allocation status on Solana.
    
    Args:
        network: Solana network to query (mainnet-beta, devnet, testnet)
    """
    from solana.rpc.api import Client
    
    client = Client(f"https://api.{network}.solana.com")
    treasury_pda = "CLICKS_TREASURY_PDA_ADDRESS"
    
    balance = client.get_balance(treasury_pda)
    sol_balance = balance.value / 1e9
    
    return f"Clicks Treasury Balance: {sol_balance} SOL on {network}"
```

That's it. The function name becomes the tool name, the docstring becomes the description, type hints define the schema.

### Advanced Tool (Pydantic Schema)

```python
from langchain.tools import tool
from pydantic import BaseModel, Field
from typing import Literal, Optional

class ClicksTreasuryInput(BaseModel):
    """Input for Clicks treasury operations."""
    operation: Literal["balance", "allocations", "proposals", "history"] = Field(
        description="Type of treasury query to perform"
    )
    network: str = Field(
        default="mainnet-beta",
        description="Solana network (mainnet-beta, devnet, testnet)"
    )
    proposal_id: Optional[str] = Field(
        default=None,
        description="Specific proposal ID to query (for proposals operation)"
    )

@tool(
    "clicks_treasury",
    description="Query the Clicks Protocol treasury on Solana. Supports balance checks, allocation views, governance proposals, and distribution history.",
    args_schema=ClicksTreasuryInput
)
def clicks_treasury(operation: str, network: str = "mainnet-beta", proposal_id: str = None) -> str:
    """Query the Clicks Protocol treasury."""
    from solana.rpc.api import Client
    
    client = Client(f"https://api.{network}.solana.com")
    treasury_pda = "CLICKS_TREASURY_PDA_ADDRESS"
    
    if operation == "balance":
        balance = client.get_balance(treasury_pda)
        return f"Treasury: {balance.value / 1e9} SOL"
    
    elif operation == "allocations":
        # Deserialize treasury account...
        return "Development: 40%, Marketing: 30%, Community: 20%, Reserve: 10%"
    
    elif operation == "proposals":
        if proposal_id:
            return f"Proposal {proposal_id}: Status=Active, Votes=42/100"
        return "Active proposals: #1 (Q1 Distribution), #2 (Marketing Budget)"
    
    elif operation == "history":
        return "Last 5 distributions: [2026-02-01: 100 SOL, ...]"
    
    return f"Unknown operation: {operation}"
```

### Full Tool Suite for Clicks

```python
from langchain.tools import tool, ToolRuntime
from typing import Optional

# --- Read-only tools (no wallet needed) ---

@tool
def clicks_treasury_balance(network: str = "mainnet-beta") -> str:
    """Get the current Clicks Protocol treasury balance in SOL and CLICKS tokens.
    
    Args:
        network: Solana network to query
    """
    # Implementation...
    return "Treasury: 1,234.56 SOL, 10,000,000 CLICKS"

@tool
def clicks_treasury_allocations() -> str:
    """View current Clicks Protocol treasury allocation percentages across categories."""
    return "Development: 40%, Marketing: 30%, Community: 20%, Reserve: 10%"

@tool
def clicks_active_proposals() -> str:
    """List all active governance proposals for the Clicks Protocol treasury."""
    return "2 active proposals: #1 Q1 Distribution (67% yes), #2 Marketing Budget (45% yes)"

@tool
def clicks_proposal_details(proposal_id: str) -> str:
    """Get detailed information about a specific Clicks governance proposal.
    
    Args:
        proposal_id: The proposal ID to look up
    """
    return f"Proposal {proposal_id}: ..."

# --- Write tools (require wallet) ---

@tool
def clicks_propose_distribution(
    description: str,
    dev_pct: int = 40,
    marketing_pct: int = 30,
    community_pct: int = 20,
    reserve_pct: int = 10
) -> str:
    """Submit a new treasury distribution proposal to Clicks Protocol governance.
    
    Args:
        description: Human-readable description of the proposal
        dev_pct: Percentage allocated to development
        marketing_pct: Percentage allocated to marketing  
        community_pct: Percentage allocated to community
        reserve_pct: Percentage allocated to reserve
    """
    if dev_pct + marketing_pct + community_pct + reserve_pct != 100:
        return "Error: Allocations must sum to 100%"
    # Sign and submit transaction...
    return "Proposal submitted! TX: 5xK3..."

@tool
def clicks_vote(proposal_id: str, vote: str) -> str:
    """Vote on an active Clicks Protocol governance proposal.
    
    Args:
        proposal_id: The proposal to vote on
        vote: Your vote - 'yes' or 'no'
    """
    return f"Voted {vote} on proposal {proposal_id}. TX: 7yM2..."
```

### Using with an Agent

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent

model = ChatOpenAI(model="gpt-4.1")

clicks_tools = [
    clicks_treasury_balance,
    clicks_treasury_allocations,
    clicks_active_proposals,
    clicks_proposal_details,
    clicks_propose_distribution,
    clicks_vote,
]

agent = create_agent(
    model,
    tools=clicks_tools,
    system_prompt="""You are a Clicks Protocol treasury assistant.
    Help users check balances, view proposals, and participate in governance.
    Always confirm write operations before executing."""
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "What's the treasury balance?"}]
})
```

### Stateful Tools with Runtime Context

```python
from langchain.tools import tool, ToolRuntime

@tool
def clicks_treasury_balance(runtime: ToolRuntime) -> str:
    """Get the current Clicks Protocol treasury balance."""
    # Access user context for personalized responses
    user_id = runtime.context.user_id if runtime.context else "anonymous"
    
    # Access persistent store for cached data
    cached = runtime.store.get(("clicks", "treasury"), "balance") if runtime.store else None
    if cached:
        return f"[cached] {cached.value}"
    
    balance = fetch_treasury_balance()
    
    # Cache the result
    if runtime.store:
        runtime.store.put(("clicks", "treasury"), "balance", {"sol": balance})
    
    return f"Treasury: {balance} SOL"
```

### Package Structure

```
clicks-langchain/
├── pyproject.toml
├── src/
│   └── clicks_langchain/
│       ├── __init__.py
│       ├── tools.py          # All @tool definitions
│       ├── schemas.py         # Pydantic input models
│       └── client.py          # Solana RPC wrapper
├── tests/
│   └── test_tools.py
└── README.md
```

### Distribution

Published to PyPI as `clicks-langchain`:

```bash
pip install clicks-langchain
```

```python
from clicks_langchain import clicks_tools  # List of all tools
```

### Key Takeaways for Clicks

- **Simplest code interface** — just decorated Python functions
- **Docstring IS the description** — model uses it to decide when to call
- **Type hints define schema** — Pydantic for complex inputs
- **No framework lock-in** — tools work with any LangChain agent
- **Huge ecosystem** — LangChain is the most widely used agent framework

---

## 4. Clicks Protocol — Concrete Plugin Designs

### What a Clicks plugin needs across all ecosystems

| Capability | Read/Write | Priority |
|------------|-----------|----------|
| Treasury balance query | Read | P0 — must have |
| Allocation percentages | Read | P0 |
| Active proposals list | Read | P0 |
| Proposal details | Read | P1 |
| Distribution history | Read | P1 |
| Submit proposal | Write | P2 |
| Vote on proposal | Write | P2 |
| Execute distribution | Write | P2 |

### Recommended Build Order

1. **LangChain tools** (Python, 1-2 days) — fastest to build, largest audience
2. **Codex skill** (Markdown, 1 day) — zero code, works in Codex immediately  
3. **ElizaOS plugin** (TypeScript, 2-3 days) — richest integration, crypto-native audience

### Shared Infrastructure

All three plugins should share a common Clicks Protocol client:

```
clicks-sdk/
├── typescript/    → Used by ElizaOS plugin
│   └── src/
│       ├── client.ts
│       └── types.ts
├── python/        → Used by LangChain tools
│   └── clicks_sdk/
│       ├── client.py
│       └── types.py
└── docs/          → Used by Codex skill references/
    ├── treasury-contract.md
    ├── governance.md
    └── error-codes.md
```

---

## 5. Comparison Matrix

| Aspect | Codex Skills | ElizaOS Plugins | LangChain Tools |
|--------|-------------|-----------------|-----------------|
| **Language** | Markdown + shell | TypeScript | Python |
| **Effort to build** | ~1 day | ~2-3 days | ~1-2 days |
| **Code required** | None (optional scripts) | Yes (compiled TS) | Yes (decorated functions) |
| **Discovery** | Folder convention + installer | npm + character config | pip + import |
| **Agent integration** | Instruction-following | Full lifecycle (actions/providers/services) | Tool calling |
| **Crypto ecosystem fit** | Low (general purpose) | High (built for crypto) | Medium |
| **Audience size** | Large (Codex users) | Medium (crypto/AI agents) | Very large (LangChain ecosystem) |
| **Write operations** | Via shell scripts/MCP | Native (wallet services) | Via function code |
| **Testing** | Manual prompt testing | Component + E2E tests | pytest |
| **State management** | None (stateless instructions) | Services + DB adapters | ToolRuntime + Store |
| **MCP support** | Native (openai.yaml deps) | Via service | Via MCP toolkit |

---

## Appendix: Source URLs

- Codex Skills Docs: https://developers.openai.com/codex/skills
- Codex Skills Repo: https://github.com/openai/skills
- Agent Skills Standard: https://agentskills.io
- ElizaOS Plugin Architecture: https://docs.elizaos.ai/plugins/architecture
- ElizaOS Plugin Components: https://docs.elizaos.ai/plugins/components
- ElizaOS Create Plugin Guide: https://docs.elizaos.ai/guides/create-a-plugin
- LangChain Tools Docs: https://docs.langchain.com/oss/python/langchain/tools
- LangChain Custom Tools: https://python.langchain.com/docs/how_to/custom_tools/
