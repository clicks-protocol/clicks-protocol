#!/usr/bin/env tsx
/**
 * Puppeteer screenshot of a template at a fixed timeline position.
 * Fast iteration loop — no FFmpeg encoding.
 *
 * Usage:
 *   npx tsx snapshot.ts <template> '<json-data>' [--t <sec>] [--out <path>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;
const REPO_ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = resolve(PROJECT_ROOT, 'templates');
const SNAPSHOTS_DIR = resolve(REPO_ROOT, 'media/snapshots');

function usage(): never {
  console.error(
    'Usage: tsx snapshot.ts <template> \'<json-data>\' [--t <sec>] [--out <path>]',
  );
  process.exit(2);
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let t = 3.5; // hold frame (after intro, before outro)
  let out: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--t') t = Number(argv[++i]);
    else if (a === '--out') out = argv[++i];
    else positional.push(a);
  }
  if (positional.length !== 2) usage();
  const [template, jsonRaw] = positional;
  return { template, data: JSON.parse(jsonRaw) as Record<string, string>, t, out };
}

function substituteSlots(html: string, data: Record<string, string>): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return html.replace(
    /(<([A-Za-z][\w-]*)\b[^>]*\bdata-slot="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (_match, openTag, _tag, key, inner, closeTag) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        return `${openTag}${escape(data[key])}${closeTag}`;
      }
      return `${openTag}${inner}${closeTag}`;
    },
  );
}

async function main() {
  const { template, data, t, out } = parseArgs(process.argv.slice(2));

  const tplPath = resolve(TEMPLATES_DIR, `${template}.html`);
  if (!existsSync(tplPath)) {
    console.error(`Template not found: ${tplPath}`);
    process.exit(1);
  }
  const html = substituteSlots(readFileSync(tplPath, 'utf8'), data);
  const workFile = resolve(PROJECT_ROOT, '.snapshot.html');
  writeFileSync(workFile, html);

  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const outPath = out ? resolve(out) : resolve(SNAPSHOTS_DIR, `${template}-t${t}.png`);

  // Use the puppeteer-core that ships with hyperframes
  const puppeteer = await import('puppeteer-core');

  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  const executablePath = chromePaths.find(existsSync);
  if (!executablePath) throw new Error('No system Chrome/Chromium found');

  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(workFile).href, { waitUntil: 'networkidle0' });

  // Seek GSAP timeline to requested second
  await page.evaluate((sec: number) => {
    const tl = (globalThis as any).__timelines?.main;
    if (tl) {
      tl.pause();
      tl.seek(sec);
    }
  }, t);

  // Give fonts/images a tick to paint
  await new Promise((r) => setTimeout(r, 200));

  await page.screenshot({ path: outPath, type: 'png' });
  await browser.close();

  // Remove scratch file so lint doesn't flag multiple root compositions.
  try { unlinkSync(workFile); } catch { /* noop */ }

  console.log(`[snapshot] ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
