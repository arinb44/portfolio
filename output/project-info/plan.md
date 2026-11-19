# Plan: Project Info

## Project Title
Real, checked information and images on all five project pages, plus Nightfall's gameplay video.

## Objective
Replace the drafted text, `TODO`s and placeholder images on the five project pages with facts checked against each project's repository and real images. Those images are live-demo screenshots, charts already in the repos, simple architecture diagrams, and for Nightfall, stills from the user's gameplay video. Nightfall's project page plays that video in its hero. The work goes one project at a time: you review each project's text before it's committed.

## Requirements
1. All five project files have no `TODO` left in any field a visitor sees: `role`, layer `text`, image `caption`, image `alt`.
2. Each role line says the project was solo, worded for that project (e.g. "Solo: data pipeline, model, dashboard and deployment").
3. The `oneLine`, `stack`, `year`, `demo` and every layer `text` are checked against the repo. Anything the repo doesn't support is corrected or removed.
4. A `metric` appears only when a repo file states it, with its baseline and context (period, games). Each metric's source file is recorded in `decisions.md`.
5. The 4 shown images per project (hero `varnish`, `paint-1`, `underpainting`, `underdrawing-1`) are real. Each has alt text that describes what it shows (no "Placeholder:") and a caption.
6. Hero images are about 1600×1000 and section images about 1200×800, matching the current layout. Each source file is ≤ 400 KB.
7. Nightfall's page shows its gameplay video in the hero. The video is muted and loops, plays inline, has visible controls and a poster, and doesn't autoplay under reduced motion (the poster shows instead).
8. Nightfall's 4 stills are frames from the user's video.
9. `npm test` passes after every milestone. A new e2e check confirms that each finished project's page contains no "TODO" or "Placeholder".

## Scope
**In:** `src/content/projects/*.md` (all fields except `order`, `featured`, `draft`), the 4 shown images per project, `public/projects/nightfall/` (new video files only), `src/pages/projects/[slug].astro` + its CSS (video hero only), project-page tests, one capture script.
**Out:** `draft` flags, `predella` images and alt (not shown on the site), the home page, intro, painted loops and posters, site-wide styling, other agents' `output/` folders, the project repos.

## Technical Approach
- **Reading the repos:** blobless clones in the scratchpad (`git clone --filter=blob:none --no-checkout`). Files are read with `git show HEAD:<path>` and history with `git log`. Nothing from the repos is run or installed.
- **Captures:** a new `scripts/capture.mjs` uses the installed Playwright to:
  - Screenshot a URL (the live demos) at a set viewport, waiting for the app to load.
  - Screenshot a local HTML file (the diagrams) to PNG.
  - Each image gets a one-line source note in the script, so it can be redone.
  - Run with `node scripts/capture.mjs <name>`.
- **Diagrams:** small hand-written HTML/CSS files in `scripts/diagrams/<slug>.html`. They use the site's own fonts and colours (Night Sky / Atlas tokens), are captured at 1200×800, and show the real modules and data flow named in each repo.
- **Repo charts:**
  - MLB: `reports/shap_*.png`.
  - NBA: `reports/*accuracy_graph.png` / `*dashboard.png`.
  - NFL: plot outputs inside `notebooks/0*.ipynb`, decoded from the notebook's embedded base64 PNGs with a short Python one-off in the scratchpad.
  - Copied as-is, or cropped/resized with Pillow.
- **Nightfall video:** the user's file is converted with ffmpeg to `public/projects/nightfall/gameplay.webm` (VP9) and `gameplay.mp4` (H.264). It is ~25 s, 1280 px wide, with no audio track, and each file aims for ≤ 4 MB. 4 stills plus a poster are pulled with `ffmpeg -ss <t> -frames:v 1`.
  - `[slug].astro`: when `data.video` is set, the hero figure renders a `<video muted loop playsinline controls preload="metadata" poster=…>` with webm and mp4 sources. It autoplays only when `prefers-reduced-motion` is not `reduce`, using a few lines of inline script, as the home page loops do. The still `<Picture>` stays as the poster source.
  - The existing schema field `video: z.string().optional()` holds the base path, so no schema change is needed.
- **Text:** plain, factual sentences in the existing style. Numbers are copied from repo files, never rounded into a different claim. Anything only the user can know (why a project started, Nightfall's gameplay) is asked, not guessed.

## Files Affected
| File | Change | Reason |
|---|---|---|
| `src/content/projects/{nfl-predictor,mlb-predictor,nba-predictor,falling-constellations,nightfall}.md` | modify | Req 1–5, 7 |
| `src/assets/projects/<slug>/{varnish,paint-1,underpainting,underdrawing-1}.png` (20 files) | replace | Req 5, 6, 8 |
| `scripts/capture.mjs` | create | screenshots and diagram captures |
| `scripts/diagrams/{nfl-predictor,mlb-predictor,nba-predictor,falling-constellations}.html` | create | architecture diagram sources |
| `public/projects/nightfall/gameplay.{webm,mp4}` | create | Req 7 |
| `src/pages/projects/[slug].astro` | modify | video hero (Req 7) |
| `src/styles/global.css` | modify (few lines) | video sizing in the hero, if needed |
| `tests/e2e/site.spec.ts` | modify | no-TODO/Placeholder check; video hero checks |
| `package.json` | modify | `"capture": "node scripts/capture.mjs"` script |

## Dependencies
None new. Playwright (installed), ffmpeg 9.0.2 and Pillow 13 (already on this machine).

## Testing Strategy
- `npm test` after each milestone: check, build, unit, e2e.
- New e2e test in `site.spec.ts`: a `FINISHED` list of slugs that grows each milestone. For each one, the built project page's text and every `img[alt]` contain no "TODO" and no "Placeholder".
- Nightfall (M6), with JS on and with reduced motion:
  - The hero has a `video[controls][poster]` with webm + mp4 sources.
  - With reduced motion it is paused at time 0.
  - axe passes.
- A visual check of each finished page in the browser at desktop and 390 px width.

## Milestones
Each milestone ends with: `npm test` green, a browser check, your review of the page text, then a proposed commit, and a push only with approval.

1. **M1: Capture tooling + test scaffold.** Add `scripts/capture.mjs` and the `capture` npm script, plus the `FINISHED` check (empty list). Commit: "Add a capture script for project images".
2. **M2: NFL Game Predictor.** Facts from the README, `reports/results.json` and the notebooks.
   - Hero: the live dashboard's week view.
   - Key features: one game's factor waterfall.
   - Architecture: diagram of nflverse/Open-Meteo → feature modules → model → explain → dashboard, with the weekly automation.
   - Origins: a plot from `01_data_exploration.ipynb`, with the first commits' story.
   - Metric: from `reports/results.json` (holdout 2019–25), if you agree with how it's framed.
   - Commit: "Fill in the NFL project page".
3. **M3: MLB Game Predictor.** Facts from the README results and `docs/`.
   - Hero: the Render demo's Predictions tab.
   - Key features: a SHAP summary from `reports/`.
   - Architecture: diagram of pybaseball/Retrosheet → features → logistic/XGBoost/LightGBM/PyTorch → FastAPI → Docker on Render.
   - Origins: the earliest commit's state.
   - Commit: "Fill in the MLB project page".
4. **M4: NBA Game Predictor.** Check the existing 67.5% metric against the repo.
   - Hero: the Streamlit app.
   - Key features: the accuracy graph from `reports/`.
   - Architecture: diagram including the GitHub Actions data refresh.
   - Origins: from the first commits and docs.
   - Commit: "Fill in the NBA project page".
5. **M5: Falling Constellations.** Facts from `index.html`, `src/` and the repo's research/build notes.
   - Hero and Key features: captures of the live page.
   - Architecture: diagram of the Canvas 2D constellations over the WebGL2 galaxy passes.
   - Origins: from its research notes.
   - Commit: "Fill in the Falling Constellations project page".
6. **M6: Nightfall.** Needs your video file and your answers about the game (what the player does, what you built, which engine version).
   - Convert the video, pull the stills, add the video hero, write the text.
   - Commit: "Show Nightfall's gameplay and fill in its page".
7. **Phase 5:** `summary.md`.

## Decision Points
- Each project's text and image choice: you review before its commit.
- Metric framing for NFL (the model's 65.5% holdout accuracy sits below Vegas's 66.4%; shown honestly with that baseline, or no metric).
- If a live demo is down or asleep when it's captured: wait and retry, use a repo image instead, or capture later.
- Nightfall: the video's time stamps for the 4 stills and the poster.

## Risks & Limitations
- Live demos can be slow (NFL 10–30 s, MLB 30–60 s cold start) or asleep (Streamlit Cloud). Captures may need retries.
- Live demo screenshots show this week's data, so they will date. Captions will say when each was captured.
- Repo charts may not match the site's look (white backgrounds). They're cropped and resized only; their content isn't altered.
- Nightfall's facts depend almost entirely on you (the repo has 2 commits and a one-line README).
- Video adds about 4–8 MB to Nightfall's page. `preload="metadata"` keeps the first load light.

## Open Questions
- Nightfall video: where is the file, and roughly when does it show the best moments?

**Status:** Approved on 2026-11-18

---

# Part 2: Finish the portfolio (proposed 2026-11-18)

## Objective
Replace every remaining placeholder on the site, finish the Nightfall page, mark the projects published, and redesign the plain project pages now that their content is real. Deployment stays out of scope.

## Requirements
10. `src/site.ts`: name "Arin Barman", email `barmanar@umich.edu`, an approved tagline; the "TODO (decision D3)" comment removed.
11. About page: an approved bio and an Education section (University of Michigan, BSE Computer Science, expected May 2028; Michigan State University, 2025–2026); no bracketed text or TODO.
12. `public/cv.pdf` is the user's resume (the real file, 179 KB).
13. The three predictor role lines credit Michigan Edge.
14. Nightfall: role, lead text and all captions/alts real; 3 more real images; added to `FINISHED`.
15. `draft: false` on all five projects.
16. Project pages and the projects index redesigned to an approved direction; the h1 never breaks mid-word; axe, 320 px and keyboard tests still pass.
17. A site-wide test that no page contains "TODO", "[Your", "you@example" or "placeholder" in text or alt.

## Milestones
7. **M7: Identity, About, CV, role lines, publish.** Commit: "Fill in the site's name, About page and CV".
8. **M8: Nightfall page.**
   - Text from the repo code and the user's answers.
   - Key features: a still from the escape render, labelled as a render.
   - Architecture: an HTML diagram of the game's systems (wendigo state machine, safe zone, day–night cycle, flashlight, deer).
   - Origins: an early screenshot if the user has one; otherwise a diagram of the wendigo's states.
   - Commit: "Fill in the Nightfall project page".
9. **M9: Project page redesign.**
   - Load the `impeccable` skill.
   - Propose 2–3 directions as quick mock captures of a real project page; the user picks one.
   - Implement it in the template, components and CSS, then run tests and screenshots at desktop and 390 px.
   - Commit: "Redesign the project pages".
10. **Phase 5:** `summary.md`.

## Drafts for the user to edit
- **Tagline:** "Computer science student at the University of Michigan, building sports prediction models, games and generative art."
- **About:**
  > I'm a computer science student at the University of Michigan. I like building things that run on their own and can be checked: models that publish their picks before the game starts, and art that draws itself.
  >
  > As an analyst for Michigan Edge, the university's sports analytics club, I built three game predictors on my own: Fourth and Why for the NFL, Full Count for baseball and Tip-Off for the NBA. Each is tested on games it never trained on and runs as a live app that keeps its own data current.
  >
  > I also make games. Nightfall is a Godot horror game I built alone, about hunting a wendigo through a forest at night. With a small team, I've led programming and design on seven indie games, shipped as Windows releases.

## Risks
- The resume (with phone number) becomes public in the repo history; the user confirmed.
- The redesign touches the shared project template: every project page changes at once.

**Status (Part 2):** Approved on 2026-11-18 (drafts used as written; auto-commit and push on branch `finish-portfolio`)
