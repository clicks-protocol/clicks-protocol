import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label } from '../utils/format.js';

export async function balanceCommand(address: string): Promise<void> {
  const client = getReadOnlyClient();

  header(`Balance: ${address.slice(0, 6)}...${address.slice(-4)}`);

  try {
    const [walletBalance, agentInfo] = await Promise.all([
      client.getUSDCBalance(address),
      client.getAgentInfo(address),
    ]);

    label('Wallet USDC', `${formatUSDC(walletBalance)} USDC`);
    label('Yield Deposit', `${formatUSDC(agentInfo.deposited)} USDC`);
    label('Total', `${formatUSDC(walletBalance + agentInfo.deposited)} USDC`);
    label('Registered', agentInfo.isRegistered ? '✅' : '❌');
    console.log('');
  } catch (err: any) {
    console.error(`Error fetching balance: ${err.message}`);
    process.exit(1);
  }
}
