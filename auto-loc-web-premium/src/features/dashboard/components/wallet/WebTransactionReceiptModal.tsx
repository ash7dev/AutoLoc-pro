'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Printer, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { WalletTransactionItem } from '../../../../core/api/walletApi';

interface WebTransactionReceiptModalProps {
  transaction: WalletTransactionItem | null;
  onClose: () => void;
}

export const WebTransactionReceiptModal: React.FC<WebTransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.sens === 'CREDIT';
  const numericMontant = parseFloat(transaction.montant || '0');
  const numericSoldeApres = parseFloat(transaction.soldeApres || '0');

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/10">
        {/* Top Header Card */}
        <div className="relative bg-gradient-to-br from-[#041912] to-[#0A3D2E] p-6 text-[#F1DFB6]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#F1DFB6] hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F1DFB6]/15 px-3 py-1 text-xs font-semibold text-[#F1DFB6]">
              <Sparkles className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span>Reçu Financier AutoLoc</span>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
              {isCredit ? (
                <ArrowDownLeft className="h-8 w-8 text-[#4ADE80]" />
              ) : (
                <ArrowUpRight className="h-8 w-8 text-amber-300" />
              )}
            </div>

            <div>
              <p className="text-xs text-[#F1DFB6]/75 uppercase tracking-wider font-semibold">
                {isCredit ? 'Gain de Location Encaissé' : 'Débit / Virement Effectué'}
              </p>
              <h3 className="font-display text-3xl font-extrabold text-[#F1DFB6] tabular-nums mt-1">
                {isCredit ? '+' : '-'}&nbsp;{formatCurrency(numericMontant)} <span className="text-sm font-sans text-[#F1DFB6]/60">FCFA</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* Reference copy bar */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Identifiant Unique (TX-ID)</p>
              <p className="font-mono font-bold text-slate-800 truncate max-w-[220px]">{transaction.id}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Statut de la transaction :</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Validé & Traité
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Date et Heure :</span>
              <span className="font-mono font-semibold text-slate-900">{formatDate(transaction.creeLe)}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Mode de règlement :</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                {transaction.fournisseur === 'WAVE' ? (
                  <>
                    <img src="/wave.png" alt="Wave" className="h-4 w-4 object-contain" />
                    Wave Sénégal
                  </>
                ) : transaction.fournisseur === 'ORANGE_MONEY' ? (
                  <>
                    <img src="/orange.png" alt="OM" className="h-4 w-4 object-contain" />
                    Orange Money
                  </>
                ) : (
                  'Solde Portefeuille AutoLoc'
                )}
              </span>
            </div>

            {transaction.reservationId && (
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Réservation Associée :</span>
                <span className="font-mono font-semibold text-emerald-700">#{transaction.reservationId.slice(-8)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Solde Portefeuille Après :</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(numericSoldeApres)} FCFA</span>
            </div>
          </div>

          {/* Security stamp */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/60">
            <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0" />
            <span>Document comptable officiel émis par AutoLoc Technologies S.A. Sénégal.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#041912] px-6 py-3 text-xs font-extrabold text-[#F1DFB6] shadow-md hover:bg-[#0A3D2E] transition-all cursor-pointer"
            >
              <span>Fermer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
