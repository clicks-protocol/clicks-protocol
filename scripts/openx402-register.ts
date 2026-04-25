#!/usr/bin/env tsx
/**
 * openx402-register.ts
 *
 * Stub for registering Clicks (or a designated wallet) with the OpenX402
 * facilitator at https://openx402.ai/api/register.
 *
 * Strategy: see `strategy/OPENX402-REGISTRATION.md`.
 *
 * SPEC IS NOT YET KNOWN. Body fields below are placeholders. The script is
 * dry-run-by-default; --execute requires David go AND the actual field schema
 * (which we ask Conway for in Phase 2).
 *
 * Usage:
 *   npx tsx scripts/openx402-register.ts                 # dry-run (default)
 *   npx tsx scripts/openx402-register.ts --execute       # actually POST
 *   npx tsx scripts/openx402-register.ts --address 0x... --service-url https://clicksprotocol.xyz
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://openx402.ai/api/register';

interface Args {
  address: string;
  serviceUrl: string;
  network: string;
  execute: boolean;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {
    address: '',
    serviceUrl: 'https://clicksprotocol.xyz',
    network: 'base',
    execute: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--address') out.address = argv[++i];
    else if (a === '--service-url') out.serviceUrl = argv[++i];
    else if (a === '--network') out.network = argv[++i];
    else if (a === '--execute') out.execute = true;
  }
  if (!out.address) {
    console.error('Usage: openx402-register.ts --address 0x... [--service-url URL] [--network base] [--execute]');
    console.error('  Recommend: a dedicated facilitator-signer wallet, NOT the Operator Wallet.');
    process.exit(2);
  }
  return out as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // PLACEHOLDER body — actual schema unknown.
  // To fill in once Conway responds with spec.
  const body = {
    address: args.address,
    serviceUrl: args.serviceUrl,
    network: args.network,
    // TODO: add signature, timestamp, scheme, supported endpoints, ...
    //       once OpenX402 publishes their spec.
  };

  console.log('=== OpenX402 Facilitator Registration ===');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Mode:     ${args.execute ? 'EXECUTE' : 'DRY-RUN'}`);
  console.log(`Body:     ${JSON.stringify(body, null, 2)}`);
  console.log('');

  if (!args.execute) {
    console.log('Dry-run only. Equivalent curl:');
    console.log('');
    console.log(`  curl -X POST '${ENDPOINT}' \\`);
    console.log(`    -H 'Content-Type: application/json' \\`);
    console.log(`    -d '${JSON.stringify(body)}'`);
    console.log('');
    console.log('To actually POST, re-run with --execute.');
    console.log('REMINDER: spec is not yet confirmed. Empty bodies return');
    console.log('  {"error":"Missing required fields"}');
    console.log('Get the field schema from Conway first:');
    console.log('  https://x.com/openx402  ·  root@conway.tech');
    return;
  }

  // EXECUTE branch
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log(`Body:   ${text}`);

  if (!res.ok) {
    console.error('\nRegistration FAILED. Likely cause: incomplete body. Update the script with the missing fields.');
    process.exit(3);
  }

  console.log('\n[ok] Registered. Persist the response in STATUS.md.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
