"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Info, Truck,
  Banknote, CalendarDays, TrendingDown, Zap, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step2Data } from "../store";

/* ── Shared premium constants ──────────────────────────────────── */
const INPUT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15";

const LABEL_CLASS = "text-[12px] font-bold text-slate-700 uppercase tracking-wide";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPricing({ onNext, onBack }: Props) {
  const { step2, setStep2 } = useAddVehicleStore();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step2Data>({
    defaultValues: step2 ?? {
      prixParJour: undefined,
      joursMinimum: 1,
      tiers: [],
      fraisLivraison: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });
  const tiers = watch("tiers");

  const onSubmit = (data: Step2Data) => {
    setStep2(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* ━━━ Section: Prix de base ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Banknote}
        title="Prix de base"
        subtitle="Votre tarif journalier et la durée minimum"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Prix par jour (FCFA)" required error={errors.prixParJour ? "Montant invalide (min. 1 000)" : undefined}>
            <div className="relative">
              <input
                type="number"
                {...register("prixParJour", { required: "Requis", min: 1000, valueAsNumber: true })}
                placeholder="25 000"
                className={cn(INPUT_CLASS, "pr-16")}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 uppercase">FCFA</span>
            </div>
          </FormField>

          <FormField label="Durée minimum (jours)" icon={CalendarDays}>
            <input
              type="number"
              {...register("joursMinimum", { min: 1, valueAsNumber: true })}
              placeholder="1"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ━━━ Section: Tarification progressive ━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={TrendingDown}
        title="Tarifs dégressifs"
        subtitle="Attirez plus de réservations longue durée"
        badge="Optionnel"
      >
        {/* Add tier button */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => append({ joursMin: (tiers?.length ?? 0) * 3 + 1, prix: 0 })}
            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-3 w-3" strokeWidth={3} />
            Ajouter un palier
          </button>
        </div>

        {fields.length > 0 ? (
          <div className="space-y-3 sm:space-y-0 sm:rounded-xl sm:border sm:border-slate-200 sm:overflow-hidden">
            {/* Header — desktop only */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_40px] gap-3 bg-slate-50 px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>À partir de (jours)</span>
              <span>Jusqu&apos;à (jours)</span>
              <span>Prix/jour (FCFA)</span>
              <span />
            </div>

            {fields.map((field, i) => (
              <div key={field.id}>
                {/* Mobile : carte par palier */}
                <div className="sm:hidden rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Palier {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">À partir de (jours)</label>
                      <input
                        type="number"
                        {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                        placeholder="1"
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Jusqu&apos;à (jours)</label>
                      <input
                        type="number"
                        {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                        placeholder="∞"
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Prix/jour (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                        placeholder="20 000"
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-14 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Desktop : ligne de tableau */}
                <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center px-4 py-3 border-t border-slate-100">
                  <input
                    type="number"
                    {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                    placeholder="1"
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                  />
                  <input
                    type="number"
                    {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                    placeholder="∞"
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                  />
                  <input
                    type="number"
                    {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                    placeholder="20 000"
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                  />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Info className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
            </span>
            <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
              Ex : 1–4 jours → 25 000 FCFA/j, 5+ jours → 20 000 FCFA/j.
              Attirez plus de réservations longue durée avec un tarif dégressif.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ━━━ Section: Livraison ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Truck}
        title="Livraison du véhicule"
        subtitle="Le locataire pourra se faire livrer le véhicule"
        badge="Optionnel"
      >
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 mb-4">
          <Truck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-[12px] font-bold text-emerald-700">Proposer la livraison ?</p>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
              Le locataire choisira cette option lors de la réservation. Les frais seront ajoutés automatiquement au total.
            </p>
          </div>
        </div>

        <FormField label="Frais de livraison (FCFA)">
          <div className="relative">
            <input
              id="fraisLivraisonInput"
              type="number"
              {...register("fraisLivraison", { min: 0, valueAsNumber: true })}
              placeholder="Ex : 5 000 — laisser vide si pas de livraison"
              className={cn(INPUT_CLASS, "pr-16")}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 uppercase">FCFA</span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-1.5">
            Laissez vide ou à 0 si vous ne proposez pas la livraison.
          </p>
        </FormField>
      </SectionCard>

      {/* ━━━ Section: Hors Dakar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={MapPin}
        title="Voyages Hors Dakar"
        subtitle="Autorisez les locataires à sortir de la région de Dakar"
        badge="Optionnel"
      >
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 mb-4">
          <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-[12px] font-bold text-emerald-700">Autoriser ce véhicule à sortir de la région de Dakar ?</p>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
              Le locataire choisira cette option s'il prévoit de voyager hors de Dakar. Le supplément sera appliqué par jour.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register("autoriseHorsDakar")}
                className="peer sr-only"
              />
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
            <span className="text-[13px] font-bold text-slate-700">
              Activer l'option Hors Dakar
            </span>
          </label>

          {watch("autoriseHorsDakar") && (
            <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <FormField label="Supplément par jour (FCFA)">
                <div className="relative">
                  <input
                    type="number"
                    {...register("supplementHorsDakarParJour", { min: 0, valueAsNumber: true })}
                    placeholder="Ex : 5 000"
                    className={cn(INPUT_CLASS, "pr-16")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 uppercase">FCFA</span>
                </div>
              </FormField>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ━━━ Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Retour
        </button>
        <button
          type="submit"
          className="group flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        >
          Suivant — Conditions
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Shared UI primitives
═══════════════════════════════════════════════════════════════════ */

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
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
            {badge && (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{badge}</span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-slate-400" strokeWidth={2} />}
        <label className={LABEL_CLASS}>
          {label}
          {required && <span className="text-emerald-500 ml-0.5">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center text-[8px]">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
