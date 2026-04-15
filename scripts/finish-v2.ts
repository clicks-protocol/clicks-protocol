import { ethers, network } from "hardhat";

/**
 * Finish V2 migration — runs only the remaining steps after partial deploy.
 */

const YIELD_ROUTER = "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD";
const FEE_V2 = "0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5";
const SPLITTER_V4 = "0xB7E0016d543bD443ED2A6f23d5008400255bf3C8";
const SAFE = "0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Step 1: Point YieldRouter to new SplitterV4
  console.log("1. Updating YieldRouter splitter...");
  const router = new ethers.Contract(YIELD_ROUTER, [
    "function setSplitter(address) external",
    "function splitter() view returns (address)",
  ], deployer);

  const currentSplitter = await router.splitter();
  console.log(`   Current: ${currentSplitter}`);

  if (currentSplitter.toLowerCase() === SPLITTER_V4.toLowerCase()) {
    console.log("   Already set to V4 ✓");
  } else {
    const tx1 = await router.setSplitter(SPLITTER_V4);
    await tx1.wait();
    console.log(`   Updated to: ${SPLITTER_V4} ✓`);
  }

  // Step 2: Transfer FeeV2 ownership to Safe
  console.log("2. Transferring FeeV2 ownership...");
  const feeV2 = new ethers.Contract(FEE_V2, [
    "function transferOwnership(address) external",
    "function owner() view returns (address)",
  ], deployer);

  const feeOwner = await feeV2.owner();
  if (feeOwner.toLowerCase() === SAFE.toLowerCase()) {
    console.log("   Already owned by Safe ✓");
  } else {
    const tx2 = await feeV2.transferOwnership(SAFE);
    await tx2.wait();
    console.log(`   FeeV2 owner → ${SAFE} ✓`);
  }

  // Step 3: Transfer SplitterV4 ownership to Safe
  console.log("3. Transferring SplitterV4 ownership...");
  const splitterV4 = new ethers.Contract(SPLITTER_V4, [
    "function transferOwnership(address) external",
    "function owner() view returns (address)",
  ], deployer);

  const splitterOwner = await splitterV4.owner();
  if (splitterOwner.toLowerCase() === SAFE.toLowerCase()) {
    console.log("   Already owned by Safe ✓");
  } else {
    const tx3 = await splitterV4.transferOwnership(SAFE);
    await tx3.wait();
    console.log(`   SplitterV4 owner → ${SAFE} ✓`);
  }

  console.log("\n=== V2 Migration Complete ===");
  console.log(`ClicksFeeV2:      ${FEE_V2}`);
  console.log(`ClicksSplitterV4: ${SPLITTER_V4}`);
  console.log(`Owner:            ${SAFE}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("Failed:", e.message); process.exit(1); });
