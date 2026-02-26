import type { Metadata } from 'next';
import { BannerSection } from '@/features/landing/BannerSection';
import { CategoriesSection } from '@/features/landing/CategoriesSection';
import { VehicleGridSection } from '@/features/landing/VehicleGridSection';
import { HowItWorksSection } from '@/features/landing/HowItWorksSection';
import { TrustSection } from '@/features/landing/TrustSection';
import { StatsSection } from '@/features/landing/StatsSection';
import { ZonesSection } from '@/features/landing/ZonesSection';
import { TestimonialsSection } from '@/features/landing/TestimonialsSection';
import { FAQSection } from '@/features/landing/FAQSection';
import { BecomeHostCTA } from '@/features/landing/BecomeHostCTA';
import { Footer } from '@/features/landing/Footer';

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

export default function HomePage() {
  return (
    <main>
      <BannerSection />
      <CategoriesSection />
      <VehicleGridSection />
      <HowItWorksSection />
      <TrustSection />
      <StatsSection />
      <ZonesSection />
      <TestimonialsSection />
      <FAQSection />
      <BecomeHostCTA />
      <Footer />
    </main>
  );
}

