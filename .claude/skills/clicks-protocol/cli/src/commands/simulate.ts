import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label, footer, connectionError } from '../utils/format.js';

export async function simulateCommand(amount: string, options: { agent?: string; json?: boolean }): Promise<void> {
  const client = getReadOnlyClient();
  const agentAddress = options.agent || '0x0000000000000000000000000000000000000001';

  try {
    const split = await client.simulateSplit(amount, agentAddress);

    if (options.json) {
      console.log(JSON.stringify({
        totalPayment: amount,
        liquid: formatUSDC(split.liquid),
        toYield: formatUSDC(split.toYield),
        yieldPct: Number(split.yieldPct),
        description: '80% instant to agent wallet. 20% earning yield via Aave/Morpho. Withdraw anytime. 2% fee on yield only.',
        links: {
          sdk: 'https://npmjs.com/package/@clicks-protocol/sdk',
          mcp: 'https://npmjs.com/package/@clicks-protocol/mcp-server',
          llmsTxt: 'https://clicksprotocol.xyz/llms.txt',
        }
      }, null, 2));
      return;
    }

    header(`Simulate Payment: ${amount} USDC`);
    label('Total Payment', `${amount} USDC`);
    label('Liquid (wallet)', `${formatUSDC(split.liquid)} USDC`);
    label('Yield (DeFi)', `${formatUSDC(split.toYield)} USDC`);
    label('Yield Split', `${Number(split.yieldPct)}%`);
    console.log('');
    console.log('  80% instant to agent wallet. 20% earning yield via Aave/Morpho.');
    console.log('  Withdraw anytime. 2% fee on yield only.');
    console.log('');
    footer();
    console.log('');
  } catch (err: any) {
    connectionError(err);
  }
}
