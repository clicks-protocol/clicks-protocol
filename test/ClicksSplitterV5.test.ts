import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ClicksSplitterV5 — reputation-tier fees", function () {
  const AGENT_ID = 45074n;
  const OTHER_AGENT_ID = 99n;

  async function deployFixture() {
    const [owner, agent, operator, attestor, treasury, stranger] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USDC", "USDC", 6);

    const MockYieldRouter = await ethers.getContractFactory("MockYieldRouter");
    const yieldRouter = await MockYieldRouter.deploy(await usdc.getAddress());

    const ClicksReferral = await ethers.getContractFactory("ClicksReferral");
    const referral = await ClicksReferral.deploy();

    const ClicksFeeV2 = await ethers.getContractFactory("ClicksFeeV2");
    const feeV2 = await ClicksFeeV2.deploy(
      await usdc.getAddress(),
      await referral.getAddress(),
      treasury.address
    );
    await referral.setAuthorized(await feeV2.getAddress(), true);

    const ClicksRegistry = await ethers.getContractFactory("ClicksRegistry");
    const registry = await ClicksRegistry.deploy();

    // Register agent under operator
    await registry.connect(operator).registerAgent(agent.address);

    const MockIdentity = await ethers.getContractFactory("MockIdentityRegistry");
    const identity = await MockIdentity.deploy();

    const MockReputation = await ethers.getContractFactory("MockReputationRegistry");
    const reputation = await MockReputation.deploy();

    const Mul = await ethers.getContractFactory("ClicksReputationMultiplierV1");
    const multiplier = await Mul.deploy(
      await identity.getAddress(),
      await reputation.getAddress()
    );
    await multiplier.addAttestor(attestor.address);

    const V5 = await ethers.getContractFactory("ClicksSplitterV5");
    const splitter = await V5.deploy(
      await usdc.getAddress(),
      await yieldRouter.getAddress(),
      await feeV2.getAddress(),
      await registry.getAddress(),
      await multiplier.getAddress(),
      await identity.getAddress()
    );

    // Authorize SplitterV5 on ClicksFeeV2 so collectFee works
    await feeV2.setAuthorized(await splitter.getAddress(), true);

    // Agent owns the Identity NFT for AGENT_ID
    await identity.setOwner(AGENT_ID, agent.address);
    await identity.setOwner(OTHER_AGENT_ID, stranger.address);

    return {
      owner, agent, operator, attestor, treasury, stranger,
      usdc, yieldRouter, referral, feeV2, registry,
      identity, reputation, multiplier, splitter,
    };
  }

  function summary(count: bigint, avg0to1: number, decimals: number) {
    const scale = 10 ** decimals;
    const perEntry = Math.round(avg0to1 * scale);
    return { count, value: BigInt(perEntry) * count, decimals };
  }

  describe("agent identity registration", function () {
    it("binds agentId to caller when caller owns the Identity NFT", async function () {
      const { splitter, agent } = await loadFixture(deployFixture);
      await expect(splitter.connect(agent).registerAgentId(AGENT_ID))
        .to.emit(splitter, "AgentIdRegistered")
        .withArgs(agent.address, AGENT_ID);
      expect(await splitter.agentToId(agent.address)).to.equal(AGENT_ID);
    });

    it("rejects registration when caller does not own the NFT", async function () {
      const { splitter, stranger } = await loadFixture(deployFixture);
      await expect(splitter.connect(stranger).registerAgentId(AGENT_ID))
        .to.be.revertedWithCustomError(splitter, "NotAgentIdOwner");
    });

    it("rejects double registration", async function () {
      const { splitter, agent } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);
      await expect(splitter.connect(agent).registerAgentId(AGENT_ID))
        .to.be.revertedWithCustomError(splitter, "AgentIdAlreadySet");
    });

    it("unregister clears mapping and only the agent or NFT owner can call", async function () {
      const { splitter, agent, stranger } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);

      await expect(splitter.connect(stranger).unregisterAgentId(agent.address))
        .to.be.revertedWithCustomError(splitter, "NotAuthorized");

      await expect(splitter.connect(agent).unregisterAgentId(agent.address))
        .to.emit(splitter, "AgentIdUnregistered")
        .withArgs(agent.address, AGENT_ID);

      expect(await splitter.agentToId(agent.address)).to.equal(0n);
    });

    it("refreshAgentId repoints mapping when caller owns the new NFT", async function () {
      const { splitter, agent, identity } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);

      const NEW_ID = 777n;
      await identity.setOwner(NEW_ID, agent.address);

      await expect(splitter.connect(agent).refreshAgentId(NEW_ID))
        .to.emit(splitter, "AgentIdUnregistered").withArgs(agent.address, AGENT_ID)
        .and.to.emit(splitter, "AgentIdRegistered").withArgs(agent.address, NEW_ID);

      expect(await splitter.agentToId(agent.address)).to.equal(NEW_ID);
    });
  });

  describe("feeBpsFor view", function () {
    it("returns cold (3%) for unregistered agents", async function () {
      const { splitter, agent } = await loadFixture(deployFixture);
      expect(await splitter.feeBpsFor(agent.address)).to.equal(300n);
    });

    it("returns cold (3%) for registered agent with no reputation", async function () {
      const { splitter, agent } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);
      expect(await splitter.feeBpsFor(agent.address)).to.equal(300n);
    });

    it("returns mid (2%) after 25 pieces of feedback with passing quality", async function () {
      const { splitter, agent, reputation } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);
      const s = summary(25n, 0.6, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await splitter.feeBpsFor(agent.address)).to.equal(200n);
    });

    it("returns elite (1%) with 120 feedback entries at 95% avg", async function () {
      const { splitter, agent, reputation } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);
      expect(await splitter.feeBpsFor(agent.address)).to.equal(100n);
    });
  });

  describe("previewFee", function () {
    it("projects fee onto a yield amount at the current tier", async function () {
      const { splitter, agent, reputation } = await loadFixture(deployFixture);
      await splitter.connect(agent).registerAgentId(AGENT_ID);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);

      const yieldAmount = ethers.parseUnits("1000", 6); // 1000 USDC of yield
      const [feeBps, fee] = await splitter.previewFee(agent.address, yieldAmount);
      expect(feeBps).to.equal(100n); // elite
      expect(fee).to.equal(ethers.parseUnits("10", 6)); // 1% of 1000
    });
  });

  describe("withdrawYield fee split", function () {
    it("applies cold-tier fee (3%) for unregistered agent", async function () {
      const { splitter, agent, yieldRouter, usdc, feeV2 } = await loadFixture(deployFixture);

      // Agent has 1000 USDC principal in router; withdraw returns 1100 (100 yield)
      await yieldRouter.deposit(ethers.parseUnits("1000", 6), agent.address);
      await usdc.mint(await yieldRouter.getAddress(), ethers.parseUnits("1100", 6));
      await yieldRouter.setNextWithdrawReturn(agent.address, ethers.parseUnits("1100", 6));

      const agentBefore = await usdc.balanceOf(agent.address);
      const feeV2Before = await usdc.balanceOf(await feeV2.getAddress());

      await splitter.connect(agent).withdrawYield(agent.address, 0);

      // Fee = 3% of 100 USDC yield = 3 USDC
      expect(await usdc.balanceOf(await feeV2.getAddress()) - feeV2Before)
        .to.equal(ethers.parseUnits("3", 6));
      // Agent receives 1100 - 3 = 1097 USDC
      expect(await usdc.balanceOf(agent.address) - agentBefore)
        .to.equal(ethers.parseUnits("1097", 6));
    });

    it("applies elite-tier fee (1%) for top-reputation agent", async function () {
      const { splitter, agent, yieldRouter, usdc, feeV2, reputation } =
        await loadFixture(deployFixture);

      await splitter.connect(agent).registerAgentId(AGENT_ID);
      const s = summary(120n, 0.95, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);

      await yieldRouter.deposit(ethers.parseUnits("1000", 6), agent.address);
      await usdc.mint(await yieldRouter.getAddress(), ethers.parseUnits("1100", 6));
      await yieldRouter.setNextWithdrawReturn(agent.address, ethers.parseUnits("1100", 6));

      const feeV2Before = await usdc.balanceOf(await feeV2.getAddress());
      await splitter.connect(agent).withdrawYield(agent.address, 0);

      // Fee = 1% of 100 USDC yield = 1 USDC
      expect(await usdc.balanceOf(await feeV2.getAddress()) - feeV2Before)
        .to.equal(ethers.parseUnits("1", 6));
    });

    it("zero yield means zero fee regardless of tier", async function () {
      const { splitter, agent, yieldRouter, usdc, feeV2 } = await loadFixture(deployFixture);

      await yieldRouter.deposit(ethers.parseUnits("1000", 6), agent.address);
      await usdc.mint(await yieldRouter.getAddress(), ethers.parseUnits("1000", 6));
      await yieldRouter.setNextWithdrawReturn(agent.address, ethers.parseUnits("1000", 6));

      const feeV2Before = await usdc.balanceOf(await feeV2.getAddress());
      await splitter.connect(agent).withdrawYield(agent.address, 0);

      expect(await usdc.balanceOf(await feeV2.getAddress()) - feeV2Before).to.equal(0n);
    });

    it("emits YieldWithdrawn with the applied feeBps", async function () {
      const { splitter, agent, yieldRouter, usdc, reputation } = await loadFixture(deployFixture);

      await splitter.connect(agent).registerAgentId(AGENT_ID);
      const s = summary(60n, 0.8, 2);
      await reputation.setSummary(AGENT_ID, s.count, s.value, s.decimals);

      await yieldRouter.deposit(ethers.parseUnits("500", 6), agent.address);
      await usdc.mint(await yieldRouter.getAddress(), ethers.parseUnits("550", 6));
      await yieldRouter.setNextWithdrawReturn(agent.address, ethers.parseUnits("550", 6));

      await expect(splitter.connect(agent).withdrawYield(agent.address, 0))
        .to.emit(splitter, "YieldWithdrawn")
        .withArgs(
          agent.address,
          ethers.parseUnits("500", 6),    // principal
          ethers.parseUnits("50", 6),     // yield
          ethers.parseUnits("0.75", 6),   // fee (1.5% of 50)
          150n                            // high tier
        );
    });
  });
});
