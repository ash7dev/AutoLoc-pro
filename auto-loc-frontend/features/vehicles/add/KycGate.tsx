"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck, Clock, XCircle, ArrowRight, Upload,
  CheckCircle2, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type KycStatus = "NON_VERIFIE" | "EN_ATTENTE" | "VERIFIE" | "REJETE" | undefined;
type SubStep    = 1 | 2 | 3;

const PROGRESS_KEY = "kyc_wizard_progress";

function loadSubStep(): SubStep {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return (JSON.parse(raw).subStep ?? 1) as SubStep;
  } catch { /* ignore */ }
  return 1;
}
function saveSubStep(s: SubStep) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify({ subStep: s })); } catch { /* ignore */ }
}
function clearSubStep() {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}

// ── Main component ────────────────────────────────────────────────────────────

export function KycGate({
  kycStatus: initialStatus,
  onProceed,
  onSubmitted,
  pendingMode = "continue",
}: {
  kycStatus: KycStatus;
  onProceed: () => void;
  onSubmitted?: () => void;
  pendingMode?: "continue" | "block";
}) {
  const [status, setStatus]         = useState<KycStatus>(initialStatus);
  const [subStep, setSubStep]       = useState<SubStep>(() => loadSubStep());
  const [frontFile, setFrontFile]   = useState<File | null>(null);
  const [backFile, setBackFile]     = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [submitted, setSubmitted]   = useState(false);
  const { authFetch } = useAuthFetch();

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "NON_VERIFIE" || status === "REJETE") saveSubStep(subStep);
  }, [subStep, status]);

  const goTo = (s: SubStep) => { setSubStep(s); setError(null); };

  const handleSubmit = async () => {
    if (!frontFile || !backFile) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("documentFront", frontFile);
      form.append("documentBack", backFile);
      await authFetch("/auth/kyc/submit", { method: "POST", body: form });
      clearSubStep();
      setSubmitted(true);
      setStatus("EN_ATTENTE");
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── VERIFIE → skip ─────────────────────────────────────────────────────────
  if (status === "VERIFIE") { onProceed(); return null; }

  // ── EN_ATTENTE ─────────────────────────────────────────────────────────────
  if (status === "EN_ATTENTE") {
    return (
      <div className="flex flex-col items-center gap-8 py-12 max-w-lg mx-auto text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
          <Clock className="h-7 w-7 text-amber-500" />
        </div>

        {/* Status chip */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600">
          <Clock className="h-3 w-3" />
          Vérification en cours
        </span>

        <div className="space-y-2">
          <h2 className="text-[22px] font-black tracking-tight text-slate-900">
            {submitted ? "Documents envoyés !" : "Vérification en cours"}
          </h2>
          <p className="text-[13px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            {submitted
              ? "Vos documents sont en cours d'examen. Vous pouvez déjà renseigner les infos de votre véhicule."
              : "Notre équipe examine vos documents. Vous serez notifié par WhatsApp dès validation — généralement sous 24h."
            }
          </p>
        </div>

        {pendingMode === "continue" ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={onProceed}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-[13.5px] font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 transition-all"
            >
              Continuer vers le formulaire
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-slate-400">
              L'annonce ne sera visible qu'après validation KYC.
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">
            Vous pourrez réserver dès que la vérification sera validée.
          </p>
        )}
      </div>
    );
  }

  // ── NON_VERIFIE / REJETE → mini-wizard 3 sous-étapes ─────────────────────
  return (
    <div className="flex flex-col gap-6 py-8 max-w-lg mx-auto">

      {/* Rejection banner */}
      {status === "REJETE" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-600">KYC rejeté</p>
            <p className="text-[12px] text-slate-500 mt-0.5">Soumettez à nouveau vos documents.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-[18px] font-black tracking-tight text-slate-900">Vérification d'identité</h2>
          <p className="text-[12px] text-slate-400">
            {subStep === 1 ? "Étape 1 — Recto" : subStep === 2 ? "Étape 2 — Verso" : "Étape 3 — Confirmation"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
        <p className="text-[12.5px] font-medium text-amber-700">
          Soumettez votre pièce d'identité pour continuer.
        </p>
      </div>

      {/* Sub-step indicator */}
      <div className="flex items-center gap-1">
        {([1, 2, 3] as SubStep[]).map((s, i) => (
          <div key={s} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors flex-shrink-0",
                s < subStep   && "bg-emerald-500 text-white",
                s === subStep && "bg-emerald-600 text-white ring-2 ring-emerald-400/30 ring-offset-1",
                s > subStep   && "bg-slate-100 text-slate-400",
              )}>
                {s < subStep ? "✓" : s}
              </div>
              <span className={cn(
                "text-[10px] hidden sm:block text-center font-medium",
                s === subStep ? "text-emerald-600" : "text-slate-400",
              )}>
                {s === 1 ? "Recto" : s === 2 ? "Verso" : "Envoi"}
              </span>
            </div>
            {i < 2 && (
              <div className={cn("h-px flex-1 mx-1 mb-3 transition-colors", s < subStep ? "bg-emerald-400" : "bg-slate-200")} />
            )}
          </div>
        ))}
      </div>

      {/* Card content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {subStep === 1 && (
          <UploadZone
            title="Recto de la pièce d'identité"
            description="CNI ou passeport — JPG, PNG, WEBP · Max 8 MB"
            file={frontFile}
            inputRef={frontRef}
            onFile={setFrontFile}
          />
        )}
        {subStep === 2 && (
          <UploadZone
            title="Verso de la pièce d'identité"
            description="Photo claire du verso — JPG, PNG, WEBP · Max 8 MB"
            file={backFile}
            inputRef={backRef}
            onFile={setBackFile}
          />
        )}
        {subStep === 3 && (
          <div className="space-y-4">
            <p className="text-[13px] font-bold text-slate-800">Récapitulatif avant envoi</p>
            <ReviewItem label="Recto" file={frontFile} onEdit={() => goTo(1)} />
            <ReviewItem label="Verso" file={backFile}  onEdit={() => goTo(2)} />

            <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 leading-relaxed">
                En soumettant, vos documents seront traités par notre équipe.
                Délai habituel : moins de 24h.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-[12.5px] font-medium text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {subStep > 1 ? (
          <button
            type="button"
            onClick={() => goTo((subStep - 1) as SubStep)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Retour
          </button>
        ) : <div />}

        {subStep < 3 ? (
          <button
            type="button"
            onClick={() => goTo((subStep + 1) as SubStep)}
            disabled={(subStep === 1 && !frontFile) || (subStep === 2 && !backFile)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !frontFile || !backFile}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi…</>
              : <><CheckCircle2 className="h-4 w-4" />Soumettre</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadZone({
  title, description, file, inputRef, onFile,
}: {
  title: string;
  description: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const preview = file?.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-bold text-slate-800">{title}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed cursor-pointer py-8 transition-all",
          dragOver             && "border-emerald-400 bg-emerald-50/40",
          !dragOver && !file   && "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20",
          !dragOver && !!file  && "border-emerald-400 bg-emerald-50/30",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="max-h-36 rounded-lg object-contain" />
        ) : (
          <>
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              file ? "bg-emerald-100" : "bg-slate-100",
            )}>
              {file
                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                : <Upload className="h-5 w-5 text-slate-400" />
              }
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-slate-700">{file ? file.name : "Glissez ou cliquez"}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
      </div>
      {file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Changer le fichier
        </button>
      )}
    </div>
  );
}

function ReviewItem({ label, file, onEdit }: { label: string; file: File | null; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2.5">
        {file
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          : <XCircle      className="h-4 w-4 text-red-400 flex-shrink-0" />
        }
        <div>
          <p className="text-[13px] font-semibold text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-400">{file ? file.name : "Non sélectionné"}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[11.5px] font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-dotted transition-colors"
      >
        Modifier
      </button>
    </div>
  );
}
