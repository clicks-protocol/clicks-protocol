#!/usr/bin/env python3
"""Monitor Clicks Protocol Moltbook posts for new comments.

Reads tracked post IDs from bots/moltbook-posts.json and stores seen comment
state locally in bots/moltbook-monitor-state.json. No output starting with
NEW_COMMENTS means there is nothing worth notifying.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / ".env"
POSTS = ROOT / "bots" / "moltbook-posts.json"
STATE = ROOT / "bots" / "moltbook-monitor-state.json"
RESEARCH_INBOX = ROOT / "research" / "moltbook-signals.jsonl"
API_BASE = "https://www.moltbook.com/api/v1"


def load_key() -> str:
    if "MOLTBOOK_API_KEY" in os.environ:
        return os.environ["MOLTBOOK_API_KEY"].strip()
    if ENV.exists():
        for line in ENV.read_text().splitlines():
            if line.startswith("MOLTBOOK_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("MOLTBOOK_API_KEY missing")


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text())


def save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n")


def extract_posts():
    data = load_json(POSTS, {"posts": []})
    posts = data.get("posts", [])
    clean = []
    for post in posts:
        post_id = post.get("id")
        if not post_id:
            continue
        clean.append({
            "id": post_id,
            "url": post.get("url") or f"https://www.moltbook.com/p/{post_id}",
            "submolt": post.get("submolt", "unknown"),
            "title": post.get("title", "(untitled)"),
        })
    return clean


def get_json(session: requests.Session, path: str):
    r = session.get(f"{API_BASE}{path}", timeout=20)
    if r.status_code != 200:
        return {"success": False, "status_code": r.status_code, "body": r.text[:400]}
    return r.json()


def normalize_comment(raw):
    author = raw.get("author") or raw.get("user") or {}
    if isinstance(author, dict):
        author_name = author.get("username") or author.get("name") or author.get("display_name")
    else:
        author_name = str(author)

    text = raw.get("content") or raw.get("text") or raw.get("body") or ""
    text = re.sub(r"\s+", " ", str(text)).strip()

    return {
        "id": str(raw.get("id") or raw.get("comment_id") or raw.get("uuid") or ""),
        "author": author_name or "unknown",
        "text": text,
        "createdAt": raw.get("created_at") or raw.get("createdAt") or raw.get("timestamp"),
    }


def append_research_signals(signals):
    """Append complete, deduplicated comments to the local research inbox."""
    if not signals:
        return

    RESEARCH_INBOX.parent.mkdir(parents=True, exist_ok=True)
    existing_ids = set()
    if RESEARCH_INBOX.exists():
        for line in RESEARCH_INBOX.read_text().splitlines():
            try:
                entry = json.loads(line)
                if entry.get("commentId"):
                    existing_ids.add(entry["commentId"])
            except json.JSONDecodeError:
                continue

    captured_at = datetime.now(timezone.utc).isoformat()
    with RESEARCH_INBOX.open("a") as handle:
        for signal in signals:
            if signal["commentId"] in existing_ids:
                continue
            signal["capturedAt"] = captured_at
            handle.write(json.dumps(signal, ensure_ascii=False) + "\n")
            existing_ids.add(signal["commentId"])


def main():
    quiet = "--quiet" in sys.argv
    backfill = "--backfill-research" in sys.argv
    posts = extract_posts()
    if not posts:
        if not quiet:
            print("NO_UPDATES no tracked Moltbook posts yet")
        return 0

    key = load_key()
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {key}", "Accept": "application/json"})

    state = load_json(STATE, {"posts": {}})
    by_post = state.setdefault("posts", {})
    alerts = []
    research_signals = []

    for post in posts:
        post_id = post["id"]
        meta = get_json(session, f"/posts/{post_id}")
        comments = get_json(session, f"/posts/{post_id}/comments")
        if not comments.get("success"):
            continue

        raw_comments = comments.get("comments") or []
        normalized = [normalize_comment(c) for c in raw_comments]
        normalized = [c for c in normalized if c["id"]]

        previous = by_post.setdefault(post_id, {"seenCommentIds": [], "lastCommentCount": 0})
        seen = set(previous.get("seenCommentIds", []))
        new_comments = [c for c in normalized if c["id"] not in seen]

        count = meta.get("post", {}).get("comment_count")
        if count is None:
            count = len(normalized)

        previous["seenCommentIds"] = sorted(seen.union(c["id"] for c in normalized))
        previous["lastCommentCount"] = count
        previous["title"] = post["title"]
        previous["url"] = post["url"]
        previous["submolt"] = post["submolt"]

        research_comments = normalized if backfill else new_comments
        for comment in research_comments:
            research_signals.append({
                "source": "moltbook_comment",
                "commentId": comment["id"],
                "author": comment["author"],
                "text": comment["text"],
                "createdAt": comment["createdAt"],
                "postId": post_id,
                "postTitle": post["title"],
                "postUrl": post["url"],
                "submolt": post["submolt"],
                "status": "new",
                "evidenceLevel": "single_signal",
                "pilotCandidate": False,
                "tags": [],
            })

        if new_comments:
            alerts.append({"post": post, "comments": new_comments, "count": count})

    append_research_signals(research_signals)
    save_json(STATE, state)

    if not alerts:
        if not quiet:
            print(f"NO_UPDATES checked {len(posts)} Moltbook posts; no new comments")
        return 0

    print(f"NEW_COMMENTS {sum(len(a['comments']) for a in alerts)} comments on {len(alerts)} posts")
    for alert in alerts:
        post = alert["post"]
        print(f"- {post['submolt']}: {post['title']}")
        print(f"  {post['url']}")
        for comment in alert["comments"]:
            preview = comment["text"][:240]
            print(f"  {comment['author']}: {preview}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
