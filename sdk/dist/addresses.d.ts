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
export declare const BASE_MAINNET: ClicksAddresses;
/** Base Sepolia (chain ID 84532) — placeholder, update when deployed */
export declare const BASE_SEPOLIA: ClicksAddresses;
/** Lookup by chain ID */
export declare const ADDRESSES_BY_CHAIN: Record<number, ClicksAddresses>;
//# sourceMappingURL=addresses.d.ts.map