"""
Clicks Protocol LangChain Tools
================================
On-chain yield management for AI agents on Base.
Powered by Clicks Protocol (clicksprotocol.xyz)

These tools let LangChain agents autonomously manage idle USDC by splitting
funds 80/20: 80% stays liquid for operations, 20% earns 4-8% APY on-chain.

Usage:
    from clicks_langchain import ClicksYieldTool, ClicksBalanceTool
    tools = [ClicksYieldTool(), ClicksBalanceTool()]
    agent = initialize_agent(tools, llm, agent=AgentType.OPENAI_FUNCTIONS)
"""

import os
import json
import subprocess
from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from langchain.callbacks.manager import CallbackManagerForToolRun


# ---------------------------------------------------------------------------
# Contract addresses (Base Mainnet)
# ---------------------------------------------------------------------------
CONTRACTS = {
    "registry": "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3",
    "splitter": "0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D",
    "yield_router": "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD",
    "fee": "0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE",
    "referral": "0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC",
    "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
}

# Default split: 80% liquid, 20% yield
DEFAULT_LIQUID_PERCENT = 80
DEFAULT_YIELD_PERCENT = 20


class ClicksSDKBridge:
    """
    Bridge to the @clicks-protocol/sdk Node.js package.
    Executes SDK methods via a subprocess call to a thin JS wrapper.
    
    Requires:
        - Node.js >= 18
        - @clicks-protocol/sdk installed (npm install @clicks-protocol/sdk)
        - CLICKS_RPC_URL env var (Base RPC endpoint)
        - CLICKS_PRIVATE_KEY env var (agent wallet private key)
    """

    def __init__(
        self,
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None,
        sdk_path: Optional[str] = None,
    ):
        self.rpc_url = rpc_url or os.environ.get("CLICKS_RPC_URL", "https://mainnet.base.org")
        self.private_key = private_key or os.environ.get("CLICKS_PRIVATE_KEY", "")
        self.sdk_path = sdk_path or os.environ.get("CLICKS_SDK_PATH", ".")

        if not self.private_key:
            raise ValueError(
                "No private key provided. Set CLICKS_PRIVATE_KEY env var "
                "or pass private_key to the constructor."
            )

    def _call_sdk(self, method: str, **kwargs) -> dict:
        """Execute an SDK method via the Node.js bridge script."""
        script = f"""
        const {{ ClicksClient }} = require('@clicks-protocol/sdk');
        const {{ ethers }} = require('ethers');

        (async () => {{
            const provider = new ethers.JsonRpcProvider('{self.rpc_url}');
            const wallet = new ethers.Wallet('{self.private_key}', provider);
            const sdk = new ClicksClient(wallet);

            try {{
                const result = await sdk.{method}({json.dumps(kwargs).strip('{}')});
                console.log(JSON.stringify({{ success: true, data: result }}, (k, v) => typeof v === 'bigint' ? v.toString() : v));
            }} catch (e) {{
                console.log(JSON.stringify({{ success: false, error: e.message }}));
            }}
        }})();
        """
        try:
            result = subprocess.run(
                ["node", "-e", script],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=self.sdk_path,
            )
            if result.returncode != 0:
                return {"success": False, "error": result.stderr.strip()}
            return json.loads(result.stdout.strip())
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "SDK call timed out after 60s"}
        except json.JSONDecodeError:
            return {"success": False, "error": f"Invalid SDK response: {result.stdout[:200]}"}

    def quick_start(self, amount: str, agent_address: str) -> dict:
        return self._call_sdk("quickStart", amount=amount, agentAddress=agent_address)

    def withdraw_yield(self, agent_address: str) -> dict:
        return self._call_sdk("withdrawYield", agentAddress=agent_address)

    def simulate_split(self, amount: str, agent_address: str) -> dict:
        return self._call_sdk("simulateSplit", amount=amount, agentAddress=agent_address)

    def get_agent_info(self, agent_address: str) -> dict:
        """Get agent registration info + yield balance combined."""
        script = f"""
        const {{ ClicksClient }} = require('@clicks-protocol/sdk');
        const {{ ethers }} = require('ethers');
        (async () => {{
            const provider = new ethers.JsonRpcProvider('{self.rpc_url}');
            const wallet = new ethers.Wallet('{self.private_key}', provider);
            const sdk = new ClicksClient(wallet);
            try {{
                const [info, yieldBal, usdcBal] = await Promise.all([
                    sdk.getAgentInfo('{agent_address}'),
                    sdk.getAgentYieldBalance('{agent_address}'),
                    sdk.getUSDCBalance('{agent_address}'),
                ]);
                console.log(JSON.stringify({{ success: true, data: {{
                    isRegistered: info.isRegistered,
                    operator: info.operator,
                    liquidBalance: usdcBal.toString(),
                    depositedBalance: yieldBal.deposited.toString(),
                    accruedYield: yieldBal.yieldEarned.toString(),
                    yieldPct: info.yieldPct.toString(),
                }} }}));
            }} catch (e) {{
                console.log(JSON.stringify({{ success: false, error: e.message }}));
            }}
        }})();
        """
        try:
            result = subprocess.run(
                ["node", "-e", script],
                capture_output=True, text=True, timeout=60, cwd=self.sdk_path,
            )
            if result.returncode != 0:
                return {"success": False, "error": result.stderr.strip()}
            return json.loads(result.stdout.strip())
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "SDK call timed out after 60s"}
        except json.JSONDecodeError:
            return {"success": False, "error": f"Invalid SDK response: {result.stdout[:200]}"}

    def get_yield_info(self) -> dict:
        return self._call_sdk("getYieldInfo")

    def get_current_apy(self) -> dict:
        """Get current APY from the active yield protocol."""
        script = f"""
        const {{ ClicksClient }} = require('@clicks-protocol/sdk');
        const {{ ethers }} = require('ethers');
        (async () => {{
            const provider = new ethers.JsonRpcProvider('{self.rpc_url}');
            const wallet = new ethers.Wallet('{self.private_key}', provider);
            const sdk = new ClicksClient(wallet);
            try {{
                const info = await sdk.getYieldInfo();
                const apy = info.activeProtocol === 1 ? info.aaveAPY : info.morphoAPY;
                const apyPct = (Number(apy) / 100).toFixed(2);
                console.log(JSON.stringify({{ success: true, data: apyPct }}));
            }} catch (e) {{
                console.log(JSON.stringify({{ success: false, error: e.message }}));
            }}
        }})();
        """
        try:
            result = subprocess.run(
                ["node", "-e", script],
                capture_output=True, text=True, timeout=60, cwd=self.sdk_path,
            )
            if result.returncode != 0:
                return {"success": False, "error": result.stderr.strip()}
            return json.loads(result.stdout.strip())
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "SDK call timed out after 60s"}
        except json.JSONDecodeError:
            return {"success": False, "error": f"Invalid SDK response: {result.stdout[:200]}"}


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------

class ActivateYieldInput(BaseModel):
    amount: str = Field(
        description="Amount of USDC to split (in human-readable units, e.g. '1000' for 1000 USDC)"
    )
    agent_address: str = Field(
        description="The Ethereum address of the agent wallet on Base"
    )


class WithdrawYieldInput(BaseModel):
    agent_address: str = Field(
        description="The Ethereum address of the agent wallet on Base"
    )


class CheckBalanceInput(BaseModel):
    agent_address: str = Field(
        description="The Ethereum address of the agent wallet on Base"
    )


class SimulateSplitInput(BaseModel):
    amount: str = Field(
        description="Amount of USDC to simulate splitting"
    )
    agent_address: str = Field(
        description="The Ethereum address of the agent wallet on Base"
    )


# ---------------------------------------------------------------------------
# LangChain Tools
# ---------------------------------------------------------------------------

class ClicksActivateYieldTool(BaseTool):
    """
    Activate yield on idle USDC via Clicks Protocol.
    
    USE THIS TOOL WHEN:
    - The agent has idle USDC sitting in its wallet doing nothing
    - The agent wants to earn passive yield (4-8% APY) on unused funds
    - After receiving a payment that won't be spent immediately
    
    HOW IT WORKS:
    - Splits the specified USDC amount 80/20
    - 80% stays liquid in the agent's wallet (available immediately)
    - 20% is deposited into an on-chain yield strategy on Base
    - The yield portion earns 4-8% APY automatically
    
    DO NOT USE WHEN:
    - The agent needs 100% of its USDC for an imminent transaction
    - The amount is very small (gas costs may exceed yield)
    - The agent is on a network other than Base
    """
    
    name: str = "clicks_activate_yield"
    description: str = (
        "Split idle USDC 80/20 to earn yield on the idle portion. "
        "80% stays liquid, 20% earns 4-8% APY on Base via Clicks Protocol. "
        "Input: amount (USDC as string) and agent_address (Ethereum address)."
    )
    args_schema: Type[BaseModel] = ActivateYieldInput
    sdk: Optional[ClicksSDKBridge] = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, sdk: Optional[ClicksSDKBridge] = None, **kwargs):
        super().__init__(**kwargs)
        self.sdk = sdk or ClicksSDKBridge()

    def _run(
        self,
        amount: str,
        agent_address: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        # First simulate to show the user what will happen
        sim = self.sdk.simulate_split(amount, agent_address)
        if not sim.get("success"):
            return f"Simulation failed: {sim.get('error', 'Unknown error')}"

        result = self.sdk.quick_start(amount, agent_address)
        if result.get("success"):
            data = result.get("data", {})
            return (
                f"Yield activated successfully.\n"
                f"Total: {amount} USDC\n"
                f"Liquid (80%): {float(amount) * 0.8:.2f} USDC (available now)\n"
                f"Yield (20%): {float(amount) * 0.2:.2f} USDC (earning APY)\n"
                f"Transaction: {data.get('txHash', 'N/A')}"
            )
        return f"Failed to activate yield: {result.get('error', 'Unknown error')}"


class ClicksWithdrawYieldTool(BaseTool):
    """
    Withdraw earned yield from Clicks Protocol.
    
    USE THIS TOOL WHEN:
    - The agent needs to access its yield earnings
    - The agent wants to consolidate all funds back to liquid
    - Before a large purchase that requires maximum available funds
    
    WHAT HAPPENS:
    - All accrued yield is withdrawn to the agent's wallet
    - The previously deposited 20% is returned to the wallet
    - After withdrawal, no more yield is earned until re-activated
    """
    
    name: str = "clicks_withdraw_yield"
    description: str = (
        "Withdraw all earned yield and deposited funds from Clicks Protocol "
        "back to the agent's wallet. Use when the agent needs maximum liquidity."
    )
    args_schema: Type[BaseModel] = WithdrawYieldInput
    sdk: Optional[ClicksSDKBridge] = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, sdk: Optional[ClicksSDKBridge] = None, **kwargs):
        super().__init__(**kwargs)
        self.sdk = sdk or ClicksSDKBridge()

    def _run(
        self,
        agent_address: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        result = self.sdk.withdraw_yield(agent_address)
        if result.get("success"):
            data = result.get("data", {})
            return (
                f"Yield withdrawn successfully.\n"
                f"Amount returned: {data.get('amount', 'N/A')} USDC\n"
                f"Transaction: {data.get('txHash', 'N/A')}"
            )
        return f"Withdrawal failed: {result.get('error', 'Unknown error')}"


class ClicksCheckBalanceTool(BaseTool):
    """
    Check agent balance and yield status on Clicks Protocol.
    
    USE THIS TOOL WHEN:
    - The agent needs to know how much USDC is liquid vs. earning yield
    - Before making spending decisions to understand available funds
    - To monitor yield performance and accrued earnings
    - As a periodic health check on treasury status
    
    RETURNS:
    - Total USDC balance (liquid + yield)
    - Liquid amount (immediately available)
    - Deposited amount (earning yield)
    - Accrued yield (earnings so far)
    - Current APY rate
    """
    
    name: str = "clicks_check_balance"
    description: str = (
        "Check the agent's USDC balance split: liquid funds, deposited yield amount, "
        "accrued earnings, and current APY. Use to understand treasury status before "
        "spending decisions."
    )
    args_schema: Type[BaseModel] = CheckBalanceInput
    sdk: Optional[ClicksSDKBridge] = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, sdk: Optional[ClicksSDKBridge] = None, **kwargs):
        super().__init__(**kwargs)
        self.sdk = sdk or ClicksSDKBridge()

    def _run(
        self,
        agent_address: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        info = self.sdk.get_agent_info(agent_address)
        apy = self.sdk.get_current_apy()

        if not info.get("success"):
            return f"Balance check failed: {info.get('error', 'Unknown error')}"

        data = info.get("data", {})
        apy_rate = apy.get("data", "N/A") if apy.get("success") else "N/A"

        return (
            f"Agent Treasury Status:\n"
            f"  Liquid USDC: {data.get('liquidBalance', '0')} (available now)\n"
            f"  Deposited:   {data.get('depositedBalance', '0')} (earning yield)\n"
            f"  Accrued:     {data.get('accruedYield', '0')} (yield earned)\n"
            f"  Current APY: {apy_rate}%\n"
            f"  Registered:  {data.get('isRegistered', False)}"
        )


class ClicksGetAPYTool(BaseTool):
    """
    Get the current APY rate from Clicks Protocol.
    
    USE THIS TOOL WHEN:
    - The agent wants to evaluate whether activating yield is worthwhile
    - Comparing yield rates before making treasury decisions
    - Reporting current earnings potential to the user
    
    Typically returns 4-8% APY depending on market conditions.
    """
    
    name: str = "clicks_get_apy"
    description: str = (
        "Get the current annual percentage yield (APY) from Clicks Protocol. "
        "Returns the current rate (typically 4-8%). Use to evaluate yield potential."
    )
    sdk: Optional[ClicksSDKBridge] = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, sdk: Optional[ClicksSDKBridge] = None, **kwargs):
        super().__init__(**kwargs)
        self.sdk = sdk or ClicksSDKBridge()

    def _run(
        self,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        result = self.sdk.get_current_apy()
        if result.get("success"):
            return f"Current Clicks Protocol APY: {result['data']}%"
        return f"Could not fetch APY: {result.get('error', 'Unknown error')}"


class ClicksSimulateSplitTool(BaseTool):
    """
    Preview how a USDC amount would be split before committing.
    
    USE THIS TOOL WHEN:
    - The agent wants to see the 80/20 breakdown before activating
    - Planning treasury allocation
    - The user asks "what would happen if I deposited X?"
    
    This is a read-only operation. No funds are moved.
    """
    
    name: str = "clicks_simulate_split"
    description: str = (
        "Preview how USDC would be split 80/20 without moving funds. "
        "Shows liquid amount, yield amount, and estimated earnings. "
        "Use before clicks_activate_yield to preview the outcome."
    )
    args_schema: Type[BaseModel] = SimulateSplitInput
    sdk: Optional[ClicksSDKBridge] = None

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, sdk: Optional[ClicksSDKBridge] = None, **kwargs):
        super().__init__(**kwargs)
        self.sdk = sdk or ClicksSDKBridge()

    def _run(
        self,
        amount: str,
        agent_address: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        result = self.sdk.simulate_split(amount, agent_address)
        if result.get("success"):
            data = result.get("data", {})
            return (
                f"Split Preview for {amount} USDC:\n"
                f"  Liquid (80%): {data.get('liquidAmount', float(amount) * 0.8):.2f} USDC\n"
                f"  Yield (20%):  {data.get('yieldAmount', float(amount) * 0.2):.2f} USDC\n"
                f"  Est. Annual:  {data.get('estimatedYield', 'N/A')} USDC\n"
                f"  No funds moved. Use clicks_activate_yield to proceed."
            )
        return f"Simulation failed: {result.get('error', 'Unknown error')}"


def get_clicks_tools(
    rpc_url: Optional[str] = None,
    private_key: Optional[str] = None,
    sdk_path: Optional[str] = None,
) -> list:
    """
    Get all Clicks Protocol tools for a LangChain agent.
    
    Args:
        rpc_url: Base RPC URL (default: CLICKS_RPC_URL env var)
        private_key: Agent wallet private key (default: CLICKS_PRIVATE_KEY env var)
        sdk_path: Path to installed @clicks-protocol/sdk (default: CLICKS_SDK_PATH env var)
    
    Returns:
        List of LangChain tools for yield management
        
    Example:
        from clicks_langchain import get_clicks_tools
        tools = get_clicks_tools()
        agent = initialize_agent(tools, llm, agent=AgentType.OPENAI_FUNCTIONS)
    """
    sdk = ClicksSDKBridge(rpc_url=rpc_url, private_key=private_key, sdk_path=sdk_path)
    return [
        ClicksActivateYieldTool(sdk=sdk),
        ClicksWithdrawYieldTool(sdk=sdk),
        ClicksCheckBalanceTool(sdk=sdk),
        ClicksGetAPYTool(sdk=sdk),
        ClicksSimulateSplitTool(sdk=sdk),
    ]
