"use client";

import React, { useEffect, useRef } from "react";
import { Vehicle } from "../../types/vehicle.types";
import { PremiumVehicleCard } from "../PremiumVehicleCard";
import { DesktopFilterSidebar } from "./DesktopFilterSidebar";
import { VehicleFilterState } from "../../hooks/useSearchVehicles";
import { Loader2 } from "lucide-react";

interface DesktopVehicleLayoutProps {
  vehicles: Vehicle[];
  filters: VehicleFilterState;
  onSetFilter: <K extends keyof VehicleFilterState>(key: K, value: VehicleFilterState[K]) => void;
  onResetFilters: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export const DesktopVehicleLayout: React.FC<DesktopVehicleLayoutProps> = ({
  vehicles,
  filters,
  onSetFilter,
  onResetFilters,
  hasMore,
  onLoadMore,
  isLoadingMore,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "400px" }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="flex gap-8 items-start w-full">
      {/* Sidebar Desktop Filtres */}
      <div className="hidden lg:block shrink-0 w-64">
        <DesktopFilterSidebar
          filters={filters}
          onSetFilter={onSetFilter}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* Grille Desktop 3 Colonnes */}
      <div className="flex-1 min-w-0 flex flex-col pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
            <PremiumVehicleCard key={`${vehicle.id}-${index}`} vehicle={vehicle} />
          ))}
        </div>

        {/* Sentinel Infinite Scroll */}
        {hasMore && (
          <div ref={sentinelRef} className="py-10 flex items-center justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-main bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Chargement de plus de véhicules...</span>
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
