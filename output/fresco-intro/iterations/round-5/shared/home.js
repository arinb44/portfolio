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

  // The current project's image is the one shown.
  const images = new Map([...document.querySelectorAll('.visuals img')].map(img => [img.dataset.for, img]));
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) for (const [id, img] of images) img.classList.toggle('on', id === e.target.id);
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
