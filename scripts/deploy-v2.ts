import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Clicks Protocol V2 Deployment
 *
 * Deploys ClicksFeeV2 + ClicksSplitterV4 and wires them to existing contracts.
 *
 * WHAT THIS DOES:
 * 1. Deploy ClicksFeeV2 (with referral integration)
 * 2. Deploy ClicksSplitterV4 (same as V3 but uses FeeV2)
 * 3. Authorize FeeV2 on ClicksReferral
 * 4. Authorize SplitterV4 on ClicksFeeV2
 * 5. Point YieldRouter to new SplitterV4
 * 6. Transfer ownership of new contracts to Safe multisig
 *
 * EXISTING CONTRACTS (unchanged):
 * - ClicksRegistry:    0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3
 * - ClicksYieldRouter: 0x053167a233d18E05Bc65a8d5F3F8808782a3EECD
 * - ClicksReferral:    0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC
 * - USDC:              0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 *
 * REQUIREMENTS:
 * - Deployer must be the current owner of YieldRouter and Referral
 * - CLICKS_SAFE_ADDRESS must be set in .env
 * - PRIVATE_KEY must be set in .env (current deployer/owner)
 */

// ─── Existing Addresses (Base Mainnet) ──────────────────────────────────────

const EXISTING = {
  registry:    "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3",
  yieldRouter: "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD",
  referral:    "0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC",
  usdc:        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  feeV1:       "0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE",
  splitterV3:  "0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D",
};

// ─── ABIs for existing contracts ────────────────────────────────────────────

const YIELD_ROUTER_ABI = [
  "function setSplitter(address newSplitter) external",
  "function owner() external view returns (address)",
  "function splitter() external view returns (address)",
];

const REFERRAL_ABI = [
  "function setAuthorized(address addr, bool status) external",
  "function owner() external view returns (address)",
  "function authorized(address) external view returns (bool)",
];

// ─── Deploy ─────────────────────────────────────────────────────────────────

async function main() {
  const networkName = network.name;
  console.log(`\n=== Clicks Protocol V2 Deployment ===`);
  console.log(`Network: ${networkName}\n`);

  if (networkName !== "base" && networkName !== "base-sepolia") {
    throw new Error(`Expected 'base' or 'base-sepolia', got '${networkName}'`);
  }

  const safeAddress = process.env.CLICKS_SAFE_ADDRESS;
  if (!safeAddress) throw new Error("CLICKS_SAFE_ADDRESS not set in .env");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer:    ${deployer.address}`);
  console.log(`Safe:        ${safeAddress}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:     ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) throw new Error("Deployer has no ETH for gas");

  // ── Verify ownership of existing contracts ────────────────────────────────

  console.log("Verifying ownership of existing contracts...");
  const yieldRouter = new ethers.Contract(EXISTING.yieldRouter, YIELD_ROUTER_ABI, deployer);
  const referralContract = new ethers.Contract(EXISTING.referral, REFERRAL_ABI, deployer);

  const routerOwner = await yieldRouter.owner();
  const referralOwner = await referralContract.owner();
  console.log(`  YieldRouter owner:  ${routerOwner}`);
  console.log(`  Referral owner:     ${referralOwner}`);

  if (routerOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`Deployer is not YieldRouter owner. Owner: ${routerOwner}`);
  }
  if (referralOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`Deployer is not Referral owner. Owner: ${referralOwner}`);
  }
  console.log("  Ownership verified ✓\n");

  // ── 1. Deploy ClicksFeeV2 ────────────────────────────────────────────────

  console.log("1/2 Deploying ClicksFeeV2...");
  const FeeV2 = await ethers.getContractFactory("ClicksFeeV2");
  const feeV2 = await FeeV2.deploy(
    EXISTING.usdc,
    EXISTING.referral,
    safeAddress,  // Treasury = Safe multisig
  );
  await feeV2.waitForDeployment();
  const feeV2Addr = await feeV2.getAddress();
  console.log(`  ClicksFeeV2: ${feeV2Addr}`);

  // ── 2. Deploy ClicksSplitterV4 ───────────────────────────────────────────

  console.log("2/2 Deploying ClicksSplitterV4...");
  const SplitterV4 = await ethers.getContractFactory("ClicksSplitterV4");
  const splitterV4 = await SplitterV4.deploy(
    EXISTING.usdc,
    EXISTING.yieldRouter,
    feeV2Addr,
    EXISTING.registry,
  );
  await splitterV4.waitForDeployment();
  const splitterV4Addr = await splitterV4.getAddress();
  console.log(`  ClicksSplitterV4: ${splitterV4Addr}`);

  // ── 3. Wire up ───────────────────────────────────────────────────────────

  console.log("\nWiring contracts...");

  // Authorize FeeV2 on ClicksReferral (so it can call distributeReferralYield)
  console.log("  3a. Authorizing FeeV2 on ClicksReferral...");
  const tx1 = await referralContract.setAuthorized(feeV2Addr, true);
  await tx1.wait();
  console.log("      FeeV2 authorized on Referral ✓");

  // Authorize SplitterV4 on FeeV2 (so it can call collectFee)
  console.log("  3b. Authorizing SplitterV4 on FeeV2...");
  const tx2 = await feeV2.setAuthorized(splitterV4Addr, true);
  await tx2.wait();
  console.log("      SplitterV4 authorized on FeeV2 ✓");

  // Point YieldRouter to new SplitterV4
  console.log("  3c. Updating YieldRouter splitter...");
  const oldSplitter = await yieldRouter.splitter();
  console.log(`      Old splitter: ${oldSplitter}`);
  const tx3 = await yieldRouter.setSplitter(splitterV4Addr);
  await tx3.wait();
  console.log(`      New splitter: ${splitterV4Addr} ✓`);

  // ── 4. Transfer ownership to Safe ────────────────────────────────────────

  console.log("\nTransferring ownership to Safe multisig...");

  console.log("  4a. FeeV2 ownership...");
  const tx4 = await feeV2.transferOwnership(safeAddress);
  await tx4.wait();
  console.log(`      FeeV2 owner → ${safeAddress} ✓`);

  console.log("  4b. SplitterV4 ownership...");
  const tx5 = await splitterV4.transferOwnership(safeAddress);
  await tx5.wait();
  console.log(`      SplitterV4 owner → ${safeAddress} ✓`);

  // ── 5. Save deployments ──────────────────────────────────────────────────

  const deployments = {
    network: networkName,
    version: "v2",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    safeOwner: safeAddress,
    newContracts: {
      ClicksFeeV2:       feeV2Addr,
      ClicksSplitterV4:  splitterV4Addr,
    },
    existingContracts: EXISTING,
    wiring: {
      "YieldRouter.splitter": `${oldSplitter} → ${splitterV4Addr}`,
      "Referral.authorized(FeeV2)": true,
      "FeeV2.authorized(SplitterV4)": true,
      "FeeV2.owner": safeAddress,
      "SplitterV4.owner": safeAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);
  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}-v2.json`),
    JSON.stringify(deployments, null, 2),
  );
  console.log(`\nDeployment saved to deployments/${networkName}-v2.json`);

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log("\n=== V2 Deployment Complete ===\n");
  console.log("New contracts:");
  console.log(`  ClicksFeeV2:      ${feeV2Addr}`);
  console.log(`  ClicksSplitterV4: ${splitterV4Addr}`);
  console.log(`  Owner:            ${safeAddress} (Safe multisig)`);
  console.log("\nExisting contracts (unchanged):");
  console.log(`  ClicksRegistry:    ${EXISTING.registry}`);
  console.log(`  ClicksYieldRouter: ${EXISTING.yieldRouter} (now points to V4)`);
  console.log(`  ClicksReferral:    ${EXISTING.referral} (FeeV2 authorized)`);
  console.log("\nNext steps:");
  console.log("  1. Verify contracts on Basescan");
  console.log("  2. Update SDK/MCP addresses (splitter → SplitterV4)");
  console.log("  3. Update .well-known files and llms.txt");
  console.log("  4. Test end-to-end: quickStart → yield → withdraw → referral claim");
  console.log("  5. Update Referral docs from 'V2 coming' to 'live'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
