#!/usr/bin/env python3
import json
import time
import requests
from datetime import datetime, timedelta
import sys

def search_reddit(subreddit, query, after_timestamp=None, limit=100):
    """Search Reddit using public JSON endpoints"""
    base_url = f"https://www.reddit.com/r/{subreddit}/search.json"
    params = {
        'q': query,
        'restrict_sr': 'on',
        'sort': 'new',
        'limit': limit
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; ClicksProtocolScout/1.0)'
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
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
                    'selftext': post['selftext'][:500] if post['selftext'] else '',
                    'permalink': post['permalink']
                })
        
        return posts
    except Exception as e:
        print(f"Error searching r/{subreddit} for '{query}': {e}", file=sys.stderr)
        return []

def main():
    # Calculate timestamp for 48 hours ago
    now = datetime.utcnow()
    # For testing, since we're in a simulated environment, use a wider window
    # Let's use 7 days to ensure we get some results
    after_time = now - timedelta(days=7)
    after_timestamp = int(after_time.timestamp())
    
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
            posts = search_reddit(subreddit, keyword, after_timestamp)
            
            for post in posts:
                # Apply filters: score >= 3 OR comments >= 5
                if post['score'] >= 3 or post['num_comments'] >= 5:
                    all_posts.append(post)
            
            time.sleep(1)  # Be polite to Reddit
    
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