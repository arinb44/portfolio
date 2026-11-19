---
version: 1
slug: "src-pages-projects-slug-astro"
primary_target: "src/pages/projects/[slug].astro"
related_targets: ["src/pages/projects/index.astro","src/components/ProjectLayers.astro"]
---

# Surface brief: project pages

Scope: `src/pages/projects/[slug].astro` (five project pages) and `src/pages/projects/index.astro`. Visitor mode: Experience. Audience: internship recruiters skimming between applications, plus peers and professors. Job: judge what each project is, how well it works, and reach the demo, the code or Arin, within a minute. Constraints: the home page world stays (Night Sky tokens; Gloock, Newsreader, IBM Plex Mono); content is final; WCAG 2.2 AA, 320 px, reduced motion, keyboard order; the h1 never breaks mid-word. The user asked to avoid: templated, breaking from home, slow to skim.

## Direction contract
THESIS: The work never leaves the screen. One large plate holds still while the reader moves through the project, and it swaps from demo to chart to diagram to origin as each section passes. It refuses the case-study template (hero, then stacked text and image blocks).
OWN-WORLD: The home page's ink ground (#1F1D1A), gesso text, gold for the metric and the active state, stone hairlines. Gloock titles at display scale, Newsreader prose, IBM Plex Mono for labels, captions and the section index. Plates are framed by a single hairline on a darker field; no cards, no shadows, no gradients.
STORY: Within the first screen, the visitor sees the work, the name, what it does, the result with its baseline, the role and both links. Scrolling reads Key features, Architecture and Origins while the plate changes to match, so text and evidence are always side by side.
FIRST VIEWPORT: Desktop: a 60/40 split under the site header. Left: the hero plate (image or video) filling the column height, with its caption and an "n / 4" counter in mono below. Right: a column with the "01 / 05 · Featured · 2026" kicker, the title in Gloock at about 6rem, the one-liner, the metric (gold numeral, baseline beneath) between hairlines, the role and stack as a small definition list, then Live demo (filled pill) and Code. At the column foot, a four-step index (Finished work, Key features, Architecture, Origins) with the active step in gold. Below 64rem it stacks: each plate sits above its own text.
FORM: Sticky plate pairing, position 4 on the ordered list of seven. seed:41eeb282663a1c5f
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction
As each section's text crosses the middle of the viewport, the sticky plate cross-fades (about 250 ms) to that section's image and the index step lights. Under reduced motion the swap is instant. Without JavaScript, each section shows its own image inline.

## Unresolved
- Projects index: carry the folio pairing as a list where each row pairs a small plate with its facts.
