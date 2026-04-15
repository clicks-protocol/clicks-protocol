#!/bin/bash

echo "Reddit Scan for Clicks Protocol - $(date)"
echo "=========================================="
echo ""

SUBREDDITS=("ethereum" "defi" "cryptocurrency")
KEYWORDS=("AI agent yield" "MCP DeFi" "agent payment protocol" "x402" "AI agent USDC")

REPORT_FILE="scan-$(date +%Y-%m-%d).md"
DIRECT_COUNT=0
RELEVANT_COUNT=0

echo "# Reddit Scan Report - $(date +%Y-%m-%d)" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Scan Time:** $(date)" >> "$REPORT_FILE"
echo "**Subreddits:** r/ethereum, r/defi, r/cryptocurrency" >> "$REPORT_FILE"
echo "**Keywords:** ${KEYWORDS[*]}" >> "$REPORT_FILE"
echo "**Filters:** Score >= 3 OR Comments >= 5, Last 48h" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for subreddit in "${SUBREDDITS[@]}"; do
    echo "Checking r/$subreddit..."
    
    # Get new posts
    response=$(curl -s -H "User-Agent: Mozilla/5.0" "https://www.reddit.com/r/$subreddit/new.json?limit=100")
    
    # Parse with jq if available, otherwise use grep
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.data.children[] | select(.data.score >= 3 or .data.num_comments >= 5) | "\(.data.title)\t\(.data.score)\t\(.data.num_comments)\t\(.data.permalink)"' | while IFS=$'\t' read -r title score comments permalink; do
            title_lower=$(echo "$title" | tr '[:upper:]' '[:lower:]')
            
            # Check for direct mentions
            if [[ "$title_lower" == *"x402"* ]] || [[ "$title_lower" == *"mcp defi"* ]] || [[ "$title_lower" == *"agent payment"* ]] || [[ "$title_lower" == *"yield for agents"* ]]; then
                echo "DIRECT MATCH: $title"
                echo "  Score: $score, Comments: $comments"
                echo "  URL: https://reddit.com$permalink"
                echo ""
                
                echo "## Direct Match Found" >> "$REPORT_FILE"
                echo "**Title:** $title" >> "$REPORT_FILE"
                echo "**Subreddit:** r/$subreddit" >> "$REPORT_FILE"
                echo "**Score:** $score | **Comments:** $comments" >> "$REPORT_FILE"
                echo "**URL:** https://reddit.com$permalink" >> "$REPORT_FILE"
                echo "**Assessment:** Direct mention of relevant concept - perfect for engagement" >> "$REPORT_FILE"
                echo "**Suggested Action:** Comment introducing Clicks Protocol as solution" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
                
                DIRECT_COUNT=$((DIRECT_COUNT + 1))
            elif [[ "$title_lower" == *"ai agent"* ]] || [[ "$title_lower" == *"autonomous agent"* ]] || [[ "$title_lower" == *"agent economy"* ]]; then
                echo "RELEVANT: $title"
                echo "  Score: $score, Comments: $comments"
                echo "  URL: https://reddit.com$permalink"
                echo ""
                
                if [ $RELEVANT_COUNT -lt 5 ]; then
                    echo "## Relevant Discussion ($((RELEVANT_COUNT + 1)))" >> "$REPORT_FILE"
                    echo "**Title:** $title" >> "$REPORT_FILE"
                    echo "**Subreddit:** r/$subreddit" >> "$REPORT_FILE"
                    echo "**Score:** $score | **Comments:** $comments" >> "$REPORT_FILE"
                    echo "**URL:** https://reddit.com$permalink" >> "$REPORT_FILE"
                    echo "**Assessment:** AI agents + crypto discussion - could mention agent payment protocols" >> "$REPORT_FILE"
                    echo "**Suggested Action:** Mention x402 or MCP DeFi integration for agent payments" >> "$REPORT_FILE"
                    echo "" >> "$REPORT_FILE"
                fi
                
                RELEVANT_COUNT=$((RELEVANT_COUNT + 1))
            fi
        done
    else
        # Simple grep approach
        echo "Note: jq not available, using simple text matching"
        echo "$response" | grep -o '"title":"[^"]*"' | head -20 | while read -r line; do
            title=$(echo "$line" | sed 's/"title":"//' | sed 's/"//')
            title_lower=$(echo "$title" | tr '[:upper:]' '[:lower:]')
            
            if [[ "$title_lower" == *"ai agent"* ]] || [[ "$title_lower" == *"x402"* ]] || [[ "$title_lower" == *"mcp"* ]]; then
                echo "POTENTIAL MATCH: $title"
            fi
        done
    fi
    
    sleep 1
done

echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "- **Total direct matches:** $DIRECT_COUNT" >> "$REPORT_FILE"
echo "- **Total relevant discussions:** $RELEVANT_COUNT" >> "$REPORT_FILE"

if [ $DIRECT_COUNT -eq 0 ] && [ $RELEVANT_COUNT -eq 0 ]; then
    echo "## NO_REPLY" >> "$REPORT_FILE"
    echo "No relevant posts found in the last 48 hours." >> "$REPORT_FILE"
fi

echo ""
echo "=========================================="
echo "Scan complete!"
echo "Direct matches: $DIRECT_COUNT"
echo "Relevant discussions: $RELEVANT_COUNT"
echo "Report saved to: $REPORT_FILE"

if [ $DIRECT_COUNT -gt 0 ]; then
    echo ""
    echo "ACTION REQUIRED: Direct matches found! Check report for engagement opportunities."
elif [ $RELEVANT_COUNT -gt 0 ]; then
    echo ""
    echo "Relevant discussions found. Top 5 saved to report."
else
    echo ""
    echo "NO_REPLY: No relevant posts found."
fi