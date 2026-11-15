# The Fresco Window: Design Specification

**Prepared by:** Fresco Intro Designer
**Date:** 2026-11-15 (revised for Amendment 2; the first version, the Starlight intro, is in git at `ae6f301`)
**Status:** Final

## 1. Overview
The portfolio's home page opens on Michelangelo's full *Creation of Adam* (God, Adam, the plaster and its cracks), framed on the night sky. The camera moves in and lands on the gap between God's and Adam's fingers. The gap then opens like a window onto the first project, the camera passes through it, and one soft gold flash marks the threshold. After that the fresco is gone: each project's own image fills the screen behind its card, and scrolling steps through the seven projects. The opening runs by itself in 4.7 s, once per browser tab, and can always be skipped. It replaces the previous home page's cursor journey (the ring and God's particle build).

## 2. Design Rationale
- **The fresco as a window** (#21, #24). The moment of creation becomes the way in. Instead of explaining the painting, the visitor enters through the gap the whole fresco points to.
- **No particles** (#21). The painting is shown as itself from the first frame (#25), so the visit starts on a recognisable masterpiece rather than on effects.
- **Land, pause, enter.** The camera lands on the gap at zoom 2 (#9) and pauses for a short beat, so the "space between the fingers" the user asked for is seen clearly. Only then does the opening grow and the camera accelerate through it.
- **The projects' own visuals after the flash** (#20, #22, #23). The fresco is the threshold, not the backdrop. Each project's main image fills the screen behind its card, so the work itself is the world you arrive in.
- **One gold flash, at the threshold.** It hides the moment the window covers the screen and gives the passage a single beat of light. There is exactly one flash.
- **The header** (#11): readable over the night sky, faded while the painting fills the screen, and back with the cards.

## 3. Visual Foundations
- **Colour** (unchanged; `src/styles/tokens.css`):

  | Name | Hex | Use | Contrast (worst case, over the 7 placeholder images) |
  |---|---|---|---|
  | ink | `#1F1D1A` | night sky behind the fresco; the gradients (94% / 55% on the left, 80% at the top); Skip pills | – |
  | gesso | `#EEE9DF` | name, card title and line, Skip intro | name 13.32:1, title 9.82:1, line 9.93:1 |
  | stone-200 | `#CFC8BA` | tagline, nav, card meta, "Scroll for the next project", skip link | tagline 9.43:1, **nav 4.98:1**, meta 7.14:1, next 7.67:1 |
  | gold | `#C8A24A` | the flash (`[.784, .635, .29]`), card count | count 5.32:1 |
  | ochre | `#C29545` | 2 px focus ring | – |

  Card links: 11.84:1. Skip intro (gesso on its 88% ink pill): ≥ 9.79:1 over the plaster.
- **Typography** (unchanged, Atlas #25): Gloock (name 2rem, card title clamp 2.5–3.75rem); Newsreader (tagline 1rem, card line 1.1875rem); IBM Plex Mono (.8125–.9375rem labels).
- **Layout:**
  - The fresco starts fitted to 90% of the width or 78% of the height (whichever is smaller), centred, with a soft 1.5% edge.
  - The window is a soft circle centred on the gap. Its radius grows to 1.2 × half the screen diagonal, and its edge is 6 px + 45% of the radius wide.
  - In the showcase, the project image covers the screen (`object-fit: cover`). The card sits at 5vw with a width of min(30vw, 30rem), over a left gradient (ink 94% to 32%, 55% at 46%, clear by 64%) and a top gradient (ink 80% fading out over 9rem).
- **Imagery:**
  - The fresco: Wikimedia Commons, *Michelangelo - Creation of Adam (cropped).jpg*, 3524 × 1599, marked public domain. Web copy: `public/creation/fresco.webp` (q80, 820 KiB). The gap is at (1335, 728) in image pixels (Adam's fingertip (1331, 733), God's (1339, 723)).
  - Project images: `src/assets/projects/<id>/varnish.png`, 1600 × 1000. These are placeholders today.

## 4. Screens / Pieces
Preview: `fresco-prototypes` in `.claude/launch.json` (python http.server, port 4410, project root), then http://localhost:4410/output/fresco-intro/final/prototype/. Add `?review` for replay, scrub and slow motion, or `?t=3.6` to freeze a moment. Key moments: `final/shots/sheet-final.png`.

| Time (s) | What happens |
|---|---|
| 0 | The full fresco, fitted on the night sky; header and both skip controls visible |
| 0 – 3.0 | The camera moves in and lands with the gap at the screen centre (zoom in log space, the gap on a straight line, ease in-out); the header fades as the painting's top edge rises behind it |
| 3.0 – 3.3 | A beat on the gap; the window starts to open there |
| 3.0 – 4.05 | The window grows (radius ∝ progress^2.2) until it covers the screen; through it, the first project's image |
| 3.3 – 4.1 | The camera accelerates through (zoom 2 → 16, cubic ease-in) |
| 3.65 – 3.9 – 4.5 | The flash: a gold bloom (radius 30% of the short screen side, peak intensity .7) at the gap |
| 4.2 | The cards and the gradients fade in (0.6 s / 0.5 s); Skip intro disappears |
| 4.2 – 4.7 | The header comes back; at 4.7 s the showcase is live and the intro canvas is removed |

**States**
- **Showcase:** scroll snaps one project per screen. The current project's image cross-fades in (0.6 s).
- **Skip intro / Esc:** a 0.25 s dip to the night sky, then the showcase.
- **Skip to the projects** (and the nav's Projects link): the showcase at once, with focus on the first project's "View project".
- **Showcase at once, no fresco:** reduced motion, a repeat visit in the same tab (#13), the reading layout at 200–400% zoom or ≤ 900 px wide or ≤ 560 px tall (#14), and no WebGL2 or a failed image load.
- **No JavaScript:** the showcase with the first project's image.
- **Phones and tablets:** the existing "This site needs a computer" notice.
- **Loading:** until the fresco has loaded (0.2–0.5 s locally), the night sky and header show and Skip intro already works.

## 5. Components & Tokens
- `final/prototype/shared/intro.js`, `playIntro()`, which returns `{ done, toShowcase() }`. It is raw WebGL2 with three passes:
  1. ink background + fresco quad (mipmapped texture)
  2. the window: a full-screen pass with `blendFunc(ZERO, SRC_ALPHA)` that keeps only what lies outside the soft circle
  3. the additive flash

  Constants: `GAP`, `ZOOM = 2`, `THROUGH = 16`, timeline `TL`.
- `final/prototype/shared/page.js`, `startPage()`: the skip links, plus an IntersectionObserver that shows the current project's image.
- `final/prototype/shared/intro.css`: the `.visuals` layer and its gradients, the intro canvas, Skip intro, the pills, the header band when focused, and `.faded`.
- **Markup on the home page:**
  - `<button class="skip-intro">Skip intro</button>` first in `<body>`.
  - `<div class="visuals" aria-hidden="true">` with one `<img alt="" data-for="<id>">` per project, in stop order (decorative: each card carries the project's name and text).
  - `<canvas id="intro" aria-hidden="true">` after it.
  - The `.hint` ring, the Falling Constellations `<iframe class="backdrop">` and the cut-out `.still` are removed.
- No new design tokens.
- **Source tree:** `public/creation/fresco.webp` (#15). Nothing in `src/` has changed.

## 6. Accessibility & Responsiveness
- **axe** (WCAG 2.0–2.2 A/AA): 0 violations at 1 s, at 3.6 s (the window opening), in the showcase, with reduced motion, and at 200% and 400% zoom.
- **Keyboard:**
  - Tab order during the opening: Skip intro → Skip to the projects → Projects → About → CV → Email.
  - Esc skips.
  - The faded header stays in the tab order and shows on a solid ink band when it holds focus.
- **Contrast:** all text passes AA over all seven placeholder images (table in section 3). The nav has the thinnest margin (4.98:1), so re-check when real screenshots are added.
- **Flash (WCAG 2.3.1 / 2.3.2):** one flash, rising over 0.25 s and falling over 0.6 s.
- **Motion:** reduced motion skips the opening entirely. The image cross-fades have no transition under reduced motion.
- **Screen sizes:** landing 0 px off-centre at 1280 × 800, 1440 × 900 and 1920 × 1080. At 200% / 400% zoom the reading layout shows the showcase with no opening.
- **Frame rate** (Chromium, RTX 4070 laptop GPU, 1440 × 900, pixel ratio 1.5):
  - 143.4–143.6 fps (display cap 144); p95 frame 7.1 ms.
  - No frame over 7.4 ms after the first 0.3 s; the first frame takes ≤ 28 ms.
  - Without particles, the opening costs far less than the Starlight version.
- **Colour mode:** dark only (Night Sky).

## 7. Files & Links
- **Project documents:** `output/fresco-intro/` — `designAgent.md` (amended), `plan.md` (approved, Amendments 1 and 2 approved), `progress.md`, `decisions.md` (#1–#27), `design-spec.md`.
- **Tools:** `tools/make_fresco.py`, `tools/make_directions.py`.
- **Data:** `data/fresco-3524.webp`, `data/fresco-2560.webp`.
- **Record:**
  - `directions/` (A Starlight, B Pigment on plaster, C Looking up)
  - `iterations/round-1/` (Starlight, approved then superseded)
  - `iterations/round-2/` (opening into a fresco showcase, Amendment 1)
  - `iterations/round-3/` (the window, approved)
  - `final/shots/round-1-final/` (checks of the first final)
- **Final:** `final/prototype/` (round 3), `final/fresco.webp`, `final/shots/` (`sheet-final.png`, `final-*.png`, `bg-r3-stop*.png`, `report-final.json`).
- **Source tree:** `public/creation/fresco.webp`.
- **Local and git-ignored:** `.claude/launch.json` (`fresco-prototypes`), `art-src/creation-of-adam-3524.jpg`.
- **Repository:** `https://github.com/arinb44/portfolio`, branch `fresco-intro` (#16).
- **Figma:** none.

## 8. Decision Log
1. **Setup, #1–#7:** project root, a new project, setup answers, deliverables, the `fresco-intro` slug and branch, agent file and plan approved.
2. **First version, #8–#16:** Starlight, zoom 2, the 3524 px image, the header fade, round 1 approved, once per tab, no opening in the reading layout, `public/creation/fresco.webp`, repository `arinb44/portfolio`.
3. **Amendment 1, #17–#19:** the intro leads straight to the projects, with formation and zoom together (built as round 2).
4. **Amendment 2, #20–#26:**
   - after the flash the fresco is gone and the projects' visuals show
   - no particles; the fresco is a window
   - each project's main image, full screen behind its card
   - the gap opens into a window
   - the fresco is on screen from the first frame
5. **#27:** round 3 approved as final.

## 9. Known Issues & Next Steps
- **Placeholder images.** All seven project images are placeholders. The window effect reads best once real screenshots replace them. Then re-check:
  - contrast (nav 4.98:1 today; strengthen the top gradient if one fails)
  - file sizes (each image loads at page start; use Astro's `<Picture>` in the port)
- **Not wired into the site.** Porting needs:
  - `intro.js`, `page.js` and `intro.css` in `src/`, with the image path `/creation/fresco.webp` and the project images through Astro's image pipeline
  - the new markup in `src/pages/index.astro`
  - deleting what the home page no longer uses: `src/scripts/creation.js`, `src/scripts/home.js`, `public/creation/whole-group-aa.webp`, `particles.json`, the ring CSS
  - tests

  This is a program agent's job, or another amendment.
- **Features removed by this design (the user's choices, listed so nothing is lost by surprise):**
  - the cursor-as-Adam journey
  - the per-project spark
  - Falling Constellations playing live behind its stop
- **Download:** 820 KiB for the fresco plus the project images. Measured on a local server only.
- **Testing:** Chromium on one GPU only. Firefox, Safari and integrated GPUs are not tested.
