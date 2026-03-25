/**
 * Clicks Protocol Plugin for Eliza (ai16z)
 * ==========================================
 * On-chain yield management for autonomous AI agents on Base.
 * Powered by Clicks Protocol (clicksprotocol.xyz)
 *
 * This plugin enables Eliza agents to autonomously manage idle USDC by
 * splitting funds 80/20: 80% stays liquid, 20% earns 4-8% APY on-chain.
 *
 * Usage:
 *   import { clicksPlugin } from "@clicks-protocol/eliza-plugin";
 *   // Add to your Eliza agent's plugin list
 */

import { ethers } from "ethers";

// ---------------------------------------------------------------------------
// Types (aligned with Eliza plugin interface)
// ---------------------------------------------------------------------------

interface AgentRuntime {
  getSetting(key: string): string | undefined;
  messageManager: {
    createMemory(memory: Memory): Promise<void>;
  };
  composeState(message: Message): Promise<State>;
}

interface Memory {
  userId: string;
  agentId: string;
  roomId: string;
  content: {
    text: string;
    action?: string;
    data?: Record<string, unknown>;
  };
}

interface Message {
  userId: string;
  agentId: string;
  roomId: string;
  content: {
    text: string;
    action?: string;
  };
}

interface State {
  [key: string]: unknown;
}

interface Action {
  name: string;
  description: string;
  similes: string[];
  examples: Array<Array<{ user: string; content: { text: string; action?: string } }>>;
  validate: (runtime: AgentRuntime, message: Message) => Promise<boolean>;
  handler: (
    runtime: AgentRuntime,
    message: Message,
    state: State,
    options: Record<string, unknown>,
    callback: (response: { text: string; action?: string }) => void
  ) => Promise<void>;
}

interface Provider {
  get: (runtime: AgentRuntime, message: Message) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Contract addresses (Base Mainnet)
// ---------------------------------------------------------------------------

const CONTRACTS = {
  registry: "0x898d8a3B04e5E333E88f798372129C6a622fF48d",
  splitter: "0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5",
  yieldRouter: "0x47d6Add0a3bdFe856b39a0311D8c055481F76f29",
  fee: "0xb90cd287d30587dAF40B2E1ce32cefA99FD10E12",
  usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
} as const;

// ---------------------------------------------------------------------------
// SDK Bridge
// ---------------------------------------------------------------------------

class ClicksSDK {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  get agentAddress(): string {
    return this.wallet.address;
  }

  async quickStart(amount: string): Promise<{ txHash: string; liquid: string; yield: string }> {
    // Import and use @clicks-protocol/sdk
    const { ClicksSDK: SDK } = await import("@clicks-protocol/sdk");
    const sdk = new SDK({ signer: this.wallet, provider: this.provider });
    const result = await sdk.quickStart(amount, this.agentAddress);
    return {
      txHash: result.txHash || result.hash || "pending",
      liquid: (parseFloat(amount) * 0.8).toFixed(2),
      yield: (parseFloat(amount) * 0.2).toFixed(2),
    };
  }

  async withdrawYield(): Promise<{ txHash: string; amount: string }> {
    const { ClicksSDK: SDK } = await import("@clicks-protocol/sdk");
    const sdk = new SDK({ signer: this.wallet, provider: this.provider });
    const result = await sdk.withdrawYield(this.agentAddress);
    return {
      txHash: result.txHash || result.hash || "pending",
      amount: result.amount || "N/A",
    };
  }

  async getAgentInfo(): Promise<Record<string, unknown>> {
    const { ClicksSDK: SDK } = await import("@clicks-protocol/sdk");
    const sdk = new SDK({ signer: this.wallet, provider: this.provider });
    return sdk.getAgentInfo(this.agentAddress);
  }

  async getCurrentAPY(): Promise<string> {
    const { ClicksSDK: SDK } = await import("@clicks-protocol/sdk");
    const sdk = new SDK({ signer: this.wallet, provider: this.provider });
    return sdk.getCurrentAPY();
  }

  async simulateSplit(amount: string): Promise<Record<string, unknown>> {
    const { ClicksSDK: SDK } = await import("@clicks-protocol/sdk");
    const sdk = new SDK({ signer: this.wallet, provider: this.provider });
    return sdk.simulateSplit(amount, this.agentAddress);
  }
}

// ---------------------------------------------------------------------------
// Helper: get SDK instance from runtime settings
// ---------------------------------------------------------------------------

function getSDK(runtime: AgentRuntime): ClicksSDK {
  const rpcUrl = runtime.getSetting("CLICKS_RPC_URL") || "https://mainnet.base.org";
  const privateKey = runtime.getSetting("CLICKS_PRIVATE_KEY");

  if (!privateKey) {
    throw new Error(
      "CLICKS_PRIVATE_KEY not set. Add it to your Eliza agent's settings."
    );
  }

  return new ClicksSDK(rpcUrl, privateKey);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const activateYield: Action = {
  name: "ACTIVATE_YIELD",
  description:
    "Split idle USDC 80/20 via Clicks Protocol. 80% stays liquid for operations, " +
    "20% earns 4-8% APY on Base. Use when the agent has idle USDC not needed immediately.",
  similes: [
    "EARN_YIELD",
    "DEPOSIT_YIELD",
    "START_EARNING",
    "SPLIT_USDC",
    "PUT_MONEY_TO_WORK",
    "ACTIVATE_CLICKS",
  ],
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "I have 5000 USDC sitting idle. Put it to work." },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Activating yield on 5000 USDC. Splitting 80/20: 4000 USDC stays liquid, 1000 USDC earns yield.",
          action: "ACTIVATE_YIELD",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Activate Clicks Protocol yield on 10000 USDC" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Splitting 10000 USDC via Clicks Protocol. 8000 liquid, 2000 earning ~6% APY on Base.",
          action: "ACTIVATE_YIELD",
        },
      },
    ],
  ],

  validate: async (runtime: AgentRuntime, message: Message): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    const hasAmountPattern = /\d+/.test(text);
    const hasYieldKeyword =
      text.includes("yield") ||
      text.includes("earn") ||
      text.includes("split") ||
      text.includes("deposit") ||
      text.includes("clicks") ||
      text.includes("put") ||
      text.includes("activate");
    return hasAmountPattern && hasYieldKeyword;
  },

  handler: async (
    runtime: AgentRuntime,
    message: Message,
    _state: State,
    _options: Record<string, unknown>,
    callback: (response: { text: string; action?: string }) => void
  ): Promise<void> => {
    try {
      const sdk = getSDK(runtime);

      // Extract amount from message
      const amountMatch = message.content.text.match(/(\d+(?:\.\d+)?)/);
      if (!amountMatch) {
        callback({ text: "I need an amount to activate yield. How much USDC should I split?" });
        return;
      }

      const amount = amountMatch[1];
      const result = await sdk.quickStart(amount);

      callback({
        text:
          `Yield activated via Clicks Protocol.\n` +
          `Total: ${amount} USDC\n` +
          `Liquid (80%): ${result.liquid} USDC — available immediately\n` +
          `Yield (20%): ${result.yield} USDC — earning APY on Base\n` +
          `TX: ${result.txHash}`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      callback({ text: `Failed to activate yield: ${msg}` });
    }
  },
};

const withdrawYield: Action = {
  name: "WITHDRAW_YIELD",
  description:
    "Withdraw all earned yield and deposited funds from Clicks Protocol " +
    "back to the agent wallet. Use when maximum liquidity is needed.",
  similes: [
    "CLAIM_YIELD",
    "WITHDRAW_EARNINGS",
    "PULL_FUNDS",
    "EXIT_YIELD",
    "STOP_EARNING",
  ],
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Withdraw my yield from Clicks Protocol" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Withdrawing all yield and deposits from Clicks Protocol.",
          action: "WITHDRAW_YIELD",
        },
      },
    ],
  ],

  validate: async (_runtime: AgentRuntime, message: Message): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    return (
      (text.includes("withdraw") || text.includes("claim") || text.includes("pull") || text.includes("exit")) &&
      (text.includes("yield") || text.includes("clicks") || text.includes("earnings") || text.includes("funds"))
    );
  },

  handler: async (
    runtime: AgentRuntime,
    _message: Message,
    _state: State,
    _options: Record<string, unknown>,
    callback: (response: { text: string; action?: string }) => void
  ): Promise<void> => {
    try {
      const sdk = getSDK(runtime);
      const result = await sdk.withdrawYield();

      callback({
        text:
          `Yield withdrawn from Clicks Protocol.\n` +
          `Amount returned: ${result.amount} USDC\n` +
          `TX: ${result.txHash}\n` +
          `All funds are now liquid in your wallet.`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      callback({ text: `Withdrawal failed: ${msg}` });
    }
  },
};

const checkBalance: Action = {
  name: "CHECK_YIELD_BALANCE",
  description:
    "Check the agent's USDC balance on Clicks Protocol: liquid funds, " +
    "deposited amount, accrued yield, and current APY.",
  similes: [
    "CHECK_BALANCE",
    "YIELD_STATUS",
    "TREASURY_STATUS",
    "HOW_MUCH_YIELD",
    "CHECK_CLICKS",
  ],
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "What's my yield status on Clicks?" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Checking your Clicks Protocol treasury status...",
          action: "CHECK_YIELD_BALANCE",
        },
      },
    ],
  ],

  validate: async (_runtime: AgentRuntime, message: Message): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    return (
      (text.includes("balance") || text.includes("status") || text.includes("check") || text.includes("how much")) &&
      (text.includes("yield") || text.includes("clicks") || text.includes("treasury") || text.includes("earning"))
    );
  },

  handler: async (
    runtime: AgentRuntime,
    _message: Message,
    _state: State,
    _options: Record<string, unknown>,
    callback: (response: { text: string; action?: string }) => void
  ): Promise<void> => {
    try {
      const sdk = getSDK(runtime);
      const [info, apy] = await Promise.all([sdk.getAgentInfo(), sdk.getCurrentAPY()]);

      const data = info as Record<string, unknown>;

      callback({
        text:
          `Clicks Protocol Treasury Status:\n` +
          `Liquid USDC: ${data.liquidBalance || "0"} (available now)\n` +
          `Deposited: ${data.depositedBalance || "0"} (earning yield)\n` +
          `Accrued Yield: ${data.accruedYield || "0"}\n` +
          `Current APY: ${apy}%\n` +
          `Registered: ${data.isRegistered || false}`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      callback({ text: `Balance check failed: ${msg}` });
    }
  },
};

const getAPY: Action = {
  name: "GET_CLICKS_APY",
  description:
    "Get the current APY rate from Clicks Protocol. " +
    "Typically returns 4-8% depending on market conditions.",
  similes: ["WHAT_APY", "CURRENT_RATE", "YIELD_RATE", "CLICKS_APY"],
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "What's the current APY on Clicks Protocol?" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Fetching current Clicks Protocol APY...",
          action: "GET_CLICKS_APY",
        },
      },
    ],
  ],

  validate: async (_runtime: AgentRuntime, message: Message): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    return text.includes("apy") || text.includes("rate") || text.includes("interest");
  },

  handler: async (
    runtime: AgentRuntime,
    _message: Message,
    _state: State,
    _options: Record<string, unknown>,
    callback: (response: { text: string; action?: string }) => void
  ): Promise<void> => {
    try {
      const sdk = getSDK(runtime);
      const apy = await sdk.getCurrentAPY();
      callback({ text: `Current Clicks Protocol APY: ${apy}%` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      callback({ text: `Could not fetch APY: ${msg}` });
    }
  },
};

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

const walletBalanceProvider: Provider = {
  get: async (runtime: AgentRuntime, _message: Message): Promise<string> => {
    try {
      const sdk = getSDK(runtime);
      const info = await sdk.getAgentInfo();
      const data = info as Record<string, unknown>;

      return (
        `[Clicks Protocol Wallet]\n` +
        `Address: ${sdk.agentAddress}\n` +
        `Liquid: ${data.liquidBalance || "0"} USDC\n` +
        `Deposited: ${data.depositedBalance || "0"} USDC\n` +
        `Accrued Yield: ${data.accruedYield || "0"} USDC\n` +
        `Registered: ${data.isRegistered || false}`
      );
    } catch {
      return "[Clicks Protocol] Wallet balance unavailable (not configured or network error)";
    }
  },
};

const yieldInfoProvider: Provider = {
  get: async (runtime: AgentRuntime, _message: Message): Promise<string> => {
    try {
      const sdk = getSDK(runtime);
      const apy = await sdk.getCurrentAPY();

      return (
        `[Clicks Protocol Yield Info]\n` +
        `Current APY: ${apy}%\n` +
        `Split: 80% liquid / 20% yield\n` +
        `Network: Base Mainnet\n` +
        `Asset: USDC`
      );
    } catch {
      return "[Clicks Protocol] Yield info unavailable";
    }
  },
};

// ---------------------------------------------------------------------------
// Plugin Export
// ---------------------------------------------------------------------------

export const clicksPlugin = {
  name: "clicks-protocol",
  description:
    "Autonomous on-chain yield for AI agent USDC on Base. " +
    "Splits idle funds 80/20: 80% liquid, 20% earning 4-8% APY. " +
    "Powered by Clicks Protocol (clicksprotocol.xyz)",
  actions: [activateYield, withdrawYield, checkBalance, getAPY],
  providers: [walletBalanceProvider, yieldInfoProvider],
};

export default clicksPlugin;
