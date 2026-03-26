/**
 * Deployed contract addresses for the Clicks Protocol.
 */

export interface ClicksAddresses {
  /** ClicksRegistry contract */
  registry: string;
  /** ClicksFee contract */
  feeCollector: string;
  /** ClicksYieldRouter contract */
  yieldRouter: string;
  /** ClicksSplitterV3 contract (main entry point) */
  splitter: string;
  /** USDC token */
  usdc: string;
}

/** Base Mainnet (chain ID 8453) */
export const BASE_MAINNET: ClicksAddresses = {
  registry: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
  feeCollector: '0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE',
  yieldRouter: '0x053167a233d18E05Bc65a8d5F3F8808782a3EECD',
  splitter: '0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D',
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

/** Base Sepolia (chain ID 84532) — placeholder, update when deployed */
export const BASE_SEPOLIA: ClicksAddresses = {
  registry: '0x0000000000000000000000000000000000000000',
  feeCollector: '0x0000000000000000000000000000000000000000',
  yieldRouter: '0x0000000000000000000000000000000000000000',
  splitter: '0x0000000000000000000000000000000000000000',
  usdc: '0x0000000000000000000000000000000000000000',
};

/** Lookup by chain ID */
export const ADDRESSES_BY_CHAIN: Record<number, ClicksAddresses> = {
  8453: BASE_MAINNET,
  84532: BASE_SEPOLIA,
};
