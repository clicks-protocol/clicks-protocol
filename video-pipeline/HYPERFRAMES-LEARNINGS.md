# Hyperframes — Consolidated Engineering Reference

Built from reading the full `hyperframes.heygen.com` documentation on 2026-04-21. Source pages cited inline. This is a working reference for authoring Clicks Protocol video templates — not a replacement for the official docs.

---

## 1. Mental Model & Positioning

**Hyperframes is web dev for video.** HTML + CSS + GSAP → deterministic MP4 via Puppeteer + FFmpeg. No React, no JSX, no build step. The philosophy: *"If you can build a web page, you can build a video."*

**Why we picked it over Remotion:**

| Aspect | Hyperframes | Remotion |
|--------|-------------|----------|
| Authoring | HTML + CSS + GSAP (DOM) | React components (TSX) |
| Build | None | Bundler required |
| Animation sync | GSAP seekable & frame-accurate | Wall-clock playback (desync risk) |
| Existing code | Paste arbitrary HTML/CSS | Rewrite as JSX |
| Scaling | Single-machine today | AWS Lambda |
| HDR | Supported (two-pass compositing) | Unsupported |
| License | Apache 2.0, free at scale | Custom commercial, per-render fees |

*Source:* [guides/hyperframes-vs-remotion](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion)

---

## 2. Required Composition Shape

```html
<div
  id="root"
  data-composition-id="main"    <!-- unique, matches window.__timelines key -->
  data-start="0"
  data-duration="8"              <!-- optional on composition root; GSAP wins -->
  data-width="1080"
  data-height="1920"
>
  <!-- clips -->
</div>
<script>
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = gsap.timeline({ paused: true });
</script>
```

**Required per clip** (`<img>`, `<video>`, `<audio>`, nested `<div>`):
- `id` — unique
- `data-start` — seconds, OR relative: `"clipId + 2"` / `"clipId - 1.5"` (no circular refs)
- `data-track-index` — z-order; **clips on same track cannot overlap**
- `class="clip"` — **required on `<img>` and `<div>`**, omit on `<video>` / `<audio>`
- `data-duration` — **mandatory for `<img>`** (no source fallback); optional for `<video>` / `<audio>` (defaults to source length)

**Optional:**
- `data-media-start` — trim offset into source, seconds
- `data-volume` — 0–1 for audio/video
- `data-has-audio` — flag video as audible (else treated silent)
- `data-composition-src` — external HTML file reference for nested composition

*Source:* [concepts/data-attributes](https://hyperframes.heygen.com/concepts/data-attributes), [concepts/compositions](https://hyperframes.heygen.com/concepts/compositions), [reference/html-schema](https://hyperframes.heygen.com/reference/html-schema)

---

## 3. Hard Rules (Things That Break Rendering)

1. **No `Math.random()`, no `Date.now()`, no `setTimeout`/`setInterval` in scripts** — breaks frame determinism.
2. **Never call `video.play()`, `video.pause()`, or set `currentTime`** — the framework owns media lifecycle.
3. **Never animate `width`/`height`/`top`/`left` directly on `<video>`** — wrap in a container and animate the wrapper.
4. **GSAP timelines MUST start with `{ paused: true }`** and be registered on `window.__timelines[compositionId]`.
5. **Videos must be `muted` on the element** — audio is mixed separately.
6. **Timeline key must exactly match `data-composition-id`** — string identity.
7. **GSAP methods allowed:** `.to()`, `.from()`, `.fromTo()`, `.set()` with absolute position third arg. No `.play()`, `.pause()`, no manual sub-timeline nesting.
8. **If the timeline ends before the composition duration,** extend with `tl.set({}, {}, DURATION)` or the video gets cut.

*Source:* [concepts/deterministic-rendering](https://hyperframes.heygen.com/concepts/deterministic-rendering), [guides/gsap-animation](https://hyperframes.heygen.com/guides/gsap-animation), [guides/common-mistakes](https://hyperframes.heygen.com/guides/common-mistakes)

---

## 4. Frame Adapter Contract

For custom animation runtimes (not needed for our GSAP templates, but good to know):

```typescript
type FrameAdapter = {
  id: string;
  init?: (ctx: FrameAdapterContext) => Promise<void> | void;
  getDurationFrames: () => number;
  seekFrame: (frame: number) => Promise<void> | void;  // idempotent, arbitrary access
  destroy?: () => Promise<void> | void;
};
```

Framework clamps `frame` to `[0, durationFrames]` before calling. Must be **seek-driven, not clock-driven** — identical frame inputs must produce identical output. `@hyperframes/core` ships `createGSAPFrameAdapter()` for our use case.

*Source:* [concepts/frame-adapters](https://hyperframes.heygen.com/concepts/frame-adapters), [packages/core](https://hyperframes.heygen.com/packages/core)

---

## 5. CLI Cheat Sheet

| Command | Purpose |
|---------|---------|
| `npx hyperframes init <name> [--example <tpl>]` | Scaffold project (9 built-in examples: Warm Grain, Play Mode, Swiss Grid, Kinetic Type, Decision Tree, Product Promo, NYT Graph, Blank, Vignelli) |
| `npx hyperframes add <slug>` | Install catalog block |
| `npx hyperframes catalog` | Browse registry |
| `npx hyperframes preview` | Live studio at `localhost:3002` with hot-reload |
| `npx hyperframes lint` | Validate schema (run before render!) |
| `npx hyperframes snapshot` | Capture key-frame PNGs |
| `npx hyperframes render -o out.mp4 [flags]` | Render MP4/WebM/MOV |
| `npx hyperframes benchmark` | Auto-tune worker/fps/quality |
| `npx hyperframes doctor` | Env + dependency check |
| `npx hyperframes info` | Project metadata |
| `npx hyperframes capture <url>` | Website → Hyperframes pipeline |
| `npx hyperframes tts "<text>"` | Local Kokoro-82M voiceover |
| `npx hyperframes transcribe <audio>` | Word-level timestamps |
| `npx hyperframes skills add heygen-com/hyperframes` | Install Claude-Code `/hyperframes` skill |

**Render flags worth knowing:**

| Flag | Range | When |
|------|-------|------|
| `--fps` | 24 / 30 / 60 | 30 default; 24 for cinematic, 60 for fast-motion |
| `-q` / `--quality` | draft / standard / high | draft = CRF 28 (dev), standard = CRF 18, high = CRF 15 |
| `--crf` | 0–51 | lower = higher quality; mutually exclusive with `--video-bitrate` |
| `--video-bitrate` | e.g. `10M` | target size; mutually exclusive with `--crf` |
| `-w` / `--workers` | 1–8 or `auto` | default half cores capped at 4; 1 for low-memory; 8 for long clips on many cores |
| `--gpu` | flag | NVENC/VideoToolbox/VAAPI; not available in Docker |
| `--docker` | flag | Deterministic cross-platform render; slower cold-start but fingerprint-stable |
| `--hdr` | flag | BT.2020 + PQ detection; no-op if no HDR source |
| `--strict` | flag | Fail render on lint errors |
| `--strict-all` | flag | Fail on lint errors AND warnings |
| `--format` | mp4 / webm / mov | MOV/WebM preserve alpha |
| `--quiet` | flag | Suppress verbose output |

*Source:* [packages/cli](https://hyperframes.heygen.com/packages/cli), [guides/rendering](https://hyperframes.heygen.com/guides/rendering)

---

## 6. The 6 Packages

| Package | Role | When to touch directly |
|---------|------|-------------------------|
| **`hyperframes`** | CLI | Always |
| **`@hyperframes/core`** | Types, parser, runtime, linter | Programmatic linting in CI, custom tooling, embedding runtime |
| **`@hyperframes/engine`** | Puppeteer BeginFrame + FFmpeg capture | Custom capture pipelines, frame-level hooks, GPU readback, HDR |
| **`@hyperframes/producer`** | End-to-end render job + HTTP server | Programmatic rendering in Node backends, CI, visual regression |
| **`@hyperframes/studio`** | React-based browser editor | Only if embedding an editor in another app |
| **`@hyperframes/player`** | 3KB web component `<hyperframes-player>` | Embedding rendered videos in websites/dashboards |

**`@hyperframes/core` key exports:** `parseHtml`, `generateHyperframesHtml`, `updateElementInHtml`, `validateCompositionHtml`, `parseGsapScript`, `lintHyperframeHtml`, `compileTimingAttrs`, `bundleToSingleHtml`, `createGSAPFrameAdapter`.

**`@hyperframes/producer` HTTP endpoints** (if running the server): `POST /render`, `POST /render/stream`, `POST /lint`, `GET /health`, `GET /outputs/:token`.

*Source:* [packages/core](https://hyperframes.heygen.com/packages/core), [packages/engine](https://hyperframes.heygen.com/packages/engine), [packages/producer](https://hyperframes.heygen.com/packages/producer), [packages/studio](https://hyperframes.heygen.com/packages/studio), [packages/player](https://hyperframes.heygen.com/packages/player)

---

## 7. Catalog Blocks Worth Installing

All: `npx hyperframes add <slug>` → drops a single `.html` into `compositions/<slug>.html`. Customize by editing that file.

### Social Overlays
| Slug | Purpose | For Clicks? |
|------|---------|-------------|
| `x-post` | X engagement metrics overlay | **Use** — show a real @ClicksProtocol tweet as social proof |
| `youtube-lower-third` | YT-style lower third | maybe (later, if we do YT Shorts) |
| `macos-notification` | macOS toast | nice for "your agent earned $X" moments |
| `reddit-post-card` | Reddit-styled card | irrelevant |
| `spotify-now-playing` | Spotify card | irrelevant |
| `tiktok-follow` | TikTok follow CTA | skip |
| `instagram-follow` | IG follow card | skip |

### Data / Showcase / Blocks
| Slug | Purpose | For Clicks? |
|------|---------|-------------|
| `data-chart` | NYT-style animated bar/line chart, 15 s | **Use** — APY over time, tests-over-versions |
| `app-showcase` | 3D phone-screen product demo, 5.5 s | maybe (SDK demo) |
| `flowchart` | Animated decision tree with typed nodes, 12 s | **Use** — 80/20 split explainer |
| `logo-outro` | Cinematic logo assembly + tagline + URL pill, 6 s | **Use** — standard outro for every video |

### Effects
| Slug | Purpose |
|------|---------|
| `grain-overlay` | Film grain (premium feel) |
| `grid-pixelate-wipe` | Pixelate wipe transition |
| `shimmer-sweep` | Specular sweep across a surface |

*Source:* [catalog/blocks/*](https://hyperframes.heygen.com/catalog/blocks) indexed via [mintlify llms.txt](https://hyperframes.mintlify.app/llms.txt)

---

## 8. Transitions

**Two families**: shader-based (GLSL, GPU-accelerated, fixed 4 s each) and CSS showcase blocks (one HTML per category, 15–24 s demoing all variants in the category).

### Shader Transitions (14, all 4 s, install individually)
`chromatic-radial-split`, `cinematic-zoom`, `cross-warp-morph`, `domain-warp-dissolve`, `flash-through-white`, `glitch`, `gravitational-lens`, `light-leak`, `ridged-burn`, `ripple-waves`, `sdf-iris`, `swirl-vortex`, `thermal-distortion`, `whip-pan`

**For Clicks (serious modern DeFi):**
- `flash-through-white` — clean, professional
- `light-leak` — premium atmospheric polish
- `cinematic-zoom` — high-impact reveals
- `sdf-iris` — focused spotlight reveal

Avoid: `glitch`, `whip-pan`, `swirl-vortex` (too frenetic for DeFi).

### CSS Transition Showcases (13 — each is ONE block showing many variants)
Each installs as `npx hyperframes add transitions-<slug>` and is a 15–24 s composition demonstrating the category's variants. To pick a specific variant, install the showcase, play it, extract the CSS animation you want, and port it into your composition.

Slugs: `transitions-3d`, `transitions-blur` (20s), `transitions-cover` (21s), `transitions-destruction`, `transitions-dissolve` (24s), `transitions-distortion`, `transitions-grid`, `transitions-light`, `transitions-mechanical`, `transitions-other`, `transitions-push` (24s), `transitions-radial`, `transitions-scale` (15s)

**For Clicks (modern DeFi):** start with `transitions-dissolve`, `transitions-scale`, `transitions-blur`, `transitions-light`. Avoid `transitions-destruction`, `transitions-3d` (too showy).

*Source:* [mintlify llms.txt](https://hyperframes.mintlify.app/llms.txt), [catalog/blocks/transitions-*](https://hyperframes.mintlify.app/catalog/blocks/)

---

## 9. Prompting Patterns (for `/hyperframes` slash command)

**Cold start:** describe from scratch: duration, aspect, mood, beats. Works but generic.

**Warm start (better):** feed URL/doc/CSV/transcript first — *"Summarize clicksprotocol.xyz into a 30s pitch video."* Produces richer, specific compositions.

**Vocabulary that maps to concrete settings:**

| Intent | Words that trigger |
|--------|-------------------|
| Easing | Smooth / Snappy / Bouncy / Springy / Dreamy |
| Caption tone | Hype (72–96 px heavy), Corporate (56–72 px clean), Tutorial (mono 48–64 px), Social (rounded 56–80 px) |
| Transition intensity | Calm (blur crossfade), Medium (push slide), High (zoom through / glitch) |
| Audio reactivity | Bass → scale pulse, Treble → glow, Mids → shape morph |
| Text effects | Highlight (marker sweep), Circle (hand-drawn ellipse), Burst (radiating), Sketchout (rectangle outline) |

**Iteration beats re-specification.** Small targeted edits (*"make the stat 2× bigger, fade out the chips"*) outperform rewriting the whole prompt.

**Always prefix with `/hyperframes`** to load skill context; without it agents guess HTML conventions and produce broken output.

*Source:* [guides/prompting](https://hyperframes.heygen.com/guides/prompting)

---

## 10. Performance Rules

**What's slow:**
- `backdrop-filter: blur(...)` (8 stacked layers ≈ 200 ms/frame) ⚠️ **our glow stat-card uses `backdrop-filter: blur(30px)` — fine with 1 layer, don't stack**
- `filter: blur()`, `filter: drop-shadow()` on large elements
- Shadows on many animated elements (constant re-rasterization)
- Oversized images (7000×5000 decodes to 140 MB regardless of disk size)

**What's fast:**
1. ≤ 3 blur layers, tuned radii
2. Bake static effects to PNG
3. Size images ≤ 2× canvas (for 1080×1920 → max 3840×2160)
4. Avoid filters on large areas
5. `--quality draft` during dev, switch to `standard`/`high` for final

**Diagnosis:** Chrome DevTools Performance tab during `preview`; identify Composite Layers, Paint, Image Decode, Layout.

*Source:* [guides/performance](https://hyperframes.heygen.com/guides/performance)

---

## 11. Common Mistakes Checklist

1. Animating video dimensions directly → wrap in container
2. Controlling playback in scripts → remove `play()`/`pause()`/`currentTime`
3. Composition duration < video length → extend GSAP timeline with `tl.set({}, {}, DURATION)`
4. Missing `class="clip"` on `<img>`/`<div>` → add it
5. Oversized source images → resize ≤ 2× canvas
6. `backdrop-filter` stacks → cap at 2–3 layers, pre-render static blurs
7. Expected HDR but got SDR → `--hdr` is detection, not force; check source with `ffprobe`
8. Timeline key ≠ composition id → fix the string match

**Apply to our current Clicks templates:**

- `stat-card.html`: `<img class="brand-logo">` is missing `class="clip"` and `data-duration`. Currently works because GSAP animates opacity from the `.brand` parent, not the img itself — but for lint compliance add both.
- `product-explainer.html`: each scene is a `<div class="scene">` but none have `class="clip"` — scenes are visible-toggled by GSAP opacity, not lifecycle-managed by Hyperframes. **Strict lint will flag this.** Options: (a) remove the time-like behavior and stay CSS-only (current); (b) convert scenes to proper clips with `class="clip" data-start data-duration data-track-index`.

*Source:* [guides/common-mistakes](https://hyperframes.heygen.com/guides/common-mistakes)

---

## 12. Troubleshooting Table

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| "No composition found" | missing `data-composition-id` | add to root `<div>` |
| "FFmpeg not found" | not installed | `brew install ffmpeg` or `--docker` |
| Lint errors | schema violation | `npx hyperframes lint` for specifics |
| Preview not updating | cache / wrong file | Cmd+Shift+R, restart server |
| Preview smooth, render janky | expensive CSS (blur, filters) | reduce layers, draft quality |
| Render differs from preview | Chrome/font version variance | `--docker` for determinism |
| Docker fails | daemon down / permissions | `docker info`, start Desktop |
| Slow render | performance | `--workers`, `--gpu`, `--fps 24`, `--quality draft` |

**Diagnostic tools:** `doctor`, `info`, `lint`, `benchmark`.

*Source:* [guides/troubleshooting](https://hyperframes.heygen.com/guides/troubleshooting)

---

## 13. HDR Rendering (for future)

- Enable with `--hdr`; auto-detects, falls back to SDR.
- Sources accepted: MP4 BT.2020 + PQ (smpte2084) or HLG (arib-std-b67); 16-bit PNG BT.2020 PQ.
- Output constraint: **MP4 + H.265 10-bit only**; MOV/WebM silently fall back to SDR.
- Verify:
  ```bash
  ffprobe -v error -show_streams -select_streams v:0 output.mp4 \
    | grep -E 'codec_name|pix_fmt|color_transfer|color_primaries'
  ```
  Expect `hevc`, `yuv420p10le`, `bt2020nc`, `smpte2084`.

*Source:* [guides/hdr-rendering](https://hyperframes.heygen.com/guides/hdr-rendering)

---

## 14. Website → Video Pipeline (for future campaigns)

7-step flow:
1. **Capture** — `npx hyperframes capture <url>` → screenshots/fonts/colors to `captures/<name>/`
2. **Design** — `DESIGN.md` auto-generated
3. **Script** — `SCRIPT.md` (hook / story / proof / CTA)
4. **Storyboard** — `STORYBOARD.md` per beat
5. **VO + Timing** — `tts` + `transcribe` → `narration.wav` + word-level `transcript.json`
6. **Build** — agent writes animated HTML per beat
7. **Validate** — `npx hyperframes snapshot` PNGs

Flags: `--timeout 180000` for heavy sites, `--skip-assets` to bypass asset download, `--max-screenshots 24`. Optional `GEMINI_API_KEY` for image captions (~$0.04/capture).

*Source:* [guides/website-to-video](https://hyperframes.heygen.com/guides/website-to-video)

---

## 15. Action Items for Clicks Templates

Based on this deep-dive, concrete fixes to land in a follow-up commit:

1. **Lint compliance on `stat-card.html`:** add `class="clip" data-duration="8" data-track-index="0"` to `.brand-logo` `<img>`.
2. **Lint compliance on `product-explainer.html`:** either promote scenes to real clips with timing attrs + tracks, or verify `--strict` still passes (probably does since scenes aren't `<video>`/`<img>`).
3. **Add `render.ts --strict` flag passthrough** so CI gates bad templates.
4. **Install `logo-outro` block** and replace the hand-rolled footer in product-explainer with it for consistency across videos.
5. **Install `data-chart`** — next template after stat-card; APY-over-time visual.
6. **Install `flowchart`** — for the 80/20 split explainer.
7. **Install `transitions-dissolve` or `flash-through-white` shader** — use between scenes in product-explainer.
8. **Switch final renders to `--quality high --docker`** for reproducibility once we have Docker Desktop running (currently off).
9. **Add `@hyperframes/player` web-component** to the landing page to embed a live preview of the latest video in-browser.
10. **Rename render worker cap:** our M4 has 10 cores; current auto caps at 4. Consider `-w 6` for 30-s clips to halve render time.

---

## 16. Glossary of Slugs We Care About

```
core blocks       hyperframes init
                  └── 9 examples: warm-grain | play-mode | swiss-grid |
                      kinetic-type | decision-tree | product-promo |
                      nyt-graph | blank | vignelli

social overlays   x-post, youtube-lower-third, macos-notification
data              data-chart
showcase          app-showcase, 3d-ui-reveal
effects           grain-overlay, shimmer-sweep, grid-pixelate-wipe
blocks            flowchart, logo-outro

shader trans.     cinematic-zoom, flash-through-white, light-leak,
                  sdf-iris, ripple-waves, chromatic-radial-split,
                  cross-warp-morph, domain-warp-dissolve, glitch,
                  gravitational-lens, ridged-burn, swirl-vortex,
                  thermal-distortion, whip-pan

css trans.        transitions-3d, transitions-blur, transitions-cover,
(showcase blocks) transitions-destruction, transitions-dissolve,
                  transitions-distortion, transitions-grid,
                  transitions-light, transitions-mechanical,
                  transitions-other, transitions-push,
                  transitions-radial, transitions-scale
```

Install: `npx hyperframes add <slug>` — one HTML per block into `compositions/<slug>.html`.
