'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, ShieldCheck, Star, Calendar, Loader2, ArrowLeftRight, Pencil } from 'lucide-react';
import type { UserProfileData } from '../../../core/api/userApi';

export interface TenantProfileHeroCardProps {
  profile: UserProfileData;
  isUploadingAvatar?: boolean;
  onUploadAvatar: (file: File) => Promise<any>;
  onDeleteAvatar: () => Promise<void>;
  onEditClick: () => void;
  onSwitchRole?: () => Promise<void>;
  isSwitchingRole?: boolean;
}

export const TenantProfileHeroCard: React.FC<TenantProfileHeroCardProps> = ({
  profile,
  isUploadingAvatar = false,
  onUploadAvatar,
  onDeleteAvatar,
  onEditClick,
  onSwitchRole,
  isSwitchingRole = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const memberDate = (mounted && profile.creeLe)
    ? new Date(profile.creeLe).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  const rating = profile.noteLocataire ?? 5.0;
  const displayRating = rating > 0 ? rating.toFixed(1) : '5.0';
  const isVerified = profile.statutKyc === 'VALIDE' || profile.statutKyc === 'VERIFIE';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-dark text-white shadow-xl">
      {/* Halo décoratif & Dégradé glassmorphism */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0A3D2E]/40 via-transparent to-transparent" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Avatar & identité du locataire */}
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="group relative shrink-0">
              <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brand-main/60 ring-4 ring-champagne/20 sm:h-32 sm:w-32 shadow-inner">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.prenom} ${profile.nom}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <span className="font-fraunces text-3xl text-champagne/90 sm:text-4xl">
                    {getInitials(profile.prenom, profile.nom)}
                  </span>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex items-center gap-1 rounded-full border border-white/10 bg-brand-dark p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Changer la photo de profil"
                  className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={onDeleteAvatar}
                    disabled={isUploadingAvatar}
                    title="Supprimer la photo"
                    className="rounded-full bg-rose-600/70 p-2 text-white transition-colors hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="font-fraunces text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
                  {profile.prenom} {profile.nom}
                </h2>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Vérifié
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] text-white/60 sm:justify-start">
                <span className="font-medium text-champagne/90">Locataire membre</span>
                {memberDate && (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-white/50" />
                      Membre depuis {memberDate}
                    </span>
                  </>
                )}
              </div>

              {/* Statistiques Locataire */}
              <div className="flex items-center justify-center gap-5 pt-1 sm:justify-start">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <div className="text-left leading-none">
                    <span className="font-fraunces text-lg text-white">{displayRating}</span>
                    <span className="ml-1 text-[11px] text-white/50">({profile.totalAvis ?? 0} avis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex w-full shrink-0 flex-col items-center gap-2.5 sm:flex-row md:w-auto">
            {onSwitchRole && (
              <button
                type="button"
                onClick={onSwitchRole}
                disabled={isSwitchingRole}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[12.5px] font-semibold text-white/85 transition-colors hover:bg-white/10 disabled:opacity-50 cursor-pointer sm:w-auto"
              >
                {isSwitchingRole ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowLeftRight className="h-3.5 w-3.5 text-champagne" />
                )}
                Espace Propriétaire
              </button>
            )}

            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-champagne px-4 py-2.5 text-[12.5px] font-semibold text-brand-dark transition-colors hover:bg-[#e8d29e] cursor-pointer sm:w-auto shadow-md"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier le profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
