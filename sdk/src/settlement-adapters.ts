import type {
  SettlementFalsifiability,
  SettlementPreconditionSnapshot,
  SettlementReceiptInput,
  SettlementReceiptV2,
} from './receipts';
import { createSettlementReceiptV2 } from './receipts';

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
export function createIngressSettlementReceipt(
  event: SettlementIngressEvent,
  createdAt = new Date().toISOString(),
): SettlementReceiptV2 {
  return createSettlementReceiptV2({
    agent: event.agent,
    asset: event.asset,
    grossAmount: event.grossAmount,
    idempotencyKey: event.idempotencyKey,
    businessEventId: event.businessEventId,
    authorizationReference: event.authorizationReference,
    requestHash: event.requestHash,
    quoteHash: event.quoteHash,
    settlementReference: event.settlementReference,
    ingress: {
      source: event.source,
      externalPaymentId: event.externalPaymentId,
    },
    policy: event.policy,
    precondition: event.precondition,
    execution: {
      state: 'planned',
      liquidAmount: '0',
      treasuryAmount: '0',
      sender: event.sender,
      recipient: event.recipient,
      witnessStates: [],
      retryPolicy: { allowRetry: false, maxAttempts: 0, attempts: 0 },
      reconciliationHistory: [],
    },
    falsifiability: event.falsifiability,
  }, createdAt);
}

export function createDirectSettlementReceipt(
  event: Omit<SettlementIngressEvent, 'source'>,
  createdAt?: string,
): SettlementReceiptV2 {
  return createIngressSettlementReceipt({ ...event, source: 'direct' }, createdAt);
}

export function createAcpSettlementReceipt(
  event: Omit<SettlementIngressEvent, 'source'>,
  createdAt?: string,
): SettlementReceiptV2 {
  return createIngressSettlementReceipt({ ...event, source: 'acp' }, createdAt);
}

/** Repository-stage metadata adapter. It does not implement x402 transport. */
export function createX402SettlementReceipt(
  event: Omit<SettlementIngressEvent, 'source'>,
  createdAt?: string,
): SettlementReceiptV2 {
  return createIngressSettlementReceipt({ ...event, source: 'x402' }, createdAt);
}
