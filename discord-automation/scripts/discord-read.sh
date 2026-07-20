#!/bin/bash
# Discord Browser Automation - Read Channel
# Usage: ./discord-read.sh <channel-url>
# Example: ./discord-read.sh "https://discord.com/channels/123456/789012"
#
# This script is a wrapper that triggers the OpenClaw browser tool
# to navigate to a Discord channel and snapshot the messages.
#
# Prerequisites:
# - OpenClaw browser running with 'openclaw' profile
# - Discord account logged in within that profile
#
# The actual automation happens through the OpenClaw browser tool,
# not through this script directly. This is documentation/reference.

CHANNEL_URL="${1:?Usage: discord-read.sh <channel-url>}"

echo "Discord Read Automation"
echo "======================"
echo "Target: $CHANNEL_URL"
echo ""
echo "Steps:"
echo "1. browser action=open url=$CHANNEL_URL label=discord-read"
echo "2. browser action=snapshot targetId=discord-read refs=aria"
echo "3. Parse message list from snapshot"
echo "4. browser action=close targetId=discord-read"
echo ""
echo "Run these steps via OpenClaw browser tool."
