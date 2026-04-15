/**
 * Job: Generate daily report
 *
 * Writes a Markdown report for the previous day into reports/daily/YYYY-MM-DD.md
 * with chain metrics, MCP usage, and protocol state.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getDb, closeDb } from '../storage/sqlite';
import { getUsageStatsBetween, getLatestProtocolStateSnapshot } from '../storage/queries';
import type { DatabaseLike } from '../storage/sqlite';

function getMcpRollups(db: DatabaseLike, dayStart: string, dayEnd: string): Array<{ tool: string; direction: string; calls: number; errors: number }> {
  const stmt = db.prepare(`
    SELECT tool_name, direction, SUM(call_count) as calls, SUM(error_count) as errors
    FROM mcp_usage_rollups
    WHERE bucket_start >= ? AND bucket_start < ?
    GROUP BY tool_name, direction
    ORDER BY calls DESC
  `);

  const rows = stmt.all(dayStart, dayEnd) as Array<Record<string, unknown>>;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    tool: String(row.tool_name),
    direction: String(row.direction),
    calls: Number(row.calls),
    errors: Number(row.errors),
  }));
}

function generateReport(db: DatabaseLike, day: string): string {
  const dayStart = `${day}T00:00:00.000Z`;
  const dayEnd = `${day}T23:59:59.999Z`;

  const stats = getUsageStatsBetween(db, dayStart, dayEnd);
  const snapshot = getLatestProtocolStateSnapshot(db);
  const mcpUsage = getMcpRollups(db, dayStart, dayEnd);

  const lines: string[] = [];
  lines.push(`# Clicks Protocol Daily Report: ${day}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Chain metrics
  lines.push('## On-Chain Activity');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| New Agents | ${stats.newAgents} |`);
  lines.push(`| Payments | ${stats.paymentEventCount} |`);
  lines.push(`| Payment Volume | ${(Number(stats.paymentVolumeUsdc) / 1e6).toFixed(2)} USDC |`);
  lines.push(`| Yield Withdrawals | ${stats.yieldWithdrawalCount} |`);
  lines.push(`| Fee Collections | ${stats.feeCollectionCount} |`);
  lines.push(`| Fees Collected | ${(Number(stats.feeCollectedUsdc) / 1e6).toFixed(2)} USDC |`);
  lines.push('');

  // Protocol state
  if (snapshot) {
    lines.push('## Protocol State (Latest Snapshot)');
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total Agents | ${snapshot.totalAgents} |`);
    lines.push(`| TVL | ${(Number(snapshot.tvlUsdc) / 1e6).toFixed(2)} USDC |`);
    lines.push(`| Active Protocol | ${snapshot.activeProtocol} |`);
    lines.push(`| Aave APY | ${(snapshot.aaveApyBps / 100).toFixed(2)}% |`);
    lines.push(`| Morpho APY | ${(snapshot.morphoApyBps / 100).toFixed(2)}% |`);
    lines.push(`| Pending Fees | ${(Number(snapshot.pendingFeesUsdc) / 1e6).toFixed(2)} USDC |`);
    lines.push(`| Total Fees Collected | ${(Number(snapshot.totalFeesCollectedUsdc) / 1e6).toFixed(2)} USDC |`);
    lines.push('');
  }

  // MCP usage
  if (mcpUsage.length > 0) {
    lines.push('## MCP Tool Usage');
    lines.push('');
    lines.push(`| Tool | Direction | Calls | Errors |`);
    lines.push(`|------|-----------|-------|--------|`);
    for (const row of mcpUsage) {
      lines.push(`| ${row.tool} | ${row.direction} | ${row.calls} | ${row.errors} |`);
    }
    lines.push('');
  } else {
    lines.push('## MCP Tool Usage');
    lines.push('');
    lines.push('No MCP tool calls recorded for this day.');
    lines.push('');
  }

  return lines.join('\n');
}

function main(): void {
  const db = getDb();

  try {
    // Default to yesterday
    const targetDay = process.argv[2] || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    })();

    const report = generateReport(db, targetDay);

    // Write to reports/daily/
    const reportsDir = path.resolve(process.cwd(), 'reports', 'daily');
    fs.mkdirSync(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `${targetDay}.md`);
    fs.writeFileSync(reportPath, report);

    console.log(JSON.stringify({
      day: targetDay,
      reportPath,
      written: true,
    }, null, 2));
  } finally {
    closeDb();
  }
}

main();
