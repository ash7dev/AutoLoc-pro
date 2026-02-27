"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/nestjs/api-client";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { cn } from "@/lib/utils";

type Stage = "intro" | "success";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s-]/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("221")) return `+${trimmed}`;
  return `+221${trimmed}`;
}

export function PhoneVerifyGate({
  profile,
  onVerified,
}: {
  profile: ProfileResponse;
  onVerified: () => void;
}) {
  const [stage, setStage]      = useState<Stage>("intro");
  const [phoneInput, setPhone] = useState(profile.phone ?? "");
  const [prenom, setPrenom]    = useState("");
  const [nom, setNom]          = useState("");
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  const handleConfirm = async () => {
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      setError("Entrez un numéro valide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!profile.hasUtilisateur) {
        if (!prenom.trim() || !nom.trim()) {
          setError("Nom et prénom requis.");
          setLoading(false);
          return;
        }
        await authFetch("/auth/complete-profile", {
          method: "POST",
          body: {
            prenom: prenom.trim(),
            nom: nom.trim(),
            telephone: normalized,
          },
        });
      } else {
        await authFetch("/auth/phone/update", {
          method: "POST",
          body: { telephone: normalized },
        });
      }
      setStage("success");
      setTimeout(onVerified, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 400
            ? "Numéro invalide ou déjà utilisé par un autre compte."
            : "Service indisponible. Réessayez.",
        );
      } else {
        setError("Service indisponible. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (stage === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <p className="text-lg font-semibold">Téléphone enregistré !</p>
        <p className="text-sm text-muted-foreground">Redirection en cours…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12 max-w-md mx-auto">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-card shadow-sm">
        <Smartphone className="h-7 w-7" />
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Votre numéro de téléphone
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ce numéro sera utilisé pour les communications liées à vos locations.
        </p>
      </div>

      {/* Input */}
      <div className="w-full space-y-2">
        {!profile.hasUtilisateur && (
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={prenom}
              onChange={(e) => { setPrenom(e.target.value); setError(null); }}
              placeholder="Prénom"
              className={cn(
                "h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all",
                "focus:ring-2 focus:ring-ring focus:border-transparent",
                error ? "border-destructive" : "border-[hsl(var(--border))]",
              )}
            />
            <input
              type="text"
              value={nom}
              onChange={(e) => { setNom(e.target.value); setError(null); }}
              placeholder="Nom"
              className={cn(
                "h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all",
                "focus:ring-2 focus:ring-ring focus:border-transparent",
                error ? "border-destructive" : "border-[hsl(var(--border))]",
              )}
            />
          </div>
        )}
        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => { setPhone(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
          placeholder="+221 77 000 00 00"
          className={cn(
            "w-full h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all",
            "focus:ring-2 focus:ring-ring focus:border-transparent",
            error ? "border-destructive" : "border-[hsl(var(--border))]",
          )}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Sans indicatif, le préfixe +221 (Sénégal) est ajouté automatiquement.
        </p>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={handleConfirm}
        disabled={loading || !phoneInput.trim() || (!profile.hasUtilisateur && (!prenom.trim() || !nom.trim()))}
        className="w-full gap-2 bg-black text-white hover:bg-black/90 h-11"
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <ArrowRight className="h-4 w-4" />
        }
        Confirmer le numéro
      </Button>
    </div>
  );
}
