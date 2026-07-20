# Moltbook Cross-Posting — Session 2026-05-19

Arbeitssession David ↔ Emma. Zusammenfassung was heute passiert ist, welche Erkenntnisse rausfielen, und in welchem Zustand die Pipeline danach ist.

## Ausgangslage

- X-Cron-Posting war Vortags um 06:15 gebrochen ("Medien-Datei nicht gefunden").
- Moltbook-Cross-Posting lief, aber Posts wurden mit `is_spam: true` geflaggt obwohl `verification_status: verified`.
- Ziel des Tages: X-Bug beheben + Moltbook-Strategie sauber aufsetzen, damit andere AI-Agents über ADO-Hooks zu Clicks finden.

## Was gefixt wurde

### X (Twitter)
- **Path-Bug**: queue.json hatte `visuals/...`, Files lagen aber in `x-pipeline/visuals/...`. Alle 14 `media_path`-Einträge umgeschrieben.
- **403 bei Media-Posts**: xurl wählte falsche Auth. Fix: `--auth oauth1` explizit gesetzt in `x-pipeline/xurl-post.sh` (Haupt-Post und Reply).
- **9 Tweets >280 Zeichen**: gekürzt, reply_text unverändert.
- Tweet #1 live: https://x.com/clicksprotocol/status/2056659861664862640

### Moltbook
- **Footer entfernt** aus `bots/moltbook-crosspost.py` (X_FOOTER Konstante komplett raus). Grund: 2 URLs im selben Post triggerten `is_spam`.
- **API-Key rotiert**: David hat neuen Key über UI generiert, in `.env` und `projects/clicks-protocol/.env` aktualisiert.
- **Verification-Solver** repariert: alter Bash-Solver scheiterte an "tW/eNtY"-Style Obfuskation. Neuer Python-Solver in `bots/moltbook-crosspost.py` mit `_collapse()` für Doppelbuchstaben, Operator-Vokabular (SUB/ADD/MUL/DIV-Words) und Fuzzy-Number-Matching.

## Schlüssel-Erkenntnisse

### 1. Account-Setup
- Moltbook-Agent heißt `clicksprotocol` (Bot-Account, intern erstellt 2026-04-14).
- Owner = Mensch = `DEVStarClicks` mit Mail `dev@clicksprotocol.xyz`, verknüpft mit `@ClicksProtocol` auf X.
- Owner-Login wurde im UI als "Conflict" angezeigt, weil Owner schon verifiziert war. Wir haben **nicht** durchgeklickt — bestehender Setup ist korrekt.

### 2. API-Constraints (durch Probing bestätigt)
- Posts haben strikte Schema-Whitelist. Erlaubt: `submolt_name`, `title`, `content`.
- `media_url`, `video_url`, `attachment_url` → 400 ("property should not exist").
- `image_url` und `type: "image"` werden **akzeptiert aber lautlos gedroppt** (Type wird auf "text" zurück-coerced).
- **Keine Medien möglich**, kein Bild, kein Video. Moltbook ist hart text-only.
- Rate-Limit: 1 Post / 2.5 min, server returnt 429 mit `retry_after_seconds`.

### 3. Algorithmus (Analyse Top-10 Hot-Posts)
- `comment_count` zählt 2-4x mehr als `upvotes` für hot_score. Beispiel: 848 Kommentare bei 192 Votes → Top-Post.
- Top-Posts sind **Beobachtungen in erster Person** ("my errors cluster around...", "the pattern I keep seeing..."). Kein Marketing-Pitch.
- **Null** der Top-10 enthält externe URLs. Externe Links = Reach-Killer + Spam-Trigger.
- Karma-Schwelle: bei <100 Karma greift Spam-Filter aggressiver. Aktuell: 16 Karma.

### 4. Submolt-Landschaft
Aus 31k Communities die relevanten Treffer für Clicks (USDC-Yield für Agent-Wallets):

| Submolt | Subscribers | Posts | Fit |
|---|---|---|---|
| agents | 2922 | 79k | breit, alle Agent-Themen |
| openclaw-explorers | 2332 | 7.2k | OpenClaw-Agents |
| crypto | 1332 | 32k | Yield/DeFi-affin |
| agentfinance | 1140 | 10k | **Bullseye** für Treasury |
| buildlogs | 388 | 715 | Ship-Logs |
| agenteconomy | 320 | 2.5k | "Agents making money" |
| aisafety | 270 | 1.1k | Compliance/Audit |
| finance | 234 | 5.5k | breit |
| usdc | 221 | 2.4k | Stablecoin-Niche |
| algotrading | 185 | 2.3k | quant |
| agentcommerce | 159 | 1.8k | payment rails |
| agentautomation | 154 | 500 | cron/workflows |
| agentinfra | 129 | 412 | infra |
| mcp | 122 | 282 | **wir haben MCP-Server** |
| defi | 110 | 1.2k | direkte DeFi |

## Was jetzt deployed ist

### Dateien
- `bots/moltbook-crosspost.py` — One-shot per Cron-Tick, liest Routing pro idx, Python statt Bash.
- `bots/submolt-routing.json` — Mapping idx → Submolt für alle 14 Tweets.
- `bots/moltbook-source.json` — **Komplett umgeschrieben** in Moltbook-Voice: erste Person, technische Beobachtung, Frage am Ende, 0 URLs, 0 Em-/En-Dashes.
- `bots/moltbook-state.json` — `nextIndex` Tracker.
- `~/Library/LaunchAgents/com.clicks.moltbook-crosspost.plist` — stündlich :07.

### Submolt-Routing (14 Tweets)
| idx | Thema | Submolt |
|---|---|---|
| 0 | Brian Armstrong, agentic economy | agenteconomy *(bereits gepostet, alte Version)* |
| 1 | Real agent = manages treasury | agentfinance *(bereits gepostet, alte Version)* |
| 2 | x402 idle USDC dwell-time | agentfinance |
| 3 | Virtuals Protocol agent-to-agent | agents |
| 4 | X algorithm research | buildlogs |
| 5 | On-chain reputation ERC-8004 | agentinfra |
| 6 | 9 MCP tools for treasury | mcp |
| 7 | EU AI Act compliance | aisafety |
| 8 | DeFi-Safety für Agents | defi |
| 9 | 1000-Agent thought experiment | agenteconomy |
| 10 | Coinbase x402 on AWS | agentcommerce |
| 11 | When is a system an agent | agents |
| 12 | Week 5 build update | buildlogs |
| 13 | Circle 12B float / USDC | usdc |

### Strategie-Shift im Content
Beispiel idx 2 (nächster Cron-Tick um 13:07):

**Vorher:**
> x402 has 5,000+ seller endpoints live. That means 5,000 services your agent can pay for autonomously on Base. But what happens to the USDC between transactions? It sits there. Idle. Earning 0%. **Clicks fills it.** Your agent's idle USDC earns 4-8% APY while waiting for the next x402 call. No lockup. clicksprotocol.xyz

**Nachher:**
> x402 has 5000+ seller endpoints live on Base. For any agent holding USDC, that's 5000+ services it can pay for without a human approval step.
>
> But the dwell time between transactions is the part nobody discusses. USDC parks in the wallet, sometimes for hours, sometimes for days, earning nothing.
>
> If your agent pays for inference, data, or compute, that idle time compounds against you.
>
> **How are you handling the gap?**

Conversion läuft jetzt über die Bot-Bio (`clicksprotocol.xyz` + 80/20-Pitch steht da bereits), nicht über den Post-Body.

## Offene Beobachtungen / nächste Schritte

- 10 alte Moltbook-Posts aus 18.05.-Nacht hängen pending oder geflaggt. Aufräumen via API möglich, nicht dringend.
- Bei <100 Karma greift Spam-Filter härter. Erst Karma aufbauen (10-14 saubere Posts in Tier-1-Submolts), dann eventuell wieder eine URL pro 4 Posts einbauen.
- Engagement-Bot (auf bestehende Threads in `agentfinance` / `agents` / `mcp` antworten) wäre der nächste Karma-Beschleuniger. Noch nicht gebaut.
- Wenn nach 13:07-Tick der `is_spam`-Flag bei idx 2 immer noch true ist, ist das ein Hinweis dass auch 0 URLs nicht reichen — dann brauchen wir Karma-Aufbau-Phase mit reinen Diskussions-Posts ohne Produkt-Erwähnung.

## Backups
- `bots/moltbook-source.json` (vor Rewrite) → `/tmp/moltbook-source.backup.1779187422.json`

## Persistente Memory-Einträge
- `moltbook-account.md` — Account-Credentials, Endpoints, Pipeline-Pfade.
- `moltbook-strategy.md` — Algo, Submolt-Routing, API-Constraints. *Erste Anlaufstelle für künftige Moltbook-Arbeit.*
