// Measure the text boxes of a preview page for tools/contrast.py, in its element order.
// Run from the project root, with the fresco-prototypes server up:  node output/project-visuals/tools/boxes.cjs <preview url> <out json>
const { chromium } = require('playwright'), fs = require('fs');
const SEL = ['.card .count', '.card h3', '.card .line', '.card .meta', '.links a:nth-child(2)', '.links a:nth-child(3)', '.card .next',
             '.site h1', '.site .tagline', 'nav li:nth-child(1) a', 'nav li:nth-child(2) a', 'nav li:nth-child(3) a', 'nav li:nth-child(4) a'];
(async () => {
  const b = await chromium.launch({ channel: 'chromium' }), out = {};
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(process.argv[2]); await p.evaluate(() => document.fonts.ready);
    out[`${w}x${h}`] = await p.evaluate(s => s.map(q => { const r = document.querySelector(q).getBoundingClientRect(); return [Math.floor(r.left), Math.floor(r.top), Math.ceil(r.right), Math.ceil(r.bottom)]; }), SEL);
    await p.close();
  }
  await b.close(); fs.writeFileSync(process.argv[3], JSON.stringify(out)); console.log(JSON.stringify(out));
})();
