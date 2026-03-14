import { run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const networkName = network.name;
  const deploymentsPath = path.join(__dirname, `../deployments/${networkName}.json`);

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(`No deployment found for ${networkName}. Run deploy.ts first.`);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const { contracts, externalAddresses } = deployments;

  console.log(`\n🔍 Verifying contracts on ${networkName}...\n`);

  // ClicksRegistry
  await verify(contracts.ClicksRegistry, []);

  // ClicksFee
  await verify(contracts.ClicksFee, [
    externalAddresses.usdc,
    externalAddresses.treasury,
  ]);

  // ClicksYieldRouter — morpho market params must match deploy exactly
  const morphoParams = [
    externalAddresses.usdc,
    "0x4200000000000000000000000000000000000006",
    "0xFEa2D58cEfCb9fcb597723d6F7D3b7c5C2E8B6F8",
    "0x46415998764C29aB2a25CbeA6254146D50D22687",
    "860000000000000000",
  ];
  await verify(contracts.ClicksYieldRouter, [
    externalAddresses.usdc,
    externalAddresses.aavePool,
    externalAddresses.aUsdc,
    externalAddresses.morpho,
    morphoParams,
    contracts.ClicksSplitterV3,
  ]);

  // ClicksSplitterV3
  await verify(contracts.ClicksSplitterV3, [
    externalAddresses.usdc,
    contracts.ClicksYieldRouter,
    contracts.ClicksFee,
    contracts.ClicksRegistry,
  ]);

  console.log("\n✅ All contracts verified!");
}

async function verify(address: string, constructorArgs: unknown[]) {
  console.log(`Verifying ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log(`  ✅ Verified`);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Already Verified")) {
      console.log(`  ℹ️  Already verified`);
    } else {
      console.error(`  ❌ Failed:`, e);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
