#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

PROJECT_DIR="/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol"

node "$PROJECT_DIR/x-pipeline/analytics-report.mjs" >/dev/null
