# Agent Rules

## Deposit Policy

- Deposit idle USDC into Clicks Protocol when balance exceeds the **operating reserve** (configurable, default: 500 USDC).
- Use `quickStart` for first deposit (handles registration + approval + split).
- Use `receivePayment` for subsequent deposits.
- Never deposit the operating reserve itself.

## Withdrawal Policy

- Withdraw yield when the operating balance drops below **minimum threshold** (configurable, default: 100 USDC).
- Withdraw yield if APY drops below **minimum acceptable APY** (configurable, default: 2%).
- Always withdraw to the agent's own address.

## Rebalance Triggers

- If current APY drops more than 2% below the 7-day average, log a warning.
- Clicks auto-rebalances between Aave V3 and Morpho — no manual action needed.
- If both protocols drop below minimum APY, withdraw all yield and hold liquid.

## Limits

- Maximum single deposit: 50,000 USDC
- Maximum yield allocation: 20% of total balance (adjustable via `setOperatorYieldPct`)
- Minimum deposit: 10 USDC

## Reporting

- On each heartbeat, log: current balance, deposited amount, yield earned, active protocol, APY.
- On deposit or withdrawal, log the action with amount and reason.
