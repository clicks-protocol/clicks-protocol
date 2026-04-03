# Heartbeat

Run these checks on every cycle (recommended: every 15 minutes).

## 1. Balance Check

```
Call: get_yield_info for this agent's address
Log: { balance, deposited, yieldEarned, activeProtocol, currentApy }
```

## 2. APY Check

```
Call: get_protocol_stats
If currentApy < minimumAcceptableApy (2%):
  → Withdraw all yield, hold liquid
  → Log: "APY below threshold, withdrawing"
```

## 3. Deposit Check

```
If walletBalance > operatingReserve (500 USDC):
  excessBalance = walletBalance - operatingReserve
  If excessBalance >= 10 USDC:
    → Deposit excessBalance via receivePayment
    → Log: "Deposited {amount} USDC into Clicks"
```

## 4. Liquidity Check

```
If walletBalance < minimumThreshold (100 USDC):
  → Withdraw yield to replenish operating balance
  → Log: "Balance low, withdrawing yield"
```

## 5. Status Report

```
Log summary:
- Wallet balance: X USDC
- Deposited in Clicks: Y USDC
- Yield earned: Z USDC
- Active protocol: Aave V3 / Morpho
- Current APY: N%
- Next heartbeat: timestamp
```
