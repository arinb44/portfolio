# Portfolio: The Creation

A static Astro site. The home page rebuilds God's group from Michelangelo's *The Creation of Adam* out of particles as the cursor reaches for the centre of the screen. The design spec is `output/creation-redesign/design-spec.md`.

## Commands

| Command | Does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server |
| `npm run build` | Build the static site into `dist/` (fails on invalid project content) |
| `npm run preview` | Serve the built site |
| `npm run placeholders` | Create labelled placeholder images for any project image that doesn't exist yet (never overwrites) |
| `npm test` | Type check, build, unit tests, browser tests |
| `npm run test:unit` | Unit tests only (Node's built-in runner) |
| `npm run test:e2e` | Browser tests only (Playwright + axe, against the last build) |

The browser tests run Chromium on the real GPU (`playwright.config.ts` passes `--use-angle=d3d11`, a Windows flag), because the home scene draws about 690,000 particles and software rendering is too slow for it. On another system, change or remove that flag.

## Where things are

| Path | What |
|---|---|
| `src/pages/index.astro` | Home page: name, nav, the scene's canvas and the 7 project stops |
| `src/scripts/creation.js` | The WebGL2 scene (particles, painting layer, camera, spark), copied from the design prototype |
| `src/scripts/home.js` | Home page behaviour: the ring, the reveal, the skip links, the spark on each project |
| `src/styles/creation.css` | Home page layout |
| `public/creation/` | The painting (`whole-group-aa.webp`) and its crop data (`particles.json`) |
| `src/styles/tokens.css` | Fonts, colours and type tokens for every page |
| `src/styles/global.css` | Styles for every page except the home page |
| `src/layouts/Base.astro`, `src/components/` | Shared layout, header, footer and project page parts |

The home page needs a mouse or trackpad: phones and tablets see a short notice instead. Without WebGL2 or JavaScript it shows the still painting with all 7 projects, and with reduced motion it shows the finished painting at once.

## Your details

Your name, tagline, email, GitHub link and CV path live in `src/site.ts`. The About text is in `src/pages/about.astro`, and the CV is `public/cv.pdf`. All three are placeholders until you replace them.

## Adding or editing a project

Each project is one Markdown file in `src/content/projects/`; the file name is the URL slug.

- **Fields:** the schema is in `src/content.config.ts`. The build fails if a field is missing or wrong, if an alt text is empty, or if the four layers aren't `varnish`, `paint`, `underpainting` and `underdrawing`, in that order. Those names come from the first design; on the page they appear as the hero, "Key features and results", "Architecture" and "Origins". The `predella` image is still required by the schema but is no longer shown.
- **Images:** put them in `src/assets/projects/<slug>/`. If you swap a placeholder for real art, rewrite its `alt` too.
- **Order:** `order` sets the order on the home page (after the featured project), in the projects table and for prev/next.
- **Featured:** exactly one project has `featured: true`; it is the first project on the home page.
- **Draft:** `draft: true` means the facts still need checking; search for `TODO` to find the gaps.

## Credits

The painting is the public-domain photograph *Michelangelo - Creation of Adam (cropped)* from Wikimedia Commons. The typefaces are Gloock, Newsreader and IBM Plex Mono, under the SIL Open Font License.
