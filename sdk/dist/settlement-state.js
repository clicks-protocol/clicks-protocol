"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransitionSettlement = canTransitionSettlement;
exports.assertSettlementTransition = assertSettlementTransition;
exports.canRetrySettlement = canRetrySettlement;
exports.assertSettlementRetryAllowed = assertSettlementRetryAllowed;
const ALLOWED_TRANSITIONS = {
    planned: ['submitted', 'failed_before_transfer'],
    submitted: ['chain_confirmed', 'unknown_settled', 'reconciliation_required', 'reconciled', 'failed_before_transfer'],
    chain_confirmed: ['settled', 'unknown_settled', 'reconciliation_required', 'reconciled', 'disputed'],
    settled: ['disputed'],
    unknown_settled: ['reconciliation_required', 'reconciled', 'failed_before_transfer', 'disputed'],
    reconciliation_required: ['reconciled', 'failed_before_transfer', 'disputed'],
    reconciled: ['settled', 'failed_before_transfer', 'disputed'],
    failed_before_transfer: ['submitted'],
    disputed: [],
};
function canTransitionSettlement(from, to) {
    return ALLOWED_TRANSITIONS[from].includes(to);
}
function assertSettlementTransition(from, to) {
    if (!canTransitionSettlement(from, to)) {
        throw new Error(`Invalid settlement transition: ${from} -> ${to}`);
    }
}
/**
 * Retry is fail-closed. A retry is possible only when independent evidence
 * proves that no transfer was submitted.
 */
function canRetrySettlement(state, policy) {
    return (state === 'failed_before_transfer'
        && policy.allowRetry
        && policy.attempts < policy.maxAttempts);
}
function assertSettlementRetryAllowed(state, policy) {
    if (!canRetrySettlement(state, policy)) {
        throw new Error(`Settlement retry blocked for state: ${state}`);
    }
}
//# sourceMappingURL=settlement-state.js.map