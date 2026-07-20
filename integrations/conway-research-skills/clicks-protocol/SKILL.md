---
name: clicks-protocol
description: Treasury layer for autonomous agents on Base. Auto-split USDC inflows 80% liquid / 20% earning. Optional ERC-4626 yield routing.
auto-activate: true
---

# Clicks Protocol — Agent Treasury Skill

Use this skill when the agent receives USDC on Base mainnet and you want to automatically reserve a withdrawable buffer while routing idle balance into yield. Designed for sovereign agents with a survival-pressure model: liquid USDC keeps the agent alive between revenue events; the earning portion stretches runway.

## What it does

Clicks is a settlement router on Base. It does not custody, does not generate yield, does not run vaults. It splits incoming USDC at the moment of receipt:

- **80%** stays in the agent's liquid balance, immediately withdrawable for inference, compute, domains, x402 calls.
- **20%** is routed into a third-party ERC-4626 vault (Aave, Morpho, etc.) chosen by the agent's `yieldPct` setting.

Default `yieldPct = 20`. Configurable per agent between `MIN_YIELD_PCT = 5` and `MAX_YIELD_PCT = 50`. Fee = 2% on yield generated only, never on principal.

## When to activate

- Agent holds USDC on Base mainnet and is not actively spending all of it.
- Agent expects multiple inflows over time (revenue from x402 services, ACP, sandbox monetization, etc.).
- Agent is in `normal` survival tier and wants to extend runway via yield.
- Agent in `low_compute` tier may want to call `withdraw_yield` to convert earned USDC back to liquid.

## Precheck

Validate prerequisites before any write:

```bash
# 1. Network check (Base mainnet, chain id 8453)
node -e "console.log(process.env.RPC_URL)"

# 2. Wallet has gas (Base ETH for tx fees)
cast balance $WALLET --rpc-url $RPC_URL  # foundry-cast

# 3. SDK installed
npm ls @clicks-protocol/sdk
```

If `RPC_URL` is missing, set it to a public Base RPC (https://mainnet.base.org) or a hosted endpoint.

## Preferred interface: TypeScript SDK

Install once per sandbox:

```bash
npm install @clicks-protocol/sdk
```

Use the `ClicksClient`:

```ts
import { ClicksClient } from '@clicks-protocol/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

const provider = new JsonRpcProvider(process.env.RPC_URL);
const signer   = new Wallet(process.env.PRIVATE_KEY, provider);
const clicks   = new ClicksClient(signer);
```

Available methods (all read-only methods are gas-free):

| Method | Purpose |
|--------|---------|
| `quickStart()` | One-call setup: register agent, set default `yieldPct=20` |
| `registerAgent(agentAddress)` | Register an agent on `ClicksRegistry` (write) |
| `simulateSplit(amount, agentAddress)` | Preview the 80/20 outcome before sending (read-only) |
| `receivePayment(amount, agentAddress)` | Settle an incoming USDC payment, triggering the split (write) |
| `getAgentInfo(agentAddress)` | Returns registration status, operator, yieldPct |
| `getAgentYieldBalance(agentAddress)` | Returns current liquid + earning balances |
| `getYieldInfo()` | Returns active vault, current APY |
| `withdrawYield(agentAddress, amount)` | Pull earned USDC back to liquid (write) |
| `setOperatorYieldPct(pct)` | Adjust yieldPct (5–50) for agents you operate (write) |
| `getFeeInfo()` | Returns the 2%-on-yield fee breakdown |
| `approveUSDC(amount)` | One-time USDC allowance for the splitter |

## Standard operation pattern

### First-time setup (one-time per agent)

```ts
// 1. Register
const result = await clicks.quickStart();
console.log('agent registered:', result.agentAddress);

// 2. Approve USDC spend (one-time, max-uint or per-payment)
await clicks.approveUSDC('1000');  // 1000 USDC allowance
```

### On each inflow (recurring)

```ts
// Optional: preview before settling
const preview = await clicks.simulateSplit('100', agentAddress);
console.log(`liquid: ${preview.liquid}, yield: ${preview.yield}, fee: ${preview.fee}`);

// Settle the inflow
const tx = await clicks.receivePayment('100', agentAddress);
await tx.wait();
```

### On survival-tier transition (e.g. normal → low_compute)

```ts
const balance = await clicks.getAgentYieldBalance(agentAddress);
if (balance.earning > 5n) {
  // Convert earned USDC back to liquid to extend runway
  await clicks.withdrawYield(agentAddress, balance.earning);
}
```

## On-chain identity

Clicks-registered agents are also discoverable via [ERC-8004](https://ethereum-magicians.org/t/erc-8004-autonomous-agent-identity/22268) on Base. The same standard the Automaton uses. Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`. Reputation Registry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`.

## Live contracts (Base mainnet)

```text
ClicksRegistry      0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3
ClicksSplitterV4    0xB7E0016d543bD443ED2A6f23d5008400255bf3C8
ClicksYieldRouter   0x053167a233d18E05Bc65a8d5F3F8808782a3EECD
ClicksFeeV2         0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5
USDC (Base)         0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

All owned by Safe multisig `0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9`. Apache-2.0. Source: <https://github.com/clicks-protocol/clicks-protocol>.

## HTTP / MCP fallback

For runtimes without npm/Node, Clicks also exposes:

- **MCP server**: `npm install -g @clicks-protocol/mcp-server` — exposes the same operations as MCP tools (`clicks_get_agent_info`, `clicks_simulate_split`, `clicks_get_balance`, `clicks_receive_payment`, `clicks_withdraw_yield`).
- **Direct contract calls**: any wallet library (ethers, viem, wagmi, web3.py) can call the Splitter ABI directly. ABI exported from the SDK or readable on BaseScan.

## Constraints relevant to Automatons

- **No self-attestation**: Automatons must NOT use their own creator's wallet to attest themselves on the Reputation Registry. Schema V1 forbids self-attestation. Use a third-party attestor.
- **2% protocol fee** is on yield only. If `yield = 0`, fee = 0.
- **Withdraw limits**: liquid balance is always 100% withdrawable. Earning balance settles asynchronously via the underlying ERC-4626 vault — withdrawal cost is one tx.
- **Gas**: every write requires Base ETH (≈ $0.001 per tx). Keep a few cents of ETH funded.

## Execution pattern

1. On first inflow: `quickStart()` once, then `approveUSDC()` once.
2. On every subsequent inflow: `receivePayment()`. The split is automatic.
3. Periodic: `getAgentYieldBalance()` to monitor; `withdrawYield()` only if you need liquid.
4. Never deregister unless you are tearing down the agent identity entirely.

## Guardrails

- Never paste `PRIVATE_KEY` into logs, prompts, or external tools. The skill expects it in env only.
- Never call `setOperatorYieldPct(pct)` with values outside `[5, 50]` — the contract reverts and burns gas.
- If a `receivePayment` reverts: check USDC allowance first (`getAllowance`), then registration status (`getAgentInfo`), then balance.
- Fee + yield go to internal contract addresses owned by Safe multisig. The skill never sends to arbitrary addresses.

## References

- SDK: <https://www.npmjs.com/package/@clicks-protocol/sdk>
- MCP: <https://www.npmjs.com/package/@clicks-protocol/mcp-server>
- Source: <https://github.com/clicks-protocol/clicks-protocol>
- Live contracts on BaseScan: <https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8>
- Schema V1 spec (attestation): <https://clicksprotocol.xyz/strategy/ATTESTOR-SCHEMA-V1.md>
- Apache-2.0 License.
