# Basescan Contract Verification Status

**Datum:** 2026-03-16  
**Chain:** Base Mainnet (8453)  
**Basescan API Key:** Vorhanden in `.env`

## Status-Übersicht

| Contract | Adresse | Verifiziert? | Link |
|----------|---------|--------------|------|
| ClicksRegistry | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` | ❌ Nein | [Basescan](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3#code) |
| ClicksFeeV2 | `0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5` | ❌ Nein | [Basescan](https://basescan.org/address/0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5#code) |
| ClicksYieldRouter | `0x053167a233d18E05Bc65a8d5F3F8808782a3EECD` | ❌ Nein | [Basescan](https://basescan.org/address/0x053167a233d18E05Bc65a8d5F3F8808782a3EECD#code) |
| ClicksSplitterV4 | `0xB7E0016d543bD443ED2A6f23d5008400255bf3C8` | ❌ Nein | [Basescan](https://basescan.org/address/0xB7E0016d543bD443ED2A6f23d5008400255bf3C8#code) |

**Alle 4 Contracts müssen verifiziert werden.**

---

## Hardhat Verify Setup

### ✅ Vorhanden

- `hardhat.config.ts` konfiguriert mit Etherscan Plugin
- Basescan API Key in `.env`: `YGD9DE83ZMHCIY73J7P67SXCVNY8DRFA7I`
- Compiler: Solidity 0.8.20 mit Optimizer (runs: 200)
- Network: `base` (Chain 8453)

### ✅ Constructor-Parameter (aus deploy-mainnet.ts)

**Externe Adressen:**
```
USDC:      0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
AavePool:  0xA238Dd80C259a72e81d7e4664a9801593F98d1c5
aUSDC:     0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB
Morpho:    0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
Treasury:  (aus TREASURY_ADDRESS env var)
```

**Morpho Market Params:**
```
loanToken:       0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
collateralToken: 0x4200000000000000000000000000000000000006
oracle:          0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8
irm:             0x46415998764C29aB2a25CbeA6254146D50D22687
lltv:            860000000000000000 (0.86 ETH als BigNumber)
```

---

## Verifikations-Befehle

### 1. ClicksRegistry

**Constructor:** Keine Parameter

```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol
npx hardhat verify --network base 0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3
```

---

### 2. ClicksFee

**Constructor:** `(address usdc, address treasury)`

```bash
npx hardhat verify --network base \
  0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5 \
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" \
  "<TREASURY_ADDRESS>"
```

⚠️ **TREASURY_ADDRESS muss aus der .env oder dem Deployment-Log ermittelt werden.**

---

### 3. ClicksYieldRouter

**Constructor:** `(address usdc, address aavePool, address aUsdc, address morpho, MorphoMarketParams memory marketParams, address splitterPlaceholder)`

Wegen des komplexen `MorphoMarketParams` Structs ist hier ein dediziertes Verify-Script nötig:

**Erstelle:** `scripts/verify-router.ts`

```typescript
import { run } from "hardhat";

const ROUTER_ADDRESS = "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AAVE_POOL = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
const A_USDC = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";
const MORPHO = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

const MORPHO_MARKET_PARAMS = {
  loanToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  collateralToken: "0x4200000000000000000000000000000000000006",
  oracle: "0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8",
  irm: "0x46415998764C29aB2a25CbeA6254146D50D22687",
  lltv: "860000000000000000", // 0.86 ETH
};

async function main() {
  const deployer = "<DEPLOYER_ADDRESS>"; // Aus deployment/base.json oder Deployment-Log

  await run("verify:verify", {
    address: ROUTER_ADDRESS,
    constructorArguments: [
      USDC,
      AAVE_POOL,
      A_USDC,
      MORPHO,
      MORPHO_MARKET_PARAMS,
      deployer, // placeholder splitter während Deployment
    ],
  });
}

main().catch((err) => { console.error(err); process.exit(1); });
```

**Ausführen:**
```bash
npx hardhat run scripts/verify-router.ts --network base
```

---

### 4. ClicksSplitterV4

**Constructor:** `(address usdc, address router, address fee, address registry)`

```bash
npx hardhat verify --network base \
  0xB7E0016d543bD443ED2A6f23d5008400255bf3C8 \
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" \
  "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD" \
  "0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5" \
  "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"
```

---

## ✅ Deployment-Daten (aus deployments/base.json)

**Deployer:** `0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80`  
**Treasury:** `0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80` (gleiche Adresse wie Deployer)  
**Timestamp:** 2026-03-11T11:34:25.659Z

---

## Nächste Schritte

### ✅ Alle Deployment-Daten vorhanden, bereit zur Verifikation!

**Option 1: Automatisches Script (empfohlen)**
```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol
./scripts/verify-all.sh
```

Das Script verifiziert:
1. ✅ ClicksRegistry (keine Abhängigkeiten)
2. ✅ ClicksFeeV2 (USDC + Treasury)
3. ⏭️  ClicksYieldRouter (überspringt, braucht separates TS-Script)
4. ✅ ClicksSplitterV4 (alle Abhängigkeiten)

**Option 2: Manuell einzeln**

```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol

# 1. Registry
npx hardhat verify --network base 0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3

# 2. Fee
npx hardhat verify --network base 0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5 \
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" \
  "0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80"

# 3. Router (separates TypeScript-Script wegen struct)
npx hardhat run scripts/verify-router.ts --network base

# 4. Splitter
npx hardhat verify --network base 0xB7E0016d543bD443ED2A6f23d5008400255bf3C8 \
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" \
  "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD" \
  "0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5" \
  "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"
```

**Nach Verifikation:**
- Status auf Basescan prüfen (Links in Tabelle oben)
- Grünes Häkchen + "Contract Source Code Verified" sollte sichtbar sein

---

## Troubleshooting

### Falls Verifikation fehlschlägt:

**Compiler Version Mismatch:**
```
Error: Compiler version mismatch
```
→ Prüfe dass `hardhat.config.ts` exakt `0.8.20` verwendet

**Constructor Arguments falsch:**
```
Error: Invalid constructor arguments
```
→ Doppelcheck der Parameter-Reihenfolge und Typen
→ Bei Structs (Morpho Market Params) dediziertes Script verwenden

**API Rate Limit:**
```
Error: Rate limit exceeded
```
→ 5 Sekunden Pause zwischen Verifikationen
→ Basescan Free Tier: 5 Requests/Sekunde

**Bytecode Mismatch:**
```
Error: Bytecode does not match
```
→ Optimizer Settings prüfen (muss `runs: 200` sein)
→ Solidity Version exakt 0.8.20
→ Kein anderer Compiler verwendet beim Deployment

---

**Status:** Bereit zur Verifikation nach Ermittlung von TREASURY und DEPLOYER Adressen.
