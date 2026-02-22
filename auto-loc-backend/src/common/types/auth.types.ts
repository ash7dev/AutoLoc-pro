/**
 * Payload JWT Supabase (claims utilisés côté backend).
 * Ne pas se fier au rôle dans le token : le rôle vient de la table profiles.
 */
export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  /** Souvent "authenticated" pour un utilisateur connecté */
  aud?: string | string[];
  exp: number;
  iat?: number;
  role?: string;
  [key: string]: unknown;
}

/**
 * Utilisateur injecté sur request après vérification JWT.
 * Correspond au payload décodé (sub = Supabase user id).
 */
export interface RequestUser {
  sub: string;
  email?: string;
  phone?: string;
}

/**
 * Profil exposé par GET /auth/me (table profiles).
 */
export interface ProfileResponse {
  id: string;
  userId: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
  // Indique si un profil métier (Utilisateur) est déjà créé.
  hasUtilisateur: boolean;
  // Renseigné après onboarding si disponible.
  utilisateurId?: string;
}
