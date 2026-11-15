// fresco-intro copy of src/scripts/home.js: adds `data` (asset folder) and `hold` (a promise: the cursor can't build God until it resolves; intro.css hides the ring).
// Home page layer (from the design prototype's page.js): the reach hint, the reveal, the skip links, the spark per stop.
// The content is real HTML rendered by Astro; the canvas behind it is decoration. Scroll unlocks after the reveal.
import { createCreation } from './creation.js';

const html = document.documentElement;

export async function startPage({ look, data, hold }) {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;   // computer only: the CSS notice covers the page

  const main = document.querySelector('#projects');
  const ring = document.querySelector('.hint .ring'), caption = document.querySelector('.hint .caption');

  // Skip the intro (keyboard and anyone in a hurry): assemble quickly, then move focus to the first project.
  // The skip link and the nav's Projects link both do this. Wired up before the scene loads, so an early press still counts.
  let scene = null, skipped = false, current = null;

  // A project's live piece plays behind the painting while its stop is current. It loads only once it is first needed,
  // after the reveal, and never under reduced motion.
  // shortcut: it keeps running at opacity 0 after you scroll past; unload it if it ever costs frames.
  const frame = matchMedia('(prefers-reduced-motion: reduce)').matches ? null : document.querySelector('.backdrop');
  // The piece draws its galaxy at the centre of its own frame, so the frame is centred on God's fingertip
  // and made big enough to still cover the screen.
  let placed = '';
  const place = ([x, y]) => {
    const key = [Math.round(x), Math.round(y), innerWidth, innerHeight].join();
    if (!frame || key === placed) return;
    placed = key;
    const w = 2 * Math.max(x, innerWidth - x), h = 2 * Math.max(y, innerHeight - y);
    Object.assign(frame.style, { width: `${w}px`, height: `${h}px`, left: `${x - w / 2}px`, top: `${y - h / 2}px` });
  };
  const backdrop = () => {
    const on = !!placed && html.classList.contains('revealed') && current?.id === frame.dataset.for;
    if (on && !frame.src) frame.src = frame.dataset.src;
    html.classList.toggle('backdrop-on', on);
  };
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', e => {
    e.preventDefault();
    skipped = true; scene?.revealNow();
    const go = () => html.classList.contains('revealed') ? main.querySelector('a.primary').focus({ preventScroll: true }) : requestAnimationFrame(go);
    go();
  });

  scene = await createCreation(document.querySelector('#scene'), {
    look, data,
    onFrame(S) {
      // The ring stays until the touch and warms as the cursor closes in (the spark itself is drawn by the engine).
      ring.style.opacity = S.revealed ? 0 : 1;
      ring.style.setProperty('--near', S.revealed ? 0 : Math.max(0, 1 - S.cursorDistance / 160).toFixed(2));
      caption.style.opacity = S.revealed ? 0 : Math.max(0, 1 - Math.max(S.progress - .08, 0) * 6).toFixed(2);
      place(S.rest);
      if (S.reveal > .75 && !html.classList.contains('revealed')) { html.classList.add('revealed'); backdrop(); }   // the card appears once the camera has nearly settled
    },
  }).catch(() => null);
  // No WebGL2, or the painting failed to load: the still painting in CSS.
  if (!scene) { html.classList.add('static', 'revealed'); return; }
  if (skipped) scene.revealNow();
  if (hold) { scene.state.hold = true; hold.then(() => { scene.state.hold = false; }); }

  // A spark at the fingertip each time a new project comes to rest.
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting && e.target !== current) { current = e.target; backdrop(); if (html.classList.contains('revealed')) scene.spark(); }
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
