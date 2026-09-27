'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../../../core/store/useUserStore';
import { useOwnerProfileView } from '../../hooks/useOwnerProfileView';
import { ProfileHeader } from './ProfileHeader';
import { ProfileHeroCard } from './ProfileHeroCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { KycStatusCard } from './KycStatusCard';
import { TenantNotificationSettingsCard } from '../../../profile/components/TenantNotificationSettingsCard';
import { SecuritySettingsCard } from './SecuritySettingsCard';
import { WebEditProfileModal } from './WebEditProfileModal';
import { WebDeleteAccountModal } from './WebDeleteAccountModal';
import { OwnerProfileSkeleton } from './OwnerProfileSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const OwnerProfileView: React.FC = () => {
  const router = useRouter();
  const switchRole = useUserStore((s) => s.switchRole);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const {
    profile,
    isLoadingProfile,
    isRefreshing,
    lastRefreshedAt,
    errorProfile,
    hasSyncError,
    isUploadingAvatar,
    mutateProfile,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUpdateProfile,
  } = useOwnerProfileView();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSwitchRole = async () => {
    if (isSwitchingRole) return;
    try {
      setIsSwitchingRole(true);
      await switchRole('LOCATAIRE');
      router.push('/');
    } catch (err) {
      console.error('Switch role failed:', err);
      router.push('/');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  if (isLoadingProfile && !profile) {
    return <OwnerProfileSkeleton />;
  }

  if (!profile) {
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
      <ProfileHeader
        isLoading={isLoadingProfile}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={() => mutateProfile()}
      />

      {hasSyncError && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-medium animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode synchro restreint · Vos informations de session restent accessibles.</span>
          </div>
          <button
            type="button"
            onClick={() => mutateProfile()}
            className="px-3 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-bold transition-colors cursor-pointer shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 2. Hero Profile Banner */}
      <ProfileHeroCard
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
        <PersonalInfoCard
          profile={profile}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* KYC Status */}
        <KycStatusCard profile={profile} />
      </div>

      {/* 4. Web Push Notification Settings */}
      <TenantNotificationSettingsCard />

      {/* 5. Security Settings & Danger Zone at the very bottom */}
      <SecuritySettingsCard
        profile={profile}
        onOpenDeleteAccountModal={() => setIsDeleteModalOpen(true)}
      />

      {/* 4. Modals */}
      <WebEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSubmit={handleUpdateProfile}
      />

      <WebDeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
