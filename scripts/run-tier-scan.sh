#!/bin/bash
# Cron entry point for scan-tier-distribution.ts.
# Loads workspace env, runs the scanner, logs to file.
# Called by launchd agent com.clicks.tier-scanner (weekly).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ENV="$PROJECT_DIR/../../.env"
LOG_DIR="$PROJECT_DIR/marketing/reports/tier-distribution"

mkdir -p "$LOG_DIR"

# Load env (BASE_RPC_URL, optional MOLTBOOK_API_KEY)
if [ -f "$WORKSPACE_ENV" ]; then
  set -a
  source "$WORKSPACE_ENV"
  set +a
fi

cd "$PROJECT_DIR"

STAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG="$LOG_DIR/cron-$(date -u +"%Y-%m-%d").log"

echo "=== $STAMP ===" >> "$LOG"
npx tsx scripts/scan-tier-distribution.ts >> "$LOG" 2>&1

# Optional: push the most recent JSON snapshot to Moltbook if the API key is set.
# Replace the placeholder URL with the actual Moltbook ingest endpoint once known.
LATEST_JSON=$(ls -t "$LOG_DIR"/scan-*.json 2>/dev/null | head -n 1)
if [ -n "${MOLTBOOK_API_KEY:-}" ] && [ -n "${MOLTBOOK_INGEST_URL:-}" ] && [ -n "$LATEST_JSON" ]; then
  echo "Pushing $LATEST_JSON to $MOLTBOOK_INGEST_URL" >> "$LOG"
  curl -sS -X POST "$MOLTBOOK_INGEST_URL" \
    -H "Authorization: Bearer $MOLTBOOK_API_KEY" \
    -H "Content-Type: application/json" \
    --data @"$LATEST_JSON" >> "$LOG" 2>&1 || echo "Moltbook push failed (non-fatal)" >> "$LOG"
fi

echo "done" >> "$LOG"
