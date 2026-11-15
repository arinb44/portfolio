import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Featured first, then `order` (design decision #3).
const SLUGS = ['falling-constellations', 'nfl-predictor', 'nba-predictor', 'mlb-predictor', 'hearth', 'juno', 'nightfall'];
const html = 'html';
// Headless Chromium draws the scene in software, so the quick assembly can take a few seconds.
const REVEAL = { timeout: 30_000 };

const axe = async (page: import('@playwright/test').Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

test('arrival: name, nav, ring and caption show; the projects wait for the reveal', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link')).toHaveText(['Projects', 'About', 'CV', 'Email']);
  await expect(page.locator('.hint .caption')).toHaveText('Bring your cursor to the circle');
  await expect(page.locator(html)).not.toHaveClass(/revealed/);
  await expect(page.locator('.stops')).toBeHidden();
  expect(await axe(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('the 7 stops come from the content collection, featured first, with working links', async ({ page, request }) => {
  await page.goto('/');
  const stops = page.locator('.stop');
  expect(await stops.evaluateAll((els) => els.map((el) => el.id))).toEqual(SLUGS);
  await expect(stops.first().locator('.count')).toHaveText('01 / 07 · Featured');
  await expect(stops.last().locator('.count')).toHaveText('07 / 07');
  const hrefs = await page.locator('a.primary').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs).toEqual(SLUGS.map((s) => `/projects/${s}/`));
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
});

test('keyboard: the first Tab stop skips to the projects and focuses the featured one', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to the projects');
  await page.keyboard.press('Enter');
  await expect(page.locator(html)).toHaveClass(/revealed/, REVEAL);
  await expect(page.locator(':focus')).toHaveAttribute('href', '/projects/falling-constellations/');
  await expect(page.locator('.stops')).toBeVisible();
  await expect(page.locator('.stops')).toHaveCSS('opacity', '1'); // the fade-in has finished, so axe measures the real colours
  expect(await axe(page)).toEqual([]);
});

test('the nav\'s Projects link reveals too', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, REVEAL);
});

test('Falling Constellations plays behind its own stop at 50%, and only there', async ({ page }) => {
  await page.goto('/');
  const frame = page.locator('iframe.backdrop');
  await expect(frame).not.toHaveAttribute('src', /.+/); // not loaded during the assembly
  await page.getByRole('link', { name: 'Skip to the projects' }).click();
  await expect(page.locator(html)).toHaveClass(/backdrop-on/, REVEAL);
  await expect(frame).toHaveAttribute('src', 'https://arinb44.github.io/Falling-Constellations/');
  await expect(frame).toHaveCSS('opacity', '0.5');
  await expect(frame).toHaveCSS('pointer-events', 'none');
  // The frame is centred on God's fingertip (left of centre, mid-height) and still covers the whole screen.
  const box = (await frame.boundingBox())!, { width, height } = page.viewportSize()!;
  expect(box.x).toBeLessThanOrEqual(0); expect(box.y).toBeLessThanOrEqual(0);
  expect(box.x + box.width).toBeGreaterThanOrEqual(width); expect(box.y + box.height).toBeGreaterThanOrEqual(height);
  const cx = (box.x + box.width / 2) / width, cy = (box.y + box.height / 2) / height;
  expect(cx).toBeGreaterThan(0.3); expect(cx).toBeLessThan(0.45);
  expect(cy).toBeGreaterThan(0.4); expect(cy).toBeLessThan(0.6);
  await page.locator('#nfl-predictor').scrollIntoViewIfNeeded();
  await expect(page.locator(html)).not.toHaveClass(/backdrop-on/);
  await expect(frame).toHaveCSS('opacity', '0');
  expect(await axe(page)).toEqual([]);
});

test('reduced motion: revealed at load', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/, REVEAL);
  await expect(page.getByRole('heading', { level: 3, name: 'Falling Constellations' })).toBeVisible();
  await expect(page.locator(html)).not.toHaveClass(/backdrop-on/); // the live piece is motion: left off
});

test('no WebGL2: the still painting with the revealed layout', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return type === 'webgl2' ? null : (get as Function).call(this, type, ...rest);
    } as typeof get;
  });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/static/);
  await expect(page.locator(html)).toHaveClass(/revealed/);
  await expect(page.getByAltText(/Creation of Adam/)).toBeVisible();
});

test('zoomed in (720 px wide): reading layout, no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/, REVEAL);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(720);
  await expect(page.locator('header.site')).toHaveCSS('position', 'relative');
});

test.describe('on a touch device', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('the computer-only notice shows and the scene does not start', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('This site needs a computer.')).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.locator(html)).not.toHaveClass(/revealed/);
    expect(await page.locator('#scene').evaluate((c: HTMLCanvasElement) => c.width)).toBe(300); // never sized: not started
  });
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the finished page shows: still painting and all 7 projects', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByAltText(/Creation of Adam/)).toBeVisible();
    await expect(page.getByRole('link', { name: /^View project/ })).toHaveCount(7);
    await expect(page.getByRole('heading', { level: 3, name: 'Falling Constellations' })).toBeVisible();
  });
});
