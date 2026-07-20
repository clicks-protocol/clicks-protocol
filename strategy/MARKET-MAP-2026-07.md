# Market Map 2026-07

**Status:** Draft 2026-07-13
**Purpose:** Separate true competitors from adjacent stacks and likely integration targets.

---

## Reading rule

Most projects in this market are **not** direct competitors to Clicks.

Clicks competes narrowly in:
- post-payment settlement
- treasury policy
- identity-aware routing

Everything else should first be tested as:
- upstream payment source
- downstream venue
- distribution channel
- partner surface

## Category map

### 1. Payment rails and facilitators

These projects help value move in.

They are mostly upstream of Clicks.

| Project | What it appears to do | Clicks relationship |
|--------|------------------------|---------------------|
| `coinbase/x402` | HTTP-native payments protocol | **Integration target** |
| Cloudflare Monetization Gateway | Paywalled API routes and monetization policy over x402 | **Integration target** |
| XRPL x402 Facilitator / XRPL AI Hub | Discovery and pay-per-call infra for agent services | **Adjacent + model to learn from** |
| OpenX402 | Facilitator / registration surface | **Integration target** |

### 2. Paid services and agent vendors

These prove demand for agent commerce.

They can become customers, partners, or reference cases.

| Project | What it appears to do | Clicks relationship |
|--------|------------------------|---------------------|
| LastLook Data | Sells financial data via x402 on Base | **High-value integration target** |
| Seal / heysealai | x402-powered workflow builder for paid skills | **Integration target** |
| Knidos | Agent/payments adjacent brand signal, likely service layer | **Watchlist** |
| ARC Terminal | Agent interface / ops layer signal | **Watchlist** |

### 3. Wallet, execution, and agent shell products

These are not the treasury-policy layer. They are the surface or wallet shell around it.

| Project | What it appears to do | Clicks relationship |
|--------|------------------------|---------------------|
| three.ws | Agent presence, wallets, embeddable interaction, earning rails | **Strong integration target** |
| Finance District Agent Wallet | Hold, send, swap, earn for agents | **Adjacent, maybe downstream partner** |
| liminalcash | Financial agent for money movement and workflows | **Adjacent** |
| Searxly | Local-first agentic browser/wallet environment | **Distribution surface** |

### 4. Settlement, trust, and decision layers

This is the closest long-term strategic neighborhood for Clicks.

| Project | What it appears to do | Clicks relationship |
|--------|------------------------|---------------------|
| GenLayer | Adjudication / decision layer for agentic flows | **Adjacent, future integration target** |
| Kor Protocol | Rights, identity, licensing, payouts for AI-native media assets | **Adjacent, domain-specific analog** |
| IXS Finance | Finance infrastructure, likely structured flows around capital | **Adjacent** |

### 5. Markets, issuance, and speculative products

These are useful for market awareness, but not where Clicks should anchor its positioning.

| Project | What it appears to do | Clicks relationship |
|--------|------------------------|---------------------|
| POVMarket | Opinion markets | **Peripheral** |
| SailboatFi | Trading interface | **Peripheral** |
| CoinHeroFun / B20 launcher / launcher tools | Token launch and distribution flows | **Peripheral** |
| RunePool | Dynamic signal only, not enough verified technical evidence | **Weak signal** |

## Direct competitors

Right now, I see **very few clean direct competitors** to Clicks as currently positioned.

A direct competitor would need all of this:
- receive or observe agent revenue
- manage liquid vs routed treasury state
- encode treasury policy
- connect settlement behavior to agent identity or trust

Most visible projects only do one or two of those.

### Closest competitive pressure

1. **Wallet suites that add treasury automation**
   - three.ws
   - Finance District
   - future agent wallets

2. **Payment layers that climb upward into post-payment logic**
   - x402 ecosystem if it expands into treasury policy directly

3. **Yield wrappers that add identity and control**
   - not a clear leader yet, but this could appear quickly

## Strongest integration targets

### Tier 1

- `coinbase/x402`
- Cloudflare Monetization Gateway
- LastLook Data
- XRPL AI Hub / Facilitator
- three.ws

### Tier 2

- Seal
- Finance District
- GenLayer
- OpenX402

### Tier 3

- Knidos
- ARC Terminal
- Kor Protocol

## What the market is telling us

### Signal 1

**Payments are standardizing faster than settlement.**

That supports Clicks.

### Signal 2

**Discoverability matters.**

XRPL AI Hub is an important clue. Agent services need directory surfaces, not just endpoints.

### Signal 3

**Wallets are getting crowded.**

Clicks should stay out of generic wallet-product positioning unless it is directly in service of treasury policy.

### Signal 4

**Trust and adjudication are emerging.**

GenLayer and adjacent systems suggest the market will care about evidence, not just payment success.

## Strategic conclusion

Clicks should define its lane as:

`ingress-compatible settlement + treasury policy + identity-aware agent finance`

not:

- generic wallet
- generic payment rail
- generic yield app

## Recommended partner posture

### Pitch to payment stacks

“Use Clicks after payment acceptance.”

### Pitch to agent vendors

“Use Clicks to manage post-payment treasury behavior.”

### Pitch to identity and trust systems

“Use Clicks as the settlement layer that can consume identity and emit receipts.”

## Next map to build

After this file, the useful next step is a live target table with:
- URL
- contact route
- category
- why they matter
- current status
- next action
