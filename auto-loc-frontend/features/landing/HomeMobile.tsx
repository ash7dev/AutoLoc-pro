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

export function HomeMobile(): React.ReactElement {
  const [feed, setFeed] = useState<HomeFeedResponse | null>(null);

  useEffect(() => {
    fetchHomeFeed().then(setFeed).catch(() => {});
  }, []);

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-12 flex flex-col gap-2">
      {/* Search Bar on top */}
      <MobileSearchBar />

      {/* Intro presentation card */}
      <MobileIntroCard />

      {/* Horizontal categories */}
      <MobileCategoriesCarousel />

      {/* Recommandé — carousel, alimenté par le feed accueil + géolocalisation */}
      <NearbyVehiclesSection
        initialVehicles={feed?.recommended.items ?? []}
        excludeIds={feed?.recommended.excludedIds ?? []}
      />

      {/* Sélection Premium — grille, triée par nb de réservations côté backend */}
      <PremiumSelectionGrid vehicles={feed?.premium ?? []} />

      {/* Nouveautés — carousel, véhicules ajoutés récemment */}
      <NouveautesSection vehicles={feed?.nouveautes ?? []} />

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
