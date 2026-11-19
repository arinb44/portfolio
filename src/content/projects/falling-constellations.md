---
draft: false
title: Falling Constellations
oneLine: Antique star-atlas constellations fall over a slowly turning spiral galaxy.
role: "Solo: the constellation generator, the WebGL2 galaxy and sky, the Canvas 2D atlas layer and the tests."
stack: [JavaScript, Canvas 2D, WebGL2, Bun]
year: 2026
order: 5
demo:
  url: https://arinb44.github.io/Falling-Constellations/
  kind: live
repo: https://github.com/arinb44/Falling-Constellations
predella:
  image: ../../assets/projects/falling-constellations/predella.png
  alt: "Placeholder: Falling Constellations predella scene"
layers:
  - name: varnish
    status: finished
    text: >-
      A generative art piece that runs live in the browser. Randomly generated constellations, drawn in the style of an
      antique star atlas, drift down the screen forever over a slowly turning spiral galaxy; click anywhere to summon
      another. It is plain JavaScript modules with no dependencies and no build step.
    images:
      - src: ../../assets/projects/falling-constellations/varnish.jpg
        alt: >-
          A spiral galaxy with a warm core and blue-white arms on a deep blue sky with faint nebulae, thin gold-lined
          constellations scattered across it and a faint coordinate grid curving behind.
        caption: The live piece, captured on 18 November 2026. The constellations are different on every visit.
  - name: paint
    status: finished
    text: >-
      The galaxy is layered like a real one: a warm core of old stars, blue-white arms, dark dust lanes along the arms
      and pink star-forming knots that slide along them, fade and are reborn. Behind it, nebulae form and dissolve while
      distant galaxies and star clusters drift. In front, each constellation draws in stars first, then the lines
      between them, in one ink colour with graded star sizes, and shooting stars cross as blue streaks with a lingering
      trail.
    images:
      - src: ../../assets/projects/falling-constellations/paint-1.jpg
        alt: >-
          Close-up of the galaxy's core and arms: thousands of cream and blue-white points, dark dust lanes curving along
          the arms, small pink knots at the edges, and gold constellation lines with bright star points in the corners.
        caption: Close up, the dust lanes, star-forming knots and Atlas-style constellations over the galaxy.
  - name: underpainting
    status: finished
    text: >-
      Two stacked canvases. At the back, raw WebGL2 draws the far field and the galaxy: 60,000 stars on slightly tilted
      elliptical orbits, moved in the shader, so the spiral arms hold their shape instead of winding up. The scene renders
      brighter than white, then a bloom chain and an ACES tone map bring it back to the screen. At the front, Canvas 2D
      draws the constellations, the coordinate grid and the shooting stars, where fine lines are cheap. A seven-step
      quality ladder trades resolution, star count and bloom for frame rate; the page recovers from a lost WebGL context
      and falls back to Canvas 2D without WebGL2; Bun unit tests cover the pure logic.
    images:
      - src: ../../assets/projects/falling-constellations/underpainting.png
        alt: >-
          Diagram in four parts: the far field and the galaxy on a WebGL2 back canvas, a light pass of HDR, bloom and an
          ACES tone map, and an Atlas layer of constellations, grid and shooting stars on a Canvas 2D front canvas. Below:
          the adaptive quality ladder and the fallbacks.
        caption: The two canvases and what each one draws.
  - name: underdrawing
    status: finished
    text: >-
      It began as a Canvas 2D prototype. Its galaxy spun inner stars faster than outer ones along a fixed spiral, which
      looks right for a minute but winds the arms up: the centre gains a full turn on the edge about every 65 seconds,
      and the arms smear out within minutes. Reading up on how real galaxies keep their shape led to the rebuild:
      nested, slightly tilted ellipses, then HDR and bloom, then dust, gas and star-forming knots. The rebuild happened
      in one day, 31 October 2026, across 13 commits.
    images:
      - src: ../../assets/projects/falling-constellations/underdrawing-1.jpg
        alt: >-
          The prototype: a faint, sparse spiral of small dots around a bright S-shaped core on a near-black sky, with
          glowing blue and pink constellations labelled with invented names such as Soliogon and Miraelis.
        caption: The prototype on the morning of 31 October 2026 (commit 528f5d5), before the galaxy was rebuilt.
---
