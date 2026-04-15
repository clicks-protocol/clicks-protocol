import { createHash } from 'node:crypto';

import { formatUsageAlert } from '../alerts/telegram-formatter';
import { getDb, closeDb } from '../storage/sqlite';
import {
  getLatestProtocolStateSnapshot,
  getLatestProtocolStateSnapshotBefore,
  getUsageStatsBetween,
  hasAlertBeenRecorded,
  insertAlertRecord,
  upsertDailyMetrics,
} from '../storage/queries';
import type { DailyMetricsRow, UsageAlertSummary } from '../shared/types';

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  return direct ? direct.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function toUtcDay(isoTime: string): string {
  return isoTime.slice(0, 10);
}

function startOfUtcDay(isoTime: string): string {
  return `${toUtcDay(isoTime)}T00:00:00.000Z`;
}

function subtractHours(isoTime: string, hours: number): string {
  return new Date(new Date(isoTime).getTime() - hours * 60 * 60 * 1000).toISOString();
}

function subtractStrings(left: string, right: string): string {
  return (BigInt(left) - BigInt(right)).toString();
}

function buildAlertKey(summary: Omit<UsageAlertSummary, 'alertKey'>): string {
  const stablePayload = {
    alertType: 'usage-monitor',
    windowStart: summary.windowStart,
    windowEnd: summary.windowEnd,
    currentTvlUsdc: summary.currentTvlUsdc,
    previousTvlUsdc: summary.previousTvlUsdc,
    tvlDeltaUsdc: summary.tvlDeltaUsdc,
    pendingFeesUsdc: summary.pendingFeesUsdc,
    totalFeesCollectedUsdc: summary.totalFeesCollectedUsdc,
    newAgents: summary.newAgents,
    paymentEventCount: summary.paymentEventCount,
    paymentVolumeUsdc: summary.paymentVolumeUsdc,
    yieldWithdrawalCount: summary.yieldWithdrawalCount,
    yieldWithdrawnPrincipalUsdc: summary.yieldWithdrawnPrincipalUsdc,
    yieldWithdrawnYieldUsdc: summary.yieldWithdrawnYieldUsdc,
    feeCollectionCount: summary.feeCollectionCount,
    feeCollectedUsdc: summary.feeCollectedUsdc,
  };
  const hash = createHash('sha256')
    .update(JSON.stringify(stablePayload))
    .digest('hex')
    .slice(0, 16);

  return `usage-monitor:${summary.windowStart}:${summary.windowEnd}:${hash}`;
}

async function main(): Promise<void> {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const sinceHours = Number.parseInt(getArg('since-hours') ?? '24', 10);
  const recordAlert = hasFlag('record-alert');
  const latestSnapshot = getLatestProtocolStateSnapshot(db);

  if (!latestSnapshot) {
    throw new Error('No protocol_state_snapshots found. Run collect-state first.');
  }

  const windowEnd = latestSnapshot.capturedAt;
  const windowStart = subtractHours(windowEnd, sinceHours);
  const previousSnapshot = getLatestProtocolStateSnapshotBefore(db, windowStart);
  const usage = getUsageStatsBetween(db, windowStart, windowEnd);

  const provisionalSummary = {
    windowStart,
    windowEnd,
    generatedAt: nowIso,
    currentTvlUsdc: latestSnapshot.tvlUsdc,
    previousTvlUsdc: previousSnapshot?.tvlUsdc ?? null,
    tvlDeltaUsdc: previousSnapshot ? subtractStrings(latestSnapshot.tvlUsdc, previousSnapshot.tvlUsdc) : null,
    pendingFeesUsdc: latestSnapshot.pendingFeesUsdc,
    totalFeesCollectedUsdc: latestSnapshot.totalFeesCollectedUsdc,
    newAgents: usage.newAgents,
    paymentEventCount: usage.paymentEventCount,
    paymentVolumeUsdc: usage.paymentVolumeUsdc,
    yieldWithdrawalCount: usage.yieldWithdrawalCount,
    yieldWithdrawnPrincipalUsdc: usage.yieldWithdrawnPrincipalUsdc,
    yieldWithdrawnYieldUsdc: usage.yieldWithdrawnYieldUsdc,
    feeCollectionCount: usage.feeCollectionCount,
    feeCollectedUsdc: usage.feeCollectedUsdc,
    hasActivity:
      usage.newAgents > 0 ||
      usage.paymentEventCount > 0 ||
      usage.yieldWithdrawalCount > 0 ||
      usage.feeCollectionCount > 0,
  } satisfies Omit<UsageAlertSummary, 'alertKey'>;

  const summary: UsageAlertSummary = {
    alertKey: buildAlertKey(provisionalSummary),
    ...provisionalSummary,
  };

  const formatted = formatUsageAlert(summary);
  const dayStart = startOfUtcDay(windowEnd);
  const dayOpenSnapshot = getLatestProtocolStateSnapshotBefore(db, dayStart);
  const dayUsage = getUsageStatsBetween(db, dayStart, windowEnd);

  const dailyMetrics: DailyMetricsRow = {
    day: toUtcDay(windowEnd),
    newAgents: dayUsage.newAgents,
    paymentsReceivedCount: dayUsage.paymentEventCount,
    paymentsReceivedUsdc: dayUsage.paymentVolumeUsdc,
    yieldWithdrawnCount: dayUsage.yieldWithdrawalCount,
    yieldWithdrawnPrincipalUsdc: dayUsage.yieldWithdrawnPrincipalUsdc,
    yieldWithdrawnYieldUsdc: dayUsage.yieldWithdrawnYieldUsdc,
    feesCollectedUsdc: dayUsage.feeCollectedUsdc,
    pendingFeesCloseUsdc: latestSnapshot.pendingFeesUsdc,
    tvlOpenUsdc: dayOpenSnapshot?.tvlUsdc ?? latestSnapshot.tvlUsdc,
    tvlCloseUsdc: latestSnapshot.tvlUsdc,
    createdAt: nowIso,
  };

  upsertDailyMetrics(db, dailyMetrics);

  if (recordAlert && !hasAlertBeenRecorded(db, summary.alertKey)) {
    insertAlertRecord(db, summary, formatted.text);
  }

  console.log(
    JSON.stringify(
      {
        summary,
        formatted,
        dailyMetrics,
        recorded: recordAlert ? hasAlertBeenRecorded(db, summary.alertKey) : false,
      },
      null,
      2,
    ),
  );

  closeDb();
}

void main().catch((error) => {
  console.error(error);
  closeDb();
  process.exitCode = 1;
});
