"use client";

import React, { useState } from "react";
import { useSearchVehicles } from "../hooks/useSearchVehicles";
import { VehiclesFilterChips } from "./VehiclesFilterChips";
import { VehiclesResultsHeader } from "./VehiclesResultsHeader";
import { VehiclesEmptyState } from "./VehiclesEmptyState";
import { VehiclesGridSkeleton } from "./VehiclesGridSkeleton";
import { MobileVehicleListFeed } from "./mobile/MobileVehicleListFeed";
import { MobileFilterDrawer } from "./mobile/MobileFilterDrawer";
import { MobileFloatingNavPill } from "./mobile/MobileFloatingNavPill";
import { DesktopVehicleLayout } from "./desktop/DesktopVehicleLayout";
import { InteractiveVehiclesMap } from "./map/InteractiveVehiclesMap";

export const VehiclesPageShell: React.FC = () => {
  const {
    vehicles,
    total,
    isLoading,
    isValidating,
    isLoadingMore,
    hasMore,
    loadMore,
    filters,
    setFilter,
    updateFilters,
    resetFilters,
    activeFiltersCount,
  } = useSearchVehicles();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <div className="w-full min-h-screen bg-[#F8FAF4] pt-[calc(5.5rem+env(safe-area-inset-top))] md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-hidden">
      {/* Hero Title Section (Desktop Only) */}
      <div className="hidden md:block mb-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Catalogue Premium AutoLoc</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-fraunces font-normal tracking-tight text-[#041912] leading-tight"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          Louez un véhicule d'exception au{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent italic">
            Sénégal.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
          Explorez notre sélection de véhicules vérifiés avec assurance tous risques et livraison disponible.
        </p>
      </div>

      {/* Quick Filter Chips Horizontaux */}
      <VehiclesFilterChips
        selectedType={filters.type}
        onSelectType={(type) => setFilter("type", type)}
      />

      {/* Header Résultats (Total & Tri) */}
      <VehiclesResultsHeader
        total={total}
        sortBy={filters.sortBy}
        onSortChange={(sort) => setFilter("sortBy", sort)}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* État de chargement initial (Uniquement tout premier render sans cache) */}
      {isLoading && <VehiclesGridSkeleton count={6} />}

      {/* État vide */}
      {!isLoading && vehicles.length === 0 && (
        <VehiclesEmptyState
          onResetFilters={resetFilters}
          hasActiveFilters={activeFiltersCount > 0}
        />
      )}

      {/* Contenu principal (si véhicules disponibles) */}
      {!isLoading && vehicles.length > 0 && (
        <div className={`transition-opacity duration-200 ${isValidating ? "opacity-60" : "opacity-100"}`}>
          {viewMode === "map" ? (
            <InteractiveVehiclesMap vehicles={vehicles} />
          ) : (
            <>
              {/* Rendu Mobile (Feed Infini) */}
              <div className="block lg:hidden">
                <MobileVehicleListFeed
                  vehicles={vehicles}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  isLoadingMore={isLoadingMore}
                />
              </div>

              {/* Rendu Desktop (Grille 3 cols + Sidebar) */}
              <div className="hidden lg:block">
                <DesktopVehicleLayout
                  vehicles={vehicles}
                  filters={filters}
                  onSetFilter={setFilter}
                  onResetFilters={resetFilters}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  isLoadingMore={isLoadingMore}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onUpdateFilters={updateFilters}
        onResetFilters={resetFilters}
        totalResults={total}
      />

      {/* Floating Action Pill sur Mobile (Liste ↔ Carte) */}
      {!isLoading && vehicles.length > 0 && (
        <MobileFloatingNavPill
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "map" : "list"))}
        />
      )}
    </div>
  );
};
