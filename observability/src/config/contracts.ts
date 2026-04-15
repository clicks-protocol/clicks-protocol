import fs from 'node:fs';
import path from 'node:path';

export type ContractName =
  | 'ClicksRegistry'
  | 'ClicksYieldRouter'
  | 'ClicksFee'
  | 'ClicksSplitterV3';

interface DeploymentFile {
  network: string;
  chainId: number;
  contracts: Record<string, string>;
  externalAddresses: Record<string, string>;
}

const DEPLOYMENTS_PATH = path.resolve(__dirname, '../../../deployments/base.json');

function readDeployments(): DeploymentFile {
  const raw = fs.readFileSync(DEPLOYMENTS_PATH, 'utf8');
  return JSON.parse(raw) as DeploymentFile;
}

const deployments = readDeployments();

export const BASE_MAINNET = {
  network: deployments.network,
  chainId: deployments.chainId,
  deploymentsPath: DEPLOYMENTS_PATH,
  contracts: {
    registry: deployments.contracts.ClicksRegistry,
    splitter: deployments.contracts.ClicksSplitterV3,
    yieldRouter: deployments.contracts.ClicksYieldRouter,
    feeCollector: deployments.contracts.ClicksFee,
  },
  external: {
    usdc: deployments.externalAddresses.usdc,
  },
} as const;

export const REGISTRY_ABI = [
  'event AgentRegistered(address indexed agent, address indexed operator)',
  'function totalAgents() view returns (uint256)',
] as const;

export const SPLITTER_ABI = [
  'event PaymentReceived(address indexed agent, address indexed operator, uint256 total, uint256 liquid, uint256 toYield)',
  'event YieldWithdrawn(address indexed agent, uint256 principal, uint256 yieldEarned, uint256 fee)',
] as const;

export const YIELD_ROUTER_ABI = [
  'function totalDeposited() view returns (uint256)',
  'function getTotalBalance() view returns (uint256)',
  'function activeProtocol() view returns (uint8)',
  'function getAPYs() view returns (uint256 aaveAPY, uint256 morphoAPY)',
] as const;

export const FEE_ABI = [
  'event FeeCollected(address indexed agent, uint256 amount)',
  'function totalCollected() view returns (uint256)',
  'function pendingFees() view returns (uint256)',
] as const;

export const ACTIVE_PROTOCOL_NAMES: Record<number, string> = {
  0: 'none',
  1: 'aave',
  2: 'morpho',
};
