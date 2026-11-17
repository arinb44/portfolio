# Progress: nightfall-stalked

- **Current phase:** Phase 4, M5 animation
- **Status:** waiting for user

## Completed milestones
- 2026-11-17: Phase 1 setup interview done. Root: Portfolio. Answers: 10 s seamless loop, Cycles GPU, beam-only first-person view, the beam just misses the wendigo, photoreal, building and lighting only, any models allowed, finals in `art-src/`.
- 2026-11-17: Phase 2 done. `blenderAgent.md` approved.
- 2026-11-17: Phase 3 done. `plan.md` approved.
- 2026-11-17: **M1 blockout approved.** Script `01_blockout.py` (live via MCP) -> `blend/stalked_v001.blend`. Previews in `previews/m1-blockout/` (`keyframes_f1-70-150-200.png`, options A/B/C, pose sheets). Wendigo spot A and pose Scream f1 chosen.
- 2026-11-17: **M2 forest approved** (keep the spruce model; fix its bark in M3). Script `02_forest.py` (live via MCP) on v001 -> `blend/stalked_v002.blend`. 325 young spruces, dead twigs on trunks within 20 m, 29 logs/snags/stumps, ~600 sticks, ground +/-0.28 m. Preview `previews/m2-forest/keyframes_f1-70-150-200.png`.
- 2026-11-17: **M3 materials approved.** Scripts `03a_textures.py` (background: 4K/2K working copies in `textures/`) and `03_materials.py` (live) on v002 -> `blend/stalked_v003.blend`. Previews in `previews/m3-materials/`. Note: the live scene lost the M2 objects once (likely an undo in Blender); v002 was reopened from disk at the user's request before running 03.
- 2026-11-17: **M4 lighting approved (option D).** Scripts `04_lighting.py` (live) on v003 -> `blend/stalked_v004.blend`; `07_render.py` (background GPU renderer). Moon behind the wendigo, fog box, hotspot + spill flashlight with near-field softening, Cycles 128 spp. Previews: `previews/m4-lighting/d-keyframes/d_0001/0070/0150/0200.png`, options A/D/E at f150.

## State
- **Latest .blend version:** `blend/stalked_v004.blend` (open in the live Blender)
- **Latest approved preview:** `previews/m4-lighting/d-keyframes/`
- **Mode used:** live MCP (add-on protocol 11) + background for final renders
- **Scripts not yet re-run in background:** `01_blockout.py`, `02_forest.py`, `03_materials.py`, `04_lighting.py`

## Findings
- The wendigo's three unnamed clips are exact copies of Run, Scream, Death (removed on import). Real clips: Run, Scream, Attack, Death.
- One imported bone is hundreds of metres long; the rig is hidden in the viewport (body still deforms).
- Wendigo source is ~18.9 units tall; scaled to 2.7 m.
- Spruce trunks are bare up to ~2.5 m, so the forest reads open/pine-like at eye level.

## Next step
M5 animation: `scripts/05_animation.py` on v004 -> `blend/stalked_v005.blend` (exact looping hand-held camera, flashlight lag, wendigo breathing, motion blur).

## Open questions
- Licence of `wendigo-col1.glb` and `spruce.glb` (Sketchfab) for a public clip; credit needed?

**Last updated:** 2026-11-17



## Version control
- Repository: https://github.com/arinb44/portfolio (origin); branch `nightfall-stalked`; scripts + docs only.





## Render timing (measured 2026-11-17)
- 1600x900, 128 spp, OptiX on the RTX 4070 Laptop: ~15.5 s per frame (frames 1, 70, 150, 200). 240 frames ~ 62 min before motion blur.
- Stray empty folders C:\output\nightfall-stalked\... were left by a relative-path bug in 07_render.py (fixed); removal outside the project was blocked, the user may delete them.


