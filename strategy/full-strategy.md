# Clicks Protocol — Komplette Strategie

> Datum: 2026-03-14
> Status: Entwurf (David Review pending)

---

## A) Competitive Landscape

### Direkte Konkurrenz: Yield auf Agent Treasury

| Player | Was | Status | Unterschied zu Clicks |
|--------|-----|--------|----------------------|
| **RebelFi** | "Programmable Stablecoin Infrastructure". Blog-Post vom 03.03.2026: "AI Agents Need Yield-Aware Accounts, Not Just Wallets" | Blog + API, kein öffentliches Produkt sichtbar | B2B API (2-4 Wochen Integration), Enterprise-fokussiert, Compliance-heavy. Clicks = Developer-first (npm install, 3 Zeilen) |
| **Coinbase Agentic Wallets** | Base Chain Wallets für Agents. x402 Protokoll. 50M+ Transactions | Live seit Feb 2026. Hat "Earning" Skill aber unklar ob aktives Yield Routing | Massive Distribution (Coinbase Ecosystem). Clicks könnte sich IN Coinbase Wallets integrieren statt gegen sie zu kämpfen |

### Indirekte Konkurrenz: Agent Payment Infrastructure

| Player | Was | Relevanz |
|--------|-----|----------|
| **AgentCard (.ai/.sh)** | Prepaid Virtual Visa für Agents. MCP Server. 1000 Beta Slots | Spending Layer. Komplementär zu Clicks (Clicks = Earning) |
| **MoonPay Agents** | Non-custodial Wallets, KYC, x402 | Wallet + Spending. Kein Yield |
| **Google AP2 Protocol** | Payment Authorization für Agents. Visa, Mastercard, Stripe, Adyen | Standard-Layer. Clicks könnte AP2-kompatibel werden |
| **Mastercard Agent Pay** | "Verifiable Intent" System | Fiat-Rail für Agents. Zukunfts-Integration |

### Marktdaten

- Stablecoin Transaction Volume 2025: **$46 TRILLION**
- Gartner: Machine Customers → **$30 TRILLION** annual purchases by 2030
- McKinsey: **$3-5 TRILLION** agentic commerce by 2030
- Coinbase x402: **50M+ Transactions** processed

### Einschätzung

**Clicks hat KEINEN direkten Konkurrenten der live ist.**

RebelFi schreibt Blog-Posts über das Problem, hat aber kein öffentliches Produkt. Coinbase hat Wallets aber kein dediziertes Yield-Routing für idle Balances. AgentCard/MoonPay/AP2 sind Spending, nicht Earning.

**Unsere Position: Einziges live deploytes, open-source Yield-Routing Protokoll für AI Agent Treasuries auf Base.**

**Risiko:** Coinbase könnte Yield-Routing als Feature in ihre Agentic Wallets einbauen. Dagegen hilft: Open Source, Protocol-Level (nicht Feature-Level), Multi-Chain Expansion, Community/Referral Netzwerk.

---

## B) AgentCard Integration

### Technische Integration

```
Agent verdient USDC
    │
    ├── 80% → Agent Wallet (liquid)
    │            │
    │            ├── Agent braucht Geld → AgentCard.createCard(amount)
    │            │                           │
    │            │                           └── Virtual Visa → Payment
    │            │
    │            └── Agent braucht KEIN Geld → idle
    │
    └── 20% → Clicks Yield Router → Aave/Morpho
                 │
                 └── Agent braucht mehr als 80%?
                      → clicks.withdrawYield() → top up AgentCard
```

### SDK-Level Integration

```typescript
// Clicks + AgentCard Combined
import { ClicksClient } from '@clicks-protocol/sdk';
import { AgentCards } from 'agent-cards';

const clicks = new ClicksClient(signer);
const cards = new AgentCards({ jwt: process.env.AGENT_CARDS_JWT });

// Agent receives payment → auto-yield
await clicks.receivePayment('1000', agentAddress);
// 800 USDC liquid, 200 USDC earning yield

// Agent needs to buy something
const card = await cards.create({ amount: 50 });
// Creates $50 virtual Visa from liquid balance

// Agent needs more than liquid balance
const yieldBalance = await clicks.getAgentInfo(agentAddress);
await clicks.withdrawYield(agentAddress, '200');
const bigCard = await cards.create({ amount: 200 });
```

### MCP-Level Integration

Clicks MCP Server + AgentCard MCP Server können parallel laufen. Agent hat beide Tools:
- `clicks_deposit` / `clicks_withdraw` / `clicks_status`
- `agentcard_create` / `agentcard_balance` / `agentcard_list`

### Timeline

- **Phase 1 (Launch):** Clicks und AgentCard als separate Tools
- **Phase 2 (3 Monate):** Combined SDK wrapper `@clicks-protocol/agent-finance`
- **Phase 3 (6 Monate):** Auto-Sweep: Agent setzt Threshold, alles über X USDC geht automatisch in Clicks Yield

---

## C) Go-to-Market: Erste 100 Agents

### Reihenfolge der Breadcrumbs

| Woche | Aktion | Erwartete Agents |
|-------|--------|-----------------|
| 1 | npm publish + GitHub public + Landing Page live | 0-5 (Early Discoverers) |
| 2 | MCP Server auf MCPMarket + LobeHub listen | 5-15 |
| 3 | ClawHub Skill publishen | 15-25 |
| 4 | Base Chain Ecosystem Post + DeFi Twitter Thread | 25-50 |
| 5-6 | Composio Plugin + Framework Default PRs | 50-80 |
| 7-8 | ClicksReferral live → MLM Effekt | 80-100+ |

### Welche Frameworks zuerst?

| Framework | Warum | Integration |
|-----------|-------|-------------|
| **OpenClaw/Claude Code** | Wir nutzen es selbst. Proof of Concept. | ClawHub Skill + MCP |
| **LangChain** | Größte Community, meiste Agents | Tool Integration |
| **CrewAI** | Multi-Agent Focus, passt zu unserer Architektur | Tool Integration |
| **AutoGPT** | Hohe Sichtbarkeit, viele Fork-Projekte | Plugin |
| **Coinbase AgentKit** | Direkt auf Base, gleiche Chain | SDK Integration |

### Erste 10 Agents manuell

Die ersten 10 Agents bringen wir NICHT über Breadcrumbs. Sondern:
1. Unser eigener Trading Bot (läuft schon)
2. OpenClaw Emma (wir selbst)
3. AgentCard Team kontaktieren (Partnership)
4. 3-5 Base Chain Projekte direkt anschreiben
5. 2-3 DeFi Twitter Influencer mit eigenen Bots

---

## D) Token Economics

### Braucht Clicks einen Token?

**Kurzfristig: NEIN.**

Gründe dagegen:
- Token = Regulierung (Securities Law)
- Token = Ablenkung vom Produkt
- Token ohne Utility = Scam-Signal
- Wir haben keine Community die einen Token braucht

**Langfristig: MÖGLICH, aber nur mit klarer Utility.**

Mögliche Token-Utility:
1. **Governance:** ClicksDAO stimmt über Yield-Strategien ab, neue DeFi-Integrationen, Fee-Änderungen
2. **Fee Discount:** Token-Holder zahlen 1% statt 2% Protocol Fee
3. **Staking:** Token staken → Anteil an Protocol Fees
4. **Yield Discovery Rewards:** Token als Belohnung für Yield Discovery Bounties

### Empfehlung

**Launch OHNE Token.** Protocol Fee (2% auf Yield) ist das Business Model. Einfach, klar, keine regulatorischen Probleme.

Token-Launch erst wenn:
- TVL > $5M
- Community > 500 Agents
- Klare Governance-Fragen die dezentral entschieden werden müssen
- Rechtsrahmen geklärt (Cyprus/Jurisdiktion)

---

## E) Pricing / Fee Model

### Aktuelle Struktur

- 2% Protocol Fee auf Yield only
- Nie auf Principal
- Kein Lockup
- Kein Minimum

### Marktvergleich

| Protokoll | Fee Model |
|-----------|-----------|
| Aave | 0% für Depositors (Protocol verdient an Borrowers) |
| Yearn | 20% Performance Fee + 2% Management Fee |
| Beefy | 4.5% Performance Fee |
| Compound | 0% für Depositors |
| Clicks | 2% Performance Fee (nur auf Yield) |

### Analyse

**2% auf Yield ist SEHR günstig** im Vergleich zu Yearn (20%) und Beefy (4.5%).

Aber: Clicks routet "nur" zu Aave/Morpho. Der Value-Add ist Automatisierung + Auto-Routing, nicht Alpha-Generierung. 2% für Automatisierung ist fair.

### Szenarien

| TVL | APY | Annual Yield | 2% Fee = Revenue |
|-----|-----|-------------|-----------------|
| $100K | 7% | $7,000 | $140/Jahr |
| $1M | 7% | $70,000 | $1,400/Jahr |
| $5M | 7% | $350,000 | $7,000/Jahr |
| $50M | 7% | $3,500,000 | $70,000/Jahr |
| $500M | 7% | $35,000,000 | $700,000/Jahr |

### Empfehlung

**2% ist richtig für den Start.** Günstig genug dass es niemanden abschreckt, hoch genug dass es bei Skalierung Revenue generiert.

Optionen für später:
- Tiered Fees: >$1M TVL → 1.5%, >$10M → 1%
- Referral Fee Share: 70% an Referrer (L1/L2/L3), 30% an Treasury
- Team Bonus: Bronze-Diamond Teams bekommen Fee Discount

---

## F) Zusammenfassung + Prioritäten

### Was ist Clicks?

**Clicks ist das Sparkonto für AI Agents.** AgentCard ist die Debit Card. Coinbase Wallet ist das Girokonto. Clicks ist der Teil der arbeitet wenn der Agent nicht ausgeben muss.

### Competitive Moat (Burggraben)

1. **First Mover:** Einziges live Protocol für Agent Yield auf Base
2. **Open Source:** Fork-bar, auditierbar, vertrauenswürdig
3. **Referral Network:** MLM-Effekt (ClicksReferral), exponentielles Wachstum
4. **ADO Breadcrumbs:** 15 Köder, Agent-first Discovery
5. **Developer Experience:** npm install + 3 Zeilen Code

### Größte Risiken

1. **Coinbase baut es selbst** → Mitigation: Open Source Protocol > Feature in Wallet
2. **Smart Contract Exploit** → Mitigation: Audit, Bug Bounty, Insurance
3. **Regulierung** → Mitigation: Kein Token, nur Protocol Fee, Non-custodial
4. **Kein Markt** → Mitigation: AgentCard, Coinbase, MoonPay validieren den Markt

### Prioritäten (nächste 30 Tage)

| # | Was | Warum | Deadline |
|---|-----|-------|----------|
| 1 | ClicksReferral compilieren + testen | MLM-Effekt ist der Wachstumsmotor | Diese Woche |
| 2 | npm publish | Ohne npm kein Discovery | Diese Woche |
| 3 | Landing Page Redesign | IAP + Agent Commerce Positioning | Diese Woche |
| 4 | MCP Server | Agent-native Discovery | Nächste Woche |
| 5 | ClawHub Skill | OpenClaw Ecosystem | Nächste Woche |
| 6 | quickStart() Method | 3 Calls → 1 Call | Nächste Woche |
| 7 | AgentCard Team kontaktieren | Partnership | Woche 3 |
| 8 | Base Ecosystem Post | Community Awareness | Woche 3 |
| 9 | Framework PRs (LangChain, CrewAI) | Distribution | Woche 4 |
| 10 | Testnet Mode im SDK | Developer Onboarding | Woche 4 |
