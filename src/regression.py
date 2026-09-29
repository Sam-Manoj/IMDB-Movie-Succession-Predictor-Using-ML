"""Regression Module for TV Program Success Predictor.

Trains the four reference-paper regressors (Linear Regression, KNN,
Decision Tree, Random Forest) on pre-production features to predict the
actual rating target (`imdb_rating`), evaluates MAE / MSE / RMSE / R2,
saves a model-comparison CSV and comparison graphs, and persists the
trained Random Forest pipeline.

Results are from our own dataset/split only and are not a reproduction
of the reference paper's dataset or results.
"""

from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")  # headless-safe; graphs are saved to disk
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

# Zero-leakage contract: features are pre-production only; the target
# (imdb_rating) and its derived success_category are excluded from X.
FEATURE_COLS = ["release_year", "runtime_mins", "certificate", "primary_genre"]
TARGET_COL = "imdb_rating"
RANDOM_STATE = 42

RESULTS_CSV = Path("results/model_comparison.csv")
GRAPHS_DIR = Path("results/graphs")
MODEL_DIR = Path("models")


def build_preprocessor() -> ColumnTransformer:
    """Creates a ColumnTransformer: scaling where models need it (KNN/Linear),
    one-hot encoding for categoricals. Fit inside each pipeline on train only."""
    num_features = ["release_year", "runtime_mins"]
    cat_features = ["primary_genre", "certificate"]

    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
        ]
    )


def build_models() -> dict:
    """Returns the four candidate regressors from the reference-paper methodology."""
    return {
        "Linear Regression": LinearRegression(),
        "KNN": KNeighborsRegressor(),
        "Decision Tree": DecisionTreeRegressor(random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE),
    }


def load_dataset(dataset_path: str = "dataset/tv_shows.csv") -> pd.DataFrame:
    """Loads Member 1's cleaned, ML-ready dataset."""
    return pd.read_csv(dataset_path)


def save_comparison_plots(results: pd.DataFrame, graphs_dir: Path = GRAPHS_DIR) -> None:
    """Saves RMSE and R2 comparison bar charts under results/graphs/."""
    graphs_dir.mkdir(parents=True, exist_ok=True)

    for metric, ylabel, title, fname in [
        ("RMSE", "RMSE (lower is better)", "Regression Model Comparison - RMSE", "rmse_comparison.png"),
        ("R2", "R2 score (higher is better)", "Regression Model Comparison - R2", "r2_comparison.png"),
    ]:
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.bar(results["Model"], results[metric], color=["#E50914", "#FFAA00", "#00CC96", "#4B9CD3"])
        ax.set_title(title, fontsize=14, fontweight="bold")
        ax.set_xlabel("Model")
        ax.set_ylabel(ylabel)
        ax.grid(axis="y", alpha=0.3)
        fig.tight_layout()
        fig.savefig(graphs_dir / fname, dpi=150)
        plt.close(fig)


def train_and_evaluate_regression(dataset_path: str = "dataset/tv_shows.csv") -> pd.DataFrame:
    """Trains all four regressors on a reproducible 80/20 split, computes
    MAE/MSE/RMSE/R2, saves results/model_comparison.csv, comparison graphs,
    models/random_forest.pkl and the best pipeline to
    models/regression_model.pkl. Returns the comparison table."""
    df = load_dataset(dataset_path)

    # Clear X / y separation (target removed from X — no leakage)
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    assert TARGET_COL not in X.columns, "Target leakage: target present in X"

    # Reproducible train/test split (same seed convention as the project)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    print("--- Member 2: Regression Model Comparison ---")
    rows = []
    fitted: dict = {}
    for name, model in build_models().items():
        pipeline = Pipeline(
            steps=[("preprocessor", build_preprocessor()), ("regressor", model)]
        )
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        fitted[name] = pipeline

        mse = mean_squared_error(y_test, preds)
        rows.append(
            {
                "Model": name,
                "MAE": mean_absolute_error(y_test, preds),
                "MSE": mse,
                "RMSE": np.sqrt(mse),
                "R2": r2_score(y_test, preds),
            }
        )
        print(
            f"[{name}] MAE: {rows[-1]['MAE']:.4f} | MSE: {rows[-1]['MSE']:.4f} "
            f"| RMSE: {rows[-1]['RMSE']:.4f} | R2: {rows[-1]['R2']:.4f}"
        )

    results = pd.DataFrame(rows)

    # Save comparison table
    RESULTS_CSV.parent.mkdir(parents=True, exist_ok=True)
    results.to_csv(RESULTS_CSV, index=False)
    print(f"Saved comparison table to {RESULTS_CSV}")

    # Save comparison visualizations
    save_comparison_plots(results)
    print(f"Saved RMSE/R2 graphs to {GRAPHS_DIR}/")

    # Persist models: required structure artifact + project's best-pipeline artifact
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(fitted["Random Forest"], MODEL_DIR / "random_forest.pkl")
    best_name = results.loc[results["RMSE"].idxmin(), "Model"]
    joblib.dump(fitted[best_name], MODEL_DIR / "regression_model.pkl")
    print(f"Saved models/random_forest.pkl and models/regression_model.pkl (best: {best_name})")

    return results


if __name__ == "__main__":
    train_and_evaluate_regression()
