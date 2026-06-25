/**
 * Configuration de cache pour optimiser les performances
 * Utilise Next.js unstable_cache pour mettre en cache côté serveur
 */

export const CACHE_TAGS = {
  owner_stats: 'owner-stats',
  owner_reservations: 'owner-reservations',
  owner_vehicles: 'owner-vehicles',
  owner_wallet: 'owner-wallet',
  owner_reviews: 'owner-reviews',
  owner_profile: 'owner-profile',
} as const;

export const CACHE_DURATIONS = {
  // Cache court pour données critiques (statut wallet, réservations actives)
  critical: 5, // 5 secondes

  // Cache moyen pour données semi-statiques (stats, véhicules)
  standard: 30, // 30 secondes

  // Cache long pour données statiques (profil, reviews)
  long: 60, // 1 minute

  // Cache très long pour données rarement modifiées
  extended: 300, // 5 minutes
} as const;

/**
 * Génère une clé de cache unique incluant le token et un timestamp optionnel
 */
export function getCacheKey(prefix: string, token: string, ...args: (string | number)[]): string[] {
  return [prefix, token, ...args.map(String)].filter(Boolean) as string[];
}
