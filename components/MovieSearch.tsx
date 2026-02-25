"use client";

import { useState } from "react";
import { Movie, TMDB_IMAGE_BASE } from "@/lib/tmdb";

interface SearchResult extends Movie {
  available: boolean;
  availableOn: string[];
}

interface MovieSearchProps {
  providerIds: number[];
  selectedIds: number[];
  onSelect: (movie: Movie) => void;
  maxReached: boolean;
}

export default function MovieSearch({ providerIds, selectedIds, onSelect, maxReached }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&providers=${providerIds.join(",")}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult[] = await res.json();
      setResults(data);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {searched && results.length === 0 && !isLoading && (
        <p className="text-gray-400 text-sm">No results found.</p>
      )}

      <div className="space-y-3">
        {results.map((movie) => {
          const isSelected = selectedIds.includes(movie.id);
          const isDisabled = maxReached && !isSelected;
          const year = movie.release_date?.slice(0, 4) ?? "—";

          return (
            <div
              key={movie.id}
              className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                isSelected ? "border-green-400 bg-green-400/10" : "border-gray-700 bg-gray-900"
              }`}
            >
              <img
                src={TMDB_IMAGE_BASE + movie.poster_path}
                alt={movie.title}
                className="w-14 rounded-lg aspect-[2/3] object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{movie.title}</p>
                <p className="text-sm text-gray-400">{year} · ★ {movie.vote_average.toFixed(1)}</p>
                {movie.available ? (
                  <p className="text-xs text-green-400 mt-1 font-medium">
                    ✓ {movie.availableOn.join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">✗ Not on your services</p>
                )}
              </div>
              <button
                onClick={() => onSelect(movie)}
                disabled={isDisabled}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-green-400 text-gray-900"
                    : isDisabled
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {isSelected ? "✓ Added" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
