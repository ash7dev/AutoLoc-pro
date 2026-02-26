"use client";

import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddVehicleStore, Step3Data } from "../store";

const ZONES = [
  "Dakar uniquement",
  "Grande Dakar (Rufisque inclus)",
  "Toutes régions du Sénégal",
  "Sénégal + Gambie",
  "Pas de restriction",
];

const ASSURANCES = [
  "Incluse (tous risques)",
  "Responsabilité civile uniquement",
  "Locataire responsable",
];

interface Props {
  nextStep?: () => void;
  previousStep?: () => void;
}

export function StepConditions({ nextStep, previousStep }: Props) {
  const { step3, setStep3 } = useAddVehicleStore();

  const { register, handleSubmit } = useForm<Step3Data>({
    defaultValues: step3 ?? { ageMinimum: 21 },
  });

  const onSubmit = (data: Step3Data) => {
    setStep3(data);
    nextStep?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Conditions de location</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez vos exigences pour les locataires.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Âge minimum */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Âge minimum du locataire</label>
          <input
            type="number"
            {...register("ageMinimum", { min: 18, max: 99, valueAsNumber: true })}
            placeholder="21"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <p className="text-xs text-muted-foreground">Minimum légal : 18 ans</p>
        </div>

        {/* Zone de conduite */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Zone de conduite autorisée</label>
          <select
            {...register("zoneConduite")}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Sélectionner —</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Assurance */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Couverture assurance</label>
          <select
            {...register("assurance")}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Sélectionner —</option>
            {ASSURANCES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Règles spécifiques */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Règles & remarques spécifiques</label>
        <textarea
          {...register("reglesSpecifiques")}
          rows={3}
          placeholder="Ex : Non-fumeur, pas d'animaux, restitution avec plein…"
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={previousStep} className="gap-2 h-10">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button type="submit" className="gap-2 bg-black text-white hover:bg-black/90 h-10">
          Suivant — Photos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
