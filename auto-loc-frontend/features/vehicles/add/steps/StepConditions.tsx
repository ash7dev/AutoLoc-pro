"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft, ArrowRight, Shield, MapPinned, UserCheck, FileText, AlertTriangle, Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step3Data } from "../store";
import React from "react";

const ZONES = [
  { value: "Dakar uniquement" },
  { value: "Hors Dakar autorisé" },
];

import { SectionCard, FormField, INPUT_CLASS, SELECT_CLASS, LABEL_CLASS } from "@/features/vehicles/components/VehicleFormPrimitives";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepConditions({ onNext, onBack }: Props) {
  const { step3, setStep3 } = useAddVehicleStore();

  const { register, handleSubmit, watch } = useForm<Step3Data>({
    defaultValues: step3 ?? {
      ageMinimum: 21,
      assurance: "Locataire responsable" // Valeur par défaut
    },
  });

  const selectedZone = watch("zoneConduite");

  const onSubmit = (data: Step3Data) => {
    setStep3(data);
    onNext();
  };

  const isHorsDakarEnabledInStep2 = useAddVehicleStore.getState().step2?.autoriseHorsDakar;
  const supplementHorsDakar = useAddVehicleStore.getState().step2?.supplementHorsDakarParJour;

  // Sync zoneConduite with Step 2 toggle if needed
  React.useEffect(() => {
    if (isHorsDakarEnabledInStep2 && watch("zoneConduite") !== "Hors Dakar autorisé") {
      setStep3({ ...watch(), zoneConduite: "Hors Dakar autorisé" });
    }
  }, [isHorsDakarEnabledInStep2]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* ━━━ Section: Exigences locataire ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={UserCheck} title="Exigences locataire" subtitle="Âge minimum et restrictions">
        <FormField label="Âge minimum du locataire" icon={UserCheck}>
          <input
            type="number"
            {...register("ageMinimum", { min: 18, max: 99, valueAsNumber: true })}
            placeholder="21"
            className={INPUT_CLASS}
          />
          <p className="text-[11px] font-medium text-slate-400 mt-1.5">Minimum légal : 18 ans</p>
        </FormField>
      </SectionCard>

      {/* ━━━ Section: Zone de conduite ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={MapPinned}
        title="Zone de conduite"
        subtitle={isHorsDakarEnabledInStep2 ? "Zone étendue activée (Hors Dakar)" : "Où le locataire pourra circuler"}
      >
        {isHorsDakarEnabledInStep2 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <MapPinned className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-black text-emerald-700">Hors Dakar autorisé</p>
              <p className="text-[11px] font-medium text-emerald-600/70">
                L'option avec supplément de {supplementHorsDakar?.toLocaleString('fr-FR')} FCFA/j a été activée à l'étape précédente.
              </p>
            </div>
            <input type="hidden" {...register("zoneConduite")} value="Hors Dakar autorisé" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ZONES.map((z) => {
              const active = selectedZone === z.value;
              return (
                <label
                  key={z.value}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200",
                    active
                      ? "border-emerald-400 bg-emerald-50 shadow-sm ring-1 ring-emerald-400/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input type="radio" value={z.value} {...register("zoneConduite")} className="sr-only" />
                  <span className={cn("text-[12px] font-bold", active ? "text-emerald-700" : "text-slate-600")}>
                    {z.value}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ━━━ Section: Politique dommages & Assurance ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={Shield} title="Assurance & Dommages" subtitle="Comment le véhicule est protégé">
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              value: "Locataire responsable",
              label: "Locataire responsable",
              desc: "Le locataire paie les réparations en cas de dommages."
            },
            {
              value: "Incluse (tous risques)",
              label: "Incluse (tous risques)",
              desc: "Le véhicule bénéficie d'une protection complète (Tous Risques)."
            },
          ].map((opt) => {
            const active = watch("assurance") === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200",
                  active
                    ? "border-emerald-400 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <input type="radio" value={opt.value} {...register("assurance")} className="sr-only" />
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all",
                  active ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                )}>
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={cn("text-[14px] font-black leading-tight", active ? "text-emerald-700" : "text-slate-700")}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    {opt.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-3 px-1 leading-relaxed">
          {watch("assurance") === "Incluse (tous risques)" 
            ? "✓ En cas de sinistre, le locataire ne paie que la franchise." 
            : "⚠️ En cas de sinistre, le locataire prend en charge l'intégralité des frais."
          }
        </p>
      </SectionCard>

      {/* ━━━ Section: Politique Carburant ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={Fuel} title="Politique Carburant" subtitle="Règle de restitution du réservoir">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: "Plein à plein", desc: "Restituer avec le plein" },
            { value: "Niveau identique", desc: "Même niveau qu'au départ" },
          ].map((opt) => {
            const active = watch("carburantCondition") === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200",
                  active
                    ? "border-emerald-400 bg-emerald-50 shadow-sm ring-1 ring-emerald-400/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <input type="radio" value={opt.value} {...register("carburantCondition")} className="sr-only" />
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                  active ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                )}>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={cn("text-[13px] font-bold", active ? "text-emerald-700" : "text-slate-700")}>
                    {opt.value}
                  </p>
                  <p className="text-[10px] text-slate-400">{opt.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </SectionCard>

      {/* ━━━ Section: Règles spécifiques ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={FileText} title="Règles & remarques" subtitle="Informations supplémentaires pour le locataire" badge="Optionnel">
        <textarea
          {...register("reglesSpecifiques")}
          rows={3}
          placeholder="Ex : Non-fumeur, pas d'animaux, restitution avec plein…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[16px] font-medium text-slate-900 placeholder-slate-300 outline-none resize-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
        />
        <div className="flex items-start gap-2 mt-2 sm:mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
           <UserCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
           <p className="text-[11px] font-medium text-emerald-700 leading-tight">
             Plus vos règles sont claires, plus vos réservations sont fluides.
           </p>
        </div>
      </SectionCard>

      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Retour</span>
          <span className="sm:hidden">Annuler</span>
        </button>
        <button type="submit"
          className="w-full sm:w-auto group flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
          Suivant — Photos
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}


