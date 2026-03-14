# AGENTS.md — Clicks Protocol
# Claude Code Operational Context

> Read this file completely before touching any code.
> Update the CURRENT STATUS section after every session.

---

## What is Clicks?

Clicks is an on-chain yield protocol for AI agents.

Every time an agent receives USDC (via x402 or any payment rail), Clicks
automatically splits the payment:
- 80% → agent wallet (liquid, immediately spendable)
- 20% → Clicks Yield Router → routed to best available DeFi yield

The 20% earns yield (7–10% APY via Aave V3, Morpho, Ondo USDY on Base).
Yield flows back to the agent. No lockup. No manual steps. No human required.

Protocol fee: 2% of yield generated (not of principal).

Pitch in one line:
"Tether makes billions sitting on agent transaction float. Clicks gives that money back."

---

## Architecture Overview

```
Agent Wallet
    │
    ▼
ClicksSplitter.sol          ← entry point, receives USDC
    │
    ├── 80% → Agent Wallet (immediate)
    │
    └── 20% → ClicksYieldRouter.sol
                    │
                    ├── reads APY from: Aave V3 / Morpho / Ondo
                    ├── routes to highest yield source
                    └── emits events for indexing
                            │
                            ▼
                    ClicksFee.sol           ← collects 2% of yield
                            │
                            ▼
                    yield back to agent     ← withdrawable anytime
```

---

## Repo Structure

```
clicks-protocol/
├── AGENTS.md                   ← this file
├── contracts/
│   ├── ClicksSplitter.sol      ← MVP v1 (DEPLOYED — DO NOT MODIFY)
│   ├── ClicksYield.sol         ← MVP v2 with Aave (DEPLOYED — DO NOT MODIFY)
│   ├── ClicksYieldRouter.sol   ← v3 multi-venue (TO BUILD)
│   ├── ClicksFee.sol           ← protocol fee collector (TO BUILD)
│   ├── ClicksRegistry.sol      ← agent registry (TO BUILD)
│   └── interfaces/
│       ├── IYieldRouter.sol
│       ├── IAaveV3Pool.sol
│       ├── IMorpho.sol
│       └── IOndo.sol
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── test/
│   ├── ClicksYieldRouter.test.ts
│   ├── ClicksFee.test.ts
│   └── fixtures/
├── sdk/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── ClicksClient.ts
│   │   └── types.ts
│   └── README.md
├── api/
│   ├── server.ts
│   └── routes/
│       ├── split.ts
│       └── yield.ts
├── hardhat.config.ts
├── package.json
└── .env.example
```

---

## Deployed Contracts (Base Sepolia Testnet)

| Contract          | Address                                      | Status        |
|-------------------|----------------------------------------------|---------------|
| ClicksSplitter    | 0x8DFf3Dd014B7E840A22a1087DD59813685c13d71   | ✅ Verified    |
| ClicksYield (v2)  | 0xF2612539360D70123A5dB4215670a7D743E770C0   | ✅ Verified    |

David's wallet:  0x9059103DBeC5b4Ed7cD361b069102a9C71CD9Fd8
Network:         Base Sepolia (Chain ID: 84532)

DO NOT modify or redeploy the above contracts.
They exist as proof-of-concept and community reference.

Mainnet deployment requires Cyprus legal structure — coordinate with David first.

---

## External Protocol Addresses (Base Mainnet)

| Protocol        | Contract                                     | Notes                      |
|-----------------|----------------------------------------------|----------------------------|
| Aave V3 Pool    | 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5   | Base mainnet                |
| Aave V3 Pool    | 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951   | Base Sepolia (testnet)      |
| USDC (Base)     | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913   | Base mainnet                |
| USDC (Sepolia)  | 0x036CbD53842c5426634e7929541eC2318f3dCF7e   | Base Sepolia                |
| Morpho (Base)   | 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb  | Base mainnet                |
| Ondo USDY       | verify before use                            | Base — check docs.ondo.fi   |

---

## Tech Stack

- Solidity ^0.8.20
- OpenZeppelin 5.x (SafeERC20, ReentrancyGuard, Ownable, AccessControl)
- Hardhat + Ethers v6
- TypeScript
- Base (L2 on Ethereum)

---

## Current Task Queue

Work through tasks in order. Mark [x] when done.

### Phase 1 — Contracts (Priority: HIGH)

- [ ] **Task 1.1** — Create `interfaces/IYieldRouter.sol`
  Define: `deposit(uint256 amount)`, `withdraw(uint256 amount)`,
  `getAPY() returns (uint256)`, `getBalance() returns (uint256)`

- [ ] **Task 1.2** — Create `interfaces/IAaveV3Pool.sol`
  Minimal interface for `supply()`, `withdraw()`, `getReserveData()`

- [ ] **Task 1.3** — Create `interfaces/IMorpho.sol`
  Minimal interface for Morpho Blue: `supply()`, `withdraw()`, market params

- [ ] **Task 1.4** — Create `ClicksYieldRouter.sol`
  - Reads APY from Aave V3 and Morpho
  - On each deposit: compares rates, routes to highest
  - Stores which protocol holds funds
  - Allows withdraw back to splitter
  - Emits: `Deposited(address agent, uint256 amount, address protocol)`
  - Emits: `Withdrawn(address agent, uint256 amount)`
  - Emits: `Rebalanced(address from, address to, uint256 amount)`

- [ ] **Task 1.5** — Create `ClicksFee.sol`
  - Receives 2% of yield on each withdrawal
  - Owner can sweep to treasury address
  - Emits: `FeeCollected(uint256 amount)`

- [ ] **Task 1.6** — Create `ClicksRegistry.sol`
  - Maps agent address → operator address
  - Operator can register/deregister agents
  - Read: `isRegistered(address agent) returns (bool)`
  - Emits: `AgentRegistered(address agent, address operator)`

- [ ] **Task 1.7** — Update `ClicksSplitter.sol` (v3)
  - Integrate ClicksYieldRouter instead of direct Aave call
  - Integrate ClicksFee
  - Keep 80/20 split logic
  - Make split ratio configurable per operator (default 20%)

- [ ] **Task 1.8** — Write Hardhat test suite
  - Fork Base Sepolia for integration tests
  - Unit test all contracts
  - Test: split math, router decision, fee calculation, edge cases
  - Coverage target: >90%

- [ ] **Task 1.9** — Write deploy scripts
  - Deploy order: Registry → Fee → Router → Splitter
  - Log all addresses to `deployments/{network}.json`
  - Verify on Basescan automatically

### Phase 2 — SDK (Priority: MEDIUM)

- [ ] **Task 2.1** — Initialize `sdk/` as npm package
  - Name: `@clicks-protocol/sdk`
  - TypeScript, ESM + CJS builds
  - Peer deps: ethers ^6, viem (optional)

- [ ] **Task 2.2** — `ClicksClient.ts`
  ```typescript
  class ClicksClient {
    constructor(signerOrProvider, network: 'base' | 'base-sepolia')
    async split(amount: bigint): Promise<TransactionReceipt>
    async getYield(agentAddress: string): Promise<bigint>
    async withdraw(amount: bigint): Promise<TransactionReceipt>
    async getAPY(): Promise<{ aave: number, morpho: number, current: number }>
  }
  ```

- [ ] **Task 2.3** — x402 middleware helper
  ```typescript
  // Usage: app.use(clicksMiddleware({ splitPct: 20 }))
  export function clicksMiddleware(options): RequestHandler
  ```

- [ ] **Task 2.4** — Export ABIs as typed constants

- [ ] **Task 2.5** — Write SDK README with quickstart example

### Phase 3 — API (Priority: LOW, post-contract)

- [ ] **Task 3.1** — Express server skeleton
- [ ] **Task 3.2** — `POST /split` endpoint
- [ ] **Task 3.3** — `GET /yield/:agentAddress` endpoint
- [ ] **Task 3.4** — Webhook service for yield events

---

## Coding Rules

### Solidity
- Solidity version: `^0.8.20` — always explicit, never floating
- Always use `SafeERC20` for token transfers — never raw `transfer()`
- Always use `ReentrancyGuard` on external-facing functions
- Zero-address checks on all constructor and setter params
- No `tx.origin` — use `msg.sender` only
- Emit events for all state changes
- NatSpec comments on all public functions
- No unchecked blocks unless gas-critical and explicitly justified in comments
- Max function complexity: if a function exceeds 40 lines, split it

### TypeScript
- Strict mode always
- No `any` types
- Async/await only — no raw Promise chains
- All errors must be caught and typed
- Document public methods with JSDoc

### Testing
- Every contract function needs at least one positive and one negative test
- Use `loadFixture` for Hardhat test setup
- Name tests: `describe("ClicksYieldRouter") > it("routes to Morpho when APY is higher")`

### Git
- Branch per task: `task/1.4-yield-router`
- Commit message format: `[task 1.4] add ClicksYieldRouter with multi-venue routing`
- Never commit `.env` files
- Always commit `deployments/*.json` after deploy

---

## What NOT to touch

- `contracts/ClicksSplitter.sol` (original v1) — reference only
- `contracts/ClicksYield.sol` (v2) — reference only
- Any file in `/deployments/sepolia.json` — historical record
- David's wallet private key — never hardcode, always `.env`

---

## Environment Variables Required

```env
# .env (never commit this)
PRIVATE_KEY=                    # deployer wallet
BASE_RPC_URL=                   # e.g. from Alchemy or Infura
BASE_SEPOLIA_RPC_URL=           # testnet RPC
BASESCAN_API_KEY=               # for contract verification
TREASURY_ADDRESS=               # where protocol fees go
```

---

## APY Comparison Logic

On-chain APY reads are approximate. Use this approach:

```solidity
// Aave: read from getReserveData() → currentLiquidityRate (ray = 1e27)
uint256 aaveAPY = aavePool.getReserveData(USDC).currentLiquidityRate / 1e9; // to 1e18

// Morpho: read market supply rate from state
uint256 morphoAPY = morphoMarket.supplyRate(); // depends on market

// Route to highest
address target = aaveAPY >= morphoAPY ? address(aaveAdapter) : address(morphoAdapter);
```

Rebalancing: only rebalance if difference > 0.5% to avoid gas waste.

---

## Current Status

```
Last updated:     2026-03-07
Last session:     Initial AGENTS.md creation
Active task:      Task 1.1 — not started

Deployed (Sepolia):
  ClicksSplitter: 0x8DFf3Dd014B7E840A22a1087DD59813685c13d71 ✅
  ClicksYield v2: 0xF2612539360D70123A5dB4215670a7D743E770C0 ✅

Deployed (Mainnet):
  — none yet — (requires Cyprus structure first)

Next milestone:
  All Phase 1 tasks complete → internal test on Base Sepolia
  Target: within 2 weeks
```

---

## Notes for Claude Code

- When in doubt about an architecture decision, write a comment
  `// DECISION: [why I did it this way]` and continue
- If a task is blocked by a missing address or config, note it and move to next task
- Run `npx hardhat test` after every contract change
- Run `npx hardhat coverage` before marking a task done
- After deploy: always update `deployments/{network}.json` and this AGENTS.md

---

*This file is the single source of truth for the Claude Code agent.*
*David (protogenos) is the sole operator. No external communication.*
