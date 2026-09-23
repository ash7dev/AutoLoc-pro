'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/src/core/api/apiClient';

export interface HostItem {
  id: string;
  profileId: string;
  userId: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  isBanned: boolean;
  banUntil: string | null;
  statutKyc: string;
  kycRejectionReason: string | null;
  profileCompleted: boolean;
  utilisateur: {
    prenom: string;
    nom: string;
    fullName: string;
    avatarUrl: string | null;
    statutKyc: string;
    noteProprietaire: number;
  } | null;
  fleetStats: {
    total: number;
    verified: number;
    pending: number;
    suspended: number;
  };
  vehiclesSample: Array<{
    id: string;
    name: string;
    statut: string;
    prixParJour: number;
    photoUrl: string | null;
  }>;
  totalBookings: number;
}

export interface HostHealth360 {
  host: {
    id: string;
    userId: string;
    prenom: string;
    nom: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    role: string;
    statutKyc: string;
    kycRejectionReason: string | null;
    isBanned: boolean;
    registeredAt: string;
    documents: {
      documentUrl: string | null;
      documentBackUrl: string | null;
      selfieUrl: string | null;
      permisUrl: string | null;
    };
  };
  healthMatrix: {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskWarnings: string[];
    noteProprietaire: number;
    hostCancelRate: number;
    totalBookings: number;
    completedBookings: number;
    ongoingBookings: number;
    grossEarnings: number;
    escrowBalance: number;
  };
  fleet: Array<{
    id: string;
    marque: string;
    modele: string;
    annee: number;
    type: string;
    immatriculation: string;
    prixParJour: number;
    benchmarkPriceAvg: number;
    priceDevPct: number;
    priceWarning: string | null;
    ville: string;
    adresse: string;
    statut: string;
    carteGriseUrl: string | null;
    assuranceDocUrl: string | null;
    hasCarteGrise: boolean;
    hasAssuranceDoc: boolean;
    totalLocations: number;
    photos: Array<{ id: string; url: string; estPrincipale: boolean }>;
    equipements: string[];
    creeLe: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    montant: number;
    statut: string;
    creeLe: string;
  }>;
}

export function useAdminHosts() {
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query string for hosts queue
  const queryParams = new URLSearchParams();
  if (status !== 'ALL') queryParams.set('status', status);
  if (debouncedSearch.trim()) queryParams.set('search', debouncedSearch.trim());
  queryParams.set('page', String(page));
  queryParams.set('limit', '20');

  const swrKey = `/admin/users/hosts-queue?${queryParams.toString()}`;

  const { data, error, mutate, isValidating } = useSWR(swrKey, async (url: string) => {
    return await apiClient.get<any>(url);
  }, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
  });

  // Query for Host 360 Health if selected
  const { data: healthData, isLoading: isHealth360Loading, mutate: mutateHealth } = useSWR(
    selectedHostId ? `/admin/users/hosts/${selectedHostId}/health-360` : null,
    async (url: string) => {
      return await apiClient.get<HostHealth360>(url);
    }
  );

  const refresh = useCallback(() => {
    mutate();
    if (selectedHostId) mutateHealth();
  }, [mutate, mutateHealth, selectedHostId]);

  // Actions
  const validateVehicle = async (vehicleId: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/vehicles/${vehicleId}/validate`);
      refresh();
    } catch (err) {
      console.error('Erreur validation véhicule:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const suspendVehicle = async (vehicleId: string, raison: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/vehicles/${vehicleId}/suspend`, { raison });
      refresh();
    } catch (err) {
      console.error('Erreur suspension véhicule:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const featureVehicle = async (vehicleId: string, active: boolean) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/vehicles/${vehicleId}/feature`, { active });
      refresh();
    } catch (err) {
      console.error('Erreur mise en avant véhicule:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteVehiclePhoto = async (vehicleId: string, photoId: string) => {
    setIsMutating(true);
    try {
      await apiClient.delete(`/admin/vehicles/${vehicleId}/photos/${photoId}`);
      refresh();
    } catch (err) {
      console.error('Erreur suppression photo:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const setMainVehiclePhoto = async (vehicleId: string, photoId: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/vehicles/${vehicleId}/photos/${photoId}/main`);
      refresh();
    } catch (err) {
      console.error('Erreur définition photo principale:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const executeFleetAction = async (hostId: string, action: 'SUSPEND_ALL' | 'ACTIVATE_ALL', raison?: string) => {
    setIsMutating(true);
    try {
      await apiClient.post(`/admin/users/hosts/${hostId}/fleet-action`, { action, raison });
      refresh();
    } catch (err) {
      console.error('Erreur action globale flotte:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const banHost = async (userId: string, raison?: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { actif: false, raison });
      refresh();
    } catch (err) {
      console.error('Erreur bannissement hôte:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const unbanHost = async (userId: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { actif: true });
      refresh();
    } catch (err) {
      console.error('Erreur débannissement hôte:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const itemsList = (data?.data ?? []) as HostItem[];
  const selectedHostItem = itemsList.find((h) => h.id === selectedHostId) || null;

  return {
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    items: itemsList,
    meta: data?.meta,
    counts: data?.counts ?? { total: 0, verified: 0, pending: 0, suspended: 0 },
    selectedHostId,
    setSelectedHostId,
    selectedHostItem,
    health360: healthData,
    isLoading: !data && !error,
    isHealth360Loading,
    isRefreshing: isValidating,
    isMutating,
    refresh,
    validateVehicle,
    suspendVehicle,
    featureVehicle,
    deleteVehiclePhoto,
    setMainVehiclePhoto,
    executeFleetAction,
    banHost,
    unbanHost,
  };
}

