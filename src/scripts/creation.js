// The Creation (round 1): particles rebuild Michelangelo's painting as the cursor reaches for the centre of the screen.
// The camera follows God's arm (zoomed in) while it lands, then pulls back when the fingertip is touched (decisions #14-#24).
// Round 1: where particles have landed, the painting itself fades in as a filtered texture (smooth up close, soft edges),
// and the spark is a burst of particles from the fingertip instead of a CSS glow.

const PATH = [[690, 315], [560, 545], [390, 600], [215, 650], [2, 676]];  // face, shoulder, elbow, wrist, fingertip (crop px)
const CORRIDOR = 230;   // every pixel within this distance of the path becomes a particle; elsewhere every other pixel
const ZOOM_IN = 2;      // screen px per source px while following the arm
const NEAR = 26;        // px: the cursor "touches" the fingertip inside this radius
const BURST = 140;      // particles in a spark

// Landing schedule shared by the particles and the painting layer: position t along the arm lands at progress ~.8t + .12.
const LAND = `float landing(float p, float t, float jitter) { float l = clamp((p - t * .8 - jitter * .05) / .15, 0., 1.); return 1. - pow(1. - l, 3.); }`;

const PARTICLE_VS = `#version 300 es
in vec2 aHome; in vec4 aColor; in vec3 aSeed;           // seed: random 0..1, sampling stride (px), position along the arm 0..1
uniform vec4 uView; uniform vec2 uMin, uMax;
uniform float uP, uT, uPx, uTwinkle;
out vec4 vColor; out float vE; out float vA; out float vAng;
float hash(float n) { return fract(sin(n) * 43758.5453); }
${LAND}
void main() {
  float r1 = aSeed.x, r2 = hash(r1 * 91.7 + 1.3), r3 = hash(r1 * 13.1 + 7.7), r4 = hash(r1 * 57.3 + 3.1);
  bool star = r4 < .1;                                       // 1 in 10 waits as a star; the rest set off from near home
  vec2 start = star ? mix(uMin, uMax, vec2(r2, r3)) : aHome + vec2(cos(r2 * 6.2832), sin(r2 * 6.2832)) * mix(80., 420., r3);
  start += vec2(sin(uT * .3 + r1 * 6.28), cos(uT * .27 + r2 * 6.28)) * 6.;
  float l = clamp((uP - aSeed.z * .8 - r1 * .05) / .15, 0., 1.), e = landing(uP, aSeed.z, r1);
  vec2 d = aHome - start;
  float ang = (1. - e) * 12. + r2 * 6.2832;                  // the roll: an orbit that unwinds on landing
  vec2 pos = mix(start, aHome, e) + vec2(-d.y, d.x) * (r1 < .5 ? -1. : 1.) * .18 * sin(3.1416 * e)
           + vec2(cos(ang), sin(ang)) * (1. - e) * 18.;
  gl_Position = vec4(pos * uView.xy + uView.zw, 0., 1.);
  float settled = aSeed.y * uPx + .6;
  float gone = smoothstep(.97, 1., e);                       // landed: the painting layer takes over
  gl_PointSize = gone >= 1. ? 0. : mix(1.6, settled, e) + sin(3.1416 * e) * max(settled * .6, 1.5);
  float twinkle = mix(1., .55 + .45 * sin(uT * 1.7 + r1 * 40.), uTwinkle * (1. - e));
  vColor = aColor; vE = e; vAng = ang + length(d) * (1. - e) * .05;
  vA = mix(star ? .55 * twinkle : 0., 1., smoothstep(0., .3, l)) * aColor.a * (1. - gone);
}`;
const PARTICLE_FS = `#version 300 es
precision mediump float;
in vec4 vColor; in float vE; in float vA; in float vAng;
uniform float uGlow;                                          // 1: glowing balls (night sky), 0: pigment dust (plaster)
out vec4 o;
void main() {
  vec2 pc = gl_PointCoord * 2. - 1.;
  float r2 = dot(pc, pc);
  if (r2 > 1.) discard;
  vec3 n = vec3(pc, sqrt(1. - r2));
  vec3 L = normalize(vec3(cos(vAng), sin(vAng), 1.2));       // light spins with the roll
  float diff = max(dot(n, L), 0.), spec = pow(max(reflect(-L, n).z, 0.), 24.);
  vec3 ball = mix(vColor.rgb * (.45 + .75 * diff) + spec * .35, vec3(1., .93, .78), .3 * (1. - vE));
  vec3 dust = vColor.rgb * (.7 + .2 * diff);
  float edge = mix(1., smoothstep(1., .35, r2), uGlow);
  o = vec4(mix(dust, ball, uGlow), vA * mix(.75, 1., uGlow) * edge);
}`;

// The painting layer: one quad over the crop, shown wherever its particles have landed.
const PAINT_VS = `#version 300 es
in vec2 aPos;
uniform vec4 uView; uniform vec2 uSize;
out vec2 vUV; out vec2 vWorld;
void main() { vUV = aPos; vWorld = aPos * uSize; gl_Position = vec4(vWorld * uView.xy + uView.zw, 0., 1.); }`;
const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUV; in vec2 vWorld;
uniform sampler2D uTex; uniform float uP; uniform vec2 uPath[5];
out vec4 o;
${LAND}
void main() {
  vec2 q = floor(vWorld / 2.) * 2.;                            // same 2x2 cells the particles were sampled in
  float best = 1e9, t = 0., acc = 0., total = 0.;
  for (int i = 0; i < 4; i++) total += distance(uPath[i], uPath[i + 1]);
  for (int i = 0; i < 4; i++) {
    vec2 a = uPath[i], b = uPath[i + 1], ab = b - a; float len = length(ab);
    float u = clamp(dot(q - a, ab) / (len * len), 0., 1.), dd = distance(a + ab * u, q);
    if (dd < best) { best = dd; t = (acc + u * len) / total; }
    acc += len;
  }
  o = texture(uTex, vUV) * smoothstep(.85, 1., landing(uP, t, .5));   // premultiplied texture
}`;

// The spark: particles burst from the fingertip, in screen pixels so it reads the same at any zoom.
const SPARK_VS = `#version 300 es
uniform vec2 uTip, uViewport; uniform float uAge, uDpr;
out float vA;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float i = float(gl_VertexID), a = hash(i * 12.9) * 6.2832, s = mix(24., 110., pow(hash(i * 78.2), 2.));
  float k = clamp(uAge / .9, 0., 1.), travel = 1. - pow(1. - k, 3.);
  vec2 px = uTip + vec2(cos(a), sin(a)) * s * travel;
  gl_Position = vec4(px.x / uViewport.x * 2. - 1., 1. - px.y / uViewport.y * 2., 0., 1.);
  gl_PointSize = mix(4., 1.5, k) * uDpr;
  vA = (1. - k) * (k > 0. && uAge < .9 ? 1. : 0.);
}`;
const SPARK_FS = `#version 300 es
precision mediump float;
in float vA; uniform vec3 uColor; out vec4 o;
void main() { vec2 pc = gl_PointCoord * 2. - 1.; float r2 = dot(pc, pc); if (r2 > 1.) discard;
  o = vec4(mix(vec3(1., .97, .9), uColor, r2) * vA, 0.) * smoothstep(1., 0., r2); }`;   // additive: alpha 0

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
    const name = gl.getActiveUniform(p, i).name.replace('[0]', '');
    U[name] = gl.getUniformLocation(p, name);
  }
  return { p, U };
}

/**
 * look: { glow: 0|1, twinkle: 0|1, spark: [r, g, b] 0..1 }
 * onFrame(state): state = { progress, reveal, revealed, tip: [x, y], rest: [x, y], anchor: [x, y], cursorDistance, fps, count }
 * Returns { revealNow(), spark(), state } or null when WebGL2 is missing (the page shows its still image instead).
 */
export async function createCreation(canvas, { look, data = '/creation/', onFrame }) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particle = compile(gl, PARTICLE_VS, PARTICLE_FS), paint = compile(gl, PAINT_VS, PAINT_FS), burst = compile(gl, SPARK_VS, SPARK_FS);
  gl.enable(gl.BLEND);

  const meta = await (await fetch(data + 'particles.json')).json();
  const blob = await (await fetch(data + 'whole-group-aa.webp')).blob();
  const [raw, pre] = await Promise.all([createImageBitmap(blob, { premultiplyAlpha: 'none' }), createImageBitmap(blob, { premultiplyAlpha: 'premultiply' })]);
  const { w, h } = meta;

  // Painting texture: premultiplied, mipmapped (it is shown small once zoomed out).
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pre);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(paint.p, 'aPos');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Particles: one per pixel near the arm, one per 2x2 cell elsewhere.
  const oc = new OffscreenCanvas(raw.width, raw.height), ox = oc.getContext('2d');
  ox.drawImage(raw, 0, 0);
  const px = ox.getImageData(0, 0, raw.width, raw.height).data;
  const home = [], color = [], seed = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (px[i + 3] < 8) continue;
    const [t, dist] = project(x & ~1, y & ~1), st = dist < CORRIDOR ? 1 : 2;   // decide per 2x2 cell: no seams
    if (x % st || y % st) continue;
    home.push(x + st / 2, y + st / 2); color.push(px[i], px[i + 1], px[i + 2], px[i + 3]); seed.push(Math.random(), st, t);
  }
  const count = home.length / 2, vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  for (const [name, arr, size, type, norm] of [['aHome', new Float32Array(home), 2, gl.FLOAT, false],
      ['aColor', new Uint8Array(color), 4, gl.UNSIGNED_BYTE, true], ['aSeed', new Float32Array(seed), 3, gl.FLOAT, false]]) {
    const loc = gl.getAttribLocation(particle.p, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, type, norm, 0, 0);
  }
  const sparkVao = gl.createVertexArray();

  const S = { progress: reduced ? 1 : 0, reveal: reduced ? 1 : 0, revealed: reduced, tip: [0, 0], anchor: [0, 0],
              cursorDistance: Infinity, fps: 60, count, pointer: null, fast: false, sparkAt: -1 };
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') S.pointer = [e.clientX, e.clientY]; });
  document.documentElement.addEventListener('mouseleave', () => { S.pointer = null; });

  function camera(vw, vh, r = ease(S.reveal)) {
    // Following: the landing front sits at the screen centre.
    const [fx, fy] = pointAt(Math.min(Math.max((S.progress - .12) / .8, 0), 1)), zIn = Math.min(ZOOM_IN, vw / 520);
    // Revealed: the whole painting fits the right of the screen, leaving the left for the project.
    const narrow = vw < 900;   // M4: zoomed in or a narrow window: painting on top, the card below
    const rx0 = vw * (narrow ? .04 : .36), rx1 = vw * (narrow ? .96 : .98), ry0 = vh * (narrow ? .14 : .05), ry1 = vh * (narrow ? .52 : .95);
    const zOut = Math.min((rx1 - rx0) / w, (ry1 - ry0) / h);
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
    if (!S.revealed && S.progress > .985 && (S.fast || S.cursorDistance < NEAR * 1.6)) { S.revealed = true; spark(); }   // the touch
    S.reveal += ((S.revealed ? 1 : 0) - S.reveal) * (1 - Math.exp(-dt * 1.3));

    const cam = camera(vw, vh), view = [2 * cam.z / vw, -2 * cam.z / vh, 2 * (cam.ax - cam.cx * cam.z) / vw - 1, 1 - 2 * (cam.ay - cam.cy * cam.z) / vh];
    S.tip = [(meta.fingertip[0] - cam.cx) * cam.z + cam.ax, (meta.fingertip[1] - cam.cy) * cam.z + cam.ay];
    const rest = camera(vw, vh, 1);   // where the fingertip sits once fully revealed (the home page centres a project's backdrop on it)
    S.rest = [(meta.fingertip[0] - rest.cx) * rest.z + rest.ax, (meta.fingertip[1] - rest.cy) * rest.z + rest.ay];
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(paint.p); gl.bindVertexArray(quadVao);                       // 1. the landed painting
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform4f(paint.U.uView, ...view); gl.uniform2f(paint.U.uSize, w, h); gl.uniform1f(paint.U.uP, S.progress);
    gl.uniform2fv(paint.U.uPath, PATH.flat()); gl.uniform1i(paint.U.uTex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (S.progress < .999) {                                                    // 2. particles still waiting or in flight
      gl.useProgram(particle.p); gl.bindVertexArray(vao);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform4f(particle.U.uView, ...view);
      gl.uniform2f(particle.U.uMin, -w * .25, -h * .3); gl.uniform2f(particle.U.uMax, w * 1.25, h * 1.3);
      gl.uniform1f(particle.U.uP, S.progress); gl.uniform1f(particle.U.uT, reduced ? 0 : now / 1000); gl.uniform1f(particle.U.uPx, cam.z * dpr);
      gl.uniform1f(particle.U.uTwinkle, reduced ? 0 : look.twinkle); gl.uniform1f(particle.U.uGlow, look.glow);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    const age = (now - S.sparkAt) / 1000;                                       // 3. the spark
    if (S.sparkAt >= 0 && age < .9) {
      gl.useProgram(burst.p); gl.bindVertexArray(sparkVao);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform2f(burst.U.uTip, ...S.tip); gl.uniform2f(burst.U.uViewport, vw, vh);
      gl.uniform1f(burst.U.uAge, age); gl.uniform1f(burst.U.uDpr, dpr); gl.uniform3f(burst.U.uColor, ...look.spark);
      gl.drawArrays(gl.POINTS, 0, BURST);
    }
    onFrame?.(S);
    requestAnimationFrame(frame);
  }
  function spark() { if (!reduced) S.sparkAt = performance.now(); }
  requestAnimationFrame(frame);
  return { state: S, spark, revealNow() { S.fast = true; if (reduced) { S.progress = 1; S.revealed = true; S.reveal = 1; } } };
}
