# Altarpiece Portfolio

A static Astro site. The design spec is `output/renaissance-portfolio-concepts/hybrid-spec.md`.

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

## Adding or editing a project

Each project is one Markdown file in `src/content/projects/`; the file name is the URL slug.

- **Fields:** the schema is in `src/content.config.ts`. The build fails if a field is missing or wrong, if an alt text is empty, or if the four layers aren't varnish, paint, underpainting and underdrawing, in that order.
- **Images:** put them in `src/assets/projects/<slug>/`. If you swap a placeholder for real art, rewrite its `alt` too, following spec 8.3.
- **Order:** `order` sets the predella and prev/next order.
- **Featured:** exactly one project has `featured: true`.
- **Draft:** `draft: true` means the facts still need checking; search for `TODO` to find the gaps.
