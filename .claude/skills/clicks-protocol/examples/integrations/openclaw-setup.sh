#!/usr/bin/env bash
# OpenClaw MCP setup for Clicks Protocol
# Run this once to register the Clicks MCP server with your OpenClaw agent.

set -euo pipefail

openclaw mcp set clicks-protocol --url https://mcp.clicksprotocol.xyz/mcp

echo "Clicks Protocol MCP server registered."
echo "Your agent can now call: get_protocol_stats, get_agent_info, get_yield_info, simulate_yield"
