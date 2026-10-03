from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from src.dashboard import get_dashboard_data


app = FastAPI(
    title="IMDb Movie Prediction API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


engine = None


@app.on_event("startup")
def startup():

    global engine

    if not os.path.exists(
        "models/practical_regression.pkl"
    ):

        print(
            "WARNING: Models not found!"
        )

    else:

        from src.movie_search_engine import (
            MovieSearchMLEngine
        )

        engine = MovieSearchMLEngine()

        print(
            "Models loaded!"
        )


@app.get("/")
def root():

    return {
        "message":
        "API is running!"
    }


@app.get("/search")
def search(
    query: str
):

    if engine is None:

        raise HTTPException(
            status_code=500,
            detail=
            "ML Models not trained yet."
        )

    results = engine.search_movie(
        query
    )

    if (
        isinstance(results, dict)
        and "error" in results
    ):

        raise HTTPException(
            status_code=404,
            detail=results["error"],
        )

    return {
        "query": query,
        "results": results,
    }


@app.get("/dashboard")
def dashboard():

    try:

        return get_dashboard_data()

    except Exception as error:

        print(
            "Dashboard error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=
            f"Dashboard generation failed: {str(error)}",
        )