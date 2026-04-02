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
export function formatProtocol(id: number): string {
  switch (id) {
    case 0: return 'None';
    case 1: return 'Aave V3';
    case 2: return 'Morpho';
    default: return `Unknown (${id})`;
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
