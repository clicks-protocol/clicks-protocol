#!/bin/bash
set -euo pipefail

# Autoresearch Benchmark: ADO Score (Agent Discovery Optimization)
# Misst wie gut README.md für AI-Agent-Discovery optimiert ist

# Pre-check: README existiert?
if [ ! -f "README.md" ]; then
    echo "README.md not found"
    exit 1
fi

# ADO Score messen (schreibt auch in experiments.jsonl)
OUTPUT=$(python3 ado-test.py 2>&1)

# Score extrahieren
TOTAL=$(echo "$OUTPUT" | grep "TOTAL ADO SCORE" | grep -o '[0-9]*' | head -1)

# Einzelscores extrahieren
KEYWORDS=$(echo "$OUTPUT" | grep "Keyword Coverage" | grep -o '[0-9]*/20' | head -1 | cut -d/ -f1)
CODE=$(echo "$OUTPUT" | grep "Code Example" | grep -o '[0-9]*/20' | head -1 | cut -d/ -f1)
FRAMEWORKS=$(echo "$OUTPUT" | grep "Framework Signals" | grep -o '[0-9]*/20' | head -1 | cut -d/ -f1)
PROBLEM=$(echo "$OUTPUT" | grep "Problem Framing" | grep -o '[0-9]*/20' | head -1 | cut -d/ -f1)
STRUCTURE=$(echo "$OUTPUT" | grep "Structure Quality" | grep -o '[0-9]*/20' | head -1 | cut -d/ -f1)

# METRIC-Format
echo "METRIC ado_score=$TOTAL"
echo "METRIC keyword_coverage=$KEYWORDS"
echo "METRIC code_example=$CODE"
echo "METRIC framework_signals=$FRAMEWORKS"
echo "METRIC problem_framing=$PROBLEM"
echo "METRIC structure_quality=$STRUCTURE"
