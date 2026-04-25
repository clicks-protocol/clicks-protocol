#!/usr/bin/env tsx
/**
 * seed-conway-attestations.ts
 *
 * Phase 0: dry-run only. Outputs the calldata that WOULD be sent for cross-
 * attestations of Conway-Research Automatons under Schema V1, but does NOT
 * send. Sending requires the trusted-attestor wallet (NEVER Operator-Wallet,
 * Hard Rule #1) and an explicit `--execute` flag plus David go.
 *
 * Strategy: see `strategy/CROSS-ATTESTATION-CONWAY.md`.
 *
 * Usage:
 *   npx tsx scripts/seed-conway-attestations.ts \
 *     --config scripts/conway-attestations.config.json
 *
 *   # Show what would be executed (default: dry-run only):
 *   npx tsx scripts/seed-conway-attestations.ts --config <path>
 *
 *   # Actually execute (requires Safe approval + non-operator signer):
 *   npx tsx scripts/seed-conway-attestations.ts --config <path> --execute
 */

import { JsonRpcProvider, Wallet, Contract, formatUnits, isAddress } from 'ethers';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const REPUTATION_REGISTRY = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63';
const IDENTITY_REGISTRY   = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const USDC_BASE           = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const OPERATOR_WALLET     = '0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80'; // BLOCKED as attestor

const REPUTATION_ABI = [
  'function giveFeedback(uint256 agentId, uint256 value, uint8 valueDecimals, bytes32 tag1, bytes32 tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external',
];

const IDENTITY_ABI = [
  'function getAgent(uint256 agentId) external view returns (address)',
];

interface ConwayConfig {
  attestorWallet: string; // MUST NOT be operator wallet
  rpcUrl: string;
  agents: { agentId: number; wallet: string; firstSeenBlock: number; }[];
}

function parseArgs(argv: string[]) {
  let configPath = '';
  let execute = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') configPath = argv[++i];
    else if (argv[i] === '--execute') execute = true;
  }
  if (!configPath) {
    console.error('Usage: seed-conway-attestations.ts --config <path> [--execute]');
    process.exit(2);
  }
  return { configPath, execute };
}

async function computeRating(
  provider: JsonRpcProvider,
  agent: ConwayConfig['agents'][number],
): Promise<{ rating: number; metrics: Record<string, unknown> }> {
  const usdc = new Contract(USDC_BASE, [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ], provider);

  const filter = usdc.filters.Transfer(null, agent.wallet);
  const currentBlock = await provider.getBlockNumber();
  const events = await usdc.queryFilter(filter, agent.firstSeenBlock, currentBlock);

  const inflowCount = events.length;
  const blocksAlive = currentBlock - agent.firstSeenBlock;
  const aliveDays   = Math.floor(blocksAlive / 43200); // ~2s per block on Base, 86400/2 = 43200 blocks/day

  // Survival 50% (cap at 30 days = 1.0), inflows 25% (cap at 20 = 1.0), tier-stability 25% (mock = 1.0 for now)
  const survivalScore   = Math.min(aliveDays / 30, 1.0);
  const inflowScore     = Math.min(inflowCount / 20, 1.0);
  const stabilityScore  = 1.0; // TODO: derive from Conway public health endpoint when available

  const rating = 0.50 * survivalScore + 0.25 * inflowScore + 0.25 * stabilityScore;
  const ratingScaled = Math.round(rating * 10000); // Schema V1: valueDecimals=4

  return {
    rating: ratingScaled,
    metrics: {
      inflow_tx_count: inflowCount,
      blocks_alive: blocksAlive,
      alive_days: aliveDays,
      survival_score: survivalScore.toFixed(3),
      inflow_score: inflowScore.toFixed(3),
      stability_score: stabilityScore.toFixed(3),
      rating_normalized: rating.toFixed(4),
      rating_scaled: ratingScaled,
    },
  };
}

function buildPayload(agent: ConwayConfig['agents'][number], metrics: Record<string, unknown>) {
  return {
    schema: 'clicks-v1-cross-attestation/conway/v1',
    subject: { chain: 'base', agentId: agent.agentId, wallet: agent.wallet },
    observed: metrics,
    rating: Number(metrics.rating_normalized),
    rating_explanation: `${metrics.alive_days} days alive, ${metrics.inflow_tx_count} USDC inflows.`,
    issued_at: new Date().toISOString(),
  };
}

function bytes32(s: string): string {
  // pad ASCII to bytes32, truncate to 32 bytes
  const buf = Buffer.alloc(32);
  Buffer.from(s, 'utf8').copy(buf);
  return '0x' + buf.toString('hex');
}

async function main() {
  const { configPath, execute } = parseArgs(process.argv.slice(2));
  if (!existsSync(configPath)) {
    console.error(`Config not found: ${configPath}`);
    process.exit(1);
  }
  const config: ConwayConfig = JSON.parse(readFileSync(configPath, 'utf8'));

  // SAFETY: never proceed if attestor wallet is the operator wallet
  if (config.attestorWallet.toLowerCase() === OPERATOR_WALLET.toLowerCase()) {
    console.error('REFUSED: attestorWallet is the Operator-Wallet. Hard Rule #1 forbids self-attestation.');
    process.exit(3);
  }
  if (!isAddress(config.attestorWallet)) {
    console.error(`Invalid attestorWallet address: ${config.attestorWallet}`);
    process.exit(2);
  }

  const provider = new JsonRpcProvider(config.rpcUrl);
  console.log(`[seed-conway] mode=${execute ? 'EXECUTE' : 'DRY-RUN'}  agents=${config.agents.length}\n`);

  const attestations: Array<Record<string, unknown>> = [];

  for (const agent of config.agents) {
    if (!isAddress(agent.wallet)) {
      console.warn(`[skip] invalid wallet for agentId ${agent.agentId}`);
      continue;
    }
    const { rating, metrics } = await computeRating(provider, agent);
    if (rating < 5000) {
      console.log(`[skip] agentId=${agent.agentId} rating=${rating} (< 5000 threshold)`);
      continue;
    }

    const payload = buildPayload(agent, metrics);
    const payloadJson = JSON.stringify(payload, null, 2);
    const feedbackHash = '0x' + createHash('sha256').update(payloadJson).digest('hex');

    const calldata = {
      contract: REPUTATION_REGISTRY,
      method: 'giveFeedback',
      args: {
        agentId: agent.agentId,
        value: rating,
        valueDecimals: 4,
        tag1: bytes32('route'),
        tag2: bytes32('x402'),
        endpoint: `https://api.conway.tech/v1/agents/${agent.agentId}/health`,
        feedbackURI: `ipfs://<pin-cid-of-payload>`,
        feedbackHash,
      },
    };

    attestations.push({ agent, metrics, payload, calldata });

    console.log(`[ready] agentId=${agent.agentId} wallet=${agent.wallet}`);
    console.log(`        rating=${rating}/10000  alive=${metrics.alive_days}d  inflows=${metrics.inflow_tx_count}`);
    console.log(`        feedbackHash=${feedbackHash}`);
    console.log('');
  }

  // Write a dry-run report
  const reportPath = resolve(dirname(configPath), 'conway-attestations-dryrun.json');
  writeFileSync(reportPath, JSON.stringify(attestations, null, 2));
  console.log(`[seed-conway] wrote dry-run report → ${reportPath}`);

  if (!execute) {
    console.log('\n[seed-conway] DRY-RUN complete. To execute:');
    console.log('  1. Review the dry-run report above');
    console.log('  2. Pin each payload JSON to IPFS, replace <pin-cid-of-payload> placeholders');
    console.log('  3. Re-run with --execute and a signer for the attestor wallet');
    console.log('  4. NEVER use the Operator-Wallet (Hard Rule #1)');
    return;
  }

  // EXECUTE branch — placeholder, requires explicit signer setup
  console.error('[seed-conway] --execute not yet wired. Requires Safe approval + designated trusted-attestor wallet.');
  console.error('              Implementation deferred until David go on a specific Safe-flow design.');
  process.exit(4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
