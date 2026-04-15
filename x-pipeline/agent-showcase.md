# Weekly AI Agent Showcase Template

**Created:** 01.04.2026  
**Purpose:** Weekly spotlight on AI agent projects + how Clicks could help them earn yield on idle USDC.

---

## Template Structure

Each showcase consists of:
1. **Project Intro** - What they do, why they're interesting
2. **Idle USDC Analysis** - Their potential idle capital problem
3. **Clicks Solution** - How 80/20 split could help them
4. **CTA** - Gentle suggestion to explore Clicks

**Format:** Tweet thread (3-5 tweets) or carousel (3 images)

**Tone:** Respectful, educational, not pushy. Focus on value they could gain.

**Frequency:** 1 showcase per week (Monday 15:00 CET)

---

## Showcase 1: LangChain Agents

**Tweet 1/3**
This week's AI Agent Spotlight: LangChain agents.

LangChain's agent framework powers thousands of autonomous workflows - customer support, data analysis, content creation.

These agents increasingly handle payments and need to manage USDC balances.

**Tweet 2/3**
The idle USDC problem for LangChain agents:

A customer support agent processing 50 tickets/day at $5 each holds ~$250 in USDC for liquidity.

Over a month: $7,500 volume, $250 idle earning 0%.

Scale across LangChain's ecosystem: millions in idle capital.

**Tweet 3/3**
How Clicks could help:

LangChain agents could integrate Clicks SDK to automatically split received USDC 80/20.

80% stays liquid for instant refunds/payments.
20% earns yield (7-13% APY) in Morpho.

No code changes to agent logic. Just wrap payment handling.

**Tweet 4/3** (optional)
For LangChain developers:

```python
from clicks_sdk import ClicksClient

clicks = ClicksClient()
# Instead of direct wallet transfer
await clicks.quick_start(amount, agent_address)
```

Earn yield while maintaining liquidity for your agents.

---

## Showcase 2: CrewAI Agents

**Tweet 1/3**
AI Agent Spotlight: CrewAI - collaborative agent teams.

CrewAI orchestrates multiple specialized agents working together on complex tasks.

These teams often involve payment splits, revenue sharing, and pooled USDC reserves.

**Tweet 2/3**
Idle USDC in CrewAI workflows:

A 3-agent crew (researcher, writer, editor) earns $100/task.
Each agent needs liquidity for micro-payments within the crew.

Result: $300+ idle across the team, earning 0% while coordinating.

**Tweet 3/3**
Clicks solution for CrewAI:

Each agent in the crew could have individual Clicks yield accounts.

Shared task payments get split 80/20 per agent automatically.

Crew leads could even set different yield percentages based on agent roles.

**Tweet 4/3** (optional)
CrewAI's role-based architecture aligns perfectly with Clicks' configurable yield percentages.

Research agents (high liquidity needs): 90/10
Writing agents (balanced): 80/20  
Analysis agents (yield-focused): 70/30

---

## Showcase 3: AutoGPT-style Agents

**Tweet 1/3**
Spotlight: AutoGPT-style autonomous agents.

These self-directed agents pursue complex goals over days/weeks, making autonomous decisions including payments for APIs, data, and services.

**Tweet 2/3**
The capital management challenge:

AutoGPT agents need substantial USDC reserves for long-running tasks.

A week-long research project might require $500 in API credits.

That's $500 idle for 7 days, then another $500 for the next project.

**Tweet 3/3**
How Clicks helps autonomous agents:

Instead of keeping full reserves idle, agents split 80/20.

80% available for immediate API payments.
20% earning yield continuously.

As the agent spends, yield keeps accruing on the remaining balance.

**Tweet 4/3** (optional)
For autonomous agent developers:

Clicks' non-custodial model means agents keep control of keys.

The MCP server integration (9 tools) gives agents full programmatic control over yield management.

---

## Showcase 4: Devin-like Coding Agents

**Tweet 1/3**
Spotlight: Devin-like AI coding agents.

These agents handle freelance development work, getting paid in USDC for completed tasks.

They need to manage earnings between jobs and expenses.

**Tweet 2/3**
The freelancer cash flow problem:

A coding agent completes a $2,000 contract.
It needs to pay $400 for API usage next month.
$1,600 sits idle for 30 days earning 0%.

Repeat across multiple clients: significant idle capital.

**Tweet 3/3**
Clicks as agent treasury management:

Coding agents could use Clicks as their "business account".

Received payments automatically split 80/20.
Yield accrues between projects.
Liquidity always available for expenses.

**Tweet 4/3** (optional)
The 2% protocol fee (yield only) is lower than traditional business banking fees.

And yield at 7-13% APY beats most business savings accounts.

---

## Showcase 5: MCP-based Agents

**Tweet 1/3**
Spotlight: MCP-based agents using Model Context Protocol.

MCP standardizes how agents access tools and resources.
Clicks provides an MCP server with 9 yield management tools.

**Tweet 2/3**
The MCP advantage:

Agents discover Clicks automatically through MCP registry.
No manual SDK integration needed.
Just add `npx @clicks-protocol/mcp-server` to config.

**Tweet 3/3**
Clicks MCP server tools:

4 read tools (check balances, simulate splits)
5 write tools (quickStart, withdrawYield, etc.)
1 resource (protocol info)

Full yield management through standard MCP interface.

**Tweet 4/3** (optional)
For MCP agent developers:

```json
{
  "mcpServers": {
    "clicks": {
      "command": "npx",
      "args": ["@clicks-protocol/mcp-server"]
    }
  }
}
```

That's it. Agent now has yield management capabilities.

---

## Execution Workflow

**Weekly Process:**

1. **Monday AM:** Research next agent project
   - Check their X activity
   - Understand their payment flows
   - Estimate idle USDC potential

2. **Monday PM:** Create showcase content
   - Write thread (3-5 tweets)
   - Create visuals if needed
   - Schedule for 15:00 CET

3. **Tuesday AM:** Engagement & DM
   - Reply to comments
   - DM project: "Hey, featured you here. Would love your thoughts."
   - Track metrics

**Content Calendar (First 5 Weeks):**
- Week 1: LangChain agents
- Week 2: CrewAI agents  
- Week 3: AutoGPT-style agents
- Week 4: Devin-like coding agents
- Week 5: MCP-based agents

**Metrics to Track:**
- Showcase impression count
- Project account engagement (likes, replies)
- Website visits from showcase
- DM response rate
- SDK/MCP installs from featured communities

**Amplification:**
- Retweet project's relevant content during week
- Add "Featured: @Project" to bio temporarily
- Monthly recap: "This month's agent spotlights"
- Cross-post to LinkedIn (different format)

---

## Template Variations

**Short Format (2 tweets):**
1. Spotlight on [Project] + their idle USDC challenge
2. How Clicks' 80/20 split could help + CTA

**Carousel Format (3 images):**
1. Project intro + logo
2. Idle USDC visualization
3. Clicks solution + numbers

**Thread Format (3-5 tweets):**
Use the structure above

**Always include:**
- Respectful tone (not "you should")
- Clear value proposition
- Technical accuracy
- Gentle CTA