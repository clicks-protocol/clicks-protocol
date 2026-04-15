import type {
  AgentRegistrationRow,
  CollectedChainEvent,
  DailyMetricsRow,
  ProtocolStateSnapshot,
  SyncStateRow,
  UsageAlertSummary,
} from '../shared/types';
import type { DatabaseLike } from './sqlite';

function rowToSyncState(row: Record<string, unknown> | undefined): SyncStateRow | null {
  if (!row) {
    return null;
  }

  return {
    source: String(row.source),
    lastBlockNumber: row.last_block_number === null ? null : Number(row.last_block_number),
    lastBlockHash: row.last_block_hash === null ? null : String(row.last_block_hash),
    lastEventTime: row.last_event_time === null ? null : String(row.last_event_time),
    updatedAt: String(row.updated_at),
  };
}

function rowToProtocolStateSnapshot(row: Record<string, unknown> | undefined): ProtocolStateSnapshot | null {
  if (!row) {
    return null;
  }

  return {
    capturedAt: String(row.captured_at),
    blockNumber: Number(row.block_number),
    blockHash: row.block_hash === null ? null : String(row.block_hash),
    blockTime: String(row.block_time),
    totalAgents: Number(row.total_agents),
    totalDepositedUsdc: String(row.total_deposited_usdc),
    tvlUsdc: String(row.tvl_usdc),
    totalFeesCollectedUsdc: String(row.total_fees_collected_usdc),
    pendingFeesUsdc: String(row.pending_fees_usdc),
    activeProtocol: String(row.active_protocol),
    aaveApyBps: Number(row.aave_apy_bps),
    morphoApyBps: Number(row.morpho_apy_bps),
  };
}

export function getSyncState(db: DatabaseLike, source: string): SyncStateRow | null {
  const stmt = db.prepare(`
    SELECT source, last_block_number, last_block_hash, last_event_time, updated_at
    FROM sync_state
    WHERE source = ?
  `);
  return rowToSyncState(stmt.get(source) as Record<string, unknown> | undefined);
}

export function upsertSyncState(db: DatabaseLike, state: SyncStateRow): void {
  const stmt = db.prepare(`
    INSERT INTO sync_state (
      source, last_block_number, last_block_hash, last_event_time, updated_at
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(source) DO UPDATE SET
      last_block_number = excluded.last_block_number,
      last_block_hash = excluded.last_block_hash,
      last_event_time = excluded.last_event_time,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    state.source,
    state.lastBlockNumber,
    state.lastBlockHash,
    state.lastEventTime,
    state.updatedAt,
  );
}

export function insertCollectedEvent(db: DatabaseLike, event: CollectedChainEvent): void {
  const chainStmt = db.prepare(`
    INSERT OR IGNORE INTO chain_events (
      chain_id, contract_name, contract_address, event_name, tx_hash, log_index, block_number,
      block_hash, block_time, agent_address, operator_address, amount_total_usdc,
      amount_liquid_usdc, amount_to_yield_usdc, amount_principal_usdc, amount_yield_usdc,
      amount_fee_usdc, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  chainStmt.run(
    event.chainEvent.chainId,
    event.chainEvent.contractName,
    event.chainEvent.contractAddress,
    event.chainEvent.eventName,
    event.chainEvent.txHash,
    event.chainEvent.logIndex,
    event.chainEvent.blockNumber,
    event.chainEvent.blockHash,
    event.chainEvent.blockTime,
    event.chainEvent.agentAddress,
    event.chainEvent.operatorAddress,
    event.chainEvent.amountTotalUsdc,
    event.chainEvent.amountLiquidUsdc,
    event.chainEvent.amountToYieldUsdc,
    event.chainEvent.amountPrincipalUsdc,
    event.chainEvent.amountYieldUsdc,
    event.chainEvent.amountFeeUsdc,
    event.chainEvent.rawJson,
  );

  if (event.agentRegistration) {
    upsertAgentRegistration(db, event.agentRegistration);
  }

  if (event.paymentEvent) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO payment_events (
        tx_hash, log_index, block_number, block_time, agent_address, operator_address,
        amount_total_usdc, amount_liquid_usdc, amount_to_yield_usdc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.paymentEvent.txHash,
      event.paymentEvent.logIndex,
      event.paymentEvent.blockNumber,
      event.paymentEvent.blockTime,
      event.paymentEvent.agentAddress,
      event.paymentEvent.operatorAddress,
      event.paymentEvent.amountTotalUsdc,
      event.paymentEvent.amountLiquidUsdc,
      event.paymentEvent.amountToYieldUsdc,
    );
  }

  if (event.yieldWithdrawalEvent) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO yield_withdrawal_events (
        tx_hash, log_index, block_number, block_time, agent_address,
        amount_principal_usdc, amount_yield_usdc, amount_fee_usdc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.yieldWithdrawalEvent.txHash,
      event.yieldWithdrawalEvent.logIndex,
      event.yieldWithdrawalEvent.blockNumber,
      event.yieldWithdrawalEvent.blockTime,
      event.yieldWithdrawalEvent.agentAddress,
      event.yieldWithdrawalEvent.amountPrincipalUsdc,
      event.yieldWithdrawalEvent.amountYieldUsdc,
      event.yieldWithdrawalEvent.amountFeeUsdc,
    );
  }

  if (event.feeCollectionEvent) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO fee_collection_events (
        tx_hash, log_index, block_number, block_time, agent_address, amount_fee_usdc
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.feeCollectionEvent.txHash,
      event.feeCollectionEvent.logIndex,
      event.feeCollectionEvent.blockNumber,
      event.feeCollectionEvent.blockTime,
      event.feeCollectionEvent.agentAddress,
      event.feeCollectionEvent.amountFeeUsdc,
    );
  }
}

export function upsertAgentRegistration(db: DatabaseLike, row: AgentRegistrationRow): void {
  const stmt = db.prepare(`
    INSERT INTO agent_registrations (
      agent_address, operator_address, first_registered_tx_hash, first_registered_log_index,
      first_registered_block_number, first_registered_at, last_registered_tx_hash,
      last_registered_log_index, last_registered_block_number, last_registered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(agent_address) DO UPDATE SET
      operator_address = excluded.operator_address,
      last_registered_tx_hash = excluded.last_registered_tx_hash,
      last_registered_log_index = excluded.last_registered_log_index,
      last_registered_block_number = excluded.last_registered_block_number,
      last_registered_at = excluded.last_registered_at
  `);

  stmt.run(
    row.agentAddress,
    row.operatorAddress,
    row.txHash,
    row.logIndex,
    row.blockNumber,
    row.blockTime,
    row.txHash,
    row.logIndex,
    row.blockNumber,
    row.blockTime,
  );
}

export function insertProtocolStateSnapshot(db: DatabaseLike, snapshot: ProtocolStateSnapshot): void {
  const stmt = db.prepare(`
    INSERT INTO protocol_state_snapshots (
      captured_at, block_number, block_hash, block_time, total_agents, total_deposited_usdc,
      tvl_usdc, total_fees_collected_usdc, pending_fees_usdc, active_protocol,
      aave_apy_bps, morpho_apy_bps
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    snapshot.capturedAt,
    snapshot.blockNumber,
    snapshot.blockHash,
    snapshot.blockTime,
    snapshot.totalAgents,
    snapshot.totalDepositedUsdc,
    snapshot.tvlUsdc,
    snapshot.totalFeesCollectedUsdc,
    snapshot.pendingFeesUsdc,
    snapshot.activeProtocol,
    snapshot.aaveApyBps,
    snapshot.morphoApyBps,
  );
}

export function getLatestProtocolStateSnapshot(db: DatabaseLike): ProtocolStateSnapshot | null {
  const stmt = db.prepare(`
    SELECT *
    FROM protocol_state_snapshots
    ORDER BY captured_at DESC, id DESC
    LIMIT 1
  `);

  return rowToProtocolStateSnapshot(stmt.get() as Record<string, unknown> | undefined);
}

export function getLatestProtocolStateSnapshotBefore(
  db: DatabaseLike,
  capturedAt: string,
): ProtocolStateSnapshot | null {
  const stmt = db.prepare(`
    SELECT *
    FROM protocol_state_snapshots
    WHERE captured_at < ?
    ORDER BY captured_at DESC, id DESC
    LIMIT 1
  `);

  return rowToProtocolStateSnapshot(stmt.get(capturedAt) as Record<string, unknown> | undefined);
}

function aggregateBetween(
  db: DatabaseLike,
  table: string,
  countAlias: string,
  sumColumns: Array<[string, string]>,
  startTime: string,
  endTime: string,
): Record<string, string | number> {
  const sumSql = sumColumns
    .map(([column, alias]) => `COALESCE(SUM(CAST(${column} AS INTEGER)), 0) AS ${alias}`)
    .join(', ');

  const stmt = db.prepare(`
    SELECT COUNT(*) AS ${countAlias}, ${sumSql}
    FROM ${table}
    WHERE block_time >= ? AND block_time <= ?
  `);

  const row = stmt.get(startTime, endTime) as Record<string, unknown>;
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      result[key] = value.toString();
    } else if (typeof value === 'number') {
      result[key] = key === countAlias ? value : String(value);
    } else if (value === null || value === undefined) {
      result[key] = key === countAlias ? 0 : '0';
    } else {
      result[key] = String(value);
    }
  }

  return result;
}

export function getUsageStatsBetween(
  db: DatabaseLike,
  startTime: string,
  endTime: string,
): {
  newAgents: number;
  paymentEventCount: number;
  paymentVolumeUsdc: string;
  yieldWithdrawalCount: number;
  yieldWithdrawnPrincipalUsdc: string;
  yieldWithdrawnYieldUsdc: string;
  feeCollectionCount: number;
  feeCollectedUsdc: string;
} {
  const newAgentsStmt = db.prepare(`
    SELECT COUNT(*) AS count
    FROM chain_events
    WHERE event_name = 'AgentRegistered' AND block_time >= ? AND block_time <= ?
  `);
  const newAgentsRow = newAgentsStmt.get(startTime, endTime) as Record<string, unknown>;

  const payments = aggregateBetween(
    db,
    'payment_events',
    'count',
    [['amount_total_usdc', 'amount_total_usdc']],
    startTime,
    endTime,
  );

  const withdrawals = aggregateBetween(
    db,
    'yield_withdrawal_events',
    'count',
    [
      ['amount_principal_usdc', 'amount_principal_usdc'],
      ['amount_yield_usdc', 'amount_yield_usdc'],
    ],
    startTime,
    endTime,
  );

  const fees = aggregateBetween(
    db,
    'fee_collection_events',
    'count',
    [['amount_fee_usdc', 'amount_fee_usdc']],
    startTime,
    endTime,
  );

  return {
    newAgents: Number(newAgentsRow.count ?? 0),
    paymentEventCount: Number(payments.count ?? 0),
    paymentVolumeUsdc: String(payments.amount_total_usdc ?? '0'),
    yieldWithdrawalCount: Number(withdrawals.count ?? 0),
    yieldWithdrawnPrincipalUsdc: String(withdrawals.amount_principal_usdc ?? '0'),
    yieldWithdrawnYieldUsdc: String(withdrawals.amount_yield_usdc ?? '0'),
    feeCollectionCount: Number(fees.count ?? 0),
    feeCollectedUsdc: String(fees.amount_fee_usdc ?? '0'),
  };
}

export function upsertDailyMetrics(db: DatabaseLike, metrics: DailyMetricsRow): void {
  const stmt = db.prepare(`
    INSERT INTO daily_metrics (
      day, new_agents, payments_received_count, payments_received_usdc,
      yield_withdrawn_count, yield_withdrawn_principal_usdc, yield_withdrawn_yield_usdc,
      fees_collected_usdc, pending_fees_close_usdc, tvl_open_usdc, tvl_close_usdc, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(day) DO UPDATE SET
      new_agents = excluded.new_agents,
      payments_received_count = excluded.payments_received_count,
      payments_received_usdc = excluded.payments_received_usdc,
      yield_withdrawn_count = excluded.yield_withdrawn_count,
      yield_withdrawn_principal_usdc = excluded.yield_withdrawn_principal_usdc,
      yield_withdrawn_yield_usdc = excluded.yield_withdrawn_yield_usdc,
      fees_collected_usdc = excluded.fees_collected_usdc,
      pending_fees_close_usdc = excluded.pending_fees_close_usdc,
      tvl_open_usdc = excluded.tvl_open_usdc,
      tvl_close_usdc = excluded.tvl_close_usdc,
      created_at = excluded.created_at
  `);

  stmt.run(
    metrics.day,
    metrics.newAgents,
    metrics.paymentsReceivedCount,
    metrics.paymentsReceivedUsdc,
    metrics.yieldWithdrawnCount,
    metrics.yieldWithdrawnPrincipalUsdc,
    metrics.yieldWithdrawnYieldUsdc,
    metrics.feesCollectedUsdc,
    metrics.pendingFeesCloseUsdc,
    metrics.tvlOpenUsdc,
    metrics.tvlCloseUsdc,
    metrics.createdAt,
  );
}

export function hasAlertBeenRecorded(db: DatabaseLike, alertKey: string): boolean {
  const stmt = db.prepare(`
    SELECT 1
    FROM alerts_sent
    WHERE alert_key = ?
    LIMIT 1
  `);
  return Boolean(stmt.get(alertKey));
}

export function insertAlertRecord(
  db: DatabaseLike,
  summary: UsageAlertSummary,
  formattedText: string,
): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO alerts_sent (
      alert_key, alert_type, window_start, window_end, summary_json, formatted_text, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    summary.alertKey,
    'usage-monitor',
    summary.windowStart,
    summary.windowEnd,
    JSON.stringify(summary),
    formattedText,
    summary.generatedAt,
  );
}
