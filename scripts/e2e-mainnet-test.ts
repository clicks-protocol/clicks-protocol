import { ethers, network } from "hardhat";

/**
 * E2E Mainnet Test — minimal real onchain validation
 * 1. registerAgent (signer as both operator and agent)
 * 2. approve USDC to Splitter
 * 3. receivePayment with 0.10 USDC
 */

const DEPLOYMENT = {
  registry:  "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3",
  splitter:  "0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D",
  usdc:      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

const TEST_AMOUNT = 100_000n; // 0.10 USDC (6 decimals)

async function main() {
  if (network.name !== "base") {
    throw new Error("This script must run on Base Mainnet (--network base)");
  }

  const [signer] = await ethers.getSigners();
  console.log(`\n=== E2E Mainnet Test ===`);
  console.log(`Signer:  ${signer.address}`);

  const ethBal = await ethers.provider.getBalance(signer.address);
  console.log(`ETH:     ${ethers.formatEther(ethBal)} ETH`);

  // USDC balance check
  const usdc = await ethers.getContractAt("IERC20", DEPLOYMENT.usdc);
  const usdcBal = await usdc.balanceOf(signer.address);
  console.log(`USDC:    ${Number(usdcBal) / 1e6} USDC`);

  if (usdcBal < TEST_AMOUNT) {
    console.error(`\n❌ BLOCKER: Need at least ${Number(TEST_AMOUNT) / 1e6} USDC, have ${Number(usdcBal) / 1e6}`);
    process.exit(1);
  }

  // === Step 1: registerAgent ===
  console.log(`\n--- Step 1: registerAgent ---`);
  const registry = await ethers.getContractAt(
    ["function registerAgent(address) external", "function isRegistered(address) view returns (bool)", "function totalAgents() view returns (uint256)"],
    DEPLOYMENT.registry
  );

  const alreadyRegistered = await registry.isRegistered(signer.address);
  if (alreadyRegistered) {
    console.log(`Agent already registered, skipping.`);
  } else {
    const tx1 = await registry.registerAgent(signer.address);
    console.log(`registerAgent tx: ${tx1.hash}`);
    const receipt1 = await tx1.wait(2);
    console.log(`✅ registerAgent confirmed in block ${receipt1!.blockNumber}`);
  }

  const totalAgents = await registry.totalAgents();
  console.log(`Total agents now: ${totalAgents}`);

  // === Step 2: approve USDC ===
  console.log(`\n--- Step 2: approve USDC to Splitter ---`);
  const currentAllowance = await usdc.allowance(signer.address, DEPLOYMENT.splitter);
  console.log(`Current allowance: ${Number(currentAllowance) / 1e6} USDC`);

  if (currentAllowance < TEST_AMOUNT) {
    const tx2 = await usdc.approve(DEPLOYMENT.splitter, TEST_AMOUNT);
    console.log(`approve tx: ${tx2.hash}`);
    const receipt2 = await tx2.wait(2);
    console.log(`✅ approve confirmed in block ${receipt2!.blockNumber}`);
  } else {
    console.log(`Sufficient allowance, skipping.`);
  }

  // === Step 3: receivePayment ===
  console.log(`\n--- Step 3: receivePayment ---`);
  const splitter = await ethers.getContractAt(
    ["function receivePayment(uint256 amount, address agent) external payable"],
    DEPLOYMENT.splitter
  );

  const tx3 = await splitter.receivePayment(TEST_AMOUNT, signer.address);
  console.log(`receivePayment tx: ${tx3.hash}`);
  const receipt3 = await tx3.wait(2);
  console.log(`✅ receivePayment confirmed in block ${receipt3!.blockNumber}`);

  // Final balances
  const usdcAfter = await usdc.balanceOf(signer.address);
  const ethAfter = await ethers.provider.getBalance(signer.address);
  console.log(`\n--- Final State ---`);
  console.log(`USDC after: ${Number(usdcAfter) / 1e6} USDC (was ${Number(usdcBal) / 1e6})`);
  console.log(`ETH after:  ${ethers.formatEther(ethAfter)} ETH`);
  console.log(`\n=== E2E Test Complete ===\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
