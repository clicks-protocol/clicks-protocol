import { getWriteClient } from '../utils/config.js';
import { header, label, success } from '../utils/format.js';

export async function registerCommand(address: string, options: { referrer?: string }): Promise<void> {
  const client = getWriteClient();

  header('Register Agent');
  label('Agent', address);
  if (options.referrer) {
    label('Referrer', options.referrer);
  }

  try {
    // Check if already registered
    const info = await client.getAgentInfo(address);
    if (info.isRegistered) {
      console.log('');
      console.log('  Agent is already registered.');
      console.log('');
      return;
    }

    console.log('');
    console.log('  Sending transaction...');
    const tx = await client.registerAgent(address);
    label('Tx Hash', tx.hash);
    console.log('  Waiting for confirmation...');
    await tx.wait();
    console.log('');
    success('Agent registered on Base Mainnet.');
    console.log('');
    console.log('  Next: clicks deposit <amount> --agent ' + address);
    console.log('');
  } catch (err: any) {
    console.error(`Error registering agent: ${err.message}`);
    process.exit(1);
  }
}
