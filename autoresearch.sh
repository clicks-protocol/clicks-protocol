#!/bin/bash
set -euo pipefail

# Autoresearch Benchmark: Clicks Protocol Gas Optimization

# Pre-check: Solidity kompiliert?
npx hardhat compile --quiet 2>/dev/null || { echo "COMPILE FAILED"; exit 1; }

# Tests mit Gas Reporter, ANSI-Farben strippen
OUTPUT=$(REPORT_GAS=true npx hardhat test 2>&1 | sed 's/\x1b\[[0-9;]*m//g')

# Check: Alle Tests bestanden?
if ! echo "$OUTPUT" | grep -q "passing"; then
    echo "TESTS FAILED"
    echo "$OUTPUT" | tail -20
    exit 1
fi

FAILING=$(echo "$OUTPUT" | grep -o '[0-9]* failing' | head -1 || true)
if [ -n "$FAILING" ]; then
    echo "TESTS FAILED: $FAILING"
    exit 1
fi

# Gas-Metriken extrahieren (avg gas = Feld 4 nach ·)
# Die Zeilen sehen so aus: |  Contract  ·  function  ·  min  ·  max  ·  avg  ·  calls  ·  usd  │
# grep exakt die Funktion, nimm nur die erste Zeile, extrahiere Feld 4
RECEIVE=$(echo "$OUTPUT" | grep "receivePayment" | head -1 | awk -F'·' '{print $5}' | tr -cd '0-9')
WITHDRAW=$(echo "$OUTPUT" | grep "withdrawYield" | head -1 | awk -F'·' '{print $5}' | tr -cd '0-9')
REGISTER=$(echo "$OUTPUT" | grep "registerAgent" | head -1 | awk -F'·' '{print $5}' | tr -cd '0-9')

# Fallback
RECEIVE=${RECEIVE:-0}
WITHDRAW=${WITHDRAW:-0}
REGISTER=${REGISTER:-0}

# Hot-Path Score: gewichtet nach Aufrufhäufigkeit
# receivePayment x10 (jede Zahlung), withdrawYield x3, registerAgent x1
TOTAL_HOT=$((RECEIVE * 10 + WITHDRAW * 3 + REGISTER))

# Output im METRIC-Format
echo "METRIC total_hot_gas=$TOTAL_HOT"
echo "METRIC receive_payment_gas=$RECEIVE"
echo "METRIC withdraw_yield_gas=$WITHDRAW"
echo "METRIC register_agent_gas=$REGISTER"

# Test count
PASSING=$(echo "$OUTPUT" | grep -o '[0-9]* passing' | awk '{print $1}')
echo "METRIC tests_passing=$PASSING"
