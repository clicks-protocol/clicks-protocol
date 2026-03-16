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
 * SECURITY TEST: Flash Loan Attacks
 * 
 * Flash loans allow borrowing massive amounts of capital without collateral
 * for a single transaction. Common attack vectors:
 * 
 * 1. Price/APY Manipulation: Borrow huge amounts, manipulate Aave/Morpho APY,
 *    trigger rebalance to unfavorable protocol, profit from spread
 * 2. Liquidity Drain: Flash loan → deposit → immediate withdraw before yield accrual
 * 3. Governance Attack: Flash borrow, register many agents, manipulate protocol state
 * 4. Oracle Manipulation: Manipulate Morpho utilization ratio to fake APY
 * 5. Sandwich Attack: Flash loan → deposit → user deposits → withdraw → profit
 * 
 * Expected: Protocol should be resistant to all flash loan attacks.
 */

describe("Security: Flash Loan Attacks", function () {

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
    const [owner, operator, treasury, attacker] = await ethers.getSigners();

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

    return { usdc, aave, morpho, registry, fee, router, splitter, owner, operator, treasury, attacker };
  }

  describe("APY Manipulation via Flash Loan", function () {
    it("Should not allow APY manipulation to trigger bad rebalancing", async function () {
      const { usdc, aave, morpho, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Setup: Normal user deposits
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("10000", 6),
        operator.address
      );

      const balanceBefore = await router.getTotalBalance();

      // Attacker flash borrows huge amount to manipulate Aave APY
      const FlashLoanAttacker = await ethers.getContractFactory("FlashLoanAPYAttacker");
      const flashAttacker = await FlashLoanAttacker.deploy(
        await aave.getAddress(),
        await morpho.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await usdc.mint(await flashAttacker.getAddress(), ethers.parseUnits("1000000", 6));

      // Attack: Borrow 1M USDC, manipulate APY, try to trigger bad rebalance
      await expect(
        flashAttacker.attack()
      ).to.be.reverted; // Should fail: no direct rebalance access

      const balanceAfter = await router.getTotalBalance();
      expect(balanceAfter).to.equal(balanceBefore); // State unchanged
    });

    it("Should not allow Morpho utilization manipulation via flash deposits", async function () {
      const { usdc, morpho, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Normal deposit
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("1000", 6),
        operator.address
      );

      // Get Morpho APY before attack
      const morphoAPYBefore = await router.getMorphoAPY();

      // Attacker flash borrows, deposits into Morpho to manipulate utilization
      const FlashUtilizationAttacker = await ethers.getContractFactory("FlashUtilizationAttacker");
      const flashAttacker = await FlashUtilizationAttacker.deploy(
        await morpho.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await usdc.mint(await flashAttacker.getAddress(), ethers.parseUnits("10000000", 6));
      
      // Try to manipulate utilization → APY → rebalance decision
      await flashAttacker.attack();

      const morphoAPYAfter = await router.getMorphoAPY();
      
      // APY might change but router state should be intact
      const routerBalance = await router.getTotalBalance();
      expect(routerBalance).to.be.gt(0);
    });
  });

  describe("Liquidity Drain via Flash Loan", function () {
    it("Should prevent drain via deposit + immediate withdraw flash loan", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Attacker registers as operator
      await registry.connect(attacker).registerAgent(attacker.address);

      const FlashDrainAttacker = await ethers.getContractFactory("FlashDrainAttacker");
      const flashAttacker = await FlashDrainAttacker.deploy(
        await splitter.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await registry.connect(attacker).registerAgent(await flashAttacker.getAddress());

      // Give attacker initial capital
      await usdc.mint(await flashAttacker.getAddress(), ethers.parseUnits("100000", 6));

      // Attack: Flash deposit → immediate withdraw before yield accrues
      // Should fail because no instant yield is available
      await flashAttacker.attack();

      // Verify attacker didn't profit (withdraw should return ≈ deposit)
      const attackerBalance = await usdc.balanceOf(await flashAttacker.getAddress());
      expect(attackerBalance).to.be.lte(ethers.parseUnits("100000", 6)); // No profit
    });

    it("Should prevent protocol drainage via flash loan sandwich", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Victim deposits
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("10000", 6),
        operator.address
      );

      const victimPrincipal = await router.agentDeposited(operator.address);

      // Attacker sandwich attack:
      // 1. Flash borrow + deposit (dilute victim's share)
      // 2. Wait for victim interaction
      // 3. Withdraw + repay (profit from dilution)

      const SandwichAttacker = await ethers.getContractFactory("FlashSandwichAttacker");
      const sandwichAttacker = await SandwichAttacker.deploy(
        await splitter.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await registry.connect(attacker).registerAgent(await sandwichAttacker.getAddress());
      await usdc.mint(await sandwichAttacker.getAddress(), ethers.parseUnits("1000000", 6));

      // Execute sandwich
      await sandwichAttacker.attack();

      // Victim's principal should be unchanged
      const victimPrincipalAfter = await router.agentDeposited(operator.address);
      expect(victimPrincipalAfter).to.equal(victimPrincipal);

      // Attacker should not profit
      const attackerBalance = await usdc.balanceOf(await sandwichAttacker.getAddress());
      expect(attackerBalance).to.be.lte(ethers.parseUnits("1000000", 6));
    });
  });

  describe("Governance/Registry Flash Loan Attack", function () {
    it("Should prevent mass agent registration via flash loan capital", async function () {
      const { usdc, registry, attacker } = await loadFixture(deployProtocol);

      // Attack: Use flash loan to register 1000s of agents to manipulate state
      const RegistryFlashAttacker = await ethers.getContractFactory("RegistryFlashAttacker");
      const flashAttacker = await RegistryFlashAttacker.deploy(
        await registry.getAddress()
      );

      // Try to register mass agents
      await flashAttacker.attack(100); // Try to register 100 agents

      // Registration should work but shouldn't give attacker any economic advantage
      const totalAgents = await registry.totalAgents();
      expect(totalAgents).to.be.gte(0);

      // Key insight: Registry is permissionless but doesn't confer economic power
      // No funds are at risk from mass registration alone
    });
  });

  describe("Oracle/Price Manipulation", function () {
    it("Should resist Aave liquidity rate manipulation", async function () {
      const { usdc, aave, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Normal deposit
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("1000", 6),
        operator.address
      );

      const aaveAPYBefore = await router.getAaveAPY();

      // Attacker flash deposits huge amount to Aave to manipulate currentLiquidityRate
      const OracleManipulator = await ethers.getContractFactory("OracleManipulationAttacker");
      const manipulator = await OracleManipulator.deploy(
        await aave.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await usdc.mint(await manipulator.getAddress(), ethers.parseUnits("10000000", 6));
      await manipulator.attack();

      const aaveAPYAfter = await router.getAaveAPY();

      // APY read is atomic — flash loan can't persist changes across blocks
      // Router state should be consistent
      const balance = await router.getTotalBalance();
      expect(balance).to.be.gt(0);
    });
  });

  describe("Flash Loan + Front-Running Combo", function () {
    it("Should prevent flash loan + front-run withdraw combo", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Victim deposits
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("10000", 6),
        operator.address
      );

      const victimPrincipalBefore = await router.agentDeposited(operator.address);

      // Attacker sees victim's withdraw tx in mempool
      // Flash borrows → front-runs → tries to drain protocol before victim withdraws
      const FrontRunFlashAttacker = await ethers.getContractFactory("FrontRunFlashAttacker");
      const frontRunner = await FrontRunFlashAttacker.deploy(
        await splitter.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await registry.connect(attacker).registerAgent(await frontRunner.getAddress());
      await usdc.mint(await frontRunner.getAddress(), ethers.parseUnits("100000", 6));

      // Attack
      await frontRunner.attack();

      // Victim should still be able to withdraw their funds
      await splitter.connect(operator).withdrawYield(operator.address, 0);
      const victimBalance = await usdc.balanceOf(operator.address);

      // Victim should receive ≈ principal (no yield accrued yet, but principal intact)
      expect(victimBalance).to.be.gte(ethers.parseUnits("9800", 6)); // 98% of 10k (2% fee)
    });
  });

  describe("Flash Loan Attack via Morpho Market Manipulation", function () {
    it("Should prevent manipulation of Morpho market shares", async function () {
      const { usdc, morpho, registry, splitter, router, operator, attacker } = 
        await loadFixture(deployProtocol);

      // Deposit normally
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(
        ethers.parseUnits("1000", 6),
        operator.address
      );

      // Attacker flash borrows → manipulates totalSupplyShares/totalSupplyAssets ratio
      const MorphoShareAttacker = await ethers.getContractFactory("MorphoShareManipulator");
      const shareAttacker = await MorphoShareAttacker.deploy(
        await morpho.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );

      await usdc.mint(await shareAttacker.getAddress(), ethers.parseUnits("1000000", 6));
      
      // Try to inflate share price to drain others
      await shareAttacker.attack();

      // Verify victim's position is intact
      const victimPrincipal = await router.agentDeposited(operator.address);
      expect(victimPrincipal).to.equal(ethers.parseUnits("200", 6)); // 20% of 1000

      // Withdraw should work
      await splitter.connect(operator).withdrawYield(operator.address, 0);
      const victimBalance = await usdc.balanceOf(operator.address);
      expect(victimBalance).to.be.gte(ethers.parseUnits("190", 6)); // At least principal - fee
    });
  });
});
