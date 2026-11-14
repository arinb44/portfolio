// Every foreground/background pair the CSS uses, with the WCAG AA minimum it must meet (spec 6.1).
// tests/unit/contrast.test.ts checks them against the real values in tokens.css. Add a row before using a new pair.
export const PAIRS: [fg: string, bg: string, use: string, min: number][] = [
  ['ink', 'gesso', 'body text', 4.5],
  ['stone-700', 'gesso', 'captions, labels, stack line', 4.5],
  ['ultramarine', 'gesso', 'links; focus ring on light (3:1 non-text)', 4.5],
  ['gesso', 'ultramarine', 'primary button text', 4.5],
  ['gesso', 'umber', 'secondary button text', 4.5],
  ['gesso', 'verdigris', '"Finished" tag', 4.5],
  ['gesso', 'vermilion', '"In progress" tag', 4.5],
  ['ink', 'stone-200', 'prev/next edge wing text', 4.5],
  ['gesso', 'ink', 'skip link text', 4.5],
  ['ochre', 'ink', 'focus ring on dark (non-text)', 3],
];
