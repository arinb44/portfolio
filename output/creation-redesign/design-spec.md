# The Creation: Design Specification

**Prepared by:** Creation Designer (`designAgent.md`)
**Date:** 2026-11-14
**Status:** Final (round 2 approved, decision #26; M4 accessibility fixes applied on top)

## 1. Overview
A new home page for the portfolio, built around Michelangelo's *The Creation of Adam*. On every visit the page opens on a dark starfield with the visitor's name readable at once and a small gold ring in the centre. As the cursor moves toward the ring, about 690,000 particles roll into place and rebuild God's whole group (God, his mantle, the cherubs and the angel beneath him) in the painting's own colours, while the camera follows God's arm, zoomed in, from his face to his fingertip. The fingertip lands in the ring exactly as the cursor reaches it: a gold spark, the camera pulls back to the whole painting, and the featured project appears where Adam's hand would be. Scrolling then steps through all 7 projects. Chosen direction: **A, Night Sky**, with the **Atlas** type (Gloock, Newsreader, IBM Plex Mono).

## 2. Design Rationale
- **Memorable first** (goal): the visitor plays Adam, so the page is an act, not a slideshow. Nothing plays by itself (#4, #16): the cursor drives the assembly, scroll drives the projects.
- **Fine detail** (#14): nodes were rejected after M1 because they could not carry the painting's detail; particles sampled from the full 3524 px public-domain photo, with the painting texture fading in where they land (round 1), keep every vein and crack even at 2x zoom.
- **Whole group** (#22): cutting God out of the group left hard or smudged cuts; the whole group keeps Michelangelo's own edges.
- **Night Sky** (#24): the fresco's colours glow against the ink ground and tie the page to the Falling Constellations project.
- **Atlas type** (#25): a high-contrast serif and a technical mono read like an old star atlas, and avoid the overused faces of direction A's first draft.
- **Recruiters are not held up**: the first Tab stop and a visible link skip straight to the projects; reduced-motion visitors get the finished page at once; every project is plain HTML.
- **Computer only** (#21): phones and tablets get a short notice instead of the scene.

## 3. Visual Foundations

### Colour (pigment palette from `src/styles/tokens.css`, unchanged)
| Name | Hex | Use | Contrast |
|---|---|---|---|
| Ink | `#1F1D1A` | Ground; text on the "View project" button | button 13.90:1 |
| Gesso | `#EEE9DF` | Text, titles, the button | 13.90:1 on ink |
| Stone 200 | `#CFC8BA` | Tagline, nav, meta, hints | 10.11:1 on ink |
| Gold | `#C8A24A` | Target ring, project count, spark | 6.98:1 on ink (13 px count passes AA) |
| Ochre | `#C29545` | Focus ring (2 px, offset 3 px) | 6.15:1 (non-text, needs 3:1) |

The painting itself comes from the photo (Wikimedia Commons, *Michelangelo - Creation of Adam (cropped).jpg*, public domain).

### Typography (Google Fonts, OFL)
| Role | Font | Size / line height | Notes |
|---|---|---|---|
| Name (h1) | Gloock 400 | 2rem / 1.15 | 1.625rem in the narrow layout |
| Tagline | Newsreader 400 | 1rem / 1.6 | Stone 200 |
| Nav, skip link, hint caption | IBM Plex Mono 400 | 0.875rem / 1.5 | Stone 200 |
| Project count | IBM Plex Mono 400 | 0.8125rem, +0.06em | Gold; "· Featured" on the first |
| Project title (h3) | Gloock 400 | clamp(2.5rem, 4vw, 3.75rem) / 1.05 | `text-wrap: balance` |
| Project line | Newsreader 400 | 1.1875rem / 1.55 | `text-wrap: pretty` |
| Meta (year, stack) | IBM Plex Mono 400 | 0.875rem / 1.6 | Stone 200 |
| Links | IBM Plex Mono 400 | 0.9375rem | "View project" is a gesso pill (0.6rem x 1.1rem padding) |

### Layout
- Header: fixed, padding 1.75rem 2.5rem, with an ink fade (88% to 0) so the nav stays readable over the painting.
- Target ring: 44 px, 1 px gold, centred on the screen; it thickens to 2.5 px and tightens 18% as the cursor nears.
- Revealed: the painting fits 36-98% of the width and 5-95% of the height; each project is a 100vh stop (native scroll snap) with its card at 5vw, width min(30vw, 30rem), vertically centred beside the fingertip.
- Zoomed in (200-400%) or narrow / short windows (<= 900 px wide or <= 560 px tall): a plain reading layout (header in the flow on a solid ground, cards stacked full width on a 92% ink backing, no snap).

### Imagery and motion
| Parameter | Value |
|---|---|
| Particles | one per source pixel within 230 px of the arm path, one per 2x2 cell elsewhere (~690k) |
| Waiting | 1 in 10 particles is a dim star (twinkles); the rest are hidden near home |
| Progress | cursor distance to the ring, smoothstep, eased at 3.5/s; rolls back if the cursor leaves before the touch |
| Landing order | along the arm path: face first, fingertip last (delay 0.8 t, flight 0.15 of progress) |
| Flight | curved path plus an unwinding 18 px orbit; glowing shaded balls with a light that spins with the roll |
| Painting layer | mipmapped texture fades in where particles have landed; landed particles disappear |
| Camera | 2 screen px per source px (max), riding the landing front at the screen centre |
| The touch | within 26 px of the ring at >= 98.5% progress |
| Spark | 140 gold particles, 24-110 px reach, 0.9 s, additive; also on each project step |
| Reveal | 2 s ease-in-out zoom-out; the card appears at 75% |
| Reduced motion | built and zoomed out at load; no stars, flight, drift or spark |

## 4. Screens / Pieces
Preview: `python -m http.server 4400` from the project root (or the `creation-prototypes` launch entry), then http://localhost:4400/output/creation-redesign/final/prototype/

| Moment | Behaviour | Shot |
|---|---|---|
| Arrival | Starfield, name, nav, ring and "Bring your cursor to the circle"; "Skip to the projects" bottom-left | Figma F1 |
| Reaching | God's face rolls into place; the caption fades | `final/shots/final-2-face.png` |
| Following the arm | Camera rides the landing front down the arm | `final-3-arm.png` |
| The touch | Fingertip lands in the ring; gold spark | `final-4-hand.png`, `final-5-spark.png` |
| Revealed | Whole painting right, project 1 (Falling Constellations) left | `final-6-revealed.png` |
| Project steps | Scroll snaps to the next project; spark at the fingertip | `final-7-step-spark.png` |
| Skip / keyboard | First Tab = skip link; Enter assembles quickly, reveals and focuses project 1's "View project" | (tested) |
| Reduced motion | Revealed at load | `final-8-reduced-motion.png` |
| 200% / 400% zoom | Reading layout, no overlap | `m4-zoom-200-400.png` |
| No WebGL2 | Still image of the painting, revealed layout | (CSS fallback, not screenshotted) |
| Phone / tablet | "This site needs a computer." notice; the scene does not start | `directions/particle-study/shots/notice-iphone.png` |

States: links underline; the button is a solid pill; focus is a 2 px ochre ring. Empty and error states: no project data or no WebGL2 falls back to the still image; there are no forms.

## 5. Components & Tokens
| Piece | Where | What it does |
|---|---|---|
| Look tokens | `final/prototype/index.html` (`--bg --text --muted --accent --focus --font-*`) | Colours and fonts of the Night Sky / Atlas look |
| Layout | `final/prototype/shared/base.css` | Header, ring, stops, card, skip link, computer-only notice, reduced motion, zoom layout |
| Engine | `final/prototype/shared/creation.js` (`createCreation(canvas, { look, data, onFrame })` -> `{ revealNow, spark, state }`) | Raw WebGL2: particles, painting layer, camera, spark |
| Page layer | `final/prototype/shared/page.js` (`startPage({ look })`) | Renders the 7 project stops from JSON, ring and caption, skip / Projects links, spark on each stop |
| Data | `data/whole-group-aa.webp` (601 KiB), `data/particles.json`, `data/projects.json` (copied from `src/content/projects/`) | Painting, crop metadata, project content |
| Tools | `tools/make_particle_source.py` (run with `python -I`), `tools/trace_figure.py` (M1 outlines, reused as masks) | Rebuild the source images from `art-src/creation-of-adam-3524.jpg` |

Nothing was written into `src/` or `public/` (by design, `designAgent.md`).

## 6. Accessibility & Responsiveness
| Check | Result |
|---|---|
| WCAG 2.2 AA contrast | All text pairs pass (section 3); tightest is the gold count at 6.98:1 |
| axe (wcag2a/aa, 21a/aa, 22aa, best practice) | 0 violations before the reveal (29 passes) and after it (31 passes) |
| Keyboard | Skip link -> nav (Projects, About, CV, Email); after the reveal -> each project's links; visible 2 px ochre focus ring |
| Screen readers | Canvas is `aria-hidden`; name is the h1; projects are h3s in sections inside `main`; external links marked with a hidden arrow |
| Reduced motion | Revealed at load, no animation |
| Zoom | 200% (720 CSS px) and 400% (360 CSS px): no horizontal scroll, no overlap |
| Breakpoints | Designed for 1280-1920 px laptops and desktops; reading layout <= 900 px wide or <= 560 px tall; phones and tablets excluded (#21) |
| Colour mode | Dark only (Night Sky) |
| Performance | ~690k particles at 144 fps (display cap) on an RTX 4070 laptop GPU; JS ~19 KiB; painting 601 KiB; three font families (Latin subsets) |

## 7. Files & Links
**Final:** `output/creation-redesign/final/prototype/` (index.html, shared/), `final/shots/`, `final/figma-scenes/`.
**Process:** `designAgent.md`, `plan.md` (+ Amendments 1-2), `decisions.md` (#1-#26), `progress.md`, `figma-links.md`; M1 `directions/figure-study/`; M1b `directions/particle-study/` (+ `v1-fixed-camera.html`); M2 `directions/a-night-sky/`, `directions/b-fresco-plaster/`, `directions/shared/`, `directions/shots/`; M3 `iterations/round-1/`, `iterations/round-2/`.
**Data and tools:** `data/` (god-nodes.json, god-mantle.webp, whole-group.webp, whole-group-aa.webp, particles.json, projects.json), `tools/`, `source/creation-of-adam.webp` (the user's 1920 px copy); the 3524 px original is in git-ignored `art-src/`.
**Local only:** `.claude/launch.json` gained a `creation-prototypes` entry (git-ignored).
**Figma:** https://www.figma.com/design/vCWy3ZX4mS71JsxF4C9c5z (page "Creation redesign": direction A, direction B, Final).

## 8. Decision Log (summary)
Concept: God from *The Creation of Adam*, cursor as Adam, all 7 projects at the fingertip, every visit (#2-#3). Nodes tried, then replaced by particles rebuilding the painting (#14), whole group (#22). The cursor assembles; the camera follows the arm and zooms out at the touch (#16, #20); scroll steps the projects afterwards (#23). Pigment palette kept, Garamond dropped (#5). Computer only (#21). Direction A, Night Sky (#24); Atlas type (#25); round 2 approved (#26). Full log: `decisions.md`.

## 9. Known Issues & Next Steps
- **Placeholders:** name, tagline, email, About and CV links; "View project" points to `#` until project pages are redesigned.
- **Not yet in the site:** the Astro site on `main` still has the altarpiece home. Porting means moving `shared/` into the site (e.g. a component plus `src/scripts/`), serving `data/` from `public/`, and replacing `data/projects.json` with the content collection. That is program-agent work, and changes `src/` only with your approval.
- **Measured on one machine only:** Chromium on an RTX 4070 laptop. Firefox, Safari and integrated GPUs are untested; consider a lower particle count when the frame rate drops.
- **Page weight not yet measured with Lighthouse** (estimate ~0.7-0.8 MiB with fonts, inside the old 1.4 MiB budget).
- **At 200%+ zoom** the painting is mostly covered by the reading layout (content first, by design).
- **Rights:** the fresco and the Commons file are marked public domain; the Vatican Museums' own terms were not checked (not legal advice).
- **Ideas not built:** a faint hint of the figure in the arrival starfield; redesigning the project pages, the projects index and About in the same language.
