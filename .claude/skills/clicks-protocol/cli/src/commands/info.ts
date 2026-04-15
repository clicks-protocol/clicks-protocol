import chalk from 'chalk';
import { header, label } from '../utils/format.js';
import { getReadOnlyClient } from '../utils/config.js';

export async function infoCommand(): Promise<void> {
  const client = getReadOnlyClient();
  const addresses = client.addresses;

  header('Clicks Protocol v0.1.4');
  console.log('  Autonomous USDC yield for AI agents on Base.');
  console.log('  80% liquid. 20% earning. No lockup.');

  header('Contracts (Base Mainnet)');
  label('Registry', addresses.registry);
  label('Splitter', addresses.splitter);
  label('YieldRouter', addresses.yieldRouter);
  label('FeeCollector', addresses.feeCollector);
  label('USDC', addresses.usdc);

  header('Links');
  label('Website', 'https://clicksprotocol.xyz');
  label('Docs', 'https://clicksprotocol.xyz/docs');
  label('SDK', 'https://npmjs.com/package/@clicks-protocol/sdk');
  label('MCP Server', 'https://npmjs.com/package/@clicks-protocol/mcp-server');
  label('GitHub', 'https://github.com/clicks-protocol');
  label('llms.txt', 'https://clicksprotocol.xyz/llms.txt');
  label('agent.json', 'https://clicksprotocol.xyz/.well-known/agent.json');
  label('OpenAPI', 'https://clicksprotocol.xyz/api/openapi.json');
  console.log('');
}
