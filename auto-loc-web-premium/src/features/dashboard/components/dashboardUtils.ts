import { formatCurrency } from '@/lib/utils';

/** Montant tel que l'API peut le renvoyer (number ou string décimale, ex. wallet). */
export type Amount = number | string | null | undefined;

export const toNumber = (value: Amount): number => {
    const n = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
    return Number.isFinite(n) ? n : 0;
};

export const fcfa = (value: Amount): string => `${formatCurrency(toNumber(value))} FCFA`;

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const compactNumber = new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

export const decimal1 = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** "2026-09-21T10:00:00Z" -> "21 sept." (chaîne vide si date invalide) */
export const formatShortDate = (value?: string): string => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : dayMonth.format(d);
};

export const initialsOf = (prenom?: string, nom?: string): string =>
    ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase() || '?';

/**
 * Routes de l'espace owner utilisées par les liens du dashboard.
 * À adapter en un seul endroit si tes URLs diffèrent.
 */
export const OWNER_ROUTES = {
    reservations: '/dashboard/reservations',
    wallet: '/dashboard/wallet',
    fleet: '/dashboard/vehicles',
    newListing: '/dashboard/vehicles/new',
    stats: '/dashboard#stats',
    profile: '/profile',
} as const;