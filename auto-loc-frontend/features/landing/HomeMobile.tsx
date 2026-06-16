'use client';

import React, { useEffect, useState } from 'react';
import { fetchHomeFeed, type HomeFeedResponse } from '@/lib/nestjs/vehicles';
import { MobileSearchBar } from './mobile/MobileSearchBar';
import { MobileIntroCard } from './mobile/MobileIntroCard';
import { MobileCategoriesCarousel } from './mobile/MobileCategoriesCarousel';
import { NearbyVehiclesSection } from './mobile/NearbyVehiclesSection';
import { PremiumSelectionGrid } from './mobile/PremiumSelectionGrid';
import { NouveautesSection } from './NouveautesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { BecomeHostCTA } from './BecomeHostCTA';
import { Footer } from './Footer';

// ─── Loading Skeletons ────────────────────────────────────────────────────────
function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="shrink-0 w-[280px] bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-3 animate-pulse">
          <div className="aspect-[16/10] w-full bg-slate-100 rounded-xl" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-px bg-slate-50 mt-1" />
          <div className="flex justify-between items-center mt-1">
            <div className="h-5 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-20 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100/80 p-3 flex flex-col gap-3 animate-pulse">
          <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl" />
          <div className="h-3.5 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-12 bg-slate-100 rounded" />
          <div className="h-px bg-slate-50 mt-1" />
          <div className="flex justify-between items-center mt-1">
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-6 w-6 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface HomeMobileProps {
  initialFeed: HomeFeedResponse | null;
}

export function HomeMobile({ initialFeed }: HomeMobileProps): React.ReactElement {
  const [feed, setFeed] = useState<HomeFeedResponse | null>(initialFeed);
  const [loading, setLoading] = useState(!initialFeed);

  useEffect(() => {
    // If we didn't receive initial feed (e.g. client navigation or failed server fetch), load it on the client
    if (!initialFeed) {
      setLoading(true);
      fetchHomeFeed()
        .then((data) => {
          setFeed(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [initialFeed]);

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-12 flex flex-col gap-2">
      {/* Search Bar on top */}
      <MobileSearchBar />

      {/* Intro presentation card */}
      <MobileIntroCard />

      {/* Horizontal categories */}
      <MobileCategoriesCarousel />

      {loading ? (
        <>
          {/* Recommandé Skeleton */}
          <div className="py-4 border-t border-slate-50 px-4">
            <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase mb-4">
              Véhicules recommandés
            </h3>
            <CarouselSkeleton />
          </div>

          {/* Premium Skeleton */}
          <div className="py-4 border-t border-slate-50 px-4">
            <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase mb-4">
              Sélection Premium
            </h3>
            <GridSkeleton />
          </div>
        </>
      ) : (
        <>
          {/* Recommandé — carousel, alimenté par le feed accueil + géolocalisation */}
          <NearbyVehiclesSection
            initialVehicles={feed?.recommended.items ?? []}
            excludeIds={feed?.recommended.excludedIds ?? []}
          />

          {/* Sélection Premium — grille, triée par nb de réservations côté backend */}
          <PremiumSelectionGrid vehicles={feed?.premium ?? []} />

          {/* Nouveautés — carousel, véhicules ajoutés récemment */}
          <NouveautesSection vehicles={feed?.nouveautes ?? []} />
        </>
      )}

      {/* Simplified How It Works */}
      <div className="bg-white border-t border-slate-100">
        <HowItWorksSection />
      </div>

      {/* Become Host CTA */}
      <BecomeHostCTA />

      {/* Mobile Footer */}
      <Footer />
    </div>
  );
}
