---
draft: false
title: Tip-Off
oneLine: Predicts NBA winners, margins and calibrated win probabilities.
role: "Solo project for Michigan Edge, the University of Michigan sports analytics club: data, features, model and calibration, the Streamlit app and the weekly data job."
stack: [Python, scikit-learn, Streamlit, Plotly, Docker]
year: 2026
order: 3
series: prediction
demo:
  url: https://machinelearningnba-p3cxa6nsk6hgcuclcwssdx.streamlit.app
  kind: live
  coldStartSeconds: 67
repo: https://github.com/arinb44/MachineLearningNBA
metric:
  value: 67.5%
  label: winner accuracy
  baseline: 55.2% for always picking the home team
  context: "full 2025–26 regular season, 1,225 games the model never trained on"
predella:
  image: ../../assets/projects/nba-predictor/predella.png
  alt: "Placeholder: NBA Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: >-
      The live app shows a daily slate from the NBA schedule: one card per game with the TV network, tip-off time, arena
      and the model's pick, written as a margin and a probability. You can step through game days or follow one team.
      Teams and Players pages chart power rankings, offense against defense, and each rotation player's profile.
    images:
      - src: ../../assets/projects/nba-predictor/varnish.jpg
        alt: >-
          Tip-Off's daily slate for Wednesday 18 November 2026: game cards for Grizzlies at Cavaliers (Cavaliers by 18.4,
          88%), Rockets at Pacers (Rockets by 18.0, 82%), Bucks at Heat and 76ers at Magic, each with logos, time and arena.
        caption: >-
          The live app's daily slate, captured on 18 November 2026. Until new-season results come in, it uses each team's
          form through April 2026.
  - name: paint
    status: finished
    text: >-
      Each prediction answers three questions: who wins, by how many points, and how sure the model is. On the full
      2025–26 regular season, scored only on games it never trained on, it picked 67.5% of winners against 55.2% for
      always picking the home team, and its margins were off by 11.91 points on average against 13.40 for a constant
      home-court edge. Any two teams can be compared, with an adjustment for players on the injury report.
    images:
      - src: ../../assets/projects/nba-predictor/paint-1.jpg
        alt: >-
          The Any matchup view for Warriors at Celtics: the matchup card reads Celtics by 25.0, 94%, above a probability
          bar (Golden State 6%, Boston 94%) and three figures: predicted margin 25.0 points, win probability 93.8% and
          injury adjustment +9.9 points.
        caption: Any two teams, with the predicted margin, the win probability and the injury adjustment.
  - name: underpainting
    status: finished
    text: >-
      Game results and player stats come from the NBA API; rosters, the schedule and injuries come from ESPN, refreshed
      every Monday by a GitHub Actions job that commits them. Every feature is computed only from games played before
      the one being predicted: season-to-date margin, last-10 form, home and road splits, rest days and back-to-backs.
      A random forest predicts the margin, and a logistic calibrator fit on held-out predictions turns it into a win
      probability. Training is walk-forward, the app calls the same prediction code as the command line, and Docker
      trains and predicts in one command.
    images:
      - src: ../../assets/projects/nba-predictor/underpainting.png
        alt: >-
          Diagram in four steps: the NBA API and ESPN, to point-in-time features, to a random forest for the margin and a
          logistic calibrator for the probability, to the Streamlit app. Below: a weekly GitHub Actions data refresh and
          tests on the feature code.
        caption: How the data, features, model and app fit together.
  - name: underdrawing
    status: finished
    text: >-
      It began as a folder of scripts and spreadsheets: data gathering, an injury tracker, a betting calculator and an
      accuracy tracker. The confidence it reported came from a hand-tuned formula. The first real change after moving it into
      git, on 31 August 2026, fixed data leakage: features became point-in-time, validation became walk-forward, and
      calibrated probabilities replaced the formula. The demo, logos and weekly data job came after.
    images:
      - src: ../../assets/projects/nba-predictor/underdrawing-1.png
        alt: >-
          The original accuracy tracker's dashboard: cumulative accuracy settling at 70.0% over about 230 tracked
          predictions, confidence against margin error, a histogram of margin errors, and accuracy by confidence range.
        caption: The original tracker's dashboard, from the scripts the project grew out of.
---
