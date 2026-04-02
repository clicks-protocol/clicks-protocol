"""
Clicks Protocol CrewAI Tools
==============================
On-chain yield management tools for CrewAI agent crews on Base.
Powered by Clicks Protocol (clicksprotocol.xyz)

These tools enable CrewAI agents (e.g. Treasury Managers, Investment Analysts)
to autonomously manage idle USDC by splitting funds 80/20:
80% stays liquid for operations, 20% earns 4-8% APY on-chain.

Usage:
    from clicks_crewai import ClicksCheckBalanceTool, ClicksActivateYieldTool
    treasury_agent = Agent(
        role="Treasury Manager",
        tools=[ClicksCheckBalanceTool(), ClicksActivateYieldTool()],
    )
"""

import os
import json
import subprocess
from typing import Optional, Type
from pydantic import BaseModel, Field
from crewai_tools import BaseTool


# ---------------------------------------------------------------------------
# Contract addresses (Base Mainnet)
# ---------------------------------------------------------------------------
CONTRACTS = {
    "registry": "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3",
    "splitter": "0x24323A30626BBE78C00beA45A3c0eE36bA31FcB4",
    "yield_router": "0x4E29571FCCE958823c0B184a66EEb7bCbe1c849F",
    "fee": "0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE",
    "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
}


class ClicksSDKBridge:
    """
    Bridge to the @clicks-protocol/sdk Node.js package.
    
    Requires:
        - Node.js >= 18
        - @clicks-protocol/sdk installed
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
                "No private key. Set CLICKS_PRIVATE_KEY env var or pass private_key."
            )

    def _call_sdk(self, method: str, **kwargs) -> dict:
        """Execute an SDK method via Node.js subprocess."""
        args_str = ", ".join(
            f"'{v}'" if isinstance(v, str) else str(v) for v in kwargs.values()
        )
        script = f"""
        const {{ ClicksSDK }} = require('@clicks-protocol/sdk');
        const {{ ethers }} = require('ethers');
        (async () => {{
            const provider = new ethers.JsonRpcProvider('{self.rpc_url}');
            const wallet = new ethers.Wallet('{self.private_key}', provider);
            const sdk = new ClicksSDK({{ signer: wallet, provider }});
            try {{
                const result = await sdk.{method}({args_str});
                console.log(JSON.stringify({{ success: true, data: result }}));
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
            return {"success": False, "error": "SDK call timed out (60s)"}
        except json.JSONDecodeError:
            return {"success": False, "error": f"Invalid response: {result.stdout[:200]}"}

    def quick_start(self, amount: str, agent_address: str) -> dict:
        return self._call_sdk("quickStart", amount=amount, agentAddress=agent_address)

    def withdraw_yield(self, agent_address: str) -> dict:
        return self._call_sdk("withdrawYield", agentAddress=agent_address)

    def simulate_split(self, amount: str, agent_address: str) -> dict:
        return self._call_sdk("simulateSplit", amount=amount, agentAddress=agent_address)

    def get_agent_info(self, agent_address: str) -> dict:
        return self._call_sdk("getAgentInfo", agentAddress=agent_address)

    def get_yield_info(self) -> dict:
        return self._call_sdk("getYieldInfo")

    def get_current_apy(self) -> dict:
        return self._call_sdk("getCurrentAPY")


# ---------------------------------------------------------------------------
# Shared SDK instance (lazy init)
# ---------------------------------------------------------------------------
_sdk_instance: Optional[ClicksSDKBridge] = None


def _get_sdk() -> ClicksSDKBridge:
    global _sdk_instance
    if _sdk_instance is None:
        _sdk_instance = ClicksSDKBridge()
    return _sdk_instance


def configure_sdk(
    rpc_url: Optional[str] = None,
    private_key: Optional[str] = None,
    sdk_path: Optional[str] = None,
):
    """Configure the shared SDK instance. Call before using tools."""
    global _sdk_instance
    _sdk_instance = ClicksSDKBridge(rpc_url, private_key, sdk_path)


# ---------------------------------------------------------------------------
# CrewAI Tools
# ---------------------------------------------------------------------------

class ClicksCheckBalanceTool(BaseTool):
    """Check how much USDC is liquid vs. earning yield on Clicks Protocol.
    
    Use this tool when you need to understand the agent's treasury position
    before making spending or allocation decisions. Returns liquid balance,
    deposited amount, accrued yield, and registration status.
    """
    
    name: str = "Check USDC Balance & Yield Status"
    description: str = (
        "Check the agent's USDC treasury on Clicks Protocol: liquid funds "
        "(available immediately), deposited amount (earning yield), accrued "
        "earnings, and current APY. Use BEFORE making any treasury decision."
    )

    def _run(self, agent_address: str) -> str:
        """
        Args:
            agent_address: Ethereum address of the agent wallet on Base
        """
        sdk = _get_sdk()
        info = sdk.get_agent_info(agent_address)
        apy = sdk.get_current_apy()

        if not info.get("success"):
            return f"Balance check failed: {info.get('error', 'Unknown error')}"

        data = info.get("data", {})
        apy_rate = apy.get("data", "N/A") if apy.get("success") else "N/A"

        return (
            f"Treasury Status for {agent_address}:\n"
            f"  Liquid USDC: {data.get('liquidBalance', '0')} (available now)\n"
            f"  Deposited:   {data.get('depositedBalance', '0')} (earning yield)\n"
            f"  Accrued:     {data.get('accruedYield', '0')} (yield earned so far)\n"
            f"  Current APY: {apy_rate}%\n"
            f"  Registered:  {data.get('isRegistered', False)}\n"
            f"  Protocol:    Clicks Protocol on Base"
        )


class ClicksActivateYieldTool(BaseTool):
    """Activate yield on idle USDC via Clicks Protocol.
    
    Use this tool when the agent has USDC sitting idle that won't be needed
    immediately. Splits funds 80/20: 80% stays liquid for operations,
    20% earns 4-8% APY on-chain on Base.
    
    DO NOT use when:
    - All funds are needed for an imminent transaction
    - The amount is very small (gas may exceed yield)
    - The agent is not on Base network
    """
    
    name: str = "Activate USDC Yield"
    description: str = (
        "Split idle USDC 80/20 via Clicks Protocol. 80% stays liquid, "
        "20% earns 4-8% APY on Base. Provide the USDC amount and agent address."
    )

    def _run(self, amount: str, agent_address: str) -> str:
        """
        Args:
            amount: USDC amount to split (e.g. '5000')
            agent_address: Ethereum address of the agent wallet on Base
        """
        sdk = _get_sdk()

        # Simulate first
        sim = sdk.simulate_split(amount, agent_address)
        if not sim.get("success"):
            return f"Simulation failed: {sim.get('error')}. Aborting."

        result = sdk.quick_start(amount, agent_address)
        if result.get("success"):
            data = result.get("data", {})
            liquid = float(amount) * 0.8
            yield_amt = float(amount) * 0.2
            return (
                f"Yield activated on {amount} USDC:\n"
                f"  Liquid (80%): {liquid:.2f} USDC — available immediately\n"
                f"  Yield (20%):  {yield_amt:.2f} USDC — earning APY on Base\n"
                f"  TX: {data.get('txHash', 'pending')}\n"
                f"  Protocol: Clicks Protocol"
            )
        return f"Activation failed: {result.get('error', 'Unknown error')}"


class ClicksWithdrawYieldTool(BaseTool):
    """Withdraw earned yield and deposits from Clicks Protocol.
    
    Use when the agent needs maximum liquidity, wants to consolidate funds,
    or when APY has dropped below acceptable levels. All accrued yield and
    the deposited 20% are returned to the agent's wallet.
    """
    
    name: str = "Withdraw Yield"
    description: str = (
        "Withdraw all earned yield and deposited funds from Clicks Protocol "
        "back to the agent wallet. Use when maximum liquidity is needed."
    )

    def _run(self, agent_address: str) -> str:
        """
        Args:
            agent_address: Ethereum address of the agent wallet on Base
        """
        sdk = _get_sdk()
        result = sdk.withdraw_yield(agent_address)

        if result.get("success"):
            data = result.get("data", {})
            return (
                f"Withdrawal successful:\n"
                f"  Amount returned: {data.get('amount', 'N/A')} USDC\n"
                f"  TX: {data.get('txHash', 'pending')}\n"
                f"  All funds are now liquid. No yield is being earned."
            )
        return f"Withdrawal failed: {result.get('error', 'Unknown error')}"


class ClicksGetAPYTool(BaseTool):
    """Get the current APY rate from Clicks Protocol.
    
    Use to evaluate whether activating yield is worthwhile, to compare
    rates over time, or to report current earnings potential.
    Typically returns 4-8% APY.
    """
    
    name: str = "Get Current APY"
    description: str = (
        "Get the current annual percentage yield (APY) from Clicks Protocol. "
        "Returns the live rate (typically 4-8%). Use to evaluate yield potential."
    )

    def _run(self) -> str:
        sdk = _get_sdk()
        result = sdk.get_current_apy()

        if result.get("success"):
            apy = result["data"]
            assessment = ""
            try:
                apy_float = float(apy)
                if apy_float >= 6:
                    assessment = " (strong yield, recommended to activate)"
                elif apy_float >= 4:
                    assessment = " (healthy yield)"
                else:
                    assessment = " (below average, consider waiting)"
            except (ValueError, TypeError):
                pass
            return f"Current Clicks Protocol APY: {apy}%{assessment}"
        return f"Could not fetch APY: {result.get('error', 'Unknown error')}"


class ClicksSimulateSplitTool(BaseTool):
    """Preview how a USDC amount would be split before committing.
    
    Use for planning and analysis. Shows the 80/20 breakdown and
    estimated annual yield. No funds are moved. This is read-only.
    """
    
    name: str = "Simulate USDC Split"
    description: str = (
        "Preview how USDC would be split 80/20 without moving any funds. "
        "Shows liquid amount, yield amount, and estimated earnings. "
        "Use for planning before activating yield."
    )

    def _run(self, amount: str, agent_address: str) -> str:
        """
        Args:
            amount: USDC amount to simulate (e.g. '10000')
            agent_address: Ethereum address of the agent wallet on Base
        """
        sdk = _get_sdk()
        result = sdk.simulate_split(amount, agent_address)

        if result.get("success"):
            data = result.get("data", {})
            liquid = float(amount) * 0.8
            yield_amt = float(amount) * 0.2
            return (
                f"Split Simulation for {amount} USDC:\n"
                f"  Liquid (80%): {liquid:.2f} USDC — stays available\n"
                f"  Yield (20%):  {yield_amt:.2f} USDC — earns APY\n"
                f"  Est. Annual:  {data.get('estimatedYield', 'N/A')} USDC\n"
                f"  No funds moved. Use 'Activate USDC Yield' to proceed."
            )
        return f"Simulation failed: {result.get('error', 'Unknown error')}"


def get_all_tools() -> list:
    """
    Get all Clicks Protocol tools for a CrewAI crew.
    
    Returns:
        List of CrewAI tools for treasury management
        
    Example:
        from clicks_crewai import get_all_tools
        tools = get_all_tools()
    """
    return [
        ClicksCheckBalanceTool(),
        ClicksActivateYieldTool(),
        ClicksWithdrawYieldTool(),
        ClicksGetAPYTool(),
        ClicksSimulateSplitTool(),
    ]
