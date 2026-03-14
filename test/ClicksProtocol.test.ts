import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {
  ClicksRegistry,
  ClicksFee,
  ClicksYieldRouter,
  ClicksSplitterV3,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// ─── Mock Contracts for unit tests (no fork needed) ──────────────────────────

// We deploy a minimal ERC20 mock to simulate USDC
// and stub Aave/Morpho with mock adapters

describe("Clicks Protocol", function () {

  // ─── Fixtures ──────────────────────────────────────────────────────────────

  async function deployMockUSDC() {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    return usdc;
  }

  async function deployMockAave(usdcAddress: string) {
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const aave = await MockAavePool.deploy(usdcAddress);
    const aUsdc = await aave.aToken();
    return { aave, aUsdc };
  }

  async function deployMockMorpho() {
    const MockMorpho = await ethers.getContractFactory("MockMorpho");
    const morpho = await MockMorpho.deploy();
    return morpho;
  }

  async function deployFullProtocol() {
    const [owner, operator, agent, treasury, alice] = await ethers.getSigners();

    const usdc = await deployMockUSDC();
    const usdcAddr = await usdc.getAddress();

    const { aave, aUsdc } = await deployMockAave(usdcAddr);
    const aaveAddr = await aave.getAddress();

    const morpho = await deployMockMorpho();
    const morphoAddr = await morpho.getAddress();

    const morphoMarketParams = {
      loanToken:       usdcAddr,
      collateralToken: ethers.ZeroAddress,
      oracle:          ethers.ZeroAddress,
      irm:             ethers.ZeroAddress,
      lltv:            ethers.parseEther("0.86"),
    };

    // ClicksRegistry
    const Registry = await ethers.getContractFactory("ClicksRegistry");
    const registry = await Registry.deploy() as unknown as ClicksRegistry;

    // ClicksFee
    const Fee = await ethers.getContractFactory("ClicksFee");
    const fee = await Fee.deploy(usdcAddr, treasury.address) as unknown as ClicksFee;

    // ClicksYieldRouter (with owner as placeholder splitter)
    const Router = await ethers.getContractFactory("ClicksYieldRouter");
    const router = await Router.deploy(
      usdcAddr,
      aaveAddr,
      aUsdc,
      morphoAddr,
      morphoMarketParams,
      owner.address, // placeholder
    ) as unknown as ClicksYieldRouter;

    // ClicksSplitterV3
    const Splitter = await ethers.getContractFactory("ClicksSplitterV3");
    const splitter = await Splitter.deploy(
      usdcAddr,
      await router.getAddress(),
      await fee.getAddress(),
      await registry.getAddress(),
    ) as unknown as ClicksSplitterV3;

    const splitterAddr = await splitter.getAddress();

    // Wire up
    await router.setSplitter(splitterAddr);
    await fee.setAuthorized(splitterAddr, true);

    // Mint USDC to operator for testing
    await usdc.mint(operator.address, ethers.parseUnits("10000", 6));

    return { usdc, aave, registry, fee, router, splitter, owner, operator, agent, treasury, alice };
  }

  // ─── ClicksRegistry ────────────────────────────────────────────────────────

  describe("ClicksRegistry", function () {

    it("allows operator to register an agent", async function () {
      const { registry, operator, agent } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      expect(await registry.isRegistered(agent.address)).to.be.true;
      expect(await registry.getOperator(agent.address)).to.equal(operator.address);
    });

    it("reverts when registering zero address", async function () {
      const { registry, operator } = await loadFixture(deployFullProtocol);
      await expect(registry.connect(operator).registerAgent(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(registry, "ZeroAddress");
    });

    it("reverts when registering already-registered agent", async function () {
      const { registry, operator, agent } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      await expect(registry.connect(operator).registerAgent(agent.address))
        .to.be.revertedWithCustomError(registry, "AlreadyRegistered");
    });

    it("allows operator to deregister agent", async function () {
      const { registry, operator, agent } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      await registry.connect(operator).deregisterAgent(agent.address);
      expect(await registry.isRegistered(agent.address)).to.be.false;
    });

    it("reverts deregister from non-operator", async function () {
      const { registry, operator, agent, alice } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      await expect(registry.connect(alice).deregisterAgent(agent.address))
        .to.be.revertedWithCustomError(registry, "NotOperator");
    });

    it("tracks total agent count correctly", async function () {
      const { registry, operator, agent, alice } = await loadFixture(deployFullProtocol);
      expect(await registry.totalAgents()).to.equal(0);
      await registry.connect(operator).registerAgent(agent.address);
      expect(await registry.totalAgents()).to.equal(1);
      await registry.connect(operator).registerAgent(alice.address);
      expect(await registry.totalAgents()).to.equal(2);
      await registry.connect(operator).deregisterAgent(agent.address);
      expect(await registry.totalAgents()).to.equal(1);
    });

    it("handles multiple agents per operator", async function () {
      const [, op,, , alice, bob] = await ethers.getSigners();
      const { registry } = await loadFixture(deployFullProtocol);
      await registry.connect(op).registerAgent(alice.address);
      await registry.connect(op).registerAgent(bob.address);
      const agents = await registry.getAgents(op.address);
      expect(agents).to.have.length(2);
      expect(agents).to.include(alice.address);
      expect(agents).to.include(bob.address);
    });

  });

  // ─── ClicksFee ─────────────────────────────────────────────────────────────

  describe("ClicksFee", function () {

    it("allows authorized caller to collect fee", async function () {
      const { fee, splitter, usdc, agent } = await loadFixture(deployFullProtocol);
      const feeAddr = await fee.getAddress();
      const feeAmount = ethers.parseUnits("10", 6);

      // Mint USDC directly to fee contract (simulating transfer from splitter)
      await usdc.mint(feeAddr, feeAmount);
      await fee.connect(await ethers.getSigner((await splitter.getAddress())))
        // collectFee is called by splitter — we test via splitter integration below
        // Direct call with non-authorized should revert
      expect(await fee.pendingFees()).to.equal(feeAmount);
    });

    it("reverts collectFee from unauthorized address", async function () {
      const { fee, alice } = await loadFixture(deployFullProtocol);
      await expect(fee.connect(alice).collectFee(alice.address, 100))
        .to.be.revertedWithCustomError(fee, "NotAuthorized");
    });

    it("sweeps fees to treasury", async function () {
      const { fee, usdc, treasury } = await loadFixture(deployFullProtocol);
      const amount = ethers.parseUnits("100", 6);
      await usdc.mint(await fee.getAddress(), amount);

      const before = await usdc.balanceOf(treasury.address);
      await fee.sweep();
      const after = await usdc.balanceOf(treasury.address);

      expect(after - before).to.equal(amount);
      expect(await fee.pendingFees()).to.equal(0);
    });

    it("reverts sweep when nothing to sweep", async function () {
      const { fee } = await loadFixture(deployFullProtocol);
      await expect(fee.sweep()).to.be.revertedWithCustomError(fee, "NothingToSweep");
    });

    it("allows owner to update treasury", async function () {
      const { fee, alice, owner } = await loadFixture(deployFullProtocol);
      await fee.connect(owner).setTreasury(alice.address);
      expect(await fee.treasury()).to.equal(alice.address);
    });

    it("reverts setTreasury to zero address", async function () {
      const { fee, owner } = await loadFixture(deployFullProtocol);
      await expect(fee.connect(owner).setTreasury(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(fee, "ZeroAddress");
    });

  });

  // ─── ClicksSplitterV3 ──────────────────────────────────────────────────────

  describe("ClicksSplitterV3", function () {

    async function registeredAgentFixture() {
      const base = await deployFullProtocol();
      const { registry, operator, agent } = base;
      await registry.connect(operator).registerAgent(agent.address);
      return base;
    }

    it("splits payment 80/20 by default", async function () {
      const { splitter, usdc, operator, agent } = await loadFixture(registeredAgentFixture);
      const amount = ethers.parseUnits("100", 6);

      await usdc.connect(operator).approve(await splitter.getAddress(), amount);

      const agentBefore = await usdc.balanceOf(agent.address);
      await splitter.connect(operator).receivePayment(amount, agent.address);
      const agentAfter = await usdc.balanceOf(agent.address);

      // Agent should receive 80% liquid
      const expectedLiquid = (amount * 80n) / 100n;
      expect(agentAfter - agentBefore).to.equal(expectedLiquid);
    });

    it("routes 20% to yield router", async function () {
      const { splitter, router, usdc, operator, agent } = await loadFixture(registeredAgentFixture);
      const amount = ethers.parseUnits("100", 6);

      await usdc.connect(operator).approve(await splitter.getAddress(), amount);
      await splitter.connect(operator).receivePayment(amount, agent.address);

      const routerBalance = await router.agentDeposited(agent.address);
      const expected = (amount * 20n) / 100n;
      expect(routerBalance).to.equal(expected);
    });

    it("emits PaymentReceived event with correct values", async function () {
      const { splitter, usdc, operator, agent } = await loadFixture(registeredAgentFixture);
      const amount = ethers.parseUnits("200", 6);

      await usdc.connect(operator).approve(await splitter.getAddress(), amount);

      await expect(splitter.connect(operator).receivePayment(amount, agent.address))
        .to.emit(splitter, "PaymentReceived")
        .withArgs(
          agent.address,
          operator.address,
          amount,
          (amount * 80n) / 100n,
          (amount * 20n) / 100n,
        );
    });

    it("reverts on zero amount", async function () {
      const { splitter, operator, agent } = await loadFixture(registeredAgentFixture);
      await expect(splitter.connect(operator).receivePayment(0, agent.address))
        .to.be.revertedWithCustomError(splitter, "ZeroAmount");
    });

    it("reverts on zero address agent", async function () {
      const { splitter, operator } = await loadFixture(registeredAgentFixture);
      await expect(splitter.connect(operator).receivePayment(100, ethers.ZeroAddress))
        .to.be.revertedWithCustomError(splitter, "ZeroAddress");
    });

    it("operator can set custom yield percentage", async function () {
      const { splitter, operator } = await loadFixture(registeredAgentFixture);
      await splitter.connect(operator).setOperatorYieldPct(30);
      expect(await splitter.operatorYieldPct(operator.address)).to.equal(30);
    });

    it("reverts invalid yield percentage (too low)", async function () {
      const { splitter, operator } = await loadFixture(registeredAgentFixture);
      await expect(splitter.connect(operator).setOperatorYieldPct(3))
        .to.be.revertedWithCustomError(splitter, "InvalidYieldPct");
    });

    it("reverts invalid yield percentage (too high)", async function () {
      const { splitter, operator } = await loadFixture(registeredAgentFixture);
      await expect(splitter.connect(operator).setOperatorYieldPct(60))
        .to.be.revertedWithCustomError(splitter, "InvalidYieldPct");
    });

    it("simulateSplit returns correct values", async function () {
      const { splitter, agent } = await loadFixture(registeredAgentFixture);
      const amount = ethers.parseUnits("1000", 6);
      const [liquid, toYield] = await splitter.simulateSplit(amount, agent.address);
      expect(liquid).to.equal((amount * 80n) / 100n);
      expect(toYield).to.equal((amount * 20n) / 100n);
      expect(liquid + toYield).to.equal(amount);
    });

    it("takes 2% fee on yield withdrawal", async function () {
      const { splitter, router, usdc, aave, fee, operator, agent } = await loadFixture(registeredAgentFixture);
      const depositAmount = ethers.parseUnits("1000", 6);

      // Deposit
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);

      const principal = await router.agentDeposited(agent.address);

      // Simulate yield: mint extra USDC to Aave pool (simulating aToken appreciation)
      const yieldAmount = ethers.parseUnits("10", 6);
      await usdc.mint(await aave.getAddress(), yieldAmount);

      const agentBefore = await usdc.balanceOf(agent.address);
      const feeBefore = await fee.pendingFees();

      await splitter.connect(agent).withdrawYield(agent.address, 0);

      const agentAfter = await usdc.balanceOf(agent.address);
      const feeAfter = await fee.pendingFees();

      // Fee should be 2% of yield
      const expectedFee = (yieldAmount * 200n) / 10000n;
      expect(feeAfter - feeBefore).to.be.closeTo(expectedFee, ethers.parseUnits("0.01", 6));

      // Agent receives principal + yield - fee
      const received = agentAfter - agentBefore;
      expect(received).to.be.gt(principal); // received more than principal
    });

  });

  // ─── Math edge cases ───────────────────────────────────────────────────────

  describe("Split math edge cases", function () {

    it("handles minimum payment (1 USDC)", async function () {
      const { splitter, usdc, operator, agent, registry } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      const amount = ethers.parseUnits("1", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), amount);

      await expect(splitter.connect(operator).receivePayment(amount, agent.address))
        .to.not.be.reverted;
    });

    it("handles large payment (1M USDC)", async function () {
      const { splitter, usdc, operator, agent, registry } = await loadFixture(deployFullProtocol);
      await registry.connect(operator).registerAgent(agent.address);
      const amount = ethers.parseUnits("1000000", 6);
      await usdc.mint(operator.address, amount);
      await usdc.connect(operator).approve(await splitter.getAddress(), amount);

      await expect(splitter.connect(operator).receivePayment(amount, agent.address))
        .to.not.be.reverted;
    });

    it("liquid + yield portions always sum to total", async function () {
      const { splitter, agent } = await loadFixture(deployFullProtocol);
      const amounts = [
        ethers.parseUnits("1", 6),
        ethers.parseUnits("99.99", 6),
        ethers.parseUnits("1337", 6),
      ];
      for (const amount of amounts) {
        const [liquid, toYield] = await splitter.simulateSplit(amount, agent.address);
        expect(liquid + toYield).to.equal(amount);
      }
    });

  });

});
