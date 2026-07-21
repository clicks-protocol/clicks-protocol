const assert = require('node:assert/strict');
const test = require('node:test');

const {
  SettlementReceiptLedger,
  applyReconciliationResult,
  canRetrySettlement,
  createAcpSettlementReceipt,
  createX402SettlementReceipt,
  createSettlementReceiptV2,
  reconcileSettlement,
  rehashSettlementReceiptV2,
  verifySettlementReceiptV2,
} = require('../dist');

function input(overrides = {}) {
  return {
    agent: '0x0000000000000000000000000000000000000001',
    asset: '0x0000000000000000000000000000000000000002',
    grossAmount: '1000000',
    idempotencyKey: 'order-42',
    businessEventId: 'invoice-42',
    authorizationReference: 'approval-42',
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
      agentRegistered: true,
      operator: '0x0000000000000000000000000000000000000003',
      availableBalance: '1000000',
    },
    execution: {
      state: 'unknown_settled',
      liquidAmount: '800000',
      treasuryAmount: '200000',
      txHash: '0xabc',
      nonce: 7,
      sender: '0x0000000000000000000000000000000000000003',
      recipient: '0x0000000000000000000000000000000000000004',
      witnessStates: [],
      retryPolicy: { allowRetry: true, maxAttempts: 2, attempts: 0 },
      reconciliationHistory: [],
    },
    falsifiability: {
      claim: 'Settlement evidence matches the authorized request.',
      verificationMethod: 'Compare independent witnesses.',
      expectedEvidence: ['chain transaction'],
      invalidIf: ['hash differs'],
    },
    ...overrides,
  };
}

const at = '2026-07-21T20:02:00.000Z';

test('reconciles a confirmed chain transaction after an API response was lost', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({
      found: true,
      txHash: '0xabc',
      status: 'confirmed',
      nonce: 7,
      from: receipt.execution.sender,
      to: receipt.execution.recipient,
      blockNumber: 99,
    }),
  }, at);

  assert.equal(result.result, 'confirmed');
  assert.equal(result.nextState, 'reconciled');
  const updated = applyReconciliationResult(receipt, result);
  assert.equal(verifySettlementReceiptV2(updated), true);
  assert.equal(updated.execution.reconciliationHistory.length, 1);
  assert.notEqual(updated.receiptId, receipt.receiptId);
});

test('proves no transfer and permits only the bounded retry path', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: false, absenceProven: true }),
  }, at);
  const updated = applyReconciliationResult(receipt, result);

  assert.equal(result.result, 'not_executed');
  assert.equal(updated.execution.state, 'failed_before_transfer');
  assert.equal(canRetrySettlement(updated.execution.state, updated.execution.retryPolicy), true);
});

test('does not treat an RPC miss as proof that no transfer occurred', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: false }),
  }, at);

  assert.equal(result.result, 'unknown');
  assert.equal(result.nextState, 'reconciliation_required');
  assert.equal(canRetrySettlement(result.nextState, receipt.execution.retryPolicy), false);
});

test('keeps chain-confirmed but merchant-unknown settlement fail closed', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: true, txHash: '0xabc', status: 'confirmed', nonce: 7 }),
    getExternalSettlement: async () => ({ found: true, status: 'unknown', reference: 'merchant-42' }),
  }, at);

  assert.equal(result.result, 'unknown');
  assert.equal(result.nextState, 'reconciliation_required');
  assert.equal(canRetrySettlement(result.nextState, receipt.execution.retryPolicy), false);
});

test('marks a mismatched transaction hash as disputed', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: true, txHash: '0xwrong', status: 'confirmed', nonce: 7 }),
  }, at);

  assert.equal(result.result, 'conflicting_evidence');
  assert.equal(result.nextState, 'disputed');
});

test('detects receipt tampering after a policy change', () => {
  const receipt = createSettlementReceiptV2(input(), at);
  receipt.policy.versionHash = '0xdeadbeef';
  assert.equal(verifySettlementReceiptV2(receipt), false);
});

test('maintains an append-only hash chain across restart', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const ledger = new SettlementReceiptLedger();
  ledger.append(receipt, at);

  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: true, txHash: '0xabc', status: 'confirmed', nonce: 7 }),
  }, at);
  const updated = applyReconciliationResult(receipt, result);
  ledger.append(updated, '2026-07-21T20:03:00.000Z');

  const restored = new SettlementReceiptLedger(JSON.parse(JSON.stringify(ledger.export())));
  assert.equal(restored.verify(), true);
  assert.equal(restored.getTrail('order-42').length, 2);
});

test('rejects a modified ledger entry on restart', () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const ledger = new SettlementReceiptLedger();
  ledger.append(receipt, at);
  const exported = ledger.export();
  exported[0].receipt.grossAmount = '2000000';

  assert.throws(() => new SettlementReceiptLedger(exported), /Invalid settlement ledger/);
});

test('accepts a status revision for the same idempotent economic event', async () => {
  const receipt = createSettlementReceiptV2(input(), at);
  const ledger = new SettlementReceiptLedger();
  ledger.append(receipt, at);
  const result = await reconcileSettlement(receipt, {
    getChainTransaction: async () => ({ found: true, txHash: '0xabc', status: 'confirmed', nonce: 7 }),
  }, at);
  const updated = applyReconciliationResult(receipt, result);

  assert.doesNotThrow(() => ledger.append(updated, '2026-07-21T20:03:00.000Z'));
});

test('rejects the same idempotency key with a changed amount', () => {
  const ledger = new SettlementReceiptLedger();
  ledger.append(createSettlementReceiptV2(input(), at), at);
  const changed = createSettlementReceiptV2(input({ grossAmount: '2000000' }), at);

  assert.throws(() => ledger.append(changed, at), /Idempotency conflict/);
});

test('deduplicates an identical request before it can execute twice', () => {
  const ledger = new SettlementReceiptLedger();
  const receipt = createSettlementReceiptV2(input(), at);
  ledger.append(receipt, at);

  assert.throws(() => ledger.append(receipt, at), /Duplicate settlement receipt/);
  assert.equal(ledger.getTrail('order-42').length, 1);
});

test('rejects an invalid state jump in the append-only trail', () => {
  const ledger = new SettlementReceiptLedger();
  const planned = createSettlementReceiptV2(input({
    execution: { ...input().execution, state: 'planned', txHash: undefined },
  }), at);
  ledger.append(planned, at);
  const settled = createSettlementReceiptV2(input({
    execution: { ...input().execution, state: 'settled' },
  }), '2026-07-21T20:03:00.000Z');

  assert.throws(() => ledger.append(settled, at), /Invalid settlement transition/);
});

test('rejects an imported ledger with an invalid state jump even when hashes are internally consistent', () => {
  const ledger = new SettlementReceiptLedger();
  const planned = createSettlementReceiptV2(input({
    execution: {
      state: 'planned',
      witnessStates: [],
      retryPolicy: { allowRetry: false, maxAttempts: 0, attempts: 0 },
      reconciliationHistory: [],
    },
  }), '2026-07-21T00:00:00.000Z');
  ledger.append(planned, '2026-07-21T00:00:00.000Z');
  const settled = rehashSettlementReceiptV2({
    ...planned,
    execution: { ...planned.execution, state: 'settled' },
  });
  const forged = new SettlementReceiptLedger();
  forged.append(settled, '2026-07-21T00:00:01.000Z');
  const entries = ledger.export();
  const forgedEntry = forged.export()[0];
  entries.push({
    ...forgedEntry,
    sequence: 1,
    previousEntryHash: entries[0].entryHash,
  });
  const { keccak256, toUtf8Bytes } = require('ethers');
  entries[1].entryHash = keccak256(toUtf8Bytes(JSON.stringify({
    sequence: 1,
    recordedAt: entries[1].recordedAt,
    previousEntryHash: entries[0].entryHash,
    receiptId: entries[1].receipt.receiptId,
  })));
  assert.throws(() => new SettlementReceiptLedger(entries), /Invalid settlement ledger/);
});

test('creates an ACP ingress receipt without executing a payment', () => {
  const base = input();
  const receipt = createAcpSettlementReceipt({
    externalPaymentId: 'acp-job-42',
    agent: base.agent,
    asset: base.asset,
    grossAmount: base.grossAmount,
    idempotencyKey: base.idempotencyKey,
    businessEventId: base.businessEventId,
    authorizationReference: base.authorizationReference,
    requestHash: base.requestHash,
    quoteHash: base.quoteHash,
    sender: base.execution.sender,
    recipient: base.execution.recipient,
    policy: base.policy,
    precondition: base.precondition,
    falsifiability: base.falsifiability,
  }, at);

  assert.equal(receipt.ingress.source, 'acp');
  assert.equal(receipt.execution.state, 'planned');
  assert.equal(receipt.execution.retryPolicy.allowRetry, false);
  assert.equal(receipt.execution.txHash, undefined);
});

test('creates x402 metadata without claiming transport or settlement', () => {
  const base = input();
  const receipt = createX402SettlementReceipt({
    externalPaymentId: 'x402-payment-42',
    agent: base.agent,
    asset: base.asset,
    grossAmount: base.grossAmount,
    idempotencyKey: 'x402:x402-payment-42',
    businessEventId: base.businessEventId,
    authorizationReference: base.authorizationReference,
    requestHash: base.requestHash,
    policy: base.policy,
    precondition: base.precondition,
    falsifiability: base.falsifiability,
  }, at);

  assert.equal(receipt.ingress.source, 'x402');
  assert.equal(receipt.execution.state, 'planned');
  assert.equal(receipt.execution.txHash, undefined);
});
