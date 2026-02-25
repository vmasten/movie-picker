"use client";

import { useState, useEffect } from "react";
import { Movie, STREAMING_SERVICES } from "@/lib/tmdb";
import { PickMethod } from "@/components/PickMethodSelector";
import ServiceSelector from "@/components/ServiceSelector";
import MovieGrid from "@/components/MovieGrid";
import MovieSearch from "@/components/MovieSearch";
import PickMethodSelector from "@/components/PickMethodSelector";
import ResultReveal from "@/components/ResultReveal";

type Step = 1 | 2 | 3 | 4;

function pickMovie(
  movies: Movie[],
  method: PickMethod,
  runtimes?: Record<number, number | null>
): Movie {
  switch (method) {
    case "random":
      return movies[Math.floor(Math.random() * movies.length)];
    case "highest_rated":
      return movies.reduce((best, m) => (m.vote_average > best.vote_average ? m : best));
    case "most_popular":
      return movies.reduce((best, m) => (m.popularity > best.popularity ? m : best));
    case "shortest_runtime": {
      const withRuntime = movies.filter((m) => runtimes?.[m.id] != null);
      if (withRuntime.length === 0)
        return movies[Math.floor(Math.random() * movies.length)];
      return withRuntime.reduce((shortest, m) =>
        (runtimes![m.id] as number) < (runtimes![shortest.id] as number) ? m : shortest
      );
    }
  }
}

const STEP_LABELS = ["Services", "Movies", "Method", "Result"];

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [viewMode, setViewMode] = useState<"browse" | "search">("browse");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("selectedServiceIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedMovieIds, setSelectedMovieIds] = useState<number[]>([]);
  const [pickMethod, setPickMethod] = useState<PickMethod>("random");
  const [winner, setWinner] = useState<Movie | null>(null);
  const [isPickingRuntime, setIsPickingRuntime] = useState(false);

  useEffect(() => {
    localStorage.setItem("selectedServiceIds", JSON.stringify(selectedServiceIds));
  }, [selectedServiceIds]);

  function handleServiceToggle(id: number) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleServicesConfirmed() {
    setIsLoadingMovies(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/movies?providers=${selectedServiceIds.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data: Movie[] = await res.json();
      setMovies(data);
      setSelectedMovieIds([]);
      setStep(2);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoadingMovies(false);
    }
  }

  function handleSearchSelect(movie: Movie) {
    setMovies((prev) => prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]);
    handleMovieToggle(movie.id);
  }

  function handleMovieToggle(id: number) {
    setSelectedMovieIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  async function handlePickConfirmed() {
    const selectedMovies = movies.filter((m) => selectedMovieIds.includes(m.id));

    if (pickMethod === "shortest_runtime") {
      setIsPickingRuntime(true);
      const runtimeEntries = await Promise.all(
        selectedMovies.map(async (m) => {
          const res = await fetch(`/api/runtime?id=${m.id}`);
          const data = await res.json();
          return [m.id, data.runtime] as [number, number | null];
        })
      );
      const runtimes = Object.fromEntries(runtimeEntries);
      setIsPickingRuntime(false);
      setWinner(pickMovie(selectedMovies, "shortest_runtime", runtimes));
    } else {
      setWinner(pickMovie(selectedMovies, pickMethod));
    }

    setStep(4);
  }

  async function handleTryAgain() {
    setMovies([]);
    setFetchError(null);
    setSelectedMovieIds([]);
    setPickMethod("random");
    setWinner(null);
    setIsPickingRuntime(false);
    setIsLoadingMovies(true);
    try {
      const res = await fetch(`/api/movies?providers=${selectedServiceIds.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data: Movie[] = await res.json();
      setMovies(data);
      setStep(2);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Something went wrong");
      setStep(1);
    } finally {
      setIsLoadingMovies(false);
    }
  }

  function handleReset() {
    setSelectedServiceIds([]);
    handleTryAgain();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-6">Movie Picker</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {STEP_LABELS.map((label, i) => {
            const stepNum = (i + 1) as Step;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span className={`text-sm ${isActive ? "text-white" : "text-gray-500"}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 h-px mx-1 ${isDone ? "bg-green-500" : "bg-gray-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <ServiceSelector
          services={STREAMING_SERVICES}
          selectedIds={selectedServiceIds}
          onToggle={handleServiceToggle}
          onConfirm={handleServicesConfirmed}
          isLoading={isLoadingMovies}
          error={fetchError}
        />
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Pick your candidates</h2>
              <p className="text-gray-400 text-sm mt-1">Select 2–5 movies</p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                selectedMovieIds.length >= 2
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {selectedMovieIds.length} / 5 selected
            </span>
          </div>

          <div className="flex gap-1 p-1 bg-gray-900 rounded-xl w-fit">
            <button
              onClick={() => setViewMode("browse")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "browse" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setViewMode("search")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "search" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Search
            </button>
          </div>

          {viewMode === "browse" ? (
            <MovieGrid
              movies={movies}
              selectedIds={selectedMovieIds}
              onToggle={handleMovieToggle}
            />
          ) : (
            <MovieSearch
              providerIds={selectedServiceIds}
              selectedIds={selectedMovieIds}
              onSelect={handleSearchSelect}
              maxReached={selectedMovieIds.length >= 5}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => { if (selectedMovieIds.length >= 2) setStep(3); }}
              disabled={selectedMovieIds.length < 2}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              Let&apos;s Decide →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <PickMethodSelector
          selectedMethod={pickMethod}
          onMethodChange={setPickMethod}
          onConfirm={handlePickConfirmed}
          isLoading={isPickingRuntime}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && winner && (
        <ResultReveal winner={winner} onReset={handleReset} onTryAgain={handleTryAgain} />
      )}
    </main>
  );
}
