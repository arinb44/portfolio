import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortProjects, neighbours } from '../../src/lib/order.ts';

const entry = (id: string, order: number, featured = false) => ({ id, data: { order, featured } });

// The site's order (output/project-lineup), deliberately shuffled.
const projects = [
  entry('falling-constellations', 5),
  entry('nfl-predictor', 1, true),
  entry('nightfall', 4),
  entry('nba-predictor', 3),
  entry('mlb-predictor', 2),
];

test('sorts by order', () => {
  assert.deepEqual(
    sortProjects(projects).map((e) => e.id),
    ['nfl-predictor', 'mlb-predictor', 'nba-predictor', 'nightfall', 'falling-constellations'],
  );
});

test('NBA sits between MLB and Nightfall', () => {
  const { prev, next } = neighbours(sortProjects(projects), 'nba-predictor');
  assert.equal(prev.id, 'mlb-predictor');
  assert.equal(next.id, 'nightfall');
});

test('wraps at both ends', () => {
  const sorted = sortProjects(projects);
  assert.equal(neighbours(sorted, 'falling-constellations').next.id, 'nfl-predictor');
  assert.equal(neighbours(sorted, 'nfl-predictor').prev.id, 'falling-constellations');
});

test('rejects no featured project or two of them', () => {
  assert.throws(() => sortProjects([entry('a', 1), entry('b', 2)]), /found 0/);
  assert.throws(() => sortProjects([entry('a', 1, true), entry('b', 2, true)]), /found 2 \(a, b\)/);
});

test('rejects two projects with the same order', () => {
  assert.throws(() => sortProjects([entry('a', 1, true), entry('b', 1)]), /a and b share order 1/);
});

test('rejects an unknown id', () => {
  assert.throws(() => neighbours(sortProjects(projects), 'nope'), /Unknown project: nope/);
});
