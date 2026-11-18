# 09_pack_final.py
# Purpose: Save the final scene as one self-contained .blend with every texture packed inside,
#          so it opens anywhere without the Game 2 folder or the textures/ working copies.
# Input:   output/nightfall-stalked/blend/stalked_v007.blend
# Output:  output/nightfall-stalked/final/stalked_final.blend
# Run:     blender --background --factory-startup blend/stalked_v007.blend --python 09_pack_final.py
import os

import bpy

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
os.makedirs(f"{ROOT}/final", exist_ok=True)
bpy.ops.file.pack_all()
unpacked = [i.name for i in bpy.data.images if i.source == "FILE" and not i.packed_file]
assert not unpacked, f"not packed: {unpacked}"
bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/final/stalked_final.blend", copy=True)
print("PACKED", f"{ROOT}/final/stalked_final.blend", os.path.getsize(f"{ROOT}/final/stalked_final.blend"))
