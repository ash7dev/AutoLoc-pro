'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, UserCheck, Loader2 } from 'lucide-react';
import type { UserProfileData, UpdateProfileDto } from '../../../../core/api/userApi';

export interface WebEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileData;
  onSubmit: (dto: UpdateProfileDto) => Promise<any>;
}

export const WebEditProfileModal: React.FC<WebEditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSubmit,
}) => {
  const [prenom, setPrenom] = useState(profile.prenom || '');
  const [nom, setNom] = useState(profile.nom || '');
  const [dateNaissance, setDateNaissance] = useState(
    profile.dateNaissance ? profile.dateNaissance.split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrenom(profile.prenom || '');
      setNom(profile.nom || '');
      setDateNaissance(profile.dateNaissance ? profile.dateNaissance.split('T')[0] : '');
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg('Le prénom et le nom sont obligatoires.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance ? new Date(dateNaissance).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour des informations.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-xl font-normal text-[#041912]">
                Modifier le profil
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mettez à jour vos identifiants personnels
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KYC Warning callout */}
        {(profile.statutKyc === 'VALIDE' || profile.statutKyc === 'VERIFIE') && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Avertissement de sécurité KYC</span>
            </div>
            <p>
              Toute modification apportée à votre nom, prénom ou date de naissance réinitialisera votre statut de vérification KYC au statut <strong>NON_VERIFIE</strong>. Vous devrez re-soumettre un document officiel valide.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prénom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ex: Ousmane"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Diallo"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date de Naissance
            </label>
            <input
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Format: JJ/MM/AAAA. Doit correspondre à votre pièce d'identité.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
