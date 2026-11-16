"""M0: read the reference clip. Contact sheet, camera cuts and a WCAG 2.3.1 flash count.

Run from the project root:  python -I output/project-visuals/tools/m0_probe.py art-src/project-visuals/nba-reference.mp4
Writes {contact-sheet.png, report.json} to output/project-visuals/directions/m0, or to the folder given as a second argument.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

clip = Path(sys.argv[1])
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'output/project-visuals/directions/m0'); out.mkdir(parents=True, exist_ok=True)
W, H = 320, 180

def probe(key):
    return subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', f'stream={key}',
                           '-of', 'default=nw=1:nk=1', str(clip)], capture_output=True, text=True, check=True).stdout.strip()

num, den = map(int, probe('r_frame_rate').split('/')); fps = num / den
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(clip), '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
n = len(F); assert n > fps * 6, f'clip too short: {n} frames'
f32 = F.astype(np.float32) / 255

# Relative luminance (WCAG): linearise sRGB, then weight.
lin = np.where(f32 <= .04045, f32 / 12.92, ((f32 + .055) / 1.055) ** 2.4)
Y = lin @ np.array([.2126, .7152, .0722], np.float32)            # n x H x W

# Camera cuts: a jump in the 32x18 thumbnail far above the clip's usual frame-to-frame change.
thumb = Y.reshape(n, 18, H // 18, 32, W // 32).mean((2, 4))
step = np.abs(np.diff(thumb, axis=0)).mean((1, 2))
cuts = [int(i + 1) for i in np.where(step > max(.06, 6 * np.median(step)))[0]]

# Flashes (WCAG 2.3.1, general flash): in any window a third of the screen wide and tall (the 341 x 256 px of a
# 1024 x 768 screen), a swing in mean relative luminance of >= 0.1 with the darker state < 0.8 is a transition;
# two opposing transitions are one flash. Count the most flashes in any 1 s.
win = []
for y0 in range(0, H - H // 3 + 1, H // 12):
    for x0 in range(0, W - W // 3 + 1, W // 12):
        win.append(Y[:, y0:y0 + H // 3, x0:x0 + W // 3].mean((1, 2)))
worst, worst_at = 0, 0
for L in win:
    ts, lo, hi, lo_i, hi_i, last = [], L[0], L[0], 0, 0, None
    for i, v in enumerate(L):
        if v < lo: lo, lo_i = v, i
        if v > hi: hi, hi_i = v, i
        if hi - lo >= .1 and lo < .8:
            d = 'up' if hi_i > lo_i else 'down'
            if d != last: ts.append(i); last = d
            lo = hi = v; lo_i = hi_i = i
    for k, t in enumerate(ts):
        c = sum(1 for u in ts[k:] if u - t < fps) // 2
        if c > worst: worst, worst_at = c, t

# Contact sheet: one still every 0.25 s, labelled with its time; cuts marked in ochre.
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 14)
idx = list(range(0, n, int(fps / 4)))
cols = 6; rows = -(-len(idx) // cols)
sheet = Image.new('RGB', (cols * W, rows * (H + 20)), (31, 29, 26))
dr = ImageDraw.Draw(sheet)
for k, i in enumerate(idx):
    x, y = (k % cols) * W, (k // cols) * (H + 20)
    sheet.paste(Image.fromarray(F[i]), (x, y + 20))
    cut = any(abs(i - c) < fps / 8 for c in cuts)
    dr.text((x + 6, y + 2), f'{i / fps:5.2f}s  f{i}' + ('  CUT' if cut else ''), fill=(194, 149, 69) if cut else (238, 233, 223), font=font)
sheet.save(out / 'contact-sheet.png')

report = {'frames': n, 'fps': fps, 'seconds': round(n / fps, 2), 'cuts_s': [round(c / fps, 2) for c in cuts],
          'median_frame_step': round(float(np.median(step)), 4),
          'flash_max_per_second': worst, 'flash_worst_at_s': round(worst_at / fps, 2),
          'mean_luminance': round(float(Y.mean()), 3), 'max_frame_luminance': round(float(Y.mean((1, 2)).max()), 3)}
(out / 'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
