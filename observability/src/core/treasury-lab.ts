/**
 * Treasury Lab: Simulator Logic
 *
 * Linear projection of yield earnings based on current on-chain APY.
 * No compounding. Reads live APY from the latest protocol state snapshot.
 */

import type { DatabaseLike } from '../storage/sqlite';

export interface TreasurySimulation {
  input: {
    amount: number;
    periodDays: number;
    yieldPct: number;
  };
  split: {
    liquid: number;
    toYield: number;
  };
  projection: {
    dailyYield: number;
    monthlyYield: number;
    yearlyYield: number;
    totalYield: number;
    protocolFee: number;
    netYield: number;
    totalReturn: number;
    effectiveApyPct: number;
  };
  protocol: {
    activeProtocol: string;
    currentApyPct: number;
  };
  disclaimer: string;
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

export function simulateTreasury(
  db: DatabaseLike,
  input: { amount: number; periodDays: number; yieldPct: number },
): TreasurySimulation {
  const snap = db.prepare(
    'SELECT active_protocol, aave_apy_bps, morpho_apy_bps FROM protocol_state_snapshots ORDER BY id DESC LIMIT 1',
  ).get() as Record<string, unknown> | undefined;

  let activeProtocol = 'none';
  let currentApyPct = 0;

  if (snap) {
    activeProtocol = String(snap.active_protocol);
    const aaveBps = Number(snap.aave_apy_bps);
    const morphoBps = Number(snap.morpho_apy_bps);

    if (activeProtocol === 'morpho') {
      currentApyPct = morphoBps / 100;
    } else if (activeProtocol === 'aave') {
      currentApyPct = aaveBps / 100;
    } else {
      currentApyPct = Math.max(aaveBps, morphoBps) / 100;
    }
  }

  const { amount, periodDays, yieldPct } = input;

  const toYield = round6(amount * (yieldPct / 100));
  const liquid = round6(amount - toYield);
  const dailyYield = round6(toYield * (currentApyPct / 100 / 365));
  const totalYield = round6(dailyYield * periodDays);
  const protocolFee = round6(totalYield * 0.02);
  const netYield = round6(totalYield - protocolFee);
  const totalReturn = round6(liquid + toYield + netYield);
  const effectiveApyPct = amount > 0 && periodDays > 0
    ? round6((netYield / amount) * (365 / periodDays) * 100)
    : 0;
  const monthlyYield = round6(dailyYield * 30);
  const yearlyYield = round6(dailyYield * 365);

  return {
    input: { amount, periodDays, yieldPct },
    split: { liquid, toYield },
    projection: {
      dailyYield,
      monthlyYield,
      yearlyYield,
      totalYield,
      protocolFee,
      netYield,
      totalReturn,
      effectiveApyPct,
    },
    protocol: { activeProtocol, currentApyPct },
    disclaimer: 'Projection based on current APY. Rates fluctuate. Not financial advice.',
  };
}
