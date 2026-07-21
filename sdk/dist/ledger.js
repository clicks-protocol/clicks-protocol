"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementReceiptLedger = void 0;
const ethers_1 = require("ethers");
const receipts_1 = require("./receipts");
const settlement_state_1 = require("./settlement-state");
function ledgerEntryHash(sequence, recordedAt, previousEntryHash, receiptId) {
    return (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(JSON.stringify({ sequence, recordedAt, previousEntryHash, receiptId })));
}
class SettlementReceiptLedger {
    entries;
    constructor(entries = []) {
        this.entries = entries.map((entry) => structuredClone(entry));
        if (!this.verify())
            throw new Error('Invalid settlement ledger');
    }
    append(receipt, recordedAt = new Date().toISOString()) {
        if (!(0, receipts_1.verifySettlementReceiptV2)(receipt))
            throw new Error('Invalid settlement receipt hash');
        const sameReceipt = this.entries.find((entry) => entry.receipt.receiptId === receipt.receiptId);
        if (sameReceipt)
            throw new Error(`Duplicate settlement receipt: ${receipt.receiptId}`);
        const sameIdempotencyKey = [...this.entries].reverse().find((entry) => entry.receipt.idempotencyKey === receipt.idempotencyKey);
        if (sameIdempotencyKey) {
            const previous = sameIdempotencyKey.receipt;
            const sameEconomicEvent = previous.businessEventId === receipt.businessEventId
                && previous.agent.toLowerCase() === receipt.agent.toLowerCase()
                && previous.asset.toLowerCase() === receipt.asset.toLowerCase()
                && previous.grossAmount === receipt.grossAmount
                && previous.requestHash === receipt.requestHash;
            if (!sameEconomicEvent) {
                throw new Error(`Idempotency conflict: ${receipt.idempotencyKey}`);
            }
            if (previous.execution.state !== receipt.execution.state) {
                (0, settlement_state_1.assertSettlementTransition)(previous.execution.state, receipt.execution.state);
            }
        }
        const previous = this.entries.at(-1);
        const sequence = this.entries.length;
        const previousEntryHash = previous?.entryHash ?? null;
        const entry = {
            sequence,
            recordedAt,
            previousEntryHash,
            entryHash: ledgerEntryHash(sequence, recordedAt, previousEntryHash, receipt.receiptId),
            receipt: structuredClone(receipt),
        };
        this.entries.push(entry);
        return structuredClone(entry);
    }
    getTrail(id) {
        return this.entries
            .filter((entry) => entry.receipt.receiptId === id
            || entry.receipt.idempotencyKey === id
            || entry.receipt.businessEventId === id
            || entry.receipt.settlementReference === id)
            .map((entry) => structuredClone(entry));
    }
    export() {
        return this.entries.map((entry) => structuredClone(entry));
    }
    verify() {
        const receiptIds = new Set();
        const latestByIdempotencyKey = new Map();
        for (let index = 0; index < this.entries.length; index += 1) {
            const entry = this.entries[index];
            const expectedPrevious = index === 0 ? null : this.entries[index - 1].entryHash;
            if (entry.sequence !== index || entry.previousEntryHash !== expectedPrevious)
                return false;
            if (!(0, receipts_1.verifySettlementReceiptV2)(entry.receipt))
                return false;
            if (entry.entryHash !== ledgerEntryHash(index, entry.recordedAt, expectedPrevious, entry.receipt.receiptId))
                return false;
            if (receiptIds.has(entry.receipt.receiptId))
                return false;
            receiptIds.add(entry.receipt.receiptId);
            const previous = latestByIdempotencyKey.get(entry.receipt.idempotencyKey);
            if (previous) {
                const sameEconomicEvent = previous.businessEventId === entry.receipt.businessEventId
                    && previous.agent.toLowerCase() === entry.receipt.agent.toLowerCase()
                    && previous.asset.toLowerCase() === entry.receipt.asset.toLowerCase()
                    && previous.grossAmount === entry.receipt.grossAmount
                    && previous.requestHash === entry.receipt.requestHash;
                if (!sameEconomicEvent)
                    return false;
                if (previous.execution.state !== entry.receipt.execution.state) {
                    try {
                        (0, settlement_state_1.assertSettlementTransition)(previous.execution.state, entry.receipt.execution.state);
                    }
                    catch {
                        return false;
                    }
                }
            }
            latestByIdempotencyKey.set(entry.receipt.idempotencyKey, entry.receipt);
        }
        return true;
    }
}
exports.SettlementReceiptLedger = SettlementReceiptLedger;
//# sourceMappingURL=ledger.js.map