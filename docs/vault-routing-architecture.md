# Vault Routing Architecture

## Kontext

Der ClicksYieldRouter routet aktuell USDC-Deposits zwischen Morpho Direct und Aave V3. Wir erweitern die Yield-Optionen um **ERC-4626 Curated Vaults** (Steakhouse USDC, Gauntlet USDC Prime, etc.).

## Problem

1. **Bestehender Router ist nicht upgradebar**: Keine Proxy-Implementierung, direktes Deployment
2. **Breaking Change vermeiden**: Bestehende 20% Yield-Routing-Logik soll unverändert bleiben
3. **Neue Yield-Source hinzufügen**: ERC-4626 Vaults als drittes Ziel neben Morpho + Aave

## Drei Optionen

### Option A: Proxy Upgrade (Bestehenden Router upgraden)

**Ansatz:**
- UUPS/Transparent Proxy Pattern nachträglich implementieren
- ClicksYieldRouter als Implementierungs-Contract deployen
- Proxy-Deployment + Storage-Migration
- Neue Vault-Routing-Logik in Upgrade einbauen

**Vorteile:**
- ✅ Ein Router für alles (Morpho, Aave, ERC-4626)
- ✅ Keine Breaking Changes für ClicksSplitter
- ✅ Adresse bleibt gleich (via Proxy)

**Nachteile:**
- ❌ **Komplexität**: Storage-Layout-Migration, Proxy-Security-Risiken
- ❌ **Keine bestehende Proxy-Infrastruktur**: Müssen von Grund auf implementieren
- ❌ **Risiko**: State-Migration bei laufendem System (67 Tests müssen weiter laufen)
- ❌ **Zeitaufwand**: Proxy-Implementierung + Security-Audit

**Urteil:** 🔴 **Nicht empfohlen** — zu hohes Risiko für Post-Launch-Upgrade ohne bestehende Proxy-Architektur

---

### Option B: Neuer Router (ClicksVaultRouter als Ersatz)

**Ansatz:**
- ClicksVaultRouter als **separates Deployment** (ohne Morpho/Aave)
- ClicksSplitter zeigt auf den neuen VaultRouter statt YieldRouter
- Alte Deposits auf YieldRouter bleiben liegen (withdraw möglich)
- Alle neuen Deposits gehen in VaultRouter

**Vorteile:**
- ✅ Saubere Trennung — kein Code-Overlap
- ✅ Einfaches Deployment
- ✅ Keine Storage-Migration
- ✅ VaultRouter kann unabhängig weiterentwickelt werden

**Nachteile:**
- ❌ **Breaking Change**: ClicksSplitter muss umkonfiguriert werden
- ❌ **Zwei Router parallel**: Alte Deposits im YieldRouter, neue im VaultRouter
- ❌ **Kapital fragmentiert**: Liquidität über zwei Contracts verteilt
- ❌ **Rebalancing komplexer**: Manuell zwischen Routern verschieben

**Urteil:** 🟡 **Machbar aber suboptimal** — funktioniert, aber fragmentierte Liquidität ist nicht ideal

---

### Option C: Hybrid (Launch mit YieldRouter, V1.1 mit VaultRouter daneben)

**Ansatz:**
- **Launch (V1.0)**: ClicksSplitter → ClicksYieldRouter (Morpho + Aave wie geplant)
- **V1.1 (später)**: ClicksVaultRouter separat deployen, Owner kann wählen:
  - Splitter zeigt auf YieldRouter (Morpho/Aave)
  - Splitter zeigt auf VaultRouter (ERC-4626)
  - Beide Router parallel nutzen (Split-Logik im Splitter)
- Bestehende Deposits können jederzeit per `rebalance()` zwischen Routern migriert werden

**Vorteile:**
- ✅ **Kein Launch-Risiko**: V1.0 bleibt unverändert (67 Tests laufen)
- ✅ **Flexibilität**: Owner kann später zwischen Routern wählen
- ✅ **Einfaches Rollback**: Falls VaultRouter Probleme macht → zurück zu YieldRouter
- ✅ **Incremental Deployment**: Vault-Integration testen ohne Core-System zu ändern
- ✅ **Gleiche Interface-Kompatibilität**: Beide Router implementieren deposit()/withdraw()

**Nachteile:**
- 🟡 **Mehrere Deployments**: Zwei separate Contracts statt einem
- 🟡 **Owner-Manual-Work**: Vault-Switching muss Owner aktiv machen
- 🟡 **Kapital-Split**: Wenn beide Router parallel laufen, Liquidität geteilt

**Urteil:** 🟢 **EMPFOHLEN** — geringstes Risiko, maximale Flexibilität

---

## Entscheidung: Option C (Hybrid)

### Phase 1: Launch (V1.0)
- Deploy ClicksYieldRouter wie geplant (Morpho + Aave)
- ClicksSplitter routet 20% Yield → YieldRouter
- Keine Änderungen an bestehendem Code

### Phase 2: Vault Integration (V1.1)
- Deploy ClicksVaultRouter (ERC-4626)
- Owner kann Splitter umkonfigurieren:
  ```solidity
  splitter.setYieldRouter(address(vaultRouter));
  ```
- Alte Deposits aus YieldRouter können per `withdraw()` → `deposit()` migriert werden

### Phase 3: Optional (V2.0)
- Splitter-Upgrade mit Multi-Router-Support:
  ```solidity
  function setYieldRouters(address[] calldata routers, uint256[] calldata weights);
  ```
- Automatisches Splitting: 10% → Morpho/Aave, 10% → ERC-4626

---

## Implementation Details

### ClicksVaultRouter Interface (CEI-konform)

```solidity
interface IYieldRouter {
    function deposit(uint256 amount, address agent) external payable;
    function withdraw(uint256 amount, address agent) external payable returns (uint256 received);
    function getTotalBalance() external view returns (uint256);
}
```

**Kompatibilität:**
- ✅ Gleiche Signatur wie ClicksYieldRouter
- ✅ ClicksSplitter kann beide Router ohne Code-Änderung nutzen

### Vault-Switching-Flow

```solidity
// Owner switches vault (z.B. Steakhouse → Gauntlet)
vaultRouter.setVault(newVaultAddress);
// Contract withdraws all from old vault, deposits into new vault
```

### APY-Vergleich (später)

Owner kann APYs vergleichen und Router wechseln:
```solidity
uint256 yieldRouterAPY = yieldRouter.getAaveAPY(); // oder getMorphoAPY()
uint256 vaultRouterAPY = vaultRouter.getVaultAPY();

if (vaultRouterAPY > yieldRouterAPY + threshold) {
    splitter.setYieldRouter(address(vaultRouter));
}
```

---

## Security Considerations

1. **CEI Pattern**: Alle State-Updates vor External Calls (✅ implementiert)
2. **Reentrancy**: Keine Callbacks von ERC-4626 (deposit/withdraw sind non-reentrant)
3. **Vault Trust**: Owner muss Vault verifizieren (Steakhouse/Gauntlet sind geprüft)
4. **Max Deposit**: VaultRouter prüft `maxDeposit()` vor jedem Deposit
5. **Asset Mismatch**: Constructor prüft `vault.asset() == USDC`

---

## Testing Strategy

### Unit Tests (ClicksVaultRouter.test.ts)
- ✅ Deposit → shares
- ✅ Withdraw → assets + yield
- ✅ APY-Berechnung
- ✅ Owner-only Vault-Switch
- ✅ Edge Cases (zero deposit, max deposit)

### Integration Tests (später)
- Splitter → VaultRouter → echtes ERC-4626 Vault (Testnet)
- Vault-Switch während laufender Deposits
- Multi-Agent-Withdrawals mit Yield

### Mainnet Deployment
1. Deploy ClicksVaultRouter auf Base Mainnet
2. Verify auf Basescan
3. Test-Deposit mit kleinem Betrag (100 USDC)
4. Monitor 24h, dann schrittweise erhöhen
5. Owner kann jederzeit zurück zu YieldRouter switchen

---

## Fazit

**Option C (Hybrid)** ist der sicherste Weg:
- Kein Risiko für V1.0 Launch
- VaultRouter als separates Deployment testen
- Owner kann flexibel zwischen Routern wählen
- Keine Breaking Changes
- Einfaches Rollback bei Problemen

**Next Steps:**
1. ✅ IERC4626 Interface erstellt
2. ✅ ClicksVaultRouter Contract erstellt
3. ✅ Unit Tests geschrieben
4. ⏳ Tests laufen lassen
5. ⏳ Mainnet Deployment vorbereiten (nach V1.0 Launch)
