PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sync_state (
  source TEXT PRIMARY KEY,
  last_block_number INTEGER,
  last_block_hash TEXT,
  last_event_time TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER NOT NULL,
  contract_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  event_name TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash TEXT,
  block_time TEXT NOT NULL,
  agent_address TEXT,
  operator_address TEXT,
  amount_total_usdc TEXT,
  amount_liquid_usdc TEXT,
  amount_to_yield_usdc TEXT,
  amount_principal_usdc TEXT,
  amount_yield_usdc TEXT,
  amount_fee_usdc TEXT,
  raw_json TEXT NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_chain_events_event_name_block_number
  ON chain_events (event_name, block_number);

CREATE INDEX IF NOT EXISTS idx_chain_events_block_time
  ON chain_events (block_time);

CREATE TABLE IF NOT EXISTS agent_registrations (
  agent_address TEXT PRIMARY KEY,
  operator_address TEXT NOT NULL,
  first_registered_tx_hash TEXT NOT NULL,
  first_registered_log_index INTEGER NOT NULL,
  first_registered_block_number INTEGER NOT NULL,
  first_registered_at TEXT NOT NULL,
  last_registered_tx_hash TEXT NOT NULL,
  last_registered_log_index INTEGER NOT NULL,
  last_registered_block_number INTEGER NOT NULL,
  last_registered_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_time TEXT NOT NULL,
  agent_address TEXT NOT NULL,
  operator_address TEXT NOT NULL,
  amount_total_usdc TEXT NOT NULL,
  amount_liquid_usdc TEXT NOT NULL,
  amount_to_yield_usdc TEXT NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_block_time
  ON payment_events (block_time);

CREATE TABLE IF NOT EXISTS yield_withdrawal_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_time TEXT NOT NULL,
  agent_address TEXT NOT NULL,
  amount_principal_usdc TEXT NOT NULL,
  amount_yield_usdc TEXT NOT NULL,
  amount_fee_usdc TEXT NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_yield_withdrawal_events_block_time
  ON yield_withdrawal_events (block_time);

CREATE TABLE IF NOT EXISTS fee_collection_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_time TEXT NOT NULL,
  agent_address TEXT NOT NULL,
  amount_fee_usdc TEXT NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_fee_collection_events_block_time
  ON fee_collection_events (block_time);

CREATE TABLE IF NOT EXISTS protocol_state_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  captured_at TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash TEXT,
  block_time TEXT NOT NULL,
  total_agents INTEGER NOT NULL,
  total_deposited_usdc TEXT NOT NULL,
  tvl_usdc TEXT NOT NULL,
  total_fees_collected_usdc TEXT NOT NULL,
  pending_fees_usdc TEXT NOT NULL,
  active_protocol TEXT NOT NULL,
  aave_apy_bps INTEGER NOT NULL,
  morpho_apy_bps INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_protocol_state_snapshots_captured_at
  ON protocol_state_snapshots (captured_at);

CREATE TABLE IF NOT EXISTS daily_metrics (
  day TEXT PRIMARY KEY,
  new_agents INTEGER NOT NULL,
  payments_received_count INTEGER NOT NULL,
  payments_received_usdc TEXT NOT NULL,
  yield_withdrawn_count INTEGER NOT NULL,
  yield_withdrawn_principal_usdc TEXT NOT NULL,
  yield_withdrawn_yield_usdc TEXT NOT NULL,
  fees_collected_usdc TEXT NOT NULL,
  pending_fees_close_usdc TEXT NOT NULL,
  tvl_open_usdc TEXT NOT NULL,
  tvl_close_usdc TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts_sent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_key TEXT NOT NULL UNIQUE,
  alert_type TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  formatted_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_usage_rollups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket_start TEXT NOT NULL,
  surface TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  direction TEXT NOT NULL,
  call_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL DEFAULT 0,
  unique_actor_hint INTEGER,
  UNIQUE (bucket_start, surface, tool_name, direction)
);
