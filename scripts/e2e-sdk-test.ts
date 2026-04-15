/**
 * E2E SDK Test: Validates gas-estimation fix in ClicksClient.receivePayment
 * Uses the SDK (not raw contract) to confirm default gasLimit=500000n works.
 *
 * Prerequisites: Agent already registered, USDC available.
 * Will approve if needed, then call receivePayment WITHOUT explicit gasLimit.
 */

import { ethers } from "ethers";

// Import SDK from local build
import { ClicksClient } from "../sdk/dist/index.js";

const SIGNER_KEY = process.env.PRIVATE_KEY!;
const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const TEST_AMOUNT = 50_000n; // 0.05 USDC (6 decimals)

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(SIGNER_KEY, provider);
  const clicks = new ClicksClient(wallet);

  console.log(`=== SDK E2E Gas-Fix Test ===`);
  console.log(`Signer:  ${wallet.address}`);

  // Check balances
  const usdcBal = await clicks.getUSDCBalance(wallet.address);
  const allowance = await clicks.getAllowance(wallet.address);
  console.log(`USDC:    ${Number(usdcBal) / 1e6} USDC`);
  console.log(`Allow:   ${Number(allowance) / 1e6} USDC`);

  if (usdcBal < TEST_AMOUNT) {
    console.error(`❌ Insufficient USDC: need ${Number(TEST_AMOUNT) / 1e6}, have ${Number(usdcBal) / 1e6}`);
    process.exit(1);
  }

  // Approve if needed
  if (allowance < TEST_AMOUNT) {
    console.log(`\nApproving ${Number(TEST_AMOUNT) / 1e6} USDC to Splitter...`);
    const appTx = await clicks.approveUSDC(TEST_AMOUNT);
    console.log(`approve tx: ${appTx.hash}`);
    await appTx.wait(2);
    console.log(`✅ Approved`);
  }

  // receivePayment via SDK — NO explicit gasLimit (default 500000n should kick in)
  console.log(`\nCalling clicks.receivePayment(${TEST_AMOUNT}n, ${wallet.address}) — no explicit gasLimit...`);
  const tx = await clicks.receivePayment(TEST_AMOUNT, wallet.address);
  console.log(`tx hash: ${tx.hash}`);

  const receipt = await tx.wait(2);
  console.log(`Status:   ${receipt!.status === 1 ? "SUCCESS" : "FAILED"}`);
  console.log(`Block:    ${receipt!.blockNumber}`);
  console.log(`Gas used: ${receipt!.gasUsed.toString()}`);

  const usdcAfter = await clicks.getUSDCBalance(wallet.address);
  console.log(`\nUSDC after: ${Number(usdcAfter) / 1e6} (was ${Number(usdcBal) / 1e6})`);
  console.log(`\n=== SDK E2E Test Complete ===`);
}

main().catch((err) => {
  console.error("FAILED:", err.message || err);
  process.exit(1);
});
