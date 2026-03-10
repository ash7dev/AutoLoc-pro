"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, X, Star, ImagePlus, Camera, Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";

const MAX_PHOTOS = 8;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPhotos({ onNext, onBack }: Props) {
  const { photos, addPhoto, removePhoto } = useAddVehicleStore();
  const [mainIndex, setMainIndex] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const previews = photos.map((f) => URL.createObjectURL(f));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.type.startsWith("image/")) addPhoto(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-7">

      {/* ━━━ Section Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
            {/* Existing photos */}
            {previews.map((src, i) => (
              <div
                key={i}
                className={cn(
                  "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[4/3]",
                  i === mainIndex
                    ? "border-emerald-400 shadow-md shadow-emerald-500/15"
                    : "border-transparent hover:border-slate-300",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                {/* Main badge */}
                {i === mainIndex && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[9px] font-black text-white shadow-sm uppercase tracking-wider">
                    <Star className="h-2.5 w-2.5 fill-white" strokeWidth={0} />
                    Principale
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {i !== mainIndex && (
                    <button
                      type="button"
                      onClick={() => setMainIndex(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-700 hover:bg-white hover:scale-105 transition-all shadow-md"
                      title="Définir comme principale"
                    >
                      <Star className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      removePhoto(i);
                      if (mainIndex >= i && mainIndex > 0) setMainIndex(mainIndex - 1);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-red-500 hover:bg-white hover:scale-105 transition-all shadow-md"
                    title="Supprimer"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
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
                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                  >
                    <Camera className="h-3 w-3" strokeWidth={2.5} />
                    Camera
                  </button>
                  {/* Gallery button */}
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <ImagePlus className="h-3 w-3" strokeWidth={2.5} />
                    Galerie
                  </button>
                </div>
                <span className="text-[10px] font-medium text-slate-400">ou glisser-déposer</span>

                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
            )}
          </div>

          {photos.length > 0 && (
            <p className="text-[11px] font-medium text-slate-400 mt-3 text-center">
              Survolez une photo pour la définir comme principale ou la supprimer
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
          disabled={photos.length === 0}
          className={cn(
            "group flex items-center gap-2.5 text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all duration-200",
            photos.length > 0
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed",
          )}
        >
          Suivant — Documents
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
