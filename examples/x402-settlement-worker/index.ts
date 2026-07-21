import { createX402SettlementReceipt } from '@clicks-protocol/sdk';

export interface VerifiedX402PaymentEvent {
  paymentId: string;
  sellerAgent: string;
  asset: string;
  amount: string;
  payer: string;
  settlementRecipient: string;
  requestHash: string;
  quoteHash?: string;
  authorizationReference: string;
  businessEventId: string;
  policy: {
    id: string;
    version: string;
    liquidBps: number;
    treasuryBps: number;
    definition: Record<string, unknown>;
  };
  chainId: number;
  blockNumber?: number;
  operator: string;
  availableBalance: string;
}

/**
 * Accept only events that upstream x402 middleware has already verified.
 * This adapter records intent and provenance. It performs no payment action.
 */
export function normalizeVerifiedX402Payment(event: VerifiedX402PaymentEvent) {
  const observedAt = new Date().toISOString();
  return createX402SettlementReceipt({
    externalPaymentId: event.paymentId,
    agent: event.sellerAgent,
    asset: event.asset,
    grossAmount: event.amount,
    idempotencyKey: `x402:${event.paymentId}`,
    businessEventId: event.businessEventId,
    authorizationReference: event.authorizationReference,
    requestHash: event.requestHash,
    quoteHash: event.quoteHash,
    sender: event.payer,
    recipient: event.settlementRecipient,
    policy: event.policy,
    precondition: {
      chainId: event.chainId,
      observedAt,
      blockNumber: event.blockNumber,
      agentRegistered: false,
      operator: event.operator,
      availableBalance: event.availableBalance,
    },
    falsifiability: {
      claim: `Verified x402 payment ${event.paymentId} entered the Clicks settlement pipeline.`,
      verificationMethod: 'Compare upstream x402 evidence, authorization, request hash and subsequent Base evidence.',
      expectedEvidence: ['x402 payment reference', 'request hash', 'authorization reference'],
      invalidIf: ['upstream verification failed', 'amount differs', 'request differs'],
    },
  }, observedAt);
}
