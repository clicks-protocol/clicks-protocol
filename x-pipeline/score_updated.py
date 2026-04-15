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

print("Scoring updated tweets (first 10):")
original_scores = [7, 7, 4, 5, 6, 5, 6, 7, 3, 7]
updated_scores = []

for i, tweet in enumerate(tweets[:10]):
    text = tweet['text']
    score = score_tweet(text)
    updated_scores.append(score)
    improvement = score - original_scores[i]
    print(f"\nTweet {i+1}: Original {original_scores[i]}/10 → Updated {score}/10 (Δ{improvement:+d})")
    print(f"Text: {text[:80]}...")

print(f"\nAverage original: {sum(original_scores)/len(original_scores):.1f}/10")
print(f"Average updated: {sum(updated_scores)/len(updated_scores):.1f}/10")
print(f"Improvement: {sum(updated_scores)/len(updated_scores) - sum(original_scores)/len(original_scores):+.1f} points")

improved_count = sum(1 for i in range(10) if updated_scores[i] > original_scores[i])
print(f"\nImproved: {improved_count}/10 tweets")