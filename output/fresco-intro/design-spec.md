# The Fresco Intro: Design Specification

**Prepared by:** Fresco Intro Designer
**Date:** 2026-11-15
**Status:** Final

## 1. Overview
An opening sequence for the portfolio's home page. Starting on the night sky, stars drift together and condense into the full *Creation of Adam*: God, Adam, the plaster and its cracks. The camera then pushes straight in to the gap between God's and Adam's fingers, at the centre of the screen. A gold bloom flares there and shrinks into the home page's ring, and the fresco dissolves back into the night sky, leaving the home page exactly as it starts today. It plays by itself in 7.0 s, once per browser tab, and can always be skipped. The chosen direction is **A, Starlight** (decision #8).

## 2. Design Rationale
- **Starlight over Pigment on plaster and Looking up.** Its stars belong to the site's Night Sky look, and its light ends as the ring the visitor reaches for next. That makes the handover seamless: the gap the camera lands on, the flash and the ring are all the same point on screen.
- **The full original fresco** (requirement 1), rather than the cut-out figure group the home page uses. Particles fill it in from the edges towards the fingers, so the gap completes last, just as the camera starts to head there.
- **A straight push** (zoom in log space toward the gap, so the gap slides in a straight line to the centre) reads as one calm move and lands exactly on the gap at any screen size (0 px off-centre at 1280 × 800, 1440 × 900 and 1920 × 1080).
- **Zoom 2** (#9) frames both hands and wrists at the same sharpness as the home page. The source photo has only ~13 px across the gap, so zoom 3 looked soft.
- **One soft bloom**, not a white-out: it brightens 13–14% of the screen, and there is exactly one flash.
- **Header** (#11): readable over the night sky at the start, gone while the painting fills the screen (where its text failed contrast at 1.6–3.5:1), and back as the fresco dissolves.

## 3. Visual Foundations
- **Colour** (unchanged; `src/styles/tokens.css`):

  | Name | Hex | Use in the intro | Contrast |
  |---|---|---|---|
  | ink | `#1F1D1A` | background, the Skip pills (88%), the header band when focused | – |
  | gesso | `#EEE9DF` | name, Skip intro text | name ≥ 12.16:1 wherever the header shows |
  | stone-200 | `#CFC8BA` | tagline, nav, Skip to the projects | tagline ≥ 6.45:1, nav ≥ 8.73:1; skip link ≥ 7.71:1 on its pill over the plaster |
  | gold | `#C8A24A` | the bloom (`[.784, .635, .29]`), the ring | decoration |
  | ochre | `#C29545` | focus ring (2 px) | – |
  | Skip intro | gesso on 88% ink | – | ≥ 9.79:1 over the zoomed plaster |
- **Typography** (unchanged, Atlas #25): Gloock 2rem name; Newsreader 1rem tagline; IBM Plex Mono .875rem for nav, Skip intro, Skip to the projects and caption.
- **Layout:** the painting starts fitted to 90% of the width or 78% of the height (whichever is smaller), centred, with a soft 1.5% edge. Skip intro sits bottom-right (1.5rem / 1.25rem) and Skip to the projects bottom-left, both as pills during the intro.
- **Imagery:** Michelangelo, *The Creation of Adam*. Wikimedia Commons, *Michelangelo - Creation of Adam (cropped).jpg*, 3524 × 1599, marked public domain. Web copy: 3524 px WebP, q80, 820 KiB (#10). Landing point: Adam's fingertip (1331, 733), God's (1339, 723), gap (1335, 728), in 3524 px image coordinates.

## 4. Screens / Pieces
Preview: `fresco-prototypes` in `.claude/launch.json`, then http://localhost:4410/output/fresco-intro/final/prototype/ (add `?review` for replay / scrub / slow motion, or `?t=5.85` to freeze a moment). Key moments: `final/shots/sheet-final.png`.

| Time (s) | What happens |
|---|---|
| 0 – 0.2 | Night sky; 1 in 10 particles wait as twinkling stars; header visible |
| 0.2 – 3.6 | Particles drift in and land, from the edges towards the gap; the painting shows wherever they have landed |
| 2.4 – 5.7 | The push: from the fitted painting to zoom 2 on the gap (ease in-out) |
| 3.2 – 3.6 | The header fades as the painting's top edge passes behind its text (exact timing depends on screen size) |
| 5.5 – 5.85 – 6.6 | The bloom rises to 20% of the short screen side, then shrinks to the 44 px ring (peak intensity .7, gold with a warm core) |
| 6.0 – 7.0 | The fresco dissolves into the night sky; the header returns in the second half |
| 6.15 | The ring fades in (0.5 s) where the bloom shrinks; Skip intro disappears |
| 6.6 | The caption "Bring your cursor to the circle" fades in |
| 7.0 | The home page is live (God's particle journey can start) |

**States**
- **Skip intro / Esc:** the intro fades out over 300 ms, then the home page starts.
- **Skip to the projects** (and the nav's Projects link) during the intro: the intro ends at once, the projects are revealed, and Falling Constellations gets focus.
- **Once per tab** (#13): reloading or coming back in the same tab goes straight to the home page; a new tab plays it again. If storage is blocked it plays each time.
- **Reduced motion:** the still fresco (fitted, on ink) for 2 s, then a 0.4 s cross-fade into the page, which is already revealed. Tabbing into the projects ends the still at once.
- **Reading layout** (≤ 900 px wide or ≤ 560 px tall, i.e. 200–400% zoom; #14): no intro.
- **Phones and tablets:** no intro (the existing "computer required" notice).
- **No WebGL2, or the image fails to load:** no intro; the page behaves as today.
- **Loading:** until the image is ready (0.4–0.6 s locally, ~1.4–1.9 s on a cold first load) the night sky and header show and Skip intro already works.

## 5. Components & Tokens
- `final/prototype/shared/intro.js`, `playIntro()`, which returns `{ done }` (a promise). The engine is raw WebGL2 with three passes:
  1. the painting quad, shown per 3 × 3 cell once that cell's particle has landed
  2. 625,742 particles generated on the GPU from the texture (`gl_VertexID` → cell → `texelFetch`), with no CPU data
  3. an additive full-screen bloom

  Constants: `GAP`, `ZOOM = 2`, `STRIDE = 3`, timeline `TL`.
- `final/prototype/shared/intro.css`: the intro canvas, the reduced-motion still, Skip intro, the pills, the header band when focused, and `.faded`.
- Page markup added to the home page: `<button class="skip-intro">Skip intro</button>` as the first element in `<body>`, and `<canvas id="intro" aria-hidden="true">` just before the header.
- Home page hooks (prototype copies in `final/prototype/shared/home/`):
  - `createCreation` gains `S.hold`, so the cursor can't build God while the intro plays.
  - `startPage({ look, data, hold })` takes the intro's `done` promise.
- No new design tokens.
- **Source tree:** `public/creation/fresco.webp` (#15). Nothing in `src/` has changed.

## 6. Accessibility & Responsiveness
- **axe** (WCAG 2.0–2.2 A/AA tags): 0 violations during the intro (1 s), zoomed with the header faded (5 s), after the intro, and during the reduced-motion still.
- **Keyboard:** Tab order during the intro is Skip intro → Skip to the projects → Projects → About → CV → Email. Esc skips. The faded header stays in the tab order; when it holds focus it shows on a solid ink band (nav 10.11:1).
- **Contrast** (worst case wherever the header is at least half visible, at 1280 / 1440 / 1920): name 12.16:1, tagline 6.45:1, nav 8.73:1. Skip controls ≥ 7.71:1. All pass AA (4.5:1).
- **Flash** (WCAG 2.3.1 / 2.3.2): one flash; luminance rises over 0.35 s and falls over 0.75 s; 13.9% of a 1440 × 900 screen (12.7% at 1920 × 1080) brightens by 0.10 or more.
- **Reduced motion, reading layout, no WebGL:** see section 4.
- **Screen sizes:** checked at 1280 × 800, 1440 × 900 and 1920 × 1080 (landing 0 px off-centre at all three), and at 200% / 400% zoom (no intro).
- **Frame rate** (Chromium, RTX 4070 laptop GPU, 1440 × 900):
  - 143.4–143.6 fps over three runs at pixel ratio 1.5 (display cap 144); 142.9–143.4 fps at ratios 1 and 2.
  - p95 frame 7.1 ms; after the first 0.3 s, no frame over 7.4 ms in the final runs (one 35 ms frame in one round 1 run).
  - The first frame takes 28–370 ms (shaders and texture upload) before anything moves.
- **Colour mode:** dark only (Night Sky).

## 7. Files & Links
- **Project documents:** `output/fresco-intro/` — `designAgent.md`, `plan.md` (approved 2026-11-15), `progress.md`, `decisions.md`, `design-spec.md`.
- **Tools** (`python -I`, from the project root):
  - `tools/make_fresco.py`: the web images, from the git-ignored `art-src/creation-of-adam-3524.jpg`.
  - `tools/make_directions.py`: the direction pages, from the built `dist/index.html`.
- **Data:** `data/fresco-3524.webp`, `data/fresco-2560.webp`.
- **Directions:** `directions/{a-starlight,b-pigment,c-looking-up}/`, `directions/shared/` (three-direction engine, home copies), `directions/shots/`.
- **Round 1:** `iterations/round-1/` (index.html, `shared/`, `shots/`).
- **Final:** `final/prototype/` (index.html, `shared/`), `final/fresco.webp`, `final/shots/` (`sheet-final.png`, size-*, flash-*, zoom-*, reduced-still, no-webgl, report-m3.json).
- **Source tree:** `public/creation/fresco.webp` (new). `src/` is unchanged.
- **Local config (git-ignored):** `.claude/launch.json` gains `fresco-prototypes`; `art-src/creation-of-adam-3524.jpg` copied from the worktree.
- **Figma:** none (not requested).

## 8. Decision Log
1. #1–#7: project root, a new project, setup answers, deliverables, the `fresco-intro` slug and branch, agent file and plan approved.
2. #8 D1: Starlight.
3. #9 D2: zoom 2.
4. #10 D3: the 3524 px image.
5. #11 D4: the header fades while the painting fills the screen.
6. #12: round 1 approved as final.
7. #13: once per tab.
8. #14 D5: no intro in the reading layout.
9. #15 D6: `public/creation/fresco.webp`.

Full table: `decisions.md`.

## 9. Known Issues & Next Steps
- **Not wired into the site yet** (plan Open Question 3). Porting needs:
  - `intro.js` / `intro.css` in `src/`, with the image path changed to `/creation/fresco.webp`
  - the two small hooks in `src/scripts/creation.js` and `home.js`
  - the Skip intro button and intro canvas in `src/pages/index.astro`
  - tests

  This is a program agent's job, or an amendment to this plan.
- **Download:** the intro adds 820 KiB, and it starts only once the image has loaded. That was measured on a local server only, so a slow connection will wait longer (the night sky and header show meanwhile, and Skip works).
- **Sharpness at the landing:** with ~13 source px across the gap, zoom 2 on a pixel-ratio-2 screen is 4 device px per source px, so it is slightly soft up close. A larger scan would need a new download.
- **Testing:** Chromium on one GPU only. Firefox, Safari and integrated GPUs are not tested.
- **First frame:** one slow frame at the very start (shader compile and texture upload), before anything moves.
- **Placeholders:** the header still shows them. The header fade measures the real text, so it adapts when they are filled in.
- **Repository:** nothing is committed yet. Ask which GitHub repository before the first commit on `fresco-intro`.
