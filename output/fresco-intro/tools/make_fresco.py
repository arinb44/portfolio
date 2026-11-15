"""Web images of the full Creation of Adam for the intro (decision D3 compares the two sizes).

Source: Wikimedia Commons, "Michelangelo - Creation of Adam (cropped).jpg", 3524 x 1599, marked public domain,
        git-ignored copy in art-src/creation-of-adam-3524.jpg (the same file creation-redesign used).
Run from the project root: python -I output/fresco-intro/tools/make_fresco.py
Writes output/fresco-intro/data/fresco-3524.webp (q80) and fresco-2560.webp (q88).
"""
from PIL import Image

im = Image.open('art-src/creation-of-adam-3524.jpg').convert('RGB')
assert im.size == (3524, 1599), im.size
for w, q in [(3524, 80), (2560, 88)]:
    out = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    out.save(f'output/fresco-intro/data/fresco-{w}.webp', quality=q, method=6)
    print(w, out.size)
