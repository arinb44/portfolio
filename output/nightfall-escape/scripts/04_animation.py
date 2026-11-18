# 04_animation.py
# Purpose: M3 animation. The hunter freezes as the wendigo screams (Stalked's view), whips round
#          and sprints along the path: step bob, sway, roll, footstrike jolts and hand-held noise;
#          three look-backs over the shoulder at the wendigo (only glimpsed: the flashlight stays
#          in the running hand, pointed ahead); a root catches the foot, the camera pitches into
#          the ground and the flashlight flies out of the hand; the picture cuts to black at 561.
#          The wendigo plays its Scream clip, then its in-place Run clip on the NLA, moved along
#          the path behind the hunter (config.D_KEYS). Writes cues.json for the sound mix.
# Input:   output/nightfall-escape/blend/escape_v003.blend
# Output:  output/nightfall-escape/blend/escape_v004.blend, output/nightfall-escape/cues.json
# Run:     blender --background --factory-startup blend/escape_v003.blend --python scripts/04_animation.py
import json
import math
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Euler, Vector, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

sc = bpy.context.scene
cam = bpy.data.objects["HunterEyes"]
rig = bpy.data.objects["WendigoRig"]
lights = [bpy.data.objects["Flashlight"], bpy.data.objects["FlashlightSpill"]]
r = math.radians
F_FIRST, F_LAST = -1, C.N + 2          # keys a little past both ends so motion blur is right
LAG = 3.0                               # frames the flashlight hand trails the body
PRE_YAW = (-36.0, -41.0)                # Stalked's flick toward the wendigo, then a frozen lean away
HAND = Vector((0.24, 0.30, -0.42))      # flashlight hand from the eyes: right, forward, down (metres)


def h(x, y):
    def raw(x, y):
        return 0.35 * noise.noise(Vector((x * 0.08, y * 0.08, 0.3))) + 0.08 * noise.noise(Vector((x * 0.45, y * 0.45, 1.7)))
    return raw(x, y) - raw(0.0, 0.0)


def clamp01(x):
    return max(0.0, min(1.0, x))


def smooth(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def smoother(x):
    x = clamp01(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


def nz(t, seed, freq=1.0):
    """Smooth noise in about -1..1."""
    return noise.noise(Vector((t * freq, seed * 7.13, seed * 1.31 + 0.5)))


def wrap180(a):
    return (a + 180.0) % 360.0 - 180.0


def run_amount(f):
    return clamp01(C.speed(f) / C.SPRINT)


# --- footsteps: phase advances with cadence; each whole step is a footstrike -----------------
PHASE, FOOT = {}, []
ph = 0.7  # so the first footstrike lands soon after the hunter starts moving
for k in range(F_FIRST - 2, F_LAST + 3):
    PHASE[k] = ph
    v = C.speed(k + 0.5)
    cad = 0.0 if v < 0.3 or k >= C.TRIP + 2 else 1.25 + 0.38 * v      # 2.9 steps/s at a sprint
    nph = ph + cad / C.FPS
    if math.floor(nph) > math.floor(ph) and k >= 1:
        FOOT.append(round(k + (math.floor(nph) - ph) / (nph - ph), 2))
    ph = nph


def phase(f):
    k = math.floor(f)
    return PHASE[k] + (PHASE[k + 1] - PHASE[k]) * (f - k)


# --- the body's heading: Stalked's look, the whip turn, then down the path ------------------
def path_yaw(f):
    return C.path_heading(C.s_hunter(f) + 3.0)  # look-ahead so curves are anticipated


def body_yaw(f):
    a, b = C.TURN
    if f <= a:
        return PRE_YAW[0] + (PRE_YAW[1] - PRE_YAW[0]) * smooth(f / a)
    target = path_yaw(f)
    while target < PRE_YAW[1]:
        target += 360.0  # turn left, away from the wendigo
    if f < b:
        t = (f - a) / (b - a)
        return PRE_YAW[1] + (target - PRE_YAW[1]) * smoother(t) + 9.0 * math.sin(math.pi * t) ** 3  # slight overshoot
    return target


def body_pos(f):
    """Eye position without the head turn: path, lean, bob and sway."""
    run = run_amount(f)
    s = C.s_hunter(f)
    x, y = C.path_point(s)
    yaw = r(body_yaw(f))
    right = Vector((math.cos(yaw), math.sin(yaw), 0))
    p = phase(f)
    bob = 0.034 * run * math.cos(math.tau * (p - 0.15))                   # lowest just after each footstrike
    sway = 0.028 * run * math.sin(math.pi * p)                            # side to side, one cycle per stride
    breath = 0.012 * (1 - run) * math.sin(math.tau * f / C.FPS * 0.55)   # panting while frozen
    z = h(x, y) + C.EYE - 0.07 * run + bob + breath
    return Vector((x, y, z)) + right * sway


def look(f):
    """(yaw offset, roll, pitch) of the head during a look-back, eased in and out."""
    w = C.look_weight(f)
    if w == 0:
        return 0.0, 0.0, 0.0
    a, b, sh = next(lb for lb in C.LOOKBACKS if lb[0] <= f <= lb[1])
    c, wx = C.path_point(C.s_hunter(f)), C.path_point(C.s_wendigo(f))
    to = math.degrees(math.atan2(-(wx[0] - c[0]), wx[1] - c[1]))
    off = wrap180(to - body_yaw(f))
    off = (off % 360.0) if sh == "L" else -((-off) % 360.0)
    off = math.copysign(min(max(abs(off), 148.0), 172.0), off) + 9.0 * nz(f / C.FPS, 3, 0.8)  # a glance, not a lock-on
    return w * off, w * (7.0 if sh == "L" else -7.0), w * 3.0


def trip(f):
    """(pitch, roll, yaw, drop) added by the trip and fall, after TRIP."""
    u = f - C.TRIP
    if u <= 0:
        return 0.0, 0.0, 0.0, 0.0
    pitch = -30.0 * smooth(u / 6) + 8.0 * smooth((u - 8) / 7)             # the ground rushes up; the head lifts as it lands
    roll = 30.0 * smooth((u - 4) / 11)                                     # ends half on its side
    yaw = -10.0 * smooth((u - 2) / 12)
    t = max(0.0, (f - (C.TRIP + 2)) / C.FPS)
    drop = min(0.5 * 9.81 * t * t, C.EYE - 0.25)                           # free fall to 25 cm above the floor
    if f > C.IMPACT:
        k = f - C.IMPACT
        drop -= 0.06 * math.exp(-0.5 * k) * abs(math.sin(1.7 * k))         # bounce on impact
        pitch += 6.0 * math.exp(-0.45 * k) * math.sin(2.3 * k)
        roll += 4.0 * math.exp(-0.45 * k) * math.sin(1.9 * k + 1)
    return pitch, roll, yaw, drop


def camera_at(f):
    run = run_amount(f)
    p = phase(f)
    t = f / C.FPS
    frac = p - math.floor(p)
    jolt = math.exp(-9.0 * frac) * run                                    # each footstrike kicks the head
    panic = 1.0 if f < C.TURN[1] else 0.6
    yaw_off, look_roll, look_pitch = look(f)
    tp, tr, ty, drop = trip(f)
    pitch = (-4.0 - 5.0 * run) * (1 - C.look_weight(f)) + look_pitch
    pitch += 1.6 * run * math.sin(math.tau * p) - 1.3 * jolt + tp
    pitch += (0.5 + 0.9 * run) * panic * nz(t, 1, 5.5) + 0.25 * nz(t, 11, 13)
    roll = 2.2 * run * math.sin(math.pi * p) + look_roll + tr + (0.4 + 0.8 * run) * nz(t, 2, 4.0)
    yaw = body_yaw(f) + yaw_off + ty + 1.2 * run * math.sin(math.pi * p + 0.6)
    yaw += (0.5 + 0.9 * run) * panic * nz(t, 4, 4.5) + 0.25 * nz(t, 12, 11)
    pos = body_pos(f) - Vector((0, 0, drop))
    pos.z += 0.004 * jolt * nz(t, 5, 30)
    return pos, Euler((r(90 + pitch), r(roll), r(yaw)))


# --- flashlight: in the running hand, pointed ahead; it flies out of the hand in the fall ----
RELEASE = C.IMPACT  # the flashlight stays in the hand (lighting the ground coming up) until the impact


def hand_at(f):
    run = run_amount(f)
    p = phase(f)
    t = f / C.FPS
    yaw0 = r(body_yaw(f))
    fwd, right = Vector((-math.sin(yaw0), math.cos(yaw0), 0)), Vector((math.cos(yaw0), math.sin(yaw0), 0))
    base = body_pos(f) + right * HAND.x + fwd * HAND.y + Vector((0, 0, HAND.z))
    base += fwd * 0.08 * run * math.sin(math.pi * p + 1.2)                # the arm pumps
    if f < C.TURN[0]:
        aim_yaw, aim_pitch = body_yaw(f - LAG) + 6.0, -4.0                  # Stalked: the beam just left of it
    else:
        aim_yaw = body_yaw(f - LAG) + 9.0 * run * math.sin(math.pi * p + 0.5)   # sweeps across the lane
        aim_pitch = -13.0 + 5.0 * run * math.cos(math.pi * p + 0.5)             # pool of light ~5 m ahead
    if f > C.TRIP:  # arms thrown forward to break the fall, the beam on the ground coming up
        u = f - C.TRIP
        base.z -= 0.95 * trip(f)[3]
        base += fwd * 0.4 * smooth(u / 10)
        base.z = max(base.z, h(base.x, base.y) + 0.05)
        aim_pitch += (-30.0 - aim_pitch) * smooth(u / 8)
    aim_yaw += 1.2 * nz(t, 6, 3.0)
    aim_pitch += 1.0 * nz(t, 7, 3.5)
    return base, aim_pitch, aim_yaw, 0.0


def flashlight_at(f):
    if f <= RELEASE:
        pos, pitch, yaw, roll = hand_at(f)
        return pos, Euler((r(90 + pitch), r(roll), r(yaw)))
    # knocked loose on the impact: skids forward and stops lying on the floor, pointed ahead
    p0, pitch0, yaw0, _ = hand_at(RELEASE)
    k = smoother((f - RELEASE) / 4)
    y0 = r(body_yaw(RELEASE))
    fwd = Vector((-math.sin(y0), math.cos(y0), 0))
    pos = p0 + fwd * 0.55 * k
    pos.z = h(pos.x, pos.y) + 0.035
    return pos, Euler((r(90 + pitch0 + (3.0 - pitch0) * k), r(90.0 * k), r(yaw0 + 28.0 * k)))


# --- clear Stalked's loop and key everything per frame ---------------------------------------
for o in (cam, *lights):
    o.animation_data_clear()
hand = bpy.data.objects.get("FlashlightHand") or bpy.data.objects.new("FlashlightHand", None)
if hand.name not in sc.collection.objects:
    sc.collection.objects.link(hand)
hand.animation_data_clear()
hand.empty_display_size = 0.1
for lt in lights:
    lt.parent = hand
    lt.matrix_parent_inverse.identity()
    lt.location = (0, 0, 0)
    lt.rotation_euler = (0, 0, 0)
cam.rotation_mode = hand.rotation_mode = "XYZ"

prev_cam = prev_hand = None
for f in range(F_FIRST, F_LAST + 1):
    pos, rot = camera_at(f)
    if prev_cam:
        rot.make_compatible(prev_cam)  # no 360-degree flips between keys
    cam.location, cam.rotation_euler = pos, rot
    cam.keyframe_insert("location", frame=f)
    cam.keyframe_insert("rotation_euler", frame=f)
    prev_cam = rot.copy()
    hpos, hrot = flashlight_at(f)
    if prev_hand:
        hrot.make_compatible(prev_hand)
    hand.location, hand.rotation_euler = hpos, hrot
    hand.keyframe_insert("location", frame=f)
    hand.keyframe_insert("rotation_euler", frame=f)
    prev_hand = hrot.copy()

# cut to black after the impact (rendering stops at LAST_PICTURE; this keeps the .blend honest)
sc.view_settings.exposure = 0.0
sc.view_settings.keyframe_insert("exposure", frame=C.LAST_PICTURE)
sc.view_settings.exposure = -20.0
sc.view_settings.keyframe_insert("exposure", frame=C.LAST_PICTURE + 1)

# --- wendigo: Scream, then the Run clip along the path ---------------------------------------
ad = rig.animation_data
ad.action = None  # Stalked's breathing keys
for tr in list(ad.nla_tracks):
    ad.nla_tracks.remove(tr)
scream_tr = ad.nla_tracks.new()
scream_tr.name = "Scream"
scream = scream_tr.strips.new("Scream", 1, bpy.data.actions["Scream"])
scream.extrapolation = "HOLD"  # also before frame 1, so motion blur at frame 1 sees the scream pose
run_act = bpy.data.actions["Run"]
a0, a1 = run_act.frame_range


def foot_track():
    """Measure the clip: world positions of both toes over one cycle, in clip frames."""
    ad.action = run_act
    if ad.action_suitable_slots:
        ad.action_slot = ad.action_suitable_slots[0]
    save = rig.matrix_world.copy()
    out = []
    steps = 40
    for i in range(steps + 1):
        cf = a0 + (a1 - a0) * i / steps
        sc.frame_set(int(cf), subframe=cf - int(cf))
        out.append((cf, [rig.matrix_world @ rig.pose.bones[b].head for b in ("mixamorig:LeftToeBase", "mixamorig:RightToeBase")]))
    ad.action = None
    rig.matrix_world = save
    return out


track = foot_track()
contacts, slip = [], []
for side in (0, 1):
    zs = [p[side].z for _, p in track]
    zmin = min(zs)
    for i in range(1, len(track)):
        (c0, p0), (c1, p1) = track[i - 1], track[i]
        if p0[side].z < zmin + 0.04 and p1[side].z < zmin + 0.04:
            slip.append((p1[side].xy - p0[side].xy).length / (c1 - c0))   # metres per clip frame, foot on the ground
    contacts.append(track[zs.index(zmin)][0])  # one footfall per foot per cycle: its lowest point
clip_speed = sum(slip) / len(slip) if slip else 0.2  # how fast the body would travel if the planted foot didn't slide
s_w = [C.s_wendigo(f) for f in range(150, 471)]
w_speed = (s_w[-1] - s_w[0]) / (len(s_w) - 1)                          # metres per scene frame while it's seen
strip_scale = max(0.6, min(1.8, clip_speed / w_speed))
RUN_START = 44
run_tr = ad.nla_tracks.new()
run_tr.name = "Run"
cycle = (a1 - a0) * strip_scale
reps = math.ceil((F_LAST - RUN_START) / cycle) + 1
run_strip = run_tr.strips.new("Run", RUN_START, run_act)
run_strip.scale = strip_scale
run_strip.repeat = reps
run_strip.blend_in = 10
run_strip.extrapolation = "HOLD"


def wendigo_at(f):
    s = C.s_wendigo(f)
    x, y = C.path_point(s)
    yaw = C.path_heading(max(s, 0.0) + 0.5) + 180.0 if s > -0.5 else C.BEARING + 180.0
    return Vector((x, y, h(x, y))), r(yaw)


prev = None
for f in range(F_FIRST, F_LAST + 1):
    p, yaw = wendigo_at(f)
    e = Euler((0, 0, yaw))
    if prev:
        e.make_compatible(prev)
    rig.location, rig.rotation_euler = p, e
    rig.keyframe_insert("location", frame=f)
    rig.keyframe_insert("rotation_euler", frame=f)
    prev = e.copy()

# wendigo footfalls in scene frames (two per cycle, from the measured contacts)
w_feet = []
for rep in range(reps):
    for cf in sorted(set(round(c, 2) for c in contacts)):
        sf = RUN_START + (cf - a0) * strip_scale + rep * cycle
        if RUN_START + 8 <= sf <= C.N:
            w_feet.append(round(sf, 2))
w_feet.sort()

sc.render.use_motion_blur, sc.render.motion_blur_shutter = True, 0.5
sc.frame_start, sc.frame_end = 1, C.N

# --- self-checks ------------------------------------------------------------------------------
trunks = [o.location.xy for o in bpy.data.collections["Forest"].objects]
for f in range(1, C.LAST_PICTURE + 1, 2):
    sc.frame_set(f)
    c = cam.matrix_world.translation
    near = min((c.xy - t).length for t in trunks)
    assert near > 0.45, f"camera inside a trunk at frame {f} ({near:.2f} m)"
    assert c.z > h(c.x, c.y) + 0.2, f"camera under the floor at frame {f}"
eyes = [bpy.data.objects["WendigoEye.L"], bpy.data.objects["WendigoEye.R"]]
hidden = [o for o in ("Fog", "GroundMist", "DebrisNeedles", "DebrisDust") if o in bpy.data.objects]
for o in hidden:
    bpy.data.objects[o].hide_viewport = True
seen = {}
for a, b, _ in C.LOOKBACKS:
    hits = 0
    for f in range(a + 8, b - 7):
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get()
        e = eyes[0].matrix_world.translation
        v = world_to_camera_view(sc, cam, e)
        o = cam.matrix_world.translation
        hit, loc, _, _, obj, _ = sc.ray_cast(dg, o, (e - o).normalized(), distance=(e - o).length - 0.25)
        if 0.05 < v.x < 0.95 and 0.05 < v.y < 0.95 and v.z > 0 and (not hit or obj.name.startswith("Wendigo")):
            hits += 1
    seen[a] = f"{hits}/{b - 7 - a - 8}"
    assert hits >= 3, f"the wendigo's eyes are never in clear view in the look-back at {a}: {seen[a]}"
for o in hidden:
    bpy.data.objects[o].hide_viewport = False
sc.frame_set(1)
v1 = world_to_camera_view(sc, cam, eyes[0].matrix_world.translation)
assert 0.5 < v1.x < 0.95 and v1.z > 0, f"frame 1 should show the wendigo right of centre like Stalked: {v1}"

# --- cues for the sound mix ------------------------------------------------------------------
frames = {}
for f in range(1, C.N + 1):
    sc.frame_set(f)
    c = cam.matrix_world
    w = rig.matrix_world.translation
    yaw_cam = math.degrees(c.to_euler().z)
    frames[f] = [round(c.translation.x, 3), round(c.translation.y, 3), round(c.translation.z, 3), round(yaw_cam, 2),
                 round(w.x, 3), round(w.y, 3)]
cues = {
    "fps": C.FPS, "frames": C.N, "last_picture": C.LAST_PICTURE,
    "scream": [C.SCREAM[0], C.SCREAM[1]], "turn": list(C.TURN),
    "hunter_steps": [x for x in FOOT if x < C.TRIP + 2], "trip": C.TRIP, "impact": C.IMPACT,
    "flashlight_release": RELEASE,
    "lookbacks": [[a, b, sh] for a, b, sh in C.LOOKBACKS],
    "wendigo_steps": w_feet,
    "speed": {f: round(C.speed(f), 3) for f in range(1, C.N + 1)},
    "pose": frames,  # cam x, y, z, yaw (deg), wendigo x, y
}
with open(f"{C.ROOT}/cues.json", "w") as fp:
    json.dump(cues, fp)

sc.frame_set(1)
print(f"run clip: {clip_speed:.4f} m/clip-frame, wendigo {w_speed * C.FPS:.2f} m/s -> strip scale {strip_scale:.2f}, "
      f"{reps} cycles; contacts per cycle {len(set(round(c, 2) for c in contacts))}")
print(f"hunter steps {len(cues['hunter_steps'])} (first {FOOT[0]}), wendigo steps {len(w_feet)}, "
      f"eyes in view during look-backs {seen}")
bpy.ops.wm.save_as_mainfile(filepath=f"{C.ROOT}/blend/escape_v004.blend")
print("saved", bpy.data.filepath)
