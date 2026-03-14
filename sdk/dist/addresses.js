"use strict";
/**
 * Deployed contract addresses for the Clicks Protocol.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESSES_BY_CHAIN = exports.BASE_SEPOLIA = exports.BASE_MAINNET = void 0;
/** Base Mainnet (chain ID 8453) */
exports.BASE_MAINNET = {
    registry: '0x898d8a3B04e5E333E88f798372129C6a622fF48d',
    feeCollector: '0xb90cd287d30587dAF40B2E1ce32cefA99FD10E12',
    yieldRouter: '0x47d6Add0a3bdFe856b39a0311D8c055481F76f29',
    splitter: '0xA1D0c1D6EaE051a2d01319562828b297Be96Bac5',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};
/** Base Sepolia (chain ID 84532) — placeholder, update when deployed */
exports.BASE_SEPOLIA = {
    registry: '0x0000000000000000000000000000000000000000',
    feeCollector: '0x0000000000000000000000000000000000000000',
    yieldRouter: '0x0000000000000000000000000000000000000000',
    splitter: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
};
/** Lookup by chain ID */
exports.ADDRESSES_BY_CHAIN = {
    8453: exports.BASE_MAINNET,
    84532: exports.BASE_SEPOLIA,
};
//# sourceMappingURL=addresses.js.map