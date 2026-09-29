# AGENTS.md

TV Program Success Predictor — academic ML project (Phases 1–3 done, Phase 4 Streamlit app not started).
Python 3.10+ / pandas / scikit-learn / Streamlit. `requirements.txt` pins nothing (bare names). No tests, no lint, no CI.

## Required structure vs. reality — trust the filesystem

Project structure target: `dataset/tv_shows.csv`, `notebooks/01_data_cleaning|02_eda|03_regression|04_classification.ipynb`, `src/{preprocessing,regression,classification,prediction}.py`, `models/random_forest.pkl`, `app/app.py`, `results/`, `requirements.txt`.

**Present (Members 1–2 done):** `dataset/tv_shows.csv` (canonical; identical copy kept at `cleaned_tv_shows.csv`), `notebooks/01_data_cleaning.ipynb`, `02_eda.ipynb`, `03_regression.ipynb`, `src/preprocessing.py`, `src/regression.py`, `results/model_comparison.csv`, `results/graphs/`, `models/random_forest.pkl`, `requirements.txt`.
**Absent (Member 3, not built):** `app/`, `src/classification.py`, `src/prediction.py`, `notebooks/04_classification.ipynb` — plus legacy `src/train_classification.py` which still exists and reads `cleaned_tv_shows.csv`.
**Never existed / ignore:** `dataset/tv_shows_raw.csv` (gitignored), `src/__init__.py`, `src/utils.py`. README doc links point to root but docs live in `docs/`.

## Commands

Run everything **from the repo root** — all paths in `src/` are relative (`dataset/cleaned_tv_shows.csv`, `models/`).

```bash
python -m src.regression            # trains LR/KNN/DT/RF, writes results/ + models/*.pkl
python -m src.train_classification  # legacy Member 3 script (do not extend yet)
```

- Run notebooks in order 01 → 02 → 03 from the repo root (verify with `nbclient`, installed).
- `python -m src.preprocessing` is a **no-op**: the module has no `__main__` block; it is imported by notebook 01 instead.
- There is no test suite, formatter, or typechecker to run.
- Installed env (Python 3.13.5): pandas, scikit-learn, joblib, streamlit, seaborn, matplotlib, nbclient OK. **`plotly` is NOT installed.**

## Data & models

- `dataset/cleaned_tv_shows.csv` (3,000 rows) is committed and is the **only** data source. Nothing regenerates it: the EDA notebook reads `tv_shows_raw.csv` (relative to notebook cwd) and has **no `to_csv` export cell**, and `src/preprocessing.py` is never invoked by the train scripts (they read the cleaned CSV directly).
- Saved `.pkl` artifacts are full sklearn `Pipeline`s (preprocessor + model), committed to git and overwritten in place by the train scripts.
- **Model input contract:** both trainers use exactly `['release_year', 'runtime_mins', 'certificate', 'primary_genre']`. `key_cast` appears in README/docs and in `split_features_targets()` but is **not used by either trainer**. `certificate` is a constant `'Not Rated'` column (set in preprocessing). When loading the pickles for inference, feed a DataFrame with those 4 columns.

## Hard rules (from `docs/Rules.md` + `docs/Memory.md` — these are binding project rules)

- **Anti-leakage:** `no_of_votes` / `Votes`, `Popularity_Rank`, `User_Reviews`, `imdb_rating` must never enter the feature matrix `X`.
- **Success tiers** (fixed cutoffs): Low `< 7.0`, Moderate `7.0–7.99`, High `>= 8.0` (`bin_rating()` in `src/preprocessing.py`).
- `RANDOM_STATE = 42` for every stochastic step (split, model init).
- Functions in `src/` need type hints + docstrings. Pipeline logic lives in `src/`, not inline in notebooks.
- No PyTorch/TensorFlow or other new frameworks unless explicitly requested; open-source-only stack.
- **Read `docs/Memory.md` before editing logic; update its §5 progress log after adding pipeline files or structural components.**

## Docs map

`docs/PRD.md` (requirements) · `docs/Architecture.md` (data flow) · `docs/Design.md` (UI tokens: dark `#0E1117`, card `#1E222A`, `.streamlit/config.toml` — not yet created) · `docs/Phases.md` (roadmap; Phase 4 = build `app/main.py`, Phase 5 = testing) · `docs/Rules.md` (standards above) · `docs/Memory.md` (state log/ADR).

Conventional-commit history (`feat(Phase 3): …`, `docs: …`) on `main`.
