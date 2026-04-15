#!/bin/bash

# Function to search Reddit
search_subreddit() {
    local subreddit="$1"
    local query="$2"
    
    echo "Searching r/${subreddit} for: ${query}"
    
    # URL encode the query
    encoded_query=$(echo "$query" | sed 's/ /+/g')
    
    # Make request with proper User-Agent
    curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        "https://www.reddit.com/r/${subreddit}/search.json?q=${encoded_query}&sort=new&t=day&limit=20" \
        | python3 -c "
import sys, json, time
from datetime import datetime, timedelta

try:
    data = json.load(sys.stdin)
    if 'data' in data and 'children' in data['data']:
        cutoff = time.time() - (48 * 3600)  # 48 hours ago
        
        for post in data['data']['children']:
            p = post['data']
            created = p.get('created_utc', 0)
            score = p.get('score', 0)
            comments = p.get('num_comments', 0)
            
            if created >= cutoff and (score >= 3 or comments >= 5):
                print(f\"{p.get('subreddit')} | {p.get('title')} | Score: {score} | Comments: {comments} | https://reddit.com{p.get('permalink')}\")
except Exception as e:
    pass
"
    
    sleep 1  # Rate limiting
}

# Main search
echo "Starting Reddit search for Clicks Protocol relevant discussions..."
echo "=" * 80

subreddits=("ethereum" "defi" "cryptocurrency")
keywords=("AI agent yield" "MCP DeFi" "agent payment protocol" "x402" "AI agent USDC")

all_results=""

for sub in "${subreddits[@]}"; do
    for kw in "${keywords[@]}"; do
        results=$(search_subreddit "$sub" "$kw")
        if [ -n "$results" ]; then
            all_results="${all_results}${results}\n"
        fi
    done
done

# Remove duplicates and format
if [ -n "$all_results" ]; then
    echo -e "\n=== SEARCH RESULTS ==="
    echo -e "$all_results" | sort -u
else
    echo "NO_REPLY: No relevant posts found in the last 48 hours."
fi