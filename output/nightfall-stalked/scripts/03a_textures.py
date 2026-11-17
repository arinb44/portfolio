# 03a_textures.py
# Purpose: Make 4K working copies of the 8K Game 2 textures (8K maps cost ~1 GB each once
#          loaded) and 512 px thumbnails of the ground candidates. The originals are only read.
# Input:   Game 2 assests/textures (read only)
# Output:  output/nightfall-stalked/textures/*.png|jpg, textures/thumbs/*.jpg
# Run:     blender --background --factory-startup --python 03a_textures.py
import os

import bpy

SRC = "C:/Users/arins/Arin/School/Game Dev/Game 2/assests/textures"
OUT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked/textures"
os.makedirs(f"{OUT}/thumbs", exist_ok=True)

WORKING = {  # source -> (output name, longest side, colour data?)
    "Tree Textures/pine_bark_diff_8k.jpg": ("pine_bark_diff_4k.jpg", 4096, True),
    "Tree Textures/pine_bark_arm_8k.jpg": ("pine_bark_arm_4k.jpg", 4096, False),
    "Tree Textures/pine_bark_nor_gl_8k.png": ("pine_bark_nor_gl_4k.png", 4096, False),
    "Tree Textures/pine_bark_disp_8k.png": ("pine_bark_disp_4k.png", 4096, False),
    "rocky_gravel_diff_8k.jpg": ("rocky_gravel_diff_2k.jpg", 2048, True),  # reads as needle litter
    "rocky_gravel_arm_8k.jpg": ("rocky_gravel_arm_2k.jpg", 2048, False),
    "rocky_gravel_disp_8k.png": ("rocky_gravel_disp_2k.png", 2048, False),
}
ONLY_MISSING = True  # skip outputs that already exist (the 8K loads are slow)
THUMBS = [
    "Tree Textures/pine_bark_diff_8k.jpg",
    "ground037_alb_ht.dds",
    "rocky_gravel_diff_8k.jpg",
    "body textures/ground_albedo.png",
    "body textures/plants_albedo.png",
    "body textures/sticks_albedo.png",
    "coast_sand_rocks_02_diff_1k.jpg",
]


def save(img, path, size, colour):
    img.colorspace_settings.name = "sRGB" if colour else "Non-Color"  # before scale: changing it reloads from disk
    w, h = img.size
    k = size / max(w, h)
    if k < 1:
        img.scale(max(1, round(w * k)), max(1, round(h * k)))
    s = bpy.context.scene.render.image_settings
    s.file_format = "JPEG" if path.endswith(".jpg") else "PNG"
    s.color_mode = "RGB"
    s.color_depth = "8"
    if s.file_format == "JPEG":
        s.quality = 92
    img.save_render(path)
    print("wrote", path, tuple(img.size), "from", (w, h))


for src, (name, size, colour) in WORKING.items():
    if ONLY_MISSING and os.path.exists(f"{OUT}/{name}"):
        continue
    img = bpy.data.images.load(f"{SRC}/{src}")
    save(img, f"{OUT}/{name}", size, colour)
    bpy.data.images.remove(img)

for src in THUMBS:
    thumb = f"{OUT}/thumbs/{os.path.splitext(os.path.basename(src))[0]}.jpg"
    if ONLY_MISSING and os.path.exists(thumb):
        continue
    img = bpy.data.images.load(f"{SRC}/{src}")
    save(img, thumb, 512, True)
    bpy.data.images.remove(img)
