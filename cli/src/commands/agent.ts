import { getReadOnlyClient } from '../utils/config.js';
import { formatUSDC, header, label, shortAddr } from '../utils/format.js';

export async function agentCommand(address: string): Promise<void> {
  const client = getReadOnlyClient();

  header(`Agent: ${shortAddr(address)}`);

  try {
    const info = await client.getAgentInfo(address);
    const balance = await client.getUSDCBalance(address);

    label('Registered', info.isRegistered ? '✅ Yes' : '❌ No');
    label('Operator', info.operator === '0x0000000000000000000000000000000000000000' ? 'None' : shortAddr(info.operator));
    label('Yield Split', `${Number(info.yieldPct)}%`);
    label('Deposited (Yield)', `${formatUSDC(info.deposited)} USDC`);
    label('Wallet Balance', `${formatUSDC(balance)} USDC`);
    label('Full Address', address);
    console.log('');
  } catch (err: any) {
    console.error(`Error fetching agent: ${err.message}`);
    process.exit(1);
  }
}
