// Fresco intro (output/fresco-intro, M1). Particles fade in the full Creation of Adam, the camera lands on the gap
// between the two fingers at the centre of the screen, one flash of light, then the home page takes over (plan.md 1-9).
// Directions: a = Starlight, b = Pigment on plaster, c = Looking up. Particles are generated on the GPU from the
// painting texture (gl_VertexID -> cell -> texelFetch), so nothing is built on the CPU.
// URL params: ?img=2560 (D3), ?zoom=3 (D2), ?stride=2, ?review (replay / scrub / speed), ?t=5.9 (freeze at a time).

const SRC = 3524;                                              // coordinates are in the 3524 px Commons original
const GAP = [1335, 728], GOD_TIP = [1339, 723], ADAM_TIP = [1331, 733];
const ADAM = [[413, 606], [881, 790], [1150, 690]];              // B's camera: Adam's face, elbow, wrist
const GOLD = [.784, .635, .29], WARM = [1, .93, .78];
const q = new URLSearchParams(location.search);
const IMG = q.get('img') === '2560' ? 2560 : 3524, K = IMG / SRC;
const ZOOM = +q.get('zoom') || 2;                                // D2: screen px per source px at the landing
const STRIDE = +q.get('stride') || 3;                            // one particle per STRIDE x STRIDE cell of the image

const clamp01 = x => Math.min(Math.max(x, 0), 1);
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const pulse = (T, a, peak, b) => T < peak ? ss(a, peak, T) : 1 - ss(peak, b, T);   // 0 -> 1 -> 0

// Timelines (seconds). build: particle progress; plaster: B's bare plaster; light: the flash; hand: the ring comes back;
// fade: the fresco dissolves into the night sky; end: the home page is live.
const DIRS = {
  a: { end: 7.0, hand: 6.15, build: [.2, 3.6], fade: [6.0, 7.0], glow: 1, push: [2.4, 5.7] },
  b: { end: 7.3, hand: 6.55, build: [.8, 3.6], fade: [6.4, 7.3], glow: 0, path: [3.4, 6.0] },
  c: { end: 7.3, hand: 6.6, build: [.3, 3.4], fade: [6.0, 6.9], glow: 1, rise: [.3, 3.6], push: [3.6, 5.9] },
};

const COMMON = `
uniform vec2 uSize, uGap; uniform float uStride; uniform int uDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float order(vec2 w) {                                            // 0..1: when this spot of the painting lands
  if (uDir == 0) return clamp(.65 * (1. - distance(w, uGap) / (length(uSize) * .62)) + .35 * vnoise(w / (uSize.x * .06)), 0., 1.);
  if (uDir == 1) return clamp(w.x / uSize.x * .8 + .2 * vnoise(w / (uSize.x * .05)), 0., 1.);   // Adam first, then God
  return hash(floor(w / uStride) + 3.7);                         // everywhere at once
}
float landing(float p, float t, float jitter) { float l = clamp((p - t * .8 - jitter * .05) / .15, 0., 1.); return 1. - pow(1. - l, 3.); }`;

const PARTICLE_VS = `#version 300 es
uniform sampler2D uTex; uniform mat3 uH; uniform int uCols; uniform float uP, uT, uZ, uDpr, uFade;
uniform vec2 uMin, uMax;
out vec4 vColor; out float vE, vA, vAng;
${COMMON}
void main() {
  vec2 cell = vec2(gl_VertexID % uCols, gl_VertexID / uCols), home = (cell + .5) * uStride;
  float r1 = hash(cell), r2 = hash(cell + 17.3), r3 = hash(cell + 41.9), r4 = hash(cell + 7.1);
  float l = clamp((uP - order(home) * .8 - r1 * .05) / .15, 0., 1.), e = landing(uP, order(home), r1);
  vec2 start = home, pos; float a = smoothstep(0., .3, l), ang = 0.;
  if (uDir == 0) {                                               // A: stars drift together
    bool star = r4 < .1;
    start = star ? mix(uMin, uMax, vec2(r2, r3)) : home + vec2(cos(r2 * 6.2832), sin(r2 * 6.2832)) * mix(60., 360., r3);
    start += vec2(sin(uT * .3 + r1 * 6.28), cos(uT * .27 + r2 * 6.28)) * 6.;
    vec2 d = home - start; ang = (1. - e) * 12. + r2 * 6.2832;
    pos = mix(start, home, e) + vec2(-d.y, d.x) * (r1 < .5 ? -1. : 1.) * .18 * sin(3.1416 * e) + vec2(cos(ang), sin(ang)) * (1. - e) * 18.;
    a = mix(star ? .55 * mix(1., .55 + .45 * sin(uT * 1.7 + r1 * 40.), 1. - e) : 0., 1., a);
  } else if (uDir == 1) {                                        // B: pigment dust falls onto the plaster
    start = home + vec2((r2 - .5) * 60., -mix(80., 320., r3));
    pos = mix(start, home, e) + vec2(sin(uT * 2. + r1 * 30.) * 8. * (1. - e), 0.);
    a = smoothstep(0., .25, l);
  } else {                                                       // C: specks shimmer into place
    pos = home + vec2(r2 - .5, r3 - .5) * 6. * (1. - e);
    a = smoothstep(0., .4, l);
  }
  vec3 h = uH * vec3(pos, 1.);
  gl_Position = vec4(h.xy, 0., h.z);
  float settled = uStride * uZ * uDpr / h.z + .6, gone = smoothstep(.97, 1., e);
  float size = uDir == 2 ? mix(settled * 2.4, settled, e) : mix(1.6 * uDpr, settled, e) + sin(3.1416 * e) * max(settled * .6, 1.5);
  gl_PointSize = gone >= 1. ? 0. : size;
  vColor = texelFetch(uTex, ivec2(home), 0);
  if (uDir == 2) vColor.rgb = mix(vColor.rgb, vec3(1., .95, .85), (1. - e) * .4);   // a glint as it arrives
  vE = e; vAng = ang; vA = a * (1. - gone) * uFade;
}`;
const PARTICLE_FS = `#version 300 es
precision mediump float;
in vec4 vColor; in float vE, vA, vAng; uniform float uGlow; out vec4 o;
void main() {
  vec2 pc = gl_PointCoord * 2. - 1.; float r2 = dot(pc, pc);
  if (r2 > 1.) discard;
  vec3 n = vec3(pc, sqrt(1. - r2)), L = normalize(vec3(cos(vAng), sin(vAng), 1.2));
  float diff = max(dot(n, L), 0.), spec = pow(max(reflect(-L, n).z, 0.), 24.);
  vec3 ball = mix(vColor.rgb * (.45 + .75 * diff) + spec * .35, vec3(1., .93, .78), .3 * (1. - vE));
  vec3 dust = vColor.rgb * (.7 + .2 * diff);
  o = vec4(mix(dust, ball, uGlow), vA * mix(.8, 1., uGlow) * mix(1., smoothstep(1., .35, r2), uGlow));
}`;

// The painting itself, shown wherever its particles have landed (smooth when zoomed in).
const PAINT_VS = `#version 300 es
in vec2 aPos; uniform mat3 uH; uniform vec2 uSize; out vec2 vUV;
void main() { vUV = aPos; vec3 h = uH * vec3(aPos * uSize, 1.); gl_Position = vec4(h.xy, 0., h.z); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV; uniform sampler2D uTex; uniform float uP, uPlaster, uFade; out vec4 o;
${COMMON}
float lum(vec2 uv) { return dot(textureLod(uTex, uv, 1.5).rgb, vec3(.3, .59, .11)); }
void main() {
  vec2 w = vUV * uSize, cell = floor(w / uStride);
  float show = smoothstep(.85, 1., landing(uP, order((cell + .5) * uStride), hash(cell)));
  vec2 m = min(vUV, 1. - vUV) * uSize / uSize.y;
  float edge = smoothstep(0., .015, min(m.x, m.y)) * uFade;         // a soft edge against the night sky
  vec3 paint = texture(uTex, vUV).rgb;
  vec4 c = vec4(paint, 1.) * show;
  if (uPlaster > 0.) {                                              // B: bare plaster with a faint red-ochre underdrawing
    vec2 px = 3. / uSize;
    float g = length(vec2(lum(vUV + vec2(px.x, 0)) - lum(vUV - vec2(px.x, 0)), lum(vUV + vec2(0, px.y)) - lum(vUV - vec2(0, px.y))));
    vec3 ground = mix(vec3(.90, .86, .78) * (.95 + .07 * lum(vUV)), vec3(.66, .33, .22), smoothstep(.04, .18, g) * .5);
    c += vec4(ground, 1.) * uPlaster * (1. - show);
  }
  o = c * edge;
}`;

// The light: a soft bloom (and B's spark across the gap), additive, in device pixels.
const LIGHT_VS = `#version 300 es
void main() { vec2 p = vec2(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1.); gl_Position = vec4(p, 0., 1.); }`;
const LIGHT_FS = `#version 300 es
precision highp float;
uniform vec2 uC; uniform float uR, uI, uCore, uDpr; uniform vec3 uColor; uniform vec4 uSeg; uniform float uSegI; out vec4 o;
void main() {
  vec2 p = gl_FragCoord.xy; float d = distance(p, uC);
  vec3 c = uColor * uI * exp(-pow(d / uR, 2.)) + vec3(1., .97, .9) * uI * uCore * exp(-pow(d / (uR * .15 + uDpr), 2.));
  vec2 a = uSeg.xy, ab = uSeg.zw - a; float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-3), 0., 1.);
  c += vec3(1., .96, .85) * uSegI * (exp(-pow(distance(p, a + ab * h) / (3. * uDpr), 2.)) + .5 * exp(-pow(distance(p, uSeg.zw) / (9. * uDpr), 2.)));   // the line and its bright head
  o = vec4(c, 0.);
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

// World (image px) -> clip space, as a 3x3 matrix (column-major). tilt/roll in radians tip the painting back like a
// ceiling seen from below (C); with both 0 it is a plain zoom and pan.
function viewMatrix({ cx, cy, z, tilt = 0, roll = 0 }, vw, vh) {
  const f = 1.2 * Math.max(vw, vh), cr = Math.cos(roll), sr = Math.sin(roll);
  const a1 = z * cr, b1 = -z * sr, c1 = -(a1 * cx + b1 * cy), a2 = z * sr, b2 = z * cr, c2 = -(a2 * cx + b2 * cy);
  const r0 = [a1, b1, c1].map(v => v * 2 / vw), r1 = [a2, b2, c2].map(v => v * -2 * Math.cos(tilt) / vh);
  const r2 = [a2, b2, c2].map(v => v * -Math.sin(tilt) / f); r2[2] += 1;
  return [r0[0], r1[0], r2[0], r0[1], r1[1], r2[1], r0[2], r1[2], r2[2]];
}
const toScreen = (M, [x, y], vw, vh) => {
  const X = M[0] * x + M[3] * y + M[6], Y = M[1] * x + M[4] * y + M[7], W = M[2] * x + M[5] * y + M[8];
  return [(X / W + 1) * vw / 2, (1 - Y / W) * vh / 2];
};

/** Plays the intro. Returns { done } (a promise) straight away; the home page waits on it. */
export function playIntro({ direction = 'a' }) {
  let resolve; const done = new Promise(r => { resolve = r; });
  const html = document.documentElement, D = DIRS[direction];
  const canvas = document.querySelector('#intro'), skipBtn = document.querySelector('.skip-intro');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, review = q.has('review');
  let finished = false;
  const finish = () => {
    if (finished) return; finished = true;
    html.classList.remove('intro'); canvas.style.display = 'none'; document.querySelector('.intro-still')?.remove();
    window.__intro.doneAt = performance.now(); resolve();
  };
  window.__intro = { direction, img: IMG, zoom: ZOOM, stride: STRIDE, startAt: null, doneAt: null, frames: [] };
  if (matchMedia('(hover: none), (pointer: coarse)').matches) { finish(); return { done }; }   // computer only (#21)
  html.classList.add('intro');

  let skipTo = null;   // set by Skip intro / Esc: fade out over 300 ms, then the home page
  const skip = () => {
    if (finished || skipTo) return; skipTo = true;
    for (const el of [canvas, document.querySelector('.intro-still')]) if (el) { el.style.transition = 'opacity .3s'; el.style.opacity = 0; }
    html.classList.remove('intro'); setTimeout(finish, 300);
  };
  skipBtn.addEventListener('click', skip);
  addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
  for (const a of document.querySelectorAll('a[href="#projects"]')) a.addEventListener('click', finish);   // straight to the projects

  const src = `../../data/fresco-${IMG}.webp`;
  if (reduced) {                                    // requirement 8: the still fresco, then a cross-fade into the page
    const img = Object.assign(new Image(), { src, alt: '', className: 'intro-still' });
    img.decode().then(() => {
      canvas.after(img); window.__intro.startAt = performance.now();
      setTimeout(() => { if (skipTo) return; img.style.transition = 'opacity .4s'; img.style.opacity = 0; html.classList.remove('intro'); setTimeout(finish, 400); }, 2000);
    }, finish);
    return { done };
  }

  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) { finish(); return { done }; }           // no WebGL2: the page as it is today
  (async () => {
    const bmp = await createImageBitmap(await (await fetch(src)).blob());
    const W = bmp.width, H = bmp.height, cols = Math.floor(W / STRIDE), rows = Math.floor(H / STRIDE);
    const particle = compile(gl, PARTICLE_VS, PARTICLE_FS), paint = compile(gl, PAINT_VS, PAINT_FS), light = compile(gl, LIGHT_VS, LIGHT_FS);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
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
    const gap = GAP.map(v => v * K), zEnd = ZOOM / K;

    function camera(T, vw, vh) {
      const zFit = Math.min(vw * .9 / W, vh * .78 / H), c0 = [W / 2, H / 2];
      const pushTo = (e, from, z0) => {          // zoom toward the gap so it slides straight to the centre
        const z = Math.exp(lerp(Math.log(z0), Math.log(zEnd), e)), k = z0 * (1 - e) / z;
        return { cx: gap[0] + (from[0] - gap[0]) * k, cy: gap[1] + (from[1] - gap[1]) * k, z };
      };
      if (direction === 'a') return pushTo(ease(clamp01((T - D.push[0]) / (D.push[1] - D.push[0]))), c0, zFit);
      if (direction === 'c') {
        const r = ease(clamp01((T - D.rise[0]) / (D.rise[1] - D.rise[0])));
        if (T < D.push[0]) return { cx: c0[0], cy: c0[1] + H * .08 * (1 - r), z: zFit * lerp(.5, 1, r), tilt: lerp(.7, 0, r), roll: lerp(-.1, 0, r) };
        return pushTo(ease(clamp01((T - D.push[0]) / (D.push[1] - D.push[0]))), c0, zFit);
      }
      // b: whole painting, then Adam's face, along his arm to his hand, across to the gap (Catmull-Rom through the keys)
      const keys = [[...c0, zFit], ...ADAM.map(([x, y], i) => [x * K, y * K, zFit * [2.6, 2.9, 3.6][i]]), [...gap, zEnd]];
      const keys2 = [keys[0], ...keys, keys[keys.length - 1]];
      const u = ss(D.path[0], D.path[1], T) * (keys.length - 1), i = Math.min(Math.floor(u), keys.length - 2), t = u - i;
      const cr = (p0, p1, p2, p3) => .5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
      const [P0, P1, P2, P3] = [keys2[i], keys2[i + 1], keys2[i + 2], keys2[i + 3]];
      const z = Math.exp(cr(...[P0, P1, P2, P3].map(k => Math.log(k[2]))));
      // Keep the view inside the painting once it is bigger than the screen (Adam's face sits near the left edge).
      const keep = (c, half, size) => size * z < 2 * half ? c : Math.min(Math.max(c, half / z + H * .015), size - half / z - H * .015);   // .015: past the soft edge
      return { cx: keep(cr(P0[0], P1[0], P2[0], P3[0]), vw / 2, W), cy: keep(cr(P0[1], P1[1], P2[1], P3[1]), vh / 2, H), z };
    }

    function lightAt(T, vw, vh, M) {             // -> { I, R, color, seg, segI } in CSS px
      const m = Math.min(vw, vh), none = { I: 0, R: 1, core: .5, color: GOLD, segI: 0 };
      if (direction === 'a') {                   // a gold bloom that shrinks into the ring
        const I = pulse(T, 5.5, 5.85, 6.6) * .7, R = T < 5.85 ? lerp(30, m * .2, ss(5.5, 5.85, T)) : lerp(m * .2, 22, ss(5.85, 6.6, T));
        return { ...none, I, R, color: GOLD };
      }
      if (direction === 'b') {                   // a spark jumps from God's fingertip to Adam's, then a white-gold bloom
        const g = toScreen(M, GOD_TIP.map(v => v * K), vw, vh), a = toScreen(M, ADAM_TIP.map(v => v * K), vw, vh), k = ss(5.95, 6.15, T);
        return { I: pulse(T, 6.1, 6.35, 7.0) * .65, R: lerp(20, m * .17, ss(6.1, 6.35, T)), core: .5, color: WARM,
                 seg: [g, [lerp(g[0], a[0], k), lerp(g[1], a[1], k)]], segI: pulse(T, 5.95, 6.15, 6.5) * 2.5 };
      }
      return { ...none, I: pulse(T, 5.9, 6.35, 7.2) * .28, R: lerp(40, Math.max(vw, vh), ss(5.9, 6.35, T)), core: 0, color: WARM };   // c: a soft wash
    }

    let T = q.has('t') ? +q.get('t') : 0, speed = 1, paused = q.has('t'), last = performance.now();
    Object.assign(window.__intro, { seek: t => { T = t; }, pause: () => { paused = true; }, play: () => { paused = false; }, count: cols * rows });
    if (review) buildReviewBar(D.end, () => T, t => { T = t; if (t < D.hand) html.classList.add('intro'); }, () => { paused = !paused; return paused; }, s => { speed = s; });
    window.__intro.startAt = performance.now();

    function frame(now) {
      if (finished) return;
      const dt = Math.min((now - last) / 1000, .1); last = now; window.__intro.frames.push(now); (window.__intro.Ts ||= []).push(T);
      if (!paused) T += dt * speed;
      if (T >= D.hand && !skipTo) html.classList.remove('intro');
      if (T >= D.end && !review) { finish(); return; }
      const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
      const cam = camera(T, vw, vh), M = viewMatrix(cam, vw, vh), P = ss(...D.build, T), fade = 1 - ss(...D.fade, T);
      window.__intro.state = { T, cam, gap: toScreen(M, gap, vw, vh), P };
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const common = (prog) => {
        gl.useProgram(prog.p); gl.uniformMatrix3fv(prog.U.uH, false, M);
        gl.uniform2f(prog.U.uSize, W, H); gl.uniform2f(prog.U.uGap, ...gap); gl.uniform1f(prog.U.uStride, STRIDE);
        gl.uniform1i(prog.U.uDir, 'abc'.indexOf(direction)); gl.uniform1f(prog.U.uP, P); gl.uniform1f(prog.U.uFade, fade); gl.uniform1i(prog.U.uTex, 0);
      };
      common(paint); gl.bindVertexArray(quad);                       // 1. the landed painting
      gl.uniform1f(paint.U.uPlaster, direction === 'b' ? ss(0, 1, T) : 0);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (P < .999 && fade > 0) {                                     // 2. particles still waiting or in flight
        common(particle); gl.bindVertexArray(empty);
        gl.uniform1i(particle.U.uCols, cols); gl.uniform1f(particle.U.uT, now / 1000); gl.uniform1f(particle.U.uZ, cam.z);
        gl.uniform1f(particle.U.uDpr, dpr); gl.uniform1f(particle.U.uGlow, D.glow);
        gl.uniform2f(particle.U.uMin, -W * .1, -H * .3); gl.uniform2f(particle.U.uMax, W * 1.1, H * 1.3);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, cols * rows);
      }
      const L = lightAt(T, vw, vh, M);                                // 3. the flash
      if (L.I > .001 || L.segI > .001) {
        gl.useProgram(light.p); gl.bindVertexArray(empty); gl.blendFunc(gl.ONE, gl.ONE);
        const g = window.__intro.state.gap, dev = ([x, y]) => [x * dpr, (vh - y) * dpr];
        gl.uniform2f(light.U.uC, ...dev(g)); gl.uniform1f(light.U.uR, L.R * dpr); gl.uniform1f(light.U.uI, L.I); gl.uniform1f(light.U.uCore, L.core);
        gl.uniform1f(light.U.uDpr, dpr); gl.uniform3f(light.U.uColor, ...L.color);
        gl.uniform4f(light.U.uSeg, ...(L.seg ? [...dev(L.seg[0]), ...dev(L.seg[1])] : [0, 0, 0, 0])); gl.uniform1f(light.U.uSegI, L.segI);
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
  bar.innerHTML = `<button type="button" data-k="play">Pause</button><button type="button" data-k="replay">Replay</button>
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
