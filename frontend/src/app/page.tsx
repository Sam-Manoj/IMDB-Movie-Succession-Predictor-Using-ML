'use client';

import Link from 'next/link';
import { LayoutDashboard, Home, Search } from 'lucide-react';

const BentoCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[2rem]
        transition-all
        duration-500
        hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#064A25]">

      {/* SIDE NAVIGATION */}
      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-20
          md:w-24
          bg-[#064A25]
          text-white
          flex
          flex-col
          items-center
          py-6
          rounded-r-[2rem]
        "
      >

        {/* LOGO */}
        <Link
          href="/"
          className="
            w-12
            h-12
            md:w-14
            md:h-14
            rounded-full
            bg-[#C2FF38]
            flex
            items-center
            justify-center
            overflow-hidden
            mb-10
          "
        >
          <img
            src="/Main logo.png"
            alt="TV Predict"
            className="
              w-full
              h-full
              object-contain
            "
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="flex flex-col items-center gap-5">

          {/* HOME */}
          <Link
            href="/"
            className="
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              bg-[#C2FF38]
              text-[#064A25]
              hover:scale-105
              transition-all
            "
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* DASHBOARD */}
          <Link
            href="/dashboard"
            className="
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              hover:bg-white/10
              transition-all
            "
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>

          {/* SEARCH */}
          <Link
            href="/search"
            className="
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              hover:bg-white/10
              transition-all
            "
            title="Search ML Engine"
          >
            <Search className="w-5 h-5" />
          </Link>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-20 md:ml-24 px-5 py-6 md:px-10 md:py-8">

        <div className="max-w-[1400px] mx-auto">

          {/* TOP BAR */}
          <header className="flex items-center justify-between mb-6">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-50">
                Machine Learning
              </p>

              <h1 className="text-2xl md:text-3xl font-black">
                TVPREDICT
              </h1>
            </div>

            {/* DASHBOARD BUTTON */}
            <Link
              href="/dashboard"
              className="
                flex
                items-center
                gap-2
                bg-[#064A25]
                text-white
                px-5
                py-3
                rounded-full
                text-sm
                font-bold
                hover:bg-[#0B6736]
                transition-all
              "
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

          </header>

          {/* BENTO GRID */}
          <div
            className="
              columns-1
              md:columns-2
              xl:columns-3
              gap-4
            "
          >

            {/* 1. MAIN HERO */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#064A25]
              "
            >
              <img
                src="/Main hero.png"
                alt="TV Program Success Predictor"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 2. PREDICTION GRAPH */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#C2FF38]
              "
            >
              <img
                src="/Prediction graph.png"
                alt="Prediction graph"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 3. DATASET */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#064A25]
              "
            >
              <img
                src="/Dataset.png"
                alt="Dataset visualization"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 4. MAIN LOGO */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#C2FF38]
              "
            >
              <img
                src="/Main logo.png"
                alt="TV Predict ML engine"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 5. DASHBOARD SCREENSHOT */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#064A25]
              "
            >
              <img
                src="/Dashboard screenshot.png"
                alt="TV prediction dashboard"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 6. ANALYTICS GRAPHIC */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#C2FF38]
              "
            >
              <img
                src="/analytics graphic.png"
                alt="Analytics and machine learning"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

            {/* 7. DASHBOARD MOCKUP */}
            <BentoCard
              className="
                mb-4
                break-inside-avoid
                bg-[#DDE0DA]
              "
            >
              <img
                src="/dashboard mockup.png"
                alt="Dashboard mockup"
                className="
                  block
                  w-full
                  h-auto
                "
              />
            </BentoCard>

          </div>

        </div>

      </div>

    </main>
  );
}