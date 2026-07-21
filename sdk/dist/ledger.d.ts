import type { SettlementReceiptV2 } from './receipts';
export interface SettlementLedgerEntry {
    sequence: number;
    recordedAt: string;
    previousEntryHash: string | null;
    entryHash: string;
    receipt: SettlementReceiptV2;
}
export declare class SettlementReceiptLedger {
    private readonly entries;
    constructor(entries?: SettlementLedgerEntry[]);
    append(receipt: SettlementReceiptV2, recordedAt?: string): SettlementLedgerEntry;
    getTrail(id: string): SettlementLedgerEntry[];
    export(): SettlementLedgerEntry[];
    verify(): boolean;
}
//# sourceMappingURL=ledger.d.ts.map