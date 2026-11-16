"""Repaint the NBA loop in the chosen direction, A · Buon fresco (decision #17). M1's three-way version: render_m1.py.

Run from the project root:  python -I output/project-visuals/tools/render.py <round dir> [still <frame>]
  e.g. python -I output/project-visuals/tools/render.py output/project-visuals/iterations/round-1
(`still <frame>[,<frame>...]` paints only those frames as <round dir>/still-<frame>.png and encodes nothing.)
Reads  art-src/project-visuals/nba-24.mp4 (true 24 fps master, made in M0) and art-src/creation-of-adam-3524.jpg.
Writes to <round dir>:
  nba.{webm,mp4}           the loop with the plaster grain baked in
  nba-nograin.{webm,mp4}   the same loop without the grain, for the overlay option
  plaster.png              the grain as a multiply overlay (min(grain, 1)), same size and framing as the video
  poster-<frame>.png       baked frames offered as the reduced-motion poster
  stats.json               file sizes and the flicker ratio

Pipeline per frame: reframe (#15) -> Kuwahara paint patches -> motion-adaptive temporal smoothing (against flicker)
-> fresco colour and contours -> logos flattened (#18) -> top shade for the header nav -> plaster grain (baked only).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, uniform_filter

SRC, FRESCO = 'art-src/project-visuals/nba-24.mp4', 'art-src/creation-of-adam-3524.jpg'
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
FRAMES = 202                                    # segment B: frames 0-201, the loop restarts on the cut after the make (#14)
W, H = 1600, 900
CROP = 'crop=941:529:0:95'                      # x1.36 from the left edge, vertically centred (#15)
TEST = sys.argv[2:3] == ['still']
STILL = {int(f) for f in sys.argv[3].split(',')} if TEST else set()
POSTERS = (150,)                                 # the step-back jumper (#23)

def srgb(hexs): return np.array([int(hexs[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
UMBER = srgb('#3A2A1E')
CHROMA, RAMP_SAT = 1.1, 1.45                     # share of the footage's own hue kept; saturation of the fresco ramp
def luma(a): return a @ np.array([.2126, .7152, .0722], np.float32)

# --- Fresco material, from the painting itself -------------------------------------------------------------------
fresco = np.asarray(Image.open(FRESCO).convert('RGB'), np.float32) / 255
# Plaster: bare wall between the blue hill and God's mantle, above Adam's arm, below the painting's top border.
wall = np.asarray(Image.fromarray((fresco[20:571, 710:1690] * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), np.float32) / 255
GRAIN = wall / np.maximum(gaussian_filter(wall, (40, 40, 0)), 1e-3)
# A small white oval on the wall (full-res ~1300, 320) would sit still on screen like a mark on the glass: cover it
# with the plaster 70 px above, feathered.
yy, xx = np.mgrid[:H, :W]; m = np.clip(1.6 - np.hypot((xx - 963) / 60, (yy - 490) / 24), 0, 1)[..., None]
GRAIN = GRAIN * (1 - m) + np.roll(GRAIN, 70, 0) * m
# Tone ramp: the painting's median colour at each brightness (dark umber rock -> flesh ochres -> plaster).
small = fresco[::4, ::4].reshape(-1, 3); L = luma(small); bins = np.clip((L * 64).astype(int), 0, 63)
ramp = np.full((64, 3), np.nan, np.float32)
for b in range(64):
    if (bins == b).sum() > 50: ramp[b] = np.median(small[bins == b], 0)
ok = ~np.isnan(ramp[:, 0])
RAMP = np.stack([np.interp(np.arange(64), np.where(ok)[0], ramp[ok, c]) for c in range(3)], 1)
RAMP = gaussian_filter(RAMP, (2, 0))
# The darker bins are mostly God's red mantle; pull them toward neutral umber so shadows don't all turn maroon.
g = luma(RAMP)[:, None]; RAMP = g + (RAMP - g) * np.interp(g, [.15, .45], [.45, 1]) * RAMP_SAT

def ramp(L, table): return table[np.clip((L * (len(table) - 1)).astype(int), 0, len(table) - 1)]

# --- Logos to flatten (#18): boxes keyframed by hand on the 1600 x 900 frame, linear in between ---------------------
# Each track: (blur sigma, detail kept, {frame: (centre x, centre y, half width, half height)}); no box outside a
# track's first-last frame. Lettering keeps no detail (any share of white-on-dark text stays legible) and big
# numerals need a strong blur. The arena stanchion's box is kept narrow (the logos only) because players cross in front of it.
LOGOS = [
    # the arena stanchion (Pechanga "P" twice and its name) sliding left during the drive
    (14, 0, {45: (1700, 480, 100, 400), 46: (1500, 480, 100, 400), 47: (1433, 480, 100, 400), 48: (1333, 480, 100, 400),
     52: (1110, 480, 100, 400), 56: (933, 480, 100, 400), 60: (725, 480, 100, 400), 64: (507, 480, 100, 400),
     68: (350, 480, 100, 400), 72: (300, 480, 100, 400), 76: (150, 480, 100, 400), 80: (30, 480, 100, 400),
     82: (-100, 480, 100, 400), 83: (-300, 480, 100, 400)}),
    # the shot clock and the Tissot board above the hoop
    (30, 0, {172: (-100, 290, 160, 150), 174: (40, 260, 160, 150), 175: (140, 290, 160, 150), 176: (290, 290, 160, 150),
     178: (570, 290, 170, 200), 180: (800, 150, 170, 170), 182: (960, 40, 170, 90), 183: (1040, -60, 170, 90)}),
    # the Toyota board
    (14, 0, {177: (1000, 650, 140, 55), 178: (1130, 600, 140, 55), 180: (1350, 457, 140, 55), 182: (1500, 263, 140, 55), 183: (1600, 170, 140, 55)}),
    # the hoop stanchion's "P" logos, whipping left at the end
    (16, .1, {185: (1245, 760, 110, 170), 186: (1250, 720, 110, 180), 190: (1300, 720, 110, 180), 194: (1330, 700, 110, 180),
     196: (1333, 700, 110, 160), 198: (1217, 680, 110, 170), 199: (1033, 620, 120, 170), 200: (633, 540, 130, 170),
     201: (350, 500, 130, 170)}),
]

def flatten_logos(a, t):
    """Blur each active logo box (feathered) into plain paint, keeping the track's share of the detail."""
    for sigma, keep, track in LOGOS:
        ks = sorted(track)
        if not ks[0] <= t <= ks[-1]: continue
        k0 = max(k for k in ks if k <= t); k1 = min(k for k in ks if k >= t); f = 0 if k0 == k1 else (t - k0) / (k1 - k0)
        cx, cy, hw, hh = (np.array(track[k0]) * (1 - f) + np.array(track[k1]) * f)
        x0, x1, y0, y1 = int(max(cx - hw, 0)), int(min(cx + hw, W)), int(max(cy - hh, 0)), int(min(cy + hh, H))
        if x1 <= x0 or y1 <= y0: continue
        m = np.zeros((H, W), np.float32); m[y0:y1, x0:x1] = 1; m = gaussian_filter(m, 25)[..., None]
        soft = gaussian_filter(a, (sigma, sigma, 0))
        a = a * (1 - m) + (soft + keep * (a - soft)) * m
    return a

# --- Paint operations -----------------------------------------------------------------------------------------------
def kuwahara(img, r):
    """Classic Kuwahara: each pixel takes the mean of whichever of its 4 overlapping (r+1)^2 quadrants is flattest."""
    k, h = r + 1, r // 2; Hh, Ww = img.shape[:2]
    pad = np.pad(img, ((h, h), (h, h), (0, 0)), mode='reflect'); L = luma(pad)   # mirrored edges, no wrap-around
    m = uniform_filter(pad, (k, k, 1)); mL = uniform_filter(L, k); v = uniform_filter(L * L, k) - mL * mL
    best = np.full((Hh, Ww), np.inf, np.float32); out = np.empty_like(img)
    for oy in (0, 2 * h):
        for ox in (0, 2 * h):
            vq, mq = v[oy:oy + Hh, ox:ox + Ww], m[oy:oy + Hh, ox:ox + Ww]
            pick = vq < best; best = np.where(pick, vq, best); out[pick] = mq[pick]
    return out

def xdog(L, sigma=1.4, k=1.6, p=22, eps=.02, phi=40):
    """Extended difference of Gaussians: soft drawn lines, 1 = paper, 0 = line."""
    g1, g2 = gaussian_filter(L, sigma), gaussian_filter(L, sigma * k)
    d = (1 + p) * g1 - p * g2
    return np.where(d >= eps, 1.0, 1 + np.tanh(phi * (d - eps))).clip(0, 1).astype(np.float32)

# Top shade: the header nav (stone-200, 14 px) sits at video y ~37-70 depending on the screen; it needs the frame
# there at or below ~0.4 luma. Highlights in the top band are compressed (darks untouched), full strength to y 90,
# gone by y 240, like the shadow under a vault.
SHADE_W = np.clip((240 - np.arange(H)) / 150, 0, 1).astype(np.float32); SHADE_W = (SHADE_W * SHADE_W * (3 - 2 * SHADE_W))[:, None]
def top_shade(a, c=.42):
    L = np.maximum(luma(a), 1e-4); Lc = c * (1 - np.exp(-L / c))
    return a * (1 + SHADE_W * (Lc / L - 1))[..., None]

def buon_fresco(p, t):
    """A: the play painted into plaster in full fresco colour (no grain yet)."""
    L = .06 + .94 * luma(p) ** .8                                   # lift the dark arena into umbers, never black
    c = p - p.mean(2, keepdims=True)                                # the frame's own hue, kept at half strength
    a = ramp(L, RAMP) + CHROMA * c
    a = gaussian_filter(a, (1.0, 1.0, 0))                           # sfumato
    e = 1 - xdog(luma(p))
    a = a * (1 - .3 * e)[..., None] + UMBER * .3 * e[..., None]
    return top_shade(flatten_logos(a, t))                           # logos into plain paint (#18), then the top shade

# --- Run ---------------------------------------------------------------------------------------------------------------
def to8(a): return (np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)
TEX = np.minimum(GRAIN, 1)                                          # multiply overlay keeps only the darkening part

reader = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', f'trim=end_frame={FRAMES},{CROP},hqdn3d=1.5:1.5:3:3,scale={W}:{H}:flags=lanczos',
                           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
def frames():
    for t in range(FRAMES):
        buf = reader.stdout.read(W * H * 3); assert len(buf) == W * H * 3, f'short read at frame {t}'
        yield t, np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255

if TEST:
    for t, f in frames():
        if t in STILL: Image.fromarray(to8(buon_fresco(kuwahara(f, 6), t) * GRAIN)).save(OUT / f'still-{t}.png')
        if t >= max(STILL): break
    reader.kill(); sys.exit()

def encoders(name):
    raw = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-', '-an']
    return [subprocess.Popen(raw + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT / f'{name}.mp4')], stdin=subprocess.PIPE),
            subprocess.Popen(raw + ['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', str(OUT / f'{name}.webm')], stdin=subprocess.PIPE)]

Image.fromarray(to8(TEX)).save(OUT / 'plaster.png')
pipes = {'nba': encoders('nba'), 'nba-nograin': encoders('nba-nograin')}
prev, hist, energy = None, {'source': [], 'nba': []}, {'source': [], 'nba': []}
for t, f in frames():
    p = kuwahara(f, 6)
    if prev is not None:                                            # hold still areas steady; let motion through
        w = .6 * np.exp(-(np.abs(luma(p) - luma(prev)) / .05) ** 2)[..., None]
        p = w * prev + (1 - w) * p
    prev = p
    a = buon_fresco(p, t)
    outs = {'nba': a * GRAIN, 'nba-nograin': a}
    for n, img in (('source', f), ('nba', outs['nba'])):            # flicker: 2nd temporal difference of a 400 x 225 luma
        s = luma(img[::4, ::4]); hist[n] = (hist[n] + [s])[-3:]
        if len(hist[n]) == 3: energy[n].append(float(np.abs(hist[n][2] - 2 * hist[n][1] + hist[n][0]).mean()))
    for n, img in outs.items():
        b = to8(img)
        for e in pipes[n]: e.stdin.write(b.tobytes())
        if n == 'nba' and t in POSTERS: Image.fromarray(b).save(OUT / f'poster-{t}.png')
    if t % 20 == 0: print('frame', t, flush=True)
for ps in pipes.values():
    for e in ps: e.stdin.close(); e.wait()
reader.wait()

kb = lambda n: round((OUT / n).stat().st_size / 1024)
stats = {n: kb(n) for n in ['nba.webm', 'nba.mp4', 'nba-nograin.webm', 'nba-nograin.mp4', 'plaster.png']}
stats['flicker_ratio'] = round(float(np.median(np.array(energy['nba']) / np.maximum(np.array(energy['source']), 1e-4))), 2)
(OUT / 'stats.json').write_text(json.dumps(stats, indent=2)); print(json.dumps(stats, indent=2))
