import chalk from 'chalk';
import { getRpcUrl } from '../utils/config.js';
import { header } from '../utils/format.js';

export async function doctorCommand(): Promise<void> {
  header('Clicks Protocol — Doctor');
  console.log('');

  let issues = 0;

  // Check 1: CLI installed
  console.log(chalk.green('  ✅ CLI installed (@clicks-protocol/cli)'));

  // Check 2: Private key
  const hasKey = !!process.env.CLICKS_PRIVATE_KEY;
  if (hasKey) {
    console.log(chalk.green('  ✅ CLICKS_PRIVATE_KEY is set'));
  } else {
    console.log(chalk.yellow('  ⚠️  CLICKS_PRIVATE_KEY not set (needed for write operations)'));
    issues++;
  }

  // Check 3: Custom RPC
  const rpc = getRpcUrl();
  const isDefaultRpc = rpc === 'https://mainnet.base.org';
  if (isDefaultRpc) {
    console.log(chalk.yellow('  ⚠️  Using default Base RPC (may be slow)'));
    issues++;
  } else {
    console.log(chalk.green(`  ✅ Custom RPC: ${rpc.slice(0, 40)}...`));
  }

  // Check 4: RPC connectivity
  try {
    const { JsonRpcProvider } = await import('ethers');
    const provider = new JsonRpcProvider(rpc);
    const blockNumber = await provider.getBlockNumber();
    console.log(chalk.green(`  ✅ Base connection OK (block ${blockNumber})`));
  } catch {
    console.log(chalk.red('  ❌ Cannot connect to Base RPC'));
    issues++;
  }

  // Summary
  console.log('');
  if (issues === 0) {
    console.log(chalk.green('  All checks passed. Ready to use.'));
  } else {
    console.log(chalk.yellow(`  ${issues} issue${issues > 1 ? 's' : ''} found.`));
  }

  // Next steps
  console.log('');
  console.log(chalk.bold('  Next Steps:'));
  if (!hasKey) {
    console.log('    1. export CLICKS_PRIVATE_KEY=0xYourPrivateKey');
    console.log('    2. clicks register 0xYourAgentAddress');
    console.log('    3. clicks deposit 100 --agent 0xYourAgentAddress');
  } else {
    console.log('    clicks status        # Check live yield rates');
    console.log('    clicks simulate 100  # Preview a payment split');
    console.log('    clicks info          # View all contract addresses');
  }

  console.log('');
  console.log(chalk.bold('  Ecosystem:'));
  console.log('    SDK:        npm install @clicks-protocol/sdk');
  console.log('    MCP Server: npm install @clicks-protocol/mcp-server');
  console.log('    Docs:       https://clicksprotocol.xyz/llms.txt');
  console.log('    agent.json: https://clicksprotocol.xyz/.well-known/agent.json');
  console.log('    OpenAPI:    https://clicksprotocol.xyz/api/openapi.json');
  console.log('');
}
