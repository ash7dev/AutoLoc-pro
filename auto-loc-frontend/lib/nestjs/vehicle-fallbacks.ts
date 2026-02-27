/**
 * Utilitaires de fallback pour les données véhicules
 * Gère les incohérences entre les réponses API et les attentes du frontend
 */

import type { Vehicle, VehicleSearchResult, TarifTier } from './vehicles';

// ── Fallbacks pour les données manquantes ─────────────────────────────────────

export function createFallbackPricing(basePrice: number, days: number) {
  return {
    nbJours: days,
    prixParJour: basePrice,
    totalBase: basePrice * days,
    tauxCommission: 0.15,
    montantCommission: Math.round(basePrice * days * 0.15),
    totalLocataire: Math.round(basePrice * days * 1.15),
    netProprietaire: basePrice * days,
  };
}

export function createFallbackTiers(basePrice: number): TarifTier[] {
  return [
    {
      id: 'fallback-1',
      vehiculeId: 'fallback',
      joursMin: 1,
      joursMax: 6,
      prix: basePrice,
      position: 1,
    },
    {
      id: 'fallback-2', 
      vehiculeId: 'fallback',
      joursMin: 7,
      joursMax: 29,
      prix: Math.round(basePrice * 0.9), // -10%
      position: 2,
    },
    {
      id: 'fallback-3',
      vehiculeId: 'fallback', 
      joursMin: 30,
      joursMax: null,
      prix: Math.round(basePrice * 0.8), // -20%
      position: 3,
    },
  ];
}

// ── Normalisation des données ─────────────────────────────────────────────────

export function normalizeVehicleData(data: Vehicle): Vehicle {
  // Garantit que toutes les propriétés requises existent
  return {
    ...data,
    // Champs optionnels avec valeurs par défaut
    carburant: data.carburant ?? 'ESSENCE',
    transmission: data.transmission ?? 'MANUELLE', 
    nombrePlaces: data.nombrePlaces ?? 5,
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    joursMinimum: data.joursMinimum ?? 1,
    ageMinimum: data.ageMinimum ?? 21,
    zoneConduite: data.zoneConduite ?? 'Sénégal',
    assurance: data.assurance ?? 'Assurance standard',
    reglesSpecifiques: data.reglesSpecifiques ?? null,
    note: data.note ?? 0,
    totalAvis: data.totalAvis ?? 0,
    totalLocations: data.totalLocations ?? 0,
    // Gestion des tableaux
    photos: data.photos ?? [],
    tarifsProgressifs: data.tarifsProgressifs ?? [],
  };
}

export function normalizeSearchResult(data: VehicleSearchResult): VehicleSearchResult {
  return {
    ...data,
    photoUrl: data.photoUrl ?? null,
    note: data.note ?? 0,
    totalLocations: data.totalLocations ?? 0,
  };
}

// ── Validation et sécurité ───────────────────────────────────────────────────

export function isValidVehicle(data: any): data is Vehicle {
  return data && 
    typeof data.id === 'string' &&
    typeof data.marque === 'string' &&
    typeof data.modele === 'string' &&
    typeof data.prixParJour === 'number' &&
    data.prixParJour > 0;
}

export function sanitizePricingResponse(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid pricing response');
  }
  
  return {
    nbJours: Math.max(1, data.nbJours ?? 1),
    prixParJour: Math.max(0, data.prixParJour ?? 0),
    totalBase: Math.max(0, data.totalBase ?? 0),
    tauxCommission: Math.max(0, Math.min(1, data.tauxCommission ?? 0.15)),
    montantCommission: Math.max(0, data.montantCommission ?? 0),
    totalLocataire: Math.max(0, data.totalLocataire ?? 0),
    netProprietaire: Math.max(0, data.netProprietaire ?? 0),
  };
}

// ── Hooks utilitaires ────────────────────────────────────────────────────────

export function useVehicleWithFallback(vehicleData: Vehicle | null) {
  if (!vehicleData) {
    return null;
  }
  
  try {
    // Normalise les données pour garantir la cohérence
    return normalizeVehicleData(vehicleData);
  } catch (error) {
    console.error('Error normalizing vehicle data:', error);
    return null;
  }
}

export function usePricingWithFallback(
  vehicleId: string, 
  days: number, 
  basePrice: number
) {
  // Wrapper pour fetchVehiclePricing avec fallback automatique
  return async function fetchWithFallback() {
    try {
      const { fetchVehiclePricing } = await import('./vehicles');
      const pricing = await fetchVehiclePricing(vehicleId, days);
      return sanitizePricingResponse(pricing);
    } catch (error) {
      console.warn('Pricing API failed, using fallback:', error);
      return createFallbackPricing(basePrice, days);
    }
  };
}
