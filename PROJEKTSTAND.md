# Clicks Protocol — Vollständiger Projektstand
**Stand: 07. März 2026 | Erstellt von: Claude (Anthropic)**
**Gründer: David / protogenos | Firma: JOPTIMAL.DE**

---

## Was ist Clicks?

Clicks ist ein On-Chain-Yield-Protokoll für AI-Agenten.

Jedes Mal, wenn ein Agent USDC verdient (via x402 oder einem anderen Payment Rail), splittet Clicks die Zahlung automatisch:
- **80%** → Agent Wallet (sofort, liquid)
- **20%** → Clicks Yield Router → bester verfügbarer DeFi-Yield

Die 20% verdienen Yield (7–10% APY via Aave V3, Morpho, Ondo USDY auf Base). Yield fließt zurück zum Agenten. Kein Lockup. Kein manueller Schritt. Kein Mensch notwendig.

**Protocol Fee:** 2% des generierten Yields (nicht des Principals).

**Pitch in einem Satz:**
> "Tether makes billions sitting on agent transaction float. Clicks gives that money back."

---

## Hintergrund & Inspiration

### Woher kommt die Idee?
- Buck.io-Modell auf die Bot/Agent Economy übertragen
- Agenten verdienen USDC via x402, Auto-Split 80/20
- 20% ins Protocol Treasury → Yield → 7% zurück an Agenten, 2% an Clicks Protocol

### The Attractor Effect (Framework)
Buch von Kwesi Tieku (MadSats), 36 Kapitel. Mapping auf Clicks:

| Attractor Effect Konzept | Clicks Equivalent |
|---|---|
| Borrow-Expand-Accumulate | Earn-Split-Compound für Agenten |
| Servo Mechanism | Yield Router (auto-routes zu bestem APY) |
| Blackhole Model | Mehr Agenten = mehr TVL = bessere DeFi-Rates = mehr Agenten |
| 80% Liquid Rule | Eingebauter negativer Feedback Loop (Stabilität) |
| Network Gravity | Jeder neue Agent stärkt den Yield für alle bestehenden Agenten |

**Agent Attractor Loop:**
```
Agent verdient USDC → 80% liquid → 20% Yield Router
→ 7-10% APY → Yield zurück zum Agenten
→ mehr Kaufkraft → mehr Tasks → mehr USDC → [repeat]
```

**Clicks Black Hole:**
```
Mehr Agenten → mehr TVL → bessere DeFi Rates → höherer Yield
→ attraktiver → mehr Agenten → [self-reinforcing]
```

---

## Architektur

```
Agent Wallet
    │
    ▼
ClicksSplitterV3.sol        ← Eingang, empfängt USDC
    │
    ├── 80% → Agent Wallet (sofort)
    │
    └── 20% → ClicksYieldRouter.sol
                    │
                    ├── liest APY von: Aave V3 / Morpho
                    ├── routed zu höchster Yield-Quelle
                    └── emittiert Events für Indexing
                            │
                            ▼
                    ClicksFee.sol           ← sammelt 2% des Yields
                            │
                            ▼
                    Yield zurück zum Agenten ← jederzeit abhebbar
```

---

## Deployed Contracts (Base Sepolia Testnet — V1/V2 Referenz)

| Contract | Adresse | Status |
|---|---|---|
| ClicksSplitter (v1) | `0x8DFf3Dd014B7E840A22a1087DD59813685c13d71` | ✅ Verified |
| ClicksYield (v2 mit Aave V3) | `0xF2612539360D70123A5dB4215670a7D743E770C0` | ✅ Verified |

**David's MetaMask:** `0x9059103DBeC5b4Ed7cD361b069102a9C71CD9Fd8`
**Network:** Base Sepolia (Chain ID: 84532)
**Aave V3 Pool Base Sepolia:** `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

---

## Externe Protocol-Adressen

| Protocol | Contract | Network |
|---|---|---|
| Aave V3 Pool | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` | Base Mainnet |
| Aave V3 Pool | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` | Base Sepolia |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Base Mainnet |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia |
| Morpho Blue | `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` | Base Mainnet |

---

## Repo-Struktur

```
clicks-protocol/
├── AGENTS.md                       ← Claude Code Kontext-Datei
├── README.md
├── hardhat.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
│
├── contracts/
│   ├── interfaces/
│   │   ├── IYieldRouter.sol        ✅ Task 1.1 — fertig
│   │   ├── IAaveV3Pool.sol         ✅ Task 1.2 — fertig
│   │   └── IMorpho.sol             ✅ Task 1.3 — fertig
│   ├── ClicksYieldRouter.sol       ✅ Task 1.4 — fertig
│   ├── ClicksFee.sol               ✅ Task 1.5 — fertig
│   ├── ClicksRegistry.sol          ✅ Task 1.6 — fertig
│   ├── ClicksSplitterV3.sol        ✅ Task 1.7 — fertig
│   └── test/
│       └── Mocks.sol               ✅ MockERC20, MockAavePool, MockMorpho
│
├── test/
│   └── ClicksProtocol.test.ts      ✅ Task 1.8 — ~40 Tests
│
├── scripts/
│   ├── deploy.ts                   ✅ Task 1.9 — fertig
│   └── verify.ts                   ✅ Task 1.9 — fertig
│
└── sdk/
    ├── package.json
    ├── README.md
    └── src/
        ├── index.ts                ✅ Task 2.1 — fertig
        ├── types.ts                ✅ Task 2.1 — fertig
        ├── abis.ts                 ✅ Task 2.4 — fertig
        ├── ClicksClient.ts         ✅ Task 2.2 — fertig
        └── middleware.ts           ✅ Task 2.3 — x402 Middleware fertig
```

---

## Contracts im Detail

### IYieldRouter.sol (Task 1.1)
Interface für alle Yield-Adapter. Definiert:
- `deposit(uint256 amount) returns (uint256 shares)`
- `withdraw(uint256 amount) returns (uint256 received)`
- `getAPY() returns (uint256 apyBps)`
- `getTotalBalance() returns (uint256)`
- `getAgentBalance(address agent) returns (uint256)`
- `getProtocolAddress() returns (address)`
- `name() returns (string)`

### IAaveV3Pool.sol (Task 1.2)
Minimales Interface für Aave V3:
- `supply(asset, amount, onBehalfOf, referralCode)`
- `withdraw(asset, amount, to) returns (uint256)`
- `getReserveData(asset) returns (ReserveData)`
- Vollständiger `ReserveData` Struct inkl. `currentLiquidityRate` (ray = 1e27)

### IMorpho.sol (Task 1.3)
Minimales Interface für Morpho Blue:
- `supply(marketParams, assets, shares, onBehalf, data)`
- `withdraw(marketParams, assets, shares, onBehalf, receiver)`
- `market(id) returns (Market)`
- `position(id, account) returns (Position)`
- `id(marketParams) returns (bytes32)`

### ClicksYieldRouter.sol (Task 1.4)
Multi-Venue Router:
- Vergleicht Aave V3 und Morpho APY on-chain bei jedem Deposit
- Routed zu höchstem Yield-Protokoll
- Rebalancing NUR wenn APY-Differenz > 50bps (0.5%) — spart Gas
- Per-Agent Buchführung: `agentDeposited[address]`
- `REBALANCE_THRESHOLD = 50` (basis points)
- Events: `Deposited`, `Withdrawn`, `Rebalanced`
- Admin: `setSplitter()`, `setMorphoMarketParams()`, `rescueTokens()`
- Aave APY Berechnung: `liquidityRate (ray) * BPS / RAY`
- Morpho APY Berechnung: konservative Schätzung via Utilization Rate

### ClicksFee.sol (Task 1.5)
Protocol Fee Collector:
- Empfängt 2% des Yields von `ClicksSplitterV3`
- `collectFee(agent, amount)` — nur authorized callers
- `sweep()` — sweept alle USDC zur Treasury (jeder kann aufrufen)
- `sweepAmount(amount)` — Owner-only
- `pendingFees()` — View: aktueller USDC-Balance
- `totalCollected` — kumulierte Fees seit Deploy

### ClicksRegistry.sol (Task 1.6)
Agent→Operator Mapping:
- `registerAgent(agent)` — Operator registriert seinen Agenten
- `deregisterAgent(agent)` — nur der Operator oder Owner
- O(1) Removal via Swap-and-Pop Pattern
- `isRegistered(agent) returns (bool)`
- `getOperator(agent) returns (address)`
- `getAgents(operator) returns (address[])`
- `totalAgents` Counter

### ClicksSplitterV3.sol (Task 1.7)
Haupt-Eingang des Protokolls:
- `FEE_BPS = 200` (2% auf Yield)
- `defaultYieldPct = 20` (20% ins Yield Routing)
- `MIN_YIELD_PCT = 5`, `MAX_YIELD_PCT = 50`
- `receivePayment(amount, agent)` — Hauptfunktion
- `withdrawYield(agent, amount)` — Abheben mit Fee-Abzug
- `simulateSplit(amount, agent)` — View, kein TX
- Unregistrierte Agenten erhalten Default-Split (20%)
- Operatoren können Custom-Split setzen via `setOperatorYieldPct()`

---

## SDK (@clicks-protocol/sdk)

### ClicksClient (Task 2.2)
```typescript
class ClicksClient {
  constructor(signer: ethers.Signer, config: ClicksConfig)
  async receivePayment(amount: bigint, agent: string): Promise<PaymentResult>
  async withdrawYield(agent: string, amount?: bigint): Promise<WithdrawResult>
  async simulateSplit(amount: bigint, agent: string): Promise<SplitResult>
  async getAPYs(): Promise<APYInfo>  // { aave, morpho, current } in BPS
  async getDeposited(agent: string): Promise<bigint>
  async getTotalBalance(): Promise<bigint>
  async getYieldPct(agent: string): Promise<number>
}
```

### x402 Middleware (Task 2.3)
```typescript
app.use(clicksMiddleware({
  config: { network: "base" },
  signer,
  agentAddress: process.env.AGENT_ADDRESS!,
}));
```
Interceptet `x-payment-amount` Header und routed durch Clicks.

### Exports (Task 2.4)
- `ClicksClient`
- `clicksMiddleware`
- `SPLITTER_ABI`, `ROUTER_ABI`, `REGISTRY_ABI`
- Alle TypeScript-Types: `ClicksConfig`, `Network`, `SplitResult`, `APYInfo`, `PaymentResult`, `WithdrawResult`

---

## Test-Suite (Task 1.8)

**~40 Tests total in `test/ClicksProtocol.test.ts`**

### ClicksRegistry Tests (8 Tests)
- ✅ Operator kann Agent registrieren
- ✅ Revert bei Zero-Address
- ✅ Revert bei bereits registriertem Agent
- ✅ Operator kann Agent deregistrieren
- ✅ Revert bei Deregistrierung durch Nicht-Operator
- ✅ Total Agent Count korrekt
- ✅ Mehrere Agenten pro Operator
- ✅ getAgents() gibt korrekte Liste zurück

### ClicksFee Tests (6 Tests)
- ✅ Authorized caller kann Fee collecten
- ✅ Revert bei unauthorized caller
- ✅ Sweep geht zur Treasury
- ✅ Revert bei leerem Sweep
- ✅ Owner kann Treasury updaten
- ✅ Revert bei Zero-Address Treasury

### ClicksSplitterV3 Tests (10 Tests)
- ✅ Split 80/20 default
- ✅ 20% geht zum Yield Router
- ✅ PaymentReceived Event mit korrekten Werten
- ✅ Revert bei Amount = 0
- ✅ Revert bei Zero-Address Agent
- ✅ Operator kann Custom Yield Percentage setzen
- ✅ Revert bei zu niedrigem Yield-Prozentsatz
- ✅ Revert bei zu hohem Yield-Prozentsatz
- ✅ simulateSplit gibt korrekte Werte
- ✅ 2% Fee auf Yield bei Withdrawal

### Math Edge Cases (3 Tests)
- ✅ Minimum Payment (1 USDC)
- ✅ Large Payment (1M USDC)
- ✅ liquid + yield summiert immer zu total

### Mock Contracts (Mocks.sol)
- `MockERC20` — Mintable ERC20, 6 Decimals
- `MockAavePool` — Simulates Aave V3, 1:1 aToken Mint, `currentLiquidityRate = 7e25` (7% APY)
- `MockMorpho` — Simulates Morpho Blue, Share-based Tracking

---

## Deploy Scripts (Task 1.9)

### deploy.ts
Deploy-Reihenfolge: Registry → Fee → Router → Splitter
Dann automatisches Wiring:
- `router.setSplitter(splitterAddr)`
- `fee.setAuthorized(splitterAddr, true)`
Speichert alle Adressen in `deployments/{network}.json`

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
npx hardhat run scripts/deploy.ts --network base  # nur nach Cyprus-Struktur!
```

### verify.ts
Liest `deployments/{network}.json` und verifiziert alle Contracts auf Basescan automatisch.

```bash
npx hardhat run scripts/verify.ts --network base-sepolia
```

---

## Environment Variables

```env
PRIVATE_KEY=                    # Deployer Wallet
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=               # von basescan.org/apis
TREASURY_ADDRESS=               # wo Protocol Fees hingehen
FORK=false                      # "true" für lokalen Fork in Tests
REPORT_GAS=false                # "true" für Gas-Kosten in Tests
```

---

## Strategische Entscheidungen (gefallen)

| Entscheidung | Was | Warum |
|---|---|---|
| Kein STRC | STRC ist Nasdaq Preferred Stock, nicht on-chain | Smart Contracts können STRC nicht direkt kaufen |
| Aave + Morpho | Backend für Yield Router | Battle-tested, auf Base, gute APYs |
| Kein n8n | OpenClaw statt n8n | Direkte Claude API, keine Middleware |
| Solo Build | Kein Community Sharing vor Launch | Competitive Window 12-18 Monate, Speed > Feedback |
| Cyprus + El Salvador | Rechtliche Struktur | EU-Rahmen (Cyprus Holding) + Ops-Steuer (El Salvador) |
| Mainnet erst nach Cyprus | Keine Mainnet-Deploy vor Steuerstruktur | Sauber, kein deutsches Steuerrisiko |

---

## Launch Roadmap

| Zeitraum | Milestone |
|---|---|
| **Woche 1** | ClicksYield v3 Contract (Multi-Venue Router) + Base Sepolia Deploy |
| **Woche 2** | clicks-sdk npm Package (first draft) |
| **Woche 3** | Landing Page live |
| **Woche 4** | Cyprus Struktur eingeleitet + Base Ecosystem Grant beantragt |
| **Monat 2** | Soft Launch — erste echte Agenten ongeboardet |

---

## Offene Task-Liste

### Phase 1 — Contracts ✅ FERTIG
- [x] Task 1.1 — IYieldRouter.sol
- [x] Task 1.2 — IAaveV3Pool.sol
- [x] Task 1.3 — IMorpho.sol
- [x] Task 1.4 — ClicksYieldRouter.sol
- [x] Task 1.5 — ClicksFee.sol
- [x] Task 1.6 — ClicksRegistry.sol
- [x] Task 1.7 — ClicksSplitterV3.sol
- [x] Task 1.8 — Test Suite (~40 Tests)
- [x] Task 1.9 — Deploy + Verify Scripts

### Phase 2 — SDK (teilweise fertig)
- [x] Task 2.1 — npm Package Struktur
- [x] Task 2.2 — ClicksClient.ts
- [x] Task 2.3 — x402 Middleware
- [x] Task 2.4 — ABI Exports
- [x] Task 2.5 — SDK README
- [ ] Task 2.6 — npm publish (nach Mainnet-Deploy)

### Phase 3 — API (noch offen)
- [ ] Task 3.1 — Express Server Skeleton
- [ ] Task 3.2 — `POST /split` Endpoint
- [ ] Task 3.3 — `GET /yield/:agentAddress` Endpoint
- [ ] Task 3.4 — Webhook Service für Yield Events

### Weitere offene Punkte
- [ ] `npx hardhat compile` + `npx hardhat test` lokal ausführen (npm nicht verfügbar in Claude Code Umgebung)
- [ ] Base Sepolia Deploy mit echten Adressen (nach Testnet-Bestätigung)
- [ ] AGENTS.md Current Status updaten nach jedem Deploy
- [ ] Cyprus Steuerstruktur einleiten
- [ ] Base Ecosystem Grant beantragen
- [ ] Landing Page (Production-Version des bestehenden Demos)
- [ ] Travis VanderZanden Outreach (on hold — David baut solo)
- [ ] salt_cx Follow-up (Virtuals Discord — on hold)
- [ ] PROTEENINJECTOR Follow-up (CDP Discord — on hold)

---

## Bestehende Demo & Dokumente (aus früheren Sessions)

| Dokument | Beschreibung |
|---|---|
| `clicks-demo.html` | Interaktive Demo mit Attractor Loop Chart, Network Gravity Chart, USDC Slider |
| `clicks-pitch-deck.html` | Pitch Deck |
| `agent-yield-protocol.html` | Protocol Overview |
| `AGENTS.md` | Claude Code Kontext-Datei (Aufgaben-Queue für autonome Arbeit) |
| `clicks-protocol.zip` | Vollständiger Repo-Scaffold (dieser Download) |

### Demo Features (clicks-demo.html)
- USDC Amount Slider ($10–$10,000)
- Treasury Split Toggle (10% / 20% / 30%)
- Yield Source Selector: Aave V3 (7%), Morpho (9%), Ondo USDY (5%), Auto-Router (best)
- Live Split Visualisierung (liquid vs. yield)
- Yield Projektionen (30d / 1y / 3y compound)
- Flow Diagram: Agent → Clicks → Wallet / Yield Router
- Attractor Loop Chart: 36-Monats Canvas Chart (compound vs. linear)
- Network Gravity Chart: Agent Slider (1–10,000), APY Boost, TVL, Gravity Score
- Self-Feeding Loop Diagram
- Contract-Adressen angezeigt

---

## Tech Stack

- **Solidity** ^0.8.20
- **OpenZeppelin** 5.x (SafeERC20, ReentrancyGuard, Ownable, AccessControl)
- **Hardhat** + Ethers v6
- **TypeScript** (strict mode)
- **Base** (L2 auf Ethereum)
- **Aave V3** (primärer Yield Source)
- **Morpho Blue** (sekundärer Yield Source)
- **x402** (Payment Rail für Agenten)

---

## Nächste konkrete Schritte

1. **Lokal ausführen:**
   ```bash
   cd clicks-protocol
   npm install
   npx hardhat compile
   npx hardhat test
   ```

2. **Wenn Tests grün:**
   ```bash
   cp .env.example .env
   # PRIVATE_KEY, RPC_URL, TREASURY_ADDRESS eintragen
   npm run deploy:sepolia
   npm run verify
   ```

3. **Nach erfolgreichem Testnet-Deploy:**
   - AGENTS.md Current Status updaten
   - Phase 2 SDK finalisieren (npm publish)
   - Landing Page starten

---

*Erstellt: 07. März 2026 | Clicks Protocol | protogenos / JOPTIMAL.DE*
