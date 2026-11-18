# Plan: nightfall-escape

## Project Title
Escape: a 25-second first-person run from the wendigo through Stalked's night forest, ending in a fall and a cut to black.

## Objective
A companion clip to Stalked for the portfolio. The hunter from Stalked breaks and runs: a shaking first-person camera, the flashlight swinging ahead, three looks back at a wendigo that is only ever glimpsed in the dark, then a root catches the foot, the ground comes up and the picture cuts to black while the sound carries on for a moment. Delivered as one MP4 with a synced sound track and no music.

## Requirements
1. 600 frames at 24 fps (25.0 s), 1600 × 900, Cycles GPU at 128 samples with denoising, AgX, motion blur. Same look as Stalked.
2. Starts in Stalked's place: same spot, same forest, the wendigo where Stalked left it, the same moonlight and fog.
3. First-person running: step bob, sway, roll and impact jolts at a sprinting cadence, breathing, a flashlight that swings with the running arm.
4. Three look-backs over the shoulder. The wendigo is closer each time, but only glimpsed: red eyes and a shape against moonlit fog. The flashlight stays pointed ahead, so it never lights the creature.
5. Added detail: ground clutter (roots, rocks, ferns, low brush), low mist that drifts and moves, and needles and dust drifting through the beam. No snow.
6. Around 23 s a root catches the foot, the camera pitches forward and hits the ground, and the picture cuts to black (about frame 560). Black to the end, with sound continuing for about a second.
7. Sound: footsteps synced to the camera's steps, breathing, the wendigo's scream and heavy footsteps, night ambience and wind, whooshes on the look-backs, the fall. All from `Game 2\audio\` except the breathing, which is made in a script. No music.
8. Final: `art-src/project-visuals/nightfall/escape.mp4` (H.264 + AAC). Frames, the mixed WAV and a packed .blend stay in `output/nightfall-escape/final/`.

## Scope
**In:** extending Stalked's forest along a run path, the clutter and atmosphere above, the camera, flashlight and wendigo animation, the sound mix, the render and encode.
**Out:** music; showing or lighting the wendigo clearly; the hunter's hands or body; new character models; post effects and grading for the site; any change to Stalked's files or the Game 2 project.

## Technical Approach
- **Base:** Stalked's packed `final/stalked_final.blend`, opened read-only and saved as `escape_v001.blend`.
- **Run path:** a smooth 2D spline from the hunter's spot, heading away from the wendigo (bearing ~126°), about 85 m long with gentle weaves. It is saved in the .blend as a curve (`RunPath`) and as sampled points that every later script reads.
- **Forest extension:** the ground grid is rebuilt larger with Stalked's own height function, so the start area is unchanged and the new ground joins it seamlessly. Spruces, saplings, logs, snags and stumps are added along the path with Stalked's generator rules (Poisson spacing, linked duplicates). A running lane about 1 m wide stays clear, and the sight lines for the three look-backs are kept open. The fog box is stretched to cover the whole path.
- **Clutter:** roots (beveled curves snaking from trunk bases, with one across the path where the trip happens); rocks (displaced icospheres in a few variants, half sunk, with Stalked's gravel textures and moss on top); ferns (a procedural frond mesh in a few plant variants); and low twig brush. All are instanced or joined, and most sit within about 20 m of the path.
- **Atmosphere:** a thin low-lying mist volume (0–1.2 m) whose density drifts with animated noise, on top of Stalked's fog. Drifting needles and dust are a geometry-nodes point cloud around the path that moves with noise over time, so nothing needs baking. They show up mainly in the beam.
- **Camera:** keyed per frame from a script. The position follows the path with a speed curve (accelerate, sprint ~4.2 m/s, falter, trip). Heading leads the path. Step bob, sway, roll and impact jolts run at ~2.8 steps/s, plus noise. Look-backs turn the head ~150° over a shoulder and back. The fall pitches down and drops about 1.4 m in about 0.6 s, then jolts on impact.
- **Flashlight:** moves from the camera to a "hand" empty that follows the body's heading, with an arm-swing and a lag. It stays forward during look-backs, and on the fall it drops and rolls.
- **Wendigo:** frames 1–40 play Stalked's Scream at its Stalked spot. After that it plays the in-place Run clip looped on the NLA, moved along the path at a set distance behind the hunter (~13 m, ~9 m, ~5 m at the three look-backs) and turned along the path, with the clip speed matched to its ground speed. Its red eyes are kept.
- **Cut to black:** a film-exposure key in the .blend at frame 561. The render stops at 560 and the encoder pads black frames to 600.
- **Sound:** a Python + numpy mixer (sources decoded by ffmpeg). Cue times come from the animation script (`cues.json`: footfalls, look-backs, the trip, impact, wendigo steps). Footsteps are sliced from the source and varied in pitch and level. The wendigo's steps get louder as it closes in. Breathing is synthesized from shaped, filtered noise in time with the run. Output is a 48 kHz stereo WAV, which is also loaded into the .blend's sequencer.

## Scene Specs
Blender 5.2.2 LTS; metric, 1 unit = 1 m; eye height 1.7 m; no polygon limit (instancing); Cycles GPU (OptiX) at 128 samples, adaptive threshold 0.03, OptiX denoiser; 1600 × 900; frames 1–600 at 24 fps (rendered 1–560, then black); motion blur shutter 0.5; AgX.

## Scripts
| Script | Purpose | Produces |
|---|---|---|
| `01_path_forest.py` | frame range, run path, bigger ground, forest extension, lane and sight lines, fog box | `escape_v001.blend`, `path.json` |
| `02_clutter.py` | roots (including the trip root), rocks, ferns, brush, their materials | `escape_v002.blend` |
| `03_atmosphere.py` | low drifting mist, drifting needles and dust | `escape_v003.blend` |
| `04_animation.py` | camera run, look-backs, trip and fall, flashlight hand, wendigo scream and chase, cut to black, `cues.json` | `escape_v004.blend` |
| `05_audio.py` | sound mix from `cues.json` (python + numpy + ffmpeg) | `audio/escape_mix.wav` |
| `06_render_settings.py` | final settings, the mix as a sequencer sound strip | `escape_v005.blend` |
| `07_render.py` | GPU frame renderer (from Stalked, with resume) | PNG frames |
| `08_encode.py` | frames + black padding + mix to MP4 (ffmpeg) | `final/escape.mp4` |
| `09_pack_final.py` | packed final .blend | `final/escape_final.blend` |

## Assets & Add-ons
No downloads or add-ons. Models and textures come from Stalked's packed .blend (the user's Game 2 models and CC0 Poly Haven / ambientCG textures). Sounds come from `Game 2\audio\`, which the user says are free for public use. Breathing is synthesized. Everything is logged in `assets.md`.

## Milestones
1. **M1 path and forest:** top-down map of the path, plus stills from the hunter's eye along it.
2. **M2 clutter and atmosphere:** stills from the path with clutter, mist and debris.
3. **M3 animation:** a low-res full-length preview (frames 1–600) with a draft sound track, plus full-quality stills of the look-backs and the fall.
4. **M4 sound:** the final mix laid on the M3 preview, with level checks.
5. **M5 final:** the full render, encode, checks, and delivery.

## Render / Export Plan
560 rendered frames at about 16–20 s each, so roughly 2.5–3 hours on the RTX 4070 (to be re-measured on M3). The render can resume (`--skip-existing`). The MP4 is H.264 (CRF 18) with AAC 192 kbps, 25.0 s, and is checked with ffprobe for duration, streams, and frame count.

## Decision Points
The user delegated decisions while asleep (2026-11-18): each milestone is reviewed by the agent against this plan, logged in `decisions.md` as an agent decision, and left open for the user to revisit.

## Risks & Limitations
- The wendigo's Run clip may slide its feet against the ground. This is mitigated by matching the clip speed, by the darkness, and by motion blur.
- Glimpse-only lighting could make the wendigo too dark to read. The red eyes and the backlit fog are the fallback, and the moon direction is kept behind it.
- A larger scene could slow the render down. Instancing and the fog density are the levers.
- The sound is judged by levels and timing, not by listening; the user should listen and give notes.
- The model licences (wendigo and spruce): confirmed free to use by the user on 2026-11-18.

## Open Questions
None.

**Status:** Approved on 2026-11-18 under the user's delegation ("make any decisions you see fit", user asleep). The user can revise it on review.
