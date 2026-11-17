# 01_blockout.py
# Purpose: M1 blockout. Empty scene, units and output settings, the wendigo and one spruce
#          imported and scaled, ground, rough tree scatter, camera and flashlight placed.
# Inputs:  Game 2 models (read only): wendigo-col1.glb, spruce.glb
# Output:  output/nightfall-stalked/blend/stalked_v001.blend
# Run:     blender --background --factory-startup --python 01_blockout.py
#          (or live: exec this file in the open Blender through MCP)
import bpy

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
MODELS = "C:/Users/arins/Arin/School/Game Dev/Game 2/models"
WENDIGO_HEIGHT = 2.7

# --- empty scene -------------------------------------------------------------------------
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
bpy.data.orphans_purge(do_recursive=True)  # so a re-run doesn't pile up .001 copies

sc = bpy.context.scene
sc.unit_settings.system = "METRIC"
sc.unit_settings.scale_length = 1.0
sc.render.fps = 24
sc.frame_start, sc.frame_end = 1, 240
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
sc.render.resolution_percentage = 100
try:
    sc.render.engine = "CYCLES"
except TypeError as e:
    print("engine:", e)
sc.view_settings.view_transform = "AgX"


def import_glb(path, collection_name):
    """Import a glb into its own collection; return the new objects."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    col = bpy.data.collections.new(collection_name)
    sc.collection.children.link(col)
    for o in new:
        for c in o.users_collection:
            c.objects.unlink(o)
        col.objects.link(o)
    return new


# --- wendigo -----------------------------------------------------------------------------
wendigo_objs = import_glb(f"{MODELS}/wendigo-col1.glb", "Wendigo")
for o in wendigo_objs:
    if o.type == "MESH" and o.name.startswith("Icosphere"):
        bpy.data.objects.remove(o, do_unlink=True)  # stray helper sphere, not part of the creature
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
rig.name = "WendigoRig"
body = next(o for o in bpy.data.objects if o.type == "MESH" and o.parent == rig)
body.name = "Wendigo"
# The three unnamed Mixamo clips are exact copies of Run, Scream and Death (checked 2026-11-17).
for name in ("Armature.003|mixamo.com|Layer0", "Armature|mixamo.com|Layer0", "Armature|mixamo.com|Layer0.001"):
    for t in [t for t in rig.animation_data.nla_tracks if t.name == name]:
        rig.animation_data.nla_tracks.remove(t)
    bpy.data.actions.remove(bpy.data.actions[name])


def rest_height():
    rig.data.pose_position = "REST"
    bpy.context.view_layer.update()
    ev = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    zs = [(ev.matrix_world @ v.co).z for v in ev.data.vertices]
    rig.data.pose_position = "POSE"
    return max(zs) - min(zs)


rig.scale *= WENDIGO_HEIGHT / rest_height()  # 2.7 m tall standing, antlers included
rig.show_in_front = False
rig.hide_set(True)  # one imported bone is hundreds of metres long and covers the view; the body still deforms


def use_action(name):
    ad = rig.animation_data
    ad.action = bpy.data.actions[name]
    if ad.action_suitable_slots:
        ad.action_slot = ad.action_suitable_slots[0]


use_action("Run")

# --- spruce: join the Sketchfab hierarchy into one mesh object with its base at 0 ---------
spruce_objs = import_glb(f"{MODELS}/spruce.glb", "SpruceSource")
meshes = [o for o in spruce_objs if o.type == "MESH"]
bpy.ops.object.select_all(action="DESELECT")
for m in meshes:
    m.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.join()
spruce = bpy.context.view_layer.objects.active
spruce.name = "Spruce"
spruce.data.name = "Spruce"
for o in [o for o in bpy.data.collections["SpruceSource"].objects if o != spruce]:
    bpy.data.objects.remove(o, do_unlink=True)  # leftover Sketchfab empties

print("imported:", rig.name, body.name, spruce.name, "spruce dims", tuple(round(v, 2) for v in spruce.dimensions))


# --- part 2: ground, forest, camera, flashlight, moon, wendigo spot ------------------------
import math
import random
from mathutils import Vector

EYE = 1.7
# metres, degrees (0 = straight ahead, negative = right). Option A, chosen 2026-11-17.
WENDIGO_DIST, WENDIGO_BEARING = 7.5, -54.0
HIDE_DIST, HIDE_BEARING = 6.8, -49.0  # the trunk just left of it, between it and the beam


def at_bearing(dist, bearing):
    b = math.radians(bearing)
    return Vector((dist * -math.sin(b), dist * math.cos(b)))


def freeze_pose(action, frame):
    """Hold one frame of a clip as a static pose (breathing is added in 05_animation.py)."""
    use_action(action)
    sc.frame_set(frame)
    rig.animation_data.action = None  # pose bones keep the evaluated values


freeze_pose("Scream", 1)
rig.location = (*at_bearing(WENDIGO_DIST, WENDIGO_BEARING), 0.0)
rig.rotation_euler = (0.0, 0.0, math.radians(WENDIGO_BEARING))  # faces the hunter

# ground
bpy.ops.mesh.primitive_plane_add(size=90, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"

# forest: seeded dart-throwing (Poisson-like), linked duplicates so Cycles instances one mesh
spruce_src = bpy.data.objects["Spruce"]
spruce_src.hide_set(False)
spruce_src.hide_render = True
spruce_src.location = (0, 0, -50)  # source parked out of sight
forest = bpy.data.collections.new("Forest")
sc.collection.children.link(forest)
rng = random.Random(7)
hide_tree = at_bearing(HIDE_DIST, HIDE_BEARING)
points = [hide_tree]
keep_clear = [(Vector((0, 0)), 2.2), (rig.location.xy, 1.3)]
for _ in range(20000):
    p = Vector((rng.uniform(-35, 35), rng.uniform(-35, 35)))
    if p.length > 35 or any((p - c).length < r for c, r in keep_clear):
        continue
    if all((p - q).length >= 3.0 for q in points):
        points.append(p)
for i, p in enumerate(points):
    t = bpy.data.objects.new(f"Spruce.{i:03d}", spruce_src.data)
    t.location = (p.x, p.y, 0)
    t.rotation_euler = (0, 0, rng.uniform(0, math.tau))
    t.scale = (rng.uniform(0.85, 1.5),) * 3
    forest.objects.link(t)
bpy.data.objects["Spruce.000"].name = "HideTree"

# camera: hunter's eyes
cam_data = bpy.data.cameras.new("HunterEyes")
cam_data.lens, cam_data.clip_end = 24, 200
cam = bpy.data.objects.new("HunterEyes", cam_data)
sc.collection.objects.link(cam)
cam.location = (0, 0, EYE)
sc.camera = cam

# flashlight: just below and right of the eyes, aimed along the view
fl_data = bpy.data.lights.new("Flashlight", "SPOT")
fl_data.energy, fl_data.spot_size, fl_data.spot_blend = 1200, math.radians(25), 0.35  # ~mid-grey bark at 8 m
fl_data.color, fl_data.shadow_soft_size = (1.0, 0.9, 0.78), 0.02
fl = bpy.data.objects.new("Flashlight", fl_data)
sc.collection.objects.link(fl)
fl.parent = cam
fl.location = (0.15, -0.25, 0.0)
fl.rotation_euler = (math.radians(1.8), math.radians(1.0), 0)  # converge on the view centre ~8 m out

# moon: weak cold sun, plus a near-black blue world
moon_data = bpy.data.lights.new("Moon", "SUN")
moon_data.energy, moon_data.color, moon_data.angle = 0.06, (0.62, 0.74, 1.0), math.radians(0.5)
moon = bpy.data.objects.new("Moon", moon_data)
sc.collection.objects.link(moon)
moon.rotation_euler = (math.radians(35), 0, math.radians(200))
world = sc.world or bpy.data.worlds.new("Night")
sc.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs[0].default_value = (0.0015, 0.002, 0.004, 1)
bg.inputs[1].default_value = 1.0

# rough sweep (replaced by the exact looping hand-held move in 05_animation.py)
PITCH = -4.0
for frame, yaw in ((1, 22), (70, 5), (130, -34), (165, -36), (240, 22)):
    cam.rotation_euler = (math.radians(90 + PITCH), 0, math.radians(yaw))
    cam.keyframe_insert("rotation_euler", frame=frame)
sc.frame_set(150)
print("trees:", len(points), "wendigo at", tuple(round(v, 2) for v in rig.location), "hide tree at", tuple(round(v, 2) for v in hide_tree))

# --- save -----------------------------------------------------------------------------------
import os
os.makedirs(f"{ROOT}/blend", exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v001.blend", copy=False)
print("saved", bpy.data.filepath)
