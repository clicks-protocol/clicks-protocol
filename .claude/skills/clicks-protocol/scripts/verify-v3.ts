import { run } from "hardhat";

async function main() {
  // Verify YieldRouter
  await run("verify:verify", {
    address: "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD",
    constructorArguments: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB",
      "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
      {
        loanToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        collateralToken: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
        oracle: "0x663BECd10daE6C4A3Dcd89F1d76c1174199639B9",
        irm: "0x46415998764C29aB2a25CbeA6254146D50D22687",
        lltv: "860000000000000000",
      },
      "0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80",
    ],
  });

  // Verify SplitterV3
  await run("verify:verify", {
    address: "0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D",
    constructorArguments: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0x053167a233d18E05Bc65a8d5F3F8808782a3EECD",
      "0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE",
      "0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3",
    ],
  });
}

main().catch(console.error);
