// Fresco intro, final prototype (round 1 approved, #12). Direction A, Starlight (decision #8): stars drift together into the full Creation of Adam,
// the camera pushes straight in to the gap between the fingers (zoom 2, #9; 3524 px image, #10), a gold bloom there
// shrinks into the home page's ring, and the fresco dissolves into the night sky. The header fades out while the painting
// fills the screen (#11). It plays once per browser tab (#13) and not in the zoomed reading layout (#14). Particles are generated on the GPU from the painting texture (gl_VertexID -> cell -> texelFetch).
// Review only: ?review (replay / scrub / speed), ?t=5.9 (freeze at a time); both always play.

const GAP = [1335, 728];   // between the fingertips in the 3524 px image (Adam's 1331,733; God's 1339,723), measured on a 10x crop
const ZOOM = 2;            // screen px per image px at the landing
const STRIDE = 3;          // one particle per 3 x 3 cell: 625,742 particles
const GOLD = [.784, .635, .29];
const TL = { build: [.2, 3.6], push: [2.4, 5.7], flash: [5.5, 5.85, 6.6], fade: [6.0, 7.0], hand: 6.15, caption: 6.6, end: 7.0 };   // seconds; caption waits until the plaster has mostly gone
const SRC = '../../data/fresco-3524.webp';
const SEEN = 'fresco-intro-seen';   // sessionStorage: once per tab

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
uniform sampler2D uTex; uniform mat3 uH; uniform int uCols; uniform float uP, uT, uZ, uDpr, uFade; uniform vec2 uMin, uMax;
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
  vA = mix(star ? .55 * mix(1., .55 + .45 * sin(uT * 1.7 + r1 * 40.), 1. - e) : 0., 1., smoothstep(0., .3, l)) * (1. - gone) * uFade;
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
in vec2 vUV; uniform sampler2D uTex; uniform float uP, uFade; out vec4 o;
${COMMON}
void main() {
  vec2 cell = floor(vUV * uSize / uStride);
  float show = smoothstep(.85, 1., landing(uP, order((cell + .5) * uStride), hash(cell)));
  vec2 m = min(vUV, 1. - vUV) * uSize / uSize.y;
  o = vec4(texture(uTex, vUV).rgb, 1.) * show * smoothstep(0., .015, min(m.x, m.y)) * uFade;
}`;

// The flash: a gold bloom with a warm core at the gap, additive, in device pixels.
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

/** Plays the intro. Returns { done } (a promise) straight away; the home page waits on it. */
export function playIntro() {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, canvas = document.querySelector('#intro'), site = document.querySelector('.site');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let finished = false, skipping = false;
  const finish = () => {
    if (finished) return; finished = true;
    html.classList.remove('intro', 'intro-caption'); canvas.style.display = 'none'; document.querySelector('.intro-still')?.remove();
    site.style.opacity = site.style.transition = ''; site.classList.remove('faded');
    try { sessionStorage.setItem(SEEN, '1'); } catch {}   // storage blocked: it plays again next time, nothing breaks
    window.__intro.doneAt = performance.now(); resolve();
  };
  window.__intro = { startAt: null, doneAt: null, frames: [], Ts: [] };
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch {}
  if (matchMedia('(hover: none), (pointer: coarse)').matches                       // computer only (creation-redesign #21)
      || matchMedia('(max-width: 900px), (max-height: 560px)').matches                // the zoomed reading layout (#14)
      || (seen && !review && !q.has('t'))) { window.__intro.skipped = true; finish(); return { done }; }   // already played in this tab (#13)
  html.classList.add('intro', 'intro-caption');

  // Skip intro / Esc: fade out over 300 ms, then the home page. "Skip to the projects" ends it at once.
  const skip = () => {
    if (finished || skipping) return; skipping = true;
    for (const el of [canvas, document.querySelector('.intro-still')]) if (el) { el.style.transition = 'opacity .3s'; el.style.opacity = 0; }
    Object.assign(site.style, { transition: 'opacity .3s', opacity: 1 }); site.classList.remove('faded');
    html.classList.remove('intro', 'intro-caption'); setTimeout(finish, 300);
  };
  document.querySelector('.skip-intro').addEventListener('click', skip);
  addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', finish);

  if (reduced) {   // the still fresco, then a cross-fade into the page
    document.querySelector('#projects').addEventListener('focusin', skip);   // the projects are already shown under the still: never hide a focused link (WCAG 2.4.11)
    const img = Object.assign(new Image(), { src: SRC, alt: '', className: 'intro-still' });
    img.decode().then(() => {
      canvas.after(img); window.__intro.startAt = performance.now();
      setTimeout(() => { if (skipping) return; img.style.transition = 'opacity .4s'; img.style.opacity = 0; html.classList.remove('intro'); setTimeout(finish, 400); }, 2000);
    }, finish);
    return { done };
  }

  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { finish(); return { done }; }   // no WebGL2: the page as it is today
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

    // The push: zoom in log space toward the gap so it slides straight to the screen centre.
    function camera(T, vw, vh) {
      const z0 = Math.min(vw * .9 / W, vh * .78 / H), e = ease(clamp01((T - TL.push[0]) / (TL.push[1] - TL.push[0])));
      const z = Math.exp(lerp(Math.log(z0), Math.log(ZOOM), e)), k = z0 * (1 - e) / z;
      return { cx: GAP[0] + (W / 2 - GAP[0]) * k, cy: GAP[1] + (H / 2 - GAP[1]) * k, z };
    }
    // D4: the header is readable over the night sky; it fades as the painting's top edge rises behind its text, and
    // comes back while the fresco dissolves. Kept (on a solid band, intro.css) while it holds keyboard focus.
    let textBottom = 0;
    const measure = () => { textBottom = Math.max(...[...site.children].map(c => c.getBoundingClientRect().bottom)); };
    measure(); addEventListener('resize', measure);
    function header(top, fade) {
      if (skipping) return;
      const op = site.matches(':focus-within') ? 1 : Math.max(ss(textBottom - 8, textBottom + 48, top), ss(.5, 1, 1 - fade));
      site.style.opacity = op.toFixed(3); site.classList.toggle('faded', op < .01);   // faded: no clicks, but still in the tab order
    }

    let T = q.has('t') ? +q.get('t') : 0, speed = 1, paused = q.has('t'), last = performance.now();
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, count: cols * rows });
    if (review) buildReviewBar(TL.end, () => T, t => { T = t; }, () => (paused = !paused), s => { speed = s; });
    window.__intro.startAt = performance.now();

    function frame(now) {
      if (finished) return;
      const dt = Math.min((now - last) / 1000, .1); last = now;
      if (!paused) T += dt * speed;
      window.__intro.frames.push(now); window.__intro.Ts.push(T);
      if (!skipping) { html.classList.toggle('intro', T < TL.hand); html.classList.toggle('intro-caption', T < TL.caption); }
      if (T >= TL.end && !review) { finish(); return; }
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const cam = camera(T, vw, vh), P = ss(...TL.build, T), fade = 1 - ss(...TL.fade, T);
      const M = [2 * cam.z / vw, 0, 0, 0, -2 * cam.z / vh, 0, -2 * cam.z * cam.cx / vw, 2 * cam.z * cam.cy / vh, 1];   // image px -> clip
      const gap = [(GAP[0] - cam.cx) * cam.z + vw / 2, (GAP[1] - cam.cy) * cam.z + vh / 2];
      header((0 - cam.cy) * cam.z + vh / 2, fade);
      window.__intro.state = { T, cam, gap, P, header: +site.style.opacity };

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const common = prog => {
        gl.useProgram(prog.p); gl.uniformMatrix3fv(prog.U.uH, false, M);
        gl.uniform2f(prog.U.uSize, W, H); gl.uniform2f(prog.U.uGap, ...GAP); gl.uniform1f(prog.U.uStride, STRIDE);
        gl.uniform1f(prog.U.uP, P); gl.uniform1f(prog.U.uFade, fade); gl.uniform1i(prog.U.uTex, 0);
      };
      common(paint); gl.bindVertexArray(quad);                       // 1. the landed painting
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (P < .999 && fade > 0) {                                     // 2. particles still waiting or in flight
        common(particle); gl.bindVertexArray(empty);
        gl.uniform1i(particle.U.uCols, cols); gl.uniform1f(particle.U.uT, now / 1000); gl.uniform1f(particle.U.uZ, cam.z); gl.uniform1f(particle.U.uDpr, dpr);
        gl.uniform2f(particle.U.uMin, -W * .1, -H * .3); gl.uniform2f(particle.U.uMax, W * 1.1, H * 1.3);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, cols * rows);
      }
      const [a, peak, b] = TL.flash, I = (T < peak ? ss(a, peak, T) : 1 - ss(peak, b, T)) * .7;   // 3. the flash
      if (I > .001) {
        const m = Math.min(vw, vh), R = T < peak ? lerp(30, m * .2, ss(a, peak, T)) : lerp(m * .2, 22, ss(peak, b, T));   // shrinks into the 44 px ring
        gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform2f(light.U.uC, gap[0] * dpr, (vh - gap[1]) * dpr); gl.uniform1f(light.U.uR, R * dpr); gl.uniform1f(light.U.uI, I);
        gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...GOLD);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })().catch(e => { console.error(e); finish(); });   // the painting failed to load: the page as it is today
  return { done };
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
