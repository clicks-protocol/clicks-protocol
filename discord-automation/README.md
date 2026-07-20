# Discord Browser Automation

Automated Discord participation on external servers via Playwright browser automation.

## ⚠️ Risk

This uses a real Discord user account via browser automation. This violates Discord ToS.
Account ban is possible. Use a dedicated throwaway account, never David's personal account.

## Architecture

- **Browser Profile:** `openclaw` (managed Playwright profile with persistent login)
- **Account:** Dedicated Clicks Discord user account required. Repo plan was stale as of 2026-07-13. Browser login is still missing in the `openclaw` profile.
- **Method:** Playwright via OpenClaw browser tool (not Discord API)

## Capabilities

### Read
- Monitor channels on joined servers
- Track conversations and threads
- Identify relevant discussions about AI agents, DeFi, yield

### Write
- Post messages in channels
- Reply to conversations
- Share Clicks Protocol info when relevant

### Join
- Accept server invite links
- Navigate to specific channels

## Scripts

### `discord-read.py`
Read recent messages from a Discord channel via browser automation.

### `discord-post.py`
Post a message to a specific Discord channel.

### `discord-monitor.py`
Monitor multiple servers/channels for relevant conversations.

## Safety Rules

1. Never spam — max 2-3 posts per server per day
2. Always add value — answer questions, share insights, don't just shill
3. Match the server culture — read before posting
4. No DMs to strangers — only public channel participation
5. If captcha/2FA appears — stop and report to David
6. Rotate activity patterns — don't post at exactly the same time every day

## Target Servers (to be configured)

- Virtuals Protocol
- Base ecosystem servers
- AI agent development communities
- DeFi protocol servers

## Status

- [x] Architecture designed
- [x] Clicks Discord server live
- [x] Public invite verified (`https://discord.gg/FfmJGUcxfe`)
- [ ] Dedicated Discord user credentials available in browser automation flow
- [ ] Browser login established
- [ ] Read script built
- [ ] Post script built
- [ ] Monitor cron job configured
- [ ] Target servers identified and joined
