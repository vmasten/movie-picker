"use client";

import { useEffect, useState } from "react";
import { Movie, TMDB_IMAGE_BASE } from "@/lib/tmdb";

interface ResultRevealProps {
  winner: Movie;
  onReset: () => void;
  onTryAgain: () => void;
}

export default function ResultReveal({ winner, onReset, onTryAgain }: ResultRevealProps) {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCountdown(2), 600);
    const t2 = setTimeout(() => setCountdown(1), 1200);
    const t3 = setTimeout(() => {
      setCountdown(null);
      setRevealed(true);
    }, 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const year = winner.release_date?.slice(0, 4) ?? "—";

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {!revealed ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-400 text-lg mb-6">Tonight you&apos;re watching...</p>
          <div className="text-8xl font-black text-white animate-pulse">{countdown}</div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 animate-reveal">
          <p className="text-gray-400 text-lg">Tonight you&apos;re watching</p>
          <div className="w-48 rounded-xl overflow-hidden ring-4 ring-indigo-500 shadow-2xl shadow-indigo-500/30">
            <img
              src={TMDB_IMAGE_BASE + winner.poster_path}
              alt={winner.title}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{winner.title}</h2>
            <p className="text-gray-400 mt-1">{year}</p>
            <p className="text-yellow-400 mt-2 font-medium">★ {winner.vote_average.toFixed(1)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onTryAgain}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onReset}
              className="px-8 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
