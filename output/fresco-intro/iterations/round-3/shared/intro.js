// Fresco intro, round 3 (Amendment 2). The full Creation of Adam is a window the visitor enters (#21): it is on screen from
// the first frame (#25); the camera moves in and lands on the gap between the fingers (zoom 2, #9; 3524 px image, #10);
// the gap opens onto the first project (#24), the camera passes through, one gold flash marks the threshold, and the
// projects' own images take over behind their cards (#20, #22, #23). The header fades while the painting fills the screen
// (#11). Once per tab (#13); reduced motion, the reading layout (#14), a repeat visit and no WebGL get the showcase at once.
// Review only: ?review (replay / scrub / speed), ?t=3.6 (freeze at a time).

const GAP = [1335, 728];   // between the fingertips in the 3524 px image (Adam's 1331,733; God's 1339,723), measured on a 10x crop
const ZOOM = 2;            // screen px per image px at the landing
const THROUGH = 16;        // the zoom the camera reaches as it passes through the window
const INK = [31 / 255, 29 / 255, 26 / 255], GOLD = [.784, .635, .29];
// seconds: push = move in and land; open = the window grows from the gap until it fills the screen; enter = the camera
// accelerates through it; flash = rise, peak, gone; reveal = cards and header; end = the showcase is live.
const TL = { push: [0, 3.0], open: [3.0, 4.05], enter: [3.3, 4.1], flash: [3.65, 3.9, 4.5], reveal: 4.2, end: 4.7 };
const SRC = '/public/creation/fresco.webp';   // the site serves it as /creation/fresco.webp
const SEEN = 'fresco-intro-seen';             // sessionStorage: once per tab

const q = new URLSearchParams(location.search);
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;

// The fresco, with a soft 1.5% edge against the night sky.
const PAINT_VS = `#version 300 es
in vec2 aPos; uniform mat3 uH; uniform vec2 uSize; out vec2 vUV;
void main() { vUV = aPos; vec3 h = uH * vec3(aPos * uSize, 1.); gl_Position = vec4(h.xy, 0., h.z); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV; uniform sampler2D uTex; uniform vec2 uSize; out vec4 o;
void main() { vec2 m = min(vUV, 1. - vUV) * uSize / uSize.y; o = vec4(texture(uTex, vUV).rgb, 1.) * smoothstep(0., .015, min(m.x, m.y)); }`;

const FULL_VS = `#version 300 es
void main() { gl_Position = vec4(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1., 0., 1.); }`;
// The window: everything drawn so far is kept only outside a soft circle around the gap (blend ZERO, SRC_ALPHA).
const HOLE_FS = `#version 300 es
precision highp float;
uniform vec2 uC; uniform float uR, uF; out vec4 o;
void main() { o = vec4(0., 0., 0., smoothstep(uR - uF, uR, distance(gl_FragCoord.xy, uC))); }`;
// The flash: a gold bloom with a warm core at the gap, additive, in device pixels.
const LIGHT_FS = `#version 300 es
precision highp float;
uniform vec2 uC; uniform float uR, uI, uDpr; uniform vec3 uColor; out vec4 o;
void main() {
  float d = distance(gl_FragCoord.xy, uC);
  o = vec4(uColor * uI * exp(-pow(d / uR, 2.)) + vec3(1., .97, .9) * uI * .5 * exp(-pow(d / (uR * .15 + uDpr), 2.)), 0.);
}`;

function compile(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const U = {};
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
    const name = gl.getActiveUniform(p, i).name; U[name] = gl.getUniformLocation(p, name);
  }
  return { p, U };
}

/** Plays the opening into the showcase. Returns at once: { done (promise: the showcase is live), toShowcase() }. */
export function playIntro() {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, canvas = document.querySelector('#intro'), site = document.querySelector('.site');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch {}
  const atOnce = reduced || matchMedia('(max-width: 900px), (max-height: 560px)').matches || (seen && !review && !q.has('t'));
  let T = q.has('t') ? +q.get('t') : atOnce ? TL.end : 0, paused = q.has('t'), speed = 1, fading = false, ended = false;
  window.__intro = { startAt: null, doneAt: null, atOnce, frames: [], Ts: [] };
  const end = () => {                       // the showcase is live
    if (ended) return; ended = true;
    site.style.opacity = ''; site.classList.remove('faded');
    try { sessionStorage.setItem(SEEN, '1'); } catch {}   // storage blocked: it plays again next time, nothing breaks
    window.__intro.doneAt = performance.now(); resolve();
  };
  const showcase = () => { html.classList.remove('intro', 'window'); html.classList.add('revealed'); canvas.style.display = 'none'; end(); };
  const api = { done, toShowcase() { T = Math.max(T, TL.end); } };   // "Skip to the projects": straight there
  if (atOnce && !q.has('t')) { showcase(); return api; }
  html.classList.add('intro');

  // Skip intro / Esc: a quick dip to the night sky, then the showcase.
  const skip = () => {
    if (T >= TL.reveal || fading) return; fading = true;
    canvas.style.transition = 'opacity .25s'; canvas.style.opacity = 0;
    setTimeout(() => { T = TL.end; fading = false; }, 250);
  };
  document.querySelector('.skip-intro').addEventListener('click', skip);
  addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });

  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { showcase(); return api; }   // no WebGL2
  (async () => {
    const bmp = await createImageBitmap(await (await fetch(SRC)).blob());
    const W = bmp.width, H = bmp.height;
    const paint = compile(gl, PAINT_VS, PAINT_FS), hole = compile(gl, FULL_VS, HOLE_FS), light = compile(gl, FULL_VS, LIGHT_FS);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
    const quad = gl.createVertexArray(), empty = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(paint.p, 'aPos');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);

    // The camera as the gap's place on screen and the zoom: in to the centre at ZOOM (zoom in log space, the gap on a
    // straight line), a beat, then an accelerating push through the window.
    function camera(T, vw, vh) {
      const fit = Math.min(vw * .9 / W, vh * .78 / H), e = ease(clamp01((T - TL.push[0]) / (TL.push[1] - TL.push[0])));
      const from = [(GAP[0] - W / 2) * fit + vw / 2, (GAP[1] - H / 2) * fit + vh / 2];
      const through = clamp01((T - TL.enter[0]) / (TL.enter[1] - TL.enter[0])) ** 3;
      return { gap: [lerp(from[0], vw / 2, e), lerp(from[1], vh / 2, e)],
               z: Math.exp(lerp(Math.log(fit), Math.log(ZOOM), e) + Math.log(THROUGH / ZOOM) * through) };
    }
    let textBottom = 0;   // the header fades as the painting's top edge rises behind its text (D4)
    const measure = () => { textBottom = Math.max(...[...site.children].map(c => c.getBoundingClientRect().bottom)); };
    measure(); addEventListener('resize', measure);

    if (review) buildReviewBar(TL.end, () => T, t => { T = t; }, () => (paused = !paused), s => { speed = s; });
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, startAt: performance.now() });
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      if (!paused) T = Math.min(T + dt * speed, TL.end);
      if (!ended) { window.__intro.frames.push(now); window.__intro.Ts.push(T); }
      html.classList.toggle('intro', T < TL.reveal);
      html.classList.toggle('window', T >= TL.open[0] && T < TL.reveal);   // the project images may show through the window
      html.classList.toggle('revealed', T >= TL.reveal);
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const { gap, z } = camera(T, vw, vh);
      const cx = GAP[0] - (gap[0] - vw / 2) / z, cy = GAP[1] - (gap[1] - vh / 2) / z;            // the image point at the screen centre
      const M = [2 * z / vw, 0, 0, 0, -2 * z / vh, 0, -2 * z * cx / vw, 2 * z * cy / vh, 1];       // image px -> clip
      const R = 1.2 * Math.hypot(vw, vh) / 2 * clamp01((T - TL.open[0]) / (TL.open[1] - TL.open[0])) ** 2.2;   // the window's radius, CSS px
      if (T < TL.end) {
        const top = (0 - cy) * z + vh / 2;
        const op = site.matches(':focus-within') ? 1 : Math.max(ss(textBottom - 8, textBottom + 48, top), ss(TL.reveal, TL.end, T));
        site.style.opacity = op.toFixed(3); site.classList.toggle('faded', op < .01);   // faded: no clicks, but still in the tab order
      } else end();
      window.__intro.state = { T, z, gap, R, header: site.style.opacity === '' ? 1 : +site.style.opacity };

      gl.viewport(0, 0, canvas.width, canvas.height);
      const [fa, peak, fb] = TL.flash, I = (T < peak ? ss(fa, peak, T) : 1 - ss(peak, fb, T)) * .7;
      const C = [gap[0] * dpr, (vh - gap[1]) * dpr];
      if (T < TL.open[1]) {                                                      // 1. night sky + fresco, cut by the window
        gl.clearColor(...INK, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(paint.p); gl.bindVertexArray(quad); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniformMatrix3fv(paint.U.uH, false, M); gl.uniform2f(paint.U.uSize, W, H); gl.uniform1i(paint.U.uTex, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (R > 0) {
          gl.useProgram(hole.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
          gl.uniform2f(hole.U.uC, ...C); gl.uniform1f(hole.U.uR, R * dpr); gl.uniform1f(hole.U.uF, (6 + R * .45) * dpr);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      } else { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      if (I > .001) {                                                            // 2. the flash at the threshold
        gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform2f(light.U.uC, ...C); gl.uniform1f(light.U.uR, Math.min(vw, vh) * .3 * dpr); gl.uniform1f(light.U.uI, I);
        gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...GOLD);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (T < TL.end || review) requestAnimationFrame(frame); else canvas.style.display = 'none';
    }
    requestAnimationFrame(frame);
  })().catch(e => { console.error(e); showcase(); });   // the painting failed to load
  return api;
}

// ?review: replay, scrub and slow down the timeline (design review only; not part of the design).
function buildReviewBar(end, get, set, toggle, setSpeed) {
  const bar = document.createElement('div'); bar.className = 'review';
  bar.innerHTML = `<button type="button">Pause</button><button type="button">Replay</button>
    <input type="range" min="0" max="${end}" step="0.01" aria-label="Time"><output>0.00 s</output>
    <select aria-label="Speed"><option value="1">1×</option><option value="0.5">0.5×</option><option value="0.25">0.25×</option></select>`;
  document.body.append(bar);
  const [play, replay] = bar.querySelectorAll('button'), range = bar.querySelector('input'), out = bar.querySelector('output');
  play.onclick = () => { play.textContent = toggle() ? 'Play' : 'Pause'; };
  replay.onclick = () => set(0);
  range.oninput = () => set(+range.value);
  bar.querySelector('select').onchange = e => setSpeed(+e.target.value);
  (function tick() { const t = get(); if (document.activeElement !== range) range.value = t; out.textContent = `${t.toFixed(2)} s`; requestAnimationFrame(tick); })();
}
