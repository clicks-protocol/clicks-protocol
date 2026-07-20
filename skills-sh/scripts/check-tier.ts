#!/usr/bin/env tsx
/**
 * Read ERC-8004 Schema V1 reputation for an agent on Base.
 *
 * Usage:
 *   npx tsx scripts/check-tier.ts --agent-id 45074 [--tag1 route] [--tag2 x402] [--include-revoked]
 *
 * Strategy:
 *   1. getClients(agentId) → all addresses that ever attested.
 *   2. getSummary(agentId, clients, tag1, tag2) → aggregate.
 *   3. readAllFeedback(agentId, clients, tag1, tag2, includeRevoked) → individual records.
 *
 * Tier buckets are informational (off-chain). The on-chain fact is `value` + `count`.
 */
import { ethers } from 'ethers';

const REPUTATION = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63';
const ABI = [
  'function getClients(uint256 agentId) view returns (address[])',
  'function getSummary(uint256 agentId, address[] clients, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
  'function readAllFeedback(uint256 agentId, address[] clients, string tag1, string tag2, bool includeRevoked) view returns (address[] clients_, uint64[] indexes, int128[] values, uint8[] decimals, string[] tag1s, string[] tag2s, bool[] revokedStatuses)',
];

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function tier(normalized: number, count: number): string {
  if (count < 3) return 'UNRATED';
  if (normalized >= 0.9) return 'TOP';
  if (normalized >= 0.7) return 'HIGH';
  if (normalized >= 0.5) return 'MID';
  return 'LOW';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const agentId = args['agent-id'] as string;
  const tag1 = (args['tag1'] as string) ?? '';
  const tag2 = (args['tag2'] as string) ?? '';
  const includeRevoked = args['include-revoked'] === true;
  if (!agentId) {
    console.error('Required: --agent-id <id>');
    process.exit(1);
  }

  const rpc = process.env.CLICKS_RPC_URL || 'https://mainnet.base.org';
  const provider = new ethers.JsonRpcProvider(rpc);
  const reputation = new ethers.Contract(REPUTATION, ABI, provider);

  const clients: string[] = Array.from(await reputation.getClients(agentId));
  if (clients.length === 0) {
    console.log(JSON.stringify({
      agentId, clients: 0, count: 0, normalized: null, tier: 'UNRATED', records: [],
    }, null, 2));
    return;
  }

  const [count, value, decimals] = await reputation.getSummary(agentId, clients, tag1, tag2);
  const normalized = Number(count) > 0 ? Number(value) / 10 ** Number(decimals) : 0;

  const [
    recClients, recIndexes, recValues, recDecimals, recTag1s, recTag2s, recRevoked,
  ] = await reputation.readAllFeedback(agentId, clients, tag1, tag2, includeRevoked);

  const records = (recClients as string[]).map((c, i) => ({
    client: c,
    index: Number(recIndexes[i]),
    value: Number(recValues[i]),
    decimals: Number(recDecimals[i]),
    normalized: Number(recValues[i]) / 10 ** Number(recDecimals[i]),
    tag1: recTag1s[i],
    tag2: recTag2s[i],
    revoked: Boolean(recRevoked[i]),
  }));

  console.log(JSON.stringify({
    agentId,
    filter: { tag1, tag2, includeRevoked },
    clients: clients.length,
    count: Number(count),
    normalized: Number(normalized.toFixed(4)),
    tier: tier(normalized, Number(count)),
    records: records.slice(-10),
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
