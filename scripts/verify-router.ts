import { run } from "hardhat";
import { ethers } from "hardhat";

const ROUTER_ADDRESS = "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AAVE_POOL = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
const A_USDC = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";
const MORPHO = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";
const DEPLOYER = "0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80"; // placeholder splitter während Deployment

const MORPHO_MARKET_PARAMS = {
  loanToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  collateralToken: "0x4200000000000000000000000000000000000006",
  oracle: "0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8",
  irm: "0x46415998764C29aB2a25CbeA6254146D50D22687",
  lltv: ethers.parseEther("0.86"),
};

async function main() {
  console.log("🔍 Verifiziere ClicksYieldRouter auf Basescan...");
  console.log(`Adresse: ${ROUTER_ADDRESS}`);
  console.log("");

  try {
    await run("verify:verify", {
      address: ROUTER_ADDRESS,
      constructorArguments: [
        USDC,
        AAVE_POOL,
        A_USDC,
        MORPHO,
        MORPHO_MARKET_PARAMS,
        DEPLOYER,
      ],
    });
    console.log("✅ ClicksYieldRouter erfolgreich verifiziert!");
  } catch (err: any) {
    if (err.message.includes("Already Verified")) {
      console.log("ℹ️  Contract ist bereits verifiziert");
    } else {
      console.error("❌ Verifikation fehlgeschlagen:", err.message);
      throw err;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
