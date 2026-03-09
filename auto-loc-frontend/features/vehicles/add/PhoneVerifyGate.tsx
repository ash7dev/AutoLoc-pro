"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, Loader2, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/nestjs/api-client";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { cn } from "@/lib/utils";

type Stage = "intro" | "success";

const COUNTRY_CODES = [
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+224", country: "Guinée", flag: "🇬🇳" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+241", country: "Gabon", flag: "🇬🇦" },
  { code: "+237", country: "Cameroun", flag: "🇨🇲" },
  { code: "+243", country: "RD Congo", flag: "🇨🇩" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+32", country: "Belgique", flag: "🇧🇪" },
  { code: "+41", country: "Suisse", flag: "🇨🇭" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
] as const;

function normalizePhone(countryCode: string, raw: string): string {
  const digits = raw.trim().replace(/[\s\-()]/g, "");
  if (!digits) return "";
  // If user typed full international format, use as-is
  if (digits.startsWith("+")) return digits;
  // Remove leading 0 (local format)
  const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;
  return `${countryCode}${cleaned}`;
}

export function PhoneVerifyGate({
  profile,
  onVerified,
}: {
  profile: ProfileResponse;
  onVerified: () => void;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const [countryCode, setCountryCode] = useState("+221");
  const [phoneInput, setPhone] = useState(profile.phone?.replace(/^\+\d{1,3}/, "") ?? "");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];

  const handleConfirm = async () => {
    const normalized = normalizePhone(countryCode, phoneInput);
    if (!normalized || normalized.length < 8) {
      setError("Entrez un numéro valide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!profile.hasUtilisateur) {
        if (!prenom.trim() || !nom.trim() || !dateNaissance) {
          setError("Nom, prénom et date de naissance requis.");
          setLoading(false);
          return;
        }
        await authFetch("/auth/complete-profile", {
          method: "POST",
          body: {
            prenom: prenom.trim(),
            nom: nom.trim(),
            telephone: normalized,
            dateNaissance,
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
        {!profile.hasUtilisateur && (
          <input
            type="date"
            value={dateNaissance}
            onChange={(e) => { setDateNaissance(e.target.value); setError(null); }}
            className={cn(
              "w-full h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all",
              "focus:ring-2 focus:ring-ring focus:border-transparent",
              error ? "border-destructive" : "border-[hsl(var(--border))]",
            )}
          />
        )}

        {/* Phone input with country code selector */}
        <div className="flex gap-2">
          <div className="relative flex-shrink-0">
            <select
              value={countryCode}
              onChange={(e) => { setCountryCode(e.target.value); setError(null); }}
              className={cn(
                "h-12 rounded-xl border bg-background pl-3 pr-8 text-sm font-medium outline-none transition-all appearance-none cursor-pointer",
                "focus:ring-2 focus:ring-ring focus:border-transparent",
                error ? "border-destructive" : "border-[hsl(var(--border))]",
              )}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} {c.country}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => { setPhone(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
            placeholder="77 000 00 00"
            className={cn(
              "flex-1 h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all",
              "focus:ring-2 focus:ring-ring focus:border-transparent",
              error ? "border-destructive" : "border-[hsl(var(--border))]",
            )}
            autoFocus
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedCountry.flag} {selectedCountry.country} ({countryCode}) · Sélectionnez votre pays dans le menu déroulant.
        </p>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={handleConfirm}
        disabled={loading || !phoneInput.trim() || (!profile.hasUtilisateur && (!prenom.trim() || !nom.trim() || !dateNaissance))}
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
