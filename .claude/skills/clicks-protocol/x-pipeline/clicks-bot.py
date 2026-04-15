#!/usr/bin/env python3
"""
Clicks Protocol X/Twitter Bot
Central daemon: posting, monitoring, auto-reply, performance tracking.
Runs in screen, checks schedule every minute, Europe/Berlin timezone.
"""

import json
import os
import sys
import signal
import time
import random
import hashlib
import threading
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote

# ── Dependency check ─────────────────────────────────────────────────────────
try:
    import tweepy
except ImportError:
    print("ERROR: tweepy not installed. Run: pip3 install tweepy")
    sys.exit(1)

try:
    from zoneinfo import ZoneInfo
except ImportError:
    # Python < 3.9 fallback
    try:
        from backports.zoneinfo import ZoneInfo
    except ImportError:
        print("ERROR: zoneinfo not available. Use Python 3.9+ or: pip3 install backports.zoneinfo")
        sys.exit(1)

# ── Constants ────────────────────────────────────────────────────────────────
TIMEZONE = ZoneInfo("Europe/Berlin")
BASE_DIR = Path(__file__).parent.resolve()
CONFIG_FILE = BASE_DIR / "config.json"
QUEUE_FILE = BASE_DIR / "queue.json"
POST_LOG_FILE = BASE_DIR / "post-log.json"
SEEN_MENTIONS_FILE = BASE_DIR / "seen-mentions.json"
REPLIED_MENTIONS_FILE = BASE_DIR / "replied-mentions.json"
NOTIFY_FILE = BASE_DIR / "notify.txt"
REPORTS_DIR = BASE_DIR / "reports"
STREAM_LOG_FILE = BASE_DIR / "stream-log.json"

# ── Filtered Stream Config ───────────────────────────────────────────────────
STREAM_RULES = [
    '(x402 OR "x402 protocol") lang:en -is:retweet',
    '("agent yield" OR "agent wallet" OR "agentic wallet") lang:en -is:retweet',
    '("USDC yield" OR "idle USDC" OR "agent float") lang:en -is:retweet',
    '@ClicksProtocol -is:retweet',
    '("clicks protocol") lang:en -is:retweet',
]
STREAM_RECONNECT_BASE_DELAY = 5  # seconds
STREAM_RECONNECT_MAX_DELAY = 300  # 5 minutes max backoff

SCHEDULE = {
    "post_asia": "06:00",
    "post_europe": "13:00",
    "post_us": "20:00",
    "mention_check": ["09:00", "14:00", "19:00"],
    "auto_reply": ["09:30", "13:30", "17:30", "21:30"],
    "account_monitor": ["08:00", "12:00", "16:00", "20:00"],
    "performance": "sunday_20:00",
}

# ── x-monitor: Accounts to watch ────────────────────────────────────────────
MONITOR_HANDLES_FILE = Path.home() / '.openclaw' / 'workspace' / 'x-monitor' / 'handles.json'
MONITOR_CRITERIA_FILE = Path.home() / '.openclaw' / 'workspace' / 'x-monitor' / 'noteworthy-criteria.md'
MONITOR_SEEN_FILE = Path.home() / '.openclaw' / 'workspace' / 'x-monitor' / 'seen-tweets.json'
MONITOR_HISTORY_FILE = Path.home() / '.openclaw' / 'workspace' / 'x-monitor' / 'tweet_history.json'

# Keywords for relevance filtering (from noteworthy-criteria.md)
MONITOR_INCLUDE_KEYWORDS = [
    "x402", "agent wallet", "agentic wallet", "agent yield", "idle usdc",
    "agent float", "defi yield", "usdc yield", "clicks protocol", "clicks",
    "morpho", "aave", "base chain", "base l2", "agent finance",
    "mcp server", "agent sdk", "autonomous agent", "ai agent",
    "coinbase agentic", "apyusd", "susdau", "usdai",
]
MONITOR_EXCLUDE_KEYWORDS = [
    "airdrop", "free money", "scam", "pump", "moon", "lambo",
    "like if you", "retweet for", "follow for",
]

RESPONSES = {
    "question": [
        "Clicks splits your USDC 80/20: 80% stays liquid, 20% earns 4-8% APY via Aave V3 or Morpho on Base. No lockup.",
        "One SDK call: quickStart(). Handles registration, approval, and splitting automatically.",
    ],
    "positive": [
        "Thanks! If you're building agents on Base, our SDK is ready: npm install @clicks-protocol/sdk",
        "Appreciate it! We're making idle agent USDC work. Docs at clicksprotocol.xyz",
    ],
    "technical": [
        "npm install @clicks-protocol/sdk\n\nThree lines to start. Full reference: clicksprotocol.xyz/docs/api",
        "We also have an MCP server with 9 tools: npx @clicks-protocol/mcp-server",
    ],
    "general": [
        "Thanks for mentioning Clicks! Autonomous yield for AI agents on Base. clicksprotocol.xyz",
        "Appreciate the mention! 4-8% APY on idle agent USDC, zero lockup. clicksprotocol.xyz",
    ],
}

MAX_REPLIES_PER_RUN = 5
REPLY_DELAY_SECONDS = 5
POST_REPLY_DELAY = 2

# ── Globals ──────────────────────────────────────────────────────────────────
running = True
executed_jobs = {}  # track which jobs ran this minute to avoid duplicates
retry_after = {}    # job_name -> datetime when to retry (for 402 credits)


def signal_handler(sig, frame):
    global running
    log(f"Received signal {sig}, shutting down gracefully...")
    running = False


signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)


# ── Helpers ──────────────────────────────────────────────────────────────────
def now():
    return datetime.now(TIMEZONE)


def log(msg):
    ts = now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def load_json(path, default=None):
    if default is None:
        default = []
    try:
        if path.exists():
            with open(path, "r") as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        log(f"WARN: Failed to load {path.name}: {e}")
    return default


def save_json(path, data):
    try:
        with open(path, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except IOError as e:
        log(f"ERROR: Failed to save {path.name}: {e}")


def load_config():
    if not CONFIG_FILE.exists():
        log("ERROR: config.json not found!")
        sys.exit(1)
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)


def notify(msg):
    """Write notification to notify.txt and stdout."""
    log(f"NOTIFY: {msg}")
    try:
        with open(NOTIFY_FILE, "a") as f:
            ts = now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{ts}] {msg}\n")
    except IOError:
        pass


# ── API Clients ──────────────────────────────────────────────────────────────
def get_write_client(config):
    """OAuth 1.0a client for write operations (post, reply)."""
    return tweepy.Client(
        consumer_key=config["consumerKey"],
        consumer_secret=config["consumerSecret"],
        access_token=config["accessToken"],
        access_token_secret=config["accessTokenSecret"],
        wait_on_rate_limit=True,
    )


def get_read_client(config):
    """Bearer token client for read operations (search, timeline)."""
    return tweepy.Client(
        bearer_token=config["bearerToken"],
        wait_on_rate_limit=True,
    )


# ── API call wrapper with error handling ─────────────────────────────────────
def safe_api_call(func, *args, **kwargs):
    """
    Wraps a tweepy API call with robust error handling.
    Returns (result, error_code) tuple.
    error_code: None=success, 429=rate_limit, 402=credits, other=error
    """
    try:
        result = func(*args, **kwargs)
        return result, None
    except tweepy.TooManyRequests as e:
        log(f"RATE LIMIT (429): {e}. Waiting 60s...")
        time.sleep(60)
        return None, 429
    except tweepy.Forbidden as e:
        err_str = str(e)
        if "402" in err_str or "Payment Required" in err_str:
            log(f"CREDITS EXHAUSTED (402): {e}. Will retry in 1h.")
            return None, 402
        log(f"FORBIDDEN (403): {e}")
        return None, 403
    except tweepy.Unauthorized as e:
        log(f"UNAUTHORIZED (401): {e}. Check credentials.")
        return None, 401
    except tweepy.TwitterServerError as e:
        log(f"SERVER ERROR (5xx): {e}. Retrying in 30s...")
        time.sleep(30)
        return None, 500
    except tweepy.BadRequest as e:
        log(f"BAD REQUEST (400): {e}")
        return None, 400
    except Exception as e:
        log(f"UNEXPECTED ERROR: {type(e).__name__}: {e}")
        return None, -1


# ── Job: Post from Queue ────────────────────────────────────────────────────
def job_post(config, slot_name):
    """Post next tweet from queue.json for the given slot."""
    log(f"POST JOB: {slot_name}")

    queue = load_json(QUEUE_FILE)
    if not queue:
        log("Queue is empty, nothing to post.")
        return

    post_log = load_json(POST_LOG_FILE)
    posted_hashes = {entry.get("hash") for entry in post_log}

    # Find next unposted tweet
    tweet_to_post = None
    for item in queue:
        text_hash = hashlib.md5(item["text"].encode()).hexdigest()
        if text_hash not in posted_hashes:
            tweet_to_post = item
            tweet_to_post["_hash"] = text_hash
            break

    if not tweet_to_post:
        log("All tweets in queue already posted. Refill queue.json!")
        return

    write_client = get_write_client(config)

    # Post main tweet
    result, err = safe_api_call(write_client.create_tweet, text=tweet_to_post["text"])
    if err:
        if err == 402:
            retry_after["post"] = now() + timedelta(hours=1)
        log(f"Failed to post tweet: error {err}")
        return

    tweet_id = result.data["id"]
    log(f"Posted tweet {tweet_id}: {tweet_to_post['text'][:80]}...")

    log_entry = {
        "hash": tweet_to_post["_hash"],
        "tweet_id": tweet_id,
        "text": tweet_to_post["text"],
        "slot": slot_name,
        "posted_at": now().isoformat(),
    }

    # Post reply with link if specified
    if tweet_to_post.get("reply_with_link"):
        time.sleep(POST_REPLY_DELAY)
        reply_result, reply_err = safe_api_call(
            write_client.create_tweet,
            text=tweet_to_post["reply_with_link"],
            in_reply_to_tweet_id=tweet_id,
        )
        if reply_err:
            log(f"Failed to post reply: error {reply_err}")
        else:
            reply_id = reply_result.data["id"]
            log(f"Posted reply {reply_id}")
            log_entry["reply_id"] = reply_id
            log_entry["reply_text"] = tweet_to_post["reply_with_link"]

    post_log.append(log_entry)
    save_json(POST_LOG_FILE, post_log)
    log(f"Post logged. Total posts: {len(post_log)}")


# ── Job: Mention Check ──────────────────────────────────────────────────────
def job_mention_check(config):
    """Search for mentions of Clicks Protocol."""
    log("MENTION CHECK JOB")

    read_client = get_read_client(config)
    seen = load_json(SEEN_MENTIONS_FILE, default={})
    if isinstance(seen, list):
        seen = {}

    # Search queries
    queries = [
        f"@{config['username']}",
        '"clicks protocol"',
        "url:clicksprotocol.xyz",
    ]

    new_mentions = []

    for query in queries:
        # Exclude own tweets
        full_query = f"{query} -from:{config['username']}"

        result, err = safe_api_call(
            read_client.search_recent_tweets,
            query=full_query,
            max_results=20,
            tweet_fields=["author_id", "created_at", "text", "conversation_id"],
            expansions=["author_id"],
        )

        if err:
            if err == 402:
                retry_after["mention_check"] = now() + timedelta(hours=1)
            log(f"Search failed for '{query}': error {err}")
            continue

        if not result or not result.data:
            continue

        # Build user lookup
        users = {}
        if result.includes and "users" in result.includes:
            for u in result.includes["users"]:
                users[u.id] = u.username

        for tweet in result.data:
            tid = str(tweet.id)
            if tid not in seen:
                author = users.get(tweet.author_id, "unknown")
                mention = {
                    "id": tid,
                    "author_id": str(tweet.author_id),
                    "author": author,
                    "text": tweet.text,
                    "created_at": tweet.created_at.isoformat() if tweet.created_at else None,
                    "found_via": query,
                    "seen_at": now().isoformat(),
                }
                new_mentions.append(mention)
                seen[tid] = mention

    save_json(SEEN_MENTIONS_FILE, seen)

    if new_mentions:
        log(f"Found {len(new_mentions)} new mentions:")
        for m in new_mentions:
            log(f"  @{m['author']}: {m['text'][:100]}")
        notify(f"{len(new_mentions)} new mentions of Clicks Protocol found!")
    else:
        log("No new mentions found.")


# ── Job: Auto-Reply ──────────────────────────────────────────────────────────
def classify_mention(text):
    """Classify a mention into question/positive/technical/general."""
    text_lower = text.lower()

    # Question indicators
    question_words = ["how", "what", "why", "when", "where", "can i", "does", "is it", "?",
                      "explain", "tell me", "help", "wondering"]
    if any(w in text_lower for w in question_words):
        return "question"

    # Technical indicators
    tech_words = ["sdk", "npm", "install", "api", "integrate", "code", "deploy",
                  "contract", "solidity", "typescript", "mcp", "github", "docs",
                  "function", "import", "error", "bug", "fix"]
    if any(w in text_lower for w in tech_words):
        return "technical"

    # Positive indicators
    positive_words = ["great", "awesome", "cool", "nice", "love", "amazing", "impressive",
                      "excited", "bullish", "fire", "good", "best", "congrats",
                      "\U0001f525", "\U0001f680", "\U0001f44d", "\u2764"]
    if any(w in text_lower for w in positive_words):
        return "positive"

    return "general"


def job_auto_reply(config):
    """Reply to new mentions with contextual responses."""
    log("AUTO-REPLY JOB")

    read_client = get_read_client(config)
    write_client = get_write_client(config)

    replied = load_json(REPLIED_MENTIONS_FILE, default={})
    if isinstance(replied, list):
        replied = {}

    # Get recent mentions
    query = f"@{config['username']} -from:{config['username']}"
    result, err = safe_api_call(
        read_client.search_recent_tweets,
        query=query,
        max_results=20,
        tweet_fields=["author_id", "created_at", "text", "conversation_id"],
        expansions=["author_id"],
    )

    if err:
        if err == 402:
            retry_after["auto_reply"] = now() + timedelta(hours=1)
        log(f"Failed to fetch mentions: error {err}")
        return

    if not result or not result.data:
        log("No mentions to reply to.")
        return

    # Build user lookup
    users = {}
    if result.includes and "users" in result.includes:
        for u in result.includes["users"]:
            users[u.id] = u.username

    replies_sent = 0

    for tweet in result.data:
        if replies_sent >= MAX_REPLIES_PER_RUN:
            log(f"Max replies ({MAX_REPLIES_PER_RUN}) reached for this run.")
            break

        tid = str(tweet.id)
        if tid in replied:
            continue

        author = users.get(tweet.author_id, "unknown")

        # Don't reply to self
        if author.lower() == config["username"].lower():
            continue

        # Classify and pick response
        category = classify_mention(tweet.text)
        response_text = random.choice(RESPONSES[category])

        # Prepend @mention
        reply_text = f"@{author} {response_text}"

        # Truncate to 280 chars
        if len(reply_text) > 280:
            reply_text = reply_text[:277] + "..."

        log(f"Replying to @{author} (category: {category}): {reply_text[:80]}...")

        reply_result, reply_err = safe_api_call(
            write_client.create_tweet,
            text=reply_text,
            in_reply_to_tweet_id=tweet.id,
        )

        if reply_err:
            if reply_err == 402:
                retry_after["auto_reply"] = now() + timedelta(hours=1)
                log("Credits exhausted, stopping replies.")
                break
            log(f"Failed to reply to {tid}: error {reply_err}")
            continue

        replied[tid] = {
            "author": author,
            "original_text": tweet.text[:200],
            "category": category,
            "reply_text": reply_text,
            "replied_at": now().isoformat(),
            "reply_id": str(reply_result.data["id"]),
        }

        replies_sent += 1
        log(f"Reply sent ({replies_sent}/{MAX_REPLIES_PER_RUN})")

        if replies_sent < MAX_REPLIES_PER_RUN:
            time.sleep(REPLY_DELAY_SECONDS)

    save_json(REPLIED_MENTIONS_FILE, replied)
    log(f"Auto-reply complete. Sent {replies_sent} replies.")


# ── Job: Performance Report ──────────────────────────────────────────────────
def job_performance(config):
    """Generate weekly performance report."""
    log("PERFORMANCE REPORT JOB")

    read_client = get_read_client(config)

    # Get own tweets from last 7 days
    user_id = config["userId"]
    start_time = (now() - timedelta(days=7)).replace(microsecond=0)

    result, err = safe_api_call(
        read_client.get_users_tweets,
        id=user_id,
        max_results=100,
        start_time=start_time,
        tweet_fields=["created_at", "public_metrics", "text"],
        exclude=["retweets"],
    )

    if err:
        if err == 402:
            retry_after["performance"] = now() + timedelta(hours=1)
        log(f"Failed to fetch tweets for report: error {err}")
        return

    if not result or not result.data:
        log("No tweets found in last 7 days.")
        return

    # Aggregate metrics
    total_likes = 0
    total_retweets = 0
    total_replies = 0
    total_impressions = 0
    tweet_count = len(result.data)
    tweets_data = []

    for tweet in result.data:
        metrics = tweet.public_metrics or {}
        likes = metrics.get("like_count", 0)
        rts = metrics.get("retweet_count", 0)
        replies = metrics.get("reply_count", 0)
        impressions = metrics.get("impression_count", 0)

        total_likes += likes
        total_retweets += rts
        total_replies += replies
        total_impressions += impressions

        tweets_data.append({
            "text": tweet.text[:100],
            "likes": likes,
            "retweets": rts,
            "replies": replies,
            "impressions": impressions,
            "created_at": tweet.created_at.isoformat() if tweet.created_at else "?",
        })

    # Sort by engagement
    tweets_data.sort(key=lambda t: t["likes"] + t["retweets"] + t["replies"], reverse=True)

    # Build Markdown report
    report_date = now().strftime("%Y-%m-%d")
    week_start = (now() - timedelta(days=7)).strftime("%Y-%m-%d")

    report = f"""# Clicks Protocol X Performance Report
## {week_start} to {report_date}

### Summary
| Metric | Value |
|--------|-------|
| Tweets | {tweet_count} |
| Total Impressions | {total_impressions:,} |
| Total Likes | {total_likes} |
| Total Retweets | {total_retweets} |
| Total Replies | {total_replies} |
| Avg Impressions/Tweet | {total_impressions // max(tweet_count, 1):,} |
| Avg Likes/Tweet | {total_likes / max(tweet_count, 1):.1f} |
| Engagement Rate | {((total_likes + total_retweets + total_replies) / max(total_impressions, 1) * 100):.2f}% |

### Top Performing Tweets
"""

    for i, t in enumerate(tweets_data[:5], 1):
        report += f"""
#### #{i}
- **Text:** {t['text']}...
- **Impressions:** {t['impressions']:,}
- **Likes:** {t['likes']} | **Retweets:** {t['retweets']} | **Replies:** {t['replies']}
- **Posted:** {t['created_at']}
"""

    report += f"\n\n*Report generated: {now().isoformat()}*\n"

    # Save report
    REPORTS_DIR.mkdir(exist_ok=True)
    report_path = REPORTS_DIR / f"performance-{report_date}.md"
    report_path.write_text(report)
    log(f"Performance report saved: {report_path}")
    notify(f"Weekly performance report ready: {tweet_count} tweets, {total_likes} likes, {total_impressions:,} impressions")


# ── Account Monitor (x-monitor) ─────────────────────────────────────────────
def job_account_monitor(config):
    """Monitor configured X accounts for noteworthy tweets."""
    log("ACCOUNT MONITOR JOB")

    read_client = get_read_client(config)

    # Load handles
    if not MONITOR_HANDLES_FILE.exists():
        log(f"No handles file at {MONITOR_HANDLES_FILE}")
        return

    handles_data = load_json(MONITOR_HANDLES_FILE, {"handles": []})
    handles = handles_data.get("handles", [])
    if not handles:
        log("No handles configured for monitoring.")
        return

    # Load seen tweets
    seen = set(load_json(MONITOR_SEEN_FILE, []))

    noteworthy = []
    total_checked = 0

    for handle in handles:
        query = f"from:{handle} -is:retweet"
        since_time = (now() - timedelta(hours=6)).replace(microsecond=0)

        result, err = safe_api_call(
            read_client.search_recent_tweets,
            query=query,
            max_results=10,
            start_time=since_time,
            tweet_fields=["created_at", "public_metrics", "author_id", "text"],
            expansions=["author_id"],
            user_fields=["username", "name"],
        )

        if err:
            if err == 402:
                retry_after["account_monitor"] = now() + timedelta(hours=1)
                log("Credits depleted, pausing account monitor for 1h")
                return
            log(f"Error fetching @{handle}: {err}")
            continue

        if not result or not result.data:
            continue

        # Build user map
        users = {}
        if result.includes and "users" in result.includes:
            for u in result.includes["users"]:
                users[u.id] = u

        for tweet in result.data:
            total_checked += 1
            if tweet.id in seen or str(tweet.id) in seen:
                continue

            text_lower = tweet.text.lower()

            # Check exclude keywords
            if any(kw in text_lower for kw in MONITOR_EXCLUDE_KEYWORDS):
                seen.add(str(tweet.id))
                continue

            # Check include keywords (relevance filter)
            matched_keywords = [kw for kw in MONITOR_INCLUDE_KEYWORDS if kw in text_lower]

            # Also check high engagement (noteworthy regardless of keywords)
            metrics = tweet.public_metrics or {}
            likes = metrics.get("like_count", 0)
            retweets = metrics.get("retweet_count", 0)
            replies = metrics.get("reply_count", 0)
            high_engagement = (likes >= 50) or (retweets >= 20) or (replies >= 10)

            if matched_keywords or high_engagement:
                author = users.get(tweet.author_id)
                username = f"@{author.username}" if author else f"@{handle}"
                name = author.name if author else handle

                noteworthy.append({
                    "handle": username,
                    "name": name,
                    "text": tweet.text,
                    "likes": likes,
                    "retweets": retweets,
                    "replies": replies,
                    "keywords": matched_keywords,
                    "url": f"https://x.com/{handle}/status/{tweet.id}",
                    "created": str(tweet.created_at) if tweet.created_at else "",
                })

            seen.add(str(tweet.id))

        # Small delay between handles to respect rate limits
        time.sleep(1)

    # Save seen tweets (keep last 5000)
    seen_list = list(seen)
    if len(seen_list) > 5000:
        seen_list = seen_list[-5000:]
    save_json(MONITOR_SEEN_FILE, seen_list)

    log(f"Checked {total_checked} tweets from {len(handles)} accounts, {len(noteworthy)} noteworthy")

    if noteworthy:
        # Build notification
        msg = f"📡 X Monitor: {len(noteworthy)} noteworthy tweet{'s' if len(noteworthy) > 1 else ''}\n\n"
        for item in noteworthy[:5]:
            text_preview = item['text'][:120] + ('...' if len(item['text']) > 120 else '')
            msg += f"{item['handle']} ({item['name']}):\n"
            msg += f'"{text_preview}"\n'
            msg += f"❤️{item['likes']} 🔁{item['retweets']} 💬{item['replies']}"
            if item['keywords']:
                msg += f" | Keywords: {', '.join(item['keywords'][:3])}"
            msg += f"\n{item['url']}\n\n"

        if len(noteworthy) > 5:
            msg += f"...and {len(noteworthy) - 5} more.\n"

        log(msg)
        notify(msg)

        # Save to history
        history = load_json(MONITOR_HISTORY_FILE, {"checks": []})
        history["checks"].insert(0, {
            "timestamp": now().isoformat(),
            "noteworthy_count": len(noteworthy),
            "total_checked": total_checked,
            "items": noteworthy,
        })
        if len(history["checks"]) > 50:
            history["checks"] = history["checks"][:50]
        save_json(MONITOR_HISTORY_FILE, history)


# ── Filtered Stream (Thread) ──────────────────────────────────────────────────

class ClicksStreamListener(tweepy.StreamingClient):
    """Persistent filtered stream that runs in a background thread."""

    def __init__(self, bearer_token, **kwargs):
        super().__init__(bearer_token, wait_on_rate_limit=True, **kwargs)
        self.stream_log = []
        self._lock = threading.Lock()

    def on_tweet(self, tweet):
        """Called when a matching tweet arrives."""
        entry = {
            "id": str(tweet.id),
            "text": tweet.text,
            "author_id": str(tweet.author_id) if tweet.author_id else None,
            "created_at": str(tweet.created_at) if tweet.created_at else None,
            "received_at": now().isoformat(),
        }

        log(f"🔴 STREAM: {tweet.text[:100]}...")

        # Thread-safe append
        with self._lock:
            self.stream_log.append(entry)
            # Persist every 10 tweets
            if len(self.stream_log) % 10 == 0:
                self._save_log()

        # Notify
        notify(f"🔴 Stream match: {tweet.text[:150]}...")

    def on_errors(self, errors):
        log(f"Stream errors: {errors}")

    def on_connection_error(self):
        log("Stream connection error. Will reconnect automatically.")

    def on_disconnect(self):
        log("Stream disconnected.")

    def _save_log(self):
        """Save stream log to file (thread-safe, call with lock held)."""
        existing = load_json(STREAM_LOG_FILE, [])
        existing.extend(self.stream_log)
        # Keep last 1000 entries
        if len(existing) > 1000:
            existing = existing[-1000:]
        save_json(STREAM_LOG_FILE, existing)
        self.stream_log = []

    def flush_log(self):
        """Flush remaining log entries."""
        with self._lock:
            if self.stream_log:
                self._save_log()


def setup_stream_rules(stream_client):
    """Set up filtered stream rules. Deletes old rules first."""
    log("Setting up stream rules...")

    # Get existing rules
    try:
        existing = stream_client.get_rules()
        if existing and existing.data:
            rule_ids = [rule.id for rule in existing.data]
            stream_client.delete_rules(rule_ids)
            log(f"Deleted {len(rule_ids)} old stream rules")
    except Exception as e:
        log(f"Error getting/deleting rules: {e}")

    # Add new rules
    rules_to_add = []
    for i, rule_value in enumerate(STREAM_RULES):
        rules_to_add.append(tweepy.StreamRule(value=rule_value, tag=f"clicks-rule-{i}"))

    try:
        result = stream_client.add_rules(rules_to_add)
        if result and result.data:
            log(f"Added {len(result.data)} stream rules:")
            for rule in result.data:
                log(f"  [{rule.tag}] {rule.value}")
        return True
    except Exception as e:
        log(f"Error adding stream rules: {e}")
        return False


def run_stream_thread(config):
    """Background thread that runs the filtered stream."""
    log("STREAM THREAD: Starting...")

    bearer = config.get("bearerToken", "")
    stream_client = ClicksStreamListener(bearer)

    reconnect_delay = STREAM_RECONNECT_BASE_DELAY
    consecutive_errors = 0

    while running:
        try:
            # Setup rules (only on first connect or after errors)
            if consecutive_errors == 0 or consecutive_errors % 10 == 0:
                setup_stream_rules(stream_client)

            log(f"STREAM THREAD: Connecting to filtered stream...")

            # This blocks until disconnect
            stream_client.filter(
                tweet_fields=["created_at", "author_id", "public_metrics"],
                threaded=False,  # We're already in a thread
            )

        except tweepy.errors.TooManyRequests:
            log("STREAM THREAD: Rate limited (429). Waiting 60s...")
            time.sleep(60)
            consecutive_errors += 1

        except tweepy.errors.Forbidden as e:
            log(f"STREAM THREAD: Forbidden (403): {e}")
            log("STREAM THREAD: Credits may be depleted. Waiting 1h...")
            time.sleep(3600)
            consecutive_errors += 1

        except Exception as e:
            consecutive_errors += 1
            reconnect_delay = min(
                STREAM_RECONNECT_BASE_DELAY * (2 ** min(consecutive_errors, 6)),
                STREAM_RECONNECT_MAX_DELAY
            )
            log(f"STREAM THREAD: Error ({type(e).__name__}: {e}). Reconnecting in {reconnect_delay}s...")
            time.sleep(reconnect_delay)

        else:
            # Clean disconnect, reset backoff
            consecutive_errors = 0
            reconnect_delay = STREAM_RECONNECT_BASE_DELAY

        # Flush any remaining log entries
        stream_client.flush_log()

        if not running:
            break

        log("STREAM THREAD: Will reconnect...")
        time.sleep(2)

    log("STREAM THREAD: Stopped.")


# ── Scheduler ────────────────────────────────────────────────────────────────
def should_run_job(job_name, current_time_str, current_weekday):
    """Check if a job should run at the current time."""
    # Check retry_after for credits
    if job_name in retry_after:
        if now() < retry_after[job_name]:
            return False
        else:
            del retry_after[job_name]

    schedule = SCHEDULE.get(job_name)
    if not schedule:
        return False

    # Deduplicate: only run once per minute
    dedup_key = f"{job_name}_{current_time_str}"
    if dedup_key in executed_jobs:
        return False

    if isinstance(schedule, list):
        return current_time_str in schedule
    elif schedule.startswith("sunday_"):
        target_time = schedule.replace("sunday_", "")
        return current_weekday == 6 and current_time_str == target_time  # 6 = Sunday
    else:
        return current_time_str == schedule


def mark_executed(job_name, current_time_str):
    dedup_key = f"{job_name}_{current_time_str}"
    executed_jobs[dedup_key] = True


def main():
    log("=" * 60)
    log("Clicks Protocol X Bot starting...")
    log(f"Timezone: Europe/Berlin")
    log(f"Base dir: {BASE_DIR}")
    log("=" * 60)

    config = load_config()
    log(f"Config loaded. Account: @{config['username']}")

    # Start filtered stream in background thread
    stream_thread = threading.Thread(
        target=run_stream_thread,
        args=(config,),
        daemon=True,
        name="filtered-stream",
    )
    stream_thread.start()
    log("Filtered stream thread started.")

    # Ensure output dirs/files exist
    REPORTS_DIR.mkdir(exist_ok=True)
    for f in [POST_LOG_FILE, SEEN_MENTIONS_FILE, REPLIED_MENTIONS_FILE]:
        if not f.exists():
            save_json(f, [] if "log" in f.name else {})

    # Map slot names to post job
    post_slots = {
        "post_asia": "post_asia",
        "post_europe": "post_europe",
        "post_us": "post_us",
    }

    log("Scheduler running. Checking every 60 seconds.")
    log(f"Schedule: {json.dumps(SCHEDULE, indent=2)}")

    while running:
        t = now()
        current_time = t.strftime("%H:%M")
        current_weekday = t.weekday()  # 0=Monday, 6=Sunday

        # Clean old dedup keys (keep only current hour)
        current_hour = t.strftime("%H")
        old_keys = [k for k in executed_jobs if not k.endswith(f"_{current_hour}:{t.strftime('%M')}")]
        # Actually, just clean keys older than 2 minutes
        # Simpler: clean all keys every hour
        if t.minute == 0 and t.second < 61:
            executed_jobs.clear()

        # Post jobs
        for slot_name in post_slots:
            if should_run_job(slot_name, current_time, current_weekday):
                try:
                    job_post(config, slot_name)
                except Exception as e:
                    log(f"ERROR in {slot_name}: {type(e).__name__}: {e}")
                mark_executed(slot_name, current_time)

        # Mention check
        if should_run_job("mention_check", current_time, current_weekday):
            try:
                job_mention_check(config)
            except Exception as e:
                log(f"ERROR in mention_check: {type(e).__name__}: {e}")
            mark_executed("mention_check", current_time)

        # Auto-reply
        if should_run_job("auto_reply", current_time, current_weekday):
            try:
                job_auto_reply(config)
            except Exception as e:
                log(f"ERROR in auto_reply: {type(e).__name__}: {e}")
            mark_executed("auto_reply", current_time)

        # Account monitor (x-monitor)
        if should_run_job("account_monitor", current_time, current_weekday):
            try:
                job_account_monitor(config)
            except Exception as e:
                log(f"ERROR in account_monitor: {type(e).__name__}: {e}")
            mark_executed("account_monitor", current_time)

        # Performance report (Sunday 20:00)
        if should_run_job("performance", current_time, current_weekday):
            try:
                job_performance(config)
            except Exception as e:
                log(f"ERROR in performance: {type(e).__name__}: {e}")
            mark_executed("performance", current_time)

        # Sleep until next minute
        time.sleep(60)

    log("Bot stopped gracefully.")


if __name__ == "__main__":
    main()
