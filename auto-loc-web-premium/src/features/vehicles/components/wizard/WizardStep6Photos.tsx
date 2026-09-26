'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, FileText, Plus, Trash2, Crown, CheckCircle2, Upload, Sparkles, ShieldCheck, Eye, X } from 'lucide-react';
import { Step6Data, PhotoItem, DocumentItem } from '../../stores/useVehicleDraftStore';

interface WizardStep6PhotosProps {
  data: Step6Data;
  onChange: (updated: Partial<Step6Data>) => void;
  isEditMode?: boolean;
}

export const WizardStep6Photos: React.FC<WizardStep6PhotosProps> = ({ data, onChange, isEditMode = false }) => {
  const [previewDoc, setPreviewDoc] = useState<{ title: string; doc: DocumentItem } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const carteGriseInputRef = useRef<HTMLInputElement>(null);
  const assuranceInputRef = useRef<HTMLInputElement>(null);

  const photos = data.photos || [];
  const carteGrise = data.carteGrise || null;
  const assuranceDoc = data.assuranceDoc || null;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newPhotos: PhotoItem[] = filesArray.map((f, idx) => ({
        id: `${Date.now()}-${idx}`,
        uri: URL.createObjectURL(f),
      }));
      onChange({ photos: [...photos, ...newPhotos] });
    }
  };

  const handleDocAdd = (e: React.ChangeEvent<HTMLInputElement>, target: 'carteGrise' | 'assuranceDoc') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith('image/');
      const docItem: DocumentItem = {
        uri: URL.createObjectURL(file),
        name: file.name,
        isImage: isImg,
      };
      if (target === 'carteGrise') onChange({ carteGrise: docItem });
      if (target === 'assuranceDoc') onChange({ assuranceDoc: docItem });
    }
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange({ photos: updated });
  };

  const handleRemovePhoto = (id: string) => {
    onChange({ photos: photos.filter((p) => p.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input type="file" ref={photoInputRef} accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
      <input type="file" ref={carteGriseInputRef} accept="image/*,application/pdf" className="hidden" onChange={(e) => handleDocAdd(e, 'carteGrise')} />
      <input type="file" ref={assuranceInputRef} accept="image/*,application/pdf" className="hidden" onChange={(e) => handleDocAdd(e, 'assuranceDoc')} />

      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="hidden sm:flex mx-auto h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-[#4ADE80]/30 text-emerald-400 shadow-md">
          <Camera className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Photos & Documents</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isEditMode
            ? 'Gérez vos visuels HD et choisissez la photo de couverture'
            : 'Ajoutez vos visuels HD et vos justificatifs administratifs'}
        </p>
      </div>

      {/* Galerie Photos */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-emerald-600" />
            <h3 className="font-fraunces text-sm font-semibold text-slate-900">Galerie du Véhicule *</h3>
          </div>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex items-center gap-1 rounded-xl bg-[#F0FDF4] border border-[#A7F3D0] px-3 py-1.5 text-xs font-bold text-[#047857] hover:bg-[#DCFCE7]"
          >
            <Plus className="h-4 w-4" />
            Ajouter photo(s)
          </button>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {photos.map((photo, index) => {
            const isCover = index === 0;
            return (
              <div key={photo.id} className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img src={photo.uri} alt="Véhicule" className="w-full h-full object-cover" />

                {/* Badge Cover */}
                {isCover ? (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-brand-dark px-2 py-1 text-[9px] font-bold text-emerald-400 border border-[#4ADE80]/40">
                    <Crown className="h-3 w-3 text-emerald-400" />
                    <span>COUVERTURE</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetAsCover(index)}
                    className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold text-[#047857] shadow hover:bg-white"
                  >
                    <Crown className="h-3 w-3" />
                    <span>Placer 1er</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-[#059669] hover:bg-[#F0FDF4] transition-all"
          >
            <Plus className="h-6 w-6 text-emerald-600" />
            <span className="text-xs font-semibold">Ajouter des photos</span>
          </button>
        </div>
      </div>

      {/* Documents Administratifs (Mode Création) */}
      {!isEditMode && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            <h3 className="font-fraunces text-sm font-semibold text-slate-900">Documents Administratifs *</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Carte Grise */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="font-fraunces text-xs font-semibold text-slate-900">Carte Grise</span>
                </div>
                {carteGrise ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Importé
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Requis</span>
                )}
              </div>

              {carteGrise ? (
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="truncate font-medium text-slate-700 max-w-[150px]">{carteGrise.name}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPreviewDoc({ title: 'Carte Grise', doc: carteGrise })} className="p-1 text-slate-600 hover:text-emerald-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onChange({ carteGrise: null })} className="p-1 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => carteGriseInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:border-[#059669]"
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Ajouter la Carte Grise</span>
                </button>
              )}
            </div>

            {/* Assurance */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="font-fraunces text-xs font-semibold text-slate-900">Attestation Assurance</span>
                </div>
                {assuranceDoc ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Importé
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Requis</span>
                )}
              </div>

              {assuranceDoc ? (
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="truncate font-medium text-slate-700 max-w-[150px]">{assuranceDoc.name}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPreviewDoc({ title: 'Attestation Assurance', doc: assuranceDoc })} className="p-1 text-slate-600 hover:text-emerald-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onChange({ assuranceDoc: null })} className="p-1 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => assuranceInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:border-[#059669]"
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Ajouter l'Assurance</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for Docs */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#062017] border border-[#059669]/40 p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-fraunces text-base font-semibold">{previewDoc.title}</h3>
              <button type="button" onClick={() => setPreviewDoc(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black/40 flex items-center justify-center">
              {previewDoc.doc.isImage ? (
                <img src={previewDoc.doc.uri} alt="Doc preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold">{previewDoc.doc.name}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
