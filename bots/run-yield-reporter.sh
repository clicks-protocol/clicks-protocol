#!/bin/bash
# Clicks Protocol Yield Reporter — daily wrapper
# Scheduled via launchd: com.clicks.yield-reporter

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/yield-reporter.log"

mkdir -p "$LOG_DIR"

{
  echo "========================================"
  echo "Run: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "========================================"

  # Load API keys
  if [ -f "$WORKSPACE_DIR/.env" ]; then
    set -a
    source "$WORKSPACE_DIR/.env"
    set +a
  else
    echo "ERROR: .env not found at $WORKSPACE_DIR/.env"
    exit 1
  fi

  # Run the yield reporter
  cd "$WORKSPACE_DIR"
  npx tsx projects/clicks-protocol/bots/yield-reporter.ts

  echo "Done: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo ""
} >> "$LOG_FILE" 2>&1
