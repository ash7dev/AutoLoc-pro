"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ArrowRight, Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddVehicleStore, Step2Data, PriceTier } from "../store";

interface Props {
  nextStep?: () => void;
  previousStep?: () => void;
}

export function StepPricing({ nextStep, previousStep }: Props) {
  const { step2, setStep2 } = useAddVehicleStore();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<Step2Data>({
    defaultValues: step2 ?? {
      prixParJour: undefined,
      joursMinimum: 1,
      tiers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });
  const tiers = watch("tiers");

  const onSubmit = (data: Step2Data) => {
    setStep2(data);
    nextStep?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Tarification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez votre prix de base et des paliers progressifs optionnels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Prix de base */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Prix par jour (FCFA) *</label>
          <input
            type="number"
            {...register("prixParJour", { required: "Requis", min: 1000, valueAsNumber: true })}
            placeholder="25 000"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.prixParJour && <p className="text-xs text-destructive">Montant invalide (min. 1 000)</p>}
        </div>

        {/* Minimum de jours */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Durée minimum (jours)</label>
          <input
            type="number"
            {...register("joursMinimum", { min: 1, valueAsNumber: true })}
            placeholder="1"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Tarification progressive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Tarification progressive</span>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Optionnel</span>
          </div>
          <button
            type="button"
            onClick={() => append({ joursMin: (tiers?.length ?? 0) * 3 + 1, prix: 0 })}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un palier
          </button>
        </div>

        {fields.length > 0 && (
          <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>À partir de (j)</span>
              <span>Jusqu'à (j)</span>
              <span>Prix/j (FCFA)</span>
              <span />
            </div>

            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center px-4 py-3 border-t border-[hsl(var(--border))] first:border-0">
                <input
                  type="number"
                  {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                  placeholder="1"
                  className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                  placeholder="∞"
                  className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                  placeholder="20 000"
                  className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {fields.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-4">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ex : 1–4 jours → 25 000 FCFA/j, 5+ jours → 20 000 FCFA/j.
              Attirez plus de réservations longue durée avec un tarif dégressif.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={previousStep} className="gap-2 h-10">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button type="submit" className="gap-2 bg-black text-white hover:bg-black/90 h-10">
          Suivant — Conditions
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
