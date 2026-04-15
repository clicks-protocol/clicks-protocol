"use strict";
/**
 * Deployed contract addresses for the Clicks Protocol.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESSES_BY_CHAIN = exports.BASE_SEPOLIA = exports.BASE_MAINNET = void 0;
/** Base Mainnet (chain ID 8453) */
exports.BASE_MAINNET = {
    registry: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
    feeCollector: '0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5',
    yieldRouter: '0x053167a233d18E05Bc65a8d5F3F8808782a3EECD',
    splitter: '0xB7E0016d543bD443ED2A6f23d5008400255bf3C8',
    referral: '0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};
/** Base Sepolia (chain ID 84532) — placeholder, update when deployed */
exports.BASE_SEPOLIA = {
    registry: '0x0000000000000000000000000000000000000000',
    feeCollector: '0x0000000000000000000000000000000000000000',
    yieldRouter: '0x0000000000000000000000000000000000000000',
    splitter: '0x0000000000000000000000000000000000000000',
    referral: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
};
/** Lookup by chain ID */
exports.ADDRESSES_BY_CHAIN = {
    8453: exports.BASE_MAINNET,
    84532: exports.BASE_SEPOLIA,
};
//# sourceMappingURL=addresses.js.map