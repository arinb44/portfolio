---
draft: true
title: NFL Game Predictor
oneLine: Predicts each NFL team's win probability and explains which factors drove each pick.
role: "TODO: your role (solo or team, and what you did)"
stack: [Python, pandas, scikit-learn, Streamlit]
year: 2026
order: 1
featured: true
series: prediction
demo:
  url: https://arinb44.github.io/NFLGamePredictorModel/
  kind: live
  coldStartSeconds: 30
repo: https://github.com/arinb44/NFLGamePredictorModel
predella:
  image: ../../assets/projects/nfl-predictor/predella.png
  alt: "Placeholder: NFL Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: The finished dashboard shows every game of the week with a win probability for each team.
    images:
      - src: ../../assets/projects/nfl-predictor/varnish.png
        alt: "Placeholder: NFL Predictor dashboard screenshot"
        caption: The live dashboard, updated three times a week.
  - name: paint
    status: finished
    text: Each pick comes with the factors that drove it, so a reader can see why the model leans one way.
    images:
      - src: ../../assets/projects/nfl-predictor/paint-1.png
        alt: "Placeholder: one pick broken down into its factors"
        caption: Per-pick factor explanations.
  - name: underpainting
    status: finished
    text: >-
      Separate feature modules for weather, travel and matchups, built from nflverse and Open-Meteo data.
      Every feature is leak-free and the model is validated walk-forward. Vegas lines are a benchmark only, never an input.
    images:
      - src: ../../assets/projects/nfl-predictor/underpainting.png
        alt: "Placeholder: diagram of the feature modules and data sources"
        caption: Feature modules and data sources.
  - name: underdrawing
    status: finished
    text: "TODO: the first notebook or sketch, and what it tried."
    images:
      - src: ../../assets/projects/nfl-predictor/underdrawing-1.png
        alt: "Placeholder: first notebook or sketch"
        caption: "TODO: caption"
---
