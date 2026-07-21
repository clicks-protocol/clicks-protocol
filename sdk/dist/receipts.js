"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSettlementPolicy = hashSettlementPolicy;
exports.createSettlementReceipt = createSettlementReceipt;
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
//# sourceMappingURL=receipts.js.map