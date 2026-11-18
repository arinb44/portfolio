# Progress: Project Visuals

- **Current phase:** Phase 4, M4c: Nightfall in the site; Hearth waits on its recording
- **Status:** waiting for user (Hearth recording)

## Completed milestones
- 2026-11-15: Project root confirmed (`C:\Users\arins\Arin\School\Projects\Portfolio`); new project chosen over resuming `fresco-intro` or `creation-redesign` (decisions #1, #2).
- 2026-11-15: Phase 1 setup interview done and the summary confirmed; slug `project-visuals` (decisions #3–#11).
  - NBA Game Predictor first: a 6–10 s fresco-style loop from an NBA broadcast clip, made by a local renderer. The other six projects come after.
  - The user publishes the broadcast footage at their own risk (#6).
- 2026-11-15: Phase 2: `designAgent.md` approved (decision #12). Figma checked: connected (student team).
- 2026-11-15: Phase 3: `plan.md` approved (decision #13).
- 2026-11-16: M0 built (waiting for the user's choices):
  - Clip: `art-src/Luka Doncic UNFORGETTABLE 4K ... 2026.mp4` (user's file, untouched), copied to `art-src/project-visuals/nba-reference.mp4`.
    - 1280 x 720, 60 fps, 9.03 s, H.264, with an AAC track (dropped).
    - It is 24 fps footage in a 3:2 pulldown: frames 0 and 3 of every 5 are the real ones.
    - True 24 fps master: `art-src/project-visuals/nba-24.mp4` (217 frames, 0 duplicates, checked with `tools/dupes.py`).
  - Content: a courtside highlight montage (Lakers v Kings, Doncic #77). No broadcast overlays (no score bug, logo or ticker); in-arena ads (Pechanga stanchion, Tissot, Toyota) and the shot clock are in the scene.
    - Shots: crossover 0–1.5 s; blurred foreground pass + transition 1.5–1.9; baseline drive and stumble to 4.83; low dribble and step-back gather to 6.54 (cut at frame 157); the jumper and the ball's flight 6.58–7.4; the hoop and the make to 8.42 (cut at frame 202); whip-pan to the cheering bench to 9.04. Transitions have ghosted, blended frames.
  - Flash check on the source (WCAG 2.3.1, general flash): at most 1 flash in any second (at 8.55 s, the whip-pan). Red flash not checked.
  - Candidates, each restarting on a cut: A whole clip 0–9.04 s (217 frames); B to the make 0–8.42 s (202); C handles only 0–6.54 s (157). Trims in `art-src/project-visuals/m0/seg-*.mp4` (git-ignored).
  - Preview: `directions/m0/index.html` (http://localhost:4410/output/project-visuals/directions/m0/; launch entry `fresco-prototypes`). The three loops behind the NBA card with the home page's gradients; "Reframe right" (x1.36 from the left edge); "See the loop seam".
  - `directions/m0/contact-sheet.png`, `framing.png` (1440 x 900, full vs reframed at 0.6 / 3.9 / 5.6 / 7.6 s), `report.json`, `zoom-*.png`. Tools: `tools/m0_probe.py`, `tools/m0_framing.py`, `tools/dupes.py`.
  - Seen: without reframing, Luka sits under the card in the crossover, stumble and low-dribble shots. Reframed x1.36 he moves to the clear right half, at the cost of a 1.7x upscale at 1440 px (2.0x at 1920).

- 2026-11-16: M0 choices: segment B, reframe x1.36, let the paint soften the arena branding (decisions #14-#16).
- 2026-11-16: M1 built (waiting for the user's choice):
  - `tools/render.py`: one pass paints all three directions from frames 0-201 of `nba-24.mp4`.
    - The pipeline: reframe (crop 941 x 529 at 0,95, scaled to 1600 x 900, light hqdn3d denoise) -> Kuwahara r=6 (mirrored edges) -> motion-adaptive temporal smoothing (weight .6 x exp(-(dL/.05)^2)) -> the direction -> the plaster grain.
    - Plaster: the fresco's bare wall at full-res x 710-1690, y 20-571, as a ratio over its own 40 px blur; the oval mark at ~(1300, 320) is patched with plaster from 70 px above.
    - Tone ramp: the fresco's median colour per brightness, with the red-mantle darks pulled toward neutral.
    - `still <frame>` paints one frame for testing.
  - The directions:
    - A Buon fresco: the fresco ramp, the frame's hue at 55%, sfumato blur 1, faint umber XDoG contours.
    - B Sinopia: red-ochre (#8A3B28) XDoG lines, fewer in the dark crowd, over warm plaster with thin washes.
    - C Grisaille: ink -> stone -> gesso ramp with gold in the top highlights, S-curve and large-scale modelling, a blurred crowd, faint contours.
  - Files: `directions/<a-buon-fresco|b-sinopia|c-grisaille>/nba.{webm,mp4}` + `still.png` (frame 150); `directions/index.html` (preview, http://localhost:4410/output/project-visuals/directions/); `sheet-m1.png` (6 moments x 3); `stats.json`, `contrast.json`, `<dir>/probe/` (contact sheet + flash report). Tool `tools/contrast.py` (text boxes measured on the live home page at 1280 / 1440 / 1920; NBA card is 03 / 07).
  - Checks (1600 x 900, 24 fps, 202 frames, 8.42 s; all three play in the preview, no console errors):
    - WebM / MP4 size: A 4,252 / 7,361 KB; B 9,398 / 10,339 KB; C 6,505 / 8,518 KB. All over the 1-3 MB target.
    - Flicker ratio (2nd temporal difference vs the source): A 0.95, B 0.79, C 1.53 (C adds shimmer).
    - Flashes, max per second: A 2, B 1, C 3 (at the WCAG 2.3.1 limit).
    - Card text passes in every frame at all three sizes. The lowest is the gold count (4.71-4.85 at 1280 / 1440, 5.9 at 1920); the title is >= 11; the line, meta and links are >= 6.8.
    - The header name (>= 11.46) and tagline (>= 7.68) pass.
    - **The header nav (stone-200, 14 px, top right) FAILS** at 1.8-3.1:1 against 4.5. It fails in A in 10-30 of 202 frames, in C in 33-72, and in B in every frame (pale ground).
    - **Correction (2026-11-16, M2):** these nav figures left out the header's own gradient (`.site`: 88% ink fading over 142.4 px). With it, A's nav is 4.19:1 at 1280 x 800 (fails in 6 of 202 frames), 4.54 at 1440 and 4.62 at 1920 (pass). B and C were not re-measured.
  - Seen: A reads most like the ceiling. B goes nearly blank in the dark ball-flight shot. C's glossy floor blows out to cream. The Pechanga "P" and its name, and the shot clock digits, still read in all three (decision #16 says to revisit).
- 2026-11-16: M1 choices: A · Buon fresco (#17); soften the stanchion logo and shot clock (#18); Figma in a new file in the user's team (#19).
- 2026-11-16: Figma record of M1: file "Project visuals" (https://www.figma.com/design/LjRLiaTQO2MT2R3EPU34kP), section 2:32. Three frames with painted frame 150 as the backdrop, the gradients as fills, and the header and card as editable component instances; "Night Sky" colour variables. Read-back: 97 nodes, 52 text, 6 instances, fonts Gloock / Newsreader / IBM Plex Mono only, 3 image fills (the backdrops). Shots for review: `directions/shots/m1-*.png` (Playwright; the video is swapped for the exact frame, since headless Chromium doesn't repaint a paused video after a seek).

- 2026-11-16: M2 round 1 built in `iterations/round-1/` (preview: http://localhost:4410/output/project-visuals/iterations/round-1/):
  - `tools/render_m1.py` keeps M1's three-way renderer as it ran. `tools/render.py` is now A only: `render.py <round dir> [still <f>,<f>]`.
  - Colour (user: "give it a little color", #20): the footage's own hue at 95% (was 55%), ramp saturation x1.3.
  - Logos (#18): keyframed boxes on four tracks (arena stanchion f45-83, ±100 px column; shot clock + Tissot f172-183; Toyota f177-183; hoop stanchion f185-201), blurred into plain paint (sigma 9 / 30 / 14 / 16, no detail kept except .1 on the hoop stanchion), 25 px feather. Lettering no longer reads anywhere. The big arena-stanchion "P" is still recognisable as a soft P-shaped blob at f64-76: raise sigma to 14 in round 2.
  - Top shade: highlights compressed in the top band (soft clip at .42 luma, full to y 90, gone by 240).
  - Grain both ways: `nba.{webm,mp4}` baked; `nba-nograin.{webm,mp4}` + `plaster.webp` (min(grain, 1), mix-blend-mode: multiply).
  - Posters `poster-70.webp` (70 KB) and `poster-150.webp` (78 KB).
  - Preview: the real header and card styles; the pause control as a corner pill or an in-card text button; reduced motion shows the poster; the review bar switches grain, control, poster, reduced motion and the loop seam (URL params for shots).
  - Checks:
    - Size: baked WebM 4,130 KB / MP4 7,360 KB; overlay WebM 2,764 KB + plaster 106 KB (MP4 5,126 KB).
    - Flicker 0.89x the source. Flashes: max 1 per second.
    - Contrast (`tools/contrast.py`, now with the header gradient), all pass at 1280 / 1440 / 1920 for both versions: nav >= 7.73, card count >= 4.83, meta >= 7.03, title, line and links higher.
    - Pause control: corner pill gesso on ink 13.9:1; in-card stone-200 >= 7.03 (same zone as the meta); both >= 24 px tall, ochre focus ring. The control was changed to a changing label (Pause / Play the background video) with no aria-pressed.
    - Tab order (corner version): Projects, About, CV, Email, Pause, View project, Live demo, Code. No console errors.
    - Shots: `iterations/round-1/shots/` (baked-corner, overlay-incard, reduced-motion, poster-70), `sheet-r1.png`.

- 2026-11-16: Round 1 choices: overlay grain (#21), corner pause pill (#22), poster frame 150 (#23), "a bit more" colour (#24).
- 2026-11-16: M2 round 2 built in `iterations/round-2/` (preview: http://localhost:4410/output/project-visuals/iterations/round-2/):
  - Colour: footage hue 1.1, ramp saturation x1.45. Arena-stanchion blur sigma 9 -> 14 (the "P" no longer reads as a letter). Posters: frame 150 only.
  - Page: the chosen options only. `nba-nograin.{webm,mp4}` + `plaster.webp` (multiply) + `poster-150.webp`; corner pause pill; under reduced motion: the poster, no video, no plaster, no control. The pause label follows the video's real state (play / pause events).
  - Checks:
    - Delivered size: WebM 2,817 KB + plaster 106 KB = 2.9 MB (MP4 fallback 5,293 KB); poster 82 KB.
    - Flicker 0.88x the source; flashes max 1 per second.
    - Contrast, all pass at 1280 / 1440 / 1920. Grain-free video (the delivered overlay version is only darker): nav >= 8.05, card count >= 4.94, meta >= 7.24. Baked video (poster frame): nav >= 7.45, card count >= 4.83.
    - Pause control (Playwright, real input): mouse click, Space and Enter each toggle it; the label matches. Tab order: Projects, About, CV, Email, Pause, View project, Live demo, Code. Reduced motion (system setting): the poster, video paused, control hidden. Ochre focus ring visible. No console errors.
    - In the hidden browser pane Chromium suspends background media, so play() there looked like it failed; it works in a visible page.
  - Shots: `iterations/round-2/shots/` (round-2-f150, reduced-motion, pause-focus).

- 2026-11-16: NBA loop approved (#25). M3:
  - `final/`: `loop.webm` (2,885 KB, = round 2's grain-free WebM), `loop.mp4` (2,764 KB, re-encoded at CRF 28 from the round-2 MP4, 36-37 dB from the WebM), `plaster.webp` (109 KB), `poster.webp` (83 KB), `index.html`, `shots/`.
  - Figma: page "Final · NBA loop" (3:71) with the frame (3:77), notes and the "Pause control" component (3:72).
  - Decisions #26-#29: the site change as proposed (home page only, `varnish.png` untouched); repository origin `arinb44/portfolio`; branch `project-visuals` from `fresco-intro` (created at 09732e8).
  - Site: files in `public/projects/nba-predictor/`. `src/pages/index.astro` adds a `.loop` (video + plaster) for projects whose `public/projects/<slug>/loop.webm` exists, plus the `.pause-loop` button. `src/scripts/home.js` plays the loop of the project on screen unless the visitor paused it or reduced motion / the reading layout applies, and shows the pill with it. `src/styles/creation.css` styles the loop, the plaster (only after the video has played) and the pill. `tests/e2e/home.spec.ts` has 2 new tests (the loop plays and pauses with axe clean; reduced motion keeps the poster).
  - `npm test`: astro check 0 errors / 0 warnings / 0 hints, build OK, unit 12/12, Playwright 43/43.
  - Live dev site (Playwright, 1440 x 900): the loop plays at the NBA stop at 141.6 fps (display cap 144, 1 dropped of 64 frames); before the stop only the poster (83 KB) and plaster (109 KB) load, and the WebM (2.9 MB) loads on arrival. No console errors. Shot: `final/shots/live-site-1440.png`.
  - `design-spec.md` written (the NBA loop; M4 pending).

- 2026-11-16: **Committed** on `project-visuals` as `46a2bd2` (#30; message checked, no AI markers). `.gitignore` now keeps the rebuildable renders, frame dumps, analysis contact sheets and unpainted M0 stills out of git.

- 2026-11-16: **Pushed** `project-visuals` to origin (https://github.com/arinb44/portfolio, new branch, tracking `origin/project-visuals`; #31). No pull request opened.

- 2026-11-16: M4 started. References chosen (#32-#35): NFL and MLB game clips from the user; Falling Constellations recorded by the agent from its public page; Hearth recorded by the user; Nightfall as a painted still from a user-supplied frame; Juno skipped for now. Plan Amendment 1 written (not yet approved).

- 2026-11-17: Resumed from `output/handoff/handoff-2026-11-17-0001.md` (#36). **Plan Amendment 1 approved** (#37).
- 2026-11-17: M4a round 1 built in `iterations/m4-1-round-1/` (preview: http://localhost:4410/output/project-visuals/iterations/m4-1-round-1/; waiting for the user's review):
  - Recording: `tools/fc_record.cjs` (Playwright, Chromium on the RTX 4070 via D3D11, 1600 x 900, 24.8 s, 621 frames at 25 fps; five clicks on the right summon constellations; the hint text and cursor hidden) -> `art-src/project-visuals/fc/fc-raw.webm`. One console 404 on the page (not looked into; the piece renders).
  - Master `art-src/project-visuals/fc-24.mp4`: recording frames 175-438 played at 24 fps (4% slower, no dropped frames), 240 frames = 10 s, the first second cross-faded from the 24 frames after the end so the loop has no jump.
  - `tools/render.py` now takes `<round dir> [<project>] [still ...]` with a `PROJECTS` table (source, frames, crop, logos, posters). NBA frame 150 re-rendered before and after: identical file (md5 e799caa8...).
  - FC settings: crop 1176 x 662 at 0,119 (x1.36 from the left, the galaxy right of the card); `soften` 2.5 (blur before the paint patches; the star field otherwise painted as square tiles); `stars` 2.2 (thin bright detail, i.e. stars and constellation lines, laid back over the paint in #E8D8B4, the page's own text colour; without it the patches erased them). No logos. Poster frame 120.
  - The look: the fresco ramp plus the page's own blue gives a dark violet-umber vault with gilded stars. A cooler/bluer sky is the user's call (plan decision point).
  - Checks:
    - Size: `fc-nograin.webm` 1,958 KB + `plaster.webp` 83 KB (MP4 3,274 KB, not yet re-encoded at CRF 28); poster 108 KB.
    - Flicker 0.7x the source; flashes 0 per second; no cuts. Seam step 1.43 against a 0.87 median and 1.43 maximum frame step.
    - Contrast over every frame at 1280 / 1440 / 1920, boxes measured on the preview with `tools/boxes.cjs` (`contrast.py --boxes`): all pass, grain-free and baked. Lowest: nav Email 5.66 (1440), card count 6.37, meta 8.54.
    - The preview plays in the browser pane, no console errors. Pause control and reduced motion are the round-2 code unchanged (not re-tested here).
  - Not done yet: Figma frame, the MP4 at CRF 28, shots at each breakpoint.

- 2026-11-17: **M4a approved** (#38). Into the site (#39, #40):
  - `final/falling-constellations/`: `loop.webm` (2,005 KB), `loop.mp4` (1,700 KB, CRF 28), `poster.webp` (108 KB); copied to `public/projects/falling-constellations/`.
  - Shared plaster: `public/projects/nba-predictor/plaster.webp` moved to `public/projects/plaster.webp`; `creation.css` points at it; the per-loop `--plaster` style is gone from `index.astro`.
  - Poster as home image: `index.astro` renders `/projects/<slug>/poster.webp` instead of the placeholder for projects with a loop.
  - `tests/e2e/home.spec.ts`: the NBA test no longer assumes the first project has no loop; one new test for the first stop.
  - `npm test`: Playwright 44/44 passed.
  - Figma: frame 4:98 and notes 4:132 on "Final · NBA loop" (the WebP upload rendered blank, so the backdrop is the PNG poster). Screenshot checked; fonts Gloock / Newsreader / IBM Plex Mono only.
  - `design-spec.md` and `figma-links.md` updated.

- 2026-11-17: **Committed and pushed** as `e72ee73` on `project-visuals` to origin (#41; message checked, no AI markers).

- 2026-11-17: **M4b started**: the user added the NFL and MLB clips to `art-src/` (originals untouched; copies `art-src/project-visuals/{nfl,mlb}/{nfl,mlb}-reference.mp4`).
  - NFL: `[Highlight] David Montgomery absorbs contact, trucks defender and takes off for 40 yards.mp4`, 1280 x 720, true 29.97 fps (no pulldown, 0 duplicate frames), 18.05 s, one continuous high camera, no cuts, flashes max 1 per second.
    - From ~2.3 s the broadcast squeezes the picture into a box: clean picture x 68-1212, y 4-588; ESPN MNF score bar y 590-635 and a two-row ticker y 648-720 below it. Inside the picture: a score box (x 98-297, y 26-78) and an "ESPN on abc" mark (x 1058-1218, y 20-70).
    - Action: sideline start 4-6 s; contact pile at the 40 6.3-9; break across the Lions field logo to the 50 9-12; open field to the 30 12-15; into the sideline bench and crowd 15-18.
  - MLB: `Shohei Ohtani's 3-homer + 10-strikeout game! ...mp4`, 1280 x 720, true 59.94 fps (no pulldown; 25 held frames from the source), 12.06 s, flashes max 1 per second.
    - Shots: close-up stance 0-1.2 s (dissolve f72-80); center-field camera, pitch and swing 1.35-5.42; ball flight into the night toward the scoreboard 5.42-10.39; Ohtani rounding the bases 10.39-12.06.
    - Graphics: score bug top left (x 30-243, y 18-130) from 1.35 s; ads everywhere (Booking.com, NLCS / loanDepot, postseason rail, HBO Max and LA on the mound; Syncron / Kou / Starlux in the close-up; the scoreboard, 76, Coca-Cola, TEL, UCLA Health, Starlux, "HOME RUN MAGIC" ribbon in the flight shot).
  - Review page `iterations/m4-2-m0/index.html` (http://localhost:4410/output/project-visuals/iterations/m4-2-m0/): three segments each behind their real cards; buttons "Reframe right" (x1.36), "0.8x speed" and "See the loop seam". Trims in `art-src/project-visuals/{nfl,mlb}/m0/seg-{a,b,c}-{real,slow}.mp4` (git-ignored). All six play, no console errors.
    - NFL (cropped 1038 x 584 at 121,4: above the score bar): A 4.20-12.20 s through the contact; B 6.50-14.50 contact to open field; C 10.00-18.03 the run to the sideline.
    - MLB (full frame): A 1.35-9.35 pitch, swing, flight; B 5.43-12.06 flight and trot (restarts on a cut); C 0.00-8.00 stance to swing.
    - Speed: real speed (frames dropped to 24 fps; 8.0 s, MLB B 6.6 s) or 0.8x (every real frame kept; 10.0 s, MLB B 8.3 s).
  - Framing sheets `iterations/m4-2-m0/{nfl,mlb}/framing*.png` (`tools/m0_framing.py` now takes a clip, an output and moments; its NBA output is unchanged, checked with cmp). Seen: NFL at x1.36 sits clear of the card (1.9x upscale at 1440); MLB at x1.36 puts Ohtani at ~53% of the width, still in the gradient's fade, the pitcher at ~48%.
  - The NFL loop has no cut to restart on (one continuous shot), so its restart is a jump; a cross-fade would ghost the moving camera.

- 2026-11-17: M4b choices: NFL segment B (#42), MLB segment A (#43), 0.8x speed (#44), reframe x1.36 (#45). Then the user asked to "include the initial big contact": the NFL segment is now source 4.55-14.50 s (#46): the hit at the 30 by the sideline (4.97-5.5 s) through the open field to the 30; 298 frames, 12.4 s, over the 6-10 s target (accepted).
- 2026-11-17: M4b round 1 in progress (`iterations/m4-2-round-1/`):
  - Masters `art-src/project-visuals/nfl-24.mp4` (298 frames, 0 duplicates) and `mlb-24.mp4` (240 frames; 7 near-duplicates are the source's own still frames in the night-sky shot, checked against the 60 fps source).
  - `tools/render.py`: `PROJECTS['nfl']` (crop 763 x 429 at 121, 82: x1.36 of the picture above the score bar; the score box and ESPN mark fall outside it) and `PROJECTS['mlb']` (crop 941 x 529 at 0, 95). NBA frame 150 still identical (md5 e799caa8...).
  - New `tools/track_zoom.py`: estimates a shot's zoom and pan frame to frame (scale search + phase correlation) so a logo box measured once follows the camera. Tracks: `tools/nfl-open.json` (NFL frames 0-100), `tools/mlb-pitch.json` (0-121), `tools/mlb-flight.json` (122-239, the camera zooms ~4x). Checked by drawing the moved boxes on frames across each shot.
  - `render.py`: `follow()` turns a box + track into a logo track (blur grows with the zoom; boxes padded 40 px, since the 25 px feather left the middle of small boxes only half blurred and "Booking.com" still read).
  - Flattened: NFL the "INTERCEPT CANCER" sideline stencil; MLB the score bug, Booking.com, the NLCS / loanDepot board and rail, the 76 ball, Michelob Ultra, Security Benefit, Coca-Cola, the lower sign row (to STARLUX, TEL), the NLCS emblem, both YAAMAVA panels and the LED ribbon (HOME RUN!, Coca-Cola). Kept: the line score and "312" (the game's score), the Lions field logo and yard numbers (field markings, as the NBA court), jersey names and numbers.
  - Review pages `iterations/m4-2-round-1/nfl.html` and `mlb.html` (the FC round page with each card).
  - Built (waiting for the user's review): `nfl{,-nograin}.{webm,mp4}`, `mlb{,-nograin}.{webm,mp4}`, `plaster.webp`, posters `poster-25 / 230` (NFL) and `poster-70 / 200` (MLB) as PNG + WebP, `posters.png` (the four side by side). Preview: http://localhost:4410/output/project-visuals/iterations/m4-2-round-1/nfl.html and `/mlb.html`.
  - Checks:
    - Size (grain-free WebM + plaster 83 KB): NFL 3,013 KB (12.4 s; MP4 5,278 KB before the CRF 28 re-encode), MLB 1,892 KB (MP4 3,029 KB).
    - Flicker vs the source: NFL 0.68x, MLB 0.51x. Flashes: NFL 0 per second, MLB max 1.
    - Contrast over every frame at 1280 / 1440 / 1920, boxes measured on each page: all pass, grain-free and baked. Lowest is the gold card count: NFL 4.66, MLB 4.55 (needs 4.5; MLB has little headroom).
    - Seam: NFL restarts with a visible jump (step 24 vs median 8.6, max 15; one continuous shot); MLB restarts on what reads as a cut (65, like its own cut at 71).
    - Both pages load their loops with no console errors; the hidden browser pane suspends video, so playback was not watched there.

- 2026-11-17: NFL round 1 feedback (#47): the runner should be the focal point; he was off screen for about half the loop (in the pile on the right of the broadcast picture, outside the fixed window).
- 2026-11-17: NFL round 2 in `iterations/m4-2-round-2/` (preview: http://localhost:4410/output/project-visuals/iterations/m4-2-round-2/nfl.html):
  - The runner's path (`tools/nfl-runner.json`, read by eye: #5 the ball carrier; the pile around him in frames ~60-216; #9 crossing the Lions logo on the left is a receiver, not the runner).
  - New `tools/reframe.py`: a 763 x 429 window (x1.36) that keeps the runner at 66% of the width and 55% of the height, smoothed (Gaussian, 8 frames), inside the picture above the score bar; pan median 3 px, max 11 px per frame. Writes `art-src/project-visuals/nfl-24-framed.mp4` and the window per frame (`tools/nfl-window.json`). Checked by drawing the window on frames every 24.
  - `render.py`: NFL reads the framed master; the sideline stencil box is keyframed by hand (track_zoom.py lost the combined pan on bare grass; that track file was deleted). Painted stills checked: no lettering, the runner right of the card throughout.
  - Checks: WebM 3,550 KB (over the 3 MB target; the pan adds motion), MP4 5,970 KB before CRF 28; flicker 0.67x; flashes 0; contrast all pass at 1280 / 1440 / 1920 (lowest gold card count 4.57); restart still a jump (24 vs median 8.9). Plays in the browser pane, no errors.

- 2026-11-17: **NFL round 2 approved** (#48).

- 2026-11-17: **MLB round 1 approved** (#49); posters NFL frame 25, MLB frame 70 (#50). Into the site (#51):
  - `final/nfl-predictor/` and `final/mlb-predictor/`: `loop.webm` (3,636 / 1,937 KB), `loop.mp4` (CRF 28: 3,363 / 1,702 KB; ~42.7 dB from the WebM), `poster.webp` (106 / 110 KB); copied to `public/projects/{nfl,mlb}-predictor/`. No `src/` changes (the existing loop convention, shared plaster and poster-as-home-image).
  - `tests/e2e/home.spec.ts`: the NBA test's two "no loop here" checks use Hearth instead of NFL / MLB.
  - `npm test`: Playwright 44/44 passed. Live dev site (the already-running server on :4321): both stops play their loops, the pause pill shows, the posters are the home images, no console errors.
  - Figma: frames 5:125 (NFL) and 5:164 (MLB) with notes on "Final · NBA loop"; fonts Gloock / Newsreader / IBM Plex Mono only. `design-spec.md` and `figma-links.md` updated.

- 2026-11-17: **Committed and pushed** the NFL and MLB loops on `project-visuals` to origin (#52; message checked, no AI markers). `.gitignore` now also keeps test stills, contact sheets, the M4b footage sheets and the poster review sheet out.

- 2026-11-17: **Nightfall source arrived** from the separate Blender project `output/nightfall-stalked/` (see its `summary.md`): `art-src/project-visuals/nightfall/stalked.mp4` (+ PNG frames), a rendered 10 s seamless loop, 1600 x 900, 24 fps, 240 frames, 2.4 MB: a first-person flashlight search through a foggy night forest, a wendigo half-seen at the edge of the beam. Plan Amendment 1 and #35 expected a painted *still* from a gameplay frame, so whether this becomes a loop (or a still from it) is the user's call. Its own notes: licences of the wendigo and spruce models unconfirmed; the image is dark by design.

- 2026-11-17: Nightfall becomes a painted loop (#53). Round 1 in `iterations/m4-3-round-1/` (preview: http://localhost:4410/output/project-visuals/iterations/m4-3-round-1/nightfall.html; waiting for the user's review):
  - Source read (`iterations/m4-3-m0/nightfall/`): 240 frames, 24 fps, no cuts, 0 flashes, mean luminance 0.002 (very dark), seam step 0.34 (seamless).
  - `render.py` `PROJECTS['nightfall']`: full frame from the lossless PNG frames (the MP4's compression blocks showed in the near-black once lifted); `lift=.5` (a gamma on the source; without it the wendigo and its eyes vanished into flat umber); `glints=2` (small bright detail laid back in its own colour, so the red eyes survive the paint patches); `seamless=True` (the reader feeds the loop's last second, then the loop, so hqdn3d and the temporal smoothing come into frame 0 from frame 239; the first paint had a restart step of 4.0, priming the smoothing alone 3.3, both 1.5 = the median step). NBA frame 150 identical after each change.
  - `tools/boxes.cjs` / `contrast.py`: an element a page lacks (the last stop has no scroll hint) is skipped.
  - Checks: grain-free WebM 962 KB (MP4 3,387 KB before CRF 28); flicker 1.0x the source; 0 flashes; contrast all pass at 1280 / 1440 / 1920 (lowest card count 5.89); seam 1.5 (median 1.51). Plays in the browser pane, no console errors. Poster candidate: frame 150 (the hold beside the wendigo).
  - Seen: the lift reads more dusk than black night; faint maroon banding in the deepest shadows; the wendigo is a dark silhouette with red eyes right of the beam (~72% across).

- 2026-11-17: **Nightfall approved** (#54; poster frame 150). Into the site on the user's call about the model licences (#55): `final/nightfall/` (`loop.webm` 985 KB, `loop.mp4` 1,351 KB at CRF 28, 44.8 dB from the WebM, `poster.webp` 61 KB) copied to `public/projects/nightfall/`; no code or test changes. `npm test`: 44/44. Live dev site: the Nightfall stop plays its loop, the pause pill shows, the poster is the home image, no console errors. Figma frame 6:179 (notes 6:213). `design-spec.md`, `figma-links.md` updated.

- 2026-11-17: **Committed and pushed** Nightfall on `project-visuals` to origin (#56; message checked, no AI markers).

## Next step
Hearth (the last of M4) when its recording is in `art-src/`; Juno stays skipped (#34). After that, M5 (final design spec pass and delivery).

## Open questions
- The Hearth recording and the Nightfall frame are not in `art-src/` yet.

**Last updated:** 2026-11-17
