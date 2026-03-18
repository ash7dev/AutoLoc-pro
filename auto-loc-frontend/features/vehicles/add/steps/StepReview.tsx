"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Car, CircleDollarSign,
  FileText, Camera, FileCheck2, Loader2, AlertCircle,
  Shield, Sparkles, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { VEHICLE_PATHS, Vehicle } from "@/lib/nestjs/vehicles";

interface Props {
  onBack: () => void;
}

export function StepReview({ onBack }: Props) {
  const router = useRouter();
  const { step1, step2, step3, photos, carteGrise, assurance, setVehicleId, reset } = useAddVehicleStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  const handlePublish = async () => {
    if (!step1 || !step2) return;
    setLoading(true);
    setError(null);

    let createdVehicleId: string | null = null;

    try {
      const vehicle = await authFetch<Vehicle, Record<string, unknown>>(VEHICLE_PATHS.create, {
        method: "POST",
        body: {
          marque: step1.marque,
          modele: step1.modele,
          annee: step1.annee,
          type: step1.type,
          carburant: step1.carburant,
          transmission: step1.transmission,
          nombrePlaces: step1.nombrePlaces,
          immatriculation: step1.immatriculation,
          ville: step1.ville,
          adresse: step1.adresse,
          prixParJour: step2.prixParJour,
          joursMinimum: step2.joursMinimum,
          tiers: step2.tiers.length > 0 ? step2.tiers : undefined,
          ageMinimum: step3?.ageMinimum,
          zoneConduite: step3?.zoneConduite || undefined,
          assurance: step3?.assurance || undefined,
          reglesSpecifiques: step3?.reglesSpecifiques || undefined,
          equipements: step1.equipements?.length ? step1.equipements : undefined,
          fraisLivraison: step2.fraisLivraison || undefined,
          photos: photos
            .filter((p) => p.status === 'done' && p.url && p.publicId)
            .map((p) => ({ url: p.url!, publicId: p.publicId! })),
        },
      });

      createdVehicleId = vehicle.id;
      setVehicleId(vehicle.id);

      if (carteGrise) {
        const cgForm = new FormData();
        cgForm.append("file", carteGrise);
        await authFetch(VEHICLE_PATHS.uploadCarteGrise(vehicle.id), {
          method: "POST",
          body: cgForm as unknown as Record<string, unknown>,
        });
      }

      if (assurance) {
        const assForm = new FormData();
        assForm.append("file", assurance);
        await authFetch(VEHICLE_PATHS.uploadAssurance(vehicle.id), {
          method: "POST",
          body: assForm as unknown as Record<string, unknown>,
        });
      }

      reset();
      router.push(`/dashboard/owner/vehicles/${vehicle.id}`);
    } catch (err) {
      if (createdVehicleId) {
        try {
          await authFetch(VEHICLE_PATHS.archive(createdVehicleId), { method: "DELETE" });
        } catch { /* rollback failed */ }
      }
      setError(
        err instanceof Error
          ? `L'opération a échoué : ${err.message}. Aucune donnée n'a été enregistrée.`
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

  const allValid = !!step1 && !!step2 && photos.some((p) => p.status === 'done') && !!carteGrise && !!assurance;

  return (
    <div className="space-y-6">

      {/* ━━━ Véhicule ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ReviewSection icon={Car} title="Véhicule">
        <ReviewRow label="Marque / Modèle" value={`${step1?.marque ?? "—"} ${step1?.modele ?? ""}`} />
        <ReviewRow label="Année" value={String(step1?.annee ?? "—")} />
        <ReviewRow label="Immatriculation" value={step1?.immatriculation ?? "—"} mono />
        <ReviewRow label="Type" value={step1?.type ?? "—"} />
        <ReviewRow label="Carburant" value={step1?.carburant ?? "—"} />
        <ReviewRow label="Transmission" value={step1?.transmission ?? "—"} />
        <ReviewRow label="Localisation" value={`${step1?.ville ?? "—"}, ${step1?.adresse ?? ""}`} />
        {step1?.equipements && step1.equipements.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Équipements</p>
            <div className="flex flex-wrap gap-1.5">
              {step1.equipements.map((eq) => (
                <span key={eq} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}
      </ReviewSection>

      {/* ━━━ Tarification ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ReviewSection icon={CircleDollarSign} title="Tarification">
        <ReviewRow label="Prix par jour" value={step2 ? fmtPrice(step2.prixParJour) : "—"} highlight />
        <ReviewRow label="Durée minimum" value={step2?.joursMinimum ? `${step2.joursMinimum} jour(s)` : "1 jour"} />
        {(step2?.tiers ?? []).length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Paliers dégressifs</p>
            {step2!.tiers.map((t, i) => (
              <div key={i} className="flex justify-between text-[12px] py-1">
                <span className="text-slate-500 font-medium">
                  {t.joursMin}+ j{t.joursMax ? ` — ${t.joursMax} j` : ""}
                </span>
                <span className="font-bold text-slate-800">{fmtPrice(t.prix)}/j</span>
              </div>
            ))}
          </div>
        )}
        {step2?.fraisLivraison && step2.fraisLivraison > 0 && (
          <ReviewRow label="Frais de livraison" value={fmtPrice(step2.fraisLivraison)} icon={Truck} />
        )}
      </ReviewSection>

      {/* ━━━ Conditions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ReviewSection icon={Shield} title="Conditions">
        <ReviewRow label="Âge minimum" value={step3?.ageMinimum ? `${step3.ageMinimum} ans` : "18 ans"} />
        <ReviewRow label="Zone conduite" value={step3?.zoneConduite ?? "Non définie"} />
        <ReviewRow label="Assurance" value={step3?.assurance ?? "Non précisée"} />
        {step3?.reglesSpecifiques && <ReviewRow label="Règles" value={step3.reglesSpecifiques} />}
      </ReviewSection>

      {/* ━━━ Fichiers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ReviewSection icon={FileCheck2} title="Fichiers">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FileStatus label={`${photos.filter(p => p.status === 'done').length} photo(s)`} ok={photos.some(p => p.status === 'done')} icon={Camera} />
          <FileStatus label="Carte Grise" ok={!!carteGrise} icon={FileCheck2} />
          <FileStatus label="Assurance" ok={!!assurance} icon={Shield} />
        </div>
      </ReviewSection>

      {/* ━━━ Notice ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] font-medium text-amber-700 leading-relaxed">
          Votre annonce sera examinée avant publication. Délai habituel : sous 24h.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[12px] font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} disabled={loading}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Retour
        </button>
        <button
          onClick={handlePublish}
          disabled={loading || !allValid}
          className={cn(
            "group flex items-center gap-2.5 text-[13px] font-bold px-7 py-3.5 rounded-xl transition-all duration-200",
            allValid && !loading
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none",
          )}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Publication en cours…</>
          ) : (
            <>
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              Publier l&apos;annonce
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Shared UI
═══════════════════════════════════════════════════════════════════ */

function ReviewSection({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <span className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
        </span>
        <p className="text-[13px] font-bold text-slate-900 tracking-tight">{title}</p>
      </div>
      <div className="px-5 py-4 space-y-2.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight, mono, icon: Icon }: {
  label: string; value: string; highlight?: boolean; mono?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12px]">
      <span className="text-slate-500 font-medium flex items-center gap-1.5 flex-shrink-0">
        {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
        {label}
      </span>
      <span className={cn(
        "font-bold text-right",
        highlight ? "text-emerald-600" : "text-slate-800",
        mono && "font-mono tracking-wider uppercase",
      )}>
        {value}
      </span>
    </div>
  );
}

function FileStatus({ label, ok, icon: Icon }: {
  label: string; ok: boolean; icon: React.ElementType;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-xl border px-3.5 py-3",
      ok
        ? "border-emerald-200 bg-emerald-50"
        : "border-red-200 bg-red-50",
    )}>
      <span className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
        ok ? "bg-emerald-100" : "bg-red-100",
      )}>
        {ok
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
          : <AlertCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={2.5} />
        }
      </span>
      <div>
        <p className={cn("text-[11px] font-bold", ok ? "text-emerald-700" : "text-red-600")}>{label}</p>
        <p className={cn("text-[9px] font-medium", ok ? "text-emerald-500" : "text-red-400")}>
          {ok ? "✓ Prêt" : "Manquant"}
        </p>
      </div>
    </div>
  );
}
