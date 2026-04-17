import { ethers } from "ethers";

/**
 * Live verification of the ERC-8004 Reputation Registry surface on Base mainnet.
 *
 * First probe revealed: getSummary reverts with "clientAddresses required"
 * when passed an empty array. Explore what the contract accepts.
 */

const REPUTATION = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const IDENTITY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const OUR_AGENT = 45074n;

const ABI = [
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)",
  "function readAllFeedback(uint256 agentId, address[] clientAddresses, string tag1, string tag2, bool includeRevoked) view returns (address[] clients, uint64[] feedbackIndexes, int128[] values, uint8[] valueDecimals, string[] tag1s, string[] tag2s, bool[] revokedStatuses)",
  "function getClients(uint256 agentId) view returns (address[])",
  "function getLastIndex(uint256 agentId, address clientAddress) view returns (uint64)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const rep = new ethers.Contract(REPUTATION, ABI, provider);

  console.log("=== Live ERC-8004 Reputation Surface Probe ===");
  console.log(`Agent: ${OUR_AGENT}`);
  console.log("");

  const attempts = [
    {
      label: "getSummary with wildcard address(0)",
      fn: async () => rep.getSummary(OUR_AGENT, [ethers.ZeroAddress], "", ""),
    },
    {
      label: "getClients(agentId)",
      fn: async () => rep.getClients(OUR_AGENT),
    },
    {
      label: "getSummary with explicit self-ref",
      fn: async () =>
        rep.getSummary(OUR_AGENT, ["0xf873BB73e10D24cD3CF9bBed917F5E2d07dA8B80"], "", ""),
    },
    {
      label: "readAllFeedback with wildcard address(0)",
      fn: async () => rep.readAllFeedback(OUR_AGENT, [ethers.ZeroAddress], "", "", false),
    },
  ];

  for (const a of attempts) {
    try {
      const res = await a.fn();
      console.log(`OK  ${a.label}:`);
      console.log("    ", JSON.stringify(res, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
    } catch (e: any) {
      console.log(`ERR ${a.label}: ${e.shortMessage || e.message}`);
    }
  }

  // Also try an older agentId that definitely has clients — sample several.
  console.log("\n--- Searching for an agent with feedback history ---");
  const sample = [1n, 2n, 5n, 10n, 50n, 100n, 500n, 1000n, 5000n, 10000n, 20000n, 30000n, 40000n];
  for (const id of sample) {
    try {
      const clients = await rep.getClients(id);
      if (clients.length > 0) {
        console.log(`#${id}: ${clients.length} clients → ${clients.slice(0, 3).join(", ")}...`);

        // Try wildcard for a known-good agent
        try {
          const [c, v, d] = await rep.getSummary(id, [ethers.ZeroAddress], "", "");
          console.log(`    getSummary(#${id}, [address(0)]): count=${c} value=${v} dec=${d}`);
        } catch (e: any) {
          console.log(`    wildcard: ${e.shortMessage || e.message}`);
        }

        // Try one client
        try {
          const first = clients[0];
          const [c, v, d] = await rep.getSummary(id, [first], "", "");
          console.log(`    getSummary(#${id}, [${first}]): count=${c} value=${v} dec=${d}`);
        } catch (e: any) {
          console.log(`    single-client: ${e.shortMessage || e.message}`);
        }

        // Try all clients explicitly copied
        try {
          const copy = Array.from(clients);
          const [c, v, d] = await rep.getSummary(id, copy, "", "");
          console.log(`    getSummary(#${id}, [all ${copy.length}]): count=${c} value=${v} dec=${d}`);
        } catch (e: any) {
          console.log(`    all-clients: ${e.shortMessage || e.message}`);
        }
        break;
      }
    } catch {}
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
