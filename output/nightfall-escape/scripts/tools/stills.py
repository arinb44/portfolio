# tools/stills.py
# Purpose: Preview stills from the hunter's eye at chosen points on the path, before the camera is
#          animated (M1/M2), plus an optional top-down map. Changes are in memory only; the .blend
#          is never saved.
# Run:     blender --background --factory-startup blend/escape_v001.blend --python scripts/tools/stills.py --
#            --out previews/m1 --at 0:fwd,20:fwd,40:back [--pct 50] [--samples 32] [--map] [--frame 1]
import argparse
import math
import os
import sys
import time

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import config as C  # noqa: E402

bpy.context.preferences.use_preferences_save = False
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--at", default="", help="s:fwd|back|<yaw offset deg>, comma separated")
ap.add_argument("--pct", type=int, default=50)
ap.add_argument("--samples", type=int, default=32)
ap.add_argument("--map", action="store_true")
ap.add_argument("--frame", type=int, default=1)
ap.add_argument("--pitch", type=float, default=-5.0)
ap.add_argument("--exposure", type=float, help="debug brightening, in stops")
a = ap.parse_args(argv)
out = os.path.abspath(a.out)
os.makedirs(out, exist_ok=True)
sc = bpy.context.scene
sc.frame_set(a.frame)


def gpu():
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == kind
                sc.cycles.device = "GPU"
                return kind
        except TypeError:
            continue
    return "CPU"


print("DEVICE", gpu())
sc.render.resolution_percentage = a.pct
sc.cycles.samples = a.samples
sc.render.use_motion_blur = False
if a.exposure is not None:
    sc.view_settings.exposure = a.exposure

cam_data = bpy.data.cameras.new("Probe")
cam_data.lens, cam_data.clip_end = 24, 200
cam = bpy.data.objects.new("Probe", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
for name in ("Flashlight", "FlashlightSpill"):
    lt = bpy.data.objects.get(name)
    if lt and lt.parent and lt.parent.name == "HunterEyes":
        lt.animation_data_clear()
        lt.parent = cam
        lt.rotation_euler = tuple(lt.get("aim", lt.rotation_euler))

ground = bpy.data.objects["Ground"]
for item in filter(None, a.at.split(",")):
    s, look = item.split(":")
    s = float(s)
    x, y = C.path_point(s)
    z = ground.ray_cast((x, y, 50), (0, 0, -1))[1].z if ground.ray_cast((x, y, 50), (0, 0, -1))[0] else 0
    yaw = C.path_heading(s) + {"fwd": 0.0, "back": 180.0}.get(look, 0.0 if look in ("fwd", "back") else float(look))
    cam.location = (x, y, z + C.EYE)
    cam.rotation_euler = (math.radians(90 + a.pitch), 0, math.radians(yaw))
    sc.render.filepath = os.path.join(out, f"s{int(s):03d}_{look}.png")
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"STILL s={s} {look} {time.time() - t:.1f}s -> {sc.render.filepath}", flush=True)

if a.map:  # top-down, workbench, fog hidden, path drawn
    bpy.data.objects["Fog"].hide_render = True
    path = bpy.data.objects.get("RunPath")
    if path:
        path.hide_render = False
        path.data.bevel_depth = 0.35
        m = bpy.data.materials.new("PathRed")
        m.diffuse_color = (1, 0.05, 0.02, 1)
        path.data.materials.append(m)
    g = ground.dimensions
    cam.location = (ground.matrix_world.translation.x + sum(v[0] for v in ground.bound_box) / 8,
                    sum(v[1] for v in ground.bound_box) / 8, 150)
    cam.rotation_euler = (0, 0, 0)
    cam_data.type, cam_data.ortho_scale = "ORTHO", max(g.x, g.y)
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.display.shading.color_type = "MATERIAL"
    sc.display.shading.light = "STUDIO"
    sc.view_settings.view_transform = "Standard"
    sc.render.resolution_x = sc.render.resolution_y = 1400
    sc.render.resolution_percentage = 100
    sc.render.filepath = os.path.join(out, "map_top.png")
    bpy.ops.render.render(write_still=True)
    print("MAP", sc.render.filepath)
