// The arrival (spec 5.3, M1–M3). Inlined into <head> on the home page only, before first paint.
// It plays at most once per 30 days (#23). The first input opens the altarpiece at once; a second input,
// Skip intro, or focus moving into the page ends it. The animation itself is CSS (arrival.css).
(() => {
  const html = document.documentElement;
  const WAIT = 600;
  const DAYS_30 = 30 * 864e5;
  try {
    const last = Number(localStorage.getItem('arrivedAt')) || 0;
    if (Date.now() - last < DAYS_30) html.classList.add('arrived');
    else localStorage.setItem('arrivedAt', String(Date.now())); // counts from the last time it played
  } catch {
    // storage blocked: just play it
  }
  if (html.classList.contains('arrived')) return;

  const anims = () => document.getAnimations().filter((a) => a.animationName?.startsWith('arrival-'));
  const finish = () => anims().forEach((a) => a.finish());

  function onInput(e) {
    if (e.key === 'Tab' || e.key === 'Shift') return;
    if (e.target?.closest?.('.skip-intro')) return finish();
    const list = anims();
    if (!list.length) return;
    const waiting = list[0].currentTime < WAIT;
    for (const a of list) waiting ? (a.currentTime = WAIT) : a.finish();
  }
  for (const type of ['pointerdown', 'wheel', 'keydown']) addEventListener(type, onInput, { passive: true });
  addEventListener('click', (e) => e.target?.closest?.('.skip-intro') && finish()); // screen readers send click only
  addEventListener('focusin', finish); // never let a closed wing hide focus
})();
