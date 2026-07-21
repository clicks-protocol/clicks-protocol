#!/usr/bin/env python3
"""Build a compact evidence report from the Moltbook research inbox."""

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "research" / "moltbook-signals.jsonl"
REPORT = ROOT / "research" / "MOLTBOOK-RESEARCH-REPORT.md"

THEMES = {
    "unknown settlement": ("unknown_settled", "unknown settled", "timeout", "reconcile"),
    "idempotency": ("idempot", "duplicate", "double pay", "retry"),
    "policy provenance": ("policy", "authorized", "authorised", "budget", "intent"),
    "receipt trail": ("receipt", "evidence", "witness", "audit"),
    "delivery proof": ("delivery", "merchant", "got what", "counterparty"),
    "attribution": ("attribution", "referral", "revenue source", "split"),
    "privacy": ("privacy", "private", "disclosure", "encrypted"),
}


def load_entries():
    if not INBOX.exists():
        return []
    entries = []
    for line in INBOX.read_text().splitlines():
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def matching_themes(text):
    lowered = text.lower()
    return [name for name, terms in THEMES.items() if any(term in lowered for term in terms)]


def main():
    entries = load_entries()
    theme_counts = Counter()
    theme_authors = defaultdict(set)
    theme_examples = defaultdict(list)

    for entry in entries:
        for theme in matching_themes(entry.get("text", "")):
            theme_counts[theme] += 1
            theme_authors[theme].add(entry.get("author", "unknown"))
            if len(theme_examples[theme]) < 3:
                theme_examples[theme].append(entry)

    lines = [
        "# Moltbook Agent Commerce Research Report",
        "",
        f"> Generated: {datetime.now(timezone.utc).isoformat()}",
        f"> Evidence records: {len(entries)}",
        "",
        "## Decision rule",
        "",
        "A comment is a signal, not a roadmap item. Promote a problem only after it has either appeared independently from at least three authors, been demonstrated in a real economic flow, or been confirmed by a pilot test.",
        "",
        "## Repeated themes",
        "",
        "| Theme | Signals | Independent authors | Status |",
        "|---|---:|---:|---|",
    ]

    for theme, count in theme_counts.most_common():
        authors = len(theme_authors[theme])
        status = "validate" if authors >= 3 else "observe"
        lines.append(f"| {theme} | {count} | {authors} | {status} |")

    if not theme_counts:
        lines.append("| No classified themes yet | 0 | 0 | observe |")

    lines.extend(["", "## Evidence excerpts", ""])
    for theme, _count in theme_counts.most_common():
        lines.append(f"### {theme}")
        lines.append("")
        for entry in theme_examples[theme]:
            excerpt = " ".join(entry.get("text", "").split())[:280]
            lines.append(f"- **{entry.get('author', 'unknown')}**: {excerpt} ([source]({entry.get('postUrl', '')}))")
        lines.append("")

    lines.extend([
        "## Weekly review",
        "",
        "For every theme marked `validate`, verify the original thread, identify the concrete economic workflow, check the current code, invite a suitable builder to a bounded pilot, and record the result before changing the roadmap.",
        "",
    ])

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines))
    print(f"WROTE {REPORT} with {len(entries)} evidence records")


if __name__ == "__main__":
    main()
