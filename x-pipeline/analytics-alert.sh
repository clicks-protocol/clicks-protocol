#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

PROJECT_DIR="/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol"
REPORTER="$PROJECT_DIR/x-pipeline/analytics-report.mjs"
OPENCLAW="/opt/homebrew/bin/openclaw"
TELEGRAM_CHAT="-1003840791947"
TELEGRAM_TOPIC="49"

REPORT="$(node "$REPORTER")"

SUMMARY="$(printf '%s\n' "$REPORT" | sed -n '/^## Wachstum$/,/^## Inhalte/p' | sed '$d' | sed '/^$/d')"

"$OPENCLAW" message send \
  --channel telegram \
  --target "$TELEGRAM_CHAT" \
  --thread-id "$TELEGRAM_TOPIC" \
  --message "X Analytics @ClicksProtocol
$SUMMARY" \
  --json >/dev/null
