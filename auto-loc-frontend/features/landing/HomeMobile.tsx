'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Clock, Star, Wallet, Gem, MapPin, Shield, Car } from 'lucide-react';
import { fetchMobileFeed, type MobileFeedResponse } from '@/lib/nestjs/vehicles';
import { MobileSearchBar } from './mobile/MobileSearchBar';
import { MobileIntroCard } from './mobile/MobileIntroCard';
import { MobileCategoriesCarousel } from './mobile/MobileCategoriesCarousel';
import { NearbyVehiclesSection } from './mobile/NearbyVehiclesSection';
import { VehicleSection } from './components/VehicleSection';

const HowItWorksSection = dynamic(() => import('./HowItWorksSection').then((m) => m.HowItWorksSection));
const BecomeHostCTA = dynamic(() => import('./BecomeHostCTA').then((m) => m.BecomeHostCTA));
const Footer = dynamic(() => import('./Footer').then((m) => m.Footer));

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
  initialFeed: MobileFeedResponse | null;
}

export function HomeMobile({ initialFeed }: HomeMobileProps): React.ReactElement {
  const [feed, setFeed] = useState<MobileFeedResponse | null>(initialFeed);
  const [loading, setLoading] = useState(!initialFeed);

  useEffect(() => {
    if (!initialFeed) {
      setLoading(true);
      fetchMobileFeed()
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
      {/* Intro presentation card - Hero */}
      <MobileIntroCard />

      {/* Search Bar with dates */}
      <MobileSearchBar />

      {/* Horizontal categories */}
      <MobileCategoriesCarousel />

      {loading ? (
        <>
          {/* Recommandé Skeleton */}
          <div className="py-4 border-t border-slate-50 px-4">
            <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase mb-4 font-display">
              Véhicules recommandés
            </h3>
            <CarouselSkeleton />
          </div>

          {/* Premium Skeleton */}
          <div className="py-4 border-t border-slate-50 px-4">
            <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase mb-4 font-display">
              Sélection Premium
            </h3>
            <GridSkeleton />
          </div>
        </>
      ) : (
        <>
          {/* 1. Recommandé — carousel géolocalisé */}
          <NearbyVehiclesSection
            initialVehicles={feed?.recommended.items ?? []}
            excludeIds={feed?.recommended.excludedIds ?? []}
          />

          {/* 2. Sélection Premium — carrousel horizontal */}
          <VehicleSection
            title="Sélection Premium"
            subtitle="Nos véhicules coup de cœur"
            eyebrow="Collection d'exception"
            icon={Sparkles}
            iconColor="text-amber-500"
            vehicles={feed?.premium ?? []}
            layout="carousel"
            viewAllHref="/explorer"
          />

          {/* 3. Nouveautés — carrousel horizontal */}
          <VehicleSection
            title="Nouveautés"
            subtitle="Récemment ajoutés"
            eyebrow="Arrivées récentes"
            icon={Clock}
            iconColor="text-emerald-500"
            vehicles={feed?.nouveautes ?? []}
            layout="carousel"
            viewAllHref="/explorer?sort=newest"
          />

          {/* 4. Top Notés — carrousel horizontal */}
          <VehicleSection
            title="Top notés"
            subtitle="Excellence recommandée par les locataires"
            eyebrow="4.8★ & plus"
            icon={Star}
            iconColor="text-amber-400"
            vehicles={feed?.topNotes ?? []}
            layout="carousel"
            viewAllHref="/explorer?sort=rating"
          />

          {/* 5. Économiques — carrousel horizontal */}
          <VehicleSection
            title="Économiques"
            subtitle="Les meilleurs tarifs au Sénégal"
            eyebrow="Accessibles"
            icon={Wallet}
            iconColor="text-blue-500"
            vehicles={feed?.economiques ?? []}
            layout="carousel"
            viewAllHref="/explorer?sort=price-asc"
          />

          {/* 6. Luxe — carrousel horizontal */}
          <VehicleSection
            title="Luxe & Prestige"
            subtitle="Berlines et SUV de haut standing"
            eyebrow="Haut de gamme"
            icon={Gem}
            iconColor="text-purple-500"
            vehicles={feed?.luxe ?? []}
            layout="carousel"
            viewAllHref="/explorer?type=LUXE"
          />

          {/* 7. Dakar — carrousel horizontal */}
          <VehicleSection
            title="Disponibles à Dakar"
            subtitle="Prise en charge immédiate en capitale"
            eyebrow="Zone Dakar"
            icon={MapPin}
            iconColor="text-emerald-500"
            vehicles={feed?.dakar ?? []}
            layout="carousel"
            viewAllHref="/explorer?zone=dakar"
          />

          {/* 8. SUV du moment — carrousel horizontal */}
          <VehicleSection
            title="SUV & 4×4 du moment"
            subtitle="Spacieux pour vos déplacements"
            eyebrow="Tout-terrain"
            icon={Shield}
            iconColor="text-emerald-600"
            vehicles={feed?.suvMoment ?? []}
            layout="carousel"
            viewAllHref="/explorer?type=SUV"
          />

          {/* 9. Berlines populaires — carrousel horizontal */}
          <VehicleSection
            title="Berlines populaires"
            subtitle="Confort & élégance urbaine"
            eyebrow="Confort VIP"
            icon={Car}
            iconColor="text-slate-700"
            vehicles={feed?.berlinesPopulaires ?? []}
            layout="carousel"
            viewAllHref="/explorer?type=BERLINE"
          />
        </>
      )}

      {/* How It Works */}
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
