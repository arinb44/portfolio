// The Creation: particles rebuild Michelangelo's painting as the cursor reaches for the centre of the screen.
// The camera follows God's arm (zoomed in) while it lands, then pulls back when the fingertip is touched (decisions #14-#23).
// Shared by the direction prototypes; each page passes a `look` and draws its own HTML on top via onFrame.

const PATH = [[690, 315], [560, 545], [390, 600], [215, 650], [2, 676]];  // face, shoulder, elbow, wrist, fingertip (crop px)
const CORRIDOR = 230;   // every pixel within this distance of the path becomes a particle; elsewhere every other pixel
const ZOOM_IN = 2;      // screen px per source px while following the arm
const NEAR = 26;        // px: the cursor "touches" the fingertip inside this radius

const VS = `#version 300 es
in vec2 aHome; in vec4 aColor; in vec3 aSeed;           // seed: random 0..1, sampling stride (px), position along the arm 0..1
uniform vec4 uView; uniform vec2 uMin, uMax;
uniform float uP, uT, uPx, uTwinkle;
out vec4 vColor; out float vE; out float vA; out float vAng;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float r1 = aSeed.x, r2 = hash(r1 * 91.7 + 1.3), r3 = hash(r1 * 13.1 + 7.7), r4 = hash(r1 * 57.3 + 3.1);
  bool star = r4 < .1;                                       // 1 in 10 waits as a star; the rest set off from near home
  vec2 start = star ? mix(uMin, uMax, vec2(r2, r3)) : aHome + vec2(cos(r2 * 6.2832), sin(r2 * 6.2832)) * mix(80., 420., r3);
  start += vec2(sin(uT * .3 + r1 * 6.28), cos(uT * .27 + r2 * 6.28)) * 6.;
  float l = clamp((uP - aSeed.z * .8 - r1 * .05) / .15, 0., 1.);   // lands in step with the camera: face first, fingertip last
  float e = 1. - pow(1. - l, 3.);
  vec2 d = aHome - start;
  float ang = (1. - e) * 12. + r2 * 6.2832;                  // the roll: an orbit that unwinds on landing
  vec2 pos = mix(start, aHome, e) + vec2(-d.y, d.x) * (r1 < .5 ? -1. : 1.) * .18 * sin(3.1416 * e)
           + vec2(cos(ang), sin(ang)) * (1. - e) * 18.;
  gl_Position = vec4(pos * uView.xy + uView.zw, 0., 1.);
  float settled = aSeed.y * uPx + .6;
  gl_PointSize = mix(1.6, settled, e) + sin(3.1416 * e) * max(settled * .6, 1.5);
  float twinkle = mix(1., .55 + .45 * sin(uT * 1.7 + r1 * 40.), uTwinkle * (1. - e));
  vColor = aColor; vE = e; vAng = ang + length(d) * (1. - e) * .05;
  vA = mix(star ? .55 * twinkle : 0., 1., smoothstep(0., .3, l)) * step(hash(r1 * 7.7 + .9), aColor.a);
}`;
const FS = `#version 300 es
precision mediump float;
in vec4 vColor; in float vE; in float vA; in float vAng;
uniform float uGlow;                                          // 1: glowing balls (night sky), 0: pigment dust (plaster)
out vec4 o;
void main() {
  vec2 pc = gl_PointCoord * 2. - 1.;
  float r2 = dot(pc, pc), sq = smoothstep(.9, .995, vE);    // sq = 1: landed, a plain square pixel that tiles with its neighbours
  if (sq < .5 && r2 > 1.) discard;
  vec3 n = vec3(pc, sqrt(max(0., 1. - r2)));
  vec3 L = normalize(vec3(cos(vAng), sin(vAng), 1.2));       // light spins with the roll
  float diff = max(dot(n, L), 0.), spec = pow(max(reflect(-L, n).z, 0.), 24.);
  vec3 ball = mix(vColor.rgb * (.45 + .75 * diff) + spec * .35, vec3(1., .93, .78), .3);
  vec3 dust = vColor.rgb * (.7 + .2 * diff);
  vec3 flight = mix(dust, ball, uGlow);
  float edge = mix(1., smoothstep(1., .35, r2), uGlow);      // glowing balls have soft edges
  o = vec4(mix(flight, vColor.rgb, sq), vA * mix(mix(.75, 1., uGlow) * edge, 1., sq));
}`;

const SEG = PATH.slice(1).map((b, i) => { const a = PATH[i]; return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }; });
const TOTAL = SEG.reduce((s, g) => s + g.len, 0);
function project(x, y) {          // -> [position along the path 0..1, distance to the path]
  let best = Infinity, t = 0, acc = 0;
  for (const { a, b, len } of SEG) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const u = Math.min(Math.max(((x - a[0]) * dx + (y - a[1]) * dy) / (len * len), 0), 1);
    const d = Math.hypot(a[0] + dx * u - x, a[1] + dy * u - y);
    if (d < best) { best = d; t = (acc + u * len) / TOTAL; }
    acc += len;
  }
  return [t, best];
}
function pointAt(t) {
  let s = t * TOTAL;
  for (const { a, b, len } of SEG) {
    if (s <= len) return [a[0] + (b[0] - a[0]) * s / len, a[1] + (b[1] - a[1]) * s / len];
    s -= len;
  }
  return PATH[PATH.length - 1];
}
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function compile(gl) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

/**
 * look: { glow: 0|1, twinkle: 0|1 }
 * onFrame(state): state = { progress, reveal, revealed, tip: [x, y], anchor: [x, y], cursorDistance, fps, count }
 * Returns { revealNow(), state } or null when WebGL2 is missing (the page shows its still image instead).
 */
export async function createCreation(canvas, { look, data = '../../data/', onFrame }) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prog = compile(gl), U = {};
  for (const n of ['uView', 'uMin', 'uMax', 'uP', 'uT', 'uPx', 'uTwinkle', 'uGlow']) U[n] = gl.getUniformLocation(prog, n);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const meta = await (await fetch(data + 'particles.json')).json();
  const bmp = await createImageBitmap(await (await fetch(data + 'whole-group.webp')).blob(), { premultiplyAlpha: 'none' });
  const oc = new OffscreenCanvas(bmp.width, bmp.height), ox = oc.getContext('2d');
  ox.drawImage(bmp, 0, 0);
  const px = ox.getImageData(0, 0, bmp.width, bmp.height).data, { w, h } = meta;
  const home = [], color = [], seed = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (px[i + 3] < 8) continue;
    const [t, dist] = project(x & ~1, y & ~1), st = dist < CORRIDOR ? 1 : 2;   // decide per 2x2 cell, so the two densities meet without gaps
    if (x % st || y % st) continue;
    home.push(x + st / 2, y + st / 2); color.push(px[i], px[i + 1], px[i + 2], px[i + 3]); seed.push(Math.random(), st, t);
  }
  const count = home.length / 2, vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  for (const [name, arr, size, type, norm] of [['aHome', new Float32Array(home), 2, gl.FLOAT, false],
      ['aColor', new Uint8Array(color), 4, gl.UNSIGNED_BYTE, true], ['aSeed', new Float32Array(seed), 3, gl.FLOAT, false]]) {
    const loc = gl.getAttribLocation(prog, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, type, norm, 0, 0);
  }

  const S = { progress: reduced ? 1 : 0, reveal: reduced ? 1 : 0, revealed: reduced, tip: [0, 0], anchor: [0, 0],
              cursorDistance: Infinity, fps: 60, count, pointer: null, fast: false };
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') S.pointer = [e.clientX, e.clientY]; });
  document.documentElement.addEventListener('mouseleave', () => { S.pointer = null; });

  function camera(vw, vh) {
    // Following: the landing front sits at the screen centre (particles at path position t land at progress ~.8t + .12).
    const [fx, fy] = pointAt(Math.min(Math.max((S.progress - .12) / .8, 0), 1)), zIn = Math.min(ZOOM_IN, vw / 520);
    // Revealed: the whole painting fits the right of the screen, leaving the left for the project.
    const rx0 = vw * .36, rx1 = vw * .98, ry0 = vh * .05, ry1 = vh * .95;
    const zOut = Math.min((rx1 - rx0) / w, (ry1 - ry0) / h), r = ease(S.reveal);
    return { cx: fx + (w / 2 - fx) * r, cy: fy + (h / 2 - fy) * r,
             ax: vw / 2 + ((rx0 + rx1) / 2 - vw / 2) * r, ay: vh / 2 + ((ry0 + ry1) / 2 - vh / 2) * r,
             z: Math.exp(Math.log(zIn) + (Math.log(zOut) - Math.log(zIn)) * r) };
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, .1); last = now; S.fps += (1 / Math.max(dt, 1e-3) - S.fps) * .05;
    const vw = innerWidth, vh = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) { canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr); }
    S.anchor = [vw / 2, vh / 2];
    S.cursorDistance = S.pointer ? Math.hypot(S.pointer[0] - vw / 2, S.pointer[1] - vh / 2) : Infinity;
    let target = 1;
    if (!S.revealed && !S.fast) {
      const t = S.pointer ? 1 - Math.min(Math.max((S.cursorDistance - NEAR) / (Math.hypot(vw, vh) / 2 - NEAR), 0), 1) : 0;
      target = t * t * (3 - 2 * t);
    }
    S.progress += (target - S.progress) * (1 - Math.exp(-dt * (S.fast ? 6 : 3.5)));
    if (!S.revealed && S.progress > .985 && (S.fast || S.cursorDistance < NEAR * 1.6)) S.revealed = true;   // the touch
    S.reveal += ((S.revealed ? 1 : 0) - S.reveal) * (1 - Math.exp(-dt * 1.3));

    const cam = camera(vw, vh);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog); gl.bindVertexArray(vao);
    gl.uniform4f(U.uView, 2 * cam.z / vw, -2 * cam.z / vh, 2 * (cam.ax - cam.cx * cam.z) / vw - 1, 1 - 2 * (cam.ay - cam.cy * cam.z) / vh);
    gl.uniform2f(U.uMin, -w * .25, -h * .3); gl.uniform2f(U.uMax, w * 1.25, h * 1.3);
    gl.uniform1f(U.uP, S.progress); gl.uniform1f(U.uT, reduced ? 0 : now / 1000); gl.uniform1f(U.uPx, cam.z * dpr);
    gl.uniform1f(U.uTwinkle, reduced ? 0 : look.twinkle); gl.uniform1f(U.uGlow, look.glow);
    gl.drawArrays(gl.POINTS, 0, count);
    S.tip = [(meta.fingertip[0] - cam.cx) * cam.z + cam.ax, (meta.fingertip[1] - cam.cy) * cam.z + cam.ay];
    onFrame?.(S);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { state: S, revealNow() { S.fast = true; if (reduced) { S.progress = 1; S.revealed = true; S.reveal = 1; } } };
}
