/**
 * Stratégies d'affichage adaptatives pour VehicleGridSection
 * Gère l'affichage selon le nombre de véhicules disponibles
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { EnhancedVehicleSearchResult } from './vehicle-grid-enhancements';

// ── Configuration des stratégies d'affichage ─────────────────────────────────────

export interface DisplayStrategy {
  name: string;
  featuredCount: number;      // Nombre de véhicules en "featured"
  gridColumns: {              // Colonnes de la grille selon breakpoint
    mobile: number;
    tablet: number;
    desktop: number;
  };
  maxGridItems: number;       // Maximum d'éléments dans la grille
  showFilters: boolean;        // Afficher les filtres
  showViewAll: boolean;        // Afficher "Voir tous"
  priorityRules: PriorityRule[]; // Règles de priorité
}

export interface PriorityRule {
  field: keyof EnhancedVehicleSearchResult;
  direction: 'asc' | 'desc';
  weight: number; // 1-10, plus important = plus de poids
}

// ── Stratégies prédéfinies selon le volume ───────────────────────────────────────

export const DISPLAY_STRATEGIES: Record<string, DisplayStrategy> = {
  // Très peu de véhicules (1-3)
  sparse: {
    name: 'sparse',
    featuredCount: 1,
    gridColumns: { mobile: 1, tablet: 2, desktop: 2 },
    maxGridItems: 2,
    showFilters: false,        // Pas utile avec peu de choix
    showViewAll: false,        // Pas de "voir tous" si tout est affiché
    priorityRules: [
      { field: 'totalLocations', direction: 'desc', weight: 8 }, // Plus loués d'abord
      { field: 'note', direction: 'desc', weight: 7 },          // Mieux notés
      { field: 'prixParJour', direction: 'asc', weight: 5 },   // Moins chers
    ],
  },

  // Peu de véhicules (4-6)
  limited: {
    name: 'limited',
    featuredCount: 1,
    gridColumns: { mobile: 1, tablet: 2, desktop: 3 },
    maxGridItems: 5,
    showFilters: true,
    showViewAll: false,
    priorityRules: [
      { field: 'isPopular', direction: 'desc', weight: 9 },        // Populaires en premier
      { field: 'totalLocations', direction: 'desc', weight: 7 },
      { field: 'note', direction: 'desc', weight: 6 },
      { field: 'prixParJour', direction: 'asc', weight: 4 },
    ],
  },

  // Volume normal (7-12)
  normal: {
    name: 'normal',
    featuredCount: 1,
    gridColumns: { mobile: 1, tablet: 2, desktop: 3 },
    maxGridItems: 8,
    showFilters: true,
    showViewAll: true,
    priorityRules: [
      { field: 'hasPhoto', direction: 'desc', weight: 8 },         // Avec photo en premier
      { field: 'isPopular', direction: 'desc', weight: 7 },
      { field: 'note', direction: 'desc', weight: 6 },
      { field: 'totalLocations', direction: 'desc', weight: 5 },
      { field: 'prixParJour', direction: 'asc', weight: 3 },
    ],
  },

  // Beaucoup de véhicules (13+)
  abundant: {
    name: 'abundant',
    featuredCount: 2,        // 2 featured quand beaucoup de choix
    gridColumns: { mobile: 1, tablet: 2, desktop: 4 },
    maxGridItems: 12,
    showFilters: true,
    showViewAll: true,
    priorityRules: [
      { field: 'hasPhoto', direction: 'desc', weight: 9 },
      { field: 'isPopular', direction: 'desc', weight: 8 },
      { field: 'note', direction: 'desc', weight: 7 },
      { field: 'totalLocations', direction: 'desc', weight: 6 },
      { field: 'prixParJour', direction: 'asc', weight: 4 },
      { field: 'fallbackUsed', direction: 'asc', weight: 2 },      // Réels avant démo
    ],
  },
};

// ── Logique de sélection de stratégie ─────────────────────────────────────────────

export function selectDisplayStrategy(
  vehicleCount: number,
  hasFilters: boolean = true
): DisplayStrategy {
  if (vehicleCount <= 3) return DISPLAY_STRATEGIES.sparse;
  if (vehicleCount <= 6) return DISPLAY_STRATEGIES.limited;
  if (vehicleCount <= 12) return DISPLAY_STRATEGIES.normal;
  return DISPLAY_STRATEGIES.abundant;
}

// ── Système de scoring et de tri ─────────────────────────────────────────────────

export function calculateVehicleScore(
  vehicle: EnhancedVehicleSearchResult,
  rules: PriorityRule[]
): number {
  let score = 0;

  rules.forEach(rule => {
    let value: any = vehicle[rule.field];
    let normalizedValue = 0;

    // Normalisation des valeurs selon le type
    switch (rule.field) {
      case 'hasPhoto':
      case 'isPopular':
      case 'fallbackUsed':
        normalizedValue = value ? 1 : 0;
        break;
      case 'note':
        normalizedValue = (value || 0) / 5; // Normalise entre 0 et 1
        break;
      case 'totalLocations':
        normalizedValue = Math.min((value || 0) / 20, 1); // Plafonne à 20 locations
        break;
      case 'prixParJour':
        normalizedValue = Math.max(0, 1 - ((value || 0) / 100000)); // Inverse, plafonne à 100k
        break;
      default:
        normalizedValue = 0;
    }

    // Applique le poids et la direction
    const contribution = rule.direction === 'desc' 
      ? normalizedValue * rule.weight 
      : (1 - normalizedValue) * rule.weight;
    
    score += contribution;
  });

  return score;
}

export function sortVehiclesByPriority(
  vehicles: EnhancedVehicleSearchResult[],
  strategy: DisplayStrategy
): EnhancedVehicleSearchResult[] {
  return [...vehicles].sort((a, b) => {
    const scoreA = calculateVehicleScore(a, strategy.priorityRules);
    const scoreB = calculateVehicleScore(b, strategy.priorityRules);
    return scoreB - scoreA; // Du plus haut score au plus bas
  });
}

// ── Distribution des véhicules selon la stratégie ───────────────────────────────

export interface VehicleDistribution {
  featured: EnhancedVehicleSearchResult[];
  grid: EnhancedVehicleSearchResult[];
  hidden: EnhancedVehicleSearchResult[];
  total: number;
  strategy: DisplayStrategy;
}

export function distributeVehicles(
  vehicles: EnhancedVehicleSearchResult[],
  strategy: DisplayStrategy
): VehicleDistribution {
  const sorted = sortVehiclesByPriority(vehicles, strategy);
  
  const featured = sorted.slice(0, strategy.featuredCount);
  const grid = sorted.slice(strategy.featuredCount, strategy.featuredCount + strategy.maxGridItems);
  const hidden = sorted.slice(strategy.featuredCount + strategy.maxGridItems);

  return {
    featured,
    grid,
    hidden,
    total: vehicles.length,
    strategy,
  };
}

// ── Hook pour la gestion adaptative ───────────────────────────────────────────────

export interface AdaptiveDisplayOptions {
  enableAutoStrategy?: boolean;
  forceStrategy?: keyof typeof DISPLAY_STRATEGIES;
  customPriorityRules?: PriorityRule[];
  maxFeatured?: number;
  maxGridItems?: number;
}

export function useAdaptiveVehicleDisplay(
  vehicles: EnhancedVehicleSearchResult[],
  options: AdaptiveDisplayOptions = {}
) {
  const {
    enableAutoStrategy = true,
    forceStrategy,
    customPriorityRules,
    maxFeatured,
    maxGridItems,
  } = options;

  // Sélection de la stratégie
  const strategy = useMemo(() => {
    if (forceStrategy) {
      return {
        ...DISPLAY_STRATEGIES[forceStrategy],
        ...(customPriorityRules && { priorityRules: customPriorityRules }),
        ...(maxFeatured && { featuredCount: maxFeatured }),
        ...(maxGridItems && { maxGridItems: maxGridItems }),
      };
    }

    const autoStrategy = selectDisplayStrategy(vehicles.length);
    return {
      ...autoStrategy,
      ...(customPriorityRules && { priorityRules: customPriorityRules }),
      ...(maxFeatured && { featuredCount: Math.min(maxFeatured, autoStrategy.featuredCount) }),
      ...(maxGridItems && { maxGridItems: Math.min(maxGridItems, autoStrategy.maxGridItems) }),
    };
  }, [vehicles.length, forceStrategy, customPriorityRules, maxFeatured, maxGridItems]);

  // Distribution des véhicules
  const distribution = useMemo(() => {
    return distributeVehicles(vehicles, strategy);
  }, [vehicles, strategy]);

  // Classes CSS dynamiques
  const gridClasses = useMemo(() => {
    const { gridColumns } = strategy;
    return cn(
      'grid gap-5',
      `grid-cols-${gridColumns.mobile}`,
      `sm:grid-cols-${gridColumns.tablet}`,
      `lg:grid-cols-${gridColumns.desktop}`
    );
  }, [strategy]);

  return {
    strategy,
    distribution,
    gridClasses,
    showFilters: strategy.showFilters,
    showViewAll: strategy.showViewAll && distribution.hidden.length > 0,
    stats: {
      total: distribution.total,
      featured: distribution.featured.length,
      grid: distribution.grid.length,
      hidden: distribution.hidden.length,
      hasFallbacks: vehicles.some(v => v.fallbackUsed),
    },
  };
}

// ── Utilitaires pour l'affichage conditionnel ─────────────────────────────────────

export function getDisplayHints(strategy: DisplayStrategy, vehicleCount: number) {
  const hints = {
    title: '',
    subtitle: '',
    showEmptyState: false,
    showPromotionalBanner: false,
  };

  switch (strategy.name) {
    case 'sparse':
      hints.title = vehicleCount === 1 ? 'Notre sélection' : 'Nos meilleures offres';
      hints.subtitle = vehicleCount <= 2 
        ? 'Découvrez les véhicules disponibles actuellement'
        : 'Une sélection choisie pour vous';
      break;

    case 'limited':
      hints.title = 'Véhicules disponibles';
      hints.subtitle = `${vehicleCount} véhicules vérifiés disponibles maintenant`;
      hints.showPromotionalBanner = vehicleCount <= 4;
      break;

    case 'normal':
      hints.title = 'Véhicules disponibles';
      hints.subtitle = `Découvrez notre sélection de ${vehicleCount} véhicules vérifiés`;
      break;

    case 'abundant':
      hints.title = 'Large sélection de véhicules';
      hints.subtitle = `Plus de ${vehicleCount} véhicules vérifiés partout au Sénégal`;
      break;
  }

  return hints;
}

// ── Exemples d'utilisation ─────────────────────────────────────────────────────

/*
// 1. Utilisation automatique (recommandé)
const { strategy, distribution, gridClasses, showFilters } = useAdaptiveVehicleDisplay(vehicles);

// 2. Forcer une stratégie spécifique
const { strategy, distribution } = useAdaptiveVehicleDisplay(vehicles, {
  forceStrategy: 'abundant',
  maxFeatured: 3,
});

// 3. Règles de priorité personnalisées
const { distribution } = useAdaptiveVehicleDisplay(vehicles, {
  customPriorityRules: [
    { field: 'prixParJour', direction: 'asc', weight: 10 }, // Priorité prix bas
    { field: 'hasPhoto', direction: 'desc', weight: 8 },
  ],
});

// 4. Adaptation selon le contexte (ex: page d'accueil vs recherche)
const homePageStrategy = useAdaptiveVehicleDisplay(vehicles, {
  forceStrategy: 'normal',
  maxFeatured: 2,
});

const searchPageStrategy = useAdaptiveVehicleDisplay(vehicles, {
  enableAutoStrategy: true,
  maxGridItems: 20, // Plus de résultats en page de recherche
});
*/
