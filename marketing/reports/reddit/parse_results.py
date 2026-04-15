#!/usr/bin/env python3
import json
import sys
from datetime import datetime

# Current timestamp and 48 hours ago
current_timestamp = 1775937720
timestamp_48h_ago = current_timestamp - 172800  # 48 hours in seconds

# Read the JSON data from stdin
data = json.load(sys.stdin)

relevant_posts = []

if 'data' in data and 'children' in data['data']:
    for child in data['data']['children']:
        post = child['data']
        
        # Check if post is from last 48 hours
        if post['created_utc'] < timestamp_48h_ago:
            continue
            
        # Apply filters: score >= 3 OR comments >= 5
        if post['score'] >= 3 or post['num_comments'] >= 5:
            # Check if it matches our keywords in title or selftext
            title_lower = post['title'].lower()
            selftext_lower = post.get('selftext', '').lower()
            
            keywords = [
                'ai agent yield',
                'mcp defi', 
                'agent payment protocol',
                'x402',
                'ai agent usdc'
            ]
            
            matches_keyword = False
            matched_keywords = []
            for keyword in keywords:
                if keyword in title_lower or keyword in selftext_lower:
                    matches_keyword = True
                    matched_keywords.append(keyword)
            
            if matches_keyword:
                post_info = {
                    'subreddit': post['subreddit'],
                    'title': post['title'],
                    'score': post['score'],
                    'num_comments': post['num_comments'],
                    'url': f"https://reddit.com{post['permalink']}",
                    'created_utc': post['created_utc'],
                    'created_date': datetime.fromtimestamp(post['created_utc']).strftime('%Y-%m-%d %H:%M:%S'),
                    'author': post['author'],
                    'matched_keywords': matched_keywords,
                    'selftext_preview': post.get('selftext', '')[:200] + '...' if post.get('selftext') else ''
                }
                relevant_posts.append(post_info)

# Sort by score (descending)
relevant_posts.sort(key=lambda x: x['score'], reverse=True)

print(f"Found {len(relevant_posts)} relevant posts from last 48 hours:")
print("=" * 80)

for i, post in enumerate(relevant_posts, 1):
    print(f"\n{i}. r/{post['subreddit']}: {post['title']}")
    print(f"   Score: {post['score']} | Comments: {post['num_comments']} | Date: {post['created_date']}")
    print(f"   URL: {post['url']}")
    print(f"   Matched keywords: {', '.join(post['matched_keywords'])}")
    if post['selftext_preview']:
        print(f"   Preview: {post['selftext_preview']}")
    
    # Add engagement recommendation
    if 'x402' in post['matched_keywords']:
        print(f"   💡 ENGAGEMENT OPPORTUNITY: Direct product relevance - we could comment about Clicks Protocol's approach to agent payments")
    elif any(kw in ['ai agent yield', 'mcp defi', 'agent payment protocol'] for kw in post['matched_keywords']):
        print(f"   💡 ENGAGEMENT OPPORTUNITY: High relevance - we could discuss how Clicks Protocol enables AI agent yield and DeFi integration")
    elif post['score'] >= 10:
        print(f"   💡 ENGAGEMENT OPPORTUNITY: High visibility post - worth engaging if context allows")

print("\n" + "=" * 80)
print(f"Total relevant posts: {len(relevant_posts)}")