# Hybrid Specification: The Altarpiece, Beneath the Paint, Sfumato

**Status:** Final draft, 2026-11-13. Built from plan Amendment 1, milestones A1–A6.
**What this is:** the framework and creative direction for your portfolio. It is a specification, not code. Every screen, animation, colour, asset, accessibility rule and build step is defined here so you can build the site yourself.
**Companion files:**
- `wireframes/01–05*.svg`: the five wireframes
- `tools/contrast_check.py`: re-run it when you add colours
- `decisions.md`: every choice you made
- `notes.md`: sources S1–S77 and project notes P1–P7

---

## 1. Summary

**The idea in one sentence:** the whole site is one Northern Renaissance altarpiece. It opens to show your work. Each project is a panel you can look *beneath*, layer by layer, down to its first sketch.

| Part | Role in the site | Comes from |
|---|---|---|
| **The Altarpiece** | Site structure and navigation. Closed grisaille exterior → wings open → triptych with About (left wing), a featured project (main panel), Contact (right wing), and a **predella** row linking all 7 projects. | Report 5.1 |
| **Beneath the Paint** | Project pages. The finished result comes first (the "varnish"). Below it sit Paint (features, results), Underpainting (architecture) and Underdrawing (origins). A conservator's **lens** and a **layer slider** reveal the layers. | Report 5.2 |
| **Sfumato** | The base layer. Opacity-only cross-fades, used everywhere motion is reduced. Blurred-to-sharp image loading. The quiet editorial layout of the About and Index pages. | Report 5.5 |

**The decisions this spec follows** (`decisions.md`):
- **#13:** all 7 GitHub projects (NeetCode left out).
- **#15:** you're comfortable with JS and WebGL, so the WebGL extras are in the main build.
- **#17 "Ceremony once":** one ~1.6 s skippable arrival, at most once every 30 days (#23). Repeated motion lasts 100–350 ms. Reduced motion becomes 150 ms opacity fades.
- **#18:** the predella is plain links, one click per project.
- **#19:** the palette comes from the Merode triptych, with Cellier grisaille and Sienese gold.
- **#20:** Falling Constellations is the featured project.
- **#21:** NFL, NBA and MLB are grouped as a "Prediction series".
- **#22:** the wireframes are approved as drawn.
- **#23:** the arrival plays at most once every 30 days (`localStorage` timestamp).
- **#24:** the three sports apps get ~10 s recorded previews each, so all videos still fit MIT's 2-minute total.

**Numbers that matter:**
- Your name is readable from 0 ms, and it is the LCP element.
- ≤ 75 KiB of JS and ≤ 1.4 MiB in total on the home page's critical path [S66]. In practice the critical-path JS is about 1 KB.
- Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [S40].
- Every text pair passes WCAG AA contrast (Section 6).

---

## 2. User journeys

These are design walkthroughs built from what reviewers say they need [S29][S30][S31][S32][S33]. They are not observed behaviour. Each journey starts cold on `/` unless noted.

### 2.1 College reviewer (e.g. an MIT Maker Portfolio reader)
**Wants:** process over polish, a working demo for code, and your role made clear [S29].

| Step | They see | Time |
|---|---|---|
| 1 | Closed grisaille altarpiece. Your name and one line as stone lettering; "Index" top right. | 0 ms |
| 2 | Wings swing open on their own (or at once if they click, scroll or press a key). Colour glazes in over the grey. | 0.6 → ~2.2 s |
| 3 | Open triptych: About, featured *Falling Constellations*, Contact, and all 7 project titles in the predella. | first screen |
| 4 | They click the **NBA Predictor** scene. It morphs into the project page header. | 350 ms |
| 5 | Result first: title, "67.5% winner accuracy vs 55.2% baseline", role, stack, **Live demo** and **Code**. | first screen |
| 6 | They scroll down through Paint → Underpainting → Underdrawing. This is the process story MIT asks for. Each layer has captions and "finished / in progress" tags. | scroll |
| 7 | **Next: MLB Predictor ▸** at the bottom (or the right edge wing) folds to the next project. | 2 × 200 ms |

**Deep link variant:** if your application links straight to `/projects/nba-predictor/`, there is no arrival. The page opens directly on the result.

### 2.2 Recruiter (scanning fast)
**Wants:** who you are, what you've built, stack, links and CV, quickly. The 7.4 s figure is a vendor study of *résumés* [S33], so treat "seconds, not minutes" as the design target, not a measured fact.

| Step | They see |
|---|---|
| 1 | Name readable at 0 ms. **Skip intro** (a real button) or any key opens it at once. |
| 2 | First screen: all 7 titles, plus header links **Index · About · GitHub ↗** (never hidden behind a menu on desktop [S31]). The Contact wing has **CV (PDF)**. |
| 3 | **Index** (`/projects/`): one plain table of all projects, with what each is, stack and links. No animation, and it prints cleanly. |
| 4 | Any project page: metric and stack chips above the fold, plus **Code ↗** to the repo. |

### 2.3 Client (judging craft)
**Wants:** proof that you sweat the details, and a way to contact you.

| Step | They see |
|---|---|
| 1 | The arrival is the "wow" moment: 3D wings and glazes. It plays at most once every 30 days, so a client who comes back to compare portfolios goes straight in. |
| 2 | Hovering the predella: each scene lifts 4 px and catches a gold glint (100 ms). The main panel shows a soft preview of that project. |
| 3 | Featured *Falling Constellations*, then **Live site ↗**, which runs instantly with no cold start. |
| 4 | *Hearth* or *Juno*: a short video in the Varnish layer, because neither can be tried alone. |
| 5 | Contact wing: **Email**. |

**On a phone:** the wings hinge top and bottom, the predella becomes a swipeable strip (still a list of links), and the lens is replaced by the layer slider (wireframe 04).

---

## 3. Information architecture

### 3.1 Pages and URLs

| URL | Page | Notes |
|---|---|---|
| `/` | Home: closed → open altarpiece | Arrival plays only here, at most once every 30 days |
| `/projects/` | **Index**: plain table of all projects | Labelled "Index" in the nav. (Astro's `src/pages/index.astro` *is* the home page, so the list lives at `/projects/`; wireframe 05 is updated to match.) |
| `/projects/[slug]/` | Project page (7) | Beneath the Paint layers |
| `/about/` | About, styled as the grisaille exterior | Longer bio, education, credits for the CC0 images |
| `/cv.pdf` | CV | Static file in `public/` |
| `/404` | Not found | Optional: the *Ideal City* panorama with "This panel is missing" |

**Header (every page):**
- **[monogram] Your Name**: links home. On `/` it is the `<h1>`.
- **Index**
- **About**
- **GitHub ↗**

The header is sticky. On phones, Index stays a visible text link, not a hamburger [S31].

### 3.2 Project order (the predella and prev/next)

| order | slug | Title | Series | Demo |
|---|---|---|---|---|
| 1 | `nfl-predictor` | NFL Game Predictor | Prediction | GitHub Pages dashboard (first load 10–30 s) |
| 2 | `nba-predictor` | NBA Game Predictor | Prediction | Streamlit app (cold start ~60–67 s, warm ~2 s, measured once on 2026-11-13 [S77]) → recorded preview |
| 3 | `mlb-predictor` | MLB Game Predictor | Prediction | Render (cold start 30–60 s) → recorded preview |
| 4 | `hearth` | Hearth | | Live (GitHub Pages) + video |
| 5 | `juno` | Juno | | Video only (needs iMessage credentials) |
| 6 | `nightfall` | Nightfall | | Video only (models withheld) |
| 7 | `falling-constellations` | Falling Constellations ★ featured | | Live (GitHub Pages) |

Prev/next follows this order and wraps around: Falling Constellations → NFL. **Correction made during this milestone:** wireframes 03 and 04 first showed NBA's neighbours as MLB/Hearth. They now show NFL/MLB.

### 3.3 Content model (one Markdown file per project)

**Fields:**

| Field | Type | Example / rule |
|---|---|---|
| `title` | string | "NBA Game Predictor" |
| `oneLine` | string, ≤ 90 chars | "Predicts NBA winners, margins and calibrated win probabilities." |
| `role` | string | "Solo: design, data, model, deploy" |
| `stack` | string[] | `[Python, scikit-learn, Docker, Streamlit]` |
| `year` | number | 2025 |
| `order` | number | Sets predella and prev/next order |
| `featured` | boolean | Exactly one `true` (Falling Constellations) |
| `series` | `"prediction"`, optional | Groups NFL/NBA/MLB (#21) |
| `demo` | `{ url?, kind: live \| video \| none, coldStartSeconds? }` | A cold-start note is shown when `coldStartSeconds > 10` [S50] |
| `repo` | URL | GitHub link |
| `video` | file, optional | Muted, captioned, with a poster frame |
| `metric` | `{ value, label, baseline?, context }`, optional | "67.5%", "winner accuracy", "55.2% home-team baseline", "2025-26, 1,225 unseen games" |
| `predella` | `{ image, alt }` | The small painted scene |
| `layers` | 4 × `{ name, images[{src, alt, caption}], status: finished \| in-progress }` | `name` is one of varnish, paint, underpainting, underdrawing |

**Schema sketch.** API names differ between Astro versions, so check this against the current content-collections docs [S68] before using it:

```ts
// src/content.config.ts  (sketch, verify against your Astro version)
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const layer = (image) => z.object({
  name: z.enum(['varnish', 'paint', 'underpainting', 'underdrawing']),
  status: z.enum(['finished', 'in-progress']),
  images: z.array(z.object({ src: image(), alt: z.string().min(1), caption: z.string() })),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(), oneLine: z.string().max(90), role: z.string(),
    stack: z.array(z.string()), year: z.number(), order: z.number(),
    featured: z.boolean().default(false), series: z.literal('prediction').optional(),
    demo: z.object({ url: z.string().url().optional(), kind: z.enum(['live', 'video', 'none']),
                     coldStartSeconds: z.number().optional() }),
    repo: z.string().url(), video: z.string().optional(),
    metric: z.object({ value: z.string(), label: z.string(), baseline: z.string().optional(),
                       context: z.string() }).optional(),
    predella: z.object({ image: image(), alt: z.string() }),
    layers: z.array(layer(image)).length(4),
  }),
});
export const collections = { projects };
```

`alt: z.string().min(1)` makes a missing alt text a **build error**, not a silent gap.

### 3.4 What goes in each project's layers

| Project | Varnish (finished) | Paint (features, results) | Underpainting (architecture) | Underdrawing (origins) |
|---|---|---|---|---|
| NFL | Dashboard screenshot | Per-pick factor explanations; updates 3×/week | Feature modules (weather, travel, matchups); leak-free features; Vegas lines as benchmark only | First notebook or sketch |
| NBA | Dashboard | 67.5% vs 55.2%; MAE 11.91 vs 13.40; calibration chart | fetch → point-in-time features → walk-forward training → calibration → app; CI + Docker | First commit or notebook |
| MLB | App screenshot | Calibrated probabilities; why ~55–58% is the honest ceiling | Elo from scratch → XGBoost/LightGBM → PyTorch entity embeddings; leakage tests | Early experiments |
| Hearth | Game still + video | Islands of up to 10 players, lobby votes, co-op and Build Battle | SpacetimeDB server-side scoring; TypeScript client | Hackathon whiteboard or plan |
| Juno | Chat recording still + video | Texts each person, tracks who's in, resolves conflicts, keeps preferences private | Bun + Claude + Photon Spectrum message flow | First prompt or design notes |
| Nightfall | Gameplay still + video | Flashlight, campfire, creature behaviour | Godot scenes and GDScript structure | 2024 first build: your earliest repo, which shows growth |
| Falling Constellations | Live-piece still | Star-atlas constellations over a turning galaxy | Canvas 2D + raw WebGL2 layers; adaptive quality controller; context-loss handling; Bun tests | First sketch |

The facts come from your READMEs (notes P1–P7). Check them before publishing.

---

## 4. Wireframes

All five are SVG files in `wireframes/` and open in the file pane. They fix layout and behaviour, not the final look.

| File | Shows | Key notes |
|---|---|---|
| `01-home-closed.svg` | Desktop, first frame | The name and line are HTML text (LCP, 13.9:1 contrast). Auto-opens after 600 ms. Index always visible. Skip intro is a `<button>`. |
| `02-home-open.svg` | Open triptych + predella | About / featured / Contact; 7 predella links with the "Prediction series" bracket; ★ marks the featured project. |
| `03-project-page.svg` | NBA project page, desktop (1440 × 1620) | Result first above the fold. Lens + layer slider. Layers 2–4 as normal scrolling content. Prev/next as edge wings and a bottom bar. |
| `04-phone.svg` | 390 × 844 phone: closed, open, project | Wings hinge top/bottom. Swipeable predella `<ul>`. Slider instead of lens. Prev/next bottom bar. |
| `05-states-and-index.svg` | Arrival frames, reduced motion, Index | Frames at 0 / ≈450 / 900 / ≈1600 ms. Reduced motion = 150 ms cross-fade. `/projects/` is a real `<table>`. |

**Not drawn as separate wireframes:**
- **About:** uses the same grisaille exterior as wireframe 01, with a portrait or workshop scene, 3–4 short paragraphs, education, and a credits list for the CC0 paintings.
- **The predella interaction:** covered in wireframe 02 notes 1–2 and Section 5.

---

## 5. Motion specification

**Rules:**
- Animate only `transform` and `opacity` [S39].
- Repeated motion lasts 100–350 ms [S49].
- Any input gets visible feedback within 100 ms [S50].
- Nothing loops for more than 5 s without a pause control [S37].
- Every row has a reduced-motion version [S36][S38].

### 5.1 Shared tokens (one motion language for CSS and JS)

```css
:root {
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);      /* Material 3 standard [S51] */
  --ease-enter:    cubic-bezier(0.05, 0.7, 0.1, 1); /* emphasized decelerate */
  --ease-exit:     cubic-bezier(0.3, 0, 0.8, 0.15); /* emphasized accelerate */
  --dur-glint: 100ms;  --dur-fade: 150ms;  --dur-fold: 200ms;
  --dur-glaze: 250ms;  --dur-page: 350ms;  --dur-wings: 900ms;
}
```

If you later add GSAP, register the same curves with CustomEase [S53]:
- `"0.05,0.7,0.1,1"` for enter
- the Material "emphasized" path `M0,0 C0.05,0 0.133333,0.06 0.166666,0.4 C0.208333,0.82 0.25,1 1,1` [S51]

**GSAP is optional in this design.** After decisions #17 and #18, everything below is CSS, View Transitions and a little plain JS. Add GSAP only if the hand-written code gets messy.

### 5.2 Animation table

| # | Animation | Trigger | Properties | Duration · easing | Timing | Reduced motion | Built with |
|---|---|---|---|---|---|---|---|
| M1 | **Wings open** | First visit to `/` in 30 days; starts after 600 ms idle, or at once on click / wheel / key (except Tab) | `rotateY` on each wing, hinged at the main panel (phone: `rotateX`, top/bottom); `backface-visibility` shows the grisaille back | 900 ms · `--ease-enter` | t = 0–900 ms after opening starts | Exterior layer fades out (opacity) | CSS 3D [S71] + ~1 KB inline script (5.3) |
| M2 | **Glazes** | Part of M1 | Opacity of 3 colour layers over a grey base: (1) umber, (2) vermilion, verdigris, ultramarine, (3) gold and highlights | 3 × 250 ms · linear | Start at 400, 850 and 1350 ms; done at ≈ 1600 ms. They overlap the wing swing, not each other. | Shown at once (part of the fade) | CSS |
| M3 | **Skip** | Skip intro, any input during the opening, or focus moving into the page | Ends M1 and M2 | instant | n/a | n/a | `Animation.finish()` |
| M4 | **Predella glint** | Hover or `:focus-visible` on a scene | `translateY(-4px)`; opacity of a gold-sheen overlay | 100 ms · `--ease-standard` | Reverses on leave | Sheen only, no lift | CSS |
| M5 | **Main-panel preview** (optional) | Hover or focus on a scene for 150 ms or more | Opacity cross-fade of the featured image to that project's varnish image | 150 ms · linear | Back after 150 ms on leave | Off | CSS + a few lines of JS |
| M6 | **Scene → page** | Click a predella scene or "Open project" | Shared element: scene image ↔ project hero (`transition:name="scene-{slug}"`); the rest cross-fades | 350 ms · `--ease-standard` | Single step | 150 ms opacity fade of `main` on page load | Astro `<ClientRouter />` [S62] |
| M7 | **Wing fold (prev/next)** | Edge wing, the bottom prev/next bar, or `rel=prev/next` links | Old `main` folds (rotateY to 90° on the right edge for next, left for prev), then the new one unfolds | 200 ms `--ease-exit` + 200 ms `--ease-enter` | Sequential | 150 ms opacity | View-transition pseudo-elements (5.4) |
| M8 | **Lens follow** | Pointer moves over the hero (desktop only) | `transform` of a round clipping element + the opposite `transform` on the underdrawing image inside it (composite-only, no repaint) | Eases toward the pointer, ~120 ms time constant | Per frame (rAF) | Follows instantly | Plain JS; WebGL soft edge in Phase 6 |
| M9 | **Layer slider** | Slider value changes | Opacity cross-fade between layer images in the hero | 200 ms · linear | n/a | 150 ms | CSS + native `<input type="range">` |
| M10 | **Layer reveal** | Each layer section scrolls into view | `opacity` 0 → 1 and `translateY(16px)` → 0 | Scroll-linked, `animation-range: entry 0% entry 60%` | Per section | No animation (content just shown) | CSS scroll-driven animations [S23][S24]; skipped under `@supports not (animation-timeline: view())` |
| M11 | **Glaze light** (WebGL) | Pointer moves over gold or painted panels | A shader light sweep on gold and glaze; faint craquelure catches light | Follows the pointer; renders on demand, **no idle loop** | n/a | One still frame | GlazeCanvas (Section 9) |
| M12 | **Video loops** | Varnish-layer clips (Hearth, Juno, Nightfall) | Muted, captioned video | ≤ 5 s autoplay loop, or a visible **Pause** button [S37] | n/a | Poster frame, no autoplay | `<video>` |
| M13 | **Image load (sfumato)** | Any large image loads | Opacity cross-fade from a blurred placeholder to the sharp image (never animate `filter: blur()` [S39]) | 250 ms · linear | n/a | Same (opacity only) | CSS |
| M14 | **Focus ring** | Keyboard focus | No animation | instant | n/a | Same | CSS |

### 5.3 The arrival without blocking anything

**How it works:**
- **The HTML default is the *open* altarpiece.** With no JS or no CSS, the site still works. With JS but in an old browser, the animation simply ends open.
- **CSS runs the animation.** Arrival keyframes apply only to `html:not(.arrived)` and only under `prefers-reduced-motion: no-preference`. The reduced-motion version is the 150 ms exterior fade.
- **A tiny inline script runs before first paint.** It marks repeat visits and handles input.

Untested sketch:

```html
<script is:inline>
  // Arrival plays at most once per 30 days (#23); input opens it now, then skips to the end.
  const html = document.documentElement, WAIT = 600, DAYS_30 = 30 * 864e5;
  try { const last = Number(localStorage.getItem('arrivedAt')) || 0;
        if (Date.now() - last < DAYS_30) html.classList.add('arrived');
        else localStorage.setItem('arrivedAt', String(Date.now())); // counts from the last time it played
  } catch { /* storage blocked: just play it */ }
  const anims = () => [...document.querySelectorAll('[data-arrival]')].flatMap(el => el.getAnimations());
  function onInput(e) {
    if (e.key === 'Tab' || e.key === 'Shift') return;
    const list = anims(); if (!list.length) return;
    const waiting = list[0].currentTime < WAIT;
    for (const a of list) waiting ? (a.currentTime = WAIT) : a.finish();
  }
  ['pointerdown', 'wheel', 'keydown'].forEach(t => addEventListener(t, onInput, { passive: true }));
  addEventListener('focusin', () => anims().forEach(a => a.finish())); // never let a closed wing hide focus
</script>
```

- **Wing geometry:** the wings are half the main panel's width, hinged at its edges (wireframe 02: 230 / 456 / 230 px).
- **Closed state:** each wing is rotated 180° over the main panel and shows its back face (the Cellier-style grisaille).
- **Open state:** each wing sits flat beside the main panel, with its front face (About, Contact) showing.

### 5.4 Page transitions in detail

- **The router:** `<ClientRouter />` with fallback `animate` covers browsers without cross-document view transitions. Firefox support is unconfirmed [S21][S62].
- **Re-running setup:** bundled scripts run only once, so every setup function (lens, slider, glaze canvas binding) runs on `astro:page-load` [S62].
- **Reduced motion:** `<ClientRouter />` turns off view-transition animations entirely [S62]. The 150 ms fade is therefore a normal CSS animation on `main` under `prefers-reduced-motion: reduce`, run on each page load, not a view transition. **Verify in Phase 4** that the two don't fight.
- **Wing-fold direction (M7):**
  1. In `astro:before-preparation`, read the clicked link (check the event's `sourceElement` in the docs [S62]).
  2. Set `html[data-dir="next"|"prev"]`.
  3. Target `::view-transition-old(page)` / `::view-transition-new(page)` with the fold keyframes per direction.
  4. Browser Back uses `prev`.
  - **Fallback if this gets fiddly:** a plain 350 ms cross-fade. The project order still links everything.

---

## 6. Visual system

### 6.1 Palette (pigments from the Merode triptych, #19)

Checked with `tools/contrast_check.py` (WCAG 2.2 formula; ratios not rounded [S58]).

| Token | Hex | Pigment / source | Use | Key contrast |
|---|---|---|---|---|
| `gesso` | `#EEE9DF` | Chalk-and-glue ground | Page background; text on dark | Ink on gesso **13.90** |
| `stone-200` | `#CFC8BA` | Grisaille light | Wing chrome, borders (decorative) | n/a |
| `stone-500` | `#857F75` | Grisaille mid | **Large text only** (≥ 24 px, or ≥ 18.5 px bold) | 3.28 on gesso |
| `stone-700` | `#4A4740` | Grisaille dark | Secondary text, captions | 7.66 |
| `ink` | `#1F1D1A` | Bone black | Body text; the arrival background | 13.90 |
| `ultramarine` | `#24407A` | Lapis | Primary buttons, links, **focus ring on light** | Gesso on it **8.31** |
| `vermilion` | `#B03F2C` | Mercuric red | Accents, "in progress" tags | Gesso on it **4.83** (the tightest pair) |
| `verdigris` | `#2F6A53` | Copper green | "Finished" tags | 5.25 |
| `umber` | `#5A3E2B` | Raw umber | Underpainting labels, secondary buttons | 8.04 |
| `ochre` | `#C29545` | Yellow ochre | **Focus ring on dark**, text on ink | Ochre on ink 6.15 |
| `gold` | `#C8A24A` | Gold leaf | Frames, glints, punchwork | On ink 6.98; on gesso **1.99, decoration only** |

**Rules:**
- **Gold never carries text on light backgrounds.**
- Focus rings are 3 px outlines: ultramarine on light, ochre on dark. Both are well above 3:1 [S58].
- Any new colour pair goes through the script before use.

### 6.2 Type

| Role | Font | Size (desktop → phone) |
|---|---|---|
| Name (exterior) | Cormorant Garamond | `clamp(40px, 6vw, 72px)` |
| h1 / project title | Cormorant Garamond | `clamp(32px, 4vw, 48px)` |
| h2 / layer titles | EB Garamond | 28 → 24 px |
| Body | EB Garamond | 18 px / 1.6 |
| Captions | EB Garamond | 15 px, `stone-700` |
| "Conservation labels" (LAYER 2 · PAINT) | System monospace (`ui-monospace, 'Cascadia Mono', Menlo, monospace`) | 12–13 px, letter-spaced. Zero download. |

- **Cormorant Garamond only at display sizes** [S48].
- **EB Garamond** also appears in Falling Constellations, a quiet thread between site and project.
- **Self-hosting:** use Fontsource, Latin subset only, `font-display: swap`. Preload only EB Garamond Regular. The name falls back to a system serif until Cormorant arrives, so the LCP is never blocked.

### 6.3 Textures and treatments

- **Grisaille:** a desaturated, softly blurred crop of the Cellier wing exteriors (Met 435638) for the closed wings, with stone-tone CSS gradients on top.
- **Gold:** crops of the tooled gold grounds (Met 459134, 459136) for frame mouldings. A punchwork-style ring appears on hover (M4).
- **Craquelure:**
  - Straight "Flemish" cracks to match a Northern panel [S10], as one tiled PNG or SVG at ≤ 6% opacity.
  - Used on painted panels only, never behind text.
  - In Phase 6 it can catch the glaze light (M11).
- **Painterly treatment:** every screenshot, CC0 fragment and drawing goes through the same Kuwahara filter (Blender, offline [S18]), so the collage reads as one painting. A live shader version is optional [S17].
- **Sfumato:**
  - Pre-rendered blurred copies of large images for M13.
  - The Ginevra de' Benci haze tones (NGA 50724) for the About page background.

---

## 7. Asset list

### 7.1 CC0 museum images (licences confirmed 2026-11-13)

| ID | Work | Use in the site | Licence check |
|---|---|---|---|
| Met 470304 | Workshop of Robert Campin, *Annunciation Triptych (Merode Altarpiece)*, c. 1427–32 | Palette anchor. Joseph's-workshop detail on the Contact wing (a maker's emblem). | `isPublicDomain: true` [S59] |
| Met 435638 | Jean Bellegambe, *Cellier Altarpiece*, 1511–12 | Grisaille texture for the closed exterior | `isPublicDomain: true` [S59] |
| Met 459134 | Lippo Memmi (workshop), *Madonna and Child*, c. 1340 | Gold ground and punchwork for frames | `isPublicDomain: true` [S59] |
| Met 459136 | Simone Martini, *Madonna and Child*, c. 1326 | Alternative gold source | `isPublicDomain: true` [S59] |
| Met 420449 | Michelangelo Anselmi, *Putti Playing with Hoops* (pricked cartoon), c. 1548 | Line and pricking style for the Underdrawing layer frames | `isPublicDomain: true` [S59] |
| NGA 50724 / 50725 | Leonardo, *Ginevra de' Benci* (obverse / reverse) | Sfumato tones for About; the reverse's wreath can frame your monogram | `openaccess=1` [S60] |
| Walters 37.677 | *The Ideal City*, c. 1480–84 | Optional 404 panorama | Public domain [S61]. Commons file is only 1798 × 651 px; download a larger one from the Walters by hand. |

**Avoid:**
- Ghent Altarpiece imagery: its licence was never checked; it served as an interaction reference only [S1].
- Works in Italian state museums, where reproduction fees apply [S16].
- National Gallery London images, until you have read its terms [S14].

Credit every CC0 image on `/about/` anyway. It costs nothing and shows care.

### 7.2 Images you make

| Item | Count | Notes |
|---|---|---|
| Predella scenes | 7 | Small square compositions, one per project, painted or collaged and Kuwahara-treated. Keep each one's look consistent with the others. |
| Layer images | ~4–6 per project | Varnish 1 (hero), Paint 1–2, Underpainting 1 diagram, Underdrawing 1–2 sketches or early commits |
| About portrait or workshop scene | 1 | A painted-style photo of you at work echoes Joseph's workshop |
| Monogram | 1 SVG | Your initials. It works in the wreath idea above. |
| Craquelure tile | 1 | Draw it, or trace it from a CC0 detail |
| Open Graph image | 1 | 1200 × 630 still of the open altarpiece |

### 7.3 Video

| Clip | Length | Why |
|---|---|---|
| Juno | ~35 s | No public demo. **Use test contacts or blur names:** a real friend group's messages are their data. |
| Hearth | ~25 s | Multiplayer is hard to try alone |
| Nightfall | ~25 s | No public build (models withheld) |
| MLB preview | ~10 s | Covers the 30–60 s Render cold start [S50] |
| NBA preview | ~10 s | Covers the ~60 s Streamlit cold start [S77] |
| NFL preview | ~10 s | Covers the 10–30 s first load |
| **Total** | **~115 s** | Fits MIT's 2-minute video total [S29] |

**SlideRoom subset:** the layer images double as your Maker Portfolio upload. About 3 items per project × 7 + About = ≤ 25 items [S29].

---

## 8. Accessibility specification

Target: **WCAG 2.2 AA.**

### 8.1 Structure and keyboard

**Every page:**
1. "Skip to content" link
2. Header (name/home, Index, About, GitHub)
3. `main`
4. Footer (Pause motion, credits)

**Home focus order** (follows the visual order):
1. **Skip intro** (only while the arrival runs)
2. Header
3. About: "Read more"
4. Featured: **Open project**, **Live site**, **Code**
5. Contact: Email, GitHub, CV
6. Predella links 1–7

**Predella markup** (a list of links, decision #18):
```html
<nav aria-label="Projects"><ul>
  <li><span id="pred-series">Prediction series</span>
    <ul aria-labelledby="pred-series">
      <li><a href="/projects/nfl-predictor/"><img alt="" …><span>NFL Predictor</span></a></li> …
    </ul></li>
  <li><a href="/projects/hearth/">…</a></li> …
  <li><a href="/projects/falling-constellations/">…<span>Falling Constellations</span>
      <span aria-hidden="true">★</span><span class="visually-hidden">(featured)</span></a></li>
</ul></nav>
```
- The scene image has `alt=""` because the link text already names it.
- On phones the same list becomes a horizontal scroll-snap strip.

**Project page focus order:**
1. Header
2. Title, metric, **Live demo**, **Code**
3. Layer slider
4. Layer sections
5. Prev/next nav

**Prev/next nav:**
- The edge wings are real links (`rel="prev"` / `rel="next"`) in a `<nav aria-label="Previous and next project">` placed after the content in the DOM.
- The bottom bar repeats them with full titles.
- `main` gets side padding ≥ the wing width, so a fixed wing can never sit over a focused element [S57].
- The sticky header gets `scroll-padding-top` equal to its height [S57].

**Lens:**
- Pointer-only and `aria-hidden="true"`.
- Everything it reveals also appears in the Layer 4 section. **Nothing is lens-only.**

**Layer slider:**
- Use a **native** `<input type="range" min="1" max="4" step="1">` with `aria-label="Paint layer"`.
- Update `aria-valuetext` to e.g. "Layer 2 of 4: Paint" [S55].
- The native control gives arrow, Home and End keys for free, and tap-to-jump on the track, so dragging is never required [S56].

### 8.2 Motion and media

- Every animation has the reduced-motion version listed in Section 5 [S36][S38].
- A footer **Pause motion** toggle (`aria-pressed`, saved in `localStorage`) applies the reduced-motion styles and stops WebGL and video loops. It satisfies 2.2.2 [S37] even if a loop slips past 5 s.
- Videos are muted until played, have captions, and show a poster frame. No autoplay with sound.

### 8.3 Alt text rules

Model the alt text on the NGA's assistive-text field [S60].

- **Say what is shown and why it matters here.** For example: "NBA Predictor dashboard: tonight's games, each with a calibrated win probability for both teams."
- **Layer images describe the step in the process.** For example: "Early sketch of the feature pipeline, drawn before any code."
- **Paintings get title, maker and date** on the first use. For example: "Detail of Joseph in his workshop, from the Merode Altarpiece (Workshop of Robert Campin, c. 1427–32)."
- **Textures, glints, craquelure and gold:** use CSS backgrounds or `alt=""`.
- **The build fails on a missing alt** (schema in Section 3.3).

### 8.4 Contrast and targets

- **Contrast:** see Section 6.1. Gold is decorative only on light backgrounds.
- **Edge wings:** ≥ 44 px wide. **Other targets:** ≥ 24 × 24 px.

### 8.5 Test checklist (Phase 7)

- [ ] Keyboard only, through every page; focus always visible and never hidden
- [ ] NVDA or Narrator (both free on Windows): predella, slider value text, page titles
- [ ] OS "reduce motion" on: only fades remain
- [ ] 200% zoom and 320 px width: nothing clipped
- [ ] JS disabled: every page and link works
- [ ] Pause motion stops everything

---

## 9. Technical architecture

### 9.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro**, static output | HTML-first, zero JS by default [S47][S69] |
| Routing and transitions | `<ClientRouter />` + `transition:name` / `transition:persist` | Shared-element morphs; reduced-motion handling built in [S62] |
| Styling | Plain CSS with custom properties; CSS 3D; scroll-driven animations | No runtime cost [S23][S24][S71] |
| Images | `astro:assets` `<Picture>` (AVIF/WebP + fallback; dimensions inferred, so no CLS) | [S65] |
| WebGL | Raw WebGL2, reusing your Falling Constellations quality controller | No Three.js needed; you already have tested code [P4-reuse] |
| JS libraries | **None required.** GSAP stays optional (5.1). | Keeps the JS budget |

### 9.2 Folder structure

```
src/
  content.config.ts
  content/projects/{nfl-predictor,nba-predictor,…}.md
  assets/projects/<slug>/{predella,varnish,paint-1,underpainting,underdrawing-1}.png
  assets/art/{merode-joseph,cellier-grisaille,gold-ground,craquelure}.jpg|png
  components/
    Altarpiece.astro   Wing.astro   MainPanel.astro   Predella.astro
    ProjectLayers.astro   LayerSlider.astro   Lens.astro   ProjectNav.astro
    Header.astro   PauseMotion.astro   GlazeCanvas.astro
  layouts/Base.astro          # <ClientRouter />, fonts, tokens, inline arrival script
  pages/index.astro  about.astro  404.astro
  pages/projects/index.astro  pages/projects/[slug].astro
  scripts/lens.ts  slider.ts  glaze/{glaze.ts, quality.js}   # quality.js from Falling Constellations
  styles/tokens.css  global.css  arrival.css
public/cv.pdf  favicon.svg
```

### 9.3 Components

| Component | Does | JS | Persisted across pages |
|---|---|---|---|
| Altarpiece / Wing / MainPanel | Triptych layout, 3D wing faces, arrival classes | Inline arrival script only (5.3) | No |
| Predella | `nav > ul > li > a`; glint; optional preview (M5) | A few lines for M5 | No |
| ProjectLayers | Four `<section>`s with scroll reveal (M10) | None | No |
| LayerSlider | Native range input → hero cross-fade, `aria-valuetext` | `slider.ts`, re-bound on `astro:page-load` | No |
| Lens | Transform-based loupe (M8) | `lens.ts` | **Yes:** `transition:persist="lens"`, so it is literally the same object on every project page [S62]. CSS animations restart on persisted elements, so keep its motion in JS. |
| ProjectNav | Edge wings + bottom bar (`rel` prev/next) | None (the fold is CSS) | No |
| PauseMotion | Footer toggle | ~10 lines | No |
| GlazeCanvas | One `<canvas>` behind the panels: glaze light, live Kuwahara on the hero (optional), lens soft edge, craquelure light | Loaded **after LCP** with `import()` on idle | **Yes:** `transition:persist` |

**Note on islands:** Astro's `client:idle` and `client:visible` directives apply to UI-framework components (React, Svelte, etc.) [S69]. With no framework, GlazeCanvas uses a normal `<script>` that calls `requestIdleCallback(() => import('./glaze/glaze.ts'))`. The effect is the same, with no framework to download.

### 9.4 WebGL rules (from your Falling Constellations code)

- WebGL2 baseline. If it is missing, or `?nogl` is set, the CSS gradients and static images *are* the design, not an error state.
- Reuse `quality.js`: it adaptively lowers resolution and effects on slow frames.
- Reuse the context-loss handling and the pause when the tab is hidden.
- Cap the device pixel ratio at 2 (1.5 on phones), and **render on demand**: only on pointer move or scroll, never in an idle loop [S41].
- Use the `?debug` frame-time readout from P4 to check phones.
- Under reduced motion or Pause motion, render one still frame and stop.

### 9.5 Performance budget (home page, phone)

| Item | Budget | Notes |
|---|---|---|
| Critical-path JS | **≤ 75 KiB** [S66]; planned ~1 KB | Only the inline arrival script |
| Total critical path | **≤ 1.4 MiB** [S66] | HTML, CSS, 1 preloaded font, first-screen images |
| Deferred JS (after LCP) | Measure; aim small | lens, slider, glaze (own code, no library) |
| LCP | ≤ 2.5 s | The name text on `/`; the hero image on project pages (`fetchpriority="high"`, eager) |
| INP | ≤ 200 ms | No heavy work on input; shader work is per frame and capped |
| CLS | ≤ 0.1 | `<Picture>` dimensions; arrival is transform/opacity only |

**Measuring:** PageSpeed Insights, mobile [S75], plus a real mid-range phone. Every budget is a target until measured.

---

## 10. Build roadmap

The roadmap assumes you're comfortable with JS and WebGL (#15).

- **The site is shippable after Phase 2.** Each later phase adds polish without breaking what exists.
- **Effort is relative:** S = a sitting or two, M = a few days, L = a week or more of evenings. Estimates, not measurements.

| Phase | Build | Done when | Learn from | Effort |
|---|---|---|---|---|
| **0. Content** | Write the 7 project Markdown files from your READMEs; collect layer images; record the 5 videos (7.3); export your CV | Every project has oneLine, role, stack, links, metric (if any), 4 layers with captions and alt text | n/a | M |
| **1. Static skeleton** | Astro project, `Base` layout, header, content collection, all routes with the altarpiece shown *open*, Index table, About, 404. No animation. | Every page works with JS off; the build fails on missing alt; Lighthouse mobile (Chrome DevTools, or PageSpeed Insights once deployed) shows LCP ≤ 2.5 s; the tab order matches Section 8.1 | [S67] tutorial, [S68], [S65] | M |
| **2. Visual system** | Tokens, fonts, palette, Kuwahara-treated images, gold frames, grisaille, craquelure tile, predella glint (M4) | `contrast_check.py` passes for every pair used; all images look like one painting side by side | [S18], Section 6 | M |
| **3. Arrival** | CSS 3D wings (M1), glazes (M2), inline script (5.3), Skip intro, reduced-motion fade, phone `rotateX` | Plays at most once per 30 days (clear `arrivedAt` in DevTools to replay); any input opens or skips it; 150 ms fade under OS reduced motion; CLS 0 during the arrival; Tab never lands on a hidden link | [S71], [S76], [S36] | M |
| **4. Page transitions** | `<ClientRouter />`, scene → hero morph (M6), wing fold (M7), `astro:page-load` re-init, reduced-motion fade | Back/forward work; morph in Chrome and Safari; clean fallback in Firefox; no double animation under reduced motion | [S62], [S19] | M |
| **5. Beneath the Paint** | Layer sections + scroll reveal (M10), native layer slider (M9), transform lens (M8) persisted across pages | Every layer readable without the lens; slider works by keyboard and tap; NVDA reads "Layer 2 of 4: Paint" | [S55], [S56], [S23], [S72] | M |
| **6. WebGL extras** | GlazeCanvas: glaze light (M11), lens soft edge, optional live Kuwahara on the hero, craquelure light; reuse `quality.js`; Pause motion | No visible stutter on a mid-range phone at capped DPR (`?debug` readout); recovers from context loss; `?nogl` looks intentional; INP ≤ 200 ms | [S73], [S17], [S41], your P4 code | L |
| **7. Test and polish** | The checklist in 8.5; real phone; cold-start notes and previews; credits page; Open Graph image | Every checklist box ticked; PageSpeed mobile in the green for LCP, INP and CLS | [S75], Section 8 | S–M |

**Why this order:**
- Content first, because the layers *are* the content.
- A working plain site before any motion [report 5.0].
- WebGL last, because it is the part most likely to need tuning and the site never depends on it.

---

## 11. Risks and open questions

| Risk | Impact | Mitigation |
|---|---|---|
| Firefox support for cross-document view transitions is unconfirmed [S21] | Firefox users see the fallback, not the morph | `<ClientRouter />` fallback `animate` [S62]; the design never depends on the morph |
| Directional wing fold (M7) is custom work | Could take longer than planned | Fallback: a plain 350 ms cross-fade |
| `<ClientRouter />` reduced-motion handling vs your own 150 ms fade | A double or missing fade | Test in Phase 4 (5.4) |
| Streamlit/Render apps sleep | Reviewers wait 10–67 s, or bounce | Cold-start note + ~10 s recorded preview (`coldStartSeconds`). NBA measured at ~60–67 s cold, ~2 s warm [S77]; one sample, so re-check after deploying |
| Juno video shows real people's messages | Privacy | Test contacts or blurred names (7.3) |
| Astro API details change between versions | The schema sketch may not compile as written | Check [S68] and [S62] against your installed version |
| WebGL cost on phones | Jank, battery drain | Render on demand, DPR cap, quality.js, `?nogl` |
| The arrival feels repetitive | Annoys returning visitors | At most once per 30 days (#23); Skip intro and any input end it at once |
| Hover preview (M5) may distract | Visual noise | It's optional: try it, keep it only if it helps |
| Budgets are estimates | Could miss the targets | Measure in Phases 1, 6 and 7 [S75] |

**Open questions for you:**
1. Hosting and domain: out of scope here. Any static host works, including GitHub Pages, which you already use.
2. Will you add school or academic work later? The content model takes it as-is; add a `kind: school` field if you want to filter by it.

**Image-rights items from report Section 8:**
- **Now closed:** Merode, Anselmi and Ginevra, plus the Cellier and Sienese gold images [S59][S60].
- **No longer needed:** the Carpaccio study.
- **Still open but avoided:** National Gallery London's terms [S14] and Italy's fee amounts [S16]. Neither is used in this spec.

---

## 12. Sources

Full entries for **S1–S48** are in `report.md` Section 10. Entries for **S49–S77** are in `notes.md` (Amendment 1 notes).

**Cited from the main research:**
- S1 Closer to Van Eyck
- S5 Met, oil painting in the Low Countries
- S10 Craquelure
- S14 National Gallery London licences
- S16 Italy public-domain fees
- S17 Painterly shaders
- S18 Kuwahara (Blender)
- S19 MDN View Transitions
- S21 Cross-document view transitions support
- S23 MDN scroll-driven animations
- S24 web.dev October 2026 (scroll-driven Baseline)
- S29 MIT Maker Portfolio
- S30 NN/g scrolling and attention
- S31 NN/g hidden navigation
- S32 Hiring-manager survey
- S33 Ladders résumé eye-tracking
- S36 WCAG 2.3.3
- S37 WCAG 2.2.2
- S38 MDN prefers-reduced-motion
- S39 web.dev animations performance
- S40 Core Web Vitals thresholds
- S41 three.js pixel ratio and render on demand
- S47 Learning Astro
- S48 EB Garamond / Cormorant Garamond

**Amendment 1:**

| ID | Source | URL |
|---|---|---|
| S49 | NN/g, Executing UX Animations: Duration and Motion Characteristics | https://www.nngroup.com/articles/animation-duration/ |
| S50 | Nielsen, Response Times: The 3 Important Limits | https://www.nngroup.com/articles/response-times-3-important-limits/ |
| S51 | Material Components for Android, Motion (M3 easing and duration tokens) | https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md |
| S52 | GSAP docs, Eases | https://gsap.com/docs/v3/Eases/ |
| S53 | GSAP docs, CustomEase | https://gsap.com/docs/v3/Eases/CustomEase |
| S54 | W3C APG, Tabs pattern | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ |
| S55 | W3C APG, Slider pattern | https://www.w3.org/WAI/ARIA/apg/patterns/slider/ |
| S56 | WCAG 2.2, Understanding 2.5.7 Dragging Movements | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html |
| S57 | WCAG 2.2, Understanding 2.4.11 Focus Not Obscured (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html |
| S58 | WCAG 2.2, Understanding 1.4.3 Contrast (Minimum) and 1.4.11 Non-text Contrast | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| S59 | The Met Collection API, object records | https://collectionapi.metmuseum.org/public/collection/v1/objects/470304 |
| S60 | National Gallery of Art open data, published_images.csv | https://github.com/NationalGalleryOfArt/opendata |
| S61 | Wikimedia Commons, Fra Carnevale, *The Ideal City* (Walters 37677) | https://commons.wikimedia.org/wiki/File:Fra_Carnevale_-_The_Ideal_City_-_Walters_37677.jpg |
| S62 | Astro docs, View transitions | https://docs.astro.build/en/guides/view-transitions/ |
| S63 | GSAP docs, gsap.matchMedia() | https://gsap.com/docs/v3/GSAP/gsap.matchMedia() |
| S64 | GSAP docs, Flip | https://gsap.com/docs/v3/Plugins/Flip/ |
| S65 | Astro docs, Images | https://docs.astro.build/en/guides/images/ |
| S66 | A. Russell, The Performance Inequality Gap, 2024 | https://infrequently.org/2024/01/performance-inequality-gap-2024/ |
| S67 | Astro, Build your first Astro Blog (tutorial) | https://docs.astro.build/en/tutorial/0-introduction/ |
| S68 | Astro docs, Content collections | https://docs.astro.build/en/guides/content-collections/ |
| S69 | Astro docs, Islands architecture | https://docs.astro.build/en/concepts/islands/ |
| S70 | GSAP docs, ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ |
| S71 | MDN, Using CSS transforms | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms |
| S72 | MDN, mask-image | https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image |
| S73 | MDN, WebGL tutorial | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial |
| S74 | MDN, Window.sessionStorage | https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage |
| S75 | Google, PageSpeed Insights | https://pagespeed.web.dev/ |
| S76 | MDN, Window.localStorage | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| S77 | Own measurement: NBA Predictor live demo load time, 2026-11-13 | https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app |
| P4 | Your Falling Constellations repo (HANDOFF.md: quality.js, context loss, `?nogl`, `?debug`) | https://github.com/arinb44/Falling-Constellations |

**Source caveats:**
- S67–S75 were checked only to confirm the links resolve. They serve as learning pointers, not as evidence for claims. S74 (sessionStorage) is no longer used since decision #23; S76 replaces it.
- S76's key sentence (localStorage has no expiry; sessionStorage clears when the page session ends) was read directly.
- S77 is a single measurement from one connection, not a benchmark.
- S63, S64 and S70 cover GSAP features this spec now treats as optional.
- S54 (Tabs) informed decision #18 (links instead of tabs) and is not used in the build.
