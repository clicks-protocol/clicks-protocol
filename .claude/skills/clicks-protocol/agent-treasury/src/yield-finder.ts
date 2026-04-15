import { ethers } from "ethers";

/** Supported yield protocols on Base */
export type Protocol = "aave-v3" | "morpho" | "compound-v3";

export interface YieldRate {
  protocol: Protocol;
  asset: string;
  chain: string;
  supplyAPY: number;
  timestamp: number;
}

export interface YieldComparison {
  rates: YieldRate[];
  best: YieldRate | null;
  fetchedAt: number;
}

export interface YieldHistoryEntry {
  comparison: YieldComparison;
  recordedAt: number;
}

// On-chain contract addresses on Base for reading supply rates
const PROTOCOL_CONTRACTS: Record<Protocol, { address: string; abi: string[] }> = {
  "aave-v3": {
    // Aave V3 Pool on Base — getReserveData returns supply rate
    address: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    abi: [
      "function getReserveData(address asset) view returns (uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt)",
    ],
  },
  "morpho": {
    // Morpho Blue on Base
    address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    abi: [
      "function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)",
    ],
  },
  "compound-v3": {
    // Compound V3 (Comet) USDC on Base
    address: "0xb125E6687d4313864e53df431d5425969c15Eb2F",
    abi: [
      "function getSupplyRate(uint256 utilization) view returns (uint64)",
      "function getUtilization() view returns (uint256)",
    ],
  },
};

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Ray = 1e27 (Aave rate precision)
const RAY = 10n ** 27n;
const SECONDS_PER_YEAR = 31536000;

export interface YieldFinderConfig {
  /** Base RPC URL override */
  rpcUrl?: string;
  /** Which protocols to check (default: all) */
  protocols?: Protocol[];
}

/**
 * Compare DeFi yields for USDC on Base.
 * Works standalone, no Clicks Protocol dependency.
 */
export class YieldFinder {
  private provider: ethers.JsonRpcProvider;
  private protocols: Protocol[];
  private history: YieldHistoryEntry[] = [];

  constructor(config: YieldFinderConfig = {}) {
    this.provider = new ethers.JsonRpcProvider(
      config.rpcUrl ?? "https://mainnet.base.org"
    );
    this.protocols = config.protocols ?? ["aave-v3", "compound-v3"];
  }

  /** Fetch Aave V3 USDC supply APY on Base */
  private async getAaveRate(): Promise<YieldRate> {
    const { address, abi } = PROTOCOL_CONTRACTS["aave-v3"];
    const contract = new ethers.Contract(address, abi, this.provider);

    try {
      const data = await contract.getReserveData(USDC_BASE);
      // currentLiquidityRate is at index 2, in RAY (1e27)
      const liquidityRate = BigInt(data[2]);
      // APY = ((1 + rate/secondsPerYear)^secondsPerYear - 1) * 100
      // Simplified: APY ≈ rate * 100 / RAY (for display purposes)
      const apyPercent =
        Number((liquidityRate * 10000n) / RAY) / 100;

      return {
        protocol: "aave-v3",
        asset: "USDC",
        chain: "base",
        supplyAPY: apyPercent,
        timestamp: Date.now(),
      };
    } catch {
      return {
        protocol: "aave-v3",
        asset: "USDC",
        chain: "base",
        supplyAPY: 0,
        timestamp: Date.now(),
      };
    }
  }

  /** Fetch Compound V3 USDC supply APY on Base */
  private async getCompoundRate(): Promise<YieldRate> {
    const { address, abi } = PROTOCOL_CONTRACTS["compound-v3"];
    const contract = new ethers.Contract(address, abi, this.provider);

    try {
      const utilization = await contract.getUtilization();
      const supplyRatePerSecond = await contract.getSupplyRate(utilization);
      // Compound rate is per-second, scaled by 1e18
      // APY = (1 + ratePerSecond)^secondsPerYear - 1
      const ratePerSecond = Number(supplyRatePerSecond) / 1e18;
      const apy = (Math.pow(1 + ratePerSecond, SECONDS_PER_YEAR) - 1) * 100;

      return {
        protocol: "compound-v3",
        asset: "USDC",
        chain: "base",
        supplyAPY: Math.round(apy * 100) / 100,
        timestamp: Date.now(),
      };
    } catch {
      return {
        protocol: "compound-v3",
        asset: "USDC",
        chain: "base",
        supplyAPY: 0,
        timestamp: Date.now(),
      };
    }
  }

  /** Fetch Morpho USDC supply APY on Base (simplified) */
  private async getMorphoRate(): Promise<YieldRate> {
    // Morpho Blue uses market IDs; the USDC/WETH market is common
    // For simplicity, we estimate from utilization
    // In production, you'd query specific market IDs
    return {
      protocol: "morpho",
      asset: "USDC",
      chain: "base",
      supplyAPY: 0, // Requires market ID — set to 0 if unavailable
      timestamp: Date.now(),
    };
  }

  /** Compare yields across configured protocols */
  async compareYields(): Promise<YieldComparison> {
    const fetchers: Record<Protocol, () => Promise<YieldRate>> = {
      "aave-v3": () => this.getAaveRate(),
      "morpho": () => this.getMorphoRate(),
      "compound-v3": () => this.getCompoundRate(),
    };

    const results = await Promise.allSettled(
      this.protocols.map((p) => fetchers[p]())
    );

    const rates: YieldRate[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        rates.push(result.value);
      }
    }

    // Sort descending by APY
    rates.sort((a, b) => b.supplyAPY - a.supplyAPY);

    const comparison: YieldComparison = {
      rates,
      best: rates.length > 0 ? rates[0] : null,
      fetchedAt: Date.now(),
    };

    // Store history
    this.history.push({ comparison, recordedAt: Date.now() });
    if (this.history.length > 500) this.history.shift();

    return comparison;
  }

  /** Get the best current yield */
  async getBestYield(): Promise<YieldRate | null> {
    const comparison = await this.compareYields();
    return comparison.best;
  }

  /** Get historical yield comparisons */
  getHistory(): YieldHistoryEntry[] {
    return [...this.history];
  }
}
