"use strict";
/**
 * @clicks-protocol/sdk
 *
 * TypeScript SDK for Clicks Protocol, the agent commerce settlement router on Base.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFERRAL_ABI = exports.FEE_ABI = exports.YIELD_ROUTER_ABI = exports.SPLITTER_ABI = exports.REGISTRY_ABI = exports.ERC20_ABI = exports.ADDRESSES_BY_CHAIN = exports.BASE_SEPOLIA = exports.BASE_MAINNET = exports.createX402SettlementReceipt = exports.createIngressSettlementReceipt = exports.createDirectSettlementReceipt = exports.createAcpSettlementReceipt = exports.SettlementReceiptLedger = exports.reconcileSettlement = exports.applyReconciliationResult = exports.canTransitionSettlement = exports.canRetrySettlement = exports.assertSettlementTransition = exports.assertSettlementRetryAllowed = exports.verifySettlementReceiptV2 = exports.rehashSettlementReceiptV2 = exports.hashSettlementPolicy = exports.createSettlementReceiptV2 = exports.createSettlementReceipt = exports.ClicksClient = void 0;
// Main client
var client_1 = require("./client");
Object.defineProperty(exports, "ClicksClient", { enumerable: true, get: function () { return client_1.ClicksClient; } });
var receipts_1 = require("./receipts");
Object.defineProperty(exports, "createSettlementReceipt", { enumerable: true, get: function () { return receipts_1.createSettlementReceipt; } });
Object.defineProperty(exports, "createSettlementReceiptV2", { enumerable: true, get: function () { return receipts_1.createSettlementReceiptV2; } });
Object.defineProperty(exports, "hashSettlementPolicy", { enumerable: true, get: function () { return receipts_1.hashSettlementPolicy; } });
Object.defineProperty(exports, "rehashSettlementReceiptV2", { enumerable: true, get: function () { return receipts_1.rehashSettlementReceiptV2; } });
Object.defineProperty(exports, "verifySettlementReceiptV2", { enumerable: true, get: function () { return receipts_1.verifySettlementReceiptV2; } });
var settlement_state_1 = require("./settlement-state");
Object.defineProperty(exports, "assertSettlementRetryAllowed", { enumerable: true, get: function () { return settlement_state_1.assertSettlementRetryAllowed; } });
Object.defineProperty(exports, "assertSettlementTransition", { enumerable: true, get: function () { return settlement_state_1.assertSettlementTransition; } });
Object.defineProperty(exports, "canRetrySettlement", { enumerable: true, get: function () { return settlement_state_1.canRetrySettlement; } });
Object.defineProperty(exports, "canTransitionSettlement", { enumerable: true, get: function () { return settlement_state_1.canTransitionSettlement; } });
var reconciliation_1 = require("./reconciliation");
Object.defineProperty(exports, "applyReconciliationResult", { enumerable: true, get: function () { return reconciliation_1.applyReconciliationResult; } });
Object.defineProperty(exports, "reconcileSettlement", { enumerable: true, get: function () { return reconciliation_1.reconcileSettlement; } });
var ledger_1 = require("./ledger");
Object.defineProperty(exports, "SettlementReceiptLedger", { enumerable: true, get: function () { return ledger_1.SettlementReceiptLedger; } });
var settlement_adapters_1 = require("./settlement-adapters");
Object.defineProperty(exports, "createAcpSettlementReceipt", { enumerable: true, get: function () { return settlement_adapters_1.createAcpSettlementReceipt; } });
Object.defineProperty(exports, "createDirectSettlementReceipt", { enumerable: true, get: function () { return settlement_adapters_1.createDirectSettlementReceipt; } });
Object.defineProperty(exports, "createIngressSettlementReceipt", { enumerable: true, get: function () { return settlement_adapters_1.createIngressSettlementReceipt; } });
Object.defineProperty(exports, "createX402SettlementReceipt", { enumerable: true, get: function () { return settlement_adapters_1.createX402SettlementReceipt; } });
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
Object.defineProperty(exports, "REFERRAL_ABI", { enumerable: true, get: function () { return abis_1.REFERRAL_ABI; } });
//# sourceMappingURL=index.js.map