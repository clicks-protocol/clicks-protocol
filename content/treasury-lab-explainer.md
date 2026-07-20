# Treasury Lab

Model how agent treasury gets split between liquid operations and routed yield.

## KPI Labels

**Liquid**
USDC available immediately for agent operations.

**To Yield**
USDC routed into the yield side of the settlement policy.

**Net Earnings**
Projected yield earnings after 2% protocol fee.

## Detail Labels

**Total Return**
Liquid + principal + net yield.

**Effective APY**
Annualized return on total input after fees.

**Protocol Fee**
2% fee on yield earned, never on principal.

## Disclaimer

Projection based on current APY. Rates fluctuate. Not financial advice.

## How it works

Clicks Protocol splits incoming USDC payments: a configurable percentage stays liquid in the agent wallet for working capital, the rest routes into Aave V3 or Morpho on Base. The protocol takes a 2% fee on yield earned, never on principal. This simulator uses the current live APY from the active yield protocol.
