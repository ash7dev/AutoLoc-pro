"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck, Clock, XCircle, ArrowRight, Upload,
  CheckCircle2, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}: {
  kycStatus: KycStatus;
  onProceed: () => void;
  onSubmitted?: () => void;
}) {
  const [status, setStatus]         = useState<KycStatus>(initialStatus);
  const [subStep, setSubStep]       = useState<SubStep>(() => loadSubStep());
  const [frontFile, setFrontFile]   = useState<File | null>(null);
  const [backFile, setBackFile]     = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [submitted, setSubmitted]   = useState(false);
  const { authFetch } = useAuthFetch();

  const frontRef  = useRef<HTMLInputElement>(null);
  const backRef   = useRef<HTMLInputElement>(null);

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
      await authFetch("/auth/kyc/submit", {
        method: "POST",
        body: form,
      });
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
          <Clock className="h-7 w-7 text-amber-500" />
        </div>

        <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">
          <Clock className="h-3 w-3 mr-1.5" />
          Vérification en cours
        </Badge>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {submitted ? "Documents envoyés !" : "Vérification en cours"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {submitted
              ? "Vos documents sont en cours d'examen. Vous pouvez déjà renseigner les infos de votre véhicule."
              : "Notre équipe examine vos documents. Vous serez notifié par WhatsApp dès validation — généralement sous 24h."
            }
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <Button
            onClick={onProceed}
            className="w-full gap-2 bg-black text-white hover:bg-black/90 h-11"
          >
            Continuer vers le wizard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            L'annonce ne sera visible qu'après validation KYC.
          </p>
        </div>
      </div>
    );
  }

  // ── NON_VERIFIE / REJETE → mini-wizard 3 sous-étapes ─────────────────────
  return (
    <div className="flex flex-col gap-6 py-8 max-w-lg mx-auto">
      {/* Rejection banner */}
      {status === "REJETE" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">KYC rejeté</p>
            <p className="text-xs text-muted-foreground mt-1">Soumettez à nouveau vos documents.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-card">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Vérification d'identité</h2>
          <p className="text-sm text-muted-foreground">
            {subStep === 1 ? "Étape 1 — Recto" : subStep === 2 ? "Étape 2 — Verso" : "Étape 3 — Confirmation"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-sm text-amber-700">
          Soumettez le KYC pour continuer.
        </p>
      </div>

      {/* Sub-step indicator */}
      <div className="flex items-center gap-1">
        {([1, 2, 3] as SubStep[]).map((s, i) => (
          <div key={s} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors flex-shrink-0",
                s < subStep  && "bg-emerald-500 text-white",
                s === subStep && "bg-black text-white ring-2 ring-black/20 ring-offset-1",
                s > subStep  && "bg-muted text-muted-foreground",
              )}>
                {s < subStep ? "✓" : s}
              </div>
              <span className={cn("text-[10px] hidden sm:block text-center", s === subStep ? "font-semibold" : "text-muted-foreground")}>
                {s === 1 ? "Recto" : s === 2 ? "Verso" : "Envoi"}
              </span>
            </div>
            {i < 2 && <div className={cn("h-px flex-1 mx-1 mb-3", s < subStep ? "bg-emerald-500" : "bg-border")} />}
          </div>
        ))}
      </div>

      {/* Card content */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-6">
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
            <p className="text-sm font-semibold">Récapitulatif avant envoi</p>
            <ReviewItem label="Recto" file={frontFile} onEdit={() => goTo(1)} />
            <ReviewItem label="Verso" file={backFile}  onEdit={() => goTo(2)} />

            <div className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                En soumettant, vos documents seront traités par notre équipe.
                Délai habituel : moins de 24h.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {subStep > 1
          ? <Button variant="outline" onClick={() => goTo((subStep - 1) as SubStep)} className="h-10">Retour</Button>
          : <div />
        }

        {subStep < 3 ? (
          <Button
            onClick={() => goTo((subStep + 1) as SubStep)}
            disabled={(subStep === 1 && !frontFile) || (subStep === 2 && !backFile)}
            className="gap-2 bg-black text-white hover:bg-black/90 h-10 disabled:opacity-50"
          >
            Suivant <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !frontFile || !backFile}
            className="gap-2 bg-emerald-500 text-black font-semibold hover:bg-emerald-400 h-10"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi…</>
              : <><CheckCircle2 className="h-4 w-4" />Soumettre</>
            }
          </Button>
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
      <p className="text-sm font-semibold">{title}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed cursor-pointer py-8 transition-colors",
          dragOver    && "border-black bg-black/5",
          !dragOver && !file && "border-[hsl(var(--border))] hover:border-black/40 hover:bg-muted/30",
          !dragOver && file  && "border-emerald-500 bg-emerald-50/30",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="max-h-36 rounded-lg object-contain" />
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {file ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{file ? file.name : "Glissez ou cliquez"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
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
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
    <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
      <div className="flex items-center gap-2.5">
        {file
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          : <XCircle      className="h-4 w-4 text-destructive flex-shrink-0" />
        }
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{file ? file.name : "Non sélectionné"}</p>
        </div>
      </div>
      <button onClick={onEdit} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
        Modifier
      </button>
    </div>
  );
}
