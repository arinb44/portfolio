---
draft: true
title: Full Count
oneLine: Calibrated MLB home-win probabilities, honest about the ~55–58% accuracy ceiling.
role: "TODO: your role (solo or team, and what you did)"
stack: [Python, PyTorch, XGBoost, LightGBM, pybaseball]
year: 2026
order: 2
series: prediction
demo:
  url: https://mlb-game-predictor-sdt8.onrender.com
  kind: live
  coldStartSeconds: 60
repo: https://github.com/arinb44/MLB-predictive-model
predella:
  image: ../../assets/projects/mlb-predictor/predella.png
  alt: "Placeholder: MLB Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: The finished app gives a calibrated home-win probability for each game.
    images:
      - src: ../../assets/projects/mlb-predictor/varnish.png
        alt: "Placeholder: MLB Predictor app screenshot"
        caption: The app.
  - name: paint
    status: finished
    text: >-
      Calibrated home-win probabilities, and an explanation of why about 55–58% accuracy is the honest
      ceiling for predicting single baseball games.
    images:
      - src: ../../assets/projects/mlb-predictor/paint-1.png
        alt: "Placeholder: calibration or accuracy chart"
        caption: "TODO: caption"
  - name: underpainting
    status: finished
    text: >-
      Elo written from scratch, then XGBoost and LightGBM, then PyTorch entity embeddings with a hand-written
      training loop. Leakage tests guard every feature.
    images:
      - src: ../../assets/projects/mlb-predictor/underpainting.png
        alt: "Placeholder: model progression diagram"
        caption: From Elo to entity embeddings.
  - name: underdrawing
    status: finished
    text: "TODO: the early experiments, and what they showed."
    images:
      - src: ../../assets/projects/mlb-predictor/underdrawing-1.png
        alt: "Placeholder: early experiment"
        caption: "TODO: caption"
---
