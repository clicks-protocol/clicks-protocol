/**
 * Clicks Protocol ACP Service Provider — Fund-Transfer Variant
 *
 * Offering: "Treasury Setup" — FREE service fee
 *   - Required Funds: Agent's own USDC (minimum 10 USDC recommended)
 *   - Service action: calls clicks.quickStart() for the hiring agent
 *   - Result: Agent gets 80% liquid + 20% yield via the current Clicks setup path
 *
 * Optional referral mode:
 *   - Treasury setup and referral attribution are separate steps
 *   - Referral attribution only runs when agent-signed approval is provided
 *   - The ACP caller must also be authorized on ClicksReferral
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
import type { Address } from "viem";

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

  // Reserved for future dedicated referral registration flow.
  // Current SDK quickStart does not apply this on-chain.
  ourReferrerAddress:
    process.env.CLICKS_REFERRER_ADDRESS ||
    process.env.CLICKS_SAFE_ADDRESS ||
    "0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9",

  // Default USDC amount when requirements don't specify (minimum)
  defaultTransferAmount: "10",

  // Destination for fund-transfer hook — computed lazily in validate()
  fundTransferDestination: "" as Address,
};

const REFERRAL_ABI = [
  "function registerReferralWithSig(address newAgent, address referrer, uint256 deadline, bytes signature) external",
  "function authorized(address) external view returns (bool)",
] as const;

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

  // Derive operator wallet address for fund-transfer destination
  const operatorAddr = process.env.CLICKS_OPERATOR_ADDRESS ||
    new ethers.Wallet(CONFIG.clicksPrivateKey).address;
  if (!ethers.isAddress(operatorAddr)) {
    console.error(`Invalid operator/fund-transfer destination: ${operatorAddr}`);
    process.exit(1);
  }
  CONFIG.fundTransferDestination = operatorAddr as Address;
}

// ─── Job Handler ──────────────────────────────────────────────────────────

interface JobRequirements {
  amount: string; // USDC amount (must match required funds)
  referrerAddress?: string;
  referralDeadline?: string;
  referralSignature?: string;
}

interface ReferralAttemptResult {
  attempted: boolean;
  registered: boolean;
  txHash?: string;
  reason?: string;
}

async function executeJob(
  requirements: JobRequirements,
  clientAgentAddress: string
): Promise<string> {
  const { amount, referrerAddress, referralDeadline, referralSignature } = requirements;

  // Validate inputs
  if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
    throw new Error("Invalid amount: must be >= 1 USDC");
  }
  if (!ethers.isAddress(clientAgentAddress)) {
    throw new Error(`Invalid client agent address: ${clientAgentAddress}`);
  }

  // Initialize Clicks SDK with operator wallet
  const provider = new ethers.JsonRpcProvider(CONFIG.clicksRpcUrl);
  const signer = new ethers.Wallet(CONFIG.clicksPrivateKey, provider);
  const clicks = new ClicksClient(signer);

  // Execute treasury activation through the current SDK path
  const result = await clicks.quickStart(amount, clientAgentAddress);

  // Optional separate referral attribution
  const referralResult = await tryRegisterReferral(
    signer,
    clicks,
    clientAgentAddress,
    referrerAddress,
    referralDeadline,
    referralSignature,
  );

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
    `Treasury setup activated for agent ${clientAgentAddress}.`,
    `Deposited: ${amount} USDC. Split: ${liquid} USDC liquid (your wallet now), ${yieldAmount} USDC earning ${currentAPY.toFixed(2)}% APY via ${activeProtocol} on Base.`,
    `Transaction hashes: ${result.txHashes.join(", ")}.`,
    referralDeliverableLine(referralResult),
    `All future USDC payments to your agent wallet can be auto-split by calling clicks.receivePayment() — no further treasury setup needed.`,
  ].join(" ");

  return deliverable;
}

async function tryRegisterReferral(
  signer: ethers.Wallet,
  clicks: ClicksClient,
  clientAgentAddress: string,
  referrerAddress?: string,
  referralDeadline?: string,
  referralSignature?: string,
): Promise<ReferralAttemptResult> {
  if (!referrerAddress && !referralDeadline && !referralSignature) {
    return {
      attempted: false,
      registered: false,
      reason: "No referral approval provided. Treasury setup completed without attribution.",
    };
  }

  if (!referrerAddress || !referralDeadline || !referralSignature) {
    return {
      attempted: true,
      registered: false,
      reason: "Referral inputs incomplete. Need referrerAddress, referralDeadline and referralSignature together.",
    };
  }

  if (!ethers.isAddress(referrerAddress)) {
    return {
      attempted: true,
      registered: false,
      reason: `Invalid referrer address: ${referrerAddress}`,
    };
  }

  const referral = new ethers.Contract(
    clicks.addresses.referral,
    REFERRAL_ABI,
    signer,
  );

  const isAuthorized = await referral.authorized(signer.address) as boolean;
  if (!isAuthorized) {
    return {
      attempted: true,
      registered: false,
      reason: `Referral caller ${signer.address} is not authorized on ClicksReferral. Treasury setup completed without attribution.`,
    };
  }

  const deadline = BigInt(referralDeadline);
  const tx = await referral.registerReferralWithSig(
    clientAgentAddress,
    referrerAddress,
    deadline,
    referralSignature,
  );
  await tx.wait();

  return {
    attempted: true,
    registered: true,
    txHash: tx.hash,
  };
}

function referralDeliverableLine(result: ReferralAttemptResult): string {
  if (!result.attempted) {
    return result.reason || "Referral attribution not attempted.";
  }
  if (result.registered) {
    return `Referral attribution registered successfully. Referral tx hash: ${result.txHash}.`;
  }
  return `Referral attribution not completed. ${result.reason}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  validate();

  const chain = CONFIG.useMainnet ? base : baseSepolia;

  console.log("=== Clicks Protocol ACP Service (Fund-Transfer) ===");
  console.log(`Chain:       ${chain.name} (${chain.id})`);
  console.log(`Wallet:      ${CONFIG.walletAddress}`);
  console.log(`Referrer:    optional explicit flow (${CONFIG.ourReferrerAddress})`);
  console.log(`Operator:    ${new ethers.Wallet(CONFIG.clicksPrivateKey).address}`);
  console.log("");

  const agent = await AcpAgent.create({
    provider: await PrivyAlchemyEvmProviderAdapter.create({
      walletAddress: CONFIG.walletAddress as Address,
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
            // New job incoming — wait for requirements message before setting budget.
            // The FundTransferHook requires setBudgetWithFundRequest which needs
            // the transfer amount from requirements. We'll set budget when we
            // receive the requirement message.
            console.log(`  Job created, waiting for requirements...`);
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

          // Determine transfer amount from requirements
          const transferAmt = reqs.amount || CONFIG.defaultTransferAmount;
          const transferUsdc = AssetToken.usdc(Number(transferAmt), session.chainId);

          // Service fee = 0, but request USDC transfer from buyer to our operator
          await session.setBudgetWithFundRequest(
            AssetToken.usdc(0, session.chainId),  // service fee: free
            transferUsdc,                           // buyer transfers this much USDC
            CONFIG.fundTransferDestination           // to our operator wallet
          );
          console.log(`  Budget set: 0 USDC fee, requesting ${transferAmt} USDC transfer to ${CONFIG.fundTransferDestination}`);
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
