import { getReadOnlyClient } from '../utils/config.js';
import { header, label } from '../utils/format.js';

export async function referralCommand(address: string): Promise<void> {
  const client = getReadOnlyClient();

  header(`Referral Stats: ${address.slice(0, 6)}...${address.slice(-4)}`);

  try {
    const agents = await client.getOperatorAgents(address);

    label('Agents Registered', agents.length.toString());
    if (agents.length > 0) {
      console.log('');
      console.log('  Agents:');
      agents.forEach((a, i) => {
        console.log(`    ${i + 1}. ${a}`);
      });
    }
    console.log('');
    console.log('  Referral Fee Share:');
    console.log('    L1 (direct):  40% of protocol fee');
    console.log('    L2:           20% of protocol fee');
    console.log('    L3:           10% of protocol fee');
    console.log('    Treasury:     30%');
    console.log('');
    console.log('  Use quickStart with referrer to earn:');
    console.log('    clicks deposit 100 --agent 0x... --referrer ' + address);
    console.log('');
  } catch (err: any) {
    console.error(`Error fetching referral stats: ${err.message}`);
    process.exit(1);
  }
}
