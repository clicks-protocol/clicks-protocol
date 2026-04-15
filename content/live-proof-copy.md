# Live Proof Widget Copy

## KPI Cards

### 1. TVL
- Label: "TVL"
- Value format: X.XX USDC (or X.XK / X.XM for large values)
- Tooltip: "Total USDC deposited in DeFi yield via Aave V3 or Morpho on Base"

### 2. Current APY
- Label: "Current APY"
- Value format: X.X%
- Subtext: "via [activeProtocol]"
- Tooltip: "Live supply APY from the active yield protocol"

### 3. Registered Agents
- Label: "Registered Agents"
- Value format: integer
- Tooltip: "AI agents registered on Clicks Protocol (Base Mainnet)"

### 4. Total Volume
- Label: "Total Volume"
- Value format: X.XX USDC (or X.XK / X.XM for large values)
- Tooltip: "Cumulative USDC payment volume processed through Clicks"

## Threshold State
When totalAgents < 1 or tvlUsdc < 1.00:
- Message: "Protocol is live on Base. First agents are onboarding."

## Footer
- Left: relative timestamp ("5m ago", "2h ago")
- Right: "Verify" link to Basescan (ClicksSplitterV3 contract)

## Proof Text (machine-readable)
Endpoint: /api/public/proof.txt
Format: key-value plain text, parsable by AI agents.
Includes contract addresses and verify links.

## Copy Rules
- No marketing language
- No em-dashes or en-dashes
- No emojis
- Technically precise
- Short labels, no full sentences in KPI cards
