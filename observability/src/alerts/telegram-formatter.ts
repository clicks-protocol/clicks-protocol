import type { FormattedAlert, UsageAlertSummary } from '../shared/types';

function formatUsdcMicros(value: string | null): string {
  if (value === null) {
    return 'n/a';
  }

  const negative = value.startsWith('-');
  const raw = negative ? value.slice(1) : value;
  const padded = raw.padStart(7, '0');
  const whole = padded.slice(0, -6).replace(/^0+(?=\d)/, '') || '0';
  const decimals = padded.slice(-6).replace(/0+$/, '');
  const formatted = decimals.length > 0 ? `${whole}.${decimals}` : whole;

  return `${negative ? '-' : ''}${formatted} USDC`;
}

export function formatUsageAlert(summary: UsageAlertSummary): FormattedAlert {
  const lines = [
    '📊 Clicks Usage Monitor',
    `Window: ${summary.windowStart} -> ${summary.windowEnd}`,
    `New agents: ${summary.newAgents}`,
    `TVL: ${formatUsdcMicros(summary.currentTvlUsdc)}`,
    `TVL delta: ${formatUsdcMicros(summary.tvlDeltaUsdc)}`,
    `Payments: ${summary.paymentEventCount} (${formatUsdcMicros(summary.paymentVolumeUsdc)})`,
    `Yield withdrawals: ${summary.yieldWithdrawalCount} (principal ${formatUsdcMicros(summary.yieldWithdrawnPrincipalUsdc)}, yield ${formatUsdcMicros(summary.yieldWithdrawnYieldUsdc)})`,
    `Fees collected: ${summary.feeCollectionCount} (${formatUsdcMicros(summary.feeCollectedUsdc)})`,
    `Pending fees: ${formatUsdcMicros(summary.pendingFeesUsdc)}`,
  ];

  if (!summary.hasActivity) {
    lines.push('No new on-chain activity detected in the window.');
  }

  return {
    title: 'Clicks Usage Monitor',
    text: lines.join('\n'),
  };
}
