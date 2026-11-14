"""Cut the particle source images out of the full-size photo.

Run from output/creation-redesign/:  python -I tools/make_particle_source.py [--debug <dir>]
Reads  ../../art-src/creation-of-adam-3524.jpg
       Wikimedia Commons, "Michelangelo - Creation of Adam (cropped).jpg", 3524 x 1599, marked public domain
       (https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg), downloaded 2026-11-14.
Writes data/whole-group-aa.webp  round 1+: the whole group with an anti-aliased edge and edge colours bled in from inside
       data/god-mantle.webp   God + mantle (decision #15). Where the M1 outline cuts through other figures, alpha fades
                              out over FEATHER px instead of a hard cut. Against bare plaster the edge stays crisp.
       data/whole-group.webp  God, mantle, cherubs and the lower angel: Michelangelo's own edges, plaster keyed out.
       data/particles.json    shared crop size, fingertip, hand region (crop pixels). Both images use the same crop.
Alpha = how strongly a pixel becomes a particle (0 = none). Outlines are the hand-placed M1 polygons in
tools/trace_figure.py (1920 px space), scaled up.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # run with python -I (reads a downloaded file)
from trace_figure import GROUP, INNER, GOD, dilate

SRC = '../../art-src/creation-of-adam-3524.jpg'
FINGERTIP_1920 = (729, 392)  # from the fine hand tracing
HAND_X_1920 = 1040           # particles left of this sit on the hand and forearm
FEATHER = 36                 # px (full size) over which an internal cut fades out


def poly(points, f, size):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).polygon([(x * f, y * f) for x, y in points], fill=255)
    return np.asarray(m) > 0


def erode(m, n):
    return ~dilate(~m, n)


def flood(seed, through, max_iter=400):
    """Grow seed through `through` pixels (8-connected) until it stops changing."""
    region = seed.copy()
    for _ in range(max_iter):
        grown = dilate(region, 3) & (through | seed)
        if (grown == region).all():
            break
        region = grown
    return region


def distance_from(m, n):
    """Steps (0..n) from each pixel to the nearest True pixel of m; n where farther."""
    d, reach = np.full(m.shape, n, np.int16), m.copy()
    for k in range(n):
        d[reach & (d == n)] = k
        reach = dilate(reach, 1)
    return d


def main():
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    im = Image.open(SRC).convert('RGB')
    W, H = im.size
    f = W / 1920
    group = poly(GROUP, f, (W, H)) | poly(GOD, f, (W, H))  # the arm reaches outside GROUP
    ys, xs = np.nonzero(group)
    # Work inside the group's bounding box (+ margin) to keep the array ops fast.
    x0, y0, x1, y1 = max(xs.min() - 8, 0), max(ys.min() - 8, 0), min(xs.max() + 9, W), min(ys.max() + 9, H)
    rgb8 = np.asarray(im)[y0:y1, x0:x1]
    rgb = rgb8.astype(np.float32) / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    size = (W, H)
    cut = lambda m: m[y0:y1, x0:x1]
    group, god, inner = cut(group), cut(poly(GOD, f, size)), cut(poly(INNER, f, size) & ~poly(GOD, f, size))

    # Bare plaster: light and nearly neutral. Remove only plaster connected to the outside, so light cracks
    # inside the figures stay.
    plaster = (lum > 0.58) & (r - g < 0.07)
    outside = flood(~group, plaster)
    whole = group & ~outside
    whole = dilate(erode(whole, 2), 2)

    god_mantle = (god | (group & ~inner)) & whole
    god_mantle = dilate(erode(god_mantle, 2), 2)
    # Fade where the outline cuts through other painted figures (not where it meets plaster).
    cut_through = whole & ~god_mantle
    fade = distance_from(cut_through, FEATHER) / FEATHER
    alpha_gm = np.where(god_mantle, np.clip(fade * 1.15, 0, 1) * 255, 0).astype(np.uint8)
    # Round 1: anti-aliased edge. Blur the mask and re-sharpen it to a ~1.5 px soft edge, so the outline stays smooth
    # when the camera magnifies it, and pull edge colours in from inside the figure so no plaster fringe shows.
    blur = np.asarray(Image.fromarray(np.where(whole, 255, 0).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))) / 255
    soft = np.clip((blur - .2) / .6, 0, 1)
    alpha_aa = (soft * soft * (3 - 2 * soft) * 255).astype(np.uint8)
    alpha_wg = np.where(whole, 255, 0).astype(np.uint8)   # M2 and earlier keep the hard edge
    wt = np.asarray(Image.fromarray(np.where(whole, 255, 0).astype(np.uint8)).filter(ImageFilter.BoxBlur(3)), np.float32)
    bled = np.dstack([np.asarray(Image.fromarray((rgb8[..., c] * whole).astype(np.uint8)).filter(ImageFilter.BoxBlur(3)), np.float32) for c in range(3)])
    rgb_wg = np.where(whole[..., None], rgb8, np.clip(bled * 255 / np.maximum(wt, 1)[..., None], 0, 255)).astype(np.uint8)

    ys, xs = np.nonzero(whole)
    cx0, cy0, cx1, cy1 = xs.min() - 2, ys.min() - 2, xs.max() + 3, ys.max() + 3
    for name, colour, a in [('god-mantle', rgb8, alpha_gm), ('whole-group', rgb8, alpha_wg), ('whole-group-aa', rgb_wg, alpha_aa)]:
        rgba = np.dstack([colour, a])[cy0:cy1, cx0:cx1]
        Image.fromarray(rgba, 'RGBA').save(f'data/{name}.webp', quality=92, alpha_quality=100, method=6)

    ox, oy = x0 + cx0, y0 + cy0  # crop origin in full-size pixels
    tip_y = round(FINGERTIP_1920[1] * f) - oy
    row = np.nonzero(whole[cy0 + tip_y - 6:cy0 + tip_y + 7].any(axis=0))[0]
    meta = {
        'source': 'Wikimedia Commons, Michelangelo - Creation of Adam (cropped).jpg (public domain)',
        'w': int(cx1 - cx0), 'h': int(cy1 - cy0),
        'fingertip': [int(row.min() - cx0), int(tip_y)],  # leftmost painted pixel near the traced tip
        'handX': int(round(HAND_X_1920 * f) - ox),
        'particles': {'god-mantle': int((alpha_gm > 0).sum()), 'whole-group': int(whole.sum())},
    }
    json.dump(meta, open('data/particles.json', 'w'), indent=1)
    print(meta)

    if debug:
        for name in ['god-mantle', 'whole-group']:
            crop = Image.open(f'data/{name}.webp')
            out = Image.new('RGB', crop.size, (31, 29, 26))
            out.paste(crop, mask=crop.split()[3])
            out.save(f'{debug}/{name}-on-ink.jpg', quality=85)
            hx, hy = meta['fingertip']
            out.crop((max(hx - 20, 0), hy - 120, hx + 700, hy + 200)).save(f'{debug}/{name}-hand.png')


if __name__ == '__main__':
    main()
