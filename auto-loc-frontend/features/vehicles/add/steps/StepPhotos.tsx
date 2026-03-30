"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, X, Star, ImagePlus, Images,
  Loader2, AlertCircle, RotateCcw, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";
import { fetchUploadSignature, uploadToCloudinary, type CloudinarySignature } from "@/lib/nestjs/vehicles";

const MAX_PHOTOS = 8;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPhotos({ onNext, onBack }: Props) {
  const { photos, addPhotos, updatePhoto, removePhoto, movePhotoToFirst, movePhoto } = useAddVehicleStore();
  const galleryRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<CloudinarySignature | null>(null);
  const [sigError, setSigError] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Pre-fetch a Cloudinary signature when the step mounts
  const loadSignature = useCallback(async () => {
    setSigError(false);
    try {
      sigRef.current = await fetchUploadSignature();
    } catch {
      setSigError(true);
    }
  }, []);

  useEffect(() => { loadSignature(); }, [loadSignature]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    // Ensure we have a fresh signature (re-fetch if missing)
    if (!sigRef.current) {
      try { sigRef.current = await fetchUploadSignature(); }
      catch { setSigError(true); return; }
    }

    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, remaining);
    const ids = addPhotos(toUpload);
    const sig = sigRef.current;

    // Upload all in parallel
    await Promise.all(
      toUpload.map(async (file, i) => {
        const id = ids[i];
        try {
          const result = await uploadToCloudinary(file, sig);
          updatePhoto(id, { url: result.url, publicId: result.publicId, status: 'done' });
        } catch {
          updatePhoto(id, { status: 'error' });
        }
      }),
    );

    // Signature is consumed — pre-fetch a new one for the next batch
    sigRef.current = null;
    fetchUploadSignature().then((s) => { sigRef.current = s; }).catch(() => {});
  }, [photos.length, addPhotos, updatePhoto]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    uploadFiles(images);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Drag & drop pour réorganiser
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      movePhoto(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isUploading = photos.some((p) => p.status === 'uploading');
  const hasError = photos.some((p) => p.status === 'error');
  const allDone = photos.length > 0 && !isUploading && !hasError;

  return (
    <div className="space-y-7">

      {/* Signature error banner */}
      {sigError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2} />
          <p className="text-[12.5px] font-medium text-red-700 flex-1">
            Impossible de contacter le serveur d&apos;upload.
          </p>
          <button
            type="button"
            onClick={loadSignature}
            className="flex items-center gap-1 text-[11.5px] font-bold text-red-700 hover:text-red-900"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
            Réessayer
          </button>
        </div>
      )}

      {/* ━━━ Section Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <span className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
            <Images className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-900 tracking-tight">Photos du véhicule</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Jusqu&apos;à {MAX_PHOTOS} photos · la première sera l&apos;image principale
            </p>
          </div>
          {photos.length > 0 && (
            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {photos.length}/{MAX_PHOTOS}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Photo tiles */}
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                draggable={photo.status === 'done'}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[4/3]",
                  i === 0
                    ? "border-emerald-400 shadow-md shadow-emerald-500/15"
                    : photo.status === 'error'
                    ? "border-red-300"
                    : "border-transparent hover:border-slate-300",
                  draggedIndex === i && "opacity-50 scale-95",
                  dragOverIndex === i && "border-emerald-400 scale-105"
                )}
              >
                {/* Preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(photo.file)}
                  alt={`Photo ${i + 1}`}
                  className={cn("w-full h-full object-cover", photo.status !== 'done' && "opacity-50")}
                />

                {/* Uploading overlay */}
                {photo.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="w-6 h-6 text-white animate-spin" strokeWidth={2} />
                  </div>
                )}

                {/* Error overlay */}
                {photo.status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-red-900/60">
                    <AlertCircle className="w-5 h-5 text-white" strokeWidth={2} />
                    <span className="text-[9px] font-bold text-white">Échec</span>
                    <button
                      type="button"
                      onClick={async () => {
                        updatePhoto(photo.id, { status: 'uploading' });
                        if (!sigRef.current) {
                          try { sigRef.current = await fetchUploadSignature(); }
                          catch { updatePhoto(photo.id, { status: 'error' }); return; }
                        }
                        try {
                          const result = await uploadToCloudinary(photo.file, sigRef.current);
                          updatePhoto(photo.id, { url: result.url, publicId: result.publicId, status: 'done' });
                        } catch {
                          updatePhoto(photo.id, { status: 'error' });
                        }
                      }}
                      className="text-[9px] font-bold text-white underline"
                    >
                      Réessayer
                    </button>
                  </div>
                )}

                {/* Drag handle */}
                {photo.status === 'done' && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[9px] font-medium text-white">
                      <GripVertical className="h-3 w-3" strokeWidth={2} />
                      Glisser
                    </div>
                  </div>
                )}

                {/* Main badge (done only) */}
                {i === 0 && photo.status === 'done' && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[9px] font-black text-white shadow-sm uppercase tracking-wider">
                    <Star className="h-2.5 w-2.5 fill-white" strokeWidth={0} />
                    Principale
                  </div>
                )}

                {/* Actions - toujours visibles */}
                {photo.status === 'done' && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px] opacity-0 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => movePhotoToFirst(i)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:bg-white hover:scale-105 transition-all shadow-md"
                        title="Définir comme principale"
                      >
                        <Star className="h-4 w-4" strokeWidth={2} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-red-500 hover:bg-white hover:scale-105 transition-all shadow-md"
                      title="Supprimer"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}

                {/* Actions mobile - boutons permanents */}
                {photo.status === 'done' && (
                  <div className="sm:hidden absolute bottom-2 right-2 flex gap-1.5">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => movePhotoToFirst(i)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg"
                        title="Définir comme principale"
                      >
                        <Star className="h-3 w-3 fill-white" strokeWidth={0} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg"
                      title="Supprimer"
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Upload slot */}
            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 aspect-[4/3] text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                  >
                    <ImagePlus className="h-3 w-3" strokeWidth={2.5} />
                    Ajouter des photos
                  </button>
                </div>
                <span className="text-[10px] font-medium text-slate-400">ou glisser-déposer</span>
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              </div>
            )}
          </div>

          {photos.length > 0 && !isUploading && !hasError && (
            <p className="text-[11px] font-medium text-slate-400 mt-3 text-center">
              Survolez une photo pour la définir comme principale ou la supprimer. 
              Glissez-déposez les photos pour réorganiser.
            </p>
          )}
          {isUploading && (
            <p className="text-[11px] font-medium text-emerald-500 mt-3 text-center flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Upload en cours…
            </p>
          )}
          {hasError && !isUploading && (
            <p className="text-[11px] font-medium text-red-500 mt-3 text-center">
              Certaines photos ont échoué. Réessayez sur chaque photo en erreur.
            </p>
          )}
        </div>
      </div>

      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allDone}
          className={cn(
            "group flex items-center gap-2.5 text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all duration-200",
            allDone
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed",
          )}
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Upload en cours…</>
          ) : (
            <>
              Suivant — Documents
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
