# Morpho Vaults on Base Mainnet

Exact contract addresses for USDC vaults on Base (Chain ID 8453), verified via app.morpho.org.

## Vaults

| Name                          | Curator          | Contract Address                           | APY   | TVL       |
|-------------------------------|------------------|--------------------------------------------|-------|-----------|
| Steakhouse USDC               | Steakhouse       | `0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183` | 2.76% | $286.36M  |
| Gauntlet USDC Prime           | Gauntlet         | `0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61` | 3.70% | $310.62M  |
| Moonwell Flagship USDC        | Anthias Labs     | `0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca` | 4.28% | $12.02M   |
| Seamless USDC Vault           | Seamless Protocol| `0x616a4E1db48e22028f6bbf20444Cd3b8e3273738` | TBD   | TBD       |

## Details

### Steakhouse USDC
- **URL:** https://app.morpho.org/base/vault/0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183/steakhouse-usdc
- **Strategy:** Dual-engine (blue chip crypto + RWA collateral)
- **Performance Fee:** 25%
- **Markets:** cbBTC, WETH, cbETH (86% LTV)

### Gauntlet USDC Prime
- **URL:** https://app.morpho.org/base/vault/0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61/gauntlet-usdc-prime
- **Strategy:** Risk-adjusted yield across large-cap collateral
- **Performance Fee:** 0%
- **Markets:** cbBTC (99.5%), WETH, cbETH, wstETH (86% LTV)

### Moonwell Flagship USDC
- **URL:** https://app.morpho.org/base/vault/0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca/moonwell-flagship-usdc
- **Strategy:** Blue-chip collateral optimization
- **Performance Fee:** 15%
- **Markets:** cbBTC (99%), wstETH, cbETH, WETH (86% LTV)
- **Bonus:** +1.15% WELL token rewards (via Merkl)

### Seamless USDC Vault
- **URL:** https://app.morpho.org/base/vault/0x616a4E1db48e22028f6bbf20444Cd3b8e3273738/seamless-usdc-vault
- **Strategy:** Risk-adjusted yield across high-demand collateral
- **Performance Fee:** TBD
- **Markets:** TBD

## Notes

- All vaults are Morpho MetaMorpho v1.0 (verified on Basescan)
- No proxy upgrade patterns on user funds
- Timelock durations: 4-7 days depending on vault
- LTV ranges: 77-86% (market-dependent)
- Data captured: 2026-03-16 23:15 UTC

## Integration

For Clicks Protocol, these vaults represent potential yield routing targets for the 20% earning portion of deposits. Current implementation uses Aave V3, but dual-routing to Morpho vaults could improve APY (especially Moonwell Flagship @ 4.28% + WELL rewards).

### Comparison (as of 2026-03-16)

| Protocol        | APY   | TVL       | Gas Cost | Integration |
|-----------------|-------|-----------|----------|-------------|
| Aave V3 USDC    | 2.5%  | High      | Low      | ✅ Live     |
| Morpho Vaults   | 2.76-4.28% | High | Medium   | 🚧 Planned  |

**Action:** Evaluate Morpho integration for v2 (especially Gauntlet Prime @ 0% fee, or Moonwell @ 4.28% + WELL).
