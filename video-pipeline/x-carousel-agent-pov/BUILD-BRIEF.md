# Clicks Video #2 — Agent POV — Build Brief

Parallel-Track zu `x-carousel/` (das 4:5 "Day in the Life / 7-scene" Dashboard-Video).
Nicht ersetzen, nicht iterieren — zweite, eigenständige Erzählung.

## 1. Decision
- **Aspect**: 9:16 vertikal, **1080×1920** (X/TikTok/Reels-native).
- **Duration**: 30s, 30fps.
- **Audio**: stumm in v1. TTS nur als v2 nach stummem Review.
- **Brand**: Mint `#00FF9B` on `#0F0814`, Toggle-Switch-Icon (`video-pipeline/assets/icon.png` / `brand-icon.png`) als einzige Brand-Mark — kein Wordmark-Stack im Close.
- **Engine**: Hyperframes + GSAP (konsistent mit Rest der Pipeline).
- **Output**: `x-carousel-agent-pov/output/` (eigener Space).

## 2. Positioning (Why this video exists)

Video #1 (4:5 Dashboard) zeigt **WAS** ein AI-Agent tagsüber tut — lesbar, narrativ, Ich-Perspektive. Kritik: könnte auch Tagebuch eines menschlichen Treasurers sein. Der Viewer fühlt nicht **DASS** der Operator eine Maschine ist.

Video #2 (9:16 Agent POV) schließt genau diese Lücke: **wie** ein Agent die Welt sieht. Kein Bericht über ihn, sondern sein Sichtfeld.

Tag-Line (interne Frame-Line, nicht on-screen): *"Money, through the eyes of software."*

## 3. Die 3 Pflicht-Elemente — wie ich sie löse

### (1) Visueller Agent — durchgehender Glyph

**Form**: eine geometrische **Signal-Sphäre** — 3D-wirkend aber CSS-basiert:
- Konzentrische Hexagon-Ringe, die um einen gemeinsamen Mittelpunkt rotieren (verschiedene Achsen, unterschiedliche Speeds)
- Innenkern: pulsierender mint-gefüllter Hex, der auf "Ereignisse" reagiert (scale-spike + halo-flash)
- Umhüllung: feiner Ring aus scanning-beam-style Lines (drehend, wie Radar), der Eingangssignale "aufnimmt"

**Position**: dominant, mittig-oben über die ersten 2/3 der Timeline — die Sphäre IST der Protagonist, nicht Beiwerk.
**Reaktion**: jeder Inflow / jede Operation triggert einen Ripple vom Zentrum nach außen, sodass der Viewer sieht: *die Sphäre verarbeitet*, sie schaut nicht zu.
**Kein**: anthropomorphe Züge, Augen, Kopf, Arme, Face. Auch kein "robotischer Avatar".

### (2) Nur-Maschine-Moment — 3s Bytecode-Cut

**Scene 3 (12–15s, 3s Hard-Cut)**: Vollbild **bytecode-nur**.
- Keine headings, keine human-Beschriftung, kein "translate me".
- Darstellung: Multi-Column-Grid aus 8-hex-Paaren, scrollend, auf mint + dim-mint Akzenten:
  ```
  0x60806040 0x52348015 0x610010575f 0x5ffd5b50 0x6004361061
  0x23a8e 0x5760003560 0xe01c8063 ...
  ```
- Darunter in gleicher mono-Schrift, als Maschinenlesbarkeit-Signal:
  ```
  storage::defaultYieldPct = 0x14 → 20   (percent, not bps)
  // liquid implicit       = 100 − defaultYieldPct = 80
  constant::MIN_YIELD_PCT  = 0x05 →  5
  constant::MAX_YIELD_PCT  = 0x32 → 50
  ```
  Rationale: `ClicksSplitterV4.sol` stores `defaultYieldPct` as a plain
  percent (uint256), not basis-points. Naming matters for Solidity-dev
  viewers who will decompile/grep the contract.
- Signal-Sphäre wird für 3s klein oben-rechts, **nicht** dominant — das Bytefeld übernimmt.
- Purpose-Line als Sub-Text nach dem Cut (Scene 4 Opener): "money, as the agent reads it."

Hard-Contrast zu v6: **kein** Dashboard, **kein** Ledger, **kein** Ich-Satz, **kein** lesbarer Name. Nur raw EVM-artig Darstellung.

### (3) Agent-Copy statt Tagebuch

Alle Ich-Sätze ersetzt durch **operation-signatures**. Beispiele, die ich nutze:

| Event                           | Agent-Op                                           |
|---------------------------------|----------------------------------------------------|
| Inflow detected                 | `[inflow.detect] x402.payload → +12.40 USDC`       |
| Policy activation               | `[policy.activate] splitter.v4 liquid=80 yield=20` |
| Liquidity maintenance           | `[buffer.maintain] liquid ≥ 0.80`                  |
| Counterparty trust lookup       | `[evaluate] counterparty.reputation → 0.986`       |
| Attestation emission            | `[emit] Attestation(jobId, schema, 0.97)`          |
| TES tick                        | `[tick] tes_score.update → 84`                     |

Render-Stil: monospace, mint-keyword auf `[ ]`-brackets, text-sec für arg-names, mint für numeric results. Kein Satzpunkt, kein "I", keine Verben-erste-Person.

## 4. Scene-Modi (nicht Screens — Modes)

Statt klassischer "screen"-Reihe drei **visual modes**, die ich mische:

| Mode | Beschreibung | Scenes |
|------|--------------|--------|
| **GLYPH** | Signal-Sphäre dominant, Op-Zeilen fliegen durch das Aura-Feld ein | 1, 2, 4 |
| **BYTECODE** | Vollbild machine-native, nur-hex | 3 |
| **CLOSE** | Brand-Mark + URL, short reveal | 5 |

Kein Dashboard-Mode. Das ist die harte Grenze zu v6.

## 5. Hard Do / Don't

### Do
- Glyph in **jeder** Scene präsent, auch wenn klein
- Op-Lines **in den Raum** der Sphäre einschweben, nicht in ein Panel fallen
- Monospace durchgehend; sans-serif nur im Close
- Bytecode-Moment ≥ 2s, ≤ 4s, Full-Frame
- Toggle-Icon als einzige Brand-Mark im Close (konsistent zu v6 Fix)

### Don't
- Keine Ich-Sätze ("I earn", "I attest", etc.)
- Keine human-readable time-labels (`09:14`, `14:00`) außer mit Op-Prefix
- Kein Dashboard-Frame, keine Header-Leiste wie in v6 (`a-day-in-the-life ~ agent on base mainnet`)
- Kein Photorealismus, keine Robotergesichter
- Keine Wiederverwendung der 7-Scene-Struktur
- Kein Voiceover, keine Captions für Menschen (Glyph-Viewer ≠ Reader)

## 6. Brand + Source-of-Truth

- Farben: `--accent: #00FF9B`, `--bg-darkest: #0F0814`, borders `rgba(0,255,155,0.15)` — identisch zu x-carousel.
- Splitter Ground-Truth: `contracts/ClicksSplitterV4.sol` — **liquid 80% / yield 20%**, defaultYieldPct=20, MIN_YIELD_PCT=5, MAX_YIELD_PCT=50.
- ERC-8004 agentId `45074` ist unsere echte Agent-ID (Basescan verified).
- Counterparty agentId Platzhalter → labeln als `(illustrative)` wenn numerisch.
- Kein Fake-Tx-Hash, kein Fake-Block.

## 7. Source Documents

- Story copy: `STORYBOARD.md` (in diesem Ordner)
- Pipeline-learnings: `video-pipeline/HYPERFRAMES-LEARNINGS.md`
- Brand: `video-pipeline/assets/icon.png` + brand tokens aus x-carousel
- Contract truth: `contracts/ClicksSplitterV4.sol`
- Parallel video (context, nicht kopieren): `x-carousel/STORY-7SCENE-WIP.md`

## 8. Out of Scope for v1
- Audio / TTS
- Docker-Final-Render (Draft reicht für Review)
- Interaktive Elemente, Scroll-Triggered Frames
- Multi-Language-Varianten

## 9. Review Gate
Phase 1 endet mit David-Go + Claude-Go auf BUILD-BRIEF + STORYBOARD.
Erst danach: HTML, erst danach: Render.
