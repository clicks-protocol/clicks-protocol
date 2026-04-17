import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ClicksReputationMultiplierV1", function () {
  async function deployFixture() {
    const [owner, agent, stranger, attestor1, attestor2] = await ethers.getSigners();

    const Identity = await ethers.getContractFactory("MockIdentityRegistry");
    const identity = await Identity.deploy();

    const Reputation = await ethers.getContractFactory("MockReputationRegistry");
    const reputation = await Reputation.deploy();

    const Mul = await ethers.getContractFactory("ClicksReputationMultiplierV1");
    const mul = await Mul.deploy(
      await identity.getAddress(),
      await reputation.getAddress()
    );

    const AGENT_ID = 45074n;
    await identity.setOwner(AGENT_ID, agent.address);

    // Seed at least one trusted attestor so tier lookups return something.
    await mul.addAttestor(attestor1.address);

    return { mul, identity, reputation, owner, agent, stranger, attestor1, attestor2, AGENT_ID };
  }

  // Helper: each feedback entry is a rating in [0, 10^decimals].
  // sum = avgRating * count, with avgRating in the same decimal scale.
  function summary(count: bigint, avgRating0to1: number, decimals: number) {
    const scale = 10 ** decimals;
    const perEntry = Math.round(avgRating0to1 * scale);
    const value = BigInt(perEntry) * count;
    return { count, value, decimals };
  }

  describe("constants", function () {
    it("exposes the documented tier constants", async function () {
      const { mul } = await loadFixture(deployFixture);
      expect(await mul.FEE_COLD()).to.equal(300n);
      expect(await mul.FEE_LOW()).to.equal(250n);
      expect(await mul.FEE_MID()).to.equal(200n);
      expect(await mul.FEE_HIGH()).to.equal(150n);
      expect(await mul.FEE_ELITE()).to.equal(100n);
    });
  });

  describe("feeBpsFor — ownership check", function () {
    it("returns FEE_COLD for the zero address", async function () {
      const { mul, AGENT_ID } = await loadFixture(deployFixture);
      expect(await mul.feeBpsFor(ethers.ZeroAddress, AGENT_ID)).to.equal(300n);
    });

    it("returns FEE_COLD when the agentId is not owned by the caller wallet", async function () {
      const { mul, stranger, AGENT_ID } = await loadFixture(deployFixture);
      expect(await mul.feeBpsFor(stranger.address, AGENT_ID)).to.equal(300n);
    });

    it("returns FEE_COLD when the agentId does not exist", async function () {
      const { mul, agent } = await loadFixture(deployFixture);
      expect(await mul.feeBpsFor(agent.address, 99999n)).to.equal(300n);
    });
  });

  describe("tier boundaries", function () {
    it("count == 0 → FEE_COLD", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      await reputation.setSummary(AGENT_ID, 0n, 0n, 2);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(300n);
    });

    it("count < 10 → FEE_LOW regardless of score", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(5n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(250n);
    });

    it("count >= 10 with poor quality (<50%) → FEE_COLD (quality penalty)", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(20n, 0.3, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(300n);
    });

    it("count in [10, 50) with passing quality → FEE_MID", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(25n, 0.6, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(200n);
    });

    it("count >= 50 with avg >= 75% → FEE_HIGH", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(60n, 0.8, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(150n);
    });

    it("count >= 100 with avg >= 90% → FEE_ELITE", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(100n);
    });

    it("elite volume but mid quality falls back to FEE_HIGH", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(150n, 0.8, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(150n);
    });

    it("high volume but barely passing falls back to FEE_MID", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(80n, 0.6, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(200n);
    });
  });

  describe("edge cases on int128 summary", function () {
    it("negative summary treated as failing quality → FEE_COLD", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      await reputation.setSummary(AGENT_ID, 20n, -1000n, 2);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(300n);
    });

    it("registry revert maps to FEE_COLD", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      await reputation.setRevert(AGENT_ID, true);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(300n);
    });

    it("decimals above the cap are clamped and do not overflow", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      await reputation.setSummary(AGENT_ID, 50n, 10n ** 18n * 50n, 250); // absurd decimals
      // Clamped to 18 decimals; ratio becomes 1.0 → avg 10_000 bps
      const tier = await mul.feeBpsFor(agent.address, AGENT_ID);
      expect([100n, 150n, 200n]).to.include(tier);
    });

    it("average ratio above 1 is capped at 10_000 bps", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(deployFixture);
      // value per entry > 1.0 after scaling
      await reputation.setSummary(AGENT_ID, 120n, (10n ** 2n) * 150n, 2);
      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(100n);
    });
  });

  describe("quote view", function () {
    it("returns count, avgBps, and tier together", async function () {
      const { mul, reputation, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(60n, 0.8, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      const [count, avgBps, feeBps] = await mul.quote(AGENT_ID);
      expect(count).to.equal(60n);
      expect(avgBps).to.equal(8000n);
      expect(feeBps).to.equal(150n);
    });
  });

  describe("feeBpsForAgentId", function () {
    it("skips ownership check and reports the raw tier", async function () {
      const { mul, reputation, AGENT_ID } = await loadFixture(deployFixture);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await mul.feeBpsForAgentId(AGENT_ID)).to.equal(100n);
    });
  });

  describe("attestor management", function () {
    it("starts with exactly the fixture's seed attestor", async function () {
      const { mul, attestor1 } = await loadFixture(deployFixture);
      expect(await mul.trustedAttestorCount()).to.equal(1n);
      expect(await mul.isTrustedAttestor(attestor1.address)).to.equal(true);
      expect(await mul.trustedAttestors()).to.deep.equal([attestor1.address]);
    });

    it("only owner can add or remove attestors", async function () {
      const { mul, agent, attestor2 } = await loadFixture(deployFixture);
      await expect(mul.connect(agent).addAttestor(attestor2.address))
        .to.be.revertedWithCustomError(mul, "OwnableUnauthorizedAccount");
      await expect(mul.connect(agent).removeAttestor(attestor2.address))
        .to.be.revertedWithCustomError(mul, "OwnableUnauthorizedAccount");
    });

    it("rejects zero-address attestors and duplicates", async function () {
      const { mul, attestor1 } = await loadFixture(deployFixture);
      await expect(mul.addAttestor(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(mul, "ZeroAddress");
      await expect(mul.addAttestor(attestor1.address))
        .to.be.revertedWithCustomError(mul, "AlreadyTrusted");
    });

    it("remove drops the attestor and shrinks the list", async function () {
      const { mul, attestor1, attestor2 } = await loadFixture(deployFixture);
      await mul.addAttestor(attestor2.address);
      expect(await mul.trustedAttestorCount()).to.equal(2n);

      await mul.removeAttestor(attestor1.address);
      expect(await mul.isTrustedAttestor(attestor1.address)).to.equal(false);
      expect(await mul.trustedAttestorCount()).to.equal(1n);
      expect(await mul.trustedAttestors()).to.deep.equal([attestor2.address]);
    });

    it("removing an unknown attestor reverts", async function () {
      const { mul, attestor2 } = await loadFixture(deployFixture);
      await expect(mul.removeAttestor(attestor2.address))
        .to.be.revertedWithCustomError(mul, "NotTrusted");
    });
  });

  describe("empty attestor set", function () {
    async function noAttestorFixture() {
      const base = await deployFixture();
      await base.mul.removeAttestor(base.attestor1.address);
      return base;
    }

    it("forces FEE_COLD across every lookup when no attestors exist", async function () {
      const { mul, reputation, agent, AGENT_ID } = await loadFixture(noAttestorFixture);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);

      expect(await mul.feeBpsFor(agent.address, AGENT_ID)).to.equal(300n);
      expect(await mul.feeBpsForAgentId(AGENT_ID)).to.equal(300n);

      const [count, avgBps, feeBps] = await mul.quote(AGENT_ID);
      expect(count).to.equal(0n);
      expect(avgBps).to.equal(0n);
      expect(feeBps).to.equal(300n);
    });
  });
});
