"use client";

import { Movie, TMDB_IMAGE_BASE } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

export default function MovieCard({ movie, isSelected, isDisabled, onToggle }: MovieCardProps) {
  const year = movie.release_date?.slice(0, 4) ?? "—";

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`group relative w-full text-left rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-green-400 scale-[1.02]"
          : isDisabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:ring-2 hover:ring-white/40 cursor-pointer"
      }`}
    >
      <div className="aspect-[2/3] bg-gray-800">
        <img
          src={TMDB_IMAGE_BASE + movie.poster_path}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-green-400 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}

      <div className="p-2 bg-gray-900">
        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
        <p className="text-xs text-gray-400">{year}</p>
      </div>
    </button>
  );
}
