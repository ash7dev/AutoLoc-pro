'use client';

import React from 'react';
import { MobileSearchBar } from './mobile/MobileSearchBar';
import { MobileIntroCard } from './mobile/MobileIntroCard';
import { MobileCategoriesCarousel } from './mobile/MobileCategoriesCarousel';
import { NearbyVehiclesSection } from './mobile/NearbyVehiclesSection';
import { PremiumSelectionGrid } from './mobile/PremiumSelectionGrid';
import { HowItWorksSection } from './HowItWorksSection';
import { BecomeHostCTA } from './BecomeHostCTA';
import { Footer } from './Footer';

export function HomeMobile(): React.ReactElement {
  return (
    <div className="w-full bg-slate-50 min-h-screen pb-12 flex flex-col gap-2">
      {/* Search Bar on top */}
      <MobileSearchBar />
      
      {/* Intro presentation card */}
      <MobileIntroCard />
      
      {/* Horizontal categories */}
      <MobileCategoriesCarousel />
      
      {/* Geolocation near you section */}
      <NearbyVehiclesSection />
      
      {/* 2-column premium grid */}
      <PremiumSelectionGrid />
      
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
