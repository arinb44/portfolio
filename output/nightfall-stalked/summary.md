# Stalked: Blender Summary

**Prepared by:** Nightfall Stalk Agent
**Date:** 2026-11-17
**Blender version:** 5.2.2 LTS
**Status:** Complete

## 1. Overview
A photoreal 10-second seamless loop seen through a hunter's eyes in a foggy spruce forest at night. The hunter sweeps a flashlight through the trees, flicks it nervously to the right, and holds; just outside the beam a wendigo stands beside a trunk, a dark hunched shape with faint red eyes in its deer skull, breathing slowly. It is the clean source clip for the portfolio's Nightfall visual; paint and other effects are added later.

- Final video: `art-src/project-visuals/nightfall/stalked.mp4` (1600×900, 24 fps, 240 frames, H.264)
- Final frames: `art-src/project-visuals/nightfall/frames/stalked_0001.png` … `stalked_0240.png`

## 2. Requirements Checklist
| # | Requirement (plan.md) | Status | Note |
|---|---|---|---|
| 1 | Photoreal night forest: spruces, floor, deadwood, fog, cold moon | Done | 291 spruces + 325 young spruces, deadwood, moss/needle floor, fog volume, moon behind the wendigo |
| 2 | First-person hand-held camera at 1.7 m, beam only | Done | 24 mm; torch offset below/right of the eye |
| 3 | Nervous search: sweeps, breathing sway, pause near the wendigo | Done | Flick toward it at ~frame 126, hold to ~172 |
| 4 | Wendigo 6–9 m away beside a trunk, beam close but never on it | Done | 7.5 m at 54° right; lit only by the dim spill and the moon (option D) |
| 5 | Posed from its own clips, small looping motion | Done | Scream frame 1 pose; breathing + slow head turn |
| 6 | 240 frames, 24 fps, 1600×900, seamless loop | Done | Seam self-check in `05_animation.py`; frames 238→2 checked |
| 7 | Cycles GPU (OptiX), AgX | Done | 128 adaptive samples, OptiX denoise, motion blur 0.5 |
| 8 | PNG frames, H.264 MP4, packed .blend in `art-src/project-visuals/nightfall/` | Done | Verified by reopening in background Blender |
| 9 | Game 2 source files only read | Done | Textures copied into `textures/` as 4K/2K working copies |
| A1 | Faint red glowing eyes (amendment) | Done | Emission 0.9, inside the skull's eye sockets, follow the head |

## 3. Final Files
| File | In `output/nightfall-stalked/` | In the project |
|---|---|---|
| Final video | `final/stalked.mp4` (2.4 MB) | `art-src/project-visuals/nightfall/stalked.mp4` |
| Final frames | `final/frames/stalked_0001-0240.png` | `art-src/project-visuals/nightfall/frames/` |
| Final scene, textures packed | `final/stalked_final.blend` (49 MB) | `art-src/project-visuals/nightfall/stalked_final.blend` |
| Working versions | `blend/stalked_v001.blend` … `stalked_v007.blend` | — |
| Previews per milestone | `previews/m1-blockout/` … `previews/m5b-eyes/`, `previews/final_sheet.png` | — |

`art-src/`, `blend/`, `previews/`, `final/`, `logs/` and `textures/` are git-ignored; scripts and documents are committed on branch `nightfall-stalked`.

## 4. Scene Specs
- **Units/scale:** metric, 1 unit = 1 m; wendigo 2.7 m (antlers included); eye height 1.7 m.
- **Objects:** 657. Trees are linked duplicates of one 4.9k-triangle spruce (~616 instances, ~3 M triangles rendered); wendigo 14.6k triangles; ground grid 90 m, 0.3 m spacing (~180k triangles); dead twigs ~25k triangles.
- **Engine:** Cycles, OptiX on an RTX 4070 Laptop GPU; 128 samples, adaptive threshold 0.03, OptiX denoiser; bounces 6 (diffuse 3, glossy 2, transmission 2, volume 1, transparent 32); persistent data.
- **Lighting:** moon (sun) 0.2, cold blue, behind the wendigo; fog density 0.045, anisotropy 0.45; flashlight hotspot 900 W (20°) + spill 120 W (52°), both with near-field softening; eyes emission 0.9.
- **Frames:** 1–240 at 24 fps, motion blur shutter 0.5. **Colour:** AgX, exposure 0.
- **Render time:** 64 min for 240 frames (~16 s/frame).

## 5. How to Reproduce
Scripts in `output/nightfall-stalked/scripts/`, each run on the previous version (`blender` = `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`):

| Order | Script | Produces |
|---|---|---|
| 1 | `01_blockout.py` (empty scene) | `blend/stalked_v001.blend` |
| 2 | `02_forest.py` | `stalked_v002.blend` |
| 3 | `03a_textures.py` (no .blend) | `textures/` 4K/2K working copies |
| 4 | `03_materials.py` | `stalked_v003.blend` |
| 5 | `04_lighting.py` | `stalked_v004.blend` |
| 6 | `05_animation.py` | `stalked_v005.blend` |
| 7 | `05b_eyes.py` | `stalked_v006.blend` |
| 8 | `06_render_settings.py` | `stalked_v007.blend` |
| 9 | `07_render.py` | PNG frames |
| 10 | `08_encode.py` | MP4 |
| 11 | `09_pack_final.py` | `final/stalked_final.blend` |

```
blender --background --factory-startup --python scripts/01_blockout.py
blender --background --factory-startup blend/stalked_v001.blend --python scripts/02_forest.py
blender --background --factory-startup --python scripts/03a_textures.py
blender --background --factory-startup blend/stalked_v002.blend --python scripts/03_materials.py
  ... and so on for 04, 05, 05b, 06 ...
blender --background --factory-startup blend/stalked_v007.blend --python scripts/07_render.py -- --out final/frames --name stalked --frames 1-240 --skip-existing
blender --background --factory-startup --python scripts/08_encode.py -- --src final/frames --name stalked --out final/stalked.mp4
blender --background --factory-startup blend/stalked_v007.blend --python scripts/09_pack_final.py
```
`07_render.py --skip-existing` resumes after an interruption. `--set fog=… moon=… spill=… eyes=… exposure=…` previews lighting variations without changing the file.

## 6. How to Use
- **Video:** `stalked.mp4` loops seamlessly; play it on repeat. It is the clean source for the site's paint/grade pass (as with the NBA/NFL/MLB clips in `art-src/project-visuals/`).
- **Frames:** use the PNG sequence when a pass needs per-frame access (painting, grading, re-encoding to WebM).
- **Scene:** open `stalked_final.blend` in Blender 5.2; everything is packed. Press Numpad 0 for the hunter's view; render with Render > Render Animation (output goes to `output/nightfall-stalked/final/frames/` as set in the file; change it under Output Properties).

## 7. Assets & Licenses
See `assets.md`. Summary: `wendigo-col1.glb` and `spruce.glb` from the user's Game 2 project (free to use, confirmed by the user on 2026-11-18); Poly Haven `pine_bark` and `rocky_gravel` (CC0); ambientCG `Ground037` (CC0). No downloads, no generated assets, no add-ons.

## 8. Decision Log
Full log in `decisions.md` (25 entries). Key choices: root Portfolio; 10 s seamless loop; Cycles GPU; beam-only view; wendigo spot A (7.5 m, edge of the beam) in the Scream frame 1 pose; keep the spruce model with 4K pine bark; moss + needle floor; grimy grade on the wendigo; lighting option D (half-seen silhouette); motion blur on; faint red eyes (strength 0.9) placed in the eye sockets after the first placement was corrected.

## 9. Known Issues & Next Steps
- **Licences:** the user confirmed on 2026-11-18 that the wendigo and spruce are free to use. The Nightfall page currently says the models are withheld; that copy may need updating.
- **Dead twig stubs** on the nearest trunks read as straight pale sticks up close (frames ~60–80, ~200).
- **The spruce is a game model** (512–1024 px textures, alpha needle cards); close needles read slightly soft.
- **Dark image by design** (exposure 0). If the site's backdrop needs more readable detail, raise exposure in the grade.
- **Scripts 01–05b ran live in Blender** (each saved a version that the next step used); the chain has not been re-run end to end in background mode.
- **GPU fault once** (CUDA illegal address in volume shading) during a preview; the final ran clean. `--skip-existing` covers it.
- **Empty stray folders** `C:\output\nightfall-stalked\...` from an early path bug can be deleted by hand.
- **Next:** the `project-visuals` plan expects a Nightfall *still*; whether this loop replaces it is that project's decision. A review agent pass on the clip is a sensible follow-up.
