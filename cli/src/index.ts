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
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('clicks')
  .description('Autonomous DeFi yield for AI agents on Base. 80% liquid. 20% earning. No lockup.')
  .version('0.2.0')
  .addHelpText('after', `

${chalk.bold('Quick Start:')}
  $ clicks status              ${chalk.gray('# Live yield rates')}
  $ clicks simulate 100        ${chalk.gray('# Preview 100 USDC payment split')}
  $ clicks agent 0x1234...     ${chalk.gray('# Look up an agent')}
  $ clicks doctor              ${chalk.gray('# Check your setup')}

${chalk.bold('Write Operations (need CLICKS_PRIVATE_KEY):')}
  $ clicks register 0x1234...                   ${chalk.gray('# Register agent')}
  $ clicks deposit 100 --agent 0x1234...        ${chalk.gray('# Deposit USDC')}
  $ clicks withdraw 0x1234...                   ${chalk.gray('# Withdraw yield')}

${chalk.bold('Environment:')}
  CLICKS_PRIVATE_KEY    ${chalk.gray('Private key for write operations')}
  CLICKS_RPC_URL        ${chalk.gray('Base RPC (default: https://mainnet.base.org)')}

${chalk.bold('Ecosystem:')}
  Website:    ${chalk.cyan('https://clicksprotocol.xyz')}
  SDK:        ${chalk.cyan('npm install @clicks-protocol/sdk')}
  MCP Server: ${chalk.cyan('npm install @clicks-protocol/mcp-server')}
  llms.txt:   ${chalk.cyan('https://clicksprotocol.xyz/llms.txt')}
  agent.json: ${chalk.cyan('https://clicksprotocol.xyz/.well-known/agent.json')}
  OpenAPI:    ${chalk.cyan('https://clicksprotocol.xyz/api/openapi.json')}
  GitHub:     ${chalk.cyan('https://github.com/clicks-protocol')}
`);

// Read-only commands
program
  .command('status')
  .description('Show live yield rates and protocol stats')
  .option('--json', 'Output as JSON (agent-friendly)')
  .action(statusCommand);

program
  .command('agent <address>')
  .description('Look up an agent\'s on-chain status')
  .option('--json', 'Output as JSON (agent-friendly)')
  .action(agentCommand);

program
  .command('simulate <amount>')
  .description('Simulate how a USDC payment would be split')
  .option('-a, --agent <address>', 'Agent address (default: generic)')
  .option('--json', 'Output as JSON (agent-friendly)')
  .action(simulateCommand);

program
  .command('balance <address>')
  .description('Check USDC wallet balance + yield deposit')
  .option('--json', 'Output as JSON (agent-friendly)')
  .action(balanceCommand);

program
  .command('referral <address>')
  .description('Show referral stats for an operator')
  .option('--json', 'Output as JSON (agent-friendly)')
  .action(referralCommand);

program
  .command('info')
  .description('Show contract addresses, links, and discovery endpoints')
  .action(infoCommand);

program
  .command('doctor')
  .description('Check your setup and show next steps')
  .action(doctorCommand);

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
  .description('Set custom yield split percentage (5\u201350)')
  .action(yieldPctCommand);

program.parse();
