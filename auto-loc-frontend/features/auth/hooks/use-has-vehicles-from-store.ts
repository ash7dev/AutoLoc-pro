'use client';

import { useRoleStore } from '../stores/role.store';

/**
 * Hook optimisé pour récupérer hasVehicles depuis le store Zustand.
 * Plus d'appel réseau à chaque rendu du navbar !
 * 
 * null  = pas encore chargé (au premier chargement)
 * true  = au moins un véhicule → afficher "Mon espace" 
 * false = aucun véhicule → afficher "Devenir hôte"
 */
export function useHasVehiclesFromStore(): boolean | null {
  return useRoleStore((state) => state.hasVehicles);
}
