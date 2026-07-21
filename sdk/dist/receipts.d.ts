import type { SettlementRetryPolicy, SettlementState } from './settlement-state';
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
export type SettlementWitnessState = 'confirmed' | 'missing' | 'unknown' | 'conflicting';
export interface SettlementWitness {
    name: 'chain_inclusion' | 'merchant_settlement' | 'delivery' | 'local_receipt' | 'external_payment';
    state: SettlementWitnessState;
    checkedAt: string;
    reference?: string;
    detail?: string;
}
export interface SettlementDeliveryEvidence {
    status: 'not_required' | 'pending' | 'delivered' | 'rejected' | 'unknown';
    reference?: string;
    evidenceHash?: string;
}
export interface SettlementReconciliationEvent {
    checkedAt: string;
    result: 'confirmed' | 'not_executed' | 'unknown' | 'conflicting_evidence';
    previousState: SettlementState;
    nextState: SettlementState;
    evidence: string[];
    note?: string;
}
export interface SettlementExecutionV2 {
    state: SettlementState;
    /** Amount retained as working capital, in base units. */
    liquidAmount: string;
    /** Amount sent to the configured treasury route, in base units. */
    treasuryAmount: string;
    txHash?: string;
    blockNumber?: number;
    nonce?: number;
    failedWitness?: SettlementWitness['name'];
    witnessStates: SettlementWitness[];
    retryPolicy: SettlementRetryPolicy;
    deliveryEvidence?: SettlementDeliveryEvidence;
    reconciliationHistory: SettlementReconciliationEvent[];
}
export interface SettlementReceiptV2Input {
    agent: string;
    asset: string;
    grossAmount: string;
    idempotencyKey: string;
    businessEventId: string;
    authorizationReference: string;
    requestHash: string;
    quoteHash?: string;
    settlementReference?: string;
    ingress: SettlementReceiptInput['ingress'];
    policy: SettlementReceiptInput['policy'];
    precondition: SettlementPreconditionSnapshot;
    execution: SettlementExecutionV2;
    falsifiability: SettlementFalsifiability;
}
export interface SettlementReceiptV2 {
    schema: 'clicks.settlement.receipt.v2';
    receiptId: string;
    createdAt: string;
    agent: string;
    asset: string;
    grossAmount: string;
    idempotencyKey: string;
    businessEventId: string;
    authorizationReference: string;
    requestHash: string;
    quoteHash?: string;
    settlementReference?: string;
    ingress: SettlementReceiptInput['ingress'];
    policy: SettlementPolicySnapshot;
    precondition: SettlementPreconditionSnapshot;
    execution: SettlementExecutionV2;
    falsifiability: SettlementFalsifiability;
}
export declare function hashSettlementPolicy(definition: Record<string, unknown>): string;
export declare function createSettlementReceipt(input: SettlementReceiptInput, createdAt?: string): SettlementReceiptV1;
export declare function createSettlementReceiptV2(input: SettlementReceiptV2Input, createdAt?: string): SettlementReceiptV2;
//# sourceMappingURL=receipts.d.ts.map