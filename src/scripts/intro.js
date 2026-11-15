// The home page's opening (design: output/fresco-intro/design-spec.md, round 4). Michelangelo's full Creation of Adam covers
// the screen from the first frame (#25, #32); the camera moves in and lands on the gap between the fingers (zoom 2, #9;
// 3524 px image, #10), then pushes into it (#31); light gathers at the gap and the whole screen flashes warm white (#30). At
// the flash's peak the projects are simply there, with no fade-in: each project's own image behind its card (#20, #22, #23).
// The header is hidden during the opening (#32, intro.css rules in creation.css). Once per tab (#13); reduced motion, the
// reading layout (#14), a repeat visit and no WebGL get the projects at once.
// Review only: ?review (replay / scrub / speed), ?t=3.6 (freeze at a time).

const GAP = [1335, 728];   // between the fingertips in the 3524 px image (Adam's 1331,733; God's 1339,723), measured on a 10x crop
const ZOOM = 2;            // screen px per image px at the landing
const THROUGH = 16;        // the zoom the camera reaches as it pushes into the gap
const START_X = 1530;      // the opening frame's centre: keeps Adam's head and God's in view when the painting is cropped to cover the screen
const INK = [31 / 255, 29 / 255, 26 / 255], GOLD = [.784, .635, .29];
// seconds: push = move in and land; enter = accelerate into the gap; bloom = light gathers at the gap; flash = the whole
// screen: rise, peak (the projects appear), gone; end = the opening's layers are removed.
const TL = { push: [0, 3.0], enter: [3.3, 4.1], bloom: [3.45, 3.8], flash: [3.75, 3.95, 4.5], end: 4.5 };
const SRC = '/creation/fresco.webp';
const SEEN = 'fresco-intro-seen';   // sessionStorage: once per tab

const q = new URLSearchParams(location.search);
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;

const PAINT_VS = `#version 300 es
in vec2 aPos; uniform mat3 uH; uniform vec2 uSize; out vec2 vUV;
void main() { vUV = aPos; vec3 h = uH * vec3(aPos * uSize, 1.); gl_Position = vec4(h.xy, 0., h.z); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV; uniform sampler2D uTex; out vec4 o;
void main() { o = vec4(texture(uTex, vUV).rgb, 1.); }`;
// The light gathering at the gap before the flash: a gold bloom with a warm core, additive, in device pixels.
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

/** Plays the opening into the projects. Returns at once: { done (promise: the projects are live), toShowcase() }. */
export function playIntro() {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, canvas = document.querySelector('#intro'), flash = document.querySelector('.flash');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch {}
  const atOnce = reduced || matchMedia('(max-width: 900px), (max-height: 560px)').matches || (seen && !review && !q.has('t'));
  const reveal = TL.flash[1];
  let T = q.has('t') ? +q.get('t') : atOnce ? TL.end : 0, paused = q.has('t'), speed = 1, fading = false, ended = false;
  window.__intro = { startAt: null, doneAt: null, atOnce, frames: [], Ts: [] };
  const end = () => {                       // the projects are live
    if (ended) return; ended = true;
    try { sessionStorage.setItem(SEEN, '1'); } catch {}   // storage blocked: it plays again next time, nothing breaks
    window.__intro.doneAt = performance.now(); resolve();
  };
  const showcase = () => { html.classList.remove('intro'); html.classList.add('revealed'); canvas.style.display = 'none'; flash.style.opacity = 0; end(); };
  const api = { done, toShowcase() { T = Math.max(T, TL.end); } };   // "Skip to the projects": straight there
  if (atOnce && !q.has('t')) { showcase(); return api; }
  html.classList.add('intro');

  // Skip intro / Esc: a quick dip to the night sky, then the projects.
  const skip = () => {
    if (T >= reveal || fading) return; fading = true;
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
    const paint = compile(gl, PAINT_VS, PAINT_FS), light = compile(gl, LIGHT_VS, LIGHT_FS);
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

    // The camera as the gap's place on screen and the zoom: from the painting covering the screen in to the centre at ZOOM
    // (zoom in log space, the gap on a straight line), a beat, then an accelerating push into the gap.
    function camera(T, vw, vh) {
      const cover = Math.max(vw / W, vh / H), e = ease(clamp01((T - TL.push[0]) / (TL.push[1] - TL.push[0])));
      const half = vw / 2 / cover, sx = Math.min(Math.max(START_X * W / 3524, half), W - half);   // centred on START_X, never past an edge
      const from = [(GAP[0] - sx) * cover + vw / 2, (GAP[1] - H / 2) * cover + vh / 2];
      const into = clamp01((T - TL.enter[0]) / (TL.enter[1] - TL.enter[0])) ** 3;
      return { gap: [lerp(from[0], vw / 2, e), lerp(from[1], vh / 2, e)],
               z: Math.exp(lerp(Math.log(cover), Math.log(ZOOM), e) + Math.log(THROUGH / ZOOM) * into) };
    }

    if (review) buildReviewBar(TL.end, () => T, t => { T = t; }, () => (paused = !paused), s => { speed = s; });
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, startAt: performance.now() });
    let last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, .1); last = now;
      if (!paused) T = Math.min(T + dt * speed, TL.end);
      if (!ended) { window.__intro.frames.push(now); window.__intro.Ts.push(T); }
      // At the flash's peak the projects are simply there, under the light (no fade-in, #30).
      html.classList.toggle('intro', T < reveal);
      html.classList.toggle('revealed', T >= reveal);
      const [fa, , fb] = TL.flash;
      flash.style.opacity = (T < reveal ? ss(fa, reveal, T) : 1 - ss(reveal, fb, T)).toFixed(3);
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const { gap, z } = camera(T, vw, vh);
      const cx = GAP[0] - (gap[0] - vw / 2) / z, cy = GAP[1] - (gap[1] - vh / 2) / z;            // the image point at the screen centre
      const M = [2 * z / vw, 0, 0, 0, -2 * z / vh, 0, -2 * z * cx / vw, 2 * z * cy / vh, 1];       // image px -> clip
      if (T >= TL.end) end();
      window.__intro.state = { T, z, gap, flash: +flash.style.opacity };

      gl.viewport(0, 0, canvas.width, canvas.height);
      canvas.style.visibility = T < reveal ? '' : 'hidden';   // gone the moment the projects appear
      if (T < reveal) {
        gl.clearColor(...INK, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(paint.p); gl.bindVertexArray(quad); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniformMatrix3fv(paint.U.uH, false, M); gl.uniform2f(paint.U.uSize, W, H); gl.uniform1i(paint.U.uTex, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        const I = ss(...TL.bloom, T) * .7;                                    // light gathering at the gap
        if (I > .001) {
          gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
          gl.uniform2f(light.U.uC, gap[0] * dpr, (vh - gap[1]) * dpr); gl.uniform1f(light.U.uR, Math.min(vw, vh) * .2 * dpr);
          gl.uniform1f(light.U.uI, I); gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...GOLD);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
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
