# Clicks Protocol Social Launch Pack

Stand: 21.03.2026
Quelle für harte Claims: `STATUS.md`, `sdk/README.md`, `sdk/src/client.ts`, `site/llms.txt`

## Executive Summary

Clicks Protocol ist in einer guten Pre-Launch-Position, aber mehrere ältere Drafts enthalten Claims, die so nicht mehr haltbar sind.

Der aktuelle, sichere Messaging-Kern ist:
- Clicks Protocol läuft auf Base
- 5 Smart Contracts sind deployed
- SDK und MCP Server sind auf npm published
- Kernnutzen: USDC-Zahlungen für Agenten automatisch zwischen sofort liquidem Anteil und Yield-Anteil aufteilen
- Yield Routing ist aktuell sicher als Aave V3 und Morpho formulierbar
- Standard-Split ist 80/20, pro Agent konfigurierbar von 5 bis 50 Prozent
- Fee ist 2 Prozent auf Yield, nicht auf Principal
- Contracts sind deployed, aber laut `STATUS.md` nicht auf Basescan verifiziert
- Es gibt eine One-Call-Experience via `quickStart()`, technisch besteht sie intern aber aus Registrierung, Approval-Prüfung und Payment-Split

Nicht mehr sicher oder aktuell sind vor allem diese Aussagen:
- "verified on Basescan"
- "open source" oder "MIT license"
- "Aave, Compound, Morpho" als aktueller Live-Stack
- "no approval flow" oder "no manual approval steps" in absoluter Form
- "4 to 10 percent APY" als belastbare Range
- Referral, Agent Teams, Yield Discovery Bounty als Live-Produkt

Empfehlung für Launch-Kommunikation:
- Fokus auf das reale Produkt heute
- keine Fantasie-Roadmap als Fakt formulieren
- keine Security- oder Trust-Claims, die nicht direkt in `STATUS.md` oder dem SDK belegbar sind
- Medium eher founder-technical, Reddit eher skeptisch-technisch, Discord klar und knapp

---

## Medium Draft, publish-ready

# Introducing Clicks Protocol

AI agents are starting to hold real money.

They pay for compute, APIs, data, and services. They receive payments for work. But between transactions, most agent treasuries still do nothing.

That is the gap Clicks Protocol is built for.

Clicks Protocol is a treasury layer for AI agents on Base. It helps an agent take incoming USDC and automatically split it between capital that stays immediately usable and capital that goes into yield.

## Why this matters

As soon as an agent has a wallet, treasury management becomes part of the product.

A human operator can move funds manually. An autonomous agent cannot depend on dashboards, spreadsheets, or someone remembering to park idle capital. The workflow needs to be programmatic.

That is the problem Clicks Protocol is solving.

## What Clicks Protocol does today

At the core, Clicks takes a USDC payment and splits it automatically.

By default:
- 80 percent stays liquid for immediate use
- 20 percent is routed into yield

That default split can be adjusted per agent, with a supported range of 5 to 50 percent.

The protocol currently focuses on Base and USDC. Yield routing is built around Aave V3 and Morpho.

For an agent operator, the point is simple: idle treasury should not just sit there if part of it can be allocated programmatically.

## The developer experience

Clicks ships with a TypeScript SDK and an MCP server.

The SDK includes a high-level `quickStart()` path that handles the initial setup flow and first payment split in one call.

```typescript
import { ClicksClient } from '@clicks-protocol/sdk'

const clicks = new ClicksClient(signer)
await clicks.quickStart('1000', agentAddress)
```

Under the hood, that setup flow checks whether the agent is already registered, checks USDC approval, and then executes the payment split.

If you want the lower-level flow instead, you can call the individual methods directly.

```typescript
const clicks = new ClicksClient(signer)

await clicks.registerAgent(agentAddress)
await clicks.approveUSDC('max')
await clicks.receivePayment('100', agentAddress)
```

## How the protocol works

The live deployment currently consists of five Base mainnet contracts:
- ClicksRegistry
- ClicksFee
n- ClicksYieldRouter
- ClicksSplitterV3
- USDC integration

The high-level flow looks like this:
1. An operator registers an agent
2. USDC is approved for the splitter
3. A payment comes in through `receivePayment()`
4. The liquid portion stays available immediately
5. The yield portion is routed into the active yield path
6. On withdrawal, principal plus yield can be returned, with protocol fees applied only to yield

The protocol fee is 2 percent of yield earned, not of principal.

## Why Base

Base is a practical choice for agent treasury workflows:
- low transaction costs
- native USDC support
- familiar Ethereum tooling for developers

For products that expect lots of smaller machine-driven transactions, that matters.

## What is live right now

As of today:
- website is live at clicksprotocol.xyz
- SDK is published as `@clicks-protocol/sdk`
- MCP server is published as `@clicks-protocol/mcp-server`
- 5 contracts are deployed on Base mainnet
- machine-readable discovery surfaces are live on the site

## What comes next

The broader vision is to make treasury management native to AI agents.

The immediate launch focus is not adding more narrative. It is getting the current product in front of technical builders, collecting feedback, and proving the first integration loop.

If you are building agents that already move USDC, this is the question Clicks is asking:

Should agent treasury sit idle by default?

## Links

- Website: https://clicksprotocol.xyz
- Docs: https://clicksprotocol.xyz/docs
- API docs: https://clicksprotocol.xyz/docs/api
- npm SDK: https://www.npmjs.com/package/@clicks-protocol/sdk
- GitHub Org: https://github.com/clicks-protocol

---

## Reddit Variants

### 1. r/ethdev

**Title:** Built a Base treasury layer for AI agents that auto-splits USDC into liquid plus yield

**Body:**
Hey r/ethdev,

We have been building Clicks Protocol, a Base-native treasury layer for AI agents that hold USDC.

Core idea:
- incoming payment gets split automatically
- default is 80 percent liquid, 20 percent to yield
- configurable per agent from 5 to 50 percent
- current yield routing is around Aave V3 and Morpho

Developer surface today:
- 5 deployed contracts on Base mainnet
- TypeScript SDK on npm
- MCP server on npm for agent tooling

High-level SDK flow:

```ts
const clicks = new ClicksClient(signer)
await clicks.quickStart('1000', agentAddress)
```

Lower-level flow is also available if you want explicit control over registration, approval, and payment handling.

A few specifics so I do not oversell it:
- contracts are deployed, but not yet verified on Basescan
- current supported asset is USDC on Base
- protocol fee is 2 percent on yield only, not principal

Would especially love feedback on:
- contract surface and naming
- whether the split model feels sane for agent treasury workflows
- whether MCP is actually useful here, or just nice packaging

Links:
- Site: https://clicksprotocol.xyz
- Docs: https://clicksprotocol.xyz/docs/api
- npm: https://www.npmjs.com/package/@clicks-protocol/sdk
- GitHub: https://github.com/clicks-protocol

### 2. r/defi

**Title:** We built a way for AI agents on Base to keep part of their USDC liquid and route the rest to yield

**Body:**
AI agents are starting to hold stablecoins for real work, but most of that treasury still sits idle between transactions.

That is the use case behind Clicks Protocol.

What it does:
- takes a USDC payment on Base
- keeps 80 percent liquid by default
- routes 20 percent into yield
- fee is only taken on yield earned, not principal

The point is not to turn agents into traders. It is to make treasury allocation programmable.

Current product surface:
- Base-focused
- USDC-focused
- SDK live on npm
- MCP server live on npm
- contracts deployed on Base mainnet

I want to be careful with claims here:
- this is early
- contracts are deployed but not yet verified on Basescan
- live routing language should be read as Aave V3 and Morpho, not a huge strategy marketplace

Curious whether people here think agent treasury management becomes a real DeFi category, or whether this stays too niche.

### 3. r/Base

**Title:** Launching on Base: Clicks Protocol for AI agent USDC treasury flows

**Body:**
Building on Base because the economics actually make sense for machine-driven treasury actions.

Clicks Protocol is a treasury layer for AI agents that hold USDC on Base.

Default behavior:
- 80 percent stays immediately usable
- 20 percent goes into yield
- split is configurable per agent

What is already live:
- website and docs
- 5 deployed Base contracts
- TypeScript SDK
- MCP server

Why Base was the obvious chain for this:
- low transaction cost
- native USDC
- standard Ethereum tooling

Still being transparent about current status:
- Basescan verification is still pending for a later pass
- current messaging should stay centered on USDC on Base, not broad multi-chain support

If you are building agent or automation products on Base, I would love to compare notes on where treasury tooling is still missing.

### 4. Optional cautious technical alternative

**Title:** Looking for feedback: programmatic treasury split for agent wallets on Base

**Body:**
Not posting this as a hype launch. Mostly looking for technical feedback.

We built Clicks Protocol around one narrow assumption:
if agent wallets become normal, they need treasury defaults.

Current design:
- operator registers agent
- USDC approval is set once
- payment comes in
- protocol splits payment between immediate liquidity and yield
- default split is 80/20
- custom split range is 5 to 50 percent

What I am trying to validate:
- is a split-based treasury primitive actually the right abstraction
- should this live as app logic instead of protocol logic
- does MCP meaningfully help agent integrations, or is SDK enough

Happy to share more architecture details if useful.

---

## Discord Pack

### 1. Launch Announcement

**Clicks Protocol is live.**

We built Clicks Protocol for a simple reason: AI agents are starting to hold USDC, and idle treasury should not just sit there.

What Clicks does:
- splits incoming USDC by default into 80 percent liquid and 20 percent yield
- runs on Base
- ships with a TypeScript SDK and MCP server

What is live now:
- website: https://clicksprotocol.xyz
- docs: https://clicksprotocol.xyz/docs
- API docs: https://clicksprotocol.xyz/docs/api
- SDK: `@clicks-protocol/sdk`

This launch is the starting line, not the finish line. We want feedback from builders, agent operators, and Base-native devs.

If you are building an agent that already moves money, tell us what treasury behavior should be default.

### 2. FAQ Block

**What is Clicks Protocol?**
A treasury layer for AI agents on Base that helps split USDC between immediate liquidity and yield.

**What is the default split?**
80 percent liquid, 20 percent to yield.

**Can the split be changed?**
Yes. Current supported range is 5 to 50 percent per agent.

**What asset does Clicks support right now?**
USDC on Base.

**What yield sources does Clicks use?**
Current safe language is Aave V3 and Morpho.

**Is there an SDK?**
Yes. `@clicks-protocol/sdk` is published on npm.

**Is there MCP support?**
Yes. `@clicks-protocol/mcp-server` is also published.

**Are the contracts deployed?**
Yes, on Base mainnet.

**Are the contracts verified on Basescan?**
Not yet. Deployment is live, verification is still pending.

### 3. Welcome / Intro Post

Welcome to Clicks Protocol.

This server is for builders who think AI agents will need real treasury tooling, not just wallets.

If that is you, start here:
- say what you are building
- tell us whether your agent already uses USDC
- tell us what treasury behavior you wish existed by default

We are early. That is the advantage.

### 4. Community Prompt

Question for builders:

If your agent receives 1,000 USDC today, what should happen automatically?

Option A: keep everything liquid
Option B: split between liquid and yield
Option C: route by task budget and runway
Option D: something else entirely

Reply with your actual preferred behavior. Not the polished answer.

---

## Stitch Asset Plan

### Asset 1: Hero graphic for Medium and site social cards
**Use:** Medium header, X fallback visual, Discord announcement image

**Prompt:**
Create a dark, premium, Base-native fintech hero illustration for a product called Clicks Protocol. Show an abstract AI agent treasury system where one stream of USDC splits into two clear paths: one path remains liquid and active, the other flows into yield. Visual style: minimal, sharp, high-trust, deep navy and black background, electric blue and soft teal highlights, subtle glow, no cartoon elements, no fake dashboard UI, no text embedded in image, suitable for web3 infrastructure branding.

### Asset 2: 80/20 explainer visual
**Use:** Reddit image attachment, docs teaser, Discord FAQ companion graphic

**Prompt:**
Design a clean conceptual explainer image that visualizes an 80 percent liquid and 20 percent yield treasury split for AI agents. Use simple geometric flows, token-like circles, and two clearly differentiated lanes. One lane should feel immediate and operational, the other should feel productive and yield-generating. Keep the image text-free, high contrast, technical, and suitable for Base ecosystem branding.

### Asset 3: Developer integration visual
**Use:** Medium inline image, docs, launch thread support visual

**Prompt:**
Create a developer-focused product illustration for a TypeScript SDK that connects an AI agent wallet to on-chain treasury logic on Base. Show code-inspired structure, wallet connectivity, and an on-chain routing layer. Visual language should feel trustworthy, modern, and technical. Dark mode. No screenshots. No text in the image. No meme style.

### Asset 4: Base-native ecosystem visual
**Use:** r/Base post, ecosystem outreach, launch bundle

**Prompt:**
Generate a sleek ecosystem visual representing AI agents, USDC, and Base infrastructure connected in one treasury flow. The composition should imply low-cost transactions, programmable finance, and autonomous capital allocation. Style: polished protocol branding, geometric, dark background, vivid blue accents, subtle network topology, no logos that require exact trademark rendering, no text overlay.

### Asset 5: Trust and architecture visual
**Use:** Medium section break, Discord pinned post, future deck reuse

**Prompt:**
Create a protocol architecture illustration for a product with five smart contracts coordinating agent treasury flows on Base. The image should suggest modular contract components, routing logic, and capital safety boundaries without looking like a generic cybersecurity poster. Use a refined dark palette, glowing node links, and clean spacing. No text. No lock icons. No shield clichés.

---

## Claim-Konflikte und Korrekturen

### 1. Basescan verification
**Alte Claims:**
- blog draft: "The contracts are deployed and verified"
- blog CTA: "Contracts: Verified on Basescan"
- reddit draft: "all verified on Basescan"
- HN draft: "5 Solidity contracts on Base Mainnet (verified)"
- LinkedIn draft: "Five verified contracts on Base"

**Aktueller Stand laut `STATUS.md`:**
- 5 contracts deployed
- not verified on Basescan
- verification skipped for V2

**Korrektur:**
Nur "deployed on Base mainnet" verwenden.

### 2. Open source / MIT / licensing
**Alte Claims:**
- blog draft: "Clicks is open source"
- reddit draft: "Open source: MIT license"
- LinkedIn draft: "Open source"

**Aktueller Stand:**
- `sdk/README.md` sagt: `UNLICENSED — proprietary, not for distribution`
- `STATUS.md` sagt nur GitHub Org live, nicht Open Source

**Korrektur:**
Nicht als open source bezeichnen. Wenn nötig: "GitHub org is live" oder "developer docs and packages are available".

### 3. Supported yield sources
**Alte Claims:**
- blog draft: "Aave, Compound, Morpho"
- mehrere Drafts sprechen von Compound als live

**Aktueller Stand:**
- `sdk/README.md` und `site/llms.txt` nennen Aave V3 und Morpho
- `STATUS.md` nennt keine live Compound-Integration als Claim

**Korrektur:**
Aktuell nur Aave V3 und Morpho nennen.

### 4. APY range inconsistency
**Alte Claims:**
- blog draft: 4 to 10 percent APY
- llms.txt: 7 to 10 percent APY
- QA homepage references 4 to 8 percent in UI

**Aktueller Stand:**
- widersprüchlich zwischen assets
- keine saubere Single Source Zahl in `STATUS.md`

**Korrektur:**
Für Launch-Content am besten keine konkrete APY-Range prominent behaupten. Wenn überhaupt, nur vorsichtig als variable on-chain yield phrasing.

### 5. "No approval flow" / "no manual approval steps"
**Alte Claims:**
- blog draft: "no approval flow" und "no manual approval steps"

**Aktueller Stand:**
- `sdk/README.md` zeigt klar `approveUSDC('max')`
- `client.ts` quickStart prüft und setzt Approval bei Bedarf

**Korrektur:**
Nicht behaupten, dass es gar kein Approval gibt. Besser: "the SDK abstracts the setup flow" oder "one-time approval when needed".

### 6. One call vs real multi-step flow
**Alte Claims:**
- blog draft: "One function, three operations"

**Aktueller Stand:**
- stimmt grundsätzlich wegen `quickStart()`, aber darunter liegen Registrierung, Allowance-Prüfung und Payment-Split

**Korrektur:**
Formulierung okay, wenn technisch präzisiert.

### 7. No minimum deposit, no governance votes
**Alte Claims:**
- blog draft: "No minimum deposit. No governance votes."

**Aktueller Stand:**
- in den geprüften Dateien nicht sauber belegt

**Korrektur:**
Für Launch lieber streichen.

### 8. Security / trust claims not currently proven here
**Alte Claims:**
- reddit draft: "No proxy upgrades, no admin keys on user funds"

**Aktueller Stand:**
- nicht aus `STATUS.md` oder den gelesenen Produktfiles sauber abgesichert

**Korrektur:**
Nicht verwenden, außer nach Contract-Review mit explizitem Beleg.

### 9. Referral and gamified features in `llms.txt`
**Alte Claims in ecosystem files:**
- multi-level referral network
- agent teams with TVL milestones
- yield discovery bounty

**Aktueller Stand laut `STATUS.md`:**
- ClicksReferral deploy ist noch Post-Launch offen

**Korrektur:**
Diese Features aktuell nicht in Launch-Content verwenden. Höchstens als future roadmap nach expliziter Prüfung.

### 10. Product scope inflation
**Alte Claims:**
- transit yield, fiat bridge, Uniswap V4 hooks, broad multi-strategy routing

**Aktueller Stand:**
- roadmap territory, nicht Live-Claim

**Korrektur:**
Wenn erwähnt, klar als "next" oder "planned", nicht als current capability.

---

## Priorisierte Sofort-To-dos

### P1
1. Medium-Artikel veröffentlichungsbereit machen mit den obigen Korrekturen und den alten Draft ersetzen.
2. Reddit-Drafts in einzelne Files splitten: `ethdev.md`, `defi.md`, `base.md`, `technical-alt.md`.
3. Überall "verified on Basescan" entfernen.
4. Überall "open source" und "MIT" entfernen, bis die Lizenzlage geklärt ist.
5. APY-Aussagen vereinheitlichen oder komplett aus Launch-Posts rausnehmen.

### P2
6. Discord Announcement, FAQ, Welcome und Prompt in eigene Content-Files schreiben, damit sie direkt einsetzbar sind.
7. Einen finalen Asset-Brief für Stitch in einen separaten Design-Handoff auslagern.
8. Produktclaims zusätzlich gegen Website-Texte prüfen, damit Homepage, llms.txt und Social dieselbe Story erzählen.

### P3
9. `llms.txt` auf nicht-live Referral- und Team-Claims prüfen.
10. Lizenzposition klären: proprietary vs source-available vs open source. Erst danach GitHub-Messaging scharf schalten.
11. Sobald Basescan Verification nachgezogen ist, erst dann Social proof dazu ergänzen.
