"""
Dashboard data generator
IMDb Movie Box Office Success & Search Engine

Dataset columns:
    names
    date_x
    score
    genre
    overview
    crew
    orig_title
    status
    orig_lang
    budget_x
    revenue
    country
    box_office_collection

This module:
    1. Reads the real IMDb dataset
    2. Generates dataset analytics
    3. Loads saved ML models when possible
    4. Generates revenue predictions
    5. Generates success tiers
    6. Generates profitability statistics
    7. Generates PCA + GMM market clusters
    8. Returns JSON-safe data for Next.js
"""

from pathlib import Path
import warnings

import joblib
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "dataset"
    / "imdb_movies_6000_box_office_clean.csv"
)

MODELS_DIR = BASE_DIR / "models"

REGRESSION_MODEL_PATH = (
    MODELS_DIR / "practical_regression.pkl"
)

CLASSIFIER_MODEL_PATH = (
    MODELS_DIR / "practical_ensemble_classifier.pkl"
)

SVM_MODEL_PATH = (
    MODELS_DIR / "practical_svm.pkl"
)


# ============================================================
# CONSTANTS
# ============================================================

EXPECTED_COLUMNS = [
    "names",
    "date_x",
    "score",
    "genre",
    "overview",
    "crew",
    "orig_title",
    "status",
    "orig_lang",
    "budget_x",
    "revenue",
    "country",
    "box_office_collection",
]


# ============================================================
# HELPERS
# ============================================================

def safe_number(value, default=0):
    """
    Convert a value to a JSON-safe number.
    """
    try:
        if pd.isna(value):
            return default

        value = float(value)

        if not np.isfinite(value):
            return default

        return value

    except Exception:
        return default


def safe_int(value, default=0):
    """
    Convert a value to a JSON-safe integer.
    """
    try:
        return int(round(safe_number(value, default)))
    except Exception:
        return default


def clean_numeric(series):
    """
    Convert a pandas series to numeric.
    Handles commas, currency symbols and blanks.
    """
    return pd.to_numeric(
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.replace("₹", "", regex=False)
        .str.replace("€", "", regex=False)
        .str.strip()
        .replace(
            {
                "": np.nan,
                "nan": np.nan,
                "None": np.nan,
                "null": np.nan,
            }
        ),
        errors="coerce",
    )


def clean_dataset(df):
    """
    Standardize the dataset without changing
    the original dataframe columns.
    """

    df = df.copy()

    # --------------------------------------------------------
    # Ensure expected columns exist
    # --------------------------------------------------------

    for column in EXPECTED_COLUMNS:
        if column not in df.columns:
            df[column] = np.nan

    # --------------------------------------------------------
    # Numeric fields
    # --------------------------------------------------------

    for column in [
        "score",
        "budget_x",
        "revenue",
        "box_office_collection",
    ]:
        df[column] = clean_numeric(df[column])

    # --------------------------------------------------------
    # Date
    # --------------------------------------------------------

    df["parsed_date"] = pd.to_datetime(
        df["date_x"],
        errors="coerce",
    )

    df["release_year"] = (
        df["parsed_date"]
        .dt.year
        .fillna(0)
        .astype(int)
    )

    # --------------------------------------------------------
    # Text
    # --------------------------------------------------------

    for column in [
        "names",
        "orig_title",
        "genre",
        "orig_lang",
        "country",
        "status",
    ]:
        df[column] = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    return df


def load_dataset():
    """
    Load and clean the real IMDb dataset.
    """

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    df = clean_dataset(df)

    return df


def load_model(path):
    """
    Safely load a joblib model.
    """

    if not path.exists():
        return None

    try:
        return joblib.load(path)

    except Exception as error:
        print(
            f"WARNING: Could not load model "
            f"{path.name}: {error}"
        )

        return None


def json_safe(value):
    """
    Recursively make values JSON serializable.
    """

    if isinstance(value, dict):
        return {
            str(k): json_safe(v)
            for k, v in value.items()
        }

    if isinstance(value, list):
        return [
            json_safe(v)
            for v in value
        ]

    if isinstance(value, tuple):
        return [
            json_safe(v)
            for v in value
        ]

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        if not np.isfinite(value):
            return None

        return float(value)

    if isinstance(value, np.ndarray):
        return json_safe(
            value.tolist()
        )

    if pd.isna(value):
        return None

    return value


# ============================================================
# GENRE ANALYTICS
# ============================================================

def get_genre_data(df):
    """
    Calculate real primary genre distribution
    from the dataset.
    """

    work = df[
        df["genre"].notna()
        & (df["genre"].str.strip() != "")
    ].copy()

    if work.empty:
        return []

    genre_series = (
        work["genre"]
        .astype(str)
        .str.split(",")
        .explode()
        .str.strip()
    )

    # Some datasets use "/" or "|"
    genre_series = (
        genre_series
        .str.split("/")
        .explode()
        .str.split("|")
        .explode()
        .str.strip()
    )

    genre_series = genre_series[
        genre_series != ""
    ]

    counts = (
        genre_series
        .value_counts()
        .head(12)
    )

    return [
        {
            "name": str(name),
            "value": int(value),
        }
        for name, value in counts.items()
    ]


# ============================================================
# SUCCESS TIERS
# ============================================================

def calculate_dataset_success_tiers(df):
    """
    Dataset-derived success classification.

    This is NOT simulated data.

    Priority:
        1. box_office_collection / revenue
        2. revenue / budget
        3. score

    This provides meaningful dashboard analytics even if
    the saved classifier requires a different training
    feature pipeline.
    """

    work = df.copy()

    # --------------------------------------------------------
    # Prefer box office collection
    # --------------------------------------------------------

    collection = work[
        "box_office_collection"
    ].copy()

    revenue = work["revenue"].copy()

    budget = work["budget_x"].copy()

    # --------------------------------------------------------
    # Financial ratio
    # --------------------------------------------------------

    ratio = pd.Series(
        np.nan,
        index=work.index,
    )

    valid_budget = (
        budget > 0
    ) & budget.notna()

    ratio.loc[
        valid_budget
    ] = (
        revenue.loc[valid_budget]
        / budget.loc[valid_budget]
    )

    # --------------------------------------------------------
    # Build a financial metric
    # --------------------------------------------------------

    financial = collection.copy()

    financial = financial.where(
        financial > 0,
        revenue,
    )

    # --------------------------------------------------------
    # Score
    # --------------------------------------------------------

    score = work["score"]

    # --------------------------------------------------------
    # Create tiers using percentile-based dataset values
    #
    # This means the dashboard represents the actual dataset,
    # not fabricated numbers.
    # --------------------------------------------------------

    tier = pd.Series(
        "Average Hit",
        index=work.index,
    )

    valid_financial = financial[
        financial > 0
    ].dropna()

    if len(valid_financial) >= 3:

        high_threshold = (
            valid_financial.quantile(0.66)
        )

        low_threshold = (
            valid_financial.quantile(0.33)
        )

        tier.loc[
            financial >= high_threshold
        ] = "Blockbuster"

        tier.loc[
            financial <= low_threshold
        ] = "Flop"

    else:

        # Fallback based on rating
        tier.loc[
            score >= 8
        ] = "Blockbuster"

        tier.loc[
            score < 6
        ] = "Flop"

    counts = (
        tier.value_counts()
        .reindex(
            [
                "Blockbuster",
                "Average Hit",
                "Flop",
            ],
            fill_value=0,
        )
    )

    return [
        {
            "name": "Blockbuster",
            "value": int(
                counts["Blockbuster"]
            ),
            "label": "High",
        },
        {
            "name": "Average Hit",
            "value": int(
                counts["Average Hit"]
            ),
            "label": "Moderate",
        },
        {
            "name": "Flop",
            "value": int(
                counts["Flop"]
            ),
            "label": "Low",
        },
    ]


# ============================================================
# TOP RATINGS
# ============================================================

def get_top_ratings(df):
    """
    Return actual highest-rated movies.
    """

    work = df[
        df["score"].notna()
    ].copy()

    work = work.sort_values(
        "score",
        ascending=False,
    )

    work = work.head(5)

    results = []

    for _, row in work.iterrows():

        title = (
            row["names"]
            or row["orig_title"]
            or "Unknown Movie"
        )

        results.append(
            {
                "name": str(title),
                "rating": safe_number(
                    row["score"]
                ),
                "genre": str(
                    row["genre"]
                    or "Unknown"
                ),
            }
        )

    return results


# ============================================================
# DATASET REVENUE
# ============================================================

def get_revenue_dataset(df):
    """
    Return actual revenue information from dataset.

    Used by frontend even if the regression model
    cannot be executed because of incompatible
    feature preprocessing.
    """

    work = df[
        (
            df["revenue"].notna()
        )
        | (
            df["box_office_collection"]
            .notna()
        )
    ].copy()

    if work.empty:
        return []

    # Prefer box office collection
    work["actual_revenue"] = (
        work["box_office_collection"]
        .where(
            work["box_office_collection"] > 0,
            work["revenue"],
        )
    )

    work = work[
        work["actual_revenue"]
        .notna()
    ]

    # Keep a manageable number for frontend
    work = work.head(20)

    result = []

    for index, row in work.iterrows():

        title = (
            row["names"]
            or row["orig_title"]
            or f"Movie {index}"
        )

        result.append(
            {
                "name": str(title)[:28],
                "actual": safe_number(
                    row["actual_revenue"]
                ),
                "predicted": None,
            }
        )

    return result


# ============================================================
# REGRESSION PREDICTIONS
# ============================================================

def try_regression_predictions(
    df,
    revenue_data,
    model,
):
    """
    Try to generate regression predictions.

    Important:
    The saved regression model must receive the same
    feature structure used during training.

    This function first checks model expectations.

    If the model is incompatible with the current
    dataframe representation, it leaves predicted=None
    rather than inventing a prediction.
    """

    if model is None:
        return revenue_data, False

    if not revenue_data:
        return revenue_data, False

    try:

        # ----------------------------------------------------
        # Try to identify expected number of features
        # ----------------------------------------------------

        expected_features = getattr(
            model,
            "n_features_in_",
            None,
        )

        # ----------------------------------------------------
        # Basic numeric feature candidate
        #
        # This matches the documented regression inputs:
        # budget, release year, score, genre-related feature.
        # ----------------------------------------------------

        work = df.copy()

        X = pd.DataFrame(
            {
                "budget": work[
                    "budget_x"
                ].fillna(0),

                "year": work[
                    "release_year"
                ].fillna(0),

                "score": work[
                    "score"
                ].fillna(
                    work["score"].median()
                    if work["score"].notna().any()
                    else 0
                ),

                "genre_count": work[
                    "genre"
                ]
                .fillna("")
                .astype(str)
                .str.count(",")
                .add(1),
            }
        )

        # ----------------------------------------------------
        # Only use this direct representation if the model
        # expects four features.
        # ----------------------------------------------------

        if (
            expected_features is not None
            and expected_features != X.shape[1]
        ):
            print(
                "Regression model expects "
                f"{expected_features} features; "
                f"dashboard candidate has "
                f"{X.shape[1]}. "
                "Skipping direct prediction."
            )

            return revenue_data, False

        predictions = model.predict(X)

        # ----------------------------------------------------
        # Match predictions to returned rows
        # ----------------------------------------------------

        for i, item in enumerate(
            revenue_data
        ):

            if i >= len(predictions):
                break

            item["predicted"] = safe_number(
                predictions[i]
            )

        return revenue_data, True

    except Exception as error:

        print(
            "Regression prediction skipped:",
            error,
        )

        return revenue_data, False


# ============================================================
# PROFITABILITY
# ============================================================

def get_profitability(df):
    """
    Real profitability statistics from the dataset.

    A movie is considered profitable when:
        revenue > budget

    This is based directly on the dataset.
    """

    work = df[
        (
            df["revenue"].notna()
        )
        &
        (
            df["budget_x"].notna()
        )
    ].copy()

    work = work[
        work["budget_x"] > 0
    ]

    if work.empty:
        return {
            "profitable": 0,
            "not_profitable": 0,
        }

    profitable = (
        work["revenue"]
        > work["budget_x"]
    )

    return {
        "profitable": int(
            profitable.sum()
        ),
        "not_profitable": int(
            (~profitable).sum()
        ),
    }


# ============================================================
# SVM PROFITABILITY
# ============================================================

def try_svm_prediction(
    df,
    model,
):
    """
    Attempt SVM inference.

    Like regression, this requires the same feature
    preprocessing used during model training.

    If the structure doesn't match, dataset-derived
    profitability remains available.
    """

    if model is None:
        return None

    try:

        expected_features = getattr(
            model,
            "n_features_in_",
            None,
        )

        X = pd.DataFrame(
            {
                "budget": df[
                    "budget_x"
                ].fillna(0),

                "revenue": df[
                    "revenue"
                ].fillna(0),

                "score": df[
                    "score"
                ].fillna(
                    df["score"].median()
                    if df["score"].notna().any()
                    else 0
                ),

                "year": df[
                    "release_year"
                ].fillna(0),
            }
        )

        if (
            expected_features is not None
            and expected_features != X.shape[1]
        ):
            print(
                "SVM expects "
                f"{expected_features} features; "
                f"dashboard candidate has "
                f"{X.shape[1]}."
            )

            return None

        prediction = model.predict(X)

        values, counts = np.unique(
            prediction,
            return_counts=True,
        )

        return {
            str(value): int(count)
            for value, count in zip(
                values,
                counts,
            )
        }

    except Exception as error:

        print(
            "SVM prediction skipped:",
            error,
        )

        return None


# ============================================================
# PCA + GMM
# ============================================================

def get_market_clusters(df):
    """
    Generate PCA + GMM market clusters directly
    from the real dataset.

    Features:
        budget
        revenue
        score
        release year

    This is actual unsupervised analysis of the dataset,
    not simulated coordinates.
    """

    try:

        from sklearn.preprocessing import StandardScaler
        from sklearn.decomposition import PCA
        from sklearn.mixture import GaussianMixture

    except ImportError:

        print(
            "scikit-learn is required for "
            "PCA + GMM."
        )

        return []

    work = df.copy()

    feature_columns = [
        "budget_x",
        "revenue",
        "score",
        "release_year",
    ]

    X = work[
        feature_columns
    ].copy()

    X = X.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    X = X.fillna(
        X.median()
    )

    # Need enough records
    if len(X) < 10:
        return []

    # --------------------------------------------------------
    # Standardize
    # --------------------------------------------------------

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(
        X
    )

    # --------------------------------------------------------
    # PCA
    # --------------------------------------------------------

    pca = PCA(
        n_components=2,
        random_state=42,
    )

    X_pca = pca.fit_transform(
        X_scaled
    )

    # --------------------------------------------------------
    # GMM
    # --------------------------------------------------------

    n_clusters = min(
        4,
        max(
            2,
            len(X) // 500
        ),
    )

    gmm = GaussianMixture(
        n_components=n_clusters,
        random_state=42,
        n_init=5,
    )

    labels = gmm.fit_predict(
        X_scaled
    )

    # --------------------------------------------------------
    # Limit frontend points
    # --------------------------------------------------------

    # Sampling instead of sending all 2407 points
    # to Recharts.
    sample_size = min(
        250,
        len(X),
    )

    sample_indices = np.linspace(
        0,
        len(X) - 1,
        sample_size,
        dtype=int,
    )

    results = []

    for idx in sample_indices:

        row = work.iloc[idx]

        title = (
            row["names"]
            or row["orig_title"]
            or f"Movie {idx + 1}"
        )

        results.append(
            {
                "x": safe_number(
                    X_pca[idx, 0]
                ),

                "y": safe_number(
                    X_pca[idx, 1]
                ),

                "name": str(title),

                "cluster": int(
                    labels[idx]
                ),
            }
        )

    return results


# ============================================================
# DATASET SUMMARY
# ============================================================

def get_overview(df):
    """
    Dataset-level statistics.
    """

    return {
        "total_movies": int(
            len(df)
        ),

        "valid_scores": int(
            df["score"]
            .notna()
            .sum()
        ),

        "valid_revenue": int(
            df["revenue"]
            .notna()
            .sum()
        ),

        "valid_budget": int(
            df["budget_x"]
            .notna()
            .sum()
        ),

        "valid_box_office": int(
            df[
                "box_office_collection"
            ]
            .notna()
            .sum()
        ),

        "valid_dates": int(
            df["parsed_date"]
            .notna()
            .sum()
        ),
    }


# ============================================================
# ADDITIONAL DATASET ANALYTICS
# ============================================================

def get_extra_analytics(df):
    """
    Additional information available from your dataset.
    """

    # --------------------------------------------------------
    # Languages
    # --------------------------------------------------------

    languages = (
        df[
            df["orig_lang"]
            .str.strip()
            != ""
        ]["orig_lang"]
        .value_counts()
        .head(10)
    )

    language_data = [
        {
            "name": str(name),
            "value": int(value),
        }
        for name, value
        in languages.items()
    ]

    # --------------------------------------------------------
    # Countries
    # --------------------------------------------------------

    countries = (
        df[
            df["country"]
            .str.strip()
            != ""
        ]["country"]
        .value_counts()
        .head(10)
    )

    country_data = [
        {
            "name": str(name),
            "value": int(value),
        }
        for name, value
        in countries.items()
    ]

    # --------------------------------------------------------
    # Year distribution
    # --------------------------------------------------------

    years = (
        df[
            df["release_year"] > 0
        ]["release_year"]
        .value_counts()
        .sort_index()
    )

    year_data = [
        {
            "year": int(year),
            "value": int(value),
        }
        for year, value
        in years.items()
    ]

    # --------------------------------------------------------
    # Average score
    # --------------------------------------------------------

    average_score = (
        df["score"]
        .mean()
    )

    # --------------------------------------------------------
    # Average budget
    # --------------------------------------------------------

    average_budget = (
        df["budget_x"]
        .mean()
    )

    # --------------------------------------------------------
    # Average revenue
    # --------------------------------------------------------

    average_revenue = (
        df["revenue"]
        .mean()
    )

    return {
        "languages": language_data,
        "countries": country_data,
        "years": year_data,
        "average_score": safe_number(
            average_score
        ),
        "average_budget": safe_number(
            average_budget
        ),
        "average_revenue": safe_number(
            average_revenue
        ),
    }


# ============================================================
# MAIN DASHBOARD FUNCTION
# ============================================================

def get_dashboard_data():
    """
    Main function called by FastAPI.
    """

    print(
        "\n"
        + "=" * 70
    )

    print(
        "GENERATING DASHBOARD DATA"
    )

    print(
        "=" * 70
    )

    # ========================================================
    # LOAD DATASET
    # ========================================================

    df = load_dataset()

    print(
        f"Dataset loaded: {len(df)} records"
    )

    # ========================================================
    # LOAD MODELS
    # ========================================================

    regression_model = load_model(
        REGRESSION_MODEL_PATH
    )

    classifier_model = load_model(
        CLASSIFIER_MODEL_PATH
    )

    svm_model = load_model(
        SVM_MODEL_PATH
    )

    print(
        "Regression:",
        regression_model is not None,
    )

    print(
        "Classifier:",
        classifier_model is not None,
    )

    print(
        "SVM:",
        svm_model is not None,
    )

    # ========================================================
    # OVERVIEW
    # ========================================================

    overview = get_overview(
        df
    )

    # ========================================================
    # GENRES
    # ========================================================

    genres = get_genre_data(
        df
    )

    # ========================================================
    # SUCCESS TIERS
    # ========================================================

    success_tiers = (
        calculate_dataset_success_tiers(
            df
        )
    )

    # ========================================================
    # TOP RATINGS
    # ========================================================

    top_ratings = get_top_ratings(
        df
    )

    # ========================================================
    # REVENUE
    # ========================================================

    revenue = get_revenue_dataset(
        df
    )

    revenue, regression_used = (
        try_regression_predictions(
            df,
            revenue,
            regression_model,
        )
    )

    # ========================================================
    # PROFITABILITY
    # ========================================================

    profitability = get_profitability(
        df
    )

    svm_predictions = (
        try_svm_prediction(
            df,
            svm_model,
        )
    )

    # ========================================================
    # PCA + GMM
    # ========================================================

    clusters = get_market_clusters(
        df
    )

    # ========================================================
    # EXTRA ANALYTICS
    # ========================================================

    extra = get_extra_analytics(
        df
    )

    # ========================================================
    # MODEL STATUS
    # ========================================================

    models = {
        "regression": regression_model
        is not None,

        "classification": classifier_model
        is not None,

        "svm": svm_model
        is not None,

        "unsupervised": len(
            clusters
        ) > 0,
    }

    # ========================================================
    # SOURCE STATUS
    # ========================================================

    data_sources = {
        "dataset": True,

        "genre": "dataset",

        "success_tiers":
            "dataset_derived",

        "top_ratings":
            "dataset",

        "revenue":
            "dataset",

        "revenue_predictions":
            "ml_model"
            if regression_used
            else "unavailable",

        "profitability":
            "dataset",

        "svm_predictions":
            "ml_model"
            if svm_predictions is not None
            else "unavailable",

        "clusters":
            "pca_gmm",
    }

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    response = {

        "status": "success",

        # ----------------------------------------------------
        # Dataset
        # ----------------------------------------------------

        "overview": overview,

        # ----------------------------------------------------
        # Existing frontend sections
        # ----------------------------------------------------

        "genres": genres,

        "success_tiers":
            success_tiers,

        "top_ratings":
            top_ratings,

        "revenue":
            revenue,

        "profitability":
            profitability,

        "clusters":
            clusters,

        # ----------------------------------------------------
        # Model availability
        # ----------------------------------------------------

        "models":
            models,

        # ----------------------------------------------------
        # Extra dataset information
        # ----------------------------------------------------

        "analytics": extra,

        # ----------------------------------------------------
        # SVM prediction distribution
        # ----------------------------------------------------

        "svm_predictions":
            svm_predictions,

        # ----------------------------------------------------
        # Tell frontend where each value came from
        # ----------------------------------------------------

        "data_sources":
            data_sources,
    }

    print(
        "Dashboard data generated successfully."
    )

    print(
        "Genres:",
        len(genres),
    )

    print(
        "Top ratings:",
        len(top_ratings),
    )

    print(
        "Revenue records:",
        len(revenue),
    )

    print(
        "Clusters:",
        len(clusters),
    )

    print(
        "=" * 70
    )

    return json_safe(
        response
    )