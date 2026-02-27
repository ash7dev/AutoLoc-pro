/**
 * Améliorations pour VehicleGridSection avec fallbacks robustes
 */

import { normalizeSearchResult, isValidVehicle } from '@/lib/nestjs/vehicle-fallbacks';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { useState, useCallback, useEffect } from 'react';

// ── Types étendus pour gérer les états partiels ───────────────────────────────

export interface EnhancedVehicleSearchResult extends VehicleSearchResult {
  // Champs calculés pour l'affichage
  hasPhoto: boolean;
  hasRating: boolean;
  isPopular: boolean;
  displayRating: number;
  displayLocations: number;
  fallbackUsed: boolean;
}

// ── Fonctions de normalisation pour le GridSection ─────────────────────────

export function enhanceVehicleData(vehicle: VehicleSearchResult): EnhancedVehicleSearchResult {
  const normalized = normalizeSearchResult(vehicle);
  
  return {
    ...normalized,
    // Champs calculés pour l'UI
    hasPhoto: !!normalized.photoUrl,
    hasRating: normalized.note > 0,
    isPopular: normalized.totalLocations >= 5,
    displayRating: Math.max(0, normalized.note),
    displayLocations: Math.max(0, normalized.totalLocations),
    fallbackUsed: !vehicle.photoUrl || !vehicle.note || vehicle.totalLocations === 0,
  };
}

export function createMockVehicles(count: number = 6): EnhancedVehicleSearchResult[] {
  // Crée des véhicules réalistes pour le MVP
  const mockData: Omit<VehicleSearchResult, 'id'>[] = [
    {
      marque: 'Toyota',
      modele: 'Yaris',
      annee: 2022,
      type: 'BERLINE',
      prixParJour: 25000,
      ville: 'Dakar',
      note: 4.5,
      totalLocations: 12,
      photoUrl: null, // Pas de photo pour tester le fallback
    },
    {
      marque: 'Hyundai',
      modele: 'Tucson', 
      annee: 2023,
      type: 'SUV',
      prixParJour: 35000,
      ville: 'Thiès',
      note: 0, // Pas encore d'avis
      totalLocations: 3,
      photoUrl: null,
    },
    {
      marque: 'Ford',
      modele: 'Ranger',
      annee: 2021,
      type: 'PICKUP',
      prixParJour: 45000,
      ville: 'Saint-Louis',
      note: 4.8,
      totalLocations: 8,
      photoUrl: null,
    },
    {
      marque: 'Dacia',
      modele: 'Duster',
      annee: 2022,
      type: 'SUV',
      prixParJour: 30000,
      ville: 'Kaolack',
      note: 4.2,
      totalLocations: 15,
      photoUrl: null,
    },
    {
      marque: 'Renault',
      modele: 'Kangoo',
      annee: 2023,
      type: 'UTILITAIRE',
      prixParJour: 28000,
      ville: 'Mbour',
      note: 0,
      totalLocations: 1,
      photoUrl: null,
    },
    {
      marque: 'Mitsubishi',
      modele: 'L200',
      annee: 2021,
      type: 'PICKUP',
      prixParJour: 42000,
      ville: 'Fatick',
      note: 4.6,
      totalLocations: 20,
      photoUrl: null,
    },
  ];

  return mockData.slice(0, count).map((vehicle, index) => 
    enhanceVehicleData({
      ...vehicle,
      id: `mock-${index + 1}`,
    })
  );
}

// ── Hook amélioré pour le VehicleGridSection ─────────────────────────────────

export interface UseVehicleGridOptions {
  enableMockData?: boolean; // Activer les données mock en MVP
  mockDataCount?: number;
  retryAttempts?: number;
}

export function useVehicleGrid(
  type?: string, 
  options: UseVehicleGridOptions = {}
) {
  const [vehicles, setVehicles] = useState<EnhancedVehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    enableMockData = false,
    mockDataCount = 6,
    retryAttempts = 3
  } = options;

  const fetchVehicles = useCallback(async (vehicleType?: string) => {
    setLoading(true);
    setError(false);
    
    try {
      // En mode MVP avec mock data
      if (enableMockData && retryCount === 0) {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockVehicles = createMockVehicles(mockDataCount);
        
        // Filtrer par type si nécessaire
        const filtered = vehicleType 
          ? mockVehicles.filter(v => v.type === vehicleType)
          : mockVehicles;
          
        setVehicles(filtered);
        return;
      }

      // Appel API normal
      const { searchVehicles } = await import('@/lib/nestjs/vehicles');
      const result = await searchVehicles({
        type: vehicleType as any,
      });

      // Valider et normaliser les données
      const validVehicles = (result.data || [])
        .filter(isValidVehicle)
        .map(enhanceVehicleData);

      setVehicles(validVehicles);

    } catch (err) {
      console.warn('API failed, using fallback data:', err);
      
      // Fallback : utiliser les mock data si l'API échoue
      if (enableMockData) {
        const fallbackVehicles = createMockVehicles(mockDataCount);
        const filtered = vehicleType 
          ? fallbackVehicles.filter(v => v.type === vehicleType)
          : fallbackVehicles;
        setVehicles(filtered);
      } else {
        setError(true);
        setVehicles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [enableMockData, mockDataCount, retryCount]);

  const retry = useCallback(() => {
    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1);
      fetchVehicles(type);
    }
  }, [fetchVehicles, type, retryCount, retryAttempts]);

  useEffect(() => {
    fetchVehicles(type);
  }, [fetchVehicles, type]);

  return {
    vehicles,
    loading,
    error,
    retry,
    retryCount,
    canRetry: retryCount < retryAttempts,
    hasData: vehicles.length > 0,
    hasFallbacks: vehicles.some(v => v.fallbackUsed),
  };
}

// ── État amélioré pour le MVP ─────────────────────────────────────────────────

export function getEmptyStateConfig(hasAttemptedLoad: boolean, enableMockData: boolean) {
  if (enableMockData && !hasAttemptedLoad) {
    return {
      title: "Chargement de la flotte...",
      subtitle: "Nous préparons les meilleures offres pour vous",
      showActions: true,
      isMVPMode: true,
    };
  }

  return {
    title: "Bientôt disponible",
    subtitle: "Notre flotte de véhicules vérifiés sera affichée ici très prochainement",
    showActions: true,
    isMVPMode: false,
  };
}
