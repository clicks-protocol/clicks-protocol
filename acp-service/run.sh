#!/bin/bash
# Clicks ACP Service Starter
# Loads env vars from workspace .env and starts the service

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_ENV="$SCRIPT_DIR/../../../.env"

if [ ! -f "$WORKSPACE_ENV" ]; then
  echo "ERROR: .env not found at $WORKSPACE_ENV"
  exit 1
fi

# Load env vars
set -a
source "$WORKSPACE_ENV"
set +a

# Start service
cd "$SCRIPT_DIR"
npx tsx service.ts
