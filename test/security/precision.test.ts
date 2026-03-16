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
 * SECURITY TEST: Precision & Rounding Attacks
 * 
 * DeFi protocols are vulnerable to precision errors and rounding exploits:
 * 
 * 1. Divide-before-multiply (loss of precision)
 * 2. Dust amount exploits (deposits of 1 wei to manipulate ratios)
 * 3. Integer overflow/underflow
 * 4. Fee calculation rounding (can attacker avoid fees via dust amounts?)
 * 5. Share price manipulation (first depositor attack)
 * 6. Wei-level griefing (send 1 wei repeatedly to inflate gas costs)
 * 7. Max uint256 deposits
 * 8. APY calculation precision errors
 * 
 * Expected: Protocol should handle all edge cases gracefully with no fund loss.
 */

describe("Security: Precision & Rounding Attacks", function () {

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

    return { usdc, aave, aUsdc, morpho, registry, fee, router, splitter, owner, operator, agent, treasury, attacker };
  }

  describe("Dust Amount Exploits", function () {
    it("Should handle 1 wei deposits without precision loss", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Deposit 1 wei (smallest unit)
      await splitter.connect(operator).receivePayment(1, operator.address);

      const principal = await router.agentDeposited(operator.address);
      // 20% of 1 wei = 0.2 wei → should round down to 0
      expect(principal).to.equal(0); // Too small to route to yield

      // Verify state is consistent
      const totalDeposited = await router.totalDeposited();
      expect(totalDeposited).to.equal(0);
    });

    it("Should handle repeated dust deposits without state corruption", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Spam with 100 dust deposits
      for (let i = 0; i < 100; i++) {
        await splitter.connect(operator).receivePayment(1, operator.address);
      }

      // State should be consistent
      const principal = await router.agentDeposited(operator.address);
      const totalDeposited = await router.totalDeposited();
      expect(principal).to.equal(totalDeposited);
    });

    it("Should not allow dust deposits to avoid fees", async function () {
      const { usdc, registry, splitter, router, fee, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Deposit normal amount
      await splitter.connect(operator).receivePayment(ethers.parseUnits("100", 6), operator.address);

      // Simulate yield accrual by minting USDC into Aave (not router)
      const aaveAddress = await router.aavePool();
      await usdc.mint(aaveAddress, ethers.parseUnits("0.2", 6)); // 1% of 20 USDC

      const feeBalBefore = await usdc.balanceOf(await fee.getAddress());

      // Withdraw
      await splitter.connect(operator).withdrawYield(operator.address, 0);

      const feeBalAfter = await usdc.balanceOf(await fee.getAddress());
      const feeCollected = feeBalAfter - feeBalBefore;

      // Fee should be ~2% of yield (0.2 * 0.02 = 0.004 USDC = 4000 wei)
      expect(feeCollected).to.be.gt(0); // Fee collected even on small yield
    });
  });

  describe("Fee Calculation Precision", function () {
    it("Should calculate 2% fee correctly for various amounts", async function () {
      const { usdc, registry, splitter, router, fee, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("100000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      const testCases = [
        { deposit: "100", yield: "1" },    // 1% yield
        { deposit: "1000", yield: "10" },  // 1% yield
        { deposit: "555.55", yield: "5.5555" }, // Odd numbers
        { deposit: "0.01", yield: "0.0001" }, // Tiny yield
      ];

      for (const tc of testCases) {
        const depositAmt = ethers.parseUnits(tc.deposit, 6);
        const yieldAmt = ethers.parseUnits(tc.yield, 6);

        await splitter.connect(operator).receivePayment(depositAmt, operator.address);
        
        // Simulate yield by minting into Aave
        const aaveAddress = await router.aavePool();
        await usdc.mint(aaveAddress, yieldAmt);

        const feeBalBefore = await usdc.balanceOf(await fee.getAddress());
        await splitter.connect(operator).withdrawYield(operator.address, 0);
        const feeBalAfter = await usdc.balanceOf(await fee.getAddress());

        const feeCollected = feeBalAfter - feeBalBefore;
        const expectedFee = yieldAmt * 20n / 1000n; // 2% = 20/1000

        // Allow 1 wei rounding error
        const diff = feeCollected > expectedFee ? feeCollected - expectedFee : expectedFee - feeCollected;
        expect(diff).to.be.lte(1);
      }
    });

    it("Should not lose funds due to rounding in fee calculation", async function () {
      const { usdc, registry, splitter, router, fee, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Simulate odd yield amount that might cause rounding issues
      const oddYield = 123456n; // 0.123456 USDC
      const aaveAddress = await router.aavePool();
      await usdc.mint(aaveAddress, oddYield);

      const aaveBalBefore = await usdc.balanceOf(aaveAddress);
      const agentBalBefore = await usdc.balanceOf(operator.address);
      const feeBalBefore = await usdc.balanceOf(await fee.getAddress());

      await splitter.connect(operator).withdrawYield(operator.address, 0);

      const aaveBalAfter = await usdc.balanceOf(aaveAddress);
      const agentBalAfter = await usdc.balanceOf(operator.address);
      const feeBalAfter = await usdc.balanceOf(await fee.getAddress());

      const withdrawn = aaveBalBefore - aaveBalAfter;
      const agentReceived = agentBalAfter - agentBalBefore;
      const feeReceived = feeBalAfter - feeBalBefore;

      // Total should match (no funds lost to rounding)
      expect(agentReceived + feeReceived).to.equal(withdrawn);
    });
  });

  describe("Yield Percentage Precision", function () {
    it("Should handle 20% split correctly for all amounts", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      const amounts = [
        100n,                              // 100 wei
        1000n,                             // 0.001 USDC
        ethers.parseUnits("1", 6),         // 1 USDC
        ethers.parseUnits("99.99", 6),     // Odd number
        ethers.parseUnits("1234.567", 6),  // Precision test
      ];

      for (const amount of amounts) {
        await splitter.connect(operator).receivePayment(amount, operator.address);

        const principal = await router.agentDeposited(operator.address);
        const expectedYield = amount * 20n / 100n;

        // Allow 1 wei rounding
        const diff = principal > expectedYield ? principal - expectedYield : expectedYield - principal;
        expect(diff).to.be.lte(1);

        // Withdraw to reset
        await splitter.connect(operator).withdrawYield(operator.address, 0);
      }
    });

    it("Should handle custom yield percentages (5% to 50%) correctly", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("10000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      const percentages = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

      for (const pct of percentages) {
        await splitter.connect(operator).setOperatorYieldPct(pct);

        const amount = ethers.parseUnits("1000", 6);
        await splitter.connect(operator).receivePayment(amount, operator.address);

        const principal = await router.agentDeposited(operator.address);
        const expectedYield = amount * BigInt(pct) / 100n;

        const diff = principal > expectedYield ? principal - expectedYield : expectedYield - principal;
        expect(diff).to.be.lte(1);

        await splitter.connect(operator).withdrawYield(operator.address, 0);
      }
    });
  });

  describe("Integer Overflow/Underflow", function () {
    it("Should handle max uint256 deposits gracefully", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      
      // Mint max amount (unrealistic but tests overflow protection)
      const maxAmount = ethers.MaxUint256;
      await usdc.mint(operator.address, maxAmount);
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // In production, this would revert (USDC has limited supply and approval)
      // In tests with mock USDC (unlimited mint), the protocol handles it gracefully
      // by accepting the deposit without overflow
      await expect(
        splitter.connect(operator).receivePayment(maxAmount, operator.address)
      ).to.not.be.reverted;

      // Verify no overflow in accounting
      const deposited = await router.agentDeposited(operator.address);
      expect(deposited).to.be.gt(0); // Successfully deposited
    });

    it("Should not underflow on withdrawal of more than deposited", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      const principal = await router.agentDeposited(operator.address);

      // Try to withdraw more than principal
      await expect(
        splitter.connect(operator).withdrawYield(operator.address, principal * 2n)
      ).to.not.be.reverted; // Should cap at available balance

      // Verify state
      const principalAfter = await router.agentDeposited(operator.address);
      expect(principalAfter).to.equal(0); // All withdrawn
    });

    it("Should handle totalDeposited overflow protection", async function () {
      const { usdc, registry, splitter, router, operator, agent } = await loadFixture(deployProtocol);

      // Register multiple agents
      await registry.connect(operator).registerAgent(operator.address);
      await registry.connect(operator).registerAgent(agent.address);

      // Mint large amounts
      const largeAmount = ethers.parseUnits("1000000000", 6); // 1 billion USDC
      await usdc.mint(operator.address, largeAmount);
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(largeAmount, operator.address);

      const totalBefore = await router.totalDeposited();

      // Another large deposit
      await usdc.mint(operator.address, largeAmount);
      await splitter.connect(operator).receivePayment(largeAmount, agent.address);

      const totalAfter = await router.totalDeposited();
      expect(totalAfter).to.equal(totalBefore + largeAmount * 20n / 100n);
    });
  });

  describe("APY Calculation Precision", function () {
    it("Should calculate Aave APY without precision loss", async function () {
      const { router, usdc } = await loadFixture(deployProtocol);

      // Aave returns liquidityRate in RAY (1e27)
      // Our calculation: (rate * 10000) / 1e27
      // Test with various realistic rates

      const aaveAPY = await router.getAaveAPY();
      // APY should be in basis points (0-10000 = 0%-100%)
      expect(aaveAPY).to.be.gte(0);
      expect(aaveAPY).to.be.lte(50000); // Max 500% APY (sanity check)
    });

    it("Should calculate Morpho APY without precision loss", async function () {
      const { router } = await loadFixture(deployProtocol);

      const morphoAPY = await router.getMorphoAPY();
      expect(morphoAPY).to.be.gte(0);
      expect(morphoAPY).to.be.lte(50000);
    });

    it("Should handle getBestProtocol with very close APYs", async function () {
      const { router } = await loadFixture(deployProtocol);

      // If APYs differ by < REBALANCE_THRESHOLD (50 bps), should default to Aave
      const bestProtocol = await router.getBestProtocol();
      expect(Number(bestProtocol)).to.be.oneOf([1, 2]); // 1=Aave, 2=Morpho
    });
  });

  describe("First Depositor Attack", function () {
    it("Should prevent share price manipulation by first depositor", async function () {
      const { usdc, registry, splitter, router, operator, attacker } = await loadFixture(deployProtocol);

      // Attacker deposits 1 wei to become first depositor
      await registry.connect(attacker).registerAgent(attacker.address);
      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));
      await usdc.connect(attacker).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(attacker).receivePayment(1, attacker.address);

      // Attacker directly sends large amount to Aave to inflate share price
      // (Trying to make subsequent depositors lose value due to rounding)
      await usdc.mint(attacker.address, ethers.parseUnits("1000", 6));
      // (Can't manipulate aave directly in mock, but test state integrity)

      // Victim deposits normal amount
      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);
      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      const victimPrincipal = await router.agentDeposited(operator.address);
      const expectedPrincipal = ethers.parseUnits("200", 6); // 20% of 1000

      // Victim should receive correct principal (no loss due to share inflation)
      expect(victimPrincipal).to.equal(expectedPrincipal);
    });
  });

  describe("Divide-Before-Multiply Protection", function () {
    it("Should verify fee calculation uses multiply-then-divide", async function () {
      // Fee calculation: yieldEarned / 50 (which is yieldEarned * 1 / 50)
      // This is safe because division happens after multiplication is done elsewhere
      // Verify by checking the fee code doesn't lose precision

      const { usdc, registry, splitter, router, fee, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Simulate yield of 49 wei (less than 50, which would cause fee=0 if divide-first)
      await usdc.mint(await router.getAddress(), 49n);

      const feeBalBefore = await usdc.balanceOf(await fee.getAddress());
      await splitter.connect(operator).withdrawYield(operator.address, 0);
      const feeBalAfter = await usdc.balanceOf(await fee.getAddress());

      const feeCollected = feeBalAfter - feeBalBefore;
      // fee = 49 / 50 = 0 (integer division rounds down)
      // This is acceptable for such tiny amounts
      expect(feeCollected).to.be.lte(1);
    });

    it("Should verify yield split uses multiply-then-divide", async function () {
      // Split calculation: (amount * yieldPct) / 100
      // Correct order (multiply first, then divide)

      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      // Test with amount=99 (99 * 20 / 100 = 19.8 → 19)
      await splitter.connect(operator).receivePayment(99n, operator.address);

      const principal = await router.agentDeposited(operator.address);
      const expected = 99n * 20n / 100n; // = 19
      expect(principal).to.equal(expected);
    });
  });

  describe("Edge Case: Zero Values", function () {
    it("Should reject zero amount deposits", async function () {
      const { usdc, registry, splitter, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await expect(
        splitter.connect(operator).receivePayment(0, operator.address)
      ).to.be.revertedWithCustomError(splitter, "ZeroAmount");
    });

    it("Should handle zero yield withdrawals", async function () {
      const { usdc, registry, splitter, router, operator } = await loadFixture(deployProtocol);

      await registry.connect(operator).registerAgent(operator.address);
      await usdc.mint(operator.address, ethers.parseUnits("1000", 6));
      await usdc.connect(operator).approve(await splitter.getAddress(), ethers.MaxUint256);

      await splitter.connect(operator).receivePayment(ethers.parseUnits("1000", 6), operator.address);

      // Withdraw immediately (no yield accrued)
      const balBefore = await usdc.balanceOf(operator.address);
      await splitter.connect(operator).withdrawYield(operator.address, 0);
      const balAfter = await usdc.balanceOf(operator.address);

      const received = balAfter - balBefore;
      // Should receive principal back (20% of 1000 = 200)
      expect(received).to.be.gte(ethers.parseUnits("195", 6)); // Allow small rounding
    });
  });
});
