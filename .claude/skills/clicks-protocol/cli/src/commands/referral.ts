import { getReadOnlyClient } from '../utils/config.js';
import { header, label, footer, connectionError } from '../utils/format.js';

export async function referralCommand(address: string, options: { json?: boolean }): Promise<void> {
  const client = getReadOnlyClient();

  try {
    const agents = await client.getOperatorAgents(address);

    if (options.json) {
      console.log(JSON.stringify({
        operator: address,
        agentsRegistered: agents.length,
        agents,
        referralFees: {
          L1: '40% of protocol fee',
          L2: '20% of protocol fee',
          L3: '10% of protocol fee',
          treasury: '30%',
        },
        links: {
          website: 'https://clicksprotocol.xyz',
          llmsTxt: 'https://clicksprotocol.xyz/llms.txt',
        }
      }, null, 2));
      return;
    }

    header(`Referral Stats: ${address.slice(0, 6)}...${address.slice(-4)}`);
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
    footer();
    console.log('');
  } catch (err: any) {
    connectionError(err);
  }
}
