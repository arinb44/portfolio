# The Fresco Opening: Design Specification

**Prepared by:** Fresco Intro Designer
**Date:** 2026-11-15 (round 4, built directly in the site; earlier versions: Starlight at `ae6f301`, the window at `678f89a`)
**Status:** Final

## 1. Overview
The portfolio's home page opens on Michelangelo's full *Creation of Adam* (God, Adam, the plaster and its cracks), covering the whole screen with no header. The camera moves in and lands on the gap between God's and Adam's fingers, light gathers there, and the camera pushes into the gap. Then the whole screen flashes warm white. At the flash's peak the projects are simply there, with no fade-in: each project's own image fills the screen behind its card, and the header is back. Scrolling steps through the seven projects. The opening runs by itself in 4.5 s, once per browser tab, and can always be skipped. It replaces the old cursor journey (the ring and God's particle build).

## 2. Design Rationale
- **The fresco fills the screen** (#32). The visit starts inside the painting, with nothing else on screen but the two small skip controls.
- **Land, then enter** (#9, #31). The camera settles on the gap at zoom 2, so the "space between the fingers" is seen clearly. Light gathers there, and the camera pushes in.
- **One full-screen flash, then the projects** (#30). The flash is the moment of creation. The projects appear under it instead of fading in, so the light clears onto the finished page.
- **The projects' own images** (#20, #22, #23). The world you arrive in is the work itself.
- **The opening frame:** cropping a 2.2 : 1 painting to cover a 16:10 screen loses its sides. The frame is centred at x = 1530 (of 3524) so that Adam's head, God's head and the fingers are all in view. Only God's legs and the far-right angels are cropped.

## 3. Visual Foundations
- **Colour** (unchanged tokens, `src/styles/tokens.css`), plus one decorative colour:
  - **Flash:** warm white `#FFF6E6`, full screen at its peak.
  - **Gathering light:** gold bloom `#C8A24A` with a warm core.
  - **Contrast over the 7 placeholder images** (worst case; measured in round 3, same gradients):

    | Text | Ratio |
    |---|---|
    | name | 13.32:1 |
    | tagline | 9.43:1 |
    | **nav** | **4.98:1** (thinnest) |
    | count | 5.32:1 |
    | title | 9.82:1 |
    | line | 9.93:1 |
    | meta | 7.14:1 |
    | links | 11.84:1 |
    | next | 7.67:1 |

  - **Skip pills:** gesso / stone-200 on 88% ink, ≥ 7.7:1 over the plaster.
- **Typography:** unchanged (Atlas: Gloock, Newsreader, IBM Plex Mono).
- **Layout:**
  - **Opening:** the fresco covers the screen (scale = max(width / 3524, height / 1599)), centred at x = 1530 and clamped to the painting's edges.
  - **Showcase:** each project image covers the screen. The card sits at 5vw with a width of min(30vw, 30rem), over a left gradient (ink 94% to 32%, 55% at 46%, clear by 64%) and a top gradient (ink 80% fading out over 9rem).
- **Imagery:**
  - The fresco: `public/creation/fresco.webp` (Wikimedia Commons, public domain, 3524 × 1599, q80, 820 KiB). The gap is at (1335, 728).
  - Project images: the first image of each project's first layer (`varnish`), through Astro's `<Image>` (960 / 1600 px WebP). Placeholders today.

## 4. Screens / Pieces
Live at `npm run dev` (http://localhost:4321/). Add `?review` for replay, scrub and slow motion, or `?t=3.85` to freeze a moment. Key moments: `iterations/round-4/shots/sheet-r4.png`.

| Time (s) | What happens |
|---|---|
| 0 | The fresco covers the screen; only "Skip to the projects" (bottom left) and "Skip intro" (bottom right) |
| 0 – 3.0 | The camera moves in and lands with the gap at the screen centre, zoom 2 (zoom in log space, the gap on a straight line, ease in-out) |
| 3.3 – 4.1 | The camera accelerates into the gap (zoom 2 → 16, cubic) |
| 3.45 – 3.8 | Light gathers at the gap (gold bloom, radius 20% of the short side) |
| 3.75 – 3.95 | The whole screen goes warm white |
| 3.95 | Peak: the fresco is gone; the projects, their images, the gradients and the header are there at once |
| 3.95 – 4.5 | The flash clears onto the projects; at 4.5 the opening's layers are removed |

**States**
- **Skip intro / Esc:** a 0.25 s dip to the night sky, then the projects.
- **Skip to the projects** (and the nav's Projects link): the projects at once, with focus on the first "View project".
- **Projects at once, no opening:** reduced motion, a repeat visit in the same tab, the reading layout (≤ 900 px wide or ≤ 560 px tall, i.e. 200–400% zoom), and no WebGL2 or a failed image load.
- **No JavaScript:** the projects with the first project's image.
- **Phones and tablets:** the "This site needs a computer" notice.
- **Showcase:** scroll snaps one project per screen. The current project's image cross-fades (0.6 s; instant under reduced motion).

## 5. Components & Tokens
- **`src/scripts/intro.js`**, `playIntro()`, which returns `{ done, toShowcase() }`.
  - Raw WebGL2 in two passes: the fresco quad (mipmapped), then the additive gathering light.
  - The full-screen flash is a CSS layer (`.flash`), so it sits above the cards and header when they appear under it.
  - Constants: `GAP`, `ZOOM = 2`, `THROUGH = 16`, `START_X = 1530`, timeline `TL`.
- **`src/scripts/home.js`**, `startPage()`: the skip links, plus an IntersectionObserver that shows the current project's image.
- **`src/pages/index.astro`:** Skip intro (first in `<body>`), Skip to the projects, `.visuals` (one `<Image alt="" data-for>` per project, decorative), `canvas#intro`, `.flash`, the header, and the 7 cards.
- **`src/styles/creation.css`:**
  - `.visuals` and its gradients, `#intro`, `.flash`, Skip intro and the pills
  - the header hidden during the opening (`opacity: 0`, no clicks), shown on a solid ink band when it holds keyboard focus
  - no fade on the cards
- No new design tokens.

## 6. Accessibility & Responsiveness
- **`npm test`:** astro check 0 errors, 11 pages, unit 12/12, Playwright 41/41. The 14 home page tests include axe (WCAG 2.0–2.2 A/AA + best-practice) during the opening and on the projects.
- **Keyboard:**
  - Tab order during the opening: Skip intro → Skip to the projects → Projects → About → CV → Email.
  - When focus reaches the nav, the header shows on a solid ink band.
  - Esc skips.
  - Screen readers find the name and nav throughout.
- **Flash (WCAG 2.3.1 / 2.3.2):** one flash (rises over 0.2 s, clears over 0.55 s), well under three per second. It is full screen and bright, which the user chose over the earlier "no full-screen white" (#30). Visitors with reduced motion never see it.
- **Screen sizes:** the opening covers the screen and lands 0 px off-centre at 1280 × 800, 1440 × 900 and 1920 × 1080. At 200% / 400% zoom: the reading layout, no opening.
- **Frame rate** (Chromium, RTX 4070 laptop GPU, 1440 × 900, pixel ratio 1.5): 143.5–143.8 fps, p95 7.1 ms, worst frame after the start ≤ 13.8 ms.

## 7. Files & Links
- **The site (source of truth):** `src/scripts/intro.js`, `src/scripts/home.js`, `src/pages/index.astro`, `src/styles/creation.css`, `tests/e2e/home.spec.ts`, `public/creation/fresco.webp`, `README.md`.
- **Project documents:** `output/fresco-intro/` — `designAgent.md`, `plan.md` (Amendments 1–3 approved), `progress.md`, `decisions.md` (#1–#32), this spec.
- **Record:**
  - `directions/` (A, B, C)
  - `iterations/round-1/` (Starlight)
  - `iterations/round-2/` (fresco showcase)
  - `iterations/round-3/` (the window)
  - `iterations/round-4/shots/` (this version)
  - `final/prototype/` is the round 3 prototype. Round 4 was made directly in the site.
- **Repository:** `https://github.com/arinb44/portfolio`, branch `fresco-intro`. `main` still has the old home page.

## 8. Decision Log
1. **Setup, #1–#7:** project root, a new project, setup answers, deliverables, the `fresco-intro` slug and branch, agent file and plan approved.
2. **First version, #8–#16:** Starlight, zoom 2, the 3524 px image, header fade, round 1, once per tab, no opening in the reading layout, image path, repository.
3. **Amendment 1, #17–#19:** the intro leads to the projects.
4. **Amendment 2, #20–#27:** no particles, the fresco as a window, project images full screen; round 3 approved.
5. **Amendment 3, #28–#29:** ported into the site.
6. **Round 4, #30–#32:** full-screen warm-white flash with the projects there at once, no window opening, the fresco covering the screen with the header hidden.

## 9. Known Issues & Next Steps
- **Placeholder images:** the seven project images are placeholders. Replace the `varnish` images with real screenshots, then re-check the contrast (the nav is thinnest at 4.98:1; strengthen the top gradient if one fails).
- **Not on `main` yet:** merging `fresco-intro` into `main` (and deploying) is the user's call.
- **Removed features** (the user's choices): the cursor-as-Adam journey, the per-project spark, and Falling Constellations playing live behind its stop.
- **Testing:** Chromium on one GPU only. Firefox, Safari and integrated GPUs are not tested.
