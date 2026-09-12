"use client";

import { useRef, useState, useCallback } from "react";
import {
  ArrowLeft, ArrowRight, X, Star, ImagePlus, Images,
  Loader2, AlertCircle, RotateCcw, GripVertical, Sparkles, CheckCircle2, Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";
import { fetchUploadSignature, uploadToCloudinary, validateUploadFile } from "@/lib/nestjs/vehicles";

const MAX_PHOTOS = 8;
const MAX_CONCURRENT_UPLOADS = 2;
const MAX_UPLOAD_ATTEMPTS = 3;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPhotos({ onNext, onBack }: Props) {
  const { photos, addPhotos, updatePhoto, removePhoto, movePhotoToFirst, movePhoto } = useAddVehicleStore();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const uploadPhotoWithRetry = useCallback(async (file: File, id: string) => {
    const validationError = validateUploadFile(file, 'photo');
    if (validationError) {
      updatePhoto(id, { status: 'error' });
      setUploadError(validationError);
      return;
    }

    try {
      const sig = await fetchUploadSignature();
      const result = await uploadToCloudinary(file, sig, {
        onProgress: (percent) => {
          updatePhoto(id, { progressPercent: percent });
        },
      });
      updatePhoto(id, { url: result.url, publicId: result.publicId, status: 'done', progressPercent: 100 });
    } catch (err) {
      console.error(`[StepPhotos] Échec upload ${file.name}:`, err);
      updatePhoto(id, { status: 'error' });
      setUploadError(err instanceof Error ? err.message : 'Upload impossible. Vérifiez votre connexion puis réessayez.');
    }
  }, [updatePhoto]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    setUploadError(null);
    const validFiles = files.filter((file) => {
      const validationError = validateUploadFile(file, 'photo');
      if (validationError) setUploadError(validationError);
      return !validationError;
    });
    if (!validFiles.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = validFiles.slice(0, remaining);
    const ids = addPhotos(toUpload);

    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < toUpload.length) {
        const index = nextIndex;
        nextIndex += 1;
        await uploadPhotoWithRetry(toUpload[index], ids[index]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, toUpload.length) }, worker));
  }, [photos.length, addPhotos, uploadPhotoWithRetry]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    uploadFiles(images);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

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
  const uploadedCount = photos.filter((p) => p.status === 'done').length;
  const allDone = photos.length > 0 && !isUploading && !hasError;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">

      {/* Signature error banner */}
      {uploadError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={2} />
          <p className="text-[13px] font-bold text-red-700 flex-1">{uploadError}</p>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="flex items-center gap-1 text-[12px] font-extrabold text-red-700 hover:text-red-900 bg-red-100 px-3 py-1.5 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Fermer
          </button>
        </div>
      )}

      {/* ━━━ Photo Gallery Health Score Header ━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Images className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-white tracking-tight">Studio Photos AutoLoc</h3>
              <p className="text-[12px] text-slate-300 font-medium mt-0.5">
                Les véhicules avec au moins 4 belles photos s'inversent 2.8x plus vite !
              </p>
            </div>
          </div>
          <span className="text-[12px] font-black bg-emerald-500 text-white px-3.5 py-1 rounded-full shadow-sm">
            {uploadedCount} / {MAX_PHOTOS} Photos
          </span>
        </div>

        {/* Gallery Score bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-slate-700/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(uploadedCount / 4) * 100 > 100 ? 100 : (uploadedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-emerald-400">
            {uploadedCount >= 4 ? "Score Photo : Parfait ✨" : `Manque ${Math.max(0, 4 - uploadedCount)} photo(s)`}
          </span>
        </div>
      </div>

      {/* ━━━ Photo Upload Grid Studio ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-6">

        {/* Upload Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-[13px] font-black text-slate-900">Ajouter des photos du véhicule</p>
            <p className="text-[11px] font-medium text-slate-500">Formats acceptés : JPG, PNG, WEBP (Max 10Mo par photo)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-black transition-all shadow-md active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Prendre photo
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[12px] font-black transition-all active:scale-95 shadow-sm"
            >
              <ImagePlus className="w-4 h-4 text-emerald-600" />
              Galerie
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              draggable={photo.status === 'done'}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group rounded-2xl overflow-hidden border-2 transition-all duration-200 aspect-[4/3] select-none",
                i === 0
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30"
                  : photo.status === 'error'
                    ? "border-red-400"
                    : "border-slate-200 hover:border-slate-400",
                draggedIndex === i && "opacity-40 scale-95",
                dragOverIndex === i && "border-emerald-500 scale-105"
              )}
            >
              {/* Image Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url || URL.createObjectURL(photo.file)}
                alt={`Photo ${i + 1}`}
                className={cn("w-full h-full object-cover", photo.status !== 'done' && "opacity-40")}
              />

              {/* Upload Spinner & Progress */}
              {photo.status === 'uploading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-1.5 p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    {photo.progressPercent ? `${photo.progressPercent}%` : 'Upload...'}
                  </span>
                  <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                      style={{ width: `${photo.progressPercent || 5}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {photo.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-red-900/80 text-white p-2 text-center">
                  <AlertCircle className="w-5 h-5 text-red-200" />
                  <span className="text-[10px] font-bold">Échec</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setUploadError(null);
                      updatePhoto(photo.id, { status: 'uploading' });
                      await uploadPhotoWithRetry(photo.file, photo.id);
                    }}
                    className="text-[10px] font-black underline bg-white/20 px-2 py-0.5 rounded"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Main Photo Badge */}
              {i === 0 && photo.status === 'done' && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white shadow-md uppercase tracking-wider">
                  <Star className="h-3 w-3 fill-white" />
                  Photo Principale
                </div>
              )}

              {/* Hover Actions (Desktop) */}
              {photo.status === 'done' && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => movePhotoToFirst(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-900 hover:bg-emerald-500 hover:text-white transition-all shadow-md font-bold"
                      title="Mettre en photo principale"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md font-bold"
                    title="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Dropzone tile */}
          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => galleryRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 aspect-[4/3] text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                <ImagePlus className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[12px] font-extrabold text-slate-800">Ajouter une photo</span>
              <span className="text-[10px] font-medium text-slate-400">ou glisser-déposer</span>
            </div>
          )}
        </div>

        {photos.length > 0 && !isUploading && (
          <p className="text-[11px] font-medium text-slate-400 text-center">
            💡 Astuce : Glissez-déposez les photos pour modifier leur ordre d'affichage. La 1ère photo sera la photo de couverture principale.
          </p>
        )}
      </div>

      {/* ━━━ Action Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allDone}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2.5 text-[14px] font-black px-8 py-4 rounded-xl shadow-xl transition-all duration-200",
            allDone
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
          )}
        >
          Continuer — Documents Obligatoires
          <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
