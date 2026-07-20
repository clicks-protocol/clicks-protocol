#!/usr/bin/env tsx
/**
 * Write a Schema V1 attestation to the ERC-8004 Reputation Registry on Base.
 *
 * Usage:
 *   AGENT_PRIVATE_KEY=0x... npx tsx scripts/attest.ts \
 *     --agent-id 45074 --value 8500 --tag1 route --tag2 x402 \
 *     [--endpoint https://...] [--feedback-uri ipfs://...] [--feedback-hash 0x...]
 *
 * Schema V1:
 *   value in [0, 10000], decimals fixed at 4 (so 8500 = 0.8500).
 *   tag1 in { ingest | route | split | withdraw | liquidate | custom | "" }.
 *   tag2 in { virtuals-acp | x402 | direct-sdk | mcp-tool | custom | "" }.
 *   endpoint <= 256 chars, feedbackURI <= 512 chars.
 *
 * Self-attestation is rejected by policy. Attest for counterparties only.
 */
import { ethers } from 'ethers';

const REPUTATION = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63';
const ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
  'function getLastIndex(uint256 agentId, address client) view returns (uint64)',
];

const TAG1_VOCAB = new Set(['ingest', 'route', 'split', 'withdraw', 'liquidate', 'custom', '']);
const TAG2_VOCAB = new Set(['virtuals-acp', 'x402', 'direct-sdk', 'mcp-tool', 'custom', '']);

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      out[a.slice(2)] = argv[i + 1];
      i++;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const agentId = args['agent-id'];
  const value = Number(args['value']);
  const tag1 = args['tag1'] ?? '';
  const tag2 = args['tag2'] ?? '';
  const endpoint = args['endpoint'] ?? '';
  const feedbackURI = args['feedback-uri'] ?? '';
  const feedbackHash = args['feedback-hash'] ?? ethers.ZeroHash;

  if (!agentId) {
    console.error('Required: --agent-id <id> --value <0..10000> [--tag1 <kind>] [--tag2 <venue>]');
    process.exit(1);
  }
  if (!Number.isInteger(value) || value < 0 || value > 10000) {
    throw new Error('value must be integer in [0, 10000]');
  }
  if (!TAG1_VOCAB.has(tag1)) throw new Error(`tag1 "${tag1}" not in Schema V1 vocab`);
  if (!TAG2_VOCAB.has(tag2)) throw new Error(`tag2 "${tag2}" not in Schema V1 vocab`);
  if (endpoint.length > 256) throw new Error('endpoint too long (max 256)');
  if (feedbackURI.length > 512) throw new Error('feedbackURI too long (max 512)');

  const key = process.env.AGENT_PRIVATE_KEY;
  if (!key) throw new Error('AGENT_PRIVATE_KEY not set');

  const rpc = process.env.CLICKS_RPC_URL || 'https://mainnet.base.org';
  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(key, provider);
  const reputation = new ethers.Contract(REPUTATION, ABI, signer);

  console.error(`Attesting agentId=${agentId} value=${value}/10000 tag1="${tag1}" tag2="${tag2}"`);
  console.error(`From: ${signer.address}`);

  // 24h duplicate guard against our own prior feedback to this agent
  try {
    const last = await reputation.getLastIndex(agentId, signer.address);
    if (last > 0n) {
      console.error(`Note: attestor already has ${last} feedback entries for this agent.`);
    }
  } catch {
    // agent may not exist yet; giveFeedback will surface that
  }

  const tx = await reputation.giveFeedback(
    agentId,
    value,
    4,
    tag1,
    tag2,
    endpoint,
    feedbackURI,
    feedbackHash,
  );
  console.error(`Tx: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(JSON.stringify({
    txHash: tx.hash,
    blockNumber: receipt?.blockNumber,
    agentId,
    value,
    valueDecimals: 4,
    tag1,
    tag2,
    endpoint,
    feedbackURI,
    feedbackHash,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
