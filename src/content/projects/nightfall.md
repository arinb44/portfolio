---
draft: false
title: Nightfall
oneLine: "A Godot horror game: hunt a wendigo through a forest at night before it hunts you."
role: "Solo: all the GDScript and the level; the 3D models are free-to-use assets."
stack: [Godot, GDScript]
year: 2024
order: 4
demo:
  kind: video
repo: https://github.com/arinb44/Nightfall
video: /projects/nightfall/escape
predella:
  image: ../../assets/projects/nightfall/predella.png
  alt: "Placeholder: Nightfall predella scene"
layers:
  - name: varnish
    status: finished
    text: >-
      A 3D horror game made in Godot 4.2. You go into a forest at night with a flashlight to kill a wendigo, while it
      hunts you; the run ends when one of you dies, and the shack is the only safe place. I wrote all the code and built
      the level; the 3D models are free-to-use assets. The clip is a later render, made in Blender with the game's own
      models and sounds.
    images:
      - src: ../../assets/projects/nightfall/varnish.jpg
        alt: "A dark spruce forest at night. A flashlight beam lights a young tree, and the wendigo's red eyes glow in the trees to the right."
        caption: "Escape: a 25-second render made in Blender with the game's wendigo, forest and sounds. The sound is off until you unmute it."
  - name: paint
    status: finished
    text: >-
      The wendigo runs its own state machine. It chases you along a navigation mesh, attacks at close range for 25
      damage, staggers back on one hit in ten, and the first time its health runs low it screams, heals and comes back
      faster. Around it, a day–night cycle turns, campfires burn, deer wander on their own paths and a howl sometimes
      carries through the trees.
    images:
      - src: ../../assets/projects/nightfall/paint-1.jpg
        alt: "A dark forest corridor at night. The wendigo's hunched, antlered silhouette stands between the trees, its two red eyes glowing."
        caption: The wendigo, in a frame from the Blender render made with the game's model.
  - name: underpainting
    status: finished
    text: >-
      Each piece is its own Godot scene with a short GDScript: the forest (terrain built with the Terrain3D and Proton
      Scatter add-ons, the day–night cycle, campfires and random howls), the player's tools (an equippable flashlight and
      a book to read), the deer and the wendigo. Hit zones on the wendigo's body pass damage to it. The world script
      watches both sides: when the wendigo dies it plays the ending, and when the player dies it loads the death screen.
    images:
      - src: ../../assets/projects/nightfall/underpainting.png
        alt: >-
          Diagram in four steps: the forest (Terrain3D, day–night cycle, campfires, howls), your tools (flashlight, book,
          the shack as a safe place), the wendigo's state machine, and the two endings. Below: wandering deer, and Godot 4.2
          scenes with short GDScripts.
        caption: How the game's scenes and scripts fit together.
  - name: underdrawing
    status: finished
    text: >-
      Nightfall is the earliest project here, uploaded to GitHub on 25 August 2024. The models are left out of the public
      repository so the game can't be copied whole, but its scripts are public, and the longest of them is the
      wendigo's: about 140 lines that turn a model into something that hunts.
    images:
      - src: ../../assets/projects/nightfall/underdrawing-1.png
        alt: >-
          Diagram of the wendigo's states: chase (speed 6, gives up while you are in the shack, attacks within 7 units),
          attack (25 damage after a one-second wind-up), stun (one hit in ten) and second wind (at 60 health it screams,
          heals to 600 and speeds up to 8). It starts with 500 health and dies at zero.
        caption: The wendigo's states, from wendigo_col_1.gd (2024).
---
