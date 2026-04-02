import { getWriteClient } from '../utils/config.js';
import { header, label, success } from '../utils/format.js';

export async function yieldPctCommand(pct: string): Promise<void> {
  const client = getWriteClient();
  const pctNum = parseInt(pct, 10);

  if (isNaN(pctNum) || pctNum < 5 || pctNum > 50) {
    console.error('Error: Yield percentage must be between 5 and 50.');
    process.exit(1);
  }

  header('Set Yield Percentage');
  label('New Yield %', `${pctNum}%`);
  label('Liquid %', `${100 - pctNum}%`);

  try {
    console.log('');
    console.log('  Sending transaction...');
    const tx = await client.setOperatorYieldPct(pctNum);
    label('Tx Hash', tx.hash);
    console.log('  Waiting for confirmation...');
    await tx.wait();
    console.log('');
    success(`Yield split set to ${pctNum}%. Future payments: ${100 - pctNum}% liquid, ${pctNum}% yield.`);
    console.log('');
  } catch (err: any) {
    console.error(`Error setting yield percentage: ${err.message}`);
    process.exit(1);
  }
}
