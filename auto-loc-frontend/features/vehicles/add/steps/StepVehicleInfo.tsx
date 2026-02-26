"use client";

import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddVehicleStore, Step1Data, VehicleType, FuelType, TransmissionType } from "../store";

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "BERLINE",    label: "Berline"    },
  { value: "SUV",        label: "SUV"        },
  { value: "CITADINE",   label: "Citadine"   },
  { value: "4X4",        label: "4x4"        },
  { value: "PICKUP",     label: "Pick-up"    },
  { value: "MONOSPACE",  label: "Monospace"  },
  { value: "MINIBUS",    label: "Minibus"    },
  { value: "UTILITAIRE", label: "Utilitaire" },
  { value: "LUXE",       label: "Luxe"       },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "ESSENCE",     label: "Essence" },
  { value: "DIESEL",      label: "Diesel" },
  { value: "HYBRIDE",     label: "Hybride" },
  { value: "ELECTRIQUE",  label: "Électrique" },
];

const TRANSMISSIONS: { value: TransmissionType; label: string }[] = [
  { value: "MANUELLE",    label: "Manuelle" },
  { value: "AUTOMATIQUE", label: "Automatique" },
];

const ZONES_DAKAR = [
  { value: "almadies-ngor-mamelles",     label: "Almadies – Ngor – Mamelles"               },
  { value: "ouakam-yoff",                label: "Ouakam – Yoff"                            },
  { value: "mermoz-sacrecoeur-ckg",      label: "Mermoz – Sacré-Cœur – Cité Keur Gorgui"  },
  { value: "plateau-medina-gueuletapee", label: "Plateau – Médina – Gueule Tapée"          },
  { value: "liberte-sicap-granddakar",   label: "Liberté – Sicap – Grand Dakar"            },
  { value: "parcelles-grandyoff",        label: "Parcelles Assainies – Grand Yoff"         },
  { value: "pikine-guediawaye",          label: "Pikine – Guédiawaye"                      },
  { value: "keurmassar-rufisque",        label: "Keur Massar – Rufisque"                   },
];

interface Props {
  nextStep?: () => void;
}

export function StepVehicleInfo({ nextStep }: Props) {
  const { step1, setStep1 } = useAddVehicleStore();

  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    defaultValues: step1 ?? {
      annee: new Date().getFullYear(),
      type: "BERLINE",
    },
  });

  const onSubmit = (data: Step1Data) => {
    setStep1(data);
    nextStep?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Informations du véhicule</h3>
        <p className="text-sm text-muted-foreground mt-1">Les détails de base de votre véhicule.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Marque */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Marque *</label>
          <input
            {...register("marque", { required: "Requis" })}
            placeholder="Toyota, BMW…"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.marque && <p className="text-xs text-destructive">{errors.marque.message}</p>}
        </div>

        {/* Modèle */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Modèle *</label>
          <input
            {...register("modele", { required: "Requis" })}
            placeholder="Corolla, X5…"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.modele && <p className="text-xs text-destructive">{errors.modele.message}</p>}
        </div>

        {/* Année */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Année *</label>
          <input
            type="number"
            {...register("annee", { required: "Requis", min: 1990, max: new Date().getFullYear() + 1, valueAsNumber: true })}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.annee && <p className="text-xs text-destructive">Année invalide</p>}
        </div>

        {/* Immatriculation */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Immatriculation *</label>
          <input
            {...register("immatriculation", { required: "Requis" })}
            placeholder="DK 1234 AB"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.immatriculation && <p className="text-xs text-destructive">{errors.immatriculation.message}</p>}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Type de véhicule *</label>
          <select
            {...register("type", { required: true })}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Nombre de places */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre de places</label>
          <input
            type="number"
            {...register("nombrePlaces", { min: 1, max: 50, valueAsNumber: true })}
            placeholder="5"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Carburant */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Carburant</label>
          <select
            {...register("carburant")}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Sélectionner —</option>
            {FUEL_TYPES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Transmission</label>
          <select
            {...register("transmission")}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Sélectionner —</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Ville */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Zone / Ville *</label>
          <select
            {...register("ville", { required: "Requis" })}
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sélectionner une zone</option>
            {ZONES_DAKAR.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.ville && <p className="text-xs text-destructive">{errors.ville.message}</p>}
        </div>

        {/* Adresse */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Adresse de récupération *</label>
          <input
            {...register("adresse", { required: "Requis" })}
            placeholder="Rue, quartier…"
            className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {errors.adresse && <p className="text-xs text-destructive">{errors.adresse.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="gap-2 bg-black text-white hover:bg-black/90 h-10">
          Suivant — Prix
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
