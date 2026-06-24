import type { MetadataRoute } from 'next';
import { fetchAllVerifiedVehicles } from '@/lib/nestjs/vehicles';

const BASE_URL = 'https://www.autoloc.sn';

// Revalidate the sitemap at most once every hour to keep dynamic pages updated
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────────
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/explorer`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/become-owner`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Legal pages
    {
      url: `${BASE_URL}/cgu`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contrat-reservation`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Acquisition pages
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // ── Dynamic pages from verified vehicles ────────────────────────────────────
  let vehicles: Awaited<ReturnType<typeof fetchAllVerifiedVehicles>> = [];

  try {
    vehicles = await fetchAllVerifiedVehicles();
  } catch (err) {
    // Graceful degradation — return static pages only if API is unreachable
    console.error('[sitemap] Failed to fetch vehicles:', err);
    return staticPages;
  }

  // /location/{ville} — one entry per unique city
  const uniqueCities = Array.from(
    new Set(vehicles.map((v) => v?.ville).filter((ville): ville is string => typeof ville === 'string' && ville.trim().length > 0))
  );
  const cityPages: MetadataRoute.Sitemap = uniqueCities.map((ville) => ({
    url: `${BASE_URL}/location/${encodeURIComponent(ville.toLowerCase())}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // /vehicle/{id} — one entry per verified vehicle
  const vehiclePages: MetadataRoute.Sitemap = vehicles
    .filter((v) => v && v.id)
    .map((v) => ({
      url: `${BASE_URL}/vehicle/${v.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...cityPages, ...vehiclePages];
}
