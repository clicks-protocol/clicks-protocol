"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIngressSettlementReceipt = createIngressSettlementReceipt;
exports.createDirectSettlementReceipt = createDirectSettlementReceipt;
exports.createAcpSettlementReceipt = createAcpSettlementReceipt;
exports.createX402SettlementReceipt = createX402SettlementReceipt;
const receipts_1 = require("./receipts");
/**
 * Normalize ingress metadata into a planned Receipt V2. This function records
 * intent only. It does not accept funds, submit transactions or claim that an
 * x402/ACP payment has settled.
 */
function createIngressSettlementReceipt(event, createdAt = new Date().toISOString()) {
    return (0, receipts_1.createSettlementReceiptV2)({
        agent: event.agent,
        asset: event.asset,
        grossAmount: event.grossAmount,
        idempotencyKey: event.idempotencyKey,
        businessEventId: event.businessEventId,
        authorizationReference: event.authorizationReference,
        requestHash: event.requestHash,
        quoteHash: event.quoteHash,
        settlementReference: event.settlementReference,
        ingress: {
            source: event.source,
            externalPaymentId: event.externalPaymentId,
        },
        policy: event.policy,
        precondition: event.precondition,
        execution: {
            state: 'planned',
            liquidAmount: '0',
            treasuryAmount: '0',
            sender: event.sender,
            recipient: event.recipient,
            witnessStates: [],
            retryPolicy: { allowRetry: false, maxAttempts: 0, attempts: 0 },
            reconciliationHistory: [],
        },
        falsifiability: event.falsifiability,
    }, createdAt);
}
function createDirectSettlementReceipt(event, createdAt) {
    return createIngressSettlementReceipt({ ...event, source: 'direct' }, createdAt);
}
function createAcpSettlementReceipt(event, createdAt) {
    return createIngressSettlementReceipt({ ...event, source: 'acp' }, createdAt);
}
/** Repository-stage metadata adapter. It does not implement x402 transport. */
function createX402SettlementReceipt(event, createdAt) {
    return createIngressSettlementReceipt({ ...event, source: 'x402' }, createdAt);
}
//# sourceMappingURL=settlement-adapters.js.map