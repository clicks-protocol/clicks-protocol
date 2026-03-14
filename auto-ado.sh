#!/bin/bash
# AutoADO Runner — Autonomous README optimization loop
# Pattern: Sequential Pipeline + De-Sloppify + Completion Signal
# Inspired by: ECC autonomous-loops, Karpathy autoresearch
#
# Usage: ./auto-ado.sh [--max-runs 50] [--target-score 95]
#
# Requires: claude CLI (Claude Code)

set -euo pipefail

# === Config ===
MAX_RUNS="${1:-50}"
TARGET_SCORE="${2:-95}"
STAGNATION_LIMIT=5  # Stop after N runs without improvement
NOTES_FILE="SHARED_TASK_NOTES.md"
EXPERIMENTS_FILE="experiments.jsonl"
BRANCH="ado-experiments"

# Parse named args
while [[ $# -gt 0 ]]; do
  case $1 in
    --max-runs) MAX_RUNS="$2"; shift 2;;
    --target-score) TARGET_SCORE="$2"; shift 2;;
    *) shift;;
  esac
done

# === Colors ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[AutoADO]${NC} $1"; }
success() { echo -e "${GREEN}[AutoADO]${NC} $1"; }
warn() { echo -e "${YELLOW}[AutoADO]${NC} $1"; }
error() { echo -e "${RED}[AutoADO]${NC} $1"; }

# === Setup ===
log "Starting AutoADO Runner"
log "Config: max_runs=$MAX_RUNS, target_score=$TARGET_SCORE, stagnation_limit=$STAGNATION_LIMIT"

# Create branch if not exists
if ! git show-ref --quiet "refs/heads/$BRANCH"; then
  git checkout -b "$BRANCH"
  log "Created branch: $BRANCH"
else
  git checkout "$BRANCH"
  log "Switched to branch: $BRANCH"
fi

# Get baseline score
log "Measuring baseline..."
BASELINE=$(python3 ado-test.py 2>&1 | grep "TOTAL ADO SCORE" | grep -oE '[0-9]+/100' | grep -oE '^[0-9]+')
log "Baseline ADO Score: $BASELINE/100"

# Init shared notes
cat > "$NOTES_FILE" << EOF
# AutoADO Shared Task Notes
## Current Score: $BASELINE/100
## Target: $TARGET_SCORE/100
## Best Score: $BASELINE

## Experiment Log
- Baseline: $BASELINE/100

## What Worked


## What Didn't Work


## Next Ideas
- Try reordering sections (Install before How it Works)
- Rewrite first line as problem statement
- Add more framework references (LangChain, Eliza, CrewAI)
- Vary code example length
- Test with/without Mermaid diagram
EOF

# === Main Loop ===
best_score=$BASELINE
stagnation_count=0
run=0

while [ $run -lt $MAX_RUNS ]; do
  run=$((run + 1))
  log "━━━ Run $run/$MAX_RUNS (best: $best_score, stagnation: $stagnation_count/$STAGNATION_LIMIT) ━━━"

  # Step 1: Agent modifies README
  log "Step 1: Agent experimenting..."
  claude -p --print --permission-mode bypassPermissions \
    "Read program.md for your instructions. Read $NOTES_FILE for context from previous runs.
     
     Current ADO Score: $best_score/100. Target: $TARGET_SCORE/100.
     
     Make ONE focused change to README.md to improve the ADO score.
     Pick a specific experiment from the 'Next Ideas' in $NOTES_FILE, or try something new.
     
     After changing README.md, run: python3 ado-test.py
     
     Then update $NOTES_FILE:
     - Update 'Current Score' with the new score
     - Add the experiment to 'Experiment Log' with result
     - Add to 'What Worked' or 'What Didn't Work'
     - Update 'Next Ideas' based on what you learned
     
     If score improved: git add README.md $NOTES_FILE && git commit -m 'ado: score $best_score→[new] [what you changed]'
     If score did NOT improve: git checkout README.md (keep the notes update)" \
    2>/dev/null || true

  # Step 2: Measure new score
  NEW_SCORE=$(python3 ado-test.py 2>&1 | grep "TOTAL ADO SCORE" | grep -oE '[0-9]+/100' | grep -oE '^[0-9]+' || echo "$best_score")

  if [ "$NEW_SCORE" -gt "$best_score" ]; then
    success "Score improved: $best_score → $NEW_SCORE"
    best_score=$NEW_SCORE
    stagnation_count=0
  elif [ "$NEW_SCORE" -eq "$best_score" ]; then
    warn "Score unchanged: $NEW_SCORE"
    stagnation_count=$((stagnation_count + 1))
  else
    warn "Score decreased: $best_score → $NEW_SCORE (reverting)"
    git checkout README.md 2>/dev/null || true
    stagnation_count=$((stagnation_count + 1))
  fi

  # Check completion conditions
  if [ "$best_score" -ge "$TARGET_SCORE" ]; then
    success "🎯 Target score reached: $best_score/$TARGET_SCORE"
    break
  fi

  if [ "$stagnation_count" -ge "$STAGNATION_LIMIT" ]; then
    warn "⏹️  Stagnation limit reached ($STAGNATION_LIMIT runs without improvement)"
    break
  fi

  log "Sleeping 5s before next run..."
  sleep 5
done

# === Summary ===
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "AutoADO Complete"
log "Runs: $run"
log "Baseline: $BASELINE → Final: $best_score"
log "Improvement: +$((best_score - BASELINE)) points"
log "Branch: $BRANCH"
log "Notes: $NOTES_FILE"
log "Experiments: $EXPERIMENTS_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Show last 5 experiments
if [ -f "$EXPERIMENTS_FILE" ]; then
  echo ""
  log "Last 5 experiments:"
  tail -5 "$EXPERIMENTS_FILE" | python3 -c "
import sys, json
for line in sys.stdin:
    d = json.loads(line)
    print(f\"  {d['timestamp'][:16]} | Score: {d['total_score']} | Words: {d['readme_words']}\")
" 2>/dev/null || true
fi
