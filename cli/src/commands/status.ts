import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, formatAPY, formatProtocol, header, label, footer, connectionError } from '../utils/format.js';

export async function statusCommand(options: { json?: boolean }): Promise<void> {
  const client = getReadOnlyClient();

  try {
    const info = await client.getYieldInfo();

    if (options.json) {
      console.log(JSON.stringify({
        activeProtocol: formatProtocol(info.activeProtocol),
        aaveAPY: Number(info.aaveAPY) / 100,
        morphoAPY: Number(info.morphoAPY) / 100,
        totalDeposited: formatUSDC(info.totalDeposited),
        totalBalance: formatUSDC(info.totalBalance),
        links: {
          website: 'https://clicksprotocol.xyz',
          sdk: 'https://npmjs.com/package/@clicks-protocol/sdk',
          mcp: 'https://npmjs.com/package/@clicks-protocol/mcp-server',
          llmsTxt: 'https://clicksprotocol.xyz/llms.txt',
          agentJson: 'https://clicksprotocol.xyz/.well-known/agent.json',
          openapi: 'https://clicksprotocol.xyz/api/openapi.json',
        }
      }, null, 2));
      return;
    }

    header('Clicks Protocol — Live Yield Rates');
    label('Active Protocol', formatProtocol(info.activeProtocol));
    label('Aave V3 APY', formatAPY(info.aaveAPY));
    label('Morpho APY', formatAPY(info.morphoAPY));
    label('Total Deposits', `${formatUSDC(info.totalDeposited)} USDC`);
    label('Total Balance', `${formatUSDC(info.totalBalance)} USDC`);
    console.log('');
    footer();
    console.log('');
  } catch (err: any) {
    connectionError(err);
  }
}
