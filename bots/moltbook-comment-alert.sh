#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol"
OPENCLAW="/opt/homebrew/bin/openclaw"
TELEGRAM_CHAT="-1003840791947"
TELEGRAM_TOPIC="49"

cd "$PROJECT_DIR"

OUTPUT="$(python3 bots/moltbook-monitor.py --quiet || true)"

if [[ -z "$OUTPUT" ]]; then
  exit 0
fi

"$OPENCLAW" message send \
  --channel telegram \
  --target "$TELEGRAM_CHAT" \
  --thread-id "$TELEGRAM_TOPIC" \
  --message "Moltbook Kommentare:
$OUTPUT" \
  --json >/dev/null
