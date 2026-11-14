# Progress: Creation Redesign

- **Current phase:** Phase 5 (final delivery)
- **Status:** complete; committed locally (decision #28); waiting for any revision requests

## Completed milestones
- 2026-11-14: Project root confirmed (this worktree); no earlier design-agent projects.
- 2026-11-14: Phase 1 setup interview complete and summary confirmed; slug `creation-redesign` (decisions #1–#9).
- 2026-11-14: Phase 2: `designAgent.md` approved.
- 2026-11-14: Phase 3: `plan.md` approved (D1 Figma, D2 Google Fonts; decisions #10-#12).
- 2026-11-14: M1 built:
  - `source/creation-of-adam.webp` (copy of the user's image, tracing source only).
  - `tools/trace_figure.py` -> `data/god-nodes.json` (110 KB): 480 key-stroke nodes (hand-traced finger, hand, arm, face, beard, mantle shell), 1688 traced outline nodes, 3652 tone nodes, 1612 links.
  - `directions/figure-study/index.html`: look, parts, view (whole/hand/head), lines, tone density. Shots in `directions/figure-study/shots/`.
  - Preview: `creation-prototypes` in `.claude/launch.json` (python http.server on 4400, project root) -> http://localhost:4400/output/creation-redesign/directions/figure-study/
- 2026-11-14: M1 revision 2: God + mantle only (decision #13). Face retraced on a 6x grid, hand on an 8x grid (step 3.5 px); face box drawn only by strokes. Data: 619 stroke + 1029 outline + 2652 tone nodes, 1310 links, 82 KB.
- 2026-11-14: M1 reviewed: user rejected nodes (can't show fine detail). New direction: particles rebuild the painting, rolling into place as the cursor nears God's fingertip (decisions #14-#18). `designAgent.md` amended; Amendment 1 appended to `plan.md`. The node study stays as a record. The M1 outlines (`GOD`, `GROUP`, `INNER` in `tools/trace_figure.py`) are reused as the particle mask.

- 2026-11-14: Amendment 1 approved; D3: downloaded the Commons original (2,163,447 bytes, 3524 x 1599 JPEG) to git-ignored `art-src/creation-of-adam-3524.jpg` (decision #19).
- 2026-11-14: M1b built (not yet approved):
  - `tools/make_particle_source.py` (run with `python -I`): plaster keyed out by flood from outside (cracks kept); writes `data/god-mantle.webp` (363 KB; internal cuts fade over 36 px) and `data/whole-group.webp` (618 KB; Michelangelo's own edges), plus `data/particles.json` (crop 2185 x 1357, fingertip [2, 676], handX 570).
  - `directions/particle-study/index.html`: raw WebGL2 points, one per pixel (stride 2; stride 1 on hand/forearm). Cursor distance to the fingertip drives progress; particles land in a wave from the far side to the fingertip; 1 in 10 waits as a dim star, the rest set off from near home; in flight they are shaded rolling balls, landed they are square pixels. Controls: image, density, ground, view, roll back, preview slider; URL params `?img=&density=&bg=&view=&p=`.
  - Measured (Playwright Chromium on the RTX 4070 laptop GPU, 1440 x 900): god-mantle 384,556 particles, whole group 586,322, both 140-144 fps (display cap). Phones not measured yet.
  - Shots: `directions/particle-study/shots/`. Seen: the whole group reads as the painting; God + mantle soft cuts dissolve but leave dark wedges; at 2x zoom the stride-2 areas show pixel blocks (hand is stride 1).
  - Review shots via `scratchpad/pshots.cjs` (Playwright from the main checkout's node_modules, `channel: 'chromium'` + `--use-angle=d3d11` for the real GPU). The browser pane was hidden, which pauses requestAnimationFrame.

- 2026-11-14: M1b round 2 (decision #20, camera): round 1 kept as `directions/particle-study/v1-fixed-camera.html`. `index.html` now:
  - Camera path (crop px): face (690,315) -> shoulder (560,545) -> elbow (390,600) -> wrist (215,650) -> fingertip (2,676). Zoomed in at 2 px per source px; the landing front sits at the screen centre (camera c = (p - .12) / .8).
  - Particles land in path order (delay = .8 x position along the path); every pixel within 230 px of the path is a particle (stride 1), elsewhere stride 2. Whole group: 693,513 particles, 144 fps.
  - The cursor's goal is a ring at the screen centre; the fingertip arrives there at 100%. Touching it reveals: the camera eases out (~2 s) to the whole painting on the right 62% of the screen; a project card (Falling Constellations, from `src/content/projects/`) appears on the left where Adam's hand would be. Once revealed it stays built; "Start again" resets.
  - Default image in the study switched to the whole group for comparison (the choice is still the user's).
  - Tested with a real Playwright cursor journey (corner -> centre): face at 36%, forearm at 69%, fingertip at 91-99%, reveal fires. Shots `shots/r2-*.png`.
  - Seen: mask edges show 2x staircase when zoomed (antialias edges in M3); the starfield is gone once everything has landed.

- 2026-11-14: Decision #21, computer only: `designAgent.md` and `plan.md` (Amendment 2, approved by the user's instruction) updated; M4 is now keyboard + reduced motion only. The study shows a "This site needs a computer" notice on `(hover: none), (pointer: coarse)` devices and does not start the scene there. Tested: emulated iPhone 13 and iPad show the notice (scene not started); desktop 1440 x 900 runs normally. Notice contrast: 13.90:1 heading, 10.11:1 body. Shot: `shots/notice-iphone.png`.

- 2026-11-14: M1b approved, whole group (#22); scroll steps the 7 projects after the reveal (#23).
- 2026-11-14: M2 built (waiting for the user's choice):
  - `data/projects.json` (7 projects from `src/content/projects/`, featured first, then `order`).
  - `directions/shared/creation.js` (engine: whole group, camera follows the arm, reveal, reduced motion = built at load, `revealNow()` for the skip link; look = { glow, twinkle }), `shared/page.js` (name/nav, ring + caption, 7 snap-scrolling project stops rendered from JSON, spark on the touch and on each new stop, skip link and nav "Projects" reveal + focus the first project, no-WebGL still image, computer-only guard), `shared/base.css`.
  - `directions/a-night-sky/index.html`: ink / gesso / gold; Instrument Serif + Geist + Geist Mono; glowing particles, twinkling stars.
  - `directions/b-fresco-plaster/index.html`: gesso + SVG plaster grain / ink / vermilion, ultramarine focus; Marcellus + Alegreya + Alegreya Sans; matte pigment-dust particles.
  - Tests (Playwright, real GPU, 1440 x 900), both: cursor journey reveals; 2 wheel steps land on project 3; first Tab = "Skip to the projects", Enter focuses Falling Constellations; reduced motion = revealed at load; no console errors besides a missing favicon. Fixed on the way: density seam (per 2x2 cell), header fade for nav readability, ring kept until the touch, spark on the touch.
  - Contrast: all 12 pairs pass (`directions/shots/` and the Figma notes); tightest B vermilion count 4.83:1.
  - Figma boards: see `figma-links.md` (file vCWy3ZX4mS71JsxF4C9c5z). Shots: `directions/shots/{a,b}-1..8-*.png`; scene renders `final/figma-scenes/`.

- 2026-11-14: Direction A chosen (decision #24). M3 round 1 in `iterations/round-1/` (index.html + shared/ copies):
  - Painting layer: a mipmapped, premultiplied texture quad shows the painting wherever particles have landed (same landing schedule in GLSL); landed particles vanish (point size 0). Up close the painting is smooth instead of 2x2 blocks.
  - `data/whole-group-aa.webp` (new; `tools/make_particle_source.py`): anti-aliased mask edge (blur + smoothstep, ~1.5 px) with edge colours bled from inside, so no plaster fringe. M2 keeps `whole-group.webp`.
  - Spark: WebGL burst of 140 gold particles from the fingertip (additive, screen-space, 0.9 s, reach 24-110 px) on the touch and on each project step; the CSS radial-gradient spark is gone. The ring thickens and tightens as the cursor nears (`--near`).
  - The card fades in at reveal > .75 (was .55) so the arm no longer sweeps across it.
  - Type options via `?type=1..4`: 1 Instrument Serif/Geist/Geist Mono (current), 2 Gloock/Newsreader/IBM Plex Mono, 3 Bodoni Moda/Hanken Grotesk/Martian Mono, 4 Cinzel/Spectral/Spline Sans Mono. All load.
  - Tests: journey reveals; 2 wheel steps -> project 3; Tab -> skip link -> Enter focuses Falling Constellations; reduced motion revealed at load; no console errors. Frame rate equal to M2 (61 fps in the same headless measurement). Colours unchanged, so contrast as in M2.
  - Shots: `iterations/round-1/shots/` (r1-edges-before-after.png, r1-7-step-spark.png, r1-type-options.png, r1-type-1..4.png).

- 2026-11-14: Type: Atlas (decision #25). M3 round 2 in `iterations/round-2/`: round 1's shared files unchanged; index loads only Gloock / Newsreader / IBM Plex Mono (no type switch). Name 2rem, tagline 1rem, card line 1.1875rem. Tests: journey reveals; 2 wheel steps -> project 3; Tab/Enter -> Falling Constellations; reduced motion revealed at load; all three fonts load; no console errors. Shots: `iterations/round-2/shots/`.

- 2026-11-14: Round 2 approved as final (decision #26).
- 2026-11-14: M4 checks on `final/prototype/` (copy of round 2): axe 0 violations before and after the reveal (after making `main` always present: the stops are in `.stops`); keyboard order skip -> nav -> project links with a 2 px ochre focus ring; reduced motion revealed at load; 200% / 400% zoom fixed with a reading layout (<= 900 px wide or <= 560 px tall) and the narrow camera framing in `creation.js` (decision #27). Desktop journey re-tested: reveal, scroll to project 3, keyboard skip all pass.
- 2026-11-14: M5: final Figma section (node 4:72, page renamed "Creation redesign") with scene renders from the final prototype (`final/figma-scenes/scene-final-*`); F5's first upload included the HTML card, re-rendered with `.stops` hidden and re-uploaded. `design-spec.md` written. Final shots in `final/shots/`.

## Next step
Ask the user for revisions. Repository is local only (#28); commit further work on this branch with no AI markers, never push. Optional follow-ups: port the final design into the Astro site (program agent, `src/` changes need approval); arrival-hint idea; redesign the other pages.

## Open questions
- Repository: local only (decision #28), branch `claude/website-design-overhaul-45e304`; no push.

**Last updated:** 2026-11-14
