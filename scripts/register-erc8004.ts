import { ethers } from "ethers";

/**
 * ERC-8004 Identity Registry — Register Clicks as a Trustless Agent
 *
 * Mints an Identity NFT on Base mainnet pointing to the agent-registration.json
 * hosted at https://clicksprotocol.xyz/.well-known/agent-registration.json
 *
 * Contracts (Base mainnet):
 *   Identity Registry:   0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 *   Reputation Registry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
 *
 * Caller must be the wallet that will own the agent NFT.
 * We use the ACP wallet (0x06ef9de...) because its identity drives ACP jobs + reputation.
 *
 * Run:
 *   CLICKS_PRIVATE_KEY=... npx tsx scripts/register-erc8004.ts
 */

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const AGENT_URI = "https://clicksprotocol.xyz/.well-known/agent-registration.json";
const RPC_URL = process.env.CLICKS_RPC_URL || "https://mainnet.base.org";

const IDENTITY_ABI = [
  "function register(string agentURI) external returns (uint256 agentId)",
  "function setAgentURI(uint256 agentId, string agentURI) external",
  "function tokenURI(uint256 agentId) view returns (string)",
  "function ownerOf(uint256 agentId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "event Register(uint256 indexed agentId, address indexed owner, string agentURI)",
];

async function main() {
  const pk = process.env.CLICKS_PRIVATE_KEY;
  if (!pk) {
    console.error("Missing CLICKS_PRIVATE_KEY");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(pk, provider);

  console.log("=== ERC-8004 Registration ===");
  console.log(`Caller:        ${signer.address}`);
  console.log(`Identity Reg:  ${IDENTITY_REGISTRY}`);
  console.log(`Agent URI:     ${AGENT_URI}`);
  console.log("");

  const registry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);

  const existing = await registry.balanceOf(signer.address);
  if (existing > 0n) {
    console.log(`Wallet already holds ${existing} agent NFT(s). Skipping register.`);
    console.log("If you want to update the URI, call setAgentURI(agentId, newUri) directly.");
    return;
  }

  const feeData = await provider.getFeeData();
  console.log(`Gas price:     ${ethers.formatUnits(feeData.gasPrice ?? 0n, "gwei")} gwei`);

  const tx = await registry.register(AGENT_URI);
  console.log(`Tx sent:       ${tx.hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log(`Confirmed in block ${receipt?.blockNumber}`);

  const event = receipt?.logs
    .map((l: any) => {
      try { return registry.interface.parseLog(l); } catch { return null; }
    })
    .find((e: any) => e?.name === "Register");

  if (event) {
    const agentId = event.args.agentId.toString();
    console.log("");
    console.log(`Agent registered with ID: ${agentId}`);
    console.log(`View: https://basescan.org/token/${IDENTITY_REGISTRY}?a=${agentId}`);
    console.log("");
    console.log("Next: update agent-registration.json registrations[] with:");
    console.log(JSON.stringify({
      agentRegistry: IDENTITY_REGISTRY,
      agentId,
    }, null, 2));
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
