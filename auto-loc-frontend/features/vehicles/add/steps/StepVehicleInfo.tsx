"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowRight, Car, MapPin, Settings2, Fuel,
  CheckCircle2, Sparkles,
  Navigation, Thermometer, Bluetooth, Camera, Baby,
  PanelTop, ScanLine, Gauge, Smartphone, Flame, ScanFace,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step1Data, VehicleType, FuelType, TransmissionType } from "../store";

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "CITADINE", label: "Citadine" },
  { value: "BERLINE", label: "Berline" },
  { value: "SUV", label: "SUV" },
  { value: "PICKUP", label: "Pick-up" },
  { value: "MINIVAN", label: "Minivan" },
  { value: "MONOSPACE", label: "Monospace" },
  { value: "MINIBUS", label: "Minibus" },
  { value: "UTILITAIRE", label: "Utilitaire" },
  { value: "LUXE", label: "Luxe" },
  { value: "FOUR_X_FOUR", label: "4x4" },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "ESSENCE", label: "Essence" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRIDE", label: "Hybride" },
  { value: "ELECTRIQUE", label: "Électrique" },
];

const TRANSMISSIONS: { value: TransmissionType; label: string }[] = [
  { value: "MANUELLE", label: "Manuelle" },
  { value: "AUTOMATIQUE", label: "Automatique" },
];

const EQUIPMENTS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "GPS", label: "GPS", Icon: Navigation },
  { value: "CLIMATISATION", label: "Climatisation", Icon: Thermometer },
  { value: "BLUETOOTH", label: "Bluetooth", Icon: Bluetooth },
  { value: "CAMERA_RECUL", label: "Caméra de recul", Icon: Camera },
  { value: "CAMERA_360", label: "Caméra 360°", Icon: ScanFace },
  { value: "SIEGE_ENFANT", label: "Siège enfant", Icon: Baby },
  { value: "SIEGE_CHAUFFANT", label: "Siège chauffant", Icon: Flame },
  { value: "TOIT_OUVRANT", label: "Toit ouvrant", Icon: PanelTop },
  { value: "RADAR_STATIONNEMENT", label: "Radar stationnement", Icon: ScanLine },
  { value: "REGULATEUR_VITESSE", label: "Rég. de vitesse", Icon: Gauge },
  { value: "CARPLAY", label: "CarPlay / Android Auto", Icon: Smartphone },
];

const ZONES_DAKAR = [
  { value: "almadies-ngor-mamelles", label: "Almadies – Ngor – Mamelles" },
  { value: "ouakam-yoff", label: "Ouakam – Yoff" },
  { value: "mermoz-sacrecoeur-ckg", label: "Mermoz – Sacré-Cœur – Cité Keur Gorgui" },
  { value: "plateau-medina-gueuletapee", label: "Plateau – Médina – Gueule Tapée" },
  { value: "liberte-sicap-granddakar", label: "Liberté – Sicap – Grand Dakar" },
  { value: "parcelles-grandyoff", label: "Parcelles Assainies – Grand Yoff" },
  { value: "pikine-guediawaye", label: "Pikine – Guédiawaye" },
  { value: "keurmassar-rufisque", label: "Keur Massar – Rufisque" },
];

import { SectionCard, FormField, INPUT_CLASS, SELECT_CLASS, LABEL_CLASS } from "@/features/vehicles/components/VehicleFormPrimitives";

interface Props {
  onNext: () => void;
}

export function StepVehicleInfo({ onNext }: Props) {
  const { step1, setStep1 } = useAddVehicleStore();
  const [equipements, setEquipements] = useState<string[]>(step1?.equipements ?? []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1Data>({
    defaultValues: step1 ?? {
      annee: new Date().getFullYear(),
      type: "BERLINE",
      equipements: [],
    },
  });

  const selectedType = watch("type");

  const toggleEquipment = (value: string) => {
    setEquipements((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );
  };

  const onSubmit = (data: Step1Data) => {
    setStep1({ ...data, equipements });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* ━━━ Section: Identité du véhicule ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Car}
        title="Identité du véhicule"
        subtitle="Marque, modèle et informations principales"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Marque" required error={errors.marque?.message}>
            <input
              {...register("marque", {
                required: "Requis",
                pattern: { value: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/, message: "Caractères spéciaux interdits" },
                minLength: { value: 2, message: "Trop court" }
              })}
              placeholder="Toyota, BMW, Peugeot…"
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Modèle" required error={errors.modele?.message}>
            <input
              {...register("modele", {
                required: "Requis",
                pattern: { value: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/, message: "Caractères spéciaux interdits" },
                minLength: { value: 2, message: "Trop court" }
              })}
              placeholder="Corolla, X5, 3008…"
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Année" required error={errors.annee ? "Année invalide" : undefined}>
            <input
              type="number"
              {...register("annee", { required: "Requis", min: 1990, max: new Date().getFullYear() + 1, valueAsNumber: true })}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Immatriculation" required error={errors.immatriculation?.message}>
            <input
              {...register("immatriculation", {
                required: "Requis",
                pattern: { value: /^[a-zA-Z0-9\s\-]+$/, message: "Format invalide (ex: DK 1234 AB)" },
                minLength: { value: 4, message: "Trop court" }
              })}
              placeholder="DK 1234 AB"
              className={cn(INPUT_CLASS, "font-mono uppercase tracking-wider")}
            />
          </FormField>

          <FormField label="Nombre de places">
            <input
              type="number"
              {...register("nombrePlaces", { min: 1, max: 50, valueAsNumber: true })}
              placeholder="5"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ━━━ Section: Type de véhicule ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Settings2}
        title="Type & motorisation"
        subtitle="Catégorie, carburant et transmission"
      >
        {/* Vehicle type chips */}
        <div>
          <p className={cn(LABEL_CLASS, "mb-3")}>Type de véhicule *</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {VEHICLE_TYPES.map((t) => {
              const active = selectedType === t.value;
              return (
                <label
                  key={t.value}
                  className={cn(
                    "flex items-center justify-center px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200",
                    active
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-400/30"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    value={t.value}
                    {...register("type", { required: true })}
                    className="sr-only"
                  />
                  <span className="text-[12px] font-bold">{t.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <FormField label="Carburant" icon={Fuel}>
            <select {...register("carburant")} className={SELECT_CLASS}>
              <option value="">— Sélectionner —</option>
              {FUEL_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Transmission" icon={Settings2}>
            <select {...register("transmission")} className={SELECT_CLASS}>
              <option value="">— Sélectionner —</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </SectionCard>

      {/* ━━━ Section: Localisation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={MapPin}
        title="Localisation"
        subtitle="Où le véhicule sera récupéré"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Zone / Ville" required error={errors.ville?.message}>
            <select {...register("ville", { required: "Requis" })} className={SELECT_CLASS}>
              <option value="">Sélectionner une zone</option>
              {ZONES_DAKAR.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Adresse de récupération" required error={errors.adresse?.message}>
            <input
              {...register("adresse", {
                required: "Requis",
                minLength: { value: 5, message: "L'adresse est trop courte" }
              })}
              placeholder="Rue, quartier…"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ━━━ Section: Équipements ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Sparkles}
        title="Équipements"
        subtitle="Cochez les options disponibles — plus vous en avez, plus votre annonce attire"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EQUIPMENTS.map((eq) => {
            const active = equipements.includes(eq.value);
            return (
              <button
                key={eq.value}
                type="button"
                onClick={() => toggleEquipment(eq.value)}
                className={cn(
                  "flex items-center gap-2 px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-xl border text-left transition-all duration-200",
                  active
                    ? "border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-400/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <eq.Icon
                  className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0", active ? "text-emerald-500" : "text-slate-400")}
                  strokeWidth={2}
                />
                <span className={cn("text-[11px] sm:text-[12px] font-bold leading-tight", active ? "text-emerald-700" : "text-slate-600")}>
                  {eq.label}
                </span>
                {active && (
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 ml-auto flex-shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>

        {equipements.length > 0 && (
          <p className="text-[11px] font-bold text-emerald-600 mt-3 text-center">
            {equipements.length} équipement{equipements.length > 1 ? "s" : ""} sélectionné{equipements.length > 1 ? "s" : ""}
          </p>
        )}
      </SectionCard>

      {/* ━━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="group flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        >
          Suivant — Tarification
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}


