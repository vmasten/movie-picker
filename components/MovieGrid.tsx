"use client";

import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function MovieGrid({ movies, selectedIds, onToggle }: MovieGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pick your candidates</h2>
          <p className="text-gray-400 text-sm mt-1">Select 2–5 movies</p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            selectedIds.length >= 2
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          {selectedIds.length} / 5 selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSelected={selectedIds.includes(movie.id)}
            isDisabled={selectedIds.length >= 5 && !selectedIds.includes(movie.id)}
            onToggle={() => onToggle(movie.id)}
          />
        ))}
      </div>

    </div>
  );
}
