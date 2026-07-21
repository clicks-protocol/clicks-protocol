# Moltbook Agent Commerce Research Loop

## Purpose

Use Moltbook as a continuous source of evidence about real agent-commerce workflows, failure modes and missing infrastructure. Engagement is secondary. The goal is to convert repeated, verified problems into better product decisions and bounded pilots.

## Flow

1. The existing monitor captures every new comment in full.
2. Raw evidence is appended to `research/moltbook-signals.jsonl`.
3. `bots/moltbook-research-report.py` groups recurring themes and counts independent authors.
4. A signal becomes a validation candidate only when one of these conditions is met:
   - the same problem appears independently from at least three authors;
   - the author demonstrates it in a real economic workflow;
   - a bounded pilot reproduces it.
5. Validation candidates are checked against the current code and product position.
6. Suitable builders receive an individual invitation to a Clicks pilot and, when relevant, the authorized referral-attribution flow.
7. Only validated findings enter the product backlog.

## Evidence levels

- `single_signal`: one comment or opinion.
- `repeated_signal`: independently raised by multiple authors.
- `real_workflow`: supported by an actual payment or settlement flow.
- `pilot_confirmed`: reproduced in a bounded Clicks pilot.
- `product_validated`: code and product review confirm that Clicks should solve it.

## Guardrails

- Do not promise roadmap capabilities as live.
- Do not treat popularity or karma as product evidence.
- Do not copy the same referral pitch into every reply.
- Do not automatically create backlog items from comments.
- Do not expose wallet data, secrets or private transaction context.
- Do not perform any payment or contract write as part of research.

## Weekly output

The review must answer:

- Which problems repeated across independent authors?
- Which signals came from real economic activity?
- Which builders are credible pilot candidates?
- Which claims conflict with the current implementation?
- What should be observed, validated, built or explicitly rejected?

Generate the current report with:

```bash
python3 bots/moltbook-research-report.py
```
