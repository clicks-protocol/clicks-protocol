"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSettlementPolicy = hashSettlementPolicy;
exports.createSettlementReceipt = createSettlementReceipt;
exports.createSettlementReceiptV2 = createSettlementReceiptV2;
const ethers_1 = require("ethers");
function canonicalize(value) {
    if (Array.isArray(value)) {
        return `[${value.map(canonicalize).join(',')}]`;
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value)
            .filter(([, item]) => item !== undefined)
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(',')}}`;
    }
    return JSON.stringify(value);
}
function hashSettlementPolicy(definition) {
    return (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(canonicalize(definition)));
}
function createSettlementReceipt(input, createdAt = new Date().toISOString()) {
    if (input.policy.liquidBps + input.policy.treasuryBps !== 10_000) {
        throw new Error('Settlement policy basis points must total 10000');
    }
    const policy = {
        id: input.policy.id,
        version: input.policy.version,
        versionHash: hashSettlementPolicy(input.policy.definition),
        liquidBps: input.policy.liquidBps,
        treasuryBps: input.policy.treasuryBps,
    };
    const payload = {
        schema: 'clicks.settlement.receipt.v1',
        createdAt,
        agent: input.agent,
        asset: input.asset,
        grossAmount: input.grossAmount,
        ingress: input.ingress,
        policy,
        precondition: input.precondition,
        execution: input.execution,
        falsifiability: input.falsifiability,
    };
    return {
        ...payload,
        receiptId: (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(canonicalize(payload))),
    };
}
function requireNonEmpty(value, field) {
    if (!value.trim()) {
        throw new Error(`${field} must not be empty`);
    }
}
function createSettlementReceiptV2(input, createdAt = new Date().toISOString()) {
    if (input.policy.liquidBps + input.policy.treasuryBps !== 10_000) {
        throw new Error('Settlement policy basis points must total 10000');
    }
    requireNonEmpty(input.idempotencyKey, 'idempotencyKey');
    requireNonEmpty(input.businessEventId, 'businessEventId');
    requireNonEmpty(input.authorizationReference, 'authorizationReference');
    requireNonEmpty(input.requestHash, 'requestHash');
    if (input.execution.retryPolicy.attempts < 0) {
        throw new Error('retryPolicy.attempts must not be negative');
    }
    if (input.execution.retryPolicy.maxAttempts < 0) {
        throw new Error('retryPolicy.maxAttempts must not be negative');
    }
    const policy = {
        id: input.policy.id,
        version: input.policy.version,
        versionHash: hashSettlementPolicy(input.policy.definition),
        liquidBps: input.policy.liquidBps,
        treasuryBps: input.policy.treasuryBps,
    };
    const payload = {
        schema: 'clicks.settlement.receipt.v2',
        createdAt,
        agent: input.agent,
        asset: input.asset,
        grossAmount: input.grossAmount,
        idempotencyKey: input.idempotencyKey,
        businessEventId: input.businessEventId,
        authorizationReference: input.authorizationReference,
        requestHash: input.requestHash,
        quoteHash: input.quoteHash,
        settlementReference: input.settlementReference,
        ingress: input.ingress,
        policy,
        precondition: input.precondition,
        execution: input.execution,
        falsifiability: input.falsifiability,
    };
    return {
        ...payload,
        receiptId: (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(canonicalize(payload))),
    };
}
//# sourceMappingURL=receipts.js.map