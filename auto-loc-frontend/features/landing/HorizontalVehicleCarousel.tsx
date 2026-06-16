'use client';

import React, { useEffect, useRef } from 'react';
import { ExplorerVehicleCard } from '../explorer/ExplorerVehicleCard';

interface HorizontalVehicleCarouselProps {
  vehicles: any[];
  /** Appelé une fois quand l'utilisateur approche de la fin du carousel (pagination invisible). */
  onEndReached?: () => void;
}

export function HorizontalVehicleCarousel({
  vehicles,
  onEndReached,
}: HorizontalVehicleCarouselProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);
  const onEndReachedRef = useRef(onEndReached);

  useEffect(() => {
    onEndReachedRef.current = onEndReached;
  }, [onEndReached]);

  // Re-arme la détection à chaque ajout de véhicules (le sentinel se déplace plus loin).
  useEffect(() => {
    if (!scrollRef.current || !sentinelRef.current) return;
    triggeredRef.current = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true;
          onEndReachedRef.current?.();
        }
      },
      { root: scrollRef.current, rootMargin: '0px 200px 0px 0px', threshold: 0 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [vehicles.length]);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <p className="text-slate-400 text-xs font-semibold">Aucun véhicule disponible</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="snap-start snap-always shrink-0 w-[280px] select-none"
        >
          <ExplorerVehicleCard vehicle={vehicle} />
        </div>
      ))}
      <div ref={sentinelRef} className="shrink-0 w-px" />
    </div>
  );
}
