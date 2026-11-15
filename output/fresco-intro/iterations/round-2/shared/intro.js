// Fresco intro, round 2 (Amendment 1). Starlight (#8): stars form the full Creation of Adam while the camera zooms in at
// the same time (#18) to the gap between the fingers (zoom 2, #9; 3524 px image, #10); a gold bloom there; then the camera
// pulls back and the fresco settles beside the project cards (#17). The header fades while the painting fills the screen
// (#11). Once per tab (#13); the reading layout (#14), reduced motion and a repeat visit get the showcase at once.
// Particles are generated on the GPU from the painting texture (gl_VertexID -> cell -> texelFetch).
// Review only: ?review (replay / scrub / speed), ?t=4.2 (freeze at a time).

const GAP = [1335, 728];   // between the fingertips in the 3524 px image (Adam's 1331,733; God's 1339,723), measured on a 10x crop
const ZOOM = 2;            // screen px per image px at the landing
const STRIDE = 3;          // one particle per 3 x 3 cell: 625,742 particles
const GOLD = [.784, .635, .29];
const TL = { build: [.2, 4.0], push: [.2, 4.0], flash: [3.9, 4.2, 4.9], pull: [4.5, 5.8], reveal: 5.3, end: 5.8 };   // seconds
const SRC = '/public/creation/fresco.webp';   // the site serves it as /creation/fresco.webp
const SEEN = 'fresco-intro-seen';             // sessionStorage: once per tab

const q = new URLSearchParams(location.search);
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;

const COMMON = `
uniform vec2 uSize, uGap; uniform float uStride;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
// When this spot lands, 0..1: from the edges in, the gap last, in drifting patches.
float order(vec2 w) { return clamp(.65 * (1. - distance(w, uGap) / (length(uSize) * .62)) + .35 * vnoise(w / (uSize.x * .06)), 0., 1.); }
float landing(float p, float t, float jitter) { float l = clamp((p - t * .8 - jitter * .05) / .15, 0., 1.); return 1. - pow(1. - l, 3.); }`;

// Particles: 1 in 10 waits as a twinkling star anywhere; the rest set off from near home. They roll in and vanish on landing.
const PARTICLE_VS = `#version 300 es
uniform sampler2D uTex; uniform mat3 uH; uniform int uCols; uniform float uP, uT, uZ, uDpr; uniform vec2 uMin, uMax;
out vec4 vColor; out float vE, vA, vAng;
${COMMON}
void main() {
  vec2 cell = vec2(gl_VertexID % uCols, gl_VertexID / uCols), home = (cell + .5) * uStride;
  float r1 = hash(cell), r2 = hash(cell + 17.3), r3 = hash(cell + 41.9), r4 = hash(cell + 7.1), t = order(home);
  float l = clamp((uP - t * .8 - r1 * .05) / .15, 0., 1.), e = landing(uP, t, r1);
  bool star = r4 < .1;
  vec2 start = star ? mix(uMin, uMax, vec2(r2, r3)) : home + vec2(cos(r2 * 6.2832), sin(r2 * 6.2832)) * mix(60., 360., r3);
  start += vec2(sin(uT * .3 + r1 * 6.28), cos(uT * .27 + r2 * 6.28)) * 6.;
  vec2 d = home - start; float ang = (1. - e) * 12. + r2 * 6.2832;
  vec2 pos = mix(start, home, e) + vec2(-d.y, d.x) * (r1 < .5 ? -1. : 1.) * .18 * sin(3.1416 * e) + vec2(cos(ang), sin(ang)) * (1. - e) * 18.;
  vec3 h = uH * vec3(pos, 1.);
  gl_Position = vec4(h.xy, 0., h.z);
  float settled = uStride * uZ * uDpr + .6, gone = smoothstep(.97, 1., e);
  gl_PointSize = gone >= 1. ? 0. : mix(1.6 * uDpr, settled, e) + sin(3.1416 * e) * max(settled * .6, 1.5);
  vColor = texelFetch(uTex, ivec2(home), 0); vE = e; vAng = ang;
  vA = mix(star ? .55 * mix(1., .55 + .45 * sin(uT * 1.7 + r1 * 40.), 1. - e) : 0., 1., smoothstep(0., .3, l)) * (1. - gone);
}`;
const PARTICLE_FS = `#version 300 es
precision mediump float;
in vec4 vColor; in float vE, vA, vAng; out vec4 o;
void main() {
  vec2 pc = gl_PointCoord * 2. - 1.; float r2 = dot(pc, pc);
  if (r2 > 1.) discard;
  vec3 n = vec3(pc, sqrt(1. - r2)), L = normalize(vec3(cos(vAng), sin(vAng), 1.2));
  float diff = max(dot(n, L), 0.), spec = pow(max(reflect(-L, n).z, 0.), 24.);
  o = vec4(mix(vColor.rgb * (.45 + .75 * diff) + spec * .35, vec3(1., .93, .78), .3 * (1. - vE)), vA * smoothstep(1., .35, r2));
}`;

// The painting itself, shown wherever its particles have landed (smooth when zoomed in), with a soft edge.
const PAINT_VS = `#version 300 es
in vec2 aPos; uniform mat3 uH; uniform vec2 uSize; out vec2 vUV;
void main() { vUV = aPos; vec3 h = uH * vec3(aPos * uSize, 1.); gl_Position = vec4(h.xy, 0., h.z); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV; uniform sampler2D uTex; uniform float uP; out vec4 o;
${COMMON}
void main() {
  vec2 cell = floor(vUV * uSize / uStride);
  float show = smoothstep(.85, 1., landing(uP, order((cell + .5) * uStride), hash(cell)));
  vec2 m = min(vUV, 1. - vUV) * uSize / uSize.y;
  o = vec4(texture(uTex, vUV).rgb, 1.) * show * smoothstep(0., .015, min(m.x, m.y));
}`;

// The light: a gold bloom with a warm core at the gap, additive, in device pixels.
const LIGHT_VS = `#version 300 es
void main() { gl_Position = vec4(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1., 0., 1.); }`;
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

// Where the fresco rests beside the cards (from creation.js's reveal framing): the right 62% of the screen; in the
// reading layout (<= 900 px wide or <= 560 px tall, creation.css) across the top, cards below.
function restFrame(W, H, vw, vh) {
  const narrow = vw <= 900 || vh <= 560;
  const x0 = vw * (narrow ? .04 : .36), x1 = vw * (narrow ? .96 : .98), y0 = vh * (narrow ? .14 : .05), y1 = vh * (narrow ? .52 : .95);
  return { z: Math.min((x1 - x0) / W, (y1 - y0) / H), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/**
 * Plays the opening into the showcase. Returns at once: { done (promise: the showcase is live), toShowcase(), bloom() }.
 * onFrame(state): state = { T, revealed, restGap: [x, y] (the gap on screen once settled) }.
 */
export function playIntro({ onFrame } = {}) {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, canvas = document.querySelector('#intro'), site = document.querySelector('.site');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch {}
  const atOnce = reduced || matchMedia('(max-width: 900px), (max-height: 560px)').matches || (seen && !review && !q.has('t'));
  let T = q.has('t') ? +q.get('t') : atOnce ? TL.end : 0, paused = q.has('t'), speed = 1, bloomAt = -1, fading = false, ended = false;
  window.__intro = { startAt: null, doneAt: null, atOnce, frames: [], Ts: [] };
  const end = () => {                      // the showcase is live
    if (ended) return; ended = true;
    site.style.opacity = ''; site.classList.remove('faded');
    try { sessionStorage.setItem(SEEN, '1'); } catch {}   // storage blocked: it plays again next time, nothing breaks
    window.__intro.doneAt = performance.now(); resolve();
  };
  const fallback = () => { html.classList.remove('intro'); html.classList.add('static', 'revealed'); canvas.style.display = 'none'; end(); };   // the still fresco
  const api = {
    done,
    toShowcase() { T = Math.max(T, TL.end); },   // "Skip to the projects": straight there
    bloom() { if (!reduced) bloomAt = performance.now(); },
  };
  if (atOnce) html.classList.add('revealed'); else html.classList.add('intro');

  // Skip intro / Esc: a quick dip to the night sky, then the showcase.
  const skip = () => {
    if (T >= TL.reveal || fading) return; fading = true;
    canvas.style.transition = 'opacity .25s'; canvas.style.opacity = 0;
    setTimeout(() => { T = TL.end; canvas.style.opacity = 1; fading = false; }, 250);
  };
  document.querySelector('.skip-intro').addEventListener('click', skip);
  addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });

  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { fallback(); return api; }   // no WebGL2
  (async () => {
    const bmp = await createImageBitmap(await (await fetch(SRC)).blob());
    const W = bmp.width, H = bmp.height, cols = Math.floor(W / STRIDE), rows = Math.floor(H / STRIDE);
    const particle = compile(gl, PARTICLE_VS, PARTICLE_FS), paint = compile(gl, PAINT_VS, PAINT_FS), light = compile(gl, LIGHT_VS, LIGHT_FS);
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

    // The camera as the gap's place on screen and the zoom. In: from the fitted painting to the centre at ZOOM, while it
    // forms. Out: from the centre to where the gap rests beside the cards. Zoom moves in log space and the gap on a straight
    // line, so the move reads as one steady push and one steady pull.
    function camera(T, vw, vh) {
      const fit = Math.min(vw * .9 / W, vh * .78 / H), rest = restFrame(W, H, vw, vh);
      const fitGap = [(GAP[0] - W / 2) * fit + vw / 2, (GAP[1] - H / 2) * fit + vh / 2];
      const restGap = [(GAP[0] - W / 2) * rest.z + rest.cx, (GAP[1] - H / 2) * rest.z + rest.cy];
      const inE = ease(clamp01((T - TL.push[0]) / (TL.push[1] - TL.push[0]))), outE = ease(clamp01((T - TL.pull[0]) / (TL.pull[1] - TL.pull[0])));
      const [from, to, zA, zB, e] = T < TL.pull[0] ? [fitGap, [vw / 2, vh / 2], fit, ZOOM, inE] : [[vw / 2, vh / 2], restGap, ZOOM, rest.z, outE];
      return { gap: [lerp(from[0], to[0], e), lerp(from[1], to[1], e)], z: Math.exp(lerp(Math.log(zA), Math.log(zB), e)), restGap };
    }
    // D4: during the opening the header fades as the painting's top edge rises behind its text and returns as it settles.
    let textBottom = 0;
    const measure = () => { textBottom = Math.max(...[...site.children].map(c => c.getBoundingClientRect().bottom)); };
    measure(); addEventListener('resize', measure);

    if (review) buildReviewBar(TL.end, () => T, t => { T = t; }, () => (paused = !paused), s => { speed = s; });
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, count: cols * rows, startAt: performance.now() });
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      if (!paused) T = Math.min(T + dt * speed, TL.end);
      if (!ended) { window.__intro.frames.push(now); window.__intro.Ts.push(T); }
      html.classList.toggle('intro', T < TL.reveal);
      html.classList.toggle('revealed', T >= TL.reveal);
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const cam = camera(T, vw, vh), z = cam.z, P = ss(...TL.build, T);
      const cx = GAP[0] - (cam.gap[0] - vw / 2) / z, cy = GAP[1] - (cam.gap[1] - vh / 2) / z;   // the image point at the screen centre
      const M = [2 * z / vw, 0, 0, 0, -2 * z / vh, 0, -2 * z * cx / vw, 2 * z * cy / vh, 1];      // image px -> clip
      if (T < TL.end) {
        const top = (0 - cy) * z + vh / 2, op = site.matches(':focus-within') ? 1 : ss(textBottom - 8, textBottom + 48, top);
        site.style.opacity = op.toFixed(3); site.classList.toggle('faded', op < .01);   // faded: no clicks, but still in the tab order
      } else end();
      window.__intro.state = { T, z, gap: cam.gap, restGap: cam.restGap, P, header: site.style.opacity === '' ? 1 : +site.style.opacity };

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const common = prog => {
        gl.useProgram(prog.p); gl.uniformMatrix3fv(prog.U.uH, false, M);
        gl.uniform2f(prog.U.uSize, W, H); gl.uniform2f(prog.U.uGap, ...GAP); gl.uniform1f(prog.U.uStride, STRIDE);
        gl.uniform1f(prog.U.uP, P); gl.uniform1i(prog.U.uTex, 0);
      };
      common(paint); gl.bindVertexArray(quad);                       // 1. the landed painting
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (P < .999) {                                                 // 2. particles still waiting or in flight
        common(particle); gl.bindVertexArray(empty);
        gl.uniform1i(particle.U.uCols, cols); gl.uniform1f(particle.U.uT, now / 1000); gl.uniform1f(particle.U.uZ, z); gl.uniform1f(particle.U.uDpr, dpr);
        gl.uniform2f(particle.U.uMin, -W * .1, -H * .3); gl.uniform2f(particle.U.uMax, W * 1.1, H * 1.3);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, cols * rows);
      }
      // 3. the light: the opening's bloom (rises to 20% of the short side, then shrinks as the camera pulls back), or a small
      // bloom each time a new project comes to rest.
      const m = Math.min(vw, vh), [a, peak, b] = TL.flash, age = (now - bloomAt) / 1000;
      let I = (T < peak ? ss(a, peak, T) : 1 - ss(peak, b, T)) * .7, R = T < peak ? lerp(30, m * .2, ss(a, peak, T)) : lerp(m * .2, 22, ss(peak, b, T));
      if (bloomAt >= 0 && age < .9) { I = (age < .2 ? ss(0, .2, age) : 1 - ss(.2, .9, age)) * .55; R = lerp(12, m * .07, ss(0, .3, age)); }
      if (I > .001) {
        gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform2f(light.U.uC, cam.gap[0] * dpr, (vh - cam.gap[1]) * dpr); gl.uniform1f(light.U.uR, R * dpr); gl.uniform1f(light.U.uI, I);
        gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...GOLD);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      onFrame?.({ T, revealed: T >= TL.reveal, restGap: cam.restGap });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })().catch(e => { console.error(e); fallback(); });   // the painting failed to load
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
