import { getWriteClient } from '../utils/config.js';
import { header, label, success } from '../utils/format.js';

export async function depositCommand(amount: string, options: { agent: string; referrer?: string }): Promise<void> {
  const client = getWriteClient();

  header(`Deposit: ${amount} USDC`);
  label('Agent', options.agent);
  if (options.referrer) {
    label('Referrer', options.referrer);
  }

  try {
    console.log('');
    console.log('  Running quickStart (register + approve + split)...');
    const result = await client.quickStart(amount, options.agent, options.referrer);

    console.log('');
    label('Registered', result.registered ? 'Yes (new)' : 'Already done');
    label('Approved', result.approved ? 'Yes (new)' : 'Already done');
    label('Payment Split', result.paymentSplit ? '✅' : '❌');
    if (result.txHashes.length > 0) {
      label('Transactions', result.txHashes.length.toString());
      result.txHashes.forEach((h, i) => label(`  Tx ${i + 1}`, h));
    }
    console.log('');
    success(`${amount} USDC deposited. 80% liquid, 20% earning yield.`);
    console.log('');
  } catch (err: any) {
    console.error(`Error depositing: ${err.message}`);
    process.exit(1);
  }
}
