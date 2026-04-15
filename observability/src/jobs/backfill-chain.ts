import { env } from '../config/env';
import { collectChainEvents } from '../collectors/chain-events';
import type { SyncStateRow } from '../shared/types';
import { getDb, closeDb, withTransaction } from '../storage/sqlite';
import { getSyncState, insertCollectedEvent, upsertSyncState } from '../storage/queries';

const SYNC_SOURCE = 'chain_events_base_mainnet';
const DEFAULT_BATCH_SIZE = 500;
const MIN_BATCH_SIZE = 25;
const MAX_BATCH_RETRIES = 5;
const INITIAL_BACKOFF_MS = 750;

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  return direct ? direct.slice(prefix.length) : undefined;
}

function getIntegerArg(name: string): number | undefined {
  const raw = getArg(name);
  return raw ? Number.parseInt(raw, 10) : undefined;
}

function isRateLimitedError(error: unknown): boolean {
  const messageParts = [error instanceof Error ? error.message : String(error)];
  if (typeof error === 'object' && error !== null) {
    try {
      messageParts.push(JSON.stringify(error));
    } catch {
      // Ignore serialization issues and fall back to the basic message.
    }
  }
  const message = messageParts.join(' ').toLowerCase();
  return (
    message.includes('rate limit') ||
    message.includes('over rate limit') ||
    message.includes('too many requests') ||
    message.includes('429') ||
    message.includes('eth_getlogs')
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const db = getDb();
  const syncState = getSyncState(db, SYNC_SOURCE);
  const provider = new (await import('ethers')).JsonRpcProvider(env.baseRpcUrl);
  const latestBlock = await provider.getBlockNumber();

  const explicitFromBlock = getIntegerArg('from-block');
  const explicitToBlock = getIntegerArg('to-block');
  const batchSize = getIntegerArg('batch-size') ?? DEFAULT_BATCH_SIZE;

  const fromBlock =
    explicitFromBlock ??
    (syncState?.lastBlockNumber !== null && syncState?.lastBlockNumber !== undefined
      ? syncState.lastBlockNumber + 1
      : env.baseStartBlock);

  if (fromBlock === undefined) {
    throw new Error('Missing start block. Set BASE_START_BLOCK or pass --from-block=<number>.');
  }

  const toBlock = explicitToBlock ?? latestBlock;

  if (toBlock < fromBlock) {
    console.log(
      JSON.stringify({
        status: 'noop',
        fromBlock,
        toBlock,
        reason: 'fromBlock is ahead of toBlock',
      }, null, 2),
    );
    closeDb();
    return;
  }

  let processedEvents = 0;
  let currentBatchSize = Math.max(getIntegerArg('batch-size') ?? DEFAULT_BATCH_SIZE, MIN_BATCH_SIZE);

  for (let cursor = fromBlock; cursor <= toBlock;) {
    const batchFrom = cursor;
    let batchSucceeded = false;
    let attempts = 0;

    while (!batchSucceeded) {
      attempts += 1;
      const batchTo = Math.min(cursor + currentBatchSize - 1, toBlock);

      try {
        const events = await collectChainEvents({
          rpcUrl: env.baseRpcUrl,
          fromBlock: batchFrom,
          toBlock: batchTo,
        });

        withTransaction(db, () => {
          for (const event of events) {
            insertCollectedEvent(db, event);
          }

          const nextSyncState: SyncStateRow = {
            source: SYNC_SOURCE,
            lastBlockNumber: batchTo,
            lastBlockHash: events.length > 0 ? events[events.length - 1].chainEvent.blockHash : null,
            lastEventTime: events.length > 0 ? events[events.length - 1].chainEvent.blockTime : null,
            updatedAt: new Date().toISOString(),
          };

          upsertSyncState(db, nextSyncState);
        });

        processedEvents += events.length;
        cursor = batchTo + 1;
        batchSucceeded = true;
      } catch (error) {
        if (!isRateLimitedError(error)) {
          throw error;
        }

        if (currentBatchSize > MIN_BATCH_SIZE) {
          currentBatchSize = Math.max(MIN_BATCH_SIZE, Math.floor(currentBatchSize / 2));
          attempts = 0;
          await sleep(INITIAL_BACKOFF_MS);
          continue;
        }

        if (attempts >= MAX_BATCH_RETRIES) {
          throw error;
        }

        const backoffMs = INITIAL_BACKOFF_MS * 2 ** (attempts - 1);
        await sleep(backoffMs);
      }
    }
  }

  console.log(
    JSON.stringify({
      status: 'ok',
      syncSource: SYNC_SOURCE,
      fromBlock,
      toBlock,
      processedEvents,
    }, null, 2),
  );

  closeDb();
}

void main().catch((error) => {
  console.error(error);
  closeDb();
  process.exitCode = 1;
});
