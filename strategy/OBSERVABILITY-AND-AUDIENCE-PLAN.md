# Clicks Protocol: Audience, Observability, and Product Architecture Plan

Stand: 2026-03-27

## 1. Goal

Clicks needs two things at the same time:

1. A clean internal architecture for measuring real usage, not vanity metrics.
2. A product surface that makes the value obvious for each target audience.

The core mistake to avoid: building a marketing shell without a usage spine.

## 2. What success actually means

For Clicks, success is not just traffic. It is this funnel:

1. Someone discovers Clicks
2. They understand the 80/20 treasury model
3. They test a simulation
4. They register an agent
5. They deposit USDC
6. They leave funds long enough to earn yield
7. They withdraw and see that Clicks took only 2% of yield
8. They come back or refer another agent

That means the system architecture must measure all 8 steps.

## 3. Audience ranking

### Rank 1: Agent builders with real money flow
Examples:
- teams building autonomous agents with wallets
- agent operators using USDC for APIs, compute, or agent-to-agent payments
- teams using Base or planning to use Base

Why they matter:
- highest chance of actual deposits
- shortest path from discovery to revenue
- closest fit to the product as it exists today

What they need to see:
- three-line integration
- exact flow of funds
- real APY source
- no lockup
- what happens on withdrawal
- proof that Clicks only takes 2% of yield, not principal

### Rank 2: Framework and runtime teams
Examples:
- MCP framework maintainers
- agent frameworks like AgentScope, CrewAI, LangChain agent stacks
- wallet infra for agents

Why they matter:
- distribution multiplier
- one integration can expose Clicks to many builders
- strongest ADO impact

What they need to see:
- MCP example
- SDK example
- integration cookbook
- why Clicks makes their framework more useful
- clear boundaries between read tools and write tools

### Rank 3: x402 and agent payments ecosystem
Examples:
- builders around x402
- payment protocol developers
- commerce/payment flows on Base

Why they matter:
- the strongest narrative fit
- idle payment float is exactly where Clicks wins
- likely to understand the problem fast

What they need to see:
- "Sparkonto für x402 Agents"
- before/after payment treasury diagrams
- simulation: how much idle float becomes yield
- compatibility with Base native USDC

### Rank 4: DeFi-native developers and advanced operators
Examples:
- DeFi integrators
- on-chain bot operators
- protocol teams exploring agent treasury use cases

Why they matter:
- high technical credibility
- can contribute integrations and referrals
- but they are not the shortest path to mainstream agent usage

What they need to see:
- contract architecture
- risk model
- source of APY
- exact fee mechanics
- security review and contract verification

### Rank 5: Curious retail / speculative audience
Examples:
- crypto tourists
- general AI x crypto spectators

Why they matter:
- attention, not revenue
- lowest conversion quality

What they need to see:
- simple story and examples
- but this audience should not shape the product roadmap

## 4. What each audience must see to immediately "get it"

### Universal proof objects
Every serious audience needs these 5 proof objects:

1. Live protocol stats
   - TVL
   - active agents
   - total yield earned
   - fees collected

2. Personal outcome calculator
   - "If my agent holds X USDC and spends Y per month, what do I earn?"

3. Integration proof
   - SDK quickstart
   - MCP quickstart
   - working example in a known framework

4. Transparency proof
   - active protocol
   - current APY source
   - fee math
   - contract addresses

5. Operational proof
   - alerts
   - logs
   - visible history of deposits, withdrawals, fees

## 5. What users will most likely want

This section uses MiroFish only as a vetted conceptual input.
MiroFish itself is not being installed into OpenClaw here.
The useful product lesson from MiroFish is: people do not only want raw numbers, they want a simulation and a narrative about what happens next.

### Highest-demand features, ranked

#### 1. Treasury simulator
Question users ask:
- "If my agent holds 5k, 10k, 50k USDC, what happens?"

What they want:
- monthly yield estimate
- net after Clicks fee
- split between liquid and yield bucket
- scenario comparison for Aave vs Morpho

#### 2. Agent dashboard
Question users ask:
- "What is my agent doing right now?"

What they want:
- registration status
- operator address
- current deposited principal
- current yield earned
- pending withdrawable amount
- current yield percentage split

#### 3. Protocol monitor
Question users ask:
- "Is anyone actually using this?"

What they want:
- TVL trend
- active agents count
- recent deposits
- recent withdrawals
- fees collected over time

#### 4. Alerting
Question users ask:
- "Tell me when something important changes."

What they want:
- new agent registered
- first deposit
- TVL spike
- first fee earned
- APY source changed
- MCP write tool called

#### 5. Risk and explainability layer
Question users ask:
- "Why should I trust this?"

What they want:
- where funds are routed
- what contract touched funds
- what APY assumption is being used
- why yield changed since yesterday

#### 6. Multi-agent / team view
Question users ask:
- "Can I manage more than one agent?"

What they want:
- grouped dashboards
- operator-level view
- top earners
- aggregated yield and fees

#### 7. Referral performance view
Question users ask:
- "What did my referral tree earn?"

What they want:
- direct referrals
- tree depth
- claimable rewards
- treasury share vs referral share

## 6. MiroFish vetting summary

SKILL VETTING REPORT
═══════════════════════════════════════
Skill/Repo: MiroFish
Source: GitHub
Author: 666ghj / MiroFish Team
Version: repo main branch
───────────────────────────────────────
METRICS:
• Stars: 43k+
• Last Updated: 2026-03-27
• Files Reviewed: root files, env example, package files, backend tree, run.py, dependency manifests, suspicious pattern scan
───────────────────────────────────────
RED FLAGS:
• No obvious malicious red flags found
• Requires external LLM API key
• Requires Zep Cloud API key
• Large app with network usage by design
• Not an OpenClaw skill, but a standalone full-stack app

PERMISSIONS NEEDED:
• Files: local uploads, config files, simulation inputs
• Network: LLM provider, Zep Cloud, frontend/backend local network
• Commands: npm, uv, python, docker
───────────────────────────────────────
RISK LEVEL: 🟡 MEDIUM
VERDICT: ⚠️ SAFE TO STUDY / INSTALL WITH CAUTION

NOTES:
• Good as conceptual reference for simulation UX
• Not needed inside OpenClaw right now
• Best use is product inspiration, not operational dependency
═══════════════════════════════════════

## 7. Best architecture for Clicks observability

### Principle
Build one measurement spine and expose it in two ways:
- internal operator dashboard
- user-facing proof widgets

### Recommended architecture

```text
[ On-chain Base contracts ]
    |
    | events + state reads
    v
[ Chain Indexer Layer ]
    - agent registered
    - payment received
    - yield withdrawn
    - fee collected
    - fee swept
    - protocol APY snapshot
    |
    v
[ Usage Aggregator Layer ]
    - compute TVL
    - compute active agents
    - compute fee totals
    - compute daily/weekly deltas
    - classify first-time vs repeat usage
    |
    +-------------------+
    |                   |
    v                   v
[ Alert Engine ]     [ Dashboard API ]
- Telegram alerts    - JSON endpoints
- threshold logic    - charts
- anomaly detection  - tables
    |                   |
    v                   v
[ Emma / David ]     [ Internal UI + Public proof widgets ]
```

### Add a second telemetry lane

```text
[ MCP HTTP / MCP Server / SDK ]
    |
    | tool calls, package usage, endpoint hits
    v
[ Integration Telemetry Layer ]
    - read tool calls
    - write tool calls
    - unique callers if available
    - top methods
    - failed writes
```

### Then merge both lanes

```text
[ Chain Reality ] + [ Integration Intent ] = [ Full usage picture ]
```

That distinction matters:
- MCP read calls = interest
- register agent = activation
- receive payment = real use
- fee collected = monetization

## 8. Clean programming structure

Recommended new folder structure inside `projects/clicks-protocol/`:

```text
observability/
  README.md
  config/
    sources.ts
    thresholds.ts
  collectors/
    chain-events.ts
    contract-state.ts
    mcp-logs.ts
    github-stats.ts
    npm-stats.ts
  core/
    types.ts
    usage-aggregator.ts
    snapshot-service.ts
    anomaly-detector.ts
    attribution.ts
  storage/
    schema.sql
    sqlite.ts
    migrations/
  jobs/
    usage-monitor.ts
    daily-snapshot.ts
    weekly-report.ts
    alert-runner.ts
  alerts/
    telegram.ts
    formatter.ts
  api/
    internal-dashboard.ts
    public-metrics.ts
  ui/
    internal-dashboard/
    public-widgets/
  reports/
    daily/
    weekly/
```

### Why this structure is right
- `collectors/` only fetch raw facts
- `core/` computes business meaning
- `storage/` persists time series
- `jobs/` runs scheduled tasks
- `alerts/` sends notifications
- `api/` exposes data to UI
- `ui/` visualizes it

This avoids mixing blockchain reads, Telegram logic, and dashboard code in one place.

## 9. Best implementation path

### Phase 1: minimal but useful
Build this first.

#### 1. Chain collector
Reads:
- AgentRegistered
- PaymentReceived
- YieldWithdrawn
- FeeCollected
- FeeSwept
- total balance / total deposited / pending fees

#### 2. SQLite storage
Tables:
- agents
- events
- daily_snapshots
- fees
- protocol_snapshots
- mcp_usage

#### 3. Daily usage monitor cron
At 09:30 or 10:00 CET, after morning jobs.
Outputs only if something changed.

Example:
```text
📊 Clicks Usage Update
- 1 new agent registered
- TVL: 0 → 750 USDC
- 2 payments received
- Pending fees: 0.18 USDC
```

#### 4. Internal HTML dashboard
Single page is enough at first.
Show:
- TVL line chart
- active agents
- recent events table
- fees pending / swept
- MCP calls by tool

### Phase 2: user-facing proof layer
Expose public widgets on site:
- live TVL
- active agents
- current APY source
- total fees generated
- latest events

This gives social proof without exposing sensitive details.

### Phase 3: simulation layer
This is where MiroFish-style product thinking helps.
Add a "Treasury Lab" page:
- input idle balance
- input monthly spend
- input yield split
- output expected yield, fee, liquidity profile
- scenario comparison over 30, 90, 365 days

This will probably convert better than generic copy.

## 10. What we should visually observe

### Internal dashboard blocks

#### A. Protocol health
- active protocol
- current APY Aave
- current APY Morpho
- total deposited
- total balance
- pending fees

#### B. Usage funnel
- website visits
- MCP read calls
- MCP write calls
- agents registered
- first deposit count
- withdrawals
- fees earned

#### C. Revenue
- fees today
- fees this week
- fees this month
- cumulative fees
- treasury inflow

#### D. Retention
- repeat agents
- average deposit size
- average days between deposit and withdrawal
- referral tree depth

#### E. Anomalies
- no new agents in 7 days
- TVL down > 20%
- MCP write errors
- APY source changed

## 11. What we should alert on

### Immediate alerts
- first ever agent registered
- first ever payment received
- first ever fee collected
- first ever referral claim
- TVL crosses thresholds: 1k / 10k / 50k / 100k

### Daily digest
- new agents
- TVL delta
- fees delta
- top MCP methods
- unusual failures

## 12. My recommendation

### Best next move
Build a **Clicks Usage Monitor** first.

Not a huge dashboard.
Not more marketing pages.
First build the measurement spine.

### Why
Because right now we can ask:
- "Do people know about Clicks?"
- "Did we publish enough content?"

But we cannot yet answer fast enough:
- "Did a real agent deposit money today?"
- "Did we earn our first fee?"
- "Which integration path converts better: SDK or MCP?"

That is the bottleneck.

## 13. Concrete build order

1. `observability/collectors/chain-events.ts`
2. `observability/storage/schema.sql`
3. `observability/jobs/usage-monitor.ts`
4. `observability/alerts/telegram.ts`
5. `observability/api/internal-dashboard.ts`
6. `observability/ui/internal-dashboard/`
7. `Treasury Lab` simulator on the public site

## 14. Summary

### Target audience ranking
1. Agent builders with real USDC flow
2. Framework/runtime teams
3. x402/payment ecosystem
4. DeFi-native builders
5. Retail spectators

### They need to see
- exact value in their context
- live proof
- simulation before integration
- simple integration path
- transparent fee mechanics

### We need to build
- one observability spine
- internal dashboard
- public proof widgets
- Treasury Lab simulator

### Most wanted features
1. Treasury simulator
2. Agent dashboard
3. Protocol monitor
4. Alerts
5. Risk explainability
6. Multi-agent view
7. Referral analytics
