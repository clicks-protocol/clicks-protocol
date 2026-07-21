const assert = require('node:assert/strict');
const test = require('node:test');

const {
  assertSettlementRetryAllowed,
  assertSettlementTransition,
  canRetrySettlement,
  canTransitionSettlement,
  createSettlementReceiptV2,
} = require('../dist');

const retryPolicy = (overrides = {}) => ({
  allowRetry: true,
  maxAttempts: 2,
  attempts: 0,
  ...overrides,
});

test('allows the normal settlement path', () => {
  assert.equal(canTransitionSettlement('planned', 'submitted'), true);
  assert.equal(canTransitionSettlement('submitted', 'chain_confirmed'), true);
  assert.equal(canTransitionSettlement('chain_confirmed', 'settled'), true);
});

test('blocks invalid state transitions', () => {
  assert.equal(canTransitionSettlement('planned', 'settled'), false);
  assert.throws(
    () => assertSettlementTransition('unknown_settled', 'submitted'),
    /Invalid settlement transition/,
  );
});

test('blocks every retry from unknown_settled', () => {
  assert.equal(canRetrySettlement('unknown_settled', retryPolicy()), false);
  assert.throws(
    () => assertSettlementRetryAllowed('unknown_settled', retryPolicy()),
    /Settlement retry blocked/,
  );
});

test('allows retry only after proven failure before transfer', () => {
  assert.equal(canRetrySettlement('failed_before_transfer', retryPolicy()), true);
  assert.equal(
    canRetrySettlement('failed_before_transfer', retryPolicy({ attempts: 2 })),
    false,
  );
  assert.equal(
    canRetrySettlement('failed_before_transfer', retryPolicy({ allowRetry: false })),
    false,
  );
});

function receiptInput(overrides = {}) {
  return {
    agent: '0x0000000000000000000000000000000000000001',
    asset: '0x0000000000000000000000000000000000000002',
    grossAmount: '1000000',
    idempotencyKey: 'order-42',
    businessEventId: 'invoice-42',
    authorizationReference: 'policy-approval-42',
    requestHash: '0xrequest',
    quoteHash: '0xquote',
    settlementReference: 'settlement-42',
    ingress: { source: 'direct', externalPaymentId: 'payment-42' },
    policy: {
      id: 'default-split',
      version: '2',
      definition: { liquidBps: 8000, treasuryBps: 2000 },
      liquidBps: 8000,
      treasuryBps: 2000,
    },
    precondition: {
      chainId: 8453,
      observedAt: '2026-07-21T20:00:00.000Z',
      blockNumber: 123,
      agentRegistered: true,
      operator: '0x0000000000000000000000000000000000000003',
      availableBalance: '1000000',
    },
    execution: {
      state: 'unknown_settled',
      liquidAmount: '800000',
      treasuryAmount: '200000',
      witnessStates: [{
        name: 'chain_inclusion',
        state: 'unknown',
        checkedAt: '2026-07-21T20:01:00.000Z',
      }],
      retryPolicy: retryPolicy(),
      reconciliationHistory: [],
    },
    falsifiability: {
      claim: 'The payment was routed under the recorded policy.',
      verificationMethod: 'Compare request, policy and chain evidence.',
      expectedEvidence: ['request hash', 'policy hash', 'transaction receipt'],
      invalidIf: ['amount differs', 'recipient differs'],
    },
    ...overrides,
  };
}

test('creates deterministic Receipt V2 with required provenance', () => {
  const input = receiptInput();
  const first = createSettlementReceiptV2(input, '2026-07-21T20:02:00.000Z');
  const second = createSettlementReceiptV2(input, '2026-07-21T20:02:00.000Z');

  assert.equal(first.schema, 'clicks.settlement.receipt.v2');
  assert.equal(first.receiptId, second.receiptId);
  assert.equal(first.idempotencyKey, 'order-42');
  assert.equal(first.execution.state, 'unknown_settled');
  assert.match(first.policy.versionHash, /^0x[0-9a-f]{64}$/);
});

test('changes receipt ID when an economic identifier changes', () => {
  const base = receiptInput();
  const first = createSettlementReceiptV2(base, '2026-07-21T20:02:00.000Z');
  const second = createSettlementReceiptV2(
    receiptInput({ idempotencyKey: 'order-43' }),
    '2026-07-21T20:02:00.000Z',
  );

  assert.notEqual(first.receiptId, second.receiptId);
});

test('rejects missing authorization provenance', () => {
  assert.throws(
    () => createSettlementReceiptV2(
      receiptInput({ authorizationReference: ' ' }),
      '2026-07-21T20:02:00.000Z',
    ),
    /authorizationReference must not be empty/,
  );
});
