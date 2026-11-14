# Plan: Creation Redesign

## Project Title
**The Creation:** a scroll-driven home page where God from Michelangelo's *The Creation of Adam*, built from nodes, points each of the 7 projects to the visitor.

## Objective
Replace the altarpiece home page with one memorable scene. On every visit the page opens on scattered nodes with the name readable at once. Scrolling assembles God's figure from dots, lines and simple shapes while the camera pans down the arm to the finger. Further scrolling brings the 7 projects, one at a time, to the fingertip, and the visitor's cursor (or finger on a phone) plays Adam: reaching toward God's finger sparks the gap and opens the project. The work ends with an approved, working browser prototype and key-moment boards that the site can later be rebuilt from.

## Users & Context
- **Who:** college reviewers (e.g. MIT Maker Portfolio), recruiters scanning fast, and clients judging craft.
- **Where:** desktop browsers with a mouse or trackpad, keyboard-only visitors, and phones in portrait. Visitors may arrive more than once; nothing plays by itself, so repeat visits cost no waiting.

## Design Requirements
1. The name is real HTML text, visible at first paint, above the scattered nodes.
2. Scroll drives everything: assembly, camera pan and project changes follow native scroll position. No auto-play, no scroll hijacking (the wheel and touch scroll are never intercepted).
3. The figure assembles **along the pan path**: head and shoulder first, then the arm builds as the camera travels along it, the finger last.
4. All 7 projects take turns at the fingertip, in the existing order from `src/content/projects/` (`order` field). Each stop shows the title, a one-line summary, the year and an "Open project" link, and rests in place (scroll snap, proximity).
5. Cursor as Adam: as the pointer nears God's fingertip, a spark bridges the gap; clicking opens the project. The system cursor stays visible.
6. Phones: touch-and-drag toward the finger plays Adam, and a plain tap on the project card also opens it (WCAG 2.5.7 needs a single-pointer alternative to dragging).
7. Every project is reachable by keyboard: each stop is a real HTML section in DOM order with a focusable link; focusing it scrolls it to the fingertip. The canvas is decorative (`aria-hidden`); all content lives in the HTML.
8. Reduced motion: the figure is shown already assembled; projects change with a 150 ms fade; no camera travel.
9. The pigment palette from `src/styles/tokens.css` is kept. Each direction proposes a new open-licence type pairing (Garamond is dropped).
10. WCAG 2.2 AA contrast for all text, with ratios reported every round.

## Scope
**In scope:** the home page only: scatter, assembly, pan, the 7-project fingertip cycle, the cursor/finger-as-Adam spark, plus its phone, keyboard and reduced-motion versions. Two looks: **A, Night Sky** and **B, Fresco Plaster**.

**Out of scope:** project pages, the projects index, About, 404; project text; anything in `src/` or `public/` (the altarpiece build on `main` is left alone); design tokens and a full spec as deliverables; Adam drawn as a figure (the visitor plays Adam).

## Deliverables
| Deliverable | Format | Saved to |
|---|---|---|
| Tracing source | Copy of the image you shared (Michelangelo fresco, 402 KB WebP); used only to place nodes, never published | `output/creation-redesign/source/creation-of-adam.webp` |
| Node figure data | Python script (Pillow + NumPy, already installed) → JSON of points and links | `output/creation-redesign/tools/trace_figure.py` → `data/god-nodes.json` |
| Figure study (M1) | Static render of the node figure in both looks | `output/creation-redesign/directions/figure-study/` |
| Direction prototypes (M2) | Self-contained HTML/CSS/JS + raw WebGL2 page per direction | `output/creation-redesign/directions/a-night-sky/`, `.../b-fresco-plaster/` |
| Refinement rounds (M3–M4) | Same, one self-contained copy per round so earlier rounds stay viewable | `output/creation-redesign/iterations/round-<n>/` |
| Key-moment boards | Scatter, assembly, pan, fingertip with a project, spark; per direction, then for the final | Figma file (recommended, see D1), linked in `figma-links.md` |
| Final | Approved prototype, boards, accessibility and performance report | `output/creation-redesign/final/` |
| Closing summary | `design-spec.md` (short, as the workflow requires) | `output/creation-redesign/design-spec.md` |

Viewing: prototypes are served locally with `python -m http.server` from the project root (a "creation-prototypes" entry added to the git-ignored `.claude/launch.json`) and opened in the browser pane.

## Design Process
1. **Figure study first (M1).** One node figure feeds both looks, so it is checked before any styling: does it read as God from *The Creation* at a glance? The script samples dots by tone and edges inside hand-placed outlines (head, body, arm, hand, mantle), then links near neighbours into lines. The arm and hand get hand-corrected contour lines because they carry the whole idea.
2. **Two directions (M2).** Both share the same scroll structure and figure, and differ in palette, type, texture, how nodes assemble, the spark, and the project card:
   - **A, Night Sky:** bright gesso and gold nodes with soft glow on a deep ink and ultramarine sky; constellation lines; a gold spark. Ties to Falling Constellations.
   - **B, Fresco Plaster:** charcoal pounce dots (spolvero) on gesso plaster; lines scratched in; colour (vermilion mantle, ochre flesh) washes in patch by patch as you scroll; a vermilion spark.
   Each is shown working in the browser at 1440 px, with boards of the key moments, strengths and weaknesses, and hex values. You pick one or combine parts.
3. **Refine in rounds (M3).** Camera path and pacing, assembly feel, card layout, spark, type. After each round: what changed, quality checks, your feedback.
4. **Phone, keyboard, reduced motion (M4).** Portrait composition, touch-drag + tap, focus order and visible focus, the reduced-motion version.
5. **Final (M5).** Final prototype and boards, checks, `design-spec.md`.

## Accessibility & Responsiveness
- **Standard:** WCAG 2.2 AA. Contrast for every text pair (ratios computed with the existing `luminance`/`ratio` functions in `output/renaissance-portfolio-concepts/tools/contrast_check.py`); non-text contrast ≥ 3:1 for focus rings and the card edge.
- **Motion:** `prefers-reduced-motion` gives the static assembled figure and 150 ms fades; no parallax or camera travel.
- **Input:** keyboard (Tab, Shift+Tab, Page Down/Up, Enter), screen reader (headings and links in the HTML), touch (tap and drag, 2.5.7), targets ≥ 24 × 24 px, focus never hidden behind the canvas or card (2.4.11).
- **Breakpoints:** 320 px minimum, ~390 px phone, 768 px tablet, 1440 px desktop; nothing clipped at 200% zoom.
- **Colour modes:** each direction is one look (A dark, B light); offering both as modes is decided after M2.
- **Performance (reported, not gates):** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Point counts are capped on phones.

## Milestones
1. **M1 Figure study:** source image copied, node data generated, static render in both looks. You confirm the figure reads right.
2. **M2 Directions:** prototypes A and B (desktop), boards for each. You choose or combine.
3. **M3 Refinement (desktop):** one or more rounds until you approve.
4. **M4 Phone, keyboard, reduced motion:** until you approve.
5. **M5 Final delivery:** final prototype and boards, report, `design-spec.md`.

`progress.md` and `decisions.md` are updated at every milestone.

## Decision Points
- **Now, with this plan:**
  - **D1, board tool:** Figma (recommended: connected and checked, Full seat on your student team, easy to share and comment), Paper (not checked yet; needs the Paper app open), or both.
  - **D2, fonts in prototypes:** load open-licence (OFL) fonts from Google Fonts in the prototypes (recommended: nothing installed, nothing in the source tree), or install with npm (changes `package.json`, outside this project's scope).
- **After M1:** how much of the mantle and the cherubs to include; point density.
- **After M2:** direction (or combination); type pairing; one look or both as light/dark modes.
- **During M3:** camera path and pacing; card layout; spark style; whether a node "Adam hand" follows the cursor.
- **During M4:** portrait composition on phones (e.g. the arm rotated to point down vs. a diagonal pan).
- **Before the first commit:** which GitHub repository (or local only).
- **M5:** whether anything goes into the source tree now (currently no).

## Risks & Limitations
- **The figure may not read as Michelangelo.** Pure tone sampling gives noise. Mitigation: hand-placed outlines and contour lines for the arm and hand; M1 is a checkpoint before any styling.
- **Phones in portrait.** The arm is horizontal and the screen is tall; this needs its own composition (M4), not a squeezed desktop.
- **Scroll-driven scenes can feel like hijacking.** Mitigation: native scroll only, sticky canvas, proximity snap, never intercept wheel or touch.
- **Phone performance** with thousands of points and lines. Mitigation: WebGL2 points, capped counts on small screens, measured each round.
- **Image rights.** The fresco (1508–1512) is public domain. The image you shared has no recorded source; only the node drawing derived from it is published, not the photo. The Vatican Museums' own reproduction terms are not checked. This is not legal advice; check before the site goes public.
- **Content is drafted.** Project names, one-liners and images are the program agent's drafts and placeholders.
- **The altarpiece plan on `main`** (program agent, next step M5) no longer matches the home page. Nothing here changes it; coordinating is your call once a design is approved.
- **Tools.** The Figma MCP is connected; the separate Figma plugin connector needs `/mcp` authorisation but isn't needed. Paper is unchecked.

## Open Questions
1. D1: Figma, Paper, or both for boards?
2. D2: OK to load OFL fonts from Google Fonts in the prototypes?
3. GitHub repository for commits (asked before the first commit).

**Status:** Approved on 2026-11-14 (D1: Figma; D2: OFL fonts from Google Fonts in prototypes).

---

## Amendment 1: particles instead of nodes (2026-11-14)

**Why:** after the M1 figure study, you decided nodes (dots and lines) can't show the fine detail you want (decision #14). The painting itself is rebuilt from particles instead. Where this amendment and the sections above disagree, this amendment wins.

### What changes
| Before | Now |
|---|---|
| God drawn as nodes and lines | The painting itself (God + mantle, decision #15) rebuilt from particles in its real colors, dense enough to show fine detail (target: about one particle per source pixel on desktop) |
| Scroll assembles the figure (req. 2, 3) | **The cursor assembles it:** the closer the cursor gets to God's fingertip, the more particles roll into place; reaching the fingertip completes the image and sparks the project (#16) |
| Scroll drives everything | **Scroll pans the camera** along the arm and **steps through the 7 projects** at the fingertip (#17) |
| Phones: drag plays Adam | Phones: touch-drag toward the fingertip assembles; a tap opens the project. Keyboard and reduced motion: the image is shown already assembled (#18) |
| Look A: bright nodes on night sky; B: charcoal dots on plaster | **A, Night Sky:** particles drift in as a starfield and roll into the painting on a dark sky. **B, Fresco Plaster:** particles settle like pigment dust onto a plaster ground |

Unchanged: your name is HTML text visible at first paint; the canvas is decorative and every project is real HTML; WCAG 2.2 AA; pigment palette kept, Garamond dropped; home page only; nothing in `src/`; Figma boards; Google Fonts in prototypes.

### How it works (technical sketch)
- `tools/make_particle_source.py` reuses the God and mantle outlines from M1 to cut a **masked, cropped image** (transparent outside God + mantle). The browser reads its pixels at load; **no node JSON**.
- One WebGL2 point per kept pixel, each with a home position (its pixel), a scattered start position and its color. A shader moves every particle along a curved "rolling" path from start to home; the amount comes from the cursor's distance to the fingertip, smoothed so it eases rather than jumps. Particles near the fingertip can arrive last, so the finger completes as you touch it.
- Particle count: about 150–300k on desktop, capped (half resolution) on phones; measured each round.
- Without WebGL2, or with reduced motion, a static image of the assembled painting is shown.

### Deliverables changed
| Deliverable | Saved to |
|---|---|
| Source image (see D3) | `art-src/creation-of-adam-3524.jpg` (git-ignored, like the museum originals), or the 1920 px copy already in `source/` |
| Masked particle source | `tools/make_particle_source.py` → `data/god-mantle.webp` |
| **M1b particle study:** density, particle size, the roll, cursor-distance assembly, frame rate | `directions/particle-study/` |
| Node study (M1) | Kept in `directions/figure-study/` as a record; superseded |

### Milestones now
1. ~~M1 node figure study~~ (done; superseded)
2. **M1b Particle study:** one look-neutral page to confirm the detail and the cursor-driven roll before styling. You confirm it shows the detail you want.
3. **M2 Directions A and B** (as before, with particles), with Figma boards.
4. **M3 Refinement**, **M4 Phone, keyboard, reduced motion**, **M5 Final**, as before.

### New decision points
- **D3, now: the source image.** The particles publish the photo's colors, so its source should be recorded. Options:
  - **Download the full-size public-domain original (recommended):** Wikimedia Commons, *Michelangelo - Creation of Adam (cropped).jpg*, 3524 × 1599 px, 2.1 MB (2,163,447 bytes), marked public domain, from `upload.wikimedia.org`. Nearly twice the detail of your copy, which matters when the camera zooms to the hand.
  - **Use your 1920 px copy:** no download; less detail at close zoom. It appears to be a smaller copy of that same Commons file (same proportions), but that is not proven.
- **After M1b:** particle density and size; the style of the roll; whether particles roll back out when the cursor moves away.
- **During M2:** the opening framing (the fingertip has to be on screen for the cursor to approach it).

### New risks
- **Performance:** hundreds of thousands of particles is fine for desktop GPUs but heavy for phones; mitigated by caps, half resolution on phones, and measuring each round.
- **Image rights matter more now,** because the photo's pixels are published. The fresco and the Commons file are marked public domain; the Vatican Museums' own terms are unchecked; not legal advice.
- **Cursor-only assembly** could leave trackpad or touch visitors with a half-built image. Mitigation: touch-drag, keyboard and reduced-motion paths show it built; tested in M4.

**Amendment 1 status:** Approved on 2026-11-14 (D3: download the Commons original to `art-src/`).

---

## Amendment 2: computer only (2026-11-14)

At your instruction (decision #21), phones and tablets are not supported. Devices without a fine pointer and hover (`(hover: none), (pointer: coarse)`) get a plain notice that a computer is required, and the particle scene is not started on them. M4 becomes **keyboard and reduced motion** only; the phone composition, touch-drag and phone particle caps are dropped. Breakpoints are now desktop and laptop widths (1280-1920 px), plus checks at 200% zoom.

**Amendment 2 status:** Approved on 2026-11-14 (your instruction).

**Note (2026-11-14):** M1b approved with the whole group as the particle image (decision #22, replacing #15), and the camera following the arm, zooming out at the reveal (#20).
