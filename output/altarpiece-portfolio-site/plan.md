# Plan: Altarpiece Portfolio Site

## Project Title
Build the Renaissance-altarpiece portfolio site from `hybrid-spec.md` (roadmap phases 1–7).

## Objective
Build the static Astro site that `output/renaissance-portfolio-concepts/hybrid-spec.md` specifies. The parts are:
- the altarpiece home page, the Index table, 7 project pages, About and 404;
- then, in the spec's order: the visual system, the arrival, page transitions, the Beneath the Paint layers and the WebGL extras.

The site must work with JS off after every milestone. Accessibility and the performance budgets come before visual fidelity. Project text is drafted from your README notes; images, videos and the CV are labelled placeholders until you supply them.

## Requirements
Spec section numbers are in brackets.

**Site and content**
1. Astro static build with these routes: `/`, `/projects/`, `/projects/<slug>/` × 7, `/about/`, `/404` and `/cv.pdf` (a placeholder) [3.1].
2. A `projects` content collection with the spec's fields [3.3].
   - The build fails on a missing or empty alt text, on a wrong layer count, or if not exactly one project is `featured`.
3. Seven project Markdown files, drafted from notes P1–P7 and spec 3.4.
   - Each has `oneLine`, `role`, `stack`, links, `metric` where one exists, and 4 layers with captions and alt text.
   - Each is marked `draft: true` until you check the facts.
4. Placeholder images for every predella scene and layer image. Each is labelled "PLACEHOLDER: <project> <layer>" so none can be mistaken for final art.

**Layout on every page**
5. A sticky header on every page: monogram + name (home link; the `<h1>` on `/`), **Index**, **About**, **GitHub ↗** [3.1].
   - Index stays a visible text link on phones.
   - Every page also has a skip link and a footer with **Pause motion** and credits [8.1].

**Pages**
6. Home without JS shows the *open* altarpiece [5.3]:
   - About wing, the featured Falling Constellations panel and the Contact wing (Email, GitHub, CV).
   - The predella as a `<nav>` list of 7 links: the Prediction series grouped and labelled, and ★ with visually hidden "(featured)" [8.1].
7. The Index (`/projects/`) is a real `<table>` of every project: what it is, stack, links. It has no animation and prints cleanly [2.2].
8. Project page:
   - The result comes first: title, metric, role, stack, **Live demo** and **Code**. A cold-start note shows when `coldStartSeconds > 10`.
   - Then four layer sections, each tagged finished / in-progress.
   - Then prev/next in the spec's order, wrapping around: edge wings (≥ 44 px) and a bottom bar, using `rel="prev"` / `rel="next"` [3.2, 8.1].

**Look and motion**
9. Visual system [6]:
   - Palette, type and motion tokens.
   - Self-hosted Latin-subset fonts with `font-display: swap`; only EB Garamond Regular is preloaded.
   - Gold frames, grisaille, a craquelure tile, the predella glint (M4) and the sfumato image load (M13).
10. The arrival (M1–M3) [5.3]:
    - CSS 3D wings, then the glazes.
    - It plays at most once per 30 days.
    - **Skip intro** button; any input skips it, and so does focus moving into the page.
    - Reduced motion: a 150 ms fade. Phones: `rotateX`.
11. Page transitions (M6 scene → hero morph, M7 directional wing fold) through `<ClientRouter />` [5.4].
    - Setup code re-runs on `astro:page-load`.
    - Reduced motion: one 150 ms fade, never two.
12. Beneath the Paint [5.2, 8.1]:
    - Scroll reveal (M10), skipped when the browser lacks support.
    - A native range slider (M9) whose `aria-valuetext` reads "Layer N of 4: Name".
    - The pointer-only lens (M8): `aria-hidden`, kept across pages, and nothing is shown only through it.
13. **Pause motion** [8.2]: an `aria-pressed` toggle saved in `localStorage`. It applies the reduced-motion styles and stops WebGL and video.
    - Video component (M12): muted, captioned, with a poster frame; loops ≤ 5 s or has a **Pause** button. Reduced motion shows the poster only.
14. GlazeCanvas (M11 plus the lens soft edge and the craquelure light) [9.3, 9.4]:
    - Loaded after LCP on idle and rendered on demand, never in an idle loop.
    - DPR capped at 2 (1.5 on phones); recovers from context loss; pauses when the tab is hidden.
    - `?nogl` falls back to the CSS design; `?debug` shows frame times.
    - Under reduced motion or Pause motion, it draws one still frame.

**Quality bars**
15. Budgets on the home page and one project page [9.5]:
    - Critical-path JS ≤ 75 KiB; total critical path ≤ 1.4 MiB.
    - LCP ≤ 2.5 s and CLS ≤ 0.1, measured with Lighthouse mobile.
    - INP ≤ 200 ms, judged by hand: it needs real input, which a page load doesn't give.
16. WCAG 2.2 AA [8]:
    - Focus rings: ultramarine on light, ochre on dark.
    - Targets ≥ 24 × 24 px; `scroll-padding-top` set to the header height.
    - Every colour pair used passes the contrast formula.
    - Every page works with JS off, at 320 px width and at 200% zoom.
17. A root `README.md` with the run, build and test commands and how to add or edit a project.

## Scope
**In scope:** everything above, in the project root (`src/`, `public/`, config, tests, `README.md`) and in this folder.

**Out of scope:**
- Real artwork, screenshots, videos, the CV and the portrait (placeholders are used instead).
- Hosting, domain, deployment and analytics.
- Edits to `output/renaissance-portfolio-concepts/` or to your other repositories.
- Design changes the spec doesn't describe.

## Technical Approach
- **Setup:** a minimal hand-made Astro project (`package.json`, `astro.config.mjs`, `tsconfig.json` extending `astro/tsconfigs/strict`) rather than a starter template, so no template files need deleting.
  - The spec's schema sketch and router event names get checked against the installed Astro version in Milestone 1. Differences go into `decisions.md`.
- **Structure:** spec 9.2, as written.
  - Pages read the collection and sort it by `order`.
  - Prev/next is a small pure function, `src/lib/order.ts`, so it can be tested.
- **No JS by default.** Each piece of JS is a plain `<script>`, re-bound on `astro:page-load`. Each one's logic lives in a small `.ts` module that is tested on its own:
  - Arrival: the inline script's source is a plain file in `src/scripts/`, inlined with `set:html` from a `?raw` import, so the code that runs is the code that's tested.
  - Lens, slider, fold direction, Pause motion: each one's logic is a pure function next to its DOM wiring.
  - GlazeCanvas: loaded with `requestIdleCallback(() => import(...))` [9.3].
- **Styles:**
  - `tokens.css` holds the palette and type from spec 6, plus the motion tokens from 5.1.
  - `global.css` holds the layout and focus rings.
  - `arrival.css` holds the M1–M2 keyframes, which apply only under `html:not(.arrived)` and `prefers-reduced-motion: no-preference`.
- **Images:**
  - `astro:assets` `<Picture>` for raster images.
  - Placeholders are generated once by a small script (`scripts/placeholders.mjs`) using `sharp`, which Astro already installs for its image service, so they are real PNGs and `<Picture>` can process them like final art.
  - Sfumato loading (M13): a tiny low-resolution copy sits under the sharp image with a static blur, and the sharp image fades in with opacity. The blur is never animated.
- **Contrast:** a unit test ports the 10-line WCAG formula from `contrast_check.py` (spec 6.1). It checks every pair listed in `src/styles/contrast-pairs.ts`. `contrast_check.py` is run read-only as a cross-check.

## Files Affected
All new; nothing existing is modified or deleted.

| Path | Why |
|---|---|
| `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore` | Project setup |
| `README.md` | Run, build, test and add-a-project instructions |
| `src/content.config.ts` | Collection schema that fails the build on bad content |
| `src/content/projects/*.md` (7) | Drafted project content |
| `src/assets/projects/<slug>/*.png`, `src/assets/art/*` | Placeholder images (later your art and the CC0 crops) |
| `src/components/*.astro` (11, as in spec 9.2) | Altarpiece, Wing, MainPanel, Predella, ProjectLayers, LayerSlider, Lens, ProjectNav, Header, PauseMotion, GlazeCanvas; plus Footer and Video |
| `src/layouts/Base.astro` | Router, fonts, tokens, inline arrival script |
| `src/pages/index.astro`, `about.astro`, `404.astro`, `projects/index.astro`, `projects/[slug].astro` | Routes |
| `src/lib/order.ts` | Order, prev/next and wrap-around logic |
| `src/scripts/arrival.js`, `lens.ts`, `slider.ts`, `direction.ts`, `pause.ts`, `glaze/*` | Behaviour |
| `src/styles/tokens.css`, `global.css`, `arrival.css`, `contrast-pairs.ts` | Visual system |
| `public/cv.pdf` (placeholder), `public/favicon.svg` | Static files |
| `scripts/placeholders.mjs` | Generates the labelled placeholder images |
| `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts`, `playwright.config.ts` | Tests (the e2e files only with option B below) |

## Dependencies
Each one is installed only after you say yes. Installing needs network access.

| Package | Kind | Why |
|---|---|---|
| `astro` | build | The framework the spec chose. `sharp` comes with it for images. |
| `@fontsource/eb-garamond`, `@fontsource/cormorant-garamond` | build | Self-hosted fonts [6.2] |
| `typescript`, `@astrojs/check` | dev | `astro check` type-checks `.astro` and `.ts` files under the strict preset |
| `@playwright/test`, `@axe-core/playwright` | dev | **Only with test option B.** Browser tests for JS off, reduced motion, keyboard order, 320 px, and axe scans. Playwright also downloads a Chromium build (about 150 MB). |

There are no runtime JS libraries; GSAP stays out unless you approve it later.

## Testing Strategy
- **Build gate:** `astro check` (types) + `astro build` (schema validation fails on bad content).
- **Unit tests:** Node's built-in test runner (`node --test`). It runs `.ts` files directly on Node 26, so it needs no test library. It covers:
  - prev/next order and wrap-around
  - the 30-day arrival rule, with a fake clock and fake storage
  - fold direction from the clicked link
  - the slider's value text
  - Pause motion state
  - every contrast pair
  - the WebGL quality controller
- **Built-site checks** (a unit test over `dist/`):
  - every route exists and every internal link resolves;
  - one `<h1>` per page, and every `<img>` has an `alt` attribute;
  - the predella has 7 links in order.
- **Browser checks:** set by decision D1 below.
- **Command:** `npm test`. It runs check, build, unit tests and, with option B, the Playwright suite. Results are reported after every milestone.
- **Your manual checks:** NVDA or Narrator, and a real phone, in Milestone 9.

## Milestones
Each one ends with the site working, the tests run and reported, and a proposed commit.

| # | Milestone | Done when |
|---|---|---|
| 1 | **Setup + content model.** Project files, deps (approved), schema, 7 drafted project files, placeholder images, test harness, README skeleton. Git repository question (D2). | Build passes; a deliberately missing alt fails the build (shown once, then reverted); unit harness runs |
| 2 | **Static skeleton** (roadmap Phase 1). Base layout, Header, Footer, skip link; Home with the open altarpiece; Index table; project pages with layers and prev/next; About; 404; placeholder CV. No motion. | Every page works with JS off; tab order matches 8.1; built-site checks pass; first Lighthouse mobile run reported |
| 3 | **Visual system** (Phase 2). Tokens, fonts, palette, frames, grisaille, craquelure, M4 glint, M13 sfumato load; M5 preview per D5. | Contrast test passes for every pair used; axe finds no contrast issues |
| 4 | **Arrival** (Phase 3). M1–M3, Skip intro, the 30-day rule, the reduced-motion fade, phone `rotateX`. | Plays on a first visit, not again within 30 days; input skips it; reduced motion gives the fade only; CLS 0 during the arrival; Tab never lands on a hidden element |
| 5 | **Page transitions** (Phase 4). `<ClientRouter />`, M6 morph, M7 directional fold, page-load re-init, reduced-motion fade. | Back/forward work; one fade (not two) under reduced motion; fallback used if the browser lacks view transitions |
| 6 | **Beneath the Paint** (Phase 5). M10 reveal, M9 slider, M8 lens kept across pages. | Every layer readable without the lens; slider works by keyboard and click on the track; value text reads "Layer 2 of 4: Paint" |
| 7 | **Pause motion + video.** Footer toggle; Video component with placeholder poster. | Toggle saved across pages; with it on, nothing animates and video does not autoplay |
| 8 | **WebGL extras** (Phase 6). GlazeCanvas per D6/D7. | `?nogl` looks intentional; recovers from forced context loss; one still frame under reduced motion / Pause; no idle render loop; `?debug` readout works |
| 9 | **Test + polish** (Phase 7). Checklist 8.5, budgets, Open Graph placeholder, credits, README final, `summary.md`. | Every automated check passes; budgets reported; your manual checks listed for you |

## Decision Points
| # | When | Decision |
|---|---|---|
| D1 | **Now, with this plan** | Browser testing. **A:** no browser test library; I check pages by hand in the built-in browser and report what I saw. No new deps, but the checks aren't repeatable. **B (recommended):** Playwright + axe. Repeatable checks for JS off, reduced motion, keyboard order, 320 px and accessibility; two dev deps and a ~150 MB browser download. **C:** Vitest + Playwright, Astro's documented setup; one more dep than B, and Vitest adds nothing that `node --test` lacks here. |
| D2 | End of Milestone 1 | `git init`, which GitHub repository to use, and the branch name. |
| D3 | Milestone 2 | What to publish: display name, one-line tagline, the email address for the Contact wing, About text. Until then, placeholders like "[Your Name]". |
| D4 | Milestone 3 | CC0 museum images (spec 7.1): download them now (I list each file, source and size first) or keep CSS-only stand-ins for now. |
| D5 | Milestone 3 | Build the optional M5 hover preview, or skip it. |
| D6 | Milestone 8 | WebGL quality controller: copy `quality.js` from your Falling Constellations repo (needs fetching from GitHub; its tests use Bun, so I'd port them to `node --test`), or write a small new one. |
| D7 | Milestone 8 | Build the optional live Kuwahara shader on the hero, or skip it. |

Any further choice that comes up (an Astro API difference, a spec conflict) is asked at the time and logged in `decisions.md`.

## Risks & Limitations
- **Astro API drift:** the spec's sketches may not match the installed version. They get checked in Milestone 1, and differences are logged.
- **View transitions:** cross-document view transition support in Firefox is unconfirmed, so Firefox may get the fallback, not the morph. The directional fold (M7) is custom work; the spec's fallback is a plain 350 ms cross-fade.
- **3D transforms:** Safari's `backface-visibility` and 3D transforms can behave differently. The open state is the HTML default, so a failure only affects the animation.
- **Placeholders:** visual fidelity can only be judged roughly until your art exists. The look of milestones 3 and 8 will change when real images arrive.
- **Measurements:** Lighthouse runs on this PC with simulated throttling, which isn't a real phone. The spec asks for a real mid-range phone check; that's in Milestone 9, done by you.
- **Draft content:** facts come from README notes read on 2026-11-13. They need your check before publishing; `draft: true` marks them.
- **Network:** npm installs, the Playwright browser download and the CC0 image downloads need network access. Each is asked first.

## Open Questions
1. **D1:** test option A, B or C?
2. Anything to add to or remove from the milestones?

**Status:** Approved on 2026-11-14, with browser-test option B (Playwright + axe).
