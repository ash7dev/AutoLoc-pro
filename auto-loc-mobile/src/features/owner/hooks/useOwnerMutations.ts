import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerApi, OwnerBooking, OwnerVehicle } from '../api/ownerApi';
import { OWNER_QUERY_KEYS } from './useOwnerDashboard';

export function useOwnerMutations() {
  const queryClient = useQueryClient();

  // Helper pour tout rafraîchir en cas de modification d'inventaire ou statut
  const invalidateAllFeeds = () => {
    queryClient.invalidateQueries({ queryKey: ['mobileTenantFeed'] });
    queryClient.invalidateQueries({ queryKey: ['exploreVehiclesFeed'] });
  };

  // 1. Mutation pour répondre à une réservation (Approuver ou Refuser)
  const respondBookingMutation = useMutation({
    mutationFn: async ({ bookingId, accept }: { bookingId: string; accept: boolean }) => {
      return ownerApi.respondToBookingRequest(bookingId, accept);
    },
    onMutate: async ({ bookingId, accept }) => {
      await queryClient.cancelQueries({ queryKey: OWNER_QUERY_KEYS.bookings });

      const previousBookings = queryClient.getQueryData<OwnerBooking[]>(OWNER_QUERY_KEYS.bookings);

      if (previousBookings) {
        const nextBookings = previousBookings.map((b) => {
          if (b.id === bookingId) {
            return {
              ...b,
              statut: (accept ? 'CONFIRMED' : 'REJECTED') as OwnerBooking['statut'],
            };
          }
          return b;
        });
        queryClient.setQueryData(OWNER_QUERY_KEYS.bookings, nextBookings);
      }

      return { previousBookings };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(OWNER_QUERY_KEYS.bookings, context.previousBookings);
      }
    },
    onSettled: () => {
      // Invalidation synchronisée Owner + Tenant
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.bookings });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.wallet });
      queryClient.invalidateQueries({ queryKey: ['tenantBookings'] });
    },
  });

  // 2. Mutation pour modifier le statut d'un véhicule (Disponible / Désactivé) avec update optimiste
  const updateVehicleStatusMutation = useMutation({
    mutationFn: async ({ vehicleId, status }: { vehicleId: string; status: OwnerVehicle['statut'] }) => {
      return ownerApi.updateVehicleStatus(vehicleId, status);
    },
    onMutate: async ({ vehicleId, status }) => {
      await queryClient.cancelQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      const previousVehicles = queryClient.getQueryData<OwnerVehicle[]>(OWNER_QUERY_KEYS.vehicles);

      if (previousVehicles) {
        queryClient.setQueryData<OwnerVehicle[]>(
          OWNER_QUERY_KEYS.vehicles,
          previousVehicles.map((v) => (v.id === vehicleId ? { ...v, statut: status } : v))
        );
      }
      return { previousVehicles };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousVehicles) {
        queryClient.setQueryData(OWNER_QUERY_KEYS.vehicles, context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
      invalidateAllFeeds();
    },
  });

  // 3. Mutation pour archiver un véhicule avec suppression optimiste
  const archiveVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return ownerApi.archiveVehicle(vehicleId);
    },
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      const previousVehicles = queryClient.getQueryData<OwnerVehicle[]>(OWNER_QUERY_KEYS.vehicles);

      if (previousVehicles) {
        queryClient.setQueryData<OwnerVehicle[]>(
          OWNER_QUERY_KEYS.vehicles,
          previousVehicles.filter((v) => v.id !== vehicleId)
        );
      }
      return { previousVehicles };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousVehicles) {
        queryClient.setQueryData(OWNER_QUERY_KEYS.vehicles, context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
      invalidateAllFeeds();
    },
  });

  // 4. Mutation pour supprimer définitivement un véhicule (Purge)
  const purgeVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      return ownerApi.purgeVehiclePermanently(vehicleId);
    },
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      const previousVehicles = queryClient.getQueryData<OwnerVehicle[]>(OWNER_QUERY_KEYS.vehicles);

      if (previousVehicles) {
        queryClient.setQueryData<OwnerVehicle[]>(
          OWNER_QUERY_KEYS.vehicles,
          previousVehicles.filter((v) => v.id !== vehicleId)
        );
      }
      return { previousVehicles };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousVehicles) {
        queryClient.setQueryData(OWNER_QUERY_KEYS.vehicles, context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
      invalidateAllFeeds();
    },
  });

  // 5. Mutation pour créer / publier un nouveau véhicule
  const createVehicleMutation = useMutation({
    mutationFn: ownerApi.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.vehicles });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
      invalidateAllFeeds();
    },
  });

  // 6. Mutation pour effectuer un retrait Wallet (Payout)
  const requestPayoutMutation = useMutation({
    mutationFn: ownerApi.requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.wallet });
      queryClient.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.stats });
    },
  });

  return {
    respondBookingMutation,
    updateVehicleStatusMutation,
    archiveVehicleMutation,
    purgeVehicleMutation,
    createVehicleMutation,
    requestPayoutMutation,
  };
}
