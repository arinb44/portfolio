# Plan: nightfall-stalked

## Project Title
Stalked: a hunter's-eye night forest loop with a wendigo just outside the beam.

## Objective
Build and light a photoreal night forest in Blender 5.2 and render a 10-second seamless loop through the eyes of a hunter. The hunter stands still and sweeps a flashlight across the trees; a wendigo stands close in the dark, and the beam passes it by without ever landing on it. The clip is the clean source for the portfolio's Nightfall visual; paint and other effects come later.

## Requirements
1. Photoreal night forest: spruce trees, forest floor, deadfall, fog, cold moonlight.
2. First-person handheld camera at 1.7 m eye height; only the flashlight beam is visible (it starts just below frame), no hands or gun.
3. The camera moves like a nervous person searching: slow sweeps, small breathing sway, a short pause near the wendigo.
4. The wendigo (`wendigo-col1.glb`, scaled to about 2.7 m) stands 6–9 m away, half behind a trunk, in the dark just outside the beam's path. The beam comes close (its soft edge and spill may graze it) but never lights it fully. It is half-made-out by moonlight and fog, never clearly seen.
5. The wendigo is posed from its own clips and keeps a small looping motion (breathing, a slight head shift).
6. 240 frames at 24 fps, 1600 × 900, and frame 240 flows into frame 1 with no jump.
7. Cycles on the GPU (OptiX), AgX color.
8. Deliverables: a PNG frame sequence, an H.264 MP4, and the final .blend with textures packed, in `art-src/project-visuals/nightfall/`.
9. The user's source models and textures in Game 2 are only read, never changed.

## Scope
**In scope:** scene building, materials, lighting, fog, the camera move, posing the wendigo, previews, the final render and the MP4.

**Out of scope:** post effects, paint, grain, grading for the site, sound, the hunter's body/hands/gun, new character modeling or sculpting, any change to Game 2 or to the site (`src/`, `public/`, the `project-visuals` work), downloads.

## Technical Approach
- **Scene base:** start from an empty scene saved as v001 (the open default scene is not the user's file). Metric, 1 unit = 1 m.
- **Wendigo:** import the glb, hide the extra icosphere, scale to about 2.7 m, place it on the ground. Identify the three unnamed Mixamo clips, then pick a frame (stalking/still pose) from them as the base pose. Add a seamless breathing and head-shift loop on top with sine-based keys whose periods divide 240 frames.
- **Trees:** `spruce.glb` (7.4 m, 4.9k triangles, textured) instanced over the ground with Geometry Nodes (Poisson-disk spacing, random rotation and scale 0.8–1.4, a few dead/fallen ones). The camera spot and the wendigo's trunk are kept clear by masks. Because a game tree may look too simple up close in the beam, the nearest 6–10 trunks may become "hero trunks": tall cylinders with displaced Poly Haven `pine_bark` and a few dead lower branches (decided from a preview).
- **Ground:** subdivided plane with gentle noise displacement. Material from the Game 2 textures (ambientCG `Ground037`, Poly Haven `rocky_gravel`) mixed with procedural needle litter and moss variation; choice made from a preview. Scattered sticks, a fallen log or two, and roots/rocks from simple scripted meshes.
- **Lighting:**
  - Moonlight: a weak, cold sun (about 7000–8000 K look) filtering through the canopy, with a very dark blue world.
  - Flashlight: a spot light parented to the camera, offset 0.25 m below and 0.15 m right of the eye, slightly warm (about 4500 K), spot about 25° with a soft edge, and a light texture for a realistic hotspot and ring. It lags the camera by a frame or two so it feels hand-held.
  - Fog: a volume (Principled Volume) with low density and noise-driven patches, so the beam shows as a shaft and the far trees fade into grey.
- **Camera:** 24 mm lens (decided from previews), keyframed every frame from a sum of sines whose periods divide 240 frames, so the loop is exact. Motion blur on (shutter 0.5) for a hand-held feel.
- **Render:** Cycles, OptiX on the GPU switched on only inside background runs (`--factory-startup`, preferences never saved), about 128 adaptive samples with the OptiX denoiser, texture limit 4K to keep memory in check, persistent data on. The MP4 is encoded by Blender's own FFmpeg output from the PNG frames.

## Scene Specs
| Spec | Value |
|---|---|
| Blender | 5.2.2 LTS |
| Units / scale | metric, 1 unit = 1 m; wendigo ~2.7 m; eye height 1.7 m |
| Polygon budget | no hard limit (render only); trees instanced so the viewport stays responsive |
| Engine | Cycles, GPU (OptiX) |
| Resolution | 1600 × 900 |
| Samples | ~128 adaptive + OptiX denoise (tuned from previews) |
| Frame range / fps | 1–240 at 24 fps (10 s), seamless loop |
| Color management | AgX |
| Motion blur | on, shutter 0.5 |

## Scripts
| Script | Purpose | Produces |
|---|---|---|
| `01_blockout.py` | Empty scene, units, ground plane, wendigo and one spruce imported and scaled, rough tree scatter, camera and flashlight placed | `stalked_v001.blend` |
| `02_forest.py` | Final tree scatter, hero trunks (if chosen), ground displacement, logs, sticks, rocks | `stalked_v002.blend` |
| `03_materials.py` | Ground, bark, log and wendigo material set-up and tweaks | `stalked_v003.blend` |
| `04_lighting.py` | Moonlight, world, fog volume, flashlight with light texture, exposure | `stalked_v004.blend` |
| `05_animation.py` | Looping hand-held camera and flashlight lag, wendigo pose and breathing loop, motion blur | `stalked_v005.blend` |
| `06_render_settings.py` | Final Cycles settings and output paths | `stalked_v006.blend` |
| `07_render.py` | Background render of a frame range (used for the timing test and the final) | PNG frames |
| `08_encode.py` | PNG frames to H.264 MP4 | MP4 |

Each script runs on the previous version and saves the next one.

## Assets & Add-ons
| Asset | Source | License | Use |
|---|---|---|---|
| `wendigo-col1.glb` + textures | the user's Game 2 `models/` | free to use (user, 2026-11-18) | the creature |
| `spruce.glb` + 9 textures | the user's Game 2 `models/` (a Sketchfab model) | free to use (user, 2026-11-18) | the trees |
| `pine_bark` (8K, diff/arm/nor/disp) | Game 2 `assests/textures/Tree Textures/` (Poly Haven) | CC0 | hero trunks, logs |
| `rocky_gravel` (8K) | Game 2 `assests/textures/` (Poly Haven) | CC0 | ground (option) |
| `ground037` | Game 2 `assests/textures/` (ambientCG) | CC0 | ground (option) |

Textures are read from Game 2 in place (never changed) and packed into the final .blend. No add-ons. No downloads or AI generation. Everything used is logged in `assets.md`.

## Milestones
Each ends with a preview in `previews/<milestone>/` and waits for your approval.
1. **M1 Blockout:** scale, composition, camera spot, where the wendigo stands and how close the beam passes. Preview: 4 key frames, quick render.
2. **M2 Forest:** the full forest layout; decision on hero trunks vs. spruce.glb up close. Preview: key frames.
3. **M3 Materials:** ground, bark, wendigo. Preview: lit test stills.
4. **M4 Lighting & atmosphere:** moonlight, fog, flashlight look; how readable the wendigo is. Preview: stills at the near-miss frame and two others, and timed per-frame renders at final settings for a real estimate.
5. **M5 Animation:** camera loop, flashlight lag, wendigo breathing. Preview: a low-res, low-sample MP4 of the whole loop played twice to check the seam.
6. **M6 Final render:** asked for first with settings and the measured time estimate; then background render, MP4, and copying finals to `art-src/project-visuals/nightfall/` after you confirm the path.

## Render / Export Plan
- 240 frames, 1600 × 900, Cycles OptiX, ~128 adaptive samples + denoise, motion blur on.
- **Estimate:** 20–60 s per frame, so about 1.5–4 h. Replaced by a measured number in M4 before any final render.
- Output: `output/nightfall-stalked/final/frames/stalked_####.png`, then `stalked.mp4` (H.264, high quality, 24 fps), then copied with the packed .blend to `art-src/project-visuals/nightfall/`.

## Decision Points
- M1: the wendigo's spot and how close the beam passes (I'll show options).
- M1: which clip/frame gives the wendigo's pose.
- M1/M2: lens (24 mm vs. 28–35 mm).
- M2: hero trunks vs. spruce.glb up close.
- M3: ground material.
- M4: fog density and how much of the wendigo the moonlight reveals.
- M6: final samples and the time estimate; the exact final paths.
- Before the first commit: which GitHub repository and branch.

## Risks & Limitations
- **The game-ready spruce** (512–1024 px textures, 4.9k triangles) may look simple close up in the beam; hero trunks are the fix.
- **Render time:** fog, alpha-cut needles and 8K textures are slow in Cycles; the estimate may change after M4.
- **Flicker:** denoising dark, foggy frames one by one can shimmer over an animation; may need more samples or lighter fog.
- **The Mixamo pose:** the clips may not include a good still "stalking" pose; then I'll adjust a few bones by script. No hand posing or sculpting.
- **Laptop GPU:** long renders heat up a laptop; it should stay plugged in.
- **Add-on version:** the MCP add-on is out of date (protocol 11 vs. 16); it works, but some tool features may fall back.

## Open Questions
1. Can the wendigo and spruce models appear in a public portfolio clip, and does the spruce (Sketchfab) need a credit? The Nightfall page currently says the models are withheld. **Answered 2026-11-18: both are free to use.**
2. Motion blur on (recommended) or off?
3. The `project-visuals` plan expects a Nightfall **still**. This loop could replace it, but changing that plan is that agent's work, not this one.

**Status:** Approved on 2026-11-17

## Amendment 1 (2026-11-17, user request)
Faint red glowing eyes for the wendigo. New script `05b_eyes.py` on v005 -> `stalked_v006.blend`: two 2 cm emissive spheres (deep red, strength 0.9, no shadows) in the skull's orbit pits, parented to the head bone so they follow the breathing and head turn. Knock-on: `06_render_settings.py` now produces `stalked_v007.blend`. Render time unchanged (~16 s/frame measured with the eyes).
