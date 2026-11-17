// Record the public Falling Constellations page for M4a (decision #33).
// Run from the project root:  node output/project-visuals/tools/fc_record.cjs
// Writes art-src/project-visuals/fc/fc-raw.webm (1600 x 900, ~24 s; Playwright's own recorder, about 25 fps VP8).
// Clicks summon constellations on the right of the frame, clear of the home page's card.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = 'art-src/project-visuals/fc';
(async () => {
  const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=d3d11', '--enable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, recordVideo: { dir: DIR, size: { width: 1600, height: 900 } } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('https://arinb44.github.io/Falling-Constellations/', { waitUntil: 'load' });
  await page.addStyleTag({ content: '#hint{display:none!important} *{cursor:none!important}' });
  const clicks = [[4000, 1050, 330], [8000, 1300, 520], [12000, 900, 250], [16000, 1200, 420], [20000, 1000, 560]];
  let t = 0;
  for (const [at, x, y] of clicks) { await page.waitForTimeout(at - t); t = at; await page.mouse.click(x, y); }
  await page.waitForTimeout(24000 - t);
  const gpu = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'none'; });
  const video = page.video(); await ctx.close(); await browser.close();
  fs.renameSync(await video.path(), path.join(DIR, 'fc-raw.webm'));
  console.log(JSON.stringify({ gpu, errors }, null, 2));
})();
