"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Car, CircleDollarSign,
  FileText, Camera, FileCheck2, Loader2, AlertCircle,
  Shield, Sparkles, Truck, MapPin, Fuel, Eye, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore } from "../store";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { VEHICLE_PATHS, Vehicle } from "@/lib/nestjs/vehicles";
import { revalidateVehiclePaths } from "@/lib/nestjs/revalidate";
import { LiveListingCardMockup } from "@/features/vehicles/components/VehicleFormPrimitives";

interface Props {
  onBack: () => void;
}

export function StepReview({ onBack }: Props) {
  const router = useRouter();
  const { step1, step2, step3, photos, carteGriseUploadResult, assuranceUploadResult, setVehicleId, reset } = useAddVehicleStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();
  const submittingRef = useRef(false);

  const handlePublish = async () => {
    if (!step1 || !step2) return;
    if (!carteGriseUploadResult || !assuranceUploadResult) {
      setError('Les documents obligatoires doivent être téléversés. Retournez à l’étape Documents.');
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const validPhotos = photos.filter((p) => p.status === 'done' && p.url && p.publicId);
      
      const vehicle = await authFetch<Vehicle, Record<string, unknown>>(VEHICLE_PATHS.create, {
        method: "POST",
        timeoutMs: 25000,
        body: {
          marque: step1.marque,
          modele: step1.modele,
          annee: step1.annee,
          type: step1.type ?? step1.types?.[0],
          types: step1.types?.length ? step1.types : (step1.type ? [step1.type] : undefined),
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
          assurance: step3?.assurance || "Locataire responsable",
          carburantCondition: step3?.carburantCondition || undefined,
          reglesSpecifiques: step3?.reglesSpecifiques || undefined,
          equipements: step1.equipements?.length ? step1.equipements : undefined,
          fraisLivraison: step2.fraisLivraison || undefined,
          autoriseHorsDakar: step2.autoriseHorsDakar || false,
          supplementHorsDakarParJour: step2.supplementHorsDakarParJour || undefined,
          photos: validPhotos.map((p) => ({ url: p.url!, publicId: p.publicId! })),
          carteGriseUrl: carteGriseUploadResult.url,
          carteGrisePublicId: carteGriseUploadResult.publicId,
          assuranceDocUrl: assuranceUploadResult.url,
          assuranceDocPublicId: assuranceUploadResult.publicId,
        },
      });

      setVehicleId(vehicle.id);
      await revalidateVehiclePaths(vehicle.id, true).catch(err => {
        console.warn('Failed to revalidate paths:', err);
      });

      reset();
      router.replace(`/dashboard/owner/vehicles/${vehicle.id}`);
    } catch (err) {
      submittingRef.current = false;
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(`La création de l'annonce a échoué : ${message}`);
      setLoading(false);
    }
  };

  const fmtPrice = (n: number | undefined | null) => {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  };

  const coverPhoto = photos.find((p) => p.status === 'done')?.url ?? undefined;
  const allValid = !!step1 && !!step2 && photos.some((p) => p.status === 'done')
    && !!carteGriseUploadResult && !!assuranceUploadResult;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ━━━ Hero Mockup Live Preview Section ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-white">Aperçu en Direct de votre Annonce</h3>
              <p className="text-[12px] font-medium text-slate-300">Voici exactement comment votre véhicule apparaîtra sur AutoLoc</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" />
            Annonce 100% Optimisée
          </span>
        </div>

        {/* Live Catalog Card Component */}
        <div className="pt-2">
          <LiveListingCardMockup
            marque={step1?.marque}
            modele={step1?.modele}
            annee={step1?.annee}
            prixParJour={step2?.prixParJour}
            ville={step1?.ville}
            photoUrl={coverPhoto}
            types={step1?.types}
          />
        </div>
      </div>

      {/* ━━━ Summary Cards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Véhicule */}
        <ReviewSection icon={Car} title="Véhicule & Localisation">
          <ReviewRow label="Marque & Modèle" value={`${step1?.marque ?? "—"} ${step1?.modele ?? ""}`} />
          <ReviewRow label="Année" value={String(step1?.annee ?? "—")} />
          <ReviewRow label="Immatriculation" value={step1?.immatriculation ?? "—"} mono />
          <ReviewRow label="Catégories" value={step1?.types?.length ? step1.types.join(", ") : (step1?.type ?? "—")} />
          <ReviewRow label="Carburant / Boîte" value={`${step1?.carburant ?? "—"} / ${step1?.transmission ?? "—"}`} />
          <ReviewRow label="Localisation" value={`${step1?.ville ?? "—"}, ${step1?.adresse ?? ""}`} />
        </ReviewSection>

        {/* Tarification */}
        <ReviewSection icon={CircleDollarSign} title="Tarification & Conditions">
          <ReviewRow label="Prix par jour" value={step2 ? fmtPrice(step2.prixParJour) : "—"} highlight />
          <ReviewRow label="Durée minimum" value={step2?.joursMinimum ? `${step2.joursMinimum} jour(s)` : "1 jour"} />
          <ReviewRow label="Assurance" value={step3?.assurance ?? "Locataire responsable"} />
          <ReviewRow label="Zone" value={step3?.zoneConduite ?? "Non définie"} />
          <ReviewRow label="Politique Carburant" value={step3?.carburantCondition ?? "Non définie"} />
          {step2?.fraisLivraison ? <ReviewRow label="Frais Livraison" value={fmtPrice(step2.fraisLivraison)} icon={Truck} /> : null}
        </ReviewSection>
      </div>

      {/* Notice & Safety */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[12px] font-bold text-amber-900 leading-relaxed">
          Une fois votre annonce soumise, notre équipe effectuera une validation express sous 24h. Vous recevrez une notification dès qu'elle sera en ligne !
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-[13px] font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* ━━━ Action Navigation & Publish CTA ━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Retour
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={loading || !allValid}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2.5 text-[15px] font-black px-9 py-4 rounded-xl shadow-2xl transition-all duration-300 transform",
            allValid && !loading
              ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 ring-4 ring-emerald-400/20"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publication en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              Publier mon annonce AutoLoc
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-[14px] font-black text-slate-900">{title}</p>
      </div>
      <div className="p-4 space-y-2.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight, mono, icon: Icon }: {
  label: string; value: string; highlight?: boolean; mono?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px] py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
      </span>
      <span className={cn(
        "font-bold text-right truncate",
        highlight ? "text-emerald-600 text-[15px] font-black" : "text-slate-800",
        mono && "font-mono uppercase tracking-wider text-slate-900"
      )}>
        {value}
      </span>
    </div>
  );
}
