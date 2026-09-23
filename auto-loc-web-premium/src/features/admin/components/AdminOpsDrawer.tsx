'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Phone, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { formatXOF } from './AdminExecutiveMetrics';

export type OpsDrawerItemType = 'kyc' | 'vehicle' | 'withdrawal' | 'dispute';

export interface OpsDrawerData {
  type: OpsDrawerItemType;
  id: string;
  title: string;
  subtitle?: string;
  submittedAt?: string;
  waitHours?: number;
  phone?: string | null;
  email?: string | null;
  amount?: number;
  method?: string;
  recipient?: string;
  city?: string;
  pricePerDay?: number;
  ownerName?: string;
  renterName?: string;
  vehicle?: string;
  estimatedCost?: number | null;
  motif?: string;
}

interface AdminOpsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: OpsDrawerData | null;
  onActionComplete?: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

export const AdminOpsDrawer: React.FC<AdminOpsDrawerProps> = ({ isOpen, onClose, data, onActionComplete }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !data) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      // Simulation or trigger action API if needed
      await new Promise((resolve) => setTimeout(resolve, 600));
      onActionComplete?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onActionComplete?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={fontStyle}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {data.type === 'kyc' && 'Vérification KYC'}
                  {data.type === 'vehicle' && 'Validation Véhicule'}
                  {data.type === 'withdrawal' && 'Demande de Retrait'}
                  {data.type === 'dispute' && 'Dossier de Litige'}
                </span>
                {data.waitHours !== undefined && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {data.waitHours}h d'attente
                  </span>
                )}
              </div>
              <h2 className="text-lg font-normal text-[#041912] dark:text-white mt-2">{data.title}</h2>
              {data.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.subtitle}</p>}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Type Specific Information */}
            {data.type === 'kyc' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nom complet :</span>
                    <span className="font-medium text-slate-900 dark:text-white">{data.title}</span>
                  </div>
                  {data.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email :</span>
                      <span className="font-medium text-slate-900 dark:text-white">{data.email}</span>
                    </div>
                  )}
                  {data.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone :</span>
                      <span className="font-medium text-slate-900 dark:text-white">{data.phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Contrôle de conformité CIN & Permis</div>
                    <div className="text-[11px] mt-0.5 opacity-90">
                      Vérifiez la lisibilité du verso, la concordance de la photo selfie et l'expiration de la pièce.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.type === 'vehicle' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Propriétaire :</span>
                    <span className="font-medium text-slate-900 dark:text-white">{data.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Localisation :</span>
                    <span className="font-medium text-slate-900 dark:text-white">{data.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix / Jour :</span>
                    <span className="font-medium" style={{ color: FOREST }}>
                      {formatXOF(data.pricePerDay || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {data.type === 'withdrawal' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-center">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Montant à reverser</span>
                  <div className="text-3xl font-normal mt-1" style={{ color: FOREST }}>
                    {formatXOF(data.amount || 0)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                    {data.method} • {data.recipient}
                  </div>
                </div>
              </div>
            )}

            {data.type === 'dispute' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-2">
                  <div className="font-medium text-rose-900 dark:text-rose-200 text-sm">{data.motif}</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locataire :</span>
                    <span className="font-medium text-slate-900 dark:text-white">{data.renterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hôte :</span>
                    <span className="font-medium text-slate-900 dark:text-white">{data.ownerName}</span>
                  </div>
                  {data.estimatedCost && (
                    <div className="flex justify-between pt-2 border-t border-rose-200/50">
                      <span className="text-slate-500">Montant réclamé :</span>
                      <span className="font-medium text-rose-700 dark:text-rose-400">
                        {formatXOF(data.estimatedCost)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Contact Bar */}
            {data.phone && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Contact direct :</span>
                <a
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> {data.phone}
                </a>
              </div>
            )}

            {/* Rejection Reason Form */}
            {isRejecting && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-slate-700 dark:text-slate-300 font-medium">Motif du refus :</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez la raison du rejet (ex: Document illisible, pièce expirée)..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-rose-500 outline-none h-24"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
            {!isRejecting ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Rejeter
                </button>

                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-normal text-white transition-opacity flex items-center justify-center gap-2 shadow-xs"
                  style={{ backgroundColor: FOREST }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Valider
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejecting(false)}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>

                <button
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Confirmer le rejet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
