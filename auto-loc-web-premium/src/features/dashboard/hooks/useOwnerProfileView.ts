'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { userApi, type UserProfileData, type UpdateProfileDto } from '../../../core/api/userApi';
import { useUserStore } from '../../../core/store/useUserStore';

export function useOwnerProfileView() {
  const { user: storeUser, setUser, isAuthenticated, logout } = useUserStore();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  const hasToken = typeof window !== 'undefined' ? Boolean(localStorage.getItem('autoloc_token')) : false;
  const shouldFetch = isAuthenticated && hasToken;

  // 1. GET /users/me/profile
  const {
    data: fetchedProfile,
    error: errorProfile,
    isLoading: isLoadingProfile,
    isValidating: isValidatingProfile,
    mutate: rawMutateProfile,
  } = useSWR<UserProfileData>(shouldFetch ? 'user-profile' : null, () => userApi.getProfile(), {
    dedupingInterval: 5 * 60 * 1000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  // En cas d'erreur 401 (Non autorisé / Token expiré), réinitialiser la session
  useEffect(() => {
    if (errorProfile?.status === 401 || errorProfile?.statusCode === 401) {
      logout();
    }
  }, [errorProfile, logout]);

  const mutateProfile = useCallback(async () => {
    setLastRefreshedAt(new Date());
    return rawMutateProfile();
  }, [rawMutateProfile]);

  // 2. Synchroniser les données API réelles avec le Zustand Store global
  useEffect(() => {
    if (fetchedProfile && storeUser) {
      const isStatusChanged = fetchedProfile.statutKyc !== storeUser.statutKyc;
      const isAvatarChanged = fetchedProfile.avatarUrl !== storeUser.avatarUrl;
      const isNameChanged = fetchedProfile.prenom !== storeUser.prenom || fetchedProfile.nom !== storeUser.nom;

      if (isStatusChanged || isAvatarChanged || isNameChanged) {
        setUser({
          ...storeUser,
          prenom: fetchedProfile.prenom || storeUser.prenom,
          nom: fetchedProfile.nom || storeUser.nom,
          avatarUrl: fetchedProfile.avatarUrl ?? undefined,
          statutKyc: (fetchedProfile.statutKyc as any) || storeUser.statutKyc,
        });
      }
    }
  }, [fetchedProfile, storeUser, setUser]);

  // Utiliser le store local Zustand comme état réactif initial pour éviter tout saut/scintillement d'affichage
  const profile: UserProfileData | undefined = fetchedProfile || (storeUser ? {
    id: storeUser.id,
    userId: storeUser.id,
    email: storeUser.email,
    telephone: storeUser.telephone || '',
    prenom: storeUser.prenom,
    nom: storeUser.nom,
    avatarUrl: storeUser.avatarUrl ?? null,
    dateNaissance: storeUser.dateNaissance ?? null,
    phoneVerified: Boolean(storeUser.phoneVerified),
    profileCompleted: true,
    statutKyc: (storeUser.statutKyc as any) || 'NON_VERIFIE',
    role: (storeUser.role as any) || 'LOCATAIRE',
    noteLocataire: 5,
    noteProprietaire: 5,
    totalAvis: 0,
    creeLe: storeUser.createdAt || new Date().toISOString(),
    permisUrl: storeUser.permisUrl ?? null,
    kycDocumentUrl: null,
    kycDocumentBackUrl: null,
    kycSelfieUrl: null,
    annoncesCount: storeUser.vehiculesCount || 0,
    listingsCount: storeUser.vehiculesCount || 0,
  } : undefined);

  // 3. Upload Avatar
  const handleUploadAvatar = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      const res = await userApi.uploadAvatar(file);
      await mutateProfile();
      if (storeUser && res.avatarUrl) {
        setUser({ ...storeUser, avatarUrl: res.avatarUrl });
      }
      return res;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 4. Delete Avatar
  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      await userApi.deleteAvatar();
      await mutateProfile();
      if (storeUser) {
        setUser({ ...storeUser, avatarUrl: undefined });
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 5. Update Profile
  const handleUpdateProfile = async (dto: UpdateProfileDto) => {
    const updated = await userApi.updateProfile(dto);
    await mutateProfile();
    if (storeUser) {
      setUser({
        ...storeUser,
        prenom: updated.prenom ?? storeUser.prenom,
        nom: updated.nom ?? storeUser.nom,
        dateNaissance: updated.dateNaissance ?? storeUser.dateNaissance,
        avatarUrl: updated.avatarUrl ?? storeUser.avatarUrl ?? undefined,
      });
    }
    return updated;
  };

  return {
    profile,
    isLoadingProfile: isLoadingProfile && !profile,
    isRefreshing: isValidatingProfile,
    lastRefreshedAt,
    errorProfile,
    isUploadingAvatar,
    mutateProfile,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUpdateProfile,
  };
}
