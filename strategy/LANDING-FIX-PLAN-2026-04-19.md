# Landing Page Fix Plan — 2026-04-19

> Konsolidierung aus: Design-Review-Briefing (13 CLK-Tickets) + Live-Verifikation gegen aktuellen Code + Kurzcheck SEO/AEO/AIO/GEO/ADO.
>
> **Nur echte Defekte. Nichts erfunden. Claims aus Briefing wurden jeweils verifiziert oder verworfen.**
>
> **Backup vorhanden:** `landing-v3.backup-2026-04-19T181828Z.tgz` (849 KB) auf Repo-Root neben `landing-v3/`.
> **Commit-Ref:** siehe `landing-v3.backup-2026-04-19T181828Z.commit-ref`.

---

## 1. Ausgangslage (verifiziert)

Live-Audit von `https://clicksprotocol.xyz/` gegen Source unter `landing-v3/` am 2026-04-19 ergibt **9 vollständig valide Defekte**, **4 teilweise valide** (Teile schon gefixt), **5 neue Defekte aus SEO/Schema-Check** die im Original-Briefing nicht enthalten waren.

**Aus dem Briefing bestätigt (9):**
CLK-1, CLK-2, CLK-3, CLK-6, CLK-7, CLK-9, CLK-10, CLK-11, CLK-12.

**Aus dem Briefing reduziert (4):**
- **CLK-4** — Slider-aria und Email-Label fehlen. Logo-Alt, Footer-Icon-Alt, USDC-Input-Label sind bereits korrekt.
- **CLK-5** — Stats sind dynamisch via `api.clicksprotocol.xyz/api/public/metrics`. Die im Briefing genannten Zahlen ("2 Agents, $1.03 TVL") stehen nicht hartcodiert; Design-Problem besteht trotzdem weil Defaults (1 / 0) schwach sind.
- **CLK-8** — Skip-Link und `<main id="main">` fehlen. `<nav>` und `<footer>` sind bereits semantisch korrekt.
- **CLK-13** — `copied`-State, Check-Icon-Swap und 2s-Timeout sind **bereits implementiert**. Nur `aria-label` fehlt.

**Neu aus SEO/AEO-Kurzcheck (5):**
- S-1 Canonical Link fehlt im `<head>`
- S-2 APY-Widerspruch in Structured Data (FAQPage: "7-13% APY", FinancialProduct: "4-8%", Hero: "4-8%")
- S-3 Stale Facts in FAQPage-Schema (5 contracts, 58 tests, referral_program geplant)
- S-4 Organization-Schema fehlt als Standalone (nur nested in Provider)
- S-5 GEO-Citation-Blöcke fehlen (keine externen Quell-Links für Statistiken)

---

## 2. Bündelung in 5 PRs

Reihenfolge respektiert Abhängigkeiten (Tokens → Components → a11y → Content → Schema).

```
PR 1 Tokens        → PR 2 Components     → PR 3 a11y          → PR 4 Content       → PR 5 SEO/Schema
CLK-1, CLK-2          CLK-3, CLK-9,           CLK-4, CLK-8        CLK-5, CLK-6,        S-1, S-2, S-3,
                      CLK-10, CLK-13                              CLK-7, CLK-11,       S-4, S-5
                                                                  CLK-12
```

S-2 hängt von CLK-7 ab (gleicher APY-Konsistenz-Kampf). Deshalb PR 5 **nach** PR 4.

---

## 3. Tickets im Detail

### PR 1 — Tokens & Foundation

#### CLK-1 · Kontrast-Fix ✅ VOLL VALIDE
**Belegt:** `app/globals.css:7` `--background: 220 10% 4%`, `app/globals.css:18` `--muted-foreground: 240 5% 45%`. Berechneter Kontrast ≈ 3.95:1, WCAG AA verlangt 4.5:1.

**Fix:** L18 `--muted-foreground: 240 5% 58%`.

**Verify:** axe-DevTools Scan und manuell WCAG-Rechner bestätigen ≥ 4.5:1 für `text-muted-foreground` auf `--background`.

---

#### CLK-2 · Token-Namespace ✅ VOLL VALIDE
**Belegt:**
- `text-text-primary` 188 Occurrences
- `text-text-secondary` 358 Occurrences
- `bg-bg-primary` 9 Occurrences
- `bg-surface` 17 Occurrences
- Shadcn-Tokens (`text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`): **0 Uses**

In `tailwind.config.ts:12-46` existieren BEIDE: Custom-Aliase + Shadcn-HSL-Tokens. Migration nicht begonnen.

**Fix (Reihenfolge wichtig wg. Text-Grep-Collisions):**

1. Globaler Rewrite über `app/` und `components/`:
   ```
   bg-bg-primary   → bg-background
   bg-surface      → bg-card
   text-text-primary   → text-foreground
   text-text-secondary → text-muted-foreground
   ```
   Empfehlung: pro Token eine Edit-Runde mit `replace_all`, danach grepen ob null Treffer.

2. `tailwind.config.ts` bereinigen — entferne Custom-Aliase `bg-primary`, `surface`, `text-primary`, `text-secondary`. Behalte nur die HSL-basierten Shadcn-Tokens.

3. Kontrolle: `grep -r "text-text-\|bg-surface\|bg-bg-primary" app/ components/` → 0.

**Risk:** Visual-Regression-Check via Screenshot-Diff nach dem Build. Erwartete visuelle Änderung = 0 weil die Custom-Aliase dieselben HEX-Werte hatten wie die Shadcn-HSL-Tokens.

---

### PR 2 — Components

#### CLK-3 · Button Variants + Tabs Radius ✅ VOLL VALIDE
**Belegt:**
- `components/ui/button.tsx:6` Base: `rounded-lg text-sm`, aber Varianten = `default | secondary | ghost | link` (Briefing will `default | outline | ghost | toggle`)
- `components/ui/button.tsx:19` Size `lg` = `px-10 py-5 text-xl`, Briefing will `h-14 px-10 text-xl`
- `components/calculator.tsx:125-134` Period-Buttons = raw `<button>` mit Ad-hoc-Klassen `bg-accent text-bg-primary font-bold border-accent`
- `components/ui/tabs.tsx:31` TabsTrigger = `rounded-md` (sollte `rounded-lg`)

**Fix:**

1. Button-Varianten umbauen (`components/ui/button.tsx`):
   - Umbenennen: `secondary` → `outline` (alle Call-Sites checken via `grep -r 'variant="secondary"'`)
   - Entfernen: `link` (falls irgendwo genutzt: durch TextLink-Component aus CLK-9 ersetzen)
   - Neu: `toggle` mit `data-[state=on]`-Styling (für Period-Buttons)
   - Size-Skala: `sm | md | lg | icon` mit festen Höhen (h-9/h-10/h-14)

2. Calculator Period-Buttons (`components/calculator.tsx:123-140`) migrieren auf `<Button variant="toggle" size="sm" data-state={days === p.days ? 'on' : 'off'}>`.

3. `components/ui/tabs.tsx:31` → `rounded-md` durch `rounded-lg` ersetzen.

**Verify:** Tab-Navigation, Klick-States, Screenshots vs Backup.

---

#### CLK-9 · TextLink Component ✅ VOLL VALIDE
**Belegt:**
- `components/developers.tsx:32,59,78,99` — Inline-Links ohne Size-Class → `text-base` (16 px) via Inherit
- `components/erc8004-section.tsx:37,58,81,90,99` — Inline-Links mit `text-sm` (14 px)
- Icon-Größen mixed: `w-4 h-4` vs `w-3.5 h-3.5`
- Kein `components/ui/text-link.tsx` vorhanden

**Fix:**

1. Neu erstellen `components/ui/text-link.tsx` mit cva-basiertem Component (siehe Briefing — Draft übernehmbar, aber:
   - Nach CLK-2 muss `text-accent` bleiben (ist ein Shadcn-Token)
   - Ring muss `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

2. Migrate 9 Links in 2 Files:
   - `components/developers.tsx` 4 Links (alle size="md" weil Card-CTAs)
   - `components/erc8004-section.tsx` 5 Links (alle size="sm" weil Body-Kontext)

3. External-Marker via `external={true}` Prop, die automatisch `target="_blank" rel="noopener noreferrer"` + ArrowUpRight-Icon setzt.

**Verify:** Alle Inline-Links haben konsistente Größe pro Kontext, External-Icons identisch.

---

#### CLK-10 · Focus-Ring verstärken ✅ VOLL VALIDE
**Belegt:**
- `components/ui/button.tsx:6` = `focus-visible:ring-1 focus-visible:ring-ring` (1 px, kein Offset)
- `components/ui/tabs.tsx:31,46` = `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (2 px mit Offset)
- **Inkonsistenz zwischen Button und Tabs**

**Fix:** Button-Base-Classes angleichen auf `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Fällt mit CLK-3 zusammen.

---

#### CLK-13 · Copy-Button aria-label ⚠️ REDUZIERT
**Belegt:**
- `components/copy-button.tsx` hat bereits `useState(copied)`, setTimeout 2s, `<Check/>` vs `<Copy/>`-Swap
- **Kein aria-label.**

**Fix:** Ein-Liner in `components/copy-button.tsx`:
```tsx
aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
```

**Nicht tun:** Die State-Logik schon vorhanden — Briefing-Vorschlag komplett ersetzen wäre Scope-Creep.

---

### PR 3 — Accessibility

#### CLK-4 · Alt + Labels ⚠️ REDUZIERT
**Belegt:**
- `components/navbar.tsx:17-21` Logo hat `alt="Clicks"` ✅
- `components/footer.tsx:232-235` Footer-Icon hat `alt="Clicks"` ✅ (Briefing will leeres alt für dekorativ — diskussionswürdig)
- `components/calculator.tsx:105` USDC-Input hat `<label>` ✅
- `components/calculator.tsx:141-156` Range-Slider **ohne aria-Attribute** ❌
- `components/footer.tsx:40-46` Email-Input **ohne `<label>`** ❌

**Fix:**

1. Range-Slider (`components/calculator.tsx:141-156`): ergänze `aria-label="Yield Split Percentage"`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow={split}`, `aria-valuetext="{split} percent earning, {100-split} percent liquid"`, `step="5"`.

2. Footer Subscribe-Email (`components/footer.tsx:40-46`): `<label htmlFor="subscribe-email" className="sr-only">Email address</label>` vorsetzen, Input `id="subscribe-email"` geben, `aria-describedby="subscribe-help"` + `<span id="subscribe-help" className="sr-only">`-Hinweistext.

**Nicht tun:** Logo/Footer-Icon/USDC-Input anfassen — sind schon korrekt. Diskussion "leeres alt vs `Clicks`" auf später vertagen.

---

#### CLK-8 · Skip-Link + Landmarks ⚠️ REDUZIERT
**Belegt:**
- `app/layout.tsx` — kein Skip-Link
- `app/page.tsx` — Content ist nicht in `<main id="main">` gewrappt
- `components/navbar.tsx:12` hat schon `<nav>` ✅
- `components/footer.tsx:5` hat schon `<footer>` ✅

**Fix:**

1. `app/layout.tsx`: Skip-Link als erstes `<body>`-Kind einfügen:
   ```tsx
   <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold">
     Skip to main content
   </a>
   ```

2. `app/page.tsx`: `<Hero /> … <ERC8004Section />` in `<main id="main">…</main>` wrappen. Navbar + Footer bleiben **außerhalb** von `<main>`.

3. Zusätzlich `components/navbar.tsx`: `<nav aria-label="Primary">` ergänzen falls nicht schon da.

**Nicht tun:** `<nav>` / `<footer>` neu einführen — sind schon da.

---

### PR 4 — Content & Copy

#### CLK-5 · Stats Block ⚠️ REDUZIERT (dynamisch, nicht hartcodiert)
**Belegt:** `components/stats.tsx` fetcht live von `https://api.clicksprotocol.xyz/api/public/metrics`. Defaults `{ totalAgents: 1, tvlUsdc: 0, currentApyPct: 6 }`. Die im Briefing erwähnten "2 Agents / $1.03 TVL" sind entweder API-Snapshot-Werte oder nicht reproduzierbar.

**Fix (Option A, empfohlen):** Komponente auf Trust-Signals umbauen (wie Briefing), aber **dynamische Werte beibehalten wo sinnvoll**:
- "Base Mainnet" (statisch)
- "ERC-8004 Verified · agentId 45074" (statisch, Link auf BaseScan)
- "Current APY" (dynamisch aus API)
- "Zero Lockup" (statisch)

Erfordert zusätzlich: `components/stats.tsx` umbenennen zu `trust-signals.tsx` (oder behalten wenn Usage nicht kollidiert).

**Fix (Option B, minimal):** Defaults auf "—" setzen wenn API fehlt, und die beiden schwachen Metriken (`Registered Agents`, `TVL`) entfernen, nur `Current APY` und `Zero Lockup` behalten.

**Entscheidung braucht User-Go** — Option A ist größer, Option B schneller.

---

#### CLK-6 · CTA Differentiation ✅ VOLL VALIDE
**Belegt:** 4 Literal-Buttons "Get Started":
- `components/hero.tsx:26` → `/docs/api`
- `components/navbar.tsx:56` → `/docs/getting-started`
- `components/navbar.tsx:127` (Mobile) → `/docs/getting-started`
- `components/developers.tsx:63` (MCP-Card) → `/docs`

Plus Varianten: `components/yield-calculator.tsx:216` "Get Started with Clicks Protocol", `app/about/page.tsx:123` `<h2>Get Started</h2>`.

**Fix:** Label-Tabelle aus Briefing anwenden:
| Datei:Zeile | Alt | Neu | Target |
|-------------|-----|-----|--------|
| `navbar.tsx:56, :127` | Get Started | **Install SDK** | `/docs/getting-started` |
| `hero.tsx:26` | Get Started | **Start Earning Yield** | `/docs/getting-started` (bisher `/docs/api` — falsch) |
| `hero.tsx` Secondary | View Documentation | **Read the Docs** | `/docs` |
| `developers.tsx:63` | Get Started | **Connect LLM** | `/docs` |

Zusätzlich `yield-calculator.tsx:216` evtl. auf "Start Earning Yield" harmonisieren (diskutabel — dort ist Kontext "nach Simulation").

---

#### CLK-7 · APY-Widerspruch ✅ VOLL VALIDE
**Belegt:** `hero.tsx:22` claim "4-8% APY", `calculator.tsx:52` default `yieldSplit = 20`, FALLBACK_APY = 6 → effektive APY ≈ 1.2 %.

**Fix — zwei Optionen, eine wählen:**

- **A** (Briefing-Vorschlag): Default-Split auf 50 % erhöhen. Dann 50 % × 6 % APY = 3 % effektive APY. Kommt zum Hero-Claim näher, aber 50/50-Split ist nicht das was die Docs als Default beschreiben (80/20).

- **B** (kohärenter): Hero-Claim ändern. Statt "4-8% APY" → "up to 6%" oder "yield on 20% by default". Verlangt aber Rewording in Hero + Schema + Docs + FAQPage. Mehr Arbeit, aber ehrlicher.

- **C** (kompromiss): Default bleibt 20, aber Calculator zeigt im UI unter dem Ergebnis eine Zeile `"At max 50% yield allocation, effective APY would be 3%"` und Hero-Claim wird präziser "up to 4-8% APY on allocated yield portion".

**Empfehlung: C** — behält 80/20-Default-Narrative und löst den Widerspruch sprachlich. Löst S-2 gleich mit.

---

#### CLK-11 · Microcopy Pass ✅ VOLL VALIDE
**Belegt:** Hero-Subhead exakt `"Your agent holds USDC. Make it earn 4-8% APY while it sits idle. One SDK call. No lockup. Built on Base."` in `hero.tsx:22`.

**Fix:** Text-Replacements aus Briefing übernehmen, **ausgenommen** die Stellen die mit CLK-7 in Konflikt stehen ("4-8%"-Formulierung abhängig von CLK-7-Entscheidung).

---

#### CLK-12 · Accordion Default ✅ VOLL VALIDE
**Belegt:** `components/how-it-works.tsx:24` `<Accordion type="multiple" defaultValue={["step-1","step-2","step-3"]}>` — alle drei offen.

**Fix:** `type="single" collapsible defaultValue="step-1"`. Accordion macht dann Sinn.

---

### PR 5 — SEO / AEO / AIO / GEO (neu)

#### S-1 · Canonical Link ✅ VALIDE
**Belegt:** `<head>`-Dump der Homepage zeigt kein `<link rel="canonical">`. Cloudflare redirected `/security` → `/security/` (308), also Duplicate-Content-Risiko.

**Fix:** In `app/layout.tsx` Metadata-Export ergänzen:
```tsx
export const metadata: Metadata = {
  ...
  metadataBase: new URL('https://clicksprotocol.xyz'),
  alternates: {
    canonical: '/',
  },
  ...
}
```
Plus pro Page (about, security, whitepaper, docs, /, miniapp) entsprechende `alternates.canonical`.

---

#### S-2 · APY-Konsistenz in Structured Data ✅ VALIDE
**Belegt:**
- `FinancialProduct` Schema: `minValue: 4, maxValue: 8`
- `FAQPage` Schema Q "What is Clicks Protocol?": "20% earns 7-13% APY via Morpho"
- Hero: "4-8% APY"
- Calculator FALLBACK_APY: 6
- Landing agent.json: `apy: { min: 4, max: 8, unit: "percent" }`

**Fix:** Single-Source-of-Truth für APY-Zahl wählen. Empfehlung:
- "APY varies with market" als Narrative
- FinancialProduct: interestRate bleibt 4-8 (historische Range)
- FAQPage "7-13%": auf "4-8% APY range (market-dependent)" korrigieren
- Calculator Default klarstellen wie in CLK-7-Option-C

Hängt an CLK-7 — muss **nach** PR 4 passieren.

---

#### S-3 · Stale Facts in FAQPage-Schema ✅ VALIDE
**Belegt:** FAQPage-Answer "Is Clicks Protocol safe?" sagt "5 contracts verified on Basescan. 58/58 tests passing." Aktuell: 6 Contracts (inkl. Safe + Referral), 227/227 Tests. Außerdem `referral_program: "planned for V1.1"` in FinancialProduct — ClicksReferral ist live seit V2.

**Fix:** In `app/layout.tsx` oder wo die JSON-LD-Blöcke liegen:
- "5 contracts" → "6 contracts (Registry, SplitterV4, FeeV2, YieldRouter, Referral) + Safe multisig owner"
- "58/58 tests" → "227/227 tests"
- `referral_program` → `"live, 3-level on-chain attribution"`

---

#### S-4 · Organization-Schema Standalone ⚠️ NICE-TO-HAVE
**Belegt:** Aktuell nur in FinancialProduct als `provider`-Nested. Google Entity-Recognition bevorzugt Standalone-Organization.

**Fix:** Zusätzliches JSON-LD-Script in `app/layout.tsx`:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Clicks Protocol",
  "url": "https://clicksprotocol.xyz",
  "logo": "https://clicksprotocol.xyz/icon-1024.png",
  "sameAs": [
    "https://github.com/clicks-protocol",
    "https://x.com/ClicksProtocol",
    "https://dev.to/clicksprotocol"
  ]
}
```

---

#### S-5 · GEO-Citation-Blöcke ⚠️ NICE-TO-HAVE
**Belegt:** Keine externen Quell-Links für die "4-8% APY"-Claim oder "$46 B USDC idle"-Behauptung. Princeton-GEO-Paper empfiehlt Statistic-Citation-Blocks.

**Fix (optional):** In Hero oder About-Page:
- "4-8% APY" → mit Fußnote `[1]` + Link zu DeFi Llama / Aave Dashboard
- "Billions in idle USDC" → mit Fußnote auf Circle Annual Report oder Coinbase Research

Kann auch später passieren (eigenen Sprint wert, oder mit Wikipedia/arXiv-Seeding aus ADO-G5 kombinieren).

---

## 4. Execution Order

```
PR 1 Tokens               (~2-4h)   low risk, high coverage, screenshot-diff verify
  ↓
PR 2 Components           (~4-6h)   medium risk, CLK-3 renames bestehende Varianten
  ↓
PR 3 a11y                 (~2h)     low risk, pure Addition
  ↓
PR 4 Content              (~4-6h)   low risk, aber CLK-7-Entscheidung User-Go nötig
  ↓
PR 5 SEO/Schema           (~2h)     low risk, CLK-7-abhängig via S-2
```

**Gesamt: ~14-20h Arbeit, 2-3 fokussierte Tage.**

**User-Entscheidungen vorab (blocker):**
1. CLK-5: Option A (Trust-Signals) oder B (Minimal-Cleanup)?
2. CLK-7/S-2: Default-Split-Change oder Hero-Claim-Change oder Kompromiss-UI-Text?

---

## 5. Vor jedem Merge — Verify-Checkliste

### Automated
- [ ] `npm run build` passiert ohne Errors
- [ ] Keine neuen Lint-Warnings
- [ ] Lighthouse Accessibility ≥ 95 Desktop + Mobile
- [ ] axe DevTools: 0 kritische Findings

### Manual — Keyboard
- [ ] Tab-Reihenfolge sinnvoll (Skip-Link zuerst nach PR 3)
- [ ] Fokus-Ring auf allen interaktiven Elementen sichtbar (≥ 2 px)
- [ ] Slider: Arrow-Keys in 5-%-Schritten
- [ ] Accordion: Enter/Space öffnet

### Manual — Visual
- [ ] Vorher-Nachher-Screenshot pro PR
- [ ] Mobile 375 px kein horizontaler Scroll
- [ ] 200 %-Zoom: alles lesbar

### Manual — Content
- [ ] Keine Duplikat-CTAs mehr
- [ ] APY-Zahlen konsistent über Hero + Calculator + Schemas
- [ ] FAQPage-Facts aktuell (6 Contracts, 227 Tests, Referral live)

### Post-Deploy Live-Verify (nach PR 5)
- [ ] `curl https://clicksprotocol.xyz/ | grep 'rel="canonical"'` → 1 Treffer
- [ ] Google Rich-Results-Test: FinancialProduct + FAQPage + HowTo + Organization
- [ ] `curl https://clicksprotocol.xyz/.well-known/agent.json` prüft 200 + enthält V2-Adressen (schon ok)

---

## 6. Was NICHT Teil dieses Plans ist

- **APIs.guru Resubmission** (ADO-G2) — eigenständiger External-PR
- **Treasury Efficiency Score als eigenes Repo** (ADO-G3) — Subfolder-Version reicht erstmal
- **Wikipedia / arXiv-Seeding** (ADO-G5) — braucht externe Coverage zuerst
- **Whitepaper v2 content rewrite** — eigener Sprint
- **ERC-8004 Schema-V1-Content-Patterns** — kommt mit V5-Ship, nicht jetzt
- **Multi-Language Content** — kein i18n-System live

---

## 7. Rollback-Plan

Sicherheitskopie als `landing-v3.backup-2026-04-19T181828Z.tgz` vorhanden.

Rollback einer einzelnen PR:
```bash
git revert <merge-commit>
cd landing-v3 && npm run build && wrangler pages deploy out --project-name=clicks-protocol --branch=main --commit-dirty=true
```

Kompletter Rollback:
```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol
mv landing-v3 landing-v3.broken-$(date +%s)
tar -xzf landing-v3.backup-2026-04-19T181828Z.tgz
cd landing-v3 && npm ci && npm run build
```

---

## 8. Zusammenfassung

| PR | Tickets | Aufwand | Risiko | User-Go nötig |
|----|---------|---------|--------|---------------|
| 1 | CLK-1, CLK-2 | 2-4h | Low | Nein |
| 2 | CLK-3, CLK-9, CLK-10, CLK-13 | 4-6h | Medium | Nein |
| 3 | CLK-4, CLK-8 (beide reduziert) | ~2h | Low | Nein |
| 4 | CLK-5, CLK-6, CLK-7, CLK-11, CLK-12 | 4-6h | Medium | **Ja** (CLK-5 + CLK-7 Entscheidungen) |
| 5 | S-1..S-5 | ~2h | Low | Hängt an PR 4 |

**Backup:** `landing-v3.backup-2026-04-19T181828Z.tgz` gespeichert.
**Nicht angefangen:** alles oben. Nichts ist bisher gecoded.

**Nächster Schritt:** User entscheidet CLK-5-Option (A/B) und CLK-7-Option (A/B/C), dann starte PR 1.
