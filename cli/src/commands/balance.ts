import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label, footer, connectionError } from '../utils/format.js';

export async function balanceCommand(address: string, options: { json?: boolean }): Promise<void> {
  const client = getReadOnlyClient();

  try {
    const [walletBalance, agentInfo] = await Promise.all([
      client.getUSDCBalance(address),
      client.getAgentInfo(address),
    ]);

    if (options.json) {
      console.log(JSON.stringify({
        address,
        walletUSDC: formatUSDC(walletBalance),
        yieldDeposit: formatUSDC(agentInfo.deposited),
        total: formatUSDC(walletBalance + agentInfo.deposited),
        registered: agentInfo.isRegistered,
        links: {
          basescan: `https://basescan.org/address/${address}`,
          llmsTxt: 'https://clicksprotocol.xyz/llms.txt',
        }
      }, null, 2));
      return;
    }

    header(`Balance: ${address.slice(0, 6)}...${address.slice(-4)}`);
    label('Wallet USDC', `${formatUSDC(walletBalance)} USDC`);
    label('Yield Deposit', `${formatUSDC(agentInfo.deposited)} USDC`);
    label('Total', `${formatUSDC(walletBalance + agentInfo.deposited)} USDC`);
    label('Registered', agentInfo.isRegistered ? '✅' : '❌');
    console.log('');
    footer();
    console.log('');
  } catch (err: any) {
    connectionError(err);
  }
}
