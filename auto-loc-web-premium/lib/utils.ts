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

/**
 * Taux de commission dégressif officiel AutoLoc :
 * - ≤ 20 000 FCFA / jour        : 17,5% (0.175)
 * - 20 001 à 35 000 FCFA / jour : 15,5% (0.155)
 * - 35 001 à 60 000 FCFA / jour : 13,5% (0.135)
 * - 60 001 à 100 000 FCFA / jour: 11,5% (0.115)
 * - > 100 000 FCFA / jour       : 10,0% (0.100)
 */
export function getCommissionRate(prixParJour: number): number {
  const base = Math.max(0, Number(prixParJour) || 0);
  if (base <= 20000) return 0.175;
  if (base <= 35000) return 0.155;
  if (base <= 60000) return 0.135;
  if (base <= 100000) return 0.115;
  return 0.10;
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
 * Formate un montant en FCFA avec séparateurs de milliers.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}
