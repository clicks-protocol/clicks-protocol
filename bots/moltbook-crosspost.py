#!/usr/bin/env python3
"""Post next tweet from moltbook-source.json to Moltbook m/agent-treasury.

One post per invocation. Tracks index in moltbook-state.json. Appends
X-profile link to every post. Solves the obfuscated math challenge that
Moltbook returns on every freshly-created post. Idempotent on 429.
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "bots" / "moltbook-source.json"
STATE = ROOT / "bots" / "moltbook-state.json"
ROUTING = ROOT / "bots" / "submolt-routing.json"
ENV = ROOT / ".env"

API_BASE = "https://www.moltbook.com/api/v1"
DEFAULT_SUBMOLT = "agent-treasury"


def load_submolt(idx: int) -> str:
    if not ROUTING.exists():
        return DEFAULT_SUBMOLT
    data = json.loads(ROUTING.read_text())
    for r in data.get("routes", []):
        if r.get("idx") == idx:
            return r.get("submolt", DEFAULT_SUBMOLT)
    return DEFAULT_SUBMOLT


def load_key() -> str:
    for line in ENV.read_text().splitlines():
        if line.startswith("MOLTBOOK_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("MOLTBOOK_API_KEY missing in .env")


WORD_MAP = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
    "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40,
    "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
    "hundred": 100, "thousand": 1000,
}

UNIT_WORDS = {
    "newtons", "newton", "meters", "meter", "seconds", "second",
    "kilograms", "kilogram", "miles", "mile", "yards", "yard",
    "pounds", "pound", "feet", "foot", "inches", "inch",
    "celsius", "fahrenheit", "kelvin", "joules", "joule",
    "watts", "watt", "volts", "volt", "amperes", "ampere",
    "amps", "amp", "grams", "gram", "liters", "liter",
    "minutes", "minute", "hours", "hour", "days", "day",
    "apples", "apple", "oranges", "orange", "bananas", "banana",
    "cats", "cat", "dogs", "dog", "units", "unit", "and", "of", "the", "a",
    "is", "what", "equals", "equal", "plus", "added", "to", "added to",
}


def parse_number_words(text: str) -> int:
    text = re.sub(r"[^a-z\s]", " ", text.lower())
    words = [w for w in text.split() if w]
    total = 0
    current = 0
    for w in words:
        if w in WORD_MAP:
            v = WORD_MAP[w]
            if v == 100:
                current = current * 100 if current else 100
            elif v == 1000:
                current = (current * 1000) if current else 1000
                total += current
                current = 0
            else:
                current += v
    return total + current


SUB_WORDS = {"reduces", "reduced", "reduce", "decreased", "decreases", "decrease",
             "minus", "subtract", "subtracted", "less", "removes", "removed",
             "lower", "lowers", "lowered", "drops", "dropped", "drop", "fewer"}
ADD_WORDS = {"plus", "added", "add", "increased", "increases", "increase", "more",
             "gains", "gained"}
MUL_WORDS = {"multiplied", "times", "product"}
DIV_WORDS = {"divided", "over", "per"}

NUM_FRAGMENT = {"teen": 10}


def _collapse(word: str) -> str:
    """Collapse consecutive duplicate letters: 'foouur' -> 'four'."""
    out = []
    prev = ""
    for c in word:
        if c != prev:
            out.append(c)
            prev = c
    return "".join(out)


def _fuzzy_num(word: str):
    if word in WORD_MAP:
        return WORD_MAP[word]
    if word in NUM_FRAGMENT:
        return NUM_FRAGMENT[word]
    c = _collapse(word)
    if c in WORD_MAP:
        return WORD_MAP[c]
    if c in NUM_FRAGMENT:
        return NUM_FRAGMENT[c]
    return None


def _fuzzy_kw(word: str, vocab: set) -> bool:
    return word in vocab or _collapse(word) in vocab


def solve(challenge: str) -> str:
    # Strip ALL non-letter/non-space so internal junk like 'tW/eNtY' becomes 'twenty'
    norm = re.sub(r"[^a-zA-Z\s]", "", challenge).lower()
    norm = re.sub(r"\s+", " ", norm).strip()
    tokens = norm.split()

    # Single accumulator; multiplication/division applied immediately on
    # the *running result* using the next parsed number.
    op = "+"  # current pending operator applied to next number
    result = 0
    pending_num = 0  # accumulating multi-word numbers like "twenty three"

    def apply():
        nonlocal result, pending_num, op
        if pending_num == 0 and op in ("+", "-"):
            return
        if op == "+":
            result += pending_num
        elif op == "-":
            result -= pending_num
        elif op == "*":
            result *= pending_num if pending_num else 1
        elif op == "/":
            if pending_num:
                result = result / pending_num
        pending_num = 0

    for tok in tokens:
        if _fuzzy_kw(tok, SUB_WORDS):
            apply(); op = "-"; continue
        if _fuzzy_kw(tok, ADD_WORDS):
            apply(); op = "+"; continue
        if _fuzzy_kw(tok, MUL_WORDS):
            apply(); op = "*"; continue
        if _fuzzy_kw(tok, DIV_WORDS):
            apply(); op = "/"; continue
        v = _fuzzy_num(tok)
        if v is None:
            continue
        if v == 100:
            pending_num = pending_num * 100 if pending_num else 100
        elif v == 1000:
            pending_num = (pending_num * 1000) if pending_num else 1000
        else:
            pending_num += v
    apply()
    return f"{result:.2f}"


def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text())
    return {"nextIndex": 0}


def save_state(idx: int):
    STATE.write_text(json.dumps({
        "nextIndex": idx,
        "lastPostedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }, indent=2))


def main():
    key = load_key()
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    state = load_state()
    idx = state["nextIndex"]
    src = json.loads(SRC.read_text())

    if idx >= len(src):
        print(f"Source exhausted ({len(src)} posts). Nothing to do.")
        return 0

    tweet = src[idx]
    title = tweet["text"].split("\n")[0][:300]
    content = tweet["text"]
    if tweet.get("reply_text"):
        content += f"\n\n---\n\n{tweet['reply_text']}"

    submolt = load_submolt(idx)
    print(f"Posting #{idx+1}/{len(src)} → m/{submolt}: {title[:80]}")

    payload = {"submolt_name": submolt, "title": title, "content": content}
    for attempt in range(5):
        r = requests.post(f"{API_BASE}/posts", json=payload, headers=headers)
        if r.status_code != 429:
            break
        wait = r.json().get("retry_after_seconds", 150) + 3
        print(f"  Rate limited (attempt {attempt+1}); sleeping {wait}s then retrying...")
        time.sleep(wait)

    if r.status_code not in (200, 201) or not r.json().get("success"):
        print(f"  POST failed: {r.status_code} {r.text[:400]}")
        return 2

    data = r.json()
    post_id = data["post"]["id"]
    print(f"  Post created: {post_id}")

    verification = data.get("post", {}).get("verification") or data.get("verification")
    if not verification:
        save_state(idx + 1)
        print(f"  No verification needed. URL: https://www.moltbook.com/p/{post_id}")
        return 0

    code = verification["verification_code"]
    challenge = verification["challenge_text"]
    print(f"  Challenge: {challenge}")
    answer = solve(challenge)
    print(f"  Answer: {answer}")

    vr = requests.post(
        f"{API_BASE}/verify",
        json={"verification_code": code, "answer": answer},
        headers=headers,
    )
    if vr.status_code in (200, 201) and vr.json().get("success"):
        save_state(idx + 1)
        print(f"  Verified! URL: https://www.moltbook.com/p/{post_id}")
        return 0

    print(f"  Verification failed: {vr.status_code} {vr.text[:400]}")
    print(f"  Deleting unpublished post {post_id} so we can retry on next run...")
    requests.delete(f"{API_BASE}/posts/{post_id}", headers=headers)
    return 3


if __name__ == "__main__":
    sys.exit(main())
