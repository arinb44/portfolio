// Captures the real project images: screenshots of the live demos and of the diagrams in scripts/diagrams/.
// Usage: npm run capture -- <name> [<name> ...]   (no names: list them). Overwrites each output file.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// name -> { src: a URL or a file in scripts/diagrams/, out, size: [w, h], ready: selector to wait for, wait: extra ms }.
// Each entry's comment says where the image comes from.
const SHOTS = {};

const names = process.argv.slice(2);
if (!names.length) {
  console.log(Object.keys(SHOTS).join('\n') || '(no shots yet)');
  process.exit(0);
}
for (const n of names) if (!SHOTS[n]) throw new Error(`Unknown shot: ${n}`);

// The real GPU, as in playwright.config.ts: some demos draw with WebGL2.
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
try {
  for (const n of names) {
    const { src, out, size: [width, height], ready, wait = 0, timeout = 90_000 } = SHOTS[n];
    const page = await browser.newPage({ viewport: { width, height } });
    const url = /^https?:/.test(src) ? src : pathToFileURL(resolve('scripts/diagrams', src)).href;
    await page.goto(url, { waitUntil: 'load', timeout });
    if (ready) await page.locator(ready).first().waitFor({ timeout });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: resolve(out) });
    await page.close();
    console.log(`${n} -> ${out}`);
  }
} finally {
  await browser.close();
}
