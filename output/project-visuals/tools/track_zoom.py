"""Estimate a moving camera's zoom and pan over one shot, so a logo box measured once follows the shot (M4b, MLB flight).

Run from the project root:  python -I output/project-visuals/tools/track_zoom.py <master> <crop> <first frame> <last frame> <out json>
  e.g. python -I output/project-visuals/tools/track_zoom.py art-src/project-visuals/mlb-24.mp4 crop=941:529:0:95 122 239 output/project-visuals/tools/mlb-flight.json
Works on the painter's 1600 x 900 frame (the same crop and scale as render.py). For each frame t it writes [k, x, y]: a point
(px, py) of the first frame sits at (k * px + x, k * py + y) in frame t. Between neighbouring frames it tries scales 0.96-1.06
about the centre and takes the one whose phase correlation peaks highest, with the shift at that peak.
"""
import json, subprocess, sys
import numpy as np
from scipy.ndimage import affine_transform

SRC, CROP, F0, F1, OUT = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
W, H, D = 1600, 900, 4                                  # work at 400 x 225
w, h = W // D, H // D
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', f'trim=start_frame={F0}:end_frame={F1 + 1},{CROP},scale={w}:{h}:flags=area',
                      '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True, check=True).stdout
G = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32) / 255
assert len(G) == F1 - F0 + 1, len(G)
win = np.outer(np.hanning(h), np.hanning(w)).astype(np.float32)
c = np.array([(h - 1) / 2, (w - 1) / 2])

def scaled(img, s):
    """img zoomed by s about the centre (a point p moves to c + s (p - c))."""
    return affine_transform(img, np.eye(2) / s, offset=c - c / s, order=1, mode='nearest')

def peak(a, b):
    """Phase correlation: (height, dy, dx) with b ~ a shifted by (dy, dx)."""
    R = np.fft.fft2(b * win) * np.conj(np.fft.fft2(a * win)); R /= np.abs(R) + 1e-9
    r = np.real(np.fft.ifft2(R)); i, j = np.unravel_index(np.argmax(r), r.shape)
    def sub(m, z, n):                                   # parabolic sub-pixel refinement
        v = [r[(i + d) % h, j] if z == 0 else r[i, (j + d) % w] for d in (-1, 0, 1)]
        den = v[0] - 2 * v[1] + v[2]; return m + (0 if den == 0 else .5 * (v[0] - v[2]) / den)
    dy, dx = sub(i, 0, h), sub(j, 1, w)
    return r[i, j], (dy + h / 2) % h - h / 2, (dx + w / 2) % w - w / 2

# Frame-to-frame: x_t = s (x_{t-1} - c) + c + d, in work pixels. Compose into first-frame -> frame-t, in full pixels.
k, off = 1.0, np.zeros(2)                               # x_t = k x_0 + off (row, col), work pixels
out = {F0: [1.0, 0.0, 0.0]}
for t in range(1, len(G)):
    best = max(((*peak(scaled(G[t - 1], s), G[t]), s) for s in np.arange(.96, 1.0601, .0025)), key=lambda q: q[0])
    _, dy, dx, s = best
    k, off = s * k, s * (off - c) + c + np.array([dy, dx])
    # full-res: X = D x + (D - 1) / 2 ; so X_t = k X_0 + (D off - k (D - 1) / 2 + (D - 1) / 2)
    o = D * off + (D - 1) / 2 * (1 - k)
    out[F0 + t] = [round(float(k), 5), round(float(o[1]), 2), round(float(o[0]), 2)]
json.dump(out, open(OUT, 'w'), indent=0)
print({t: out[t] for t in list(out)[::13]})
