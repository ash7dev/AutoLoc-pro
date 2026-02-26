"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Star, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddVehicleStore } from "../store";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 8;

interface Props {
  nextStep?: () => void;
  previousStep?: () => void;
}

export function StepPhotos({ nextStep, previousStep }: Props) {
  const { photos, addPhoto, removePhoto } = useAddVehicleStore();
  const [mainIndex, setMainIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Photos du véhicule</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez jusqu&apos;à {MAX_PHOTOS} photos. La première (étoile) sera l&apos;image principale.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Photos déjà sélectionnées */}
        {previews.map((src, i) => (
          <div
            key={i}
            className={cn(
              "relative group rounded-xl overflow-hidden border-2 transition-all bg-muted",
              i === mainIndex ? "border-emerald-500" : "border-transparent",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="h-48 w-full object-cover"
            />
            {/* Main badge */}
            {i === mainIndex && (
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full
                bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <Star className="h-2.5 w-2.5 fill-white" />
                Principale
              </div>
            )}
            {/* Actions overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-2
              bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {i !== mainIndex && (
                <button
                  type="button"
                  onClick={() => setMainIndex(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-full
                    bg-white/90 text-black hover:bg-white transition-colors shadow"
                  title="Définir comme principale"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  removePhoto(i);
                  if (mainIndex >= i && mainIndex > 0) setMainIndex(mainIndex - 1);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full
                  bg-white/90 text-destructive hover:bg-white transition-colors shadow"
                title="Supprimer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Slot d'ajout — visible tant qu'on n'a pas atteint MAX_PHOTOS */}
        {photos.length < MAX_PHOTOS && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2
              rounded-xl border border-dashed border-[hsl(var(--border))] bg-muted/30
              text-muted-foreground transition-colors
              hover:border-black/40 hover:bg-muted/60"
          >
            <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-sm font-medium">Ajouter une photo</span>
            <span className="text-xs opacity-60">JPG, PNG, WEBP · Max 10 Mo</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {photos.length}/{MAX_PHOTOS} photo{photos.length > 1 ? "s" : ""} — survolez une photo pour la définir comme principale ou la supprimer
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={previousStep} className="gap-2 h-10">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          disabled={photos.length === 0}
          className="gap-2 bg-black text-white hover:bg-black/90 h-10 disabled:opacity-50"
        >
          Suivant — Confirmation
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
