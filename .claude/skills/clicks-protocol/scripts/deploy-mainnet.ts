import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const ADDRESSES = {
  usdc:     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  aavePool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
  aUsdc:    "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB",
  morpho:   "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  treasury: process.env.TREASURY_ADDRESS || "",
};

const MORPHO_MARKET_PARAMS = {
  loanToken:       "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  collateralToken: "0x4200000000000000000000000000000000000006",
  oracle:          "0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8",
  irm:             "0x46415998764C29aB2a25CbeA6254146D50D22687",
  lltv:            ethers.parseEther("0.86"),
};

async function deployAndWait(name: string, factory: any, args: any[]) {
  console.log(`Deploying ${name}...`);
  const contract = await factory.deploy(...args);
  const tx = contract.deploymentTransaction();
  console.log(`  tx: ${tx?.hash}`);
  console.log(`  waiting for confirmation...`);
  await contract.waitForDeployment();
  // Extra: wait 2 more confirmations for nonce stability
  if (tx) await tx.wait(2);
  const addr = await contract.getAddress();
  console.log(`  ✅ ${name}: ${addr}\n`);
  return contract;
}

async function main() {
  if (network.name !== "base") throw new Error("This script is for Base Mainnet only!");
  if (!ADDRESSES.treasury) throw new Error("TREASURY_ADDRESS not set!");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`\n🚀 Clicks Protocol — Base Mainnet Deploy\n`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

  // 1. Registry
  const Registry = await ethers.getContractFactory("ClicksRegistry");
  const registry = await deployAndWait("ClicksRegistry", Registry, []);

  // 2. Fee
  const Fee = await ethers.getContractFactory("ClicksFee");
  const fee = await deployAndWait("ClicksFee", Fee, [ADDRESSES.usdc, ADDRESSES.treasury]);

  // 3. YieldRouter
  const Router = await ethers.getContractFactory("ClicksYieldRouter");
  const router = await deployAndWait("ClicksYieldRouter", Router, [
    ADDRESSES.usdc,
    ADDRESSES.aavePool,
    ADDRESSES.aUsdc,
    ADDRESSES.morpho,
    MORPHO_MARKET_PARAMS,
    deployer.address, // placeholder splitter
  ]);

  // 4. SplitterV3
  const Splitter = await ethers.getContractFactory("ClicksSplitterV3");
  const splitter = await deployAndWait("ClicksSplitterV3", Splitter, [
    ADDRESSES.usdc,
    await router.getAddress(),
    await fee.getAddress(),
    await registry.getAddress(),
  ]);

  // Wire up
  console.log("Wiring contracts...");
  let tx = await router.setSplitter(await splitter.getAddress());
  await tx.wait(2);
  console.log("  Router → Splitter ✅");

  tx = await fee.setAuthorized(await splitter.getAddress(), true);
  await tx.wait(2);
  console.log("  Fee → Splitter authorized ✅");

  // Save
  const contracts = {
    ClicksRegistry: await registry.getAddress(),
    ClicksFee: await fee.getAddress(),
    ClicksYieldRouter: await router.getAddress(),
    ClicksSplitterV3: await splitter.getAddress(),
  };

  const deployments = {
    network: "base",
    chainId: 8453,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts,
    externalAddresses: ADDRESSES,
  };

  const dir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "base.json"), JSON.stringify(deployments, null, 2));

  const finalBal = await ethers.provider.getBalance(deployer.address);
  const gasUsed = ethers.formatEther(balance - finalBal);

  console.log(`\n✅ DEPLOYMENT COMPLETE!\n`);
  console.log(`Contracts:`);
  Object.entries(contracts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`\nGas used: ${gasUsed} ETH`);
  console.log(`Saved to deployments/base.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
