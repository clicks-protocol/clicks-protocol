# Clicks Video #2 — Agent POV — Storyboard

Master: 1080×1920 (9:16), 30fps, **30.0s**, GSAP-driven.
Brand: Mint `#00FF9B` / BG `#0F0814` / Toggle-Icon close-mark.

**Three modes, five scenes, one continuous sphere.**

---

## 0. Global / Persistent

- **Signal-Sphäre** läuft im Hintergrund-Layer (z-index 1) durchgehend in Scenes 1, 2, 4, 5. In Scene 3 auf 80×80 top-right geparkt, entkoppelt.
- **Op-Stream-Lane**: ein schmaler vertikaler Raum (z-index 3), in den Operation-Lines reinfliegen und wieder ausblenden — kein Panel, keine Box.
- **Kein** Dashboard-Header, **kein** Progress-Strip.
- Footer während 0–28s: winzig unten, `0x8004a169…a432 · base` — nur Wasserzeichen, kein Fokus-Element.

---

## Scene 1 — Boot / Presence · t = 0.0–5.0s · MODE: GLYPH

**Purpose**: Etabliert dass etwas Nicht-Menschliches gerade online geht.

**Visual**:
- BG near-black.
- Sphäre startet als einzelner mint Pixel-Punkt mittig (y ≈ 900 von 1920).
- Expansion über 1.8s: Punkt → Hexagon-Ring (r=120) → Zweit-Ring (r=240, 60° rotated) → Dritt-Ring (r=360, scanning-beam style).
- Inneres Hex füllt bei 2.2s mint-solid, single halo-ripple emittiert nach außen.
- Text-Event unter der Sphäre bei 2.8s, monospace-small, fades in:
  ```
  [boot] agent.0x…45074 · base-mainnet
  [ready] splitter.v4 · yieldrouter.v1 · erc8004.schema-v1
  ```

**Motion**:
- 0.0–1.8s: sphere build-up, stagger rings (0.3s offset), jedes neu erscheinende Ring-Layer triggert feinen halo-flash
- 2.2s: core-fill flash
- 2.8–4.6s: text-lines type-on (30 char/s)
- 4.6–5.0s: hold + transition prep (alle Elemente bleiben stehen, kein fade)

**Contrast zu v6**: v6 Scene 1 zeigt menschenlesbares "A day in the life of an AI agent" mit Pillars. Hier kein Headline, kein Pillars — nur boot-artefakte und sphere-presence. Ein menschliches Tagebuch würde niemals `[boot]`-events als Cover zeigen.

---

## Scene 2 — Inflow Perception · t = 5.0–12.0s · MODE: GLYPH

**Purpose**: Der Agent "sieht" Geld reinkommen. Nicht als Tabelle — als Signal.

**Visual**:
- Sphäre bleibt mittig, jetzt pulsierend mit 1.8s-Loop (scale 1.0 ↔ 1.04).
- Aus den vier Ecken des Frames gleiten feine mint-Linien **zum Sphären-Zentrum** (trajectories, 3px thick, trailing).
- Jedes Mal wenn eine Linie trifft: 
  - halo-ripple aus der Sphäre (outward, 0.6s)
  - Op-Line erscheint rechts neben der Sphäre (oder im Fall von wenig Platz: gestaffelt unter), lebt 2.5s, dann fade

**Agent-Copy (Op-Lines, type-in right of sphere)**:
```
[inflow.detect] x402.payload   +12.40 USDC
[inflow.detect] acp.channel    +48.00 USDC
[inflow.detect] x402.payload    +6.20 USDC
[inflow.detect] acp.channel   +124.50 USDC
[aggregate]      Σ(5m) = 191.10 USDC
```

**Motion**:
- 5.0–11.0s: 4 trajectory-hits, stagger 1.5s, jede triggert ripple + op-line
- 11.0–11.8s: aggregate-line fades in last (mint bold)
- 11.8–12.0s: alle op-lines dimmen auf 40% opacity, vorbereitung für Hard-Cut

**Contrast zu v6**: v6 Scene 2 zeigt strukturiertes `WALLET LEDGER` mit `TIME | SOURCE | AMT | STATUS` Spalten. Hier: Agent sieht Inflows als *Signale mit Vektor*, nicht als Zeilen in einer Tabelle. Keine column-headers, keine Ich-Perspektive.

---

## Scene 3 — Machine-Only Cut · t = 12.0–15.0s · MODE: BYTECODE

**Purpose**: Der Pflicht-"Nur-Maschine-Moment". 3.0s voll maschinenlesbar. Hard-Contrast als atemnimmender Cut.

**Visual**:
- Hard-cut (0.1s flash-to-black, dann BYTECODE state).
- Sphäre: geschrumpft auf 80×80, top-right corner, still, opacity 0.4. **Nicht mehr Protagonist**.
- Volles restliches Frame: 3-Column-Grid aus raw-bytes, monospace 22px, mint + dim-mint tones.
- Content (tatsächlich aus Splitter-Storage-Slots motiviert, nicht fabriziert):
  ```
  ── splitter.v4 ── storage snapshot ───────────────
  slot:0x00  0x000…a169fb4a  // admin
  slot:0x01  0x000…28…00f3c8 // treasury
  slot:0x02  0x000000000000  // reentrancy guard
  storage::defaultYieldPct  = 0x14 → 20 (percent)
  // liquid implicit = 100 − defaultYieldPct = 80
  constant::MIN_YIELD_PCT    = 0x05 →  5
  constant::MAX_YIELD_PCT    = 0x32 → 50
  ── ───────────────────────────────────────────────
  calldata: 0xa9059cbb 0x000…7c…b8 0x000…0000…c350
            └─ transfer(address,uint256) → 50,000 USDC (6dec)
  ```
- Seitliche Spalte: scrollende `0x60806040 0x52348015 …`-Paare, scrolling bottom-to-top, continuous.
- **Kein** Ich-Text, **kein** Dashboard-Chrome, **kein** menschliches Vokabular.

**Motion**:
- 12.0–12.1s: flash-to-black, hard cut
- 12.1–12.6s: storage-slots typen in (one-by-one, 80ms/line)
- 12.6–14.8s: bytecode-stream läuft links scrolling, storage-slots bleiben stehen
- 14.8–15.0s: subtle zoom-in auf liquidBps + yieldBps rows (scale 1.08), preparing reveal

**Contrast zu v6**: das ist die Szene, die in v6 strukturell **nicht existieren kann**. Ein menschenlesbares Tagebuch zeigt nie Storage-Slots. Kritischste Beweis-Szene.

---

## Scene 4 — Policy + Trust Evaluation · t = 15.0–25.0s · MODE: GLYPH

**Purpose**: Der Agent entscheidet. Showing policy-activation und trust-lookup als Ops, nicht als Dashboard-Karten.

**Visual**:
- Hard-cut zurück zur GLYPH-Mode. Sphäre scaled up wieder auf vollgröße mittig.
- Orbit-Ring um die Sphäre beginnt zu rotieren sichtbar (2s/rotation, mint scan-beam Akzent).
- Op-Lines fliegen ein, diesmal **in konzentrischen Orbits** um die Sphäre (nicht linear stacked). Jede Op-Line "dockt" an und strahlt ein halo-Ring aus.

**Agent-Copy (staggered)**:
```
[policy.activate]   splitter.v4(liquid=80, yield=20)
[buffer.maintain]   liquid ≥ 0.80  ·  ok
[evaluate]          counterparty.reputation(0x7c…b8) → 0.986
[evaluate]          attestations.count(30d) → 217 signed · 198 positive
[guard.pass]        threshold(0.95) · result=TRUE
[emit]              Attestation(jobId=#9182, schema=v1, quality=0.97)
```

**Motion**:
- 15.0–15.3s: hard-cut reverse, sphere scale-in from 0.6 → 1.0
- 15.3–23.0s: 6 Op-Lines staggered (1.25s intervals), jede docks, halo-ripple, persist at 60% opacity nach dock, then dim to 25%
- 23.0–24.5s: alle 6 ops pulse simultaneously einmal (sync-hit, "the agent has processed")
- 24.5–25.0s: sphere core-flash brightens (preparing close)

**Contrast zu v6**: v6 splittet Policy (Scene 3), Liquidity (Scene 4), Trust (Scene 5), Attest (Scene 6) über ~22s mit eigenen Dashboard-Panels. Hier alles in einer kontinuierlichen 10s-Sequenz, als Ops-Stream um die Sphäre, keine Panels.

---

## Scene 5 — Close · t = 25.0–30.0s · MODE: CLOSE

**Purpose**: Brand-Landing. Sphäre → Logo. Menschenlesbarer Übergang in Close.

**Visual**:
- Sphäre kollabiert über 1.0s ins Zentrum: alle Ringe schrumpfen rein, core wird zu solidem Mint-Blob.
- Blob morphed zum Toggle-Switch-Icon (brand-icon.png, 220×220, mittig, mint-glow).
- Nach Icon-Settle: Text fadet unter dem Icon auf:
  - Line 1 (font-sans 44px): **Built for AI agents on Base.**
  - Line 2 (font-sans 32px, mint): *Agent commerce, settled.*
  - Pill unter Text (mono 24px): `→ clicksprotocol.xyz`

**Motion**:
- 25.0–26.0s: sphere-collapse (rings scale to 0, core remains)
- 26.0–26.5s: blob-morph to icon shape
- 26.5–27.5s: icon settle + mint-glow breath-in
- 27.5–29.0s: text + url pill fade-up stagger
- 29.0–30.0s: hold, end

**Contrast zu v6**: v6-Close zeigt TES-Stack + TES-Score-Bar + CTA zusammen (3 elements, busy). Hier: einzelne zentrale Brand-Mark, aus der Sphäre geboren — die Sphäre *wird* zum Logo. Zeigt visuell: die Agent-Aktivität IST das Produkt.

---

## Timing Summary

| Scene | Mode      | Start | Dur  | Ende |
|-------|-----------|-------|------|------|
| 1     | GLYPH     | 0.0s  | 5.0s | 5.0s |
| 2     | GLYPH     | 5.0s  | 7.0s | 12.0s|
| 3     | BYTECODE  | 12.0s | 3.0s | 15.0s|
| 4     | GLYPH     | 15.0s |10.0s | 25.0s|
| 5     | CLOSE     | 25.0s | 5.0s | 30.0s|

---

## Asset-Liste

| Asset | Quelle | Format | Status |
|-------|--------|--------|--------|
| `brand-icon.png` | copy aus `../assets/icon.png` | PNG 600×600 | TODO |
| `sphere-ring.svg` (optional, inline CSS ok) | inline | — | optional |
| Monospace font-stack | system (`JetBrains Mono`, fallback `SF Mono`, `Menlo`) | — | DONE |

---

## Production-Checklist (Skelett — Phase 1 legt nur Struktur an)

- [ ] Scene 1 boot-text: agentId 45074 verifiziert gegen `scripts/verify-erc8004-abi.ts`.
- [ ] Scene 2 Inflow-Summen konsistent mit v6 (+12.40 / +48.00 / +6.20 / +124.50 = 191.10). Placeholders sind OK, aber innerhalb v6 ↔ v2 spiegelgleich.
- [ ] Scene 3 storage-slots: `defaultYieldPct = 0x14 → 20 (percent)` match `ClicksSplitterV4.sol` exakt. Label muss "defaultYieldPct" lauten, nicht "yieldBps" (Solidity-dev audience). `liquid` als implicit `100 − defaultYieldPct` darstellen, kein separater liquidBps-Slot. MIN=0x05, MAX=0x32 verifiziert als constants.
- [ ] Scene 3 calldata-Beispiel: `transfer(address,uint256)` selector `0xa9059cbb` korrekt (ERC-20 standard, nicht fabriziert).
- [ ] Scene 4 reputation score 0.986 markiert als illustrative ODER durch echten getSummary-Call gefüttert.
- [ ] Scene 4 counterparty 0x7c…b8 ist derselbe Placeholder wie v6 (Konsistenz).
- [ ] Scene 5 URL: `clicksprotocol.xyz` exakt (kein `.fyi`, kein `.io`).
- [ ] Hyperframes lint clean.
- [ ] Draft-Render (--quality draft -w 6) fertig.
- [ ] Proof-Frame aus MP4 extrahiert für Scene 3 (Bytecode-Moment Beweis).
- [ ] Proof-Frame für Scene 1 Sphere-Boot.
- [ ] David + Claude Go auf dieser STORYBOARD.md **vor** HTML-Schreiben.

---

*Author: Emma · Erstellt: 2026-04-24 · Version: 1.0 (pre-review)*
