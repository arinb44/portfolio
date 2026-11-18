# 03_atmosphere.py
# Purpose: M2b moving air. A low mist layer that pools in the hollows and drifts (a noise volume
#          on top of Stalked's fog), and spruce needles and dust floating along the path that
#          show up in the beam (geometry nodes: points offset by 4D noise over scene time, so
#          nothing needs baking). Drift is driven by the frame number (simple-expression drivers).
# Input:   output/nightfall-escape/blend/escape_v002.blend
# Output:  output/nightfall-escape/blend/escape_v003.blend
# Run:     blender --background --factory-startup blend/escape_v002.blend --python scripts/03_atmosphere.py
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

sc = bpy.context.scene
rng = random.Random(303)
MIST_DENSITY = 0.15        # 1/m at the thickest, near the ground in the hollows
MIST_TOP = 1.4             # metres (world z) where it has faded out
WIND = (0.18, 0.06)        # m/s drift of the mist and the debris


def h(x, y):
    def raw(x, y):
        return 0.35 * noise.noise(Vector((x * 0.08, y * 0.08, 0.3))) + 0.08 * noise.noise(Vector((x * 0.45, y * 0.45, 1.7)))
    return raw(x, y) - raw(0.0, 0.0)


def fresh(name):
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)


for n in ("GroundMist", "DebrisNeedles", "DebrisDust", "DebrisNeedleSrc", "DebrisDustSrc"):
    fresh(n)
bpy.data.orphans_purge(do_recursive=True)
col = bpy.data.collections.get("Atmosphere") or bpy.data.collections.new("Atmosphere")
if col.name not in sc.collection.children:
    sc.collection.children.link(col)
src_col = bpy.data.collections["ClutterSource"]


def drive(socket, expr, index=-1):
    fc = socket.driver_add("default_value", index) if index >= 0 else socket.driver_add("default_value")
    fc.driver.type = "SCRIPTED"
    fc.driver.expression = expr
    return fc


# --- low mist: a box over the run in world coordinates -------------------------------------
fog = bpy.data.objects["Fog"]
cx, cy = fog.location.x, fog.location.y
W, H = fog.scale.x, fog.scale.y
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co = Vector((cx + v.co.x * W, cy + v.co.y * H, -0.6 + (v.co.z + 0.5) * (MIST_TOP + 0.8)))
me = bpy.data.meshes.new("GroundMist")
bm.to_mesh(me)
bm.free()
mist = bpy.data.objects.new("GroundMist", me)
mist.display_type = "BOUNDS"
col.objects.link(mist)

m = bpy.data.materials.new("GroundMist")
m.use_nodes = True
nt = m.node_tree
nt.nodes.clear()
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
drive(mp.inputs["Location"], f"-frame / {C.FPS} * {WIND[0]}", 0)  # the pattern slides downwind
drive(mp.inputs["Location"], f"-frame / {C.FPS} * {WIND[1]}", 1)
nz = nt.nodes.new("ShaderNodeTexNoise")
nz.noise_dimensions = "4D"
nz.inputs["Scale"].default_value, nz.inputs["Detail"].default_value, nz.inputs["Roughness"].default_value = 0.28, 3.0, 0.55
drive(nz.inputs["W"], f"frame / {C.FPS} * 0.06")                     # and slowly changes shape
nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
patch = nt.nodes.new("ShaderNodeMapRange")
patch.inputs["From Min"].default_value, patch.inputs["From Max"].default_value = 0.42, 0.72
nt.links.new(nz.outputs["Fac"], patch.inputs["Value"])
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
fall = nt.nodes.new("ShaderNodeMapRange")
fall.interpolation_type = "SMOOTHSTEP"
fall.inputs["From Min"].default_value, fall.inputs["From Max"].default_value = MIST_TOP, -0.2
nt.links.new(sep.outputs["Z"], fall.inputs["Value"])
mul = nt.nodes.new("ShaderNodeMath")
mul.operation = "MULTIPLY"
nt.links.new(patch.outputs["Result"], mul.inputs[0])
nt.links.new(fall.outputs["Result"], mul.inputs[1])
dens = nt.nodes.new("ShaderNodeMath")
dens.operation = "MULTIPLY"
dens.inputs[1].default_value = MIST_DENSITY
nt.links.new(mul.outputs["Value"], dens.inputs[0])
vol = nt.nodes.new("ShaderNodeVolumePrincipled")
vol.inputs["Color"].default_value = (0.76, 0.8, 0.88, 1)
vol.inputs["Anisotropy"].default_value = 0.35
nt.links.new(dens.outputs["Value"], vol.inputs["Density"])
out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
me.materials.append(m)
# biased (ray-marched) volumes: 5.9 s vs 7.9 s on a 50% / 32-sample test still (mist alone without: 4.3 s)
sc.cycles.volume_biased = True

# --- debris: needles and dust in a tube along the path ---------------------------------------
def tube_points(n, half_width, z_lo, z_hi):
    bm = bmesh.new()
    for _ in range(n):
        s = rng.uniform(-6, C.LENGTH + 2)
        a, b = C.path_point(s - 0.5), C.path_point(s + 0.5)
        t = Vector((b[0] - a[0], b[1] - a[1])).normalized()
        p = Vector(C.path_point(s)) + Vector((-t.y, t.x)) * rng.uniform(-half_width, half_width)
        bm.verts.new((p.x, p.y, h(p.x, p.y) + rng.uniform(z_lo, z_hi)))
    me = bpy.data.meshes.new("pts")
    bm.to_mesh(me)
    bm.free()
    return me


def simple_mat(name, rgb, rough=0.7):
    mt = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mt.use_nodes = True
    b = next(n for n in mt.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    return mt


# instance shapes: a spruce needle (thin bent quad pair) and a dust mote
bm = bmesh.new()
L, w = 0.018, 0.0007
vs = [bm.verts.new(v) for v in ((-L / 2, -w, 0), (0, -w, 0.0015), (0, w, 0.0015), (-L / 2, w, 0), (L / 2, -w, 0), (L / 2, w, 0))]
bm.faces.new((vs[0], vs[1], vs[2], vs[3]))
bm.faces.new((vs[1], vs[4], vs[5], vs[2]))
me = bpy.data.meshes.new("DebrisNeedleSrc")
bm.to_mesh(me)
bm.free()
me.materials.append(simple_mat("DebrisNeedle", (0.09, 0.07, 0.035)))
needle_src = bpy.data.objects.new("DebrisNeedleSrc", me)
src_col.objects.link(needle_src)
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.0009)
me = bpy.data.meshes.new("DebrisDustSrc")
bm.to_mesh(me)
bm.free()
me.materials.append(simple_mat("DebrisDust", (0.55, 0.55, 0.52), 0.9))
dust_src = bpy.data.objects.new("DebrisDustSrc", me)
src_col.objects.link(dust_src)


def drift_group(name, src, wander_m, fall_ms, scale):
    """One group per debris object, its settings baked in (5.2 won't take an object as a modifier input)."""
    ng = bpy.data.node_groups.get(name)
    if ng:
        bpy.data.node_groups.remove(ng)
    ng = bpy.data.node_groups.new(name, "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    pts = N.new("GeometryNodeMeshToPoints")
    L.new(gi.outputs["Geometry"], pts.inputs["Mesh"])
    t = N.new("GeometryNodeInputSceneTime")
    pos = N.new("GeometryNodeInputPosition")
    sc_pos = N.new("ShaderNodeVectorMath")
    sc_pos.operation = "SCALE"
    sc_pos.inputs["Scale"].default_value = 0.7
    L.new(pos.outputs["Position"], sc_pos.inputs[0])
    w = N.new("ShaderNodeMath")
    w.operation = "MULTIPLY"
    w.inputs[1].default_value = 0.15
    L.new(t.outputs["Seconds"], w.inputs[0])
    nz = N.new("ShaderNodeTexNoise")
    nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value, nz.inputs["Detail"].default_value = 1.0, 1.0
    L.new(sc_pos.outputs["Vector"], nz.inputs["Vector"])
    L.new(w.outputs["Value"], nz.inputs["W"])
    centre = N.new("ShaderNodeVectorMath")
    centre.operation = "SUBTRACT"
    centre.inputs[1].default_value = (0.5, 0.5, 0.5)
    L.new(nz.outputs["Color"], centre.inputs[0])
    wander = N.new("ShaderNodeVectorMath")
    wander.operation = "SCALE"
    L.new(centre.outputs["Vector"], wander.inputs[0])
    wander.inputs["Scale"].default_value = wander_m
    # steady wind and settling: (WIND, -Fall) * seconds
    fallv = N.new("ShaderNodeCombineXYZ")
    fallv.inputs["X"].default_value, fallv.inputs["Y"].default_value = WIND
    fallv.inputs["Z"].default_value = -fall_ms
    windv = N.new("ShaderNodeVectorMath")
    windv.operation = "SCALE"
    L.new(fallv.outputs["Vector"], windv.inputs[0])
    L.new(t.outputs["Seconds"], windv.inputs["Scale"])
    off = N.new("ShaderNodeVectorMath")
    off.operation = "ADD"
    L.new(wander.outputs["Vector"], off.inputs[0])
    L.new(windv.outputs["Vector"], off.inputs[1])
    setp = N.new("GeometryNodeSetPosition")
    L.new(pts.outputs["Points"], setp.inputs["Geometry"])
    L.new(off.outputs["Vector"], setp.inputs["Offset"])
    info = N.new("GeometryNodeObjectInfo")
    info.inputs["Object"].default_value = src
    rot = N.new("FunctionNodeRandomValue")
    rot.data_type = "FLOAT_VECTOR"
    live = lambda node: [x for x in node.inputs if x.enabled]  # Random Value shows the sockets of its data type
    live(rot)[1].default_value = (math.tau, math.tau, math.tau)
    size = N.new("FunctionNodeRandomValue")
    size.data_type = "FLOAT"
    live(size)[0].default_value, live(size)[1].default_value = 0.6, 1.4
    smul = N.new("ShaderNodeMath")
    smul.operation = "MULTIPLY"
    L.new(size.outputs["Value"], smul.inputs[0])
    smul.inputs[1].default_value = scale
    inst = N.new("GeometryNodeInstanceOnPoints")
    L.new(setp.outputs["Geometry"], inst.inputs["Points"])
    L.new(info.outputs["Geometry"], inst.inputs["Instance"])
    L.new(rot.outputs["Value"], inst.inputs["Rotation"])
    L.new(smul.outputs["Value"], inst.inputs["Scale"])
    L.new(inst.outputs["Instances"], go.inputs["Geometry"])
    return ng


def debris(name, n, width, z_lo, z_hi, src, wander, fall, scale):
    o = bpy.data.objects.new(name, tube_points(n, width, z_lo, z_hi))
    col.objects.link(o)
    mod = o.modifiers.new("Drift", "NODES")
    mod.node_group = drift_group(f"Drift{name}", src, wander, fall, scale)
    return o


needles = debris("DebrisNeedles", 7000, 3.5, 0.2, 3.4, needle_src, 0.6, 0.05, 1.0)
dust = debris("DebrisDust", 14000, 3.5, 0.1, 2.8, dust_src, 0.8, 0.0, 1.0)

# --- self-checks: the drivers move with the frame, the debris drifts ------------------------
dg = bpy.context.evaluated_depsgraph_get()
sc.frame_set(1)
w1 = nz.inputs["W"].default_value
sc.frame_set(300)
w2 = nz.inputs["W"].default_value
assert abs(w2 - (300 / C.FPS * 0.06)) < 1e-4 and w2 > w1, f"mist driver not running: {w1} -> {w2}"
n_inst = len([i for i in bpy.context.evaluated_depsgraph_get().object_instances if i.is_instance and i.parent and i.parent.name == "DebrisNeedles"])
assert n_inst > 6000, f"needle instances: {n_inst}"
sc.frame_set(1)
print(f"mist box {W:.0f} x {H:.0f} m up to z={MIST_TOP}, needles {n_inst} instances, dust 14000 points, W {w1:.3f}->{w2:.3f}")
bpy.ops.wm.save_as_mainfile(filepath=f"{C.ROOT}/blend/escape_v003.blend")
print("saved", bpy.data.filepath)
