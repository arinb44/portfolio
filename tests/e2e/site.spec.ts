import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const GITHUB = 'https://github.com/arinb44';
const HEADER = ['#main', '/', '/projects/', '/about/', '/cv.pdf', 'mailto:you@example.com']; // skip link, name, nav
const SLUGS = ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'nightfall', 'falling-constellations']; // output/project-lineup
const PAGES = ['/', '/projects/', '/about/', ...SLUGS.map((s) => `/projects/${s}/`)];

/** hrefs of the elements focused by pressing Tab `count` times from the top of the page. */
async function tabOrder(page: Page, count: number) {
  const hrefs: string[] = [];
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
    hrefs.push(await page.evaluate(() => document.activeElement?.getAttribute('href') ?? document.activeElement?.tagName ?? ''));
  }
  return hrefs;
}

for (const path of [...PAGES, '/no-such-panel/']) {
  test(`${path}: one h1, alt on every image, no axe WCAG 2.2 AA violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(path === '/no-such-panel/' ? 404 : 200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
    await expect(page.locator('.altarpiece, .predella, .wing, .sfumato, .edge, .crackle')).toHaveCount(0); // the old design is gone
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

// Project pages whose info is real (output/project-info): no TODO or placeholder left in the text or any alt.
const FINISHED: string[] = ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'falling-constellations'];
for (const slug of FINISHED) {
  test(`/projects/${slug}/: no TODO or placeholder left`, async ({ page }) => {
    await page.goto(`/projects/${slug}/`);
    const alts = await page.locator('img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect([await page.locator('body').innerText(), ...alts].join('\n')).not.toMatch(/TODO|placeholder/i);
  });
}

// Nightfall plays its video in the hero (output/project-info/plan.md, Req 7): muted, looping, controls, a poster, captions.
test('/projects/nightfall/: hero video with poster, sources and captions', async ({ page, request }) => {
  await page.goto('/projects/nightfall/');
  const video = page.locator('.project-figure video');
  await expect(video).toHaveAttribute('poster', /.+/);
  for (const attr of ['controls', 'muted', 'loop', 'playsinline']) await expect(video).toHaveAttribute(attr, '');
  const srcs = await video.locator('source, track').evaluateAll((els) => els.map((e) => e.getAttribute('src')!));
  expect(srcs.map((s) => s.split('.').pop())).toEqual(['webm', 'mp4', 'vtt']);
  for (const src of srcs) expect((await request.get(src)).status(), src).toBe(200);
});

test('/projects/nightfall/: reduced motion keeps the video on its poster', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/nightfall/');
  await page.waitForTimeout(500);
  const video = page.locator('.project-figure video');
  expect(await video.evaluate((v: HTMLVideoElement) => [v.paused, v.currentTime])).toEqual([true, 0]);
});

test('every internal link resolves', async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      hrefs.add(href.split('#')[0]);
    }
  }
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
});

test('prev/next follow the project order and wrap', async ({ page }) => {
  await page.goto('/projects/nba-predictor/');
  await expect(page.locator('a[rel=prev]').first()).toHaveAttribute('href', '/projects/mlb-predictor/');
  await expect(page.locator('a[rel=next]').first()).toHaveAttribute('href', '/projects/nightfall/');
  await page.goto('/projects/falling-constellations/');
  await expect(page.locator('a[rel=next]').first()).toHaveAttribute('href', '/projects/nfl-predictor/');
});

test('project page tab order: result first, prev/next after the content', async ({ page }) => {
  await page.goto('/projects/nba-predictor/');
  expect(await tabOrder(page, 12)).toEqual([
    ...HEADER,
    'https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app', 'https://github.com/arinb44/MachineLearningNBA',
    '/projects/mlb-predictor/', '/projects/nightfall/', // prev, next
    GITHUB, '/about/#credits', // footer
  ]);
});

test('fonts: Gloock and Newsreader are preloaded; all three Atlas faces are in use', async ({ page }) => {
  await page.goto('/about/');
  const preloads = await page.locator('link[rel=preload][as=font]').evaluateAll((ls) => ls.map((l) => l.getAttribute('href')!));
  expect(preloads).toHaveLength(2);
  for (const href of preloads) expect((await page.request.get(href)).status()).toBe(200);
  expect(await page.evaluate(async () => {
    await Promise.all(['3rem Gloock', '1rem Newsreader', '1rem "IBM Plex Mono"'].map((f) => document.fonts.load(f)));
    return [document.fonts.check('3rem Gloock'), document.fonts.check('1rem Newsreader'), document.fonts.check('1rem "IBM Plex Mono"')];
  })).toEqual([true, true, true]);
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the project image shows', async ({ page }) => {
    await page.goto('/projects/nba-predictor/');
    await expect(page.locator('.project-figure img')).toBeVisible();
  });

  test('home → project → next project → Projects all work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /View project.*Tip-Off/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tip-Off');
    await page.getByRole('link', { name: 'Next: Nightfall' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nightfall');
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('table', { name: 'All projects' }).getByRole('row')).toHaveCount(6); // header + 5
  });
});

test.describe('at 320 px wide', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of PAGES) {
    test(`${path} has no sideways scroll`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
  }
});
