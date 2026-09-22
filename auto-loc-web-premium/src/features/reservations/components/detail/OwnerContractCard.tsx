'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ExternalLink,
  Download,
  Loader2,
  Info,
  X,
  Clock,
  Calendar,
  Shield,
} from 'lucide-react';
import { reservationsApi, ContractAccessResponse } from '@/src/core/api/reservationsApi';
import { API_URL } from '@/lib/config';

export interface OwnerContractCardProps {
  reservationId: string;
  statut: string;
  dateDebut?: string;
}

export const OwnerContractCard: React.FC<OwnerContractCardProps> = ({
  reservationId,
  statut,
  dateDebut,
}) => {
  const [loadingAction, setLoadingAction] = useState<'view' | 'download' | null>(null);
  const [infoModalMessage, setInfoModalMessage] = useState<{ title: string; desc: string } | null>(null);
  const [showRestrictionModal, setShowRestrictionModal] = useState<boolean>(false);

  const normalizedStatus = (statut?.toUpperCase() ?? '');

  const isPendingPayment = normalizedStatus === 'EN_ATTENTE_PAIEMENT' || normalizedStatus === 'INITIEE';
  const isPendingHost = normalizedStatus === 'PAYEE';
  const isCompleted = normalizedStatus === 'TERMINEE';
  const isSealed = ['LITIGE', 'ANNULEE', 'EXPIREE'].includes(normalizedStatus);

  /**
   * Règle de sécurité & confidentialité AutoLoc :
   * Le contrat complet (avec coordonnées personnelles directes des parties)
   * est débloqué à l'impression/téléchargement 24h avant la date de prise en charge.
   */
  const isPrintRestricted = (): boolean => {
    if (normalizedStatus !== 'CONFIRMEE' || !dateDebut) return false;
    const startDate = new Date(dateDebut).getTime();
    const now = Date.now();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
    return hoursUntilStart > 24;
  };

  const handlePressLocked = (type: 'PAYMENT' | 'HOST' | 'COMPLETED' | 'SEALED') => {
    if (type === 'PAYMENT') {
      setInfoModalMessage({
        title: 'Contrat non généré',
        desc: 'Le contrat de location légal sera généré et horodaté dès que le locataire aura effectué son paiement d’acompte en ligne.',
      });
    } else if (type === 'HOST') {
      setInfoModalMessage({
        title: 'Confirmation hôte requise',
        desc: 'Le paiement du locataire est sécurisé en escrow. Le contrat sera scellé dès votre confirmation de la réservation.',
      });
    } else if (type === 'COMPLETED') {
      setInfoModalMessage({
        title: 'Location terminée & archivée',
        desc: 'Cette location est officiellement terminée. Le contrat légal reste archivé pour vos déclarations fiscales et pièces de preuve.',
      });
    } else if (type === 'SEALED') {
      setInfoModalMessage({
        title: 'Contrat scellé & archivé',
        desc: 'Cette réservation a été annulée ou fait l’objet d’un dossier d’arbitrage. Le document reste scellé et conservé sous sceau numérique à des fins légales.',
      });
    }
  };

  const handleOpenContract = async (action: 'view' | 'download') => {
    if (isPendingPayment) return handlePressLocked('PAYMENT');
    if (isPendingHost) return handlePressLocked('HOST');

    if (isPrintRestricted()) {
      setShowRestrictionModal(true);
      return;
    }

    setLoadingAction(action);
    try {
      const data: ContractAccessResponse = await reservationsApi.getContractAccessUrl(reservationId);

      let rawUrl =
        action === 'view'
          ? data.viewUrl || `/reservations/${reservationId}/contract/pdf`
          : data.downloadUrl || `/reservations/${reservationId}/contract/pdf?download=true`;

      const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${API_URL.replace(/\/api$/, '')}${rawUrl}`;

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.download = `Contrat-AutoLoc-Hote-${reservationId.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('Erreur accès contrat hôte:', err);
      const fallbackUrl = `${API_URL}/reservations/${reservationId}/contract/pdf${action === 'download' ? '?download=true' : ''}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingAction(null);
    }
  };

  /* ── CAS 1 : Attente Paiement Locataire ───────────────────────────────── */
  if (isPendingPayment) {
    return (
      <>
        <div
          onClick={() => handlePressLocked('PAYMENT')}
          className="rounded-3xl border border-amber-300/80 bg-amber-50/70 p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/60 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-200/80 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-amber-950">Contrat de location</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-300 text-amber-900 font-extrabold text-[10px] tracking-wide uppercase">
                  Attente paiement
                </span>
              </div>
              <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                Le contrat sera généré dès la validation du paiement d’acompte du locataire.
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        </div>

        {infoModalMessage && (
          <InfoModal message={infoModalMessage} onClose={() => setInfoModalMessage(null)} />
        )}
      </>
    );
  }

  /* ── CAS 2 : Paiement Locataire Reçu, Attente Confirmation Hôte ─────── */
  if (isPendingHost) {
    return (
      <>
        <div
          onClick={() => handlePressLocked('HOST')}
          className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-blue-100/60 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-blue-950">Contrat en attente de validation</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-200 border border-blue-300 text-blue-900 font-extrabold text-[10px] tracking-wide uppercase">
                  Confirmation requise
                </span>
              </div>
              <p className="text-xs text-blue-800/80 font-medium mt-0.5">
                Le paiement locataire est sécurisé en escrow. Validez la réservation pour sceller le contrat.
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-200/60 text-blue-900 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        </div>

        {infoModalMessage && (
          <InfoModal message={infoModalMessage} onClose={() => setInfoModalMessage(null)} />
        )}
      </>
    );
  }

  /* ── CAS 3, 4 & 5 : CONTRAT ACTIF, TERMINÉ OU SCELLÉ ──────────────────── */
  const restricted = isPrintRestricted();
  const isDisabledAction = isSealed || restricted;

  return (
    <>
      <div
        onClick={() => {
          if (isSealed) handlePressLocked('SEALED');
          else if (restricted) setShowRestrictionModal(true);
        }}
        className={`rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#041912] ${
          isDisabledAction ? 'cursor-pointer' : ''
        }`}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isSealed
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : restricted
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-100 text-[#0A3D2E]'
            }`}
          >
            {isSealed ? (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            ) : restricted ? (
              <Lock className="w-5 h-5 text-amber-700" />
            ) : isCompleted ? (
              <FileCheck2 className="w-5 h-5 text-[#0A3D2E]" />
            ) : (
              <FileText className="w-5 h-5 text-[#0A3D2E]" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-fraunces text-xl text-[#041912] font-normal tracking-tight">
                {isCompleted
                  ? 'Contrat de location (Archivé)'
                  : isSealed
                  ? 'Contrat de location (Scellé)'
                  : restricted
                  ? 'Contrat de location (Restreint H-24)'
                  : 'Contrat de location officiel'}
              </h3>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  isSealed
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : restricted
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-[#0A3D2E]'
                }`}
              >
                {isSealed
                  ? 'Scellé & Archivé'
                  : isCompleted
                  ? 'Terminé'
                  : restricted
                  ? 'Débloqué 24h avant'
                  : 'Signé & Certifié'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {isSealed
                ? 'Document légalement scellé. Conservé sous scellé numérique pour preuve et garantie légale.'
                : isCompleted
                ? 'Location achevée. Le contrat d’assurance et d’arbitrage reste téléchargeable.'
                : restricted
                ? 'Disponible 24h avant le début de location pour des raisons de confidentialité. Cliquez pour plus de détails.'
                : 'Document officiel horodaté avec garanties juridiques et couverture assurance AutoLoc.'}
            </p>
          </div>
        </div>

        {/* Boutons d'Action Consulter / Télécharger (Désactivés si restreint ou scellé) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            aria-disabled={isDisabledAction || loadingAction !== null}
            disabled={loadingAction !== null}
            onClick={(e) => {
              e.stopPropagation();
              if (isSealed) {
                handlePressLocked('SEALED');
                return;
              }
              if (restricted) {
                setShowRestrictionModal(true);
                return;
              }
              handleOpenContract('view');
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs transition-all shadow-xs ${
              isDisabledAction
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-[#0F4F3B] cursor-pointer'
            }`}
          >
            {loadingAction === 'view' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F1DFB6]" />
            ) : isDisabledAction ? (
              <Lock className="w-3.5 h-3.5 text-[#F1DFB6]" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-[#F1DFB6]" />
            )}
            <span>Consulter</span>
          </button>

          <button
            type="button"
            aria-disabled={isDisabledAction || loadingAction !== null}
            disabled={loadingAction !== null}
            onClick={(e) => {
              e.stopPropagation();
              if (isSealed) {
                handlePressLocked('SEALED');
                return;
              }
              if (restricted) {
                setShowRestrictionModal(true);
                return;
              }
              handleOpenContract('download');
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all ${
              isDisabledAction
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-slate-200 cursor-pointer'
            }`}
          >
            {loadingAction === 'download' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
            ) : isDisabledAction ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {infoModalMessage && (
        <InfoModal message={infoModalMessage} onClose={() => setInfoModalMessage(null)} />
      )}

      {showRestrictionModal && dateDebut && (
        <PrintRestrictionModal
          isOpen={showRestrictionModal}
          onClose={() => setShowRestrictionModal(false)}
          dateDebut={dateDebut}
        />
      )}
    </>
  );
};

// Sub-component InfoModal
function InfoModal({
  message,
  onClose,
}: {
  message: { title: string; desc: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#041912]">{message.title}</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">{message.desc}</p>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs hover:bg-[#0F4F3B] transition-colors cursor-pointer"
          >
            J’ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component PrintRestrictionModal
function PrintRestrictionModal({
  isOpen,
  onClose,
  dateDebut,
}: {
  isOpen: boolean;
  onClose: () => void;
  dateDebut: string;
}) {
  if (!isOpen) return null;

  const debutDate = new Date(dateDebut);
  const unlockDate = new Date(debutDate.getTime() - 24 * 60 * 60 * 1000);

  const formattedDebut = debutDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedUnlock = unlockDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Impression restreinte</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 mb-0.5">
                Disponible 24h avant le début
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pour protéger la vie privée des utilisateurs, le contrat complet (avec coordonnées directes) ne peut être imprimé ou téléchargé que 24 heures avant le début de la location.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Début de la location
              </p>
            </div>
            <p className="text-xs font-extrabold text-slate-800 capitalize">{formattedDebut}</p>

            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-bold">
                  Téléchargement débloqué à partir du :
                </p>
              </div>
              <p className="text-xs font-black text-emerald-800 capitalize">{formattedUnlock}</p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3">
            <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
              Cette mesure garantit la sécurité des coordonnées personnelles tout en permettant la préparation de la prise en charge.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs hover:bg-[#0F4F3B] transition-colors cursor-pointer"
          >
            J’ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

// Export alternatif pour compatibilité
export { OwnerContractCard as ContractCard };
