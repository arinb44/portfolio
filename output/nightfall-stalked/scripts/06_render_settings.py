# 06_render_settings.py
# Purpose: Final render settings in the file itself, so the final .blend renders the same way
#          from Blender's own Render Animation as from 07_render.py.
# Input:   output/nightfall-stalked/blend/stalked_v006.blend
# Output:  output/nightfall-stalked/blend/stalked_v007.blend
# Run:     blender --background --factory-startup blend/stalked_v006.blend --python 06_render_settings.py
import bpy

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
sc = bpy.context.scene
r, cy = sc.render, sc.cycles

sc.frame_start, sc.frame_end, sc.frame_current = 1, 240, 1
r.fps, r.fps_base = 24, 1.0
r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 900, 100
r.use_motion_blur, r.motion_blur_shutter = True, 0.5
r.use_persistent_data = True
cy.device = "GPU"
cy.samples, cy.adaptive_threshold, cy.use_denoising = 128, 0.03, True
sc.view_settings.view_transform = "AgX"
r.image_settings.media_type = "IMAGE"
r.image_settings.file_format = "PNG"
r.image_settings.color_mode, r.image_settings.color_depth = "RGB", "8"
r.filepath = f"{ROOT}/final/frames/stalked_"
sc.camera = bpy.data.objects["HunterEyes"]

assert not [o for o in bpy.data.objects if "Probe" in o.name], "a probe camera was left in the scene"
bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v007.blend")
print("saved", bpy.data.filepath)
