import { QueryClient } from '@tanstack/react-query';

/**
 * Client React Query global pour l'application AutoLoc Mobile.
 * Configuré avec des valeurs par défaut optimisées pour les réseaux mobiles (3G/4G/5G) :
 * - staleTime: 5 minutes (évite le ré-envoi inutile de requêtes lors des retours sur un écran)
 * - gcTime: 24 heures (conserve les données en mémoire cache)
 * - refetchOnWindowFocus: false (évite les rafraîchissements intempestifs au retour en premier plan)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes de fraîcheur par défaut
      gcTime: 24 * 60 * 60 * 1000, // 24 heures en mémoire cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 2,
    },
  },
});
