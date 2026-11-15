# The Fresco Opening: Design Specification

**Prepared by:** Fresco Intro Designer
**Date:** 2026-11-15 (round 5, in the site; earlier versions: Starlight at `ae6f301`, the window at `678f89a`, round 4 at `6474770`)
**Status:** Final

## 1. Overview
The portfolio's home page opens close on God's face in Michelangelo's full *Creation of Adam*, covering the whole screen with no header. The camera sweeps along his arm to the gap between his and Adam's fingers. As it moves, the figures shift against the plaster and the focus pulls onto the fingers. Dust drifts in the air, light runs along the plaster's cracks to the gap, and rays fan out. The fingertips reach across and touch, with a spark. The camera dives into the gap and the whole screen flashes warm white. At the flash's peak the projects are simply there, with no fade-in: each project's own image fills the screen behind its card, and the header is back. Scrolling steps through the seven projects. The opening runs by itself in 4.7 s, once per browser tab, and can always be skipped. It replaces the old cursor journey (the ring and God's particle build).

## 2. Design Rationale
- **Entering the painting** (#32, #33). The fresco fills the screen, and the camera follows God's reach: face, arm, fingers. The visitor moves through the moment of creation rather than looking at it.
- **Depth without cut-outs** (#33). A smooth depth map lets the figures move against the plaster and swell as the camera closes in, with no torn edges. Focus pulls onto the fingers.
- **Anticipation** (#33). Dust, light running along the cracks, and rays from the gap build towards the flash.
- **The touch** (#33). The fingers that never meet in the fresco do meet here, and the spark at contact starts the light.
- **One full-screen flash, then the projects** (#30). The projects appear under the flash instead of fading in, so the light clears onto the finished page.
- **The projects' own images** (#20, #22, #23). The world you arrive in is the work itself.

## 3. Visual Foundations
- **Colour:** the tokens are unchanged (`src/styles/tokens.css`). Added for decoration:
  - **Flash:** warm white `#FFF6E6`, full screen at its peak.
  - **Gathering light, rays, crack glow and spark:** gold `#C8A24A` with warm-white cores.
  - **Dust:** warm white.
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

  The skip pills (gesso and stone-200 on 88% ink) are ≥ 7.7:1 over the plaster.
- **Typography:** unchanged (Atlas: Gloock, Newsreader, IBM Plex Mono).
- **Layout:**
  - **Opening:** the camera keeps the screen covered by the painting throughout (zoom never below max(width / 3524, height / 1599)), and stays inside the painting's edges.
  - **Showcase:**
    - each project image covers the screen
    - the card sits at 5vw with a width of min(30vw, 30rem)
    - a left gradient (ink 94% to 32%, 55% at 46%, clear by 64%) and a top gradient (ink 80% fading out over 9rem) keep the text readable
- **Imagery:**
  - **Fresco:** `public/creation/fresco.webp` (Wikimedia Commons, public domain, 3524 × 1599, q80, 820 KiB). Gap (1335, 728); fingertips: Adam (1331, 733), God (1339, 723).
  - **Depth map:** `public/creation/fresco-depth.png` (881 × 399 grayscale, 29 KB).
  - **Project images:** the first image of each project's first layer (`varnish`), through Astro's `<Image>` (960 / 1600 px WebP). Placeholders today.

## 4. Screens / Pieces
The site runs at `npm run dev` (http://localhost:4321/). Add `?review` for replay, scrub, slow motion and a switch per idea, or `?t=3.55` to freeze a moment. Key moments are in `iterations/round-5/shots-site/sheet-site.png`.

Positions below are in the 3524 px image; zoom is screen px per image px.

| Time (s) | What happens |
|---|---|
| 0 | Close on God's face (2029, 358) at zoom 1.3, tilted 3.4°. Only "Skip to the projects" (bottom left) and "Skip intro" (bottom right) are on screen, and the dust starts to appear. |
| 0 – 3.0 | The camera sweeps through the shoulder (1899, 588), elbow (1729, 643) and wrist (1554, 693) to the gap at zoom 2 (Catmull-Rom, eased). The tilt settles. The figures lead the camera by 6% of its offset and swell by 5%. |
| 1.4 – 3.0 | Focus pulls onto the fingers: the screen edges soften (up to 2.6 mip levels). |
| 2.2 – 3.5 | Light runs along the plaster's cracks, from 1500 image px away in to the gap. |
| 3.0 – 3.55 | The fingertips reach across the gap and meet at the midline; a spark at contact. |
| 3.3 – 3.95 | Rays fan out from the gap; from 3.55 the gold light gathers there. |
| 3.7 – 4.5 | The camera dives into the gap (zoom 2 → 16, cubic). The figures swell a further 12% and the dust streams outward. |
| 3.95 – 4.15 | The whole screen goes warm white. |
| 4.15 | Peak: the fresco is gone; the projects, their images, the gradients and the header are there at once. |
| 4.15 – 4.7 | The flash clears onto the projects; at 4.7 the opening's layers are removed. |

**States**
- **Skip intro / Esc:** a 0.25 s dip to the night sky, then the projects.
- **Skip to the projects** (and the nav's Projects link): the projects at once, with focus on the first "View project".
- **Projects at once, no opening:** reduced motion, a repeat visit in the same tab, the reading layout (≤ 900 px wide or ≤ 560 px tall, i.e. 200–400% zoom), no WebGL2, or a failed image load.
- **No JavaScript:** the projects with the first project's image.
- **Phones and tablets:** the "This site needs a computer" notice.
- **Showcase:** scroll snaps one project per screen, and the current project's image cross-fades (0.6 s; instant under reduced motion).

## 5. Components & Tokens
- **`src/scripts/intro.js`:** `playIntro()`, which returns `{ done, toShowcase() }`.
  - Raw WebGL2 in three passes:
    1. the fresco: a mipmapped texture with the depth rubber-sheet, the fingertip warp, the focus blur (mip bias) and the crack glow in one fragment shader
    2. 420 dust motes (additive points)
    3. the light: bloom, rays and spark (additive)
  - The full-screen flash is a CSS layer (`.flash`), so it sits above the cards and header when they appear under it.
  - Constants: `GAP`, the fingertips and their directions, `ARM` (camera keys), `ZOOM = 2`, `THROUGH = 16`, timeline `TL`. `?fx=` switches the four ideas (all on by default).
- **`public/creation/fresco-depth.png`** (#35), made by `tools/make_depth.py`:
  - God's group: the traced creation-redesign mask, placed at (1339, 43)
  - Adam and his ground: keyed from the plaster
  - blurred with σ = 14 px
- **`src/scripts/home.js`:** `startPage()`, which wires the skip links and an IntersectionObserver that shows the current project's image.
- **`src/pages/index.astro`**, in order:
  - Skip intro (first in `<body>`) and Skip to the projects
  - `.visuals` (one decorative `<Image alt="" data-for>` per project)
  - `canvas#intro` and `.flash`
  - the header and the 7 cards
- **`src/styles/creation.css`:**
  - styles for `.visuals` and its gradients, `#intro`, `.flash`, Skip intro and the pills
  - the header is hidden during the opening (`opacity: 0`, no clicks) and shows on a solid ink band when it holds keyboard focus
  - no fade on the cards
- No new design tokens.

## 6. Accessibility & Responsiveness
- **`npm test`:** astro check 0 errors, 11 pages, unit 12/12, Playwright 41/41. The 14 home page tests include axe (WCAG 2.0–2.2 A/AA plus best-practice) during the opening and on the projects.
- **Keyboard:**
  - Tab order during the opening: Skip intro → Skip to the projects → Projects → About → CV → Email.
  - When focus reaches the nav, the header shows on a solid ink band.
  - Esc skips.
  - Screen readers find the name and nav throughout.
- **Flash (WCAG 2.3.1 / 2.3.2):** one flash (rises over 0.2 s, clears over 0.55 s), well under three per second. It is full screen and bright, which the user chose over the earlier "no full-screen white" (#30). Visitors with reduced motion never see it, nor any of the opening's motion.
- **Screen sizes:** the opening covers the screen and lands 0 px off-centre at 1280 × 800, 1440 × 900 and 1920 × 1080. At 200% / 400% zoom the page uses the reading layout, with no opening.
- **Frame rate** (Chromium, RTX 4070 laptop GPU, 1440 × 900): 142.9 fps on the live site at pixel ratio 1.5 (143.1 in the prototype), p95 7.2 ms, worst frame after the start 7.6 ms.
- **The touch:** it stretches the fingertips. While they reach (about 3.3–3.55 s) a faint crease shows where they meet; then the spark covers it.

## 7. Files & Links
- **The site (source of truth):**
  - `src/scripts/intro.js`, `src/scripts/home.js`, `src/pages/index.astro`, `src/styles/creation.css`
  - `tests/e2e/home.spec.ts`
  - `public/creation/fresco.webp`, `public/creation/fresco-depth.png`
  - `README.md`
- **Project documents** (`output/fresco-intro/`): `designAgent.md`, `plan.md` (Amendments 1–3 approved), `progress.md`, `decisions.md` (#1–#35), this spec.
- **Record:**
  - `directions/` (A, B, C)
  - `iterations/round-1/` (Starlight)
  - `iterations/round-2/` (fresco showcase)
  - `iterations/round-3/` (the window)
  - `iterations/round-4/shots/` (round 4)
  - `iterations/round-5/` (the four ideas, switchable; `shots/` per idea, `shots-site/` the live site)
  - `tools/make_depth.py`, `data/fresco-depth.png`
  - `final/prototype/` is the round 3 prototype.
- **Repository:** `https://github.com/arinb44/portfolio`, branch `fresco-intro`. `main` still has the old home page.

## 8. Decision Log
1. **Setup, #1–#7:** project root, a new project, setup answers, deliverables, the `fresco-intro` slug and branch, agent file and plan approved.
2. **First version, #8–#16:** Starlight, zoom 2, the 3524 px image, header fade, round 1, once per tab, no opening in the reading layout, image path, repository.
3. **Amendment 1, #17–#19:** the intro leads to the projects.
4. **Amendment 2, #20–#27:** no particles, the fresco as a window, project images full screen; round 3 approved.
5. **Amendment 3, #28–#29:** ported into the site.
6. **Round 4, #30–#32:** a full-screen warm-white flash with the projects there at once; no window opening; the fresco covering the screen with the header hidden.
7. **Round 5, #33–#35:** more animation, with all four ideas in the site (cinematic camera, depth and focus, light builds, the touch); the depth map at `public/creation/fresco-depth.png`.

## 9. Known Issues & Next Steps
- **Placeholder images.** The seven project images are placeholders. Replace the `varnish` images with real screenshots, then re-check the contrast. The nav is thinnest at 4.98:1; strengthen the top gradient if any text fails.
- **Not on `main` yet.** Merging `fresco-intro` into `main` (and deploying) is the user's call.
- **Removed features** (the user's choices): the cursor-as-Adam journey, the per-project spark, and Falling Constellations playing live behind its stop.
- **Testing.** Chromium on one GPU only. Firefox, Safari and integrated GPUs are not tested; the opening now does more per frame (depth, crack glow, dust), so a weaker GPU is worth checking.
