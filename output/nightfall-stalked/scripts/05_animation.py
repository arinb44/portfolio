# 05_animation.py
# Purpose: M5 animation. An exact 240-frame loop: the hunter's slow search, a nervous flick
#          toward the wendigo and a pause, breathing bob and hand shake; the flashlight trails
#          the head; the wendigo breathes and shifts its head. Motion blur on (shutter 0.5).
#          Every periodic term completes a whole number of cycles in 240 frames, so frame 240
#          flows into frame 1. Keys run from frame -1 to 242 so motion blur at the seam is right.
# Input:   output/nightfall-stalked/blend/stalked_v004.blend
# Output:  output/nightfall-stalked/blend/stalked_v005.blend
# Run:     blender --background --factory-startup blend/stalked_v004.blend --python 05_animation.py
import math

import bpy
from mathutils import Euler, Quaternion

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
N = 240                      # loop length in frames
LAG = 2.5                    # frames the flashlight trails the head
PITCH_BASE = -4.0            # degrees, looking slightly down
# (loop frame, yaw in degrees): search right, flick toward the wendigo at ~126, hold, return left
WAYPOINTS = [(0, 22), (58, 6), (116, -31), (125, -38), (136, -35), (172, -36), (240, 22)]
# (cycles per loop, amplitude, phase); whole cycles keep the loop exact
YAW_SHAKE = [(7, 0.35, 0.3), (13, 0.2, 1.1), (23, 0.12, 2.0)]
PITCH_SHAKE = [(3, 0.6, 0.0), (11, 0.3, 0.7), (19, 0.15, 1.9)]   # 3 breaths per loop
ROLL_SHAKE = [(5, 0.5, 0.4), (17, 0.15, 2.4)]
BOB = [(3, 0.012, 1.57)]                                          # metres, with the breaths
SWAY = [(2, 0.01, 0.0), (9, 0.004, 0.5)]

sc = bpy.context.scene
cam = bpy.data.objects["HunterEyes"]
lights = [bpy.data.objects["Flashlight"], bpy.data.objects["FlashlightSpill"]]
rig = bpy.data.objects["WendigoRig"]
r = math.radians


def smoother(x):
    return x * x * x * (x * (x * 6 - 15) + 10)


def wave(f, terms):
    return sum(a * math.sin(math.tau * k * f / N + ph) for k, a, ph in terms)


def base_yaw(f):
    f %= N
    for (fa, a), (fb, b) in zip(WAYPOINTS, WAYPOINTS[1:]):
        if fa <= f <= fb:
            return a + (b - a) * smoother((f - fa) / (fb - fa))
    raise ValueError(f)


def yaw(f):
    return base_yaw(f) + wave(f, YAW_SHAKE)


def pitch(f):
    return PITCH_BASE + wave(f, PITCH_SHAKE)


# keep the un-animated values on first run so the script can be re-run
cam["eye"] = list(cam.get("eye", cam.location))
for lt in lights:
    lt["aim"] = list(lt.get("aim", lt.rotation_euler))

# --- camera ------------------------------------------------------------------------------
cam.animation_data_clear()
for o in lights:
    o.animation_data_clear()
eye = cam["eye"]
for frame in range(-1, N + 3):
    f = frame - 1  # loop frame 0 is scene frame 1
    cam.rotation_euler = Euler((r(90 + pitch(f)), r(wave(f, ROLL_SHAKE)), r(yaw(f))))
    cam.location = (eye[0] + wave(f, SWAY), eye[1], eye[2] + wave(f, BOB))
    cam.keyframe_insert("rotation_euler", frame=frame)
    cam.keyframe_insert("location", frame=frame)
    # flashlight: where the head pointed LAG frames ago, relative to where it points now
    for lt in lights:
        aim = lt["aim"]
        lt.rotation_euler = (aim[0] + r(pitch(f - LAG) - pitch(f)), aim[1] + r(yaw(f - LAG) - yaw(f)), aim[2])
        lt.keyframe_insert("rotation_euler", frame=frame)

# --- wendigo: breathing and a slow head shift on top of the held Scream pose --------------
BONES = {  # bone: [(local axis, degrees, cycles per loop, phase)]
    "mixamorig:Spine1": [((1, 0, 0), 1.2, 3, 0.0)],
    "mixamorig:Spine2": [((1, 0, 0), 1.4, 3, 0.3)],
    "mixamorig:Neck": [((1, 0, 0), 0.8, 3, 0.9)],
    "mixamorig:Head": [((0, 1, 0), 5.0, 1, -1.2), ((1, 0, 0), 1.5, 3, 1.4)],  # turns most near the pause
    "mixamorig:LeftArm": [((1, 0, 0), 0.8, 3, 0.5)],
    "mixamorig:RightArm": [((1, 0, 0), 0.8, 3, 0.7)],
}
if rig.animation_data:
    rig.animation_data.action = None
for name in BONES:
    pb = rig.pose.bones[name]
    pb["rest_q"] = list(pb.get("rest_q", pb.rotation_quaternion))
for frame in range(-1, N + 3):
    f = frame - 1
    for name, terms in BONES.items():
        pb = rig.pose.bones[name]
        q = Quaternion(pb["rest_q"])
        for axis, deg, k, ph in terms:
            q = q @ Quaternion(axis, r(deg) * math.sin(math.tau * k * f / N + ph))
        pb.rotation_quaternion = q
        pb.keyframe_insert("rotation_quaternion", frame=frame)

# --- motion blur ---------------------------------------------------------------------------
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = 0.5
sc.frame_set(1)

# --- self-check: the loop seam ---------------------------------------------------------------
def pose_at(frame):
    sc.frame_set(frame)
    head = rig.pose.bones["mixamorig:Head"].rotation_quaternion
    return [*cam.matrix_world.to_euler(), *cam.matrix_world.translation, *lights[0].rotation_euler, *head]


for a, b in ((0, 240), (1, 241)):
    gap = max(abs(x - y) for x, y in zip(pose_at(a), pose_at(b)))
    assert gap < 1e-4, f"loop seam broken between frames {a} and {b}: {gap}"
print("seam ok")
sc.frame_set(1)

bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v005.blend")
print("saved", bpy.data.filepath)
