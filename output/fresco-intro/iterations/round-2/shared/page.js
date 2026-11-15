// Home page, round 2 (Amendment 1): the opening plays straight into the project showcase. This wires the skip links,
// a small bloom at the gap for each new project, and Falling Constellations behind its own stop. Adapted from
// src/scripts/home.js without the cursor journey (no ring, no God cut-out engine).
import { playIntro } from './intro.js';

const html = document.documentElement;

export function startPage() {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;   // computer only: the CSS notice covers the page
  const main = document.querySelector('#projects');

  // A project's live piece plays behind the painting while its stop is current, centred on the gap where the fresco rests.
  // It loads only once it is first needed, and never under reduced motion.
  // shortcut: it keeps running at opacity 0 after you scroll past; unload it if it ever costs frames.
  const frame = matchMedia('(prefers-reduced-motion: reduce)').matches ? null : document.querySelector('.backdrop');
  let placed = '', current = null;
  const place = ([x, y]) => {
    const key = [Math.round(x), Math.round(y), innerWidth, innerHeight].join();
    if (!frame || key === placed) return;
    placed = key;
    const w = 2 * Math.max(x, innerWidth - x), h = 2 * Math.max(y, innerHeight - y);
    Object.assign(frame.style, { width: `${w}px`, height: `${h}px`, left: `${x - w / 2}px`, top: `${y - h / 2}px` });
  };
  const backdrop = () => {
    if (!frame) return;
    const on = !!placed && html.classList.contains('revealed') && current?.id === frame.dataset.for;
    if (on && !frame.src) frame.src = frame.dataset.src;
    html.classList.toggle('backdrop-on', on);
  };

  let wasRevealed = false;
  const scene = playIntro({ onFrame({ revealed, restGap }) {
    place(restGap);
    if (revealed !== wasRevealed) { wasRevealed = revealed; backdrop(); }
  } });

  // "Skip to the projects" and the nav's Projects link: straight to the showcase, focus on the first project.
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', e => {
    e.preventDefault(); scene.toShowcase();
    const go = () => html.classList.contains('revealed') ? main.querySelector('a.primary').focus({ preventScroll: true }) : requestAnimationFrame(go);
    go();
  });

  // A small bloom at the gap each time a new project comes to rest.
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting && e.target !== current) { current = e.target; backdrop(); if (html.classList.contains('revealed')) scene.bloom(); }
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
