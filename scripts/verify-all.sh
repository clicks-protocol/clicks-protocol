#!/bin/bash

# Basescan Verification Script für Clicks Protocol
# Chain: Base Mainnet (8453)
# Datum: 2026-03-16

set -e

USDC="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
AAVE_POOL="0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
A_USDC="0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"
MORPHO="0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
TREASURY="0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80"
DEPLOYER="0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80"

REGISTRY="0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"
FEE="0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE"
ROUTER="0x053167a233d18E05Bc65a8d5F3F8808782a3EECD"
SPLITTER="0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D"

echo "🔍 Basescan Contract Verification"
echo "=================================="
echo ""

# 1. ClicksRegistry (keine Constructor-Parameter)
echo "1️⃣  Verifiziere ClicksRegistry..."
npx hardhat verify --network base $REGISTRY
echo "✅ ClicksRegistry verifiziert"
echo ""
sleep 2

# 2. ClicksFee (usdc, treasury)
echo "2️⃣  Verifiziere ClicksFee..."
npx hardhat verify --network base $FEE "$USDC" "$TREASURY"
echo "✅ ClicksFee verifiziert"
echo ""
sleep 2

# 3. ClicksYieldRouter (komplex, separates Script)
echo "3️⃣  Verifiziere ClicksYieldRouter..."
echo "⚠️  Router braucht dediziertes TypeScript-Script wegen MorphoMarketParams struct"
echo "   Führe aus: npx hardhat run scripts/verify-router.ts --network base"
echo ""

# 4. ClicksSplitterV3 (usdc, router, fee, registry)
echo "4️⃣  Verifiziere ClicksSplitterV3..."
npx hardhat verify --network base $SPLITTER "$USDC" "$ROUTER" "$FEE" "$REGISTRY"
echo "✅ ClicksSplitterV3 verifiziert"
echo ""

echo "=================================="
echo "✅ Registry, Fee und Splitter verifiziert!"
echo "⚠️  Für Router: npx hardhat run scripts/verify-router.ts --network base"
echo ""
