# Progress: nightfall-stalked

- **Current phase:** Phase 5 complete (final delivered)
- **Status:** complete; waiting for the user on revisions and the M5-M6 commit

## Completed milestones
- 2026-11-17: Phase 1 setup interview done. Root: Portfolio. Answers: 10 s seamless loop, Cycles GPU, beam-only first-person view, the beam just misses the wendigo, photoreal, building and lighting only, any models allowed, finals in `art-src/`.
- 2026-11-17: Phase 2 done. `blenderAgent.md` approved.
- 2026-11-17: Phase 3 done. `plan.md` approved.
- 2026-11-17: **M1 blockout approved.** Script `01_blockout.py` (live via MCP) -> `blend/stalked_v001.blend`. Previews in `previews/m1-blockout/` (`keyframes_f1-70-150-200.png`, options A/B/C, pose sheets). Wendigo spot A and pose Scream f1 chosen.
- 2026-11-17: **M2 forest approved** (keep the spruce model; fix its bark in M3). Script `02_forest.py` (live via MCP) on v001 -> `blend/stalked_v002.blend`. 325 young spruces, dead twigs on trunks within 20 m, 29 logs/snags/stumps, ~600 sticks, ground +/-0.28 m. Preview `previews/m2-forest/keyframes_f1-70-150-200.png`.
- 2026-11-17: **M3 materials approved.** Scripts `03a_textures.py` (background: 4K/2K working copies in `textures/`) and `03_materials.py` (live) on v002 -> `blend/stalked_v003.blend`. Previews in `previews/m3-materials/`. Note: the live scene lost the M2 objects once (likely an undo in Blender); v002 was reopened from disk at the user's request before running 03.
- 2026-11-17: **M4 lighting approved (option D).** Scripts `04_lighting.py` (live) on v003 -> `blend/stalked_v004.blend`; `07_render.py` (background GPU renderer). Moon behind the wendigo, fog box, hotspot + spill flashlight with near-field softening, Cycles 128 spp. Previews: `previews/m4-lighting/d-keyframes/d_0001/0070/0150/0200.png`, options A/D/E at f150.
- 2026-11-17: **M5 animation approved.** Script `05_animation.py` (live) on v004 -> `blend/stalked_v005.blend`: exact 240-frame camera loop (search, flick toward the wendigo at ~126, pause, return), breathing bob + hand shake, flashlight lag 2.5 frames, wendigo breathing/head shift, motion blur 0.5. Seam self-check passes. Preview: `previews/m5-animation/loop_x2.mp4` (640x360, 24 spp, loop played twice), `sheet_seam-and-flick.png`, full-quality `timing/blur_0126.png`.
- 2026-11-17: **M5b eyes approved** (in the sockets). `05b_eyes.py` (live) on v005 -> `blend/stalked_v006.blend`. Eye sockets: first attempt hit the antler bases, second sat in front of the sockets (user caught it); now found by ray-casting from orthographic probes on both sides of the skull and verified from 4 angles. Previews: `previews/m5b-eyes/` (frames 126/150, compare 2.0 vs 0.9, `loop_eyes_x2.mp4`).

## State
- **Latest .blend version:** `blend/stalked_v007.blend`; packed final `final/stalked_final.blend`
- **Latest approved preview:** `previews/m5b-eyes/loop_eyes_in_sockets_x2.mp4`
- **Mode used:** live MCP (add-on protocol 11) + background for final renders
- **Scripts not yet re-run in background:** `01_blockout.py`, `02_forest.py`, `03_materials.py`, `04_lighting.py`, `05_animation.py`, `05b_eyes.py`

## Findings
- The wendigo's three unnamed clips are exact copies of Run, Scream, Death (removed on import). Real clips: Run, Scream, Attack, Death.
- One imported bone is hundreds of metres long; the rig is hidden in the viewport (body still deforms).
- Wendigo source is ~18.9 units tall; scaled to 2.7 m.
- Spruce trunks are bare up to ~2.5 m, so the forest reads open/pine-like at eye level.

## Next step
M6 final render (approved, running since 2026-11-17; if interrupted, re-run the same 07_render.py command with --skip-existing to resume): `06_render_settings.py` on v006 -> v007; `07_render.py` frames 1-240 -> `final/frames/`; `08_encode.py` -> `final/stalked.mp4`; packed final .blend; copy to `art-src/project-visuals/nightfall/` after the path is confirmed.

## Open questions
- Licence of `wendigo-col1.glb` and `spruce.glb` (Sketchfab) for a public clip; credit needed?

**Last updated:** 2026-11-17



## Version control
- Repository: https://github.com/arinb44/portfolio (origin); branch `nightfall-stalked`; scripts + docs only.





## Render timing (measured 2026-11-17)
- 1600x900, 128 spp, OptiX on the RTX 4070 Laptop: ~15.5 s per frame (frames 1, 70, 150, 200). 240 frames ~ 62 min before motion blur.
- Stray empty folders C:\output\nightfall-stalked\... were left by a relative-path bug in 07_render.py (fixed); removal outside the project was blocked, the user may delete them.




- With motion blur + persistent data (v005): ~15.5 s per frame (frames 1, 126, 200) -> 240 frames ~ 62 min.



- 2026-11-17: the GPU faulted once at frame 227 of the eyes preview (CUDA illegal address in volume shading); a fresh run rendered 227-240 fine. `07_render.py --skip-existing` resumes after such a fault; use it for the final.




## Final delivery (2026-11-17)
- **M6 final render done:** 240 frames in 64 min, no faults. Encoded `final/stalked.mp4` (240 frames, 24 fps, 1600x900, verified); packed `final/stalked_final.blend` (16 images packed, verified).
- Copied to `art-src/project-visuals/nightfall/` (stalked.mp4, stalked_final.blend, frames/; 332 MB; git-ignored).
- `summary.md` written.
- **Next step:** user reviews the final clip; commit scripts 05-09 + docs on `nightfall-stalked` if approved.
