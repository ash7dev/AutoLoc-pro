import type { Metadata } from 'next';
import { BannerSection } from '@/features/landing/BannerSection';
import { CategoriesSection } from '@/features/landing/CategoriesSection';
import { TrustSection } from '@/features/landing/TrustSection';
import { VehicleGridSection } from '@/features/landing/VehicleGridSection';
import { searchVehicles, fetchHomeFeed, fetchMobileFeed, type VehicleSearchResult, type HomeFeedResponse, type MobileFeedResponse } from '@/lib/nestjs/vehicles';
import { HowItWorksSection } from '@/features/landing/HowItWorksSection';
import { StatsSection } from '@/features/landing/StatsSection';
import { ZonesSection } from '@/features/landing/ZonesSection';
import { TestimonialsSection } from '@/features/landing/TestimonialsSection';
import { FAQSection } from '@/features/landing/FAQSection';
import { BecomeHostCTA } from '@/features/landing/BecomeHostCTA';
import { Footer } from '@/features/landing/Footer';
import { HomeSessionRedirect } from '@/features/auth/components/home-session-redirect';
import { HomeMobile } from '@/features/landing/HomeMobile';

export const metadata: Metadata = {
  title: 'AutoLoc — Location de véhicules au Sénégal',
  description:
    'Trouvez et réservez un véhicule vérifié au Sénégal : SUV, berlines, pick-ups, utilitaires. Disponible à Dakar, Thiès, Saint-Louis et partout au Sénégal.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: '/',
    title: 'AutoLoc — Location de véhicules au Sénégal',
    description:
      'Trouvez et réservez un véhicule vérifié au Sénégal : SUV, berlines, pick-ups, utilitaires. Disponible à Dakar et partout au Sénégal.',
  },
};

export const revalidate = 60;

export default async function HomePage() {
  let initialVehicles: VehicleSearchResult[] = [];
  let homeFeed: HomeFeedResponse | null = null;
  let mobileFeed: MobileFeedResponse | null = null;
  try {
    const [vehiclesRes, feedRes, mobileFeedRes] = await Promise.all([
      searchVehicles({ page: 1 }),
      fetchHomeFeed().catch(() => null),
      fetchMobileFeed().catch(() => null)
    ]);
    initialVehicles = vehiclesRes?.data ?? [];
    homeFeed = feedRes;
    mobileFeed = mobileFeedRes;
  } catch {
    // fallback to client fetch
  }

  return (
    <main className="overflow-x-hidden">
      <HomeSessionRedirect />
      
      {/* Mobile View: App-Like Landing Page */}
      <div className="block md:hidden">
        <HomeMobile initialFeed={mobileFeed} />
      </div>

      {/* Desktop View: Premium Desktop Landing Page */}
      <div className="hidden md:block">
        <BannerSection />
        <CategoriesSection />
        <VehicleGridSection initialVehicles={initialVehicles} />
        <TrustSection />
        <HowItWorksSection />
        <StatsSection />
        <ZonesSection />
        <TestimonialsSection />
        <FAQSection />
        <BecomeHostCTA />
        <Footer />
      </div>
    </main>
  );
}
