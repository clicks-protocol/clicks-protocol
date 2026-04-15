import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label, shortAddr, footer, connectionError } from '../utils/format.js';

export async function agentCommand(address: string, options: { json?: boolean }): Promise<void> {
  const client = getReadOnlyClient();

  try {
    const info = await client.getAgentInfo(address);
    const balance = await client.getUSDCBalance(address);

    if (options.json) {
      console.log(JSON.stringify({
        address,
        registered: info.isRegistered,
        operator: info.operator,
        yieldPct: Number(info.yieldPct),
        deposited: formatUSDC(info.deposited),
        walletBalance: formatUSDC(balance),
        links: {
          basescan: `https://basescan.org/address/${address}`,
          llmsTxt: 'https://clicksprotocol.xyz/llms.txt',
        }
      }, null, 2));
      return;
    }

    header(`Agent: ${shortAddr(address)}`);
    label('Registered', info.isRegistered ? '✅ Yes' : '❌ No');
    label('Operator', info.operator === '0x0000000000000000000000000000000000000000' ? 'None' : shortAddr(info.operator));
    label('Yield Split', `${Number(info.yieldPct)}%`);
    label('Deposited (Yield)', `${formatUSDC(info.deposited)} USDC`);
    label('Wallet Balance', `${formatUSDC(balance)} USDC`);
    label('Full Address', address);
    console.log('');
    footer();
    console.log('');
  } catch (err: any) {
    connectionError(err);
  }
}
