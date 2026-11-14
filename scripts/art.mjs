// Crops the CC0 museum originals in art-src/ (git-ignored) into web-sized images in src/assets/art/.
// Originals: https://images.metmuseum.org/CRDImages/{ep/original/DT11783.jpg, rl/original/LC-1975_1_010_001.jpg, cl/original/DP-46759-013.jpg}
// Boxes are fractions of the original: [left, top, right, bottom].
import sharp from 'sharp';

const CROPS = [
  // The Cellier Altarpiece, closed (Met 435638): grisaille outer wings, softened for the closed altarpiece (spec 6.3).
  { src: 'DT11783.jpg', out: 'cellier-left.jpg', box: [0.12, 0.32, 0.43, 0.92], width: 600, grisaille: true },
  { src: 'DT11783.jpg', out: 'cellier-right.jpg', box: [0.57, 0.32, 0.88, 0.92], width: 600, grisaille: true },
  // Workshop of Lippo Memmi, Madonna and Child (Met 459134): tooled gold ground for the frames.
  { src: 'LC-1975_1_010_001.jpg', out: 'gold-ground.jpg', box: [0.3, 0.22, 0.7, 0.38], width: 600 },
  // Workshop of Robert Campin, Merode Altarpiece (Met 470304): Joseph in his workshop, for the Contact wing.
  { src: 'DP-46759-013.jpg', out: 'merode-joseph.jpg', box: [0.18, 0.06, 0.95, 0.88], width: 640 },
];

for (const { src, out, box, width, grisaille } of CROPS) {
  const img = sharp(`art-src/${src}`);
  const { width: w, height: h } = await img.metadata();
  const [l, t, r, b] = box;
  let pipeline = img
    .extract({ left: Math.round(l * w), top: Math.round(t * h), width: Math.round((r - l) * w), height: Math.round((b - t) * h) })
    .resize({ width });
  if (grisaille) pipeline = pipeline.modulate({ saturation: 0.35 }).blur(1.2);
  const info = await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(`src/assets/art/${out}`);
  console.log(out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KiB`);
}
