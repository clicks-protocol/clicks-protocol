"use strict";
/**
 * @clicks-protocol/sdk
 *
 * TypeScript SDK for the Clicks Protocol — on-chain yield for AI agents on Base.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEE_ABI = exports.YIELD_ROUTER_ABI = exports.SPLITTER_ABI = exports.REGISTRY_ABI = exports.ERC20_ABI = exports.ADDRESSES_BY_CHAIN = exports.BASE_SEPOLIA = exports.BASE_MAINNET = exports.ClicksClient = void 0;
// Main client
var client_1 = require("./client");
Object.defineProperty(exports, "ClicksClient", { enumerable: true, get: function () { return client_1.ClicksClient; } });
// Addresses
var addresses_1 = require("./addresses");
Object.defineProperty(exports, "BASE_MAINNET", { enumerable: true, get: function () { return addresses_1.BASE_MAINNET; } });
Object.defineProperty(exports, "BASE_SEPOLIA", { enumerable: true, get: function () { return addresses_1.BASE_SEPOLIA; } });
Object.defineProperty(exports, "ADDRESSES_BY_CHAIN", { enumerable: true, get: function () { return addresses_1.ADDRESSES_BY_CHAIN; } });
// ABIs (for advanced users)
var abis_1 = require("./abis");
Object.defineProperty(exports, "ERC20_ABI", { enumerable: true, get: function () { return abis_1.ERC20_ABI; } });
Object.defineProperty(exports, "REGISTRY_ABI", { enumerable: true, get: function () { return abis_1.REGISTRY_ABI; } });
Object.defineProperty(exports, "SPLITTER_ABI", { enumerable: true, get: function () { return abis_1.SPLITTER_ABI; } });
Object.defineProperty(exports, "YIELD_ROUTER_ABI", { enumerable: true, get: function () { return abis_1.YIELD_ROUTER_ABI; } });
Object.defineProperty(exports, "FEE_ABI", { enumerable: true, get: function () { return abis_1.FEE_ABI; } });
//# sourceMappingURL=index.js.map