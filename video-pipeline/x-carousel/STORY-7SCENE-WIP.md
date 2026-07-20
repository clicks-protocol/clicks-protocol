# A Day in the Life of an AI Agent on Base — 7-Scene WIP

Format: 1600×2000 (4:5), 30fps, Hyperframes/GSAP, ~50s total.
Voice: first-person agent POV. Tone: terminal/ledger, mint-on-near-black, settlement-tick motion.
Persistent header (all scenes): `a-day-in-the-life ~ agent on base mainnet` · pagination `0X / 07`.
Persistent footer: 7-segment progress strip, segment N filled in mint.

Positioning anchor (informs scene 3):
- CDP / x402 = payment rails.
- Clicks = what the agent does with capital + trust + efficiency after/between those flows.

───

## Scene 1 — Cover / Thesis  · t = 0–6s

**Eyebrow** (mono, mint, small caps)
`> 06:00 // DAY START`

**Headline** (Inter 700, 96pt)
A day in the life of
**an AI agent.**
*(second line: "an AI agent." in mint accent)*

**Subhead** (Inter 400, 36pt, text-sec)
On Base. Earning, spending, attesting — all on-chain.

**Pillar row** (3 chips, mono, with mint dot)
`EARN`   `STAY LIQUID`   `MEASURE`

**Motion**
- Type-on for headline (40 chars/sec).
- Pillar chips fade in staggered (0.15s).
- Faint grid background, 6% opacity.

───

## Scene 2 — Inflows / I earn  · t = 6–13s

**Eyebrow**
`> 09:00 // INFLOWS`

**Headline**
I **earn** in USDC.

**Subhead**
Every job I close pays into one address. x402 for HTTP. ACP for agent-to-agent.

**Ledger panel** (mono, tabular)
```
TIME   SOURCE                AMT       STATUS
09:14  x402 / api.tools      +12.40    settled
09:31  acp / agent.0xA1…3f   +48.00    settled
09:47  x402 / search.api     + 6.20    settled
10:02  acp / agent.0x7c…b8   +124.50   settled
                              ──────
                              +191.10  USDC today
```

**Right rail badge** (mono, mint border)
`base-mainnet · usdc 6dec`

**Motion**
- Rows tick in one-by-one (0.4s each), counter increments.
- Status `settled` flashes mint on row land.

───

## Scene 3 — Turn on Clicks / I make idle capital productive  · t = 13–20s

**Eyebrow**
`> 11:00 // ROUTING ON`

**Headline**
I turn on **Clicks**.
Idle balance becomes yield.

**Positioning line** (text-sec, italic-feel via tracking)
CDP and x402 are how I get paid.
**Clicks is what I do with the money after.**

**Code block** (mono, mint accents on numbers/keywords)
```
splitter = SplitterV4(0xB7E…f3C8)
splitter.route({
  liquid: 80%,    // withdrawable, pays ops
  yield:  20%,    // → Aave / Morpho
})
```

**Split-vis** (animated horizontal bar, segmented)
`■■■■■■■■░░  80% LIQUID OPS`
`░░░░░░░░■■  20% YIELDROUTER → AAVE/MORPHO`

Ground truth: `contracts/ClicksSplitterV4.sol` defaultYieldPct = 20, MIN 5 / MAX 50.

**Motion**
- Code lines stream in (terminal-style cursor blink).
- Split-bar fills L→R with mint, then settles into 20/80.

───

## Scene 4 — Stay Liquid / I stay liquid  · t = 20–28s

**Eyebrow**
`> 14:00 // OPERATING WINDOW`

**Headline**
I **stay liquid** while I earn.

**Subhead**
Outgoing pays operations. Yield drips into reserves. No bridge, no babysitting.

**Two-column ledger**

LEFT — `OUT · operations` (subtle red tone, settled in red-orange tick)
```
14:02  api.openai            -1.80   settled
14:11  storage.r2            -0.40   settled
14:30  rpc.basescan          -0.10   settled
14:45  api.openai            -2.20   settled
                              ──────
                              -4.50  USDC
```

RIGHT — `IN · yield` (mint tone)
```
14:00  aave.usdc accrual     +0.18   settled
14:00  morpho.usdc accrual   +0.27   settled
14:30  yieldrouter rebalance +0.04   settled
                              ──────
                              +0.49  USDC / 30min
```

**Footer line** (mono, dim)
`net flow tracked on-chain · no bridge · no babysitting`

**Motion**
- Both columns tick down in parallel; mint accrual rows pulse on land.
- Bottom totals snap-update with each new row.

───

## Scene 5 — Trust Check / I verify before I delegate  · t = 28–35s

**Eyebrow**
`> 17:30 // BEFORE I DELEGATE`

**Headline**
I check **trust** before I send work.

**Subhead**
Every counterparty has an on-chain identity, a schema, and signed history.

**Identity card** (mono panel, mint-bordered)
```
counterparty:  agent.0x7c…b8
identity:      ERC-8004 / agentId 28117 (illustrative)
schema:        v1 (job-quality / latency / success)
attestations:  217 signed · 198 positive
last 30 days:  98.6% success · 412ms p50
status:        ✓ TRUSTED
```

**Right side — sparkline**
30-day success-rate sparkline, mint, holding above 95% line.

**Motion**
- Card fields type-on top to bottom.
- Sparkline draws L→R, then ✓ TRUSTED stamps in (mint, slight scale-up).

───

## Scene 6 — Attest / I attest after the job  · t = 35–42s

**Eyebrow**
`> 19:45 // JOB CLOSED`

**Headline**
I **attest** after the job.
Signed. On-chain. Reusable.

**Receipt panel** (mono, dashed border, mint underline on signature)
```
job:          translate-batch-#9182
counterparty: agent.0x7c…b8
delivered:    1,204 strings · 8.2s
quality:      0.97  (ref: schema v1)
verdict:      ✓ accepted
─────────────────────────────────────
attestation:  0x9f3c…4e21
signed by:    agent.0xMe…aa11
block:        17,402,991  ·  base-mainnet
```

**Side note** (text-sec)
The next agent that prices this counterparty inherits my signal.

**Motion**
- Receipt prints line-by-line (fast).
- Final two lines (`attestation` + `signed by`) flash mint, then settle.

───

## Scene 7 — Measure / I measure my stack  · t = 42–49s

**Eyebrow**
`> 20:00 // DAY CLOSE`

**Headline**
I **measure**. The stack is whole.

**Three-row stack**
```
MONEY      SplitterV4 + YieldRouter + ACP/x402     ✓
TRUST      ERC-8004 identity + signed attestations  ✓
BENCHMARK  TES score · trust × earnings × settlement ✓
```

**TES gauge** (full-width bar, mint fill)
`TES SCORE · 24h (illustrative)     ████████████████████░░░░░  84/100`

**Close-CTA**
[ Clicks logo-stacked ]   **Built for AI agents on Base.**
                          *Agent commerce, settled.*
                                                   `→ clicksprotocol.xyz`

**Motion**
- Three rows land top→bottom, each with a mint-tick `✓`.
- TES bar fills L→R from 0 → 84 over 1.2s with ease-out.
- Close-CTA fades up last 1.5s; URL pill glows once.

───

## Production checklist

- [ ] Per-scene proof-frame at `t = (sceneStart + sceneDuration/2)` for visual review.
- [x] Scene 3 split-bar end-state matches actual SplitterV4 config (80 liquid / 20 yield, defaultYieldPct = 20).
- [x] Scene 5 agentId 45074 is our agent — counterparty uses distinct id 28117 labeled `(illustrative)` in-frame.
- [x] Scene 6 attestation hash + block number removed; replaced with abstract "signed on-chain task receipt / written to base-mainnet" copy (no fake-specific data).
- [x] Scene 7 TES 84/100 labeled `(illustrative)` next to "TES SCORE · 24h" header.
- [ ] Final render: `--quality high --docker --crf 15` for deterministic publish master.
