import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Featured first, then `order` (design decision #3).
const SLUGS = ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'nightfall', 'falling-constellations'];
const html = 'html';
// The opening (src/scripts/intro.js) runs 4.7 s once the fresco has loaded.
const SHOWCASE = { timeout: 15_000 };

const axe = async (page: import('@playwright/test').Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

test('opening: the fresco covers the screen with only the skip controls; header and projects wait', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skip to the projects' })).toBeVisible();
  await expect(page.locator('header.site')).toHaveCSS('opacity', '0');
  await expect(page.locator(html)).toHaveClass(/intro/);
  await expect(page.locator('.stops')).toBeHidden();
  expect(await axe(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('the opening ends on its own: name, nav and the first project appear at once', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
  await expect(page.locator('.stops')).toHaveCSS('opacity', '1'); // no fade-in: the projects are there at the flash's peak
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link')).toHaveText(['Projects', 'About', 'CV', 'Email']);
  await expect(page.locator('#intro')).toBeHidden(SHOWCASE); // removed once the projects are live
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeHidden();
  await expect(page.locator('.visuals img.on')).toHaveAttribute('data-for', 'nfl-predictor');
  await expect(page.locator('.flash')).toHaveCSS('opacity', '0'); // the flash has cleared, so axe measures the real colours
  expect(await axe(page)).toEqual([]);
});

test('keyboard: tabbing into the nav during the opening shows the header on a solid band', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Projects');
  await expect(page.locator(html)).toHaveClass(/intro/);
  await expect(page.locator('header.site')).toHaveCSS('opacity', '1');
  await expect(page.locator('header.site')).toHaveCSS('background-color', 'rgb(31, 29, 26)');
});

test('the 5 stops come from the content collection, featured first, with working links', async ({ page, request }) => {
  await page.goto('/');
  const stops = page.locator('.stop');
  expect(await stops.evaluateAll((els) => els.map((el) => el.id))).toEqual(SLUGS);
  await expect(stops.first().locator('.count')).toHaveText('01 / 05 · Featured');
  await expect(stops.last().locator('.count')).toHaveText('05 / 05');
  const hrefs = await page.locator('a.primary').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs).toEqual(SLUGS.map((s) => `/projects/${s}/`));
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
  // One image per project, in the same order, behind the cards.
  expect(await page.locator('.visuals img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('data-for')))).toEqual(SLUGS);
});

test('keyboard: Skip intro is the first Tab stop; the second skips to the projects and focuses the featured one', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip intro');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to the projects');
  await page.keyboard.press('Enter');
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
  await expect(page.locator(':focus')).toHaveAttribute('href', '/projects/nfl-predictor/');
  await expect(page.locator('.stops')).toHaveCSS('opacity', '1');
  expect(await axe(page)).toEqual([]);
});

test('Skip intro and Esc go straight to the projects', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, { timeout: 3_000 });
  const other = await context.newPage(); // a new tab plays the opening again
  await other.goto('/');
  await expect(other.locator(html)).toHaveClass(/intro/);
  await other.keyboard.press('Escape');
  await expect(other.locator(html)).toHaveClass(/revealed/, { timeout: 3_000 });
});

test('the nav\'s Projects link reveals too', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
});

test('the image behind the cards follows the project in view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Skip to the projects' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
  await page.locator('#nba-predictor').scrollIntoViewIfNeeded();
  await expect(page.locator('.visuals img.on')).toHaveAttribute('data-for', 'nba-predictor');
  await expect(page.locator('.visuals img.on')).toHaveCount(1);
});

// Painted loops (output/project-visuals): public/projects/<slug>/loop.webm plays behind that project's card.
test('the NBA stop plays its painted loop; the pause control shows with it and stops it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Skip to the projects' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
  await page.locator('#nba-predictor').scrollIntoViewIfNeeded();
  const loop = page.locator('.loop[data-loop="nba-predictor"]');
  const video = loop.locator('video');
  await expect(loop).toHaveClass(/\bon\b/);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), SHOWCASE).toBe(true);
  await page.getByRole('button', { name: 'Pause the background video' }).click();
  await expect(page.getByRole('button', { name: 'Play the background video' })).toBeVisible();
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  expect(await axe(page)).toEqual([]);
  await page.locator('#nightfall').scrollIntoViewIfNeeded();
  await expect(loop).not.toHaveClass(/\bon\b/);
});

test('the first stop (NFL) plays its painted loop once the opening is over', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pause-loop')).toBeHidden(); // nothing to pause during the opening
  await page.getByRole('link', { name: 'Skip to the projects' }).click();
  await expect(page.locator(html)).toHaveClass(/revealed/, SHOWCASE);
  const video = page.locator('.loop[data-loop="nfl-predictor"] video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0), SHOWCASE).toBe(true);
  await expect(page.getByRole('button', { name: 'Pause the background video' })).toBeVisible();
  await expect(page.locator('.visuals img.on')).toHaveAttribute('src', '/projects/nfl-predictor/poster.webp');
  expect(await axe(page)).toEqual([]);
});

test('reduced motion: the NBA loop stays on its poster, with no pause control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#nba-predictor').scrollIntoViewIfNeeded();
  const loop = page.locator('.loop[data-loop="nba-predictor"]');
  await expect(loop).toHaveClass(/\bon\b/);
  await page.waitForTimeout(500);
  expect(await loop.locator('video').evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
  await expect(page.locator('.pause-loop')).toBeHidden();
});

test('once per tab: after the opening, a reload goes straight to the projects', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#intro')).toBeHidden(SHOWCASE);
  await page.reload();
  await expect(page.locator(html)).toHaveClass(/revealed/);
  await expect(page.locator(html)).not.toHaveClass(/intro/);
});

test('reduced motion: the projects at once, no opening', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/);
  await expect(page.locator(html)).not.toHaveClass(/intro/);
  await expect(page.getByRole('heading', { level: 3, name: 'Fourth and Why' })).toBeVisible();
});

test('no WebGL2: the projects at once over the first project\'s image', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return type === 'webgl2' ? null : (get as Function).call(this, type, ...rest);
    } as typeof get;
  });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/);
  await expect(page.locator(html)).not.toHaveClass(/intro/);
  await expect(page.locator('.visuals img.on')).toBeVisible();
});

test('zoomed in (720 px wide): reading layout, no opening, no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto('/');
  await expect(page.locator(html)).toHaveClass(/revealed/);
  await expect(page.locator(html)).not.toHaveClass(/intro/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(720);
  await expect(page.locator('header.site')).toHaveCSS('position', 'relative');
});

test.describe('on a touch device', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('the computer-only notice shows and the opening does not start', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('This site needs a computer.')).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.locator(html)).not.toHaveClass(/revealed|intro/);
    expect(await page.locator('#intro').evaluate((c: HTMLCanvasElement) => c.width)).toBe(300); // never sized: not started
  });
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the finished page shows: all 5 projects over the first project\'s image', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /^View project/ })).toHaveCount(5);
    await expect(page.getByRole('heading', { level: 3, name: 'Fourth and Why' })).toBeVisible();
    await expect(page.locator('.visuals img').first()).toBeVisible();
  });
});
