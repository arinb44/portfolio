# 06_render_settings.py
# Purpose: Final settings in the file itself, so the .blend renders and plays the same from Blender
#          as from 07_render.py: 1600x900, 24 fps, frames 1-600, Cycles GPU 128 samples, motion blur,
#          AgX, the running spill level, PNG frames to final/frames/, and the sound mix as a sound
#          strip in the sequencer (sound only, so it doesn't replace the 3D render).
# Input:   output/nightfall-escape/blend/escape_v004.blend, audio/escape_mix.wav
# Output:  output/nightfall-escape/blend/escape_v005.blend
# Run:     blender --background --factory-startup blend/escape_v004.blend --python scripts/06_render_settings.py
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config as C  # noqa: E402

SPILL = 350.0  # while running; Stalked used 120; at a run the lane went black outside the hotspot (previews/m3-animation/sheet_spill.png)
sc = bpy.context.scene
r, cy = sc.render, sc.cycles

sc.frame_start, sc.frame_end, sc.frame_current = 1, C.N, 1
r.fps, r.fps_base = C.FPS, 1.0
r.resolution_x, r.resolution_y, r.resolution_percentage = 1600, 900, 100
r.use_motion_blur, r.motion_blur_shutter = True, 0.5
r.use_persistent_data = True
cy.device = "GPU"
cy.samples, cy.adaptive_threshold, cy.use_denoising = 128, 0.03, True
cy.volume_biased = True
sc.view_settings.view_transform = "AgX"
# Stalked's dim spill while the hunter faces the wendigo (350 lit its ribcage at 7.5 m, final frame 20),
# the brighter spill only once the turn has swung the beam away from it
spill = bpy.data.lights["FlashlightSpill"]
if spill.animation_data:
    spill.animation_data_clear()
for frame, energy in ((C.TURN[0], 120.0), (C.TURN[1], SPILL)):
    spill.energy = energy
    spill.keyframe_insert("energy", frame=frame)
r.image_settings.media_type = "IMAGE"
r.image_settings.file_format = "PNG"
r.image_settings.color_mode, r.image_settings.color_depth = "RGB", "8"
r.filepath = f"{C.ROOT}/final/frames/escape_"
sc.camera = bpy.data.objects["HunterEyes"]

# the mix, in the sequencer: plays in Blender's timeline; sound strips don't take over the render
ed = sc.sequence_editor_create()
for s in list(ed.strips):
    ed.strips.remove(s)
strip = ed.strips.new_sound("escape_mix", f"{C.ROOT}/audio/escape_mix.wav", channel=1, frame_start=1)
assert abs(strip.frame_final_duration - C.N) <= 1, f"sound is {strip.frame_final_duration} frames, expected {C.N}"
assert not [s for s in ed.strips if s.type != "SOUND"], "only sound strips, or the sequencer replaces the 3D render"
sc.sync_mode = "AUDIO_SYNC"
r.ffmpeg.audio_codec, r.ffmpeg.audio_bitrate, r.ffmpeg.audio_mixrate = "AAC", 192, 48000

assert not [o for o in bpy.data.objects if o.name.startswith("Probe")], "a probe camera was left in the scene"
bpy.ops.wm.save_as_mainfile(filepath=f"{C.ROOT}/blend/escape_v005.blend")
print("saved", bpy.data.filepath, "sound strip", strip.frame_final_duration, "frames")
