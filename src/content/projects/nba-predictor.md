---
draft: true
title: NBA Game Predictor
oneLine: Predicts NBA winners, margins and calibrated win probabilities.
role: "TODO: your role (solo or team, and what you did)"
stack: [Python, scikit-learn, Docker, Streamlit]
year: 2026
order: 2
series: prediction
demo:
  url: https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app
  kind: live
  coldStartSeconds: 67
repo: https://github.com/arinb44/MachineLearningNBA
metric:
  value: 67.5%
  label: winner accuracy
  baseline: 55.2% home-team baseline
  context: 2025–26 season, 1,225 games
predella:
  image: ../../assets/projects/nba-predictor/predella.png
  alt: "Placeholder: NBA Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: The finished dashboard gives tonight's games, each with a calibrated win probability for both teams.
    images:
      - src: ../../assets/projects/nba-predictor/varnish.png
        alt: "Placeholder: NBA Predictor dashboard screenshot"
        caption: The Streamlit dashboard.
  - name: paint
    status: finished
    text: >-
      67.5% winner accuracy against a 55.2% home-team baseline, and a mean absolute margin error of
      11.91 points against 13.40, on 1,225 games from the 2025–26 season. Win probabilities are calibrated.
    images:
      - src: ../../assets/projects/nba-predictor/paint-1.png
        alt: "Placeholder: calibration chart"
        caption: Calibration on the 2025–26 season.
  - name: underpainting
    status: finished
    text: >-
      Fetch, then point-in-time features, walk-forward training, calibration and the app.
      CI and Docker keep every run reproducible.
    images:
      - src: ../../assets/projects/nba-predictor/underpainting.png
        alt: "Placeholder: pipeline diagram"
        caption: From raw data to the app.
  - name: underdrawing
    status: finished
    text: "TODO: the first commit or notebook, and what it tried."
    images:
      - src: ../../assets/projects/nba-predictor/underdrawing-1.png
        alt: "Placeholder: first commit or notebook"
        caption: "TODO: caption"
---
