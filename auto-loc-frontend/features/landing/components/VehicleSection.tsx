'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { CompactVehicleCard } from '@/features/vehicles/components/CompactVehicleCard';
import { HorizontalVehicleCarousel } from '../HorizontalVehicleCarousel';

export interface VehicleSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  iconColor?: string;
  vehicles: VehicleSearchResult[];
  layout?: 'grid' | 'carousel';
  viewAllHref?: string;
  onEndReached?: () => void;
  maxGridItems?: number;
}

export function VehicleSection({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  iconColor = 'text-emerald-500',
  vehicles,
  layout = 'grid',
  viewAllHref,
  onEndReached,
  maxGridItems = 4,
}: VehicleSectionProps): React.ReactElement | null {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <section className="py-5 border-t border-slate-100/80 px-4">
      {/* 2026 Editorial Luxury Section Header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="space-y-1 min-w-0">
          {/* Eyebrow badge */}
          {(eyebrow || Icon) && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/80 border border-slate-200/50 mb-1">
              {Icon && <Icon className={`h-3 w-3 ${iconColor}`} strokeWidth={2.5} />}
              <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-600">
                {eyebrow || title}
              </span>
            </div>
          )}

          {/* Section Editorial Title */}
          <h3 className="text-[20px] lg:text-[24px] font-bold text-slate-900 tracking-tight leading-tight font-editorial">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-[11.5px] font-medium text-slate-400 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {/* View All Pill Action */}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-sm hover:bg-emerald-600 hover:shadow-md transition-all shrink-0 active:scale-95"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* Content Layout */}
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-3.5 auto-rows-fr">
          {vehicles.slice(0, maxGridItems).map((v) => (
            <div key={v.id} className="h-full">
              <CompactVehicleCard vehicle={v} />
            </div>
          ))}
        </div>
      ) : (
        <HorizontalVehicleCarousel vehicles={vehicles} onEndReached={onEndReached} />
      )}
    </section>
  );
}
