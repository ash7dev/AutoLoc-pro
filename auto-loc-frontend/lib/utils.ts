import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let activeScrollLocks = 0;
let originalOverflowBody = "";
let originalOverflowHtml = "";

export function lockScroll() {
  if (typeof window === "undefined") return;
  if (activeScrollLocks === 0) {
    originalOverflowBody = document.body.style.overflow || "";
    originalOverflowHtml = document.documentElement.style.overflow || "";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
  activeScrollLocks++;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  activeScrollLocks = Math.max(0, activeScrollLocks - 1);
  if (activeScrollLocks === 0) {
    document.body.style.overflow = originalOverflowBody;
    document.documentElement.style.overflow = originalOverflowHtml;
  }
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
 * Calcule le prix locataire à partir du prix propriétaire par jour,
 * arrondi aux 100 FCFA les plus proches.
 */
export function getTenantPricePerDay(prixParJour: number): number {
  const rate = getCommissionRate(prixParJour);
  return roundToNearest100(prixParJour * (1 + rate));
}


