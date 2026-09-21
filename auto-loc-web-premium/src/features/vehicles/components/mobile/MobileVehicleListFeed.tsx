"use client";

import React, { useEffect, useRef, useState } from "react";
import { Vehicle } from "../../types/vehicle.types";
import { MobileVehicleCard } from "./MobileVehicleCard";
import { Loader2, LayoutList, LayoutGrid } from "lucide-react";

interface MobileVehicleListFeedProps {
  vehicles: Vehicle[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export const MobileVehicleListFeed: React.FC<MobileVehicleListFeedProps> = ({
  vehicles,
  hasMore,
  onLoadMore,
  isLoadingMore,
}) => {
  const [cardLayout, setCardLayout] = useState<"horizontal" | "vertical">("horizontal");
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
    <div className="flex flex-col w-full pb-20">
      {/* Mini Bar de Bascule de Rendu Mobile (Liste Horizontale ↔ Cartes Grandes) */}
      <div className="flex items-center justify-between pb-3 mb-3 text-xs text-slate-500 font-medium">
        <span>Format d'affichage</span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setCardLayout("horizontal")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              cardLayout === "horizontal"
                ? "bg-white text-[#0A3D2E] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Compact</span>
          </button>

          <button
            onClick={() => setCardLayout("vertical")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              cardLayout === "vertical"
                ? "bg-white text-[#0A3D2E] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grand</span>
          </button>
        </div>
      </div>

      {/* Liste des cartes mobile */}
      <div className={cardLayout === "horizontal" ? "flex flex-col gap-3" : "flex flex-col gap-5"}>
        {vehicles.map((vehicle, index) => (
          <MobileVehicleCard
            key={`${vehicle.id}-${index}`}
            vehicle={vehicle}
            priorityImage={index === 0}
            layout={cardLayout}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex items-center justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0A3D2E] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement des véhicules...</span>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}
    </div>
  );
};
