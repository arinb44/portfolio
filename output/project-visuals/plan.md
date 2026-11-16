# Plan: Project Visuals

## Project Title
The NBA Game Predictor's loop, repainted in the style of *The Creation of Adam* (then the other six projects' visuals)

## Objective
Every project's main visual on the portfolio is still a placeholder. This project replaces them with visuals that belong on the fresco ceiling, starting with the NBA Game Predictor. Its visual will be a 6–10 s seamless loop, repainted frame by frame from an NBA broadcast clip by a local renderer. It plays full screen behind the NBA card in the home page showcase and on the project's page. Once the NBA loop is approved, the same style is planned for the other six projects in an amendment to this plan.

## Users & Context
- **Viewers:** the site's visitors (college reviewers such as MIT Maker Portfolio, recruiters and clients), on a laptop or desktop.
- **Where it plays:** on the home page, after the fresco intro opens into the showcase. Each project's visual fills the screen (`.visuals`, `object-fit: cover`) behind its card, with a dark gradient on the left, and cross-fades as the visitor scrolls to the next project. The NBA loop plays there while its stop is in view, and also at the top of `/projects/nba-predictor/`.
- **Who decides:** the user approves every direction, round and final asset.

## Design Requirements
1. **The fresco look.** The palette is taken from the Creation of Adam (plaster, flesh ochres, earth reds, the grey-blue of God's mantle, the Night Sky ink). Plaster grain and cracks come from the fresco photo. Edges are soft and modelled (sfumato), not outlined like a cartoon. The result must not read as a video with a filter on top.
2. **No flicker.** The repainted frames are steady from one frame to the next, and the plaster texture and cracks stay fixed in place while the paint moves.
3. **Seamless loop.** 6–10 s, with no visible jump at the loop point.
4. **No broadcast graphics.** The score bug, network logo and ticker are cropped out or painted over (decision at M0).
5. **No strobes.** Arena and camera flashes are damped so the loop has no more than three flashes in any one second (WCAG 2.3.1), checked by measuring the frames.
6. **Readable card.** The card text (Gloock title, Newsreader body, IBM Plex Mono labels, in gesso and stone-200) meets WCAG 2.2 AA over every frame: at least 4.5:1 for body text and 3:1 for the large title. It is measured across the frames at each breakpoint.
7. **Pause control.** The loop lasts more than 5 s and starts by itself, so the page gets a visible, keyboard-reachable pause / play control (WCAG 2.2.2).
8. **Reduced motion and fallbacks.** Under `prefers-reduced-motion`, in the reading layout, without video support, and before the video loads, the visitor sees a poster still in the same style.
9. **Decoration.** The video is `aria-hidden` and muted with no audio track; the card carries the project's name and text.
10. **Size and speed.** WebM (VP9) plus MP4 (H.264) fallback at about 1600 px wide, with a 1–3 MB target for the loop. It is loaded only once the showcase is reached, so it never slows the intro. File size and the page's frame rate are measured each round.
11. **The site's look and stack.** Night Sky tokens and the existing fonts, with no new tokens or fonts. In the site: Astro, plain CSS, vanilla JS, and no new dependencies without approval.

## Scope
**In scope**
- The NBA loop: its look, framing, loop point, poster, and the pause control's design.
- A browser preview of the loop behind the NBA card.
- With approval of each path, placing the loop in the site: the files, plus the small changes to the home page and the NBA project page that play it.
- Figma frames, `design-spec.md`.
- After the NBA loop is approved: a plan amendment for the other six projects (which reference to use for each, video or still), approved before that work starts.

**Out of scope**
- The project cards' design and text, the header, the footer, the fresco intro, and the other pages' layout.
- New tokens or fonts, and the projects' written content.
- AI or hosted style-transfer models (decision #7).
- Any change in `src/` or `public/` before the design is approved and the path confirmed.

## Deliverables
| Deliverable | Format | Saved to |
|---|---|---|
| The renderer | Python (numpy, PIL) + ffmpeg 9; run with `python -I` | `output/project-visuals/tools/` |
| Directions A–C | MP4 previews + a page that plays each behind the NBA card | `output/project-visuals/directions/` |
| Refinement rounds | the same, per round | `output/project-visuals/iterations/round-<n>/` |
| Final NBA loop + poster | `nba-predictor.webm`, `nba-predictor.mp4`, poster `.webp` (plus the separate plaster overlay image, if that option is chosen) | `output/project-visuals/final/` first; proposed in the site: `public/projects/nba-predictor/`. The poster would replace `src/assets/projects/nba-predictor/varnish.png`, an overwrite asked about separately |
| Figma frames | key frames of each direction and the final, with notes on palette and settings | Figma (team "Arin Barman's team", connected and checked 2026-11-15); link in `figma-links.md` |
| Design spec | Markdown | `output/project-visuals/design-spec.md` |

The reference clip and all extracted frames stay in the git-ignored `art-src/` folder (`art-src/project-visuals/` for working frames) and are never committed.

## Design Process
1. **M0: read the clip.** Probe the clip with ffprobe (size, frame rate, length). Pull a contact sheet of stills, then propose 2–3 candidate 6–10 s segments that loop well (the camera holding on one play, with similar start and end frames). Also mark the broadcast graphics and any flashes. The user picks the segment and how to handle the graphics.
2. **M1: three directions**, all rendered from the chosen segment by one renderer with three settings, so they can be compared like for like:
   - **A · Buon fresco.** The play painted into wet plaster in full fresco colour. The frame is reduced to the fresco palette with soft modelled tones; the plaster grain and cracks from the Creation photo sit on top and stay fixed. It looks closest to the ceiling.
   - **B · Sinopia.** The red-ochre underdrawing that fresco painters laid on the wall first: the players drawn as soft sinopia lines over bare plaster, with thin washes of colour. Lighter and more graphic, and it reads like a work in progress, which suits a portfolio.
   - **C · Grisaille.** Like the painted stone figures on the Sistine ceiling: monochrome stone greys with strong chiaroscuro and gold highlights, on a darker ground. The most dramatic, and it sits closest to the site's Night Sky.

   Each direction is shown playing behind the NBA card in a copy of the home showcase (preview `fresco-prototypes`, or a new launch entry), with stills, file size and contrast numbers. The user picks one or a combination.
3. **M2: refinement rounds** on the chosen direction. Each round covers the look, flicker (temporal smoothing), the loop seam (a cross-fade of the last ~0.5 s into the first), the framing against the card at all three breakpoints, the pause control, the poster, and file size against quality. After every round: what changed, the checks, and a request for feedback.
4. **M3: final.** Final encodes and poster, final checks, Figma frames, then placing them in the site at the approved paths (after a separate approval), with `npm test` run.
5. **M4: the other six projects.** A plan amendment (references and format for each), approved before that work starts, and then the same directions → rounds → final process, likely shorter since the style is already set.
6. **M5: delivery.** `design-spec.md`, a list of every file, and the Figma links.

## Accessibility & Responsiveness
- **Standard:** WCAG 2.2 AA. This covers 1.4.3 (card text contrast, measured over every frame), 2.2.2 (the pause control), 2.3.1 (three flashes, measured), and reduced motion (the poster).
- **Flash check:** a script measures the frame-to-frame change in relative luminance over each region of the screen and counts general flashes per second against the WCAG thresholds. Red flashes are checked as well.
- **Breakpoints:** 1280 × 800, 1440 × 900, 1920 × 1080 (desktop only, as on the site). The reading layout (≤ 900 px wide or ≤ 560 px tall, from 200% / 400% zoom) shows the poster. Phones and tablets keep the "needs a computer" notice.
- **Colour mode:** dark only (Night Sky).
- **Keyboard:** the pause control is in the tab order with the ochre focus ring, and nothing traps focus.

## Milestones
1. **M0:** clip probed, segment and graphics handling chosen.
2. **M1:** directions A, B and C previewed behind the NBA card; the user picks one.
3. **M2:** refinement rounds until the user approves the NBA loop.
4. **M3:** final NBA loop, poster and Figma frames; placed in the site (each path approved).
5. **M4:** plan amendment for the other six projects; their visuals designed and approved.
6. **M5:** design spec and delivery.

## Decision Points
- **M0:** which 6–10 s segment; how to remove the broadcast graphics (crop in, or paint over with plaster).
- **M1:** which direction, or which combination.
- **M2:**
  - Plaster texture baked into the video, or a separate still image laid over it in the page (smaller and perfectly still, but one more file)
  - Which frame becomes the poster
  - File size against quality
  - How the pause control looks and where it sits
- **M3:**
  - The Figma location: a new file in your team, or a new page in the Creation redesign file
  - The exact site paths, and overwriting `varnish.png`
  - The site code changes
  - The GitHub repository and branch, asked before the first commit
- **M4:** the reference for each of the other six projects.

## Risks & Limitations
- **Rights.** The broadcast footage belongs to the NBA and its broadcasters. The user chose to publish it and accepts the risk (decision #6).
- **The clip is unknown.** Its resolution, compression and graphics will limit the look. A heavily compressed clip gives blocky paint.
- **Flicker** is the main failure of frame-by-frame repainting. It is handled with temporal smoothing and fixed textures, but fast camera pans may still smear.
- **No player cut-out.** No segmentation model is installed (no OpenCV or ML libraries), so the style applies to the whole frame. Isolating the players would need a new dependency, which I'd ask about first.
- **File size.** Fine grain compresses poorly. That is why the separate overlay option exists.
- **Contrast over moving footage.** Bright frames behind the card may need a stronger gradient or a darker grade on the left side.
- **Figma** is connected now (student team); frame images are uploaded from the renders.
- **Other machines.** Playback is only checked on the user's laptop (Chromium on the RTX 4070). Other browsers and weaker machines are not checked unless asked.

## Open Questions
- **The clip:** not in `art-src/` yet. Save it as, for example, `art-src/nba-reference.mp4` and tell me.
- **Figma:** a new file in your team, or a new page in the Creation redesign file? This can wait until M1.
- **Repository and branch:** asked before the first commit. The current checkout is on `fresco-intro` with untracked screenshots from that project.

**Status:** Approved on 2026-11-15
