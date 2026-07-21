import type { SettlementFalsifiability, SettlementPreconditionSnapshot, SettlementReceiptInput, SettlementReceiptV2 } from './receipts';
export interface SettlementIngressEvent {
    source: 'direct' | 'acp' | 'x402';
    externalPaymentId: string;
    agent: string;
    asset: string;
    grossAmount: string;
    idempotencyKey: string;
    businessEventId: string;
    authorizationReference: string;
    requestHash: string;
    quoteHash?: string;
    settlementReference?: string;
    sender?: string;
    recipient?: string;
    policy: SettlementReceiptInput['policy'];
    precondition: SettlementPreconditionSnapshot;
    falsifiability: SettlementFalsifiability;
}
/**
 * Normalize ingress metadata into a planned Receipt V2. This function records
 * intent only. It does not accept funds, submit transactions or claim that an
 * x402/ACP payment has settled.
 */
export declare function createIngressSettlementReceipt(event: SettlementIngressEvent, createdAt?: string): SettlementReceiptV2;
export declare function createDirectSettlementReceipt(event: Omit<SettlementIngressEvent, 'source'>, createdAt?: string): SettlementReceiptV2;
export declare function createAcpSettlementReceipt(event: Omit<SettlementIngressEvent, 'source'>, createdAt?: string): SettlementReceiptV2;
/** Repository-stage metadata adapter. It does not implement x402 transport. */
export declare function createX402SettlementReceipt(event: Omit<SettlementIngressEvent, 'source'>, createdAt?: string): SettlementReceiptV2;
//# sourceMappingURL=settlement-adapters.d.ts.map