import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Every test starts in a fresh browser context, so localStorage is empty: a first visit.

const arrival = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => (a as CSSAnimation).animationName?.startsWith('arrival-'))
      .map((a) => ({
        name: (a as CSSAnimation).animationName,
        state: a.playState,
        time: Number(a.currentTime),
        duration: a.effect?.getTiming().duration,
      })),
  );
const allDone = async (page: Page) => (await arrival(page)).every((a) => a.state === 'finished');

/** Freezes the arrival at its first frame (the closed altarpiece). */
const freezeClosed = (page: Page) =>
  page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));

test('first visit: the closed exterior shows the name, then the wings open by themselves', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.inscription-name')).toBeVisible();
  expect((await arrival(page)).map((a) => a.name).sort()).toEqual(['arrival-exterior', 'arrival-glaze', 'arrival-wing', 'arrival-wing']);
  await expect.poll(() => allDone(page), { timeout: 5000 }).toBe(true);
  await expect(page.locator('.exterior')).toBeHidden();
});

test('a repeat visit within 30 days goes straight in', async ({ page }) => {
  await page.goto('/');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/arrived/);
  await expect(page.locator('.exterior')).toBeHidden();
  expect(await arrival(page)).toEqual([]);
});

test('after 30 days it plays again', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('arrivedAt', String(Date.now() - 31 * 864e5)));
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/arrived/);
  await expect(page.locator('.inscription-name')).toBeVisible();
});

test('Skip intro ends it at once', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  expect(await allDone(page)).toBe(true);
  await expect(page.locator('.exterior')).toBeHidden();
});

test('the first key opens it now; the next key ends it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowDown');
  expect(Math.min(...(await arrival(page)).map((a) => a.time))).toBeGreaterThanOrEqual(600);
  await page.keyboard.press('ArrowDown');
  expect(await allDone(page)).toBe(true);
});

test('Tab ends it, so focus never lands behind a closed wing', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  expect(await allDone(page)).toBe(true);
  await expect(page.locator(':focus')).toBeVisible();
});

test('reduced motion: no swing, only a 150 ms fade of the exterior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.inscription-name')).toBeVisible();
  expect((await arrival(page)).map(({ name, duration }) => ({ name, duration }))).toEqual([{ name: 'arrival-exterior', duration: 150 }]);
  await expect(page.locator('.wing-back').first()).toBeHidden();
});

test('no layout shift during the arrival', async ({ page }) => {
  await page.goto('/');
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let sum = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!e.hadRecentInput) sum += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(sum), 2600);
      }),
  );
  expect(cls).toBe(0);
});

test('the closed state passes axe WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/');
  await freezeClosed(page);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

// m11/m22 of the closed wing's matrix tell rotateY(180) (-1, 1) from rotateX(180) (1, -1).
const closedAxes = async (page: Page) => {
  await freezeClosed(page);
  return page.locator('.wing').evaluateAll((wings) =>
    wings.map((w) => new DOMMatrix(getComputedStyle(w).transform)).map((m) => [Math.round(m.m11), Math.round(m.m22)]),
  );
};

test('desktop: the wings hinge left and right (rotateY)', async ({ page }) => {
  await page.goto('/');
  expect(await closedAxes(page)).toEqual([[-1, 1], [-1, 1]]);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the wings hinge top and bottom (rotateX) and the name is on the first screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.inscription-name')).toBeInViewport();
    expect(await closedAxes(page)).toEqual([[1, -1], [1, -1]]);
  });
});

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('no exterior: the altarpiece is simply open', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.exterior')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Falling Constellations' })).toBeVisible();
  });
});
