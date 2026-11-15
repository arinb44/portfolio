// Every foreground/background pair the CSS uses, with the WCAG AA minimum it must meet.
// tests/unit/contrast.test.ts checks them against the real values in tokens.css. Add a row before using a new pair.
export const PAIRS: [fg: string, bg: string, use: string, min: number][] = [
  ['gesso', 'ink', 'body text, titles', 4.5],
  ['stone-200', 'ink', 'tagline, nav, meta, captions', 4.5],
  ['gold', 'ink', 'labels and the project count', 4.5],
  ['ink', 'gesso', 'pill button and skip link text', 4.5],
  ['ochre', 'ink', 'focus ring (non-text)', 3],
];
