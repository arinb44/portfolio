import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Runs the real inline script against fake browser globals.
const src = readFileSync('src/scripts/arrival.js', 'utf8');
const DAY = 864e5;
const NOW = 100 * DAY;

type Anim = { animationName: string; currentTime: number; finished: boolean; finish(): void };
const anim = (animationName: string, currentTime = 0): Anim => ({
  animationName, currentTime, finished: false, finish() { this.finished = true; },
});
const skipButton = { closest: (sel: string) => (sel === '.skip-intro' ? {} : null) };

function run(opts: { stored?: number; blocked?: boolean; animations?: Anim[] } = {}) {
  const classes = new Set<string>();
  const store = new Map<string, string>();
  if (opts.stored !== undefined) store.set('arrivedAt', String(opts.stored));
  const listeners: Record<string, ((e: object) => void)[]> = {};
  const guard = () => { if (opts.blocked) throw new Error('storage blocked'); };
  const localStorage = {
    getItem: (k: string) => (guard(), store.get(k) ?? null),
    setItem: (k: string, v: string) => (guard(), store.set(k, v)),
  };
  const document = {
    documentElement: { classList: { add: (c: string) => classes.add(c), contains: (c: string) => classes.has(c) } },
    getAnimations: () => opts.animations ?? [],
  };
  const addEventListener = (type: string, fn: (e: object) => void) => (listeners[type] ??= []).push(fn);
  new Function('document', 'localStorage', 'addEventListener', 'Date', src)(document, localStorage, addEventListener, { now: () => NOW });
  const fire = (type: string, e: object = {}) => listeners[type]?.forEach((fn) => fn(e));
  return { arrived: classes.has('arrived'), stored: store.get('arrivedAt'), listeners, fire };
}

test('first visit plays and stores the time', () => {
  const r = run();
  assert.equal(r.arrived, false);
  assert.equal(r.stored, String(NOW));
});

test('a visit within 30 days skips it, keeps the old timestamp and adds no listeners', () => {
  const r = run({ stored: NOW - 29 * DAY });
  assert.equal(r.arrived, true);
  assert.equal(r.stored, String(NOW - 29 * DAY));
  assert.deepEqual(r.listeners, {});
});

test('after 30 days it plays again and restamps', () => {
  const r = run({ stored: NOW - 31 * DAY });
  assert.equal(r.arrived, false);
  assert.equal(r.stored, String(NOW));
});

test('blocked storage: it just plays', () => {
  assert.equal(run({ blocked: true }).arrived, false);
});

test('input during the 600 ms wait opens it now, keeping the glazes in step', () => {
  const animations = [anim('arrival-wing', 200), anim('arrival-glaze', 200)];
  run({ animations }).fire('keydown', { key: 'ArrowDown' });
  assert.deepEqual(animations.map((a) => a.currentTime), [600, 600]);
  assert.ok(animations.every((a) => !a.finished));
});

test('input once it is opening ends it', () => {
  const animations = [anim('arrival-wing', 900), anim('arrival-glaze', 900)];
  run({ animations }).fire('pointerdown', {});
  assert.ok(animations.every((a) => a.finished));
});

test('Tab and Shift do not count as input', () => {
  const animations = [anim('arrival-wing', 200)];
  const r = run({ animations });
  r.fire('keydown', { key: 'Tab' });
  r.fire('keydown', { key: 'Shift' });
  assert.equal(animations[0].currentTime, 200);
});

test('Skip intro (pointer or screen-reader click) and focus end it at once', () => {
  for (const [type, e] of [['pointerdown', { target: skipButton }], ['click', { target: skipButton }], ['focusin', {}]] as const) {
    const animations = [anim('arrival-wing', 100)];
    run({ animations }).fire(type, e);
    assert.ok(animations[0].finished, type);
  }
});

test('leaves other animations alone', () => {
  const other = anim('glint', 50);
  run({ animations: [other, anim('arrival-wing', 900)] }).fire('wheel', {});
  assert.equal(other.finished, false);
});
