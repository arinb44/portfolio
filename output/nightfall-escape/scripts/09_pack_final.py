# 09_pack_final.py
# Purpose: Save the final scene as one self-contained .blend with every image and the sound mix
#          packed inside, so it opens and plays anywhere.
# Input:   output/nightfall-escape/blend/escape_v005.blend
# Output:  output/nightfall-escape/final/escape_final.blend
# Run:     blender --background --factory-startup blend/escape_v005.blend --python scripts/09_pack_final.py
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

os.makedirs(f"{C.ROOT}/final", exist_ok=True)
bpy.ops.file.pack_all()
unpacked = [i.name for i in bpy.data.images if i.source == "FILE" and not i.packed_file]
unpacked += [s.name for s in bpy.data.sounds if not s.packed_file]
assert not unpacked, f"not packed: {unpacked}"
path = f"{C.ROOT}/final/escape_final.blend"
bpy.ops.wm.save_as_mainfile(filepath=path, copy=True)
print("PACKED", path, os.path.getsize(path))
