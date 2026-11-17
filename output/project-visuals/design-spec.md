# Project Visuals: Design Specification

**Prepared by:** Project Visuals Designer
**Date:** 2026-11-16
**Status:** Final for the NBA Game Predictor loop. The other six projects (M4) come next, under a plan amendment.

## 1. Overview
The NBA Game Predictor's main visual on the portfolio home page is an 8.42 s seamless loop of a Luka Dončić highlight, repainted frame by frame in the style of Michelangelo's *Creation of Adam* (direction A, *Buon fresco*). It plays full screen behind the NBA card in the project showcase and replaces the placeholder image there. A local renderer paints it from a broadcast clip the user supplied. The user chose to publish the repainted footage and accepts the rights risk (decision #6). The project page is unchanged; it keeps leading with the dashboard (#27).

## 2. Design Rationale
- **It looks like the ceiling, not a filter.** The colours come from the painting itself: a tone ramp of the fresco's median colour at each brightness, from umber rock through flesh ochre to plaster. The real wall's grain and cracks lie over the paint and stay still while the play moves. Of the three M1 directions, A read most like the fresco and was the only one with no added flicker.
- **The colour was pushed twice at the user's request** (#20, #24). The footage keeps its own hue at 110% and the ramp is 1.45× more saturated, so the Lakers and Kings purples, skin and the ball keep their identity as pigment.
- **It loops on a cut.** The segment ends just after the make (frame 201), so the jump back to the crossover reads as one more edit (#14).
- **It frames around the card.** The footage is scaled 1.36× from its left edge, so the play sits in the clear right half (#15).
- **It's quiet enough to sit behind text.** Arena logos and the shot clock are flattened into plain paint (#18). A soft shade under the header keeps the nav readable. Flashes stay at most 1 per second.

## 3. Visual Foundations
- **Colour.** No new tokens. The page keeps Night Sky: ink `#1F1D1A`, gesso `#EEE9DF`, stone-200 `#CFC8BA`, stone-700 `#4A4740`, gold `#C8A24A`, ochre `#C29545`. The loop's palette is derived from the fresco (above), with contours in umber `#3A2A1E`.
- **Contrast** over every frame, at 1280 × 800, 1440 × 900 and 1920 × 1080:

  | Text | Colour, size | Lowest ratio | Needed |
  |---|---|---|---|
  | Card count | gold, 13 px | 4.94 | 4.5 |
  | Card meta | stone-200, 14 px | 7.24 | 4.5 |
  | Card title, line, links | gesso | higher | 3 / 4.5 |
  | Header nav | stone-200, 14 px | 8.05 | 4.5 |
  | Header name, tagline | gesso / stone-200 | higher | 3 / 4.5 |
  | Pause pill | gesso on its own ink fill | 13.9 | 4.5 |
  | Poster frame (grain baked in) | card count | 4.83 | 4.5 |

  The video figures are for the grain-free video. The delivered version adds the plaster on top, which only darkens, so its real ratios are at least these.
- **Typography.** Unchanged: Gloock, Newsreader and IBM Plex Mono. The pause pill uses IBM Plex Mono at 13 px with 0.04 em letter spacing.
- **Layout.** The loop is `object-fit: cover` under the home page's two existing gradients (and the header's own). The pause pill sits bottom-right, 2.5 rem from the right edge and 2 rem from the bottom.
- **Imagery.**
  - Source: 1280 × 720 footage, 24 fps (de-pulled from 60), reframed and painted at 1600 × 900.
  - Painting: Kuwahara paint patches (r 6), motion-adaptive temporal smoothing, the fresco tone ramp plus the footage's hue, sfumato blur (σ 1) and faint XDoG contours.
  - Plaster: the fresco's bare wall (full-res x 710–1690, y 20–571), with one oval mark patched out.

## 4. Screens / Pieces
**The NBA stop on the home page.** Preview: `output/project-visuals/final/index.html`; live: `/` on the dev server, then scroll to project 3.
- **Playing:** the loop plays while the NBA stop is the one on screen and pauses when you scroll away. It fades in and out over 0.6 s, like the images.
- **Before the first frame:** the poster shows (`preload="none"`; the video loads when the stop is reached). The plaster overlay turns on only after the video has played, because the poster already has the grain.
- **Paused by the visitor:** the pill says "Play the background video". The loop stays paused if you scroll away and come back.
- **Reduced motion, or the reading layout (≤ 900 px wide or ≤ 560 px tall):** the poster only, with no pause control.
- **No JavaScript:** the page as before (the first project's image); the NBA image underneath stays the placeholder `varnish.png`.
- **Errors:** if `play()` fails, the poster stays.

### Falling Constellations (home stop 01, approved 2026-11-17, #38)
- **Source:** the public live page, recorded with `tools/fc_record.cjs` (1600 × 900, real GPU, five clicks summon constellations on the right).
- **Loop:** 10 s, 240 frames at 24 fps, the first second cross-faded so the restart has no jump. Reframed ×1.36 from the left; the galaxy sits right of the card.
- **Look:** the NBA settings unchanged (ramp ×1.45, hue 1.1), which make the sky a dark violet-umber vault. Two additions in `tools/render.py` (`PROJECTS['fc']`): the field is blurred (sigma 2.5) before the paint patches, and the stars and constellation lines are laid back on top as gilding in `#E8D8B4`.
- **Files:** `public/projects/falling-constellations/`: `loop.webm` (2.0 MB), `loop.mp4` (1.7 MB), `poster.webp` (108 KB, frame 120).
- **Checks:** every frame at 1280 / 1440 / 1920 passes (lowest: nav Email 5.66, card count 6.37); flicker 0.7× the source; 0 flashes per second; seam step inside the normal frame-step range. Preview: `iterations/m4-1-round-1/`.
- **On the page:** as the first stop, it starts once the opening is over; the pause pill is hidden during the opening.

## 5. Components & Tokens
- **A loop on any project:** put `loop.webm`, `loop.mp4` and `poster.webp` in `public/projects/<slug>/`. The plaster is shared: `public/projects/plaster.webp` (#40). The poster is also that project's still home image, in place of its placeholder (#40). `src/pages/index.astro` adds the loop for any project whose folder has `loop.webm`.
- **Pause control:** `.pause-loop` in `src/styles/creation.css`; its behaviour is in `src/scripts/home.js`.
- **Figma components:** "Site header", "Project card / NBA Game Predictor", "Pause control". **Variables:** "Night Sky" (ink, gesso, stone-200, gold).
- **Renderer:** `output/project-visuals/tools/render.py` (A only; the colour settings `CHROMA, RAMP_SAT = 1.1, 1.45`; the logo keyframes in `LOGOS`). `tools/render_m1.py` is the three-way M1 version.

## 6. Accessibility & Responsiveness
- **Contrast:** WCAG 2.2 AA met over every frame at all three sizes (section 3).
- **Pause, Stop, Hide (2.2.2):**
  - The pause pill is a real button; its label says the action.
  - It is in the tab order after the nav.
  - It works with the mouse, Space and Enter (Playwright).
  - It has a 2 px ochre focus ring and is 36 px tall.
- **Three Flashes (2.3.1):** at most 1 flash per second (general-flash check on the frames). Red flashes were not checked separately.
- **Decoration:** the loop is muted, with no audio track, inside `aria-hidden` `.visuals`; the card carries the text.
- **Reduced motion and the reading layout:** the poster, with no motion.
- **Motion quality:** flicker is 0.88× the source's own frame-to-frame jitter, so none is added.
- **Breakpoints:** desktop only (the site's "needs a computer" notice covers touch devices). Checked at 1280, 1440 and 1920. Dark only.
- **Not checked:** other browsers than Chromium, weaker GPUs, and the MP4 fallback in Safari.

## 7. Files & Links
- **In the site (branch `project-visuals`):**
  - `public/projects/nba-predictor/`: `loop.webm` (2.8 MB), `loop.mp4` (2.7 MB, fallback), `plaster.webp` (106 KB), `poster.webp` (82 KB)
  - changed: `src/pages/index.astro`, `src/scripts/home.js`, `src/styles/creation.css`, `tests/e2e/home.spec.ts`
- **`output/project-visuals/`:**
  - `designAgent.md`, `plan.md`, `progress.md`, `decisions.md`, `figma-links.md`, `design-spec.md`
  - `tools/` (`m0_probe.py`, `m0_framing.py`, `dupes.py`, `render_m1.py`, `render.py`, `contrast.py`)
  - `directions/` (M0 preview, M1 directions and their shots)
  - `iterations/round-1/`, `iterations/round-2/`
  - `final/` (the files above, `index.html`, `shots/`)
- **`art-src/project-visuals/` (git-ignored, never committed):** the reference clip copy, the 24 fps master, the M0 trims.
- **Figma:** "Project visuals", https://www.figma.com/design/LjRLiaTQO2MT2R3EPU34kP. Page "M1 · NBA loop directions" and page "Final · NBA loop".

## 8. Decision Log
29 decisions in `decisions.md`. The key ones:
- **Setup and source:**
  - NBA first, then the other six (#3)
  - broadcast clip published at the user's risk (#6)
  - local renderer only (#7)
- **The loop:**
  - segment B, 0–8.42 s, restarting on a cut (#14)
  - reframe ×1.36 (#15)
  - direction A, Buon fresco (#17)
  - logos softened (#16, #18)
  - more colour, twice (#20, #24)
- **Delivery:**
  - plaster as an overlay (#21)
  - corner pause pill (#22)
  - poster frame 150 (#23)
- **The site:**
  - home page only, files in `public/projects/<slug>/` (#26, #27)
  - repository `arinb44/portfolio`, branch `project-visuals` (#28, #29)

## 9. Known Issues & Next Steps
- **Rights:** the footage is NBA broadcast material (decision #6).
- **Source quality:** the source is 1280 × 720, upscaled about 1.7× at 1440 and 2.0× at 1920. The paint hides most of it.
- **Logo masks are keyframed by hand.** If the clip or segment changes, they must be redone.
- **Download:** about 3 MB on the home page's third stop. It loads only when that stop is reached.
- **M4:** the other six projects. A plan amendment comes first (a reference for each, video or still).
- **Branches:** `fresco-intro` (the opening) is still unmerged into `main`, and `project-visuals` builds on it.
