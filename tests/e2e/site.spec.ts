import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const GITHUB = 'https://github.com/arinb44';
const SLUGS = ['nfl-predictor', 'nba-predictor', 'mlb-predictor', 'hearth', 'juno', 'nightfall', 'falling-constellations']; // spec 3.2
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
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

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

test('predella lists all 7 projects in order, the series grouped, the featured one marked', async ({ page }) => {
  await page.goto('/');
  const predella = page.getByRole('navigation', { name: 'Projects' });
  expect(await predella.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(SLUGS.map((s) => `/projects/${s}/`));
  await expect(predella.getByRole('list', { name: 'Prediction series' }).getByRole('link')).toHaveCount(3);
  await expect(predella.getByRole('link', { name: 'Falling Constellations (featured)' })).toBeVisible();
});

test('desktop first screen shows all 7 project titles (spec 2.1 step 3, 2.2 step 2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const link of await page.getByRole('navigation', { name: 'Projects' }).getByRole('link').all()) {
    await expect(link).toBeInViewport({ ratio: 1 });
  }
});

test('prev/next follow the spec order and wrap', async ({ page }) => {
  await page.goto('/projects/nba-predictor/');
  await expect(page.locator('a[rel=prev]').first()).toHaveAttribute('href', '/projects/nfl-predictor/');
  await expect(page.locator('a[rel=next]').first()).toHaveAttribute('href', '/projects/mlb-predictor/');
  await page.goto('/projects/falling-constellations/');
  await expect(page.locator('a[rel=next]').first()).toHaveAttribute('href', '/projects/nfl-predictor/');
});

test('home tab order matches spec 8.1', async ({ page }) => {
  await page.goto('/');
  const fc = 'https://github.com/arinb44/Falling-Constellations';
  expect(await tabOrder(page, 19)).toEqual([
    '#main', '/', '/projects/', '/about/', GITHUB, // skip link, header
    '/about/', // About: Read more
    '/projects/falling-constellations/', 'https://arinb44.github.io/Falling-Constellations/', fc, // featured
    'mailto:you@example.com', GITHUB, '/cv.pdf', // contact
    ...SLUGS.map((s) => `/projects/${s}/`), // predella
  ]);
});

test('project page tab order: result first, prev/next after the content', async ({ page }) => {
  await page.goto('/projects/nba-predictor/');
  expect(await tabOrder(page, 12)).toEqual([
    '#main', '/', '/projects/', '/about/', GITHUB,
    'https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app', 'https://github.com/arinb44/MachineLearningNBA',
    '/projects/nfl-predictor/', '/projects/mlb-predictor/', // edge wings
    '/projects/nfl-predictor/', '/projects/mlb-predictor/', // bottom bar
    '/about/#credits',
  ]);
});

test('fonts: EB Garamond is preloaded and in use', async ({ page }) => {
  await page.goto('/');
  const preload = await page.locator('link[rel=preload][as=font]').getAttribute('href');
  expect((await page.request.get(preload!)).status()).toBe(200);
  expect(await page.evaluate(async () => (await document.fonts.ready, document.fonts.check('1rem "EB Garamond"')))).toBe(true);
});

test('M13 sfumato: the project hero ends fully opaque once loaded', async ({ page }) => {
  await page.goto('/projects/nba-predictor/');
  const hero = page.locator('.project-varnish img');
  await expect(hero).toHaveClass(/loaded/);
  await expect(hero).toHaveCSS('opacity', '1');
});

test('M4 glint: a scene lifts 4 px; under reduced motion only the sheen shows', async ({ page }) => {
  await page.goto('/');
  const scene = page.locator('.scene').first();
  const sheen = () => scene.locator('.scene-art').evaluate((el) => getComputedStyle(el, '::before').opacity);
  await scene.hover();
  await expect(scene).toHaveCSS('translate', '0px -4px');
  await expect.poll(sheen).toBe('1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(0, 0);
  await scene.hover();
  await expect(scene).toHaveCSS('translate', 'none');
  await expect.poll(sheen).toBe('1');
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('large images show at once (no fade waiting on JS)', async ({ page }) => {
    await page.goto('/projects/nba-predictor/');
    await expect(page.locator('.project-varnish img')).toHaveCSS('opacity', '1');
  });

  test('home → project → next project → Index all work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'NBA Game Predictor' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('NBA Game Predictor');
    await page.getByRole('link', { name: 'Next: MLB Game Predictor' }).last().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('MLB Game Predictor');
    await page.getByRole('link', { name: 'Index', exact: true }).click();
    await expect(page.getByRole('table', { name: 'All projects' }).getByRole('row')).toHaveCount(8); // header + 7
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
