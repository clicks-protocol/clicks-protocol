export type SettlementIngress = 'x402' | 'acp' | 'direct' | 'other';
export type SettlementReceiptStatus = 'planned' | 'submitted' | 'confirmed' | 'failed';
export interface SettlementPolicySnapshot {
    /** Stable policy identifier chosen by the integrator. */
    id: string;
    /** Human-readable policy version. */
    version: string;
    /** Hash of the exact policy object used for this settlement. */
    versionHash: string;
    /** Share retained as working capital, in basis points. */
    liquidBps: number;
    /** Share sent to the configured treasury route, in basis points. */
    treasuryBps: number;
}
export interface SettlementPreconditionSnapshot {
    chainId: number;
    observedAt: string;
    blockNumber?: number;
    agentRegistered: boolean;
    operator: string;
    /** Available asset balance before settlement, in base units. */
    availableBalance: string;
}
export interface SettlementFalsifiability {
    /** Narrow claim this receipt is intended to support. */
    claim: string;
    /** Procedure another system can use to check the claim. */
    verificationMethod: string;
    /** Evidence expected when the claim is true. */
    expectedEvidence: string[];
    /** Conditions that invalidate the claim. */
    invalidIf: string[];
}
export interface SettlementExecution {
    status: SettlementReceiptStatus;
    /** Amount retained as working capital, in base units. */
    liquidAmount: string;
    /** Amount sent to the configured treasury route, in base units. */
    treasuryAmount: string;
    txHash?: string;
    blockNumber?: number;
}
export interface SettlementReceiptInput {
    agent: string;
    asset: string;
    grossAmount: string;
    ingress: {
        source: SettlementIngress;
        externalPaymentId?: string;
    };
    policy: Omit<SettlementPolicySnapshot, 'versionHash'> & {
        /** Exact policy data whose canonical hash is bound to the receipt. */
        definition: Record<string, unknown>;
    };
    precondition: SettlementPreconditionSnapshot;
    execution: SettlementExecution;
    falsifiability: SettlementFalsifiability;
}
export interface SettlementReceiptV1 {
    schema: 'clicks.settlement.receipt.v1';
    receiptId: string;
    createdAt: string;
    agent: string;
    asset: string;
    grossAmount: string;
    ingress: SettlementReceiptInput['ingress'];
    policy: SettlementPolicySnapshot;
    precondition: SettlementPreconditionSnapshot;
    execution: SettlementExecution;
    falsifiability: SettlementFalsifiability;
}
export declare function hashSettlementPolicy(definition: Record<string, unknown>): string;
export declare function createSettlementReceipt(input: SettlementReceiptInput, createdAt?: string): SettlementReceiptV1;
//# sourceMappingURL=receipts.d.ts.map