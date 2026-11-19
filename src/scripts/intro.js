// The home page's opening (design: output/fresco-intro/design-spec.md, round 5). The camera opens close on God's face in
// Michelangelo's full Creation of Adam and sweeps along his arm to the gap between the fingers (zoom 2, #9), the figures
// moving against the plaster and the focus pulling onto the fingers; dust drifts, light runs along the plaster's cracks to
// the gap and rays fan out; the fingertips reach across and touch, with a spark (#33, #34). Then the camera dives into the
// gap, the whole screen flashes warm white (#30), and at its peak the projects are simply there (#20, #22, #23). The header
// is hidden during the opening (#32). Once per tab (#13); reduced motion, the reading layout (#14), a repeat visit, no
// WebGL and a fresco still loading after 4 s get the projects at once.
// Review only: ?review (replay / scrub / speed, a switch per idea), ?t=3.6 (freeze at a time), ?fx=camera,depth,light,touch.

const GAP = [1335, 728], ADAM_TIP = [1331, 733], GOD_TIP = [1339, 723];   // 3524 px image, measured on a 10x crop
const ADAM_DIR = [.68, .73], GOD_DIR = [-.99, .12];                        // each index finger's direction, towards its tip
// God's face, shoulder, elbow, wrist: creation-redesign's traced arm, moved into the full image (crop at 1339, 43). x, y, zoom.
const ARM = [[2029, 358, 1.3], [1899, 588, 1.55], [1729, 643, 1.75], [1554, 693, 1.9]];
const ZOOM = 2, THROUGH = 16, START_X = 1530;
const INK = [31 / 255, 29 / 255, 26 / 255], GOLD = [.784, .635, .29];
// seconds. cam: move in and land on the gap; focus: the edges soften; cracks: the light front runs in; touch: the fingers
// meet (spark at its end); bloom / rays: light gathers; enter: the dive; flash: rise, peak (the projects appear), gone.
const TL = { cam: [0, 3.0], focus: [1.4, 3.0], cracks: [2.2, 3.5], touch: [3.0, 3.55], bloom: [3.55, 3.95], rays: [3.3, 3.95],
             enter: [3.7, 4.5], flash: [3.95, 4.15, 4.7], end: 4.7 };
const SRC = '/creation/fresco.webp', DEPTH = '/creation/fresco-depth.png';
const SEEN = 'fresco-intro-seen';
const DUST = 420;

const q = new URLSearchParams(location.search);
const FX = new Set((q.get('fx') ?? 'touch,light,depth,camera').split(',').filter(f => f && f !== 'none'));
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const pulse = (T, a, peak, b) => T < peak ? ss(a, peak, T) : 1 - ss(peak, b, T);

const PAINT_VS = `#version 300 es
in vec2 aPos; uniform mat3 uH; uniform vec2 uSize; out vec2 vUV;
void main() { vUV = aPos; vec3 h = uH * vec3(aPos * uSize, 1.); gl_Position = vec4(h.xy, 0., h.z); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex, uDepth;
uniform vec2 uSize, uFocus, uPar; uniform float uMag;                 // depth: shift (image px) and swell of the figures
uniform float uTouch; uniform vec2 uAdamTip, uGodTip, uAdamDir, uGodDir;
uniform float uBlur; uniform vec2 uFocusPx, uRes;                     // focus pull
uniform float uCrackR, uCrackI; uniform vec3 uGold;                   // light along the cracks
out vec4 o;
float lum(vec3 c) { return dot(c, vec3(.3, .59, .11)); }
float seg(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; return distance(p, a + ab * clamp(dot(p - a, ab) / dot(ab, ab), 0., 1.)); }
void main() {
  vec2 w = vUV * uSize;
  float d = texture(uDepth, vUV).r;
  w -= d * (uPar + (w - uFocus) * uMag);                              // the figures slide and swell against the plaster
  if (uTouch > 0.) {                                                  // each fingertip reaches the midline between them
    vec2 mid = (uAdamTip + uGodTip) * .5, n = normalize(uAdamTip - uGodTip);
    float adam = smoothstep(-2.5, 2.5, dot(w - mid, n));             // 1 on Adam's side of the midline, 0 on God's (soft: no seam)
    float wa = exp(-pow(seg(w, mid, uAdamTip - uAdamDir * 24.) / 8., 2.)) * adam;
    float wg = exp(-pow(seg(w, mid, uGodTip - uGodDir * 24.) / 8., 2.)) * (1. - adam);
    w += uTouch * 1.15 * (wa * (uAdamTip - mid) + wg * (uGodTip - mid));   // sample from further back along each finger
  }
  vec2 uv = w / uSize;
  float edge = smoothstep(.16, .7, distance(gl_FragCoord.xy, uFocusPx) / length(uRes));
  vec3 c = texture(uTex, uv, uBlur * edge).rgb;
  if (uCrackI > 0.) {                                                 // thin dark lines on light plaster, lit by a front
    float sharp = lum(textureLod(uTex, uv, 0.).rgb), soft = lum(textureLod(uTex, uv, 3.).rgb);
    float crack = smoothstep(.03, .12, soft - sharp) * smoothstep(.55, .7, soft) * (1. - d);
    float r = distance(w, uFocus);
    c += uGold * crack * uCrackI * (exp(-pow((r - uCrackR) / 90., 2.)) * 1.6 + .45 * smoothstep(uCrackR, uCrackR + 220., r));
  }
  o = vec4(c, 1.);
}`;
const FULL_VS = `#version 300 es
void main() { gl_Position = vec4(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1., 0., 1.); }`;
// The light at the gap: gold bloom with a warm core, rays fanning out, the spark at contact. Additive, device px.
const LIGHT_FS = `#version 300 es
precision highp float;
uniform vec2 uC; uniform float uR, uI, uRays, uSpark, uT, uDpr; uniform vec3 uColor; out vec4 o;
void main() {
  vec2 p = gl_FragCoord.xy - uC; float d = length(p), a = atan(p.y, p.x);
  vec3 c = uColor * uI * exp(-pow(d / uR, 2.)) + vec3(1., .97, .9) * uI * .5 * exp(-pow(d / (uR * .15 + uDpr), 2.));
  float rays = pow(.5 + .5 * sin(a * 11. + uT * .4) * sin(a * 7. - uT * .3 + 1.3), 4.);
  c += uColor * uRays * rays * exp(-d / (uR * 2.2)) * smoothstep(0., 24. * uDpr, d);
  c += vec3(1., .96, .85) * uSpark * exp(-pow(d / (7. * uDpr), 2.));
  o = vec4(c, 0.);
}`;
// Dust in the air, in front of the painting: drifts slowly, moves with the camera (nearer motes move more) and streams
// outward during the dive. Additive points.
const DUST_VS = `#version 300 es
uniform vec2 uRes, uCam; uniform float uZ, uDive, uT, uA, uDpr; out float vA;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float i = float(gl_VertexID), near = mix(.5, 1.8, hash(i * 3.1));
  vec2 seed = vec2(hash(i * 1.7), hash(i * 9.3));
  vec2 drift = vec2(sin(uT * .23 + i) * .01, -uT * .012 * near);
  vec2 p = fract(seed - uCam * uZ * near / uRes * 1.2 + drift);
  p = .5 + (p - .5) * pow(uDive, .55 * near);
  gl_Position = vec4(p * 2. - 1., 0., 1.); gl_Position.y *= -1.;
  gl_PointSize = mix(1.2, 3.4, hash(i * 5.7)) * near * uDpr;
  vA = uA * (.35 + .65 * (.5 + .5 * sin(uT * 1.3 + i * 2.1)));
}`;
const DUST_FS = `#version 300 es
precision mediump float;
in float vA; out vec4 o;
void main() { vec2 pc = gl_PointCoord * 2. - 1.; float r2 = dot(pc, pc); if (r2 > 1.) discard; o = vec4(vec3(1., .93, .78) * vA * (1. - r2), 0.); }`;

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
const texture = (gl, unit, bmp, mips) => {
  gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
  if (mips) gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
};
const bitmap = async url => createImageBitmap(await (await fetch(url)).blob());

/** Plays the opening into the projects. Returns at once: { done (promise: the projects are live), toShowcase() }. */
export function playIntro() {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, canvas = document.querySelector('#intro'), flash = document.querySelector('.flash');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch {}
  const atOnce = reduced || matchMedia('(max-width: 900px), (max-height: 560px)').matches || (seen && !review && !q.has('t'));
  const reveal = TL.flash[1];
  let T = q.has('t') ? +q.get('t') : atOnce ? TL.end : 0, paused = q.has('t'), speed = 1, fading = false, ended = false, started = false;
  window.__intro = { startAt: null, doneAt: null, atOnce, fx: [...FX], frames: [], Ts: [] };
  const end = () => {
    if (ended) return; ended = true;
    try { sessionStorage.setItem(SEEN, '1'); } catch {}
    window.__intro.doneAt = performance.now(); resolve();
  };
  const showcase = () => { html.classList.remove('intro'); html.classList.add('revealed'); canvas.style.display = 'none'; flash.style.opacity = 0; end(); };
  // Before the first frame nothing moves the clock, so skipping goes straight to the projects.
  const api = { done, toShowcase() { T = Math.max(T, TL.end); if (!started) showcase(); } };
  if (atOnce && !q.has('t')) { showcase(); return api; }
  html.classList.add('intro');

  const skip = () => {
    if (!started) return showcase();
    if (T >= reveal || fading) return; fading = true;
    canvas.style.transition = 'opacity .25s'; canvas.style.opacity = 0;
    setTimeout(() => { T = TL.end; fading = false; }, 250);
  };
  document.querySelector('.skip-intro').addEventListener('click', skip);
  addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });

  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { showcase(); return api; }
  setTimeout(() => { if (!started) showcase(); }, 4000);   // the fresco hasn't arrived (slow or stalled connection)
  (async () => {
    const [bmp, depth] = await Promise.all([bitmap(SRC), FX.has('depth') ? bitmap(DEPTH) : null]);
    if (ended) return;   // skipped or timed out while loading: the projects are already up
    started = true;
    const W = bmp.width, H = bmp.height;
    const paint = compile(gl, PAINT_VS, PAINT_FS), light = compile(gl, FULL_VS, LIGHT_FS), dust = compile(gl, DUST_VS, DUST_FS);
    texture(gl, 0, bmp, true);
    texture(gl, 1, depth ?? new ImageData(1, 1), false);   // no depth: a single black texel (flat)
    const quad = gl.createVertexArray(), empty = gl.createVertexArray();
    gl.bindVertexArray(quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(paint.p, 'aPos');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);

    // The camera: its centre in image px, zoom and roll. Straight: from the painting covering the screen in to the gap
    // (round 4). Cinematic: close on God's face, along his arm to the gap (Catmull-Rom through the keys), roll settling.
    // Both land with the gap at the screen centre at ZOOM, then dive. Kept inside the painting wherever that is possible.
    function camera(T, vw, vh) {
      const cover = Math.max(vw / W, vh / H), t = clamp01((T - TL.cam[0]) / (TL.cam[1] - TL.cam[0]));
      let cx, cy, z, roll = 0;
      if (FX.has('camera')) {
        const keys = [...ARM, [...GAP, ZOOM]], k2 = [keys[0], ...keys, keys[keys.length - 1]];
        const u = ss(0, 1, t) * (keys.length - 1), i = Math.min(Math.floor(u), keys.length - 2), f = u - i;
        const cr = (a, b, c, d) => .5 * (2 * b + (c - a) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (3 * b - a - 3 * c + d) * f * f * f);
        const [A, B, C, D] = [k2[i], k2[i + 1], k2[i + 2], k2[i + 3]];
        [cx, cy] = [cr(A[0], B[0], C[0], D[0]), cr(A[1], B[1], C[1], D[1])];
        z = Math.max(Math.exp(cr(...[A, B, C, D].map(k => Math.log(k[2])))), cover);
        roll = lerp(-.06, 0, ease(t));
      } else {
        const e = ease(t), half = vw / 2 / cover, sx = Math.min(Math.max(START_X * W / 3524, half), W - half);
        const from = [(GAP[0] - sx) * cover + vw / 2, (GAP[1] - H / 2) * cover + vh / 2], g = [lerp(from[0], vw / 2, e), lerp(from[1], vh / 2, e)];
        z = Math.exp(lerp(Math.log(cover), Math.log(ZOOM), e)); cx = GAP[0] - (g[0] - vw / 2) / z; cy = GAP[1] - (g[1] - vh / 2) / z;
      }
      const ex = (vw / 2 * Math.cos(roll) + vh / 2 * Math.abs(Math.sin(roll))) / z, ey = (vh / 2 * Math.cos(roll) + vw / 2 * Math.abs(Math.sin(roll))) / z;
      if (2 * ex < W) cx = Math.min(Math.max(cx, ex), W - ex);
      if (2 * ey < H) cy = Math.min(Math.max(cy, ey), H - ey);
      z *= (THROUGH / ZOOM) ** (clamp01((T - TL.enter[0]) / (TL.enter[1] - TL.enter[0])) ** 3);
      return { cx, cy, z, roll };
    }

    if (review) buildReviewBar(TL.end, () => T, t => { T = t; }, () => (paused = !paused), s => { speed = s; });
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, startAt: performance.now() });
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      if (!paused) T = Math.min(T + dt * speed, TL.end);
      if (!ended) { window.__intro.frames.push(now); window.__intro.Ts.push(T); }
      html.classList.toggle('intro', T < reveal);
      html.classList.toggle('revealed', T >= reveal);
      const [fa, , fb] = TL.flash;
      flash.style.opacity = (T < reveal ? ss(fa, reveal, T) : 1 - ss(reveal, fb, T)).toFixed(3);
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const { cx, cy, z, roll } = camera(T, vw, vh), c = Math.cos(roll), s = Math.sin(roll);
      const M = [2 * z * c / vw, -2 * z * s / vh, 0, -2 * z * s / vw, -2 * z * c / vh, 0,
                 2 * z * (-c * cx + s * cy) / vw, 2 * z * (s * cx + c * cy) / vh, 1];                  // image px -> clip (with roll)
      const gap = [vw / 2 + z * (c * (GAP[0] - cx) - s * (GAP[1] - cy)), vh / 2 + z * (s * (GAP[0] - cx) + c * (GAP[1] - cy))];
      if (T >= TL.end) end();
      window.__intro.state = { T, z, roll, cam: [cx, cy], gap, flash: +flash.style.opacity };

      gl.viewport(0, 0, canvas.width, canvas.height);
      canvas.style.visibility = T < reveal ? '' : 'hidden';
      if (T < reveal) {
        const C = [gap[0] * dpr, (vh - gap[1]) * dpr], m = Math.min(vw, vh);
        gl.clearColor(...INK, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(paint.p); gl.bindVertexArray(quad); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const P = paint.U, dive = clamp01((T - TL.enter[0]) / (TL.enter[1] - TL.enter[0]));
        gl.uniformMatrix3fv(P.uH, false, M); gl.uniform2f(P.uSize, W, H); gl.uniform1i(P.uTex, 0); gl.uniform1i(P.uDepth, 1);
        gl.uniform2f(P.uFocus, ...GAP);
        // depth: nearer layers lead the camera (shift fades to 0 as it lands) and swell as it closes in and dives
        const lead = FX.has('depth') ? .06 : 0;
        gl.uniform2f(P.uPar, (GAP[0] - cx) * lead, (GAP[1] - cy) * lead);
        gl.uniform1f(P.uMag, FX.has('depth') ? .05 * ss(...TL.cam, T) + .12 * dive : 0);
        gl.uniform1f(P.uBlur, FX.has('depth') ? 2.6 * ss(...TL.focus, T) : 0);
        gl.uniform2f(P.uFocusPx, ...C); gl.uniform2f(P.uRes, canvas.width, canvas.height);
        gl.uniform1f(P.uTouch, FX.has('touch') ? ease(clamp01((T - TL.touch[0]) / (TL.touch[1] - TL.touch[0]))) : 0);
        gl.uniform2f(P.uAdamTip, ...ADAM_TIP); gl.uniform2f(P.uGodTip, ...GOD_TIP); gl.uniform2f(P.uAdamDir, ...ADAM_DIR); gl.uniform2f(P.uGodDir, ...GOD_DIR);
        gl.uniform1f(P.uCrackI, FX.has('light') ? ss(TL.cracks[0], TL.cracks[0] + .4, T) * (1 - ss(TL.bloom[0], TL.bloom[1], T) * .5) : 0);
        gl.uniform1f(P.uCrackR, lerp(1500, 0, ss(...TL.cracks, T))); gl.uniform3f(P.uGold, ...GOLD);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (FX.has('light')) {                                                                   // dust in the light
          gl.useProgram(dust.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
          gl.uniform2f(dust.U.uRes, vw, vh); gl.uniform2f(dust.U.uCam, cx, cy); gl.uniform1f(dust.U.uZ, z);
          gl.uniform1f(dust.U.uDive, (THROUGH / ZOOM) ** (dive ** 3)); gl.uniform1f(dust.U.uT, now / 1000); gl.uniform1f(dust.U.uDpr, dpr);
          gl.uniform1f(dust.U.uA, ss(.2, 1.4, T) * (.35 + .65 * ss(TL.cracks[0], TL.bloom[1], T)));
          gl.drawArrays(gl.POINTS, 0, DUST);
        }
        const touch = FX.has('touch'), I = ss(...(touch ? TL.bloom : [3.45, 3.8]), T) * .7;
        const rays = FX.has('light') ? ss(...TL.rays, T) * .55 : 0, spark = touch ? pulse(T, TL.touch[1] - .06, TL.touch[1], TL.touch[1] + .25) * 1.4 : 0;
        if (I > .001 || rays > .001 || spark > .001) {
          gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
          gl.uniform2f(light.U.uC, ...C); gl.uniform1f(light.U.uR, m * .2 * dpr); gl.uniform1f(light.U.uI, I);
          gl.uniform1f(light.U.uRays, rays); gl.uniform1f(light.U.uSpark, spark); gl.uniform1f(light.U.uT, now / 1000);
          gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...GOLD);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      if (T < TL.end || review) requestAnimationFrame(frame); else canvas.style.display = 'none';
    }
    requestAnimationFrame(frame);
  })().catch(e => { console.error(e); showcase(); });
  return api;
}

// ?review: replay, scrub, slow down, and switch each idea on or off (reloads with the new ?fx).
function buildReviewBar(end, get, set, toggle, setSpeed) {
  const bar = document.createElement('div'); bar.className = 'review';
  bar.innerHTML = `<button type="button">Pause</button><button type="button">Replay</button>
    <input type="range" min="0" max="${end}" step="0.01" aria-label="Time"><output>0.00 s</output>
    <select aria-label="Speed"><option value="1">1×</option><option value="0.5">0.5×</option><option value="0.25">0.25×</option></select>
    ${['camera', 'depth', 'light', 'touch'].map(f => `<label><input type="checkbox" value="${f}"${FX.has(f) ? ' checked' : ''}> ${f}</label>`).join('')}`;
  document.body.append(bar);
  const [play, replay] = bar.querySelectorAll('button'), range = bar.querySelector('input[type=range]'), out = bar.querySelector('output');
  play.onclick = () => { play.textContent = toggle() ? 'Play' : 'Pause'; };
  replay.onclick = () => set(0);
  range.oninput = () => set(+range.value);
  bar.querySelector('select').onchange = e => setSpeed(+e.target.value);
  for (const box of bar.querySelectorAll('input[type=checkbox]')) box.onchange = () => {
    const on = [...bar.querySelectorAll('input[type=checkbox]:checked')].map(b => b.value);
    location.search = `?review&fx=${on.join(',') || 'none'}`;
  };
  (function tick() { const t = get(); if (document.activeElement !== range) range.value = t; out.textContent = `${t.toFixed(2)} s`; requestAnimationFrame(tick); })();
}
