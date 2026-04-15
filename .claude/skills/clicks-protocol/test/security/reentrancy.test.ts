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
 * SECURITY TEST: Reentrancy Attacks
 * 
 * Scenario: Attacker contract tries to exploit reentrancy vulnerabilities in:
 * 1. ClicksYieldRouter.withdraw() - CEI pattern fix already committed
 * 2. ClicksSplitterV3.receivePayment() - splits happen via external calls
 * 3. ClicksSplitterV3.withdrawYield() - calls router, then fee, then agent
 * 
 * Attack vectors:
 * - Malicious ERC20 token hooks (transfer callbacks)
 * - Malicious agent contract with receive() hook
 * - Multiple nested withdrawals before state updates
 * - Front-running withdrawal with deposits
 * 
 * Expected: All reentrancy attempts should FAIL due to CEI pattern enforcement.
 */

describe("Security: Reentrancy Attacks", function () {

  async function deployMockUSDC() {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    return usdc;
  }

  async function deployMaliciousUSDC() {
    const MaliciousERC20 = await ethers.getContractFactory("MaliciousERC20");
    const token = await MaliciousERC20.deploy("Malicious USDC", "MUSDC", 6);
    return token;
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
    const [owner, operator, treasury] = await ethers.getSigners();

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

    return { usdc, registry, fee, router, splitter, owner, operator, treasury };
  }

  describe("Reentrancy on withdraw()", function () {
    it("Should prevent reentrancy via malicious agent receive() hook", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      // Deploy attacker contract
      const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = await ReentrancyAttacker.deploy(
        await splitter.getAddress(),
        await router.getAddress(),
        await usdc.getAddress()
      );
      const attackerAddr = await attacker.getAddress();

      // Register attacker as agent
      await registry.connect(operator).registerAgent(attackerAddr);

      // Fund operator with USDC
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Deposit via splitter (20% goes to yield)
      const depositAmount = ethers.parseUnits("1000", 6);
      await splitter.connect(operator).receivePayment(depositAmount, attackerAddr);

      // Check principal deposited
      const principal = await router.agentDeposited(attackerAddr);
      expect(principal).to.equal(ethers.parseUnits("200", 6)); // 20% of 1000

      // Attacker tries to withdraw with reentrancy attack
      // The attacker contract will try to call withdrawYield again in its receive() hook
      // The outer call may succeed but the reentrant callback is blocked by ReentrancyGuard
      const attackerBalanceBefore = await usdc.balanceOf(attackerAddr);
      await attacker.connect(operator).attack();

      // Verify the attacker only got their legitimate withdrawal, not double
      const attackerBalanceAfter = await usdc.balanceOf(attackerAddr);
      const gained = attackerBalanceAfter - attackerBalanceBefore;
      // Attacker should get at most their deposited principal (200 USDC), not more
      expect(gained).to.be.lte(ethers.parseUnits("200", 6));

      // State should be consistent
      const principalAfter = await router.agentDeposited(attackerAddr);
      expect(principalAfter).to.equal(0);
    });

    it("Should prevent nested withdrawals before state update", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      const NestedWithdrawalAttacker = await ethers.getContractFactory("NestedWithdrawalAttacker");
      const attacker = await NestedWithdrawalAttacker.deploy(
        await splitter.getAddress(),
        await usdc.getAddress()
      );
      const attackerAddr = await attacker.getAddress();

      await registry.connect(operator).registerAgent(attackerAddr);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      const depositAmount = ethers.parseUnits("1000", 6);
      await splitter.connect(operator).receivePayment(depositAmount, attackerAddr);

      // Try to withdraw twice in a row before state updates
      // The outer call succeeds but nested re-entry is blocked by ReentrancyGuard
      const balanceBefore = await usdc.balanceOf(attackerAddr);
      await attacker.attack();
      const balanceAfter = await usdc.balanceOf(attackerAddr);

      // Attacker should not have drained more than their principal
      const gained = balanceAfter - balanceBefore;
      expect(gained).to.be.lte(ethers.parseUnits("200", 6));
    });

    it("Should prevent reentrancy via malicious ERC20 transfer callback", async function () {
      // Deploy malicious USDC that has a transfer callback
      const maliciousUsdc = await deployMaliciousUSDC();
      const [owner, operator, treasury] = await ethers.getSigners();

      const { aave, aUsdc } = await deployMockAave(await maliciousUsdc.getAddress());
      const morpho = await deployMockMorpho();

      const morphoMarketParams = {
        loanToken: await maliciousUsdc.getAddress(),
        collateralToken: ethers.ZeroAddress,
        oracle: ethers.ZeroAddress,
        irm: ethers.ZeroAddress,
        lltv: ethers.parseEther("0.86"),
      };

      const Registry = await ethers.getContractFactory("ClicksRegistry");
      const registry = await Registry.deploy();

      const Fee = await ethers.getContractFactory("ClicksFee");
      const fee = await Fee.deploy(await maliciousUsdc.getAddress(), treasury.address);

      const Router = await ethers.getContractFactory("ClicksYieldRouter");
      const router = await Router.deploy(
        await maliciousUsdc.getAddress(),
        await aave.getAddress(),
        aUsdc,
        await morpho.getAddress(),
        morphoMarketParams,
        owner.address
      );

      const Splitter = await ethers.getContractFactory("ClicksSplitterV3");
      const splitter = await Splitter.deploy(
        await maliciousUsdc.getAddress(),
        await router.getAddress(),
        await fee.getAddress(),
        await registry.getAddress()
      );

      await router.setSplitter(await splitter.getAddress());
      await fee.setAuthorized(await splitter.getAddress(), true);

      // Register agent
      await registry.connect(operator).registerAgent(operator.address);

      // Mint malicious tokens
      await maliciousUsdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await maliciousUsdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Set up the malicious token to call back into withdraw on transfer
      await maliciousUsdc.setReentrancyTarget(await splitter.getAddress());

      // Deposit
      const depositAmount = ethers.parseUnits("1000", 6);
      await splitter.connect(operator).receivePayment(depositAmount, operator.address);

      // Withdraw should work despite malicious token (CEI protects us)
      // Or should revert gracefully
      const principal = await router.agentDeposited(operator.address);
      await splitter.connect(operator).withdrawYield(operator.address, 0);

      // Check that state is consistent
      const principalAfter = await router.agentDeposited(operator.address);
      expect(principalAfter).to.equal(0);
    });
  });

  describe("Reentrancy on receivePayment()", function () {
    it("Should prevent reentrancy during payment splitting", async function () {
      const { usdc, registry, splitter, operator } = await loadFixture(deployProtocol);

      // Deploy attacker that tries to re-enter receivePayment
      const PaymentReentrancyAttacker = await ethers.getContractFactory("PaymentReentrancyAttacker");
      const attacker = await PaymentReentrancyAttacker.deploy(
        await splitter.getAddress(),
        await usdc.getAddress()
      );

      const attackerAddr = await attacker.getAddress();
      await registry.connect(operator).registerAgent(attackerAddr);
      await usdc.mint(attackerAddr, ethers.parseUnits("10000", 6));

      // Attacker tries to call receivePayment recursively
      // The attack stub sets up approval but the reentrant callback is blocked
      const balanceBefore = await usdc.balanceOf(attackerAddr);
      await attacker.attack(ethers.parseUnits("1000", 6));
      const balanceAfter = await usdc.balanceOf(attackerAddr);

      // Attacker should not have gained extra funds through reentrancy
      expect(balanceAfter).to.be.lte(balanceBefore);
    });
  });

  describe("Read-only reentrancy", function () {
    it("Should prevent read-only reentrancy (view function manipulation)", async function () {
      // Some protocols have been exploited via read-only reentrancy where
      // an attacker calls a view function during an ongoing state change
      // and gets stale data before the state update completes

      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      const ReadOnlyAttacker = await ethers.getContractFactory("ReadOnlyReentrancyAttacker");
      const attacker = await ReadOnlyAttacker.deploy(
        await router.getAddress(),
        await splitter.getAddress(),
        await usdc.getAddress()
      );

      await registry.connect(operator).registerAgent(await attacker.getAddress());
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      const depositAmount = ethers.parseUnits("1000", 6);
      await splitter.connect(operator).receivePayment(depositAmount, await attacker.getAddress());

      // Attacker tries to read balance during withdrawal to manipulate state
      // The outer withdrawal succeeds but the reentrant router.withdraw in receive() fails
      const attackerAddr = await attacker.getAddress();
      const balanceBefore = await usdc.balanceOf(attackerAddr);
      await attacker.attack();
      const balanceAfter = await usdc.balanceOf(attackerAddr);

      // Attacker should only get their legitimate withdrawal, no extra funds
      const gained = balanceAfter - balanceBefore;
      expect(gained).to.be.lte(ethers.parseUnits("200", 6));
    });
  });

  describe("Cross-function reentrancy", function () {
    it("Should prevent cross-function reentrancy (deposit during withdraw)", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      const CrossFunctionAttacker = await ethers.getContractFactory("CrossFunctionReentrancyAttacker");
      const attacker = await CrossFunctionAttacker.deploy(
        await splitter.getAddress(),
        await usdc.getAddress()
      );

      const attackerAddr = await attacker.getAddress();
      await registry.connect(operator).registerAgent(attackerAddr);
      // Fund operator (who calls receivePayment on behalf of attacker)
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      // Also fund attacker contract for its reentrant deposit attempt
      await usdc.mint(attackerAddr, ethers.parseUnits("10000", 6));

      const depositAmount = ethers.parseUnits("1000", 6);
      await splitter.connect(operator).receivePayment(depositAmount, attackerAddr);

      // Attacker tries to deposit while withdrawing (cross-function reentrancy)
      // The outer withdrawal succeeds but the reentrant deposit in receive() is blocked
      const balanceBefore = await usdc.balanceOf(attackerAddr);
      await attacker.attack();
      const balanceAfter = await usdc.balanceOf(attackerAddr);

      // Attacker should not have gained extra funds through cross-function reentrancy
      const gained = balanceAfter - balanceBefore;
      expect(gained).to.be.lte(ethers.parseUnits("200", 6));
    });
  });
});
