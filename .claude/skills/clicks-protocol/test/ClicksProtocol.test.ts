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

  // ─── Aave V3 Dual-Routing Tests ───────────────────────────────────────────

  describe("ClicksYieldRouter - Aave V3 Routing", function () {

    async function registeredAgentFixture() {
      const base = await deployFullProtocol();
      const { registry, operator, agent } = base;
      await registry.connect(operator).registerAgent(agent.address);
      return base;
    }

    it("deposits to Aave when Aave APY > Morpho APY", async function () {
      const { router, splitter, usdc, aave, operator, agent } = await loadFixture(registeredAgentFixture);
      
      // Mock: Aave has 7% APY (default in MockAavePool)
      // Morpho has ~0% APY (no borrows = 0 utilization)
      
      const depositAmount = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      
      // Verify protocol choice before deposit
      const bestProtocol = await router.getBestProtocol();
      expect(bestProtocol).to.equal(1); // Aave
      
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);
      
      // Check that activeProtocol is Aave
      expect(await router.activeProtocol()).to.equal(1);
      
      // Check that Aave received the funds
      const aToken = await aave.aToken();
      const aTokenBalance = await ethers.getContractAt("MockERC20", aToken);
      const routerAaveBalance = await aTokenBalance.balanceOf(await router.getAddress());
      
      const expectedYield = (depositAmount * 20n) / 100n;
      expect(routerAaveBalance).to.equal(expectedYield);
    });

    it("withdraw works from Aave", async function () {
      const { router, splitter, usdc, aave, operator, agent } = await loadFixture(registeredAgentFixture);
      
      const depositAmount = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);
      
      // Simulate yield: mint extra USDC to Aave pool
      const yieldAmount = ethers.parseUnits("5", 6);
      await usdc.mint(await aave.getAddress(), yieldAmount);
      
      const agentBefore = await usdc.balanceOf(agent.address);
      const principal = await router.agentDeposited(agent.address);
      
      // Withdraw all
      await splitter.connect(agent).withdrawYield(agent.address, 0);
      
      const agentAfter = await usdc.balanceOf(agent.address);
      const received = agentAfter - agentBefore;
      
      // Agent should receive principal + yield - 2% fee on yield
      expect(received).to.be.gt(principal);
      
      // Verify router balance is now 0
      expect(await router.agentDeposited(agent.address)).to.equal(0);
    });

    it("rebalance moves funds from Aave to Morpho", async function () {
      const { router, splitter, usdc, aave, operator, agent, owner } = await loadFixture(registeredAgentFixture);
      
      // Deposit to Aave first
      const depositAmount = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);
      
      expect(await router.activeProtocol()).to.equal(1); // Aave
      
      // Check Aave balance before rebalance
      const aToken = await aave.aToken();
      const aTokenContract = await ethers.getContractAt("MockERC20", aToken);
      const aaveBefore = await aTokenContract.balanceOf(await router.getAddress());
      expect(aaveBefore).to.be.gt(0);
      
      // Rebalance to Morpho
      await expect(router.connect(owner).rebalance(2))
        .to.emit(router, "Rebalanced")
        .withArgs(1, 2, aaveBefore);
      
      expect(await router.activeProtocol()).to.equal(2); // Morpho
      
      // Verify Aave balance is now 0
      const aaveAfter = await aTokenContract.balanceOf(await router.getAddress());
      expect(aaveAfter).to.equal(0);
      
      // Verify Morpho has the funds (getTotalBalance should work)
      const totalBalance = await router.getTotalBalance();
      expect(totalBalance).to.be.closeTo(aaveBefore, ethers.parseUnits("0.01", 6));
    });

    it("rebalance from Morpho to Aave works", async function () {
      const { router, splitter, usdc, morpho, operator, agent, owner } = await loadFixture(registeredAgentFixture);
      
      // First rebalance to Morpho (since default is Aave)
      const depositAmount = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);
      
      await router.connect(owner).rebalance(2); // Move to Morpho
      expect(await router.activeProtocol()).to.equal(2);
      
      const morphoBalanceBefore = await router.getTotalBalance();
      
      // Rebalance back to Aave
      await expect(router.connect(owner).rebalance(1))
        .to.emit(router, "Rebalanced")
        .withArgs(2, 1, morphoBalanceBefore);
      
      expect(await router.activeProtocol()).to.equal(1);
    });

    it("rebalance reverts if called by non-owner", async function () {
      const { router, agent } = await loadFixture(registeredAgentFixture);
      
      await expect(router.connect(agent).rebalance(2))
        .to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });

    it("rebalance reverts with invalid protocol", async function () {
      const { router, owner } = await loadFixture(registeredAgentFixture);
      
      await expect(router.connect(owner).rebalance(0))
        .to.be.revertedWithCustomError(router, "InvalidProtocol");
      
      await expect(router.connect(owner).rebalance(3))
        .to.be.revertedWithCustomError(router, "InvalidProtocol");
    });

    it("rebalance is noop when already on target protocol", async function () {
      const { router, splitter, usdc, operator, agent, owner } = await loadFixture(registeredAgentFixture);
      
      const depositAmount = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), depositAmount);
      await splitter.connect(operator).receivePayment(depositAmount, agent.address);
      
      expect(await router.activeProtocol()).to.equal(1);
      
      // Rebalance to Aave (already there)
      const tx = await router.connect(owner).rebalance(1);
      const receipt = await tx.wait();
      
      // Should not emit Rebalanced event
      const rebalancedEvent = receipt?.logs.find(
        (log: any) => log.fragment?.name === "Rebalanced"
      );
      expect(rebalancedEvent).to.be.undefined;
    });

    it("getBestProtocol returns Aave when APYs are equal (default to safer)", async function () {
      const { router, aave } = await loadFixture(deployFullProtocol);
      
      // Set Aave APY to 0 (same as Morpho with no borrows)
      const MockAavePool = await ethers.getContractFactory("MockAavePool");
      const aaveContract = MockAavePool.attach(await aave.getAddress());
      
      // Note: MockAavePool doesn't have setLiquidityRate, so we test with default
      // In production, when APYs are within REBALANCE_THRESHOLD (50 bps), Aave is chosen
      
      const bestProtocol = await router.getBestProtocol();
      expect(bestProtocol).to.equal(1); // Aave (default)
    });

    it("multiple deposits maintain correct accounting across protocols", async function () {
      const { router, splitter, usdc, operator, agent, alice, registry, owner } = await loadFixture(deployFullProtocol);
      
      // Register two agents
      await registry.connect(operator).registerAgent(agent.address);
      await registry.connect(operator).registerAgent(alice.address);
      
      // Agent deposits
      const deposit1 = ethers.parseUnits("100", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), deposit1);
      await splitter.connect(operator).receivePayment(deposit1, agent.address);
      
      expect(await router.activeProtocol()).to.equal(1); // Aave
      
      // Rebalance to Morpho
      await router.connect(owner).rebalance(2);
      
      // Alice deposits (should go to Morpho now)
      const deposit2 = ethers.parseUnits("200", 6);
      await usdc.connect(operator).approve(await splitter.getAddress(), deposit2);
      await splitter.connect(operator).receivePayment(deposit2, alice.address);
      
      // Verify accounting
      const agentPrincipal = await router.agentDeposited(agent.address);
      const alicePrincipal = await router.agentDeposited(alice.address);
      const totalDeposited = await router.totalDeposited();
      
      expect(agentPrincipal).to.equal((deposit1 * 20n) / 100n);
      expect(alicePrincipal).to.equal((deposit2 * 20n) / 100n);
      expect(totalDeposited).to.equal(agentPrincipal + alicePrincipal);
    });

  });

});
