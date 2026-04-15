/**
 * Job: Collect MCP usage logs
 *
 * Reads ~/.clicks-protocol/mcp-usage.jsonl, aggregates into hourly rollups,
 * and persists to mcp_usage_rollups table.
 */

import { collectMcpLogs } from '../collectors/mcp-logs';
import { getDb, closeDb } from '../storage/sqlite';

function main(): void {
  const db = getDb();

  try {
    const result = collectMcpLogs(db);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    closeDb();
  }
}

main();
