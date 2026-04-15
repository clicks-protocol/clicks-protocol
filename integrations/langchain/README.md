# Clicks Protocol — LangChain Integration

On-chain yield management tools for LangChain agents on Base.

Powered by [Clicks Protocol](https://clicksprotocol.xyz)

## What It Does

Gives your LangChain agent the ability to earn yield on idle USDC. The agent can autonomously split funds 80/20: 80% stays liquid for operations, 20% earns 4-8% APY on-chain via Clicks Protocol on Base.

## Installation

```bash
pip install clicks-langchain
```

Or from source:

```bash
git clone https://github.com/clicks-protocol/clicks-langchain
cd clicks-langchain
pip install -e .
```

### Prerequisites

- Python >= 3.9
- Node.js >= 18 (for SDK bridge)
- `@clicks-protocol/sdk` installed: `npm install @clicks-protocol/sdk`

### Environment Variables

```bash
export CLICKS_PRIVATE_KEY="your-agent-wallet-private-key"
export CLICKS_RPC_URL="https://mainnet.base.org"        # optional, defaults to Base mainnet
export CLICKS_SDK_PATH="/path/to/sdk"                     # optional, defaults to cwd
```

## Quick Start

```python
from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from clicks_langchain import get_clicks_tools

# Get all Clicks Protocol tools
tools = get_clicks_tools()

# Create an agent with yield management capabilities
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
)

# The agent can now manage its own treasury
agent.run("Check my USDC balance and yield status for address 0xYourAgent...")
agent.run("I have 5000 idle USDC. Activate yield on it.")
agent.run("What's the current APY on Clicks Protocol?")
```

## Available Tools

| Tool | Description | When to Use |
|------|-------------|-------------|
| `clicks_activate_yield` | Split USDC 80/20 to earn yield | Agent has idle USDC not needed immediately |
| `clicks_withdraw_yield` | Withdraw all yield + deposits | Agent needs maximum liquidity |
| `clicks_check_balance` | View liquid vs. yield balances | Before spending decisions |
| `clicks_get_apy` | Get current APY rate | Evaluating whether to activate yield |
| `clicks_simulate_split` | Preview split without moving funds | Planning treasury allocation |

## Example: Treasury Management Agent

```python
from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from clicks_langchain import get_clicks_tools

AGENT_ADDRESS = "0xYourAgentAddress"

SYSTEM_PROMPT = """You are a treasury management agent. Your job is to maximize
yield on idle USDC while keeping enough liquid for operations.

Rules:
1. Always check balance before activating yield
2. Keep at least 1000 USDC liquid at all times
3. Activate yield on any idle amount above 1000 USDC
4. Check APY weekly and report changes
5. Withdraw yield if APY drops below 2%
"""

tools = get_clicks_tools()
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

agent = initialize_agent(
    tools,
    ChatOpenAI(model="gpt-4", temperature=0),
    agent=AgentType.OPENAI_FUNCTIONS,
    memory=memory,
    system_message=SYSTEM_PROMPT,
    verbose=True,
)

# Run the agent
agent.run(f"Check the treasury status for {AGENT_ADDRESS} and optimize yield allocation.")
```

## Using Individual Tools

```python
from clicks_langchain import (
    ClicksActivateYieldTool,
    ClicksCheckBalanceTool,
    ClicksGetAPYTool,
    ClicksSDKBridge,
)

# Create SDK bridge with explicit config
sdk = ClicksSDKBridge(
    rpc_url="https://mainnet.base.org",
    private_key="your-key",
)

# Use individual tools
balance_tool = ClicksCheckBalanceTool(sdk=sdk)
print(balance_tool.run({"agent_address": "0xYourAgent"}))

apy_tool = ClicksGetAPYTool(sdk=sdk)
print(apy_tool.run({}))
```

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| Registry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` |
| Splitter | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` |
| YieldRouter | `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` |
| ClicksReferral | `0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## License

MIT

---

Built for autonomous AI agents. Powered by [Clicks Protocol](https://clicksprotocol.xyz).
