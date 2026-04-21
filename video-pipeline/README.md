# video-pipeline — Clicks MP4 Generator

Lokales Tooling, das HTML-Templates in MP4-Videos für die X-Pipeline (und später Farcaster / dev.to) rendert. Basiert auf [HeyGen Hyperframes](https://github.com/heygen-com/hyperframes) (Apache 2.0, HTML+GSAP → Puppeteer+FFmpeg).

**Rule #7 Reminder:** Dieses Verzeichnis ist rein auf der **Advisor-Seite**. Rendering läuft manuell oder per `/hyperframes`-Slash-Command. Das fertige MP4 wird vor dem Queueing in `media/renders/` abgelegt. `x-pipeline/xurl-post.sh` ist der EINZIGE Poster (launchd → xurl), dieses Tool postet niemals.

## Setup

```bash
cd video-pipeline
npm install
```

Installiert `hyperframes` + `tsx` lokal. `npx hyperframes doctor` prüft FFmpeg/Chromium.

## Templates

```
templates/
  stat-card.html       # 9:16, 8 s, große Zahl + Label + Sub (brand-grün)
```

Jedes Template ist eine eigenständige Hyperframes-Composition:
- `<div id="root" data-composition-id="main" data-duration="<sec>" data-width="1080" data-height="1920">`
- GSAP-Timeline auf `window.__timelines["main"]` (paused, wird von Hyperframes gescrubbed)
- Platzhalter mit `data-slot="key"`; `render.ts` ersetzt den Inner-Text per Regex

Neue Templates einfach als `.html` in `templates/` ablegen — keine Registrierung nötig.

## Render

```bash
cd video-pipeline
npx tsx render.ts stat-card '{"stat":"227","label":"tests passing","subtext":"V4 + V5 suite"}'
```

Schritte:
1. Liest `templates/stat-card.html`
2. Ersetzt alle `data-slot="..."`-Inhalte aus dem JSON
3. Schreibt als `./index.html` (active composition für Hyperframes)
4. Ruft `npx hyperframes render . -o ../media/renders/<slug>.mp4`
5. Loggt Eintrag in `render-log.json`
6. Gibt Queue-Entry-Snippet für Copy-Paste zurück

**Output:** `media/renders/<template>-<date>-<hash>.mp4` (1080×1920, 30fps, H.264, `~300KB` für 8 s)

## Queue-Integration

Füge den vom Render-Output vorgeschlagenen Entry in `x-pipeline/queue.json` ein:

```json
{
  "text": "227 tests green. V4 on mainnet, V5 prototype. Built for x402.",
  "media_path": "media/renders/stat-card-2026-04-21-eb02b8.mp4"
}
```

`xurl-post.sh` erkennt `media_path`, ruft `xurl media upload`, und postet mit `--media-id`. Legacy-Entries ohne `media_path` posten weiter als reiner Text (backwards compatible).

## Preview lokal

```bash
npx hyperframes preview
```

Öffnet einen Live-Browser-Preview auf `localhost:5173`. Ideal zum Template-Tuning vor Render.

## Troubleshooting

- **Font-Fallback:** iOS-System-Fonts rendern auf headless Chrome evtl. anders. Falls Branding abweicht, `@font-face` mit lokaler `.woff2` in `assets/` einbinden.
- **404s im Render-Log:** Harmlos wenn Video trotzdem erscheint — meist fehlende optionale Assets (favicon o.ä.).
- **Memory warning vom doctor:** Laptop mit <1 GB free kann parallele Workers drosseln. `-w 2` setzen um auf 2 Chrome-Prozesse zu begrenzen.

## Out-of-Scope (Option B/C)

Siehe [strategy/LOCALIZATION-AND-AGENT-GROWTH-SPRINT.md] für Graduation-Signale. Kurz:
- **Option B** (LLM slot-filling + render-actor via launchd) — revisit nach 5-10 geposteten Videos
- **Option C** (TTS + Multi-Channel-Fanout YT/LinkedIn) — erst wenn einer der Channels strategisch wird
