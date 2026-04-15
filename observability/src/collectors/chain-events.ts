import { Interface, JsonRpcProvider, Log } from 'ethers';

import {
  BASE_MAINNET,
  FEE_ABI,
  REGISTRY_ABI,
  SPLITTER_ABI,
} from '../config/contracts';
import type { CollectedChainEvent } from '../shared/types';

interface CachedBlockInfo {
  blockTime: string;
  blockHash: string | null;
}

type EventConfig = {
  contractName: string;
  contractAddress: string;
  eventName: CollectedChainEvent['chainEvent']['eventName'];
  iface: Interface;
};

const registryInterface = new Interface(REGISTRY_ABI);
const splitterInterface = new Interface(SPLITTER_ABI);
const feeInterface = new Interface(FEE_ABI);

const EVENT_CONFIGS: EventConfig[] = [
  {
    contractName: 'ClicksRegistry',
    contractAddress: BASE_MAINNET.contracts.registry,
    eventName: 'AgentRegistered',
    iface: registryInterface,
  },
  {
    contractName: 'ClicksSplitterV3',
    contractAddress: BASE_MAINNET.contracts.splitter,
    eventName: 'PaymentReceived',
    iface: splitterInterface,
  },
  {
    contractName: 'ClicksSplitterV3',
    contractAddress: BASE_MAINNET.contracts.splitter,
    eventName: 'YieldWithdrawn',
    iface: splitterInterface,
  },
  {
    contractName: 'ClicksFee',
    contractAddress: BASE_MAINNET.contracts.feeCollector,
    eventName: 'FeeCollected',
    iface: feeInterface,
  },
];

async function resolveBlockTime(
  provider: JsonRpcProvider,
  blockCache: Map<number, Promise<CachedBlockInfo>>,
  blockNumber: number,
): Promise<CachedBlockInfo> {
  const cached = blockCache.get(blockNumber);
  if (cached) {
    return cached;
  }

  const pendingBlockInfo = provider.getBlock(blockNumber).then((block) => {
    if (!block) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    return {
      blockTime: new Date(block.timestamp * 1000).toISOString(),
      blockHash: block.hash ?? null,
    };
  });

  blockCache.set(blockNumber, pendingBlockInfo);
  return pendingBlockInfo;
}

function serializeLog(log: Log): string {
  return JSON.stringify({
    address: log.address,
    blockHash: log.blockHash,
    blockNumber: log.blockNumber,
    data: log.data,
    index: log.index,
    removed: log.removed,
    topics: log.topics,
    transactionHash: log.transactionHash,
    transactionIndex: log.transactionIndex,
  });
}

function bigintToUsdcString(value: bigint): string {
  return value.toString();
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
    message.includes('429')
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLogsWithRetry(params: {
  provider: JsonRpcProvider;
  contractAddress: string;
  fromBlock: number;
  toBlock: number;
  topic: string;
  maxAttempts?: number;
  initialDelayMs?: number;
}): Promise<Log[]> {
  const maxAttempts = params.maxAttempts ?? 5;
  const initialDelayMs = params.initialDelayMs ?? 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await params.provider.getLogs({
        address: params.contractAddress,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        topics: [[params.topic]],
      });
    } catch (error) {
      if (!isRateLimitedError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = initialDelayMs * 2 ** (attempt - 1);
      await sleep(delayMs);
    }
  }

  return [];
}

async function fetchLogsForConfig(
  provider: JsonRpcProvider,
  blockCache: Map<number, Promise<CachedBlockInfo>>,
  config: EventConfig,
  fromBlock: number,
  toBlock: number,
): Promise<CollectedChainEvent[]> {
  const eventFragment = config.iface.getEvent(config.eventName);
  if (!eventFragment) {
    throw new Error(`Missing event fragment for ${config.eventName}`);
  }
  const topic = eventFragment.topicHash;
  const logs = await getLogsWithRetry({
    provider,
    contractAddress: config.contractAddress,
    fromBlock,
    toBlock,
    topic,
  });

  const rows: CollectedChainEvent[] = [];

  for (const log of logs) {
    const parsed = config.iface.parseLog(log);
    if (!parsed) {
      continue;
    }
    const { blockTime, blockHash } = await resolveBlockTime(provider, blockCache, log.blockNumber);
    const base = {
      chainId: BASE_MAINNET.chainId,
      contractName: config.contractName,
      contractAddress: config.contractAddress,
      eventName: config.eventName,
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      blockHash,
      blockTime,
      rawJson: serializeLog(log),
    } as const;

    switch (config.eventName) {
      case 'AgentRegistered': {
        const agent = String(parsed.args.agent);
        const operator = String(parsed.args.operator);

        rows.push({
          chainEvent: {
            ...base,
            agentAddress: agent,
            operatorAddress: operator,
            amountTotalUsdc: null,
            amountLiquidUsdc: null,
            amountToYieldUsdc: null,
            amountPrincipalUsdc: null,
            amountYieldUsdc: null,
            amountFeeUsdc: null,
          },
          agentRegistration: {
            agentAddress: agent,
            operatorAddress: operator,
            txHash: log.transactionHash,
            logIndex: log.index,
            blockNumber: log.blockNumber,
            blockTime,
          },
        });
        break;
      }
      case 'PaymentReceived': {
        const agent = String(parsed.args.agent);
        const operator = String(parsed.args.operator);
        const total = bigintToUsdcString(parsed.args.total as bigint);
        const liquid = bigintToUsdcString(parsed.args.liquid as bigint);
        const toYield = bigintToUsdcString(parsed.args.toYield as bigint);

        rows.push({
          chainEvent: {
            ...base,
            agentAddress: agent,
            operatorAddress: operator,
            amountTotalUsdc: total,
            amountLiquidUsdc: liquid,
            amountToYieldUsdc: toYield,
            amountPrincipalUsdc: null,
            amountYieldUsdc: null,
            amountFeeUsdc: null,
          },
          paymentEvent: {
            txHash: log.transactionHash,
            logIndex: log.index,
            blockNumber: log.blockNumber,
            blockTime,
            agentAddress: agent,
            operatorAddress: operator,
            amountTotalUsdc: total,
            amountLiquidUsdc: liquid,
            amountToYieldUsdc: toYield,
          },
        });
        break;
      }
      case 'YieldWithdrawn': {
        const agent = String(parsed.args.agent);
        const principal = bigintToUsdcString(parsed.args.principal as bigint);
        const yieldEarned = bigintToUsdcString(parsed.args.yieldEarned as bigint);
        const fee = bigintToUsdcString(parsed.args.fee as bigint);

        rows.push({
          chainEvent: {
            ...base,
            agentAddress: agent,
            operatorAddress: null,
            amountTotalUsdc: null,
            amountLiquidUsdc: null,
            amountToYieldUsdc: null,
            amountPrincipalUsdc: principal,
            amountYieldUsdc: yieldEarned,
            amountFeeUsdc: fee,
          },
          yieldWithdrawalEvent: {
            txHash: log.transactionHash,
            logIndex: log.index,
            blockNumber: log.blockNumber,
            blockTime,
            agentAddress: agent,
            amountPrincipalUsdc: principal,
            amountYieldUsdc: yieldEarned,
            amountFeeUsdc: fee,
          },
        });
        break;
      }
      case 'FeeCollected': {
        const agent = String(parsed.args.agent);
        const fee = bigintToUsdcString(parsed.args.amount as bigint);

        rows.push({
          chainEvent: {
            ...base,
            agentAddress: agent,
            operatorAddress: null,
            amountTotalUsdc: null,
            amountLiquidUsdc: null,
            amountToYieldUsdc: null,
            amountPrincipalUsdc: null,
            amountYieldUsdc: null,
            amountFeeUsdc: fee,
          },
          feeCollectionEvent: {
            txHash: log.transactionHash,
            logIndex: log.index,
            blockNumber: log.blockNumber,
            blockTime,
            agentAddress: agent,
            amountFeeUsdc: fee,
          },
        });
        break;
      }
      default:
        break;
    }
  }

  return rows;
}

export async function collectChainEvents(params: {
  rpcUrl: string;
  fromBlock: number;
  toBlock: number;
}): Promise<CollectedChainEvent[]> {
  if (params.toBlock < params.fromBlock) {
    return [];
  }

  const provider = new JsonRpcProvider(params.rpcUrl);
  const blockCache = new Map<number, Promise<CachedBlockInfo>>();
  const batches: CollectedChainEvent[][] = [];

  for (const config of EVENT_CONFIGS) {
    const result = await fetchLogsForConfig(
      provider,
      blockCache,
      config,
      params.fromBlock,
      params.toBlock,
    );
    batches.push(result);
  }

  return batches
    .flat()
    .sort((left, right) => {
      if (left.chainEvent.blockNumber !== right.chainEvent.blockNumber) {
        return left.chainEvent.blockNumber - right.chainEvent.blockNumber;
      }
      return left.chainEvent.logIndex - right.chainEvent.logIndex;
    });
}
