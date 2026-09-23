'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  Camera,
  Phone,
  MessageSquare,
  FileText,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  User,
  Car,
  Maximize2,
  Check,
} from 'lucide-react';
import type { AdminReservationQueueItem } from '../../../../core/api/adminAnalyticsApi';
import { formatCurrency } from '@/lib/utils';

interface AdminReservationInspectorModalProps {
  reservation: AdminReservationQueueItem | null;
  detailData?: any;
  isOpen: boolean;
  onClose: () => void;
  onForceConfirm: (id: string) => Promise<void>;
  onForceComplete: (id: string) => Promise<void>;
  onForceCancel: (id: string, raison?: string) => Promise<void>;
  isMutating?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const CHAMPAGNE = '#F1DFB6';

const PRESET_CANCEL_REASONS = [
  "⚠️ Paiement en ligne incomplet ou rejeté par l'opérateur",
  "🚘 Véhicule non disponible ou en panne avant la prise en main",
  "📄 Défaut de présentation des pièces d'identité / permis au check-in",
  "👤 Annulation d'urgence demandée par le locataire",
  "🏠 Annulation d'urgence demandée par l'hôte",
];

export const AdminReservationInspectorModal: React.FC<AdminReservationInspectorModalProps> = ({
  reservation,
  detailData,
  isOpen,
  onClose,
  onForceConfirm,
  onForceComplete,
  onForceCancel,
  isMutating,
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'PHOTOS_ETAT' | 'FINANCES' | 'CONTACTS'>('TIMELINE');
  const [showCancelForm, setShowCancelForm] = useState<boolean>(false);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [activePhotoType, setActivePhotoType] = useState<'CHECKIN' | 'CHECKOUT'>('CHECKIN');

  if (!isOpen || !reservation) return null;

  const resData = detailData || reservation;
  const photosCheckin = resData.photosEtatLieu?.filter((p: any) => p.type === 'CHECKIN') || [];
  const photosCheckout = resData.photosEtatLieu?.filter((p: any) => p.type === 'CHECKOUT') || [];

  const handleConfirmCancel = async () => {
    const finalReason = customReason.trim() || selectedPresetReason || "Annulation forcée par l'administrateur";
    await onForceCancel(reservation.id, finalReason);
    setShowCancelForm(false);
  };

  const renterPhone = reservation.locataire?.telephone?.replace(/\s+/g, '') || '';
  const ownerPhone = reservation.proprietaire?.telephone?.replace(/\s+/g, '') || '';

  const refId = `#RES-${reservation.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_24px_70px_-20px_rgba(10,61,46,0.35)] overflow-hidden font-sans"
        style={fontStyle}
      >
        {/* Header Bar */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0 border-b"
          style={{
            background: `linear-gradient(135deg, ${FOREST} 0%, ${FOREST_DARK} 100%)`,
            borderColor: 'rgba(241,223,182,0.15)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
              style={{ background: 'rgba(241,223,182,0.12)', borderColor: 'rgba(241,223,182,0.25)', color: CHAMPAGNE }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-normal text-white truncate">Réservation {refId}</h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                  style={{ background: 'rgba(241,223,182,0.12)', borderColor: 'rgba(241,223,182,0.3)', color: CHAMPAGNE }}
                >
                  {reservation.statut}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(241,223,182,0.65)' }}>
                Créée le {new Date(reservation.creeLe).toLocaleDateString('fr-FR')} • {reservation.nbJours || 1} jour(s) • {formatCurrency(Number(reservation.prixTotal || 0))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {reservation.contratUrl && (
              <a
                href={reservation.contratUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/15"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Contrat PDF</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40 dark:bg-slate-950/40">
          {/* Left Column: Inspection Views (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('TIMELINE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'TIMELINE' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={activeTab === 'TIMELINE' ? { color: FOREST } : undefined}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Cycle & Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('PHOTOS_ETAT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'PHOTOS_ETAT' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={activeTab === 'PHOTOS_ETAT' ? { color: FOREST } : undefined}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>États des lieux ({photosCheckin.length + photosCheckout.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('FINANCES')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'FINANCES' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={activeTab === 'FINANCES' ? { color: FOREST } : undefined}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Finances & Séquestre</span>
              </button>

              <button
                onClick={() => setActiveTab('CONTACTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'CONTACTS' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'
                }`}
                style={activeTab === 'CONTACTS' ? { color: FOREST } : undefined}
              >
                <User className="w-3.5 h-3.5" />
                <span>Contacts</span>
              </button>
            </div>

            {/* TAB 1: TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Suivi Chronologique de la Location
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {/* Step 1: Booking Created */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Réservation Créée</p>
                        <p className="text-[11px] text-slate-500">{new Date(reservation.creeLe).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>

                    {/* Step 2: Payment */}
                    <div className="relative">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          reservation.montantPayeEnLigne ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {reservation.montantPayeEnLigne ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Acompte / Paiement en Ligne</p>
                        <p className="text-[11px] text-slate-500">
                          {reservation.montantPayeEnLigne
                            ? `${formatCurrency(Number(reservation.montantPayeEnLigne))} via ${reservation.paiement?.fournisseur || 'En ligne'}`
                            : 'En attente de paiement'}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Host Confirmation */}
                    <div className="relative">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          reservation.confirmeeLe ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-white'
                        }`}
                      >
                        {reservation.confirmeeLe ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Confirmation par l'Hôte</p>
                        <p className="text-[11px] text-slate-500">
                          {reservation.confirmeeLe
                            ? `Confirmée le ${new Date(reservation.confirmeeLe).toLocaleString('fr-FR')}`
                            : 'En attente de la confirmation de l\'hôte'}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Check-in */}
                    <div className="relative">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          reservation.checkInLe ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {reservation.checkInLe ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Prise en main (Check-in & Photos)</p>
                        <p className="text-[11px] text-slate-500">
                          {reservation.checkInLe
                            ? `Effectuée le ${new Date(reservation.checkInLe).toLocaleString('fr-FR')} (${photosCheckin.length} photos)`
                            : `Prévue le ${new Date(reservation.dateDebut).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>

                    {/* Step 5: Check-out */}
                    <div className="relative">
                      <div
                        className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          reservation.checkOutLe ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {reservation.checkOutLe ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Restitution (Check-out & Clôture)</p>
                        <p className="text-[11px] text-slate-500">
                          {reservation.checkOutLe
                            ? `Restituée le ${new Date(reservation.checkOutLe).toLocaleString('fr-FR')}`
                            : `Prévue le ${new Date(reservation.dateFin).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS ETAT DES LIEUX */}
            {activeTab === 'PHOTOS_ETAT' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
                  <button
                    onClick={() => setActivePhotoType('CHECKIN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activePhotoType === 'CHECKIN' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                    style={activePhotoType === 'CHECKIN' ? { color: FOREST } : undefined}
                  >
                    Photos Check-in ({photosCheckin.length})
                  </button>
                  <button
                    onClick={() => setActivePhotoType('CHECKOUT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activePhotoType === 'CHECKOUT' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                    style={activePhotoType === 'CHECKOUT' ? { color: FOREST } : undefined}
                  >
                    Photos Check-out ({photosCheckout.length})
                  </button>
                </div>

                {activePhotoType === 'CHECKIN' ? (
                  photosCheckin.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photosCheckin.map((p: any, idx: number) => (
                        <div key={p.id || idx} className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <Image src={p.url} alt={`Check-in ${idx + 1}`} fill className="object-cover" unoptimized />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                            {p.categorie || `Photo ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      Aucune photo d'état des lieux prise lors de la prise en main (Check-in).
                    </div>
                  )
                ) : (
                  photosCheckout.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photosCheckout.map((p: any, idx: number) => (
                        <div key={p.id || idx} className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <Image src={p.url} alt={`Check-out ${idx + 1}`} fill className="object-cover" unoptimized />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                            {p.categorie || `Photo ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center rounded-3xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      Aucune photo d'état des lieux prise lors de la restitution (Check-out).
                    </div>
                  )
                )}
              </div>
            )}

            {/* TAB 3: FINANCES & SEQUESTRE */}
            {activeTab === 'FINANCES' && (
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Ventilation Financière de la Réservation
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      Paiement {reservation.modePaiement || 'TOTAL_EN_LIGNE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Prix Total Réservation</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                        {formatCurrency(Number(reservation.prixTotal || 0))}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Acompte perçu en ligne</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                        {formatCurrency(Number(reservation.montantPayeEnLigne || 0))}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Commission AutoLoc</span>
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                        {formatCurrency(Number(reservation.commission || 0))}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Hôte Propriétaire</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                        {formatCurrency(Number(reservation.montantProprietaire || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CONTACTS */}
            {activeTab === 'CONTACTS' && (
              <div className="space-y-4">
                {/* Locataire Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Locataire (Conducteur)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      ✓ KYC {reservation.locataire?.statutKyc || 'VERIFIE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                    >
                      {reservation.locataire?.prenom?.[0]}{reservation.locataire?.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {reservation.locataire?.prenom} {reservation.locataire?.nom}
                      </p>
                      <p className="text-xs text-slate-500">{reservation.locataire?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {renterPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${renterPhone}`}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Appeler Locataire</span>
                      </a>
                      <a
                        href={`https://wa.me/${renterPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Locataire</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Hôte Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Propriétaire (Hôte)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      ✓ Hôte AutoLoc
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                    >
                      {reservation.proprietaire?.prenom?.[0]}{reservation.proprietaire?.nom?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {reservation.proprietaire?.prenom} {reservation.proprietaire?.nom}
                      </p>
                      <p className="text-xs text-slate-500">{reservation.proprietaire?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {ownerPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${ownerPhone}`}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Appeler Hôte</span>
                      </a>
                      <a
                        href={`https://wa.me/${ownerPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Hôte</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Emergency Actions Console (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Vehicle Summary Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Véhicule Réservé</span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                  {reservation.vehicule?.immatriculation || 'Plaque N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border shrink-0">
                  {reservation.vehicule?.photos?.[0]?.url ? (
                    <Image src={reservation.vehicule.photos[0].url} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Auto</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {reservation.vehicule?.marque} {reservation.vehicule?.modele}
                  </p>
                  <p className="text-xs text-slate-500">{reservation.vehicule?.ville || 'Sénégal'}</p>
                </div>
              </div>
            </div>

            {/* Cancel Form Workflow */}
            {showCancelForm ? (
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-red-900 dark:text-red-300">Motif de l'annulation d'urgence</h4>
                  <button onClick={() => setShowCancelForm(false)} className="text-red-400 hover:text-red-700 text-xs cursor-pointer">Annuler</button>
                </div>

                <div className="space-y-1.5">
                  {PRESET_CANCEL_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPresetReason(reason)}
                      className={`w-full text-left p-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                        selectedPresetReason === reason
                          ? 'bg-red-600 text-white font-semibold border-red-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-transparent hover:bg-red-100 dark:hover:bg-red-900/40'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Note ou raison spécifique (optionnel)..."
                    className="w-full p-2.5 text-xs rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-300"
                    rows={2}
                  />
                </div>

                <button
                  onClick={handleConfirmCancel}
                  disabled={isMutating}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirmer l'annulation forcée</span>
                </button>
              </div>
            ) : (
              /* Emergency Actions Dock */
              <div className="space-y-2 pt-1">
                {reservation.statut === 'PAYEE' && (
                  <button
                    onClick={() => onForceConfirm(reservation.id)}
                    disabled={isMutating}
                    className="w-full py-3.5 px-4 rounded-2xl font-normal text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border"
                    style={{
                      background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})`,
                      borderColor: 'rgba(241,223,182,0.25)',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: CHAMPAGNE }} />
                    <span>Forcer la confirmation par l'hôte</span>
                  </button>
                )}

                {reservation.statut === 'EN_COURS' && (
                  <button
                    onClick={() => onForceComplete(reservation.id)}
                    disabled={isMutating}
                    className="w-full py-3.5 px-4 rounded-2xl font-normal text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border"
                    style={{
                      background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})`,
                      borderColor: 'rgba(241,223,182,0.25)',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: CHAMPAGNE }} />
                    <span>Forcer la fin / clôture de location</span>
                  </button>
                )}

                {reservation.statut !== 'ANNULEE' && reservation.statut !== 'TERMINEE' && (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    disabled={isMutating}
                    className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Annulation d'urgence (Force Cancel)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
