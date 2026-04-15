export type UsdcAmount = string;

export type ChainEventName =
  | 'AgentRegistered'
  | 'PaymentReceived'
  | 'YieldWithdrawn'
  | 'FeeCollected';

export interface SyncStateRow {
  source: string;
  lastBlockNumber: number | null;
  lastBlockHash: string | null;
  lastEventTime: string | null;
  updatedAt: string;
}

export interface ChainEventRow {
  chainId: number;
  contractName: string;
  contractAddress: string;
  eventName: ChainEventName;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockHash: string | null;
  blockTime: string;
  agentAddress: string | null;
  operatorAddress: string | null;
  amountTotalUsdc: UsdcAmount | null;
  amountLiquidUsdc: UsdcAmount | null;
  amountToYieldUsdc: UsdcAmount | null;
  amountPrincipalUsdc: UsdcAmount | null;
  amountYieldUsdc: UsdcAmount | null;
  amountFeeUsdc: UsdcAmount | null;
  rawJson: string;
}

export interface AgentRegistrationRow {
  agentAddress: string;
  operatorAddress: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockTime: string;
}

export interface PaymentEventRow {
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockTime: string;
  agentAddress: string;
  operatorAddress: string;
  amountTotalUsdc: UsdcAmount;
  amountLiquidUsdc: UsdcAmount;
  amountToYieldUsdc: UsdcAmount;
}

export interface YieldWithdrawalEventRow {
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockTime: string;
  agentAddress: string;
  amountPrincipalUsdc: UsdcAmount;
  amountYieldUsdc: UsdcAmount;
  amountFeeUsdc: UsdcAmount;
}

export interface FeeCollectionEventRow {
  txHash: string;
  logIndex: number;
  blockNumber: number;
  blockTime: string;
  agentAddress: string;
  amountFeeUsdc: UsdcAmount;
}

export interface ProtocolStateSnapshot {
  capturedAt: string;
  blockNumber: number;
  blockHash: string | null;
  blockTime: string;
  totalAgents: number;
  totalDepositedUsdc: UsdcAmount;
  tvlUsdc: UsdcAmount;
  totalFeesCollectedUsdc: UsdcAmount;
  pendingFeesUsdc: UsdcAmount;
  activeProtocol: string;
  aaveApyBps: number;
  morphoApyBps: number;
}

export interface DailyMetricsRow {
  day: string;
  newAgents: number;
  paymentsReceivedCount: number;
  paymentsReceivedUsdc: UsdcAmount;
  yieldWithdrawnCount: number;
  yieldWithdrawnPrincipalUsdc: UsdcAmount;
  yieldWithdrawnYieldUsdc: UsdcAmount;
  feesCollectedUsdc: UsdcAmount;
  pendingFeesCloseUsdc: UsdcAmount;
  tvlOpenUsdc: UsdcAmount;
  tvlCloseUsdc: UsdcAmount;
  createdAt: string;
}

export interface UsageAlertSummary {
  alertKey: string;
  windowStart: string;
  windowEnd: string;
  generatedAt: string;
  currentTvlUsdc: UsdcAmount;
  previousTvlUsdc: UsdcAmount | null;
  tvlDeltaUsdc: UsdcAmount | null;
  pendingFeesUsdc: UsdcAmount;
  totalFeesCollectedUsdc: UsdcAmount;
  newAgents: number;
  paymentEventCount: number;
  paymentVolumeUsdc: UsdcAmount;
  yieldWithdrawalCount: number;
  yieldWithdrawnPrincipalUsdc: UsdcAmount;
  yieldWithdrawnYieldUsdc: UsdcAmount;
  feeCollectionCount: number;
  feeCollectedUsdc: UsdcAmount;
  hasActivity: boolean;
}

export interface FormattedAlert {
  title: string;
  text: string;
}

export interface CollectedChainEvent {
  chainEvent: ChainEventRow;
  agentRegistration?: AgentRegistrationRow;
  paymentEvent?: PaymentEventRow;
  yieldWithdrawalEvent?: YieldWithdrawalEventRow;
  feeCollectionEvent?: FeeCollectionEventRow;
}
