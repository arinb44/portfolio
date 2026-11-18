# 01_path_forest.py
# Purpose: M1. Start from Stalked's packed final scene and stretch its forest along the run:
#          600-frame range, the run path (curve + path.json), a larger ground with Stalked's own
#          height function (the start area is unchanged), spruces, saplings, logs, snags, stumps,
#          trunk twigs and sticks along the path with Stalked's rules, a clear running lane and
#          clear sight lines for the three look-backs, and the fog box stretched over it all.
# Input:   output/nightfall-stalked/final/stalked_final.blend (read only, never saved over)
# Output:  output/nightfall-escape/blend/escape_v001.blend, output/nightfall-escape/path.json
# Run:     blender --background --factory-startup <stalked_final.blend> --python 01_path_forest.py
import json
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

sc = bpy.context.scene
rng = random.Random(126)
LANE_TREE, LANE_SAPLING, LANE_WOOD = 1.4, 1.7, 1.2   # metres kept clear either side of the path
SIGHT = 0.9                                            # metres kept clear around look-back sight lines
CORRIDOR = 32.0                                        # how far either side of the path the forest goes


def h(x, y):
    """Stalked's ground height (02_forest.py), zero under the hunter's start."""
    def raw(x, y):
        return 0.35 * noise.noise(Vector((x * 0.08, y * 0.08, 0.3))) + 0.08 * noise.noise(Vector((x * 0.45, y * 0.45, 1.7)))
    return raw(x, y) - raw(0.0, 0.0)


SIGHTS = C.lookback_segments()
SIGHTS.append(((0.0, 0.0), tuple(bpy.data.objects["WendigoRig"].location.xy)))  # Stalked's own gap


def blocks_sight(p, r=SIGHT):
    return any(C.seg_dist(p, a, b) < r for a, b in SIGHTS)


# --- frame range ---------------------------------------------------------------------------
sc.frame_start, sc.frame_end, sc.frame_current = 1, C.N, 1
sc.render.fps, sc.render.fps_base = C.FPS, 1.0

# --- path: a curve object for reference, and samples for the other scripts ----------------
samples = []
s = 0.0
while s <= C.LENGTH:
    x, y = C.path_point(s)
    samples.append((round(s, 3), round(x, 4), round(y, 4), round(h(x, y), 4)))
    s += 0.25
with open(f"{C.ROOT}/path.json", "w") as fp:
    json.dump({"length": C.LENGTH, "step": 0.25, "points": samples}, fp)
cu = bpy.data.curves.new("RunPath", "CURVE")
cu.dimensions = "3D"
sp = cu.splines.new("POLY")
sp.points.add(len(samples) - 1)
for pt, (_, x, y, z) in zip(sp.points, samples):
    pt.co = (x, y, z + 0.05, 1)
path_obj = bpy.data.objects.new("RunPath", cu)
sc.collection.objects.link(path_obj)
path_obj.hide_render = True

# --- ground: rebuilt larger, same height function, same material and modifiers -------------
xs, ys = [p[1] for p in samples], [p[2] for p in samples]
x0, x1 = min(min(xs) - 40, -45), max(max(xs) + 40, 45)   # the path plus 40 m, and Stalked's 90 m square
y0, y1 = min(min(ys) - 40, -45), max(max(ys) + 40, 45)
W, H = x1 - x0, y1 - y0
ground = bpy.data.objects["Ground"]
old_w, old_h = ground.dimensions.x, ground.dimensions.y
nx, ny = int(W / 0.3), int(H / 0.3)
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=nx, y_segments=ny, size=0.5, calc_uvs=True)
for v in bm.verts:
    v.co.x = x0 + (v.co.x + 0.5) * W
    v.co.y = y0 + (v.co.y + 0.5) * H
    v.co.z = h(v.co.x, v.co.y)
me = bpy.data.meshes.new("GroundRun")
bm.to_mesh(me)
bm.free()
me.shade_smooth()
for m in ground.data.materials:
    me.materials.append(m)
old_me = ground.data
ground.data = me
ground.location = (0, 0, 0)
bpy.data.meshes.remove(old_me)
me.name = "Ground"
# the floor textures were scaled for a 90 m square in UV 0-1; keep their size in metres
floor = bpy.data.materials["ForestFloor"]
for n in floor.node_tree.nodes:
    if n.type == "MAPPING" and n.inputs["Vector"].is_linked and \
            n.inputs["Vector"].links[0].from_socket.name == "UV":
        sx, sy, sz = n.inputs["Scale"].default_value
        n.inputs["Scale"].default_value = (sx * W / old_w, sy * H / old_h, sz)

# --- clear the running lane in Stalked's part of the forest ---------------------------------
removed_trunks = []
for o in list(bpy.data.collections["Forest"].objects):
    p = tuple(o.location.xy)
    if C.dist_to_path(p) < LANE_TREE or blocks_sight(p):
        if o.name == "HideTree":
            continue  # Stalked's tree beside the wendigo stays (it's off the run)
        removed_trunks.append(o.location.xy.copy())
        bpy.data.objects.remove(o, do_unlink=True)
for o in list(bpy.data.collections["Understorey"].objects):
    p = tuple(o.location.xy)
    if C.dist_to_path(p, -8) < LANE_SAPLING or blocks_sight(p, SIGHT + 0.3):
        bpy.data.objects.remove(o, do_unlink=True)


def wood_segment(o):
    """Ground-projected ends of a log, snag or stump (they're cones along local Z)."""
    a = o.matrix_world.translation
    b = o.matrix_world @ Vector((0, 0, o.dimensions.z / max(o.scale.z, 1e-6)))
    return a, b


def wood_blocks(a, b, lane):
    n = max(2, int((a - b).length / 0.25))
    for i in range(n + 1):
        p = a.lerp(b, i / n)
        if p.z - h(p.x, p.y) < 2.2 and (C.dist_to_path(tuple(p.xy), -2) < lane or blocks_sight(tuple(p.xy), 0.6)):
            return True
    return False


removed_wood = 0
for o in list(bpy.data.collections["Deadwood"].objects):
    if o.name.split(".")[0] in ("Log", "Snag", "Stump") and wood_blocks(*wood_segment(o), LANE_WOOD):
        bpy.data.objects.remove(o, do_unlink=True)
        removed_wood += 1

# twigs on the trunks that are gone
stubs = bpy.data.objects["DeadBranches"]
bm = bmesh.new()
bm.from_mesh(stubs.data)
gone = [v for v in bm.verts if any((v.co.xy - t).length < 0.9 for t in removed_trunks)]
bmesh.ops.delete(bm, geom=gone, context="VERTS")
bm.to_mesh(stubs.data)
bm.free()

# --- new forest along the path ---------------------------------------------------------------
forest, under, dead = (bpy.data.collections[n] for n in ("Forest", "Understorey", "Deadwood"))
spruce_mesh = bpy.data.meshes["Spruce"]
trunks = [o.location.xy.copy() for o in forest.objects]


def in_corridor(p, width):
    return C.dist_to_path((p.x, p.y), -2) < width


def candidates(n, width, inner):
    """Random points within `width` of the path and outside Stalked's original disk of radius `inner`."""
    for _ in range(n):
        p = Vector((rng.uniform(x0 + 2, x1 - 2), rng.uniform(y0 + 2, y1 - 2)))
        if p.length > inner and in_corridor(p, width):
            yield p


def grid_key(p, cell):
    return (int(math.floor(p.x / cell)), int(math.floor(p.y / cell)))


def near_any(p, grid, cell, r):
    gx, gy = grid_key(p, cell)
    for i in (-1, 0, 1):
        for j in (-1, 0, 1):
            for q in grid.get((gx + i, gy + j), ()):
                if (p - q).length < r:
                    return True
    return False


tree_grid = {}
for t in trunks:
    tree_grid.setdefault(grid_key(t, 3.0), []).append(t)
new_trees = []
for p in candidates(60000, CORRIDOR, 35.0):
    if C.dist_to_path((p.x, p.y)) < LANE_TREE or blocks_sight((p.x, p.y)) or near_any(p, tree_grid, 3.0, 3.0):
        continue
    tree_grid.setdefault(grid_key(p, 3.0), []).append(p)
    new_trees.append(p)
    t = bpy.data.objects.new(f"SpruceRun.{len(new_trees):03d}", spruce_mesh)
    t.location = (p.x, p.y, h(p.x, p.y) - 0.08)
    t.rotation_euler = (0, 0, rng.uniform(0, math.tau))
    t.scale = (rng.uniform(0.85, 1.5),) * 3
    forest.objects.link(t)
trunks += new_trees

sap_grid = {}
for o in under.objects:
    sap_grid.setdefault(grid_key(o.location.xy, 2.0), []).append(o.location.xy.copy())
new_saplings = 0
for p in candidates(40000, 26.0, 26.0):
    if C.dist_to_path((p.x, p.y), -2) < LANE_SAPLING or blocks_sight((p.x, p.y), SIGHT + 0.3):
        continue
    if near_any(p, sap_grid, 2.0, 2.0) or near_any(p, tree_grid, 3.0, 0.9):
        continue
    sap_grid.setdefault(grid_key(p, 2.0), []).append(p)
    new_saplings += 1
    s = rng.uniform(0.22, 0.5)
    o = bpy.data.objects.new(f"SaplingRun.{new_saplings:03d}", spruce_mesh)
    o.location = (p.x, p.y, h(p.x, p.y) - 0.05)
    o.rotation_euler = (rng.uniform(-0.05, 0.05), rng.uniform(-0.05, 0.05), rng.uniform(0, math.tau))
    o.scale = (s, s, s * rng.uniform(0.9, 1.15))
    under.objects.link(o)

# twigs on the bare lower trunks of new trees near the path (Stalked's recipe, one mesh)
deadwood_mat = bpy.data.materials["Deadwood"]
bm = bmesh.new()
for t in forest.objects:
    if not t.name.startswith("SpruceRun") or C.dist_to_path(tuple(t.location.xy)) > 20:
        continue
    s = t.scale.x
    for _ in range(rng.randint(18, 30)):
        z = rng.uniform(0.6, 2.6) * s
        length = rng.uniform(0.15, 0.55) * s
        m = (Matrix.Translation(t.location + Vector((0, 0, z)))
             @ Matrix.Rotation(rng.uniform(0, math.tau), 4, "Z") @ Matrix.Rotation(math.radians(rng.uniform(82, 120)), 4, "Y")
             @ Matrix.Translation((0, 0, length / 2)))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.009 * s, radius2=0.0015, depth=length, matrix=m)
me = bpy.data.meshes.new("DeadBranchesRun")
bm.to_mesh(me)
bm.free()
me.materials.append(deadwood_mat)
o = bpy.data.objects.new("DeadBranchesRun", me)
dead.objects.link(o)


def log(name, base, direction, length, radius):
    """A tapered trunk from base along direction (Stalked's fallen log, snag or stump)."""
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


def free_spot():
    for p in candidates(400, 18.0, 18.0):
        if not near_any(p, tree_grid, 3.0, 0.6) and C.dist_to_path((p.x, p.y)) > 2.5:
            return p
    raise RuntimeError("no free spot")


counts = {"Log": 0, "Snag": 0, "Stump": 0}
for i in range(40):  # fallen logs along the swells, none across the lane
    a = free_spot()
    yaw = rng.uniform(0, math.tau)
    length, r = rng.uniform(3, 7), rng.uniform(0.1, 0.22)
    b = a + Vector((math.cos(yaw), math.sin(yaw))) * length
    A, B = Vector((a.x, a.y, h(a.x, a.y) + r * 0.6)), Vector((b.x, b.y, h(b.x, b.y) + r * 0.6))
    if wood_blocks(A, B, LANE_WOOD + 0.4) or counts["Log"] >= 24:
        continue
    counts["Log"] += 1
    log(f"LogRun.{i:02d}", A, B - A, length, r)
for i in range(14):  # leaning dead snags
    a = free_spot()
    yaw, lean = rng.uniform(0, math.tau), math.radians(rng.uniform(25, 55))
    d = Vector((math.cos(yaw) * math.sin(lean), math.sin(yaw) * math.sin(lean), math.cos(lean)))
    length = rng.uniform(4, 8)
    A = Vector((a.x, a.y, h(a.x, a.y) - 0.1))
    if wood_blocks(A, A + d * length, LANE_WOOD + 0.4):
        continue
    counts["Snag"] += 1
    log(f"SnagRun.{i:02d}", A, d, length, rng.uniform(0.07, 0.14))
for i in range(16):  # broken stumps
    a = free_spot()
    counts["Stump"] += 1
    log(f"StumpRun.{i:02d}", Vector((a.x, a.y, h(a.x, a.y) - 0.1)), Vector((rng.uniform(-0.08, 0.08), 0, 1)),
        rng.uniform(0.3, 1.3), rng.uniform(0.1, 0.22))

# sticks on the floor near the path (one mesh); a few lie across the lane, which is fine underfoot
bm = bmesh.new()
n_sticks = 0
for p in candidates(9000, 12.0, 14.0):
    length, r = rng.uniform(0.15, 1.1), rng.uniform(0.004, 0.018)
    m = (Matrix.Translation((p.x, p.y, h(p.x, p.y) + r))
         @ Matrix.Rotation(rng.uniform(0, math.tau), 4, "Z") @ Matrix.Rotation(math.radians(90 + rng.uniform(-6, 6)), 4, "Y"))
    bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=r, radius2=r * 0.5, depth=length, matrix=m)
    n_sticks += 1
me = bpy.data.meshes.new("SticksRun")
bm.to_mesh(me)
bm.free()
me.materials.append(deadwood_mat)
dead.objects.link(bpy.data.objects.new("SticksRun", me))

# --- fog over the whole run ------------------------------------------------------------------
fog = bpy.data.objects["Fog"]
fog.location = ((x0 + x1) / 2, (y0 + y1) / 2, 9)
fog.scale = (W - 4, H - 4, 20)

# --- self-checks -------------------------------------------------------------------------------
for o in forest.objects:
    assert C.dist_to_path(tuple(o.location.xy)) >= LANE_TREE or o.name == "HideTree", f"{o.name} in the lane"
for s in range(0, int(C.LENGTH), 2):
    x, y = C.path_point(s)
    assert x0 < x < x1 and y0 < y < y1, "path runs off the ground"
print(f"ground {W:.0f} x {H:.0f} m ({nx} x {ny}), path {C.LENGTH:.1f} m; removed {len(removed_trunks)} trees, "
      f"{removed_wood} logs/snags/stumps from the lane; added {len(new_trees)} spruces, {new_saplings} saplings, "
      f"{counts} deadwood, {n_sticks} sticks; forest now {len(forest.objects)}, understorey {len(under.objects)}")

os.makedirs(f"{C.ROOT}/blend", exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=f"{C.ROOT}/blend/escape_v001.blend")
print("saved", bpy.data.filepath)
