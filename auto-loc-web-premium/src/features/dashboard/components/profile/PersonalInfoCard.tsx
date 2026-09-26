'use client';

import React from 'react';
import { User, Mail, Phone, Calendar, CheckCircle2, Edit3, ShieldCheck } from 'lucide-react';
import type { UserProfileData } from '../../../../core/api/userApi';

export interface PersonalInfoCardProps {
  profile: UserProfileData;
  onEditClick: () => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ profile, onEditClick }) => {
  const formatBirthDate = (dateStr: string | null) => {
    if (!dateStr) return { formatted: 'Non renseignée', age: null as number | null };
    try {
      const birthDate = new Date(dateStr);
      const formatted = birthDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return { formatted, age: age > 0 ? age : null };
    } catch {
      return { formatted: dateStr, age: null as number | null };
    }
  };

  const birthInfo = formatBirthDate(profile.dateNaissance);

  return (
    <div className="rounded-3xl border border-brand-dark/8 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces text-xl leading-tight text-brand-dark">
            Informations personnelles
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">
            Vos coordonnées et données d'identité enregistrées
          </p>
        </div>

        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
          Modifier
        </button>
      </div>

      <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
        {/* Identité */}
        <div className="flex items-center gap-3.5 py-4">
          <User className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-slate-400">Identité</p>
            <p className="font-fraunces text-[17px] leading-tight text-brand-dark">
              {profile.prenom} {profile.nom}
            </p>
          </div>
        </div>

        {/* E-mail */}
        <div className="flex items-center gap-3.5 py-4">
          <Mail className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-slate-400">Adresse e-mail</p>
            <p className="truncate text-[13.5px] font-semibold text-brand-dark">{profile.email}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-brand-main">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connecté
          </span>
        </div>

        {/* Téléphone */}
        <div className="flex items-center gap-3.5 py-4">
          <Phone className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-slate-400">Téléphone</p>
            <p className="text-[13.5px] font-semibold text-brand-dark">
              {profile.telephone || 'Non renseigné'}
            </p>
          </div>
          {profile.phoneVerified ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-brand-main">
              <ShieldCheck className="h-3.5 w-3.5" />
              Vérifié
            </span>
          ) : (
            <span className="shrink-0 text-[11.5px] font-medium text-amber-600">Non vérifié</span>
          )}
        </div>

        {/* Date de naissance */}
        <div className="flex items-center gap-3.5 py-4">
          <Calendar className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-slate-400">Date de naissance</p>
            <p className="text-[13.5px] font-semibold text-brand-dark">
              {birthInfo.formatted}
              {birthInfo.age !== null && (
                <span className="ml-1.5 font-normal text-slate-400">({birthInfo.age} ans)</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};