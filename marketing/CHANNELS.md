# Clicks Protocol — Channel Access & Limits

## Primary Channels

### X/Twitter (@ClicksProtocol)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Account** | Active, 0 followers | Emma (xurl) | Rate limits: 50 tweets/day, 1000 DMs/day |
| **API Access** | ✅ Full (OAuth 1.0a + 2.0) | Emma (xurl skill) | 1500 requests/15 min window |
| **Posting Rights** | Emma only | Via xurl CLI | 3x daily via Cron (06:00, 13:00, 20:00 CET) |
| **Auto-Reply** | ✅ Ready (autoresponder.js) | Emma (Cron) | Replies to mentions within 4h |
| **Mention Monitoring** | ✅ Ready (mention-alert.js) | Emma (Cron) | Checks every 6h |
| **Stream** | ✅ Ready (stream.js) | Not active | Real-time, high API usage |

### Discord (Clicks Protocol Server)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Server** | Active, 1 member | Emma (Bot) | Unlimited posts |
| **Bot** | ✅ Active (Clicks Protocol#2340) | Emma (Bot token) | 50 messages/second |
| **Channels** | #general, #announcements, #dev | Emma + David | |
| **Announcements** | Emma via Bot | Post-launch only | 1-2 per week max |
| **Auto-Moderation** | Not configured | | |
| **Webhooks** | Not configured | | |

### GitHub (clicks-protocol)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Organization** | Active, public | Emma (PAT) | 5000 requests/hour (Core API) |
| **Main Repo** | clicks-protocol/clicks-protocol | Emma (PAT) | 30 searches/minute (Search API) |
| **Topics** | 12 topics set | | |
| **Issues** | Open for community | Emma + community | |
| **PRs** | Accepting contributions | Emma reviews | |
| **Releases** | v0.1.1 published | Emma publishes | |
| **Pages** | docs.clicksprotocol.xyz | Emma deploys | |

### Website (clicksprotocol.xyz)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Domain** | Cloudflare DNS | Emma (API token) | |
| **Hosting** | Cloudflare Pages | Emma (wrangler) | 100k requests/day free |
| **Discovery Files** | ✅ All 6 deployed | Emma (write) | |
| **Analytics** | Not installed | | |
| **Forms** | Not implemented | | |

### Email (hello@clicksprotocol.xyz)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Routing** | Cloudflare Email Routing | Emma (CF API) | 1000 emails/day free |
| **Destination** | → emma@joptimal.de | Emma receives | |
| **Sending** | ❌ Not configured | Need SMTP | |
| **Newsletter** | Substack (separate) | David manages | |

### Medium (@clicksprotocol)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Account** | Active, 0 followers | David (manual) | 10 posts/month free |
| **API** | ❌ Deprecated | Headless only | |
| **Posting** | David manually | Browser | |
| **Integration** | Not integrated | | |

### Substack (@clicksprotocol)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Account** | Active, 0 subscribers | David (manual) | Unlimited posts |
| **API** | ❌ Private beta | Not available | |
| **Posting** | David manually | Browser | |
| **Newsletter** | Yes, but 0 list | | |

### Reddit (u/clicksprotocol)
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Account** | Created, 1 karma | David (manual) | Rate limited by karma |
| **API** | ❌ CAPTCHA blocked | Not available | |
| **Posting** | David manually | Browser | |
| **Subreddits** | r/ethereum, r/ethdev, r/defi | | 1 post per subreddit per day |

### Hacker News
| Aspect | Status | Access | Limits |
|--------|--------|--------|--------|
| **Account** | Need to create | David (manual) | Rate limited by karma |
| **Posting** | "Show HN" | David manually | 1 post per day max |

## Secondary Channels (Not Active)

### LinkedIn
| Aspect | Status | Decision |
|--------|--------|----------|
| **Account** | Not created | ❌ Not relevant for dev audience |
| **Posting** | N/A | Won't create |

### Instagram
| Aspect | Status | Decision |
|--------|--------|----------|
| **Account** | Not created | ❌ Wrong audience (B2C vs B2Dev) |
| **Posting** | N/A | Won't create |

### TikTok
| Aspect | Status | Decision |
|--------|--------|----------|
| **Account** | Not created | ❌ Wrong format (short video vs tech) |
| **Posting** | N/A | Won't create |

### YouTube
| Aspect | Status | Decision |
|--------|--------|----------|
| **Account** | Not created | 🟡 Maybe later for tutorials |
| **Posting** | N/A | Not now |

## API Rate Limits Summary

| Service | Limit | Window | Used by |
|---------|-------|--------|---------|
| **X API v2** | 1500 requests | 15 min | xurl, autoresponder |
| **GitHub Core** | 5000 requests | 1 hour | PR creation, repo ops |
| **GitHub Search** | 30 requests | 1 minute | awesome-list scanning |
| **Cloudflare Pages** | 100k requests | 1 day | Website traffic |
| **Cloudflare API** | 1200 requests | 5 min | DNS updates |
| **SerpAPI** | 250 searches | 1 month | (akquise, not Clicks) |
| **OpenRouter** | N/A | N/A | (not used) |
| **Anthropic** | MAX20 flat rate | N/A | Main agent (Emma) |
| **DeepSeek** | $5 loaded | Credit | Fallback |
| **Groq** | Free tier | Unknown | Fallback |

## Posting Schedule (To Avoid Rate Limits)

| Time (CET) | Channel | Action | Agent |
|------------|---------|--------|-------|
| 06:00 | X | Scheduled post | Social Media #6 |
| 07:00 | GitHub | PR check | SEO #8 |
| 08:00 | Internal | Morning Briefing | Cron |
| 13:00 | X | Scheduled post | Social Media #6 |
| 15:00 | X | Mention check | Social Media #6 |
| 19:00 | GitHub | Trend scan | Trend #14 |
| 20:00 | X | Scheduled post | Social Media #6 |

**Rule:** Minimum 30 minutes between any API-intensive operations.

## Access Credentials

### Stored in TOOLS.md
- X API keys (OAuth 1.0a + 2.0 + Bearer)
- GitHub PAT
- Cloudflare API token (DNS Edit)
- Cloudflare Pages account ID
- Discord Bot token

### Not Stored (Manual)
- Medium login (David)
- Substack login (David)
- Reddit login (David)
- HN login (David)

## Emergency Contacts

| Channel | If Down | Contact |
|---------|---------|---------|
| X | Suspended | Appeal via support.twitter.com |
| GitHub | Rate limited | Wait 1 hour, use PAT auth |
| Cloudflare | DNS issue | API token + Zone ID |
| Discord | Bot offline | Restart via terminal |
| Domain | Expired | Cloudflare renewal |

## Channel Priority

| Priority | Channel | Why |
|----------|---------|-----|
| 🔴 P0 | X/Twitter | Primary dev community, real-time |
| 🔴 P0 | GitHub | Code credibility, contributions |
| 🟡 P1 | Discord | Community building, support |
| 🟡 P1 | Website | Discovery, documentation |
| 🟢 P2 | Reddit | Technical discussions |
| 🟢 P2 | HN | Early adopter reach |
| 🟢 P2 | Medium/Substack | Long-form content |
| ❌ Skip | LinkedIn/Instagram | Wrong audience |

## Launch Day Channel Sequence
1. X Thread (immediate reach)
2. Discord Announcement (community)
3. Reddit (technical audience)
4. HN (early adopters)
5. Medium/Substack (long-form)
6. GitHub (star campaign)