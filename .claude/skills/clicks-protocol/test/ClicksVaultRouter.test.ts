import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("ClicksVaultRouter", function () {
  let vaultRouter: Contract;
  let mockVault: Contract;
  let mockUsdc: Contract;
  let owner: Signer;
  let splitter: Signer;
  let agent1: Signer;
  let agent2: Signer;
  let ownerAddr: string;
  let splitterAddr: string;
  let agent1Addr: string;
  let agent2Addr: string;

  beforeEach(async function () {
    [owner, splitter, agent1, agent2] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    splitterAddr = await splitter.getAddress();
    agent1Addr = await agent1.getAddress();
    agent2Addr = await agent2.getAddress();

    // Deploy mock USDC (simple ERC20)
    const MockERC20 = await ethers.getContractFactory("contracts/test/Mocks.sol:MockERC20");
    mockUsdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUsdc.waitForDeployment();

    // Deploy mock ERC-4626 vault
    const MockVault = await ethers.getContractFactory("MockERC4626Vault");
    mockVault = await MockVault.deploy(await mockUsdc.getAddress());
    await mockVault.waitForDeployment();

    // Deploy ClicksVaultRouter
    const VaultRouter = await ethers.getContractFactory("ClicksVaultRouter");
    vaultRouter = await VaultRouter.deploy(
      await mockUsdc.getAddress(),
      await mockVault.getAddress(),
      splitterAddr
    );
    await vaultRouter.waitForDeployment();

    // Mint USDC to router (simulating splitter transfer)
    await mockUsdc.mint(await vaultRouter.getAddress(), ethers.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vaultRouter.owner()).to.equal(ownerAddr);
    });

    it("Should set the correct splitter", async function () {
      expect(await vaultRouter.splitter()).to.equal(splitterAddr);
    });

    it("Should set the correct vault", async function () {
      expect(await vaultRouter.vault()).to.equal(await mockVault.getAddress());
    });

    it("Should approve vault for max USDC", async function () {
      const allowance = await mockUsdc.allowance(
        await vaultRouter.getAddress(),
        await mockVault.getAddress()
      );
      expect(allowance).to.equal(ethers.MaxUint256);
    });

    it("Should revert if vault asset mismatch", async function () {
      const MockERC20 = await ethers.getContractFactory("contracts/test/Mocks.sol:MockERC20");
      const wrongToken = await MockERC20.deploy("Wrong", "WRONG", 18);
      await wrongToken.waitForDeployment();

      const MockVault = await ethers.getContractFactory("MockERC4626Vault");
      const wrongVault = await MockVault.deploy(await wrongToken.getAddress());
      await wrongVault.waitForDeployment();

      const VaultRouter = await ethers.getContractFactory("ClicksVaultRouter");
      await expect(
        VaultRouter.deploy(
          await mockUsdc.getAddress(),
          await wrongVault.getAddress(),
          splitterAddr
        )
      ).to.be.revertedWithCustomError(VaultRouter, "VaultAssetMismatch");
    });
  });

  describe("Deposit", function () {
    it("Should deposit USDC and receive shares", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);

      await expect(
        vaultRouter.connect(splitter).deposit(depositAmount, agent1Addr)
      )
        .to.emit(vaultRouter, "Deposited")
        .withArgs(agent1Addr, depositAmount, await mockVault.getAddress());

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(depositAmount);
      expect(await vaultRouter.totalDeposited()).to.equal(depositAmount);

      // Vault should have received shares
      const vaultShares = await mockVault.balanceOf(await vaultRouter.getAddress());
      expect(vaultShares).to.be.gt(0);
    });

    it("Should revert if not called by splitter", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      await expect(
        vaultRouter.connect(agent1).deposit(depositAmount, agent1Addr)
      ).to.be.revertedWithCustomError(vaultRouter, "OnlySplitter");
    });

    it("Should handle multiple deposits from same agent", async function () {
      const deposit1 = ethers.parseUnits("1000", 6);
      const deposit2 = ethers.parseUnits("500", 6);

      await vaultRouter.connect(splitter).deposit(deposit1, agent1Addr);
      await vaultRouter.connect(splitter).deposit(deposit2, agent1Addr);

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(deposit1 + deposit2);
      expect(await vaultRouter.totalDeposited()).to.equal(deposit1 + deposit2);
    });

    it("Should handle deposits from multiple agents", async function () {
      const deposit1 = ethers.parseUnits("1000", 6);
      const deposit2 = ethers.parseUnits("2000", 6);

      await vaultRouter.connect(splitter).deposit(deposit1, agent1Addr);
      await vaultRouter.connect(splitter).deposit(deposit2, agent2Addr);

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(deposit1);
      expect(await vaultRouter.agentDeposited(agent2Addr)).to.equal(deposit2);
      expect(await vaultRouter.totalDeposited()).to.equal(deposit1 + deposit2);
    });

    it("Should revert if maxDeposit exceeded", async function () {
      // Set vault to have deposit cap
      await mockVault.setMaxDeposit(ethers.parseUnits("100", 6));

      const depositAmount = ethers.parseUnits("1000", 6);
      await expect(
        vaultRouter.connect(splitter).deposit(depositAmount, agent1Addr)
      ).to.be.revertedWithCustomError(vaultRouter, "MaxDepositExceeded");
    });

    it("Should handle zero deposit correctly (edge case)", async function () {
      // Most implementations should revert on zero, but test behavior
      // Splitter should prevent this, but we test contract behavior
      await vaultRouter.connect(splitter).deposit(0, agent1Addr);
      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(0);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      // Setup: deposit 1000 USDC from agent1
      const depositAmount = ethers.parseUnits("1000", 6);
      await vaultRouter.connect(splitter).deposit(depositAmount, agent1Addr);
    });

    it("Should withdraw principal + yield", async function () {
      // Simulate vault yield (mock vault gives 10% yield)
      const yieldAmount = ethers.parseUnits("100", 6);
      await mockUsdc.mint(ownerAddr, yieldAmount);
      await mockUsdc.connect(owner).approve(await mockVault.getAddress(), yieldAmount);
      await mockVault.connect(owner).addYield(yieldAmount);

      const withdrawAmount = ethers.parseUnits("1000", 6);
      const splitterBalanceBefore = await mockUsdc.balanceOf(splitterAddr);

      const tx = await vaultRouter.connect(splitter).withdraw(withdrawAmount, agent1Addr);
      const receipt = await tx.wait();

      // Should emit Withdrawn event
      const event = receipt.logs.find((log: any) => {
        try {
          return vaultRouter.interface.parseLog(log)?.name === "Withdrawn";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;

      // Agent balance should be zero
      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(0);
      expect(await vaultRouter.totalDeposited()).to.equal(0);

      // Splitter should receive USDC (principal + yield)
      const splitterBalanceAfter = await mockUsdc.balanceOf(splitterAddr);
      expect(splitterBalanceAfter).to.be.gt(splitterBalanceBefore);
    });

    it("Should withdraw all if amount is 0", async function () {
      const splitterBalanceBefore = await mockUsdc.balanceOf(splitterAddr);

      await vaultRouter.connect(splitter).withdraw(0, agent1Addr);

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(0);
      expect(await vaultRouter.totalDeposited()).to.equal(0);

      const splitterBalanceAfter = await mockUsdc.balanceOf(splitterAddr);
      expect(splitterBalanceAfter).to.be.gt(splitterBalanceBefore);
    });

    it("Should withdraw all if amount exceeds balance", async function () {
      const excessAmount = ethers.parseUnits("5000", 6);
      await vaultRouter.connect(splitter).withdraw(excessAmount, agent1Addr);

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(0);
    });

    it("Should handle partial withdrawal", async function () {
      const withdrawAmount = ethers.parseUnits("500", 6);
      await vaultRouter.connect(splitter).withdraw(withdrawAmount, agent1Addr);

      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(
        ethers.parseUnits("500", 6)
      );
      expect(await vaultRouter.totalDeposited()).to.equal(ethers.parseUnits("500", 6));
    });

    it("Should revert if not called by splitter", async function () {
      const withdrawAmount = ethers.parseUnits("100", 6);
      await expect(
        vaultRouter.connect(agent1).withdraw(withdrawAmount, agent1Addr)
      ).to.be.revertedWithCustomError(vaultRouter, "OnlySplitter");
    });

    it("Should handle multiple agents withdrawing", async function () {
      // Deposit from agent2
      await vaultRouter.connect(splitter).deposit(ethers.parseUnits("2000", 6), agent2Addr);

      // Withdraw from agent1
      await vaultRouter.connect(splitter).withdraw(0, agent1Addr);

      // Agent1 should have 0, agent2 should still have balance
      expect(await vaultRouter.agentDeposited(agent1Addr)).to.equal(0);
      expect(await vaultRouter.agentDeposited(agent2Addr)).to.equal(
        ethers.parseUnits("2000", 6)
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      await vaultRouter.connect(splitter).deposit(depositAmount, agent1Addr);
    });

    it("Should return correct vault APY", async function () {
      // Mock vault: 10% yield
      const yieldAmount = ethers.parseUnits("100", 6);
      await mockUsdc.mint(ownerAddr, yieldAmount);
      await mockUsdc.connect(owner).approve(await mockVault.getAddress(), yieldAmount);
      await mockVault.connect(owner).addYield(yieldAmount);

      const apy = await vaultRouter.getVaultAPY();
      // 100/1000 * 10000 = 1000 bps = 10%
      expect(apy).to.equal(1000);
    });

    it("Should return 0 APY if no yield", async function () {
      const apy = await vaultRouter.getVaultAPY();
      expect(apy).to.equal(0);
    });

    it("Should return correct total balance", async function () {
      const totalBalance = await vaultRouter.getTotalBalance();
      expect(totalBalance).to.be.gte(ethers.parseUnits("1000", 6));
    });

    it("Should return correct agent balance", async function () {
      const agentBalance = await vaultRouter.getAgentBalance(agent1Addr);
      expect(agentBalance).to.be.gte(ethers.parseUnits("1000", 6));
    });

    it("Should return agent balance including yield", async function () {
      const yieldAmount = ethers.parseUnits("100", 6);
      await mockUsdc.mint(ownerAddr, yieldAmount);
      await mockUsdc.connect(owner).approve(await mockVault.getAddress(), yieldAmount);
      await mockVault.connect(owner).addYield(yieldAmount);

      const agentBalance = await vaultRouter.getAgentBalance(agent1Addr);
      expect(agentBalance).to.be.gte(ethers.parseUnits("1100", 6));
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change vault", async function () {
      // Deploy new vault
      const MockVault = await ethers.getContractFactory("MockERC4626Vault");
      const newVault = await MockVault.deploy(await mockUsdc.getAddress());
      await newVault.waitForDeployment();

      // Deposit first
      await vaultRouter.connect(splitter).deposit(ethers.parseUnits("1000", 6), agent1Addr);

      // Change vault
      await expect(vaultRouter.connect(owner).setVault(await newVault.getAddress()))
        .to.emit(vaultRouter, "VaultUpdated")
        .withArgs(await mockVault.getAddress(), await newVault.getAddress());

      expect(await vaultRouter.vault()).to.equal(await newVault.getAddress());
    });

    it("Should revert if non-owner tries to change vault", async function () {
      const MockVault = await ethers.getContractFactory("MockERC4626Vault");
      const newVault = await MockVault.deploy(await mockUsdc.getAddress());
      await newVault.waitForDeployment();

      await expect(
        vaultRouter.connect(agent1).setVault(await newVault.getAddress())
      ).to.be.revertedWithCustomError(vaultRouter, "OnlyOwner");
    });

    it("Should allow owner to change splitter", async function () {
      const newSplitter = agent2Addr;
      await expect(vaultRouter.connect(owner).setSplitter(newSplitter))
        .to.emit(vaultRouter, "SplitterUpdated")
        .withArgs(splitterAddr, newSplitter);

      expect(await vaultRouter.splitter()).to.equal(newSplitter);
    });

    it("Should revert if non-owner tries to change splitter", async function () {
      await expect(
        vaultRouter.connect(agent1).setSplitter(agent2Addr)
      ).to.be.revertedWithCustomError(vaultRouter, "OnlyOwner");
    });

    it("Should allow owner to transfer ownership", async function () {
      const newOwner = agent1Addr;
      await expect(vaultRouter.connect(owner).transferOwnership(newOwner))
        .to.emit(vaultRouter, "OwnershipTransferred")
        .withArgs(ownerAddr, newOwner);

      expect(await vaultRouter.owner()).to.equal(newOwner);
    });

    it("Should revert if transferring ownership to zero address", async function () {
      await expect(
        vaultRouter.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vaultRouter, "ZeroAddress");
    });

    it("Should allow owner to rescue stuck tokens", async function () {
      // Mint some random token to router
      const MockERC20 = await ethers.getContractFactory("contracts/test/Mocks.sol:MockERC20");
      const randomToken = await MockERC20.deploy("Random", "RND", 18);
      await randomToken.waitForDeployment();
      await randomToken.mint(await vaultRouter.getAddress(), ethers.parseEther("100"));

      const rescueAmount = ethers.parseEther("100");
      await vaultRouter.connect(owner).rescueTokens(
        await randomToken.getAddress(),
        rescueAmount,
        ownerAddr
      );

      expect(await randomToken.balanceOf(ownerAddr)).to.equal(rescueAmount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle vault with zero shares", async function () {
      const apy = await vaultRouter.getVaultAPY();
      expect(apy).to.equal(0);

      const totalBalance = await vaultRouter.getTotalBalance();
      expect(totalBalance).to.equal(0);
    });

    it("Should handle agent with zero balance", async function () {
      const agentBalance = await vaultRouter.getAgentBalance(agent1Addr);
      expect(agentBalance).to.equal(0);
    });

    it("Should not allow same vault to be set twice", async function () {
      await vaultRouter.connect(owner).setVault(await mockVault.getAddress());
      // Should silently return (no state change)
      expect(await vaultRouter.vault()).to.equal(await mockVault.getAddress());
    });
  });
});
