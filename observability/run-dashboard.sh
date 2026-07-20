#!/bin/bash
# Clicks public metrics / Treasury Lab dashboard starter

set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

exec node dist/api/internal-dashboard.js
