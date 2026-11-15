# Progress: Fresco Intro

- **Current phase:** Phase 5 (final delivery, after Amendment 2)
- **Status:** complete; committed and pushed on `fresco-intro` (see below); waiting for any revision requests

## Completed milestones
- 2026-11-14: Project root confirmed (`C:\Users\arins\Arin\School\Projects\Portfolio`); new project chosen over resuming `creation-redesign` (decisions #1, #2).
- 2026-11-14: Phase 1 setup interview: suggested answers accepted, summary confirmed (decisions #3, #4).
- 2026-11-14: Slug `fresco-intro`; git branch `fresco-intro` created from `main` at `4871a92` (decision #5).
- 2026-11-14: Phase 2: `designAgent.md` approved (decision #6).
- 2026-11-15: Phase 3: `plan.md` approved (decision #7).
- 2026-11-15: M1 built (not yet chosen):
  - Source: Commons original copied to the git-ignored `art-src/creation-of-adam-3524.jpg`. `tools/make_fresco.py` (run with `python -I`) writes `data/fresco-3524.webp` (q80, 820 KiB) and `data/fresco-2560.webp` (q88, 651 KiB).
  - Landing point measured on a 10x crop: Adam's fingertip (1331, 733), God's (1339, 723), gap centre (1335, 728) in 3524 px; the gap is ~13 px.
  - `directions/shared/intro.js` + `intro.css`: one WebGL2 engine for all three directions. Particles come from the texture on the GPU (gl_VertexID -> cell -> texelFetch), stride 3 = 625,742 particles; the painting texture shows where they have landed; a 3x3 view matrix (zoom/pan, plus tilt for C); an additive light pass (bloom, B's spark, C's wash). Params `?img=2560 ?zoom=3 ?stride= ?review ?t=`.
  - `directions/shared/home/`: copies of `src/scripts/creation.js` (adds `S.hold`), `home.js` (adds `data`, `hold`), `creation.css`, `tokens.css` (font URLs made absolute). `src/` untouched.
  - `tools/make_directions.py` writes `directions/{a-starlight,b-pigment,c-looking-up}/index.html` from the built `dist/index.html` (run `npm run build` first).
  - Preview: `fresco-prototypes` in `.claude/launch.json` (python http.server 4410 at the project root) -> http://localhost:4410/output/fresco-intro/directions/a-starlight/?review
  - Fixed during review: B's camera showed past the painting's left edge at Adam's face (clamped inside); A/B blooms were large white blobs and C's wash turned the screen near-white (toned down: A .7, B .65, C .28 peak); B's spark was too faint (brighter, with a head).
  - Tests (Playwright, `channel: 'chromium'`, `--use-angle=d3d11`, 1440 x 900; scripts in the session scratchpad: `m1.cjs`, `contrast.cjs` + `contrast.py`, `land.cjs`):
    - Playthrough: A 141.5 fps, B 143.3, C 143.3 (display cap 144); p95 frame 7.1 ms; one long frame (42-132 ms) at T = 0, before anything moves. Time to start (local server): 0.5-1.4 s; 1.9 s on the very first cold load.
    - Landing: the gap is 0 px from the screen centre at 1280 x 800, 1440 x 900 and 1920 x 1080 in all three.
    - Skip intro is the first tab stop; Enter or Esc -> home page in ~0.3 s; "Skip to the projects" during the intro reveals and focuses Falling Constellations; reduced motion: still fresco 2.4 s, then the revealed page. Ring visible after the handover. No console errors.
    - Contrast over the zoomed fresco FAILS for the header: name 3.5:1, tagline 1.6:1, nav 2.3:1 (over the night sky they pass at 10-13.7:1). Skip controls pass (>= 7.7:1).
  - Shots: `directions/shots/` (`sheet-a.png`, `sheet-b.png`, `sheet-c.png`, `sheet-landing-d2-d3.png`, reduced-*, skip-to-projects.png).

- 2026-11-15: D1 Starlight, D2 zoom 2, D3 3524 px, D4 header fades while zoomed (decisions #8-#11).
- 2026-11-15: M2 round 1 built in `iterations/round-1/` (index.html + shared/ copies):
  - `shared/intro.js` trimmed to Starlight only (B and C removed; zoom 2 and the 3524 px image fixed; no ?img/?zoom/?stride).
  - D4: the header's opacity follows the painting's top edge (fully visible until the edge reaches the text, gone ~56 px later) and returns in the second half of the fresco's fade. While faded it takes no clicks but stays in the tab order; if it holds focus it stays visible on a solid ink band.
  - The caption "Bring your cursor to the circle" waits until 6.6 s (the plaster has mostly gone); the ring still appears at 6.15 s where the bloom shrinks.
  - Tests (Playwright, real GPU, scratchpad `r1.cjs`): header contrast whenever it is at least half visible: name >= 12.16:1, tagline >= 8.13:1, nav >= 8.73:1; focused nav on the band 10.11:1. Landing 0 px off-centre at 1280 x 800, 1440 x 900, 1920 x 1080. Playthrough at 1440 x 900: 142.9 / 143.4 / 143.4 fps at device pixel ratio 1 / 1.5 / 2, p95 frame 7.1 ms; one 35 ms frame in the dpr 1 run, otherwise <= 7.2 ms after the first 0.3 s. Skip intro first tab stop; Enter, Esc and "Skip to the projects" work; reduced motion 2.4 s still. No console errors.
  - Shots: `iterations/round-1/shots/` (`sheet-r1.png`, `caption-6_3-vs-6_7.png`).

- 2026-11-15: Round 1 approved as final (#12); once per tab (#13); no intro in the reading layout (#14).
- 2026-11-15: M3 on `final/prototype/` (copy of round 1 + sessionStorage `fresco-intro-seen` + reading-layout skip + reduced-motion focus fix):
  - axe 0 violations at 1 s, 5 s, after, and on the reduced-motion still. Tab order: Skip intro, Skip to the projects, Projects, About, CV, Email.
  - Header contrast wherever at least half visible, at 1280 / 1440 / 1920: name >= 12.16, tagline >= 6.45, nav >= 8.73. Landing 0 px off-centre at all three sizes.
  - Flash: one; 13.9% (1440) / 12.7% (1920) of the screen brightens by >= 0.10 relative luminance.
  - Same-tab reload skips; a new tab plays. 200% and 400% zoom: no intro. No WebGL: the page as today (still painting, projects). Skip click and Esc finish.
  - Fixed: with reduced motion, Tabbing into the projects (shown under the still) now ends the still at once (WCAG 2.4.11); tested: focus lands on Falling Constellations, still gone in 0.3 s.
  - Frame rate: 143.4-143.6 fps, three runs at pixel ratio 1.5; no frame over 7.4 ms after the first 0.3 s.
  - Scripts (session scratchpad): `m3.cjs`, `sizes-contrast.cjs`, `reduced-focus.cjs`.
- 2026-11-15: M4: `final/fresco.webp`; copied to `public/creation/fresco.webp` (#15, identical, nothing overwritten); `final/shots/sheet-final.png`; `design-spec.md` written.

- 2026-11-15: Repository `https://github.com/arinb44/portfolio` (#16). **Committed** as `ae6f301` on `fresco-intro` (121 files; no AI markers). The raw measurement captures (`bg-*`, `land-*`, 42 MB) stay on disk, untracked. This progress note is not in that commit.
- 2026-11-15: Pushed `fresco-intro` to `origin` (approved; new branch, tracks `origin/fresco-intro`; `main` untouched).

- 2026-11-15: User asked to change the showcase: the intro leads straight to the projects beside the full fresco, and formation + zoom run together (decisions #17, #18). `designAgent.md` amended; Amendment 1 appended to `plan.md` (not yet approved).

- 2026-11-15: Amendment 1 approved (#19). Round 2 built in `iterations/round-2/` (opening into a fresco showcase; `shared/intro.js` + `page.js`; ring and God engine removed): 142.3 fps, landing 0 px off-centre at 3 sizes, axe 0, all skip paths, reload/reduced/200%/400% go straight to the showcase, no-WebGL still. Shots `iterations/round-2/shots/sheet-r2.png`.
- 2026-11-15: User reviewed round 2: after the flash the fresco should be gone and the projects' visuals show; no particles; the fresco is a window (decisions #20-#25). `designAgent.md` amended; Amendment 2 appended to `plan.md` (not yet approved).

- 2026-11-15: Amendment 2 approved (#26). Round 3 built in `iterations/round-3/`:
  - `shared/intro.js`: no particles; ink + fresco drawn, cut by a soft circular window at the gap (blend ZERO, SRC_ALPHA), additive flash. Timeline: push 0-3.0 s to zoom 2, window opens 3.0-4.05 s, enter 3.3-4.1 s (zoom 2 -> 16, cubic), flash peak 3.9 s, cards 4.2 s, live 4.7 s.
  - `shared/page.js`: skip links, the current project's image (`.visuals img.on`) follows the stop in view. `index.html`: `.visuals` layer with the 7 `varnish.png` images (alt="", aria-hidden; the cards carry the text); no backdrop iframe, no fresco still.
  - `shared/intro.css`: images full screen (object-fit: cover), left + top gradients that come in with the cards, 0.6 s cross-fade.
  - Tests (scratchpad `r3.cjs`): 143.6 fps at pixel ratio 1.5, no frame over 7.3 ms after the start; landing 0 px off-centre at 3 sizes; axe 0 (1 s, 3.6 s, showcase, reduced, 200%, 400%); Tab order unchanged; Skip intro, Esc, Skip to the projects, reload, reduced motion, 200%/400% zoom and no WebGL all reach the showcase; scrolling 2 steps shows the NBA image. Contrast over the 7 placeholder images (worst): name 13.32, tagline 9.43, nav 4.98 (thin margin), count 5.32, title 9.82, line 9.93, meta 7.14, links 11.84, next 7.67.
  - Shots: `iterations/round-3/shots/sheet-r3.png`.

- 2026-11-15: Round 3 approved as final (#27). `final/prototype/` replaced by round 3 (the first final is in git at `ae6f301`; its shots moved to `final/shots/round-1-final/`). Checks re-run on the final (scratchpad `r3.cjs`): 143.4 fps, landing 0 px off-centre at 3 sizes, axe 0 everywhere, all skip / fallback paths reach the showcase, contrast as round 3 (nav 4.98:1 thinnest). `final/shots/sheet-final.png`, `report-final.json`. `design-spec.md` rewritten for the window design.

- 2026-11-15: Committed rounds 2-3, the new final, the revised spec and notes on `fresco-intro` (approved; raw `bg-*` / `land-*` captures left out) and pushed to `origin` (approved).

## Next step
Ask for revisions. Follow-ups (design-spec section 9): real screenshots for the 7 projects, then re-check contrast (nav 4.98:1 thinnest); port into `src/` (program agent or an amendment).

## Open questions
- **Repository:** `https://github.com/arinb44/portfolio` (decision #16), branch `fresco-intro`. Ask before every push.
- Wiring the intro into `src/` (program agent or a plan amendment).

**Last updated:** 2026-11-15
