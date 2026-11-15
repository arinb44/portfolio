"""Prepares the home page's painting from the design agent's image. Run from the project root: python -I scripts/painting.py

Reads   output/creation-redesign/data/whole-group-aa.webp   (never changed)
Writes  public/creation/whole-group-aa.webp

Two changes:
1. Closes the notch that the plaster key cut into God's index finger.
2. Feathers the outer edge so the fresco fades into the ground instead of ending in a hard cut.
   The feather is narrow along the arm (it has to stay crisp up close) and wide everywhere else.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = 'output/creation-redesign/data/whole-group-aa.webp'
OUT = 'public/creation/whole-group-aa.webp'
PATH = [(690, 315), (560, 545), (390, 600), (215, 650), (2, 676)]  # the arm, as in src/scripts/creation.js
FINGER = (20, 630, 140, 710)   # x0, y0, x1, y1 around the index finger (crop px)
NEAR, FAR = 3, 55              # feather width in px: on the arm, and far from it
ARM, AWAY = 150, 420           # distance from the arm path over which the width grows


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def distance_to_path(w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    best = np.full((h, w), np.inf, np.float32)
    for (ax, ay), (bx, by) in zip(PATH, PATH[1:]):
        dx, dy = bx - ax, by - ay
        u = np.clip(((xx - ax) * dx + (yy - ay) * dy) / (dx * dx + dy * dy), 0, 1)
        best = np.minimum(best, np.hypot(ax + dx * u - xx, ay + dy * u - yy))
    return best


def main():
    im = np.asarray(Image.open(SRC).convert('RGBA')).astype(np.float32)
    rgb, alpha = im[..., :3], im[..., 3] / 255
    h, w = alpha.shape

    # 1. The finger: a morphological closing fills the notch; its colour is already there (the source bleeds colour outward).
    x0, y0, x1, y1 = FINGER
    solid = alpha[y0:y1, x0:x1] > .5
    disc = np.hypot(*np.mgrid[-9:10, -9:10]) <= 9
    closed = ndimage.binary_closing(solid, structure=disc, border_value=0)
    filled = closed & ~solid
    alpha[y0:y1, x0:x1][filled] = 1
    assert 0 < filled.sum() < 400, f'unexpected finger fill: {filled.sum()} px'

    # 2. The feather: alpha ramps from 0 at the edge to 1 at `width` px inside.
    inside = ndimage.distance_transform_edt(alpha > .5)
    width = NEAR + (FAR - NEAR) * smoothstep(ARM, AWAY, distance_to_path(w, h))
    alpha = np.minimum(alpha, smoothstep(0, 1, inside / width))

    out = np.dstack([rgb, alpha * 255]).round().astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(OUT, quality=90, method=6, exact=True)   # exact: keep colour under transparent pixels
    print(f'finger: filled {filled.sum()} px; wrote {OUT}')


if __name__ == '__main__':
    main()
