import { Contract, JsonRpcProvider } from 'ethers';

import {
  ACTIVE_PROTOCOL_NAMES,
  BASE_MAINNET,
  FEE_ABI,
  REGISTRY_ABI,
  YIELD_ROUTER_ABI,
} from '../config/contracts';
import type { ProtocolStateSnapshot } from '../shared/types';

const MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 500;

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
    message.includes('429')
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isRateLimitedError(error) || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const backoffMs = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
      await sleep(backoffMs);
    }
  }

  throw new Error('State snapshot retries exhausted unexpectedly');
}

export async function collectProtocolStateSnapshot(params: {
  rpcUrl: string;
  capturedAt?: string;
}): Promise<ProtocolStateSnapshot> {
  const provider = new JsonRpcProvider(params.rpcUrl);

  const registry = new Contract(BASE_MAINNET.contracts.registry, REGISTRY_ABI, provider);
  const yieldRouter = new Contract(BASE_MAINNET.contracts.yieldRouter, YIELD_ROUTER_ABI, provider);
  const feeCollector = new Contract(BASE_MAINNET.contracts.feeCollector, FEE_ABI, provider);

  const latestBlockNumber = await withRateLimitRetry(() => provider.getBlockNumber());
  const latestBlock = await withRateLimitRetry(() => provider.getBlock(latestBlockNumber));

  if (!latestBlock) {
    throw new Error(`Could not load latest block ${latestBlockNumber}`);
  }

  const blockTag = latestBlockNumber;

  const totalAgents = await withRateLimitRetry(() => registry.totalAgents({ blockTag }));
  const totalDeposited = await withRateLimitRetry(() => yieldRouter.totalDeposited({ blockTag }));
  const totalBalance = await withRateLimitRetry(() => yieldRouter.getTotalBalance({ blockTag }));
  const activeProtocol = await withRateLimitRetry(() => yieldRouter.activeProtocol({ blockTag }));
  const apys = await withRateLimitRetry(() => yieldRouter.getAPYs({ blockTag }));
  const totalCollected = await withRateLimitRetry(() => feeCollector.totalCollected({ blockTag }));
  const pendingFees = await withRateLimitRetry(() => feeCollector.pendingFees({ blockTag }));

  return {
    capturedAt: params.capturedAt ?? new Date().toISOString(),
    blockNumber: latestBlockNumber,
    blockHash: latestBlock.hash ?? null,
    blockTime: new Date(latestBlock.timestamp * 1000).toISOString(),
    totalAgents: Number(totalAgents),
    totalDepositedUsdc: (totalDeposited as bigint).toString(),
    tvlUsdc: (totalBalance as bigint).toString(),
    totalFeesCollectedUsdc: (totalCollected as bigint).toString(),
    pendingFeesUsdc: (pendingFees as bigint).toString(),
    activeProtocol: ACTIVE_PROTOCOL_NAMES[Number(activeProtocol)] ?? 'unknown',
    aaveApyBps: Number(apys[0]),
    morphoApyBps: Number(apys[1]),
  };
}
