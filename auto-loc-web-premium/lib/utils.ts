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

export interface PriceTierInput {
  joursMin: number | string;
  joursMax?: number | string | null;
  prix: number | string;
}

/**
 * Prix journalier propriétaire selon les paliers dégressifs.
 * Même règle que le serveur (resolveTieredPrice) : paliers triés par joursMin, premier qui correspond.
 */
export function resolveTieredPrice(prixParJour: number, nbJours: number, tiers?: PriceTierInput[] | null): number {
  const base = Math.max(0, Number(prixParJour) || 0);
  if (!tiers || tiers.length === 0) return base;
  const days = Math.max(1, nbJours);
  const sorted = [...tiers].sort((a, b) => Number(a.joursMin) - Number(b.joursMin));
  const match = sorted.find((t) => {
    const max = t.joursMax == null || t.joursMax === '' ? Infinity : Number(t.joursMax);
    return days >= Number(t.joursMin) && days <= max;
  });
  return match ? Number(match.prix) : base;
}

export interface TenantQuote {
  nbJours: number;
  /** Prix propriétaire par jour, palier appliqué. */
  prixParJour: number;
  location: number;
  horsDakar: { prixParJour: number; nbJours: number; montant: number } | null;
  chauffeur: { prixParJour: number; nbJours: number; montant: number } | null;
  livraison: number;
  /** Frais de service AutoLoc : 10% de la location seule, arrondis aux 100 FCFA. */
  fraisService: number;
  total: number;
  revenuProprietaire: number;
}

/**
 * Devis locataire — reproduit exactement le calcul serveur (ReservationPricingService).
 */
export function computeTenantQuote(input: {
  prixParJour: number;
  nbJours: number;
  tiers?: PriceTierInput[] | null;
  supplementHorsDakarParJour?: number | null;
  nbJoursHorsDakar?: number | null;
  prixChauffeurParJour?: number | null;
  fraisLivraison?: number | null;
}): TenantQuote {
  const nbJours = Math.max(0, Math.floor(input.nbJours || 0));
  const prixParJour = resolveTieredPrice(input.prixParJour, nbJours, input.tiers);
  const location = prixParJour * nbJours;

  const hdPrix = Math.max(0, Number(input.supplementHorsDakarParJour) || 0);
  const hdJours = hdPrix > 0 ? clampJoursHorsDakar(nbJours, input.nbJoursHorsDakar) : 0;
  const horsDakar = hdPrix > 0 && hdJours > 0
    ? { prixParJour: hdPrix, nbJours: hdJours, montant: hdPrix * hdJours }
    : null;

  const chPrix = Math.max(0, Number(input.prixChauffeurParJour) || 0);
  const chauffeur = chPrix > 0 && nbJours > 0
    ? { prixParJour: chPrix, nbJours, montant: chPrix * nbJours }
    : null;

  const livraison = Math.max(0, Number(input.fraisLivraison) || 0);
  const fraisService = roundToNearest100(location * COMMISSION_RATE);
  const revenuProprietaire = location + (horsDakar?.montant ?? 0) + (chauffeur?.montant ?? 0);

  return {
    nbJours,
    prixParJour,
    location,
    horsDakar,
    chauffeur,
    livraison,
    fraisService,
    total: revenuProprietaire + fraisService + livraison,
    revenuProprietaire,
  };
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
