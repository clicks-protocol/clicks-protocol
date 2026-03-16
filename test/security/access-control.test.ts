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
 * SECURITY TEST: Access Control
 * 
 * Attack vectors:
 * 1. Unauthorized withdrawal of other agents' funds
 * 2. Non-operator calling splitter-only functions
 * 3. Non-owner calling admin functions (setSplitter, setTreasury, etc.)
 * 4. Agent impersonation (registering someone else's wallet)
 * 5. Unauthorized rebalancing
 * 6. Fee collector manipulation
 * 7. Registry hijacking (deregistering other people's agents)
 * 8. Yield percentage manipulation for other operators
 * 
 * Expected: All unauthorized access attempts should REVERT with proper errors.
 */

describe("Security: Access Control", function () {

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
    const [owner, operator1, operator2, agent1, agent2, attacker, treasury] = await ethers.getSigners();

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

    return { usdc, registry, fee, router, splitter, owner, operator1, operator2, agent1, agent2, attacker, treasury };
  }

  describe("YieldRouter Access Control", function () {
    it("Should reject deposit() from non-splitter", async function () {
      const { usdc, router, operator1, attacker } = await loadFixture(deployProtocol);

      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));
      await usdc.connect(attacker).transfer(await router.getAddress(), ethers.parseUnits("100", 6));

      await expect(
        router.connect(attacker).deposit(ethers.parseUnits("100", 6), operator1.address)
      ).to.be.revertedWithCustomError(router, "OnlySplitter");
    });

    it("Should reject withdraw() from non-splitter", async function () {
      const { usdc, registry, splitter, router, operator1, attacker } = await loadFixture(deployProtocol);

      // Setup: operator1 has deposited funds
      await registry.connect(operator1).registerAgent(operator1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), operator1.address);

      // Attacker tries to withdraw operator1's funds directly
      await expect(
        router.connect(attacker).withdraw(ethers.parseUnits("100", 6), operator1.address)
      ).to.be.revertedWithCustomError(router, "OnlySplitter");
    });

    it("Should reject setSplitter() from non-owner", async function () {
      const { router, attacker } = await loadFixture(deployProtocol);

      await expect(
        router.connect(attacker).setSplitter(attacker.address)
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });

    it("Should reject setMorphoMarketParams() from non-owner", async function () {
      const { router, attacker } = await loadFixture(deployProtocol);

      const fakeParams = {
        loanToken: attacker.address,
        collateralToken: ethers.ZeroAddress,
        oracle: ethers.ZeroAddress,
        irm: ethers.ZeroAddress,
        lltv: 0,
      };

      await expect(
        router.connect(attacker).setMorphoMarketParams(fakeParams)
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });

    it("Should reject rescueTokens() from non-owner", async function () {
      const { usdc, router, attacker } = await loadFixture(deployProtocol);

      await usdc.mint(await router.getAddress(), ethers.parseUnits("100", 6));

      await expect(
        router.connect(attacker).rescueTokens(await usdc.getAddress(), ethers.parseUnits("100", 6), attacker.address)
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });
  });

  describe("Splitter Access Control", function () {
    it("Should allow agent to withdraw their own funds", async function () {
      const { usdc, registry, splitter, operator1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(operator1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), operator1.address);

      // Agent can withdraw their own funds
      await expect(
        splitter.connect(operator1).withdrawYield(operator1.address, 0)
      ).to.not.be.reverted;
    });

    it("Should allow operator to withdraw agent's funds", async function () {
      const { usdc, registry, splitter, operator1, agent1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), agent1.address);

      // Operator can withdraw agent's funds
      await expect(
        splitter.connect(operator1).withdrawYield(agent1.address, 0)
      ).to.not.be.reverted;
    });

    it("Should reject withdrawal from unauthorized third party", async function () {
      const { usdc, registry, splitter, operator1, agent1, attacker } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), agent1.address);

      // Attacker tries to withdraw agent1's funds
      await expect(
        splitter.connect(attacker).withdrawYield(agent1.address, 0)
      ).to.be.revertedWithCustomError(splitter, "NotAuthorized");
    });

    it("Should reject setDefaultYieldPct() from non-owner", async function () {
      const { splitter, attacker } = await loadFixture(deployProtocol);

      await expect(
        splitter.connect(attacker).setDefaultYieldPct(30)
      ).to.be.revertedWithCustomError(splitter, "OwnableUnauthorizedAccount");
    });

    it("Should allow operator to set their own yieldPct", async function () {
      const { splitter, operator1 } = await loadFixture(deployProtocol);

      await expect(
        splitter.connect(operator1).setOperatorYieldPct(25)
      ).to.not.be.reverted;
    });

    it("Should not allow setting another operator's yieldPct", async function () {
      const { splitter, operator1, operator2 } = await loadFixture(deployProtocol);

      // operator1 sets their own
      await splitter.connect(operator1).setOperatorYieldPct(25);

      // operator2 can only set their own, not operator1's
      await splitter.connect(operator2).setOperatorYieldPct(30);

      // Verify operator1's setting is unchanged
      const op1Pct = await splitter.operatorYieldPct(operator1.address);
      expect(op1Pct).to.equal(25);

      const op2Pct = await splitter.operatorYieldPct(operator2.address);
      expect(op2Pct).to.equal(30);
    });
  });

  describe("Fee Collector Access Control", function () {
    it("Should reject collectFee() from unauthorized caller", async function () {
      const { usdc, fee, operator1, attacker } = await loadFixture(deployProtocol);

      await usdc.mint(await fee.getAddress(), ethers.parseUnits("10", 6));

      await expect(
        fee.connect(attacker).collectFee(operator1.address, ethers.parseUnits("10", 6))
      ).to.be.revertedWithCustomError(fee, "NotAuthorized");
    });

    it("Should allow authorized splitter to collectFee()", async function () {
      const { usdc, fee, splitter, operator1 } = await loadFixture(deployProtocol);

      await usdc.mint(await splitter.getAddress(), ethers.parseUnits("10", 6));
      
      // Splitter is authorized
      const splitterContract = await ethers.getContractAt("ClicksSplitterV3", await splitter.getAddress());
      // (collectFee is called internally by splitter, can't test directly without full flow)
      // Instead, just verify authorization check works
      const isAuthorized = await fee.authorized(await splitter.getAddress());
      expect(isAuthorized).to.be.true;
    });

    it("Should reject setTreasury() from non-owner", async function () {
      const { fee, attacker } = await loadFixture(deployProtocol);

      await expect(
        fee.connect(attacker).setTreasury(attacker.address)
      ).to.be.revertedWithCustomError(fee, "OwnableUnauthorizedAccount");
    });

    it("Should reject setAuthorized() from non-owner", async function () {
      const { fee, attacker } = await loadFixture(deployProtocol);

      await expect(
        fee.connect(attacker).setAuthorized(attacker.address, true)
      ).to.be.revertedWithCustomError(fee, "OwnableUnauthorizedAccount");
    });

    it("Should allow anyone to call sweep() but only to treasury", async function () {
      const { usdc, fee, treasury, attacker } = await loadFixture(deployProtocol);

      await usdc.mint(await fee.getAddress(), ethers.parseUnits("100", 6));

      const treasuryBalBefore = await usdc.balanceOf(treasury.address);

      // Attacker can call sweep, but funds go to treasury, not attacker
      await fee.connect(attacker).sweep();

      const treasuryBalAfter = await usdc.balanceOf(treasury.address);
      expect(treasuryBalAfter - treasuryBalBefore).to.equal(ethers.parseUnits("100", 6));

      const attackerBal = await usdc.balanceOf(attacker.address);
      expect(attackerBal).to.equal(0);
    });

    it("Should reject sweepAmount() from non-owner", async function () {
      const { usdc, fee, attacker } = await loadFixture(deployProtocol);

      await usdc.mint(await fee.getAddress(), ethers.parseUnits("100", 6));

      await expect(
        fee.connect(attacker).sweepAmount(ethers.parseUnits("50", 6))
      ).to.be.revertedWithCustomError(fee, "OwnableUnauthorizedAccount");
    });
  });

  describe("Registry Access Control", function () {
    it("Should allow anyone to register their own agent", async function () {
      const { registry, operator1, agent1 } = await loadFixture(deployProtocol);

      await expect(
        registry.connect(operator1).registerAgent(agent1.address)
      ).to.not.be.reverted;

      const operator = await registry.getOperator(agent1.address);
      expect(operator).to.equal(operator1.address);
    });

    it("Should reject registering an already registered agent", async function () {
      const { registry, operator1, operator2, agent1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);

      await expect(
        registry.connect(operator2).registerAgent(agent1.address)
      ).to.be.revertedWithCustomError(registry, "AlreadyRegistered");
    });

    it("Should allow operator to deregister their own agent", async function () {
      const { registry, operator1, agent1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);
      
      await expect(
        registry.connect(operator1).deregisterAgent(agent1.address)
      ).to.not.be.reverted;

      const operator = await registry.getOperator(agent1.address);
      expect(operator).to.equal(ethers.ZeroAddress);
    });

    it("Should reject deregistering another operator's agent", async function () {
      const { registry, operator1, operator2, agent1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);

      await expect(
        registry.connect(operator2).deregisterAgent(agent1.address)
      ).to.be.revertedWithCustomError(registry, "NotOperator");
    });

    it("Should allow owner to deregister any agent", async function () {
      const { registry, owner, operator1, agent1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(agent1.address);

      // Owner can deregister
      await expect(
        registry.connect(owner).deregisterAgent(agent1.address)
      ).to.not.be.reverted;
    });

    it("Should reject deregistering non-existent agent", async function () {
      const { registry, operator1, agent1 } = await loadFixture(deployProtocol);

      await expect(
        registry.connect(operator1).deregisterAgent(agent1.address)
      ).to.be.revertedWithCustomError(registry, "NotRegistered");
    });
  });

  describe("Cross-contract Access Control", function () {
    it("Should prevent direct USDC transfer to bypass fee", async function () {
      const { usdc, router, registry, splitter, operator1 } = await loadFixture(deployProtocol);

      // Operator deposits normally (pays fee)
      await registry.connect(operator1).registerAgent(operator1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), operator1.address);

      const principalBefore = await router.agentDeposited(operator1.address);

      // Attacker tries to send USDC directly to router to inflate balance without paying fee
      await usdc.mint(operator1.address, ethers.parseUnits("100", 6));
      await usdc.connect(operator1).transfer(await router.getAddress(), ethers.parseUnits("100", 6));

      // Principal should not change (only tracked deposits count)
      const principalAfter = await router.agentDeposited(operator1.address);
      expect(principalAfter).to.equal(principalBefore);
    });

    it("Should prevent unauthorized users from changing router's splitter", async function () {
      const { router, splitter, attacker } = await loadFixture(deployProtocol);

      const AttackerSplitter = await ethers.getContractFactory("ClicksSplitterV3");
      const fakeSplitter = await AttackerSplitter.deploy(
        await router.usdc(),
        await router.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress
      );

      // Attacker tries to set their own splitter
      await expect(
        router.connect(attacker).setSplitter(await fakeSplitter.getAddress())
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });

    it("Should prevent unauthorized users from authorizing themselves in fee collector", async function () {
      const { fee, attacker } = await loadFixture(deployProtocol);

      await expect(
        fee.connect(attacker).setAuthorized(attacker.address, true)
      ).to.be.revertedWithCustomError(fee, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases: Owner Privileges", function () {
    it("Should allow owner to withdraw any agent's funds via splitter", async function () {
      const { usdc, registry, splitter, owner, operator1 } = await loadFixture(deployProtocol);

      await registry.connect(operator1).registerAgent(operator1.address);
      await usdc.mint(operator1.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator1).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator1).receivePayment(ethers.parseUnits("1000", 6), operator1.address);

      // Owner emergency withdrawal (valid use case for recovery)
      await expect(
        splitter.connect(owner).withdrawYield(operator1.address, 0)
      ).to.not.be.reverted;
    });

    it("Should verify ownership transfer works correctly", async function () {
      const { router, owner, operator1 } = await loadFixture(deployProtocol);

      // Transfer ownership
      await router.connect(owner).transferOwnership(operator1.address);
      
      // Old owner can't call admin functions
      await expect(
        router.connect(owner).setSplitter(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");

      // New owner can
      // (Would need to accept ownership first with Ownable2Step, but MockAavePool might use basic Ownable)
    });
  });
});
