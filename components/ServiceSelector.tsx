"use client";

import { StreamingService } from "@/lib/tmdb";

interface ServiceSelectorProps {
  services: StreamingService[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function ServiceSelector({
  services,
  selectedIds,
  onToggle,
  onConfirm,
  isLoading,
  error,
}: ServiceSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Which services do you have?</h2>
        <p className="text-gray-400">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {services.map((service) => {
          const isSelected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              onClick={() => onToggle(service.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500/20 text-white"
                  : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500"
              }`}
            >
              <div className="font-semibold">{service.name}</div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={onConfirm}
        disabled={selectedIds.length === 0 || isLoading}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Finding movies...
          </span>
        ) : (
          "Find Movies"
        )}
      </button>
    </div>
  );
}
