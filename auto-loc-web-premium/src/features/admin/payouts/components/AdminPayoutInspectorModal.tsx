'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  User,
  Wallet,
  Zap,
  AlertTriangle,
  Loader2,
  FileText,
  DollarSign,
} from 'lucide-react';
import type { AdminWithdrawalItem } from '../../../../core/api/adminPayoutsApi';

interface AdminPayoutInspectorModalProps {
  item: AdminWithdrawalItem | null;
  isOpen: boolean;
  isMutating: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string, raison: string) => Promise<boolean>;
}

export const AdminPayoutInspectorModal: React.FC<AdminPayoutInspectorModalProps> = ({
  item,
  isOpen,
  isMutating,
  onClose,
  onApprove,
  onReject,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !item) return null;

  const isWave = item.method === 'WAVE';
  const isPending = item.statut === 'EN_ATTENTE';
  const isApproved = item.statut === 'EFFECTUE';
  const isRejected = item.statut === 'REJETE';

  const handleApprove = async () => {
    if (window.confirm(`Confirmer la validation du virement de ${item.amount.toLocaleString('fr-FR')} FCFA vers ${item.numeroDestinataire} (${item.method}) ?`)) {
      const ok = await onApprove(item.id);
      if (ok) onClose();
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Veuillez saisir le motif du rejet pour informer le propriétaire.');
      return;
    }

    const ok = await onReject(item.id, rejectReason.trim());
    if (ok) {
      setShowRejectForm(false);
      setRejectReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041912]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header Sombre Luxe */}
        <div className="bg-[#041912] px-6 py-5 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[10px] font-bold text-emerald-300 tracking-wider uppercase mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Auditeur Financier · Retrait ID #{item.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Demande de Reversement & Virement
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isMutating}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du Modal Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Card Récapitulative du Montant & Statut */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Montant Réclamé
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
                {item.amount.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">FCFA</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Solde actuel du portefeuille :{' '}
                <strong className="text-slate-800">{item.walletBalance.toLocaleString('fr-FR')} FCFA</strong>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isRejected
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isRejected && <XCircle className="w-4 h-4 text-rose-600" />}
                {isPending && <Clock className="w-4 h-4 text-amber-600 animate-pulse" />}
                <span>
                  {isApproved ? 'Effectué & Clôturé' : isRejected ? 'Rejeté & Remboursé' : 'En attente de virement'}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isWave
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}
              >
                {isWave ? '🌊 Wave (Virement Direct)' : '🟠 Orange Money (Virement Manuel)'}
              </span>
            </div>
          </div>

          {/* Fiche d'Identité du Bénéficiaire */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Informations du Propriétaire Bénéficiaire</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Nom complet</span>
                <p className="font-bold text-slate-900">{item.ownerName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Statut Vérification KYC</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{item.ownerKycStatus}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Numéro Mobile Destinataire</span>
                <p className="font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.numeroDestinataire}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Adresse Email</span>
                <p className="font-mono font-bold text-slate-700 truncate flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.ownerEmail || '—'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Informations Techniques du Virement */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Traçabilité & Horodatage</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[10px]">Date de demande</span>
                <p className="font-medium text-slate-800">
                  {new Date(item.demandeeLe).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Date de traitement</span>
                <p className="font-medium text-slate-800">
                  {item.traiteLe ? new Date(item.traiteLe).toLocaleString('fr-FR') : 'Non encore traité'}
                </p>
              </div>
              {item.idTransactionFournisseur && (
                <div className="col-span-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">ID Transaction Provider (Wave / OM)</span>
                  <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                    {item.idTransactionFournisseur}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Motif de Rejet (Si déjà rejeté) */}
          {item.raisonRejet && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Motif du Rejet Administrateur</span>
              </span>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                {item.raisonRejet}
              </p>
            </div>
          )}

          {/* Formulaire de Rejet (si déclenché) */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Motif obligatoire de rejet du virement</span>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  Annuler
                </button>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi le virement est rejeté (ex: Numéro erroné, compte non éligible)..."
                className="w-full p-3 rounded-xl bg-white border border-rose-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600"
                rows={3}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {isMutating ? 'Rejet en cours...' : 'Confirmer le Rejet & Rembourser Wallet'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions / Dock */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isMutating}
            className="px-5 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {isPending && !showRejectForm && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={isMutating}
                className="px-4 py-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Rejeter la demande
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isMutating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] text-xs font-bold hover:bg-[#0F4F3B] disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                {isMutating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F1DFB6]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>Valider & Marquer Effectué</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
