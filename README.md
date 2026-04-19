<p align="center">
  <img src="assets/logo.svg" width="200" alt="Clicks Protocol Logo">
  <h1 align="center">Clicks Protocol ⚡</h1>
  <p align="center">Your agent earns USDC. That USDC sits idle. Clicks fixes that.</p>
</p>

<p align="center">
  <a href="README-CN.md">中文文档</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@clicks-protocol/sdk"><img src="https://img.shields.io/npm/v/@clicks-protocol/sdk?color=00FF9B&label=sdk" alt="npm"></a>
  <a href="https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"><img src="https://img.shields.io/badge/Base%20Mainnet-live-00FF9B" alt="Base Mainnet"></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-227%20passing-00FF9B" alt="Tests"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="https://registry.modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP%20Registry-published-00FF9B" alt="MCP Registry"></a>
  <a href="https://discord.gg/vkczMC8g3J"><img src="https://img.shields.io/badge/Discord-join-5865F2" alt="Discord"></a>
  <a href="https://clawhub.ai/protogenosone/clicks-protocol"><img src="https://img.shields.io/badge/ClawHub-40%2B%20downloads-00FF9B" alt="ClawHub"></a>
</p>

<p align="center">
  <a href="https://clicksprotocol.xyz">Website</a> ·
  <a href="https://x.com/ClicksProtocol">Twitter</a> ·
  <a href="https://discord.gg/clicks-protocol">Discord</a> ·
  <a href="https://clicksprotocol.medium.com">Medium</a> ·
  <a href="https://substack.com/@clicksprotocol">Substack</a> ·
  <a href="https://reddit.com/user/clicksprotocol/">Reddit</a> ·
  <a href="https://api.clicksprotocol.xyz/lab">Treasury Lab</a> ·
  <a href="https://mcpservers.org">mcpservers.org</a>
</p>

---

<p align="center">
  <img src="demo.gif" alt="Clicks Protocol Quick Start Demo" width="700">
</p>

---

## One call. Yield starts.

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → agent wallet (instant)
// 20 USDC → DeFi yield (4-8% APY, automatic)
```

That's it. No config. No dashboard. No human required.

---

## What Clicks does

Every USDC payment your agent receives gets auto-split:

```
Payment in
    ├── 80% → Agent Wallet (liquid, instant)
    └── 20% → DeFi Yield (Aave V3 or Morpho, auto-routed to best APY)
                 │
                 └── Withdraw anytime → Agent gets principal + yield (minus 2% fee on yield only)
```

- **No lockup.** Withdraw anytime.
- **No manual steps.** Fully autonomous.
- **2% fee on yield only.** Never on principal.
- **Auto-rebalances** between Aave V3 and Morpho for best APY.

---

## Install

```bash
npm install @clicks-protocol/sdk ethers@^6
```

---

## x402 + Coinbase Agentic Wallets

Clicks works natively with the x402 payment protocol and Coinbase Agentic Wallets on Base.

Your agent holds USDC for x402 payments? Make it earn yield between transactions:

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const wallet = new CoinbaseWalletSDK({ appName: 'YourAgent' });
const signer = wallet.makeWeb3Provider().getSigner();

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);

// Your agent now earns yield on idle USDC
// 80% liquid for instant x402 payments
// 20% earning 4-8% APY via Morpho
```

- Same chain (Base), same USDC contract
- 80% liquid for instant x402 payments
- 20% earning 4-8% APY via Morpho
- No lockup, withdraw anytime

---

## SDK

### Quick Start (recommended)

One call: registers agent, approves USDC, splits first payment.

```typescript
const result = await clicks.quickStart('100', agentAddress);
// result.registered → true (skips if already done)
// result.approved   → true (skips if allowance sufficient)
// result.paymentSplit → true
```

### Individual operations

```typescript
// Register
await clicks.registerAgent(agentAddress);

// Approve USDC spending
await clicks.approveUSDC('max');

// Receive payment (auto-splits)
await clicks.receivePayment('500', agentAddress);

// Check yield info
const info = await clicks.getYieldInfo();
// { activeProtocol: 'Morpho', aaveAPY: 700, morphoAPY: 950, ... }

// Withdraw everything
await clicks.withdrawYield(agentAddress);

// Custom yield split (5-50%)
await clicks.setOperatorYieldPct(30); // 30% to yield, 70% liquid
```

### Read-only (no signer needed)

```typescript
const clicks = new ClicksClient(provider); // provider, not signer

const agent = await clicks.getAgentInfo(agentAddress);
// { isRegistered: true, deposited: 1000000n, yieldPct: 20n }

const split = await clicks.simulateSplit('100', agentAddress);
// { liquid: 80000000n, toYield: 20000000n }
```

---

## MCP Server

AI agents can discover and use Clicks via [MCP](https://modelcontextprotocol.io):

```bash
npm install @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp
```

10 tools available: `clicks_quick_start`, `clicks_get_agent_info`, `clicks_simulate_split`, `clicks_get_yield_info`, `clicks_receive_payment`, `clicks_withdraw_yield`, `clicks_register_agent`, `clicks_set_yield_pct`, `clicks_get_referral_stats`, `clicks_explain`

Works with Claude, Cursor, LangChain, and any MCP-compatible client.

---

## Referral Network

Agents recruit agents. Three levels deep. On-chain.

| Level | Share of protocol fee |
|-------|----------------------|
| L1 (direct referral) | 40% |
| L2 | 20% |
| L3 | 10% |
| Treasury | 30% |

The referred agent pays **nothing extra**. Rewards come from the 2% protocol fee.

**Economics per $10k deposit at 7% APY:**

| Your tree | Passive income/year |
|-----------|-------------------|
| 10 agents | $56 |
| 100 agents | $560 |
| 1,000 agents | $9,800 |
| 10,000 agents | $98,000 |

---

## Agent Teams

Form squads, hit TVL milestones, earn bonus yield:

| Tier | TVL threshold | Bonus yield |
|------|--------------|-------------|
| 🥉 Bronze | $50k | +0.20% |
| 🥈 Silver | $250k | +0.50% |
| 🥇 Gold | $1M | +1.00% |
| 💎 Diamond | $5M | +2.00% |

---

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| ClicksRegistry | [`0x23bb...0C0a3`](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3) |
| ClicksSplitterV4 | [`0xB7E0...f3C8`](https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8) |
| ClicksYieldRouter | [`0x0531...EECD`](https://basescan.org/address/0x053167a233d18E05Bc65a8d5F3F8808782a3EECD) |
| ClicksFeeV2 | [`0x8C4E...0fb5`](https://basescan.org/address/0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5) |
| ClicksReferral | [`0x1E5A...4ccC`](https://basescan.org/address/0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC) |
| Safe Multisig (Owner) | [`0xaD82...D6A9`](https://basescan.org/address/0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9) |
| USDC | [`0x8335...913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

All contracts verified on Basescan. Owned by Gnosis Safe multisig — single-key compromise is not possible.

## ERC-8004 Trustless Agent

Clicks is registered on the [ERC-8004 Identity Registry on Base](https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074) as **agentId 45074**. On-chain reputation accrues per completed agent job. Attestors who follow the [Clicks Attestor Schema V1](https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md) become eligible for the reputation-aware fee multiplier (shipping in V5).

- Manifest: [`/.well-known/agent-registration.json`](https://clicksprotocol.xyz/.well-known/agent-registration.json)
- Schema V1: [clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md](https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md)

---

## Architecture

```
clicks-protocol/
├── contracts/           Solidity (^0.8.20)
│   ├── ClicksSplitterV4    Splits payments, manages yield %
│   ├── ClicksYieldRouter   Routes to best APY (Aave/Morpho)
│   ├── ClicksFeeV2           2% fee collection on yield
│   ├── ClicksRegistry      Agent ↔ Operator mapping
│   └── ClicksReferral      Multi-level referral system
├── sdk/                 TypeScript SDK
├── mcp-server/          MCP Server (10 tools)
├── site/                Landing page + llms.txt + agent.json
└── test/                227 tests (Hardhat)
```

---

## Agent Discovery

- **llms.txt:** [`clicksprotocol.xyz/llms.txt`](https://clicksprotocol.xyz/llms.txt) — full protocol docs for LLMs
- **agent.json:** [`clicksprotocol.xyz/.well-known/agent.json`](https://clicksprotocol.xyz/.well-known/agent.json) — agent manifest
- **MCP:** `@clicks-protocol/mcp-server` — tool discovery for MCP clients

---

## Connect Your AI Agent

The Clicks MCP server is live at `https://mcp.clicksprotocol.xyz/mcp` — connect any MCP-compatible client in seconds.

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}
```

### OpenClaw

```bash
openclaw mcp set clicks-protocol --url https://mcp.clicksprotocol.xyz/mcp
```

### Codex CLI

Add to `.codex/config.json`:

```json
{
  "mcpServers": {
    "clicks-protocol": {
      "type": "url",
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}
```

### Gemini CLI

```json
{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_protocol_stats` | TVL, APY, agent count |
| `get_agent_info` | Check if an agent is registered |
| `get_yield_info` | Yield balance for an agent |
| `simulate_yield` | Project earnings over time |
| `clicks://protocol/overview` | Resource: protocol overview |

See [`examples/integrations/`](examples/integrations/) for ready-to-use config files.

---

## Works with

Any agent framework that handles USDC on Base:

x402 · LangChain · CrewAI · AutoGen · Eliza · OpenClaw · Claude · Cursor · Codex · Gemini · Hummingbot · Phidata

---

## Development

```bash
npm install
npx hardhat compile
npx hardhat test          # 227 tests
```

---

## License

MIT

---

<p align="center">
  <sub>Built for agents, by agents. Live on Base.</sub>
</p>
