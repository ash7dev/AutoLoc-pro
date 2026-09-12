"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowRight, Car, MapPin, Settings2, Fuel,
  CheckCircle2, Sparkles,
  Navigation, Thermometer, Bluetooth, Camera, Baby,
  PanelTop, ScanLine, Gauge, Smartphone, Flame, ScanFace,
  LucideIcon, Check, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddVehicleStore, Step1Data, VehicleType, FuelType, TransmissionType } from "../store";
import { SectionCard, FormField, INPUT_CLASS, SELECT_CLASS, LABEL_CLASS } from "@/features/vehicles/components/VehicleFormPrimitives";

interface VehicleTypeOption {
  value: VehicleType;
  label: string;
  desc: string;
  icon: string;
}

const VEHICLE_TYPES: VehicleTypeOption[] = [
  { value: "CITADINE", label: "Citadine", desc: "Compacte & urbaine", icon: "🚗" },
  { value: "BERLINE", label: "Berline", desc: "Confort & élégance", icon: "🚘" },
  { value: "SUV", label: "SUV", desc: "Polyvalent & surélevé", icon: "🚙" },
  { value: "PICKUP", label: "Pick-up", desc: "Robuste & tout-terrain", icon: "🛻" },
  { value: "FOUR_X_FOUR", label: "4x4", desc: "Franchissement & piste", icon: "⛰️" },
  { value: "MINIVAN", label: "Minivan", desc: "Voyage en famille", icon: "🚐" },
  { value: "MONOSPACE", label: "Monospace", desc: "7 places modulable", icon: "🚐" },
  { value: "MINIBUS", label: "Minibus", desc: "Transport de groupe", icon: "🚌" },
  { value: "UTILITAIRE", label: "Utilitaire", desc: "Déménagement & fret", icon: "🚚" },
  { value: "LUXE", label: "Luxe & Prestige", desc: "Haut de gamme", icon: "✨" },
];

const POPULAR_BRANDS = ["Toyota", "Hyundai", "Peugeot", "Mercedes-Benz", "BMW", "Nissan", "Ford", "Mitsubishi", "Kia"];

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

interface EquipmentItem {
  value: string;
  label: string;
  category: "Confort" | "Sécurité" | "Tech" | "Famille";
  Icon: LucideIcon;
}

const EQUIPMENTS: EquipmentItem[] = [
  { value: "GPS", label: "GPS Nav", category: "Tech", Icon: Navigation },
  { value: "CLIMATISATION", label: "Climatisation", category: "Confort", Icon: Thermometer },
  { value: "BLUETOOTH", label: "Bluetooth Audio", category: "Tech", Icon: Bluetooth },
  { value: "CAMERA_RECUL", label: "Caméra de recul", category: "Sécurité", Icon: Camera },
  { value: "CAMERA_360", label: "Caméra 360°", category: "Sécurité", Icon: ScanFace },
  { value: "SIEGE_ENFANT", label: "Siège bébé / enfant", category: "Famille", Icon: Baby },
  { value: "SIEGE_CHAUFFANT", label: "Sièges chauffants", category: "Confort", Icon: Flame },
  { value: "TOIT_OUVRANT", label: "Toit panoramique", category: "Confort", Icon: PanelTop },
  { value: "RADAR_STATIONNEMENT", label: "Radar de recul", category: "Sécurité", Icon: ScanLine },
  { value: "REGULATEUR_VITESSE", label: "Régulateur vitesse", category: "Confort", Icon: Gauge },
  { value: "CARPLAY", label: "Apple CarPlay / Android", category: "Tech", Icon: Smartphone },
];

const ZONES_DAKAR = [
  { value: "almadies-ngor-mamelles", label: "Almadies – Ngor – Mamelles" },
  { value: "ouakam-yoff", label: "Ouakam – Yoff – Aéroport anciens" },
  { value: "mermoz-sacrecoeur-ckg", label: "Mermoz – Sacré-Cœur – Cité Keur Gorgui" },
  { value: "plateau-medina-gueuletapee", label: "Plateau – Médina – Gueule Tapée" },
  { value: "liberte-sicap-granddakar", label: "Liberté – Sicap – Grand Dakar" },
  { value: "parcelles-grandyoff", label: "Parcelles Assainies – Grand Yoff" },
  { value: "pikine-guediawaye", label: "Pikine – Guédiawaye" },
  { value: "keurmassar-rufisque", label: "Keur Massar – Rufisque – Diamniadio" },
];

interface Props {
  onNext: () => void;
}

export function StepVehicleInfo({ onNext }: Props) {
  const { step1, setStep1 } = useAddVehicleStore();
  const [equipements, setEquipements] = useState<string[]>(step1?.equipements ?? []);
  const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>(
    step1?.types ?? (step1?.type ? [step1.type] : ["BERLINE"])
  );
  const [typeError, setTypeError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step1Data>({
    defaultValues: step1 ?? {
      annee: new Date().getFullYear(),
      equipements: [],
      marque: "",
      modele: "",
    },
  });

  const selectedMarque = watch("marque");

  const toggleType = (value: VehicleType) => {
    setTypeError(null);
    if (selectedTypes.includes(value)) {
      if (selectedTypes.length === 1) {
        setTypeError("Sélectionnez au moins 1 type de véhicule.");
        return;
      }
      setSelectedTypes((prev) => prev.filter((t) => t !== value));
    } else {
      if (selectedTypes.length >= 3) {
        setTypeError("Vous pouvez sélectionner 3 types au maximum.");
        return;
      }
      setSelectedTypes((prev) => [...prev, value]);
    }
  };

  const toggleEquipment = (value: string) => {
    setEquipements((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );
  };

  const onSubmit = (data: Step1Data) => {
    if (selectedTypes.length === 0) {
      setTypeError("Sélectionnez au moins 1 type de véhicule.");
      return;
    }
    setStep1({
      ...data,
      types: selectedTypes,
      type: selectedTypes[0],
      equipements,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">

      {/* ━━━ Section 1: Identité du véhicule ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Car}
        title="1. Identité du véhicule"
        subtitle="Renseignez les informations officielles de la carte grise"
      >
        <div className="space-y-5">
          {/* Quick Marque Chips */}
          <div>
            <label className={LABEL_CLASS}>Sélection rapide de marque</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {POPULAR_BRANDS.map((brand) => {
                const isSelected = selectedMarque?.toLowerCase() === brand.toLowerCase();
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setValue("marque", brand, { shouldValidate: true })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all duration-200",
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Marque" required error={errors.marque?.message}>
              <input
                {...register("marque", {
                  required: "Veuillez entrer la marque",
                  pattern: { value: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/, message: "Caractères spéciaux interdits" },
                  minLength: { value: 2, message: "Au moins 2 caractères" }
                })}
                placeholder="Ex: Toyota, BMW, Hyundai..."
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Modèle" required error={errors.modele?.message}>
              <input
                {...register("modele", {
                  required: "Veuillez entrer le modèle",
                  pattern: { value: /^[a-zA-ZÀ-ÿ0-9\s\-]+$/, message: "Caractères spéciaux interdits" },
                  minLength: { value: 2, message: "Au moins 2 caractères" }
                })}
                placeholder="Ex: RAV4, Tucson, Prado..."
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Année de mise en circulation" required error={errors.annee ? "Année invalide (1990 - 2026)" : undefined}>
              <input
                type="number"
                {...register("annee", { required: "Requis", min: 1990, max: new Date().getFullYear() + 1, valueAsNumber: true })}
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Numéro d'immatriculation" required error={errors.immatriculation?.message}>
              <input
                {...register("immatriculation", {
                  required: "L'immatriculation est obligatoire",
                  pattern: { value: /^[a-zA-Z0-9\s\-]+$/, message: "Format invalide (Ex: DK 1234 AB)" },
                  minLength: { value: 4, message: "Immatriculation trop courte" }
                })}
                placeholder="Ex: DK 1234 AB"
                className={cn(INPUT_CLASS, "font-mono uppercase tracking-wider text-[16px]")}
              />
            </FormField>

            <FormField label="Nombre de places assises">
              <input
                type="number"
                {...register("nombrePlaces", { min: 1, max: 50, valueAsNumber: true })}
                placeholder="Ex: 5"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      {/* ━━━ Section 2: Catégorie & Motorisation ━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Settings2}
        title="2. Catégorie & Motorisation"
        subtitle="Définissez le profil et la transmission de votre voiture"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className={cn(LABEL_CLASS)}>
              Catégorie de véhicule <span className="text-emerald-500 font-bold">*</span>
            </p>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              {selectedTypes.length} / 3 sélectionné{selectedTypes.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {VEHICLE_TYPES.map((t) => {
              const active = selectedTypes.includes(t.value);
              return (
                <div
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-center",
                    active
                      ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span className={cn("text-[13px] font-black tracking-tight", active ? "text-emerald-950" : "text-slate-800")}>
                    {t.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                    {t.desc}
                  </span>

                  {active && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {typeError && (
            <p className="text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              {typeError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
            <FormField label="Type de carburant" icon={Fuel}>
              <select {...register("carburant")} className={SELECT_CLASS}>
                <option value="">— Sélectionner le carburant —</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Boîte de vitesse" icon={Settings2}>
              <select {...register("transmission")} className={SELECT_CLASS}>
                <option value="">— Sélectionner la transmission —</option>
                {TRANSMISSIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </SectionCard>

      {/* ━━━ Section 3: Localisation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={MapPin}
        title="3. Localisation & Récupération"
        subtitle="Indiquez le lieu exact où le locataire récupèrera la clé"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Zone / Secteur à Dakar" required error={errors.ville?.message}>
            <select {...register("ville", { required: "Veuillez choisir une zone" })} className={SELECT_CLASS}>
              <option value="">— Choisir la zone —</option>
              {ZONES_DAKAR.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Adresse ou repère précis" required error={errors.adresse?.message}>
            <input
              {...register("adresse", {
                required: "L'adresse est obligatoire",
                minLength: { value: 5, message: "L'adresse doit être plus précise" }
              })}
              placeholder="Ex: Rue de la Résidence, près de la Brioche Dorée"
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ━━━ Section 4: Équipements ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionCard
        icon={Sparkles}
        title="4. Équipements & Options"
        subtitle="Plus votre voiture est équipée, plus elle se loue cher et rapidement"
        badge={
          equipements.length > 0 ? (
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              {equipements.length} sélectionné{equipements.length > 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EQUIPMENTS.map((eq) => {
            const active = equipements.includes(eq.value);
            return (
              <button
                key={eq.value}
                type="button"
                onClick={() => toggleEquipment(eq.value)}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 select-none",
                  active
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-black shadow-sm ring-1 ring-emerald-400/30"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium",
                )}
              >
                <eq.Icon
                  className={cn("w-4 h-4 shrink-0", active ? "text-emerald-600 stroke-[2.5]" : "text-slate-400")}
                />
                <span className="text-[13px] leading-tight flex-1 truncate">{eq.label}</span>
                {active && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ━━━ Action Navigation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-black px-8 py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Continuer — Tarification & Rendement
          <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
}
