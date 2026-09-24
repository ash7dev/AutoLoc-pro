'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../../core/store/useUserStore';
import { useTenantProfileView } from '../hooks/useTenantProfileView';
import { TenantProfileHeader } from './TenantProfileHeader';
import { TenantProfileHeroCard } from './TenantProfileHeroCard';
import { TenantPersonalInfoCard } from './TenantPersonalInfoCard';
import { TenantKycStatusCard } from './TenantKycStatusCard';
import { TenantNotificationSettingsCard } from './TenantNotificationSettingsCard';
import { TenantSecuritySettingsCard } from './TenantSecuritySettingsCard';
import { TenantEditProfileModal } from './TenantEditProfileModal';
import { TenantDeleteAccountModal } from './TenantDeleteAccountModal';
import { TenantProfileSkeleton } from './TenantProfileSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const TenantProfileView: React.FC = () => {
  const router = useRouter();
  const switchRole = useUserStore((s) => s.switchRole);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const {
    profile,
    isLoadingProfile,
    isRefreshing,
    lastRefreshedAt,
    errorProfile,
    isUploadingAvatar,
    mutateProfile,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUpdateProfile,
  } = useTenantProfileView();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSwitchRole = async () => {
    if (isSwitchingRole || !profile) return;
    try {
      setIsSwitchingRole(true);
      const targetRole = profile.role === 'PROPRIETAIRE' ? 'LOCATAIRE' : 'PROPRIETAIRE';
      await switchRole(targetRole);
      if (targetRole === 'PROPRIETAIRE') {
        router.push('/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      console.error('Switch role failed:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  if (isLoadingProfile && !profile) {
    return <TenantProfileSkeleton />;
  }

  if (errorProfile || !profile) {
    return (
      <div className="max-w-7xl mx-auto pb-16">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-fraunces text-2xl font-bold text-rose-950">
            Impossible de charger votre profil
          </h2>
          <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">
            Une erreur est survenue lors de la récupération de vos informations utilisateur. Veuillez réessayer.
          </p>
          <button
            type="button"
            onClick={() => mutateProfile()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-28 sm:pb-16">
      {/* 1. Top Header */}
      <TenantProfileHeader
        isLoading={isLoadingProfile}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={() => mutateProfile()}
      />

      {/* 2. Hero Profile Banner */}
      <TenantProfileHeroCard
        profile={profile}
        isUploadingAvatar={isUploadingAvatar}
        onUploadAvatar={handleUploadAvatar}
        onDeleteAvatar={handleDeleteAvatar}
        onEditClick={() => setIsEditModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        isSwitchingRole={isSwitchingRole}
      />

      {/* 3. Main Content Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Personal Information */}
        <TenantPersonalInfoCard
          profile={profile}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* KYC Status */}
        <TenantKycStatusCard profile={profile} />
      </div>

      {/* 4. Web Push Notification Settings */}
      <TenantNotificationSettingsCard />

      {/* 5. Security Settings & Danger Zone at the bottom */}
      <TenantSecuritySettingsCard
        profile={profile}
        onOpenDeleteAccountModal={() => setIsDeleteModalOpen(true)}
      />

      {/* 5. Modals */}
      <TenantEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSubmit={handleUpdateProfile}
      />

      <TenantDeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
