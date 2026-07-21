import type { SettlementReceiptV2, SettlementReconciliationEvent, SettlementWitness } from './receipts';
import type { SettlementState } from './settlement-state';
export interface ChainTransactionEvidence {
    found: boolean;
    /** True only when sender/nonce evidence proves that no transfer was submitted. */
    absenceProven?: boolean;
    txHash?: string;
    status?: 'confirmed' | 'reverted' | 'pending';
    from?: string;
    to?: string;
    nonce?: number;
    blockNumber?: number;
}
export interface ExternalSettlementEvidence {
    found: boolean;
    status?: 'settled' | 'failed' | 'pending' | 'unknown';
    reference?: string;
}
export interface ReconciliationReader {
    getChainTransaction(receipt: SettlementReceiptV2): Promise<ChainTransactionEvidence>;
    getExternalSettlement?(receipt: SettlementReceiptV2): Promise<ExternalSettlementEvidence>;
}
export interface ReconciliationResult {
    result: SettlementReconciliationEvent['result'];
    nextState: SettlementState;
    witnesses: SettlementWitness[];
    evidence: string[];
    checkedAt: string;
}
export declare function reconcileSettlement(receipt: SettlementReceiptV2, reader: ReconciliationReader, checkedAt?: string): Promise<ReconciliationResult>;
export declare function applyReconciliationResult(receipt: SettlementReceiptV2, result: ReconciliationResult): SettlementReceiptV2;
//# sourceMappingURL=reconciliation.d.ts.map