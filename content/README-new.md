<div align="center">

<img src="./site/assets/logo.png" alt="Clicks Protocol Logo" width="120"/>

<h1>Clicks Protocol</h1>

<strong>Autonomous Yield for AI Agents</strong>

<p>Your agent earns USDC. That USDC sits idle. Clicks makes it earn yield automatically.</p>

<br/>

[![Base Mainnet](https://img.shields.io/badge/Base_Mainnet-live-00FF9B?style=flat-square&logo=ethereum&logoColor=white)](https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8)
[![npm](https://img.shields.io/npm/v/@clicks-protocol/sdk?style=flat-square&color=00FF9B&label=sdk)](https://www.npmjs.com/package/@clicks-protocol/sdk)
[![Tests](https://img.shields.io/badge/tests-58%20passing-00FF9B?style=flat-square)](https://github.com/clicks-protocol/clicks-protocol)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/clicks-protocol)
[![X](https://img.shields.io/badge/X-Follow-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/ClicksProtocol)
[![Docs](https://img.shields.io/badge/Docs-clicksprotocol.xyz-purple?style=flat-square)](https://clicksprotocol.xyz)

[English](./README.md) | [中文文档](./README-CN.md)

</div>

---

## 🎬 Demo

<div align="center">

<!-- TODO: Replace with actual demo GIF -->
<img src="./demo.gif" alt="Clicks Protocol Demo — quickStart() → 80/20 split → yield" width="700"/>

<sub>One SDK call. 80% liquid, 20% earning yield. No config required.</sub>

</div>

---

## ⚡ Quick Start

Install the SDK:

```bash
npm install @clicks-protocol/sdk
```

Start earning yield in 3 lines:

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);
// 800 USDC → liquid (instant access)
// 200 USDC → earning 4-8% APY (withdraw anytime)
```

That's it. No config. No dashboard. No human required.

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🔓 | **No Lockup** | Withdraw principal + yield anytime |
| ⚡ | **80/20 Auto-Split** | 80% liquid, 20% earning yield (configurable 5-50%) |
| 🎯 | **Built for x402** | Native integration with Coinbase Agentic Wallets |
| 🔐 | **58/58 Tests Passing** | Security-audited, no critical vulnerabilities |
| 📦 | **One SDK Call** | `quickStart()` handles registration, approval, splitting |
| 🌐 | **MCP Server** | 9 tools for autonomous agent discovery |
| 🔄 | **Auto-Rebalance** | Routes to best APY between Aave V3 and Morpho |
| 💰 | **2% Fee on Yield Only** | Never on principal. If agents don't earn, protocol doesn't earn |

---

## 🏗️ Architecture

```
clicks-protocol/
├── contracts/           5 Solidity contracts (^0.8.20)
│   ├── ClicksSplitterV4    Payment splitting + yield % management
│   ├── ClicksYieldRouter   Auto-routes to best APY (Aave V3 / Morpho)
│   ├── ClicksFeeV2           2% fee collection on yield only
│   ├── ClicksRegistry      Agent ↔ Operator mapping
│   └── ClicksReferral      Multi-level referral system
├── sdk/                 TypeScript SDK (@clicks-protocol/sdk)
├── mcp-server/          MCP Server with 9 tools (@clicks-protocol/mcp-server)
├── site/                Landing page + llms.txt + agent.json
└── test/                58 tests (Hardhat)
```

**How it works:**

```
USDC Payment In
    ├── 80% → Agent Wallet (liquid, instant access)
    └── 20% → DeFi Yield (Aave V3 or Morpho, best APY auto-selected)
                 └── Withdraw anytime → principal + yield (minus 2% fee on yield)
```

---

## 📚 Documentation

| Resource | Link |
|----------|------|
| 🚀 Getting Started | [docs/getting-started.md](./docs/getting-started.md) |
| 📦 SDK Reference | [sdk/README.md](./sdk/README.md) |
| 🌐 MCP Server | [mcp-server/README.md](./mcp-server/README.md) |
| 🔐 Security | [content/security.md](./content/security.md) |
| 📄 Smart Contracts | [docs/contracts.md](./docs/contracts.md) |
| 🌍 Website | [clicksprotocol.xyz](https://clicksprotocol.xyz) |

---

## 🚀 Installation

### Option 1: npm

```bash
npm install @clicks-protocol/sdk
```

### Option 2: yarn

```bash
yarn add @clicks-protocol/sdk
```

### Option 3: MCP Server

```bash
npx @clicks-protocol/mcp-server
```

Or install globally:

```bash
npm install -g @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp
```

### Dependencies

```bash
npm install ethers@^6
```

---

## 💡 Examples

### Basic Usage

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);

// One call: registers agent, approves USDC, splits first payment
const result = await clicks.quickStart('100', agentAddress);
// result.registered   → true (skips if already done)
// result.approved     → true (skips if allowance sufficient)
// result.paymentSplit → true
```

### With Referrer

```typescript
// Earn referral rewards: L1=40%, L2=20%, L3=10% of protocol fee
await clicks.quickStart('1000', agentAddress, referrerAddress);
```

### Check Balance & Yield Info

```typescript
// Read-only (provider, no signer needed)
const clicks = new ClicksClient(provider);

const agent = await clicks.getAgentInfo(agentAddress);
// { isRegistered: true, deposited: 1000000n, yieldPct: 20n }

const yieldInfo = await clicks.getYieldInfo();
// { activeProtocol: 'Morpho', aaveAPY: 700, morphoAPY: 950, ... }

const split = await clicks.simulateSplit('100', agentAddress);
// { liquid: 80000000n, toYield: 20000000n }
```

### Withdraw Yield

```typescript
// Withdraw all principal + accumulated yield
await clicks.withdrawYield(agentAddress);
```

### Individual Operations

```typescript
// Register agent
await clicks.registerAgent(agentAddress);

// Approve USDC spending
await clicks.approveUSDC('max');

// Receive payment (auto-splits 80/20)
await clicks.receivePayment('500', agentAddress);

// Custom yield split (5-50%)
await clicks.setOperatorYieldPct(30); // 30% to yield, 70% liquid
```

---

## 🌐 MCP Server

AI agents can discover and use Clicks via [Model Context Protocol (MCP)](https://modelcontextprotocol.io):

```bash
CLICKS_PRIVATE_KEY=0x... npx @clicks-protocol/mcp-server
```

### Available Tools

| Tool | Type | Description |
|------|------|-------------|
| `clicks_quick_start` | ✍️ write | One-call setup + first payment |
| `clicks_receive_payment` | ✍️ write | Split incoming USDC payment |
| `clicks_withdraw_yield` | ✍️ write | Withdraw principal + yield |
| `clicks_register_agent` | ✍️ write | Register new agent |
| `clicks_set_yield_pct` | ✍️ write | Set custom yield percentage |
| `clicks_get_agent_info` | 📖 read | Agent registration + balance info |
| `clicks_simulate_split` | 📖 read | Preview payment split |
| `clicks_get_yield_info` | 📖 read | Current APY + active protocol |
| `clicks_get_referral_stats` | 📖 read | Referral network stats |

**Resource:** `clicks://info` — full protocol metadata

**Compatible with:** Claude, Cursor, LangChain, CrewAI, and any MCP-compatible client.

---

## 🎯 Built for x402

Clicks works natively with the [x402 payment protocol](https://x402.org) and [Coinbase Agentic Wallets](https://docs.cdp.coinbase.com) on Base.

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);

// Your agent now earns yield on idle USDC
// 80% liquid for instant x402 payments
// 20% earning 4-8% APY via Morpho
```

**Why it fits:**
- Same chain (Base), same USDC contract
- 80% stays liquid for instant x402 payments
- 20% earns 4-8% APY between transactions
- No lockup, no bridging, no wrapped tokens

---

## 🤝 Referral Network

Agents recruit agents. Three levels deep. Fully on-chain.

| Level | Share of Protocol Fee |
|-------|----------------------|
| L1 (direct referral) | 40% |
| L2 | 20% |
| L3 | 10% |
| Treasury | 30% |

The referred agent pays **nothing extra**. Rewards come from the 2% protocol fee.

**Projected earnings per $10k deposit at 7% APY:**

| Your Network | Passive Income / Year |
|-------------|----------------------|
| 10 agents | $56 |
| 100 agents | $560 |
| 1,000 agents | $9,800 |
| 10,000 agents | $98,000 |

### Agent Teams

Hit TVL milestones, earn bonus yield:

| Tier | TVL Threshold | Bonus Yield |
|------|--------------|-------------|
| 🥉 Bronze | $50k | +0.20% |
| 🥈 Silver | $250k | +0.50% |
| 🥇 Gold | $1M | +1.00% |
| 💎 Diamond | $5M | +2.00% |

---

## 🔐 Security

### Audit Status

- **58/58 tests passing** (Hardhat)
- **Slither v0.11.5 audit:** 0 critical vulnerabilities
- **No proxy pattern:** Immutable contracts, no admin upgrade keys
- **OpenZeppelin:** ReentrancyGuard on all external functions
- **No price oracles:** Zero flash loan risk
- Third-party audit planned before significant TVL growth

### Contract Addresses (Base Mainnet)

| Contract | Address | Basescan |
|----------|---------|----------|
| ClicksRegistry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` | [View ↗](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3) |
| ClicksSplitterV4 | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` | [View ↗](https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8) |
| ClicksYieldRouter | `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` | [View ↗](https://basescan.org/address/0x053167a233d18E05Bc65a8d5F3F8808782a3EECD) |
| ClicksFeeV2 | `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5` | [View ↗](https://basescan.org/address/0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5) |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | [View ↗](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

> 📄 Full security details: [content/security.md](./content/security.md)

---

## 🔍 Agent Discovery

Clicks is discoverable by AI agents through multiple channels:

| Method | URL |
|--------|-----|
| **llms.txt** | [clicksprotocol.xyz/llms.txt](https://clicksprotocol.xyz/llms.txt) |
| **agent.json** | [clicksprotocol.xyz/.well-known/agent.json](https://clicksprotocol.xyz/.well-known/agent.json) |
| **MCP Server** | `@clicks-protocol/mcp-server` |

### Works With

<p>
x402 · Coinbase Agentic Wallets · LangChain · CrewAI · AutoGen · Eliza · OpenClaw · Claude · Cursor · Phidata
</p>

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core Contracts (5 contracts on Base Mainnet)
- [x] **Phase 2:** SDK + MCP Server (TypeScript, 9 tools)
- [x] **Phase 3:** Referral System (ClicksReferral, 32 tests)
- [ ] **Phase 4:** Governance + DAO
- [ ] **Phase 5:** Multi-chain expansion

---

## 🌐 Language / 语言

| Language | Link |
|----------|------|
| 🇬🇧 English | [README.md](./README.md) |
| 🇨🇳 中文 | [README-CN.md](./README-CN.md) |

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/clicks-protocol/clicks-protocol.git
cd clicks-protocol

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (58 tests)
npx hardhat test

# Build SDK
cd sdk && npm run build

# Build MCP Server
cd mcp-server && npm run build
```

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

<strong>Clicks Protocol</strong>

Your agent earns USDC. That USDC sits idle. Clicks fixes that.

[Website](https://clicksprotocol.xyz) · [Discord](https://discord.gg/clicks-protocol) · [X/Twitter](https://x.com/ClicksProtocol) · [GitHub](https://github.com/clicks-protocol)

<sub>Built for agents, by agents. Live on Base.</sub>

</div>
