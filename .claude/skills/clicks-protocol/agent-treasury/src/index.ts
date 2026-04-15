export {
  BalanceTracker,
  USDC_ADDRESSES,
  DEFAULT_RPCS,
  type ChainName,
  type ChainBalance,
  type BalanceSnapshot,
  type BalanceHistoryEntry,
  type BalanceTrackerConfig,
} from "./balance";

export {
  YieldFinder,
  type Protocol,
  type YieldRate,
  type YieldComparison,
  type YieldHistoryEntry,
  type YieldFinderConfig,
} from "./yield-finder";

export {
  IdleDetector,
  type IdleBalanceAlert,
  type IdleCallback,
  type IdleDetectorConfig,
} from "./idle-detector";

export {
  ClicksActivator,
  type ActivateConfig,
  type ActivateResult,
  type YieldPosition,
} from "./activate";

import { BalanceTracker, type BalanceTrackerConfig, type ChainName } from "./balance";
import { YieldFinder, type YieldFinderConfig } from "./yield-finder";
import { IdleDetector, type IdleDetectorConfig, type IdleCallback } from "./idle-detector";
import { ClicksActivator, type ActivateConfig } from "./activate";
import { ethers } from "ethers";

export interface AgentTreasuryConfig {
  /** Base RPC URL override */
  rpcUrl?: string;
  /** Override RPC URLs per chain */
  rpcs?: Partial<Record<ChainName, string>>;
  /** Which chains to track (default: all) */
  chains?: ChainName[];
  /** Yield finder protocols */
  protocols?: ("aave-v3" | "morpho" | "compound-v3")[];
  /** Idle detection: minimum USDC to alert (default: 100) */
  idleThresholdUsdc?: number;
  /** Idle detection: time before alert in ms (default: 1 hour) */
  idleTimeMs?: number;
  /** Clicks Protocol router address override */
  clicksRouterAddress?: string;
}

/**
 * AgentTreasury — unified treasury management for AI agents.
 *
 * Track balances, compare yields, detect idle funds, and optionally
 * activate yield via Clicks Protocol.
 *
 * @example
 * ```ts
 * import { AgentTreasury } from "agent-treasury";
 *
 * const treasury = new AgentTreasury();
 * const balances = await treasury.getBalances("0x...");
 * const yields = await treasury.compareYields();
 * const idle = await treasury.getIdleBalance("0x...");
 * ```
 */
export class AgentTreasury {
  public readonly balance: BalanceTracker;
  public readonly yields: YieldFinder;
  public readonly idle: IdleDetector;
  public readonly clicks: ClicksActivator;

  constructor(config: AgentTreasuryConfig = {}) {
    const balanceConfig: BalanceTrackerConfig = {
      rpcs: config.rpcs,
      chains: config.chains,
    };

    const yieldConfig: YieldFinderConfig = {
      rpcUrl: config.rpcUrl ?? config.rpcs?.base,
      protocols: config.protocols,
    };

    const idleConfig: IdleDetectorConfig = {
      ...balanceConfig,
      thresholdUsdc: config.idleThresholdUsdc,
      idleTimeMs: config.idleTimeMs,
    };

    const activateConfig: ActivateConfig = {
      routerAddress: config.clicksRouterAddress,
    };

    this.balance = new BalanceTracker(balanceConfig);
    this.yields = new YieldFinder(yieldConfig);
    this.idle = new IdleDetector(idleConfig);
    this.clicks = new ClicksActivator(activateConfig);
  }

  // ── Convenience methods ──────────────────────────────────────────

  /** Get USDC balances across all chains */
  async getBalances(address: string) {
    return this.balance.getBalances(address);
  }

  /** Get idle balance info for an address */
  async getIdleBalance(address: string) {
    return this.idle.checkOnce(address);
  }

  /** Compare current DeFi yields on Base */
  async compareYields() {
    return this.yields.compareYields();
  }

  /** Get the best available yield */
  async getBestYield() {
    return this.yields.getBestYield();
  }

  /** Watch an address for idle balances */
  watchIdle(address: string, callback: IdleCallback) {
    this.idle.watch(address, callback);
  }

  /** Stop watching an address */
  unwatchIdle(address: string) {
    this.idle.unwatch(address);
  }

  /** Stop all idle watchers */
  stopAll() {
    this.idle.unwatchAll();
  }

  /**
   * Full treasury report: balances + yields + idle status + Clicks position.
   */
  async report(address: string, provider?: ethers.Provider) {
    const [balances, yields, idleStatus] = await Promise.all([
      this.getBalances(address),
      this.compareYields(),
      this.getIdleBalance(address),
    ]);

    const clicksPosition = provider
      ? await this.clicks.getPosition(provider, address)
      : null;

    return {
      address,
      balances,
      yields,
      idleStatus,
      clicksPosition,
      recommendation: this.getRecommendation(balances.totalFormatted, yields.best?.supplyAPY ?? 0, idleStatus !== null),
      generatedAt: Date.now(),
    };
  }

  private getRecommendation(
    totalUsdc: string,
    bestApy: number,
    isIdle: boolean
  ): string {
    const amount = parseFloat(totalUsdc);
    if (amount === 0) return "No USDC balance detected.";
    if (!isIdle) return `Balance of ${totalUsdc} USDC is active.`;
    if (bestApy === 0) return `${totalUsdc} USDC is idle. Yield data unavailable.`;

    const yearlyEarning = (amount * bestApy) / 100;
    return `${totalUsdc} USDC is idle. Best yield: ${bestApy}% APY (~$${yearlyEarning.toFixed(2)}/year). Consider activating yield.`;
  }
}
