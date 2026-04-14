"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { submitKyc, type ProfileResponse } from "@/lib/nestjs/auth";
import { ApiError } from "@/lib/nestjs/api-client";
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
  Image as ImageIcon
} from "lucide-react";

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

export function KycSubmitForm({
  initialStatus,
}: {
  initialStatus?: KycStatus;
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);
  const [documentFrontSlot, setDocumentFrontSlot] = useState<FileSlot>(buildEmptySlot);
  const [documentBackSlot, setDocumentBackSlot] = useState<FileSlot>(buildEmptySlot);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(() => {
    return Boolean(documentFrontSlot.file && documentBackSlot.file);
  }, [documentFrontSlot.file, documentBackSlot.file]);

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

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      
      // Compression des images avant envoi pour passer la limite Vercel de 4.5Mo
      const compressImage = async (file: File): Promise<File> => {
        if (file.size < 1024 * 1024) return file; // Moins de 1Mo, on ne touche à rien
        
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Max 1600px de large/haut pour garder une super qualité tout en étant léger
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
            }, 'image/jpeg', 0.8); // 80% de qualité
          };
          img.src = URL.createObjectURL(file);
        });
      };

      const [compressedFront, compressedBack] = await Promise.all([
        documentFrontSlot.file ? compressImage(documentFrontSlot.file) : null,
        documentBackSlot.file ? compressImage(documentBackSlot.file) : null,
      ]);

      if (compressedFront) formData.append("documentFront", compressedFront);
      if (compressedBack) formData.append("documentBack", compressedBack);

      const profile = await submitKyc(formData);
      setStatus(profile.kycStatus);
      setSubmitted(true);
    } catch (err: any) {
      console.error("KYC Submit error:", err);
      
      // Traduction des erreurs techniques en messages "Pro"
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
    slot, 
    onSelect, 
    onRemove, 
    inputRef 
  }: { 
    label: string, 
    slot: FileSlot, 
    onSelect: (f: File) => void, 
    onRemove: () => void,
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </p>
      <div 
        onClick={() => !slot.file && inputRef.current?.click()}
        className={cn(
          "relative min-h-[160px] rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden",
          slot.file 
            ? "border-emerald-500 bg-emerald-50/20" 
            : "border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/10",
          slot.error && "border-red-200 bg-red-50/50"
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
            <img src={slot.previewUrl} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px]" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-[12px] font-bold text-emerald-700 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
                Document chargé
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Cliquer pour capturer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Photo nette & lisible</p>
            </div>
          </div>
        )}
      </div>
      {slot.error && (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1 ml-1">
          <AlertCircle className="w-3 h-3" />
          {slot.error}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vérification d’identité</h2>
        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
          Pour louer ou publier un véhicule, nous devons valider une pièce d'identité officielle (CNI, Passeport ou Permis).
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <UploadZone 
          label="Recto du document"
          slot={documentFrontSlot}
          inputRef={frontInputRef}
          onSelect={(f) => handleFileChange(f, setDocumentFrontSlot, documentFrontSlot)}
          onRemove={() => removeFile(setDocumentFrontSlot, documentFrontSlot)}
        />
        <UploadZone 
          label="Verso du document"
          slot={documentBackSlot}
          inputRef={backInputRef}
          onSelect={(f) => handleFileChange(f, setDocumentBackSlot, documentBackSlot)}
          onRemove={() => removeFile(setDocumentBackSlot, documentBackSlot)}
        />
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-slate-800">Données protégées</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Vos documents sont chiffrés et ne sont jamais partagés. Seul AutoLoc y a accès pour validation.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-[12px] font-bold text-red-700">{submitError}</p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className={cn(
          "w-full h-14 rounded-2xl text-[14px] font-black tracking-tight shadow-lg transition-all active:scale-[0.98]",
          canSubmit 
            ? "bg-slate-900 text-emerald-400 hover:bg-slate-800 shadow-slate-200" 
            : "bg-slate-100 text-slate-300"
        )}
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi sécurisé...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Soumettre la vérification
            <FileUp className="w-4 h-4" />
          </div>
        )}
      </Button>
    </div>
  );
}
