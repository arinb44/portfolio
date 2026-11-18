# 08_encode.py
# Purpose: Encode a PNG sequence to an H.264 MP4 at 24 fps with Blender's own FFmpeg,
#          optionally playing it several times back to back (to check the loop seam).
# Input:   PNGs named <name>_####.png in --src
# Output:  --out (.mp4)
# Run:     blender --background --factory-startup --python 08_encode.py --
#            --src previews/m5-animation/loop --name loop --out previews/m5-animation/loop_x2.mp4 --repeat 2
import argparse
import glob
import os
import sys

import bpy

bpy.context.preferences.use_preferences_save = False
argv = sys.argv[sys.argv.index("--") + 1:]
ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True)
ap.add_argument("--name", default="f")
ap.add_argument("--out", required=True)
ap.add_argument("--repeat", type=int, default=1)
a = ap.parse_args(argv)
src, out = os.path.abspath(a.src), os.path.abspath(a.out)

files = sorted(glob.glob(os.path.join(src, f"{a.name}_[0-9][0-9][0-9][0-9].png")))
assert files, f"no {a.name}_####.png in {src}"
n = len(files)

sc = bpy.context.scene
first = bpy.data.images.load(files[0])
sc.render.resolution_x, sc.render.resolution_y = first.size
sc.render.resolution_percentage = 100
sc.render.fps, sc.render.fps_base = 24, 1.0
sc.view_settings.view_transform = "Standard"  # the PNGs are already graded; pass them through
ed = sc.sequence_editor_create()
for i in range(a.repeat):
    strip = ed.strips.new_image(name=f"pass{i}", filepath=files[0], channel=1, frame_start=1 + i * n)
    for fp in files[1:]:
        strip.elements.append(os.path.basename(fp))
sc.frame_start, sc.frame_end = 1, n * a.repeat

r = sc.render
r.image_settings.media_type = "VIDEO"  # Blender 5.x: video formats live under this media type
r.image_settings.file_format = "FFMPEG"
r.ffmpeg.format, r.ffmpeg.codec = "MPEG4", "H264"
r.ffmpeg.constant_rate_factor, r.ffmpeg.ffmpeg_preset = "HIGH", "GOOD"
r.use_file_extension = False
r.filepath = out
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.render.render(animation=True)
print("ENCODED", out, n * a.repeat, "frames", os.path.getsize(out) if os.path.exists(out) else "MISSING")
