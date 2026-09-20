import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner les classes Tailwind proprement (clsx + tailwind-merge)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant numérique en Franc CFA (ex: 35000 -> "35 000 FCFA")
 */
export function formatPriceFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 FCFA";
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

/**
 * Formate une date au format français lisible (ex: "19 Septembre 2026")
 */
export function formatDateFR(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
