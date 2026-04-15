#!/usr/bin/env python3
import json
import re

def score_tweet(text):
    """Score a tweet 1-10 based on criteria"""
    score = 0
    
    # 1. Hook (first 3 words captivating?)
    words = text.strip().split()
    first_three = ' '.join(words[:3]) if len(words) >= 3 else text
    hook_words = ['why', 'how', 'what', 'stop', 'quick', 'no', 'your', 'ai', 'agent', 'yield', 'usdc', 'idle', 'treasury', 'x402']
    hook_score = 1 if any(word.lower() in first_three.lower() for word in hook_words) else 0
    score += hook_score
    
    # 2. Problem-first (problem before solution?)
    problem_indicators = ['miss', 'gap', '0%', 'broken', 'worry', 'risk', 'pain', 'stop', 'why', 'what\'s', 'problem']
    has_problem = any(indicator in text.lower() for indicator in problem_indicators)
    score += 1 if has_problem else 0
    
    # 3. Agent-Keywords (yield, USDC, idle, treasury, x402?)
    agent_keywords = ['yield', 'usdc', 'idle', 'treasury', 'x402', 'morpho', 'apy', 'defi', 'agent']
    keyword_count = sum(1 for keyword in agent_keywords if keyword.lower() in text.lower())
    score += min(3, keyword_count)  # Max 3 points for keywords
    
    # 4. No LLM-speak (no game-changing, revolutionizing, excited to)
    llm_speak = ['game-changing', 'revolutionizing', 'excited to', 'thrilled to', 'proud to', 'innovative', 'cutting-edge']
    has_llm_speak = any(phrase in text.lower() for phrase in llm_speak)
    score += 1 if not has_llm_speak else 0
    
    # 5. CTA (clear call-to-action?)
    cta_indicators = ['click', 'visit', 'try', 'start', 'build', 'integrate', 'what\'s', 'thoughts', 'agree', 'how long']
    has_cta = any(indicator in text.lower() for indicator in cta_indicators)
    score += 1 if has_cta else 0
    
    # Bonus: Has question mark (engagement)
    if '?' in text:
        score += 1
    
    return score

if __name__ == "__main__":
    with open('queue.json', 'r') as f:
        tweets = json.load(f)
    
    print("Scoring first 10 tweets:")
    for i, tweet in enumerate(tweets[:10]):
        text = tweet['text']
        score = score_tweet(text)
        print(f"\nTweet {i+1} (Day {tweet['day']}, Slot {tweet['slot']}):")
        print(f"Score: {score}/10")
        print(f"Text: {text[:80]}...")