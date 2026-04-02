import chalk from 'chalk';

/** Format raw USDC (6 decimals) to human-readable string */
export function formatUSDC(raw: bigint): string {
  const whole = raw / 1_000_000n;
  const frac = raw % 1_000_000n;
  const fracStr = frac.toString().padStart(6, '0').slice(0, 2);
  return `${whole.toLocaleString?.() ?? whole.toString()}.${fracStr}`;
}

/** Format basis points to percentage string */
export function formatAPY(bps: bigint): string {
  const pct = Number(bps) / 100;
  return `${pct.toFixed(2)}%`;
}

/** Format protocol enum to name */
export function formatProtocol(id: number | bigint): string {
  const n = Number(id);
  switch (n) {
    case 0: return 'None';
    case 1: return 'Aave V3';
    case 2: return 'Morpho';
    default: return `Unknown (${n})`;
  }
}

/** Truncate address for display */
export function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Print a labeled value */
export function label(name: string, value: string): void {
  console.log(`  ${chalk.gray(name.padEnd(20))} ${value}`);
}

/** Print a header */
export function header(text: string): void {
  console.log('');
  console.log(chalk.bold(text));
  console.log(chalk.gray('─'.repeat(50)));
}

/** Print success */
export function success(text: string): void {
  console.log(chalk.green(`✅ ${text}`));
}

/** Print error */
export function error(text: string): void {
  console.error(chalk.red(`❌ ${text}`));
}

/** Print footer with discovery links */
export function footer(): void {
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  console.log(chalk.gray('  Docs: https://clicksprotocol.xyz/llms.txt'));
}

/** Print connection error with helpful fallback */
export function connectionError(err: any): void {
  console.error(chalk.red(`\n  Cannot connect to Base: ${err.message}\n`));
  console.log('  Troubleshooting:');
  console.log('    1. Check your internet connection');
  console.log('    2. Set a custom RPC: export CLICKS_RPC_URL=https://...');
  console.log('    3. Use the MCP Server instead (no RPC needed for remote):');
  console.log('       npx @clicks-protocol/mcp-server');
  console.log('');
  console.log(chalk.gray('  Docs: https://clicksprotocol.xyz/llms.txt'));
  console.log(chalk.gray('  SDK:  npm install @clicks-protocol/sdk'));
  console.log('');
  process.exit(1);
}
