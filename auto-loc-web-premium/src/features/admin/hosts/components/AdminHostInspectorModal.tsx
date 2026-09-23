'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  DollarSign,
  Car,
  Star,
  CheckCircle2,
  Ban,
  FileText,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { HostHealth360, HostItem } from '../hooks/useAdminHosts';
import { formatCurrency } from '@/lib/utils';

interface AdminHostInspectorModalProps {
  item: HostItem | null;
  health360?: HostHealth360;
  isOpen: boolean;
  onClose: () => void;
  onValidateVehicle: (vehicleId: string) => Promise<void>;
  onSuspendVehicle: (vehicleId: string, raison: string) => Promise<void>;
  onFeatureVehicle: (vehicleId: string, active: boolean) => Promise<void>;
  onDeletePhoto: (vehicleId: string, photoId: string) => Promise<void>;
  onSetMainPhoto: (vehicleId: string, photoId: string) => Promise<void>;
  onExecuteFleetAction: (hostId: string, action: 'SUSPEND_ALL' | 'ACTIVATE_ALL', raison?: string) => Promise<void>;
  onBanHost: (userId: string, raison?: string) => Promise<void>;
  onUnbanHost: (userId: string) => Promise<void>;
  isMutating?: boolean;
}

export const AdminHostInspectorModal: React.FC<AdminHostInspectorModalProps> = ({
  item,
  health360,
  isOpen,
  onClose,
  onValidateVehicle,
  onSuspendVehicle,
  onFeatureVehicle,
  onDeletePhoto,
  onSetMainPhoto,
  onExecuteFleetAction,
  onBanHost,
  onUnbanHost,
  isMutating,
}) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'kyc' | 'governance'>('fleet');
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [docPreviewTitle, setDocPreviewTitle] = useState<string>('');
  const [activePhotoIndexes, setActivePhotoIndexes] = useState<Record<string, number>>({});

  if (!isOpen || !item) return null;

  const host = health360?.host || {
    id: item.id,
    userId: item.userId,
    prenom: item.utilisateur?.prenom || '',
    nom: item.utilisateur?.nom || '',
    fullName: item.utilisateur?.fullName || item.email,
    email: item.email,
    phone: item.phone,
    avatarUrl: item.utilisateur?.avatarUrl ?? null,
    role: item.role,
    statutKyc: item.statutKyc,
    kycRejectionReason: item.kycRejectionReason,
    isBanned: item.isBanned,
    registeredAt: item.createdAt,
    documents: {
      documentUrl: null,
      documentBackUrl: null,
      selfieUrl: null,
      permisUrl: null,
    },
  };

  const matrix = health360?.healthMatrix || {
    riskScore: 15,
    riskLevel: 'LOW' as const,
    riskWarnings: [],
    noteProprietaire: item.utilisateur?.noteProprietaire ?? 5.0,
    hostCancelRate: 0,
    totalBookings: item.totalBookings,
    completedBookings: 0,
    ongoingBookings: 0,
    grossEarnings: 0,
    escrowBalance: 0,
  };

  const fleet = health360?.fleet || [];

  const handleNextPhoto = (vehicleId: string, max: number) => {
    setActivePhotoIndexes((prev) => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] ?? 0) + 1) % max,
    }));
  };

  const handlePrevPhoto = (vehicleId: string, max: number) => {
    setActivePhotoIndexes((prev) => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] ?? 0) - 1 + max) % max,
    }));
  };

  const handleSuspendClick = (vehicleId: string) => {
    const raison = window.prompt('Entrez le motif de suspension du véhicule :');
    if (raison && raison.trim()) {
      onSuspendVehicle(vehicleId, raison.trim());
    }
  };

  const handleFleetSuspendClick = () => {
    const raison = window.prompt('Entrez le motif de suspension globale de la flotte :');
    if (raison && raison.trim()) {
      onExecuteFleetAction(host.id, 'SUSPEND_ALL', raison.trim());
    }
  };

  const handleBanHostClick = () => {
    const raison = window.prompt('Entrez le motif de bannissement de l\'hôte :');
    if (raison && raison.trim()) {
      onBanHost(host.id, raison.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-950 h-full overflow-y-auto flex flex-col shadow-2xl border-l border-slate-200/80 dark:border-slate-800">
        {/* Modal Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-base flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {host.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={host.avatarUrl} alt={host.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{(host.prenom?.[0] || 'H').toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {host.fullName}
                </h2>
                {host.isBanned && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10.5px] font-bold">
                    Compte Banni
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {host.email} • {host.phone || 'Pas de téléphone'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Health Matrix & Risk Gauge Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Risk Score */}
            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Score de Risque
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xl font-extrabold ${
                    matrix.riskScore > 60
                      ? 'text-rose-600'
                      : matrix.riskScore > 30
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {matrix.riskScore} / 100
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    matrix.riskScore > 60
                      ? 'bg-rose-100 text-rose-800'
                      : matrix.riskScore > 30
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {matrix.riskLevel}
                </span>
              </div>
              {matrix.riskWarnings.length > 0 && (
                <p className="text-[11px] text-rose-600 font-medium truncate">
                  ⚠️ {matrix.riskWarnings[0]}
                </p>
              )}
            </div>

            {/* Financial Escrow & Earnings */}
            <div className="pt-3 md:pt-0 md:pl-4 flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gains & Séquestre
              </span>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(matrix.grossEarnings)}
              </p>
              <p className="text-[11px] text-slate-500">
                Séquestre actif : <strong className="text-emerald-600">{formatCurrency(matrix.escrowBalance)}</strong>
              </p>
            </div>

            {/* Performance & Cancellation Rate */}
            <div className="pt-3 md:pt-0 md:pl-4 flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Taux d'Annulation Hôte
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${matrix.hostCancelRate > 15 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {matrix.hostCancelRate}%
                </span>
                {matrix.hostCancelRate > 15 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    Élevé
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {matrix.completedBookings} terminées • {matrix.ongoingBookings} en cours
              </p>
            </div>

            {/* Rating & Note */}
            <div className="pt-3 md:pt-0 md:pl-4 flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Note Propriétaire
              </span>
              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{matrix.noteProprietaire.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Total réservations : {matrix.totalBookings}
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('fleet')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'fleet'
                  ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              🚗 Audit Flotte & Galerie Photos ({fleet.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'kyc'
                  ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              🪪 Pièces KYC & Identité
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'governance'
                  ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              ⚡ Gouvernance Flotte & Compte
            </button>
          </div>

          {/* TAB 1: FLEET & VEHICLE AUDIT */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              {fleet.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-500 text-xs">
                  Aucun véhicule enregistré pour cet hôte.
                </div>
              ) : (
                fleet.map((v) => {
                  const photos = v.photos || [];
                  const photoIdx = activePhotoIndexes[v.id] ?? 0;
                  const currentPhoto = photos[photoIdx];

                  return (
                    <div
                      key={v.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
                    >
                      {/* Vehicle Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {v.marque} {v.modele} ({v.annee})
                            </h3>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {v.immatriculation}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                v.statut === 'VERIFIE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : v.statut === 'EN_ATTENTE_VALIDATION'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {v.statut}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {v.type} • {v.ville} • {v.totalLocations} location(s)
                          </p>
                        </div>

                        {/* Benchmark Price Badge */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {formatCurrency(v.prixParJour)} / jour
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Moyenne {v.type} : {formatCurrency(v.benchmarkPriceAvg)}
                            </p>
                          </div>
                          {v.priceDevPct !== 0 && (
                            <span
                              className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                                v.priceDevPct < -30
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : v.priceDevPct > 40
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {v.priceDevPct < 0 ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : (
                                <TrendingUp className="w-3.5 h-3.5" />
                              )}
                              <span>{v.priceDevPct > 0 ? `+${v.priceDevPct}%` : `${v.priceDevPct}%`}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Photo Carousel & Audit Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* HD Photo Viewer */}
                        <div className="md:col-span-1 relative h-48 rounded-xl overflow-hidden bg-slate-900 group">
                          {currentPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={currentPhoto.url}
                              alt={v.marque}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                              <ImageIcon className="w-6 h-6" />
                              <span>Aucune photo</span>
                            </div>
                          )}

                          {/* Cover photo badge */}
                          {currentPhoto?.estPrincipale && (
                            <span className="absolute top-2 left-2 bg-[#0A3D2E] text-[#F1DFB6] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Photo de Couverture
                            </span>
                          )}

                          {/* Navigation buttons */}
                          {photos.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePrevPhoto(v.id, photos.length)}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleNextPhoto(v.id, photos.length)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {photoIdx + 1} / {photos.length}
                              </span>
                            </>
                          )}

                          {/* Photo Moderation Bar */}
                          {currentPhoto && (
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                              {!currentPhoto.estPrincipale && (
                                <button
                                  type="button"
                                  onClick={() => onSetMainPhoto(v.id, currentPhoto.id)}
                                  className="text-[10px] font-bold text-[#F1DFB6] hover:underline cursor-pointer"
                                >
                                  Définir comme principale
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onDeletePhoto(v.id, currentPhoto.id)}
                                className="text-[10px] font-bold text-rose-300 hover:text-rose-100 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Supprimer photo</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Documents & Specs Audit */}
                        <div className="md:col-span-2 space-y-3">
                          {v.priceWarning && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>{v.priceWarning}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex items-center justify-between">
                              <span className="text-slate-500">Carte Grise :</span>
                              {v.hasCarteGrise ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocPreviewUrl(v.carteGriseUrl);
                                    setDocPreviewTitle(`Carte Grise — ${v.marque} ${v.modele}`);
                                  }}
                                  className="text-[#0A3D2E] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Voir Carte Grise</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-rose-600 font-bold">Non fournie</span>
                              )}
                            </div>

                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 flex items-center justify-between">
                              <span className="text-slate-500">Assurance :</span>
                              {v.hasAssuranceDoc ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocPreviewUrl(v.assuranceDocUrl);
                                    setDocPreviewTitle(`Attestation Assurance — ${v.marque} ${v.modele}`);
                                  }}
                                  className="text-[#0A3D2E] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Voir Assurance</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-rose-600 font-bold">Non fournie</span>
                              )}
                            </div>
                          </div>

                          {/* Direct Admin Action Buttons per Vehicle */}
                          <div className="flex items-center gap-2 pt-2">
                            {v.statut !== 'VERIFIE' && (
                              <button
                                type="button"
                                onClick={() => onValidateVehicle(v.id)}
                                disabled={isMutating}
                                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Valider véhicule</span>
                              </button>
                            )}

                            {v.statut !== 'SUSPENDU' && (
                              <button
                                type="button"
                                onClick={() => handleSuspendClick(v.id)}
                                disabled={isMutating}
                                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Suspendre</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onFeatureVehicle(v.id, true)}
                              disabled={isMutating}
                              className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Mettre en avant</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: KYC DOCUMENTS */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Document d'identité (Recto)
                  </span>
                  {host.documents.documentUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={host.documents.documentUrl}
                      alt="KYC ID"
                      className="w-full h-48 object-cover rounded-xl border border-slate-100"
                    />
                  ) : (
                    <div className="h-48 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      Non transmis
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Permis de conduire
                  </span>
                  {host.documents.permisUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={host.documents.permisUrl}
                      alt="Permis"
                      className="w-full h-48 object-cover rounded-xl border border-slate-100"
                    />
                  ) : (
                    <div className="h-48 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      Non transmis
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE & BULK ACTIONS */}
          {activeTab === 'governance' && (
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Actions de Gouvernance Globale Hôte & Flotte
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appliquez des décisions administratives immédiates sur l'ensemble du profil et des biens de cet hôte.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleFleetSuspendClick}
                  disabled={isMutating}
                  className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 font-bold text-xs text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2 text-rose-700">
                    <Ban className="w-4 h-4" />
                    <span className="text-sm">Suspendre toute la flotte</span>
                  </div>
                  <p className="text-[11.5px] text-rose-600 font-normal">
                    Passe l'ensemble des véhicules de cet hôte en statut SUSPENDU.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onExecuteFleetAction(host.id, 'ACTIVATE_ALL')}
                  disabled={isMutating}
                  className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-bold text-xs text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Réactiver toute la flotte</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-600 font-normal">
                    Réactive l'ensemble des véhicules de l'hôte en statut VÉRIFIÉ.
                  </p>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Compte Utilisateur
                  </h4>
                  <p className="text-xs text-slate-500">
                    Statut actuel : {host.isBanned ? 'Banni / Bloqué' : 'Compte Actif'}
                  </p>
                </div>

                {host.isBanned ? (
                  <button
                    type="button"
                    onClick={() => onUnbanHost(host.id)}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Débannir l'hôte
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBanHostClick}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Bannir l'hôte
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document HD Fullscreen Preview Lightbox */}
      {docPreviewUrl && (
        <div className="fixed inset-0 z-60 bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl flex items-center justify-between text-white pb-3">
            <h3 className="text-sm font-bold">{docPreviewTitle}</h3>
            <button
              type="button"
              onClick={() => setDocPreviewUrl(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/20 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={docPreviewUrl} alt="Preview" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
