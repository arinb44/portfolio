# Decisions: nightfall-stalked

| # | Date | Decision | Answer |
|---|---|---|---|
| 1 | 2026-11-17 | Project root | Portfolio (`C:\Users\arins\Arin\School\Projects\Portfolio`), not Game 2 |
| 2 | 2026-11-17 | Run mode | Live via Blender MCP (user connected it) + background for final renders |
| 3 | 2026-11-17 | What to make | A quick photoreal animation of a hunter being stalked by a wendigo; building and lighting only; effects later; any models may be used; finals in `art-src/` |
| 4 | 2026-11-17 | Length | ~10 s seamless loop (240 frames, 24 fps) |
| 5 | 2026-11-17 | Engine | Cycles on the GPU (OptiX only inside background runs) |
| 6 | 2026-11-17 | How the wendigo is "not directly visible" | The beam just misses it; half-made-out at the edge of the light and fog |
| 7 | 2026-11-17 | Hunter's view | Beam only, no hands or gun |
| 8 | 2026-11-17 | Proposed specs (1600Ã—900, AgX, 2.7 m wendigo, PNG + MP4, `art-src/project-visuals/nightfall/`, slug `nightfall-stalked`) | Approved |
| 9 | 2026-11-17 | Agent definition | Approved |
| 10 | 2026-11-17 | Plan | Approved |
| 11 | 2026-11-17 | Wendigo spot (options A edge of beam 7.5 m / B deeper 11.5 m / C close 4.6 m) | **A**: 7.5 m at -54Â°, beside a trunk at 6.8 m, -49Â° |
| 12 | 2026-11-17 | Wendigo pose (Scream f1 / Attack f12 / Run) | **Scream f1**: hunched, standing, arms hanging |
| 13 | 2026-11-17 | M1 blockout | Approved |
| 14 | 2026-11-17 | Git: repository / branch / contents | `arinb44/portfolio` (origin) / new branch `nightfall-stalked` / scripts + docs only |
| 15 | 2026-11-17 | M2 forest; hero trunks vs. the spruce model up close | Approved; keep the spruce model and give its trunk material the pine_bark texture in M3 |
| 16 | 2026-11-17 | Ground and bark textures | Ground037 moss + rocky_gravel needle litter mixed by noise; pine_bark desaturated to spruce grey-brown; 4K/2K working copies made by `03a_textures.py` |
| 17 | 2026-11-17 | Wendigo colours: keep game colours or grimy grade | **Grimy grade** (material only, textures untouched) |
| 18 | 2026-11-17 | M3 materials | Approved |
| 19 | 2026-11-17 | Wendigo visibility at the pause (A clear / D middle / E ghost) | User dismissed the question and said "continue"; **D middle** (fog 0.045, moon 0.2, spill 120 W); confirmed with the M4 approval |

| 20 | 2026-11-17 | M4 lighting & atmosphere | Approved with option D |
| 21 | 2026-11-17 | Motion blur | **On**, shutter 0.5 |
| 22 | 2026-11-17 | M5 animation | Approved |
| 23 | 2026-11-17 | Add faint red glowing eyes (user request; overrides the 'no glowing eyes' line in Art Direction) | Done in `05b_eyes.py`; strength 0.9 chosen over 2.0 (2.0 flooded the skull with red) |
| 24 | 2026-11-17 | Eye placement (user: 'should be in the eye sockets in the skull') | Moved: sockets found by ray-casting a pixel grid from orthographic probes on each side of the skull; each eye 3.5 cm inside its socket rim. Verified from both sides, the front and the hunter's view |
| 25 | 2026-11-17 | Eye placement approved; start the final render | Yes. Finals to `art-src/project-visuals/nightfall/` (the path approved in setup, decision 8) |
