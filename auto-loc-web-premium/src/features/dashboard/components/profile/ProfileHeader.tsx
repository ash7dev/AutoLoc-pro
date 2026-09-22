'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface ProfileHeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-2">
      <div className="min-w-0 space-y-2">
        <h1 className="font-fraunces text-3xl font-normal leading-[1.1] tracking-tight text-[#041912] sm:text-4xl lg:text-5xl">
          Mon <span className="text-[#059669]">Profil</span>
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
          Gérez vos informations personnelles, suivez votre statut de vérification d'identité et administrez la sécurité de votre compte.
        </p>
      </div>

      {onRefresh && (
        <div className="w-full shrink-0 sm:w-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 text-[#059669] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      )}
    </div>
  );
};
