# 02_clutter.py
# Purpose: M2a ground clutter along the run: roots snaking from trunk bases (plus the root across
#          the path that trips the hunter), rocks half sunk in the litter, ferns and low twig brush.
#          Few unique meshes, many linked duplicates. Stalked's Deadwood material for roots and
#          brush; new procedural Rock and Fern materials.
# Input:   output/nightfall-escape/blend/escape_v001.blend
# Output:  output/nightfall-escape/blend/escape_v002.blend
# Run:     blender --background --factory-startup blend/escape_v001.blend --python scripts/02_clutter.py
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
rng = random.Random(202)
deadwood = bpy.data.materials["Deadwood"]


def h(x, y):
    """Stalked's ground height (same as 01)."""
    def raw(x, y):
        return 0.35 * noise.noise(Vector((x * 0.08, y * 0.08, 0.3))) + 0.08 * noise.noise(Vector((x * 0.45, y * 0.45, 1.7)))
    return raw(x, y) - raw(0.0, 0.0)


# re-run safe
if "Clutter" in bpy.data.collections:
    col = bpy.data.collections["Clutter"]
    for o in list(col.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.orphans_purge(do_recursive=True)
else:
    col = bpy.data.collections.new("Clutter")
    sc.collection.children.link(col)
src_col = bpy.data.collections.get("ClutterSource") or bpy.data.collections.new("ClutterSource")
if src_col.name not in sc.collection.children:
    sc.collection.children.link(src_col)
src_col.hide_render = True
for o in list(src_col.objects):
    bpy.data.objects.remove(o, do_unlink=True)

trunks = [(o.location.xy.copy(), o.scale.x) for o in bpy.data.collections["Forest"].objects]


def near_trunk(p, r):
    return any((p - t).length < r for t, _ in trunks)


def corridor_points(n, width, lane):
    """Random points within `width` of the path (from the hunter's start) but at least `lane` from it."""
    pts = []
    x0, x1 = -C.LENGTH * 0.85 - 25, 25
    y0, y1 = -C.LENGTH * 0.65 - 25, 25
    while len(pts) < n:
        p = Vector((rng.uniform(x0, x1), rng.uniform(y0, y1)))
        d = C.dist_to_path((p.x, p.y), -3)
        if lane <= d <= width:
            pts.append((p, d))
    return pts


def band_points(n, lo, hi):
    """Points lo..hi metres either side of the path, uniform along it."""
    pts = []
    while len(pts) < n:
        sp = rng.uniform(-2, C.LENGTH)
        a, b = C.path_point(sp - 0.5), C.path_point(sp + 0.5)
        t = Vector((b[0] - a[0], b[1] - a[1])).normalized()
        p = Vector(C.path_point(sp)) + Vector((-t.y, t.x)) * rng.choice((-1, 1)) * rng.uniform(lo, hi)
        d = C.dist_to_path((p.x, p.y), -3)
        if d >= lo:
            pts.append((p, d))
    return pts


def mat_root():
    m = bpy.data.materials.new("Root")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value, nz.inputs["Detail"].default_value = 30.0, 6.0
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.018, 0.013, 0.009, 1)
    ramp.color_ramp.elements[1].color = (0.06, 0.047, 0.035, 1)
    nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.9
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def mat_rock():
    m = bpy.data.materials.new("Rock")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value, nz.inputs["Detail"].default_value = 6.0, 8.0
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    stone = nt.nodes.new("ShaderNodeValToRGB")
    stone.color_ramp.elements[0].color = (0.035, 0.034, 0.032, 1)
    stone.color_ramp.elements[1].color = (0.11, 0.105, 0.095, 1)
    nt.links.new(nz.outputs["Fac"], stone.inputs["Fac"])
    # moss on the tops: world normal Z, broken up by the noise
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Normal"], sep.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(sep.outputs["Z"], add.inputs[0])
    nt.links.new(nz.outputs["Fac"], add.inputs[1])
    mask = nt.nodes.new("ShaderNodeMapRange")
    mask.inputs["From Min"].default_value, mask.inputs["From Max"].default_value = 1.05, 1.35
    nt.links.new(add.outputs["Value"], mask.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(mask.outputs["Result"], mix.inputs["Factor"])
    nt.links.new(stone.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = (0.022, 0.035, 0.012, 1)
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.8
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.4
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def mat_fern():
    m = bpy.data.materials.new("Fern")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    rnd = nt.nodes.new("ShaderNodeObjectInfo")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.018, 0.032, 0.010, 1)
    ramp.color_ramp.elements[1].color = (0.040, 0.050, 0.016, 1)   # some fronds yellowing, late season
    nt.links.new(rnd.outputs["Random"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.55
    bsdf.inputs["Subsurface Weight"].default_value = 0.0
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.0
    # thin leaves: a little light comes through when the beam is behind them
    tr = nt.nodes.new("ShaderNodeBsdfTranslucent")
    nt.links.new(ramp.outputs["Color"], tr.inputs["Color"])
    mixs = nt.nodes.new("ShaderNodeMixShader")
    mixs.inputs["Fac"].default_value = 0.3
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    nt.links.new(bsdf.outputs["BSDF"], mixs.inputs[1])
    nt.links.new(tr.outputs["BSDF"], mixs.inputs[2])
    nt.links.new(mixs.outputs["Shader"], out.inputs["Surface"])
    return m


rock_mat = bpy.data.materials.get("Rock") or mat_rock()
fern_mat = bpy.data.materials.get("Fern") or mat_fern()
root_mat = bpy.data.materials.get("Root") or mat_root()


def source(name, bm, mat):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    o = bpy.data.objects.new(name, me)
    src_col.objects.link(o)
    return me


# --- rocks: displaced, flattened icospheres --------------------------------------------------
rock_meshes = []
for i in range(6):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.5)
    seed = Vector((i * 7.1, i * 3.3, i * 1.9))
    for v in bm.verts:
        d = noise.noise(v.co * 2.2 + seed) * 0.22 + noise.noise(v.co * 6.0 + seed) * 0.05
        v.co *= 1 + d
        v.co.z *= rng.uniform(0.5, 0.75)
    for f in bm.faces:
        f.smooth = True
    rock_meshes.append(source(f"RockSrc.{i}", bm, rock_mat))

# --- fern plants: arching fronds of tapered leaflets ------------------------------------------
def fern_plant(n_fronds, seed):
    r = random.Random(seed)
    bm = bmesh.new()
    for k in range(n_fronds):
        yaw = k / n_fronds * math.tau + r.uniform(-0.3, 0.3)
        rise = math.radians(r.uniform(35, 65))
        length = r.uniform(0.45, 0.85)
        droop = r.uniform(0.6, 1.1)
        pts = []
        for j in range(15):
            t = j / 14
            # rachis: leaves the crown upward, arches over and droops at the tip
            horiz = length * t
            z = length * (math.sin(rise) * t - droop * 0.5 * t * t)
            pts.append(Vector((horiz, 0.0, max(z, 0.01))))
        rot = Matrix.Rotation(yaw, 3, "Z")
        for j in range(1, 14):
            a, b = pts[j], pts[j + 1]
            side_len = 0.16 * length * math.sin(math.pi * (j / 14) ** 0.8) + 0.01
            for side in (-1, 1):
                tip = a + Vector((0.25 * (b - a).length, side * side_len, -0.02))
                v1 = bm.verts.new(rot @ a)
                v2 = bm.verts.new(rot @ (a + (b - a) * 0.6))
                v3 = bm.verts.new(rot @ tip)
                bm.faces.new((v1, v2, v3) if side > 0 else (v1, v3, v2))
        for a, b in zip(pts, pts[1:]):  # the stem itself, a thin ribbon
            w = Vector((0, 0.004, 0))
            q = [bm.verts.new(rot @ (a - w)), bm.verts.new(rot @ (a + w)), bm.verts.new(rot @ (b + w)), bm.verts.new(rot @ (b - w))]
            bm.faces.new(q)
    return bm


fern_meshes = [source(f"FernSrc.{i}", fern_plant(rng.randint(7, 12), 50 + i), fern_mat) for i in range(4)]

# --- twig brush: thin cones fanning up from a point -------------------------------------------
brush_meshes = []
for i in range(4):
    bm = bmesh.new()
    r = random.Random(90 + i)
    for _ in range(r.randint(16, 30)):
        length = r.uniform(0.25, 0.9)
        m = (Matrix.Rotation(r.uniform(0, math.tau), 4, "Z") @ Matrix.Rotation(math.radians(r.uniform(10, 55)), 4, "Y")
             @ Matrix.Translation((0, 0, length / 2)))
        bmesh.ops.create_cone(bm, cap_ends=False, segments=3, radius1=r.uniform(0.004, 0.009), radius2=0.0008, depth=length, matrix=m)
    brush_meshes.append(source(f"BrushSrc.{i}", bm, deadwood))


def place(meshes, name, p, scale, sink, tilt=0.12):
    o = bpy.data.objects.new(name, rng.choice(meshes))
    o.location = (p.x, p.y, h(p.x, p.y) - sink * scale)
    o.rotation_euler = (rng.uniform(-tilt, tilt), rng.uniform(-tilt, tilt), rng.uniform(0, math.tau))
    o.scale = (scale,) * 3
    col.objects.link(o)
    return o


counts = {}
for p, d in corridor_points(520, 22.0, 0.9):  # rocks: bigger ones away from the lane
    if near_trunk(p, 0.6):
        continue
    s = rng.uniform(0.12, 0.35) if d < 3 else rng.uniform(0.15, 0.9)
    place(rock_meshes, "Rock", p, s, 0.18)
    counts["rocks"] = counts.get("rocks", 0) + 1
for p, d in corridor_points(2600, 18.0, 0.75):  # ferns in patches (noise mask)
    if noise.noise(Vector((p.x * 0.12, p.y * 0.12, 4.2))) < -0.05 or near_trunk(p, 0.4):
        continue
    place(fern_meshes, "Fern", p, rng.uniform(0.6, 1.3), 0.02, tilt=0.15)
    counts["ferns"] = counts.get("ferns", 0) + 1
for p, d in corridor_points(420, 18.0, 1.0):  # twig brush
    if near_trunk(p, 0.5):
        continue
    place(brush_meshes, "Brush", p, rng.uniform(0.7, 1.4), 0.03, tilt=0.2)
    counts["brush"] = counts.get("brush", 0) + 1

for p, d in band_points(160, 0.9, 4.0):  # small rocks the beam catches beside the lane
    if not near_trunk(p, 0.5):
        place(rock_meshes, "Rock", p, rng.uniform(0.1, 0.3), 0.2)
        counts["rocks"] += 1
for p, d in band_points(700, 0.8, 4.0):  # ferns brushing past
    if noise.noise(Vector((p.x * 0.12, p.y * 0.12, 4.2))) > -0.25 and not near_trunk(p, 0.4):
        place(fern_meshes, "Fern", p, rng.uniform(0.6, 1.2), 0.02, tilt=0.15)
        counts["ferns"] += 1
for p, d in band_points(140, 1.0, 4.0):
    if not near_trunk(p, 0.5):
        place(brush_meshes, "Brush", p, rng.uniform(0.6, 1.2), 0.03, tilt=0.2)
        counts["brush"] += 1

# --- roots: beveled curves from trunk bases near the path, plus the trip root ----------------
cu = bpy.data.curves.new("Roots", "CURVE")
cu.dimensions = "3D"
cu.bevel_depth, cu.bevel_resolution, cu.resolution_u = 1.0, 2, 4   # radius comes from each point
cu.use_fill_caps = True
n_roots = 0
for t, s in trunks:
    if C.dist_to_path((t.x, t.y), -3) > 12:
        continue
    for _ in range(rng.randint(3, 6)):
        yaw = rng.uniform(0, math.tau)
        length = rng.uniform(0.6, 1.8) * s
        r0 = rng.uniform(0.045, 0.08) * s
        sp = cu.splines.new("NURBS")
        k = 7
        sp.points.add(k - 1)
        bend = rng.uniform(-0.5, 0.5)
        for j, pt in enumerate(sp.points):
            u = j / (k - 1)
            ang = yaw + bend * u + rng.uniform(-0.15, 0.15)
            q = t + Vector((math.cos(ang), math.sin(ang))) * (0.12 * s + length * u)
            rad = r0 * (1 - 0.75 * u)
            lift = rad * (0.35 - 1.6 * u) + 0.015 * math.sin(u * math.pi * 2)  # half buried, then dives
            pt.co = (q.x, q.y, h(q.x, q.y) + lift, 1)
            pt.radius = rad
        sp.use_endpoint_u = True
        sp.order_u = 3
        n_roots += 1

# the trip root: an exposed loop across the lane just ahead of where the foot is at TRIP
s_trip = C.s_hunter(C.TRIP) + 0.55
cx, cy = C.path_point(s_trip)
yaw = math.radians(C.path_heading(s_trip))
fwd = Vector((-math.sin(yaw), math.cos(yaw)))
side = Vector((fwd.y, -fwd.x))
sp = cu.splines.new("NURBS")
sp.points.add(8)
for j, pt in enumerate(sp.points):
    u = j / 8
    q = Vector((cx, cy)) + side * (-1.3 + 2.6 * u) + fwd * (0.15 * math.sin(u * math.pi * 1.5))
    arch = 0.11 * math.sin(math.pi * min(max((u - 0.12) / 0.76, 0), 1))  # 11 cm loop in the middle
    pt.co = (q.x, q.y, h(q.x, q.y) + arch - 0.02, 1)
    pt.radius = 0.045
sp.use_endpoint_u, sp.order_u = True, 3
cu.materials.append(root_mat)
roots = bpy.data.objects.new("Roots", cu)
col.objects.link(roots)
roots["trip_root_s"] = s_trip

print(f"clutter {counts}, roots {n_roots} + trip root at s={s_trip:.2f} ({cx:.2f}, {cy:.2f})")
bpy.ops.wm.save_as_mainfile(filepath=f"{C.ROOT}/blend/escape_v002.blend")
print("saved", bpy.data.filepath)
