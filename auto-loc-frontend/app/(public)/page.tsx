import type { Metadata } from 'next';
import { BannerSection } from '@/features/landing/BannerSection';
import { CategoriesSection } from '@/features/landing/CategoriesSection';
import { TrustSection } from '@/features/landing/TrustSection';
import { VehicleGridSection } from '@/features/landing/VehicleGridSection';
import { searchVehicles, type VehicleSearchResult } from '@/lib/nestjs/vehicles';
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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialVehicles: VehicleSearchResult[] = [];
  try {
    const res = await searchVehicles({ page: 1 });
    initialVehicles = res?.data ?? [];
  } catch {
    // fallback to client fetch
  }

  return (
    <main className="overflow-x-hidden">
      <HomeSessionRedirect />
      
      {/* Mobile View: App-Like Landing Page */}
      <div className="block md:hidden">
        <HomeMobile />
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
