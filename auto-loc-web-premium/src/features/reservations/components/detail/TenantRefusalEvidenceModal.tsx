'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  X,
  Upload,
  ImagePlus,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileImage,
} from 'lucide-react';
import { fetchApi } from '@/lib/config';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantRefusalEvidenceModalProps {
  booking: TenantReservationDetailData;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => Promise<boolean>;
}

const REASONS = [
  { id: 'NON_CONFORMITE', label: 'Non-conforme au modèle' },
  { id: 'DEGATS', label: 'Dégâts / Rayures non signalés' },
  { id: 'ACCES_IMPOSSIBLE', label: 'Véhicule ou hôte inaccessible' },
  { id: 'AUTRE', label: 'Autre motif' },
];

export const TenantRefusalEvidenceModal: React.FC<TenantRefusalEvidenceModalProps> = ({
  booking,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [motif, setMotif] = useState('NON_CONFORMITE');
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 15) {
      setErrorMessage('La description du problème doit faire au moins 15 caractères.');
      return;
    }

    try {
      setUploading(true);

      // Si une photo de preuve est sélectionnée, la téléverser d'abord vers le backend
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        await fetchApi(`/reservations/${booking.id}/photos-etat?type=CHECKIN&categorie=AUTRE`, {
          method: 'POST',
          body: formData,
        });
      }

      // Transmettre le refus et l'ouverture du litige
      const success = await onSubmit(motif, trimmedComment);
      if (success) {
        setComment('');
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      }
    } catch (err: any) {
      console.error('Erreur téléversement preuve refus:', err);
      setErrorMessage(err?.message || 'Impossible de transmettre la preuve. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = comment.trim().length >= 15 && !isSubmitting && !uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || uploading}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>Signalement & Refus</span>
            </div>
            <h3 className="text-lg font-bold text-[#041912]">Véhicule non conforme</h3>
            <p className="text-xs text-slate-500 font-mono font-medium">
              RÉF. #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Alert Banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Ce signalement refuse la prise en charge et ouvre immédiatement un dossier de litige traité en priorité par notre service d'arbitrage AutoLoc.
            </p>
          </div>

          {/* Erreur globale */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* 1. Selecteur de motif */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Motif principal du refus *
            </label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((item) => {
                const active = motif === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMotif(item.id)}
                    className={`px-3.5 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Description détaillée */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Description détaillée du problème *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">{comment.length}/500</span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Décrivez précisément le problème constaté (kilométrage, voyant, rayure non signalée, panne...)"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400"
            />
            {comment.trim().length > 0 && comment.trim().length < 15 && (
              <p className="text-[11px] font-bold text-rose-600">• 15 caractères minimum requis</p>
            )}
          </div>

          {/* 3. Photo de preuve facultative / recommandée */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Photo de preuve (Recommandée)
            </label>

            <label className="flex items-center gap-3.5 p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 transition-colors cursor-pointer group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {previewUrl ? (
                <img src={previewUrl} alt="Preuve non-conformité" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#0A3D2E] flex items-center justify-center shrink-0">
                  <ImagePlus className="w-5 h-5 text-[#0A3D2E]" />
                </div>
              )}

              <div className="flex-1">
                <h5 className="text-xs font-bold text-[#065F46] group-hover:text-[#041912]">
                  {selectedFile ? selectedFile.name : 'Ajouter une photo du problème'}
                </h5>
                <p className="text-[11px] text-[#047857] mt-0.5">
                  {selectedFile ? 'Cliquez pour remplacer la photo' : 'Photo claire requise pour faciliter le traitement du litige'}
                </p>
              </div>

              {selectedFile && <CheckCircle2 className="w-5 h-5 text-[#0A3D2E] shrink-0" />}
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting || uploading}
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 shadow-md"
            >
              {isSubmitting || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Transmettre le refus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
