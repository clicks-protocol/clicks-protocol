#!/bin/bash
# Clicks Protocol — npm Publish Script
# Run on Launch Day. Publishes SDK + MCP Server to npm.
# Prerequisites: npm login, packages built, tests passing.

set -e

echo "🚀 Clicks Protocol npm Publish"
echo "================================"

# Check npm auth
echo "Checking npm auth..."
npm whoami || { echo "❌ Not logged in. Run: npm login"; exit 1; }

# Build + publish SDK
echo ""
echo "📦 Publishing @clicks-protocol/sdk..."
cd "$(dirname "$0")/../sdk"
npm run build 2>/dev/null || npx tsc
npm publish --access public
echo "✅ SDK published"

# Build + publish MCP Server
echo ""
echo "📦 Publishing @clicks-protocol/mcp-server..."
cd "$(dirname "$0")/../mcp-server"
npm run build 2>/dev/null || npx tsc
npm publish --access public
echo "✅ MCP Server published"

echo ""
echo "================================"
echo "✅ All packages published!"
echo ""
echo "Verify:"
echo "  npm info @clicks-protocol/sdk"
echo "  npm info @clicks-protocol/mcp-server"
