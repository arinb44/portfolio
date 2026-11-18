# Escape: Blender Summary

**Prepared by:** Nightfall Escape Agent
**Date:** 2026-11-18
**Blender version:** 5.2.2 LTS
**Status:** DRAFT (filled in after the final render)

## 1. Overview
A 25-second first-person clip, a companion to Stalked. It opens on Stalked's view: the wendigo's red eyes in the dark, the beam just missing it. It screams, and the hunter whips round and sprints down a trail through the same spruce forest, with the flashlight swinging ahead, ferns, roots and rocks rushing past, and low mist and drifting needles in the beam. The hunter looks back three times (at about 6.5 s, 12.5 s and 18.5 s) and glimpses the wendigo closer each time: 13 m, 9 m, then 5.5 m behind. It's only ever a shape and two red eyes, never lit. At about 22.5 s a root catches the foot, the ground comes up in the beam, and after the impact the picture cuts to black at 23.3 s. Over the black, its footsteps arrive and a scream is cut off. There's no music.

Final render: `art-src/project-visuals/nightfall/escape.mp4` (copy of `output/nightfall-escape/final/escape.mp4`).

## 2. Requirements Checklist
(filled in after the final render)

## 3. Final Files
(filled in after the final render)

## 4. Scene Specs
(filled in after the final render)

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

`scripts/config.py` holds the shared timeline: the path, the speed curve, the look-back windows, the wendigo's distance keys, and the trip and impact frames. Change the timing there and re-run from `01` (path or sight lines) or from `04` (timing only), then `05` onward.

## 6. How to Use
(filled in after the final render)

## 7. Assets & Licenses
See `assets.md`.

## 8. Decision Log
See `decisions.md`.

## 9. Known Issues & Next Steps
(filled in after the final render)
