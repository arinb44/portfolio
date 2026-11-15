"""A smooth depth map for round 5's "depth and focus": 1 on the figures (God's group, Adam and his ground), 0 on the
plaster and sky. The shader uses it as a rubber sheet (figures move against the plaster), so it only needs to be roughly
right and smooth: no cut-outs, no clean plate.

God's group: the hand-traced mask from creation-redesign (output/creation-redesign/data/whole-group.webp), which sits at
(1339, 43) in the 3524 px image (found by matching, mean colour difference 1.6/255).
Adam and his ground: everything left of the gap that is not plaster-like (low saturation, light), cleaned up.
Run from the project root: python -I output/fresco-intro/tools/make_depth.py
Writes output/fresco-intro/data/fresco-depth.png (881 x 400, grayscale) and a debug overlay in the same folder.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

im = Image.open('art-src/creation-of-adam-3524.jpg').convert('RGB')
W, H = im.size
rgb = np.asarray(im, np.float32) / 255
hsv = np.asarray(im.convert('HSV'), np.float32) / 255
sat, val = hsv[..., 1], hsv[..., 2]

god = np.zeros((H, W), bool)
g = np.asarray(Image.open('output/creation-redesign/data/whole-group.webp').convert('RGBA'))[..., 3] > 128
god[43:43 + g.shape[0], 1339:1339 + g.shape[1]] = g[:H - 43, :W - 1339]

plaster = (sat < .2) & (val > .62)
adam = ~plaster
yy, xx = np.mgrid[:H, :W]
adam &= (xx < 1345) | ((yy > 900) & (xx < 2150))          # Adam's side: left of the gap, and his ground below God's arm
adam = ndimage.binary_opening(adam, iterations=3)          # drop the plaster's cracks (thin dark lines)
adam = ndimage.binary_closing(adam, iterations=12)         # fill highlights on the skin and gaps in the hill
adam = ndimage.binary_fill_holes(adam)
lab, n = ndimage.label(adam)
sizes = ndimage.sum(adam, lab, range(1, n + 1))
adam = np.isin(lab, 1 + np.flatnonzero(sizes > 20000))     # keep the big pieces: Adam and the ground
fig = (god | adam) & ~((xx > 1290) & (xx < 1350) & (yy > 690) & (yy < 770) & plaster)   # keep the plaster between the fingertips flat

depth = ndimage.gaussian_filter(fig.astype(np.float32), 14)
out = Image.fromarray((depth * 255).astype(np.uint8)).resize((W // 4, H // 4), Image.LANCZOS)
out.save('output/fresco-intro/data/fresco-depth.png')
dbg = (rgb * .45 + np.dstack([depth, depth * .3, depth * 0]) * .55).clip(0, 1)
Image.fromarray((dbg * 255).astype(np.uint8)).resize((W // 3, H // 3)).save('output/fresco-intro/data/fresco-depth-debug.jpg', quality=85)
print('figure share', round(float(fig.mean()), 3), 'pieces kept on Adam side', int((sizes > 20000).sum()))
