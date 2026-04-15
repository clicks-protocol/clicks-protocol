/**
 * Public Metrics API
 *
 * Builds a safe, public-facing metrics response from the observability DB.
 * No internal addresses, no raw event data — only aggregate KPIs.
 *
 * Consumed by:
 *   - Proof widget (embedded badge)
 *   - AI agents via /api/public/proof.txt
 *   - Third-party integrations
 */

import type { DatabaseLike } from '../storage/sqlite';

export interface PublicMetrics {
  totalAgents: number;
  tvlUsdc: number;
  totalPaymentsUsdc: number;
  totalPaymentCount: number;
  activeProtocol: string;
  currentApyPct: number;
  totalFeesCollectedUsdc: number;
  lastUpdatedAt: string | null;
  chainId: number;
  chain: string;
}

export function getPublicMetrics(db: DatabaseLike): PublicMetrics {
  const agents = db.prepare(
    'SELECT COUNT(*) as c FROM agent_registrations',
  ).get() as Record<string, unknown>;

  const payments = db.prepare(
    'SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_total_usdc AS INTEGER)),0) as vol FROM payment_events',
  ).get() as Record<string, unknown>;

  const snap = db.prepare(
    'SELECT * FROM protocol_state_snapshots ORDER BY id DESC LIMIT 1',
  ).get() as Record<string, unknown> | undefined;

  const activeProtocol = snap ? String(snap.active_protocol) : 'none';
  const aaveApyBps = snap ? Number(snap.aave_apy_bps) : 0;
  const morphoApyBps = snap ? Number(snap.morpho_apy_bps) : 0;
  const currentApyPct = activeProtocol === 'morpho'
    ? morphoApyBps / 100
    : activeProtocol === 'aave'
      ? aaveApyBps / 100
      : Math.max(aaveApyBps, morphoApyBps) / 100;

  return {
    totalAgents: Number(agents?.c ?? 0),
    tvlUsdc: snap ? Number(snap.tvl_usdc) / 1e6 : 0,
    totalPaymentsUsdc: Number(payments?.vol ?? 0) / 1e6,
    totalPaymentCount: Number(payments?.c ?? 0),
    activeProtocol,
    currentApyPct,
    totalFeesCollectedUsdc: snap ? Number(snap.total_fees_collected_usdc) / 1e6 : 0,
    lastUpdatedAt: snap ? String(snap.captured_at) : null,
    chainId: 8453,
    chain: 'Base',
  };
}

/**
 * Format public metrics as plain-text proof for AI agent consumption.
 */
export function formatProofText(m: PublicMetrics): string {
  return [
    'clicks-protocol proof-of-yield',
    `chain: ${m.chain} (${m.chainId})`,
    `total-agents: ${m.totalAgents}`,
    `tvl-usdc: ${m.tvlUsdc}`,
    `total-payments-usdc: ${m.totalPaymentsUsdc}`,
    `total-payment-count: ${m.totalPaymentCount}`,
    `active-protocol: ${m.activeProtocol}`,
    `current-apy-pct: ${m.currentApyPct}`,
    `total-fees-collected-usdc: ${m.totalFeesCollectedUsdc}`,
    `last-updated: ${m.lastUpdatedAt ?? 'never'}`,
    '',
    'registry: 0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
    'splitter: 0xB7E0016d543bD443ED2A6f23d5008400255bf3C8',
    'yield-router: 0x053167a233d18E05Bc65a8d5F3F8808782a3EECD',
    'fee-collector: 0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5',
    '',
    'verify: https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8',
    'sdk: npm install @clicks-protocol/sdk',
    'docs: https://clicksprotocol.xyz/llms.txt',
  ].join('\n');
}
