# Progress: nightfall-escape

- **Current phase:** Phase 4, M3 animation preview rendering
- **Status:** in progress (user asleep; agent deciding under the user's delegation, 2026-11-18)

## Completed milestones
- 2026-11-18: Root confirmed (Portfolio); new project (not resuming Stalked).
- 2026-11-18: Phase 1 done. 25 s first-person escape MP4 with sound, companion to Stalked; Stalked's forest + ground clutter + moving mist/debris; wendigo glimpses only; trip ~23 s, cut to black, ~1 s of sound into the black; Game 2 sounds, synthesized breathing, no music; 1600x900, 24 fps, 600 frames, Cycles 128 spp, AgX; background mode only; final to `art-src/project-visuals/nightfall/escape.mp4`.
- 2026-11-18: Phase 2 done (`blenderAgent.md`) and Phase 3 done (`plan.md`), approved under the user's delegation.
- 2026-11-18: **M1 path and forest** (agent-accepted). `01_path_forest.py` on Stalked's packed final -> `blend/escape_v001.blend`, `path.json`. Ground 158 x 137 m, path 92 m, 7 trees and 2 logs cleared from the lane, +396 spruces, +662 saplings, +54 deadwood, +1003 sticks. Previews `previews/m1-path-forest/` (`map_top.png`, eye-level stills).
- 2026-11-18: **M2 clutter and atmosphere** (agent-accepted). `02_clutter.py` -> v002 (635 rocks, 1873 ferns, 526 brush, 795 roots + the trip root at s=83.3); `03_atmosphere.py` -> v003 (low drifting mist volume, 7000 needles + 14000 dust motes via geometry nodes, biased volumes for speed). Previews `previews/m2-clutter/`, `previews/m2-atmosphere/`.
- 2026-11-18: **M3 animation** scripted. `04_animation.py` -> v004 + `cues.json`: freeze during the scream, whip turn, sprint (2.9 steps/s), look-backs at 150/288/424 (wendigo 13/9/5.5 m behind, eyes in clear view on every look-back frame), trip at 540, impact 555, cut to black at 561. Key frames `previews/m3-animation/keys2/`, `sheet_spill.png`, `sheet_end2.png`.
- 2026-11-18: **M4 sound** scripted. `05_audio.py` -> `audio/escape_mix.wav` (25.00 s, peak -1.2 dBFS, rms -18.9 dBFS). `06_render_settings.py` -> v005 (final settings, spill 350, the mix as a sound strip).

## State
- **Latest .blend version:** `blend/escape_v005.blend`
- **Latest preview:** `previews/m3-animation/keys2/`, low-res full preview rendering to `previews/m3-animation/full/`
- **Mode used:** background only
- **Scripts not yet re-run in background:** none (all run in background)

## Next step
Finish the low-res preview, encode it with the mix (`08_encode.py --src previews/m3-animation/full --name f`), review it; then the final render: `blender --background --factory-startup blend/escape_v005.blend --python scripts/07_render.py -- --out final/frames --name escape --frames 1-560 --skip-existing`, then `python -I scripts/08_encode.py --src final/frames --name escape --out final/escape.mp4`, `09_pack_final.py`, copy the MP4 to `art-src/project-visuals/nightfall/escape.mp4`, write `summary.md`, commit and push (branch `nightfall-escape`, origin).

## Open questions
- Licence of `wendigo-col1.glb` and `spruce.glb` for a public clip (carried over from Stalked).
- The sound was checked by levels and timing only; the user should listen.

**Last updated:** 2026-11-18
