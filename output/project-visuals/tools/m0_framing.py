"""M0 framing sheet: key moments of the clip at 1440 x 900 under the home page's card gradients, full frame vs reframed right.

Run from the project root:  python -I output/project-visuals/tools/m0_framing.py
Writes output/project-visuals/directions/m0/framing.png (half size).
"""
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC, W, H, REFRAME = 'art-src/project-visuals/nba-24.mp4', 1440, 900, 1.36
INK = np.array([0x1F, 0x1D, 0x1A], np.float32)
moments = [(0.6, 'crossover'), (3.9, 'stumble'), (5.6, 'low dribble'), (7.6, 'step-back')]

def frame(t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', SRC, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    return Image.frombuffer('RGB', (1280, 720), raw)

def cover(im, s):
    # object-fit: cover, then CSS scale(s) about the left-centre (transform-origin: 0 50%).
    k = max(W / im.width, H / im.height) * s
    big = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x0 = round((im.width * max(W / im.width, H / im.height) - W) / 2 * s)   # cover's own centring crop, scaled
    y0 = (big.height - H) // 2
    return np.asarray(big.crop((x0, y0, x0 + W, y0 + H)), np.float32)

# The two gradients of .visuals::after, as alpha of ink.
x = np.linspace(0, 1, W)
ax = np.interp(x, [0, .32, .46, .64, 1], [.94, .94, .55, 0, 0])
ay = np.clip(1 - np.arange(H) / 144, 0, 1) * .8
def grade(a):
    for al in (ax[None, :, None], ay[:, None, None]): a = a * (1 - al) + INK * al
    return a

font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 22)
sheet = Image.new('RGB', (2 * W + 20, len(moments) * (H + 40)), tuple(INK.astype(int)))
dr = ImageDraw.Draw(sheet)
for r, (t, name) in enumerate(moments):
    im = frame(t)
    for c, s in enumerate((1, REFRAME)):
        a = grade(cover(im, s))
        tile = Image.fromarray(a.clip(0, 255).astype(np.uint8))
        td = ImageDraw.Draw(tile)
        td.rectangle((72, 300, 72 + 432, 640), outline=(200, 162, 74), width=2)   # where the card sits (5vw, 30vw wide)
        x0, y0 = c * (W + 20), r * (H + 40)
        sheet.paste(tile, (x0, y0 + 40))
        dr.text((x0 + 8, y0 + 8), f'{t:.1f}s {name} · ' + ('full frame' if s == 1 else f'reframed right (x{REFRAME})'), fill=(238, 233, 223), font=font)
sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save('output/project-visuals/directions/m0/framing.png')
print('ok')
