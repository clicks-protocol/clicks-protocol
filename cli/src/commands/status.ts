import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, formatAPY, formatProtocol, header, label } from '../utils/format.js';

export async function statusCommand(): Promise<void> {
  const client = getReadOnlyClient();

  header('Clicks Protocol — Live Yield Rates');

  try {
    const info = await client.getYieldInfo();
    const fee = await client.getFeeInfo();

    label('Active Protocol', formatProtocol(info.activeProtocol));
    label('Aave V3 APY', formatAPY(info.aaveAPY));
    label('Morpho APY', formatAPY(info.morphoAPY));
    label('Total Deposits', `${formatUSDC(info.totalDeposited)} USDC`);
    label('Total Balance', `${formatUSDC(info.totalBalance)} USDC`);
    label('Fees Collected', `${formatUSDC(fee.totalCollected)} USDC`);
    label('Protocol Fee', `${Number(fee.feeBps) / 100}% on yield only`);
    console.log('');
  } catch (err: any) {
    console.error(`Error fetching status: ${err.message}`);
    process.exit(1);
  }
}
