"use client";

import React from "react";
import { Car, RotateCcw, SearchX } from "lucide-react";

interface VehiclesEmptyStateProps {
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const VehiclesEmptyState: React.FC<VehiclesEmptyStateProps> = ({
  onResetFilters,
  hasActiveFilters,
}) => {
  const Icon = hasActiveFilters ? SearchX : Car;

  return (
    <div
      role="status"
      aria-live="polite"
      className="my-6 flex w-full flex-col items-center overflow-hidden rounded-3xl bg-white px-6 pb-9 pt-6 text-center shadow-[0_1px_2px_rgba(10,61,46,0.06),0_12px_28px_-16px_rgba(10,61,46,0.28)] ring-1 ring-slate-900/[0.06]"
    >
      {/* Ondes de recherche : trois cercles concentriques autour de l'icône */}
      <div className="relative flex h-48 w-48 items-center justify-center" aria-hidden>
        <span className="absolute h-48 w-48 rounded-full border border-[#0A3D2E]/[0.05] bg-[#F1DFB6]/10" />
        <span className="absolute h-36 w-36 rounded-full border border-[#0A3D2E]/[0.08] bg-[#F1DFB6]/20" />
        <span className="absolute h-24 w-24 rounded-full border border-[#0A3D2E]/10 bg-[#F1DFB6]/40" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6] shadow-lg shadow-[#0A3D2E]/25">
          <Icon className="h-7 w-7" strokeWidth={1.6} />
        </span>
      </div>

      <h3 className="mt-2 font-serif text-2xl font-normal leading-tight text-slate-900">
        {hasActiveFilters ? "Aucun véhicule trouvé" : "Aucun véhicule pour le moment"}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
        {hasActiveFilters
          ? "Élargissez votre budget, la catégorie ou la ville pour voir plus d'annonces."
          : "De nouvelles annonces arrivent régulièrement. Repassez bientôt."}
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3 text-sm font-semibold text-[#F1DFB6] shadow-md shadow-[#0A3D2E]/20 transition-all duration-200 hover:bg-[#072B20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
};