"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft, ArrowRight, Shield, MapPinned, UserCheck, FileText, Fuel,
  CheckCircle2, AlertTriangle, ShieldCheck, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step3Data } from "../store";
import { SectionCard, FormField, INPUT_CLASS, OptionCard } from "@/features/vehicles/components/VehicleFormPrimitives";

const ZONES = [
  { value: "Dakar uniquement", desc: "Le véhicule doit rester strictement dans la région de Dakar." },
  { value: "Hors Dakar autorisé", desc: "Le locataire est autorisé à circuler hors de la région de Dakar." },
];

const FUEL_CONDITIONS = [
  { value: "Plein à plein", desc: "Le véhicule est remis avec le plein et doit être restitué avec le plein.", icon: "⛽" },
  { value: "Niveau identique", desc: "Le véhicule doit être rendu avec exactement le même niveau de carburant qu'au départ.", icon: "📊" },
];

const INSURANCE_OPTIONS = [
  {
    value: "Locataire responsable",
    title: "Locataire responsable (Standard)",
    desc: "En cas de dommage ou sinistre responsable, le locataire prend en charge les réparations.",
    badge: "Formule Standard",
  },
  {
    value: "Incluse (tous risques)",
    title: "Assurance Tous Risques Incluse",
    desc: "Votre véhicule bénéficie d'une protection complète Tous Risques AutoLoc.",
    badge: "Protection Maximale",
  },
];

const QUICK_RULES = [
  "Non-fumeur 🚭",
  "Pas d'animaux 🐾",
  "Permis de +3 ans requis 🪪",
  "Restitution propre ✨",
  "Respect strict du code de la route 🚗",
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepConditions({ onNext, onBack }: Props) {
  const { step3, setStep3, step2 } = useAddVehicleStore();

  const { register, handleSubmit, watch, setValue } = useForm<Step3Data>({
    defaultValues: step3 ?? {
      ageMinimum: 21,
      assurance: "Locataire responsable",
      zoneConduite: step2?.autoriseHorsDakar ? "Hors Dakar autorisé" : "Dakar uniquement",
      carburantCondition: "Plein à plein",
      reglesSpecifiques: "",
    },
  });

  const selectedAssurance = watch("assurance");
  const selectedFuel = watch("carburantCondition");
  const selectedZone = watch("zoneConduite");
  const currentRules = watch("reglesSpecifiques") || "";

  const isHorsDakarEnabledInStep2 = step2?.autoriseHorsDakar;
  const supplementHorsDakar = step2?.supplementHorsDakarParJour;

  useEffect(() => {
    if (isHorsDakarEnabledInStep2 && selectedZone !== "Hors Dakar autorisé") {
      setValue("zoneConduite", "Hors Dakar autorisé");
    }
  }, [isHorsDakarEnabledInStep2, selectedZone, setValue]);

  const addQuickRule = (ruleTag: string) => {
    if (currentRules.includes(ruleTag)) return;
    const newRules = currentRules ? `${currentRules} · ${ruleTag}` : ruleTag;
    setValue("reglesSpecifiques", newRules);
  };

  const onSubmit = (data: Step3Data) => {
    setStep3(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">

      {/* ━━━ Section 1: Exigences & Assurance ━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={ShieldCheck}
        title="1. Protection & Assurance du véhicule"
        subtitle="Définissez le niveau de couverture en cas d'accident ou de dommages"
      >
        <div className="space-y-3">
          <p className="text-[12px] font-black text-slate-700 uppercase tracking-wider">Choix de la formule d'assurance</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INSURANCE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={selectedAssurance === opt.value}
                onClick={() => setValue("assurance", opt.value)}
                title={opt.title}
                subtitle={opt.desc}
                badge={opt.badge}
                icon={Shield}
              />
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[12px] font-medium text-slate-600 flex items-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {selectedAssurance === "Incluse (tous risques)"
                ? "En cas de sinistre, le locataire s'acquitte uniquement de la franchise assurance."
                : "En cas d'incident, un contrat de constat contradictoire est établi au départ et au retour."}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ━━━ Section 2: Exigences Locataire & Zone ━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={UserCheck}
        title="2. Exigences locataire & Zone"
        subtitle="Critères d'accès et rayon de circulation autorisé"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Âge minimum du locataire" icon={UserCheck}>
            <div className="relative">
              <input
                type="number"
                {...register("ageMinimum", { min: 18, max: 99, valueAsNumber: true })}
                placeholder="21"
                className={INPUT_CLASS}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-400">ANS</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Âge légal minimum au Sénégal : 18 ans.</p>
          </FormField>

          {/* Zone de conduite */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Zone de circulation</label>
            {isHorsDakarEnabledInStep2 ? (
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center gap-3">
                <MapPinned className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[13px] font-black text-emerald-950">Hors Dakar Autorisé</p>
                  <p className="text-[11px] font-medium text-emerald-700">
                    Option activée à l'étape précédente (+{supplementHorsDakar ? new Intl.NumberFormat("fr-FR").format(supplementHorsDakar) : "0"} FCFA/j).
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {ZONES.map((z) => (
                  <button
                    key={z.value}
                    type="button"
                    onClick={() => setValue("zoneConduite", z.value)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-center justify-between",
                      selectedZone === z.value
                        ? "border-emerald-500 bg-emerald-50/50 font-black text-slate-900 ring-1 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                    )}
                  >
                    <span className="text-[13px]">{z.value}</span>
                    {selectedZone === z.value && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ━━━ Section 3: Carburant & Consignes ━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Fuel}
        title="3. Politique Carburant & Règles"
        subtitle="Précisez les conditions de restitution du carburant"
      >
        <div className="space-y-4">
          <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider">Politique de carburant</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FUEL_CONDITIONS.map((f) => (
              <OptionCard
                key={f.value}
                selected={selectedFuel === f.value}
                onClick={() => setValue("carburantCondition", f.value)}
                title={`${f.icon} ${f.value}`}
                subtitle={f.desc}
              />
            ))}
          </div>

          <div className="pt-3">
            <FormField label="Règles spécifiques & Consignes d'utilisation" icon={FileText}>
              <textarea
                {...register("reglesSpecifiques")}
                rows={3}
                placeholder="Ex: Voiture non-fumeur, merci de ne pas consommer de nourriture à l'intérieur..."
                className="w-full rounded-xl border-2 border-slate-200/90 bg-white p-3.5 text-[15px] font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-emerald-500 transition-all resize-none shadow-sm"
              />
            </FormField>

            {/* Quick rule tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] font-bold text-slate-400 py-1">Ajouter un tag :</span>
              {QUICK_RULES.map((rule) => (
                <button
                  key={rule}
                  type="button"
                  onClick={() => addQuickRule(rule)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  + {rule}
                </button>
              ))}
            </div>
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
          Continuer — Studio Photos
          <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
