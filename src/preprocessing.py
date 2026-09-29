"""Data Preprocessing Module for TV Program Success Predictor.

Cleans raw Kaggle IMDb dataset (3,000 rows), extracts pre-production features,
and strictly enforces zero-leakage constraints.
"""

from pathlib import Path
from typing import Tuple
import pandas as pd


def load_raw_data(filepath: str = "dataset/tv_shows.csv") -> pd.DataFrame:
    """Loads raw dataset from CSV file."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Raw dataset not found at {filepath}")
    return pd.read_csv(path)


def bin_rating(rating: float) -> str:
    """Categorizes continuous IMDb rating into Low, Moderate, or High success tiers."""
    if rating < 7.0:
        return "Low"
    if rating < 8.0:
        return "Moderate"
    return "High"


def clean_tv_shows_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans raw TV show DataFrame, handles missing values, extracts primary genre/year,

    and creates the target variable without post-broadcast leakage.
    """
    df_clean = df.copy()

    # Rename columns to standard internal schema
    column_mapping = {
        'Title': 'title',
        'EpisodeDuration(in Minutes)': 'runtime_mins',
        'Genres': 'primary_genre',
        'Actors': 'key_cast',
        'Rating': 'imdb_rating',
        'Years': 'release_year',
        'Votes': 'no_of_votes'
    }
    df_clean = df_clean.rename(columns=column_mapping)

    # Clean primary_genre (extract first genre from comma-separated string)
    df_clean['primary_genre'] = df_clean['primary_genre'].fillna('Unknown').apply(
        lambda x: str(x).split(',')[0].strip() if pd.notna(x) else 'Unknown'
    )

    # Clean release_year (extract start year using regex)
    df_clean['release_year'] = df_clean['release_year'].astype(str).str.extract(r'(\d{4})')[0]
    df_clean['release_year'] = pd.to_numeric(df_clean['release_year'], errors='coerce')
    df_clean['release_year'] = df_clean['release_year'].fillna(df_clean['release_year'].median()).astype(int)

    # Clean runtime_mins
    df_clean['runtime_mins'] = pd.to_numeric(df_clean['runtime_mins'], errors='coerce')
    df_clean['runtime_mins'] = df_clean['runtime_mins'].fillna(df_clean['runtime_mins'].median())

    # Fill missing actors
    df_clean['key_cast'] = df_clean['key_cast'].fillna('Unknown')

    # Ensure certificate feature exists (default to 'Not Rated' as missing in raw)
    df_clean['certificate'] = 'Not Rated'

    # Filter invalid ratings and drop null target rows
    df_clean['imdb_rating'] = pd.to_numeric(df_clean['imdb_rating'], errors='coerce')
    df_clean = df_clean.dropna(subset=['imdb_rating'])
    df_clean = df_clean[(df_clean['imdb_rating'] >= 1.0) & (df_clean['imdb_rating'] <= 10.0)]

    # Remove duplicate rows
    df_clean = df_clean.drop_duplicates()

    # Assign classification target tier
    df_clean['success_category'] = df_clean['imdb_rating'].apply(bin_rating)

    # Retain required standard columns
    output_cols = [
        'title', 'release_year', 'runtime_mins', 'certificate', 
        'primary_genre', 'key_cast', 'imdb_rating', 'success_category'
    ]
    return df_clean[output_cols]


def split_features_targets(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """Separates pre-production feature matrix X from regression and classification targets."""
    feature_cols = ['release_year', 'runtime_mins', 'certificate', 'primary_genre', 'key_cast']
    X = df[feature_cols]
    y_reg = df['imdb_rating']
    y_class = df['success_category']
    return X, y_reg, y_class