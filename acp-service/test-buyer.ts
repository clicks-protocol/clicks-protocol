/**
 * ACP Buyer Test Script
 *
 * Hires our Clicks ACP service to test the full flow:
 * 1. Buyer creates job with requirements (amount, referrer)
 * 2. Seller (our Clicks service) sets budget = 0.1 USDC
 * 3. Buyer funds escrow
 * 4. Seller executes clicks.quickStart() on buyer's wallet
 * 5. Seller submits deliverable
 * 6. Buyer completes job, payment released
 */

import {
  AcpAgent,
  AssetToken,
  PrivyAlchemyEvmProviderAdapter,
} from "@virtuals-protocol/acp-node-v2";
import type { JobSession, JobRoomEntry } from "@virtuals-protocol/acp-node-v2";
import { baseSepolia, base } from "@account-kit/infra";

const CONFIG = {
  buyerWallet: process.env.ACP_BUYER_WALLET_ADDRESS || "",
  buyerWalletId: process.env.ACP_BUYER_WALLET_ID || "",
  buyerSignerKey: process.env.ACP_BUYER_SIGNER_PRIVATE_KEY || "",

  sellerWallet: process.env.ACP_WALLET_ADDRESS || "",

  useMainnet: process.env.ACP_CHAIN === "mainnet",

  // Test job parameters
  testAmount: "10",
  testReferrer: "0x742d35Cc6634C0532925a3b844Bc9e7595f8b7D0", // placeholder
  offeringName: "auto_yield_treasury",
};

async function main() {
  if (!CONFIG.buyerWallet || !CONFIG.sellerWallet) {
    console.error("Missing ACP_BUYER_* or ACP_WALLET_ADDRESS env vars");
    process.exit(1);
  }

  const chain = CONFIG.useMainnet ? base : baseSepolia;

  console.log("=== ACP Buyer Test ===");
  console.log(`Chain:  ${chain.name} (${chain.id})`);
  console.log(`Buyer:  ${CONFIG.buyerWallet}`);
  console.log(`Seller: ${CONFIG.sellerWallet}`);
  console.log(`Offering: ${CONFIG.offeringName}`);
  console.log("");

  const buyer = await AcpAgent.create({
    provider: await PrivyAlchemyEvmProviderAdapter.create({
      walletAddress: CONFIG.buyerWallet,
      walletId: CONFIG.buyerWalletId,
      signerPrivateKey: CONFIG.buyerSignerKey,
      chains: [chain],
    }),
  });

  let jobCompleted = false;

  buyer.on("entry", async (session: JobSession, entry: JobRoomEntry) => {
    const ts = new Date().toISOString();

    if (entry.kind === "system") {
      const eventType = entry.event.type;
      console.log(`[${ts}] ${eventType} (job: ${session.jobId})`);

      try {
        switch (eventType) {
          case "budget.set":
            // Seller proposed a budget. Fund the escrow.
            const budget = (entry.event as any).budget;
            console.log(`  Seller budget: ${JSON.stringify(budget)}`);
            console.log(`  Funding escrow with 0.1 USDC...`);
            await session.fund(AssetToken.usdc(0.1, session.chainId));
            break;

          case "job.submitted":
            const deliverable = (entry.event as any).deliverable;
            console.log(`  Deliverable received:`);
            console.log(`  ${deliverable}`);
            console.log(`  Accepting...`);
            await session.complete("Yield activation confirmed.");
            break;

          case "job.completed":
            console.log(`  Job completed successfully!`);
            jobCompleted = true;
            break;

          case "job.rejected":
            console.log(`  Job rejected: ${(entry.event as any).reason}`);
            jobCompleted = true;
            break;

          case "job.expired":
            console.log(`  Job expired.`);
            jobCompleted = true;
            break;
        }
      } catch (err) {
        console.error(`  Error: ${err instanceof Error ? err.message : err}`);
      }
    } else if (entry.kind === "message") {
      console.log(`[${ts}] Message: ${entry.content}`);
    }
  });

  await buyer.start(() => {
    console.log("Buyer online. Creating job...");
  });

  // Create the test job
  try {
    const jobId = await buyer.createJobByOfferingName(
      chain.id,
      CONFIG.offeringName,
      CONFIG.sellerWallet,
      {
        amount: CONFIG.testAmount,
        customReferrer: CONFIG.testReferrer,
      },
      { evaluatorAddress: CONFIG.buyerWallet } // self-evaluation for testing
    );
    console.log(`Job created: ${jobId}`);
    console.log("Waiting for seller to process...");
    console.log("");
  } catch (err) {
    console.error("Failed to create job:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Wait up to 5 minutes for job completion
  const timeout = 5 * 60 * 1000;
  const start = Date.now();
  while (!jobCompleted && Date.now() - start < timeout) {
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!jobCompleted) {
    console.log("Timeout waiting for job completion.");
  }

  await buyer.stop();
  process.exit(jobCompleted ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
