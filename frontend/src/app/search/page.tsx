'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  Activity,
  Layers,
  LayoutDashboard,
  Home,
  TrendingUp,
  AlertCircle,
  Loader2,
  Film,
  Calendar,
  DollarSign,
  Award,
  Star,
  Clapperboard,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/* =========================================================
   TYPES
========================================================= */

interface SimilarMovie {
  title: string;
  genre: string;
  score: number;
  shared_genres: string[];
  shared_people: string[];
  release_year: number | null;
  rating: number | null;
}

interface MLPredictions {
  multivariate_linear_regression_revenue: string;
  random_forest_success_tier: string;
  svm_profitability_probability: string;
  market_cluster_id: number;
  similar_movies: SimilarMovie[];
}

interface MovieResult {
  movie_title: string;
  release_year: number | null;
  genre: string;
  actual_budget: string;
  actual_revenue: string;
  score: number;
  ml_predictions: MLPredictions;
}

type ViewMode = 'search' | 'success' | 'similar';

/* =========================================================
   PAGE
========================================================= */

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchedMovie, setSearchedMovie] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);

  const [mode, setMode] = useState<ViewMode>('search');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =======================================================
     SEARCH MOVIE
  ======================================================= */

  const handleSearch = async (
    searchQuery: string = query,
    targetMode: ViewMode = 'search'
  ) => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setError('Please enter a movie name.');
      return;
    }

    setLoading(true);
    setError('');
    setMode(targetMode);

    try {
      const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(trimmedQuery)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || `Search failed with status ${response.status}`
        );
      }

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response received from the API.');
      }

      setResults(data.results);
      setSearchedMovie(trimmedQuery);

      if (data.results.length > 0) {
        setSelectedMovie(data.results[0]);
      } else {
        setSelectedMovie(null);
      }
    } catch (err) {
      console.error(err);

      setResults([]);
      setSelectedMovie(null);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while searching.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     BROWSE SIMILAR MOVIE
  ======================================================= */

  const browseSimilarMovie = async (movieTitle: string) => {
    setQuery(movieTitle);

    await handleSearch(movieTitle, 'search');
  };

  /* =======================================================
     SELECT MOVIE
  ======================================================= */

  const handleSelectMovie = (movie: MovieResult) => {
    setSelectedMovie(movie);
  };

  /* =======================================================
     HELPERS
  ======================================================= */

  const getSuccessTierClass = (tier: string) => {
    const value = tier.toLowerCase();

    if (
      value.includes('blockbuster') ||
      value.includes('success') ||
      value.includes('hit')
    ) {
      return 'bg-[#C2FF38] text-[#064A25]';
    }

    if (value.includes('average')) {
      return 'bg-yellow-100 text-yellow-700';
    }

    return 'bg-red-100 text-red-700';
  };

  const getSimilarityWidth = (score: number) => {
    return `${Math.min(Math.max(score, 0), 100)}%`;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#064A25]">

      {/* ===================================================
          SIDEBAR — UNCHANGED
      =================================================== */}

      <aside className="fixed left-0 top-0 z-50 h-screen w-20 md:w-24 bg-[#064A25] text-white flex flex-col items-center py-6 rounded-r-[2rem]">
        <Link
          href="/"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#C2FF38] flex items-center justify-center overflow-hidden mb-10"
        >
          <img
            src="/Main logo.png"
            alt="TV Predict"
            className="w-full h-full object-contain"
          />
        </Link>

        <nav className="flex flex-col items-center gap-5">
          <Link
            href="/"
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>

          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#C2FF38] text-[#064A25] shadow-lg"
            title="Search ML Engine"
          >
            <Search className="w-5 h-5" />
          </div>
        </nav>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="ml-20 md:ml-24 min-h-screen">

        {/* HEADER */}

        <header className="px-6 md:px-10 lg:px-14 pt-8 pb-6">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

              <div>
                <div className="flex items-center gap-2 text-sm text-[#064A25]/50 mb-3">
                  <Activity className="w-4 h-4" />
                  <span>ML Prediction Engine</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Movie Search
                </h1>

                <p className="mt-2 text-[#064A25]/60 max-w-2xl">
                  Search IMDb movies and explore revenue predictions,
                  success tiers, profitability and similar movies from the
                  dataset.
                </p>
              </div>

              {/* STATUS */}

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#064A25]/10 shadow-sm w-fit">
                <span className="w-2 h-2 rounded-full bg-[#C2FF38]" />
                <span className="text-sm font-semibold">
                  ML Engine Online
                </span>
              </div>

            </div>
          </div>
        </header>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <section className="px-6 md:px-10 lg:px-14">
          <div className="max-w-7xl mx-auto">

            <div className="bg-[#064A25] rounded-[2rem] p-5 md:p-6 shadow-xl">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex flex-col md:flex-row gap-3"
              >

                <div className="relative flex-1">

                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a movie..."
                    className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 pl-14 pr-5 outline-none focus:border-[#C2FF38] transition-all"
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-8 rounded-2xl bg-[#C2FF38] text-[#064A25] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>

              </form>

              {/* SEARCH INFO */}

              {searchedMovie && !loading && (
                <div className="mt-4 text-sm text-white/60">
                  Showing results for{' '}
                  <span className="text-[#C2FF38] font-semibold">
                    "{searchedMovie}"
                  </span>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <section className="px-6 md:px-10 lg:px-14 mt-6">
            <div className="max-w-7xl mx-auto">

              <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />

                <div>
                  <p className="font-semibold">Search Error</p>
                  <p className="text-sm mt-1 opacity-80">{error}</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            MODE TABS
        ================================================= */}

        <section className="px-6 md:px-10 lg:px-14 mt-8">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => setMode('search')}
                className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  mode === 'search'
                    ? 'bg-[#064A25] text-white shadow-lg'
                    : 'bg-white text-[#064A25]/60 border border-[#064A25]/10 hover:bg-[#064A25]/5'
                }`}
              >
                <Film className="w-4 h-4" />
                Movie Search
              </button>

              <button
                onClick={() => setMode('success')}
                disabled={!selectedMovie}
                className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-40 ${
                  mode === 'success'
                    ? 'bg-[#064A25] text-white shadow-lg'
                    : 'bg-white text-[#064A25]/60 border border-[#064A25]/10 hover:bg-[#064A25]/5'
                }`}
              >
                <Award className="w-4 h-4" />
                Success Tier
              </button>

              <button
                onClick={() => setMode('similar')}
                disabled={!selectedMovie}
                className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-40 ${
                  mode === 'similar'
                    ? 'bg-[#064A25] text-white shadow-lg'
                    : 'bg-white text-[#064A25]/60 border border-[#064A25]/10 hover:bg-[#064A25]/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Similar Movies
              </button>

            </div>

          </div>
        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="px-6 md:px-10 lg:px-14 py-8">
          <div className="max-w-7xl mx-auto">

            {loading && (
              <div className="flex flex-col items-center justify-center py-24">

                <div className="w-16 h-16 rounded-2xl bg-[#064A25] flex items-center justify-center mb-5">
                  <Loader2 className="w-7 h-7 text-[#C2FF38] animate-spin" />
                </div>

                <h3 className="font-bold text-lg">
                  Running ML predictions
                </h3>

                <p className="text-sm text-[#064A25]/50 mt-1">
                  Searching the movie dataset...
                </p>

              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">

                <div className="w-20 h-20 rounded-3xl bg-[#064A25]/5 flex items-center justify-center mb-5">
                  <Clapperboard className="w-9 h-9 text-[#064A25]/30" />
                </div>

                <h3 className="text-xl font-bold">
                  Search for a movie
                </h3>

                <p className="text-[#064A25]/50 mt-2 max-w-md">
                  Enter a movie title above to view predictions and discover
                  similar movies.
                </p>

              </div>
            )}

            {!loading && results.length > 0 && selectedMovie && (
              <>
                {/* =================================================
                    MOVIE SEARCH MODE
                ================================================= */}

                {mode === 'search' && (
                  <div className="space-y-6">

                    {/* MOVIE HEADER */}

                    <div className="bg-white rounded-[2rem] border border-[#064A25]/10 p-6 md:p-8 shadow-sm">

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                        <div>

                          <div className="flex items-center gap-2 mb-3">
                            <Film className="w-5 h-5 text-[#064A25]/50" />

                            <span className="text-xs font-bold uppercase tracking-widest text-[#064A25]/40">
                              Movie Result
                            </span>
                          </div>

                          <h2 className="text-3xl md:text-4xl font-black">
                            {selectedMovie.movie_title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#064A25]/60">

                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {selectedMovie.release_year || 'N/A'}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Star className="w-4 h-4" />
                              {selectedMovie.score?.toFixed(1) || 'N/A'}
                            </span>

                            <span>
                              {selectedMovie.genre || 'Genre unavailable'}
                            </span>

                          </div>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">

                          <button
                            onClick={() => setMode('success')}
                            className="px-5 py-3 rounded-xl bg-[#064A25] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#07582c] transition-all"
                          >
                            <Award className="w-4 h-4" />
                            View Success
                          </button>

                          <button
                            onClick={() => setMode('similar')}
                            className="px-5 py-3 rounded-xl bg-[#C2FF38] text-[#064A25] font-semibold flex items-center justify-center gap-2 hover:brightness-95 transition-all"
                          >
                            <Sparkles className="w-4 h-4" />
                            Similar Movies
                          </button>

                        </div>

                      </div>

                    </div>

                    {/* BASIC MOVIE DATA */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <InfoCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Actual Budget"
                        value={selectedMovie.actual_budget}
                      />

                      <InfoCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Actual Revenue"
                        value={selectedMovie.actual_revenue}
                      />

                      <InfoCard
                        icon={<Star className="w-5 h-5" />}
                        label="IMDb Score"
                        value={selectedMovie.score?.toFixed(1) || 'N/A'}
                      />

                    </div>

                    {/* ML PREDICTIONS */}

                    <div>

                      <div className="flex items-center justify-between mb-4">

                        <div>
                          <h3 className="text-xl font-bold">
                            Machine Learning Predictions
                          </h3>

                          <p className="text-sm text-[#064A25]/50 mt-1">
                            Predictions generated from the trained models.
                          </p>
                        </div>

                        <Activity className="w-5 h-5 text-[#064A25]/30" />

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        {/* REGRESSION */}

                        <PredictionCard
                          icon={<TrendingUp className="w-5 h-5" />}
                          label="Predicted Revenue"
                          value={
                            selectedMovie.ml_predictions
                              .multivariate_linear_regression_revenue
                          }
                          description="Multivariate Linear Regression"
                        />

                        {/* SUCCESS */}

                        <PredictionCard
                          icon={<Award className="w-5 h-5" />}
                          label="Success Tier"
                          value={
                            selectedMovie.ml_predictions
                              .random_forest_success_tier
                          }
                          description="Random Forest Classifier"
                          valueClass={getSuccessTierClass(
                            selectedMovie.ml_predictions
                              .random_forest_success_tier
                          )}
                        />

                        {/* PROFITABILITY */}

                        <PredictionCard
                          icon={<TrendingUp className="w-5 h-5" />}
                          label="Profitability"
                          value={
                            selectedMovie.ml_predictions
                              .svm_profitability_probability
                          }
                          description="SVM Probability"
                        />

                        {/* CLUSTER */}

                        <PredictionCard
                          icon={<Layers className="w-5 h-5" />}
                          label="Market Cluster"
                          value={`Cluster ${
                            selectedMovie.ml_predictions.market_cluster_id
                          }`}
                          description="PCA + GMM Market Segment"
                        />

                      </div>

                    </div>

                    {/* SEARCH MATCHES */}

                    {results.length > 1 && (
                      <div>

                        <h3 className="text-xl font-bold mb-4">
                          Search Matches
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                          {results.map((movie, index) => (
                            <button
                              key={`${movie.movie_title}-${index}`}
                              onClick={() => handleSelectMovie(movie)}
                              className={`text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${
                                selectedMovie.movie_title ===
                                movie.movie_title
                                  ? 'border-[#064A25] ring-1 ring-[#064A25]'
                                  : 'border-[#064A25]/10'
                              }`}
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div>
                                  <h4 className="font-bold">
                                    {movie.movie_title}
                                  </h4>

                                  <p className="text-sm text-[#064A25]/50 mt-1">
                                    {movie.release_year || 'N/A'} •{' '}
                                    {movie.genre || 'Unknown genre'}
                                  </p>
                                </div>

                                <ChevronRight className="w-5 h-5 text-[#064A25]/30" />

                              </div>

                            </button>
                          ))}

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* =================================================
                    SUCCESS TIER MODE
                ================================================= */}

                {mode === 'success' && (
                  <div className="space-y-6">

                    <div className="bg-[#064A25] rounded-[2rem] p-7 md:p-10 text-white">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        <div>

                          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                            <Award className="w-4 h-4" />
                            Random Forest Classification
                          </div>

                          <h2 className="text-3xl md:text-4xl font-black">
                            {selectedMovie.movie_title}
                          </h2>

                          <p className="text-white/50 mt-2">
                            Predicted movie success category
                          </p>

                        </div>

                        <div
                          className={`px-6 py-4 rounded-2xl text-lg font-black ${getSuccessTierClass(
                            selectedMovie.ml_predictions
                              .random_forest_success_tier
                          )}`}
                        >
                          {
                            selectedMovie.ml_predictions
                              .random_forest_success_tier
                          }
                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div className="bg-white border border-[#064A25]/10 rounded-[2rem] p-7">

                        <div className="w-12 h-12 rounded-xl bg-[#064A25]/5 flex items-center justify-center mb-5">
                          <Award className="w-6 h-6" />
                        </div>

                        <p className="text-sm text-[#064A25]/50">
                          Random Forest Prediction
                        </p>

                        <h3 className="text-3xl font-black mt-2">
                          {
                            selectedMovie.ml_predictions
                              .random_forest_success_tier
                          }
                        </h3>

                        <p className="text-sm text-[#064A25]/50 mt-4">
                          The trained ensemble classifier assigns this movie
                          to a success category using its available features.
                        </p>

                      </div>

                      <div className="bg-white border border-[#064A25]/10 rounded-[2rem] p-7">

                        <div className="w-12 h-12 rounded-xl bg-[#064A25]/5 flex items-center justify-center mb-5">
                          <TrendingUp className="w-6 h-6" />
                        </div>

                        <p className="text-sm text-[#064A25]/50">
                          Profitability Probability
                        </p>

                        <h3 className="text-3xl font-black mt-2">
                          {
                            selectedMovie.ml_predictions
                              .svm_profitability_probability
                          }
                        </h3>

                        <p className="text-sm text-[#064A25]/50 mt-4">
                          SVM model probability for the profitability class.
                        </p>

                      </div>

                    </div>

                    <div className="bg-white border border-[#064A25]/10 rounded-[2rem] p-7">

                      <h3 className="text-xl font-bold mb-5">
                        Movie Information
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                        <StatItem
                          label="IMDb Score"
                          value={selectedMovie.score?.toFixed(1) || 'N/A'}
                        />

                        <StatItem
                          label="Release Year"
                          value={
                            selectedMovie.release_year?.toString() || 'N/A'
                          }
                        />

                        <StatItem
                          label="Budget"
                          value={selectedMovie.actual_budget}
                        />

                        <StatItem
                          label="Revenue"
                          value={selectedMovie.actual_revenue}
                        />

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    SIMILAR MOVIES MODE
                ================================================= */}

                {mode === 'similar' && (
                  <div className="space-y-6">

                    <div className="bg-[#064A25] rounded-[2rem] p-7 md:p-9 text-white">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                            <Sparkles className="w-4 h-4" />
                            Dataset Similarity Search
                          </div>

                          <h2 className="text-3xl md:text-4xl font-black">
                            Movies Similar To
                          </h2>

                          <p className="text-[#C2FF38] font-bold text-xl mt-2">
                            {selectedMovie.movie_title}
                          </p>

                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10">
                          <Users className="w-5 h-5 text-[#C2FF38]" />
                          <span className="text-sm text-white/70">
                            Genre + People Similarity
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* EXPLANATION */}

                    <div className="bg-white border border-[#064A25]/10 rounded-2xl p-5">

                      <div className="flex gap-3">

                        <div className="w-10 h-10 rounded-xl bg-[#064A25]/5 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>

                        <div>

                          <h3 className="font-bold">
                            How similarity is calculated
                          </h3>

                          <p className="text-sm text-[#064A25]/55 mt-1">
                            Movies are compared against the dataset using
                            genre overlap and shared people information.
                            Market clustering is not used to determine these
                            similar movies.
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* SIMILAR MOVIES */}

                    {selectedMovie.ml_predictions.similar_movies?.length >
                    0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        {selectedMovie.ml_predictions.similar_movies.map(
                          (movie, index) => (
                            <button
                              key={`${movie.title}-${index}`}
                              onClick={() =>
                                browseSimilarMovie(movie.title)
                              }
                              className="group text-left bg-white border border-[#064A25]/10 rounded-[1.75rem] p-6 hover:-translate-y-1 hover:shadow-xl hover:border-[#064A25]/25 transition-all"
                            >

                              {/* TOP */}

                              <div className="flex items-start justify-between gap-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-11 h-11 rounded-xl bg-[#064A25] text-[#C2FF38] flex items-center justify-center font-black">
                                    {index + 1}
                                  </div>

                                  <div>

                                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#064A25]">
                                      {movie.title}
                                    </h3>

                                    <p className="text-sm text-[#064A25]/45 mt-1">
                                      {movie.release_year || 'Year N/A'}
                                    </p>

                                  </div>

                                </div>

                                <ArrowRight className="w-5 h-5 text-[#064A25]/30 group-hover:text-[#064A25] group-hover:translate-x-1 transition-all shrink-0" />

                              </div>

                              {/* SIMILARITY */}

                              <div className="mt-6">

                                <div className="flex items-center justify-between mb-2">

                                  <span className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40">
                                    Similarity
                                  </span>

                                  <span className="text-sm font-black">
                                    {movie.score?.toFixed(1)}%
                                  </span>

                                </div>

                                <div className="h-2 bg-[#064A25]/10 rounded-full overflow-hidden">

                                  <div
                                    className="h-full bg-[#C2FF38] rounded-full transition-all"
                                    style={{
                                      width: getSimilarityWidth(movie.score),
                                    }}
                                  />

                                </div>

                              </div>

                              {/* GENRE */}

                              <div className="mt-5">

                                <p className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40 mb-2">
                                  Genre
                                </p>

                                <div className="flex flex-wrap gap-2">

                                  {movie.shared_genres?.length > 0 ? (
                                    movie.shared_genres.map((genre) => (
                                      <span
                                        key={genre}
                                        className="px-2.5 py-1 rounded-lg bg-[#064A25]/5 text-xs font-medium"
                                      >
                                        {genre}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-[#064A25]/40">
                                      No shared genre detected
                                    </span>
                                  )}

                                </div>

                              </div>

                              {/* PEOPLE */}

                              <div className="mt-5">

                                <p className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40 mb-2">
                                  Shared People
                                </p>

                                {movie.shared_people?.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">

                                    {movie.shared_people
                                      .slice(0, 4)
                                      .map((person) => (
                                        <span
                                          key={person}
                                          className="px-2.5 py-1 rounded-lg bg-[#C2FF38]/30 text-[#064A25] text-xs font-medium"
                                        >
                                          {person}
                                        </span>
                                      ))}

                                    {movie.shared_people.length > 4 && (
                                      <span className="px-2.5 py-1 rounded-lg bg-[#064A25]/5 text-xs font-medium">
                                        +{movie.shared_people.length - 4}
                                      </span>
                                    )}

                                  </div>
                                ) : (
                                  <span className="text-sm text-[#064A25]/40">
                                    No shared people detected
                                  </span>
                                )}

                              </div>

                              {/* BROWSE */}

                              <div className="mt-6 pt-4 border-t border-[#064A25]/10 flex items-center justify-between">

                                <span className="text-sm font-semibold text-[#064A25]/60">
                                  Browse this movie
                                </span>

                                <span className="text-xs text-[#064A25]/40">
                                  Click card
                                </span>

                              </div>

                            </button>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="bg-white rounded-[2rem] border border-[#064A25]/10 p-12 text-center">

                        <div className="w-16 h-16 rounded-2xl bg-[#064A25]/5 flex items-center justify-center mx-auto mb-4">
                          <Film className="w-7 h-7 text-[#064A25]/30" />
                        </div>

                        <h3 className="font-bold text-lg">
                          No similar movies found
                        </h3>

                        <p className="text-sm text-[#064A25]/50 mt-2">
                          The similarity engine did not find matching movies
                          in the dataset.
                        </p>

                      </div>
                    )}

                  </div>
                )}

              </>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-[#064A25]/10 rounded-2xl p-5">

      <div className="w-10 h-10 rounded-xl bg-[#064A25]/5 flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40">
        {label}
      </p>

      <p className="text-xl font-black mt-1 break-words">
        {value || 'N/A'}
      </p>

    </div>
  );
}

function PredictionCard({
  icon,
  label,
  value,
  description,
  valueClass = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border border-[#064A25]/10 rounded-2xl p-5">

      <div className="w-10 h-10 rounded-xl bg-[#064A25]/5 flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40">
        {label}
      </p>

      <div className="mt-2">

        {valueClass ? (
          <span
            className={`inline-flex px-3 py-1.5 rounded-lg font-black text-sm ${valueClass}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-xl font-black break-words">
            {value}
          </p>
        )}

      </div>

      <p className="text-xs text-[#064A25]/40 mt-3">
        {description}
      </p>

    </div>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-xs font-bold uppercase tracking-wider text-[#064A25]/40">
        {label}
      </p>

      <p className="font-bold mt-1 break-words">
        {value || 'N/A'}
      </p>

    </div>
  );
}