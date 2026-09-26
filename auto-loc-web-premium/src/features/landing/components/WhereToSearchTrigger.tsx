"use client";

import React from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

interface WhereToSearchTriggerProps {
  onPress: () => void;
  selectedZone?: string;
  selectedType?: string;
  selectedDatesSummary?: string;
}

export const WhereToSearchTrigger: React.FC<WhereToSearchTriggerProps> = ({
  onPress,
  selectedZone,
  selectedType,
  selectedDatesSummary,
}) => {
  const hasActiveFilters = Boolean(selectedZone || selectedType || selectedDatesSummary);

  const displayTitle = selectedZone ? selectedZone : "Où & quand louer ?";

  const displaySubtitle = [
    selectedType ? selectedType : null,
    selectedDatesSummary ? selectedDatesSummary : "Destination · Dates · Catégories",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      onClick={onPress}
      type="button"
      className={`w-full flex items-center justify-between p-3 rounded-full bg-white border transition-all shadow-lg shadow-emerald-950/5 hover:shadow-xl text-left ${
        hasActiveFilters
          ? "border-emerald-500/40 bg-emerald-50/30"
          : "border-slate-200/80 hover:border-emerald-400"
      }`}
    >
      {/* Left Search Badge */}
      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
        <Search className="w-5 h-5 text-emerald-700" />
      </div>

      {/* Text Container */}
      <div className="flex-1 px-3 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-fraunces font-normal text-brand-dark truncate">
            {displayTitle}
          </span>


          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              Actif
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
          {displaySubtitle}
        </p>
      </div>

      {/* Right Filter Icon */}
      <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center shrink-0 relative shadow-md">
        <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
        {hasActiveFilters && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand-dark" />
        )}
      </div>
    </button>
  );
};
