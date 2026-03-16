<p align="center">
  <h1 align="center">Clicks Protocol ⚡</h1>
  <p align="center">你的 agent 赚了 USDC,但资金闲置。Clicks 让它增值。</p>
</p>

<p align="center">
  <a href="README.md">English</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@clicks-protocol/sdk"><img src="https://img.shields.io/npm/v/@clicks-protocol/sdk?color=00FF9B&label=sdk" alt="npm"></a>
  <a href="https://basescan.org/address/0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5"><img src="https://img.shields.io/badge/Base%20Mainnet-live-00FF9B" alt="Base Mainnet"></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-58%20passing-00FF9B" alt="Tests"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
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
// 20 USDC → DeFi 收益(7-10% APY,自动)
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

提供 9 个工具:`clicks_quick_start`、`clicks_get_agent_info`、`clicks_simulate_split`、`clicks_get_yield_info`、`clicks_receive_payment`、`clicks_withdraw_yield`、`clicks_register_agent`、`clicks_set_yield_pct`、`clicks_get_referral_stats`

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
| ClicksRegistry | [`0x898d...F48d`](https://basescan.org/address/0x898d8a3B04e5E333E88f798372129C6a622fF48d) |
| ClicksSplitterV3 | [`0xA1D0...Bac5`](https://basescan.org/address/0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5) |
| ClicksYieldRouter | [`0x47d6...f29`](https://basescan.org/address/0x47d6Add0a3bdFe856b39a0311D8c055481F76f29) |
| ClicksFee | [`0xb90c...E12`](https://basescan.org/address/0xb90cd287d30587dAF40B2E1ce32cefA99FD10E12) |
| USDC | [`0x8335...913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |

所有合约已在 Basescan 上验证。

---

## 架构

```
clicks-protocol/
├── contracts/           Solidity (^0.8.20)
│   ├── ClicksSplitterV3    拆分付款,管理收益比例
│   ├── ClicksYieldRouter   路由至最佳 APY(Aave/Morpho)
│   ├── ClicksFee           对收益收取 2% 费用
│   ├── ClicksRegistry      Agent ↔ Operator 映射
│   └── ClicksReferral      多级推荐系统
├── sdk/                 TypeScript SDK
├── mcp-server/          MCP Server(9 个工具)
├── site/                落地页 + llms.txt + agent.json
├── test/                58 个测试(Hardhat)
└── strategy/            内部文档
```

---

## Agent 发现机制

- **llms.txt:** [`clicksprotocol.xyz/llms.txt`](https://clicksprotocol.xyz/llms.txt) — 供 LLM 使用的完整协议文档
- **agent.json:** [`clicksprotocol.xyz/.well-known/agent.json`](https://clicksprotocol.xyz/.well-known/agent.json) — agent manifest
- **MCP:** `@clicks-protocol/mcp-server` — 供 MCP 客户端进行工具发现

---

## 兼容框架

任何在 Base 上处理 USDC 的 agent 框架:

x402 · LangChain · CrewAI · AutoGen · Eliza · OpenClaw · Claude · Cursor · Phidata

---

## 开发

```bash
npm install
npx hardhat compile
npx hardhat test          # 58 个测试
```

---

## 许可证

MIT

---

<p align="center">
  <sub>为 agent 而建,由 agent 而建。已在 Base 上线。</sub>
</p>
