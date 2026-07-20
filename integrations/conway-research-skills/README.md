# Conway-Research / skills — Clicks Protocol Integration

This folder contains a contribution-ready skill for the [Conway-Research/skills](https://github.com/Conway-Research/skills) registry.

## Layout

```
conway-research-skills/
├── README.md                   ← this file
├── SKILLS.md.diff              ← entry to merge into upstream SKILLS.md
└── clicks-protocol/
    └── SKILL.md                ← the skill itself, copies verbatim into upstream repo
```

## How to contribute upstream

When David approves the contribution:

```bash
# 1. Fork Conway-Research/skills to clicks-protocol/skills (or operator account)
gh repo fork Conway-Research/skills --clone=true --remote=true

# 2. Apply this skill to the fork
cd skills
mkdir -p clicks-protocol
cp /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/integrations/conway-research-skills/clicks-protocol/SKILL.md \
   clicks-protocol/SKILL.md

# 3. Apply SKILLS.md edit (insert under "## 1. Conway Cloud" block — see SKILLS.md.diff)
# manual edit; the diff doc shows the exact change

# 4. Commit + push + open PR
git checkout -b add-clicks-protocol-skill
git add clicks-protocol/ SKILLS.md
git commit -m "Add clicks-protocol skill — agent treasury layer on Base"
git push origin add-clicks-protocol-skill
gh pr create --title "Add clicks-protocol skill — Treasury layer for Automatons" \
             --body-file ../clicks-protocol/integrations/conway-research-skills/SKILLS.md.diff
```

## Status

- ✅ Skill content drafted (clicks-protocol/SKILL.md)
- ✅ Index entry drafted (SKILLS.md.diff)
- ⏳ Awaiting David go for upstream PR

## Rule #6 compliance

PR creation is an external action that affects a third-party repository.  
Per CLAUDE.md Hard Rule #6 — "Cloudflare-Deploy + externe Posts brauchen explizites Go pro Aktion" — this contribution requires David's explicit confirmation before submission.

LLM authored this draft. Human submits the PR.
