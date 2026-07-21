export type SettlementState = 'planned' | 'submitted' | 'chain_confirmed' | 'settled' | 'unknown_settled' | 'reconciliation_required' | 'reconciled' | 'failed_before_transfer' | 'disputed';
export interface SettlementRetryPolicy {
    allowRetry: boolean;
    maxAttempts: number;
    attempts: number;
}
export declare function canTransitionSettlement(from: SettlementState, to: SettlementState): boolean;
export declare function assertSettlementTransition(from: SettlementState, to: SettlementState): void;
/**
 * Retry is fail-closed. A retry is possible only when independent evidence
 * proves that no transfer was submitted.
 */
export declare function canRetrySettlement(state: SettlementState, policy: SettlementRetryPolicy): boolean;
export declare function assertSettlementRetryAllowed(state: SettlementState, policy: SettlementRetryPolicy): void;
//# sourceMappingURL=settlement-state.d.ts.map