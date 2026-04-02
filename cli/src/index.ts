#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { statusCommand } from './commands/status.js';
import { agentCommand } from './commands/agent.js';
import { simulateCommand } from './commands/simulate.js';
import { balanceCommand } from './commands/balance.js';
import { registerCommand } from './commands/register.js';
import { depositCommand } from './commands/deposit.js';
import { withdrawCommand } from './commands/withdraw.js';
import { yieldPctCommand } from './commands/yield-pct.js';
import { referralCommand } from './commands/referral.js';
import { infoCommand } from './commands/info.js';

const program = new Command();

program
  .name('clicks')
  .description('CLI for Clicks Protocol — autonomous DeFi yield for AI agents on Base')
  .version('0.1.0')
  .addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Check live yield rates')}
  $ clicks status

  ${chalk.gray('# Look up an agent')}
  $ clicks agent 0x1234...

  ${chalk.gray('# Simulate a 100 USDC payment')}
  $ clicks simulate 100

  ${chalk.gray('# Register an agent (needs CLICKS_PRIVATE_KEY)')}
  $ clicks register 0x1234...

  ${chalk.gray('# Deposit 100 USDC for an agent')}
  $ clicks deposit 100 --agent 0x1234...

${chalk.bold('Environment:')}
  ${chalk.gray('CLICKS_PRIVATE_KEY')}    Private key for write operations
  ${chalk.gray('CLICKS_RPC_URL')}       Base RPC URL (default: https://mainnet.base.org)

${chalk.bold('Links:')}
  ${chalk.gray('Website:')}    https://clicksprotocol.xyz
  ${chalk.gray('SDK:')}        npm install @clicks-protocol/sdk
  ${chalk.gray('MCP Server:')} npm install @clicks-protocol/mcp-server
  ${chalk.gray('llms.txt:')}   https://clicksprotocol.xyz/llms.txt
`);

// Read-only commands
program
  .command('status')
  .description('Show live yield rates and protocol stats')
  .action(statusCommand);

program
  .command('agent <address>')
  .description('Look up an agent’s on-chain status')
  .action(agentCommand);

program
  .command('simulate <amount>')
  .description('Simulate how a USDC payment would be split')
  .option('-a, --agent <address>', 'Agent address (default: generic)')
  .action(simulateCommand);

program
  .command('balance <address>')
  .description('Check USDC wallet balance + yield deposit')
  .action(balanceCommand);

program
  .command('referral <address>')
  .description('Show referral stats for an operator')
  .action(referralCommand);

program
  .command('info')
  .description('Show contract addresses and links')
  .action(infoCommand);

// Write commands (need private key)
program
  .command('register <address>')
  .description('Register an AI agent on-chain')
  .option('-r, --referrer <address>', 'Referrer address for referral program')
  .action(registerCommand);

program
  .command('deposit <amount>')
  .description('Deposit USDC for an agent (register + approve + split)')
  .requiredOption('-a, --agent <address>', 'Agent address')
  .option('-r, --referrer <address>', 'Referrer address for referral program')
  .action(depositCommand);

program
  .command('withdraw <address>')
  .description('Withdraw yield + principal for an agent')
  .option('-a, --amount <usdc>', 'Amount to withdraw (default: all)')
  .action(withdrawCommand);

program
  .command('yield-pct <percentage>')
  .description('Set custom yield split percentage (5–50)')
  .action(yieldPctCommand);

program.parse();
