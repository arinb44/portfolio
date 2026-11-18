# Progress: nightfall-escape

- **Current phase:** Phase 5 complete (final delivered)
- **Status:** complete; final approved by the user on 2026-11-18

## Completed milestones
- 2026-11-18: Root confirmed (Portfolio); new project (not resuming Stalked).
- 2026-11-18: Phase 1 done. 25 s first-person escape MP4 with sound, companion to Stalked; Stalked's forest + ground clutter + moving mist/debris; wendigo glimpses only; trip ~23 s, cut to black, ~1 s of sound into the black; Game 2 sounds, synthesized breathing, no music; 1600x900, 24 fps, 600 frames, Cycles 128 spp, AgX; background mode only; final to `art-src/project-visuals/nightfall/escape.mp4`.
- 2026-11-18: Phase 2 done (`blenderAgent.md`) and Phase 3 done (`plan.md`), approved under the user's delegation.
- 2026-11-18: **M1 path and forest** (agent-accepted). `01_path_forest.py` on Stalked's packed final -> `blend/escape_v001.blend`, `path.json`. Previews `previews/m1-path-forest/`.
- 2026-11-18: **M2 clutter and atmosphere** (agent-accepted). `02_clutter.py` -> v002; `03_atmosphere.py` -> v003. Previews `previews/m2-clutter/`, `previews/m2-atmosphere/`.
- 2026-11-18: **M3 animation** (agent-accepted). `04_animation.py` -> v004 + `cues.json`. Previews `previews/m3-animation/` (keys, sheets, `preview_with_sound.mp4`).
- 2026-11-18: **M4 sound** (agent-accepted). `05_audio.py` -> `audio/escape_mix.wav`; `06_render_settings.py` -> v005 (spill 120 until the turn, then 350; the mix as a sound strip).
- 2026-11-18: **M5 final.** `07_render.py` 560 frames in 204 min (21.9 s/frame, no faults) -> `final/frames/`; `08_encode.py` -> `final/escape.mp4` (1600x900 H.264 + AAC, 600 frames, 25.00 s, verified: frames 561-600 black, audio peak -1.1 dB); `09_pack_final.py` -> `final/escape_final.blend` (verified: reopens with no unpacked files, sound packed); copied to `art-src/project-visuals/nightfall/escape.mp4` (identical). `summary.md` written.

## State
- **Latest .blend version:** `blend/escape_v005.blend`; packed final `final/escape_final.blend`
- **Latest approved preview:** `final/escape.mp4` (approved by the user, 2026-11-18)
- **Mode used:** background only
- **Scripts not yet re-run in background:** none

## Next step
None; the clip is approved. For later changes: edit the script for that step (timing in `scripts/config.py`) and re-run from it onward (see `summary.md` section 5).

## Open questions
- None.

## Version control
- Repository: https://github.com/arinb44/portfolio (origin); branch `nightfall-escape`, cut from `project-info`, built with a separate index so the user's checkout stays on `project-info`; scripts + docs only. The model-licence notes in `output/nightfall-stalked/` ride along on this branch.

**Last updated:** 2026-11-18
