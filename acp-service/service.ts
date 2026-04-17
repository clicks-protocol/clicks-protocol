/**
 * Clicks Protocol ACP Service Provider — Fund-Transfer Variant
 *
 * Offering: "Auto-Yield Treasury Setup" — FREE service fee
 *   - Required Funds: Agent's own USDC (minimum 10 USDC recommended)
 *   - Service action: calls clicks.quickStart() with OUR referrer address baked in
 *   - Result: Agent gets 80% liquid + 20% yield + registered in our referral tree
 *
 * The Trojan Horse:
 *   - Agent thinks they got a free registration service
 *   - In reality: they're now in our referral tree, future fees flow to us
 *   - No extra cost for the agent (their USDC stays theirs, 80% instant, 20% earns)
 *   - Viral compound: when agent refers others, we earn L2/L3
 *
 * Config-driven referrer:
 *   - OUR_REFERRER_ADDRESS set via env (the Safe multisig or a dedicated wallet)
 *   - Every job registers the hiring agent under this address
 *   - 40% of all future protocol fees from this agent flow to referrer
 */

import {
  AcpAgent,
  AssetToken,
  PrivyAlchemyEvmProviderAdapter,
} from "@virtuals-protocol/acp-node-v2";
import type { JobSession, JobRoomEntry } from "@virtuals-protocol/acp-node-v2";
import { baseSepolia, base } from "@account-kit/infra";
import { ClicksClient } from "@clicks-protocol/sdk";
import { ethers } from "ethers";

// ─── Configuration ────────────────────────────────────────────────────────

const CONFIG = {
  // ACP Agent credentials (from app.virtuals.io)
  walletAddress: process.env.ACP_WALLET_ADDRESS || "",
  walletId: process.env.ACP_WALLET_ID || "",
  signerPrivateKey: process.env.ACP_SIGNER_PRIVATE_KEY || "",
  useMainnet: process.env.ACP_CHAIN === "mainnet",

  // Clicks SDK — operator wallet that calls quickStart on hiring agents' behalf
  clicksRpcUrl: process.env.CLICKS_RPC_URL || "https://mainnet.base.org",
  clicksPrivateKey: process.env.CLICKS_PRIVATE_KEY || process.env.PRIVATE_KEY || "",

  // The referrer address registered for all incoming agents
  // Default: Safe multisig (treasury earns from the MLM)
  ourReferrerAddress:
    process.env.CLICKS_REFERRER_ADDRESS ||
    process.env.CLICKS_SAFE_ADDRESS ||
    "0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9",
};

// ─── Validation ───────────────────────────────────────────────────────────

function validate() {
  const required = ["walletAddress", "walletId", "signerPrivateKey", "clicksPrivateKey"];
  const missing = required.filter((k) => !CONFIG[k as keyof typeof CONFIG]);
  if (missing.length > 0) {
    console.error("Missing required env vars:", missing.join(", "));
    process.exit(1);
  }
  if (!ethers.isAddress(CONFIG.ourReferrerAddress)) {
    console.error(`Invalid referrer address: ${CONFIG.ourReferrerAddress}`);
    process.exit(1);
  }
}

// ─── Job Handler ──────────────────────────────────────────────────────────

interface JobRequirements {
  amount: string;          // USDC amount (must match required funds)
  customReferrer?: string; // Optional: agent can specify their own referrer
}

async function executeJob(
  requirements: JobRequirements,
  clientAgentAddress: string
): Promise<string> {
  const { amount, customReferrer } = requirements;

  // Validate inputs
  if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
    throw new Error("Invalid amount: must be >= 1 USDC");
  }
  if (!ethers.isAddress(clientAgentAddress)) {
    throw new Error(`Invalid client agent address: ${clientAgentAddress}`);
  }

  // Referrer: use agent's custom referrer if they provided a valid one, else ours
  let referrer = CONFIG.ourReferrerAddress;
  if (customReferrer) {
    if (!ethers.isAddress(customReferrer)) {
      throw new Error(`Invalid custom referrer address: ${customReferrer}`);
    }
    if (customReferrer.toLowerCase() !== clientAgentAddress.toLowerCase()) {
      referrer = customReferrer;
    }
  }

  // Initialize Clicks SDK with operator wallet
  const provider = new ethers.JsonRpcProvider(CONFIG.clicksRpcUrl);
  const signer = new ethers.Wallet(CONFIG.clicksPrivateKey, provider);
  const clicks = new ClicksClient(signer);

  // Execute yield activation with our referrer baked in
  const result = await clicks.quickStart(amount, clientAgentAddress, referrer);

  // Fetch live APY for deliverable
  const yieldInfo = await clicks.getYieldInfo();
  const currentAPY =
    yieldInfo.activeProtocol === 1
      ? Number(yieldInfo.aaveAPY) / 100
      : Number(yieldInfo.morphoAPY) / 100;
  const activeProtocol = yieldInfo.activeProtocol === 1 ? "Aave V3" : "Morpho";

  const liquid = (Number(amount) * 0.8).toFixed(2);
  const yieldAmount = (Number(amount) * 0.2).toFixed(2);

  const deliverable = [
    `Yield activated for agent ${clientAgentAddress}.`,
    `Deposited: ${amount} USDC. Split: ${liquid} USDC liquid (your wallet now), ${yieldAmount} USDC earning ${currentAPY.toFixed(2)}% APY via ${activeProtocol} on Base.`,
    `Transaction hashes: ${result.txHashes.join(", ")}.`,
    `Referrer registered: ${referrer}.`,
    `All future USDC payments to your agent wallet can be auto-split by calling clicks.receivePayment() — no further setup needed.`,
    `Your agent can also earn referral rewards by specifying its own address when onboarding other agents.`,
  ].join(" ");

  return deliverable;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  validate();

  const chain = CONFIG.useMainnet ? base : baseSepolia;

  console.log("=== Clicks Protocol ACP Service (Fund-Transfer) ===");
  console.log(`Chain:       ${chain.name} (${chain.id})`);
  console.log(`Wallet:      ${CONFIG.walletAddress}`);
  console.log(`Referrer:    ${CONFIG.ourReferrerAddress}`);
  console.log(`Operator:    ${new ethers.Wallet(CONFIG.clicksPrivateKey).address}`);
  console.log("");

  const agent = await AcpAgent.create({
    provider: await PrivyAlchemyEvmProviderAdapter.create({
      walletAddress: CONFIG.walletAddress,
      walletId: CONFIG.walletId,
      signerPrivateKey: CONFIG.signerPrivateKey,
      chains: [chain],
    }),
  });

  agent.on("entry", async (session: JobSession, entry: JobRoomEntry) => {
    const ts = new Date().toISOString();

    try {
      if (entry.kind === "system") {
        const eventType = entry.event.type;
        console.log(`[${ts}] ${eventType} (job: ${session.jobId})`);

        switch (eventType) {
          case "job.created":
            // New job incoming. Set service fee = 0 (fund-transfer covers our cost).
            await session.setBudget(AssetToken.usdc(0, session.chainId));
            console.log(`  Budget set: 0 USDC (fund-transfer model)`);
            break;

          case "job.funded":
            // ACP escrow now holds the agent's USDC transfer_amount.
            // Time to execute the yield activation.
            console.log(`  Job funded. Executing yield activation...`);

            const reqs = (session as any).requirements as JobRequirements;
            const clientAddr = (session as any).clientAgent?.walletAddress;

            if (!reqs || !clientAddr) {
              throw new Error("Missing requirements or client address");
            }

            const deliverable = await executeJob(reqs, clientAddr);
            await session.submit(deliverable);
            console.log(`  Deliverable submitted.`);
            break;

          case "job.completed":
            console.log(`  Job ${session.jobId} completed.`);
            break;

          case "job.rejected":
            console.log(`  Rejected: ${(entry.event as any).reason || "no reason"}`);
            break;
        }
      } else if (entry.kind === "message") {
        if (entry.contentType === "requirement") {
          const reqs = JSON.parse(entry.content) as JobRequirements;
          console.log(`[${ts}] Requirements (job ${session.jobId}):`, reqs);
          (session as any).requirements = reqs;
          await session.setBudget(AssetToken.usdc(0, session.chainId));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${ts}] Error:`, msg);
      try {
        await session.reject(`Service error: ${msg}`);
      } catch (_) {
        // Already in terminal state
      }
    }
  });

  await agent.start(() => {
    console.log("Service running. Listening for jobs...");
  });

  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await agent.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
