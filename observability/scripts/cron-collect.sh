#!/bin/bash
# Clicks Protocol Observability — Cron Collection Script
# Runs backfill, state snapshot, MCP log collection, and usage monitor sequentially.
# Designed for crontab: */15 * * * * /path/to/cron-collect.sh
#
# Sequential execution prevents RPC rate-limit issues.
# Each step waits for the previous one to complete before starting.

set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OBS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$OBS_DIR/logs"
LOG_FILE="$LOG_DIR/cron-$(date +%Y-%m-%d).log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Lock file to prevent overlapping runs
LOCK_FILE="$OBS_DIR/logs/.cron-collect.lock"
if [ -f "$LOCK_FILE" ]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "[$(date -Iseconds)] SKIP — previous run (PID $LOCK_PID) still running" >> "$LOG_FILE"
    exit 0
  fi
  # Stale lock, remove it
  rm -f "$LOCK_FILE"
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$OBS_DIR"

# Load .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

log() {
  echo "[$(date -Iseconds)] $1" >> "$LOG_FILE"
}

log "START cron-collect"

# 1. Backfill chain events (incremental, from last sync point)
log "  backfill-chain..."
if node dist/jobs/backfill-chain.js >> "$LOG_FILE" 2>&1; then
  log "  backfill-chain OK"
else
  log "  backfill-chain FAILED (exit $?)"
fi

# 2 second pause between RPC-heavy jobs
sleep 2

# 2. Collect current protocol state snapshot
log "  collect-state..."
if node dist/jobs/collect-state.js >> "$LOG_FILE" 2>&1; then
  log "  collect-state OK"
else
  log "  collect-state FAILED (exit $?)"
fi

# 3. Collect MCP usage logs (if any)
log "  collect-mcp-logs..."
if node dist/jobs/collect-mcp-logs.js >> "$LOG_FILE" 2>&1; then
  log "  collect-mcp-logs OK"
else
  log "  collect-mcp-logs FAILED (exit $?)"
fi

# 4. Usage monitor (aggregates + daily metrics)
log "  usage-monitor..."
if node dist/jobs/usage-monitor.js >> "$LOG_FILE" 2>&1; then
  log "  usage-monitor OK"
else
  log "  usage-monitor FAILED (exit $?)"
fi

log "END cron-collect"
