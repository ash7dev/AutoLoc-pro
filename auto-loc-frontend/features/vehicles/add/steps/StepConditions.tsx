"use client";

import { useForm } from "react-hook-form";
import {
  ArrowLeft, ArrowRight, Shield, MapPinned, UserCheck, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step3Data } from "../store";

const ZONES = [
  { value: "Dakar uniquement", icon: "🏙️" },
  { value: "Grande Dakar (Rufisque inclus)", icon: "🗺️" },
  { value: "Toutes régions du Sénégal", icon: "🇸🇳" },
  { value: "Sénégal + Gambie", icon: "🌍" },
  { value: "Pas de restriction", icon: "✈️" },
];

const ASSURANCES = [
  { value: "Incluse (tous risques)", icon: "🛡️", desc: "Protection maximale" },
  { value: "Responsabilité civile uniquement", icon: "⚖️", desc: "Couverture de base" },
  { value: "Locataire responsable", icon: "📋", desc: "Le locataire gère" },
];

const INPUT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15";

const SELECT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-900 outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15";

const LABEL_CLASS = "text-[12px] font-bold text-slate-700 uppercase tracking-wide";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepConditions({ onNext, onBack }: Props) {
  const { step3, setStep3 } = useAddVehicleStore();

  const { register, handleSubmit, watch } = useForm<Step3Data>({
    defaultValues: step3 ?? { ageMinimum: 21 },
  });

  const selectedZone = watch("zoneConduite");
  const selectedAssurance = watch("assurance");

  const onSubmit = (data: Step3Data) => {
    setStep3(data);
    onNext();
  };

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
      <SectionCard icon={MapPinned} title="Zone de conduite" subtitle="Où le locataire pourra circuler">
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
                <span className="text-lg">{z.icon}</span>
                <span className={cn("text-[12px] font-bold", active ? "text-emerald-700" : "text-slate-600")}>
                  {z.value}
                </span>
              </label>
            );
          })}
        </div>
      </SectionCard>

      {/* ━━━ Section: Assurance ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard icon={Shield} title="Couverture assurance" subtitle="Niveau de protection pour le locataire">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ASSURANCES.map((a) => {
            const active = selectedAssurance === a.value;
            return (
              <label
                key={a.value}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-4 rounded-xl border cursor-pointer transition-all duration-200 text-center",
                  active
                    ? "border-emerald-400 bg-emerald-50 shadow-sm ring-1 ring-emerald-400/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <input type="radio" value={a.value} {...register("assurance")} className="sr-only" />
                <span className="text-2xl">{a.icon}</span>
                <span className={cn("text-[12px] font-bold leading-tight", active ? "text-emerald-700" : "text-slate-700")}>
                  {a.value}
                </span>
                <span className={cn("text-[10px] font-medium", active ? "text-emerald-500" : "text-slate-400")}>
                  {a.desc}
                </span>
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
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-900 placeholder-slate-300 outline-none resize-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
        />
      </SectionCard>

      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Retour
        </button>
        <button type="submit"
          className="group flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
          Suivant — Photos
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
function SectionCard({ icon: Icon, title, subtitle, badge, children }: {
  icon: React.ElementType; title: string; subtitle: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <span className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-emerald-400" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-slate-900 tracking-tight">{title}</p>
            {badge && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{badge}</span>}
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FormField({ label, icon: Icon, children }: {
  label: string; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-slate-400" strokeWidth={2} />}
        <label className={LABEL_CLASS}>{label}</label>
      </div>
      {children}
    </div>
  );
}
