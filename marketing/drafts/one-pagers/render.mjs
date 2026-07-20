#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = resolve(__dirname, 'clicks-architecture-2026-04.html');
const OUT_PNG = resolve(__dirname, 'clicks-architecture-2026-04.png');
const OUT_PDF = resolve(__dirname, 'clicks-architecture-2026-04.pdf');

const PUPPETEER_PATH = resolve(
  __dirname,
  '../../../video-pipeline/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js',
);

const { default: puppeteer } = await import(pathToFileURL(PUPPETEER_PATH).href);

const chromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const executablePath = chromePaths.find(existsSync);
if (!executablePath) throw new Error('No system Chrome/Chromium found');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 200));

  await page.screenshot({ path: OUT_PNG, type: 'png', fullPage: false });
  console.log(`[render] PNG → ${OUT_PNG}`);

  await page.pdf({
    path: OUT_PDF,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1',
  });
  console.log(`[render] PDF → ${OUT_PDF}`);
} finally {
  await browser.close();
}
