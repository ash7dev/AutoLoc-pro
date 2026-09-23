'use client';

import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Camera,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Loader2,
  Eye,
  Trash2,
} from 'lucide-react';
import { OwnerReservationItem, reservationsApi } from '@/src/core/api/reservationsApi';
import { vehicleService } from '@/src/features/vehicles/services/vehicleService';

interface OwnerCheckinModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (soldeRecu: boolean) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export const OwnerCheckinModal: React.FC<OwnerCheckinModalProps> = ({
  reservation,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
  onRefetch,
}) => {
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [soldeConfirmed, setSoldeConfirmed] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showZeroPhotoWarning, setShowZeroPhotoWarning] = useState(false);

  if (!isOpen || !reservation) return null;

  const isAcompte = reservation.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
  const balanceToCollect = Number(reservation.montantSoldeCheckin || 0);

  const checkinPhotos = (reservation.photosEtatLieu || []).filter(
    (p) => p.type === 'CHECKIN'
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(10);

    try {
      const fileList = Array.from(files);
      const total = fileList.length;

      for (let i = 0; i < total; i++) {
        const file = fileList[i];
        setUploadProgress(Math.round(((i + 1) / total) * 90));

        // 1. Upload file via vehicleService
        const uploaded = await vehicleService.uploadVehicleMedia(file, false);

        // 2. Link photo to reservation
        await reservationsApi.linkPhotoEtatLieu(reservation.id, {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: 'CHECKIN',
        });
      }

      setUploadProgress(100);
      await onRefetch();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du téléversement de la photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!checkedTerms) return;

    // Avertissement si 0 photo chargée
    if (checkinPhotos.length === 0 && !showZeroPhotoWarning) {
      setShowZeroPhotoWarning(true);
      return;
    }

    await onConfirm(soldeConfirmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041912]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header Sombre Luxe */}
        <div className="bg-[#041912] px-6 py-5 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[10px] font-bold text-emerald-300 tracking-wider uppercase mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Espace Propriétaire · Check-in Sécurisé</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Remise des Clés & Départ du Véhicule
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || uploading}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du Modal Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Box Encaissement Solde (si Acompte) */}
          {isAcompte && balanceToCollect > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">
                    Solde à encaisser en main propre au Check-in
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Le locataire vous doit le solde restant de la réservation lors de la prise du véhicule.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-amber-900 font-mono">
                    {balanceToCollect.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-amber-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soldeConfirmed}
                  onChange={(e) => setSoldeConfirmed(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span className="text-xs font-semibold text-amber-950">
                  J'atteste avoir perçu la totalité du solde de {balanceToCollect.toLocaleString('fr-FR')} FCFA en espèces ou Wave/OM.
                </span>
              </label>
            </div>
          )}

          {/* Section Photos de l'État des Lieux Départ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#041912] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Photos de l'état du véhicule (Départ)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Importez au moins 4 photos (Face avant, Arrière, Côtés, Compteur KM) pour vous protéger en cas de litige.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  checkinPhotos.length >= 4
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {checkinPhotos.length} / 4 Photos
              </span>
            </div>

            {/* Zone de Drag & Drop / Input File */}
            <div className="relative border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl p-5 text-center transition-all group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || isSubmitting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 group-hover:underline">
                    Cliquez ou glissez vos photos d'état des lieux ici
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Formats acceptés : JPG, PNG, WEBP (Max 10 Mo par photo)
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700">
                    Upload en cours ({uploadProgress}%)...
                  </span>
                </div>
              )}
            </div>

            {/* Galerie des Photos Téléversées */}
            {checkinPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {checkinPhotos.map((photo, index) => (
                  <div
                    key={photo.id || index}
                    className="relative group aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs"
                  >
                    <img
                      src={photo.url}
                      alt={`Checkin photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(photo.url)}
                      className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avertissement 0 Photo */}
          {showZeroPhotoWarning && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-shake">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Attention : Aucune photo d'état des lieux ajoutée !</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Sans photo de départ, AutoLoc ne pourra pas arbitrer en votre faveur en cas de litige ou de dommage au retour. Êtes-vous sûr de vouloir valider sans photo ?
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowZeroPhotoWarning(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Ajouter des photos
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(soldeConfirmed)}
                  className="px-3 py-1.5 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 cursor-pointer"
                >
                  Valider sans photo quand même
                </button>
              </div>
            </div>
          )}

          {/* Checkbox Attestation */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checkedTerms}
              onChange={(e) => setCheckedTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700 leading-relaxed">
              J'atteste avoir contrôlé le permis de conduire original du locataire, sa pièce d'identité originale et avoir réalisé l'état des lieux complet du véhicule en sa présence.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || uploading}
            className="px-5 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!checkedTerms || isSubmitting || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] text-xs font-bold hover:bg-[#0F4F3B] disabled:opacity-40 transition-all cursor-pointer shadow-md"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#F1DFB6]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>Valider le Check-in & Remise des Clés</span>
          </button>
        </div>
      </div>

      {/* Lightbox Aperçu Photo */}
      {previewUrl && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={previewUrl} alt="Aperçu" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
};
