# Localization & Agent-Growth — 2-Wochen-Pilot (Stand 2026-04-19)

## Context

Nach Deep-Research zum x402-Ökosystem (75 M Transaktionen, $600 M Volumen bis Nov 2025, 94 k Buyer / 22 k Seller laut Coinbase Dev Docs) und zur Virtuals-Protocol-Agentenökonomie (aGDP $477 M, 15.8 k AI-Projekte, Hong-Kong-Launch Feb 2026, BNB + XLayer Q2 2026) ist der geografische Schwerpunkt klar: **USA-dominiert mit stark wachsender Asien-Achse** — Chinesisch deckt BNB/XLayer/HK ab, Koreanisch und Japanisch öffnen die restlichen zwei großen Asien-Developer-Corridor.

Der Sprint soll dreierlei liefern, gebündelt in zwei Wochen:

1. **Sprach-Erweiterung:** `/ko/` + `/ja/` Landing-Routen + README-KR.md + README-JA.md (CN bereits vorhanden)
2. **1 Pillar-Blogpost** (EN canonical → CN/KR/JP-Übersetzungen → Dev.to + Farcaster + X)
3. **Agent-Growth-Mechanik:** Bounty-Programm ($50-200/Integration) + sichtbare Referral-Promotion

Keine Übersetzung der Docs (`/docs/*`, `strategy/*.md`) — zu teuer für Pilot. Kann nach Sprint-Retro nachgezogen werden.

---

## Scope

### In-Scope
1. **i18n-Infrastruktur in landing-v3** — Next.js `[lang]` Segment, `/ko`, `/ja` als getrennte Routen, `/` bleibt EN, `/cn` wird neu angelegt (bisher nur README-CN, keine CN-Landing-Version)
2. **Lokalisierte Landing-Inhalte:** Hero, Stats-Trust-Signals, How-it-Works, ERC-8004-Section, Works-With, Footer — pro Sprache. Alles andere (Calculator, Developers-Code-Snippets) bleibt Englisch (Code ist Sprache-agnostisch).
3. **README-KR.md + README-JA.md** nach Muster von README-CN.md
4. **`BOUNTIES.md`** im Repo-Root plus öffentliche Bounty-Page unter `/bounties`
5. **Landing-Page `/earn`** (neu) — Referral-Mechanik erklärt, UTM-tracked
6. **Pillar-Blogpost:** Titel "Treasury Efficiency in the Agent Economy" (~1800 Wörter), canonical auf clicksprotocol.xyz, cross-posted auf Dev.to, Medium, plus Übersetzungen
7. **Distribution:** X-Thread + Farcaster-Cast + Dev.to-Post pro Sprache (4 × 3 = 12 Posts)

### Explicit Out-of-Scope
- Docs-Übersetzungen (`/docs/*`, `strategy/*.md`) → Phase 2 nach Sprint-Retro
- Vietnamesisch, Portugiesisch, Spanisch, Französisch, Deutsch → kein klarer Agent-Signal
- Video-Content (YouTube/Bilibili/Nico) → eigener Sprint, nicht Bundle
- Automatische Locale-Detection per IP oder Browser-Language → statische Switcher-Dropdown reicht
- Menschliche Native-Reviewer für Übersetzungen vor Launch → Launch mit LLM-Übersetzung + „Contributions welcome"-Disclaimer, Native-Reviewer werden via Bounty-Programm nachgezogen
- Smart-Contract-Änderungen am Referral-System → nur Marketing, On-Chain existiert es schon

---

## Kanal-Matrix (Ziel-Zielgruppe × Sprache × Kanal)

| Zielgruppe | Sprache | Primär-Kanal | Sekundär | Warum |
|-----------|---------|--------------|----------|-------|
| US / Global Agent Devs | EN | X (`@ClicksProtocol`), Farcaster, Dev.to | Medium, Reddit, HackerNews | Größte Reichweite, crypto-native |
| China / HK / BNB | CN | Binance Square, Weibo, Bilibili | X (via VPN crowd), WeChat Public Accounts | BNB+XLayer-Launch Q2 2026 |
| Korea | KR | X (strong KR crypto community), Kakao OpenChat, Naver Blog | Velog (dev-blog) | Retail + Token-Culture, rising dev scene |
| Japan | JP | X (JP crypto twitter), Zenn.dev (dev), note.com | Qiita | Enterprise-Devs, x402 B2B-Angle |

**Kanäle mit Credentials in `.env`:** DEVTO_API_KEY, X_BEARER_TOKEN, WARPCAST_API_KEY.
**Kanäle ohne API-Access (manuell):** Binance Square, Weibo, Bilibili, Velog, Zenn.dev, note.com, Qiita, WeChat, Kakao.

---

## Critical Files to Create / Modify

### Neue Files
- `landing-v3/app/[lang]/` — i18n-Struktur (alternativ: `landing-v3/app/ko/`, `app/ja/`, `app/cn/` als getrennte statische Routen — einfacher für static export)
- `landing-v3/components/lang-switcher.tsx` — Dropdown in Navbar/Footer
- `landing-v3/lib/i18n.ts` — kleine Helper für Locale-Strings (kein volles i18next nötig für Pilot)
- `landing-v3/content/i18n/{en,cn,ko,ja}.ts` — Locale-Strings per Sprache
- `landing-v3/app/earn/page.tsx` — Referral-Erklärung (EN + lokalisierte Varianten unter `/{lang}/earn`)
- `landing-v3/app/bounties/page.tsx` — Bounty-Programm (EN + lokalisiert)
- `README-KR.md`, `README-JA.md` — nach Muster `README-CN.md`
- `BOUNTIES.md` im Repo-Root — Tasks + Payout + Submission-Prozess
- `content/pillar-agent-treasury-efficiency.md` — Pillar-Blogpost, EN canonical
- `content/pillar-agent-treasury-efficiency.cn.md`, `.ko.md`, `.ja.md` — Übersetzungen
- `marketing/drafts/pillar-launch/` — Threads + Casts + Dev.to-Posts pro Sprache (12 Stück)

### Modifiziert
- `landing-v3/app/layout.tsx` — Root-Metadata-Template muss `alternates.languages` unterstützen
- `landing-v3/components/navbar.tsx` — Lang-Switcher einfügen
- `landing-v3/components/footer.tsx` — Lang-Switcher als Fallback
- `landing-v3/public/sitemap.xml` — alle Locale-Routen ergänzen
- `landing-v3/public/robots.txt` — Sitemap-Verweis (bleibt wie ist, nur sicherstellen dass alle Locales im Sitemap sind)
- `README.md`, `README-CN.md` — Language-Switcher-Header um KR+JP ergänzen

### Kein Anfassen
- Smart-Contracts
- `/docs/*` Inhalte
- `strategy/*.md` Docs (Bleiben EN, sind interne Strategie-Docs)
- Calculator, Developers-Section (Code-Blöcke bleiben EN)

---

## Approach — Tag-für-Tag (10 Arbeitstage)

### Woche 1 — Infrastruktur + Lokalisierung

**Tag 1 (Mo):**
- Branch `feat/i18n-foundation`
- i18n-Struktur in `landing-v3/app/[lang]/` oder Parallel-Verzeichnisse (Entscheidung: **Parallel-Verzeichnisse**, da static export + Next.js dynamic routes im static mode tricky)
- `lib/i18n.ts` mit Locale-Type + Fallback-Logic
- `content/i18n/en.ts` als Master-Datei mit allen UI-Strings (Hero, Stats-Labels, How-It-Works-Steps, Footer)
- Erste lokalisierte Komponente: Hero nutzt `i18n.hero.headline` etc.

**Tag 2 (Di):**
- `content/i18n/cn.ts` füllen (CN) — Basis: README-CN + Existing Landing-EN
- `content/i18n/ko.ts` füllen (KR) — LLM-Übersetzung + Review-Prompt in Native-Reviewer-Bounty
- `content/i18n/ja.ts` füllen (JP) — gleich
- Trust-Signal-Labels, Works-With-Liste, Footer-Subscribe alles i18n-fähig
- `components/lang-switcher.tsx` — simples Dropdown, 4 Flaggen/Labels, Link zu `/`, `/cn`, `/ko`, `/ja`

**Tag 3 (Mi):**
- `landing-v3/app/cn/`, `/ko/`, `/ja/` Routen anlegen — klonen `app/page.tsx` mit passenden Imports, nutzen i18n-Strings
- Gleich für `/cn/about`, `/ko/about` etc. (was lokalisiert wird)
- `layout.tsx` — `alternates.languages` Metadata: `en`, `zh-CN`, `ko`, `ja` mit je canonical+hreflang
- `sitemap.xml` erweitern
- Landing build + Lokal-Test

**Tag 4 (Do):**
- `README-KR.md` + `README-JA.md` — 1-zu-1-Port von README.md (EN), LLM-Übersetzung, Review durch sich selbst + Pass auf Native-Native-Bounty
- Header-Language-Switcher in README.md und README-CN.md ergänzen: `English · 中文 · 한국어 · 日本語`
- Lang-Switcher im Navbar linkt zu richtiger Sprache
- Branch PR-ready → push → merge falls keine Show-Stopper

**Tag 5 (Fr):**
- Branch `feat/bounties-and-earn`
- `BOUNTIES.md` im Repo-Root (siehe Template unten)
- `app/bounties/page.tsx` (EN) + `{lang}/bounties` (CN, KR, JP)
- `app/earn/page.tsx` (EN) + lokalisierte Varianten — Referral-Mechanik visualisiert: Agent A → Agent B → Agent C mit 40/20/10 % Flow
- UTM-Parameter für Bounty-Page (`?utm_source=x&utm_medium=thread&utm_campaign=pilot-sprint-w2`)
- Pillar-Blogpost in EN schreiben: `content/pillar-agent-treasury-efficiency.md` — 1800 Wörter, Thesen/Zahlen/Citations (Circle Annual Report, DeFi Llama, x402 Coinbase Dev Docs)

### Woche 2 — Content-Produktion + Distribution

**Tag 6 (Mo):**
- Pillar-Blog EN polish + Code-Blöcke + Call-to-Action am Ende (Bounty + Referral)
- Cross-Post auf Dev.to EN via `scripts/publish-devto.ts` (haben wir schon)
- Parallel: CN-Übersetzung des Pillars schreiben (Basis CN-README-Stil)

**Tag 7 (Di):**
- KR-Übersetzung + JP-Übersetzung des Pillars
- Dev.to Cross-Post pro Sprache (Dev.to unterstützt non-EN tags — `#korean` `#japanese` `#chinese` + Content-Language-Meta)
- Medium-Copy in EN (Medium hat kein Language-Meta, nur EN-Post)
- Alle 4 Blogposts verifizieren (Rich-Results, kein Markup-Bruch)

**Tag 8 (Mi):**
- X-Thread pro Sprache schreiben (4 × 7 Tweets) — Draft in `marketing/drafts/pillar-launch/x-{lang}.md`
- Farcaster-Cast pro Sprache (4 × 1 Cast + 3-Tweet-Reply-Thread als Follow-up)
- Post-Plan: EN first (Mi 14 Uhr UTC), CN 30 Min später, KR Do 1 Uhr UTC (KR Primetime), JP Do 22 Uhr UTC
- X-Posts via `X_BEARER_TOKEN` API (wir haben Tooling dafür), Farcaster via `WARPCAST_API_KEY`

**Tag 9 (Do):**
- Live-Posting + Monitoring
- Reddit-Posts (r/ethfinance, r/base, r/defi, r/AIAgents) — nur EN, manuelle Posts
- Binance Square CN-Post (manuell, erfordert Account)
- Velog KR-Post manuell (erfordert Naver Account)
- Zenn.dev JP-Post manuell (erfordert Zenn-Account)

**Tag 10 (Fr):**
- Metric-Sammlung: X Impressions, Dev.to Views, Farcaster Engagements, Bounty-Submissions, Referral-Link-Clicks
- Sprint-Retro schreiben: `strategy/LOCALIZATION-SPRINT-RETRO-2026-05-03.md`
- Go/No-Go-Entscheidung: Weiter mit Phase 2 (Docs-Übersetzung, mehr Languages) oder Stop?

---

## BOUNTIES.md Template

```markdown
# Clicks Protocol Bounties

Earn USDC for integrating Clicks, translating docs, or shipping demo agents.

## How to claim

1. Pick a task below
2. Comment on the linked GitHub Issue to claim ("working on this")
3. Submit PR / link — the Clicks team reviews within 72h
4. On approval, USDC lands in your Base wallet within 24h
5. Referral track: use `clicks.quickStart(amount, agentAddress, YOUR_ADDRESS)` so every downstream onboarding flows fees to you

## Current bounties

| # | Task | Payout (USDC) | Status |
|---|------|---------------|--------|
| B1 | Integrate Clicks SDK into a working AgentKit agent (MCP or CDP example) | 150 | open |
| B2 | Integrate Clicks into an ElizaOS character (plugin live on npm) | 100 | open |
| B3 | Integrate Clicks into a CrewAI agent with demo README | 75 | open |
| B4 | Integrate Clicks into a LangChain ChatModel agent | 75 | open |
| B5 | Integrate Clicks into a Virtuals ACP agent (buyer or seller) | 150 | open |
| B6 | Record a 60-90s video demo showing 1 SDK call → yield active | 200 | open |
| B7 | Native-Korean review + polish of README-KR.md and /ko/ landing | 100 | open |
| B8 | Native-Japanese review + polish of README-JA.md and /ja/ landing | 100 | open |
| B9 | Native-Mandarin review + polish of README-CN.md and /cn/ landing | 100 | open |
| B10 | Translate pillar blogpost to one additional language (Vietnamese, Portuguese, Spanish) | 100 | open |
| B11 | Pitch + post Clicks integration on r/{defi, aiagents, ethfinance, base} — must reach 20+ upvotes | 50 | open |
| B12 | Build a Dashboard Mini-App on Farcaster that shows Clicks TVL + APY | 200 | open |

Total starting pool: ~$1.5k USDC in Safe (operator distributes per submission)

Rules
- Work must be MIT/Apache-licensed and publicly visible
- One claim at a time per contributor
- Payment in USDC on Base — we'll need your address
- Fake integrations (no real Clicks contract calls) forfeit the bounty
- Referral attribution is additive — you earn the bounty **and** any downstream referral fees
```

---

## Pillar-Blogpost — Outline

**Titel (EN):** "Treasury Efficiency in the Agent Economy"
**Länge:** ~1800 Wörter
**Kern-These:** Circle capture USDC interest, but there's a bigger inefficiency: **agent operators leave 90 %+ of their capital idle** between payments. The Treasury Efficiency Score (TES) measures this. Here's how to fix it in one SDK call.

### Struktur

1. **Problem-Framing (~300 Wörter):** Agent operators hold USDC for x402 / ACP / MCP payments. Between txns, funds sit idle. Circle earns the reserve interest. Real numbers: Coinbase Dev Docs report 75 M x402 transactions with 94 k unique buyers (Nov 2025); Virtuals aGDP $477 M. Even conservative estimates put agent-held idle USDC in the 100s of millions.

2. **Die Metrik TES (~300 Wörter):** TES = yield-earned / idle-capable-USDC × 100. Tier-Bands IDLE / LOW / MID / HIGH / ELITE. Link auf `github.com/clicks-protocol/treasury-benchmark` (jetzt live).

3. **Warum der Status quo schlecht ist (~400 Wörter):** Circle 2023: $1.7 B Revenue aus USDC Reserven. Tether: $6.2 B. Das ist Float-Value die User + Agents erzeugen aber nicht sehen. Mit den Agent-Volumina die x402 jetzt dreht (75 M Txns) wäre der Hebel für Agent-Betreiber substanziell — aber nur wenn sie aktiv agieren.

4. **One-SDK-Call-Lösung (~300 Wörter):** Code-Beispiel `clicks.quickStart()`. 80/20 Default. Keine Lockup, keine Verwaltung. 2 % Fee auf Yield only, never principal. Screenshot oder Asciinema Terminal-Capture.

5. **Der Agent-Commerce-Graph (~300 Wörter):** Referral-Mechanik als on-chain attribution — wer andere Agents onboarded, verdient anteilig. 40/20/10 %. Live on-chain seit V2. Mit Zahlen-Beispiel: $10 k × 7 % APY × 10 Agents in Tree = $56 passive/year. Nicht Reichtum, aber Compound-able.

6. **Bounty-Call + ERC-8004-Identity-Proof (~200 Wörter):** Link auf /bounties. agentId 45074 als Beweis dass Clicks selbst auf-chain registriert ist und die Infra durchmisst.

### Quellen (in Text mit Fußnoten)

- [x402 whitepaper](https://www.x402.org/x402-whitepaper.pdf) — offizielle Protocol-Spec
- [Coinbase Developer Platform — x402 docs](https://docs.cdp.coinbase.com/x402) — 75 M Transactions Zahl
- [Virtuals Protocol aGDP](https://app.virtuals.io) — $477 M
- [DeFi Llama Aave Base USDC](https://defillama.com/protocol/aave) — APY live
- [Morpho Base Dashboard](https://app.morpho.org/base) — APY live
- [Circle Financial 2023 Annual](https://www.circle.com/financial-disclosures) — $1.7 B revenue
- [Tether Q3 2023 Attestation](https://tether.to/en/transparency) — $6.2 B profit
- [BaseScan — Clicks agentId 45074](https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074)
- Internes: TES-Repo, Schema V1, eigene Dev.to-Serie

---

## Verification / Success Criteria

### Technisch
- [ ] `/ko`, `/ja`, `/cn` Routen auf clicksprotocol.xyz liefern 200
- [ ] `<html lang="ko">` / `"ja"` / `"zh-CN"` im jeweiligen HTML (kein EN-fallback)
- [ ] `alternates.languages` im `<head>` — Rich-Results-Test grün
- [ ] `sitemap.xml` enthält alle 4 Locale-Roots
- [ ] README-KR.md, README-JA.md existieren + renderieren in GitHub ohne Formatting-Fehler
- [ ] Language-Switcher in Navbar funktioniert auf Mobile + Desktop
- [ ] BOUNTIES.md im Repo-Root, Link in Homepage + README

### Content
- [ ] Pillar-Blog in 4 Sprachen auf Dev.to live, jeweils canonical → clicksprotocol.xyz
- [ ] X-Thread in 4 Sprachen gepostet (@ClicksProtocol + KR/JP-spezifische Posts, ggf. Retweet von localisierten Community-Accounts)
- [ ] Farcaster-Cast in 4 Sprachen
- [ ] /earn-Page mit UTM-tracked Referral-Links

### Growth (Leading Indicators — keine Garantie, aber die Metrics)
- [ ] ≥ 3 Bounty-Submissions innerhalb Woche 2
- [ ] ≥ 50 Clicks-Referral-Link-Clicks (UTM-tracked) pro Sprache
- [ ] ≥ 1 KR-native Reviewer meldet sich auf B7
- [ ] ≥ 1 JP-native Reviewer meldet sich auf B8
- [ ] X-Threads erreichen kumulativ ≥ 25 k Impressions
- [ ] Dev.to Posts erreichen kumulativ ≥ 5 k Views
- [ ] Farcaster-Casts erreichen kumulativ ≥ 500 Engagements

### Fail-Criteria (Sprint-Stop)
- [ ] Keine Bounty-Submissions nach 2 Wochen → Bounty-Design überdenken
- [ ] < 1 k X-Impressions kumuliert → Kanal-Fit falsch, anderes Format probieren
- [ ] Feedback „Maschinen-Übersetzung schlecht" in 2+ Comments → Native-Reviewer priorisieren, alte Übersetzung ersetzen

---

## Budget & Resources

### Budget
- **Bounty-Pool:** $1.5 k USDC initial (in Safe gehalten, Operator-Wallet dispatcht)
  - B1-B5 (5 × Integrationen): $550
  - B6 (Video): $200
  - B7-B9 (3 × Native-Review): $300
  - B10 (Extra-Sprache): $100
  - B11 (Reddit-Posts, ~3-5 erfolgreich): $150-250
  - B12 (Farcaster-Mini-App): $200
- **Translation-LLM-Calls:** negligible ($1-5 in Tokens für 4 Sprachen × 1800 Wörter)
- **X Ads / Boosts:** bewusst kein Budget (organic-first); falls später relevant, zusätzlich

### Keine Extra-Costs
- `@clicksprotocol` X-Account existiert
- Farcaster-Account existiert, Mini App bereits gebaut
- Dev.to, Medium, Substack-Accounts existieren
- Cloudflare Pages, npm, PyPI alle operational

### Zeit
- **Tag 1-5:** ~4-6 h/Tag — Infrastruktur + Translation + Copy
- **Tag 6-10:** ~3-4 h/Tag — Content + Distribution + Monitoring
- **Gesamt:** ~45-55 h Operator-Zeit

---

## Out-of-Scope Follow-ups (nach Sprint-Retro)

- **Docs-Localization** (`/docs/*` in 4 Sprachen) — eigener Sprint, ~50-80 h
- **Video-Content** (YouTube/Bilibili/Nico) — Dedizierter Video-Sprint
- **Spanisch/Portugiesisch** — LatAm hat USDC-Adoption aber keinen Agent-Pull (noch)
- **Native-Community-Manager** für CN/KR/JP — falls Pilot-Signale gut, pro Sprache jemanden finden
- **Conference-Präsenz:** Consensus HK, Devcon, ETHSeoul, Tokyo Web3 Week — Sprint-Retro entscheidet
- **Long-Tail SEO:** lokalisierte Long-Form-Guides („Wie verbinde ich Claude mit Clicks auf Japanisch") für Search-Traffic

---

## Nächster Schritt

User-Go für Tag 1 (i18n-Foundation Branch) — dann starte ich.
Wenn Bounty-Pool-Höhe anders sein soll ($500 statt $1.5 k, oder $5 k), sag das jetzt.
Wenn vor dem Start eine der Sprachen raus soll (nur KR oder nur JP), sag das jetzt.
