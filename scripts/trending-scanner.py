#!/usr/bin/env python3
"""
Clicks Protocol GitHub Trending Scanner (v2 - optimized)

Scans GitHub for trending repos relevant to Clicks Protocol.
3 time windows, 8 keyword queries, no README fetching (fast).
"""

import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import quote

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# 8 focused queries (not keywords x categories = explosion)
QUERIES = [
    "mcp server",
    "awesome mcp",
    "ai agent framework",
    "defi agent",
    "x402",
    "awesome defi",
    "awesome base chain",
    "agent treasury OR agent yield OR agent payment",
]

MIN_STARS = {"today": 5, "week": 30, "month": 80}

RELEVANCE_WORDS = [
    "mcp", "defi", "yield", "treasury", "agent", "x402", "base",
    "usdc", "morpho", "aave", "crypto", "blockchain", "web3",
    "finance", "payment", "wallet", "autonomous", "awesome",
    "curated", "list", "framework", "sdk", "integration",
]


def github_search(query, per_page=5):
    """Search GitHub repos."""
    url = f"https://api.github.com/search/repositories?q={quote(query)}&sort=stars&order=desc&per_page={per_page}"
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    req = Request(url, headers=headers)
    try:
        resp = urlopen(req, timeout=15)
        return json.loads(resp.read().decode())
    except HTTPError as e:
        print(f"  API error {e.code}: {query[:40]}", file=sys.stderr)
        return {"items": []}
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return {"items": []}


def score_repo(repo):
    """Quick score without README fetch."""
    score = 0
    desc = (repo.get("description") or "").lower()
    topics = " ".join(repo.get("topics", []))
    name = repo.get("name", "").lower()
    full = f"{desc} {topics} {name}"

    stars = repo.get("stargazers_count", 0)
    if stars >= 10000: score += 30
    elif stars >= 1000: score += 20
    elif stars >= 100: score += 10
    elif stars >= 10: score += 5

    for kw in RELEVANCE_WORDS:
        if kw in full:
            score += 4

    if "clicks-protocol" in full or "clicks protocol" in full:
        score -= 100  # Already listed

    return min(score, 100)


def classify(score, desc):
    desc = (desc or "").lower()
    if score >= 50:
        if any(x in desc for x in ["awesome", "curated", "list", "collection"]):
            return "PR_LISTING"
        elif any(x in desc for x in ["framework", "sdk", "example"]):
            return "PR_EXAMPLE"
        return "INVESTIGATE"
    elif score >= 30:
        return "MONITOR"
    return "SKIP"


def scan():
    now = datetime.now(timezone.utc)
    windows = {
        "today": now.strftime("%Y-%m-%d"),
        "week": (now - timedelta(days=7)).strftime("%Y-%m-%d"),
        "month": (now - timedelta(days=30)).strftime("%Y-%m-%d"),
    }

    seen = {}
    api_calls = 0

    for window_name, since in windows.items():
        min_s = MIN_STARS[window_name]
        for q in QUERIES:
            full_q = f"{q} created:>={since} stars:>={min_s}"
            data = github_search(full_q, per_page=5)
            api_calls += 1
            time.sleep(2.2)  # 30 req/min limit = 1 per 2s

            for repo in data.get("items", []):
                fn = repo["full_name"]
                if fn in seen:
                    continue
                sc = score_repo(repo)
                action = classify(sc, repo.get("description"))
                if action == "SKIP":
                    seen[fn] = None
                    continue

                seen[fn] = {
                    "repo": fn,
                    "stars": repo["stargazers_count"],
                    "desc": (repo.get("description") or "")[:100],
                    "topics": repo.get("topics", [])[:5],
                    "url": repo["html_url"],
                    "score": sc,
                    "action": action,
                    "window": window_name,
                    "created": repo.get("created_at", "")[:10],
                }

    results = sorted(
        [r for r in seen.values() if r is not None],
        key=lambda x: x["score"],
        reverse=True,
    )

    return {
        "date": now.strftime("%Y-%m-%d %H:%M"),
        "api_calls": api_calls,
        "scanned": len(seen),
        "relevant": len(results),
        "results": results[:15],
    }


def format_report(data):
    if not data["results"]:
        return None

    lines = [
        f"🔍 Clicks Trending Scanner — {data['date']}",
        f"Scanned: {data['scanned']} repos | Relevant: {data['relevant']}",
        "",
    ]
    for r in data["results"][:10]:
        emoji = {"PR_LISTING": "🎯", "PR_EXAMPLE": "📦", "INVESTIGATE": "🔎", "MONITOR": "👀"}.get(r["action"], "❓")
        lines.append(f"{emoji} [{r['score']}] ⭐{r['stars']} {r['repo']}")
        lines.append(f"  {r['desc']}")
        lines.append(f"  {r['action']} | {r['window']} | {r['url']}")
        lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    data = scan()

    # Save JSON
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "..", "marketing", "reports", "trending")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"scan-{data['date'][:10]}.json")
    with open(out_path, "w") as f:
        json.dump(data, f, indent=2)

    report = format_report(data)
    if report:
        print(report)
    else:
        print("NO_RESULTS")
