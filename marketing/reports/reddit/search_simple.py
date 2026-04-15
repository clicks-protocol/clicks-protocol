#!/usr/bin/env python3
import json
import time
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
import sys

def search_reddit(subreddit, query, after_timestamp=None, limit=25):
    """Search Reddit using public JSON endpoints without external dependencies"""
    base_url = f"https://www.reddit.com/r/{subreddit}/search.json"
    params = {
        'q': query,
        'restrict_sr': 'on',
        'sort': 'new',
        'limit': limit
    }
    
    query_string = urllib.parse.urlencode(params)
    url = f"{base_url}?{query_string}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; ClicksProtocolScout/1.0)'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        posts = []
        if 'data' in data and 'children' in data['data']:
            for child in data['data']['children']:
                post = child['data']
                
                # Filter by timestamp if provided
                if after_timestamp and post['created_utc'] < after_timestamp:
                    continue
                    
                posts.append({
                    'subreddit': post['subreddit'],
                    'title': post['title'],
                    'score': post['score'],
                    'num_comments': post['num_comments'],
                    'url': f"https://reddit.com{post['permalink']}",
                    'created_utc': post['created_utc'],
                    'author': post['author'],
                    'selftext': post['selftext'][:200] if post['selftext'] else '',
                    'permalink': post['permalink']
                })
        
        return posts
    except Exception as e:
        print(f"Error searching r/{subreddit} for '{query}': {e}", file=sys.stderr)
        return []

def main():
    # Since we're in a simulated environment and don't know the actual date,
    # let's search without time filter but apply other filters
    subreddits = ['ethereum', 'defi', 'cryptocurrency']
    keywords = [
        'AI agent yield',
        'MCP DeFi', 
        'agent payment protocol',
        'x402',
        'AI agent USDC'
    ]
    
    all_posts = []
    
    for subreddit in subreddits:
        print(f"\nSearching r/{subreddit}...", file=sys.stderr)
        for keyword in keywords:
            print(f"  Keyword: {keyword}", file=sys.stderr)
            posts = search_reddit(subreddit, keyword)
            
            for post in posts:
                # Apply filters: score >= 3 OR comments >= 5
                if post['score'] >= 3 or post['num_comments'] >= 5:
                    all_posts.append(post)
            
            time.sleep(2)  # Be polite to Reddit
    
    # Remove duplicates (same post might appear in multiple keyword searches)
    unique_posts = []
    seen_urls = set()
    for post in all_posts:
        if post['url'] not in seen_urls:
            seen_urls.add(post['url'])
            unique_posts.append(post)
    
    # Sort by score (descending)
    unique_posts.sort(key=lambda x: x['score'], reverse=True)
    
    # Output results
    print(json.dumps(unique_posts, indent=2))

if __name__ == "__main__":
    main()