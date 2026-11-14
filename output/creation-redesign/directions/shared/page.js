// Page layer shared by the direction prototypes: name and nav, the reach hint, the 7 project stops, the spark.
// Content is real HTML; the canvas behind it is decoration. Scroll is native and only unlocked after the reveal (#23).
import { createCreation } from './creation.js';

const DATA = '../../data/';
const html = document.documentElement;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function startPage({ look }) {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;   // computer only (#21): the CSS notice covers the page

  const { projects } = await (await fetch(DATA + 'projects.json')).json();
  const main = document.querySelector('#projects'), n = String(projects.length).padStart(2, '0');
  main.insertAdjacentHTML('beforeend', projects.map((p, i) => `
    <section class="stop" id="${esc(p.slug)}" aria-labelledby="t-${esc(p.slug)}">
      <article class="card">
        <p class="count">${String(i + 1).padStart(2, '0')} / ${n}${p.featured ? ' · Featured' : ''}</p>
        <h3 id="t-${esc(p.slug)}">${esc(p.title)}</h3>
        <p class="line">${esc(p.oneLine)}</p>
        <p class="meta">${esc(p.year)} · ${p.stack.map(esc).join(', ')}</p>
        <p class="links">
          <a class="primary" href="#">View project</a>
          ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo<span aria-hidden="true"> ↗</span></a>` : ''}
          <a href="${esc(p.repo)}" target="_blank" rel="noopener">Code<span aria-hidden="true"> ↗</span></a>
        </p>
        ${i < projects.length - 1 ? '<p class="next" aria-hidden="true">Scroll for the next project</p>' : ''}
      </article>
    </section>`).join(''));

  const spark = document.querySelector('.spark'), ring = document.querySelector('.hint .ring'), caption = document.querySelector('.hint .caption');
  const unlock = () => { if (!html.classList.contains('revealed')) html.classList.add('revealed'); };
  const flash = () => { spark.classList.remove('flash'); void spark.offsetWidth; spark.classList.add('flash'); };

  let wasRevealed = false;
  const scene = await createCreation(document.querySelector('#scene'), {
    look, data: DATA,
    onFrame(S) {
      if (S.revealed && !wasRevealed) { wasRevealed = true; flash(); }   // the touch itself sparks
      spark.style.transform = `translate(${S.tip[0]}px, ${S.tip[1]}px)`;
      if (!S.revealed) spark.style.opacity = S.progress > .95 ? Math.max(0, 1 - S.cursorDistance / 90).toFixed(2) : 0;
      else spark.style.removeProperty('opacity');
      ring.style.opacity = S.revealed ? 0 : 1;                                                       // the target stays until the touch
      caption.style.opacity = S.revealed ? 0 : Math.max(0, 1 - Math.max(S.progress - .08, 0) * 6).toFixed(2);
      if (S.reveal > .55) unlock();
    },
  });
  if (!scene) { html.classList.add('static', 'revealed'); return; }   // no WebGL2: the still painting in CSS

  // Skip the intro (keyboard and anyone in a hurry): assemble quickly, then move focus to the first project.
  // The skip link and the nav's Projects link both do this.
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', e => {
    e.preventDefault();
    scene.revealNow();
    const go = () => html.classList.contains('revealed') ? main.querySelector('a.primary').focus({ preventScroll: true }) : requestAnimationFrame(go);
    go();
  });

  // A spark at the fingertip each time a new project comes to rest.
  let current = null;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting && e.target !== current) { current = e.target; if (html.classList.contains('revealed')) flash(); }
  }, { threshold: .6 });
  main.querySelectorAll('.stop').forEach(s => io.observe(s));
}
