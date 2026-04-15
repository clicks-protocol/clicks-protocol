# Launch Day Checklist — Sonntag, 30. März 2026

## David's Aufgaben (chronologisch)

### 09:00 — GitHub Repo public machen
- [ ] github.com/clicks-protocol/clicks-protocol → Settings → Danger Zone → Change visibility → Public
- Dauert 5 Sekunden

### 09:05 — Reddit posten
- [ ] r/ethereum: Titel + Body aus `content/reddit/ethereum-post.md`
- [ ] r/ethdev: gleicher Post (ggf. leicht anpassen)
- Account: reddit.com/user/clicksprotocol

### 09:30 — HN posten
- [ ] news.ycombinator.com → Submit
- Titel: "Show HN: Clicks Protocol, an autonomous yield layer for AI agent wallets (TypeScript SDK)"
- URL: clicksprotocol.xyz
- Erster Kommentar: Text aus `content/hn/show-hn.md`

### 10:00 — HN Tech-Kommentar
- [ ] Auf eigenen HN Post antworten mit technischem Detail (zeigt Gründer-Engagement)
- Vorschlag: "Technical detail I should've mentioned: We use a dual-routing system between Morpho and Aave V3. The router checks both APYs on-chain and auto-routes to the higher one."

### 11:00 — Medium Blog
- [ ] clicksprotocol.medium.com → New Story
- Text aus `content/blog/01-introducing-clicks.md`

### 15:30 — Reddit r/defi
- [ ] Gleicher Post wie r/ethereum, leicht angepasst für DeFi-Audience

### 16:00 — Kommentare beantworten
- [ ] Top-Kommentare auf HN und Reddit lesen und antworten

---

## Emma macht automatisch

- 09:45 — X Thread (10 Tweets) via xurl
- 09:50 — Discord Announcement
- 20:00 — X Bot Jobs aktivieren (4 Cron-Jobs)
- 21:00 — Launch Day Report

---

## Voraussetzungen (muss VOR 09:00 stimmen)

- [x] Content fertig (X Thread, Reddit, HN, Blog, Discord)
- [x] Observability Cron läuft
- [x] Dashboard Daemon läuft
- [x] api.clicksprotocol.xyz erreichbar
- [x] mcp.clicksprotocol.xyz erreichbar
- [x] ClawHub Skill v1.0.2 live
- [x] npm SDK 0.1.2 + MCP 0.1.3 published
- [ ] GitHub Repo noch private (wird um 09:00 public)
