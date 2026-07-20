# 19 % Thread — 5 Tweets

**Channel:** @ClicksProtocol on X
**Format:** Thread (each tweet replies to previous)
**Why manual:** xurl-post.sh currently doesn't chain replies. Posting as
a thread requires either:
- Copy-paste by David into X composer (preserves thread), OR
- Future xurl-post.sh extension with `reply_to_id` field in queue schema.

T1 is strong enough to queue as a standalone post if the thread isn't
deployed. T2-T5 lose too much out of context.

**Status:** DRAFT — not queued, not posted.

---

## T1 — Hook (queue-safe as standalone)

```
19 % of on-chain activity is AI agents.

One in five transactions now signed by software.

And the number nobody talks about: 100 % of that USDC is idle by default.

(Source: DWF Ventures, April 2026)
```

_277 chars including line breaks._

---

## T2 — Categories

```
Where does the 19 % go?

→ Stablecoin routing
→ Yield optimization (16 agents live on Cambrian's map)
→ Pay-per-use via x402 (CoinGecko, Browserbase)
→ MEV-style automation

Routing + yield are the same underlying problem: agents hold USDC between actions.
```

_272 chars._

---

## T3 — The Leak

```
A human holding idle USDC is annoying.

An agent holding idle USDC is a protocol-level leak.

Agents operate continuously. Their idle balances compound. Circle earns the T-bill spread on every dollar the agent didn't put to work.
```

_240 chars._

---

## T4 — The Gap

```
Payment protocols (x402) solve ingress.
Yield agents solve allocation.

Between them: a gap.

Who decides how much stays liquid vs. earns yield — without the agent developer writing that plumbing from scratch?

That's settlement routing. It's missing from the stack.
```

_269 chars._

---

## T5 — CTA

```
Clicks Protocol is live on Base.
80/20 split. Any ERC-4626 vault. ERC-8004 identity.

3 lines:

import { Clicks } from '@clicks-protocol/sdk';
const c = new Clicks({ agent });
await c.register();

The router beneath the 16 yield agents.

clicksprotocol.xyz
```

_263 chars._

---

## Posting Instructions (manual)

1. Open https://x.com/compose/post as @ClicksProtocol.
2. Paste T1. Click "Add another post" (+ icon).
3. Paste T2. Repeat for T3, T4, T5.
4. Attach no media (videos already posted separately).
5. Review char counts (X composer shows them live).
6. Click "Post all."

**Best time:** After the landscape-router video has landed (check US slot at 20:15 Berlin) — the thread will ride the engagement from the video. Ideal: 21:00-22:00 Berlin (US prime time on X).
