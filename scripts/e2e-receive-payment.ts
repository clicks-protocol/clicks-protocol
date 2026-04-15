import { ethers, network } from "hardhat";

/**
 * Step 3 only: receivePayment with explicit gas limit
 * (registerAgent + approve already completed)
 */

const DEPLOYMENT = {
  splitter: "0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D",
  usdc:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

const TEST_AMOUNT = 100_000n; // 0.10 USDC

async function main() {
  if (network.name !== "base") throw new Error("Must run on Base Mainnet");

  const [signer] = await ethers.getSigners();
  console.log(`Signer: ${signer.address}`);

  const usdc = await ethers.getContractAt("IERC20", DEPLOYMENT.usdc);
  const usdcBal = await usdc.balanceOf(signer.address);
  const allowance = await usdc.allowance(signer.address, DEPLOYMENT.splitter);
  console.log(`USDC balance: ${Number(usdcBal) / 1e6}`);
  console.log(`Allowance: ${Number(allowance) / 1e6}`);

  const splitter = await ethers.getContractAt(
    ["function receivePayment(uint256 amount, address agent) external payable"],
    DEPLOYMENT.splitter
  );

  console.log(`\nSending receivePayment(${Number(TEST_AMOUNT) / 1e6} USDC, ${signer.address})...`);

  const tx = await splitter.receivePayment(TEST_AMOUNT, signer.address, {
    gasLimit: 500_000n,
  });
  console.log(`tx hash: ${tx.hash}`);

  const receipt = await tx.wait(2);
  console.log(`Status: ${receipt!.status === 1 ? "SUCCESS" : "FAILED"}`);
  console.log(`Block: ${receipt!.blockNumber}`);
  console.log(`Gas used: ${receipt!.gasUsed.toString()}`);

  // Log events
  for (const log of receipt!.logs) {
    console.log(`Event: topic0=${log.topics[0]?.slice(0, 10)}... address=${log.address}`);
  }

  const usdcAfter = await usdc.balanceOf(signer.address);
  console.log(`\nUSDC after: ${Number(usdcAfter) / 1e6} (was ${Number(usdcBal) / 1e6})`);
}

main().catch((err) => {
  console.error("FAILED:", err.message || err);
  process.exit(1);
});
