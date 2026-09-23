'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Phone,
  MessageSquare,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  ZoomIn,
  Trash2,
} from 'lucide-react';
import type { AdminVehicleQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminVehicleInspectorModalProps {
  vehicle: AdminVehicleQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (vehicleId: string) => Promise<void>;
  onSuspend: (vehicleId: string, raison: string) => Promise<void>;
  onFeature?: (vehicleId: string, active: boolean) => Promise<void>;
  onDeletePhoto?: (vehicleId: string, photoId: string) => Promise<void>;
  onSetMainPhoto?: (vehicleId: string, photoId: string) => Promise<void>;
  isMutating?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';
const CHAMPAGNE = '#F1DFB6';

const PRESET_REJECTION_REASONS = [
  "📄 Carte grise illisible, incomplète ou expirée",
  "🛡️ Attestation d'assurance manquante ou nom non-conforme",
  "📸 Photos floues, sombres, coupées ou avec filigrane",
  "🏷️ Prix par jour incohérent par rapport aux standards du marché",
  "🚘 Incohérence immatriculation / marque / modèle du véhicule",
  "❌ Véhicule ne répondant pas aux exigences de sécurité AutoLoc",
];

export const AdminVehicleInspectorModal: React.FC<AdminVehicleInspectorModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onValidate,
  onSuspend,
  onFeature,
  onDeletePhoto,
  onSetMainPhoto,
  isMutating,
}) => {
  const [activeTab, setActiveTab] = useState<'PHOTOS' | 'DOCUMENTS' | 'SPECS'>('PHOTOS');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [docRotation, setDocRotation] = useState<number>(0);
  const [activeDocType, setActiveDocType] = useState<'CARTE_GRISE' | 'ASSURANCE'>('CARTE_GRISE');

  // Lightbox (fullscreen, in-app — never opens an external link)
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // 5-Point Verification Checklist
  const [checkedPlaque, setCheckedPlaque] = useState<boolean>(false);
  const [checkedCarteGrise, setCheckedCarteGrise] = useState<boolean>(false);
  const [checkedAssurance, setCheckedAssurance] = useState<boolean>(false);
  const [checkedPhotos, setCheckedPhotos] = useState<boolean>(false);
  const [checkedTarif, setCheckedTarif] = useState<boolean>(false);

  // Rejection Workflow
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>('');
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');

  useEffect(() => {
    if (vehicle) {
      setSelectedPhotoIndex(0);
      setDocRotation(0);
      setShowRejectForm(false);
      setSelectedPresetReason('');
      setCustomRejectionReason('');
      setCheckedPlaque(false);
      setCheckedCarteGrise(false);
      setCheckedAssurance(false);
      setCheckedPhotos(false);
      setCheckedTarif(false);
      setLightboxOpen(false);
    }
  }, [vehicle]);

  const photos = vehicle?.photos || [];

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const showPrevLightbox = useCallback(
    () => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1)),
    [photos.length]
  );
  const showNextLightbox = useCallback(
    () => setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0)),
    [photos.length]
  );

  // Keyboard controls for the lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevLightbox();
      if (e.key === 'ArrowRight') showNextLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, showPrevLightbox, showNextLightbox]);

  if (!isOpen || !vehicle) return null;

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];
  const checklistDone = [checkedPlaque, checkedCarteGrise, checkedAssurance, checkedPhotos, checkedTarif].filter(Boolean).length;
  const allChecked = checklistDone === 5;

  const handleRotate = () => {
    setDocRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirmSuspend = async () => {
    const finalReason = customRejectionReason.trim() || selectedPresetReason || "Conformité du véhicule non validée";
    await onSuspend(vehicle.id, finalReason);
  };

  const handleConfirmValidate = async () => {
    await onValidate(vehicle.id);
  };

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const cleanPhone = vehicle.proprietaire?.telephone?.replace(/\s+/g, '') || '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_24px_70px_-20px_rgba(10,61,46,0.35)] overflow-hidden"
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
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-normal text-white truncate">
                  {vehicle.marque} {vehicle.modele} ({vehicle.annee})
                </h2>
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border"
                  style={{ background: 'rgba(241,223,182,0.12)', borderColor: 'rgba(241,223,182,0.3)', color: CHAMPAGNE }}
                >
                  {vehicle.immatriculation || 'Plaque N/A'}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(241,223,182,0.65)' }}>
                Soumis le {new Date(vehicle.creeLe).toLocaleDateString('fr-FR')} • {vehicle.ville} • {vehicle.slaWaitHours}h d'attente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onFeature && (
              <button
                onClick={() => onFeature(vehicle.id, !vehicle.isFeatured)}
                disabled={isMutating}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${vehicle.isFeatured
                    ? 'bg-amber-400/20 text-amber-200 border-amber-300/40'
                    : 'bg-white/5 text-white/80 border-white/15 hover:border-amber-300/50 hover:bg-white/10'
                  }`}
              >
                <Star className={`w-3.5 h-3.5 ${vehicle.isFeatured ? 'fill-amber-300 text-amber-300' : ''}`} />
                <span>{vehicle.isFeatured ? 'En vedette' : 'Mettre en vedette'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40 dark:bg-slate-950/40">
          {/* Left Column: Visual Inspector (Photos & Documents) - 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('PHOTOS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'PHOTOS'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                style={activeTab === 'PHOTOS' ? { color: FOREST } : undefined}
              >
                <span>Galerie Photos ({photos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('DOCUMENTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'DOCUMENTS'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                style={activeTab === 'DOCUMENTS' ? { color: FOREST } : undefined}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Carte Grise & Assurance</span>
              </button>

              <button
                onClick={() => setActiveTab('SPECS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'SPECS'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                style={activeTab === 'SPECS' ? { color: FOREST } : undefined}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Fiche & Équipements</span>
              </button>
            </div>

            {/* TAB 1: PHOTO GALLERY */}
            {activeTab === 'PHOTOS' && (
              <div className="space-y-3">
                <div
                  className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center group cursor-zoom-in"
                  onClick={() => currentPhoto && openLightboxAt(selectedPhotoIndex)}
                >
                  {currentPhoto ? (
                    <Image
                      src={currentPhoto.url}
                      alt={`Photo ${selectedPhotoIndex + 1}`}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      unoptimized
                    />
                  ) : (
                    <div className="text-slate-400 text-xs text-center p-6">
                      <Car className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <span>Aucune photo disponible pour ce véhicule</span>
                    </div>
                  )}

                  {/* Overlay Badges */}
                  {currentPhoto && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                        Photo {selectedPhotoIndex + 1} / {photos.length}
                      </span>
                      {currentPhoto.estPrincipale && (
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white backdrop-blur-sm"
                          style={{ background: FOREST }}
                        >
                          ★ Photo Principale
                        </span>
                      )}
                    </div>
                  )}

                  {currentPhoto && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightboxAt(selectedPhotoIndex);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm"
                      title="Voir en plein écran"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Center zoom hint */}
                  {currentPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Prev/Next Controls */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Photo Moderation Admin Action Bar */}
                {currentPhoto && (onDeletePhoto || onSetMainPhoto) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2">
                      {onSetMainPhoto && !currentPhoto.estPrincipale && (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => onSetMainPhoto(vehicle.id, currentPhoto.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0A3D2E] text-[#F1DFB6] hover:brightness-125 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Définir comme photo principale</span>
                        </button>
                      )}
                      {currentPhoto.estPrincipale && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo de couverture principale</span>
                        </span>
                      )}
                    </div>

                    {onDeletePhoto && (
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cette photo non conforme ?')) {
                            onDeletePhoto(vehicle.id, currentPhoto.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Supprimer photo non conforme</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto p-1 scrollbar-none">
                    {photos.map((p, idx) => (
                      <button
                        key={p.id || idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        onDoubleClick={() => openLightboxAt(idx)}
                        className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${selectedPhotoIndex === idx
                            ? 'scale-105 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        style={selectedPhotoIndex === idx ? { borderColor: FOREST } : undefined}
                      >
                        <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: OFFICIAL DOCUMENTS (Carte Grise & Assurance) */}
            {activeTab === 'DOCUMENTS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDocType('CARTE_GRISE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeDocType === 'CARTE_GRISE'
                          ? 'bg-white dark:bg-slate-900 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                        }`}
                      style={activeDocType === 'CARTE_GRISE' ? { color: FOREST } : undefined}
                    >
                      Carte Grise {vehicle.carteGriseUrl ? '✅' : '❌'}
                    </button>
                    <button
                      onClick={() => setActiveDocType('ASSURANCE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeDocType === 'ASSURANCE'
                          ? 'bg-white dark:bg-slate-900 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                        }`}
                      style={activeDocType === 'ASSURANCE' ? { color: FOREST } : undefined}
                    >
                      Assurance {vehicle.assurance ? '✅' : '⚪'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRotate}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                      title="Pivoter de 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotation</span>
                    </button>
                  </div>
                </div>

                {activeDocType === 'CARTE_GRISE' ? (
                  vehicle.carteGriseUrl ? (
                    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
                      <div
                        className="relative w-full h-full transition-transform duration-300 flex items-center justify-center"
                        style={{ transform: `rotate(${docRotation}deg)` }}
                      >
                        <Image
                          src={vehicle.carteGriseUrl}
                          alt="Carte Grise"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <a
                        href={vehicle.carteGriseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm hover:bg-black transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ouvrir document original</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 space-y-2">
                      <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Aucune Carte Grise téléversée</p>
                      <p className="text-xs text-red-600/80 dark:text-red-400 max-w-sm mx-auto">
                        L'hôte n'a pas encore fourni la photo ou le scann de la Carte Grise officielle du véhicule.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" style={{ color: FOREST }} />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Attestation & Détails Assurance</h4>
                    </div>
                    {vehicle.assurance ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono">
                        {vehicle.assurance}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Aucune information complémentaire d'assurance renseignée.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMPLETE SPECS & EQUIPMENT */}
            {activeTab === 'SPECS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Transmission</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.transmission || 'Manuelle'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Carburant</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.carburant || 'Essence'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Places</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.nombrePlaces || 5} places</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Min. Jours</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.joursMinimum} jour(s)</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Min. Âge</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.ageMinimum} ans</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Zone Conduite</span>
                    <p className="text-xs font-medium text-slate-900 dark:text-white mt-0.5">{vehicle.zoneConduite || 'Tout Sénégal'}</p>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Options de livraison</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-full border ${vehicle.proposeLivraisonDakar ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      Dakar ({vehicle.fraisLivraisonDakar ? `${vehicle.fraisLivraisonDakar.toLocaleString()} FCFA` : 'Gratuit'})
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border ${vehicle.proposeLivraisonAibd ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      Aéroport AIBD ({vehicle.fraisLivraisonAibd ? `${vehicle.fraisLivraisonAibd.toLocaleString()} FCFA` : 'Non disponible'})
                    </span>
                  </div>
                </div>

                {/* Equipment Tags */}
                {vehicle.equipements && vehicle.equipements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Équipements inclus ({vehicle.equipements.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {vehicle.equipements.map((eq, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ✓ {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Host Card, Checklist & Moderation Action Dock - 5 cols */}
          <div className="lg:col-span-5 space-y-5">
            {/* Host Contact Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Propriétaire (Hôte)</span>
                {vehicle.proprietaire?.statutKyc === 'VERIFIE' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓ KYC Vérifié
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    ⚠ KYC non validé
                  </span>
                )}
              </div>

              {vehicle.proprietaire ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
                  >
                    {vehicle.proprietaire.prenom?.[0] || 'H'}{vehicle.proprietaire.nom?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {vehicle.proprietaire.prenom} {vehicle.proprietaire.nom}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{vehicle.proprietaire.email || 'Pas d\'email'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Information hôte indisponible</p>
              )}

              {/* Direct Actions */}
              {cleanPhone && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Appeler</span>
                  </a>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* 5-Point Senior Verification Checklist */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Checklist de Modération
                </h4>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums"
                  style={{
                    color: allChecked ? '#0a7d4f' : GOLD,
                    background: allChecked ? 'rgba(16,185,129,0.12)' : 'rgba(178,124,45,0.12)',
                  }}
                >
                  {checklistDone}/5
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedPlaque}
                    onChange={(e) => setCheckedPlaque(e.target.checked)}
                    className="mt-0.5 rounded accent-[#0A3D2E] focus:ring-[#0A3D2E]"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Plaque d'immatriculation nette & valide ({vehicle.immatriculation || 'Plaque N/A'})</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedCarteGrise}
                    onChange={(e) => setCheckedCarteGrise(e.target.checked)}
                    className="mt-0.5 rounded accent-[#0A3D2E] focus:ring-[#0A3D2E]"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Carte Grise officielle vérifiée et lisible</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedAssurance}
                    onChange={(e) => setCheckedAssurance(e.target.checked)}
                    className="mt-0.5 rounded accent-[#0A3D2E] focus:ring-[#0A3D2E]"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Attestation d'assurance en règle</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedPhotos}
                    onChange={(e) => setCheckedPhotos(e.target.checked)}
                    className="mt-0.5 rounded accent-[#0A3D2E] focus:ring-[#0A3D2E]"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Photos HD de qualité (sans filigrane / pub / numéro)</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedTarif}
                    onChange={(e) => setCheckedTarif(e.target.checked)}
                    className="mt-0.5 rounded accent-[#0A3D2E] focus:ring-[#0A3D2E]"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    Cohérence du tarif journalier ({vehicle.prixParJour?.toLocaleString('fr-FR')} FCFA/j • {vehicle.type || 'Standard'})
                  </span>
                </label>
              </div>
            </div>

            {/* Rejection Preset Picker Form */}
            {showRejectForm ? (
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-red-900 dark:text-red-300">Sélectionner le motif de suspension</h4>
                  <button onClick={() => setShowRejectForm(false)} className="text-red-400 hover:text-red-700 text-xs">Annuler</button>
                </div>

                <div className="space-y-1.5">
                  {PRESET_REJECTION_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPresetReason(reason)}
                      className={`w-full text-left p-2 rounded-xl text-xs font-medium transition-all border ${selectedPresetReason === reason
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
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    placeholder="Note ou raison personnalisée (optionnel)..."
                    className="w-full p-2.5 text-xs rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-300"
                    rows={2}
                  />
                </div>

                <button
                  onClick={handleConfirmSuspend}
                  disabled={isMutating}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirmer la suspension du véhicule</span>
                </button>
              </div>
            ) : (
              /* Main Action Dock */
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleConfirmValidate}
                  disabled={isMutating}
                  className="w-full py-3.5 px-4 rounded-2xl font-normal text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 border"
                  style={{
                    background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})`,
                    borderColor: 'rgba(241,223,182,0.25)',
                  }}
                >
                  {isMutating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" style={{ color: CHAMPAGNE }} />
                  )}
                  <span>Valider & Publier le Véhicule</span>
                </button>
                {!allChecked && (
                  <p className="text-[10px] text-slate-400 text-center">
                    {checklistDone}/4 points de contrôle cochés — pensez à vérifier chaque point avant validation
                  </p>
                )}

                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isMutating}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Suspendre ou Rejeter (avec motif)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX — in-app only, never navigates to an external URL */}
      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center animate-in fade-in duration-150"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm z-10">
            {lightboxIndex + 1} / {photos.length}
          </span>

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevLightbox();
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNextLightbox();
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-[92vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex]?.url}
              alt={`Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain select-none"
              unoptimized
              priority
            />
          </div>

          {/* Thumbnail strip inside lightbox */}
          {photos.length > 1 && (
            <div
              className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-2 rounded-2xl bg-white/5 backdrop-blur-sm max-w-[90vw] overflow-x-auto scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${lightboxIndex === idx ? 'opacity-100' : 'border-transparent opacity-45 hover:opacity-80'
                    }`}
                  style={lightboxIndex === idx ? { borderColor: CHAMPAGNE } : undefined}
                >
                  <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};