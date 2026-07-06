/**
 * Configuration de cache pour optimiser les performances
 * Utilise Next.js unstable_cache pour mettre en cache côté serveur
 */

export const CACHE_TAGS = {
  owner_stats: 'owner-stats',
  owner_reservations: 'owner-reservations',
  owner_vehicles: 'owner-vehicles',
  owner_wallet: 'owner-wallet',
  owner_penalties: 'owner-penalties',
  owner_transactions: 'owner-transactions',
  owner_reviews: 'owner-reviews',
  owner_profile: 'owner-profile',
  owner_analytics: 'owner-analytics',
  tenant_reservations: 'tenant-reservations',
  public_feed: 'feed',
  mobile_feed: 'mobile-feed',
  vehicle_search: 'vehicle-search',
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

function hashToken(token: string): string {
  let hash = 5381;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 33) ^ token.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Tag privé par propriétaire. On ne met jamais le token brut dans le tag.
 */
export function getOwnerScopedTag(tag: string, token: string): string {
  return `${tag}:${hashToken(token)}`;
}

export function getOwnerCacheTags(tag: string, token: string): string[] {
  return [tag, getOwnerScopedTag(tag, token)];
}

export function getScopedTag(tag: string, token: string): string {
  return `${tag}:${hashToken(token)}`;
}

export function getScopedCacheTags(tag: string, token: string): string[] {
  return [tag, getScopedTag(tag, token)];
}

/**
 * Génère une clé de cache unique incluant le token et un timestamp optionnel
 */
export function getCacheKey(prefix: string, token: string, ...args: (string | number)[]): string[] {
  return [prefix, token, ...args.map(String)].filter(Boolean) as string[];
}
