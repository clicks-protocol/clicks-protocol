/**
 * MCP Usage Log Collector
 *
 * Reads the MCP Server's JSON Lines log file (~/.clicks-protocol/mcp-usage.jsonl)
 * and aggregates tool calls into hourly rollups in the mcp_usage_rollups table.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { DatabaseLike } from '../storage/sqlite';

interface McpLogEntry {
  ts: string;
  tool: string;
  direction: 'read' | 'write';
  success: boolean;
  durationMs: number;
  error?: string;
}

const DEFAULT_LOG_PATH = path.resolve(
  process.env.HOME || '.',
  '.clicks-protocol',
  'mcp-usage.jsonl',
);

/**
 * Parse JSONL log file and return valid entries.
 */
function readLogEntries(logPath: string): McpLogEntry[] {
  if (!fs.existsSync(logPath)) {
    return [];
  }

  const raw = fs.readFileSync(logPath, 'utf8');
  const entries: McpLogEntry[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as McpLogEntry;
      if (entry.ts && entry.tool && entry.direction) {
        entries.push(entry);
      }
    } catch {
      // Skip malformed lines
    }
  }

  return entries;
}

/**
 * Truncate ISO timestamp to hour bucket: "2026-03-27T14:00:00.000Z"
 */
function toBucketStart(isoTs: string): string {
  const d = new Date(isoTs);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

interface RollupKey {
  bucketStart: string;
  surface: string;
  toolName: string;
  direction: string;
}

interface RollupValue {
  callCount: number;
  errorCount: number;
}

/**
 * Collect MCP usage logs into hourly rollups and persist to DB.
 * Returns number of new rollup rows upserted.
 */
export function collectMcpLogs(
  db: DatabaseLike,
  options?: { logPath?: string },
): { processedEntries: number; rollupsUpserted: number } {
  const logPath = options?.logPath
    || process.env.CLICKS_MCP_LOG_PATH
    || DEFAULT_LOG_PATH;

  const entries = readLogEntries(logPath);
  if (entries.length === 0) {
    return { processedEntries: 0, rollupsUpserted: 0 };
  }

  // Aggregate into buckets
  const rollups = new Map<string, RollupValue>();

  for (const entry of entries) {
    const key: RollupKey = {
      bucketStart: toBucketStart(entry.ts),
      surface: 'mcp-server',
      toolName: entry.tool,
      direction: entry.direction,
    };
    const mapKey = JSON.stringify(key);
    const existing = rollups.get(mapKey) || { callCount: 0, errorCount: 0 };
    existing.callCount++;
    if (!entry.success) {
      existing.errorCount++;
    }
    rollups.set(mapKey, existing);
  }

  // Upsert into DB
  const stmt = db.prepare(`
    INSERT INTO mcp_usage_rollups (
      bucket_start, surface, tool_name, direction, call_count, error_count
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(bucket_start, surface, tool_name, direction) DO UPDATE SET
      call_count = call_count + excluded.call_count,
      error_count = error_count + excluded.error_count
  `);

  let upsertCount = 0;
  for (const [mapKey, value] of rollups) {
    const key = JSON.parse(mapKey) as RollupKey;
    stmt.run(
      key.bucketStart,
      key.surface,
      key.toolName,
      key.direction,
      value.callCount,
      value.errorCount,
    );
    upsertCount++;
  }

  // Rotate log file after successful collection
  try {
    fs.writeFileSync(logPath, '');
  } catch {
    // Non-fatal: next run will re-process
  }

  return { processedEntries: entries.length, rollupsUpserted: upsertCount };
}
