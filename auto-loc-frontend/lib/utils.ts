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
 * Taux de commission dégressif officiel AutoLoc :
 * - ≤ 20 000 FCFA / jour        : 17,5% (0.175)
 * - 20 001 à 35 000 FCFA / jour : 15,5% (0.155)
 * - 35 001 à 60 000 FCFA / jour : 13,5% (0.135)
 * - 60 001 à 100 000 FCFA / jour: 11,5% (0.115)
 * - > 100 000 FCFA / jour       : 10,0% (0.100)
 */
export function getCommissionRate(prixParJour: number): number {
  if (prixParJour <= 20000) return 0.175;
  if (prixParJour <= 35000) return 0.155;
  if (prixParJour <= 60000) return 0.135;
  if (prixParJour <= 100000) return 0.115;
  return 0.10;
}

/**
 * Calcule le prix locataire à partir du prix propriétaire par jour
 */
export function getTenantPricePerDay(prixParJour: number): number {
  const rate = getCommissionRate(prixParJour);
  return Math.round(prixParJour * (1 + rate));
}


