// Creates a labelled placeholder PNG for every image a project file points to that doesn't exist yet.
// Never overwrites: once you drop in real art under the same name, this script leaves it alone.
import { readdir, readFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import sharp from 'sharp';

const CONTENT = 'src/content/projects';
const SIZES = { predella: [480, 480], varnish: [1600, 1000] }; // everything else: 1200 x 800

const exists = (p) => access(p).then(() => true, () => false);

for (const file of await readdir(CONTENT)) {
  if (!file.endsWith('.md')) continue;
  const text = await readFile(join(CONTENT, file), 'utf8');
  for (const [, rel] of text.matchAll(/(\.\.\/\.\.\/assets\/[^\s"']+\.png)/g)) {
    const out = resolve(CONTENT, rel);
    if (await exists(out)) continue;
    const name = basename(out, '.png');
    const [w, h] = SIZES[name] ?? SIZES[name.split('-')[0]] ?? [1200, 800];
    const label = `PLACEHOLDER: ${file.replace('.md', '')} / ${name}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><pattern id="h" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="24" height="24" fill="#CFC8BA"/><rect width="12" height="24" fill="#C4BCAD"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#h)"/>
      <rect x="4%" y="40%" width="92%" height="20%" fill="#EEE9DF"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1F1D1A"
        font-family="Georgia, serif" font-size="${Math.round(w / 28)}">${label}</text></svg>`;
    await mkdir(dirname(out), { recursive: true });
    await sharp(Buffer.from(svg)).png().toFile(out);
    console.log('created', rel.replace('../../', 'src/'));
  }
}
