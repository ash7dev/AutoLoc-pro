'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertOctagon, Trash2, Loader2 } from 'lucide-react';
import { userApi } from '../../../../core/api/userApi';
import { useUserStore } from '../../../../core/store/useUserStore';

export interface WebDeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebDeleteAccountModal: React.FC<WebDeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { logout } = useUserStore();
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'SUPPRIMER';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMsg(null);

    try {
      setIsDeleting(true);
      await userApi.deleteAccount();
      logout();
      router.push('/');
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Erreur lors de la suppression de votre compte.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 text-rose-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-xl font-bold text-rose-950">
                Suppression du Compte
              </h3>
              <p className="text-xs text-rose-600 font-medium">
                Action irréversible et définitive
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

        {/* Warning Body */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs sm:text-sm leading-relaxed space-y-2">
          <p className="font-bold text-rose-950">Êtes-vous absolument sûr ?</p>
          <ul className="list-disc pl-4 space-y-1 text-xs text-rose-800">
            <li>Toutes vos annonces de véhicules seront retirées de la plateforme.</li>
            <li>Votre portefeuille et votre solde seront définitivement clôturés.</li>
            <li>Vos données d'identité et documents KYC seront purgés conformément au RGPD.</li>
          </ul>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Typing confirmation */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Pour confirmer, veuillez saisir <span className="font-mono font-bold text-rose-600">SUPPRIMER</span> ci-dessous :
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Tapez SUPPRIMER"
            className="w-full px-4 py-3 rounded-2xl border border-rose-200 bg-rose-50/30 text-rose-950 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Supprimer définitivement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
