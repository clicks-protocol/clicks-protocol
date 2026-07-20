#!/usr/bin/env python3
"""Post tweets #3-#14 (indices 2-13) to Moltbook agent-treasury submolt."""

import json
import os
import time
import re
import requests
import sys

API_KEY = os.environ.get("MOLTBOOK_API_KEY")
if not API_KEY:
    raise SystemExit("MOLTBOOK_API_KEY missing in environment")
API_BASE = "https://www.moltbook.com/api/v1"
SUBMOLT = "agent-treasury"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Number words to int
WORD_MAP = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
    "hundred": 100, "thousand": 1000
}

def parse_number_words(text):
    """Parse a phrase of number words into an integer."""
    text = text.lower().strip()
    # Remove non-alpha-space
    text = re.sub(r'[^a-z\s]', '', text).strip()
    words = text.split()
    
    total = 0
    current = 0
    for w in words:
        if w in WORD_MAP:
            val = WORD_MAP[w]
            if val == 100:
                current = current * 100 if current > 0 else 100
            elif val == 1000:
                current = current * 1000 if current > 0 else 1000
                total += current
                current = 0
            elif val >= 20:
                current += val
            else:
                current += val
        # skip unknown words (units like newtons, meters, etc.)
    total += current
    return total

def solve_challenge(challenge_text):
    """Extract and solve math challenge from obfuscated text."""
    # Normalize: lowercase, remove non-alpha-space and keep +
    normalized = challenge_text.lower()
    # Keep only letters, spaces and +
    normalized = re.sub(r'[^a-z\s+]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    print(f"  Normalized challenge: {normalized}", flush=True)
    
    # Find "+" operator
    if '+' in normalized:
        parts = normalized.split('+')
        # Strip known unit words
        unit_words = ['newtons', 'newton', 'meters', 'meter', 'seconds', 'second',
                      'kilograms', 'kilogram', 'miles', 'mile', 'yards', 'yard',
                      'pounds', 'pound', 'feet', 'foot', 'inches', 'inch',
                      'celsius', 'fahrenheit', 'kelvin', 'joules', 'joule',
                      'watts', 'watt', 'volts', 'volt', 'amperes', 'ampere',
                      'amps', 'amp', 'grams', 'gram', 'liters', 'liter',
                      'minutes', 'minute', 'hours', 'hour', 'days', 'day',
                      'apples', 'apple', 'oranges', 'orange', 'bananas', 'banana',
                      'cats', 'cat', 'dogs', 'dog', 'units', 'unit']
        
        nums = []
        for part in parts:
            part = part.strip()
            # Remove unit words
            for uw in unit_words:
                part = re.sub(r'\b' + uw + r'\b', '', part)
            part = part.strip()
            n = parse_number_words(part)
            nums.append(n)
        
        result = sum(nums)
        print(f"  Parsed numbers: {nums}, result: {result}", flush=True)
        return f"{result:.2f}"
    
    raise ValueError(f"Cannot parse challenge: {challenge_text}")


def post_with_retry(payload, max_retries=5):
    """POST to /api/v1/posts with retry on 429."""
    for attempt in range(max_retries):
        resp = requests.post(f"{API_BASE}/posts", json=payload, headers=HEADERS)
        print(f"  POST /posts → {resp.status_code}", flush=True)
        
        if resp.status_code == 429:
            try:
                err = resp.json()
                wait_secs = err.get("retry_after_seconds", 165) + 5
            except Exception:
                wait_secs = 170
            print(f"  Rate limited! Waiting {wait_secs} seconds...", flush=True)
            time.sleep(wait_secs)
            continue
        
        return resp
    
    return None


def post_tweet(tweet, index):
    """Post a single tweet and handle verification."""
    lines = tweet["text"].split('\n')
    title = lines[0][:300]
    
    content = tweet["text"]
    if tweet.get("reply_text"):
        content += f"\n---\n{tweet['reply_text']}"
    
    print(f"\n{'='*60}", flush=True)
    print(f"Posting tweet #{index+1} (queue index {index})", flush=True)
    print(f"Title: {title}", flush=True)
    print(f"Content preview: {content[:100]}...", flush=True)
    
    payload = {
        "submolt_name": SUBMOLT,
        "title": title,
        "content": content
    }
    
    resp = post_with_retry(payload)
    if resp is None:
        print(f"  ERROR: All retries failed!", flush=True)
        return False
    
    try:
        data = resp.json()
    except Exception:
        print(f"  Response body: {resp.text}", flush=True)
        return False
    
    print(f"  Response: {json.dumps(data, indent=2)[:500]}", flush=True)
    
    if resp.status_code not in (200, 201):
        print(f"  ERROR: Post failed!", flush=True)
        return False
    
    # Check if already existed (no verification needed)
    if data.get("already_existed"):
        print(f"  Already existed, no verification needed.", flush=True)
        return True
    
    # Extract verification info
    verification_code = data.get("verification_code") or (data.get("data") or {}).get("verification_code")
    challenge = data.get("challenge") or (data.get("data") or {}).get("challenge")
    
    if not verification_code or not challenge:
        print(f"  No verification needed. Keys: {list(data.keys())}", flush=True)
        return True
    
    print(f"  Challenge: {challenge}", flush=True)
    print(f"  Verification code: {verification_code}", flush=True)
    
    # Solve challenge
    try:
        answer = solve_challenge(challenge)
    except Exception as e:
        print(f"  ERROR solving challenge: {e}", flush=True)
        return False
    
    print(f"  Answer: {answer}", flush=True)
    
    # POST /api/v1/verify
    verify_payload = {
        "verification_code": verification_code,
        "answer": answer
    }
    
    verify_resp = requests.post(f"{API_BASE}/verify", json=verify_payload, headers=HEADERS)
    print(f"  POST /verify → {verify_resp.status_code}", flush=True)
    
    try:
        verify_data = verify_resp.json()
    except Exception:
        print(f"  Verify response body: {verify_resp.text}", flush=True)
    else:
        print(f"  Verify response: {json.dumps(verify_data, indent=2)[:500]}", flush=True)
    
    return verify_resp.status_code in (200, 201)


def main():
    with open("/Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/x-pipeline/queue.json") as f:
        queue = json.load(f)
    
    # Tweets #3 to #14 = indices 2 to 13
    tweets_to_post = queue[2:14]
    
    results = []
    
    # Minimum delay between posts
    MIN_DELAY = 162  # slightly over 2.5 minutes
    last_post_time = 0
    
    for i, tweet in enumerate(tweets_to_post):
        queue_index = i + 2  # actual index in queue
        
        # Wait if needed
        now = time.time()
        elapsed = now - last_post_time
        if last_post_time > 0 and elapsed < MIN_DELAY:
            wait = MIN_DELAY - elapsed
            print(f"\n  Waiting {wait:.0f} seconds for rate limit...", flush=True)
            time.sleep(wait)
        
        success = post_tweet(tweet, queue_index)
        last_post_time = time.time()
        results.append((queue_index + 1, success))  # tweet number is 1-based
    
    print(f"\n{'='*60}", flush=True)
    print("SUMMARY:", flush=True)
    success_count = 0
    for tweet_num, success in results:
        status = "OK" if success else "FAILED"
        print(f"  Tweet #{tweet_num}: {status}", flush=True)
        if success:
            success_count += 1
    
    print(f"\nTotal: {success_count}/{len(results)} successful", flush=True)

if __name__ == "__main__":
    main()
