export type SettlementState =
  | 'planned'
  | 'submitted'
  | 'chain_confirmed'
  | 'settled'
  | 'unknown_settled'
  | 'reconciliation_required'
  | 'reconciled'
  | 'failed_before_transfer'
  | 'disputed';

export interface SettlementRetryPolicy {
  allowRetry: boolean;
  maxAttempts: number;
  attempts: number;
}

const ALLOWED_TRANSITIONS: Readonly<Record<SettlementState, readonly SettlementState[]>> = {
  planned: ['submitted', 'failed_before_transfer'],
  submitted: ['chain_confirmed', 'unknown_settled', 'reconciliation_required'],
  chain_confirmed: ['settled', 'unknown_settled', 'reconciliation_required', 'disputed'],
  settled: ['disputed'],
  unknown_settled: ['reconciliation_required', 'reconciled', 'disputed'],
  reconciliation_required: ['reconciled', 'disputed'],
  reconciled: ['settled', 'failed_before_transfer', 'disputed'],
  failed_before_transfer: ['submitted'],
  disputed: [],
};

export function canTransitionSettlement(from: SettlementState, to: SettlementState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertSettlementTransition(from: SettlementState, to: SettlementState): void {
  if (!canTransitionSettlement(from, to)) {
    throw new Error(`Invalid settlement transition: ${from} -> ${to}`);
  }
}

/**
 * Retry is fail-closed. A retry is possible only when independent evidence
 * proves that no transfer was submitted.
 */
export function canRetrySettlement(state: SettlementState, policy: SettlementRetryPolicy): boolean {
  return (
    state === 'failed_before_transfer'
    && policy.allowRetry
    && policy.attempts < policy.maxAttempts
  );
}

export function assertSettlementRetryAllowed(
  state: SettlementState,
  policy: SettlementRetryPolicy,
): void {
  if (!canRetrySettlement(state, policy)) {
    throw new Error(`Settlement retry blocked for state: ${state}`);
  }
}
