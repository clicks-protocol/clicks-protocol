import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ClicksFeeV2 — Referral Integration", function () {
  async function deployFixture() {
    const [owner, agent, operator, referrerL1, referrerL2, referrerL3, treasury] =
      await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USDC", "USDC", 6);

    // Deploy ClicksReferral
    const ClicksReferral = await ethers.getContractFactory("ClicksReferral");
    const referral = await ClicksReferral.deploy();

    // Deploy ClicksFeeV2
    const ClicksFeeV2 = await ethers.getContractFactory("ClicksFeeV2");
    const feeV2 = await ClicksFeeV2.deploy(
      await usdc.getAddress(),
      await referral.getAddress(),
      treasury.address
    );

    // Authorize FeeV2 on Referral contract
    await referral.setAuthorized(await feeV2.getAddress(), true);

    // Set up referral chain: agent → L1 → L2 → L3
    // Authorize owner to register referrals for testing
    await referral.setAuthorized(owner.address, true);
    await referral.registerReferral(referrerL1.address, referrerL2.address);
    await referral.registerReferral(referrerL2.address, referrerL3.address);
    await referral.registerReferral(agent.address, referrerL1.address);

    // Authorize a "splitter" (owner acts as splitter for testing)
    await feeV2.setAuthorized(owner.address, true);

    // Mint USDC to owner (simulates fee transfer from splitter)
    await usdc.mint(owner.address, ethers.parseUnits("10000", 6));

    return { owner, agent, operator, referrerL1, referrerL2, referrerL3, treasury, usdc, referral, feeV2 };
  }

  describe("collectFee with referral distribution", function () {
    it("should distribute fees to L1/L2/L3 referrers", async function () {
      const { owner, agent, referrerL1, referrerL2, referrerL3, usdc, feeV2 } =
        await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6); // 100 USDC fee

      // Transfer USDC to FeeV2 (simulates splitter sending fee)
      await usdc.transfer(await feeV2.getAddress(), fee);

      // Call collectFee
      await feeV2.collectFee(agent.address, fee);

      // Check claimable amounts
      // L1: 40% of 100 = 40 USDC
      expect(await feeV2.claimable(referrerL1.address)).to.equal(
        ethers.parseUnits("40", 6)
      );
      // L2: 20% of 100 = 20 USDC
      expect(await feeV2.claimable(referrerL2.address)).to.equal(
        ethers.parseUnits("20", 6)
      );
      // L3: 10% of 100 = 10 USDC
      expect(await feeV2.claimable(referrerL3.address)).to.equal(
        ethers.parseUnits("10", 6)
      );
    });

    it("should track totalReferralDistributed correctly", async function () {
      const { agent, usdc, feeV2 } = await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(agent.address, fee);

      // Total referral: 40 + 20 + 10 = 70 USDC
      expect(await feeV2.totalReferralDistributed()).to.equal(
        ethers.parseUnits("70", 6)
      );
    });

    it("should work with no referrer (all to treasury)", async function () {
      const { owner, usdc, feeV2, referral } = await loadFixture(deployFixture);

      // Create an agent with NO referrer
      const noRefAgent = ethers.Wallet.createRandom().address;

      const fee = ethers.parseUnits("50", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(noRefAgent, fee);

      // No referral distribution
      expect(await feeV2.totalReferralDistributed()).to.equal(0);
      // All sweepable
      expect(await feeV2.sweepableAmount()).to.equal(fee);
    });

    it("should work with only L1 referrer", async function () {
      const { owner, referrerL1, usdc, feeV2, referral } = await loadFixture(deployFixture);

      // Create agent with only L1
      const soloAgent = ethers.Wallet.createRandom().address;
      await referral.registerReferral(soloAgent, referrerL1.address);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(soloAgent, fee);

      // L1 gets 40%, L2/L3 chain goes to referrerL2/L3 (they ARE in L1's chain)
      expect(await feeV2.claimable(referrerL1.address)).to.equal(
        ethers.parseUnits("40", 6)
      );
    });
  });

  describe("claimReward", function () {
    it("should transfer USDC to referrer on claim", async function () {
      const { agent, referrerL1, usdc, feeV2 } = await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(agent.address, fee);

      const balanceBefore = await usdc.balanceOf(referrerL1.address);
      await feeV2.connect(referrerL1).claimReward();
      const balanceAfter = await usdc.balanceOf(referrerL1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseUnits("40", 6));
      expect(await feeV2.claimable(referrerL1.address)).to.equal(0);
    });

    it("should revert if nothing to claim", async function () {
      const { referrerL1, feeV2 } = await loadFixture(deployFixture);

      await expect(
        feeV2.connect(referrerL1).claimReward()
      ).to.be.revertedWithCustomError(feeV2, "NothingToClaim");
    });

    it("should update totalReferralClaimed after claim", async function () {
      const { agent, referrerL1, usdc, feeV2 } = await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(agent.address, fee);
      await feeV2.connect(referrerL1).claimReward();

      expect(await feeV2.totalReferralClaimed()).to.equal(
        ethers.parseUnits("40", 6)
      );
    });
  });

  describe("sweep", function () {
    it("should only sweep treasury portion (not referral reserves)", async function () {
      const { agent, treasury, usdc, feeV2 } = await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(agent.address, fee);

      // 70 USDC reserved for referrals, 30 USDC sweepable
      const treasuryBefore = await usdc.balanceOf(treasury.address);
      await feeV2.sweep();
      const treasuryAfter = await usdc.balanceOf(treasury.address);

      expect(treasuryAfter - treasuryBefore).to.equal(
        ethers.parseUnits("30", 6)
      );
    });

    it("should revert if nothing to sweep", async function () {
      const { feeV2 } = await loadFixture(deployFixture);

      await expect(feeV2.sweep()).to.be.revertedWithCustomError(
        feeV2,
        "NothingToSweep"
      );
    });

    it("should allow sweep after all referrals claimed", async function () {
      const { agent, referrerL1, referrerL2, referrerL3, treasury, usdc, feeV2 } =
        await loadFixture(deployFixture);

      const fee = ethers.parseUnits("100", 6);
      await usdc.transfer(await feeV2.getAddress(), fee);
      await feeV2.collectFee(agent.address, fee);

      // Claim all referral rewards
      await feeV2.connect(referrerL1).claimReward();
      await feeV2.connect(referrerL2).claimReward();
      await feeV2.connect(referrerL3).claimReward();

      // Now full remaining balance is sweepable
      const treasuryBefore = await usdc.balanceOf(treasury.address);
      await feeV2.sweep();
      const treasuryAfter = await usdc.balanceOf(treasury.address);

      expect(treasuryAfter - treasuryBefore).to.equal(
        ethers.parseUnits("30", 6)
      );
    });
  });

  describe("authorization", function () {
    it("should reject collectFee from unauthorized caller", async function () {
      const { agent, referrerL1, feeV2 } = await loadFixture(deployFixture);

      await expect(
        feeV2.connect(referrerL1).collectFee(agent.address, 100)
      ).to.be.revertedWithCustomError(feeV2, "NotAuthorized");
    });
  });

  describe("end-to-end: fee → referral → claim → sweep", function () {
    it("should handle complete lifecycle correctly", async function () {
      const { agent, referrerL1, referrerL2, referrerL3, treasury, usdc, feeV2 } =
        await loadFixture(deployFixture);

      // Simulate 5 fee collections over time
      for (let i = 0; i < 5; i++) {
        const fee = ethers.parseUnits("10", 6); // 10 USDC each
        await usdc.transfer(await feeV2.getAddress(), fee);
        await feeV2.collectFee(agent.address, fee);
      }

      // Total: 50 USDC in fees
      expect(await feeV2.totalCollected()).to.equal(ethers.parseUnits("50", 6));

      // Referral totals: 5 * (4 + 2 + 1) = 35 USDC
      expect(await feeV2.totalReferralDistributed()).to.equal(
        ethers.parseUnits("35", 6)
      );

      // L1 claims: 5 * 4 = 20 USDC
      const l1Before = await usdc.balanceOf(referrerL1.address);
      await feeV2.connect(referrerL1).claimReward();
      expect((await usdc.balanceOf(referrerL1.address)) - l1Before).to.equal(
        ethers.parseUnits("20", 6)
      );

      // Sweep treasury: 50 - 35 = 15 USDC immediately sweepable
      // Plus L1 already claimed 20, so reserved = 35 - 20 = 15
      // Balance = 50 - 20 (L1 claimed) = 30, reserved = 15
      // Sweepable = 30 - 15 = 15
      const tBefore = await usdc.balanceOf(treasury.address);
      await feeV2.sweep();
      expect((await usdc.balanceOf(treasury.address)) - tBefore).to.equal(
        ethers.parseUnits("15", 6)
      );

      // L2 + L3 claim remaining
      await feeV2.connect(referrerL2).claimReward();
      await feeV2.connect(referrerL3).claimReward();

      // Everything claimed + swept — contract should be empty
      expect(await usdc.balanceOf(await feeV2.getAddress())).to.equal(0);
    });
  });
});
