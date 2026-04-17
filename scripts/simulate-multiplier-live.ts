import { ethers } from "ethers";

/**
 * End-to-end simulation of ClicksReputationMultiplierV1 against the live
 * ERC-8004 Reputation Registry on Base mainnet.
 *
 * We replay the contract logic off-chain using data pulled from the real
 * registry — this stands in for a fork test without needing hardhat to
 * fork mainnet.
 *
 * For a target agent:
 *   1. Fetch getClients(agentId) — the full attestor set that has ever
 *      rated this agent.
 *   2. Query getSummary(agentId, [attestor], "", "") per attestor.
 *   3. Sum counts and values; weight decimals if consistent.
 *   4. Apply the tier table from ClicksReputationMultiplierV1 and print
 *      the fee tier this agent would receive under our multiplier.
 */

const REPUTATION = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const IDENTITY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";

// Tier constants mirror ClicksReputationMultiplierV1.sol
const FEE_COLD = 300;
const FEE_LOW = 250;
const FEE_MID = 200;
const FEE_HIGH = 150;
const FEE_ELITE = 100;

const COUNT_LOW = 10n;
const COUNT_HIGH = 50n;
const COUNT_ELITE = 100n;

const AVG_PASS = 5_000n;
const AVG_HIGH = 7_500n;
const AVG_ELITE = 9_000n;

const MAX_DECIMALS = 18;

const ABI = [
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)",
  "function getClients(uint256 agentId) view returns (address[])",
];

const IDENTITY_ABI = ["function ownerOf(uint256) view returns (address)"];

function tierName(bps: number): string {
  if (bps === FEE_ELITE) return "ELITE";
  if (bps === FEE_HIGH) return "HIGH";
  if (bps === FEE_MID) return "MID";
  if (bps === FEE_LOW) return "LOW";
  return "COLD";
}

function averageBps(count: bigint, summaryValue: bigint, decimals: number): bigint {
  if (count === 0n) return 0n;
  if (summaryValue <= 0n) return 0n;
  const d = BigInt(decimals > MAX_DECIMALS ? MAX_DECIMALS : decimals);
  const numerator = summaryValue * 10_000n;
  const denominator = count * 10n ** d;
  if (denominator === 0n) return 0n;
  let avg = numerator / denominator;
  if (avg > 10_000n) avg = 10_000n;
  return avg;
}

function tierFrom(count: bigint, avg: bigint): number {
  if (count === 0n) return FEE_COLD;
  if (count < COUNT_LOW) return FEE_LOW;
  if (avg < AVG_PASS) return FEE_COLD;
  if (count >= COUNT_ELITE && avg >= AVG_ELITE) return FEE_ELITE;
  if (count >= COUNT_HIGH && avg >= AVG_HIGH) return FEE_HIGH;
  return FEE_MID;
}

async function simulateAgent(
  provider: ethers.JsonRpcProvider,
  agentId: bigint,
  label: string
) {
  const rep = new ethers.Contract(REPUTATION, ABI, provider);
  const identity = new ethers.Contract(IDENTITY, IDENTITY_ABI, provider);

  console.log(`\n=== ${label} (agentId ${agentId}) ===`);

  let owner: string;
  try {
    owner = await identity.ownerOf(agentId);
  } catch {
    console.log("  no identity — COLD");
    return;
  }
  console.log(`  owner:   ${owner}`);

  let clients: string[];
  try {
    clients = [...(await rep.getClients(agentId))];
  } catch (e: any) {
    console.log(`  getClients error: ${e.shortMessage || e.message}`);
    return;
  }
  console.log(`  clients: ${clients.length}`);

  if (clients.length === 0) {
    console.log("  no feedback → simulated tier: COLD (300 bps)");
    return;
  }

  // Simulate: whitelist ALL real clients as "trusted attestors"
  // This is the best case for the agent — we trust everyone who rated them.
  let totalCount = 0n;
  let totalSum = 0n;
  let decimals = 0;
  let decimalsMismatch = false;
  let successful = 0;

  for (const client of clients) {
    try {
      const [c, v, d] = await rep.getSummary(agentId, [client], "", "");
      const cnt = BigInt(c);
      const val = BigInt(v);
      if (cnt === 0n) continue;
      if (successful === 0) decimals = Number(d);
      else if (Number(d) !== decimals) decimalsMismatch = true;
      totalCount += cnt;
      totalSum += val;
      successful += 1;
    } catch {
      // skip attestor whose individual query reverts
    }
  }

  console.log(`  aggregated: count=${totalCount} sum=${totalSum} decimals=${decimals}${decimalsMismatch ? " (MIXED!)" : ""}`);

  if (decimalsMismatch) {
    console.log("  ⚠ decimals vary per attestor — our multiplier assumes uniform decimals");
    console.log("  Action: filter attestor set to one consistent cohort before shipping V5");
    return;
  }

  // Apply multiplier logic
  // (Assume non-empty attestor set so ownership check is N/A off-chain)
  const avg = averageBps(totalCount, totalSum, decimals);
  const bps = tierFrom(totalCount, avg);

  console.log(`  average:    ${avg} bps (${(Number(avg) / 100).toFixed(2)}%)`);
  console.log(`  tier:       ${tierName(bps)} (${bps} bps = ${(bps / 100).toFixed(2)}%)`);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);

  console.log("=== ClicksReputationMultiplierV1 live simulation ===");
  console.log(`Reputation Registry: ${REPUTATION}`);
  console.log(`RPC:                 ${RPC}`);

  // Always cover: us + known seeded #1
  const probes: Array<{ id: bigint; label: string }> = [
    { id: 45074n, label: "Clicks Protocol" },
    { id: 1n, label: "Agent #1 (seed)" },
  ];

  for (const p of probes) {
    try {
      await simulateAgent(provider, p.id, p.label);
    } catch (err: any) {
      console.log(`  fatal: ${err.shortMessage || err.message}`);
    }
  }

  // Discover agents with both identity AND feedback — scan recent range.
  console.log("\n=== Discovery scan — agents with identity + feedback ===");
  const rep = new ethers.Contract(REPUTATION, ABI, provider);
  const identity = new ethers.Contract(IDENTITY, IDENTITY_ABI, provider);
  const ids: bigint[] = [];
  // Sample recent IDs — we're in the 45000s, so probe every ~1000 back
  const sampleIds = [
    44000n, 43000n, 42000n, 40000n, 38000n, 35000n, 30000n,
    25000n, 20000n, 15000n, 10000n, 5000n, 2000n, 500n, 200n,
  ];
  for (const id of sampleIds) {
    try {
      await identity.ownerOf(id); // throws if missing
      const clients = await rep.getClients(id);
      if (clients.length > 0) ids.push(id);
      if (ids.length >= 5) break;
    } catch {
      // skip
    }
  }
  console.log(`Found ${ids.length} agents with identity + feedback: ${ids.join(", ")}`);

  for (const id of ids) {
    await simulateAgent(provider, id, `Agent #${id}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
