const { ethers } = require("ethers");
module.exports = [
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // usdc
  "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // aavePool
  "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB", // aUsdc
  "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb", // morpho
  {
    loanToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    collateralToken: "0x4200000000000000000000000000000000000006",
    oracle: "0xfea2d58ceFCb9fCb597723d6F7D3b7c5c2e8B6f8",
    irm: "0x46415998764C29aB2a25CbeA6254146D50D22687",
    lltv: ethers.parseEther("0.86"),
  },
  "0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80", // placeholder splitter (deployer)
];
