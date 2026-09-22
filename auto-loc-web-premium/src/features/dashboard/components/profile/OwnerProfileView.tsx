'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../../../core/store/useUserStore';
import { useOwnerProfileView } from '../../hooks/useOwnerProfileView';
import { ProfileHeader } from './ProfileHeader';
import { ProfileHeroCard } from './ProfileHeroCard';
import { PersonalInfoCard } from './PersonalInfoCard';
import { KycStatusCard } from './KycStatusCard';
import { SecuritySettingsCard } from './SecuritySettingsCard';
import { WebEditProfileModal } from './WebEditProfileModal';
import { WebDeleteAccountModal } from './WebDeleteAccountModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const OwnerProfileView: React.FC = () => {
  const router = useRouter();
  const switchRole = useUserStore((s) => s.switchRole);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const {
    profile,
    isLoadingProfile,
    errorProfile,
    isUploadingAvatar,
    mutateProfile,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleUpdateProfile,
  } = useOwnerProfileView();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSwitchRole = async () => {
    if (isSwitchingRole || !profile) return;
    try {
      setIsSwitchingRole(true);
      const targetRole = profile.role === 'PROPRIETAIRE' ? 'LOCATAIRE' : 'PROPRIETAIRE';
      await switchRole(targetRole);
      if (targetRole === 'LOCATAIRE') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Switch role failed:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-64 w-full bg-slate-200 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 animate-pulse rounded-3xl" />
          <div className="h-80 bg-slate-200 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
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
      <ProfileHeader
        isLoading={isLoadingProfile}
        onRefresh={() => mutateProfile()}
      />

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

      {/* 4. Security Settings & Danger Zone at the very bottom */}
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
