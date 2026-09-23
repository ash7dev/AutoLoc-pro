import { UserProfile, UserRole, PendingIntent } from '../../types/user';

/**
 * Normalise n'importe quelle variante de rôle (français/anglais/brut) vers le UserRole canonique.
 * Ex: 'OWNER' -> 'PROPRIETAIRE', 'RENTER' -> 'LOCATAIRE', 'ADMIN' -> 'ADMIN'
 */
export function normalizeRole(rawRole?: string | null): UserRole {
  if (!rawRole) return 'LOCATAIRE';

  const upper = rawRole.trim().toUpperCase();

  if (upper === 'OWNER' || upper === 'PROPRIETAIRE' || upper === 'HOST') {
    return 'PROPRIETAIRE';
  }
  if (upper === 'ADMIN' || upper === 'SUPER_ADMIN') {
    return 'ADMIN';
  }
  if (upper === 'SUPPORT') {
    return 'SUPPORT';
  }
  return 'LOCATAIRE';
}

/**
 * Calcule l'URL de redirection appropriée après une authentification réussie (Login / Register).
 * Priorité :
 * 1. Intention explicite en attente (ex: réservation d'une voiture spécifique)
 * 2. Espace Métier selon le rôle normalisé :
 *    - ADMIN -> '/admin'
 *    - PROPRIETAIRE -> '/dashboard'
 *    - LOCATAIRE -> '/' (ou '/reservations' si spécifié)
 */
export function getPostAuthRedirectUrl(
  user?: UserProfile | null,
  pendingIntent?: PendingIntent | null
): string {
  // 1. Si une intention explicite de redirection est stockée dans le gatekeeper
  if (pendingIntent?.redirectToUrl) {
    return pendingIntent.redirectToUrl;
  }

  if (!user) return '/';

  const role = normalizeRole(user.role);

  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PROPRIETAIRE':
      return '/dashboard';
    case 'LOCATAIRE':
    default:
      return '/';
  }
}

/**
 * Écrit les cookies de session pour Next.js (Middleware Edge & Server Components)
 */
export function setAuthCookies(token: string, role: string) {
  if (typeof document === 'undefined') return;

  const normalized = normalizeRole(role);
  const maxAge = 60 * 60 * 24 * 30; // 30 jours

  // Cookie de Token JWT
  document.cookie = `autoloc_token=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;

  // Cookie de Rôle Actif pour le Middleware Edge (0ms redirection)
  document.cookie = `autoloc_role=${encodeURIComponent(
    normalized
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Supprime les cookies de session lors du logout
 */
export function clearAuthCookies() {
  if (typeof document === 'undefined') return;

  document.cookie = 'autoloc_token=; Path=/; Max-Age=0; SameSite=Lax';
  document.cookie = 'autoloc_role=; Path=/; Max-Age=0; SameSite=Lax';
}
