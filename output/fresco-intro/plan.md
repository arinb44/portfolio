# Plan: Fresco Intro

## Project Title
The Fresco Intro: the full *Creation of Adam* builds from particles, the camera lands between the two fingers, and a flash of light opens the home page.

## Objective
Design a 6–8 s intro that plays by itself when the home page loads. Particles fade in to the full original fresco (God, Adam, the plaster and its cracks); the camera zooms in and comes to rest on the gap between God's and Adam's fingers at the centre of the screen; one soft flash of light goes off there and clears into the current home page, whose gold ring sits at that same centre. It gives the site a cinematic first moment that sets up the cursor-as-Adam interaction that follows.

## Users & Context
The site's existing visitors (college reviewers such as MIT Maker Portfolio, recruiters, clients) opening the home page on a laptop or desktop with a mouse or trackpad. Phones and tablets keep the "This site needs a computer" notice and never start the scene.

## Design Requirements
1. **The fresco:** the full painting as in the Commons original (3524 × 1599): God, Adam, the plaster ground and its cracks, in its own colours. Not the cut-out figure group the home page uses.
2. **Particles fade it in:** the painting appears through particles; where they have settled, the real painting texture takes over, so it is smooth when zoomed in (the technique from creation-redesign round 1).
3. **The landing:** the camera ends with the gap between the fingertips (≈ (1334, 727) in the 3524 px source; God's fingertip ≈ (1338, 720), Adam's ≈ (1330, 734); the gap is about 18 source px) exactly at the centre of the screen, at 1280 × 800, 1440 × 900 and 1920 × 1080.
4. **The flash:** one soft bloom of light at the gap. No strobe, no flicker, no full-screen white; meets WCAG 2.3.1 (at most three flashes in any one second; this is one).
5. **The handover:** the flash resolves into the home page's gold ring at the screen centre and the fresco fades into the night sky, leaving the home page's starting state (dim stars, ring, "Bring your cursor to the circle"). No visible jump.
6. **Timing:** about 6–8 s in total, on every load of the home page (decision #3; see Open Questions).
7. **Skip:** a visible "Skip intro" button from the first frame, reachable by keyboard as the first tab stop; Esc also skips. Skipping jumps to the handover's end state with a short (≤ 300 ms) fade. The existing "Skip to the projects" link still works during the intro (skips the intro and reveals the projects).
8. **Reduced motion:** the still fresco, fitted to the screen, no particles, zoom or flash; after a short hold it cross-fades into the home page (which is already revealed under reduced motion). Skip works here too.
9. **Fallbacks:** without JavaScript or WebGL2, or if the fresco fails to load, the page behaves exactly as today.
10. **Look:** Night Sky / Atlas, unchanged: ink `#1F1D1A`, gesso `#EEE9DF`, stone-200 `#CFC8BA`, gold `#C8A24A`, ochre `#C29545` focus; Gloock / Newsreader / IBM Plex Mono. No new tokens or fonts.
11. **Performance:** frame rate, particle build time and download size measured on the user's laptop GPU and reported every round.

## Scope
**In scope**
- The intro sequence (fade-in, camera, flash, handover), its Skip control and its reduced-motion version.
- A web-sized image of the full fresco.
- The one hook in the home page that the handover needs (the home scene waits until the intro has finished), in prototype copies only.

**Out of scope**
- The rest of the home page (God's particle journey, ring, reveal, project stops, Falling Constellations backdrop), the other pages, tokens, fonts, Figma, project content.
- Changing anything in `src/`. Wiring the intro into the Astro site is not in this plan (see Open Questions).

## Deliverables
| Deliverable | Format | Saved to |
|---|---|---|
| 3 intro directions, each playing into a copy of the current home page | HTML / CSS / vanilla JS / raw WebGL2 | `output/fresco-intro/directions/<a,b,c>/index.html`, shared engine in `directions/shared/` |
| Refinement rounds | same | `output/fresco-intro/iterations/round-<n>/` |
| Final prototype | same | `output/fresco-intro/final/prototype/` |
| Full fresco image | WebP | `output/fresco-intro/final/fresco.webp`, then `public/creation/fresco.webp` after you confirm the path |
| Review screenshots | PNG | `shots/` inside each round |
| Design spec | Markdown | `output/fresco-intro/design-spec.md` |

The prototypes run from a static server at the project root (a `fresco-prototypes` entry in `.claude/launch.json`, `python -m http.server`), so they can load `public/creation/` directly. The home page parts are copies of `src/scripts/creation.js`, `src/scripts/home.js` and `src/styles/creation.css` + `tokens.css` placed in `directions/shared/home/`; the site's own files stay untouched.

## Design Process
1. **Source image:** copy the Commons original from the worktree's git-ignored `art-src/` into the main checkout's git-ignored `art-src/`, and make the web image with a small script in `output/fresco-intro/tools/` (`python -I`).
2. **Intro engine** (`directions/shared/intro.js`): its own canvas above the home page's canvas. Particles sampled from the fresco (stride 3, about 626,000; stride adjustable for testing), the painting texture where they have landed, a camera timeline that ends on the gap at the screen centre, and the flash. A review bar behind `?review` (replay, scrub, 0.25×–1× speed) for judging timing.
3. **Three directions** that differ in how the painting appears, how the camera travels and how the light looks:
   - **A. Starlight.** The page opens on the night sky; stars drift together and condense into the fresco, the painting fading in where they settle. One slow, continuous push-in from the whole fresco straight to the gap. A warm gold bloom at the gap that shrinks into the ring.
   - **B. Pigment on plaster.** The bare plaster and its cracks fade in first, like fresh lime; matte pigment dust then settles onto it and colours the figures, Adam first, then God. The camera follows the reach: Adam's face, along his arm to his hand, then across to the gap. A thin spark jumps from God's fingertip to Adam's, then a short white-gold bloom.
   - **C. Looking up.** The fresco starts small and tilted, as if seen from the chapel floor; particles shimmer into place across the whole painting at once until it is solid. The camera rises, straightens and zooms to the gap. Light spreads from the gap into a soft wash (capped well below full white) that clears into the night sky.
4. You pick one (or a combination); it is refined in rounds, each with a list of what changed and the quality checks below.
5. Final checks, final prototype, the fresco image placed in the site after you confirm the path, and the design spec.

## Accessibility & Responsiveness
- WCAG 2.2 AA: text contrast reported with real ratios (Skip intro, caption, header over the fresco); targets ≥ 24 × 24 px; visible 2 px ochre focus ring; axe 0 violations during and after the intro.
- Keyboard: Skip intro is the first tab stop; Esc skips; "Skip to the projects" still works.
- Reduced motion: still fresco, no particles, zoom or flash (requirement 8).
- Flash: one flash, checked against WCAG 2.3.1; no saturated red.
- Screen sizes: 1280 × 800, 1440 × 900, 1920 × 1080; the landing is measured at each (the gap's distance from the screen centre, in px).
- Zoom: behaviour in the reading layout (≤ 900 px wide or ≤ 560 px tall, i.e. 200% / 400% zoom) is decided with you (Open Questions).
- Colour mode: dark only (Night Sky).

## Milestones
1. **M1 Directions:** fresco image, intro engine, directions A, B, C playing into the home page; measurements (fps, build time, download). Ends with you choosing a direction.
2. **M2 Refine:** rounds on the chosen direction: timing, landing zoom, flash, handover, Skip, reduced motion. Ends with you approving a round.
3. **M3 Checks:** keyboard, reduced motion, three screen sizes, zoom, flash, contrast, axe, frame rate on the chosen version.
4. **M4 Delivery:** `final/prototype/`, `final/fresco.webp`, the image copied to `public/creation/` (path confirmed), `design-spec.md`, summary.

## Decision Points
- **D1** (M1): which direction (or combination).
- **D2** (M1/M2): landing zoom. About 2 screen px per source px (both hands and wrists in frame; the same sharpness as the home page) or about 3 (just the hands, softer, because the source photo has only ~18 px across the gap).
- **D3** (M1): fresco image size: 3524 px at quality 80 (820 KiB, sharpest landing) or 2560 px at quality 88 (651 KiB, softer up close). Measured, both shown side by side at the landing.
- **D4** (M2): the header (name and nav) during the intro: visible throughout, or fading in at the handover.
- **D5** (M3): what the reading layout (200% / 400% zoom) does: play the intro, or skip straight to the page.
- **D6** (M4): the exact source-tree path for the image (proposed `public/creation/fresco.webp`).
- **D7** (before the first commit): which GitHub repository the commits go to, and whether to push.

## Risks & Limitations
- **Sharpness at the landing:** the best local source is 3524 px wide, so the two fingertips are only ~18 px apart. Tight framing upscales them about 3× and will look soft (D2, D3). A larger scan would need a new download (asked first).
- **Frame rate and load:** the intro adds ~626,000 particles and a 22 MB texture on top of the home page's ~693,000 particles; both scenes are built on load. Build time could delay the start; measured in M1 and reduced by a larger stride if needed.
- **Download:** +651–820 KiB on top of the home page's 616 KiB painting. Until it loads, the page shows the night sky and the name; the intro starts once the image is ready (time to start measured).
- **Every load:** the intro also replays when someone comes back to the home page from a project page (Open Questions).
- **Handover:** the home page's starting state is a dim starfield, so the fresco has to dissolve into it; directions show how cleanly each one does that.
- **Testing:** the browser pane pauses animation when hidden, so timing and frame rate are measured with Playwright on the real GPU (as in creation-redesign).
- **Rights:** the photo is marked public domain on Wikimedia Commons; the Vatican Museums' own terms are unchecked (as before).

## Open Questions
1. **Replay rule:** the intro plays on every load (decision #3), which includes coming back from a project page. Keep that, or play it once per browser tab session? *Recommendation:* once per tab session; the answer can wait until M2.
2. **Reading layout (D5):** *Recommendation:* skip the intro there, because people zoomed to 200–400% are there to read.
3. **Into the site:** this plan ends with a tested prototype, the image in `public/creation/` and the spec. Wiring the intro into `src/` is a program agent's job, or a later amendment to this plan if you want it done here.

**Status:** Approved on 2026-11-15

---

## Amendment 1 (2026-11-15): the intro leads straight into the project showcase

**Asked by the user:** the project showcase should have the intro instead of what it had (the ring and the cursor building God), and the painting should form while the camera zooms in, at the same time (decisions #17, #18).

**New flow (about 5.5 s, then the projects):**

| Time (s) | What happens |
|---|---|
| 0 – 0.2 | Night sky and stars; header visible |
| 0.2 – 4.0 | Particles form the full fresco **while** the camera zooms from the whole painting to the gap (the gap forms last, as the camera arrives) |
| 3.9 – 4.2 – 4.9 | The gold bloom at the gap |
| 4.5 – 5.8 | The camera pulls back; the full fresco settles on the right of the screen |
| ~5.3 | The first project card appears on the left; scrolling steps through the 7 projects |

**Changed requirements**
- **R5, the handover:** instead of dissolving into the night sky and the ring, the camera pulls back into the showcase. The ring, the caption and the cursor journey (God's cut-out particle build, `creation.js`) are no longer on the home page.
- **R6, timing:** about 5.5 s before the projects appear; formation and zoom run together.
- **R7, Skip:** Skip intro and Esc jump to the showcase. "Skip to the projects" also focuses the first project. A visitor who has already seen the intro in this tab, or who is in the zoomed reading layout, gets the showcase at once.
- **R8, reduced motion:** the showcase at load, with the full fresco still. There is no intro, so nothing covers the projects.
- **R9, fallbacks:** without WebGL2 or JavaScript, the still full fresco (`fresco.webp`) and all 7 projects, replacing the cut-out still.
- **New, the showcase:**
  - The full fresco framed on the right with the project card on the left, using today's card design.
  - A small gold bloom at the gap each time a new project comes to rest (replacing the spark at God's fingertip).
  - Falling Constellations plays behind its own stop, centred on the gap.
  - The reading layout puts the fresco on top and the cards below.

**Scope:** the home page's showcase is now in scope (layout around the full fresco, the per-project light, the backdrop position). Out of scope: the cards' design and content, the header and footer design, the other pages, and `src/` (the port stays separate).

**Deliverables:**
- `iterations/round-2/`: the opening and showcase as one page, built on the round 1 engine.
- After approval: `final/prototype/` updated and `design-spec.md` revised.
- Directions, round 1 and the first final prototype stay as the record (in git at `ae6f301`).

**Decision points:**
- **D7 (round 2):** how the wide fresco (2.2 : 1) sits beside the cards. It will be shown, with alternatives if it looks too small.
- **D8 (round 2):** keep the per-project bloom or drop it.

**Risks:**
- The full fresco is much wider than God's group, so on the right ~60% of a 1440 × 900 screen it is only ~400 px tall. The layout may need a different framing (D7).
- Removing the cursor journey removes creation-redesign's central interaction (the user's choice).
- The God cut-out files (`whole-group-aa.webp`, `particles.json`, `creation.js`) would become unused on the home page once ported.

**Status:** Amendment 1 approved on 2026-11-15

---

## Amendment 2 (2026-11-15): the fresco is a window into the projects

**Asked by the user:**
- After the flash the fresco is gone, and the projects' own visuals show.
- No particles: the fresco acts as a window the viewer enters.

The answers (decisions #20-#25): each project's main image, full screen behind its card; the gap opens into a window; the fresco is on screen from the first frame.

**New flow (about 4.7 s, then the projects):**

| Time (s) | What happens |
|---|---|
| 0 | The full fresco, fitted on the night sky; header visible |
| 0 – 3.0 | The camera moves in and lands on the gap between the fingers (zoom 2, gap at the screen centre); the header fades as the painting rises behind it |
| 3.0 – 3.3 | A short beat on the gap; the window starts to open there |
| 3.3 – 4.1 | The camera enters: the zoom accelerates through the gap while the soft-edged opening grows until it fills the screen. Through it: the first project's image |
| ~3.9 | The flash at the threshold (one soft gold bloom) |
| 4.2 – 4.7 | The fresco is gone; the first project's image fills the screen; its card and the left gradient fade in; header back |

**Changed requirements**
- **R1, R2 (particles):** removed. The painting texture is drawn directly.
- **R5, the handover:** the window into the showcase, replacing the pull-back. The fresco does not appear in the showcase.
- **R6, timing:** under 5 s.
- **R7–R9:** reduced motion, a repeat visit in the same tab, the zoomed reading layout, and no WebGL2 or JavaScript all get the showcase at once, with no fresco.
- **Showcase:**
  - Each project's main image (`src/assets/projects/<id>/varnish.png`, 1600 × 1000; placeholders today) covers the screen behind its card.
  - A dark gradient on the left and a light one along the top keep the card and header readable.
  - Moving to the next project cross-fades the images (0.6 s).

**Follows from the answers (proposed here; say if you want otherwise):**
- **The Falling Constellations live backdrop is removed,** because the visuals are main images only (#22).
- **The per-project bloom at the gap (D8) is removed,** because there is no gap in the showcase. The cross-fade marks the change.
- **The fresco still image is no longer used on the home page,** because the fallbacks show the showcase. `public/creation/fresco.webp` stays for the intro.

**Deliverables:**
- `iterations/round-3/`: the window version.
- After approval: `final/prototype/` updated and `design-spec.md` revised.
- Round 2 stays as the record.

**Risks:**
- **Contrast over images:** the card and header now sit over images, so contrast depends on each image. I'll measure with the placeholders, but real screenshots must be re-checked when they are added (a stronger gradient is the fix if one fails).
- **Placeholder images:** the showcase will look like placeholders until real screenshots exist.

**Status:** Amendment 2 approved on 2026-11-15

---

## Amendment 3 (2026-11-15): port the window design into the Astro site

**Asked by the user:** port the approved window design (round 3, decision #27) into the real site, here, on branch `fresco-intro` (decision #28).

**Changes in the source tree**

| File | Change |
|---|---|
| `src/scripts/intro.js` | **New:** the engine from `final/prototype/shared/intro.js`. The image path becomes `/creation/fresco.webp`; nothing else changes. |
| `src/scripts/home.js` | **Rewritten** from `final/prototype/shared/page.js`: skip links, the current project's image. The cursor journey, the ring and the live backdrop go. |
| `src/scripts/creation.js` | **Deleted** (the God particle engine; nothing else uses it). |
| `src/pages/index.astro` | Skip intro button first; `.visuals` with each project's main image through Astro's `<Image>` (optimised WebP, `sizes="100vw"`, first eager, rest lazy, `alt=""` because the card carries the text); `canvas#intro`. Removed: the backdrop iframe, `canvas#scene`, the cut-out still, the ring and caption. |
| `src/styles/creation.css` | The prototype's `intro.css` rules added; the ring, backdrop, still and `#scene` rules removed. |
| `public/creation/whole-group-aa.webp`, `public/creation/particles.json` | **Deleted** (only the old scene used them). `public/creation/fresco.webp` stays. |
| `scripts/painting.py` | **Deleted** (it only rebuilt `whole-group-aa.webp`; the design agent's source image stays in `output/creation-redesign/data/`). |
| `tests/e2e/home.spec.ts` | **Rewritten** for the new behaviour (below). Other tests unchanged. |
| `README.md` | The home page description, commands and file table updated. |

**Home page tests after the port** (`npm test`: astro check, build, unit, Playwright on the real GPU):
1. The intro plays: name and nav visible, Skip intro visible, projects hidden, axe clean.
2. It ends in the showcase on its own: revealed within 6 s, first project image shown.
3. The 7 stops come from the content collection, in order, with working links (unchanged).
4. Keyboard: Tab order Skip intro, then Skip to the projects. Enter on the second reveals and focuses Falling Constellations; axe clean after.
5. Skip intro (click) and Esc reveal; the nav's Projects link reveals.
6. Scrolling to a project shows its image.
7. Once per tab: a reload goes straight to the showcase.
8. Reduced motion, 720 px wide (reading layout, no sideways scroll), no WebGL2: the showcase at once.
9. Touch devices: the computer-only notice, scene not started.
10. JavaScript off: all 7 projects and the first image.

**Not changed:** the other pages, the content schema and files, the tokens and fonts, `Head.astro`, `Base.astro`, the other agents' `output/` folders. Nothing is merged into `main` or pushed without asking.

**Status:** Amendment 3 approved on 2026-11-15
