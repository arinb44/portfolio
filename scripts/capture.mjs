// Captures the real project images: screenshots of the live demos and of the diagrams in scripts/diagrams/.
// Usage: npm run capture -- <name> [<name> ...]   (no names: list them). Overwrites each output file.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// name -> { src: a URL or a file in scripts/diagrams/, out, size: [w, h] in CSS px, scale: device pixel ratio,
//           ready: selector to wait for, wait: extra ms, prep: async (page) => optional clip rect }.
// Each entry's comment says where the image comes from.
const NFL = 'https://arinb44.github.io/NFLGamePredictorModel/'; // Streamlit run in the browser (stlite): 10-30 s to load
const NBA = 'https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app/~/+/';
const FC = 'https://arinb44.github.io/Falling-Constellations/'; // WebGL2: needs the real-GPU launch flags below
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
  // The live MLB demo (Render free tier: wake it first, 30-60 s): the default matchup's prediction card.
  'mlb-hero': {
    src: 'https://mlb-game-predictor-sdt8.onrender.com', out: 'src/assets/projects/mlb-predictor/varnish.jpg', size: [1024, 640], scale: 1.5625,
    ready: '#tab-predict', wait: 1000,
    prep: async (page) => {
      await page.getByRole('button', { name: 'Predict', exact: true }).click();
      await page.locator('#matchup-card').waitFor({ timeout: 60_000 });
      await page.waitForTimeout(3000); // the card's calibrating animation
      await page.locator('#results').evaluate((r) => window.scrollTo(0, r.getBoundingClientRect().top + scrollY - 90));
      await page.waitForTimeout(500);
    },
  },
  // scripts/diagrams/mlb-predictor.html, from the repo README, config.yaml and render.yaml.
  'mlb-architecture': { src: 'mlb-predictor.html', out: 'src/assets/projects/mlb-predictor/underpainting.png', size: [1200, 800], wait: 500 },
  // The live NBA demo on Streamlit Community Cloud, without its wrapper (/~/+/). Wake it first if it has gone to sleep.
  'nba-hero': { src: NBA, out: 'src/assets/projects/nba-predictor/varnish.jpg', size: [1280, 800], scale: 1.25, ready: 'text=Daily slate', wait: 4000 },
  // The same demo: the "Any matchup" block (default teams), from its heading down to "Tale of the tape".
  'nba-matchup': {
    src: NBA, out: 'src/assets/projects/nba-predictor/paint-1.jpg', size: [1280, 900], scale: 2, ready: 'text=Any matchup', wait: 4000,
    prep: async (page) => {
      const head = page.getByRole('heading', { name: 'Any matchup' });
      await head.evaluate((h) => h.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(1500);
      const [a, b] = [await head.boundingBox(), await page.getByRole('heading', { name: 'Tale of the tape' }).boundingBox()];
      return { x: a.x - 24, y: a.y - 16, width: a.width + 48, height: b.y - a.y };
    },
  },
  // The live Falling Constellations page: one constellation summoned off-centre, then the sky left to draw in.
  'fc-hero': {
    src: FC, out: 'src/assets/projects/falling-constellations/varnish.jpg', size: [1280, 800], scale: 1.25, ready: '#gl', wait: 2000,
    prep: async (page) => { await page.mouse.click(330, 250); await page.waitForTimeout(9000); },
  },
  // The same page: a constellation summoned over the galaxy's core, close up.
  'fc-closeup': {
    src: FC, out: 'src/assets/projects/falling-constellations/paint-1.jpg', size: [1280, 800], scale: 2, ready: '#gl', wait: 2000,
    prep: async (page) => {
      await page.mouse.click(640, 380);
      await page.waitForTimeout(5000);
      return { x: 340, y: 180, width: 600, height: 400 };
    },
  },
  // The Canvas 2D prototype at Falling-Constellations commit 528f5d5. Serve that commit's files first:
  //   git archive 528f5d5 | tar -x -C <dir>;  python -m http.server 4417 --bind 127.0.0.1 --directory <dir>
  'fc-prototype': {
    src: 'http://127.0.0.1:4417/', out: 'src/assets/projects/falling-constellations/underdrawing-1.jpg', size: [1200, 800], ready: '#c', wait: 2000,
    prep: async (page) => { await page.mouse.click(420, 300); await page.waitForTimeout(8000); },
  },
  // scripts/diagrams/falling-constellations.html, from the repo's HANDOFF.md and src/.
  'fc-architecture': { src: 'falling-constellations.html', out: 'src/assets/projects/falling-constellations/underpainting.png', size: [1200, 800], wait: 500 },
  // scripts/diagrams/nba-predictor.html, from the repo README and workflows.
  'nba-architecture': { src: 'nba-predictor.html', out: 'src/assets/projects/nba-predictor/underpainting.png', size: [1200, 800], wait: 500 },
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
    await page.screenshot({ path: resolve(out), clip, quality: out.endsWith('.jpg') ? 85 : undefined });
    await page.close();
    console.log(`${n} -> ${out}`);
  }
} finally {
  await browser.close();
}
