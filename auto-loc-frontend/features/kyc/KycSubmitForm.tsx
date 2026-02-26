"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { submitKyc, type ProfileResponse } from "@/lib/nestjs/auth";
import { ApiError } from "@/lib/nestjs/api-client";
import { cn } from "@/lib/utils";

type KycStatus = ProfileResponse["kycStatus"];

type FileSlot = {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} Mo`;
}

function buildEmptySlot(): FileSlot {
  return { file: null, previewUrl: null, error: null };
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format invalide. Autorisé : JPG, PNG, WEBP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Fichier trop volumineux (max 8 Mo).";
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

  useEffect(() => {
    return () => {
      if (documentFrontSlot.previewUrl) URL.revokeObjectURL(documentFrontSlot.previewUrl);
      if (documentBackSlot.previewUrl) URL.revokeObjectURL(documentBackSlot.previewUrl);
    };
  }, [documentFrontSlot.previewUrl, documentBackSlot.previewUrl]);

  const canSubmit = useMemo(() => {
    return Boolean(documentFrontSlot.file && documentBackSlot.file);
  }, [documentFrontSlot.file, documentBackSlot.file]);

  const handleFileChange = (
    file: File | null,
    setSlot: (slot: FileSlot) => void,
    current: FileSlot,
  ) => {
    if (!file) {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      setSlot(buildEmptySlot());
      return;
    }
    const error = validateFile(file);
    if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
    setSlot({
      file,
      previewUrl: error ? null : URL.createObjectURL(file),
      error,
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      if (documentFrontSlot.file) formData.append("documentFront", documentFrontSlot.file);
      if (documentBackSlot.file) formData.append("documentBack", documentBackSlot.file);
      const profile = await submitKyc(formData);
      setStatus(profile.kycStatus);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Une erreur est survenue. Réessayez.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "VERIFIE") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-lg font-semibold text-emerald-700">Identité déjà vérifiée</p>
        <p className="text-sm text-emerald-700/80 mt-1">
          Votre KYC est validé. Vous pouvez publier des annonces.
        </p>
      </div>
    );
  }

  if (status === "EN_ATTENTE") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-lg font-semibold text-amber-700">Vérification en cours</p>
        <p className="text-sm text-amber-700/80 mt-1">
          Votre dossier est en cours d’examen. Vous serez notifié dès validation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-card p-6 space-y-2">
        <h2 className="text-xl font-semibold">Vérification d’identité</h2>
        <p className="text-sm text-muted-foreground">
          Ajoutez le recto et le verso de votre pièce d’identité. Formats acceptés : JPG, PNG, WEBP (8 Mo max).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Recto de la pièce</p>
          <div className="flex flex-col gap-3">
            {documentFrontSlot.previewUrl ? (
              <img
                src={documentFrontSlot.previewUrl}
                alt="Aperçu recto"
                className="h-48 w-full rounded-xl object-cover border"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Ajoutez une photo claire du recto
              </div>
            )}
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] ?? null, setDocumentFrontSlot, documentFrontSlot)
              }
            />
            {documentFrontSlot.file && (
              <div className="text-xs text-muted-foreground">
                {documentFrontSlot.file.name} • {formatBytes(documentFrontSlot.file.size)}
              </div>
            )}
            {documentFrontSlot.error && <p className="text-xs text-destructive">{documentFrontSlot.error}</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Verso de la pièce</p>
          <div className="flex flex-col gap-3">
            {documentBackSlot.previewUrl ? (
              <img
                src={documentBackSlot.previewUrl}
                alt="Aperçu verso"
                className="h-48 w-full rounded-xl object-cover border"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Ajoutez une photo claire du verso
              </div>
            )}
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] ?? null, setDocumentBackSlot, documentBackSlot)
              }
            />
            {documentBackSlot.file && (
              <div className="text-xs text-muted-foreground">
                {documentBackSlot.file.name} • {formatBytes(documentBackSlot.file.size)}
              </div>
            )}
            {documentBackSlot.error && <p className="text-xs text-destructive">{documentBackSlot.error}</p>}
          </div>
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={
            !canSubmit ||
            submitting ||
            documentFrontSlot.error !== null ||
            documentBackSlot.error !== null
          }
          className={cn("h-11 px-6", submitting && "opacity-80")}
        >
          {submitting ? "Envoi en cours..." : "Soumettre la vérification"}
        </Button>
        {submitted && (
          <p className="text-sm text-emerald-600">Dossier envoyé avec succès.</p>
        )}
      </div>
    </div>
  );
}
