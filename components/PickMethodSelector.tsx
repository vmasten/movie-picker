"use client";

export type PickMethod = "random" | "highest_rated" | "most_popular" | "shortest_runtime";

const METHODS: { value: PickMethod; label: string; description: string }[] = [
  { value: "random", label: "Random", description: "Pure chance — anything can happen" },
  { value: "highest_rated", label: "Highest Rated", description: "The movie with the best TMDB score wins" },
  { value: "most_popular", label: "Most Popular", description: "The movie with the most buzz wins" },
  { value: "shortest_runtime", label: "Shortest Runtime", description: "Pick the one that fits your schedule" },
];

interface PickMethodSelectorProps {
  selectedMethod: PickMethod;
  onMethodChange: (method: PickMethod) => void;
  onConfirm: () => void;
  isLoading: boolean;
  onBack: () => void;
}

export default function PickMethodSelector({
  selectedMethod,
  onMethodChange,
  onConfirm,
  isLoading,
  onBack,
}: PickMethodSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">How should we decide?</h2>
        <p className="text-gray-400 text-sm mt-1">Choose a method, then let the app pick</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METHODS.map((method) => (
          <button
            key={method.value}
            onClick={() => onMethodChange(method.value)}
            className={`p-5 rounded-xl border-2 text-left transition-all ${
              selectedMethod === method.value
                ? "border-indigo-500 bg-indigo-500/20"
                : "border-gray-700 bg-gray-900 hover:border-gray-500"
            }`}
          >
            <div className="font-semibold text-white">{method.label}</div>
            <div className="text-sm text-gray-400 mt-1">{method.description}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Fetching runtimes...
            </span>
          ) : (
            "Pick for Me!"
          )}
        </button>
      </div>
    </div>
  );
}
