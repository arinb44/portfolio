import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const GITHUB = 'https://github.com/arinb44';
const HEADER = ['#main', '/', '/projects/', '/about/', '/cv.pdf', 'mailto:barmanar@umich.edu']; // skip link, name, nav
const SLUGS = ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'nightfall', 'falling-constellations']; // output/project-lineup
const PAGES = ['/', '/projects/', '/about/', ...SLUGS.map((s) => `/projects/${s}/`)];

const axe = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

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

// Pages whose info is real (output/project-info): no TODO or placeholder left in the text or any alt.
const FINISHED: string[] = ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'falling-constellations', 'nightfall'];
for (const path of ['/', '/projects/', '/about/', ...FINISHED.map((s) => `/projects/${s}/`)]) {
  test(`${path}: no TODO or placeholder left`, async ({ page }) => {
    await page.goto(path);
    const alts = await page.locator('img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect([await page.locator('body').innerText(), ...alts].join('\n')).not.toMatch(/TODO|placeholder|\[Your|you@example/i);
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
  expect(await tabOrder(page, 16)).toEqual([
    ...HEADER,
    'https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app', 'https://github.com/arinb44/MachineLearningNBA',
    '#overview', '#key-features', '#architecture', '#origins', // on this page
    '/projects/mlb-predictor/', '/projects/nightfall/', // prev, next
    GITHUB, '/about/#credits', // footer
  ]);
});

// Wide screens share one plate stage; the step clicked or scrolled to shows its plate and takes the gold (plan Part 2, M9).
test('wide project page: the on-page index swaps the one visible plate', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/nfl-predictor/');
  const visible = () => page.locator('.leaf > .plate').evaluateAll((ps) => ps.map((p) => getComputedStyle(p).visibility === 'visible'));
  const steps = page.getByRole('navigation', { name: 'On this page' });
  expect(await visible()).toEqual([true, false, false, false]);
  for (const [i, name] of ['Finished work', 'Key features', 'Architecture', 'Origins'].entries()) {
    await steps.getByRole('link', { name }).click();
    await expect(steps.getByRole('link', { name })).toHaveAttribute('aria-current', 'location');
    await expect.poll(visible).toEqual([0, 1, 2, 3].map((j) => j === i));
  }
  expect(await axe(page)).toEqual([]);
});

test('narrow project page: every plate shows, above its own text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/nfl-predictor/');
  await expect(page.locator('.folio')).not.toHaveClass(/is-staged/);
  const order = await page.locator('.leaf').evaluateAll((ls) => ls.map((l) => l.querySelector('.plate')!.getBoundingClientRect().top < l.querySelector('.rail')!.getBoundingClientRect().top));
  expect(order).toEqual([true, true, true, true]);
});

// The project title is sized from its longest word (output/project-info plan Part 2, Req 16): no word may wrap or overflow.
for (const width of [320, 390, 1280, 1440]) {
  test(`project titles never break inside a word at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const slug of SLUGS) {
      await page.goto(`/projects/${slug}/`);
      await page.evaluate(() => document.fonts.ready);
      const h1 = page.locator('h1');
      expect(await h1.evaluate((h) => h.scrollWidth <= h.clientWidth), slug).toBe(true);
      const lines = await h1.locator('span').evaluateAll((spans) => spans.map((s) => s.getClientRects().length));
      expect(lines.every((n) => n === 1), `${slug}: ${lines}`).toBe(true);
    }
  });
}

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
    await expect(page.getByRole('list', { name: 'All projects' }).getByRole('listitem')).toHaveCount(5);
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
