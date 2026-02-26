"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Car, CircleDollarSign,
  FileText, Camera, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddVehicleStore } from "../store";
import { apiFetch } from "@/lib/nestjs/api-client";
import { VEHICLE_PATHS, Vehicle } from "@/lib/nestjs/vehicles";

interface Props {
  previousStep?: () => void;
}

export function StepReview({ previousStep }: Props) {
  const router = useRouter();
  const { step1, step2, step3, photos, setVehicleId, reset } = useAddVehicleStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!step1 || !step2) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Créer le véhicule
      const vehicle = await apiFetch<Vehicle, Record<string, unknown>>(VEHICLE_PATHS.create, {
        method: "POST",
        body: {
          marque:            step1.marque,
          modele:            step1.modele,
          annee:             step1.annee,
          type:              step1.type,
          carburant:         step1.carburant,
          transmission:      step1.transmission,
          nombrePlaces:      step1.nombrePlaces,
          immatriculation:   step1.immatriculation,
          ville:             step1.ville,
          adresse:           step1.adresse,
          prixParJour:       step2.prixParJour,
          joursMinimum:      step2.joursMinimum,
          tiers:             step2.tiers.length > 0 ? step2.tiers : undefined,
          ageMinimum:        step3?.ageMinimum,
          zoneConduite:      step3?.zoneConduite      || undefined,
          assurance:         step3?.assurance         || undefined,
          reglesSpecifiques: step3?.reglesSpecifiques || undefined,
        },
      });

      setVehicleId(vehicle.id);

      // 2. Uploader les photos
      for (const file of photos) {
        const form = new FormData();
        form.append("file", file);
        await apiFetch(VEHICLE_PATHS.addPhoto(vehicle.id), {
          method: "POST",
          body: form as unknown as Record<string, unknown>,
        });
      }

      reset();
      router.push(`/dashboard/owner/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Récapitulatif</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vérifiez tout avant de publier votre annonce.
        </p>
      </div>

      {/* Section Véhicule */}
      <ReviewSection icon={Car} title="Véhicule">
        <ReviewRow label="Marque / Modèle"  value={`${step1?.marque} ${step1?.modele}`} />
        <ReviewRow label="Année"             value={String(step1?.annee ?? "—")} />
        <ReviewRow label="Immatriculation"   value={step1?.immatriculation ?? "—"} />
        <ReviewRow label="Type"              value={step1?.type ?? "—"} />
        <ReviewRow label="Carburant"         value={step1?.carburant ?? "—"} />
        <ReviewRow label="Transmission"      value={step1?.transmission ?? "—"} />
        <ReviewRow label="Ville / Adresse"   value={`${step1?.ville}, ${step1?.adresse}`} />
      </ReviewSection>

      {/* Section Prix */}
      <ReviewSection icon={CircleDollarSign} title="Tarification">
        <ReviewRow label="Prix par jour"     value={step2 ? formatPrice(step2.prixParJour) : "—"} />
        <ReviewRow label="Durée minimum"     value={step2?.joursMinimum ? `${step2.joursMinimum} jour(s)` : "1 jour"} />
        {(step2?.tiers ?? []).length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paliers progressifs</p>
            {step2!.tiers.map((t, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.joursMin}+ j{t.joursMax ? ` — ${t.joursMax} j` : ""}
                </span>
                <span className="font-medium">{formatPrice(t.prix)}/j</span>
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      {/* Section Conditions */}
      <ReviewSection icon={FileText} title="Conditions">
        <ReviewRow label="Âge minimum"       value={step3?.ageMinimum ? `${step3.ageMinimum} ans` : "18 ans"} />
        <ReviewRow label="Zone conduite"     value={step3?.zoneConduite ?? "Non définie"} />
        <ReviewRow label="Assurance"         value={step3?.assurance ?? "Non précisée"} />
        {step3?.reglesSpecifiques && (
          <ReviewRow label="Règles"          value={step3.reglesSpecifiques} />
        )}
      </ReviewSection>

      {/* Section Photos */}
      <ReviewSection icon={Camera} title="Photos">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{photos.length} photo(s) sélectionnée(s)</span>
          <Badge variant={photos.length > 0 ? "secondary" : "destructive"}>
            {photos.length > 0 ? "OK" : "Aucune photo"}
          </Badge>
        </div>
      </ReviewSection>

      {/* Status notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 leading-relaxed">
          Votre annonce (et votre dossier KYC si nécessaire) seront examinés avant publication.
          Délai habituel : sous 24h.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={previousStep} disabled={loading} className="gap-2 h-10">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={handlePublish}
          disabled={loading || !step1 || !step2 || photos.length === 0}
          className="gap-2 bg-emerald-500 text-black font-semibold hover:bg-emerald-400 h-10 shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)] transition-all"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Publication en cours…</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" />Publier l'annonce</>
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5 border-b border-[hsl(var(--border))]">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
