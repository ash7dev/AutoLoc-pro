'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Scale,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  ExternalLink,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { AdminDisputeDetail } from '../../../../core/api/adminAnalyticsApi';

interface AdminDisputeInspectorModalProps {
  dispute: AdminDisputeDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (litigeId: string, decision: 'FONDE' | 'NON_FONDE', montantCompensation?: number) => Promise<void>;
  isMutating: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

export const AdminDisputeInspectorModal: React.FC<AdminDisputeInspectorModalProps> = ({
  dispute,
  isOpen,
  onClose,
  onResolve,
  isMutating,
}) => {
  const [decisionType, setDecisionType] = useState<'FONDE' | 'NON_FONDE' | 'PARTIEL'>('FONDE');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  if (!isOpen || !dispute) return null;

  const res = dispute.reservation;
  const totalPaid = res.paiement?.montant ?? res.totalLocataire;
  const isPending = dispute.statut === 'EN_ATTENTE';

  const handleConfirmArbitrage = async () => {
    let finalDecision: 'FONDE' | 'NON_FONDE' = 'FONDE';
    let compAmount: number | undefined = undefined;

    if (decisionType === 'NON_FONDE') {
      finalDecision = 'NON_FONDE';
    } else if (decisionType === 'PARTIEL') {
      finalDecision = 'FONDE';
      compAmount = customAmount ? parseFloat(customAmount) : undefined;
    } else {
      finalDecision = 'FONDE';
    }

    await onResolve(dispute.id, finalDecision, compAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        style={fontStyle}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
            >
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  #{res.id.slice(0, 8).toUpperCase()}
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Litige : {dispute.motif.replace(/_/g, ' ')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Déclaré le {new Date(dispute.openedAt).toLocaleDateString('fr-FR')}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" /> {dispute.slaWaitHours}h d'attente
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Dispute Description & Claimed Amount Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Description du préjudice déclaré</span>
              </div>
              {dispute.coutEstime && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold tabular-nums">
                  Montant réclamé : {dispute.coutEstime.toLocaleString('fr-FR')} FCFA
                </span>
              )}
            </div>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {dispute.description}
            </p>
          </div>

          {/* Renter vs Owner Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Renter */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Locataire</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {res.locataire.statutKyc === 'VERIFIE' ? 'KYC Vérifié' : 'KYC Non Vérifié'}
                </span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                {res.locataire.fullName}
              </div>
              <div className="space-y-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{res.locataire.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{res.locataire.email || 'Non renseigné'}</span>
                </div>
              </div>
            </div>

            {/* Owner */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Propriétaire (Hôte)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {res.proprietaire.statutKyc === 'VERIFIE' ? 'KYC Vérifié' : 'KYC Non Vérifié'}
                </span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                {res.proprietaire.fullName}
              </div>
              <div className="space-y-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{res.proprietaire.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{res.proprietaire.email || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Contract Info */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                {res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele} (${res.vehicule.annee})` : 'Véhicule'}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Plaque : {res.vehicule?.immatriculation || 'N/A'} • Ville : {res.vehicule?.ville || 'N/A'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {res.contratUrl && (
                <a
                  href={res.contratUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contrat PDF</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Transaction</div>
                <div className="font-semibold text-slate-900 dark:text-white tabular-nums text-sm">
                  {totalPaid.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Photos Comparator (Check-in vs Check-out) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0A3D2E] dark:text-[#F1DFB6]" />
                <span>Preuves Photos : Comparatif État des Lieux</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check-in Photos */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                  <span>📸 Check-in ({res.photosCheckin.length} photos)</span>
                </div>
                {res.photosCheckin.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {res.photosCheckin.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhoto(photo.url)}
                        className="relative h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer border border-slate-300/60 dark:border-slate-700 group"
                      >
                        <Image src={photo.url} alt="Checkin" fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px] py-4 text-center">Aucune photo enregistrée au Check-in</p>
                )}
              </div>

              {/* Check-out Photos */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                  <span>📸 Check-out ({res.photosCheckout.length} photos)</span>
                </div>
                {res.photosCheckout.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {res.photosCheckout.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhoto(photo.url)}
                        className="relative h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 cursor-pointer border border-slate-300/60 dark:border-slate-700 group"
                      >
                        <Image src={photo.url} alt="Checkout" fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px] py-4 text-center">Aucune photo enregistrée au Check-out</p>
                )}
              </div>
            </div>
          </div>

          {/* Arbitration Action Panel */}
          {isPending ? (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-4">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0A3D2E] dark:text-[#F1DFB6]" />
                <span>Panneau de Décision & Arbitrage Financier</span>
              </div>

              {/* Radio options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Locataire */}
                <button
                  type="button"
                  onClick={() => setDecisionType('FONDE')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    decisionType === 'FONDE'
                      ? 'border-[#0A3D2E] bg-[#0A3D2E]/10 dark:bg-[#F1DFB6]/20 text-[#0A3D2E] dark:text-[#F1DFB6] font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>🟢 Pour le Locataire</span>
                    {decisionType === 'FONDE' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-normal opacity-80">Remboursement 100% locataire</span>
                </button>

                {/* Proprietaire */}
                <button
                  type="button"
                  onClick={() => setDecisionType('NON_FONDE')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    decisionType === 'NON_FONDE'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>🔴 Pour l'Hôte</span>
                    {decisionType === 'NON_FONDE' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-normal opacity-80">Rejet du litige & versement à l'hôte</span>
                </button>

                {/* Partiel */}
                <button
                  type="button"
                  onClick={() => setDecisionType('PARTIEL')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    decisionType === 'PARTIEL'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>🟡 Compensation Partielle</span>
                    {decisionType === 'PARTIEL' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-normal opacity-80">Ventilation sur mesure en FCFA</span>
                </button>
              </div>

              {/* Custom amount input for partial */}
              {decisionType === 'PARTIEL' && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Montant de compensation à attribuer au propriétaire (FCFA)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Ex: 25000"
                      className="w-full pl-3 pr-16 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-semibold outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                      FCFA
                    </span>
                  </div>
                  {customAmount && parseFloat(customAmount) > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1">
                      <span>Remboursement locataire calculé :</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {Math.max(0, totalPaid - parseFloat(customAmount)).toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Action Submit */}
              <button
                type="button"
                onClick={handleConfirmArbitrage}
                disabled={isMutating}
                className="w-full py-3 rounded-xl text-white font-medium shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
              >
                {isMutating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Application de la décision d'arbitrage...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#F1DFB6]" />
                    <span>Valider et appliquer l'arbitrage officiel</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-semibold">Statut du litige : </span>
                <span>{dispute.statut === 'FONDE' ? 'Fondé (Arbitré en faveur du locataire)' : 'Non fondé (Arbitré en faveur de l\'hôte)'}</span>
                {dispute.resoluLe && (
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Résolu le {new Date(dispute.resoluLe).toLocaleDateString('fr-FR')} par l'administrateur
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Photo Preview */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden">
            <Image src={activePhoto} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
};
