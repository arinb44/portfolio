// Home page layer (from the design prototype's page.js): the reach hint, the reveal, the skip links, the spark per stop.
// The content is real HTML rendered by Astro; the canvas behind it is decoration. Scroll unlocks after the reveal.
import { createCreation } from './creation.js';

const html = document.documentElement;

export async function startPage({ look }) {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;   // computer only: the CSS notice covers the page

  const main = document.querySelector('#projects');
  const ring = document.querySelector('.hint .ring'), caption = document.querySelector('.hint .caption');

  // Skip the intro (keyboard and anyone in a hurry): assemble quickly, then move focus to the first project.
  // The skip link and the nav's Projects link both do this. Wired up before the scene loads, so an early press still counts.
  let scene = null, skipped = false;
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', e => {
    e.preventDefault();
    skipped = true; scene?.revealNow();
    const go = () => html.classList.contains('revealed') ? main.querySelector('a.primary').focus({ preventScroll: true }) : requestAnimationFrame(go);
    go();
  });

  scene = await createCreation(document.querySelector('#scene'), {
    look,
    onFrame(S) {
      // The ring stays until the touch and warms as the cursor closes in (the spark itself is drawn by the engine).
      ring.style.opacity = S.revealed ? 0 : 1;
      ring.style.setProperty('--near', S.revealed ? 0 : Math.max(0, 1 - S.cursorDistance / 160).toFixed(2));
      caption.style.opacity = S.revealed ? 0 : Math.max(0, 1 - Math.max(S.progress - .08, 0) * 6).toFixed(2);
      if (S.reveal > .75) html.classList.add('revealed');   // the card appears once the camera has nearly settled
    },
  }).catch(() => null);
  // No WebGL2, or the painting failed to load: the still painting in CSS.
  if (!scene) { html.classList.add('static', 'revealed'); return; }
  if (skipped) scene.revealNow();

  // A spark at the fingertip each time a new project comes to rest.
  let current = null;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting && e.target !== current) { current = e.target; if (html.classList.contains('revealed')) scene.spark(); }
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
