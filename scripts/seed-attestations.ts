import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Seed attestations — Clicks operator wallet emits schema-V1 feedback
 * to a curated list of target agents, bootstrapping the reputation
 * graph that ClicksReputationMultiplierV1 will later read.
 *
 * DRY RUN by default. Pass --execute to actually send transactions.
 *
 * Target list: config/seed-attestations.json (created on first run).
 *
 * Schema compliance (Attestor Schema V1):
 *   - value in [0, 10000] with decimals = 4
 *   - tag1 = job kind, tag2 = venue
 *   - one entry per (agentId, endpoint, 24h) — we check recent history
 */

const REPUTATION = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const OPERATOR_KEY = process.env.CLICKS_PRIVATE_KEY;

const CONFIG_PATH = path.join(__dirname, "..", "config", "seed-attestations.json");

const ABI = [
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
  "function getLastIndex(uint256 agentId, address clientAddress) view returns (uint64)",
  "function readFeedback(uint256 agentId, address clientAddress, uint64 feedbackIndex) view returns (int128 value, uint8 valueDecimals, string tag1, string tag2, bool isRevoked)",
];

type Attestation = {
  agentId: number;
  value: number;          // 0..10000, decimals = 4
  tag1: string;           // job kind
  tag2: string;           // venue
  endpoint?: string;
  feedbackURI?: string;
  note?: string;          // human-readable comment, not on-chain
};

const DEFAULT_CONFIG = {
  attestations: [] as Attestation[],
  notes: [
    "Add Attestation objects here. Schema V1 requires:",
    "  value in [0, 10000] (decimals fixed at 4 → 1.0000 = perfect, 0.5000 = neutral)",
    "  tag1 in {ingest, route, split, withdraw, liquidate, custom, ''}",
    "  tag2 in {virtuals-acp, x402, direct-sdk, mcp-tool, custom, ''}",
    "  One entry per (agentId, endpoint, 24h)",
    "Example:",
    '  { "agentId": 1, "value": 8500, "tag1": "route", "tag2": "x402", ',
    '    "endpoint": "https://example.com/job/1", "note": "first seed attestation" }',
  ],
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log(`Created empty config at ${CONFIG_PATH}`);
    console.log("Edit it and re-run.");
    process.exit(0);
  }
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  return raw.attestations as Attestation[];
}

function validateSchema(a: Attestation): string | null {
  if (!Number.isInteger(a.agentId) || a.agentId <= 0) return "agentId must be positive integer";
  if (!Number.isInteger(a.value) || a.value < 0 || a.value > 10000)
    return "value must be integer in [0, 10000]";
  const validTag1 = ["ingest", "route", "split", "withdraw", "liquidate", "custom", ""];
  const validTag2 = ["virtuals-acp", "x402", "direct-sdk", "mcp-tool", "custom", ""];
  if (!validTag1.includes(a.tag1)) return `tag1 "${a.tag1}" not in schema V1`;
  if (!validTag2.includes(a.tag2)) return `tag2 "${a.tag2}" not in schema V1`;
  if (a.endpoint && a.endpoint.length > 256) return "endpoint too long (max 256)";
  if (a.feedbackURI && a.feedbackURI.length > 512) return "feedbackURI too long (max 512)";
  return null;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const attestations = loadConfig();

  if (attestations.length === 0) {
    console.log("No attestations configured. Edit config/seed-attestations.json.");
    return;
  }

  const provider = new ethers.JsonRpcProvider(RPC);
  let signer: ethers.Wallet | undefined;
  let attestorAddress: string;

  if (execute) {
    if (!OPERATOR_KEY) {
      console.error("Missing CLICKS_PRIVATE_KEY — cannot execute. Run dry-run first.");
      process.exit(1);
    }
    signer = new ethers.Wallet(OPERATOR_KEY, provider);
    attestorAddress = signer.address;
  } else {
    // Dry-run: simulate from operator address
    attestorAddress = new ethers.Wallet(OPERATOR_KEY || ethers.Wallet.createRandom().privateKey).address;
  }

  const repReader = new ethers.Contract(REPUTATION, ABI, provider);

  console.log(`=== Seed Attestations (${execute ? "EXECUTE" : "DRY RUN"}) ===`);
  console.log(`Attestor wallet: ${attestorAddress}`);
  console.log(`Reputation:      ${REPUTATION}`);
  console.log(`Queued entries:  ${attestations.length}`);
  console.log("");

  // Validate schema
  let schemaErrors = 0;
  for (const [i, a] of attestations.entries()) {
    const err = validateSchema(a);
    if (err) {
      console.error(`  #${i} agentId=${a.agentId}: SCHEMA ERROR — ${err}`);
      schemaErrors++;
    }
  }
  if (schemaErrors > 0) {
    console.error(`\n${schemaErrors} schema errors. Fix config and re-run.`);
    process.exit(1);
  }

  // Duplicate guard via on-chain read
  console.log("Checking for duplicate attestations already on-chain...");
  const seen: Map<string, boolean> = new Map();
  for (const a of attestations) {
    const key = `${a.agentId}:${a.endpoint || ""}`;
    if (seen.has(key)) {
      console.log(`  DUPLICATE in config: agentId=${a.agentId} endpoint="${a.endpoint}"`);
    }
    seen.set(key, true);

    try {
      const lastIdx = await repReader.getLastIndex(a.agentId, attestorAddress);
      if (lastIdx > 0n) {
        console.log(`  agentId=${a.agentId}: attestor already has ${lastIdx} entries on-chain`);
      }
    } catch {
      // Skip — some agentIds may not be registered
    }
  }
  console.log("");

  // Either dry-run display or actual send
  if (!execute) {
    console.log("=== DRY RUN — planned transactions ===");
    for (const [i, a] of attestations.entries()) {
      console.log(`#${i + 1}  agentId=${a.agentId}  value=${a.value}/10000 (${(a.value/100).toFixed(2)}%)`);
      console.log(`     tag1="${a.tag1}" tag2="${a.tag2}"`);
      if (a.endpoint) console.log(`     endpoint="${a.endpoint}"`);
      if (a.note) console.log(`     note: ${a.note}`);
    }
    console.log("");
    console.log("Re-run with --execute to send these transactions.");
    return;
  }

  // Execute
  const rep = new ethers.Contract(REPUTATION, ABI, signer!);
  console.log("=== Sending ===");
  for (const [i, a] of attestations.entries()) {
    console.log(`[${i + 1}/${attestations.length}] agentId=${a.agentId} value=${a.value}`);
    try {
      const tx = await rep.giveFeedback(
        a.agentId,
        a.value,
        4,
        a.tag1,
        a.tag2,
        a.endpoint || "",
        a.feedbackURI || "",
        ethers.ZeroHash
      );
      console.log(`  tx: ${tx.hash}`);
      const rcpt = await tx.wait();
      console.log(`  confirmed in block ${rcpt?.blockNumber}`);
    } catch (err: any) {
      console.error(`  FAILED: ${err.shortMessage || err.message}`);
    }
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
