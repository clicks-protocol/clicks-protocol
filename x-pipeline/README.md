# X/Twitter Pipeline — Clicks Protocol

Three CLI tools for monitoring mentions, streaming keywords, and tracking tweet performance for [@ClicksProtocol](https://x.com/ClicksProtocol).

## Setup

Credentials are stored in `config.json` (Bearer Token, User ID, Username). All tools use Bearer Token auth for read-only endpoints.

```bash
cd x-pipeline
npm install  # Already done if @xdevplatform/xdk is installed
```

## Tools

### 1. mention-check.js — Daily Mention Check

Searches recent tweets mentioning @ClicksProtocol or "clicks protocol".

```bash
node mention-check.js            # Check last 24h
node mention-check.js --hours 48 # Check last 48h
```

**Example Output:**
```
[2026-03-18T21:30:00.000Z] Searching mentions from last 24h...
[2026-03-18T21:30:01.123Z] Found 3 mentions in last 24h:

  @cryptodev42 (Crypto Dev)
  "Just discovered @ClicksProtocol — this x402 yield approach is wild"
  https://x.com/cryptodev42/status/1234567890
  2026-03-18T18:15:00.000Z | ❤️ 5 | 🔁 2 | 💬 1
```

Results are appended to `mentions-log.json`.

### 2. stream.js — Filtered Stream (Keyword Monitor)

Real-time tweet stream matching keywords like x402, agent yield, USDC yield, etc.

```bash
node stream.js start              # Start streaming
node stream.js rules              # Show current rules
node stream.js add "new keyword"  # Add a rule
node stream.js clear              # Delete all rules
```

**Default Keywords:**
`x402`, `agent yield`, `agent wallet`, `USDC yield`, `idle USDC`, `@ClicksProtocol`, `clicks protocol`

**Example Output:**
```
[2026-03-18T21:30:00.000Z] Default rules set.
[2026-03-18T21:30:01.000Z] Stream connected! Listening for tweets...

  🐦 @defi_whale (DeFi Whale)
  "x402 is the future of agent-to-agent payments. USDC yield just sitting idle in wallets..."
  https://x.com/defi_whale/status/9876543210
  Rules: clicks-protocol-keywords
```

Matched tweets are appended to `stream-log.json`. Auto-reconnects with exponential backoff on disconnect.

**Note:** Filtered Stream requires Elevated or Academic access on the Twitter API. Basic access may return 403.

### 3. performance.js — Tweet Performance Report

Generates engagement metrics report for all @ClicksProtocol tweets.

```bash
node performance.js              # Report for all tweets
node performance.js --days 7     # Only last 7 days
```

**Example Output:**
```markdown
# Tweet Performance Report
Date: 2026-03-18
Period: Last 7 days

## Summary
- Total Tweets: 12
- Total Impressions: 45,230
- Total Likes: 156
- Total Retweets: 43
- Total Replies: 28
- Avg Engagement Rate: 0.50%

## Top Performers
1. "Introducing Clicks Protocol: Your agent's idle USDC can now earn..."
   50 likes, 15 RTs, 12,000 impressions (0.54%)

## All Tweets
| Date | Text (50 chars) | Impressions | Likes | RTs | Replies | Engagement |
|------|----------------|-------------|-------|-----|---------|------------|
| 2026-03-18 | Introducing Clicks Protocol: Your agent's... | 12,000 | 50 | 15 | 8 | 0.54% |
```

Reports are saved to `reports/performance-YYYY-MM-DD.md`.

## File Structure

```
x-pipeline/
├── config.json          # Auth credentials (Bearer Token)
├── mention-check.js     # Tool 1: Daily mention check
├── stream.js            # Tool 2: Real-time keyword stream
├── performance.js       # Tool 3: Tweet performance report
├── mentions-log.json    # Mention check history (auto-created)
├── stream-log.json      # Stream match history (auto-created)
├── reports/             # Performance reports
│   └── performance-YYYY-MM-DD.md
├── post.js              # Tweet posting tool (existing)
├── queue.json           # Tweet queue (existing)
└── README.md            # This file
```

## Rate Limits

All tools handle HTTP 429 (rate limiting) automatically by reading the `x-rate-limit-reset` header and waiting. The Twitter API v2 limits for Basic tier:

| Endpoint | Limit |
|----------|-------|
| Search Recent | 60 req/15 min |
| User Tweets | 5 req/15 min |
| Filtered Stream | 1 connection |

## API Tier Requirements

- **mention-check.js**: Works with Basic tier
- **performance.js**: Works with Basic tier
- **stream.js**: Requires Pro tier or higher (Filtered Stream not available on Basic/Free)
