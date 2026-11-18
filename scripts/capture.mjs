// Captures the real project images: screenshots of the live demos and of the diagrams in scripts/diagrams/.
// Usage: npm run capture -- <name> [<name> ...]   (no names: list them). Overwrites each output file.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// name -> { src: a URL or a file in scripts/diagrams/, out, size: [w, h] in CSS px, scale: device pixel ratio,
//           ready: selector to wait for, wait: extra ms, prep: async (page) => optional clip rect }.
// Each entry's comment says where the image comes from.
const NFL = 'https://arinb44.github.io/NFLGamePredictorModel/'; // Streamlit run in the browser (stlite): 10-30 s to load
const SHOTS = {
  // The live dashboard's This Week view: game cards with model vs Vegas.
  'nfl-hero': { src: NFL, out: 'src/assets/projects/nfl-predictor/varnish.png', size: [1280, 800], scale: 1.25, ready: 'text=Full breakdown', wait: 3000 },
  // The live dashboard: the first game's "Full breakdown", a waterfall from 50% to the model's probability.
  'nfl-waterfall': {
    src: NFL, out: 'src/assets/projects/nfl-predictor/paint-1.png', size: [1280, 900], scale: 2, ready: 'text=Full breakdown', wait: 2000,
    prep: async (page) => {
      await page.getByText('Full breakdown', { exact: true }).first().click();
      const head = page.getByRole('heading', { name: 'How the prediction is built' });
      const chart = page.locator('[data-testid="stVegaLiteChart"]').first();
      await chart.waitFor({ timeout: 60_000 });
      await head.evaluate((h) => h.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(1500);
      const [a, b] = [await head.boundingBox(), await chart.boundingBox()];
      // Ends above the chart's own toolbar (bottom right).
      return { x: a.x - 24, y: a.y - 16, width: b.width + 48, height: b.y + b.height - a.y - 12 };
    },
  },
  // scripts/diagrams/nfl-predictor.html, from the repo README.
  'nfl-architecture': { src: 'nfl-predictor.html', out: 'src/assets/projects/nfl-predictor/underpainting.png', size: [1200, 800], wait: 500 },
};

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
    const { src, out, size: [width, height], scale = 1, ready, wait = 0, prep, timeout = 90_000 } = SHOTS[n];
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
    const url = /^https?:/.test(src) ? src : pathToFileURL(resolve('scripts/diagrams', src)).href;
    await page.goto(url, { waitUntil: 'load', timeout });
    if (ready) await page.locator(ready).first().waitFor({ timeout });
    await page.waitForTimeout(wait);
    const clip = prep ? await prep(page) : undefined;
    await page.screenshot({ path: resolve(out), clip });
    await page.close();
    console.log(`${n} -> ${out}`);
  }
} finally {
  await browser.close();
}
