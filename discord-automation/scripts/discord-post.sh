#!/bin/bash
# Discord Browser Automation - Post Message
# Usage: ./discord-post.sh <channel-url> "<message>"
#
# Flow:
# 1. Open channel URL in browser
# 2. Snapshot to find message input
# 3. Click message input field
# 4. Type message
# 5. Press Enter to send
# 6. Verify message appeared
# 7. Close tab
#
# Safety:
# - Always snapshot before acting
# - Check for captcha/2FA/login screens
# - Verify message was sent successfully
# - Max 2-3 posts per server per day

CHANNEL_URL="${1:?Usage: discord-post.sh <channel-url> <message>}"
MESSAGE="${2:?Usage: discord-post.sh <channel-url> <message>}"

echo "Discord Post Automation"
echo "======================="
echo "Target: $CHANNEL_URL"
echo "Message: $MESSAGE"
echo ""
echo "Steps:"
echo "1. browser action=open url=$CHANNEL_URL label=discord-post"
echo "2. browser action=snapshot targetId=discord-post refs=aria"
echo "3. Find message input (textbox role or [data-slate-editor])"
echo "4. browser action=act targetId=discord-post ref=<input-ref> action=click"
echo "5. browser action=act targetId=discord-post action=type text=<message>"
echo "6. browser action=act targetId=discord-post action=press key=Enter"
echo "7. browser action=snapshot targetId=discord-post (verify)"
echo "8. browser action=close targetId=discord-post"
