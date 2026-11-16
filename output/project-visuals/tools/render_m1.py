"""M1 record: repaint the NBA loop three ways (A Buon fresco, B Sinopia, C Grisaille). Kept as it ran for M1; M2 work is in render.py.

Run from the project root:  python -I output/project-visuals/tools/render_m1.py [still <frame>]
(`still <frame>` paints only that frame, writes directions/<direction>/still.png and encodes nothing.)
Reads  art-src/project-visuals/nba-24.mp4 (true 24 fps master, made in M0) and art-src/creation-of-adam-3524.jpg.
Writes output/project-visuals/directions/<direction>/nba.{webm,mp4}, a still per direction and directions/stats.json.

Pipeline per frame: reframe (decision #15) -> Kuwahara paint patches -> motion-adaptive temporal smoothing (against
flicker) -> the direction's colour and line treatment -> the fresco's plaster grain and cracks, fixed in place.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, uniform_filter

SRC, FRESCO = 'art-src/project-visuals/nba-24.mp4', 'art-src/creation-of-adam-3524.jpg'
OUT = Path('output/project-visuals/directions')
FRAMES = 202                                    # segment B: frames 0-201, the loop restarts on the cut after the make (#14)
W, H = 1600, 900
CROP = 'crop=941:529:0:95'                      # x1.36 from the left edge, vertically centred (#15)
TEST = sys.argv[1:2] == ['still']
STILL = int(sys.argv[2]) if TEST else 150        # frame saved as a still for review (default: low dribble, mid-move)

def srgb(hexs): return np.array([int(hexs[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
INK, STONE7, STONE2, GESSO, GOLD = map(srgb, ['#1F1D1A', '#4A4740', '#CFC8BA', '#EEE9DF', '#C8A24A'])
SINOPIA = srgb('#8A3B28')                       # red-ochre underdrawing
UMBER = srgb('#3A2A1E')

def luma(a): return a @ np.array([.2126, .7152, .0722], np.float32)

# --- Fresco material, from the painting itself -------------------------------------------------------------------
fresco = np.asarray(Image.open(FRESCO).convert('RGB'), np.float32) / 255
# Plaster: bare wall between the blue hill and God's mantle, above Adam's arm, below the painting's top border. Grain and cracks = the crop over its own large blur (~1 on average).
wall = np.asarray(Image.fromarray((fresco[20:571, 710:1690] * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS), np.float32) / 255
GRAIN = wall / np.maximum(gaussian_filter(wall, (40, 40, 0)), 1e-3)
# A small white oval on the wall (full-res ~1300, 320) would sit still on screen like a mark on the glass: cover it
# with the plaster 70 px above, feathered.
yy, xx = np.mgrid[:H, :W]; m = np.clip(1.6 - np.hypot((xx - 963) / 60, (yy - 490) / 24), 0, 1)[..., None]
GRAIN = GRAIN * (1 - m) + np.roll(GRAIN, 70, 0) * m
PLASTER = wall.reshape(-1, 3).mean(0)          # the wall's own colour
# Tone ramp: the painting's median colour at each brightness (dark umber rock -> flesh ochres -> plaster).
small = fresco[::4, ::4].reshape(-1, 3); L = luma(small); bins = np.clip((L * 64).astype(int), 0, 63)
ramp = np.full((64, 3), np.nan, np.float32)
for b in range(64):
    if (bins == b).sum() > 50: ramp[b] = np.median(small[bins == b], 0)
ok = ~np.isnan(ramp[:, 0])
RAMP = np.stack([np.interp(np.arange(64), np.where(ok)[0], ramp[ok, c]) for c in range(3)], 1)
RAMP = gaussian_filter(RAMP, (2, 0))
# The darker bins are mostly God's red mantle; pull them toward neutral umber so shadows don't all turn maroon.
g = luma(RAMP)[:, None]; RAMP = g + (RAMP - g) * np.interp(g, [.15, .45], [.45, 1])

def ramp(L, table): return table[np.clip((L * (len(table) - 1)).astype(int), 0, len(table) - 1)]

# Grisaille ramp: Night Sky ink through the stone greys to gesso, then a touch of gold in the top highlights.
GRIS = np.array([np.interp(np.linspace(0, 1, 256), [0, .3, .62, .93, 1], [INK[c], STONE7[c], STONE2[c] * .82, GESSO[c] * .97, GOLD[c] * .3 + GESSO[c] * .7]) for c in range(3)], np.float32).T

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

def grain(img, strength): return img * (1 + (GRAIN - 1) * strength)

# --- The three directions --------------------------------------------------------------------------------------------
def buon_fresco(p):
    """A: the play painted into plaster in full fresco colour."""
    L = .06 + .94 * luma(p) ** .8                                   # lift the dark arena into umbers, never black
    c = p - p.mean(2, keepdims=True)                                # the frame's own hue, kept at half strength
    a = ramp(L, RAMP) + .55 * c
    a = gaussian_filter(a, (1.0, 1.0, 0))                           # sfumato
    a = a * (1 - .3 * (1 - xdog(luma(p))))[..., None] + UMBER * .3 * (1 - xdog(luma(p)))[..., None]
    return grain(a, 1.0)

def sinopia(p):
    """B: red-ochre underdrawing on bare plaster, with thin washes of colour."""
    Lp = luma(p); lines = xdog(gaussian_filter(Lp, 1.5), sigma=2.2, p=30, eps=.02, phi=30)
    lit = np.clip((gaussian_filter(Lp, 6) - .05) / .2, 0, 1)        # the dark crowd gets few lines
    lines = 1 - (1 - lines) * lit * lit * (3 - 2 * lit)
    paint = ramp(.06 + .94 * Lp ** .8, RAMP) + .4 * (p - p.mean(2, keepdims=True))
    wash = (.05 + .2 * (1 - Lp) ** 2)[..., None]                     # darker passages carry more wash, kept thin
    ground = PLASTER * .6 + GESSO * .4                                # warm fresh plaster
    a = ground * (1 - wash) + paint * wash
    a = a * lines[..., None] + SINOPIA * (1 - lines[..., None])
    return grain(a, 1.15)

def grisaille(p):
    """C: monochrome painted stone with strong chiaroscuro, closest to Night Sky."""
    L = luma(p); L = L / (L + .18) * 1.18                            # open the darks a little, keep it low-key
    L = L + .7 * (L - gaussian_filter(L, 14))                        # large-scale modelling: folds and volume
    L = np.clip(L, 0, 1); L = L * L * (3 - 2 * L)                    # S-curve: chiaroscuro
    a = gaussian_filter(ramp(L, GRIS), (1.6, 1.6, 0))
    lit = np.clip((gaussian_filter(L, 8) - .18) / .35, 0, 1)[..., None]  # the dark crowd melts into soft shadow
    a = a * lit + gaussian_filter(a, (6, 6, 0)) * (1 - lit)
    e = 1 - xdog(gaussian_filter(luma(p), 1.2), sigma=1.8)
    a = a * (1 - .35 * e)[..., None]
    return grain(a, .6)

DIRECTIONS = {'a-buon-fresco': buon_fresco, 'b-sinopia': sinopia, 'c-grisaille': grisaille}

# --- Run ---------------------------------------------------------------------------------------------------------------
def encoders(name):
    d = OUT / name; d.mkdir(parents=True, exist_ok=True)
    raw = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-', '-an']
    return [subprocess.Popen(raw + ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(d / 'nba.mp4')], stdin=subprocess.PIPE),
            subprocess.Popen(raw + ['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', str(d / 'nba.webm')], stdin=subprocess.PIPE)]

reader = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', f'trim=end_frame={FRAMES},{CROP},hqdn3d=1.5:1.5:3:3,scale={W}:{H}:flags=lanczos',
                           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
if TEST:
    reader.stdout.read(W * H * 3 * STILL)
    f = np.frombuffer(reader.stdout.read(W * H * 3), np.uint8).reshape(H, W, 3).astype(np.float32) / 255
    p = kuwahara(f, 6)
    for n, fn in DIRECTIONS.items():
        (OUT / n).mkdir(parents=True, exist_ok=True)
        Image.fromarray((np.clip(fn(p), 0, 1) * 255 + .5).astype(np.uint8)).save(OUT / n / f'still-{STILL}.png')
    reader.kill(); sys.exit()
pipes = {n: encoders(n) for n in DIRECTIONS}
prev, hist, energy = None, {n: [] for n in ['source', *DIRECTIONS]}, {n: [] for n in ['source', *DIRECTIONS]}
for t in range(FRAMES):
    buf = reader.stdout.read(W * H * 3); assert len(buf) == W * H * 3, f'short read at frame {t}'
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
    p = kuwahara(f, 6)
    if prev is not None:                                            # hold still areas steady; let motion through
        w = .6 * np.exp(-(np.abs(luma(p) - luma(prev)) / .05) ** 2)[..., None]
        p = w * prev + (1 - w) * p
    prev = p
    outs = {'source': f, **{n: np.clip(fn(p), 0, 1) for n, fn in DIRECTIONS.items()}}
    for n, img in outs.items():                                     # flicker: 2nd temporal difference of a 400 x 225 luma
        s = luma(img[::4, ::4]); hist[n] = (hist[n] + [s])[-3:]
        if len(hist[n]) == 3: energy[n].append(float(np.abs(hist[n][2] - 2 * hist[n][1] + hist[n][0]).mean()))
    for n in DIRECTIONS:
        b = (outs[n] * 255 + .5).astype(np.uint8)
        for e in pipes[n]: e.stdin.write(b.tobytes())
        if t == STILL: Image.fromarray(b).save(OUT / n / 'still.png')
    if t % 20 == 0: print('frame', t, flush=True)
for n in DIRECTIONS:
    for e in pipes[n]: e.stdin.close(); e.wait()
reader.wait()

src = np.array(energy['source'])
stats = {n: {'webm_kb': round((OUT / n / 'nba.webm').stat().st_size / 1024), 'mp4_kb': round((OUT / n / 'nba.mp4').stat().st_size / 1024),
             # median over frames of (direction's frame-to-frame jitter / the source's): ~1 = no flicker added
             'flicker_ratio': round(float(np.median(np.array(energy[n]) / np.maximum(src, 1e-4))), 2)} for n in DIRECTIONS}
(OUT / 'stats.json').write_text(json.dumps(stats, indent=2)); print(json.dumps(stats, indent=2))
