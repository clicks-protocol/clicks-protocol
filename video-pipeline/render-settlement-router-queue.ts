#!/usr/bin/env tsx

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;
const REPO_ROOT = resolve(PROJECT_ROOT, '..');
const TEMPLATE_PATH = resolve(PROJECT_ROOT, 'templates', 'settlement-queue-card.html');
const INDEX_PATH = resolve(PROJECT_ROOT, 'index.html');
const QUEUE_PATH = resolve(REPO_ROOT, 'x-pipeline', 'queue.json');
const OUTPUT_DIR = resolve(REPO_ROOT, 'media', 'renders', 'settlement-router-queue');

type QueueEntry = {
  text: string;
  reply_text?: string;
  media_path?: string;
};

type VisualSpec = {
  eyebrow: string;
  headline: string;
  line1: string;
  line2: string;
  line3: string;
  footer_left: string;
  footer_right: string;
};

const SPECS: VisualSpec[] = [
  {
    eyebrow: 'payments to settlement',
    headline: 'Payments solved. <span>Settlement not.</span>',
    line1: 'Keep working capital liquid.',
    line2: 'Route the idle slice into yield.',
    line3: 'Do both without breaking spendability.',
    footer_left: '80 liquid · 20 yield',
    footer_right: 'clicksprotocol.xyz',
  },
  {
    eyebrow: 'missing primitive',
    headline: 'Payment rail is step one. <span>Settlement is step two.</span>',
    line1: 'Receiving money is not treasury logic.',
    line2: 'Capital efficiency starts after payment.',
    line3: 'That is where agent infra still breaks.',
    footer_left: 'rail → policy → efficiency',
    footer_right: 'docs + sdk + mcp',
  },
  {
    eyebrow: 'between transactions',
    headline: 'The real problem lives <span>between payments.</span>',
    line1: 'Idle USDC sits there waiting.',
    line2: 'Treasury policy decides what works.',
    line3: 'Routing is where the edge appears.',
    footer_left: 'idle capital matters',
    footer_right: 'treasury lab',
  },
  {
    eyebrow: 'what clicks is not',
    headline: 'Not a vault. <span>Not a stablecoin.</span>',
    line1: 'No extra chain to babysit.',
    line2: 'No five-bridge circus.',
    line3: 'Just Base USDC routed into ops plus yield.',
    footer_left: 'same asset · same chain',
    footer_right: 'base usdc only',
  },
  {
    eyebrow: 'stack design',
    headline: 'Identity. Ingress. <span>Settlement. Withdrawal.</span>',
    line1: 'Miss one and the stack is half-built.',
    line2: 'Agents need all four working together.',
    line3: 'Treasury without exit paths is fake infra.',
    footer_left: 'erc-8004 included',
    footer_right: 'full treasury stack',
  },
  {
    eyebrow: 'default split',
    headline: '80 or 20 is not a meme. <span>It is policy.</span>',
    line1: 'Keep enough USDC for the next call.',
    line2: 'Route only the idle slice to earn.',
    line3: 'Tune it to actual transaction cadence.',
    footer_left: '5% to 50% configurable',
    footer_right: 'operator controls',
  },
  {
    eyebrow: 'boring infra wins',
    headline: 'Receive. Hold. Route. <span>Withdraw.</span>',
    line1: 'That boring layer compounds.',
    line2: 'Speculation is not the core primitive.',
    line3: 'Operational treasury is.',
    footer_left: 'mcp for treasury ops',
    footer_right: 'not a trading bot',
  },
  {
    eyebrow: 'base thesis',
    headline: 'Payment rails are here. <span>Treasury logic is next.</span>',
    line1: 'What stays liquid?',
    line2: 'What can earn?',
    line3: 'Who keeps the rule set programmable?',
    footer_left: 'policy legible onchain',
    footer_right: 'registry · splitter · router',
  },
  {
    eyebrow: 'identity plus treasury',
    headline: 'Identity without treasury is incomplete. <span>Treasury without identity is fragile.</span>',
    line1: 'Agents that earn onchain need reputation too.',
    line2: 'Settlement and reputation reinforce each other.',
    line3: 'That stack gets stronger when both are native.',
    footer_left: 'agentId 45074 live',
    footer_right: 'base + erc-8004',
  },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applySlots(template: string, spec: VisualSpec): string {
  return template.replace(
    /(<([A-Za-z][\w-]*)\b[^>]*\bdata-slot="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (_match, openTag: string, _tag: string, key: string, _inner: string, closeTag: string) => {
      const raw = spec[key as keyof VisualSpec];
      if (typeof raw !== 'string') return `${openTag}${_inner}${closeTag}`;
      const value = key === 'headline' ? raw : escapeHtml(raw);
      return `${openTag}${value}${closeTag}`;
    },
  );
}

function runOrThrow(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with ${result.status ?? 'unknown status'}`);
  }
}

function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error(`Missing template: ${TEMPLATE_PATH}`);
  }
  if (!existsSync(QUEUE_PATH)) {
    throw new Error(`Missing queue: ${QUEUE_PATH}`);
  }

  const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) as QueueEntry[];
  if (queue.length < SPECS.length) {
    throw new Error(`Queue has ${queue.length} entries, expected at least ${SPECS.length}`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const template = readFileSync(TEMPLATE_PATH, 'utf8');

  for (let index = 0; index < SPECS.length; index += 1) {
    const spec = SPECS[index];
    const outputPath = resolve(OUTPUT_DIR, `tweet-${String(index + 1).padStart(2, '0')}.mp4`);
    const rendered = applySlots(template, spec);
    writeFileSync(INDEX_PATH, rendered);

    runOrThrow('npx', ['hyperframes', 'lint', '.'], PROJECT_ROOT);
    runOrThrow('npx', ['hyperframes', 'render', '.', '-o', outputPath, '-q', 'standard', '-f', '30'], PROJECT_ROOT);

    const bytes = statSync(outputPath).size;
    if (bytes <= 0) {
      throw new Error(`Render output is empty: ${outputPath}`);
    }

    queue[index].media_path = outputPath.replace(`${REPO_ROOT}/`, '');
  }

  writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`);
  console.log(`Rendered ${SPECS.length} queue assets into ${OUTPUT_DIR}`);
}

main();
