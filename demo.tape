# Clicks Protocol — Quick Start Demo
# Run: vhs demo.tape

Output demo.gif
Output demo.webm

Set Shell "bash"
Set FontSize 16
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 50ms

# Title
Type "# Clicks Protocol — One call to earn yield on your agent's USDC"
Enter
Sleep 1s

# Step 1: Install
Type "npm install @clicks-protocol/sdk ethers@^6"
Enter
Sleep 2s
Type "added 42 packages in 3s"
Enter
Sleep 1s

# Step 2: Code
Type "cat quickstart.ts"
Enter
Sleep 500ms

Type 'import { ClicksClient } from "@clicks-protocol/sdk";'
Enter
Type 'import { ethers } from "ethers";'
Enter
Enter
Type "const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');"
Enter
Type "const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);"
Enter
Type "const clicks = new ClicksClient(signer);"
Enter
Enter
Type "// One call: register + approve + split payment"
Enter
Type "const result = await clicks.quickStart('100', agentAddress);"
Enter
Sleep 2s

# Step 3: Output
Type ""
Enter
Type "# Output:"
Enter
Type "# ✅ Agent registered"
Enter
Type "# ✅ USDC approved (unlimited)"
Enter
Type "# ✅ Payment split: 100 USDC"
Enter
Type "#    → 80 USDC → agent wallet (instant)"
Enter
Type "#    → 20 USDC → DeFi yield (Morpho, 9.2% APY)"
Enter
Sleep 1s

Type ""
Enter
Type "# Your agent is now earning yield. No dashboards. No human. Automatic."
Enter
Sleep 3s
