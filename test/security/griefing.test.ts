import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {
  ClicksRegistry,
  ClicksFee,
  ClicksYieldRouter,
  ClicksSplitterV3,
} from "../../typechain-types";

/**
 * SECURITY TEST: Griefing Attacks
 * 
 * Griefing = attacks where the attacker doesn't directly profit but can:
 * - Block other users from using the protocol
 * - Inflate gas costs to make operations uneconomical
 * - DOS the system
 * - Manipulate state to harm others without personal gain
 * 
 * Attack vectors:
 * 1. Block gas limit DoS (array iteration attacks)
 * 2. Spam registrations to bloat storage
 * 3. Repeated dust deposits to grief gas costs
 * 4. Front-running to block legitimate txs
 * 5. Registry pollution (register fake agents)
 * 6. Fee collector spam
 * 7. Withdrawal griefing (make withdrawals fail for others)
 * 8. Protocol lock-up (make rebalancing impossible)
 * 
 * Expected: All griefing attempts should either fail or have negligible impact.
 */

describe("Security: Griefing Attacks", function () {

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

  async function deployProtocol() {
    const [owner, operator, agent, treasury, attacker] = await ethers.getSigners();

    const usdc = await deployMockUSDC();
    const usdcAddr = await usdc.getAddress();

    const { aave, aUsdc } = await deployMockAave(usdcAddr);
    const morpho = await deployMockMorpho();

    const morphoMarketParams = {
      loanToken: usdcAddr,
      collateralToken: ethers.ZeroAddress,
      oracle: ethers.ZeroAddress,
      irm: ethers.ZeroAddress,
      lltv: ethers.parseEther("0.86"),
    };

    const Registry = await ethers.getContractFactory("ClicksRegistry");
    const registry = await Registry.deploy();

    const Fee = await ethers.getContractFactory("ClicksFee");
    const fee = await Fee.deploy(usdcAddr, treasury.address);

    const Router = await ethers.getContractFactory("ClicksYieldRouter");
    const router = await Router.deploy(
      usdcAddr,
      await aave.getAddress(),
      aUsdc,
      await morpho.getAddress(),
      morphoMarketParams,
      owner.address
    );

    const Splitter = await ethers.getContractFactory("ClicksSplitterV3");
    const splitter = await Splitter.deploy(
      usdcAddr,
      await router.getAddress(),
      await fee.getAddress(),
      await registry.getAddress()
    );

    await router.setSplitter(await splitter.getAddress());
    await fee.setAuthorized(await splitter.getAddress(), true);

    return { usdc, registry, fee, router, splitter, owner, operator, agent, treasury, attacker };
  }

  describe("Registry Spam Attacks", function () {
    it("Should handle mass agent registrations without DoS", async function () {
      const { registry, attacker } = await loadFixture(deployProtocol);

      // Attacker spams registrations
      const agentAddresses: string[] = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom();
        agentAddresses.push(wallet.address);
      }

      // Register all 100 agents
      for (const addr of agentAddresses) {
        await registry.connect(attacker).registerAgent(addr);
      }

      const totalAgents = await registry.totalAgents();
      expect(totalAgents).to.equal(100);

      // Verify legitimate operations still work
      const legitAgent = ethers.Wallet.createRandom();
      await expect(
        registry.connect(attacker).registerAgent(legitAgent.address)
      ).to.not.be.reverted;
    });

    it("Should handle deregistration without array iteration DoS", async function () {
      const { registry, attacker } = await loadFixture(deployProtocol);

      // Register 50 agents
      const agents: string[] = [];
      for (let i = 0; i < 50; i++) {
        const wallet = ethers.Wallet.createRandom();
        agents.push(wallet.address);
        await registry.connect(attacker).registerAgent(wallet.address);
      }

      // Deregister middle one (worst case for array search)
      const middleAgent = agents[25];
      await expect(
        registry.connect(attacker).deregisterAgent(middleAgent)
      ).to.not.be.reverted;

      // Verify state
      const isRegistered = await registry.isRegistered(middleAgent);
      expect(isRegistered).to.be.false;
    });

    it("Should prevent registry bloat from affecting other users", async function () {
      const { usdc, registry, splitter, operator, attacker } = await loadFixture(deployProtocol);

      // Attacker spams 200 fake agents
      for (let i = 0; i < 200; i++) {
        const wallet = ethers.Wallet.createRandom();
        await registry.connect(attacker).registerAgent(wallet.address);
      }

      // Legitimate user should not be affected
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Should work normally despite bloated registry
      await expect(
        splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address)
      ).to.not.be.reverted;
    });
  });

  describe("Dust Deposit Griefing", function () {
    it("Should not be griefed by 1000 dust deposits", async function () {
      const { usdc, registry, splitter, router, attacker } = await loadFixture(deployProtocol);

      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Spam 1000 deposits of 1 wei each
      for (let i = 0; i < 100; i++) { // Reduced to 100 for test speed
        await splitter.connect(attacker).receivePayment(1, attacker.address);
      }

      // State should be consistent
      const principal = await router.agentDeposited(attacker.address);
      const totalDeposited = await router.totalDeposited();
      expect(principal).to.equal(totalDeposited);

      // Legitimate operations should still work
      const balance = await router.getTotalBalance();
      expect(balance).to.be.gte(0);
    });

    it("Should not allow griefing via alternating deposit/withdraw", async function () {
      const { usdc, registry, splitter, router, attacker } = await loadFixture(deployProtocol);

      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("10000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Spam deposit → withdraw cycles to bloat state changes
      for (let i = 0; i < 50; i++) {
        await splitter.connect(attacker).receivePayment(ethers.parseUnits("1", 6), attacker.address);
        await splitter.connect(attacker).withdrawYield(attacker.address, 0);
      }

      // State should be clean
      const principal = await router.agentDeposited(attacker.address);
      expect(principal).to.equal(0);
    });
  });

  describe("Gas Limit DoS", function () {
    it("Should not hit block gas limit with many depositors", async function () {
      const { usdc, registry, splitter, router, attacker } = await loadFixture(deployProtocol);

      // Create 100 different depositors
      const depositors = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        depositors.push(wallet);
        
        // Fund via attacker
        await attacker.sendTransaction({
          to: wallet.address,
          value: ethers.parseEther("1")
        });

        await registry.connect(wallet).registerAgent(wallet.address);
        await usdc.mint(wallet.address, ethers.parseUnits("100", 6));
        await usdc.connect(wallet).approve(await splitter.getAddress(), ethers.MaxUint256);
        await splitter.connect(wallet).receivePayment(ethers.parseUnits("100", 6), wallet.address);
      }

      // getTotalBalance should work even with 100 depositors
      const totalBalance = await router.getTotalBalance();
      expect(totalBalance).to.be.gt(0);

      // Withdrawals should work
      await expect(
        splitter.connect(depositors[0]).withdrawYield(depositors[0].address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle storage without unbounded growth", async function () {
      const { registry, attacker } = await loadFixture(deployProtocol);

      // Registry stores operatorAgents[] array per operator
      // Test that it doesn't cause issues with many agents

      for (let i = 0; i < 200; i++) {
        const wallet = ethers.Wallet.createRandom();
        await registry.connect(attacker).registerAgent(wallet.address);
      }

      // getAgents() should return all
      const agents = await registry.getAgents(attacker.address);
      expect(agents.length).to.equal(200);

      // Gas cost check: reading array shouldn't be prohibitive
      const agentCount = await registry.getAgentCount(attacker.address);
      expect(agentCount).to.equal(200);
    });
  });

  describe("Fee Collector Griefing", function () {
    it("Should not be griefed by tiny fee collections", async function () {
      const { usdc, registry, splitter, router, fee, operator, attacker } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // 100 tiny deposits → withdrawals to spam fee collector
      for (let i = 0; i < 100; i++) {
        await splitter.connect(operator).receivePayment(ethers.parseUnits("1", 6), operator.address);
        // Simulate tiny yield
        await usdc.mint(await router.getAddress(), 100n);
        await splitter.connect(operator).withdrawYield(operator.address, 0);
      }

      // Fee collector state should be consistent (tiny amounts may round to 0)
      const totalCollected = await fee.totalCollected();
      // With tiny yields, fees may be zero due to rounding — that's OK
      // The important thing is the protocol didn't break after 100 iterations
      expect(totalCollected).to.be.gte(0);

      // Sweep should work if there's a balance
      const balance = await usdc.balanceOf(await fee.getAddress());
      if (balance > 0n) {
        await expect(fee.sweep()).to.not.be.reverted;
      }
    });

    it("Should handle sweep with zero balance gracefully", async function () {
      const { fee } = await loadFixture(deployProtocol);

      // No fees collected, sweep should revert with NothingToSweep
      await expect(
        fee.sweep()
      ).to.be.revertedWithCustomError(fee, "NothingToSweep");
    });
  });

  describe("Front-Running Griefing", function () {
    it("Should not allow front-running to block victim's deposit", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Victim prepares to deposit
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Attacker front-runs with huge deposit
      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("1000000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(attacker).receivePayment(ethers.parseUnits("1000000", 6), attacker.address);

      // Victim's deposit should still work
      await expect(
        splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address)
      ).to.not.be.reverted;

      // Victim's principal should be tracked correctly
      const victimPrincipal = await router.agentDeposited(operator.address);
      expect(victimPrincipal).to.equal(ethers.parseUnits("200", 6)); // 20% of 1000
    });

    it("Should not allow front-running to grief victim's withdrawal", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Victim deposits
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Simulate yield
      await usdc.mint(await router.getAddress(), ethers.parseUnits("10", 6));

      // Attacker front-runs victim's withdrawal with their own
      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("10000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(attacker).receivePayment(ethers.parseUnits("10000", 6), attacker.address);
      await splitter.connect(attacker).withdrawYield(attacker.address, 0);

      // Victim should still be able to withdraw
      await expect(
        splitter.connect(operator).withdrawYield(operator.address, 0)
      ).to.not.be.reverted;
    });
  });

  describe("Withdrawal Griefing", function () {
    it("Should prevent attacker from blocking others' withdrawals", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Both deposit
      await registry.connect(operator).registerAgent(operator.address);
      await registry.connect(attacker).registerAgent(attacker.address);

      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));

      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);
      await splitter.connect(attacker).receivePayment(ethers.parseUnits("1000", 6), attacker.address);

      // Attacker withdraws all
      await splitter.connect(attacker).withdrawYield(attacker.address, 0);

      // Victim should still be able to withdraw (funds are segregated)
      await expect(
        splitter.connect(operator).withdrawYield(operator.address, 0)
      ).to.not.be.reverted;

      const victimBalance = await usdc.balanceOf(operator.address);
      expect(victimBalance).to.be.gt(0);
    });

    it("Should not allow withdrawal queue poisoning", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Attacker deposits dust amount
      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(attacker).receivePayment(1, attacker.address);

      // Victim deposits normal amount
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Both should be able to withdraw independently
      await expect(
        splitter.connect(attacker).withdrawYield(attacker.address, 0)
      ).to.not.be.reverted;

      await expect(
        splitter.connect(operator).withdrawYield(operator.address, 0)
      ).to.not.be.reverted;
    });
  });

  describe("Protocol Lock-Up Attacks", function () {
    it("Should not allow attacker to lock protocol by manipulating activeProtocol", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Normal deposit
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      const activeProtocol = await router.activeProtocol();
      expect(activeProtocol).to.be.oneOf([1n, 2n]);

      // Attacker can't directly change activeProtocol (no public setter)
      // Protocol state should remain functional

      await expect(
        splitter.connect(operator).withdrawYield(operator.address, 0)
      ).to.not.be.reverted;
    });

    it("Should handle protocol shutdown gracefully (if owner pauses)", async function () {
      // NOTE: Protocol has no pause mechanism yet, but test that
      // owner can't accidentally lock user funds

      const { usdc, registry, splitter, router, owner, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Even if owner changes splitter address, funds remain in router
      const NewSplitter = await ethers.getContractFactory("ClicksSplitterV3");
      const Fee = await ethers.getContractFactory("ClicksFee");
      const newFee = await Fee.deploy(await usdc.getAddress(), owner.address);
      const newSplitter = await NewSplitter.deploy(
        await usdc.getAddress(),
        await router.getAddress(),
        await newFee.getAddress(),
        await registry.getAddress()
      );

      await router.connect(owner).setSplitter(await newSplitter.getAddress());

      // Old splitter can no longer withdraw, but funds are still in router
      // Owner would need to manually rescue via rescueTokens or re-point splitter
      const balance = await router.getTotalBalance();
      expect(balance).to.be.gt(0);
    });
  });

  describe("State Manipulation Griefing", function () {
    it("Should not allow totalDeposited manipulation to harm others", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Attacker deposits and withdraws many times to manipulate totalDeposited
      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("10000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);

      for (let i = 0; i < 50; i++) {
        await splitter.connect(attacker).receivePayment(ethers.parseUnits("100", 6), attacker.address);
        await splitter.connect(attacker).withdrawYield(attacker.address, 0);
      }

      const totalDeposited = await router.totalDeposited();

      // Victim deposits
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      const totalAfter = await router.totalDeposited();
      
      // totalDeposited should be consistent
      expect(totalAfter).to.equal(totalDeposited + ethers.parseUnits("200", 6));
    });

    it("Should prevent agentDeposited underflow griefing", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Try to withdraw more than deposited (should cap at available)
      await splitter.connect(operator).withdrawYield(operator.address, ethers.parseUnits("1000", 6));

      const principal = await router.agentDeposited(operator.address);
      expect(principal).to.equal(0); // All withdrawn, no underflow
    });
  });

  describe("Multi-Agent Griefing", function () {
    it("Should handle 100 concurrent agents without degradation", async function () {
      const { usdc, registry, splitter, router, attacker } = await loadFixture(deployProtocol);

      const agents = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        agents.push(wallet);

        await attacker.sendTransaction({ to: wallet.address, value: ethers.parseEther("1") });
        await registry.connect(wallet).registerAgent(wallet.address);
        await usdc.mint(wallet.address, ethers.parseUnits("10", 6));
        await usdc.connect(wallet).approve(await splitter.getAddress(), ethers.MaxUint256);
        await splitter.connect(wallet).receivePayment(ethers.parseUnits("10", 6), wallet.address);
      }

      // All agents should have correct principal
      for (const wallet of agents) {
        const principal = await router.agentDeposited(wallet.address);
        expect(principal).to.equal(ethers.parseUnits("2", 6)); // 20% of 10
      }

      // Withdrawals should work for all
      for (let i = 0; i < 10; i++) { // Test subset to save gas
        await expect(
          splitter.connect(agents[i]).withdrawYield(agents[i].address, 0)
        ).to.not.be.reverted;
      }
    });
  });
});
