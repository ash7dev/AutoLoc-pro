"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { useVehicles } from "../hooks/useVehicles";
import { VehicleHorizontalCarousel } from "./VehicleHorizontalCarousel";

interface VehicleSectionCarouselProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  type?: string;
  limit?: number;
  viewAllHref?: string;
  className?: string;
}

export const VehicleSectionCarousel: React.FC<VehicleSectionCarouselProps> = ({
  title,
  subtitle,
  badgeText = "SÉLECTION VÉRIFIÉE",
  type,
  limit = 8,
  viewAllHref = "/vehicles",
  className = "",
}) => {
  const { vehicles, isLoading } = useVehicles({ type, limit });

  const targetHref = type ? `${viewAllHref}?type=${type}` : viewAllHref;

  return (
    <section className={`py-8 sm:py-12 border-b border-slate-200/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2
              className="text-2xl sm:text-3xl font-fraunces font-normal text-brand-dark tracking-tight"
            >
              {title}
            </h2>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={targetHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors group shrink-0"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Carousel */}
        <VehicleHorizontalCarousel vehicles={vehicles} isLoading={isLoading} />
      </div>
    </section>
  );
};
