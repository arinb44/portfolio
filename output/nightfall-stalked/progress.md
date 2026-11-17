# Progress: nightfall-stalked

- **Current phase:** Phase 4, M2 forest
- **Status:** waiting for user

## Completed milestones
- 2026-11-17: Phase 1 setup interview done. Root: Portfolio. Answers: 10 s seamless loop, Cycles GPU, beam-only first-person view, the beam just misses the wendigo, photoreal, building and lighting only, any models allowed, finals in `art-src/`.
- 2026-11-17: Phase 2 done. `blenderAgent.md` approved.
- 2026-11-17: Phase 3 done. `plan.md` approved.
- 2026-11-17: **M1 blockout approved.** Script `01_blockout.py` (live via MCP) -> `blend/stalked_v001.blend`. Previews in `previews/m1-blockout/` (`keyframes_f1-70-150-200.png`, options A/B/C, pose sheets). Wendigo spot A and pose Scream f1 chosen.

## State
- **Latest .blend version:** `blend/stalked_v001.blend` (open in the live Blender)
- **Latest approved preview:** `previews/m1-blockout/keyframes_f1-70-150-200.png`
- **Mode used:** live MCP (add-on protocol 11) + background for final renders
- **Scripts not yet re-run in background:** `01_blockout.py`

## Findings
- The wendigo's three unnamed clips are exact copies of Run, Scream, Death (removed on import). Real clips: Run, Scream, Attack, Death.
- One imported bone is hundreds of metres long; the rig is hidden in the viewport (body still deforms).
- Wendigo source is ~18.9 units tall; scaled to 2.7 m.
- Spruce trunks are bare up to ~2.5 m, so the forest reads open/pine-like at eye level.

## Next step
M2 forest: `scripts/02_forest.py` on v001 -> `blend/stalked_v002.blend` (denser understorey, deadfall, ground displacement, hero-trunk decision).

## Open questions
- Licence of `wendigo-col1.glb` and `spruce.glb` (Sketchfab) for a public clip; credit needed?
- Motion blur on or off (needed by M5).
- Push of the M1 commit to origin/nightfall-stalked (asked after the commit).

**Last updated:** 2026-11-17



## Version control
- Repository: https://github.com/arinb44/portfolio (origin); branch `nightfall-stalked`; scripts + docs only.
