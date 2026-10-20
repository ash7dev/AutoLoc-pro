import { CurrencyCode } from '../../shared/components/CurrencyPickerModal';
export type { CurrencyCode };

// Taux de conversion de référence par rapport au XOF (FCFA)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  XOF: 1,
  EUR: 1 / 655.957, // 1 EUR ≈ 655.957 FCFA
  USD: 1 / 600,     // 1 USD ≈ 600 FCFA
};

/** Taux de commission AutoLoc : 10% fixe, quel que soit le prix journalier. */
export const COMMISSION_RATE = 0.10;

export function getCommissionRate(_prixProprietaire?: number): number {
  return COMMISSION_RATE;
}

/**
 * Arrondit un montant aux 100 FCFA les plus proches.
 */
export function roundToNearest100(amount: number): number {
  return Math.round(amount / 100) * 100;
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
 * Convertit et formate le prix locataire (Prix Propriétaire + Commission) vers la devise cible.
 * 
 * Exemples (pour un prix propriétaire de 35 000 FCFA) :
 * - Commission : 10% -> Prix Locataire = 38 500 FCFA
 * - formatConvertedPrice(35000, 'XOF') -> "38 500 FCFA"
 * - formatConvertedPrice(35000, 'EUR') -> "62 €"
 * - formatConvertedPrice(35000, 'USD') -> "$67"
 */
export function formatConvertedPrice(
  prixProprietaire: number | undefined | null,
  currency: CurrencyCode = 'XOF'
): string {
  const baseOwnerPrice = Math.max(0, Number(prixProprietaire) || 0);
  const tenantPriceXOF = getTenantPricePerDay(baseOwnerPrice);

  if (currency === 'EUR') {
    const amountInEUR = Math.round(tenantPriceXOF * EXCHANGE_RATES.EUR);
    return `${amountInEUR.toLocaleString('fr-FR')} €`;
  }

  if (currency === 'USD') {
    const amountInUSD = Math.round(tenantPriceXOF * EXCHANGE_RATES.USD);
    return `$${amountInUSD.toLocaleString('en-US')}`;
  }

  // Défaut : XOF (FCFA)
  return `${tenantPriceXOF.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Formate un montant direct en XOF (déjà TTC ou frais fixe) vers la devise cible sans ré-appliquer de commission.
 */
export function formatDirectPrice(
  amountXOF: number | undefined | null,
  currency: CurrencyCode = 'XOF'
): string {
  const amount = Math.max(0, Number(amountXOF) || 0);

  if (currency === 'EUR') {
    const amountInEUR = Math.round(amount * EXCHANGE_RATES.EUR);
    return `${amountInEUR.toLocaleString('fr-FR')} €`;
  }

  if (currency === 'USD') {
    const amountInUSD = Math.round(amount * EXCHANGE_RATES.USD);
    return `$${amountInUSD.toLocaleString('en-US')}`;
  }

  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Alias export for direct currency formatting
 */
export const formatCurrency = formatDirectPrice;

/**
 * Calculateur complet avec décomposition détaillée du tarif
 */
export function calculateDetailedVehiclePricing(
  prixProprietaire: number,
  currency: CurrencyCode = 'XOF'
) {
  const ownerPriceXOF = Math.max(0, Number(prixProprietaire) || 0);
  const rate = getCommissionRate(ownerPriceXOF);
  const tenantPriceXOF = getTenantPricePerDay(ownerPriceXOF);
  const commissionAmountXOF = tenantPriceXOF - ownerPriceXOF;

  return {
    tenantPriceFormatted: formatConvertedPrice(ownerPriceXOF, currency),
    ownerBaseFormatted: `${ownerPriceXOF.toLocaleString('fr-FR')} FCFA`,
    commissionRatePercent: `${(rate * 100).toFixed(1)}%`,
    commissionAmountFormatted: `${commissionAmountXOF.toLocaleString('fr-FR')} FCFA`,
    rawTenantPriceXOF: tenantPriceXOF,
    rawOwnerXOF: ownerPriceXOF,
    rawCommissionXOF: commissionAmountXOF,
  };
}
