# 05b_eyes.py
# Purpose: Faint red glowing eyes (user request 2026-11-17): two small emissive spheres set
#          inside the skull's eye sockets, parented to the head bone so they follow the
#          breathing and head turn from 05_animation.py.
# Input:   output/nightfall-stalked/blend/stalked_v005.blend
# Output:  output/nightfall-stalked/blend/stalked_v006.blend
# Run:     blender --background --factory-startup blend/stalked_v005.blend --python 05b_eyes.py
import bpy
from mathutils import Matrix, Vector

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
EYE_GLOW = 0.9               # emission strength; 2.0 flooded the skull with red, 0.9 reads as faint
EYE_COLOUR = (1.0, 0.04, 0.02)
EYE_RADIUS = 0.02            # metres
INSET = 0.0                  # metres further in, away from the hunter (the points below are already inset)
# Eye centres at frame 150, 3.5 cm inside each eye socket's rim (sockets are ~7 cm deep). Found by
# ray-casting a pixel grid from an orthographic probe camera on each side of the skull, aimed along
# its left-right axis (from the antler-base pair). The far socket was re-centred with a close
# window search (its opening merges with other skull holes); both agree to 2 cm when mirrored.
SOCKETS = [Vector((5.898, 3.923, 1.751)), Vector((5.754, 3.951, 1.742))]

sc = bpy.context.scene
sc.frame_set(150)  # the frame the socket centres were measured at
rig = bpy.data.objects["WendigoRig"]
cam_pos = bpy.data.objects["HunterEyes"].matrix_world.translation

mat = bpy.data.materials.get("WendigoEyes") or bpy.data.materials.new("WendigoEyes")
mat.use_nodes = True
nodes, links = mat.node_tree.nodes, mat.node_tree.links
nodes.clear()
emit = nodes.new("ShaderNodeEmission")
emit.inputs["Color"].default_value = (*EYE_COLOUR, 1)
emit.inputs["Strength"].default_value = EYE_GLOW
out = nodes.new("ShaderNodeOutputMaterial")
links.new(emit.outputs["Emission"], out.inputs["Surface"])

col = bpy.data.collections["Wendigo"]
for i, socket in enumerate(SOCKETS):
    name = f"WendigoEye.{'LR'[i]}"
    if name in bpy.data.objects:  # re-run safe
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=EYE_RADIUS)
    eye = bpy.context.active_object
    eye.name = eye.data.name = name
    for c in eye.users_collection:
        c.objects.unlink(eye)
    col.objects.link(eye)
    eye.data.materials.append(mat)
    eye.data.shade_smooth()
    eye.visible_shadow = False
    world = Matrix.Translation(socket + (socket - cam_pos).normalized() * INSET)
    eye.parent, eye.parent_type, eye.parent_bone = rig, "BONE", "mixamorig:Head"
    eye.matrix_world = world  # stored relative to the head bone at this frame

# self-check: the eyes move with the head between frames
sc.frame_set(150)
a = bpy.data.objects["WendigoEye.L"].matrix_world.translation.copy()
sc.frame_set(30)
b = bpy.data.objects["WendigoEye.L"].matrix_world.translation.copy()
assert 0.0005 < (a - b).length < 0.2, f"eye did not follow the head sensibly: moved {(a - b).length:.4f} m"
print("eye moves with head:", round((a - b).length, 4), "m between frames 30 and 150")
sc.frame_set(1)

bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v006.blend")
print("saved", bpy.data.filepath)
