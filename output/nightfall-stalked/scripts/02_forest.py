# 02_forest.py
# Purpose: M2 forest. Uneven ground, everything dropped onto it, young spruces at eye level,
#          dead branch stubs on near trunks, fallen logs, leaning snags, stumps and sticks.
#          Placeholder dark materials so the layout reads (real materials in 03_materials.py).
# Input:   output/nightfall-stalked/blend/stalked_v001.blend
# Output:  output/nightfall-stalked/blend/stalked_v002.blend
# Run:     blender --background --factory-startup blend/stalked_v001.blend --python 02_forest.py
import math
import random

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
EYE = 1.7
sc = bpy.context.scene
rng = random.Random(11)
rig = bpy.data.objects["WendigoRig"]
cam = bpy.data.objects["HunterEyes"]
spruce_mesh = bpy.data.meshes["Spruce"]
trees = list(bpy.data.collections["Forest"].objects)


def h(x, y):
    """Ground height: broad swells plus small lumps, zero under the hunter."""
    def raw(x, y):
        return 0.35 * noise.noise(Vector((x * 0.08, y * 0.08, 0.3))) + 0.08 * noise.noise(Vector((x * 0.45, y * 0.45, 1.7)))
    return raw(x, y) - raw(0.0, 0.0)


def near_segment(p, a, b, r):
    """True if 2D point p is within r of segment a-b."""
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length < r


# re-run safe: drop what this script built last time, then purge its orphaned data
for name in ("Understorey", "Deadwood"):
    for o in list(bpy.data.collections[name].objects) if name in bpy.data.collections else []:
        bpy.data.objects.remove(o, do_unlink=True)
if "Ground" in bpy.data.objects:
    bpy.data.objects.remove(bpy.data.objects["Ground"], do_unlink=True)
bpy.data.orphans_purge(do_recursive=True)


def new_collection(name):
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    col = bpy.data.collections.new(name)
    sc.collection.children.link(col)
    return col


def material(name, rgb, rough=0.85):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = rough
    return m


deadwood_mat = material("Deadwood", (0.07, 0.055, 0.045))
floor_mat = material("ForestFloor", (0.045, 0.04, 0.03), 0.9)

# --- ground ------------------------------------------------------------------------------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=300, y_subdivisions=300, size=90)
ground = bpy.context.active_object
ground.name = ground.data.name = "Ground"
for v in ground.data.vertices:
    v.co.z = h(v.co.x, v.co.y)
ground.data.shade_smooth()
ground.data.materials.append(floor_mat)

# --- drop what exists onto it ------------------------------------------------------------
for t in trees:
    t.location.z = h(t.location.x, t.location.y) - 0.08  # trunks sunk a little into the litter
rig.location.z = h(rig.location.x, rig.location.y)
cam.location.z = EYE + h(0, 0)

eye_xy = Vector((0.0, 0.0))
wendigo_xy = rig.location.xy.copy()
trunks = [t.location.xy.copy() for t in trees]


def clear_of_view(p, r):
    """Keep the hunter's spot open and a thin gap of sight to the wendigo."""
    return p.length > r and not near_segment(p, eye_xy, wendigo_xy, 0.8) and (p - wendigo_xy).length > 1.2


# --- young spruces at eye level ----------------------------------------------------------
under = new_collection("Understorey")
placed = []
for _ in range(15000):
    p = Vector((rng.uniform(-26, 26), rng.uniform(-26, 26)))
    if p.length > 26 or not clear_of_view(p, 2.8):
        continue
    if any((p - q).length < 2.0 for q in placed) or any((p - q).length < 0.9 for q in trunks):
        continue
    placed.append(p)
    s = rng.uniform(0.22, 0.5)
    o = bpy.data.objects.new(f"Sapling.{len(placed):03d}", spruce_mesh)
    o.location = (p.x, p.y, h(p.x, p.y) - 0.05)
    o.rotation_euler = (rng.uniform(-0.05, 0.05), rng.uniform(-0.05, 0.05), rng.uniform(0, math.tau))
    o.scale = (s, s, s * rng.uniform(0.9, 1.15))
    under.objects.link(o)

# --- dead branch stubs on the bare lower trunks of near trees (one joined mesh) ------------
dead = new_collection("Deadwood")
bm = bmesh.new()
for t in trees:
    if t.location.xy.length > 20:
        continue
    s = t.scale.x
    for _ in range(rng.randint(18, 30)):
        z = rng.uniform(0.6, 2.6) * s
        length = rng.uniform(0.15, 0.55) * s
        yaw = rng.uniform(0, math.tau)
        droop = math.radians(rng.uniform(82, 120))  # dead spruce twigs sit level or hang a little
        m = (Matrix.Translation(t.location + Vector((0, 0, z)))
             @ Matrix.Rotation(yaw, 4, "Z") @ Matrix.Rotation(droop, 4, "Y")
             @ Matrix.Translation((0, 0, length / 2)))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.009 * s, radius2=0.0015,
                              depth=length, matrix=m)
stubs_mesh = bpy.data.meshes.new("DeadBranches")
bm.to_mesh(stubs_mesh)
bm.free()
stubs = bpy.data.objects.new("DeadBranches", stubs_mesh)
stubs_mesh.materials.append(deadwood_mat)
dead.objects.link(stubs)


def log(name, base, direction, length, radius):
    """A tapered trunk from base along direction (fallen log, snag or stump)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=radius, radius2=radius * 0.7,
                          depth=length, matrix=Matrix.Translation((0, 0, length / 2)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(deadwood_mat)
    me.shade_smooth()
    o = bpy.data.objects.new(name, me)
    o.location = base
    o.rotation_euler = Vector((0, 0, 1)).rotation_difference(direction.normalized()).to_euler()
    dead.objects.link(o)
    return o


def free_spot(min_r, tries=200):
    for _ in range(tries):
        p = Vector((rng.uniform(-18, 18), rng.uniform(-18, 18)))
        if p.length < 18 and clear_of_view(p, min_r) and all((p - q).length > 0.6 for q in trunks):
            return p
    raise RuntimeError("no free spot")


for i in range(14):  # fallen logs, lying along the swells
    a = free_spot(3.0)
    yaw = rng.uniform(0, math.tau)
    length, r = rng.uniform(3, 7), rng.uniform(0.1, 0.22)
    b = a + Vector((math.cos(yaw), math.sin(yaw))) * length
    if near_segment(wendigo_xy, a, b, 1.0) or near_segment(eye_xy, a, b, 2.5):
        continue
    za, zb = h(a.x, a.y) + r * 0.6, h(b.x, b.y) + r * 0.6
    log(f"Log.{i:02d}", Vector((a.x, a.y, za)), Vector((b.x - a.x, b.y - a.y, zb - za)), length, r)

for i in range(6):  # leaning dead snags
    a = free_spot(4.0)
    yaw, lean = rng.uniform(0, math.tau), math.radians(rng.uniform(25, 55))
    d = Vector((math.cos(yaw) * math.sin(lean), math.sin(yaw) * math.sin(lean), math.cos(lean)))
    log(f"Snag.{i:02d}", Vector((a.x, a.y, h(a.x, a.y) - 0.1)), d, rng.uniform(4, 8), rng.uniform(0.07, 0.14))

for i in range(9):  # broken stumps
    a = free_spot(3.0)
    log(f"Stump.{i:02d}", Vector((a.x, a.y, h(a.x, a.y) - 0.1)), Vector((rng.uniform(-0.08, 0.08), 0, 1)),
        rng.uniform(0.3, 1.3), rng.uniform(0.1, 0.22))

# --- sticks on the floor near the hunter (one joined mesh) ---------------------------------
bm = bmesh.new()
for _ in range(700):
    p = Vector((rng.uniform(-14, 14), rng.uniform(-14, 14)))
    if p.length > 14 or p.length < 0.8:
        continue
    length, r = rng.uniform(0.15, 1.1), rng.uniform(0.004, 0.018)
    m = (Matrix.Translation((p.x, p.y, h(p.x, p.y) + r))
         @ Matrix.Rotation(rng.uniform(0, math.tau), 4, "Z")
         @ Matrix.Rotation(math.radians(90 + rng.uniform(-6, 6)), 4, "Y"))
    bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=r, radius2=r * 0.5, depth=length, matrix=m)
sticks_mesh = bpy.data.meshes.new("Sticks")
bm.to_mesh(sticks_mesh)
bm.free()
sticks = bpy.data.objects.new("Sticks", sticks_mesh)
sticks_mesh.materials.append(deadwood_mat)
dead.objects.link(sticks)

print("saplings", len(placed), "deadwood objects", len(dead.objects),
      "stub tris", sum(len(p.vertices) - 2 for p in stubs_mesh.polygons),
      "ground z range", round(min(v.co.z for v in ground.data.vertices), 2), round(max(v.co.z for v in ground.data.vertices), 2))

bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v002.blend")
print("saved", bpy.data.filepath)
