/**
 * Deployed contract addresses for the Clicks Protocol.
 */
export interface ClicksAddresses {
    /** ClicksRegistry contract */
    registry: string;
    /** ClicksFeeV2 contract (with referral distribution) */
    feeCollector: string;
    /** ClicksYieldRouter contract */
    yieldRouter: string;
    /** ClicksSplitterV4 contract (main entry point, with referral) */
    splitter: string;
    /** ClicksReferral contract */
    referral: string;
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