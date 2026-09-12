"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Info, Truck,
  Banknote, CalendarDays, TrendingDown, MapPin, Sparkles, Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step2Data } from "../store";
import { SectionCard, FormField, INPUT_CLASS, EarningSimulator } from "@/features/vehicles/components/VehicleFormPrimitives";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPricing({ onNext, onBack }: Props) {
  const { step2, setStep2 } = useAddVehicleStore();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step2Data>({
    defaultValues: step2 ?? {
      prixParJour: undefined,
      joursMinimum: 1,
      tiers: [],
      fraisLivraison: undefined,
      autoriseHorsDakar: false,
      supplementHorsDakarParJour: undefined,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "tiers" });
  const prixParJour = watch("prixParJour") || 0;
  const autoriseHorsDakar = watch("autoriseHorsDakar");

  const applyPresetTiers = (type: "standard" | "aggressive") => {
    if (!prixParJour || prixParJour < 1000) return;

    if (type === "standard") {
      replace([
        { joursMin: 3, joursMax: 6, prix: Math.round(prixParJour * 0.9) },
        { joursMin: 7, joursMax: 29, prix: Math.round(prixParJour * 0.85) },
        { joursMin: 30, prix: Math.round(prixParJour * 0.75) },
      ]);
    } else {
      replace([
        { joursMin: 3, joursMax: 6, prix: Math.round(prixParJour * 0.85) },
        { joursMin: 7, joursMax: 14, prix: Math.round(prixParJour * 0.75) },
        { joursMin: 15, prix: Math.round(prixParJour * 0.65) },
      ]);
    }
  };

  const onSubmit = (data: Step2Data) => {
    setStep2(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">

      {/* ━━━ Section 1: Prix de base & Estimateur ━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Banknote}
        title="1. Tarif de base & Revenus"
        subtitle="Fixez le montant de la location à la journée"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-5">
            <FormField label="Prix par jour (FCFA)" required error={errors.prixParJour ? "Minimum 1 000 FCFA" : undefined}>
              <div className="relative">
                <input
                  type="number"
                  {...register("prixParJour", { required: "Requis", min: 1000, valueAsNumber: true })}
                  placeholder="Ex: 25 000"
                  className={cn(INPUT_CLASS, "pr-20 text-[18px]")}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-400 uppercase">FCFA</span>
              </div>
            </FormField>

            <FormField label="Durée de location minimum (jours)" icon={CalendarDays}>
              <input
                type="number"
                {...register("joursMinimum", { min: 1, valueAsNumber: true })}
                placeholder="1"
                className={INPUT_CLASS}
              />
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                La plupart des locataires réservent pour 2 à 5 jours.
              </p>
            </FormField>
          </div>

          {/* Revenue Simulator Widget */}
          <div className="md:pt-1">
            <EarningSimulator dailyPrice={prixParJour} />
          </div>
        </div>
      </SectionCard>

      {/* ━━━ Section 2: Tarification dégressive ━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={TrendingDown}
        title="2. Tarifs dégressifs (Recommandé)"
        subtitle="Offrez une réduction automatique pour attirer des séjours plus longs"
        badge={
          <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Recommandé
          </span>
        }
      >
        {/* Preset buttons */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            <p className="text-[12px] font-black text-slate-900 uppercase tracking-wider">
              Appliquer des réductions pré-configurées en 1 clic
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPresetTiers("standard")}
              disabled={!prixParJour || prixParJour < 1000}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-extrabold bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 transition-all disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Réduction Standard (-10% dès 3j, -15% dès 7j, -25% dès 30j)
            </button>
            <button
              type="button"
              onClick={() => applyPresetTiers("aggressive")}
              disabled={!prixParJour || prixParJour < 1000}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-extrabold bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 transition-all disabled:opacity-50 shadow-sm"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              Réduction Long Séjour (-15% dès 3j, -25% dès 7j, -35% dès 15j)
            </button>
          </div>
        </div>

        {/* Custom tiers builder */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-black text-slate-700 uppercase tracking-wider">Paliers personnalisés</p>
            <button
              type="button"
              onClick={() => append({ joursMin: (fields.length > 0 ? (watch(`tiers.${fields.length - 1}.joursMin`) || 1) + 3 : 3), prix: Math.round(prixParJour * 0.9) })}
              className="flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              Ajouter un palier
            </button>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-3 sm:space-y-0 sm:rounded-xl sm:border sm:border-slate-200 sm:overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_44px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <span>À partir de (jours)</span>
                <span>Jusqu&apos;à (jours)</span>
                <span>Prix révisé par jour (FCFA)</span>
                <span />
              </div>

              {fields.map((field, i) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_1fr_44px] gap-3 p-4 sm:px-4 sm:py-3 border sm:border-0 border-slate-200 sm:border-b border-slate-100 rounded-xl sm:rounded-none bg-slate-50/40 sm:bg-white"
                >
                  <div className="sm:hidden flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase">Palier {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="number"
                      {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                      placeholder="3"
                      className="w-full h-11 rounded-lg border border-slate-200 px-3 text-[14px] font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                      placeholder="Illimité"
                      className="w-full h-11 rounded-lg border border-slate-200 px-3 text-[14px] font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                      placeholder="22 500"
                      className="w-full h-11 rounded-lg border border-slate-200 px-3 pr-14 text-[14px] font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">FCFA</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4">
              <Info className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-[12px] font-medium text-slate-600 leading-relaxed">
                Aucun palier configuré. Utilisez les boutons pré-configurés ci-dessus ou ajoutez un tarif spécifique (ex: 20 000 FCFA/j à partir de 7 jours).
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ━━━ Section 3: Livestock & Options ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Truck}
        title="3. Livraison & Trajets Étendus"
        subtitle="Services optionnels facturés en supplément"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card Livraison */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[14px] font-black text-slate-900">Livraison du véhicule</p>
                <p className="text-[11px] font-medium text-slate-500">Livrer le véhicule à l'adresse du locataire</p>
              </div>
            </div>
            <FormField label="Frais de livraison (FCFA)">
              <div className="relative">
                <input
                  type="number"
                  {...register("fraisLivraison", { min: 0, valueAsNumber: true })}
                  placeholder="Ex: 5 000 (0 si gratuit)"
                  className={INPUT_CLASS}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 uppercase">FCFA</span>
              </div>
            </FormField>
          </div>

          {/* Card Hors Dakar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[14px] font-black text-slate-900">Option Hors Dakar</p>
                  <p className="text-[11px] font-medium text-slate-500">Autoriser les sorties de région</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register("autoriseHorsDakar")}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {autoriseHorsDakar && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <FormField label="Supplément journalier Hors Dakar (FCFA)">
                  <div className="relative">
                    <input
                      type="number"
                      {...register("supplementHorsDakarParJour", { min: 0, valueAsNumber: true })}
                      placeholder="Ex: 5 000"
                      className={INPUT_CLASS}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 uppercase">FCFA/j</span>
                  </div>
                </FormField>
              </div>
            )}
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
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-black px-8 py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Continuer — Conditions & Assurance
          <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
