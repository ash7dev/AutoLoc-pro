"use client";

import React from "react";
import { VehicleSortOption } from "../types/vehicle.types";
import { SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";

interface VehiclesResultsHeaderProps {
  total: number;
  sortBy: VehicleSortOption;
  onSortChange: (sort: VehicleSortOption) => void;
  onOpenMobileFilters?: () => void;
  activeFiltersCount?: number;
}

const SORT_OPTIONS: { value: VehicleSortOption; label: string }[] = [
  { value: "popular", label: "Plus populaires" },
  { value: "price-asc", label: "Prix : du - cher au + cher" },
  { value: "price-desc", label: "Prix : du + cher au - cher" },
  { value: "rating", label: "Les mieux notés ⭐" },
  { value: "newest", label: "Nouveautés" },
];

export const VehiclesResultsHeader: React.FC<VehiclesResultsHeaderProps> = ({
  total,
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  activeFiltersCount = 0,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-3 mb-4 border-b border-slate-200/60">
      {/* Total Count */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h2
          className="text-base sm:text-lg font-fraunces font-normal tracking-tight text-[#041912]"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          {total} {total > 1 ? "véhicules disponibles" : "véhicule disponible"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile Filter Trigger Button */}
        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm hover:border-[#0A3D2E] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0A3D2E]" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#0A3D2E] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {/* Sort Select Dropdown */}
        <div className="relative flex items-center bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-sm text-xs text-slate-700 hover:border-slate-300 transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <span className="text-slate-400 mr-1.5 hidden sm:inline">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as VehicleSortOption)}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
