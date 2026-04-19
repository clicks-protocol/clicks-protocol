<p align="center">
  <img src="assets/logo.svg" width="200" alt="Clicks Protocol Logo">
  <h1 align="center">Clicks Protocol ⚡</h1>
  <p align="center">你的 agent 赚了 USDC,但资金闲置。Clicks 让它增值。</p>
</p>

<p align="center">
  <a href="README.md">English</a>
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
  <img src="demo.gif" alt="Clicks Protocol 快速上手演示" width="700">
</p>

---

## 一次调用,收益开启

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → agent 钱包(即时到账)
// 20 USDC → DeFi 收益(4-8% APY,自动)
```

就这么简单。无需配置,无需看板,无需人工介入。

---

## Clicks 做什么

你的 agent 收到的每笔 USDC 都会自动拆分:

```
收款
    ├── 80% → Agent 钱包(流动,即时)
    └── 20% → DeFi 收益(Aave V3 或 Morpho,自动路由至最佳 APY)
                 │
                 └── 随时提取 → Agent 获得本金 + 收益(仅收益部分收取 2% 费用)
```

- **无锁仓。** 随时提取。
- **无手动操作。** 全自动运行。
- **仅对收益收取 2% 费用。** 本金不收费。
- **自动再平衡**,在 Aave V3 和 Morpho 之间选择最佳 APY。

---

## 安装

```bash
npm install @clicks-protocol/sdk ethers@^6
```

---

## x402 + Coinbase Agentic Wallets

Clicks 与 x402 支付协议和 Coinbase Agentic Wallets 在 Base 上原生兼容。

你的 agent 持有 USDC 用于 x402 支付?让它在交易间隙赚取收益:

```typescript
import { ClicksClient } from '@clicks-protocol/sdk';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const wallet = new CoinbaseWalletSDK({ appName: 'YourAgent' });
const signer = wallet.makeWeb3Provider().getSigner();

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);

// 你的 agent 现在能从闲置 USDC 中赚取收益
// 80% 流动,可即时用于 x402 支付
// 20% 通过 Morpho 赚取 4-8% APY
```

- 同一条链(Base),同一个 USDC 合约
- 80% 流动,可即时用于 x402 支付
- 20% 通过 Morpho 赚取 4-8% APY
- 无锁仓,随时提取

---

## SDK

### 快速开始(推荐)

一次调用:注册 agent、授权 USDC、拆分首笔付款。

```typescript
const result = await clicks.quickStart('100', agentAddress);
// result.registered → true (已完成则跳过)
// result.approved   → true (授权额度充足则跳过)
// result.paymentSplit → true
```

### 单独操作

```typescript
// 注册
await clicks.registerAgent(agentAddress);

// 授权 USDC 支出
await clicks.approveUSDC('max');

// 接收付款(自动拆分)
await clicks.receivePayment('500', agentAddress);

// 查看收益信息
const info = await clicks.getYieldInfo();
// { activeProtocol: 'Morpho', aaveAPY: 700, morphoAPY: 950, ... }

// 提取全部收益
await clicks.withdrawYield(agentAddress);

// 自定义收益比例(5-50%)
await clicks.setOperatorYieldPct(30); // 30% 进入收益,70% 保持流动
```

### 只读操作(无需 signer)

```typescript
const clicks = new ClicksClient(provider); // provider,非 signer

const agent = await clicks.getAgentInfo(agentAddress);
// { isRegistered: true, deposited: 1000000n, yieldPct: 20n }

const split = await clicks.simulateSplit('100', agentAddress);
// { liquid: 80000000n, toYield: 20000000n }
```

---

## MCP Server

AI agent 可以通过 [MCP](https://modelcontextprotocol.io) 发现和使用 Clicks:

```bash
npm install @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp
```

提供 10 个工具:`clicks_quick_start`、`clicks_get_agent_info`、`clicks_simulate_split`、`clicks_get_yield_info`、`clicks_receive_payment`、`clicks_withdraw_yield`、`clicks_register_agent`、`clicks_set_yield_pct`、`clicks_get_referral_stats`、`clicks_explain`

兼容 Claude、Cursor、LangChain 及所有支持 MCP 的客户端。

---

## 推荐网络

Agent 推荐 agent。三级深度。链上记录。

| 等级 | 协议费分成 |
|------|----------|
| L1(直接推荐) | 40% |
| L2 | 20% |
| L3 | 10% |
| 金库 | 30% |

被推荐的 agent **无需额外支付**。奖励来自协议的 2% 费用。

**按 $10k 存款、7% APY 计算的经济模型:**

| 你的推荐树 | 年被动收入 |
|-----------|----------|
| 10 agents | $56 |
| 100 agents | $560 |
| 1,000 agents | $9,800 |
| 10,000 agents | $98,000 |

---

## Agent 团队

组建团队,达成 TVL 里程碑,赚取额外收益:

| 等级 | TVL 门槛 | 额外收益 |
|------|---------|---------|
| 🥉 铜牌 | $50k | +0.20% |
| 🥈 银牌 | $250k | +0.50% |
| 🥇 金牌 | $1M | +1.00% |
| 💎 钻石 | $5M | +2.00% |

---

## 合约(Base 主网)

| 合约 | 地址 |
|------|------|
| ClicksRegistry | [`0x23bb...0C0a3`](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3) |
| ClicksSplitterV4 | [`0xB7E0...f3C8`](https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8) |
| ClicksYieldRouter | [`0x0531...EECD`](https://basescan.org/address/0x053167a233d18E05Bc65a8d5F3F8808782a3EECD) |
| ClicksFeeV2 | [`0x8C4E...0fb5`](https://basescan.org/address/0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5) |
| ClicksReferral | [`0x1E5A...4ccC`](https://basescan.org/address/0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC) |
| Safe Multisig (Owner) | [`0xaD82...D6A9`](https://basescan.org/address/0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9) |
| USDC | [`0x8335...913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

所有合约已在 Basescan 上验证。全部由 Gnosis Safe 多签持有 — 单一密钥泄露无法危及协议。

---

## ERC-8004 可信代理

Clicks 已在 Base 的 [ERC-8004 身份注册表](https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074) 注册为 **agentId 45074**。每完成一笔 agent 任务,链上声誉即刻累积。遵循 [Clicks 认证方 Schema V1](https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md) 的 attestor 将获得 V5 声誉感知费率乘数的白名单资格。

- Manifest: [`/.well-known/agent-registration.json`](https://clicksprotocol.xyz/.well-known/agent-registration.json)
- Schema V1: [clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md](https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md)

---

## 架构

```
clicks-protocol/
├── contracts/           Solidity (^0.8.20)
│   ├── ClicksSplitterV4    拆分付款,管理收益比例
│   ├── ClicksYieldRouter   路由至最佳 APY(Aave/Morpho)
│   ├── ClicksFeeV2           对收益收取 2% 费用
│   ├── ClicksRegistry      Agent ↔ Operator 映射
│   └── ClicksReferral      多级推荐系统
├── sdk/                 TypeScript SDK
├── mcp-server/          MCP Server(10 个工具)
├── site/                落地页 + llms.txt + agent.json
└── test/                227 个测试(Hardhat)
```

---

## Agent 发现机制

- **llms.txt:** [`clicksprotocol.xyz/llms.txt`](https://clicksprotocol.xyz/llms.txt) — 供 LLM 使用的完整协议文档
- **agent.json:** [`clicksprotocol.xyz/.well-known/agent.json`](https://clicksprotocol.xyz/.well-known/agent.json) — agent manifest
- **MCP:** `@clicks-protocol/mcp-server` — 供 MCP 客户端进行工具发现

---

## 连接你的 AI Agent

Clicks MCP 服务器已上线,地址为 `https://mcp.clicksprotocol.xyz/mcp` — 任何 MCP 兼容客户端数秒内即可连接。

### Claude Desktop

添加到 `claude_desktop_config.json`:

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

添加到 `.codex/config.json`:

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

### 可用的 MCP 工具

| 工具 | 说明 |
|------|------|
| `get_protocol_stats` | TVL、APY、agent 数量 |
| `get_agent_info` | 检查 agent 是否已注册 |
| `get_yield_info` | agent 的收益余额 |
| `simulate_yield` | 预测长期收益 |
| `clicks://protocol/overview` | 资源:协议概览 |

查看 [`examples/integrations/`](examples/integrations/) 获取可直接使用的配置文件。

---

## 兼容框架

任何在 Base 上处理 USDC 的 agent 框架:

x402 · LangChain · CrewAI · AutoGen · Eliza · OpenClaw · Claude · Cursor · Codex · Gemini · Hummingbot · Phidata

---

## 开发

```bash
npm install
npx hardhat compile
npx hardhat test          # 227 个测试
```

---

## 许可证

MIT

---

<p align="center">
  <sub>为 agent 而建,由 agent 而建。已在 Base 上线。</sub>
</p>
