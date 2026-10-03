'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

import {
  Tv,
  Star,
  UserCheck,
  ArrowLeft,
  Activity,
  Layers,
  LayoutDashboard,
  Home,
  Database,
  Brain,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Search,
  Sparkles,
  Award,
  ArrowUpRight,
  Users,
} from 'lucide-react';

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

/* =========================================================
   TYPES
========================================================= */

interface GenreData {
  name: string;
  value: number;
}

interface SuccessTier {
  name: string;
  value: number;
  label: string;
}

interface TopRating {
  name: string;
  rating: number;
  genre?: string;
}

interface RevenueData {
  name: string;
  actual: number | null;
  predicted: number | null;
}

interface ClusterData {
  x: number;
  y: number;
  name?: string;
  cluster?: string | number;
}

interface ProfitabilityData {
  profitable: number;
  not_profitable: number;
}

interface OverviewData {
  total_movies: number;
  valid_scores?: number;
  valid_revenue?: number;
  valid_budget?: number;
}

interface ModelStatus {
  regression?: boolean;
  classification?: boolean;
  svm?: boolean;
  unsupervised?: boolean;
}

interface SimilarMovie {
  title: string;
  genre: string;
  score: number;
  shared_genres: string[];
  shared_people: string[];
  release_year: number | null;
  rating: number | null;
}

interface SearchMoviePrediction {
  multivariate_linear_regression_revenue: string;
  random_forest_success_tier: string;
  svm_profitability_probability: string;
  market_cluster_id: number;
  similar_movies: SimilarMovie[];
}

interface SearchMovieResult {
  movie_title: string;
  release_year: number | null;
  genre: string;
  actual_budget: string;
  actual_revenue: string;
  score: number;
  ml_predictions: SearchMoviePrediction;
}

interface DashboardData {
  status?: string;

  overview?: OverviewData;

  genres?: GenreData[];

  success_tiers?: SuccessTier[];

  top_ratings?: TopRating[];

  revenue?: RevenueData[];

  profitability?: ProfitabilityData;

  clusters?: ClusterData[];

  models?: ModelStatus;
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  darkGreen: '#064A25',
  green: '#0B6736',
  mediumGreen: '#3E8B3A',
  lime: '#C2FF38',
  lightLime: '#EAF7C8',
  paleGreen: '#D9F59A',
  gray: '#DDE0DA',
  background: '#F4F7F2',
  textGray: '#6B7280',
};

/* =========================================================
   SIMULATION DATA
   Used ONLY when FastAPI has no usable data.
========================================================= */

const SIMULATED_GENRES: GenreData[] = [
  { name: 'Drama', value: 921 },
  { name: 'Comedy', value: 809 },
  { name: 'Action', value: 759 },
  { name: 'Thriller', value: 685 },
  { name: 'Adventure', value: 603 },
  { name: 'Romance', value: 370 },
  { name: 'Horror', value: 368 },
  { name: 'Fantasy', value: 366 },
  { name: 'Crime', value: 353 },
  { name: 'Science Fiction', value: 336 },
];

const SIMULATED_SUCCESS_TIERS: SuccessTier[] = [
  {
    name: 'Blockbuster',
    value: 1000,
    label: 'High',
  },
  {
    name: 'Average Hit',
    value: 850,
    label: 'Moderate',
  },
  {
    name: 'Flop',
    value: 557,
    label: 'Low',
  },
];

const SIMULATED_TOP_RATINGS: TopRating[] = [
  {
    name: 'The Godfather',
    rating: 9.2,
    genre: 'Drama, Crime',
  },
  {
    name: 'Cuando Sea Joven',
    rating: 9.1,
    genre: 'Comedy, Fantasy',
  },
  {
    name: 'The Dark Knight',
    rating: 9.0,
    genre: 'Drama, Action, Crime',
  },
  {
    name: 'GoodFellas',
    rating: 8.9,
    genre: 'Drama, Crime',
  },
  {
    name: 'The Lord of the Rings',
    rating: 8.8,
    genre: 'Adventure, Fantasy',
  },
];

const SIMULATED_REVENUE: RevenueData[] = [
  {
    name: 'Movie 1',
    actual: 145,
    predicted: 152,
  },
  {
    name: 'Movie 2',
    actual: 210,
    predicted: 198,
  },
  {
    name: 'Movie 3',
    actual: 175,
    predicted: 184,
  },
  {
    name: 'Movie 4',
    actual: 260,
    predicted: 245,
  },
  {
    name: 'Movie 5',
    actual: 320,
    predicted: 305,
  },
  {
    name: 'Movie 6',
    actual: 285,
    predicted: 298,
  },
  {
    name: 'Movie 7',
    actual: 390,
    predicted: 365,
  },
  {
    name: 'Movie 8',
    actual: 430,
    predicted: 445,
  },
  {
    name: 'Movie 9',
    actual: 510,
    predicted: 485,
  },
  {
    name: 'Movie 10',
    actual: 470,
    predicted: 495,
  },
];

const SIMULATED_PROFITABILITY: ProfitabilityData = {
  profitable: 68,
  not_profitable: 32,
};

const SIMULATED_CLUSTERS: ClusterData[] = [
  {
    x: -2.4,
    y: 1.8,
    name: 'Movie 1',
    cluster: 0,
  },
  {
    x: -1.8,
    y: 2.3,
    name: 'Movie 2',
    cluster: 0,
  },
  {
    x: -1.2,
    y: 1.4,
    name: 'Movie 3',
    cluster: 0,
  },
  {
    x: -0.8,
    y: 2.1,
    name: 'Movie 4',
    cluster: 0,
  },

  {
    x: 0.4,
    y: -1.2,
    name: 'Movie 5',
    cluster: 1,
  },
  {
    x: 1.1,
    y: -0.8,
    name: 'Movie 6',
    cluster: 1,
  },
  {
    x: 1.7,
    y: -1.5,
    name: 'Movie 7',
    cluster: 1,
  },
  {
    x: 2.2,
    y: -0.4,
    name: 'Movie 8',
    cluster: 1,
  },

  {
    x: 2.8,
    y: 2.1,
    name: 'Movie 9',
    cluster: 2,
  },
  {
    x: 3.4,
    y: 1.5,
    name: 'Movie 10',
    cluster: 2,
  },
  {
    x: 3.8,
    y: 2.6,
    name: 'Movie 11',
    cluster: 2,
  },
  {
    x: 4.2,
    y: 1.9,
    name: 'Movie 12',
    cluster: 2,
  },

  {
    x: -3.2,
    y: -1.8,
    name: 'Movie 13',
    cluster: 3,
  },
  {
    x: -2.6,
    y: -2.4,
    name: 'Movie 14',
    cluster: 3,
  },
  {
    x: -1.9,
    y: -1.9,
    name: 'Movie 15',
    cluster: 3,
  },
];

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subValue: string;
  trend?: string;
  icon: any;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#DDE0DA] flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-gray-500 text-sm font-medium">
          {title}
        </span>

        <div className="p-2 rounded-lg bg-[#064A25] text-white">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {value}
          </h2>

          <span className="text-xs text-gray-400">
            {subValue}
          </span>
        </div>

        {trend && (
          <span className="text-sm font-bold text-[#064A25]">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SIMULATED BADGE
========================================================= */

function SimulatedBadge() {
  return (
    <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#FFF3CD] text-[#8A6500]">
      SIMULATED
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />

        <p className="text-sm text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [apiConnected, setApiConnected] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     MOVIE SEARCH / DISCOVERY
  ======================================================= */

  const [movieQuery, setMovieQuery] = useState('');
  const [movieResults, setMovieResults] = useState<SearchMovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<SearchMovieResult | null>(null);
  const [movieSearching, setMovieSearching] = useState(false);
  const [movieSearchError, setMovieSearchError] = useState<string | null>(null);

  /* =======================================================
     MOVIE SEARCH
  ======================================================= */

  const searchMovie = async (searchQuery?: string) => {
    const trimmedQuery = (searchQuery ?? movieQuery).trim();

    if (!trimmedQuery) {
      setMovieSearchError('Enter a movie title to search.');
      setMovieResults([]);
      setSelectedMovie(null);
      return;
    }

    try {
      setMovieSearching(true);
      setMovieSearchError(null);

      const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(trimmedQuery)}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.detail || `Search failed with HTTP ${response.status}`
        );
      }

      const results: SearchMovieResult[] = Array.isArray(payload?.results)
        ? payload.results
        : [];

      setMovieResults(results);
      setSelectedMovie(results[0] || null);

      if (!results.length) {
        setMovieSearchError(`No movies found matching "${trimmedQuery}".`);
      }
    } catch (err) {
      console.error('Movie search error:', err);
      setMovieResults([]);
      setSelectedMovie(null);
      setMovieSearchError(
        err instanceof Error ? err.message : 'Unable to search movies.'
      );
    } finally {
      setMovieSearching(false);
    }
  };

  const browseSimilarMovie = async (movieTitle: string) => {
    setMovieQuery(movieTitle);
    await searchMovie(movieTitle);
  };

  /* =======================================================
     FETCH API
  ======================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/dashboard`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const contentType =
        response.headers.get(
          'content-type'
        ) || '';

      let payload: any;

      if (
        contentType.includes(
          'application/json'
        )
      ) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }

      if (!response.ok) {
        const detail =
          typeof payload === 'object'
            ? payload?.detail
            : payload;

        throw new Error(
          detail ||
            `FastAPI returned HTTP ${response.status}`
        );
      }

      if (!payload) {
        throw new Error(
          'FastAPI returned an empty response.'
        );
      }

      console.log(
        'FastAPI dashboard:',
        payload
      );

      setDashboardData(payload);
      setApiConnected(true);
    } catch (err) {
      console.error(
        'Dashboard API error:',
        err
      );

      setApiConnected(false);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to FastAPI'
      );

      /*
       * Keep dashboard usable even if
       * FastAPI itself is unavailable.
       */
      setDashboardData({
        overview: {
          total_movies: 2407,
          valid_scores: 2407,
          valid_revenue: 2407,
          valid_budget: 2407,
        },
        genres: SIMULATED_GENRES,
        success_tiers:
          SIMULATED_SUCCESS_TIERS,
        top_ratings:
          SIMULATED_TOP_RATINGS,
        revenue: SIMULATED_REVENUE,
        profitability:
          SIMULATED_PROFITABILITY,
        clusters:
          SIMULATED_CLUSTERS,
        models: {
          regression: true,
          classification: true,
          svm: true,
          unsupervised: true,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =======================================================
     OVERVIEW
  ======================================================= */

  const overview =
    dashboardData?.overview || {
      total_movies: 0,
      valid_scores: 0,
      valid_revenue: 0,
      valid_budget: 0,
    };

  /* =======================================================
     GENRES
  ======================================================= */

  const apiGenres =
    dashboardData?.genres || [];

  const hasGenreData =
    apiGenres.length > 0 &&
    apiGenres.some(
      (item: any) =>
        Number(item?.value || 0) > 0
    );

  const genreData: GenreData[] =
    hasGenreData
      ? apiGenres.map((item: any) => ({
          name: String(
            item?.name ?? ''
          ),
          value: Number(
            item?.value ?? 0
          ),
        }))
      : SIMULATED_GENRES;

  const genresSimulated =
    !hasGenreData;

  /* =======================================================
     SUCCESS TIERS
  ======================================================= */

  const apiSuccessTiers =
    dashboardData?.success_tiers || [];

  const hasSuccessData =
    apiSuccessTiers.length > 0 &&
    apiSuccessTiers.some(
      (item: any) =>
        Number(item?.value || 0) > 0
    );

  const successTierData: SuccessTier[] =
    hasSuccessData
      ? apiSuccessTiers.map(
          (item: any) => ({
            name: String(
              item?.name ?? ''
            ),
            value: Number(
              item?.value ?? 0
            ),
            label: String(
              item?.label ?? ''
            ),
          })
        )
      : SIMULATED_SUCCESS_TIERS;

  const successSimulated =
    !hasSuccessData;

  /* =======================================================
     TOP RATINGS
  ======================================================= */

  const apiTopRatings =
    dashboardData?.top_ratings || [];

  const hasTopRatingData =
    apiTopRatings.length > 0;

  const topRatings: TopRating[] =
    hasTopRatingData
      ? apiTopRatings
          .slice(0, 5)
          .map((item: any) => ({
            name: String(
              item?.name ?? 'Unknown'
            ),
            rating: Number(
              item?.rating ?? 0
            ),
            genre: item?.genre
              ? String(item.genre)
              : 'IMDb Movie',
          }))
      : SIMULATED_TOP_RATINGS;

  /* =======================================================
     REVENUE
  ======================================================= */

  const apiRevenue =
    dashboardData?.revenue || [];

  const hasRevenueData =
    apiRevenue.length > 0 &&
    apiRevenue.some(
      (item: any) =>
        item?.actual != null ||
        item?.predicted != null
    );

  const revenueData: RevenueData[] =
    hasRevenueData
      ? apiRevenue.map(
          (item: any) => ({
            name: String(
              item?.name ?? ''
            ),
            actual:
              item?.actual != null
                ? Number(item.actual)
                : null,
            predicted:
              item?.predicted != null
                ? Number(item.predicted)
                : null,
          })
        )
      : SIMULATED_REVENUE;

  const revenueSimulated =
    !hasRevenueData;

  /* =======================================================
     PROFITABILITY
  ======================================================= */

  const apiProfitability =
    dashboardData?.profitability;

  const hasProfitabilityData =
    apiProfitability &&
    (
      Number(
        apiProfitability.profitable || 0
      ) > 0 ||
      Number(
        apiProfitability.not_profitable ||
          0
      ) > 0
    );

  const profitability: ProfitabilityData =
    hasProfitabilityData
      ? {
          profitable: Number(
            apiProfitability?.profitable ||
              0
          ),
          not_profitable: Number(
            apiProfitability?.not_profitable ||
              0
          ),
        }
      : SIMULATED_PROFITABILITY;

  const profitabilitySimulated =
    !hasProfitabilityData;

  /* =======================================================
     CLUSTERS
  ======================================================= */

  const apiClusters =
    dashboardData?.clusters || [];

  const hasClusterData =
    apiClusters.length > 0;

  const clusterData: ClusterData[] =
    hasClusterData
      ? apiClusters.map(
          (item: any) => ({
            x: Number(item?.x || 0),
            y: Number(item?.y || 0),
            name: String(
              item?.name ?? ''
            ),
            cluster:
              item?.cluster,
          })
        )
      : SIMULATED_CLUSTERS;

  const clustersSimulated =
    !hasClusterData;

  /* =======================================================
     MODELS
  ======================================================= */

  const models =
    dashboardData?.models || {};

  const modelCount = [
    models.regression,
    models.classification,
    models.svm,
    models.unsupervised,
  ].filter(Boolean).length;

  /* =======================================================
     SUCCESS TOTAL
  ======================================================= */

  const successTotal = useMemo(() => {
    return successTierData.reduce(
      (sum, item) =>
        sum + Number(item.value || 0),
      0
    );
  }, [successTierData]);

  /* =======================================================
     SUCCESS PERCENTAGES

     Supports:
     Blockbuster / Average Hit / Flop
     AND
     High / Moderate / Low
  ======================================================= */

  const successPercentages =
    useMemo(() => {
      if (!successTotal) {
        return {
          high: 0,
          moderate: 0,
          low: 0,
        };
      }

      const high =
        successTierData.find(
          (x) => {
            const name =
              x.name.toLowerCase();

            return (
              name.includes(
                'blockbuster'
              ) ||
              name.includes('high')
            );
          }
        )?.value || 0;

      const moderate =
        successTierData.find(
          (x) => {
            const name =
              x.name.toLowerCase();

            return (
              name.includes(
                'average'
              ) ||
              name.includes(
                'moderate'
              ) ||
              name.includes('medium')
            );
          }
        )?.value || 0;

      const low =
        successTierData.find(
          (x) => {
            const name =
              x.name.toLowerCase();

            return (
              name.includes('flop') ||
              name.includes('low')
            );
          }
        )?.value || 0;

      return {
        high:
          (high / successTotal) *
          100,

        moderate:
          (moderate / successTotal) *
          100,

        low:
          (low / successTotal) *
          100,
      };
    }, [
      successTierData,
      successTotal,
    ]);

  /* =======================================================
     PROFITABILITY PIE
  ======================================================= */

  const profitabilityData = [
    {
      name: 'Profitable',
      value: Number(
        profitability.profitable
      ),
    },
    {
      name: 'Not Profitable',
      value: Number(
        profitability.not_profitable
      ),
    },
  ];

  /* =======================================================
     GENRE COLORS
  ======================================================= */

  const genreColors = [
    '#064A25',
    '#C2FF38',
    '#3E8B3A',
    '#D9F59A',
    '#438E43',
    '#A9D52F',
    '#79A91F',
  ];

  /* =======================================================
     GENRE INTENSITY
  ======================================================= */

  const genreIntensity =
    useMemo(() => {
      if (!genreData.length) {
        return [];
      }

      const values =
        genreData.map(
          (genre) =>
            Number(genre.value) || 0
        );

      const maxValue =
        Math.max(...values);

      const minValue =
        Math.min(...values);

      return genreData.map(
        (genre) => {
          const value =
            Number(genre.value) || 0;

          const normalized =
            maxValue === minValue
              ? 1
              : (value - minValue) /
                (maxValue - minValue);

          const index = Math.min(
            genreColors.length - 1,
            Math.floor(
              normalized *
                genreColors.length
            )
          );

          return {
            ...genre,
            color:
              genreColors[index],
          };
        }
      );
    }, [genreData]);

  /* =======================================================
     SUCCESS PILLS
  ======================================================= */

  const successPills =
    useMemo(() => {
      const result: {
        color: string;
        tier: string;
      }[] = [];

      successTierData.forEach(
        (tier) => {
          const percentage =
            successTotal > 0
              ? tier.value /
                successTotal
              : 0;

          const count = Math.max(
            1,
            Math.round(
              percentage * 21
            )
          );

          let color =
            'bg-[#DDE0DA]';

          const name =
            tier.name.toLowerCase();

          if (
            name.includes(
              'blockbuster'
            ) ||
            name.includes('high')
          ) {
            color =
              'bg-[#064A25]';
          } else if (
            name.includes(
              'average'
            ) ||
            name.includes(
              'moderate'
            )
          ) {
            color =
              'bg-[#C2FF38]';
          }

          for (
            let i = 0;
            i < count;
            i++
          ) {
            result.push({
              color,
              tier: tier.name,
            });
          }
        }
      );

      return result.slice(0, 21);
    }, [
      successTierData,
      successTotal,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F7F2] p-6 md:p-10 font-sans ml-20 md:ml-24">

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
              className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10"
            >
              <Home className="w-5 h-5" />
            </Link>

            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#C2FF38] text-[#064A25]">
              <LayoutDashboard className="w-5 h-5" />
            </div>

            <Link
              href="/search"
              className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
              title="Movie Search"
            >
              <Search className="w-5 h-5" />
            </Link>

          </nav>
        </aside>

        <div className="max-w-7xl mx-auto">

          <div className="flex items-center gap-4 mb-8">

            <div className="p-2 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5 text-[#064A25]" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-[#064A25]">
                Model & Dataset Analytics Dashboard
              </h1>

              <p className="text-xs text-gray-400 mt-1">
                Loading analytics from FastAPI...
              </p>

            </div>

          </div>

          <div className="bg-white rounded-2xl border border-[#DDE0DA] min-h-[500px] flex items-center justify-center">

            <div className="text-center">

              <RefreshCw className="w-10 h-10 text-[#064A25] animate-spin mx-auto mb-4" />

              <h2 className="text-lg font-bold text-[#064A25]">
                Loading Dashboard
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Fetching data from FastAPI...
              </p>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F4F7F2] p-6 md:p-10 font-sans ml-20 md:ml-24">

      {/* ===================================================
          SIDEBAR
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
            className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#C2FF38] text-[#064A25] hover:scale-105 transition-all"
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>

          <Link
            href="/search"
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
            title="Movie Search"
          >
            <Search className="w-5 h-5" />
          </Link>

        </nav>

      </aside>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div className="flex items-center space-x-4">

            <Link
              href="/"
              className="p-2 bg-white rounded-full shadow-sm hover:bg-[#DDE0DA] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#064A25]" />
            </Link>

            <div>

              <h1 className="text-2xl font-bold text-[#064A25]">
                Model & Dataset Analytics Dashboard
              </h1>

              <p className="text-xs text-gray-400 mt-1">
                Live analytics generated from the FastAPI ML backend
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 ${
                apiConnected
                  ? 'bg-[#C2FF38] text-[#064A25]'
                  : 'bg-red-100 text-red-600'
              }`}
            >

              <span
                className={`w-2 h-2 rounded-full ${
                  apiConnected
                    ? 'bg-[#064A25]'
                    : 'bg-red-500'
                }`}
              />

              {apiConnected
                ? 'Live FastAPI Connected'
                : 'FastAPI Offline'}

            </span>

            <button
              onClick={loadDashboard}
              className="p-2 bg-white border border-[#DDE0DA] rounded-xl text-[#064A25] hover:bg-[#EAF7C8] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">

            <AlertCircle className="w-5 h-5 text-red-500" />

            <div className="flex-1">

              <p className="text-sm font-bold text-red-700">
                FastAPI connection issue
              </p>

              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>

            </div>

            <button
              onClick={loadDashboard}
              className="px-3 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-600"
            >
              Retry
            </button>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <StatCard
            title="Dataset Size"
            value={Number(
              overview.total_movies || 0
            ).toLocaleString()}
            subValue="Cleaned IMDb Movies"
            trend={
              apiConnected
                ? 'LIVE'
                : 'DEMO'
            }
            icon={Tv}
          />

          <StatCard
            title="Models Loaded"
            value={modelCount}
            subValue="ML Models Available"
            trend={
              apiConnected
                ? 'LIVE'
                : 'DEMO'
            }
            icon={Brain}
          />

          {/* SUCCESS DISTRIBUTION */}

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#DDE0DA] col-span-1 md:col-span-2 min-h-[128px]">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-gray-500 text-sm font-medium">
                  Success Tiers Distribution
                </p>

                <div className="flex gap-8 mt-4">

                  {successTierData
                    .slice(0, 3)
                    .map((tier) => (
                      <div
                        key={tier.name}
                      >

                        <span className="text-2xl font-bold text-[#064A25]">
                          {Number(
                            tier.value
                          ).toLocaleString()}
                        </span>

                        <p className="text-xs text-gray-400">
                          {tier.name}
                        </p>

                      </div>
                    ))}

                </div>

              </div>

              {successSimulated && (
                <SimulatedBadge />
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          {/* =================================================
              GENRE CHART
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] md:col-span-2 min-h-[345px]">

            <div className="flex justify-between">

              <div>

                <h3 className="text-gray-500 text-sm mb-1">
                  Shows by Primary Genre
                </h3>

                <h2 className="text-xl font-bold text-[#064A25]">
                  Track primary genre distribution across dataset
                </h2>

              </div>

              {genresSimulated && (
                <SimulatedBadge />
              )}

            </div>

            <div className="h-60 mt-5">

              {genreData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={genreData}
                    barSize={32}
                  >

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#6B7280',
                        fontSize: 11,
                      }}
                      dy={10}
                    />

                    <YAxis
                      type="number"
                      domain={[0, 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#9CA3AF',
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: 'transparent',
                      }}
                      formatter={(
                        value: any
                      ) => [
                        Number(
                          value
                        ).toLocaleString(),
                        'Movies',
                      ]}
                      contentStyle={{
                        borderRadius:
                          '8px',
                        border: 'none',
                        boxShadow:
                          '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />

                    <Bar
                      dataKey="value"
                      radius={[
                        20,
                        20,
                        20,
                        20,
                      ]}
                    >

                      {genreData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`genre-${index}`}
                            fill={
                              genreColors[
                                index %
                                  genreColors.length
                              ]
                            }
                          />
                        )
                      )}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No genre data" />
              )}

            </div>

          </div>

          {/* =================================================
              SUCCESS GAUGE
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] md:col-span-1 min-h-[345px] flex flex-col">

            <div className="flex justify-between">

              <div>

                <h3 className="text-gray-500 text-sm">
                  Agreement Tracker
                </h3>

                <h2 className="text-lg font-bold text-[#064A25] mt-1">
                  Success Status
                </h2>

              </div>

              {successSimulated ? (
                <SimulatedBadge />
              ) : (
                <span className="text-xs text-[#064A25] font-medium">
                  Active
                </span>
              )}

            </div>

            <div className="flex-1 flex items-center justify-center">

              <div className="relative w-48 h-32 overflow-hidden">

                <div
                  className="
                    absolute
                    top-0
                    left-0
                    w-48
                    h-48
                    rounded-full
                    border-[24px]
                    border-[#DDE0DA]
                    border-t-[#064A25]
                    border-l-[#064A25]
                    border-r-[#C2FF38]
                    transform
                    -rotate-45
                  "
                />

                <div className="absolute left-0 right-0 bottom-0 text-center">

                  <span className="text-3xl font-extrabold text-[#064A25]">
                    {successTotal.toLocaleString()}
                  </span>

                  <p className="text-xs text-gray-400">
                    Total Analyzed
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-[#DDE0DA]">

              <div>

                <span className="block w-2 h-2 rounded-full bg-[#064A25] mx-auto mb-1" />

                <p className="text-xs font-bold text-[#064A25]">
                  {successPercentages.high.toFixed(
                    1
                  )}
                  %
                </p>

                <span className="text-[10px] text-gray-400">
                  High
                </span>

              </div>

              <div>

                <span className="block w-2 h-2 rounded-full bg-[#C2FF38] mx-auto mb-1" />

                <p className="text-xs font-bold text-[#064A25]">
                  {successPercentages.moderate.toFixed(
                    1
                  )}
                  %
                </p>

                <span className="text-[10px] text-gray-400">
                  Mod
                </span>

              </div>

              <div>

                <span className="block w-2 h-2 rounded-full bg-[#DDE0DA] mx-auto mb-1" />

                <p className="text-xs font-bold text-[#064A25]">
                  {successPercentages.low.toFixed(
                    1
                  )}
                  %
                </p>

                <span className="text-[10px] text-gray-400">
                  Low
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              TOP 5
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] md:col-span-1 min-h-[345px]">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="text-gray-500 text-sm">
                  Top Prediction Results
                </h3>

                <h2 className="text-lg font-bold text-[#064A25] mt-1">
                  Top 5 IMDb Ratings
                </h2>

              </div>

              {!hasTopRatingData && (
                <SimulatedBadge />
              )}

            </div>

            <div className="mt-5 space-y-4">

              {topRatings.map(
                (movie, index) => (
                  <div
                    key={`${movie.name}-${index}`}
                    className="flex items-center justify-between gap-2"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-9 h-9 shrink-0 rounded-full bg-[#EAF7C8] flex items-center justify-center text-sm font-bold text-[#064A25]">
                        {movie.name?.[0] ||
                          '?'}
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-bold text-[#064A25] truncate">
                          {movie.name}
                        </p>

                        <p className="text-[10px] text-gray-400 truncate">
                          {movie.genre ||
                            'IMDb Movie'}
                        </p>

                      </div>

                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-sm font-bold bg-[#EAF7C8] px-2 py-1 rounded-lg text-[#064A25]">

                      <Star className="w-3 h-3 fill-[#C2FF38] text-[#064A25]" />

                      {Number(
                        movie.rating
                      ).toFixed(1)}

                    </div>

                  </div>
                )
              )}

            </div>

            <div className="mt-6 pt-4 border-t border-[#DDE0DA] flex justify-between text-xs">

              <span className="text-gray-400">
                Valid ratings
              </span>

              <span className="font-bold text-[#064A25]">
                {Number(
                  overview.valid_scores ||
                    0
                ).toLocaleString()}
              </span>

            </div>

          </div>

          {/* =================================================
              SUCCESS + GENRE INTENSITY
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] md:col-span-3 min-h-[320px]">

            <div className="flex justify-between items-start">

              <div>

                <h3 className="text-gray-500 text-sm">
                  Dataset distribution
                </h3>

                <h2 className="text-xl font-bold text-[#064A25] mt-1">
                  Success Tiers & Genre Intensity
                </h2>

              </div>

              <span className="text-xs text-gray-400">
                {successTotal.toLocaleString()}{' '}
                analyzed
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F4F7F2] p-5 rounded-xl border border-[#DDE0DA] mt-6">

              {/* SUCCESS */}

              <div>

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <p className="text-xs font-semibold text-[#064A25]">
                      Success Distribution
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Model classification tiers
                    </p>

                  </div>

                  {successSimulated && (
                    <SimulatedBadge />
                  )}

                </div>

                <div className="flex items-end justify-center gap-2 h-28">

                  {successPills.length >
                  0 ? (
                    successPills.map(
                      (
                        pill,
                        index
                      ) => (
                        <div
                          key={index}
                          className={`w-3 h-24 rounded-full ${pill.color}`}
                          title={
                            pill.tier
                          }
                        />
                      )
                    )
                  ) : (
                    <div className="text-xs text-gray-400">
                      No data
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">

                  {successTierData
                    .slice(0, 3)
                    .map(
                      (tier) => (
                        <div
                          key={
                            tier.name
                          }
                          className="text-center"
                        >

                          <p className="text-xs font-bold text-[#064A25]">
                            {
                              tier.name
                            }
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {
                              tier.label
                            }
                          </p>

                          <p className="text-sm font-bold text-[#064A25] mt-1">
                            {Number(
                              tier.value
                            ).toLocaleString()}
                          </p>

                        </div>
                      )
                    )}

                </div>

              </div>

              {/* GENRE INTENSITY */}

              <div>

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-xs font-semibold text-[#064A25]">
                      Primary Genre Distribution
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Intensity based on genre values
                    </p>

                  </div>

                  {genresSimulated && (
                    <SimulatedBadge />
                  )}

                </div>

                <div className="grid grid-cols-5 gap-2 mt-5">

                  {genreIntensity
                    .slice(0, 10)
                    .map(
                      (
                        genre,
                        index
                      ) => (
                        <div
                          key={`${genre.name}-${index}`}
                          className="h-9 rounded-lg"
                          style={{
                            backgroundColor:
                              genre.color,
                          }}
                          title={`${genre.name}: ${genre.value}`}
                        />
                      )
                    )}

                </div>

                <div className="grid grid-cols-5 gap-2 text-[9px] text-gray-400 text-center mt-2">

                  {genreData
                    .slice(0, 5)
                    .map(
                      (genre) => (
                        <span
                          key={
                            genre.name
                          }
                          className="truncate"
                        >
                          {
                            genre.name
                          }
                        </span>
                      )
                    )}

                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-5">

                  {genreData.map(
                    (
                      genre,
                      index
                    ) => (
                      <div
                        key={
                          genre.name
                        }
                        className="flex items-center gap-1.5"
                      >

                        <span
                          className="w-2 h-2 rounded-sm"
                          style={{
                            backgroundColor:
                              genreColors[
                                index %
                                  genreColors.length
                              ],
                          }}
                        />

                        <span className="text-[9px] text-gray-500">
                          {
                            genre.name
                          }{' '}
                          {genre.value}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MODEL GRAPHS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* =================================================
              REVENUE
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] min-h-[300px]">

            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-gray-500 text-sm">
                  Regression Model
                </h3>

                <h2 className="text-lg font-bold text-[#064A25]">
                  Revenue Forecast
                </h2>

              </div>

              <div className="flex items-center gap-2">

                {revenueSimulated && (
                  <SimulatedBadge />
                )}

                <div className="p-2 rounded-lg bg-[#064A25] text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>

              </div>

            </div>

            <div className="h-52">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={revenueData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="name"
                    hide
                  />

                  <YAxis
                    tick={{
                      fill: '#9CA3AF',
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#064A25"
                    strokeWidth={2}
                    dot={false}
                    name="Actual"
                  />

                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#A8D82A"
                    strokeWidth={2}
                    dot={false}
                    name="Predicted"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* =================================================
              PROFITABILITY
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] min-h-[300px]">

            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-gray-500 text-sm">
                  SVM Model
                </h3>

                <h2 className="text-lg font-bold text-[#064A25]">
                  Profitability
                </h2>

              </div>

              <div className="flex items-center gap-2">

                {profitabilitySimulated && (
                  <SimulatedBadge />
                )}

                <div className="p-2 rounded-lg bg-[#064A25] text-white">
                  <Activity className="w-4 h-4" />
                </div>

              </div>

            </div>

            <div className="h-52">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={
                      profitabilityData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                  >

                    <Cell
                      fill="#064A25"
                    />

                    <Cell
                      fill="#DDE0DA"
                    />

                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={30}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* =================================================
              PCA + GMM
          ================================================= */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA] min-h-[300px]">

            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-gray-500 text-sm">
                  PCA + GMM Model
                </h3>

                <h2 className="text-lg font-bold text-[#064A25]">
                  Market Clusters
                </h2>

              </div>

              <div className="flex items-center gap-2">

                {clustersSimulated && (
                  <SimulatedBadge />
                )}

                <div className="p-2 rounded-lg bg-[#064A25] text-white">
                  <Layers className="w-4 h-4" />
                </div>

              </div>

            </div>

            <div className="h-52">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <ScatterChart>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    type="number"
                    dataKey="x"
                    tick={{
                      fill: '#9CA3AF',
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="number"
                    dataKey="y"
                    tick={{
                      fill: '#9CA3AF',
                      fontSize: 9,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Scatter
                    name="Market Clusters"
                    data={
                      clusterData
                    }
                    fill="#064A25"
                  />

                </ScatterChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* =================================================
            MODEL STATUS
        ================================================= */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA]">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="text-gray-500 text-sm">
                Machine Learning Pipeline
              </h3>

              <h2 className="text-xl font-bold text-[#064A25]">
                Model Status
              </h2>

            </div>

            <span className="text-xs bg-[#EAF7C8] text-[#064A25] font-bold px-3 py-1.5 rounded-full">
              {modelCount}/4 Models Loaded
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* REGRESSION */}

            <div className="border border-[#DDE0DA] rounded-xl p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-[#EAF7C8] rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#064A25]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#064A25]">
                    Regression
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Revenue Prediction
                  </p>

                </div>

              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  models.regression
                    ? 'bg-[#064A25]'
                    : 'bg-red-400'
                }`}
              />

            </div>

            {/* CLASSIFICATION */}

            <div className="border border-[#DDE0DA] rounded-xl p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-[#EAF7C8] rounded-lg">
                  <Brain className="w-4 h-4 text-[#064A25]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#064A25]">
                    Classification
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Success Tiers
                  </p>

                </div>

              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  models.classification
                    ? 'bg-[#064A25]'
                    : 'bg-red-400'
                }`}
              />

            </div>

            {/* SVM */}

            <div className="border border-[#DDE0DA] rounded-xl p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-[#EAF7C8] rounded-lg">
                  <Activity className="w-4 h-4 text-[#064A25]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#064A25]">
                    SVM
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Profitability
                  </p>

                </div>

              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  models.svm
                    ? 'bg-[#064A25]'
                    : 'bg-red-400'
                }`}
              />

            </div>

            {/* PCA + GMM */}

            <div className="border border-[#DDE0DA] rounded-xl p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-[#EAF7C8] rounded-lg">
                  <Layers className="w-4 h-4 text-[#064A25]" />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#064A25]">
                    PCA + GMM
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Market Clustering
                  </p>

                </div>

              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  models.unsupervised
                    ? 'bg-[#064A25]'
                    : 'bg-red-400'
                }`}
              />

            </div>

          </div>

        </div>

        {/* =================================================
            MOVIE DISCOVERY & ML INSIGHTS
        ================================================= */}

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE0DA]">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#EAF7C8]">
                  <Search className="w-5 h-5 text-[#064A25]" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">
                    Movie Discovery & ML Insights
                  </h3>
                  <h2 className="text-xl font-bold text-[#064A25] mt-1">
                    Search the IMDb dataset with the ML engine
                  </h2>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 max-w-2xl">
                Search a movie to view its actual values, model predictions, success tier, market cluster, and content-based similar movies.
              </p>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#064A25] text-white text-xs font-bold hover:bg-[#0B6736] transition-all"
            >
              Full Search Engine
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={movieQuery}
                onChange={(event) => setMovieQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') searchMovie();
                }}
                placeholder="Search for a movie title..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#DDE0DA] bg-[#F4F7F2] text-sm text-gray-800 outline-none focus:border-[#064A25] focus:ring-2 focus:ring-[#C2FF38]/40"
              />
            </div>

            <button
              onClick={() => searchMovie()}
              disabled={movieSearching}
              className="px-6 py-3 rounded-xl bg-[#064A25] text-white text-sm font-bold hover:bg-[#0B6736] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {movieSearching ? 'Searching...' : 'Search Movie'}
            </button>
          </div>

          {movieSearchError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {movieSearchError}
            </div>
          )}

          {selectedMovie && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">

              <div className="lg:col-span-2 rounded-2xl bg-[#F4F7F2] border border-[#DDE0DA] p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Selected Movie</p>
                    <h3 className="text-2xl font-extrabold text-[#064A25] mt-1">
                      {selectedMovie.movie_title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedMovie.release_year && (
                        <span className="px-2.5 py-1 rounded-full bg-white border border-[#DDE0DA] text-[10px] font-bold text-gray-500">
                          {selectedMovie.release_year}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#DDE0DA] text-[10px] font-bold text-gray-500">
                        {selectedMovie.genre || 'Unknown Genre'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#C2FF38] text-[#064A25] px-3 py-2 rounded-xl">
                    <Star className="w-4 h-4 fill-[#064A25]" />
                    <span className="text-lg font-extrabold">{Number(selectedMovie.score || 0).toFixed(1)}</span>
                    <span className="text-[10px] font-bold">/ 10</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="bg-white rounded-xl p-4 border border-[#DDE0DA]">
                    <p className="text-[10px] text-gray-400">Actual Budget</p>
                    <p className="text-sm font-extrabold text-[#064A25] mt-1">{selectedMovie.actual_budget}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#DDE0DA]">
                    <p className="text-[10px] text-gray-400">Actual Revenue</p>
                    <p className="text-sm font-extrabold text-[#064A25] mt-1">{selectedMovie.actual_revenue}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#DDE0DA]">
                    <p className="text-[10px] text-gray-400">Market Cluster</p>
                    <p className="text-sm font-extrabold text-[#064A25] mt-1">Cluster {selectedMovie.ml_predictions.market_cluster_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-[#064A25] rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C2FF38]" />
                      <p className="text-[10px] uppercase tracking-wider text-white/60">Predicted Revenue</p>
                    </div>
                    <p className="text-lg font-extrabold mt-2">
                      {selectedMovie.ml_predictions.multivariate_linear_regression_revenue}
                    </p>
                  </div>

                  <div className="bg-[#EAF7C8] rounded-xl p-4 text-[#064A25]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <p className="text-[10px] uppercase tracking-wider text-[#064A25]/60">Profitability Probability</p>
                    </div>
                    <p className="text-lg font-extrabold mt-2">
                      {selectedMovie.ml_predictions.svm_profitability_probability}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#064A25] p-5 text-white">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#C2FF38] text-[#064A25]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/50">Random Forest</p>
                    <h3 className="text-lg font-bold">Success Tier</h3>
                  </div>
                </div>

                <p className="text-3xl font-extrabold text-[#C2FF38] mt-8">
                  {selectedMovie.ml_predictions.random_forest_success_tier}
                </p>

                <p className="text-xs text-white/60 mt-2">
                  Predicted from the movie's budget, release year, score, genre and language features.
                </p>

                <Link
                  href="/search"
                  className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#C2FF38] hover:text-white transition-colors"
                >
                  Open detailed prediction
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {selectedMovie && (selectedMovie.ml_predictions.similar_movies?.length ?? 0) > 0 && (
            <div className="mt-6">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Content-Based Similarity</p>
                  <h3 className="text-lg font-bold text-[#064A25]">Similar Movies</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Based on shared genres and shared people/crew information.</p>
                </div>
                <Users className="w-5 h-5 text-[#064A25]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                {(selectedMovie.ml_predictions.similar_movies ?? []).slice(0, 5).map((movie) => (
                  <button
                    key={movie.title}
                    onClick={() => browseSimilarMovie(movie.title)}
                    className="text-left bg-[#F4F7F2] border border-[#DDE0DA] rounded-xl p-4 hover:border-[#064A25] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#064A25] line-clamp-2">{movie.title}</h4>
                      <span className="shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-full bg-[#C2FF38] text-[#064A25]">
                        {Number(movie.score || 0).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">{movie.genre || 'Unknown Genre'}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(movie.shared_genres ?? []).slice(0, 2).map((genre) => (
                        <span key={genre} className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#DDE0DA] text-gray-500">{genre}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-[#064A25] group-hover:gap-2 transition-all">
                      Search this movie <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {movieResults.length > 1 && (
            <div className="mt-6 pt-5 border-t border-[#DDE0DA]">
              <p className="text-xs font-bold text-[#064A25] mb-3">Search matches</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {movieResults.map((movie) => (
                  <button
                    key={movie.movie_title}
                    onClick={() => setSelectedMovie(movie)}
                    className={`shrink-0 text-left px-4 py-3 rounded-xl border transition-all ${selectedMovie?.movie_title === movie.movie_title ? 'border-[#064A25] bg-[#EAF7C8]' : 'border-[#DDE0DA] bg-[#F4F7F2] hover:border-[#064A25]'}`}
                  >
                    <p className="text-xs font-bold text-[#064A25] max-w-[190px] truncate">{movie.movie_title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{movie.release_year || 'Year N/A'} · {Number(movie.score || 0).toFixed(1)}/10</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            DATASET DETAILS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#DDE0DA]">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-[#EAF7C8] rounded-lg">
                <Database className="w-5 h-5 text-[#064A25]" />
              </div>

              <div>

                <p className="text-xs text-gray-400">
                  Valid Scores
                </p>

                <p className="text-xl font-bold text-[#064A25]">
                  {Number(
                    overview.valid_scores ||
                      0
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#DDE0DA]">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-[#EAF7C8] rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#064A25]" />
              </div>

              <div>

                <p className="text-xs text-gray-400">
                  Valid Revenue
                </p>

                <p className="text-xl font-bold text-[#064A25]">
                  {Number(
                    overview.valid_revenue ||
                      0
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#DDE0DA]">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-[#EAF7C8] rounded-lg">
                <Tv className="w-5 h-5 text-[#064A25]" />
              </div>

              <div>

                <p className="text-xs text-gray-400">
                  Valid Budget
                </p>

                <p className="text-xl font-bold text-[#064A25]">
                  {Number(
                    overview.valid_budget ||
                      0
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}