---
draft: true
title: Full Count
oneLine: Calibrated MLB home-win probabilities, honest about the ~55–58% accuracy ceiling.
role: "Solo: data pipeline, features, four models, the API and web app, and deployment."
stack: [Python, scikit-learn, XGBoost, PyTorch, FastAPI, Docker]
year: 2026
order: 2
series: prediction
demo:
  url: https://mlb-game-predictor-sdt8.onrender.com
  kind: live
  coldStartSeconds: 60
repo: https://github.com/arinb44/MLB-predictive-model
metric:
  value: 57.8%
  label: winner accuracy
  context: "walk-forward backtest, 2018–2024, 15,372 games; about 55–58% is the realistic ceiling"
predella:
  image: ../../assets/projects/mlb-predictor/predella.png
  alt: "Placeholder: MLB Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: >-
      The live app predicts any matchup. Pick two teams and a date and it returns a calibrated home-win probability on a
      matchup card, with each team's recent form and Elo rating. Only team form, Elo and the starting-pitcher proxy drive
      the prediction; the Players and Teams tabs chart this season's stats for context.
    images:
      - src: ../../assets/projects/mlb-predictor/varnish.jpg
        alt: >-
          Full Count's matchup card: Boston Red Sox 42.7% at New York Yankees 57.3%, at Yankee Stadium, with each team's
          recent win percentage, runs scored over the last 10 games and Elo rating (1492 and 1532).
        caption: The live app's prediction for Red Sox at Yankees, captured on 18 November 2026.
  - name: paint
    status: finished
    text: >-
      It is judged on calibration first: a 60% pick should win about 60% of the time, so log loss and Brier score come
      before accuracy. In a walk-forward backtest, logistic regression reached 57.8% on 15,372 games from 2018 to 2024,
      PyTorch 57.2% and XGBoost 56.4%; Elo on its own reached 57.0%. All of them sit inside the 55–58% range a leak-free
      baseball model should reach, which is part of the point: much higher would mean the pipeline was leaking.
    images:
      - src: ../../assets/projects/mlb-predictor/paint-1.png
        alt: >-
          SHAP summary plot for the logistic regression: the home and away Elo ratings have the widest spread of impact,
          followed by run differential and runs scored over the last 10 and 30 games, bullpen fatigue and the park factor.
        caption: What the production model listens to. Both teams' Elo ratings matter most, then recent run differential.
  - name: underpainting
    status: finished
    text: >-
      Every feature is a trailing window built only from earlier games: form over 10 and 30 games, rest days, bullpen
      fatigue, a park factor and the starting pitcher's recent runs allowed, plus an Elo rating written from scratch.
      Splits are chronological and a test checks that no feature sees a later game. The logistic regression is served
      by a FastAPI app, packaged with Docker and hosted on Render, with versions pinned after an unpinned build broke the
      saved model in production.
    images:
      - src: ../../assets/projects/mlb-predictor/underpainting.png
        alt: >-
          Diagram in four steps: 2015–2024 games from pybaseball and Retrosheet, to leakage-safe rolling features and Elo,
          to a walk-forward test of Elo, logistic regression, XGBoost and PyTorch, to a FastAPI app on Docker and Render.
        caption: How the data, features, models and app fit together.
  - name: underdrawing
    status: finished
    text: >-
      The most useful early result was a failure. Giving the PyTorch model an 8-dimensional embedding for each of about
      480 starting pitchers, who average about 30 starts in a training fold, let it memorise individual pitchers: training
      loss fell to 0.61 while held-out log loss rose to 0.72, and accuracy dropped to 55.05%. Cutting the embedding to 4
      dimensions and training for 10 epochs instead of 30 brought held-out log loss back to 0.68 and lifted PyTorch to
      57.2%, past XGBoost. A bigger model is not automatically a better one.
    images:
      - src: ../../assets/projects/mlb-predictor/underdrawing-1.png
        alt: >-
          SHAP summary plot for the gradient-boosted model: Elo's home-win probability has by far the widest impact,
          followed by both starting pitchers' runs allowed in their last five starts and recent run differential.
        caption: From the first commit, the challenger's view. Gradient boosting leans on Elo and both starters' recent form.
---
