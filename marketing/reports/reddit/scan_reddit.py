#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime, timedelta
import os

# Configuration
SUBREDDITS = ['ethereum', 'defi', 'cryptocurrency']
KEYWORDS = [
    'AI agent yield',
    'MCP DeFi', 
    'agent payment protocol',
    'x402',
    'AI agent USDC'
]

# Time filter: last 48 hours
TIME_FILTER = 'day'  # day = last 24 hours, we'll filter further
MIN_SCORE = 3
MIN_COMMENTS = 5

def search_reddit(subreddit, query, limit=25):
    """Search Reddit using public JSON API"""
    url = f"https://www.reddit.com/r/{subreddit}/search.json"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    params = {
        'q': query,
        'restrict_sr': 'on',
        'sort': 'new',
        't': TIME_FILTER,
        'limit': limit
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error searching {subreddit} for '{query}': {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception searching {subreddit} for '{query}': {e}")
        return None

def filter_posts(posts_data, min_score=MIN_SCORE, min_comments=MIN_COMMENTS):
    """Filter posts based on score and comments"""
    filtered = []
    if not posts_data or 'data' not in posts_data or 'children' not in posts_data['data']:
        return filtered
    
    for post in posts_data['data']['children']:
        data = post['data']
        score = data.get('score', 0)
        num_comments = data.get('num_comments', 0)
        created_utc = data.get('created_utc', 0)
        
        # Check if post is within last 48 hours
        post_time = datetime.fromtimestamp(created_utc)
        cutoff_time = datetime.now() - timedelta(hours=48)
        
        if post_time >= cutoff_time and (score >= min_score or num_comments >= min_comments):
            filtered.append({
                'subreddit': data.get('subreddit', ''),
                'title': data.get('title', ''),
                'score': score,
                'comments': num_comments,
                'url': f"https://reddit.com{data.get('permalink', '')}",
                'created_utc': created_utc,
                'selftext': data.get('selftext', '')[:500]  # First 500 chars
            })
    
    return filtered

def assess_relevance(post, keyword):
    """Assess if we can comment/position ourselves in this post"""
    title_lower = post['title'].lower()
    selftext_lower = post['selftext'].lower()
    keyword_lower = keyword.lower()
    
    # Direct product mentions
    direct_mentions = ['yield for agents', 'x402', 'mcp finance', 'clicks protocol']
    
    for mention in direct_mentions:
        if mention in title_lower or mention in selftext_lower:
            return "DIRECT", f"Direct mention of {mention} - perfect opportunity to introduce Clicks Protocol"
    
    # AI agents + crypto discussions
    ai_crypto_terms = ['ai agent', 'autonomous agent', 'agent economy', 'ai trading']
    if any(term in title_lower or term in selftext_lower for term in ai_crypto_terms):
        return "RELEVANT", "AI agents + crypto discussion - could mention agent payment protocols"
    
    # General DeFi discussions
    if 'defi' in title_lower or 'decentralized finance' in title_lower:
        return "GENERAL", "General DeFi discussion - could mention MCP/agent integration"
    
    return "LOW", "Not directly relevant"

def main():
    print(f"Starting Reddit scan at {datetime.now()}")
    print(f"Subreddits: {SUBREDDITS}")
    print(f"Keywords: {KEYWORDS}")
    print(f"Filters: Score >= {MIN_SCORE} OR Comments >= {MIN_COMMENTS}, Last 48h")
    print("-" * 80)
    
    all_posts = []
    
    for subreddit in SUBREDDITS:
        print(f"\nSearching r/{subreddit}...")
        for keyword in KEYWORDS:
            print(f"  Keyword: '{keyword}'")
            data = search_reddit(subreddit, keyword)
            if data:
                posts = filter_posts(data)
                for post in posts:
                    post['keyword'] = keyword
                    all_posts.append(post)
                print(f"    Found {len(posts)} posts")
            time.sleep(1)  # Be nice to Reddit API
    
    # Remove duplicates (same URL)
    unique_posts = {}
    for post in all_posts:
        url = post['url']
        if url not in unique_posts:
            unique_posts[url] = post
        else:
            # Keep the one with more keywords if duplicate
            existing = unique_posts[url]
            if post['keyword'] not in existing.get('keywords', []):
                existing['keywords'] = existing.get('keywords', [existing['keyword']]) + [post['keyword']]
    
    unique_posts_list = list(unique_posts.values())
    
    print(f"\nTotal unique posts found: {len(unique_posts_list)}")
    
    # Categorize posts
    direct_posts = []
    relevant_posts = []
    general_posts = []
    
    for post in unique_posts_list:
        relevance, assessment = assess_relevance(post, post.get('keyword', ''))
        post['relevance'] = relevance
        post['assessment'] = assessment
        
        if relevance == "DIRECT":
            direct_posts.append(post)
        elif relevance == "RELEVANT":
            relevant_posts.append(post)
        else:
            general_posts.append(post)
    
    # Generate report
    report_date = datetime.now().strftime('%Y-%m-%d')
    report_path = f"projects/clicks-protocol/marketing/reports/reddit/scan-{report_date}.md"
    
    with open(report_path, 'w') as f:
        f.write(f"# Reddit Scan Report - {report_date}\n\n")
        f.write(f"**Scan Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Subreddits:** {', '.join([f'r/{s}' for s in SUBREDDITS])}\n")
        f.write(f"**Keywords:** {', '.join(KEYWORDS)}\n")
        f.write(f"**Filters:** Score >= {MIN_SCORE} OR Comments >= {MIN_COMMENTS}, Last 48h\n\n")
        
        f.write("## Summary\n\n")
        f.write(f"- **Total posts found:** {len(unique_posts_list)}\n")
        f.write(f"- **Direct relevance (product mentions):** {len(direct_posts)}\n")
        f.write(f"- **Relevant (AI agents + crypto):** {len(relevant_posts)}\n")
        f.write(f"- **General discussions:** {len(general_posts)}\n\n")
        
        if direct_posts:
            f.write("## Direct Relevance Posts (Product Mentions)\n\n")
            f.write("These posts directly mention concepts related to our product. Perfect for engagement.\n\n")
            for post in direct_posts:
                f.write(f"### {post['title']}\n")
                f.write(f"- **Subreddit:** r/{post['subreddit']}\n")
                f.write(f"- **Score:** {post['score']} | **Comments:** {post['comments']}\n")
                f.write(f"- **URL:** {post['url']}\n")
                f.write(f"- **Matched keyword:** {post.get('keyword', 'N/A')}\n")
                f.write(f"- **Assessment:** {post['assessment']}\n")
                f.write(f"- **Suggested action:** Comment introducing Clicks Protocol as a solution for agent payments/yield\n\n")
        
        if relevant_posts:
            f.write("## Relevant Posts (AI Agents + Crypto)\n\n")
            f.write("These discuss AI agents in crypto context. Good for positioning.\n\n")
            # Only show top 5 by score if many
            sorted_relevant = sorted(relevant_posts, key=lambda x: x['score'], reverse=True)
            display_posts = sorted_relevant[:5] if len(sorted_relevant) > 5 else sorted_relevant
            
            for post in display_posts:
                f.write(f"### {post['title']}\n")
                f.write(f"- **Subreddit:** r/{post['subreddit']}\n")
                f.write(f"- **Score:** {post['score']} | **Comments:** {post['comments']}\n")
                f.write(f"- **URL:** {post['url']}\n")
                f.write(f"- **Matched keyword:** {post.get('keyword', 'N/A')}\n")
                f.write(f"- **Assessment:** {post['assessment']}\n")
                f.write(f"- **Suggested action:** Mention agent payment protocols like x402 or MCP DeFi integration\n\n")
            
            if len(sorted_relevant) > 5:
                f.write(f"*... and {len(sorted_relevant) - 5} more relevant posts*\n\n")
        
        if not direct_posts and not relevant_posts:
            f.write("## NO_REPLY\n\n")
            f.write("No relevant posts found matching our criteria.\n")
    
    print(f"\nReport saved to: {report_path}")
    
    # Print summary for immediate response
    print("\n" + "=" * 80)
    print("SCAN SUMMARY")
    print("=" * 80)
    if direct_posts:
        print(f"\nDIRECT RELEVANCE ({len(direct_posts)} posts):")
        for post in direct_posts:
            print(f"  • r/{post['subreddit']}: {post['title'][:60]}...")
            print(f"    Score: {post['score']}, Comments: {post['comments']}")
            print(f"    URL: {post['url']}")
            print(f"    Action: {post['assessment']}")
    
    if relevant_posts:
        print(f"\nRELEVANT DISCUSSIONS ({len(relevant_posts)} posts, showing top {min(5, len(relevant_posts))}):")
        sorted_relevant = sorted(relevant_posts, key=lambda x: x['score'], reverse=True)
        for i, post in enumerate(sorted_relevant[:5]):
            print(f"  {i+1}. r/{post['subreddit']}: {post['title'][:60]}...")
            print(f"     Score: {post['score']}, Comments: {post['comments']}")
    
    if not direct_posts and not relevant_posts:
        print("\nNO_REPLY: No relevant posts found in the last 48 hours.")
    
    return len(direct_posts) > 0 or len(relevant_posts) > 0

if __name__ == "__main__":
    main()