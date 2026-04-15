import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ClicksReferral } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ClicksReferral", function () {
  async function deployReferralFixture() {
    const [owner, agentA, agentB, agentC, agentD, agentE, feeContract] =
      await ethers.getSigners();

    const ClicksReferral = await ethers.getContractFactory("ClicksReferral");
    const referral = await ClicksReferral.deploy();

    // Authorize feeContract as caller
    await referral.setAuthorized(feeContract.address, true);
    // Authorize owner too for convenience
    await referral.setAuthorized(owner.address, true);

    return { referral, owner, agentA, agentB, agentC, agentD, agentE, feeContract };
  }

  // ═══════════════════════════════════════════════════════
  // REFERRAL REGISTRATION
  // ═══════════════════════════════════════════════════════

  describe("Referral Registration", function () {
    it("should register a referral (L1)", async function () {
      const { referral, owner, agentA, agentB } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      const stats = await referral.getReferralStats(agentB.address);
      expect(stats.referrer).to.equal(agentA.address);
      expect(stats.directCount).to.equal(0);

      const statsA = await referral.getReferralStats(agentA.address);
      expect(statsA.directCount).to.equal(1);
    });

    it("should register 3-level deep referral chain", async function () {
      const { referral, agentA, agentB, agentC, agentD } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address); // A → B
      await referral.registerReferral(agentC.address, agentB.address); // B → C
      await referral.registerReferral(agentD.address, agentC.address); // C → D

      const chain = await referral.getReferralChain(agentD.address);
      expect(chain[0]).to.equal(agentC.address); // L1
      expect(chain[1]).to.equal(agentB.address); // L2
      expect(chain[2]).to.equal(agentA.address); // L3
    });

    it("should reject self-referral", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      await expect(
        referral.registerReferral(agentA.address, agentA.address)
      ).to.be.revertedWith("Self-referral not allowed");
    });

    it("should reject circular referral", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      await expect(
        referral.registerReferral(agentA.address, agentB.address)
      ).to.be.revertedWith("Circular referral");
    });

    it("should reject duplicate registration", async function () {
      const { referral, agentA, agentB, agentC } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      await expect(
        referral.registerReferral(agentB.address, agentC.address)
      ).to.be.revertedWith("Already referred");
    });

    it("should allow registration without referrer", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentA.address, ethers.ZeroAddress);

      const stats = await referral.getReferralStats(agentA.address);
      expect(stats.referrer).to.equal(ethers.ZeroAddress);
    });

    it("should reject unauthorized caller", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(agentA).registerReferral(agentB.address, agentA.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should emit AgentReferred event", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await expect(referral.registerReferral(agentB.address, agentA.address))
        .to.emit(referral, "AgentReferred")
        .withArgs(agentB.address, agentA.address, (v: any) => v > 0);
    });

    it("should track totalAgentsReferred", async function () {
      const { referral, agentA, agentB, agentC } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.registerReferral(agentC.address, agentA.address);

      expect(await referral.totalAgentsReferred()).to.equal(2);
    });
  });

  // ═══════════════════════════════════════════════════════
  // YIELD DISTRIBUTION
  // ═══════════════════════════════════════════════════════

  describe("Yield Distribution", function () {
    it("should distribute L1 referral rewards (40%)", async function () {
      const { referral, agentA, agentB, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      // Simulate fee of 1000 USDC (1000e6)
      const fee = 1000_000000n; // 1000 USDC
      const tx = await referral.connect(feeContract).distributeReferralYield(agentB.address, fee);

      const statsA = await referral.getReferralStats(agentA.address);
      expect(statsA.claimable).to.equal(400_000000n); // 40% of 1000
      expect(statsA.totalEarned).to.equal(400_000000n);
    });

    it("should distribute L1+L2 referral rewards", async function () {
      const { referral, agentA, agentB, agentC, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.registerReferral(agentC.address, agentB.address);

      const fee = 1000_000000n;
      await referral.connect(feeContract).distributeReferralYield(agentC.address, fee);

      const statsB = await referral.getReferralStats(agentB.address);
      expect(statsB.claimable).to.equal(400_000000n); // L1: 40%

      const statsA = await referral.getReferralStats(agentA.address);
      expect(statsA.claimable).to.equal(200_000000n); // L2: 20%
    });

    it("should distribute L1+L2+L3 referral rewards", async function () {
      const { referral, agentA, agentB, agentC, agentD, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.registerReferral(agentC.address, agentB.address);
      await referral.registerReferral(agentD.address, agentC.address);

      const fee = 1000_000000n;
      const treasuryAmount = await referral.connect(feeContract).distributeReferralYield.staticCall(agentD.address, fee);

      // Treasury gets 30% (100% - 40% - 20% - 10%)
      expect(treasuryAmount).to.equal(300_000000n);

      // Execute
      await referral.connect(feeContract).distributeReferralYield(agentD.address, fee);

      expect((await referral.getReferralStats(agentC.address)).claimable).to.equal(400_000000n); // L1
      expect((await referral.getReferralStats(agentB.address)).claimable).to.equal(200_000000n); // L2
      expect((await referral.getReferralStats(agentA.address)).claimable).to.equal(100_000000n); // L3
    });

    it("should return full fee as treasury when no referrer", async function () {
      const { referral, agentA, feeContract } = await loadFixture(deployReferralFixture);

      // agentA has no referrer
      const fee = 1000_000000n;
      const treasuryAmount = await referral.connect(feeContract).distributeReferralYield.staticCall(agentA.address, fee);

      expect(treasuryAmount).to.equal(fee); // 100% to treasury
    });

    it("should accumulate rewards from multiple distributions", async function () {
      const { referral, agentA, agentB, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      await referral.connect(feeContract).distributeReferralYield(agentB.address, 100_000000n);
      await referral.connect(feeContract).distributeReferralYield(agentB.address, 200_000000n);

      const statsA = await referral.getReferralStats(agentA.address);
      expect(statsA.claimable).to.equal(120_000000n); // 40% of 100 + 40% of 200
      expect(statsA.totalEarned).to.equal(120_000000n);
    });

    it("should emit ReferralYieldDistributed events", async function () {
      const { referral, agentA, agentB, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);

      await expect(referral.connect(feeContract).distributeReferralYield(agentB.address, 1000_000000n))
        .to.emit(referral, "ReferralYieldDistributed")
        .withArgs(agentB.address, agentA.address, 1, 400_000000n);
    });
  });

  // ═══════════════════════════════════════════════════════
  // CLAIM REWARDS
  // ═══════════════════════════════════════════════════════

  describe("Claim Rewards", function () {
    it("should claim accumulated rewards", async function () {
      const { referral, agentA, agentB, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.connect(feeContract).distributeReferralYield(agentB.address, 1000_000000n);

      const tx = await referral.connect(agentA).claimReferralRewards();
      await expect(tx).to.emit(referral, "ReferralClaimed").withArgs(agentA.address, 400_000000n);

      // Claimable should be 0 after claim
      const stats = await referral.getReferralStats(agentA.address);
      expect(stats.claimable).to.equal(0);
      // totalEarned should still show lifetime
      expect(stats.totalEarned).to.equal(400_000000n);
    });

    it("should reject claim when nothing to claim", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(agentA).claimReferralRewards()
      ).to.be.revertedWith("Nothing to claim");
    });
  });

  // ═══════════════════════════════════════════════════════
  // TEAM SYSTEM
  // ═══════════════════════════════════════════════════════

  describe("Team System", function () {
    it("should create a team", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      await expect(referral.connect(agentA).createTeam())
        .to.emit(referral, "TeamCreated")
        .withArgs(1, agentA.address);

      const info = await referral.getTeamInfo(1);
      expect(info.leader).to.equal(agentA.address);
      expect(info.memberCount).to.equal(1);
      expect(info.currentTier).to.equal(0);
    });

    it("should join a team", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await referral.connect(agentA).createTeam();
      await referral.connect(agentB).joinTeam(1);

      const info = await referral.getTeamInfo(1);
      expect(info.memberCount).to.equal(2);

      const members = await referral.getTeamMembers(1);
      expect(members).to.include(agentA.address);
      expect(members).to.include(agentB.address);
    });

    it("should reject joining team if already in one", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await referral.connect(agentA).createTeam();
      await referral.connect(agentB).joinTeam(1);

      await expect(
        referral.connect(agentB).joinTeam(1)
      ).to.be.revertedWith("Already in a team");
    });

    it("should upgrade team tier on TVL update", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      await referral.connect(agentA).createTeam();

      // Update to Bronze ($50k)
      await referral.updateTeamTVL(1, 50_000_000000n);
      let info = await referral.getTeamInfo(1);
      expect(info.currentTier).to.equal(1); // Bronze
      expect(info.bonusBps).to.equal(20); // +0.20%

      // Update to Silver ($250k)
      await referral.updateTeamTVL(1, 250_000_000000n);
      info = await referral.getTeamInfo(1);
      expect(info.currentTier).to.equal(2); // Silver
      expect(info.bonusBps).to.equal(50); // +0.50%

      // Update to Gold ($1M)
      await referral.updateTeamTVL(1, 1_000_000_000000n);
      info = await referral.getTeamInfo(1);
      expect(info.currentTier).to.equal(3); // Gold
      expect(info.bonusBps).to.equal(100); // +1.00%

      // Update to Diamond ($5M)
      await referral.updateTeamTVL(1, 5_000_000_000000n);
      info = await referral.getTeamInfo(1);
      expect(info.currentTier).to.equal(4); // Diamond
      expect(info.bonusBps).to.equal(200); // +2.00%
    });

    it("should return bonus yield for team member", async function () {
      const { referral, agentA, agentB } = await loadFixture(deployReferralFixture);

      await referral.connect(agentA).createTeam();
      await referral.connect(agentB).joinTeam(1);
      await referral.updateTeamTVL(1, 250_000_000000n); // Silver

      expect(await referral.getTeamBonusYield(agentB.address)).to.equal(50);
    });

    it("should return 0 bonus for agent not in team", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);

      expect(await referral.getTeamBonusYield(agentA.address)).to.equal(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  // YIELD DISCOVERY
  // ═══════════════════════════════════════════════════════

  describe("Yield Discovery", function () {
    it("should submit a yield discovery", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);
      const poolAddress = ethers.Wallet.createRandom().address;

      await expect(referral.connect(agentA).submitYieldDiscovery(poolAddress))
        .to.emit(referral, "YieldDiscoverySubmitted")
        .withArgs(1, agentA.address, poolAddress);

      expect(await referral.totalDiscoveries()).to.equal(1);
    });

    it("should activate a discovery (owner only)", async function () {
      const { referral, owner, agentA } = await loadFixture(deployReferralFixture);
      const poolAddress = ethers.Wallet.createRandom().address;

      await referral.connect(agentA).submitYieldDiscovery(poolAddress);
      await referral.connect(owner).activateDiscovery(1);

      const [active, discoverer, bonusBps] = await referral.getDiscoveryBonus(1);
      expect(active).to.be.true;
      expect(discoverer).to.equal(agentA.address);
      expect(bonusBps).to.equal(500); // 5%
    });

    it("should reject activation by non-owner", async function () {
      const { referral, agentA } = await loadFixture(deployReferralFixture);
      const poolAddress = ethers.Wallet.createRandom().address;

      await referral.connect(agentA).submitYieldDiscovery(poolAddress);

      await expect(
        referral.connect(agentA).activateDiscovery(1)
      ).to.be.reverted;
    });
  });

  // ═══════════════════════════════════════════════════════
  // VIEW FUNCTIONS
  // ═══════════════════════════════════════════════════════

  describe("View Functions", function () {
    it("should return direct referrals list", async function () {
      const { referral, agentA, agentB, agentC } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.registerReferral(agentC.address, agentA.address);

      const directs = await referral.getDirectReferrals(agentA.address);
      expect(directs.length).to.equal(2);
      expect(directs).to.include(agentB.address);
      expect(directs).to.include(agentC.address);
    });

    it("should return tree size (2 levels)", async function () {
      const { referral, agentA, agentB, agentC, agentD } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.registerReferral(agentC.address, agentA.address);
      await referral.registerReferral(agentD.address, agentB.address);

      const size = await referral.getTreeSize(agentA.address);
      expect(size).to.equal(3); // B, C (direct) + D (B's referral)
    });

    it("should return agent score", async function () {
      const { referral, agentA, agentB, feeContract } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(agentB.address, agentA.address);
      await referral.connect(feeContract).distributeReferralYield(agentB.address, 1000_000000n);
      await referral.connect(agentA).createTeam();
      await referral.updateTeamTVL(1, 50_000_000000n);

      const score = await referral.getAgentScore(agentA.address);
      expect(score.directCount).to.equal(1);
      expect(score.totalEarned).to.equal(400_000000n);
      expect(score.teamId).to.equal(1);
      expect(score.teamTier).to.equal(1); // Bronze
    });
  });

  // ═══════════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════════

  describe("Admin", function () {
    it("should set team tier thresholds", async function () {
      const { referral, owner } = await loadFixture(deployReferralFixture);

      await referral.connect(owner).setTeamTierThreshold(0, 100_000_000000n);
      expect(await referral.teamTierThresholds(0)).to.equal(100_000_000000n);
    });

    it("should set team tier bonus", async function () {
      const { referral, owner } = await loadFixture(deployReferralFixture);

      await referral.connect(owner).setTeamTierBonus(0, 30);
      expect(await referral.teamTierBonusBps(0)).to.equal(30);
    });

    it("should reject bonus > 5%", async function () {
      const { referral, owner } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(owner).setTeamTierBonus(0, 501)
      ).to.be.revertedWith("Bonus too high");
    });
  });
});
