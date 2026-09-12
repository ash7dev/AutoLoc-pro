"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { submitKycLinks, fetchKycUploadSignature, type ProfileResponse } from "@/lib/nestjs/auth";
import { ApiError } from "@/lib/nestjs/api-client";
import { uploadDocumentToCloudinary } from "@/lib/nestjs/vehicles";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Camera,
  FileUp,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { KycSelfieCamera } from "./components/KycSelfieCamera";

type KycStatus = ProfileResponse["kycStatus"];

type FileSlot = {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

function buildEmptySlot(): FileSlot {
  return { file: null, previewUrl: null, error: null };
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format JPG, PNG ou WEBP uniquement.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Fichier trop lourd (max 8 Mo).";
  }
  return null;
}

// ── Step indicator ────────────────────────────────────────────────────────────

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: "Recto (Avant)", icon: FileText },
    { label: "Verso (Arrière)", icon: FileText },
    { label: "Selfie Live", icon: Camera },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={cn(
                "w-6 sm:w-10 h-[2px] rounded-full transition-colors duration-300",
                isDone ? "bg-emerald-400" : "bg-slate-200"
              )} />
            )}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                isDone && "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
                isActive && "bg-slate-900 text-emerald-400 shadow-lg shadow-slate-900/20 scale-105",
                !isActive && !isDone && "bg-slate-100 text-slate-400",
              )}>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-bold transition-colors duration-300 hidden sm:inline-block",
                isActive ? "text-slate-900" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KycSubmitForm({
  initialStatus,
  onSubmitted,
}: {
  initialStatus?: KycStatus;
  onSubmitted?: (profile: ProfileResponse) => void;
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [currentStep, setCurrentStep] = useState(1);
  const [documentFrontSlot, setDocumentFrontSlot] = useState<FileSlot>(buildEmptySlot);
  const [documentBackSlot, setDocumentBackSlot] = useState<FileSlot>(buildEmptySlot);
  const [selfieSlot, setSelfieSlot] = useState<FileSlot>(buildEmptySlot);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const canGoToStep2 = useMemo(() => {
    return Boolean(documentFrontSlot.file);
  }, [documentFrontSlot.file]);

  const canGoToStep3 = useMemo(() => {
    return Boolean(documentFrontSlot.file && documentBackSlot.file);
  }, [documentFrontSlot.file, documentBackSlot.file]);

  const canSubmit = useMemo(() => {
    return Boolean(documentFrontSlot.file && documentBackSlot.file && selfieSlot.file);
  }, [documentFrontSlot.file, documentBackSlot.file, selfieSlot.file]);

  const handleFileChange = (
    file: File | null,
    setSlot: (slot: FileSlot) => void,
    current: FileSlot,
  ) => {
    if (!file) return;
    const error = validateFile(file);
    if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
    setSlot({
      file,
      previewUrl: error ? null : URL.createObjectURL(file),
      error,
    });
  };

  const removeFile = (setSlot: (slot: FileSlot) => void, current: FileSlot) => {
    if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
    setSlot(buildEmptySlot());
  };

  const handleSelfieCapture = (file: File, previewUrl: string) => {
    setSelfieSlot({ file, previewUrl, error: null });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Compression des images avant envoi pour passer la limite Vercel de 4.5Mo
      const compressImage = async (file: File): Promise<File> => {
        if (file.size < 1024 * 1024) return file;

        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_SIZE = 1600;
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.8);
          };
          img.src = URL.createObjectURL(file);
        });
      };

      const [compressedFront, compressedBack, compressedSelfie] = await Promise.all([
        documentFrontSlot.file ? compressImage(documentFrontSlot.file) : null,
        documentBackSlot.file ? compressImage(documentBackSlot.file) : null,
        selfieSlot.file ? compressImage(selfieSlot.file) : null,
      ]);

      const docSig = await fetchKycUploadSignature();

      const [frontResult, backResult, selfieResult] = await Promise.all([
        compressedFront ? uploadDocumentToCloudinary(compressedFront, docSig) : Promise.resolve(null),
        compressedBack ? uploadDocumentToCloudinary(compressedBack, docSig) : Promise.resolve(null),
        compressedSelfie ? uploadDocumentToCloudinary(compressedSelfie, docSig) : Promise.resolve(null),
      ]);

      if (!frontResult || !backResult || !selfieResult) {
        throw new Error("Échec de l'upload des images");
      }

      const profile = await submitKycLinks({
        documentFrontUrl: frontResult.url,
        documentBackUrl: backResult.url,
        selfieUrl: selfieResult.url,
      });

      setStatus(profile.kycStatus);
      setSubmitted(true);
      onSubmitted?.(profile);
    } catch (err: any) {
      console.error("KYC Submit error:", err);

      if (err instanceof ApiError) {
        if (err.status === 413) {
          setSubmitError("Vos photos sont trop volumineuses pour être envoyées (max recommandé 10Mo par fichier).");
        } else {
          setSubmitError(err.message);
        }
      } else if (err.message?.includes("PAYLOAD_TOO_LARGE") || err.message?.includes("too large")) {
        setSubmitError("La taille totale des photos dépasse la limite autorisée. Essayez des fichiers plus légers.");
      } else {
        setSubmitError("Une erreur est survenue lors de l'envoi sécurisé. Veuillez réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "VERIFIE") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-emerald-50/50 rounded-3xl border border-emerald-100">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900">Identité vérifiée</h3>
          <p className="text-slate-600 text-[14px] leading-relaxed max-w-xs mx-auto">
            Votre KYC est validé. Vous avez un accès complet à la plateforme AutoLoc.
          </p>
        </div>
      </div>
    );
  }

  if (status === "EN_ATTENTE" || submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-amber-50/50 rounded-3xl border border-amber-100">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900">Vérification en cours</h3>
          <p className="text-slate-600 text-[14px] leading-relaxed max-w-xs mx-auto">
            Votre dossier a été transmis avec succès. Notre équipe l'analyse sous 24h à 48h.
          </p>
        </div>
      </div>
    );
  }

  const UploadZone = ({
    label,
    subtitle,
    slot,
    onSelect,
    onRemove,
    inputRef
  }: {
    label: string,
    subtitle: string,
    slot: FileSlot,
    onSelect: (f: File) => void,
    onRemove: () => void,
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <div className="space-y-3">
      <div className="space-y-0.5 ml-1">
        <p className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2 font-brand">
          <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          {label}
        </p>
        <p className="text-[12px] text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div
        onClick={() => !slot.file && inputRef.current?.click()}
        className={cn(
          "relative min-h-[220px] sm:min-h-[240px] rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden group select-none",
          slot.file
            ? "border-emerald-500/80 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-emerald-50/40 shadow-md shadow-emerald-500/5"
            : "border-dashed border-slate-200 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/20 shadow-xs",
          slot.error && "border-red-300 bg-red-50/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_TYPES.join(",")}
          onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
        />

        {slot.previewUrl ? (
          <>
            <img src={slot.previewUrl} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity opacity-80 group-hover:opacity-90" />
            <div className="relative z-10 flex flex-col items-center gap-3 text-center p-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 scale-105">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
              </div>
              <div className="bg-slate-950/80 text-white px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-md">
                <p className="text-[12px] font-extrabold tracking-wide">
                  Photo chargée avec succès
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-slate-800 text-[11.5px] font-bold shadow-md hover:bg-slate-100 transition-colors"
                >
                  Changer
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="p-1.5 rounded-xl bg-red-500/90 text-white hover:bg-red-600 shadow-md transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-300 group-hover:scale-110 transition-all duration-300 shadow-sm">
              <Camera className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-slate-900 tracking-tight">Appuyez pour prendre ou choisir une photo</p>
              <p className="text-[12px] text-slate-500 mt-1 font-medium">Cadrez clairement le document sans reflets</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/60 mt-1">
              JPG, PNG, WEBP · Max 8 Mo
            </span>
          </div>
        )}
      </div>
      {slot.error && (
        <p className="text-[11.5px] font-bold text-red-600 flex items-center gap-1.5 mt-1 ml-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {slot.error}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-brand">Vérification d&apos;identité</h2>
        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
          Pour la sécurité de la communauté AutoLoc, veuillez charger le recto et le verso de votre pièce officielle, puis réaliser un rapide selfie en direct.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* ── STEP 1: Upload Recto (Slide 1) ── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
          <UploadZone
            label="Étape 1 : Recto de votre pièce d'identité"
            subtitle="Face avant avec photo et nom (CNI, Passeport ou Permis)"
            slot={documentFrontSlot}
            inputRef={frontInputRef}
            onSelect={(f) => handleFileChange(f, setDocumentFrontSlot, documentFrontSlot)}
            onRemove={() => removeFile(setDocumentFrontSlot, documentFrontSlot)}
          />

          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!canGoToStep2}
            className={cn(
              "w-full h-14 rounded-2xl text-[15px] font-black tracking-wide shadow-lg transition-all active:scale-[0.98]",
              canGoToStep2
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40"
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Continuer vers le Verso</span>
              <ArrowRight className="w-4.5 h-4.5" strokeWidth={2.5} />
            </div>
          </Button>
        </div>
      )}

      {/* ── STEP 2: Upload Verso (Slide 2) ── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
          <UploadZone
            label="Étape 2 : Verso de votre pièce d'identité"
            subtitle="Face arrière de la carte nationale ou permis de conduire"
            slot={documentBackSlot}
            inputRef={backInputRef}
            onSelect={(f) => handleFileChange(f, setDocumentBackSlot, documentBackSlot)}
            onRemove={() => removeFile(setDocumentBackSlot, documentBackSlot)}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="h-14 rounded-2xl text-[13.5px] font-bold px-5 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
              Recto
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!canGoToStep3}
              className={cn(
                "flex-1 h-14 rounded-2xl text-[15px] font-black tracking-wide shadow-lg transition-all active:scale-[0.98]",
                canGoToStep3
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Continuer vers le Selfie</span>
                <ArrowRight className="w-4.5 h-4.5" strokeWidth={2.5} />
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Selfie capture (Slide 3) ── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
          {/* Selfie zone */}
          <div className="space-y-3">
            <div className="space-y-0.5 ml-1">
              <p className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2 font-brand">
                <User className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                Étape 3 : Selfie en direct
              </p>
              <p className="text-[12px] text-slate-500 font-medium">Positionnez votre visage au centre du repère</p>
            </div>

            {selfieSlot.previewUrl ? (
              /* Selfie captured and validated */
              <div className="flex flex-col items-center justify-center p-6 border-2 border-emerald-500/80 bg-emerald-50/30 rounded-3xl gap-4">
                <div className="w-36 h-36 rounded-full border-4 border-emerald-500 shadow-xl overflow-hidden relative">
                  <img
                    src={selfieSlot.previewUrl}
                    alt="Selfie capturé"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-0 right-0 text-center">
                    <span className="text-[9px] font-black text-white bg-emerald-500 px-2.5 py-0.5 rounded-full shadow-md">
                      Prêt
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-black text-slate-900">Selfie capturé avec succès</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Votre photo sera chiffrée et sécurisée</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(setSelfieSlot, selfieSlot)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-700 shadow-sm transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Reprendre la photo
                </button>
              </div>
            ) : (
              /* Inline camera widget directly running */
              <div className="border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 rounded-3xl shadow-inner flex flex-col items-center">
                <KycSelfieCamera
                  onCapture={handleSelfieCapture}
                />
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-slate-800">Sécurité & Confidentialité</p>
              <p className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5 font-medium">
                Le selfie en direct confirme l&apos;identité du titulaire de la pièce. Vos données restent strictement chiffrées et ne sont jamais revendues.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-[12.5px] font-bold text-red-950">{submitError}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              variant="outline"
              className="h-14 rounded-2xl text-[13.5px] font-bold px-5 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
              Verso
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={cn(
                "flex-1 h-14 rounded-2xl text-[15px] font-black tracking-wide shadow-lg transition-all active:scale-[0.98]",
                canSubmit
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-600/25 hover:shadow-emerald-600/40"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4.5 h-4.5 animate-spin" strokeWidth={2.5} />
                  Envoi sécurisé en cours…
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Soumettre ma vérification</span>
                  <FileUp className="w-4.5 h-4.5" strokeWidth={2.5} />
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
