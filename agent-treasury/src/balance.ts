import { ethers } from "ethers";

/** USDC contract addresses per chain */
export const USDC_ADDRESSES: Record<string, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
};

/** Default public RPC endpoints */
export const DEFAULT_RPCS: Record<string, string> = {
  base: "https://mainnet.base.org",
  ethereum: "https://eth.llamarpc.com",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  optimism: "https://mainnet.optimism.io",
};

/** ERC-20 balanceOf ABI fragment */
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

export type ChainName = "base" | "ethereum" | "arbitrum" | "optimism";

export interface ChainBalance {
  chain: ChainName;
  balance: bigint;
  formatted: string;
  timestamp: number;
}

export interface BalanceSnapshot {
  address: string;
  balances: ChainBalance[];
  total: bigint;
  totalFormatted: string;
  timestamp: number;
}

export interface BalanceHistoryEntry {
  snapshot: BalanceSnapshot;
  recordedAt: number;
}

export interface BalanceTrackerConfig {
  /** Override RPC URLs per chain */
  rpcs?: Partial<Record<ChainName, string>>;
  /** Which chains to track (default: all) */
  chains?: ChainName[];
}

/**
 * Multi-chain USDC balance tracker.
 * Works standalone, no Clicks Protocol dependency.
 */
export class BalanceTracker {
  private providers: Map<ChainName, ethers.JsonRpcProvider> = new Map();
  private chains: ChainName[];
  private history: Map<string, BalanceHistoryEntry[]> = new Map();

  constructor(config: BalanceTrackerConfig = {}) {
    this.chains = config.chains ?? (Object.keys(USDC_ADDRESSES) as ChainName[]);

    for (const chain of this.chains) {
      const rpcUrl = config.rpcs?.[chain] ?? DEFAULT_RPCS[chain];
      this.providers.set(chain, new ethers.JsonRpcProvider(rpcUrl));
    }
  }

  /** Get USDC balance on a single chain */
  async getBalance(address: string, chain: ChainName): Promise<ChainBalance> {
    const provider = this.providers.get(chain);
    if (!provider) throw new Error(`Chain "${chain}" not configured`);

    const usdcAddress = USDC_ADDRESSES[chain];
    const contract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
    const balance: bigint = await contract.balanceOf(address);

    return {
      chain,
      balance,
      formatted: ethers.formatUnits(balance, 6),
      timestamp: Date.now(),
    };
  }

  /** Get USDC balances across all configured chains */
  async getBalances(address: string): Promise<BalanceSnapshot> {
    const results = await Promise.allSettled(
      this.chains.map((chain) => this.getBalance(address, chain))
    );

    const balances: ChainBalance[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        balances.push(result.value);
      }
    }

    const total = balances.reduce((sum, b) => sum + b.balance, 0n);
    const snapshot: BalanceSnapshot = {
      address,
      balances,
      total,
      totalFormatted: ethers.formatUnits(total, 6),
      timestamp: Date.now(),
    };

    // Store in history
    const existing = this.history.get(address) ?? [];
    existing.push({ snapshot, recordedAt: Date.now() });
    // Keep last 1000 entries per address
    if (existing.length > 1000) existing.shift();
    this.history.set(address, existing);

    return snapshot;
  }

  /** Get balance history for an address */
  getHistory(address: string): BalanceHistoryEntry[] {
    return this.history.get(address) ?? [];
  }

  /** Clear history for an address (or all) */
  clearHistory(address?: string): void {
    if (address) {
      this.history.delete(address);
    } else {
      this.history.clear();
    }
  }
}
