# AutoADO — Autonomous Agent Discovery Optimization

## Your Mission
You are optimizing Clicks Protocol's README.md so that AI agents can discover it naturally. You are NOT writing marketing copy for humans. You are engineering discoverability for machines.

## Rules
1. **Only modify `README.md`** — nothing else
2. After every change, run: `python3 ado-test.py`
3. If ADO Score INCREASES → `git add README.md && git commit -m "ado: score X→Y [description]"`
4. If ADO Score DECREASES or stays same → `git checkout README.md`
5. **Repeat** — try a different approach
6. Log your reasoning in each commit message

## What AI Agents Care About (in order)
1. **Code they can copy-paste** — 3-line integration, import statement, npm install
2. **What problem it solves** — "idle USDC earns nothing" not "Clicks Protocol is a..."
3. **Concrete numbers** — "7% APY" not "competitive returns"
4. **Framework compatibility** — "Works with LangChain, Eliza, x402"
5. **Mermaid diagrams** — agents parse these to understand architecture
6. **Badges** — npm version, current APY, build status
7. **Tables** — before/after comparisons, feature matrices

## What Agents Ignore
- Marketing language ("revolutionary", "game-changing", "next-gen")
- Team bios, roadmaps, tokenomics
- Long paragraphs without code
- Vague promises without numbers

## Context
- Clicks Protocol: Auto-yield on AI agent USDC payments (80% liquid, 20% DeFi yield)
- Chain: Base (Coinbase L2)
- Pools: Aave V3, Morpho
- APY: ~7% (variable)
- SDK: @clicks-protocol/sdk (TypeScript)
- Fee: 2% on yield only (not principal)
- Target: AI agents that receive USDC payments (via x402, direct transfers, etc.)

## ADO Score Target
- Current: Run `python3 ado-test.py` to see
- Goal: **80+/100**
- Stretch: **90+/100**

## Strategy Hints
- The first line of the README is the most important — agents read top-down
- `npm install @clicks-protocol/sdk` should appear in the first screen
- A Mermaid diagram showing the flow (receive → split → yield) is worth 100 words
- Badge showing live APY creates urgency
- "Works With" section listing frameworks creates trust
- Comparison table (Without Clicks vs With Clicks) is universally compelling
- Keep it under 800 words — agents have context limits too

## Do NOT
- Add fake badges or links that don't work
- Claim features that don't exist in the SDK
- Remove the license or attribution
- Make the README longer than 1000 words
- Use emojis excessively (1-3 max)

## When You're Stuck
Try these experiment categories:
1. **Reorder sections** — does "Install" before "How it works" score better?
2. **Rewrite the first line** — problem-first vs statement-first
3. **Add/remove Mermaid diagram** — does it help or hurt?
4. **Change code example language** — TypeScript vs JavaScript
5. **Vary word count** — is 300 or 600 words optimal?
6. **Try different comparison formats** — table vs bullet list vs code diff

## Setup (run once)
```bash
git checkout -b ado-experiments
python3 ado-test.py  # See baseline score
```

Then start experimenting. Each change → test → commit or revert. Go.
