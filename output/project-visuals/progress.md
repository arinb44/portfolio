# Progress: Project Visuals

- **Current phase:** Phase 4, M3 (final NBA loop in the site)
- **Status:** waiting for user (approve the commit; then the push)

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

## Next step
Get the commit approved (what to include, the .gitignore lines for the rebuildable renders), commit on `project-visuals` with no AI markers, check the message, then ask before pushing to origin. After that: M4, a plan amendment for the other six projects (a reference for each, video or still).

## Open questions
- The Figma file: a new file in the user's team, or a new page in the Creation redesign file (can wait until M1).

**Last updated:** 2026-11-16
