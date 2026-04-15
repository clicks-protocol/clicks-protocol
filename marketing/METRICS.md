# Clicks Protocol — Metrics & KPIs

## North Star Metric
**Total Value Locked (TVL) in USDC** — The sum of all agent deposits in the protocol.

## Core Metrics

### Acquisition
| Metric | Baseline (Day 1) | Target (Week 1) | Target (Month 1) | How to Measure |
|--------|------------------|-----------------|------------------|----------------|
| Website Visitors | 500 | 2,000 | 10,000 | Cloudflare Analytics |
| GitHub Stars | 10 | 50 | 200 | GitHub API |
| X Followers | 50 | 200 | 1,000 | X API |
| Discord Members | 20 | 100 | 500 | Discord Bot |
| MCP Tool Calls | 20/day | 100/day | 500/day | Worker logs |
| Newsletter Subs | 10 | 50 | 200 | Substack dashboard |

### Activation
| Metric | Baseline | Week 1 | Month 1 | How to Measure |
|--------|----------|--------|---------|----------------|
| Agents Registered | 1 | 5 | 20 | Contract events |
| First Deposit | 1 | 3 | 15 | Contract events |
| SDK Installs | 5 | 25 | 100 | npm downloads |
| MCP Server Installs | 2 | 10 | 50 | npm downloads |
| Docs Pageviews | 100 | 500 | 2,000 | Cloudflare Analytics |

### Revenue
| Metric | Formula | Week 1 | Month 1 | How to Measure |
|--------|---------|--------|---------|----------------|
| TVL (USDC) | Sum of deposits | $1,000 | $10,000 | Contract query |
| Daily Yield | TVL × APY / 365 | ~$0.36 | ~$3.56 | Contract query |
| Daily Fees | Daily Yield × 2% | ~$0.007 | ~$0.07 | Contract query |
| Monthly Fees | Daily Fees × 30 | ~$0.21 | ~$2.10 | Contract query |
| Referral Earnings | 10% of referee fees | $0 | $0.21 | Contract query |

### Engagement
| Metric | Baseline | Week 1 | Month 1 | How to Measure |
|--------|----------|--------|---------|----------------|
| X Engagement Rate | 2% | 3% | 5% | (Likes+RTs+Replies)/Impressions |
| Discord Messages/day | 5 | 20 | 50 | Discord Bot |
| GitHub Issues/PRs | 0 | 2 | 10 | GitHub API |
| Community Contributors | 0 | 1 | 5 | GitHub API |

## Leading Indicators

### Product-Market Fit Signals
| Signal | What it Means | Target |
|--------|---------------|--------|
| **Organic GitHub Stars** | Developers finding us useful | 50+ in Month 1 |
| **Community PRs** | People want to contribute | 2+ in Month 1 |
| **Repeat Deposits** | Agents trust the protocol | 3+ agents with >1 deposit |
| **Referral Tree Depth** | Viral growth | 2+ levels deep |
| **Integrations Built** | Ecosystem adoption | 1+ external project using SDK |

### Risk Indicators
| Signal | What it Means | Action if Triggered |
|--------|---------------|---------------------|
| **TVL Stagnant (<$100)** | No product-market fit | Interview early users, pivot |
| **High Bounce Rate (>80%)** | Website not compelling | A/B test messaging |
| **Zero MCP Calls** | Tools not useful | Improve docs, add examples |
| **Negative Sentiment** | Community unhappy | Address concerns transparently |
| **Gas Costs > Yield** | Not economically viable | Optimize contracts, consider L3 |

## Measurement Tools

### Automated
| Tool | What it Measures | Frequency |
|------|------------------|-----------|
| **Contract Events** | Deposits, withdrawals, registrations | Real-time |
| **Cloudflare Analytics** | Website traffic, pageviews | Daily |
| **X API** | Followers, engagement, mentions | 6-hourly |
| **GitHub API** | Stars, forks, issues, PRs | Daily |
| **npm API** | Download counts | Weekly |
| **Discord Bot** | Member count, message activity | Daily |
| **Worker Logs** | MCP tool calls, errors | Real-time |

### Manual
| Metric | How to Measure | Frequency |
|--------|----------------|-----------|
| **Reddit/HN Sentiment** | Read comments, gauge reaction | Post-launch + weekly |
| **Competitor Moves** | Manual check of competitor channels | Weekly |
| **Community Feedback** | Discord conversations, DMs | Daily |
| **Registry Approvals** | Check Smithery, Glama, mcp.so status | Daily |
| **PR Merge Status** | Check 8 awesome-list PRs | Daily |

## Dashboard

### Daily Check (Emma Heartbeat)
```
Clicks Protocol — Daily Snapshot
📅 2026-03-XX
────────────────
📊 TVL: $X,XXX (▲ X%)
👥 Agents: X (▲ X)
⭐ GitHub: X stars (▲ X)
🐦 X Followers: X (▲ X)
🛠️ MCP Calls: X (▲ X%)
────────────────
🎯 Today: [Priority task]
⚠️ Alerts: [Any issues]
```

### Weekly Report (Monday 09:00)
```
Clicks Protocol — Weekly Report
📅 Week X (MM-DD to MM-DD)
────────────────
📈 ACQUISITION
• Website: X visitors (▲ X%)
• GitHub: X stars (▲ X)
• X: X followers (▲ X%)
• Discord: X members (▲ X%)

💰 REVENUE
• TVL: $X,XXX (▲ X%)
• Weekly Fees: $X.XX
• APY: X% (Morpho: X%, Aave: X%)

🎯 ENGAGEMENT
• X ER: X% (▲ X%)
• Discord Msgs: X (▲ X%)
• GitHub Issues: X (▲ X%)

🏆 TOP PERFORMERS
1. [Best performing channel/content]
2. [Top referrer if any]
3. [Most active agent]

📉 AREAS TO IMPROVE
1. [Lowest metric + hypothesis why]
2. [Next week's focus]
```

## Targets by Phase

### Phase 1: Launch (Month 1)
- **TVL:** $10,000
- **Active Agents:** 5+
- **GitHub Stars:** 50+
- **X Followers:** 200+
- **Community:** Discord 100+ members
- **Validation:** 1+ external integration

### Phase 2: Growth (Months 2-3)
- **TVL:** $50,000
- **Active Agents:** 20+
- **GitHub Stars:** 200+
- **X Followers:** 1,000+
- **Community:** Discord 500+ members
- **Ecosystem:** 5+ external integrations

### Phase 3: Scale (Months 4-6)
- **TVL:** $250,000
- **Active Agents:** 50+
- **GitHub Stars:** 500+
- **X Followers:** 5,000+
- **Revenue:** $500+/month fees
- **Partnerships:** 2+ major platform integrations

## Alert Thresholds

### 🔴 Critical (Notify Immediately)
- TVL drops >50% in 24h
- Contract exploit suspected
- X account suspended
- Domain expired
- GitHub repo compromised

### 🟡 Warning (Monitor Closely)
- TVL stagnant for 7 days
- 0 new agents for 14 days
- Negative sentiment trend
- API rate limits hit
- Competitor launches similar product

### 🟢 Normal (Routine Check)
- Daily metrics within expected range
- Steady growth
- Positive community feedback
- No technical issues

## Data Sources Configuration

### Environment Variables Needed
```bash
# GitHub
GITHUB_PAT=ghp_...
GITHUB_USER=clicks-protocol

# X/Twitter
X_BEARER_TOKEN=AAAAAAAA...
X_API_KEY=qaXK8MBjcbjpI5FxtByOuF9rh
X_API_SECRET=PQJ55LaWCOnTnZGIUIRO3cOttZ3UCE6qCKg5AgFgcsTytM5RdU

# Discord
DISCORD_BOT_TOKEN=MTQ4Mjg2MjE4NzE4NDY1MjQyOQ.G2gmbX...

# Cloudflare
CLOUDFLARE_API_TOKEN=uCHj5zlagfNFz_wIFrYE51VfeSOORM7o3VQJOVHa
CLOUDFLARE_ACCOUNT_ID=613482732d4af6ca8f094e90fcea3169
CLOUDFLARE_ZONE_ID=70f429a3a69d609b3a369f651e997b3f

# Contract
CLICKS_CONTRACT_ADDRESS=0x...
BASE_RPC_URL=https://mainnet.base.org
```

### Script Location
All monitoring scripts in: `projects/clicks-protocol/monitoring/`

## Success Definition
**Month 1 Success:** TVL > $10,000 AND 5+ active agents AND positive community sentiment.

**Failure Definition:** TVL < $1,000 after 30 days OR zero agent deposits after 14 days.

**Pivot Point:** If failure definition met, conduct user interviews and consider pivot within 7 days.