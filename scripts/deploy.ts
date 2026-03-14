import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// ─── Addresses ────────────────────────────────────────────────────────────────

const ADDRESSES: Record<string, {
  usdc: string;
  aavePool: string;
  aUsdc: string;
  morpho: string;
  treasury: string;
}> = {
  "base-sepolia": {
    usdc:     "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    aavePool: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    aUsdc:    "0x96F3Ce39Ad2BfDCf92C0F6E2C2CAbF83874660Fc", // aBasSepUSDC — verify
    morpho:   "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    treasury: process.env.TREASURY_ADDRESS || "",
  },
  "base": {
    usdc:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    aavePool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    aUsdc:    "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB", // aBaseUSDC — verify
    morpho:   "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    treasury: process.env.TREASURY_ADDRESS || "",
  },
};

// Morpho USDC market params on Base (verify before mainnet deploy)
// This is the USDC/WETH market on Morpho Blue Base
const MORPHO_MARKET_PARAMS = {
  loanToken:       "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  collateralToken: "0x4200000000000000000000000000000000000006", // WETH
  oracle:          "0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8", // verify
  irm:             "0x46415998764C29aB2a25CbeA6254146D50D22687", // verify
  lltv:            ethers.parseEther("0.86"),
};

// ─── Deploy ───────────────────────────────────────────────────────────────────

async function main() {
  const networkName = network.name;
  console.log(`\n🚀 Deploying Clicks Protocol to ${networkName}...\n`);

  const addrs = ADDRESSES[networkName];
  if (!addrs) throw new Error(`No address config for network: ${networkName}`);
  if (!addrs.treasury) throw new Error("TREASURY_ADDRESS not set in .env");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // ── 1. ClicksRegistry ──────────────────────────────────────────────────────
  console.log("1/4 Deploying ClicksRegistry...");
  const Registry = await ethers.getContractFactory("ClicksRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`   ClicksRegistry: ${registryAddr}`);

  // ── 2. ClicksFee ───────────────────────────────────────────────────────────
  console.log("2/4 Deploying ClicksFee...");
  const Fee = await ethers.getContractFactory("ClicksFee");
  const fee = await Fee.deploy(addrs.usdc, addrs.treasury);
  await fee.waitForDeployment();
  const feeAddr = await fee.getAddress();
  console.log(`   ClicksFee: ${feeAddr}`);

  // ── 3. ClicksYieldRouter ───────────────────────────────────────────────────
  console.log("3/4 Deploying ClicksYieldRouter...");
  const Router = await ethers.getContractFactory("ClicksYieldRouter");

  // Placeholder splitter address — will be updated after splitter deploy
  const PLACEHOLDER_SPLITTER = deployer.address;

  const router = await Router.deploy(
    addrs.usdc,
    addrs.aavePool,
    addrs.aUsdc,
    addrs.morpho,
    MORPHO_MARKET_PARAMS,
    PLACEHOLDER_SPLITTER,
  );
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log(`   ClicksYieldRouter: ${routerAddr}`);

  // ── 4. ClicksSplitterV3 ────────────────────────────────────────────────────
  console.log("4/4 Deploying ClicksSplitterV3...");
  const Splitter = await ethers.getContractFactory("ClicksSplitterV3");
  const splitter = await Splitter.deploy(
    addrs.usdc,
    routerAddr,
    feeAddr,
    registryAddr,
  );
  await splitter.waitForDeployment();
  const splitterAddr = await splitter.getAddress();
  console.log(`   ClicksSplitterV3: ${splitterAddr}`);

  // ── Wire up ────────────────────────────────────────────────────────────────
  console.log("\nWiring contracts...");
  await router.setSplitter(splitterAddr);
  console.log("   Router → Splitter set");

  await fee.setAuthorized(splitterAddr, true);
  console.log("   Fee → Splitter authorized");

  // ── Save deployments ───────────────────────────────────────────────────────
  const deployments = {
    network: networkName,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ClicksRegistry:   registryAddr,
      ClicksFee:        feeAddr,
      ClicksYieldRouter: routerAddr,
      ClicksSplitterV3:  splitterAddr,
    },
    externalAddresses: addrs,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);
  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}.json`),
    JSON.stringify(deployments, null, 2),
  );

  console.log("\n✅ Deployment complete!\n");
  console.log("Contract addresses:");
  console.log(`  ClicksRegistry:    ${registryAddr}`);
  console.log(`  ClicksFee:         ${feeAddr}`);
  console.log(`  ClicksYieldRouter: ${routerAddr}`);
  console.log(`  ClicksSplitterV3:  ${splitterAddr}`);
  console.log(`\nSaved to deployments/${networkName}.json`);
  console.log("\nNext: run scripts/verify.ts to verify on Basescan");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
