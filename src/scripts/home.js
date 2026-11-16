// Home page (design: output/fresco-intro/design-spec.md): the fresco opens into the project showcase. Each project's main image fills the
// screen behind its card and cross-fades as the next project comes to rest; the skip links go straight to the projects.
import { playIntro } from './intro.js';

const html = document.documentElement;

export function startPage() {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;   // computer only: the CSS notice covers the page
  const main = document.querySelector('#projects');
  const scene = playIntro();

  // "Skip to the projects" and the nav's Projects link: straight to the showcase, focus on the first project.
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', e => {
    e.preventDefault(); scene.toShowcase();
    const go = () => html.classList.contains('revealed') ? main.querySelector('a.primary').focus({ preventScroll: true }) : requestAnimationFrame(go);
    go();
  });

  // Painted loops (output/project-visuals/design-spec.md): a project's loop plays while it is the one on screen, unless the
  // visitor paused it, prefers reduced motion or reads the zoomed layout (then the poster stays). The pause control
  // (WCAG 2.2.2) shows while a loop is on screen; its label says the action and follows the video.
  let current = null, userPaused = false;
  const loops = new Map([...document.querySelectorAll('.visuals .loop')].map(l => [l.dataset.loop, l]));
  const still = matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px), (max-height: 560px)');
  const pause = document.querySelector('.pause-loop');
  function updateLoops() {
    for (const [id, loop] of loops) {
      const on = id === current, v = loop.querySelector('video');
      loop.classList.toggle('on', on);
      if (on && !userPaused && !still.matches) v.play().catch(() => {});   // a failed play leaves the poster
      else v.pause();
    }
    if (pause) pause.hidden = !loops.has(current) || still.matches;
  }
  for (const loop of loops.values()) {
    const v = loop.querySelector('video');
    v.addEventListener('playing', () => loop.classList.add('started'));
    v.addEventListener('play', syncPause); v.addEventListener('pause', syncPause);
  }
  function syncPause() {
    const v = loops.get(current)?.querySelector('video');
    if (!pause || !v) return;
    pause.classList.toggle('paused', v.paused); pause.querySelector('span').textContent = v.paused ? 'Play' : 'Pause';
  }
  pause?.addEventListener('click', () => { userPaused = !loops.get(current).querySelector('video').paused; updateLoops(); });
  still.addEventListener('change', updateLoops);

  // The current project's image is the one shown.
  const images = new Map([...document.querySelectorAll('.visuals img')].map(img => [img.dataset.for, img]));
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      for (const [id, img] of images) img.classList.toggle('on', id === e.target.id);
      current = e.target.id; updateLoops();
    }
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
