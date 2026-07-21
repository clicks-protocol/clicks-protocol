#!/usr/bin/env python3
"""Monitor X Activity API mentions and send reply suggestions to Telegram."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path
from typing import Any


PROJECT_DIR = Path(__file__).resolve().parents[1]
STATE_PATH = PROJECT_DIR / "bots" / "x-activity-state.json"
XURL = "/opt/homebrew/bin/xurl"
OPENCLAW = "/opt/homebrew/bin/openclaw"
X_APP = "clicks"
TELEGRAM_CHAT = "-1003840791947"
TELEGRAM_TOPIC = "49"
CLICKS_USER_ID = "2033251448105115649"
STATE_LOCK = threading.RLock()


def load_state() -> dict[str, Any]:
    try:
        data = json.loads(STATE_PATH.read_text())
        return data if isinstance(data, dict) else {"seen": []}
    except (FileNotFoundError, json.JSONDecodeError):
        return {"seen": []}


def save_state(state: dict[str, Any]) -> None:
    with tempfile.NamedTemporaryFile(
        mode="w", dir=STATE_PATH.parent, prefix="x-activity-state-", suffix=".tmp", delete=False
    ) as handle:
        handle.write(json.dumps(state, indent=2) + "\n")
        temporary = Path(handle.name)
    os.replace(temporary, STATE_PATH)


def run_json(command: list[str], timeout: int = 90) -> dict[str, Any]:
    result = subprocess.run(
        command,
        cwd=PROJECT_DIR,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    output = result.stdout.strip()
    start = output.find("{")
    if start < 0:
        raise RuntimeError("Command returned no JSON")
    return json.loads(output[start:])


def find_first(obj: Any, keys: tuple[str, ...]) -> str:
    if isinstance(obj, dict):
        for key in keys:
            value = obj.get(key)
            if isinstance(value, (str, int)) and str(value).strip():
                return str(value).strip()
        for value in obj.values():
            found = find_first(value, keys)
            if found:
                return found
    elif isinstance(obj, list):
        for value in obj:
            found = find_first(value, keys)
            if found:
                return found
    return ""


def extract_event(event: dict[str, Any]) -> dict[str, str]:
    data = event.get("data", event)
    payload = data.get("payload", data) if isinstance(data, dict) else {}
    event_type = str(data.get("event_type", "unknown")) if isinstance(data, dict) else "unknown"
    matching_rules = event.get("matching_rules", [])
    if any(rule.get("tag") == "clicks-mention-monitor" for rule in matching_rules if isinstance(rule, dict)):
        event_type = "post.mention.create"
    post_id = find_first(payload, ("post_id", "tweet_id", "id"))
    text = find_first(payload, ("text", "full_text"))
    username = find_first(event, ("username", "screen_name"))
    return {"event_type": event_type, "post_id": post_id, "text": text, "username": username}


def enrich_post(item: dict[str, str]) -> dict[str, str]:
    post_id = item["post_id"]
    if not post_id:
        return item
    try:
        response = run_json([XURL, "--app", X_APP, "read", post_id], timeout=30)
    except Exception as exc:
        print(f"read post failed: {exc}", file=sys.stderr, flush=True)
        return item
    data = response.get("data", response)
    if isinstance(data, dict):
        item["text"] = str(data.get("text") or item["text"])
        item["username"] = str(
            data.get("author", {}).get("username", "")
            if isinstance(data.get("author"), dict)
            else item["username"]
        ) or item["username"]
    item["url"] = f"https://x.com/i/status/{post_id}"
    return item


def fallback_suggestion(item: dict[str, str]) -> str:
    username = item.get("username") or "there"
    text = item.get("text", "").lower()
    if any(word in text for word in ("bug", "error", "failed", "broken", "issue")):
        return f"Thanks for flagging this, @{username}. Can you share the exact step, package version, and error message?"
    if "x402" in text:
        return f"Thanks, @{username}. x402 support is planned and not live yet. What seller or agent settlement flow are you looking to support?"
    if any(word in text for word in ("partner", "partnership", "integrat", "collab")):
        return f"Thanks for reaching out, @{username}. What integration or settlement flow do you have in mind?"
    if "?" in text or any(word in text.split() for word in ("how", "what", "why", "where", "when")):
        return f"Good question, @{username}. Which part of the settlement flow are you evaluating? We want to answer against your exact use case."
    if any(word in text for word in ("great", "love", "nice", "cool", "congrats")):
        return f"Appreciate it, @{username}. What agent commerce use case are you working on?"
    return f"Thanks for reaching out, @{username}. What settlement flow are you working on?"


def generate_suggestion(item: dict[str, str], no_ai: bool = False) -> str:
    return fallback_suggestion(item)


def format_alert(item: dict[str, str], suggestion: str) -> str:
    author = f"@{item['username']}" if item.get("username") else "Unbekannter Account"
    text = item.get("text") or "Text konnte nicht aufgeloest werden."
    url = item.get("url") or ""
    return (
        "Neue X-Erwaehnung fuer @ClicksProtocol\n\n"
        f"Von: {author}\n"
        f"Post: {text}\n"
        f"Link: {url}\n\n"
        f"Reply-Vorschlag:\n{suggestion}\n\n"
        "Es wurde nichts auf X veroeffentlicht."
    )


def send_telegram(message: str) -> None:
    result = subprocess.run(
        [
            OPENCLAW,
            "message",
            "send",
            "--channel",
            "telegram",
            "--target",
            TELEGRAM_CHAT,
            "--thread-id",
            TELEGRAM_TOPIC,
            "--message",
            message,
            "--json",
        ],
        cwd=PROJECT_DIR,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())


def process_event(event: dict[str, Any], dry_run: bool = False, no_ai: bool = False) -> bool:
    with STATE_LOCK:
        return _process_event(event, dry_run=dry_run, no_ai=no_ai)


def _process_event(event: dict[str, Any], dry_run: bool = False, no_ai: bool = False) -> bool:
    item = extract_event(event)
    if item["event_type"] != "post.mention.create":
        return False
    event_id = item["post_id"] or json.dumps(event, sort_keys=True)
    state = load_state()
    seen = list(state.get("seen", []))
    if event_id in seen:
        return False
    item = enrich_post(item)
    suggestion = generate_suggestion(item, no_ai=no_ai)
    message = format_alert(item, suggestion)
    if dry_run:
        print(message)
    else:
        send_telegram(message)
    seen.append(event_id)
    state["seen"] = seen[-500:]
    state["last_event_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    save_state(state)
    return True


def poll_mentions() -> int:
    with STATE_LOCK:
        return _poll_mentions()


def _poll_mentions() -> int:
    endpoint = (
        f"/2/users/{CLICKS_USER_ID}/mentions?max_results=10"
        "&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name"
    )
    response = run_json([XURL, "--app", X_APP, "--auth", "oauth2", endpoint], timeout=30)
    posts = response.get("data", [])
    state = load_state()
    state["last_poll_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    state["last_poll_status"] = "ok"
    if not isinstance(posts, list) or not posts:
        save_state(state)
        return 0
    since_id = str(state.get("poll_since_id", ""))
    newest_id = max((str(post.get("id", "")) for post in posts), key=int)
    if not since_id:
        state["poll_since_id"] = newest_id
        save_state(state)
        return 0
    users = response.get("includes", {}).get("users", [])
    processed = 0
    for post in sorted(posts, key=lambda value: int(str(value.get("id", "0")))):
        post_id = str(post.get("id", ""))
        if not post_id or int(post_id) <= int(since_id):
            continue
        event = {
            "data": post,
            "includes": {"users": users},
            "matching_rules": [{"tag": "clicks-mention-monitor"}],
        }
        processed += int(process_event(event))
    state = load_state()
    state["poll_since_id"] = newest_id
    state["last_poll_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    state["last_poll_status"] = "ok"
    save_state(state)
    return processed


def iter_stream_lines(process: subprocess.Popen[str]):
    assert process.stdout is not None
    sse_buffer: list[str] = []
    json_buffer: list[str] = []
    for raw in process.stdout:
        line = raw.strip()
        if not line:
            if sse_buffer:
                payload = "\n".join(sse_buffer)
                try:
                    json.loads(payload)
                    yield payload
                except json.JSONDecodeError:
                    pass
                sse_buffer = []
            continue
        if line.startswith(":"):
            continue
        if line.startswith("data:"):
            sse_buffer.append(line[5:].strip())
            continue
        if json_buffer or line.startswith(("{", "[")):
            json_buffer.append(line)
            payload = "\n".join(json_buffer)
            try:
                json.loads(payload)
            except json.JSONDecodeError:
                continue
            yield payload
            json_buffer = []
    if sse_buffer:
        payload = "\n".join(sse_buffer)
        try:
            json.loads(payload)
            yield payload
        except json.JSONDecodeError:
            pass


def monitor() -> None:
    delay = 2
    while True:
        process = subprocess.Popen(
            [
                XURL,
                "--app",
                X_APP,
                "--auth",
                "app",
                "-s",
                "/2/tweets/search/stream?tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name",
            ],
            cwd=PROJECT_DIR,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=1,
        )
        try:
            for raw in iter_stream_lines(process):
                try:
                    if process_event(json.loads(raw)):
                        delay = 2
                except Exception as exc:
                    print(f"event processing failed: {exc}", file=sys.stderr, flush=True)
        finally:
            process.terminate()
            try:
                _, stderr = process.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                _, stderr = process.communicate()
            if stderr.strip():
                print(stderr.strip(), file=sys.stderr, flush=True)
                with STATE_LOCK:
                    state = load_state()
                    state["last_stream_exit_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    state["last_stream_error"] = stderr.strip()[-500:]
                    save_state(state)
        time.sleep(delay)
        delay = min(delay * 2, 300)


def polling_loop() -> None:
    while True:
        try:
            poll_mentions()
        except Exception as exc:
            print(f"mention polling failed: {exc}", file=sys.stderr, flush=True)
            with STATE_LOCK:
                state = load_state()
                state["last_poll_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                state["last_poll_status"] = f"error: {exc}"[-500:]
                save_state(state)
        time.sleep(60)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--process-json", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-ai", action="store_true")
    args = parser.parse_args()
    if args.process_json:
        process_event(json.loads(args.process_json.read_text()), args.dry_run, args.no_ai)
        return
    threading.Thread(target=polling_loop, name="x-mention-poller", daemon=True).start()
    monitor()


if __name__ == "__main__":
    main()
