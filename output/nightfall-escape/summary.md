# Escape: Blender Summary

**Prepared by:** Nightfall Escape Agent
**Date:** 2026-11-18
**Blender version:** 5.2.2 LTS
**Status:** Complete

## 1. Overview
A 25-second first-person clip, a companion to Stalked. It opens on Stalked's view: the wendigo's red eyes in the dark, the beam just missing it. It screams, and the hunter whips round and sprints down a trail through the same spruce forest, with the flashlight swinging ahead, ferns, roots and rocks rushing past, and low mist and drifting needles in the beam. The hunter looks back three times (at about 7, 13 and 18.5 s) and glimpses the wendigo closer each time: 13 m, 9 m, then 5.5 m behind. It's only ever a shape and two red eyes, never lit. At 22.5 s a root catches the foot, and the ground comes up in the beam. On the floor, a fern and the dropped flashlight are lit for a moment, then the picture cuts to black at 23.3 s. Over the black, its footsteps arrive and a scream is cut off at 24.6 s; then silence. There's no music.

Final render: `art-src/project-visuals/nightfall/escape.mp4` (identical to `output/nightfall-escape/final/escape.mp4`).

## 2. Requirements Checklist
| # | Requirement | Status | Note |
|---|---|---|---|
| 1 | 600 frames, 24 fps, 1600 × 900, Cycles 128 spp, denoised, AgX, motion blur | Done | 25.00 s, 600 frames (560 rendered + 40 black) |
| 2 | Starts in Stalked's place | Done | Same spot, forest, moon and fog; the wendigo where Stalked left it |
| 3 | First-person running: bob, sway, roll, jolts, breathing, swinging flashlight | Done | 2.9 steps/s at a sprint of 4.3 m/s; the flashlight is in the running hand with a 3-frame lag |
| 4 | Three look-backs, wendigo only glimpsed, never lit | Done | Eyes in clear view on every frame of each look-back (self-check); the spill stays at Stalked's 120 while it faces the hunter |
| 5 | Ground clutter, moving mist and debris, no snow | Done | 795 roots, 635 rocks, 1873 ferns, 526 twig bushes; drifting low mist; 7000 needles + 14000 dust motes |
| 6 | Trip at ~23 s, cut to black, sound ~1 s into the black | Done | Trip 22.5 s, impact 23.1 s, black from 23.33 s, sound until 24.6 s |
| 7 | Sound from Game 2, breathing synthesized, no music | Done | 9 Game 2 files; panting, thumps and reverb synthesized; checked by levels and timing, **not by ear** |
| 8 | Final MP4 in `art-src/project-visuals/nightfall/` | Done | `escape.mp4`, 7.1 MB |

## 3. Final Files
| File | Where |
|---|---|
| `escape.mp4` (H.264 CRF 18 + AAC 192 kbps, 1600 × 900, 25.00 s) | `output/nightfall-escape/final/` and `art-src/project-visuals/nightfall/` |
| PNG frames 1–560 | `output/nightfall-escape/final/frames/escape_####.png` |
| Sound mix (48 kHz stereo WAV) | `output/nightfall-escape/final/escape_mix.wav` (built in `audio/`) |
| Packed .blend (all images and the sound inside, 58 MB) | `output/nightfall-escape/final/escape_final.blend` |
| Working versions | `output/nightfall-escape/blend/escape_v001.blend` … `escape_v005.blend` |
| Scripts, plan, decisions, progress, assets | `output/nightfall-escape/` (committed on branch `nightfall-escape`) |

## 4. Scene Specs
- Metric, 1 unit = 1 m. Eye height 1.7 m. The wendigo is 2.7 m tall.
- Ground 158 × 137 m (527 × 456 grid) on Stalked's height function. The run path is 92 m, and the hunter covers 84.6 m.
- 4803 objects, mostly linked duplicates: 680 spruces, 973 saplings, the clutter, the deadwood, and 2 geometry-nodes debris clouds.
- Cycles GPU (OptiX) at 128 samples, adaptive threshold 0.03, OptiX denoiser, biased volumes, motion blur shutter 0.5, AgX.
- Frames 1–600 at 24 fps. Exposure is keyed to −20 from frame 561, so Blender's own render also cuts to black.
- Render time: 204 min for 560 frames (21.9 s/frame) on an RTX 4070 Laptop.

## 5. How to Reproduce
Run from `output/nightfall-escape/`, with `B="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"`:

```
"$B" -b --factory-startup ../nightfall-stalked/final/stalked_final.blend --python scripts/01_path_forest.py   # -> blend/escape_v001.blend
"$B" -b --factory-startup blend/escape_v001.blend --python scripts/02_clutter.py                           # -> v002
"$B" -b --factory-startup blend/escape_v002.blend --python scripts/03_atmosphere.py                        # -> v003
"$B" -b --factory-startup blend/escape_v003.blend --python scripts/04_animation.py                         # -> v004 + cues.json
python -I scripts/05_audio.py                                                                               # -> audio/escape_mix.wav
"$B" -b --factory-startup blend/escape_v004.blend --python scripts/06_render_settings.py                   # -> v005
"$B" -b --factory-startup blend/escape_v005.blend --python scripts/07_render.py -- --out final/frames --name escape --frames 1-560 --skip-existing
python -I scripts/08_encode.py --src final/frames --name escape --out final/escape.mp4
"$B" -b --factory-startup blend/escape_v005.blend --python scripts/09_pack_final.py                        # -> final/escape_final.blend
```

`scripts/config.py` holds the shared timeline: the path, the speed curve, the look-back windows, the wendigo's distance keys, and the trip and impact frames. To change the timing, edit it and re-run from `04` (or from `01` if the path or sight lines move), then `05` onward. `scripts/tools/stills.py` renders preview stills along the path.

## 6. How to Use
- **The clip:** play `escape.mp4`. It's the source for the portfolio's Nightfall visual, next to `stalked.mp4`, and any fresco paint or grading is added later, as with Stalked.
- **The .blend:** open `final/escape_final.blend` in Blender 5.2. The timeline plays with sound (the sequencer holds the mix as a sound strip), and Render Animation reproduces the frames. The wendigo's rig is hidden in the viewport (one imported bone is hundreds of metres long), but the body still deforms.

## 7. Assets & Licenses
See `assets.md`. Everything comes from the user's own work: the wendigo and spruce models (free to use, confirmed by the user), the CC0 Poly Haven and ambientCG textures in Stalked's file, and nine Game 2 sounds (free for public use, per the user). The breathing, thumps and reverb are synthesized. Nothing was downloaded, generated or installed.

## 8. Decision Log
See `decisions.md` (18 entries). The key ones:
- **From the user:** a new project; glimpses only; 128 samples; ground clutter plus moving mist; background mode; free-to-use sounds and models.
- **Decided by the agent while the user slept, all open to change:**
  - the flashlight spill at 350 while running, but 120 while the wendigo is in view
  - the beam aimed lower with a wider arm swing
  - the flashlight kept in the hand through the fall
  - the sound design choices
  - committing through a separate index to a new branch, so the `project-info` checkout was never switched

## 9. Known Issues & Next Steps
- **Listen to it.** The mix was judged by levels (peak −1.1 dB, mean −19 dB) and by the cue timing, not by ear. The breathing is synthesized, so the panting may sound artificial; `05_audio.py` keeps every level in one place.
- The forward run is dark, by design: a pool of flashlight on the trail with trunks at the edges, matching Stalked. To see more, raise the spill in `06_render_settings.py` (it's animated, and the 350 key is the running level) and re-render.
- The wendigo's run clip is speed-matched (strip scale 0.74), but its feet may still slide a little. It's only seen in the dark with motion blur.
- The milestones were accepted by the agent under the user's delegation. Any of them can be revisited: re-run from the changed script onward.
- Possible next steps: fresco-paint the clip for the site, as was done for Stalked, and a review pass.
