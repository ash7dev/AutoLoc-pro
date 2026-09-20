"use client";

import React, { useRef } from "react";
import { Vehicle } from "../types/vehicle.types";
import { PremiumVehicleCard } from "./PremiumVehicleCard";

interface VehicleHorizontalCarouselProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export const VehicleHorizontalCarousel: React.FC<VehicleHorizontalCarouselProps> = ({
  vehicles,
  isLoading = false,
  className = "",
  emptyMessage = "Aucun véhicule disponible dans cette catégorie pour le moment.",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-[280px] sm:w-[320px] md:w-[340px] h-[360px] rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/80 shrink-0"
          />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-white/70 rounded-3xl border border-slate-200/80 shadow-xs">
        <p className="text-xs font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 px-1 scroll-smooth snap-x snap-mandatory"
      >
        {vehicles.map((v) => (
          <div key={v.id} className="snap-start shrink-0">
            <PremiumVehicleCard vehicle={v} className="w-[280px] sm:w-[320px] md:w-[340px]" />
          </div>
        ))}
      </div>
    </div>
  );
};
