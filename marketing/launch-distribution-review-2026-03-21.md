# Clicks Protocol Launch Distribution Review

Stand: 21.03.2026
Status: intern, nichts veröffentlichen

## Executive Summary

Der höchste Hebel liegt nicht in einem gleichzeitigen Blast über alle Kanäle, sondern in einer sequenziellen Launch-Reihenfolge: erst Glaubwürdigkeit aufbauen, dann Diskussion triggern, dann Longform und Community ausbauen. Für Clicks sind aktuell X, HN und Reddit die drei Kanäle mit dem besten Verhältnis aus Reichweite, Feedback-Qualität und technischer Glaubwürdigkeit. Medium und Substack sind Verstärker. Discord ist aktuell ein Ziel für Nachlauf, nicht für Initial-Distribution.

Wichtigster strategischer Shift: Kein "alles gleichzeitig". Erst Social Proof und technischer Kontext, dann HN und Reddit mit belastbaren Links, klaren Claims und vorbereiteten Antworten. Das senkt das Risiko, auf Widersprüche festgenagelt zu werden.

Größte Risiken vor Launch:
1. Widersprüche zwischen Status, Landing Page, Whitepaper und älteren Drafts
2. Zu aggressive Claims wie "verified", "all contracts verified", "no competing protocol", "currently 4-10% APY"
3. Veraltete Launchdaten in Logs und Plänen
4. Discord wird überschätzt, obwohl dort noch keine Community existiert

## HN Pack

### 3 Titelvarianten

1. Show HN: Clicks Protocol, yield routing for AI agent treasuries on Base
2. Show HN: We built a TypeScript SDK that makes idle agent USDC earn yield
3. Show HN: Clicks Protocol, an open-source yield layer for AI agents

Empfehlung: Variante 2. Sie ist am konkretsten, SDK-first und weniger buzzword-lastig als "autonomous yield layer".

### Finaler Hauptpost

Hi HN,

I built Clicks Protocol after running into a simple problem: AI agents can now hold USDC, but their idle balances usually earn nothing unless a human manually manages them.

Clicks is an open-source protocol and SDK on Base that lets an agent route a portion of its USDC into lending yield while keeping most funds liquid for immediate spending.

The default behavior is simple:
- 80% stays liquid in the agent wallet
- 20% is routed into yield
- the split is configurable between 5% and 50%
- withdrawals are available anytime
- the protocol fee is 2% on yield only

Example:

    const clicks = new ClicksClient(signer)
    await clicks.quickStart('1000', agentAddress)

What is live today:
- TypeScript SDK on npm
- MCP server for agent-native usage
- website and docs
- Base mainnet contracts

What I would love feedback on:
- whether the 80/20 default is the right UX for agent treasuries
- whether SDK-first is the right wedge vs direct contract usage
- where this breaks down for real agent payment flows
- what security proof points you would need before using something like this

I am deliberately not claiming fixed returns. Yield depends on the underlying Base lending venues and market conditions.

Happy to answer technical questions about the contracts, routing logic, withdrawal model, or why I think agent treasury management will become its own category.

### 15 skeptikerfeste Antwortbausteine

1. **"Why does this need to exist?"**
   Agent wallets are starting to hold operational USDC. Clicks is for the gap between payment rails and treasury management. The value is not inventing yield. The value is packaging it for agent-native use.

2. **"Why not just use Aave directly?"**
   You can. Clicks is for teams that want a default split, agent registration, SDK abstraction, and agent-native tooling instead of stitching multiple primitives together themselves.

3. **"Is this just a wrapper around existing DeFi?"**
   At the yield layer, yes. The differentiation is the treasury workflow for agents: split incoming funds, keep liquidity, expose it through SDK and MCP, and make the agent use case first-class.

4. **"What happens if the agent needs all funds immediately?"**
   The design keeps most funds liquid by default and allows withdrawals anytime. The protocol is explicitly optimized around maintaining operational liquidity.

5. **"Are returns guaranteed?"**
   No. Yield is variable and depends on underlying lending conditions. We should present it as variable yield, not fixed APY.

6. **"How is this different from a bank sweep account?"**
   Conceptually similar, but implemented on-chain for autonomous software wallets. Same treasury intuition, different execution environment.

7. **"Why Base?"**
   Cheap transactions, native USDC, and it already matters for x402 and agent-wallet narratives. It is the cleanest environment for small, frequent agent treasury actions.

8. **"What is the actual fee?"**
   2% on generated yield only. Never on principal. If there is no yield, there is effectively no protocol revenue.

9. **"How much is really live versus roadmap?"**
   The honest answer is: SDK, MCP server, docs, and deployed contracts are live. Broader ecosystem integrations and community distribution are still early.

10. **"Is this audited?"**
    Current proof points are internal review, test coverage, and documented exploit testing. A third-party audit is still future work and should be stated that way.

11. **"Are the contracts upgradeable?"**
    The current narrative across docs says immutable, no proxy pattern. If that remains true, we should repeat that clearly and consistently.

12. **"Why not wait until there are more agent wallets first?"**
    Because treasury infrastructure tends to be built before the category matures. The bet is that agent payments will grow and idle balances become an obvious problem.

13. **"Who is the customer right now?"**
    Developers building agent wallets, x402-style payment flows, and autonomous systems that keep USDC operational balances on Base.

14. **"Is this for humans or agents?"**
    The product framing should stay agent-first. Humans can technically use it, but the narrative wins only if the product stays focused on agent treasury workflows.

15. **"What evidence do you have people want this?"**
    The strongest evidence is not current demand volume. It is the emerging stack: x402, agent wallets, Base-native USDC, and the repeated need to keep idle operational balances productive without breaking liquidity.

## Kanalpriorisierung

### Empfohlene Reihenfolge

1. X
2. HN
3. Reddit
4. Medium
5. Substack
6. Discord

### Warum diese Reihenfolge

**1. X**
- Schnellster Kanal für initiale Narrative-Setzung
- Erzeugt erste sichtbare Public Proofs für HN und Reddit
- Beste Oberfläche für kurze technische Claims, Screenshots, Code und Replies
- Account und Pipeline existieren bereits

**2. HN**
- Höchste Glaubwürdigkeitswirkung pro Treffer
- Sehr gute Quelle für scharfes technisches Feedback
- Funktioniert besser, wenn Website, GitHub, npm und ein paar Social Spuren schon sichtbar sind

**3. Reddit**
- Guter Kanal für problemorientierte technische Diskussion
- Mehr Kontrolle über Framing als HN
- Sollte nach X und parallel zu HN genutzt werden, nicht vorher

**4. Medium**
- Dient als Longform-Referenz, nicht als initialer Discovery-Kanal
- Sehr nützlich als verlinkbares Asset für Reddit, X Replies und HN Follow-ups

**5. Substack**
- Aktuell weniger Hebel als Medium, weil noch kein Verteiler und kein bestehendes Publikum sichtbar ist
- Eher später für Founder Notes, Build-in-public und recurring updates

**6. Discord**
- Der schwächste Launch-Kanal im aktuellen Zustand
- Server existiert, aber ohne Mitglieder hat ein Announcement fast keinen Ersthebel
- Discord ist aktuell eher Conversion-Ziel nach Traffic, nicht primärer Startkanal

## 7-Tage-Content- und Distributionsplan

### Tag 1
- Final Claim Sweep über Website, README, HN, Reddit, X, Whitepaper
- Asset Freeze für Launch-Narrativ
- X: 1 präziser Launch-Post ohne Überclaiming
- Ziel: erstes sichtbares Proof of life

### Tag 2
- X: kurzer Architektur-Post mit 80/20 Flow oder Code-Screenshot
- Medium Post veröffentlichen oder final stellen
- HN Pack final checken, insbesondere skeptische Fragen
- Ziel: technische Lesbarkeit und Glaubwürdigkeit erhöhen

### Tag 3
- HN Submit im stärksten Zeitfenster
- X: auf HN oder Kernthese verweisen, aber nicht aggressiv pushen
- Gründer reagiert aktiv auf Kommentare
- Ziel: hochqualitatives Feedback und Sichtbarkeit

### Tag 4
- Reddit Post in 1 bis 2 passenden Subreddits, nicht überall gleichzeitig
- Fokus auf technische Kritik und ehrliche Einordnung
- X: eine FAQ-Antwort oder Learnings aus HN/Reddit
- Ziel: Diskussion verlängern statt einmaliger Peak

### Tag 5
- Medium Artikel als Referenz in Antworten nutzen
- X: Security oder architecture thread-light, maximal 4 bis 6 Posts statt langem Thread
- Ziel: Vertrauensaufbau

### Tag 6
- Substack Profil fertig machen und ersten Founder Note Entwurf vorbereiten
- Discord soft-open: FAQ, welcome flow, 1 dokumentiertes Announcement, aber kein großer Push
- Ziel: Retention-Infrastruktur

### Tag 7
- X recap: what we learned
- Interne Auswertung: welche Fragen wiederholt kommen, welche Claims nicht tragen
- Assets für Woche 2 priorisieren
- Ziel: aus Feedback die nächste Content-Woche bauen

## Vorhandene vs fehlende Assets

### Bereits vorhanden
- Website live
- Docs live
- Whitepaper live oder zumindest öffentlich zugänglich
- Security Page live
- npm Packages live
- MCP Server live
- X Account + Bot + Queue vorbereitet
- Medium Account vorhanden
- Discord Server + Bots vorhanden
- Reddit Account vorhanden
- Substack Account vorhanden
- HN Draft vorhanden
- Reddit Draft vorhanden
- Blog Draft vorhanden
- README / GitHub Marketing Copy vorhanden

### Fehlend oder vor Launch zuerst zu bauen

#### P0
- Ein einziges konsistentes Claim Sheet als Source of Truth
- OG Image
- Finales HN Pack ohne Compound-/Verification-Widersprüche
- 1 technisch starkes Hero-Visual für X, HN, Reddit
- 1 Security-Proof visual oder text asset

#### P1
- Medium Post final publish-ready
- Reddit variants pro Subreddit statt ein generischer Post
- FAQ sheet für Launch Replies
- Link map: welche URL man je Kanal primär schickt

#### P2
- Substack Startseite sauber einrichten
- Discord onboarding polish
- zusätzliche Stitch visuals

## Stitch Growth Visuals

### Idee 1: Agent Treasury Flow
Ziel: technische Verständlichkeit

Visual:
- links: incoming USDC payment
- Mitte: split engine
- rechts oben: 80% liquid wallet
- rechts unten: 20% yield bucket
- kleine Labels: configurable 5-50%, withdraw anytime, fee on yield only

Einsatz:
- X image
- HN linked image oder docs
- Reddit explanatory asset

### Idee 2: "Without Clicks vs With Clicks"
Ziel: Conversion

Visual:
- Split screen
- links: idle agent USDC, zero yield, manual treasury
- rechts: liquid balance + earning balance + one SDK call
- keine aggressiven Renditeversprechen, eher workflow gain

Einsatz:
- Website section
- X carousel
- Reddit follow-up comment

### Idee 3: Security Trust Board
Ziel: Glaubwürdigkeit

Visual:
- cards for open source, internal security review, test coverage, immutable contracts, non-custodial, third-party audit planned
- bewusst ohne falschen audit glamour

Einsatz:
- security page hero
- X trust post
- HN / Reddit replies als Screenshot-Referenz

## Claim- und Narrative-Konflikte

### Kritische Konflikte

1. **Basescan Verification widersprüchlich**
- `STATUS.md`: "nicht verifiziert auf Basescan" und "Basescan Verification übersprungen"
- mehrere öffentliche Assets: "All contracts verified on Basescan"
- Risiko: sofortiger Glaubwürdigkeitsbruch auf HN, Reddit, X
- Empfehlung: bis zur Klärung überall auf "deployed on Base mainnet" oder "source available" runtergehen, nicht "verified"

2. **Aave + Morpho + Compound widersprüchlich**
- manche Texte sagen Aave + Morpho
- andere sagen Aave + Compound + Morpho
- Morpho-Vault-Docs sagen aktuelle Implementierung nutzt Aave, dual routing zu Morpho ist geplant
- Empfehlung: eine klare Wahrheit festlegen, z.B. "current implementation routes on Base lending venues; public copy should only name protocols that are actually live in the routing path"

3. **APY-Range widersprüchlich**
- 4-8%
- 4-10%
- 2.5-10%
- 7-10%
- Empfehlung: launch copy auf "variable yield depending on underlying Base lending markets" umstellen. Wenn Zahl nötig ist, nur eine einzige Range nutzen und sie als indikativ markieren.

4. **Audit-Narrativ widersprüchlich**
- öffentliche Texte sagen teilweise "audited" oder klingen nach externer Audit-Reife
- tatsächliche Doku spricht von internal self-audit und späterer Third-Party-Audit
- Empfehlung: nur "internal security review", "exploit tests", "third-party audit planned" sagen

5. **Launchdatum widersprüchlich**
- alte Logs nennen 18.03. als Launch
- `STATUS.md` nennt 24.03.
- Content-Pläne sprechen teils 21-25.03.
- Empfehlung: in allen externen Drafts absolute Launchdaten entfernen, solange nicht final festgezurrt

### Mittlere Konflikte

6. **"No competing protocol" zu hart**
- Strategie-Dokument behauptet faktisch keine direkte Konkurrenz
- für HN/Reddit ist das unnötig angreifbar
- Empfehlung: weichere Formulierung: "we haven't seen many agent-first treasury products with SDK + MCP + split-routing focus"

7. **Discord wird als Launch-Kanal behandelt, obwohl keine Community da ist**
- `STATUS.md` listet Discord im Launch Day Push
- Marketing-Logs zeigen 0 Mitglieder
- Empfehlung: Discord als destination channel behandeln, nicht als primary distribution channel

8. **Roadmap-Features leak in core narrative**
- referral economics, bonus yield, yield bounty, multi-chain, fiat bridge tauchen teils auf
- das verwässert den MVP
- Empfehlung: Launch-Narrativ auf 4 Punkte begrenzen: idle USDC, configurable split, liquidity preserved, SDK/MCP

9. **"Built for x402" stärker als Beweislast**
- die narrative Nähe zu x402 ist gut
- aber wenn noch keine echte Distribution oder Integration dort sichtbar ist, besser als compatibility framing statt implied partnership
- Empfehlung: "designed for x402-style agent payment flows" statt "built for x402" wenn Nachweise noch dünn sind

10. **Discord invite / links könnten unready sein**
- mehrere Dateien nennen Discord als CTA
- wenn Server leer ist oder Invite nicht sauber, lieber GitHub oder docs als Primary CTA nutzen

## Empfehlung für den Main Agent

1. Vor jeder Veröffentlichung zuerst ein "Claim Freeze" Dokument bauen
2. Externe Copy auf folgende Kernaussagen reduzieren:
   - idle USDC for agents
   - configurable liquid/yield split
   - SDK + MCP
   - variable yield, not guaranteed
   - internal review today, more security work ahead
3. HN erst posten, wenn Verification- und Protocol-Naming-Frage sauber geklärt ist
4. Discord aus der Start-Reihenfolge nach hinten schieben
5. Medium als Trust Asset nutzen, nicht als Startkanal
