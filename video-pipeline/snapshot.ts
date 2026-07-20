#!/usr/bin/env tsx
/**
 * Puppeteer screenshot of a template or HTML composition at one or more
 * timeline positions. Fast iteration loop — no FFmpeg encoding.
 *
 * Usage:
 *   npx tsx snapshot.ts <template> '<json-data>' [--t <sec>[,<sec>...]] [--out <path>]
 *   npx tsx snapshot.ts --html <path>             [--t <sec>[,<sec>...]] [--out <path>]
 *
 * --t accepts a single second, a comma-separated list, or repeated flags.
 * With multiple timestamps, --out is ignored; files land in the snapshots dir
 * as <basename>-t<sec>s.png.
 *
 * Template mode: slots in templates/<name>.html are filled from the JSON arg.
 * HTML mode: loads the file directly (no slot substitution), for compositions
 * that carry their own index.html + assets (e.g. x-carousel-agent-pov/).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;
const REPO_ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = resolve(PROJECT_ROOT, 'templates');
const SNAPSHOTS_DIR = resolve(REPO_ROOT, 'media/snapshots');

function usage(): never {
  console.error(
    'Usage:\n' +
      "  tsx snapshot.ts <template> '<json-data>' [--t <sec>[,<sec>...]] [--out <path>]\n" +
      '  tsx snapshot.ts --html <path>            [--t <sec>[,<sec>...]] [--out <path>]',
  );
  process.exit(2);
}

type Args =
  | { mode: 'template'; template: string; data: Record<string, string>; ts: number[]; out?: string }
  | { mode: 'html'; htmlPath: string; ts: number[]; out?: string };

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const ts: number[] = [];
  let out: string | undefined;
  let htmlPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--t') {
      const raw = argv[++i];
      if (raw === undefined) usage();
      for (const part of raw.split(',')) {
        const n = Number(part.trim());
        if (!Number.isFinite(n)) usage();
        ts.push(n);
      }
    } else if (a === '--out') {
      out = argv[++i];
    } else if (a === '--html') {
      htmlPath = argv[++i];
    } else {
      positional.push(a);
    }
  }
  if (ts.length === 0) ts.push(3.5); // default hold frame

  if (htmlPath) {
    if (positional.length !== 0) usage();
    return { mode: 'html', htmlPath: resolve(htmlPath), ts, out };
  }
  if (positional.length !== 2) usage();
  const [template, jsonRaw] = positional;
  return { mode: 'template', template, data: JSON.parse(jsonRaw) as Record<string, string>, ts, out };
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

function prepareSource(args: Args): { srcFile: string; outDir: string; stem: string; cleanup?: () => void } {
  if (args.mode === 'html') {
    if (!existsSync(args.htmlPath)) {
      console.error(`HTML not found: ${args.htmlPath}`);
      process.exit(1);
    }
    const outDir = resolve(dirname(args.htmlPath), 'snapshots');
    const stem = basename(args.htmlPath, '.html');
    return { srcFile: args.htmlPath, outDir, stem };
  }

  const tplPath = resolve(TEMPLATES_DIR, `${args.template}.html`);
  if (!existsSync(tplPath)) {
    console.error(`Template not found: ${tplPath}`);
    process.exit(1);
  }
  const html = substituteSlots(readFileSync(tplPath, 'utf8'), args.data);
  const workFile = resolve(PROJECT_ROOT, '.snapshot.html');
  writeFileSync(workFile, html);
  return {
    srcFile: workFile,
    outDir: SNAPSHOTS_DIR,
    stem: args.template,
    // Remove scratch file so lint doesn't flag multiple root compositions.
    cleanup: () => { try { unlinkSync(workFile); } catch { /* noop */ } },
  };
}

function resolveOutPath(outDir: string, stem: string, t: number, single: boolean, override?: string): string {
  if (override && single) return resolve(override);
  return resolve(outDir, `${stem}-t${t}.png`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { srcFile, outDir, stem, cleanup } = prepareSource(args);
  mkdirSync(outDir, { recursive: true });

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
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(srcFile).href, { waitUntil: 'networkidle0' });

    const single = args.ts.length === 1;
    for (const t of args.ts) {
      await page.evaluate((sec: number) => {
        const tl = (globalThis as any).__timelines?.main;
        if (tl) {
          tl.pause();
          tl.seek(sec);
        }
      }, t);
      // Give fonts/images a tick to paint
      await new Promise((r) => setTimeout(r, 200));

      const outPath = resolveOutPath(outDir, stem, t, single, args.out);
      await page.screenshot({ path: outPath, type: 'png' });
      console.log(`[snapshot] ${outPath}`);
    }
  } finally {
    await browser.close();
    cleanup?.();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
