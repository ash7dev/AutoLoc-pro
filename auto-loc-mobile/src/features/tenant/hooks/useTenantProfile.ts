import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchTenantProfile,
  updateTenantProfile,
  uploadTenantAvatar,
  becomeAutoLocHost,
  updateLoginSecurity,
  TenantProfile,
} from '../api/tenantProfileApi';
import { useAppStore } from '../../../core/store/useAppStore';

export const TENANT_PROFILE_QUERY_KEY = ['tenant', 'profile'] as const;

export function useTenantProfile() {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const query = useQuery<TenantProfile>({
    queryKey: TENANT_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const data = await fetchTenantProfile();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Synchroniser automatiquement avec le store Zustand global dès la réception des données
  useEffect(() => {
    if (query.data) {
      const p = query.data;
      updateUserProfile({
        prenom: p.prenom,
        nom: p.nom,
        email: p.email,
        telephone: p.telephone,
        avatarUrl: p.avatarUrl || undefined,
        dateNaissance: p.dateNaissance || undefined,
        statutKyc: p.statutKyc,
        permisUrl: p.permisUrl,
        phoneVerified: p.phoneVerified,
        role: p.role,
      });
    }
  }, [query.data, updateUserProfile]);

  return query;
}

export function useUpdateTenantProfileMutation() {
  const queryClient = useQueryClient();
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  return useMutation({
    mutationFn: updateTenantProfile,
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEY });
      if (updatedData.prenom || updatedData.nom) {
        updateUserProfile({
          prenom: updatedData.prenom,
          nom: updatedData.nom,
        });
      }
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  return useMutation({
    mutationFn: uploadTenantAvatar,
    onSuccess: (newAvatarUrl) => {
      queryClient.setQueryData<TenantProfile | undefined>(TENANT_PROFILE_QUERY_KEY, (old: TenantProfile | undefined) => {
        if (!old) return old;
        return { ...old, avatarUrl: newAvatarUrl };
      });
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEY });
      updateUserProfile({ avatarUrl: newAvatarUrl });
    },
  });
}

export function useUpdateSecurityMutation() {
  const queryClient = useQueryClient();
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  return useMutation({
    mutationFn: updateLoginSecurity,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: TENANT_PROFILE_QUERY_KEY });
      if (res.email) {
        updateUserProfile({ email: res.email });
      }
    },
  });
}
