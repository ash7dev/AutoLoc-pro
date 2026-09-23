'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldAlert, Trash2, Check, AlertCircle, Loader2, LogOut, Mail } from 'lucide-react';
import { userApi } from '../../../../core/api/userApi';
import type { UserProfileData } from '../../../../core/api/userApi';
import { useUserStore } from '../../../../core/store/useUserStore';

export interface SecuritySettingsCardProps {
  profile: UserProfileData;
  onOpenDeleteAccountModal: () => void;
}

export const SecuritySettingsCard: React.FC<SecuritySettingsCardProps> = ({
  profile,
  onOpenDeleteAccountModal,
}) => {
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [newEmail, setNewEmail] = useState(profile.email || '');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la déconnexion.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = newEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    if (emailTrimmed === (profile.email || '').toLowerCase()) {
      setErrorMsg("L'adresse e-mail saisie est identique à l'adresse actuelle.");
      return;
    }

    try {
      setIsSubmittingEmail(true);
      await userApi.updateSecurity({
        email: emailTrimmed,
      });
      setSuccessMsg('Votre adresse e-mail a été mise à jour avec succès.');
      setShowEmailForm(false);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Erreur lors de la mise à jour de l'adresse e-mail."
      );
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins une majuscule et un chiffre.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setIsSubmitting(true);
      await userApi.updateSecurity({
        password: newPassword,
      });
      setSuccessMsg('Votre mot de passe a été mis à jour avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour du mot de passe.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
      <div>
        <h3 className="font-fraunces text-xl leading-tight text-[#041912]">Sécurité du compte</h3>
        <p className="mt-1 text-[13px] text-slate-500">
          Identifiants de connexion, mot de passe et sécurité
        </p>
      </div>

      {/* Messages de retour */}
      {successMsg && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-[#0A3D2E]/15 bg-[#0A3D2E]/5 p-3.5 text-[12.5px] font-medium text-[#0A3D2E]">
          <Check className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[12.5px] font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Adresse e-mail */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-[#041912]">Adresse e-mail de connexion</h4>
              <p className="text-[12px] text-slate-500">{profile.email || 'Non renseignée'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowEmailForm(!showEmailForm);
              setShowPasswordForm(false);
              setNewEmail(profile.email || '');
            }}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
          >
            {showEmailForm ? 'Masquer le formulaire' : "Modifier l'e-mail"}
          </button>
        </div>

        {showEmailForm && (
          <form onSubmit={handleChangeEmail} className="mt-4 space-y-4 border-t border-slate-100 pt-4">
            <div className="max-w-md">
              <label className="mb-1 block text-[11.5px] font-medium text-slate-500">
                Nouvelle adresse e-mail
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="exemple@domaine.com"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="rounded-xl px-4 py-2 text-[12.5px] font-medium text-slate-500 hover:text-slate-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="inline-flex items-center gap-2 rounded-xl bg-[#041912] px-5 py-2 text-[12.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] disabled:opacity-50"
              >
                {isSubmittingEmail && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enregistrer l'e-mail
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mot de passe */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-[#041912]">Mot de passe d'accès</h4>
              <p className="text-[12px] text-slate-500">Recommandé de le modifier périodiquement</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
          >
            {showPasswordForm ? 'Masquer le formulaire' : 'Changer le mot de passe'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-slate-500">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-slate-500">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 car. (1 Maj, 1 Chiffre)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-slate-500">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="rounded-xl px-4 py-2 text-[12.5px] font-medium text-slate-500 hover:text-slate-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#041912] px-5 py-2 text-[12.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enregistrer le mot de passe
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Déconnexion */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <LogOut className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-[#041912]">Fermer la session</h4>
            <p className="text-[12px] text-slate-500">Se déconnecter et retourner à la page d'accueil</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Se déconnecter
        </button>
      </div>

      {/* Zone de danger */}
      <div className="mt-6 rounded-2xl bg-rose-50/60 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-rose-900">
              Zone de danger — suppression du compte
            </h4>
            <p className="text-[12px] text-rose-600">Actions irréversibles relatives à votre profil AutoLoc</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[12.5px] leading-relaxed text-rose-800">
            La suppression de votre compte entraîne la suppression définitive de vos annonces, votre historique de transactions, vos données KYC ainsi que la clôture de votre compte utilisateur.
          </p>

          <button
            type="button"
            onClick={onOpenDeleteAccountModal}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
};