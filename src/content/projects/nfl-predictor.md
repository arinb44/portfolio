---
draft: false
title: Fourth and Why
oneLine: Predicts each NFL team's win probability and explains which factors drove each pick.
role: "Solo project for Michigan Edge, the University of Michigan sports analytics club: data pipeline, features, model, dashboard and the weekly automation."
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
metric:
  value: 65.5%
  label: winner accuracy
  baseline: 53.7% for always picking the home team
  context: "held-out 2019–2025 seasons, 1,954 games; Vegas favourites: 66.4%"
predella:
  image: ../../assets/projects/nfl-predictor/predella.png
  alt: "Placeholder: NFL Predictor predella scene"
layers:
  - name: varnish
    status: finished
    text: >-
      The live dashboard shows each week's games with both teams' win probabilities, the Vegas line for comparison,
      a predicted spread and the top reasons behind each pick. It runs Streamlit in the browser on GitHub Pages
      and updates itself three times a week.
    images:
      - src: ../../assets/projects/nfl-predictor/varnish.png
        alt: >-
          The NFL dashboard's This Week view for week 11 of 2026: game cards for Colts at Texans (25% to 75%) and
          Cardinals at Chiefs (12% to 88%), each with a win-probability bar, the Vegas line and the predicted spread.
        caption: The live dashboard's This Week view, captured on 18 November 2026.
  - name: paint
    status: finished
    text: >-
      Every pick breaks down exactly. The model adds up weighted home-minus-away differences, so a waterfall can start
      at 50% for two evenly matched teams on neutral ground and add one factor at a time until it reaches the model's
      probability. Related features are grouped (quarterback, defense, home field, fatigue) and the steps sum exactly,
      which a test checks. A what-if option shows how much a backup quarterback would change a game.
    images:
      - src: ../../assets/projects/nfl-predictor/paint-1.png
        alt: >-
          Waterfall chart for Colts at Texans, from 50% to 75.4% for Houston: home field +7.0, scoring and record +5.8,
          defense +5.1, recent form +2.9, Elo +2.2, quarterback +1.8, divisional game -1.2, then smaller factors.
        caption: The full breakdown for Colts at Texans, week 11 of 2026.
  - name: underpainting
    status: finished
    text: >-
      Each game is one row from the home team's side, and every feature is a home-minus-away difference built only from
      information available before kickoff; a test proves no feature sees the game it predicts. Models are judged
      walk-forward: train through one season, test on the next. Logistic regression beat random forest and gradient
      boosting on log loss and is the easiest to explain, so it is the final model. Vegas lines are a benchmark only,
      never an input. A scheduled job refreshes the data on Thursday, Sunday and Monday and commits each prediction
      before kickoff, so the record is timestamped.
    images:
      - src: ../../assets/projects/nfl-predictor/underpainting.png
        alt: >-
          Diagram in four steps: public data (nflverse play-by-play, schedules, rosters and injury reports since 2006;
          Open-Meteo weather) to home-minus-away features, to a walk-forward logistic regression, to picks with reasons
          on a Streamlit dashboard. Below: a scheduled job runs it three times a week, and a leakage test checks it.
        caption: How the data, features, model and dashboard fit together.
  - name: underdrawing
    status: finished
    text: >-
      It started on 21 September 2026 with a data loader and an exploration notebook. The notebook's first chart asked
      the simplest question: how often does the home team win? In most seasons since 2006 the answer was between 53%
      and 60%, and lower since 2019. The next commits added team stats, Elo and leakage tests, then the logistic
      regression, and then the dashboard and its factor explanations.
    images:
      - src: ../../assets/projects/nfl-predictor/underdrawing-1.png
        alt: >-
          Line chart of the home team's regular-season win rate by season, 2006 to 2026: mostly between 0.53 and 0.60,
          down to about 0.50 in 2020 and between 0.50 and 0.56 since.
        caption: The first chart in the first notebook, from September 2026 (the 2026 point covers its first games).
---
