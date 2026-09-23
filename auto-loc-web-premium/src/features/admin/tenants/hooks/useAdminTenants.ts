'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/src/core/api/apiClient';

export interface TenantItem {
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
  permisUrl: string | null;
  hasPermis: boolean;
  noteLocataire: number;
  profileCompleted: boolean;
  utilisateur: {
    prenom: string;
    nom: string;
    fullName: string;
    avatarUrl: string | null;
    statutKyc: string;
    noteLocataire: number;
  } | null;
  tenantStats: {
    totalBookings: number;
    completedBookings: number;
    ongoingBookings: number;
    totalSpent: number;
  };
}

export interface TenantHealth360 {
  tenant: {
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
    noteLocataire: number;
    totalBookings: number;
    completedBookings: number;
    ongoingBookings: number;
    cancelledBookings: number;
    totalSpent: number;
  };
  bookings: Array<{
    id: string;
    statut: string;
    dateDebut: string;
    dateFin: string;
    totalLocataire: number;
    cautionMontant: number;
    cautionStatut: string;
    vehicule: {
      id: string;
      marque: string;
      modele: string;
      immatriculation: string;
      photoUrl: string | null;
    } | null;
    proprietaire: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
    } | null;
  }>;
}

export interface TenantQueueCounts {
  total: number;
  verified: number;
  pendingPermis: number;
  riskWarning: number;
  banned: number;
}

export function useAdminTenants() {
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Query string for tenants queue
  const queryParams = new URLSearchParams();
  if (status !== 'ALL') queryParams.set('status', status);
  if (debouncedSearch.trim()) queryParams.set('search', debouncedSearch.trim());
  queryParams.set('page', String(page));
  queryParams.set('limit', '20');

  const swrKey = `/admin/users/tenants-queue?${queryParams.toString()}`;

  const { data, error, mutate, isValidating } = useSWR(swrKey, async (url: string) => {
    return await apiClient.get<any>(url);
  }, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
  });

  // Query for Tenant 360 Health if selected
  const { data: healthData, isLoading: isHealth360Loading, mutate: mutateHealth } = useSWR(
    selectedTenantId ? `/admin/users/tenants/${selectedTenantId}/health-360` : null,
    async (url: string) => {
      return await apiClient.get<TenantHealth360>(url);
    }
  );

  const refresh = useCallback(() => {
    mutate();
    if (selectedTenantId) mutateHealth();
  }, [mutate, mutateHealth, selectedTenantId]);

  // Actions
  const approvePermis = async (userId: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/tenants/${userId}/permis/approve`);
      refresh();
    } catch (err) {
      console.error('Erreur validation permis:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const rejectPermis = async (userId: string, raison?: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/tenants/${userId}/permis/reject`, { raison });
      refresh();
    } catch (err) {
      console.error('Erreur rejet permis:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const banTenant = async (userId: string, raison?: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { actif: false, raison });
      refresh();
    } catch (err) {
      console.error('Erreur bannissement locataire:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const unbanTenant = async (userId: string) => {
    setIsMutating(true);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { actif: true });
      refresh();
    } catch (err) {
      console.error('Erreur débannissement locataire:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const itemsList = (data?.data ?? []) as TenantItem[];
  const selectedTenantItem = itemsList.find((t) => t.id === selectedTenantId) || null;

  return {
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    items: itemsList,
    meta: data?.meta,
    counts: (data?.counts ?? data?.meta?.counts ?? { total: 0, verified: 0, pendingPermis: 0, riskWarning: 0, banned: 0 }) as TenantQueueCounts,
    selectedTenantId,
    setSelectedTenantId,
    selectedTenantItem,
    health360: healthData,
    isLoading: !data && !error,
    isHealth360Loading,
    isRefreshing: isValidating,
    isMutating,
    refresh,
    approvePermis,
    rejectPermis,
    banTenant,
    unbanTenant,
  };
}
