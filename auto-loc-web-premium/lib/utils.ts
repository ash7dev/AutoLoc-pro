import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Arrondit un montant aux 100 FCFA les plus proches.
 */
export function roundToNearest100(amount: number): number {
  return Math.round(amount / 100) * 100;
}

/** Taux de commission AutoLoc : 10% fixe, quel que soit le prix journalier. */
export const COMMISSION_RATE = 0.10;

export function getCommissionRate(_prixParJour?: number): number {
  return COMMISSION_RATE;
}

/**
 * Calcule le prix final affiché au locataire par jour (Prix Propriétaire + Commission AutoLoc),
 * arrondi aux 100 FCFA les plus proches.
 */
export function getTenantPricePerDay(prixProprietaire: number): number {
  const base = Math.max(0, Number(prixProprietaire) || 0);
  const rate = getCommissionRate(base);
  return roundToNearest100(base * (1 + rate));
}

/**
 * Borne le nombre de jours hors Dakar à [1, nbJours] (non renseigné → toute la durée).
 * Même règle que le serveur (resolveNbJoursHorsDakar).
 */
export function clampJoursHorsDakar(nbJours: number, joursHorsDakar?: number | null): number {
  if (nbJours <= 0) return 0;
  if (joursHorsDakar == null || !Number.isFinite(joursHorsDakar)) return nbJours;
  return Math.min(nbJours, Math.max(1, Math.floor(joursHorsDakar)));
}

/**
 * Formate un montant en FCFA avec séparateurs de milliers.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

/**
 * Formate une date ISO en chaîne lisible en français (ex: 15 oct. 2026).
 */
export function formatDateFr(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
