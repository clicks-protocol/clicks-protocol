import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: BASE_SEPOLIA_RPC_URL,
        enabled: process.env.FORK === "true",
      },
    },
    "base-sepolia": {
      url: BASE_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: BASE_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: BASESCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
