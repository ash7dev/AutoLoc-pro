import type { Metadata } from 'next';
import { BannerSection } from '@/features/landing/BannerSection';
import { CategoriesSection } from '@/features/landing/CategoriesSection';
import { TrustSection } from '@/features/landing/TrustSection';
import { VehicleGridSection } from '@/features/landing/VehicleGridSection';
import { unstable_cache } from 'next/cache';
import { fetchHomeFeed, fetchMobileFeed, searchVehicles, type HomeFeedResponse, type VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { HowItWorksSection } from '@/features/landing/HowItWorksSection';
import { StatsSection } from '@/features/landing/StatsSection';
import { ZonesSection } from '@/features/landing/ZonesSection';
import { TestimonialsSection } from '@/features/landing/TestimonialsSection';
import { FAQSection } from '@/features/landing/FAQSection';
import { BecomeHostCTA } from '@/features/landing/BecomeHostCTA';
import { Footer } from '@/features/landing/Footer';
import { HomeSessionRedirect } from '@/features/auth/components/home-session-redirect';
import { HomeMobile } from '@/features/landing/HomeMobile';
import { CACHE_DURATIONS, CACHE_TAGS } from '@/lib/cache-config';

export const metadata: Metadata = {
  title: 'AutoLoc — Location de véhicules au Sénégal',
  description:
    'Trouvez et réservez un véhicule vérifié au Sénégal : SUV, berlines, pick-ups, utilitaires. Disponible à Dakar, Thiès, Saint-Louis et partout au Sénégal.',
  alternates: {
    canonical: 'https://www.autoloc.sn',
  },
  openGraph: {
    url: 'https://www.autoloc.sn',
    title: 'AutoLoc — Location de véhicules au Sénégal',
    description:
      'Trouvez et réservez un véhicule vérifié au Sénégal : SUV, berlines, pick-ups, utilitaires. Disponible à Dakar et partout au Sénégal.',
  },
};

export const revalidate = 60;

function buildInitialVehicles(feed: HomeFeedResponse | null): VehicleSearchResult[] {
  if (!feed) return [];
  const byId = new Map<string, VehicleSearchResult>();
  for (const vehicle of [
    ...feed.premium,
    ...feed.recommended.items,
    ...feed.nouveautes,
  ]) {
    if (!byId.has(vehicle.id)) byId.set(vehicle.id, vehicle);
  }
  return Array.from(byId.values());
}

const getCachedHomeFeed = unstable_cache(
  () => fetchHomeFeed(),
  ['home-feed'],
  { revalidate: CACHE_DURATIONS.standard, tags: [CACHE_TAGS.public_feed] },
);

const getCachedMobileFeed = unstable_cache(
  () => fetchMobileFeed(),
  ['mobile-home-feed'],
  { revalidate: CACHE_DURATIONS.standard, tags: [CACHE_TAGS.mobile_feed] },
);

export default async function HomePage() {
  let initialVehicles: VehicleSearchResult[] = [];
  const [homeFeedResult, mobileFeedResult] = await Promise.allSettled([
    getCachedHomeFeed(),
    getCachedMobileFeed(),
  ]);
  const homeFeed = homeFeedResult.status === 'fulfilled' ? homeFeedResult.value : null;
  const mobileFeed = mobileFeedResult.status === 'fulfilled' ? mobileFeedResult.value : null;

  try {
    initialVehicles = buildInitialVehicles(homeFeed);
    if (initialVehicles.length === 0) {
      const vehiclesRes = await searchVehicles({ page: 1 });
      initialVehicles = vehiclesRes?.data ?? [];
    }
  } catch {
    try {
      const vehiclesRes = await searchVehicles({ page: 1 });
      initialVehicles = vehiclesRes?.data ?? [];
    } catch {
      // fallback to client fetch
    }
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'AutoLoc',
    'url': 'https://www.autoloc.sn',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://www.autoloc.sn/explorer?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Comment réserver un véhicule sur AutoLoc ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'C\'est très simple ! Parcourez les véhicules disponibles, choisissez vos dates de location, puis cliquez sur "Réserver". Vous recevrez une confirmation instantanée par email et SMS.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Quels documents sont nécessaires pour louer ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Vous aurez besoin d\'une pièce d\'identité valide (CNI ou passeport), d\'un permis de conduire en cours de validité, et d\'un justificatif de domicile.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Puis-je annuler ma réservation ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Oui, vous pouvez annuler jusqu\'à 24h avant la prise en charge pour un remboursement complet. Consultez nos conditions pour plus de détails.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Comment sont vérifiés les locataires ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Chaque locataire doit soumettre une pièce d\'identité valide et un permis de conduire avant de pouvoir effectuer une réservation.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Comment devenir propriétaire sur AutoLoc ?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Inscrivez-vous, ajoutez votre véhicule avec photos et documents, et notre équipe le vérifiera sous 24h. C\'est simple et gratuit !'
        }
      }
    ]
  };

  return (
    <main className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
