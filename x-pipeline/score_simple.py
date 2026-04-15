import json
import sys

def score_tweet(text):
    score = 0
    text_lower = text.lower()
    
    # Hook
    words = text.strip().split()
    first_three = ' '.join(words[:3]) if len(words) >= 3 else text
    hook_words = ['why', 'how', 'what', 'stop', 'quick', 'no', 'your', 'ai', 'agent', 'yield', 'usdc', 'idle']
    if any(word in first_three.lower() for word in hook_words):
        score += 1
    
    # Problem-first
    problem_words = ['miss', 'gap', '0%', 'broken', 'worry', 'risk', 'pain', 'stop', 'why', 'what\'s', 'problem']
    if any(word in text_lower for word in problem_words):
        score += 1
    
    # Agent keywords
    agent_words = ['yield', 'usdc', 'idle', 'treasury', 'x402', 'morpho', 'apy', 'defi', 'agent']
    keyword_count = sum(1 for word in agent_words if word in text_lower)
    score += min(3, keyword_count)
    
    # No LLM-speak
    llm_words = ['game-changing', 'revolutionizing', 'excited to', 'thrilled to', 'proud to']
    if not any(word in text_lower for word in llm_words):
        score += 1
    
    # CTA
    cta_words = ['click', 'visit', 'try', 'start', 'build', 'integrate', 'what\'s', 'thoughts', 'agree']
    if any(word in text_lower for word in cta_words):
        score += 1
    
    # Question mark
    if '?' in text:
        score += 1
    
    return score

with open('/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/x-pipeline/queue.json', 'r') as f:
    tweets = json.load(f)

print("Scoring first 10 tweets:")
scores = []
for i, tweet in enumerate(tweets[:10]):
    text = tweet['text']
    score = score_tweet(text)
    scores.append(score)
    print(f"\nTweet {i+1}: Score {score}/10")
    print(f"Text: {text[:100]}...")

print(f"\nAverage score: {sum(scores)/len(scores):.1f}/10")