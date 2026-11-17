# 07_render.py
# Purpose: Render chosen frames of a saved version in the background on the GPU (OptiX, CUDA
#          fallback), timing each frame. Used for option previews, the timing test and the final.
#          Overrides (--set) change a copy in memory only; the .blend is never saved.
# Input:   any blend/stalked_v###.blend
# Output:  PNGs in --out, a "FRAME <n> <seconds>" line per frame on stdout
# Run:     blender --background --factory-startup blend/stalked_v004.blend --python 07_render.py --
#            --out previews/m4/x --frames 150 [--pct 50] [--samples 64] [--name f] [--set fog=0.05]
import argparse
import os
import sys
import time

import bpy

bpy.context.preferences.use_preferences_save = False  # never touch the user's saved preferences
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--frames", default="150", help="e.g. 150 or 1,70,150 or 1-240")
ap.add_argument("--pct", type=int, default=100)
ap.add_argument("--samples", type=int)
ap.add_argument("--name", default="f")
ap.add_argument("--set", action="append", default=[], help="fog|moon|hot|spill|exposure=value")
a = ap.parse_args(argv)
a.out = os.path.abspath(a.out)  # Blender reads relative render paths from the drive root

sc = bpy.context.scene
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = kind
        prefs.get_devices()
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind
            print("DEVICE", kind, [d.name for d in gpus])
            break
    except TypeError:
        continue
else:
    print("DEVICE CPU (no GPU found)")
sc.cycles.device = "GPU"
sc.cycles.denoiser = "OPTIX" if prefs.compute_device_type == "OPTIX" else "OPENIMAGEDENOISE"
sc.render.resolution_percentage = a.pct
if a.samples:
    sc.cycles.samples = a.samples

fog_vol = next((n for n in bpy.data.materials["Fog"].node_tree.nodes if n.type == "PRINCIPLED_VOLUME"), None) \
    if "Fog" in bpy.data.materials else None
SETTERS = {
    "fog": lambda v: setattr(fog_vol.inputs["Density"], "default_value", v),
    "moon": lambda v: setattr(bpy.data.lights["Moon"], "energy", v),
    "hot": lambda v: setattr(bpy.data.lights["Flashlight"], "energy", v),
    "spill": lambda v: setattr(bpy.data.lights["FlashlightSpill"], "energy", v),
    "exposure": lambda v: setattr(sc.view_settings, "exposure", v),
}
for s in a.set:
    key, value = s.split("=")
    SETTERS[key](float(value))
    print("SET", key, value)

frames = []
for part in a.frames.split(","):
    lo, _, hi = part.partition("-")
    frames += range(int(lo), int(hi or lo) + 1)

sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_depth = "8"
os.makedirs(a.out, exist_ok=True)
for f in frames:
    sc.frame_set(f)
    sc.render.filepath = os.path.join(a.out, f"{a.name}_{f:04d}.png")
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"FRAME {f} {time.time() - t:.1f}", flush=True)
