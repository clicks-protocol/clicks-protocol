import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  if (network.name !== "base") throw new Error("This script is for Base Mainnet only!");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`\n🚀 ClicksReferral — Base Mainnet Deploy\n`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

  // Deploy ClicksReferral
  console.log("Deploying ClicksReferral...");
  const Referral = await ethers.getContractFactory("ClicksReferral");
  const referral = await Referral.deploy();
  const tx = referral.deploymentTransaction();
  console.log(`  tx: ${tx?.hash}`);
  console.log(`  waiting for confirmation...`);
  await referral.waitForDeployment();
  if (tx) await tx.wait(2);
  const referralAddress = await referral.getAddress();
  console.log(`  ✅ ClicksReferral: ${referralAddress}\n`);

  // Load existing deployments
  const deploymentsPath = path.join(__dirname, "../deployments/base.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  // Authorize ClicksFee to call ClicksReferral
  const feeAddress = deployments.contracts.ClicksFee;
  if (feeAddress) {
    console.log(`Authorizing ClicksFee (${feeAddress}) on ClicksReferral...`);
    const authTx = await referral.setAuthorized(feeAddress, true);
    await authTx.wait(2);
    console.log("  ✅ ClicksFee authorized\n");
  }

  // Authorize ClicksRegistry to call ClicksReferral
  const registryAddress = deployments.contracts.ClicksRegistry;
  if (registryAddress) {
    console.log(`Authorizing ClicksRegistry (${registryAddress}) on ClicksReferral...`);
    const authTx = await referral.setAuthorized(registryAddress, true);
    await authTx.wait(2);
    console.log("  ✅ ClicksRegistry authorized\n");
  }

  // Authorize ClicksSplitterV3 to call ClicksReferral (for team TVL updates)
  const splitterAddress = deployments.contracts.ClicksSplitterV3;
  if (splitterAddress) {
    console.log(`Authorizing ClicksSplitterV3 (${splitterAddress}) on ClicksReferral...`);
    const authTx = await referral.setAuthorized(splitterAddress, true);
    await authTx.wait(2);
    console.log("  ✅ ClicksSplitterV3 authorized\n");
  }

  // Update deployments file
  deployments.contracts.ClicksReferral = referralAddress;
  deployments.timestamp = new Date().toISOString();
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

  const finalBal = await ethers.provider.getBalance(deployer.address);
  const gasUsed = ethers.formatEther(balance - finalBal);

  console.log(`✅ DEPLOYMENT COMPLETE!`);
  console.log(`ClicksReferral: ${referralAddress}`);
  console.log(`Gas used: ${gasUsed} ETH`);
  console.log(`Saved to deployments/base.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
