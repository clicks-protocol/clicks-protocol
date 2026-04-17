import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Tier distribution scanner — estimate how many Clicks-adopted agents
 * would land in which V5 fee tier RIGHT NOW.
 *
 * Input:
 *   - config/trusted-attestors.json — the whitelist the multiplier would use
 *   - config/clicks-agents.json — the set of agents that have registered
 *     with Clicks (either via ClicksRegistry or an off-chain list)
 *
 * Output: a report with counts per tier, plus a CSV artifact for
 * dashboard ingestion.
 *
 * This is the input to the "V5 go/no-go" decision. Rule of thumb:
 * ship V5 only when ≥ 50% of active Clicks agents land in MID or better.
 */

const REPUTATION = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const IDENTITY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const TRUSTED_ATTESTORS_PATH = path.join(__dirname, "..", "config", "trusted-attestors.json");
const AGENTS_PATH = path.join(__dirname, "..", "config", "clicks-agents.json");
const REPORT_DIR = path.join(__dirname, "..", "marketing", "reports", "tier-distribution");

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
];

const IDENTITY_ABI = [
  "function ownerOf(uint256 agentId) view returns (address)",
];

function tierName(bps: number): string {
  if (bps === FEE_ELITE) return "ELITE";
  if (bps === FEE_HIGH) return "HIGH";
  if (bps === FEE_MID) return "MID";
  if (bps === FEE_LOW) return "LOW";
  return "COLD";
}

function averageBps(count: bigint, sum: bigint, decimals: number): bigint {
  if (count === 0n || sum <= 0n) return 0n;
  const d = BigInt(decimals > MAX_DECIMALS ? MAX_DECIMALS : decimals);
  let avg = (sum * 10_000n) / (count * 10n ** d);
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

function ensure(pathToFile: string, defaultContent: any) {
  if (!fs.existsSync(pathToFile)) {
    fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
    fs.writeFileSync(pathToFile, JSON.stringify(defaultContent, null, 2));
    console.log(`Created template at ${pathToFile}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(pathToFile, "utf8"));
}

async function main() {
  const attestorsConfig = ensure(TRUSTED_ATTESTORS_PATH, {
    attestors: [],
    notes: ["List of wallet addresses that will be registered as trusted attestors in ClicksReputationMultiplierV1.addAttestor(). Example: ['0xabc...']"],
  });
  const agentsConfig = ensure(AGENTS_PATH, {
    agents: [] as Array<{ wallet: string; agentId: number; label?: string }>,
    notes: ["List of Clicks-adopted agents with their ERC-8004 agentIds."],
  });

  if (!attestorsConfig || !agentsConfig) {
    console.log("\nEdit the config templates and re-run.");
    process.exit(0);
  }

  const attestors: string[] = attestorsConfig.attestors || [];
  const agents: Array<{ wallet: string; agentId: number; label?: string }> =
    agentsConfig.agents || [];

  const provider = new ethers.JsonRpcProvider(RPC);
  const rep = new ethers.Contract(REPUTATION, ABI, provider);
  const identity = new ethers.Contract(IDENTITY, IDENTITY_ABI, provider);

  console.log("=== Tier Distribution Scanner ===");
  console.log(`Reputation: ${REPUTATION}`);
  console.log(`Attestors:  ${attestors.length}`);
  console.log(`Agents:     ${agents.length}`);
  console.log("");

  if (attestors.length === 0) {
    console.log("⚠ No trusted attestors configured — every agent will land in COLD.");
    console.log("  This is the realistic output if V5 shipped today with an empty whitelist.\n");
  }

  const counts: Record<string, number> = { COLD: 0, LOW: 0, MID: 0, HIGH: 0, ELITE: 0 };
  const rows: Array<{ wallet: string; agentId: number; label: string; count: string; avgBps: string; tier: string }> = [];

  for (const a of agents) {
    let tier = FEE_COLD;
    let count = 0n;
    let avg = 0n;

    if (attestors.length === 0) {
      tier = FEE_COLD;
    } else {
      try {
        // Verify identity
        const owner = await identity.ownerOf(a.agentId);
        if (owner.toLowerCase() !== a.wallet.toLowerCase()) {
          tier = FEE_COLD;
        } else {
          const [c, sv, dec] = await rep.getSummary(a.agentId, attestors, "", "");
          count = BigInt(c);
          avg = averageBps(count, BigInt(sv), Number(dec));
          tier = tierFrom(count, avg);
        }
      } catch {
        tier = FEE_COLD;
      }
    }

    const name = tierName(tier);
    counts[name]++;
    rows.push({
      wallet: a.wallet,
      agentId: a.agentId,
      label: a.label || "",
      count: count.toString(),
      avgBps: avg.toString(),
      tier: name,
    });
  }

  // Print report
  console.log("=== Distribution ===");
  const total = agents.length || 1;
  for (const name of ["ELITE", "HIGH", "MID", "LOW", "COLD"]) {
    const n = counts[name];
    const pct = ((n / total) * 100).toFixed(1);
    const bar = "█".repeat(Math.round((n / total) * 40));
    console.log(`  ${name.padEnd(6)} ${String(n).padStart(4)} (${pct}%) ${bar}`);
  }

  const mOrBetter = counts.ELITE + counts.HIGH + counts.MID;
  const pctGood = total > 0 ? ((mOrBetter / total) * 100).toFixed(1) : "0";
  console.log(`\nMID-or-better: ${mOrBetter}/${total} (${pctGood}%)`);
  console.log(`V5 deploy rule of thumb: ship when MID-or-better ≥ 50%`);

  // Persist CSV
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const csvPath = path.join(REPORT_DIR, `scan-${stamp}.csv`);
  const header = "wallet,agentId,label,count,avgBps,tier";
  const body = rows.map((r) =>
    `${r.wallet},${r.agentId},"${r.label}",${r.count},${r.avgBps},${r.tier}`
  ).join("\n");
  fs.writeFileSync(csvPath, `${header}\n${body}\n`);
  console.log(`\nCSV: ${csvPath}`);

  const jsonPath = path.join(REPORT_DIR, `scan-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    attestors,
    totalAgents: agents.length,
    counts,
    midOrBetterPct: Number(pctGood),
    rows,
  }, null, 2));
  console.log(`JSON: ${jsonPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
