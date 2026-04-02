import { getWriteClient } from '../utils/config.js';
import { header, label, success } from '../utils/format.js';

export async function withdrawCommand(address: string, options: { amount?: string }): Promise<void> {
  const client = getWriteClient();

  header('Withdraw Yield');
  label('Agent', address);
  label('Amount', options.amount || 'All (principal + yield)');

  try {
    console.log('');
    console.log('  Sending withdrawal transaction...');
    const result = await client.withdrawYield(address, options.amount);
    label('Tx Hash', result.tx.hash);
    console.log('  Waiting for confirmation...');
    await result.tx.wait();
    console.log('');
    success('Withdrawal complete. USDC returned to agent wallet.');
    console.log('  2% fee deducted from yield earned (not from principal).');
    console.log('');
  } catch (err: any) {
    console.error(`Error withdrawing: ${err.message}`);
    process.exit(1);
  }
}
