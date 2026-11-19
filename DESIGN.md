---
name: Arin Barman, Portfolio
description: Shipped engineering shown as framed plates on a night-sky ink ground, in Gloock, Newsreader and IBM Plex Mono.
colors:
  ink: "#1F1D1A"
  gesso: "#EEE9DF"
  stone-200: "#CFC8BA"
  stone-700: "#4A4740"
  plate-well: "#161513"
  gold: "#C8A24A"
  ochre: "#C29545"
typography:
  display:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "clamp(2rem, calc(100cqi / (var(--fit) * 0.5)), 6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.05
  headline-section:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "clamp(2rem, 3.2vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.2
  title-nav:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.3
  numeral:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 0.85
  lede:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.25rem"
    lineHeight: 1.5
  body:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "0.08em"
rounded:
  focus: "2px"
  pill: "999px"
spacing:
  2xs: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "5rem"
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  leaf-gap: "clamp(2rem, 4vw, 4.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.gesso}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  link-action:
    textColor: "{colors.gesso}"
    typography: "{typography.label}"
    height: "24px"
  nav-link:
    textColor: "{colors.stone-200}"
    typography: "{typography.label}"
    padding: "0.25rem 0"
  nav-link-current:
    textColor: "{colors.gesso}"
  index-step:
    textColor: "{colors.stone-200}"
    typography: "{typography.caption}"
    padding: "0.6rem 0 0"
  index-step-current:
    textColor: "{colors.gesso}"
  plate-field:
    backgroundColor: "{colors.plate-well}"
    padding: "clamp(0.5rem, 1vw, 1rem)"
  result-numeral:
    textColor: "{colors.gold}"
    typography: "{typography.numeral}"
  project-nav-link:
    textColor: "{colors.gesso}"
    typography: "{typography.title-nav}"
  project-nav-link-hover:
    textColor: "{colors.gold}"
---

# Design System: Arin Barman, Portfolio

## Overview

**Creative North Star: "The Night Folio"**

A dark gallery at night. The ground is warm ink, the text is gesso, and the work itself (screenshots, charts, diagrams, renders, painted loops) is the only bright thing in the room. The home page shows each project's image full-bleed behind its text; every other page sets the work as a plate, framed by a single stone hairline on a slightly darker well, and pairs it with a text rail. Gold is spent only where the eye should land: a result numeral, the current step, a hover.

The pages are calm and fairly dense: one serif display face at large sizes for names and titles, a reading serif for prose, and a monospace for everything that is metadata (navigation, captions, facts, actions, counters). Structure comes from hairline rules and grid alignment rather than containers. Nothing floats on a shadow and nothing is boxed into a card on the reading pages.

On the project pages the work never leaves the screen: on wide screens with JavaScript one sticky plate stage holds while the text rails pass, cross-fading to the plate whose text crosses the middle of the viewport, and a pinned segmented index follows the reader in gold. Below 64rem, or without JavaScript, each plate sits with its own text.

**Key Characteristics:**
- Warm ink ground, gesso text, one gold accent used sparingly.
- Gloock for display, Newsreader for prose, IBM Plex Mono for every label.
- Work framed as plates: hairline border on a darker well, image fitted at its own aspect ratio.
- Hairline rules for structure; no shadows, no cards on reading pages.
- Motion is a single 260 ms ease-out cross-fade, removed under reduced motion.

## Colors

A near-monochrome warm-dark palette (pigment names from the fresco world) with one metallic accent.

### Primary
- **Leaf Gold** (gold): the accent. Result numerals, the current step of the on-page index, hover on the primary pill and on display-type links, text selection background. Never body text, never a fill larger than a pill.

### Secondary
- **Ochre Focus** (ochre): the 2px keyboard focus outline everywhere, and the text caret is gold. Ochre has no other job.

### Neutral
- **Night Ink** (ink): the page ground on every page, and the text colour on the gesso pill.
- **Gesso** (gesso): primary text, the primary pill's fill, the skip link's fill.
- **Pale Stone** (stone-200): muted text: navigation at rest, captions, metadata, the result's context sentence, notes, fact labels.
- **Dark Stone** (stone-700): hairlines only (plate borders, section rules, the index's resting segments, footer rule, scrollbar). Never text.
- **Plate Well** (plate-well): the darker field inside a plate's hairline frame, on project pages and the projects index.

### Named Rules
**The Spent Gold Rule.** Gold marks a result, the current place, or a hover, and nothing else. If a screen has more than a few gold marks at rest, one of them is wrong.

**The Hairline-Only Stone Rule.** Dark Stone draws lines; it is never used for text or fills.

## Typography

**Display Font:** Gloock (with Georgia, serif)
**Body Font:** Newsreader, variable optical size (with Georgia, serif)
**Label/Mono Font:** IBM Plex Mono 400 (with ui-monospace, monospace)

**Character:** A high-contrast single-weight display serif over a soft reading serif, with a plain mono carrying all metadata so labels never compete with names. All three are self-hosted Latin subsets with `font-display: swap`.

### Hierarchy
- **Display** (400, fitted up to 6rem, line-height 1, -0.01em): the project title. Sized from the longest word's character count against the rail's container width so it fills the column and never breaks inside a word (words are `nowrap`); capped at 3.75rem below 64rem.
- **Headline** (400, clamp(2.5rem, 6vw, 3.75rem), 1.05, balanced): page h1 (Projects, About) and the home page's project names.
- **Headline Section** (400, clamp(2rem, 3.2vw, 3rem), 1.1): section headings in project-page rails.
- **Title** (400, clamp(1.5rem, 3vw, 2rem), 1.2): default h2; index rows use clamp(1.75rem, 3vw, 2.5rem).
- **Title Nav** (400, 1.375rem, 1.3): previous/next project links. The site name uses Gloock 1.5rem (2rem on the home page).
- **Numeral** (Gloock 400, 3.5rem, 0.85, gold): the result's drop-numeral, floated at the start of the result sentence; 1.75rem inline on the projects index.
- **Lede** (Newsreader, 1.25rem, 1.5): the one-line description under the project title.
- **Body** (Newsreader, 1.0625rem, 1.6, pretty-wrapped): prose; rails run at 1.125rem with a 34em measure, `.prose` pages at 40rem.
- **Label** (Plex Mono, 0.875rem / 0.9375rem for actions): navigation, metadata lines, actions.
- **Caption** (Plex Mono, 0.8125rem, muted): figure captions, plate counters, footer, on-page index.
- **Label Caps** (Plex Mono, 0.75rem, 0.08em, uppercase): definition-list terms in the facts block only.

### Named Rules
**The Mono-Means-Metadata Rule.** Anything that is not a name or prose (nav, captions, facts, counters, actions) is set in IBM Plex Mono. Names and titles are Gloock; sentences are Newsreader.

**The Unbroken Title Rule.** A display title never breaks inside a word; size it down from the longest word rather than hyphenate or wrap mid-word.

**The Sentence Result Rule.** A metric is written as a sentence with its baseline, led by a gold Gloock numeral; the context follows in muted text. Never a bare number.

## Layout

Reading pages sit in a centred `main` of 72rem (project pages widen to 100rem) with a fluid gutter of clamp(1.25rem, 4vw, 2.5rem) and padding of 2.5rem top, 5rem bottom. The header and footer are in the flow, not fixed; the footer is ruled by a hairline above.

**Project pages (the paired folio).** Each leaf is a two-column grid, 3fr plate (left) and 2fr rail (right), with a column gap of clamp(2rem, 4vw, 4.5rem); leaves are separated by clamp(3rem, 9vh, 6rem). In the DOM the rail comes first so reading and keyboard order start with text. A plate frame takes the work's own aspect ratio and is capped at 100svh minus 9rem.

- **Wide (64rem and up, with JS):** the folio becomes one grid; every plate stacks in column 1 across all rows, sticky at 4.75rem, and only the active plate is visible. The four-step index is sticky at 1.25rem above it. Rails are at least 80svh tall and vertically centred, so one section's text owns the middle of the viewport at a time; an IntersectionObserver with a -50% root margin picks the active leaf.
- **Below 64rem or without JS:** one column; each plate sits above its own text (row-gap 1.25rem, leaves 3.5rem apart), the index wraps to two columns.
- **Projects index:** 64rem list of rows, 2fr plate thumbnail and 3fr text, ruled top and bottom by hairlines; one column below 48rem.

**Home page:** full-viewport snap stops, the card at the left (min(30vw, 30rem), 5vw inset) over the full-bleed image; at 900px wide or 560px tall and below it becomes a plain stacked reading layout without snapping.

Spacing is rem-based and loosely doubling (0.25, 0.5, 0.75, 1, 1.5, 2.5, 5rem), with fluid clamps for gutters and gaps. Everything must work down to 320px without horizontal scroll (except the home page, which is computer-only).

## Elevation & Depth

Flat. There are no box-shadows anywhere in the system. Depth comes from tone: the plate well (plate-well) sits one step darker than the ink ground inside a hairline, and on the home page the painting sits behind the text under ink scrims. Layering on the project pages is positional (sticky plate and index), never lifted.

### Named Rules
**The No-Lift Rule.** Nothing casts a shadow. Separate with a hairline or a tonal well, not elevation.

**The Scrim-Not-Gradient Rule.** Gradients exist only as legibility scrims of ink over full-bleed imagery (the home page's left and top scrims, the home header's fade). Never as decoration on a surface.

## Shapes

Square by default: plates, wells, rules and rows have no radius. Rounding is reserved for two things: interactive pills (999px: the primary button, skip link, skip-intro and pause controls) and the 2px radius on focus outlines. The one exception is the home page's reading-layout card backing at small or zoomed viewports (12px), which exists only to keep text legible over the painting. Lines are 1px Dark Stone; the only 2px line is the on-page index segment.

Arrows are drawn, not typed: one 16px SVG stroke arrow (1.5px, round caps) at 0.75em, in three directions (out, left, right), inheriting the text colour.

## Components

### Buttons
Restrained and singular: one filled action per group, the rest are text links.
- **Shape:** full pill (999px).
- **Primary:** gesso fill, ink text, Plex Mono 0.9375rem, padding 0.6rem 1.1rem, no underline, followed by the drawn out-arrow. Used for Live demo (project pages) and View project (home).
- **Hover / Focus:** fill turns gold; focus is the global 2px ochre outline offset 3px.
- **Secondary:** plain underlined mono links (underline offset 0.2em), min-height 24px, gap 0.75rem 1.5rem in an actions row.

### Navigation
- **Site header:** Gloock site name left, mono nav right (gap 1.75rem), muted at rest, gesso on hover and for the current page (`aria-current`). Wraps on narrow screens. Same name and links as the home page header, which is fixed over a top scrim there.
- **Previous / next project:** Gloock 1.375rem links, spaced apart under a hairline, 5rem above; gold on hover; drawn left and right arrows.
- **Footer:** mono caption size, muted, under a hairline.

### Plate (signature)
- **Frame:** 1px Dark Stone border around a Plate Well field; the image or video is inset by clamp(0.5rem, 1vw, 1rem) and fitted with `object-fit: contain` at the frame's aspect ratio (taken from the image), so the work is never cropped.
- **Caption:** mono, muted, caption left and an "n / 4" counter right (counter hidden from assistive tech).
- **Video:** muted, looping, with controls, captions track and a poster; plays automatically only when not under reduced motion and only while it is the active plate.

### Plate Stage and On-Page Index (signature interaction)
- **Stage:** on wide screens with JS the plates share one sticky stage; switching between them is an opacity cross-fade of 260ms on cubic-bezier(0.16, 1, 0.3, 1), with visibility hidden after the fade so inactive plates leave the accessibility and tab order. Instant under reduced motion.
- **Index:** four equal segments (Finished work, Key features, Architecture, Origins), each a mono caption under a 2px hairline segment, muted. The current step gets a gold segment and gesso text (`aria-current="location"`); hover is gesso text. Colour transitions use the same 260ms curve, only when motion is allowed.

### Facts and Result
- **Result:** a sentence led by a floated gold Gloock numeral (3.5rem), then the label and baseline in body text, then the context in muted text.
- **Facts:** a definition list between two hairlines (padding 1rem), terms in uppercase tracked mono (Label Caps) in a 4.5rem column, values in body text.

### Index Row
- **Style:** a row ruled by hairlines; a small plate (0.5rem inset, Plate Well, hairline, 16:10 contain) beside the title (Gloock link, gold on hover), one-liner, gold inline numeral result, muted mono metadata and actions.

### Home Card
- **Style:** text set directly over the painting, protected by ink scrims; Gloock name, Newsreader line, muted mono metadata, primary pill plus text links. At narrow or zoomed viewports it gains a 92% ink backing with a 12px radius. The pause control is an ink pill with a hairline border and a drawn bars/play glyph.

## Do's and Don'ts

### Do:
- **Do** set every page on Night Ink with Gesso text, and keep Gold to results, the current state and hover.
- **Do** frame work as a plate: 1px Dark Stone hairline, Plate Well field, the image contained at its own aspect ratio.
- **Do** put names in Gloock, sentences in Newsreader and all metadata in IBM Plex Mono.
- **Do** write a metric as a sentence with its baseline, led by a gold Gloock numeral.
- **Do** use the drawn SVG arrow for link marks (out, left, right).
- **Do** keep motion to the 260ms cubic-bezier(0.16, 1, 0.3, 1) fade and remove it under `prefers-reduced-motion: reduce`.
- **Do** keep text first in DOM order and let plates move visually above or beside it.
- **Do** use the 2px ochre outline, offset 3px, for every focus state.

### Don't:
- **Don't** add box-shadows, raised cards or decorative gradients; separate with hairlines and tonal wells.
- **Don't** use Dark Stone for text, or Gold for body text or large fills.
- **Don't** let a display title break inside a word.
- **Don't** put a label line (kicker or eyebrow) above a title; the title leads.
- **Don't** crop the work to fit a frame; change the frame's ratio instead.
- **Don't** round anything except pills (999px) and focus outlines (2px).
- **Don't** autoplay video under reduced motion.
