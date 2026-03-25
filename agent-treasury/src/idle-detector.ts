import { BalanceTracker, BalanceSnapshot, BalanceTrackerConfig, ChainName } from "./balance";

export interface IdleBalanceAlert {
  address: string;
  totalIdle: bigint;
  totalIdleFormatted: string;
  idleSince: number;
  idleDurationMs: number;
  idleDurationHuman: string;
  chains: ChainName[];
}

export type IdleCallback = (alert: IdleBalanceAlert) => void | Promise<void>;

export interface IdleDetectorConfig extends BalanceTrackerConfig {
  /** Minimum balance in USDC (raw 6-decimal) to consider "idle" (default: 100 USDC) */
  thresholdUsdc?: number;
  /** How long balance must be idle before alerting, in ms (default: 1 hour) */
  idleTimeMs?: number;
  /** Polling interval in ms (default: 5 minutes) */
  pollIntervalMs?: number;
}

interface TrackedAddress {
  address: string;
  lastChangeAt: number;
  lastBalance: bigint;
  callback: IdleCallback;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/**
 * Detects idle USDC balances and triggers alerts.
 * Works standalone, no Clicks Protocol dependency.
 */
export class IdleDetector {
  private tracker: BalanceTracker;
  private thresholdRaw: bigint;
  private idleTimeMs: number;
  private pollIntervalMs: number;
  private watched: Map<string, TrackedAddress> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor(config: IdleDetectorConfig = {}) {
    this.tracker = new BalanceTracker(config);
    // Convert USDC threshold to 6-decimal raw
    const thresholdUsdc = config.thresholdUsdc ?? 100;
    this.thresholdRaw = BigInt(Math.floor(thresholdUsdc * 1e6));
    this.idleTimeMs = config.idleTimeMs ?? 60 * 60 * 1000; // 1 hour
    this.pollIntervalMs = config.pollIntervalMs ?? 5 * 60 * 1000; // 5 min
  }

  /** Start watching an address for idle balances */
  watch(address: string, callback: IdleCallback): void {
    if (this.watched.has(address)) {
      this.unwatch(address);
    }

    const tracked: TrackedAddress = {
      address,
      lastChangeAt: Date.now(),
      lastBalance: 0n,
      callback,
    };

    this.watched.set(address, tracked);

    // Initial check + start polling
    this.checkAddress(tracked);
    const timer = setInterval(() => this.checkAddress(tracked), this.pollIntervalMs);
    this.timers.set(address, timer);
  }

  /** Stop watching an address */
  unwatch(address: string): void {
    this.watched.delete(address);
    const timer = this.timers.get(address);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(address);
    }
  }

  /** Stop watching all addresses */
  unwatchAll(): void {
    for (const address of this.watched.keys()) {
      this.unwatch(address);
    }
  }

  /** Check an address once (can be called manually) */
  async checkOnce(address: string): Promise<IdleBalanceAlert | null> {
    const snapshot = await this.tracker.getBalances(address);
    return this.evaluateSnapshot(address, snapshot);
  }

  /** Get the underlying balance tracker */
  getTracker(): BalanceTracker {
    return this.tracker;
  }

  private async checkAddress(tracked: TrackedAddress): Promise<void> {
    try {
      const snapshot = await this.tracker.getBalances(tracked.address);

      // Check if balance changed
      if (snapshot.total !== tracked.lastBalance) {
        tracked.lastBalance = snapshot.total;
        tracked.lastChangeAt = Date.now();
        return; // Balance changed, reset idle timer
      }

      // Balance unchanged, check if idle long enough
      const idleDuration = Date.now() - tracked.lastChangeAt;
      if (snapshot.total >= this.thresholdRaw && idleDuration >= this.idleTimeMs) {
        const alert: IdleBalanceAlert = {
          address: tracked.address,
          totalIdle: snapshot.total,
          totalIdleFormatted: snapshot.totalFormatted,
          idleSince: tracked.lastChangeAt,
          idleDurationMs: idleDuration,
          idleDurationHuman: formatDuration(idleDuration),
          chains: snapshot.balances
            .filter((b) => b.balance > 0n)
            .map((b) => b.chain),
        };

        await tracked.callback(alert);
      }
    } catch {
      // Silently skip failed checks — network issues are transient
    }
  }

  private evaluateSnapshot(
    address: string,
    snapshot: BalanceSnapshot
  ): IdleBalanceAlert | null {
    const tracked = this.watched.get(address);
    const lastChangeAt = tracked?.lastChangeAt ?? Date.now();
    const idleDuration = Date.now() - lastChangeAt;

    if (snapshot.total >= this.thresholdRaw) {
      return {
        address,
        totalIdle: snapshot.total,
        totalIdleFormatted: snapshot.totalFormatted,
        idleSince: lastChangeAt,
        idleDurationMs: idleDuration,
        idleDurationHuman: formatDuration(idleDuration),
        chains: snapshot.balances
          .filter((b) => b.balance > 0n)
          .map((b) => b.chain),
      };
    }

    return null;
  }
}
