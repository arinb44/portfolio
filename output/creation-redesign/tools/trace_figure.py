"""Turn the Creation of Adam image into node data for the Creation home page.

Run from output/creation-redesign/:  python tools/trace_figure.py [--debug <dir>]
Reads  source/creation-of-adam.webp (1920 x 871)
Writes data/god-nodes.json:
  pts:   flat [x, y, part, kind, tone, ...] in source pixels
         part 0 = God, 1 = mantle, 2 = cherubs; kind 0 = traced outline, 1 = tone node, 2 = key stroke; tone = luminance 0..255
  links: flat [i, j, ...] outline and stroke nodes joined along a contour
Like spolvero: outlines become dotted lines first; tone nodes add volume, and each look decides which to show
(plaster shows dark tones, night sky shows light ones). Outlines are hand-placed in source pixels from a grid overlay.
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = 'source/creation-of-adam.webp'
OUT = 'data/god-nodes.json'
FINGERTIP = (731, 389)  # tip of God's index finger
SEED = 7

# Whole group: mantle shell, God, cherubs, the lower angel. Scarf tail left out.
GROUP = [(930, 330), (950, 230), (1010, 150), (1080, 100), (1180, 60), (1280, 40), (1380, 30),
         (1480, 25), (1580, 24), (1680, 30), (1780, 40), (1840, 45), (1890, 60), (1918, 80),
         (1918, 420), (1912, 470), (1915, 530), (1920, 600), (1918, 650), (1880, 660), (1800, 690),
         (1790, 735), (1760, 740), (1680, 700), (1580, 670), (1500, 700), (1420, 770), (1395, 765),
         (1350, 700), (1280, 690), (1150, 650), (1080, 610), (1010, 560), (950, 480), (925, 400)]

# Figures inside the mantle shell (everything in GROUP outside this, and not God, is mantle).
INNER = [(1000, 340), (1045, 250), (1065, 150), (1110, 105), (1200, 90), (1260, 75), (1330, 70),
         (1420, 85), (1480, 95), (1560, 80), (1620, 100), (1680, 160), (1720, 220), (1740, 300),
         (1800, 390), (1840, 440), (1918, 470), (1918, 560), (1700, 575), (1720, 640), (1800, 690),
         (1790, 740), (1680, 700), (1580, 670), (1500, 700), (1420, 770), (1395, 765), (1350, 700),
         (1280, 690), (1150, 650), (1140, 640), (1100, 560), (1060, 470), (1050, 420), (1000, 400)]

# God: hand and arm, head and beard, robe, upper leg.
GOD = [(725, 388), (780, 372), (840, 363), (910, 350), (980, 330), (1060, 300),
       (1063, 255), (1058, 190), (1072, 140), (1105, 108), (1160, 98), (1220, 108), (1250, 150),
       (1300, 175), (1380, 163), (1440, 172), (1420, 230), (1380, 300), (1460, 330), (1540, 360),
       (1620, 420), (1660, 460), (1740, 470), (1830, 490), (1905, 500), (1912, 520), (1895, 545),
       (1780, 545), (1660, 545), (1560, 555), (1480, 560), (1380, 560), (1320, 520), (1240, 470),
       (1150, 430), (1100, 400), (1060, 375), (980, 390), (910, 395), (855, 405), (830, 425),
       (810, 440), (790, 445), (775, 430), (750, 405), (725, 395)]

HAND_X = 880  # left of this, God's hand: drawn only by the key strokes below


def zoomed(origin, z, pts):
    # Key strokes were traced on zoomed grid crops; convert those display coords to source pixels.
    return [(origin[0] + x / z, origin[1] + y / z) for x, y in pts]


HAND, HEAD = (715, 330), (1030, 90)      # coarse crops, 4x
FHAND, FFACE = (720, 355), (1060, 140)   # fine crops: hand 8x, face 6x
FINE = 3.5  # node step on the hand and face strokes
# Key strokes: (part, points[, step]). Hand-traced so the finger, hand, face and mantle read cleanly.
STROKES = [
    # Hand (fine crop) joined to the arm (coarse crop): top edge, fingertip and underside, thumb, bent finger, hanging fingers.
    (0, zoomed(FHAND, 8, [(85, 290), (120, 265), (200, 240), (280, 228), (360, 222), (430, 222), (520, 198), (600, 176),
                          (680, 155), (760, 137), (840, 118), (900, 103), (960, 85)])
        + zoomed(HAND, 4, [(520, 130), (600, 115), (700, 100), (800, 75), (860, 55), (950, 40), (1050, 20), (1150, 10)])
        + [(1030, 322), (1060, 305)], FINE),
    (0, zoomed(FHAND, 8, [(85, 290), (80, 305), (95, 322), (140, 330), (200, 330), (270, 326), (340, 323), (400, 330),
                          (440, 345), (470, 362)]), FINE),
    (0, zoomed(FHAND, 8, [(640, 245), (590, 290), (560, 330), (530, 355), (490, 350), (465, 320), (470, 295), (500, 285)]), FINE),
    (0, zoomed(FHAND, 8, [(620, 365), (540, 388), (460, 425), (390, 455), (362, 478), (370, 505), (395, 520), (440, 508),
                          (500, 482), (560, 458), (620, 440)]), FINE),
    (0, zoomed(FHAND, 8, [(402, 525), (400, 600), (410, 680), (420, 728), (445, 740), (465, 722), (470, 650), (480, 580),
                          (490, 540)]), FINE),
    (0, zoomed(FHAND, 8, [(490, 540), (485, 620), (482, 700), (492, 725), (518, 726), (535, 690), (545, 620), (560, 560),
                          (572, 520)]), FINE),
    (0, zoomed(FHAND, 8, [(612, 530), (606, 600), (614, 680), (640, 710), (668, 705), (684, 660), (690, 600), (700, 550),
                          (720, 525)]), FINE),
    (0, zoomed(FHAND, 8, [(720, 525), (780, 525), (840, 502), (885, 478), (925, 440), (960, 405)])
        + zoomed(HAND, 4, [(540, 292), (620, 283), (720, 282), (820, 288), (940, 300)]) + [(1000, 398), (1060, 378)], FINE),
    # Face (fine crop): profile, brow, eye, ear, hairline, moustache, beard, beard curls. Outer hair from the coarse crop.
    (0, zoomed(FFACE, 6, [(50, 175), (70, 250), (95, 300), (110, 335), (95, 385), (100, 450), (110, 515), (125, 562),
                          (150, 575), (180, 568)]), FINE),
    (0, zoomed(FFACE, 6, [(100, 300), (150, 290), (200, 295), (250, 310)]), FINE),
    (0, zoomed(FFACE, 6, [(130, 335), (160, 330), (195, 342), (215, 360)]), FINE),
    (0, zoomed(FFACE, 6, [(140, 360), (180, 364), (212, 362)]), FINE),
    (0, zoomed(FFACE, 6, [(420, 170), (460, 140), (510, 150), (530, 200), (520, 260), (490, 310), (460, 330), (440, 300),
                          (425, 240), (420, 170)]), FINE),
    (0, zoomed(FFACE, 6, [(450, 185), (490, 178), (500, 230), (480, 280)]), FINE),
    (0, zoomed(FFACE, 6, [(45, 170), (110, 150), (190, 128), (260, 112), (330, 105), (400, 130)]), FINE),
    (0, zoomed(FFACE, 6, [(150, 575), (200, 556), (255, 560), (295, 600), (290, 640)]), FINE),
    (0, zoomed(FFACE, 6, [(180, 600), (210, 650), (240, 700), (262, 760), (300, 820), (360, 860), (430, 880), (525, 888)])
        + [(1170, 267), (1181, 250), (1195, 231), (1205, 220)], FINE),
    (0, zoomed(FFACE, 6, [(230, 470), (300, 455), (360, 410), (420, 360), (470, 335)]), FINE),
    (0, zoomed(FFACE, 6, [(330, 600), (400, 570), (470, 600), (480, 680), (420, 720), (360, 690), (372, 640), (420, 640)]), FINE),
    (0, zoomed(FFACE, 6, [(500, 720), (545, 740), (552, 790), (505, 805)]), FINE),
    (0, zoomed(HEAD, 4, [(165, 330), (140, 280), (135, 240), (160, 205), (220, 165), (300, 140), (380, 125), (460, 110),
                         (530, 105), (580, 140), (600, 190)])),                          # outer hair
    (1, [(955, 320), (965, 270), (990, 220), (1020, 180), (1060, 140), (1100, 110), (1150, 80), (1210, 55), (1280, 38),
         (1380, 25), (1480, 20), (1580, 20), (1680, 25), (1760, 35), (1830, 45), (1870, 50), (1890, 45), (1918, 60)]),  # mantle shell
    (1, [(950, 400), (935, 450), (938, 500), (955, 545), (980, 575), (1020, 590), (1060, 588)]),  # mantle shell, below the arm
]
STROKE_STEP = {0: 4.5, 1: 7.0}
FACE_BOX = (1065, 160, 1150, 290)  # x0, y0, x1, y1: the face is drawn only by its strokes
# Node spacing in source pixels, per part: (outline, tone)
SPACING = {0: (6.0, 8.0), 1: (10.0, 12.0), 2: (9.0, 12.0)}


def poly_mask(points, size):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    return np.asarray(m) > 0


def dilate(m, n=1):
    for _ in range(n):
        p = np.pad(m, 1)
        m = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:] | p[:-2, :-2] | p[2:, 2:] | p[:-2, 2:] | p[2:, :-2]
    return m


def edges(lum, region):
    """Canny-style: Sobel, thin to ridges, keep weak edges only where they touch strong ones."""
    p = np.pad(lum, 1, mode='edge')
    gx = (p[:-2, 2:] + 2 * p[1:-1, 2:] + p[2:, 2:]) - (p[:-2, :-2] + 2 * p[1:-1, :-2] + p[2:, :-2])
    gy = (p[2:, :-2] + 2 * p[2:, 1:-1] + p[2:, 2:]) - (p[:-2, :-2] + 2 * p[:-2, 1:-1] + p[:-2, 2:])
    mag = np.hypot(gx, gy)
    ang = (np.rad2deg(np.arctan2(gy, gx)) + 180) % 180
    q = np.pad(mag, 1)
    nb = {0: (q[1:-1, :-2], q[1:-1, 2:]), 45: (q[:-2, 2:], q[2:, :-2]),
          90: (q[:-2, 1:-1], q[2:, 1:-1]), 135: (q[:-2, :-2], q[2:, 2:])}
    d = (np.round(ang / 45) * 45) % 180
    thin = np.zeros_like(mag, bool)
    for k, (a, b) in nb.items():
        sel = d == k
        thin |= sel & (mag >= a) & (mag >= b)
    vals = mag[region]
    hi, lo = np.percentile(vals, 90), np.percentile(vals, 75)
    strong, weak = thin & (mag > hi) & region, thin & (mag > lo) & region
    keep = strong
    for _ in range(40):
        keep = dilate(keep) & weak
    return keep | strong, mag / hi


def blue_noise(xs, ys, radius, order, keep_clear=()):
    """Accept points in the given order unless one already accepted (or in keep_clear) lies within that point's radius."""
    cell, grid, out = 6, {}, []
    for (x, y) in keep_clear:
        grid.setdefault((int(x) // cell, int(y) // cell), []).append((x, y))
    for k in order:
        x, y, r = int(xs[k]), int(ys[k]), float(radius[k])
        cx, cy, reach = x // cell, y // cell, int(r // cell) + 1
        if any((px - x) ** 2 + (py - y) ** 2 < r * r
               for gx in range(cx - reach, cx + reach + 1) for gy in range(cy - reach, cy + reach + 1)
               for (px, py) in grid.get((gx, gy), ())):
            continue
        grid.setdefault((cx, cy), []).append((x, y))
        out.append((x, y))
    return out


def main():
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    rng = np.random.default_rng(SEED)
    im = Image.open(SRC).convert('RGB')
    W, H = im.size
    lum8 = np.asarray(im.convert('L'))
    lum = np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(2.0))).astype(np.float32) / 255

    group, god, inner = poly_mask(GROUP, (W, H)), poly_mask(GOD, (W, H)), poly_mask(INNER, (W, H))
    part = np.full((H, W), -1, np.int8)
    part[group] = 2
    part[group & ~inner] = 1
    part[god] = 0
    part[part == 2] = -1  # decision #13: God + mantle only, no cherubs
    figure = part >= 0

    edge, strength = edges(lum, figure)
    spacing = np.zeros((H, W), np.float32)
    for pt, (so, _) in SPACING.items():
        spacing[part == pt] = so
    spacing[(part == 0) & (np.arange(W)[None, :] < HAND_X)] = 4.5

    # Key strokes: evenly spaced nodes along each traced polyline, consecutive nodes linked.
    strokes, slinks = [], []
    for pt, line, *step in STROKES:
        step, start = (step or [STROKE_STEP[pt]])[0], len(strokes)
        for (x0, y0), (x1, y1) in zip(line, line[1:]):
            n = max(1, int(np.hypot(x1 - x0, y1 - y0) / step))
            strokes += [(round(x0 + (x1 - x0) * k / n), round(y0 + (y1 - y0) * k / n), pt) for k in range(n)]
        strokes.append((round(line[-1][0]), round(line[-1][1]), pt))
        slinks += [(i, i + 1) for i in range(start, len(strokes) - 1)]

    # Traced outline nodes: along edge pixels, strongest first, kept clear of the strokes; none on the hand.
    edge &= ~((part == 0) & (np.arange(W)[None, :] < HAND_X))
    fx0, fy0, fx1, fy1 = FACE_BOX
    edge[fy0:fy1, fx0:fx1] = False
    ey, ex = np.nonzero(edge)
    order = np.argsort(-strength[ey, ex])
    outline = blue_noise(ex, ey, spacing[ey, ex], order, keep_clear=[(x, y) for x, y, _ in strokes])

    # Links: join outline nodes whose straight segment stays on the (slightly widened) edge.
    on_edge = dilate(edge, 1)
    P = np.array(outline, np.float32)
    links, degree = [], np.zeros(len(P), int)
    for i in range(len(P)):
        d = np.hypot(*(P - P[i]).T)
        lim = spacing[int(P[i, 1]), int(P[i, 0])] * 2.1
        for j in np.nonzero((d > 0) & (d < lim))[0][np.argsort(d[(d > 0) & (d < lim)])]:
            if j <= i or degree[i] >= 2 or degree[j] >= 2:
                continue
            t = np.linspace(0, 1, 8)
            sx = (P[i, 0] + (P[j, 0] - P[i, 0]) * t).round().astype(int)
            sy = (P[i, 1] + (P[j, 1] - P[i, 1]) * t).round().astype(int)
            if on_edge[sy, sx].mean() >= 0.85:
                links.append((i, int(j)))
                degree[i] += 1
                degree[j] += 1

    # Tone nodes: even blue noise over the figure, kept clear of outline nodes.
    fy, fx = np.nonzero(figure & ~dilate(edge, 2))
    pick = rng.permutation(len(fx))[:160000]
    fx, fy = fx[pick], fy[pick]
    tone_sp = np.zeros((H, W), np.float32)
    for pt, (_, st) in SPACING.items():
        tone_sp[part == pt] = st
    tone = blue_noise(fx, fy, tone_sp[fy, fx], np.arange(len(fx)), keep_clear=[(x, y) for x, y, _ in strokes])

    S = len(strokes)
    pts = [(x, y, pt, 2, int(lum8[min(y, H - 1), min(x, W - 1)])) for x, y, pt in strokes] + \
          [(x, y, int(part[y, x]), 0, int(lum8[y, x])) for x, y in outline] + \
          [(x, y, int(part[y, x]), 1, int(lum8[y, x])) for x, y in tone]
    links = slinks + [(i + S, j + S) for i, j in links]
    P = np.array([(p[0], p[1]) for p in pts], np.float32)
    data = {
        'source': 'Michelangelo, The Creation of Adam (c. 1508-1512), public domain; traced from the image the user shared',
        'w': W, 'h': H, 'fingertip': FINGERTIP,
        'parts': ['god', 'mantle', 'cherubs'], 'kinds': ['outline', 'tone', 'stroke'],
        'pts': [v for p in pts for v in p],
        'links': [v for l in links for v in l],
    }
    with open(OUT, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    by = lambda k, pt: sum(1 for p in pts if p[3] == k and p[2] == pt)
    print(f'{S} stroke nodes; {len(outline)} outline nodes (god {by(0, 0)}, mantle {by(0, 1)}, cherubs {by(0, 2)}), {len(links)} links; '
          f'{len(tone)} tone nodes (god {by(1, 0)}, mantle {by(1, 1)}, cherubs {by(1, 2)})')

    if debug:
        r = np.random.default_rng(1).random(len(pts))
        for look, bg, ink, line, show in [
            ('plaster', (238, 233, 223), (31, 29, 26), (150, 140, 128), lambda t, k: (1 - t / 255) ** 1.4 * 1.3),
            ('night', (16, 22, 42), (238, 233, 223), (90, 100, 140), lambda t, k: (t / 255) ** 1.6 * 1.2),
        ]:
            prev = Image.new('RGB', (W, H), bg)
            d = ImageDraw.Draw(prev)
            for i, j in links:
                d.line([tuple(P[i]), tuple(P[j])], fill=line, width=1)
            for (x, y, pt, k, t), ri in zip(pts, r):
                if pt == 2 and k == 1:
                    continue
                if k != 1 or ri < show(t, k):
                    s = 1.6 if k == 2 else 1.3 if k == 0 else 1.0
                    d.ellipse([x - s, y - s, x + s, y + s], fill=ink)
            prev.crop((680, 0, 1920, 871)).save(f'{debug}/study-{look}.png')
        over = np.asarray(im).copy()
        tints = {0: (255, 255, 0), 1: (0, 255, 0), 2: (0, 160, 255)}
        for pt, c in tints.items():
            over[part == pt] = (over[part == pt] * 0.6 + np.array(c) * 0.4).astype(np.uint8)
        Image.fromarray(over).crop((680, 0, 1920, 871)).save(f'{debug}/masks.png')


if __name__ == '__main__':
    main()
