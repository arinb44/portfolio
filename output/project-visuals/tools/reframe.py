"""A crop that follows a subject (M4b, NFL: decision #47). Bakes the moving window into a new master for render.py.

Run from the project root:
  python -I output/project-visuals/tools/reframe.py <master> <keys json> <picture x0,y0,x1,y1> <crop w>x<crop h> <out mp4> [check <png>]
  e.g. ... reframe.py art-src/project-visuals/nfl-24.mp4 output/project-visuals/tools/nfl-runner.json 68,4,1212,588 763x429 art-src/project-visuals/nfl-24-framed.mp4
The subject's position (keys: frame -> [x, y] on the master) is interpolated, smoothed (Gaussian, 8 frames) and kept at 66% of the
window's width (clear of the home page's card) and 55% of its height; the window stays inside the picture (the broadcast box,
above its score bar). Writes the window's frames at the crop size, and <out>-window.json (the window's x0, y0 per frame), (lossless enough: x264 CRF 8, 4:4:4); render.py then
upscales them like any crop. `check <png>` writes a sheet of the window on frames every 24 instead of encoding.
"""
import json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter1d

SRC, KEYS, PIC, SIZE, OUT = sys.argv[1:6]
px0, py0, px1, py1 = map(int, PIC.split(',')); cw, ch = map(int, SIZE.split('x'))
FX, FY = .66, .55
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 720, 1280, 3); n = len(F)
keys = {int(k): v for k, v in json.load(open(KEYS))['keys'].items()}; ks = sorted(keys)
sx = np.interp(np.arange(n), ks, [keys[k][0] for k in ks]); sy = np.interp(np.arange(n), ks, [keys[k][1] for k in ks])
sx, sy = gaussian_filter1d(sx, 8, mode='nearest'), gaussian_filter1d(sy, 8, mode='nearest')
x0 = np.clip(np.round(sx - FX * cw), px0, px1 - cw).astype(int); y0 = np.clip(np.round(sy - FY * ch), py0, py1 - ch).astype(int)
assert (x0 >= px0).all() and (x0 + cw <= px1).all() and (y0 >= py0).all() and (y0 + ch <= py1).all()
pan = np.abs(np.diff(x0)); print(f'{n} frames; window x {x0.min()}-{x0.max()}, y {y0.min()}-{y0.max()}; pan per frame median {np.median(pan):.1f}, max {pan.max()} px')

if sys.argv[6:7] == ['check']:
    ts = list(range(0, n, 24)) + [n - 1]; sh = Image.new('RGB', (2 * 640, -(-len(ts) // 2) * 360))
    for i, t in enumerate(ts):
        im = Image.fromarray(F[t]).copy(); d = ImageDraw.Draw(im)
        d.rectangle((x0[t], y0[t], x0[t] + cw, y0[t] + ch), outline=(255, 0, 255), width=4)
        d.rectangle((x0[t] + .05 * cw, y0[t] + .33 * ch, x0[t] + .35 * cw, y0[t] + .71 * ch), outline=(200, 162, 74), width=3)  # the card
        d.ellipse((sx[t] - 12, sy[t] - 12, sx[t] + 12, sy[t] + 12), outline=(255, 255, 0), width=3); d.text((20, 660), f'f{t}', fill=(255, 60, 60))
        sh.paste(im.resize((640, 360)), ((i % 2) * 640, (i // 2) * 360))
    sh.save(sys.argv[7]); sys.exit()

json.dump({'crop': [cw, ch], 'x0': x0.tolist(), 'y0': y0.tolist()}, open(OUT.rsplit('.', 1)[0] + '-window.json', 'w'))   # the window per frame
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{cw}x{ch}', '-r', '24', '-i', '-', '-an',
                        '-c:v', 'libx264', '-crf', '8', '-preset', 'slow', '-pix_fmt', 'yuv444p', OUT], stdin=subprocess.PIPE)
for t in range(n): enc.stdin.write(np.ascontiguousarray(F[t, y0[t]:y0[t] + ch, x0[t]:x0[t] + cw]).tobytes())
enc.stdin.close(); enc.wait(); print('wrote', OUT)
