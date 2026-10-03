import pandas as pd
import joblib
import re

from src.preprocessing import clean_movie_data


class MovieSearchMLEngine:

    def __init__(self):

        # =========================================================
        # LOAD DATA
        # =========================================================

        self.df = clean_movie_data()

        # =========================================================
        # LOAD ML MODELS
        # =========================================================

        self.reg_model = joblib.load(
            'models/practical_regression.pkl'
        )

        self.clf_model = joblib.load(
            'models/practical_ensemble_classifier.pkl'
        )

        self.svm_model = joblib.load(
            'models/practical_svm.pkl'
        )

        # =========================================================
        # LOAD UNSUPERVISED MODEL
        # =========================================================

        unsupervised = joblib.load(
            'models/practical_unsupervised.pkl'
        )

        self.scaler = unsupervised['scaler']
        self.gmm = unsupervised['gmm']

        # =========================================================
        # PRE-CALCULATE MARKET CLUSTERS
        # =========================================================

        X_scaled = self.scaler.transform(
            self.df[
                ['budget_x', 'revenue', 'score']
            ]
        )

        self.df['market_cluster'] = (
            self.gmm.predict(X_scaled)
        )

        print(
            f"Movie Search Engine loaded "
            f"with {len(self.df)} movies."
        )

    # =============================================================
    # GENRE PARSER
    # =============================================================

    def _parse_genres(self, value):

        if pd.isna(value):
            return set()

        text = str(value).strip().lower()

        if not text:
            return set()

        # Support common separators
        genres = re.split(
            r'[,;|/]+',
            text
        )

        return {
            genre.strip()
            for genre in genres
            if genre.strip()
        }

    # =============================================================
    # ACTOR / CREW PARSER
    # =============================================================

    def _parse_people(self, value):

        if pd.isna(value):
            return set()

        text = str(value).strip()

        if not text:
            return set()

        # Remove list-style characters
        text = re.sub(
            r"[\[\]\(\){}'\"]",
            "",
            text
        )

        # Split common separators
        people = re.split(
            r'[,;|/]+',
            text
        )

        return {
            person.strip().lower()
            for person in people
            if person.strip()
        }

    # =============================================================
    # MOVIE SIMILARITY
    # =============================================================

    def get_similar_movies(
        self,
        movie_row,
        top_n=10
    ):

        """
        Find movies most similar to the selected movie.

        Similarity is based on:

            60% Genre similarity
            40% Actor/Crew similarity

        The selected movie itself is excluded.
        """

        target_title = str(
            movie_row.get(
                'names',
                ''
            )
        ).strip().lower()

        target_genres = self._parse_genres(
            movie_row.get(
                'genre',
                ''
            )
        )

        target_people = self._parse_people(
            movie_row.get(
                'crew',
                ''
            )
        )

        candidates = []

        # =========================================================
        # COMPARE AGAINST ENTIRE DATASET
        # =========================================================

        for _, candidate in self.df.iterrows():

            candidate_title = str(
                candidate.get(
                    'names',
                    ''
                )
            ).strip().lower()

            # ---------------------------------------------
            # Don't recommend the movie itself
            # ---------------------------------------------

            if candidate_title == target_title:
                continue

            candidate_genres = self._parse_genres(
                candidate.get(
                    'genre',
                    ''
                )
            )

            candidate_people = self._parse_people(
                candidate.get(
                    'crew',
                    ''
                )
            )

            # ---------------------------------------------
            # GENRE SIMILARITY
            # ---------------------------------------------

            genre_intersection = (
                target_genres &
                candidate_genres
            )

            genre_union = (
                target_genres |
                candidate_genres
            )

            if genre_union:
                genre_similarity = (
                    len(genre_intersection)
                    /
                    len(genre_union)
                )
            else:
                genre_similarity = 0.0

            # ---------------------------------------------
            # ACTOR / CREW SIMILARITY
            # ---------------------------------------------

            people_intersection = (
                target_people &
                candidate_people
            )

            if target_people:

                actor_similarity = (
                    len(people_intersection)
                    /
                    len(target_people)
                )

            else:

                actor_similarity = 0.0

            # ---------------------------------------------
            # FINAL SIMILARITY
            # ---------------------------------------------

            similarity_score = (
                (0.60 * genre_similarity)
                +
                (0.40 * actor_similarity)
            )

            # ---------------------------------------------
            # Don't include completely unrelated movies
            # ---------------------------------------------

            if similarity_score <= 0:
                continue

            candidates.append({

                "title": candidate.get(
                    'names',
                    'Unknown'
                ),

                "genre": candidate.get(
                    'genre',
                    ''
                ),

                "score": round(
                    similarity_score * 100,
                    2
                ),

                "shared_genres": sorted(
                    genre_intersection
                ),

                "shared_people": sorted(
                    people_intersection
                ),

                "release_year": (
                    int(candidate['release_year'])
                    if pd.notna(
                        candidate.get(
                            'release_year'
                        )
                    )
                    else None
                ),

                "rating": (
                    float(candidate['score'])
                    if pd.notna(
                        candidate.get(
                            'score'
                        )
                    )
                    else None
                )

            })

        # =========================================================
        # SORT BY SIMILARITY
        # =========================================================

        candidates.sort(
            key=lambda movie: movie["score"],
            reverse=True
        )

        # =========================================================
        # RETURN TOP N
        # =========================================================

        return candidates[:top_n]

    # =============================================================
    # MOVIE SEARCH
    # =============================================================

    def search_movie(
        self,
        query: str
    ):

        # =========================================================
        # FIND MOVIES
        # =========================================================

        matches = self.df[
            self.df['names']
            .str.contains(
                query,
                case=False,
                na=False
            )
        ]

        if matches.empty:

            return {
                "error":
                f"No movies found matching '{query}'."
            }

        results = []

        # =========================================================
        # PROCESS MAXIMUM 5 SEARCH RESULTS
        # =========================================================

        for _, row in matches.head(5).iterrows():

            # =====================================================
            # MODEL INPUT
            # =====================================================

            input_data = pd.DataFrame([{

                'budget_x':
                    row['budget_x'],

                'release_year':
                    row['release_year'],

                'score':
                    row['score'],

                'primary_genre':
                    row['primary_genre'],

                'orig_lang':
                    row['orig_lang']

            }])

            # =====================================================
            # REGRESSION
            # =====================================================

            pred_rev = self.reg_model.predict(
                input_data
            )[0]

            # =====================================================
            # RANDOM FOREST SUCCESS TIER
            # =====================================================

            pred_tier = self.clf_model.predict(
                input_data
            )[0]

            # =====================================================
            # SVM PROFITABILITY
            # =====================================================

            profit_prob = (
                self.svm_model
                .predict_proba(input_data)[0][1]
                * 100
            )

            # =====================================================
            # GMM MARKET CLUSTER
            # =====================================================

            cluster_id = row[
                'market_cluster'
            ]

            # =====================================================
            # GENRE + ACTOR SIMILARITY
            # =====================================================

            similar_movies = self.get_similar_movies(
                row,
                top_n=10
            )

            # =====================================================
            # BUILD RESULT
            # =====================================================

            results.append({

                "movie_title":
                    row['names'],

                "release_year":
                    int(row['release_year'])
                    if pd.notna(
                        row['release_year']
                    )
                    else None,

                "genre":
                    row.get(
                        'genre',
                        ''
                    ),

                "actual_budget":
                    f"${row['budget_x']:,.2f}",

                "actual_revenue":
                    f"${row['revenue']:,.2f}",

                "score":
                    float(row['score']),

                "ml_predictions": {

                    # -----------------------------------------
                    # CO2
                    # -----------------------------------------

                    "multivariate_linear_regression_revenue":
                        f"${pred_rev:,.2f}",

                    # -----------------------------------------
                    # CO3
                    # -----------------------------------------

                    "random_forest_success_tier":
                        str(pred_tier),

                    # -----------------------------------------
                    # CO4
                    # -----------------------------------------

                    "svm_profitability_probability":
                        f"{profit_prob:.1f}%",

                    # -----------------------------------------
                    # CO5
                    # -----------------------------------------

                    "market_cluster_id":
                        int(cluster_id),

                    # -----------------------------------------
                    # SIMILARITY ENGINE
                    # -----------------------------------------

                    "similar_movies":
                        similar_movies
                }
            })

        return results