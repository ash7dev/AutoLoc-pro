'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Eye,
  FileText,
  IdCard,
  Image as ImageIcon,
  Info,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { reservationsApi, LocataireDocsResponse, OwnerReservationItem } from '@/src/core/api/reservationsApi';

export interface OwnerTenantKycModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerTenantKycModal: React.FC<OwnerTenantKycModalProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [docs, setDocs] = useState<LocataireDocsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  // Synchronisation ouverture/fermeture du dialog natif
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Chargement direct de l'endpoint GET /reservations/:id/locataire-docs
  useEffect(() => {
    if (!isOpen || !reservation?.id) return;

    setLoading(true);
    setErrorMessage(null);

    reservationsApi
      .getLocataireDocs(reservation.id)
      .then((data) => {
        setDocs(data);
      })
      .catch((err) => {
        console.warn('Erreur chargement locataire-docs:', err);
        setErrorMessage(err?.message || 'Impossible de récupérer les documents du locataire.');
        setDocs({
          prenom: reservation.locataire?.prenom || 'Locataire',
          nom: reservation.locataire?.nom || 'AutoLoc',
          kycStatus: reservation.locataire?.statutKyc || 'VALIDE',
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, reservation]);

  const tenantFullName = `${docs?.prenom || reservation.locataire?.prenom || ''} ${docs?.nom || reservation.locataire?.nom || ''}`.trim();
  const isKycValid = (docs?.kycStatus || reservation.locataire?.statutKyc || '').toUpperCase() === 'VALIDE' || (docs?.kycStatus || '').toUpperCase() === 'VERIFIE';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        if (isOpen) onClose();
      }}
      className="m-auto w-[calc(100%-1rem)] sm:w-full max-w-2xl overflow-hidden rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col p-5 sm:p-7 space-y-5">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── 1. En-tête Modale ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-main text-champagne flex items-center justify-center shrink-0 shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-brand-main text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Vérification d’identité Hôte</span>
            </div>
            <h2 id={titleId} className="font-fraunces text-xl font-normal text-brand-dark">
              Dossier KYC & Permis du locataire
            </h2>
            <p className="text-xs text-slate-500 font-mono font-medium">
              Locataire : <strong className="text-slate-800">{tenantFullName}</strong>
            </p>
          </div>
        </div>

        {/* ── 2. Statut KYC & Consignes ──────────────────────────────────── */}
        <div className="p-4 rounded-2xl bg-brand-main/5 border border-brand-main/10 flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-main shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-slate-700 font-medium leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-dark">Statut du contrôle :</span>
              {isKycValid ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  KYC & Identité Vérifiés
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  En cours de vérification
                </span>
              )}
            </div>
            <p className="text-slate-600">
              Vérifiez la concordance du nom et prénom sur la pièce physique lors de la remise des clés du véhicule.
            </p>
          </div>
        </div>

        {/* Message d'erreur s'il y a lieu */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* ── 3. Contenu / Grille des documents réels ───────────────────── */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-main mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Récupération des documents locataire depuis le serveur...</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Pièce d'identité (Recto) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <IdCard className="w-4 h-4 text-brand-main" />
                    <span>Pièce d’identité (Recto)</span>
                  </div>
                  {docs?.kycDocumentUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Document joint
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Validé
                    </span>
                  )}
                </div>

                {docs?.kycDocumentUrl ? (
                  <div
                    onClick={() => setActiveImageZoom(docs.kycDocumentUrl!)}
                    className="relative group h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 cursor-pointer shadow-2xs"
                  >
                    <img
                      src={docs.kycDocumentUrl}
                      alt="CNI Recto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>Agrandir</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                    <ShieldCheck className="w-7 h-7 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-700">Pièce d’identité validée par AutoLoc</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Document certifié conforme lors du processus KYC.
                    </p>
                  </div>
                )}
              </div>

              {/* Card 2: Permis de conduire */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <FileText className="w-4 h-4 text-brand-main" />
                    <span>Permis de conduire</span>
                  </div>
                  {docs?.permisUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Document joint
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Validé
                    </span>
                  )}
                </div>

                {docs?.permisUrl ? (
                  <div
                    onClick={() => setActiveImageZoom(docs.permisUrl!)}
                    className="relative group h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 cursor-pointer shadow-2xs"
                  >
                    <img
                      src={docs.permisUrl}
                      alt="Permis de conduire"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>Agrandir</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                    <BadgeCheck className="w-7 h-7 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-700">Permis de conduire vérifié</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Permis actif & ancienneté conforme.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rangée 2 : CNI Verso ou Selfie uniquement si les URLs existent */}
            {(docs?.kycDocumentBackUrl || docs?.kycSelfieUrl) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {docs?.kycDocumentBackUrl && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <IdCard className="w-4 h-4 text-brand-main" />
                        <span>Pièce d’identité (Verso)</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Document joint
                      </span>
                    </div>

                    <div
                      onClick={() => setActiveImageZoom(docs.kycDocumentBackUrl!)}
                      className="relative group h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 cursor-pointer shadow-2xs"
                    >
                      <img
                        src={docs.kycDocumentBackUrl}
                        alt="CNI Verso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Agrandir</span>
                      </div>
                    </div>
                  </div>
                )}

                {docs?.kycSelfieUrl && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <ImageIcon className="w-4 h-4 text-brand-main" />
                        <span>Selfie de contrôle</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Biométrie OK
                      </span>
                    </div>

                    <div
                      onClick={() => setActiveImageZoom(docs.kycSelfieUrl!)}
                      className="relative group h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/80 cursor-pointer shadow-2xs"
                    >
                      <img
                        src={docs.kycSelfieUrl}
                        alt="Selfie Biométrique"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Agrandir</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note de confidentialité */}
            <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center gap-2.5">
              <LockKeyhole className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Ces documents sont strictement confidentiels et mis à votre disposition uniquement pour le contrôle d'identité lors du Check-in.
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-brand-main text-champagne font-bold text-xs hover:bg-forest-700 transition-colors cursor-pointer shadow-sm"
          >
            Fermer le dossier
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Image Modal */}
      {activeImageZoom && (
        <div
          onClick={() => setActiveImageZoom(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={activeImageZoom}
              alt="Zoom document"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-center text-white text-xs font-medium pt-3">
              Cliquez n'importe où pour fermer l'aperçu
            </p>
          </div>
        </div>
      )}
    </dialog>
  );
};
