import { keccak256, toUtf8Bytes } from 'ethers';

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

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function hashSettlementPolicy(definition: Record<string, unknown>): string {
  return keccak256(toUtf8Bytes(canonicalize(definition)));
}

export function createSettlementReceipt(
  input: SettlementReceiptInput,
  createdAt = new Date().toISOString(),
): SettlementReceiptV1 {
  if (input.policy.liquidBps + input.policy.treasuryBps !== 10_000) {
    throw new Error('Settlement policy basis points must total 10000');
  }

  const policy: SettlementPolicySnapshot = {
    id: input.policy.id,
    version: input.policy.version,
    versionHash: hashSettlementPolicy(input.policy.definition),
    liquidBps: input.policy.liquidBps,
    treasuryBps: input.policy.treasuryBps,
  };

  const payload = {
    schema: 'clicks.settlement.receipt.v1' as const,
    createdAt,
    agent: input.agent,
    asset: input.asset,
    grossAmount: input.grossAmount,
    ingress: input.ingress,
    policy,
    precondition: input.precondition,
    execution: input.execution,
    falsifiability: input.falsifiability,
  };

  return {
    ...payload,
    receiptId: keccak256(toUtf8Bytes(canonicalize(payload))),
  };
}
