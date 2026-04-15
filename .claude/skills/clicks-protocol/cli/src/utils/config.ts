import { JsonRpcProvider, Wallet } from 'ethers';
import { ClicksClient } from '@clicks-protocol/sdk';

const DEFAULT_RPC = 'https://mainnet.base.org';

export function getRpcUrl(): string {
  return process.env.CLICKS_RPC_URL || process.env.BASE_RPC_URL || DEFAULT_RPC;
}

export function getProvider(): JsonRpcProvider {
  return new JsonRpcProvider(getRpcUrl());
}

export function getReadOnlyClient(): ClicksClient {
  return new ClicksClient(getProvider());
}

export function getWriteClient(): ClicksClient {
  const key = process.env.CLICKS_PRIVATE_KEY;
  if (!key) {
    console.error('Error: CLICKS_PRIVATE_KEY environment variable is required for write operations.');
    console.error('');
    console.error('  export CLICKS_PRIVATE_KEY=0xYourPrivateKey');
    console.error('');
    process.exit(1);
  }
  const provider = getProvider();
  const signer = new Wallet(key, provider);
  // @ts-ignore - ethers version mismatch, but works at runtime
  return new ClicksClient(signer);
}
