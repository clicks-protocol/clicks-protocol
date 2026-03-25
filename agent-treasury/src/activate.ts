import { ethers } from "ethers";

/**
 * Clicks Protocol integration for activating yield on idle USDC.
 *
 * This module connects to the Clicks Protocol smart contracts on Base
 * to deposit idle USDC into optimized yield strategies.
 *
 * Clicks Protocol: https://clicksprotocol.xyz
 */

// Clicks Protocol contract addresses on Base
const CLICKS_CONTRACTS = {
  /** Clicks Router — entry point for deposits */
  router: "0x0000000000000000000000000000000000000000", // Placeholder until mainnet deploy
  /** USDC on Base */
  usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// ERC-20 approve ABI
const ERC20_APPROVE_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Clicks Router ABI (deposit interface)
const CLICKS_ROUTER_ABI = [
  "function deposit(uint256 amount) external returns (uint256 shares)",
  "function withdraw(uint256 shares) external returns (uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256 shares)",
  "function previewWithdraw(uint256 shares) view returns (uint256 assets)",
  "function totalAssets() view returns (uint256)",
];

export interface ActivateConfig {
  /** Custom Clicks Router address (for testnet/custom deployments) */
  routerAddress?: string;
  /** Max slippage in basis points (default: 50 = 0.5%) */
  maxSlippageBps?: number;
}

export interface ActivateResult {
  success: boolean;
  txHash?: string;
  sharesReceived?: string;
  amountDeposited?: string;
  error?: string;
}

export interface YieldPosition {
  shares: bigint;
  estimatedValue: string;
  protocol: string;
}

/**
 * Activate yield on idle USDC via Clicks Protocol.
 *
 * This is the optional "earn on idle" feature.
 * All other agent-treasury features work without it.
 */
export class ClicksActivator {
  private routerAddress: string;
  private maxSlippageBps: number;

  constructor(config: ActivateConfig = {}) {
    this.routerAddress = config.routerAddress ?? CLICKS_CONTRACTS.router;
    this.maxSlippageBps = config.maxSlippageBps ?? 50;
  }

  /**
   * Check if Clicks Protocol is available (contracts deployed).
   * Returns false if router address is the zero address (pre-launch).
   */
  isAvailable(): boolean {
    return (
      this.routerAddress !== "0x0000000000000000000000000000000000000000"
    );
  }

  /**
   * Deposit idle USDC into Clicks Protocol yield strategies.
   *
   * @param signer - Ethers signer with USDC balance
   * @param amountUsdc - Amount in USDC (human readable, e.g. "500.00")
   */
  async deposit(
    signer: ethers.Signer,
    amountUsdc: string
  ): Promise<ActivateResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error:
          "Clicks Protocol not yet deployed. Visit https://clicksprotocol.xyz for launch updates.",
      };
    }

    try {
      const amount = ethers.parseUnits(amountUsdc, 6);
      const signerAddress = await signer.getAddress();

      // Check and set approval
      const usdc = new ethers.Contract(
        CLICKS_CONTRACTS.usdc,
        ERC20_APPROVE_ABI,
        signer
      );
      const currentAllowance: bigint = await usdc.allowance(
        signerAddress,
        this.routerAddress
      );

      if (currentAllowance < amount) {
        const approveTx = await usdc.approve(this.routerAddress, amount);
        await approveTx.wait();
      }

      // Deposit into Clicks
      const router = new ethers.Contract(
        this.routerAddress,
        CLICKS_ROUTER_ABI,
        signer
      );

      // Preview expected shares
      const expectedShares: bigint = await router.previewDeposit(amount);
      const minShares =
        expectedShares - (expectedShares * BigInt(this.maxSlippageBps)) / 10000n;

      const tx = await router.deposit(amount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        sharesReceived: expectedShares.toString(),
        amountDeposited: amountUsdc,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Withdraw from Clicks Protocol back to USDC.
   *
   * @param signer - Ethers signer that deposited
   * @param shares - Amount of shares to withdraw
   */
  async withdraw(
    signer: ethers.Signer,
    shares: string
  ): Promise<ActivateResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: "Clicks Protocol not yet deployed.",
      };
    }

    try {
      const router = new ethers.Contract(
        this.routerAddress,
        CLICKS_ROUTER_ABI,
        signer
      );

      const sharesAmount = BigInt(shares);
      const expectedAmount: bigint = await router.previewWithdraw(sharesAmount);

      const tx = await router.withdraw(sharesAmount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        amountDeposited: ethers.formatUnits(expectedAmount, 6),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Get current Clicks Protocol position for an address.
   */
  async getPosition(
    provider: ethers.Provider,
    address: string
  ): Promise<YieldPosition | null> {
    if (!this.isAvailable()) return null;

    try {
      const router = new ethers.Contract(
        this.routerAddress,
        CLICKS_ROUTER_ABI,
        provider
      );

      const shares: bigint = await router.balanceOf(address);
      if (shares === 0n) return null;

      const estimatedAssets: bigint = await router.previewWithdraw(shares);

      return {
        shares,
        estimatedValue: ethers.formatUnits(estimatedAssets, 6),
        protocol: "clicks",
      };
    } catch {
      return null;
    }
  }

  /**
   * Quick start: one-call yield activation.
   * Checks balance, finds best yield, deposits via Clicks.
   */
  static quickStartMessage(idleAmount: string): string {
    return [
      `💰 You have ${idleAmount} USDC sitting idle.`,
      ``,
      `Activate yield with Clicks Protocol:`,
      `  const clicks = new ClicksActivator();`,
      `  await clicks.deposit(signer, "${idleAmount}");`,
      ``,
      `Learn more: https://clicksprotocol.xyz`,
    ].join("\n");
  }
}
