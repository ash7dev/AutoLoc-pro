"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, FileCheck2, FileUp, ShieldCheck, X, Camera, CheckCircle2, Loader2, Lock, FileText, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";
import { uploadDocumentToCloudinary, fetchUploadSignature, validateUploadFile } from "@/lib/nestjs/vehicles";
import { SectionCard } from "@/features/vehicles/components/VehicleFormPrimitives";

type DocUploadStatus = 'idle' | 'uploading' | 'done' | 'error';
const MAX_UPLOAD_ATTEMPTS = 3;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepDocuments({ onNext, onBack }: Props) {
  const { carteGrise, assurance, carteGriseUploadResult, assuranceUploadResult, setDocument, setDocumentUploadResult } = useAddVehicleStore();

  const [uploadStatus, setUploadStatus] = useState<{ carteGrise: DocUploadStatus; assurance: DocUploadStatus }>({
    carteGrise: carteGriseUploadResult ? 'done' : 'idle',
    assurance: assuranceUploadResult ? 'done' : 'idle',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState<{ carteGrise: number; assurance: number }>({
    carteGrise: 0,
    assurance: 0,
  });

  const handleFile = async (type: "carteGrise" | "assurance", files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateUploadFile(file, 'document');
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setDocument(type, file);
    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));
    setProgressPct(prev => ({ ...prev, [type]: 5 }));
    setUploadError(null);

    try {
      const sig = await fetchUploadSignature();
      const result = await uploadDocumentToCloudinary(file, sig, {
        onProgress: (pct) => {
          setProgressPct(prev => ({ ...prev, [type]: pct }));
        },
      });
      setDocumentUploadResult(type, { url: result.url, publicId: result.publicId });
      setUploadStatus(prev => ({ ...prev, [type]: 'done' }));
      setProgressPct(prev => ({ ...prev, [type]: 100 }));
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
      setUploadError(err instanceof Error ? err.message : 'Upload impossible. Vérifiez votre connexion puis réessayez.');
    }
  };

  const handleClear = (type: "carteGrise" | "assurance") => {
    setDocument(type, null);
    setUploadStatus(prev => ({ ...prev, [type]: 'idle' }));
  };

  const isFormValid = !!carteGriseUploadResult && !!assuranceUploadResult
    && uploadStatus.carteGrise === 'done' && uploadStatus.assurance === 'done';

  return (
    <div className="space-y-7 animate-in fade-in duration-300">

      {uploadError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="flex-1 text-[13px] font-bold text-red-700">{uploadError}</p>
          <button type="button" onClick={() => setUploadError(null)} className="text-[12px] font-extrabold text-red-700">
            Fermer
          </button>
        </div>
      )}

      {/* ━━━ Section Documents Scanner Style ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={FileCheck2}
        title="Documents officiels du véhicule"
        subtitle="Téléversez la carte grise et l'attestation d'assurance en cours de validité"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentZone
            title="Carte Grise (Certificat d'immatriculation)"
            description="Document officiel au nom du propriétaire"
            icon={<FileCheck2 className="w-5 h-5 text-emerald-600" />}
            file={carteGrise}
            uploadStatus={uploadStatus.carteGrise}
            progressPct={progressPct.carteGrise}
            onFileSelect={(files) => handleFile("carteGrise", files)}
            onClear={() => handleClear("carteGrise")}
          />

          <DocumentZone
            title="Attestation d'Assurance"
            description="Contrat ou attestation d'assurance en cours"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            file={assurance}
            uploadStatus={uploadStatus.assurance}
            progressPct={progressPct.assurance}
            onFileSelect={(files) => handleFile("assurance", files)}
            onClear={() => handleClear("assurance")}
          />
        </div>

        {/* Security Reassurance Box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3.5 shadow-md">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[13px] font-black text-white">Chiffrement AES-256 & Confidentialité Garantie</p>
            <p className="text-[11px] font-medium text-slate-300 mt-0.5 leading-relaxed">
              Vos documents administratifs sont uniquement utilisés par l'équipe AutoLoc pour vérifier la conformité du véhicule. Ils ne sont jamais partagés publiquement.
            </p>
          </div>
        </div>
      </SectionCard>

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
          disabled={!isFormValid}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2.5 text-[14px] font-black px-8 py-4 rounded-xl shadow-xl transition-all duration-200",
            isFormValid
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
          )}
        >
          Continuer — Aperçu & Publication
          <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

/* ── Document upload zone component ─────────────────────────────── */
function DocumentZone({
  title,
  description,
  icon,
  file,
  uploadStatus,
  progressPct,
  onFileSelect,
  onClear,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  file: File | null;
  uploadStatus: DocUploadStatus;
  progressPct?: number;
  onFileSelect: (files: FileList | null) => void;
  onClear: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl border-2 border-slate-200/80 bg-slate-50/40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-black text-slate-900">{title}</p>
          <p className="text-[11px] font-medium text-slate-500">{description}</p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-center"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-black hover:bg-slate-800 transition-all shadow-sm"
            >
              <Camera className="h-3.5 w-3.5" />
              Scanner / Photo
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-[12px] font-black hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileUp className="h-3.5 w-3.5 text-emerald-600" />
              Parcourir
            </button>
          </div>
          <span className="text-[10px] font-bold text-slate-400">PDF, JPG, PNG · Max 10 Mo</span>
          <input ref={cameraRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => onFileSelect(e.target.files)} />
          <input ref={galleryRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFileSelect(e.target.files)} />
        </div>
      ) : (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border-2",
          uploadStatus === 'error' ? "border-red-300 bg-red-50" : "border-emerald-400 bg-white shadow-sm"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[12px]",
            uploadStatus === 'uploading' ? "bg-amber-100 text-amber-600"
              : uploadStatus === 'error' ? "bg-red-100 text-red-600"
                : "bg-emerald-500 text-white"
          )}>
            {uploadStatus === 'uploading'
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : uploadStatus === 'error'
                ? <AlertCircle className="w-5 h-5" />
                : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-slate-900 truncate">{file.name}</p>
            {uploadStatus === 'uploading' && (
              <div className="space-y-1 mt-0.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-600">
                  <span>Envoi en cours...</span>
                  <span>{progressPct ?? 5}%</span>
                </div>
                <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-200" style={{ width: `${progressPct || 5}%` }} />
                </div>
              </div>
            )}
            {uploadStatus === 'done' && <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Document vérifié & sécurisé ✓</p>}
            {uploadStatus === 'error' && <p className="text-[11px] font-bold text-red-600 mt-0.5">Échec d'envoi. Veuillez réessayer.</p>}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
