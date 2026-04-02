import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label } from '../utils/format.js';

export async function simulateCommand(amount: string, options: { agent?: string }): Promise<void> {
  const client = getReadOnlyClient();
  const agentAddress = options.agent || '0x0000000000000000000000000000000000000001';

  header(`Simulate Payment: ${amount} USDC`);

  try {
    const split = await client.simulateSplit(amount, agentAddress);

    label('Total Payment', `${amount} USDC`);
    label('Liquid (wallet)', `${formatUSDC(split.liquid)} USDC`);
    label('Yield (DeFi)', `${formatUSDC(split.toYield)} USDC`);
    label('Yield Split', `${Number(split.yieldPct)}%`);
    console.log('');
    console.log('  80% instant to agent wallet. 20% earning yield via Aave/Morpho.');
    console.log('  Withdraw anytime. 2% fee on yield only.');
    console.log('');
  } catch (err: any) {
    console.error(`Error simulating split: ${err.message}`);
    process.exit(1);
  }
}
