import type { MetadataRoute } from 'next';
import { fetchAllVerifiedVehicles } from '@/lib/nestjs/vehicles';

const BASE_URL = 'https://autoloc.sn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/explorer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
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
  const uniqueCities = Array.from(new Set(vehicles.map((v) => v.ville)));
  const cityPages: MetadataRoute.Sitemap = uniqueCities.map((ville) => ({
    url: `${BASE_URL}/location/${encodeURIComponent(ville.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // /vehicle/{id} — one entry per verified vehicle
  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${BASE_URL}/vehicle/${v.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...vehiclePages];
}
