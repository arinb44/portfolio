import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAIRS } from '../../src/styles/contrast-pairs.ts';

// WCAG 2.x relative luminance and contrast ratio, ported from the research agent's contrast_check.py.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const tokens = Object.fromEntries(
  [...readFileSync('src/styles/tokens.css', 'utf8').matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
);

test('formula matches known WCAG values', () => {
  assert.equal(ratio('#000000', '#FFFFFF').toFixed(1), '21.0');
  assert.equal(ratio('#777777', '#FFFFFF').toFixed(2), '4.48');
  assert.equal(ratio(tokens.ink, tokens.gesso).toFixed(2), '13.90'); // spec 6.1
});

for (const [fg, bg, use, min] of PAIRS) {
  test(`${fg} on ${bg} (${use}) meets ${min}:1`, () => {
    assert.ok(tokens[fg] && tokens[bg], `unknown token in pair ${fg}/${bg}`);
    const r = ratio(tokens[fg], tokens[bg]);
    assert.ok(r >= min, `${r.toFixed(2)}:1 is below ${min}:1`);
  });
}
