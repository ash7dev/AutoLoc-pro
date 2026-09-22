'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, ShieldCheck, Star, Car, Calendar, User, Loader2, ArrowLeftRight } from 'lucide-react';
import type { UserProfileData } from '../../../../core/api/userApi';

export interface ProfileHeroCardProps {
  profile: UserProfileData;
  isUploadingAvatar?: boolean;
  onUploadAvatar: (file: File) => Promise<any>;
  onDeleteAvatar: () => Promise<void>;
  onEditClick: () => void;
  onSwitchRole?: () => Promise<void>;
  isSwitchingRole?: boolean;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  profile,
  isUploadingAvatar = false,
  onUploadAvatar,
  onDeleteAvatar,
  onEditClick,
  onSwitchRole,
  isSwitchingRole = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadAvatar(file);
    }
  };

  const getInitials = (prenom: string, nom: string) => {
    const p = prenom?.charAt(0)?.toUpperCase() || '';
    const n = nom?.charAt(0)?.toUpperCase() || '';
    return p + n || 'U';
  };

  // Format member since date
  const memberDate = profile.creeLe
    ? new Date(profile.creeLe).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Primary rating (owner rating or tenant rating)
  const rating = profile.role === 'PROPRIETAIRE' ? profile.noteProprietaire : profile.noteLocataire;
  const displayRating = rating && rating > 0 ? rating.toFixed(1) : '5.0';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-950/20 bg-[#041912] shadow-xl text-white">
      {/* Decorative background glow & mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-emerald-950/30 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-emerald-500/30 overflow-hidden bg-emerald-950/60 shadow-2xl flex items-center justify-center">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.prenom} ${profile.nom}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <span className="font-fraunces text-3xl sm:text-4xl font-normal text-emerald-300">
                    {getInitials(profile.prenom, profile.nom)}
                  </span>
                )}

                {/* Loading Overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-0 right-0 flex items-center gap-1 bg-[#041912]/90 border border-emerald-500/30 rounded-full p-1 shadow-lg backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Changer la photo de profil"
                  className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={onDeleteAvatar}
                    disabled={isUploadingAvatar}
                    title="Supprimer la photo"
                    className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name, Role & Badges */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="font-fraunces text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white">
                  {profile.prenom} {profile.nom}
                </h2>
                {(profile.statutKyc === 'VALIDE' || profile.statutKyc === 'VERIFIE') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Vérifié
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-emerald-200/80">
                <span className="inline-flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800/50">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  {profile.role === 'PROPRIETAIRE' ? 'Propriétaire Hôte' : 'Locataire Membre'}
                </span>

                {memberDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Membre depuis {memberDate}
                  </span>
                )}
              </div>

              {/* Stats Bar */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-fraunces text-lg font-bold text-white leading-none">
                      {displayRating}
                    </span>
                    <span className="text-xs text-emerald-200/70 block">
                      ({profile.totalAvis ?? 0} avis)
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-emerald-800/40 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-fraunces text-lg font-bold text-white leading-none">
                      {profile.annoncesCount ?? profile.listingsCount ?? 0}
                    </span>
                    <span className="text-xs text-emerald-200/70 block">
                      {(profile.annoncesCount ?? profile.listingsCount ?? 0) > 1 ? 'véhicules' : 'véhicule'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {onSwitchRole && (
              <button
                type="button"
                onClick={onSwitchRole}
                disabled={isSwitchingRole}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900/80 border border-emerald-500/30 text-emerald-100 hover:bg-emerald-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSwitchingRole ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <ArrowLeftRight className="w-4 h-4 text-emerald-300" />
                )}
                <span>
                  {profile.role === 'PROPRIETAIRE' ? 'Basculer en mode locataire' : 'Basculer en mode propriétaire'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onEditClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#041912] font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-lg cursor-pointer"
            >
              <span>Modifier le profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
