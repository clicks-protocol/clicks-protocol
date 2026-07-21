import type {
  SettlementReceiptV2,
  SettlementReconciliationEvent,
  SettlementWitness,
} from './receipts';
import { rehashSettlementReceiptV2 } from './receipts';
import type { SettlementState } from './settlement-state';
import { assertSettlementTransition } from './settlement-state';

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

function equalAddress(left?: string, right?: string): boolean {
  if (!left || !right) return true;
  return left.toLowerCase() === right.toLowerCase();
}

export async function reconcileSettlement(
  receipt: SettlementReceiptV2,
  reader: ReconciliationReader,
  checkedAt = new Date().toISOString(),
): Promise<ReconciliationResult> {
  const chain = await reader.getChainTransaction(receipt);
  const external = reader.getExternalSettlement
    ? await reader.getExternalSettlement(receipt)
    : undefined;
  const witnesses: SettlementWitness[] = [];
  const evidence: string[] = [];

  let chainConflict = false;
  if (!chain.found) {
    witnesses.push({ name: 'chain_inclusion', state: 'missing', checkedAt });
    evidence.push('chain transaction not found');
  } else {
    chainConflict = Boolean(
      (receipt.execution.txHash && chain.txHash && receipt.execution.txHash.toLowerCase() !== chain.txHash.toLowerCase())
      || (receipt.execution.nonce !== undefined && chain.nonce !== undefined && receipt.execution.nonce !== chain.nonce)
      || !equalAddress(receipt.execution.sender, chain.from)
      || !equalAddress(receipt.execution.recipient, chain.to),
    );
    witnesses.push({
      name: 'chain_inclusion',
      state: chainConflict ? 'conflicting' : chain.status === 'confirmed' ? 'confirmed' : 'unknown',
      checkedAt,
      reference: chain.txHash,
      detail: chain.status,
    });
    evidence.push(`chain status: ${chain.status ?? 'unknown'}`);
  }

  if (external) {
    witnesses.push({
      name: 'external_payment',
      state: external.status === 'settled' ? 'confirmed' : external.found ? 'unknown' : 'missing',
      checkedAt,
      reference: external.reference,
      detail: external.status,
    });
    evidence.push(`external settlement: ${external.status ?? 'not found'}`);
  }

  let result: ReconciliationResult['result'];
  let nextState: SettlementState;

  if (chainConflict || external?.status === 'failed' || chain.status === 'reverted') {
    result = 'conflicting_evidence';
    nextState = 'disputed';
  } else if (chain.found && chain.status === 'confirmed' && (!external || external.status === 'settled')) {
    result = 'confirmed';
    nextState = 'reconciled';
  } else if (chain.absenceProven && !chain.found && (!external || !external.found)) {
    result = 'not_executed';
    nextState = 'failed_before_transfer';
  } else {
    result = 'unknown';
    nextState = 'reconciliation_required';
  }

  if (receipt.execution.state !== nextState) {
    assertSettlementTransition(receipt.execution.state, nextState);
  }

  return { result, nextState, witnesses, evidence, checkedAt };
}

export function applyReconciliationResult(
  receipt: SettlementReceiptV2,
  result: ReconciliationResult,
): SettlementReceiptV2 {
  const event: SettlementReconciliationEvent = {
    checkedAt: result.checkedAt,
    result: result.result,
    previousState: receipt.execution.state,
    nextState: result.nextState,
    evidence: result.evidence,
  };

  const { receiptId: _oldReceiptId, ...payload } = receipt;
  return rehashSettlementReceiptV2({
    ...payload,
    execution: {
      ...receipt.execution,
      state: result.nextState,
      failedWitness: result.witnesses.find((witness) => witness.state !== 'confirmed')?.name,
      witnessStates: result.witnesses,
      reconciliationHistory: [...receipt.execution.reconciliationHistory, event],
    },
  });
}
