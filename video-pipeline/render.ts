#!/usr/bin/env tsx
/**
 * Render a Clicks stat/milestone/etc template to MP4.
 *
 * Reads templates/<name>.html, substitutes <elem data-slot="key">...</elem>
 * with values from the JSON argument, writes the result to ./index.html
 * (the active Hyperframes composition), then invokes `hyperframes render`.
 *
 * Usage:
 *   npx tsx render.ts <template> '<json-data>' [--out <path>]
 *
 * Example:
 *   npx tsx render.ts stat-card '{"stat":"227","label":"tests passing","subtext":"V4 + V5 suite"}'
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;                               // video-pipeline/
const REPO_ROOT = resolve(__dirname, '..');                   // clicks-protocol/
const TEMPLATES_DIR = resolve(PROJECT_ROOT, 'templates');
const RENDERS_DIR = resolve(REPO_ROOT, 'media/renders');
const LOG_FILE = resolve(PROJECT_ROOT, 'render-log.json');

function usage(): never {
  console.error(
    'Usage: tsx render.ts <template> \'<json-data>\' [--out <path>] [--strict] [--strict-all]\n' +
    'Example: tsx render.ts stat-card \'{"stat":"227","label":"tests passing"}\' --strict',
  );
  process.exit(2);
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let out: string | undefined;
  let strict = false;
  let strictAll = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out = argv[++i];
    else if (a === '--strict') strict = true;
    else if (a === '--strict-all') strictAll = true;
    else positional.push(a);
  }
  if (positional.length !== 2) usage();
  const [template, jsonRaw] = positional;
  let data: Record<string, string>;
  try {
    data = JSON.parse(jsonRaw);
  } catch (e) {
    console.error('Invalid JSON data:', (e as Error).message);
    process.exit(2);
  }
  return { template, data, out, strict, strictAll };
}

function substituteSlots(html: string, data: Record<string, string>): string {
  // Replace <ELEM ... data-slot="key" ...>CONTENT</ELEM> with the value for `key`.
  // Conservative: the value is HTML-escaped (we don't trust data to be safe markup).
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return html.replace(
    /(<([A-Za-z][\w-]*)\b[^>]*\bdata-slot="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (_match, openTag: string, _tag: string, key: string, _inner: string, closeTag: string) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        return `${openTag}${escape(data[key])}${closeTag}`;
      }
      return `${openTag}${_inner}${closeTag}`;
    },
  );
}

function buildSlug(template: string, data: Record<string, string>): string {
  const hash = createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 6);
  const date = new Date().toISOString().slice(0, 10);
  return `${template}-${date}-${hash}`;
}

function appendLog(entry: Record<string, unknown>) {
  let log: Record<string, unknown>[] = [];
  if (existsSync(LOG_FILE)) {
    try {
      log = JSON.parse(readFileSync(LOG_FILE, 'utf8'));
    } catch {
      // fall through; start fresh
    }
  }
  log.push(entry);
  writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + '\n');
}

function main() {
  const { template, data, out, strict, strictAll } = parseArgs(process.argv.slice(2));

  const tplPath = resolve(TEMPLATES_DIR, `${template}.html`);
  if (!existsSync(tplPath)) {
    console.error(`Template not found: ${tplPath}`);
    process.exit(1);
  }

  const html = readFileSync(tplPath, 'utf8');
  const rendered = substituteSlots(html, data);
  writeFileSync(resolve(PROJECT_ROOT, 'index.html'), rendered);

  // Pre-lint: catch schema issues before paying FFmpeg cost.
  console.log('[render] lint...');
  const lint = spawnSync(
    'npx',
    ['hyperframes', 'lint', '.'],
    { cwd: PROJECT_ROOT, stdio: 'inherit' },
  );
  if (lint.status !== 0) {
    console.error('[render] lint failed — refusing to render');
    process.exit(lint.status ?? 1);
  }

  mkdirSync(RENDERS_DIR, { recursive: true });
  const slug = buildSlug(template, data);
  const outPath = out ? resolve(out) : resolve(RENDERS_DIR, `${slug}.mp4`);

  const renderArgs = ['hyperframes', 'render', '.', '-o', outPath, '-q', 'standard', '-f', '30'];
  if (strictAll) renderArgs.push('--strict-all');
  else if (strict) renderArgs.push('--strict');

  console.log(`[render] template=${template} → ${outPath}`);
  const res = spawnSync('npx', renderArgs, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('[render] hyperframes render failed');
    process.exit(res.status ?? 1);
  }

  if (!existsSync(outPath)) {
    console.error(`[render] expected output missing: ${outPath}`);
    process.exit(1);
  }

  const size = statSync(outPath).size;
  appendLog({
    slug,
    template,
    data,
    output: outPath,
    bytes: size,
    rendered_at: new Date().toISOString(),
  });
  console.log(`[render] ok  bytes=${size}  log=${LOG_FILE}`);
  console.log(`\nQueue entry snippet:\n${JSON.stringify({ text: '<your tweet text>', media_path: outPath.replace(REPO_ROOT + '/', '') }, null, 2)}`);
}

main();
