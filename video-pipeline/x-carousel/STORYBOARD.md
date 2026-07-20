# Clicks Protocol — X.com Motion Carousel
## Storyboard (Option A — 8-Panel Motion Carousel im 4:5 Master)

> Source brief: `~/.openclaw/media/inbound/clicks_protocol_x_carousel_design_brief---2a9a1597-f9d4-4c27-aa44-732775940184.md`
> Decision: 4:5 vertikales Motion-Video (1600×2000 Master), 8 Szenen, ~50 s total
> Engine: Hyperframes (HTML + CSS + GSAP), deterministischer Render

---

## 1. Hard Constraints (X.com + Hyperframes)

| Constraint | Wert | Quelle |
|------------|------|--------|
| Aspect Ratio | 4:5 vertical | Brief + X.com video best practice |
| Master Resolution | 1600 × 2000 px | Brief |
| Container in Composition | data-width="1600" data-height="2000" | Hyperframes schema |
| FPS | 30 (final), 24 wirkt cinematischer | Hyperframes default |
| Total duration | ~50 s (8 × 6.25 s avg) | Brief direction |
| Codec / output | H.264 MP4, --quality high (CRF 15) | Hyperframes rendering |
| Worker | -w 6 (M4, 10 cores) | HYPERFRAMES-LEARNINGS §15 |
| Determinism | --docker (final), preview lokal | HYPERFRAMES-LEARNINGS §3 |
| GSAP timeline | `paused: true`, registered on `window.__timelines["main"]` | HYPERFRAMES-LEARNINGS §3 |
| backdrop-filter Stack | ≤ 3 layers | HYPERFRAMES-LEARNINGS §10 |

**X.com video specifics:**
- Native upload, NICHT als GIF
- Sound optional (wir bauen ohne VO; Captions sind on-screen)
- Loop wirkt nicht (X autoplays muted, dann user-tap → audio)

---

## 2. Design System Tokens

### Color Palette (Brief: futuristic / neon / Base-Web3)
```
--bg-deep:     #050814       /* deep navy / near-black */
--bg-mid:      #0A1228       /* mid-navy für depth */
--electric:    #2E7BFF       /* electric blue (Base-near, primary) */
--cyan:        #00E5FF       /* accent cyan */
--cool-white:  #EAF2FF       /* cool white text */
--violet:      #6E5BFF       /* subtle violet accent (sparingly) */
--success:     #00FFB7       /* sparingly für yield/positive states */
--glow-blue:   rgba(46,123,255,0.6)
--glow-cyan:   rgba(0,229,255,0.55)
--glass-bg:    rgba(255,255,255,0.04)
--glass-border:rgba(255,255,255,0.12)
```

### Typography
- Sans: Inter (system fallback `-apple-system, 'SF Pro Display'`)
- **Headline:** 96–120 px, weight 900, letter-spacing -2 px
- **Subtitle:** 56–72 px, weight 700
- **Body / callouts:** 36–44 px, weight 600
- **Code pill:** JetBrains Mono / monospace fallback, 32 px
- **Slide index:** 28 px, weight 600, opacity 0.5
- **Mobile readability rule:** kein Body unter 32 px

### Glass Card
```css
background: var(--glass-bg);
border: 1px solid var(--glass-border);
backdrop-filter: blur(28px);
border-radius: 36px;
box-shadow:
  0 0 80px rgba(46,123,255,0.18),
  inset 0 1px 0 rgba(255,255,255,0.15);
```

### Aurora Background (jede Szene)
```css
background:
  radial-gradient(circle at 25% 25%, rgba(46,123,255,0.30) 0%, transparent 38%),
  radial-gradient(circle at 75% 75%, rgba(0,229,255,0.22) 0%, transparent 42%),
  radial-gradient(circle at 50% 50%, rgba(110,91,255,0.12) 0%, transparent 60%);
filter: blur(40px);
```
+ subtle 1px grid overlay (opacity 0.06) für „dashboard" feel.

### Persistent Brand Strip
- Top-Left: Clicks logo (32 px) + "CLICKS" wordmark (36 px, letter-spacing 8)
- Top-Right: Slide index "N/8" (28 px, opacity 0.5)
- Bottom: thin progress line (8 segments, current = electric, rest = 12% white)

### Hero AI Agent (visual spec)
- **Wir nutzen KEIN echtes Character-Render** in V1 (zu zeit-/kostenintensiv für POC).
- Statt dessen: **abstrakte Agent-Repräsentation** — leuchtender Hex-Orb mit pulsierendem Halo, der across alle Slides als Anker fungiert.
- Begründung: produziert konsistent, on-brand, mobile-lesbar, kein Copyright-Risiko, kein Uncanny-Valley.
- Position: meist links unten oder als floating focus point.
- Asset: `assets/agent-orb.svg` (wird gebaut, nicht gerendert per AI).
- **Falls David explizit eine humanoide Figur will:** spawnen wir nano-banana-pro für ein konsistentes 4:5 Hero-Asset (8 Posen) und droppen es in die Szenen.

---

## 3. Szenen-Plan

| # | Name | Dauer | Headline | Hauptelement | Übergang nach |
|---|------|-------|----------|--------------|---------------|
| 1 | Cover | 6.0 s | Clicks Protocol | Logo + Tagline + Mini-Flow | flash-through-white |
| 2 | Problem | 6.0 s | I Get Paid in USDC | Wallet + idle USDC stack | dissolve |
| 3 | Activation | 7.0 s | I Turn On Clicks | Code pill → split flow | scale-up |
| 4 | Liquidity | 6.0 s | I Stay Ready to Spend | 80/20 visualisierung | dissolve |
| 5 | Trust | 6.5 s | Before I Delegate | Reputation scan card | light-leak |
| 6 | Attestation | 6.0 s | After the Job, I Attest | Signed receipt → registry | dissolve |
| 7 | TES | 7.0 s | I Measure TES | Gauge 18.4 + score bands | flash-through-white |
| 8 | Summary | 6.5 s | My Agent Stack | 3-Layer-Stack + closing | logo-outro |

**Total active:** 51 s + 6 short transitions ≈ 53 s. Ziel ≤ 60 s.

---

## 4. Szene-Details

### Szene 1 — Cover (0.0 – 6.0 s)
**Layout (top → bottom):**
- Brand strip (CLICKS top-left, 1/8 top-right)
- 240 px gap
- Headline „Clicks Protocol" (120 px, 900, electric → cyan gradient text)
- Subtitle „A Day in the Life of an AI Agent" (56 px, 600, cool-white)
- 80 px gap
- Tagline pill „Earn. Trust. Measure." (44 px, glass capsule, electric border)
- 100 px gap
- Mini-Flow Row: 3 Glass-Chips horizontal
  - „1. Earn yield" / „2. Check trust" / „3. Benchmark efficiency"
- Hero Orb floating mid-right (300 px, pulsating halo)
- Bottom: "Treasury layer + on-chain reputation + TES benchmark on Base" (32 px, opacity 0.7)
- Progress line (segment 1 = electric)

**Motion timing (GSAP):**
- 0.0–0.4 s: Aurora-BG fade in (opacity 0 → 1)
- 0.3–0.8 s: Headline mask-reveal (clip-path inset top→bottom)
- 0.5–0.9 s: Subtitle fade up (y: +30, opacity 0→1)
- 0.8–1.2 s: Tagline pill scale-in (0.92→1, opacity 0→1)
- 1.0–1.6 s: Mini-flow chips stagger in (0.12 s offset)
- 1.4–6.0 s: Hero-Orb continuous pulse (scale 1↔1.04, halo opacity 0.6↔1.0, 2 s loop)
- 5.7–6.0 s: Hold + transition prep

**VO/Caption-Text on screen:** alle headline/subtitle/tagline/chip-Texts (siehe Brief).

---

### Szene 2 — Problem (6.0 – 12.0 s)
**Layout:**
- Brand strip (2/8)
- Headline „I Get Paid in USDC" (96 px) + small `1.` index ahead
- Subtitle „My problem: idle capital" (52 px, cyan)
- Center: stylized Wallet card (640 × 720 px glass) with:
  - 3 incoming USDC payment streams (animated dots flowing into wallet from top)
  - Inside: split visualization
    - Top half: "ACTIVE" chip + 2 small payment icons (electric)
    - Bottom half: "IDLE" chip + greyed-out USDC stack (opacity 0.4) with „0% APY" label
- Bottom callout band (electric border): „Without a treasury layer, idle USDC just sits there"
- Hero-Orb top-right, observing

**Motion:**
- 0.0–0.5 s: Headline+subtitle reveal (mask + fade)
- 0.4–1.5 s: 3 payment streams flow in (dot trails, ease-out)
- 1.5–2.5 s: Wallet card splits into ACTIVE / IDLE (border pulse)
- 2.5–3.5 s: IDLE pile slowly desaturates + 0% APY label appears
- 3.5–5.5 s: Subtle pulse on IDLE pile (problem emphasis)
- 5.0–6.0 s: Callout band slide-up + glow

---

### Szene 3 — Activation (12.0 – 19.0 s)
**Layout:**
- Brand strip (3/8)
- Headline „I Turn On Clicks" (96 px) with `2.` index
- Subtitle „One SDK call. Yield starts." (52 px)
- Center: Code pill (rounded glass, monospace)
  ```
  await clicks.quickStart('100', agentAddress)
  ```
- Below code: split-flow diagram
  - Single arrow IN (labeled „Payment in" 100 USDC)
  - Branches into:
    - 80% → liquid wallet card (electric, big)
    - 20% → yield vault card (cyan, smaller, with subtle rotating ring)
- Right column 3 benefit chips stacked: „No lockup" / „Withdraw anytime" / „Fee only on yield"
- Bottom footer: „Auto-routed to Aave V3 or Morpho" (with tiny logos / wordmarks)

**Motion:**
- 0.0–0.6 s: Headline reveal
- 0.5–1.2 s: Code pill type-in (cursor blink, char-by-char)
- 1.2–2.0 s: Arrow IN draws (stroke-dashoffset)
- 1.8–2.6 s: Split into 80/20 branches (parallel reveal)
- 2.6–3.6 s: Liquid + yield cards scale-in
- 3.0–7.0 s: Yield vault ring rotates continuously
- 3.6–4.8 s: Benefit chips stagger
- 4.5–5.0 s: Aave/Morpho footer appears

---

### Szene 4 — Liquidity (19.0 – 25.0 s)
**Layout:**
- Brand strip (4/8)
- Headline „I Stay Ready to Spend" (96 px) with `3.`
- Subtitle „80% stays liquid for real agent work"
- Two parallel columns:
  - LEFT „WORK": agent fires off rapid USDC payments (animated outgoing arrows, x402 chip)
  - RIGHT „EARN": yield vault rotating ring + APY counter ticking up (0.00 → 4.27%)
- Bottom: 4 small chips „Same chain: Base" / „Same asset: USDC" / „Useful for x402" / „20% earning bg"
- Bottom callout: „Liquidity now. Yield in parallel."

**Motion:**
- Continuous parallel motion both columns (work pulses left, yield rotates right)
- 0.0–0.5 s: Reveal
- 0.5–6.0 s: Both columns active simultaneously, callout pulses at end

---

### Szene 5 — Trust (25.0 – 31.5 s)
**Layout:**
- Brand strip (5/8)
- Headline „Before I Delegate, I Check Trust" (88 px) with `4.`
- Subtitle „Reputation lookup via ERC-8004"
- Center: „Reputation Passport" glass card (700 × 1000)
  - Header: Avatar circle + „agentId: 45074" + Base chip
  - Score ring: 0.87 (large, electric → cyan stroke)
  - Tag pills: „route" / „x402" / „treasury" / „mid-tier"
  - 3 mini feedback bars (recent attestations)
  - „Last update: 2h ago" footer
- Hero-Orb bottom-left, „scanning" with cyan beam crossing the card
- Callout: „Trust before payment or delegation"

**Motion:**
- 0.0–0.5 s: Card reveal (clip-path circle from agent orb)
- 0.5–1.8 s: Scan beam sweeps top-to-bottom (cyan line, 8 px, glow)
- 1.5–2.5 s: Score ring fills (stroke-dashoffset → 0.87 fraction)
- 2.0–3.5 s: Tag pills stagger
- 3.0–4.5 s: Mini bars draw
- 4.5–6.5 s: Callout reveal + soft pulse

---

### Szene 6 — Attestation (31.5 – 37.5 s)
**Layout:**
- Brand strip (6/8)
- Headline „After the Job, I Attest" (96 px) with `5.`
- Subtitle „I write a signed on-chain task receipt"
- Center: Signed feedback card (640 × 920) with structured fields:
  ```
  value         : 0.9200
  valueDecimals : 4
  tag1          : route
  tag2          : x402
  ```
- Each field appears row-by-row, then a „SIGNED ✓" seal stamps onto the card
- Below card: arrow → „Reputation Registry" (small glass module, Base chip)
- Footer: „Example: route + x402"
- Callout: „One feedback entry per endpoint per 24h"

**Motion:**
- 0.0–0.5 s: Card reveal
- 0.5–2.5 s: Field rows stagger in (mono type-in feel)
- 2.5–3.2 s: SIGNED seal scales in + glow burst
- 3.2–4.0 s: Arrow draws to registry
- 4.0–5.0 s: Registry chip pulses (data accepted)
- 5.0–6.0 s: Callout fade

---

### Szene 7 — TES (37.5 – 44.5 s)
**Layout:**
- Brand strip (7/8)
- Headline „I Measure TES" (96 px) with `6.`
- Subtitle „Treasury Efficiency Score"
- Formula ribbon (top-center, mono):
  `TES = (yield earned / idle-capable USDC) × 100`
- Center-LEFT: large gauge (radial, 0–40 range), needle animates 0 → 18.4
- Center-RIGHT: score-band chips column:
  - 0 IDLE
  - 5–15 MID
  - **15–30 HIGH** ← active glow
  - 30+ ELITE
- Below gauge: stat row
  - „Yield: 2,760 USDC"
  - „Idle-capable: 15,000 USDC"
  - „Deployed: 62%" / „Idle: 38%"
- Callout: „A neutral on-chain benchmark for agent USDC utilisation"

**Motion:**
- 0.0–0.6 s: Headline + formula reveal
- 0.5–2.5 s: Gauge needle sweeps 0 → 18.4 (eased)
- 2.0–2.8 s: HIGH chip activates (glow burst, others dim)
- 2.5–4.0 s: Stat row staggers
- 4.0–5.5 s: Deployed/Idle ratio bar fills
- 5.5–7.0 s: Callout reveal + hold

---

### Szene 8 — Summary (44.5 – 51.0 s)
**Layout:**
- Brand strip (8/8)
- Headline „My Agent Stack" (96 px) with `7.`
- Subtitle „Clicks in one sentence"
- Center: 3-Layer Stack (vertical, isometric-like depth)
  - **TOP — Benchmark Layer** → „TES" (cyan)
  - **MID — Trust Layer** → „ERC-8004 Reputation" (electric)
  - **BASE — Money Layer** → „Clicks Protocol" (electric+glow)
- Hero-Orb hovering above stack (ascended position)
- Closing line center-bottom: „Earn yield. Check trust. Benchmark efficiency."
- Footer: „Built for AI agents on Base" + tiny Base chip + clicksprotocol.xyz pill

**Motion:**
- 0.0–0.5 s: Headline reveal
- 0.5–1.0 s: Money Layer slides in from below
- 0.9–1.4 s: Trust Layer stacks on top
- 1.3–1.8 s: Benchmark Layer crowns
- 1.8–2.4 s: Hero-Orb rises above stack with halo expand
- 2.4–3.4 s: Closing line type-in
- 3.4–6.5 s: Final hold, footer fade-in, gentle ambient glow loop

---

## 5. Asset-Liste (zu erstellen)

| Asset | Wo | Format | Status |
|-------|-----|--------|--------|
| `agent-orb.svg` | x-carousel/assets/ | SVG (CSS-animatable) | TODO |
| `usdc-icon.svg` | x-carousel/assets/ | SVG | TODO (oder CDN) |
| `base-chip.svg` | x-carousel/assets/ | SVG mit „Base" wordmark | TODO |
| `aave-mark.svg` | x-carousel/assets/ | SVG | TODO |
| `morpho-mark.svg` | x-carousel/assets/ | SVG | TODO |
| `clicks-logo.svg` | reuse aus video-pipeline/assets/logo.svg | SVG | DONE |
| `payment-stream-dot.svg` | inline CSS möglich | — | optional |
| `signed-seal.svg` | inline SVG | — | TODO |

---

## 6. File-Struktur

```
video-pipeline/
└── x-carousel/
    ├── STORYBOARD.md                ← diese Datei
    ├── compositions/
    │   └── x-carousel.html          ← Master composition (alle 8 Szenen)
    ├── assets/
    │   ├── agent-orb.svg
    │   ├── usdc-icon.svg
    │   ├── base-chip.svg
    │   └── …
    ├── snapshots/                   ← npx hyperframes snapshot output
    └── output/
        └── clicks-x-carousel-v1.mp4
```

**Composition strategy:** *eine* HTML-Datei mit *einer* Composition (`data-composition-id="main"`), in der alle 8 Szenen als sequentielle Tracks liegen (track-index 0–7, kein Overlap).
Alternative später: 8 separate sub-compositions via `data-composition-src` für Modularität — overkill für V1.

---

## 7. Render-Plan

**Dev-Loop:**
```bash
cd video-pipeline/x-carousel
npx hyperframes preview        # localhost:3002, hot-reload
npx hyperframes lint           # vor jedem Render
npx hyperframes snapshot       # PNG keyframes für jede Szene
```

**POC-Render (Szene 1 only, fast):**
```bash
npx hyperframes render -o output/poc-scene1.mp4 \
  --fps 30 --quality draft -w 6
```

**Final-Render:**
```bash
npx hyperframes render -o output/clicks-x-carousel-v1.mp4 \
  --fps 30 --quality high -w 6 --strict
# wenn Docker Desktop läuft, zusätzlich --docker
```

---

## 8. Status

- [x] Brief gelesen
- [x] Hyperframes-Doku + Learnings-File abgeglichen
- [x] Storyboard final
- [ ] Composition skeleton + Design-System CSS
- [ ] Szene 1 POC + Render → Review-Schleife mit David
- [ ] Szenen 2-8
- [ ] Übergänge
- [ ] Final Render

---
*Author: Emma · Erstellt: 2026-04-23 · Version: 1.0*
