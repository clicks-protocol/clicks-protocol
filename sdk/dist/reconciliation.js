"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileSettlement = reconcileSettlement;
exports.applyReconciliationResult = applyReconciliationResult;
const receipts_1 = require("./receipts");
const settlement_state_1 = require("./settlement-state");
function equalAddress(left, right) {
    if (!left || !right)
        return true;
    return left.toLowerCase() === right.toLowerCase();
}
async function reconcileSettlement(receipt, reader, checkedAt = new Date().toISOString()) {
    const chain = await reader.getChainTransaction(receipt);
    const external = reader.getExternalSettlement
        ? await reader.getExternalSettlement(receipt)
        : undefined;
    const witnesses = [];
    const evidence = [];
    let chainConflict = false;
    if (!chain.found) {
        witnesses.push({ name: 'chain_inclusion', state: 'missing', checkedAt });
        evidence.push('chain transaction not found');
    }
    else {
        chainConflict = Boolean((receipt.execution.txHash && chain.txHash && receipt.execution.txHash.toLowerCase() !== chain.txHash.toLowerCase())
            || (receipt.execution.nonce !== undefined && chain.nonce !== undefined && receipt.execution.nonce !== chain.nonce)
            || !equalAddress(receipt.execution.sender, chain.from)
            || !equalAddress(receipt.execution.recipient, chain.to));
        witnesses.push({
            name: 'chain_inclusion',
            state: chainConflict ? 'conflicting' : chain.status === 'confirmed' ? 'confirmed' : 'unknown',
            checkedAt,
            reference: chain.txHash,
            detail: chain.status,
        });
        evidence.push(`chain status: ${chain.status ?? 'unknown'}`);
    }
    if (external) {
        witnesses.push({
            name: 'external_payment',
            state: external.status === 'settled' ? 'confirmed' : external.found ? 'unknown' : 'missing',
            checkedAt,
            reference: external.reference,
            detail: external.status,
        });
        evidence.push(`external settlement: ${external.status ?? 'not found'}`);
    }
    let result;
    let nextState;
    if (chainConflict || external?.status === 'failed' || chain.status === 'reverted') {
        result = 'conflicting_evidence';
        nextState = 'disputed';
    }
    else if (chain.found && chain.status === 'confirmed' && (!external || external.status === 'settled')) {
        result = 'confirmed';
        nextState = 'reconciled';
    }
    else if (chain.absenceProven && !chain.found && (!external || !external.found)) {
        result = 'not_executed';
        nextState = 'failed_before_transfer';
    }
    else {
        result = 'unknown';
        nextState = 'reconciliation_required';
    }
    if (receipt.execution.state !== nextState) {
        (0, settlement_state_1.assertSettlementTransition)(receipt.execution.state, nextState);
    }
    return { result, nextState, witnesses, evidence, checkedAt };
}
function applyReconciliationResult(receipt, result) {
    const event = {
        checkedAt: result.checkedAt,
        result: result.result,
        previousState: receipt.execution.state,
        nextState: result.nextState,
        evidence: result.evidence,
    };
    const { receiptId: _oldReceiptId, ...payload } = receipt;
    return (0, receipts_1.rehashSettlementReceiptV2)({
        ...payload,
        execution: {
            ...receipt.execution,
            state: result.nextState,
            failedWitness: result.witnesses.find((witness) => witness.state !== 'confirmed')?.name,
            witnessStates: result.witnesses,
            reconciliationHistory: [...receipt.execution.reconciliationHistory, event],
        },
    });
}
//# sourceMappingURL=reconciliation.js.map