"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Image from "next/image";
import {
  Lock, AlertCircle, Loader2, Save,
  Car, CircleDollarSign, FileText, Camera,
  Plus, Trash2, Info, X, Upload,
  Settings2, GripVertical, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { Vehicle, VehicleType, FuelType, Transmission, VehiclePhoto } from "@/lib/nestjs/vehicles";
import { VEHICLE_PATHS } from "@/lib/nestjs/vehicles";

// ── Constants ──────────────────────────────────────────────────────────────────

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

const TRANSMISSIONS: { value: Transmission; label: string }[] = [
  { value: "MANUELLE", label: "Manuelle" },
  { value: "AUTOMATIQUE", label: "Automatique" },
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

const ZONES = [
  "Dakar uniquement",
  "Hors Dakar autorisé",
];

const ASSURANCES = [
  "Incluse (tous risques)",
  "Responsabilité civile uniquement",
  "Locataire responsable",
];

const EQUIPMENTS = [
  { value: "GPS", label: "GPS" },
  { value: "CLIMATISATION", label: "Climatisation" },
  { value: "BLUETOOTH", label: "Bluetooth" },
  { value: "CAMERA_RECUL", label: "Caméra de recul" },
  { value: "SIEGE_ENFANT", label: "Siège enfant" },
  { value: "TOIT_OUVRANT", label: "Toit ouvrant" },
  { value: "RADAR_STATIONNEMENT", label: "Radar stationnement" },
  { value: "REGULATEUR_VITESSE", label: "Rég. de vitesse" },
];

// ── Form type ──────────────────────────────────────────────────────────────────

interface EditFormData {
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  type: VehicleType;
  nombrePlaces?: number;
  carburant?: string;
  transmission?: string;
  ville: string;
  adresse: string;
  prixParJour: number;
  joursMinimum: number;
  tiers: { joursMin: number; joursMax?: number; prix: number }[];
  ageMinimum?: number;
  zoneConduite?: string;
  assurance?: string;
  carburantCondition?: string;
  reglesSpecifiques?: string;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number;
  fraisLivraison?: number;
}

import { SectionCard, FormField, INPUT_CLASS, SELECT_CLASS, LABEL_CLASS } from "@/features/vehicles/components/VehicleFormPrimitives";

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Vehicle) => void;
}

export function EditVehicleSheet({ vehicle, open, onClose, onSaved }: Props) {
  const { authFetch } = useAuthFetch();

  // Photo state
  const [existingPhotos, setExistingPhotos] = useState<VehiclePhoto[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ file: File; url: string; publicId: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Equipment state
  const [equipements, setEquipements] = useState<string[]>([]);

  const locked = vehicle?.estVerrouille === true;

  // ── Form ────────────────────────────────────────────────────────────────────

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>();

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });
  const tiersWatch = watch("tiers");

  // Pre-fill form whenever the sheet opens or a different vehicle is selected.
  // useEffect is necessary because Radix Sheet only fires onOpenChange for
  // user-initiated close actions — NOT when open changes via external prop.
  useEffect(() => {
    if (!vehicle || !open) return;
    reset({
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: vehicle.annee,
      immatriculation: vehicle.immatriculation,
      type: vehicle.type,
      nombrePlaces: vehicle.nombrePlaces ?? undefined,
      carburant: vehicle.carburant ?? "",
      transmission: vehicle.transmission ?? "",
      ville: vehicle.ville,
      adresse: vehicle.adresse,
      prixParJour: vehicle.prixParJour,
      joursMinimum: vehicle.joursMinimum,
      tiers: vehicle.tarifsProgressifs.map((t) => ({
        joursMin: t.joursMin,
        joursMax: t.joursMax ?? undefined,
        prix: Number(t.prix),
      })),
      ageMinimum: vehicle.ageMinimum,
      zoneConduite: vehicle.zoneConduite ?? "",
      assurance: vehicle.assurance ?? "",
      carburantCondition: vehicle.carburantCondition ?? "",
      reglesSpecifiques: vehicle.reglesSpecifiques ?? "",
      autoriseHorsDakar: vehicle.autoriseHorsDakar ?? false,
      supplementHorsDakarParJour: vehicle.supplementHorsDakarParJour ?? undefined,
    });
    setExistingPhotos([...vehicle.photos]);
    setDeletedPhotoIds([]);
    setNewPhotos([]);
    setError(null);

    // Pre-fill equipements
    const eqs = vehicle.equipements ?? [];
    if (eqs.length > 0) {
      if (typeof eqs[0] === 'string') {
        setEquipements(eqs as string[]);
      } else {
        setEquipements(
          (eqs as { equipement: { nom: string } }[]).map((e) => e.equipement.nom),
        );
      }
    } else {
      setEquipements([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id, open]);

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setError(null);
      setNewPhotos([]);
      setDeletedPhotoIds([]);
    }
  };

  useEffect(() => {
    if (!open) return;
    const originalBody = document.body.style.overflow;
    const originalHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBody;
      document.documentElement.style.overflow = originalHtml;
    };
  }, [open]);

  // ── Photo handlers ──────────────────────────────────────────────────────────

  // Drag & drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Réorganiser les photos existantes
      const newPhotos = [...existingPhotos];
      const [moved] = newPhotos.splice(draggedIndex, 1);
      newPhotos.splice(dragOverIndex, 0, moved);

      // Mettre à jour estPrincipale : seulement la première photo est principale
      const updatedPhotos = newPhotos.map((photo, index) => ({
        ...photo,
        estPrincipale: index === 0
      }));

      setExistingPhotos(updatedPhotos);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveExisting = (photoId: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setDeletedPhotoIds((prev) => [...prev, photoId]);
  };

  const handleRemoveNew = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const allowed = Math.min(files.length, 8 - existingPhotos.length - newPhotos.length);
    const toUpload = files.filter((f) => f.type.startsWith('image/')).slice(0, allowed);
    if (!toUpload.length) return;
    setUploadingPhotos(true);
    setError(null);
    try {
      const sig = await authFetch<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string }>(
        VEHICLE_PATHS.uploadSignature,
      );
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const { uploadToCloudinary } = await import('@/lib/nestjs/vehicles');
          const result = await uploadToCloudinary(file, sig);
          return { file, url: result.url, publicId: result.publicId };
        }),
      );
      setNewPhotos((prev) => [...prev, ...uploaded]);
    } catch {
      setError("Erreur lors de l'upload des photos. Réessayez.");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const toggleEquipment = (value: string) => {
    setEquipements((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: EditFormData) => {
    if (!vehicle || locked) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Déterminer si les champs textes ont changé (Optimisation de bande passante/vitesse)
      const hasChanged = 
        data.marque !== vehicle.marque ||
        data.modele !== vehicle.modele ||
        Number(data.annee) !== vehicle.annee ||
        data.immatriculation !== vehicle.immatriculation ||
        data.type !== vehicle.type ||
        (data.nombrePlaces ? Number(data.nombrePlaces) : undefined) !== (vehicle.nombrePlaces ?? undefined) ||
        (data.carburant || undefined) !== (vehicle.carburant || undefined) ||
        (data.transmission || undefined) !== (vehicle.transmission || undefined) ||
        data.ville !== vehicle.ville ||
        data.adresse !== vehicle.adresse ||
        Number(data.prixParJour) !== vehicle.prixParJour ||
        Number(data.joursMinimum) !== vehicle.joursMinimum ||
        data.ageMinimum !== vehicle.ageMinimum ||
        data.zoneConduite !== vehicle.zoneConduite ||
        data.assurance !== vehicle.assurance ||
        data.carburantCondition !== vehicle.carburantCondition ||
        data.reglesSpecifiques !== vehicle.reglesSpecifiques ||
        data.autoriseHorsDakar !== vehicle.autoriseHorsDakar ||
        data.supplementHorsDakarParJour !== vehicle.supplementHorsDakarParJour ||
        JSON.stringify(equipements.sort()) !== JSON.stringify((vehicle.equipements ?? []).sort()) ||
        JSON.stringify(data.tiers) !== JSON.stringify(vehicle.tarifsProgressifs.map(t => ({ joursMin: t.joursMin, joursMax: t.joursMax ?? undefined, prix: Number(t.prix) })));

      const operations = [];

      // 2. Opération principale : Mise à jour des champs (uniquement si changement)
      if (hasChanged) {
        operations.push(
          authFetch<Vehicle, Record<string, unknown>>(
            VEHICLE_PATHS.update(vehicle.id),
            {
              method: "PATCH",
              body: {
                marque: data.marque,
                modele: data.modele,
                annee: Number(data.annee),
                immatriculation: data.immatriculation,
                type: data.type,
                nombrePlaces: data.nombrePlaces ? Number(data.nombrePlaces) : undefined,
                carburant: data.carburant || undefined,
                transmission: data.transmission || undefined,
                ville: data.ville,
                adresse: data.adresse,
                prixParJour: Number(data.prixParJour),
                joursMinimum: Number(data.joursMinimum),
                tiers: (data.tiers ?? []).map((t) => ({
                  joursMin: Number(t.joursMin),
                  joursMax: t.joursMax ? Number(t.joursMax) : undefined,
                  prix: Number(t.prix),
                })),
                ageMinimum: data.ageMinimum ? Number(data.ageMinimum) : undefined,
                zoneConduite: data.zoneConduite || undefined,
                assurance: data.assurance || undefined,
                carburantCondition: data.carburantCondition || undefined,
                reglesSpecifiques: data.reglesSpecifiques || undefined,
                fraisLivraison: data.fraisLivraison ? Number(data.fraisLivraison) : undefined,
                autoriseHorsDakar: data.autoriseHorsDakar || false,
                supplementHorsDakarParJour: data.supplementHorsDakarParJour ? Number(data.supplementHorsDakarParJour) : undefined,
                equipements,
              },
            }
          )
        );
      } else {
        // Si rien n'a changé, on simule une promesse résolue avec l'objet actuel
        operations.push(Promise.resolve(vehicle));
      }

      // 3. Opérations sur les photos (parallélisées pour la vitesse)
      if (deletedPhotoIds.length > 0) {
        operations.push(
          Promise.all(
            deletedPhotoIds.map((id) => authFetch(VEHICLE_PATHS.deletePhoto(vehicle.id, id), { method: "DELETE" }))
          )
        );
      }

      if (existingPhotos.length > 0) {
        operations.push(
          Promise.all(
            existingPhotos.map((p, i) => 
              authFetch(`/vehicles/${vehicle.id}/photos/${p.id}`, {
                method: 'PATCH',
                body: { position: i, estPrincipale: i === 0 }
              })
            )
          )
        );
      }

      if (newPhotos.length > 0) {
        operations.push(
          Promise.all(
            newPhotos.map((p) => 
              authFetch<VehiclePhoto>(VEHICLE_PATHS.linkPhoto(vehicle.id), {
                method: 'POST',
                body: { url: p.url, publicId: p.publicId } as unknown as undefined
              })
            )
          )
        );
      }

      // 4. Exécution de toutes les tâches en parallèle
      const results = await Promise.all(operations);
      
      // Le premier résultat est toujours l'objet véhicule mis à jour (ou l'original si pas de PATCH)
      const updatedVehicle = results[0] as Vehicle;

      console.log('Vehicle and assets updated successfully');
      onSaved(updatedVehicle);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const totalPhotoCount = existingPhotos.length + newPhotos.length;
  const canAddMore = !locked && totalPhotoCount < 8 && !uploadingPhotos;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[var(--bg-page)] shadow-[0_24px_64px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-foreground px-6 py-4 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">Auto Loc · Propriétaire</p>
            <h2 className="font-black tracking-tight text-base text-white">
              {vehicle ? `${vehicle.marque} ${vehicle.modele}` : "Modifier le véhicule"}
            </h2>
            <p className="text-[11px] font-medium text-white/40">
              {locked
                ? "Ce véhicule est verrouillé — il a une réservation active."
                : "Modifiez les informations, la tarification, les conditions et les photos."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-emerald-300 hover:text-emerald-200 hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-4 overscroll-contain">
          {/* Lock banner */}
          {locked && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-amber-800">Modification impossible</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Ce véhicule est en cours de location ou dispose d&apos;une réservation confirmée.
                  Les modifications seront disponibles une fois la location terminée.
                </p>
              </div>
            </div>
          )}

          <form
            id="edit-vehicle-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* ── Informations ─────────────────────────────────────────── */}
            <SectionCard icon={Car} title="Informations" subtitle="Identité et caractéristiques du véhicule">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Marque" required error={errors.marque?.message}>
                    <input
                      {...register("marque", { required: "Requis" })}
                      disabled={locked}
                      placeholder="Toyota, BMW, Peugeot…"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="Modèle" required error={errors.modele?.message}>
                    <input
                      {...register("modele", { required: "Requis" })}
                      disabled={locked}
                      placeholder="Corolla, X5, 3008…"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="Année" required error={errors.annee ? "Année invalide" : undefined}>
                    <input
                      type="number"
                      {...register("annee", { required: true, min: 1990, max: new Date().getFullYear() + 1, valueAsNumber: true })}
                      disabled={locked}
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="Immatriculation" required error={errors.immatriculation?.message}>
                    <input
                      {...register("immatriculation", { required: "Requis" })}
                      disabled={locked}
                      placeholder="DK 1234 AB"
                      className={cn(INPUT_CLASS, "font-mono uppercase tracking-wider")}
                    />
                  </FormField>

                  <FormField label="Nombre de places">
                    <input
                      type="number"
                      {...register("nombrePlaces", { min: 1, max: 50, valueAsNumber: true })}
                      disabled={locked}
                      placeholder="5"
                      className={INPUT_CLASS}
                    />
                  </FormField>
                </div>

                {/* Type chips */}
                <div>
                  <p className={cn(LABEL_CLASS, "mb-3")}>Type de véhicule <span className="text-emerald-500 ml-0.5">*</span></p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {VEHICLE_TYPES.map((t) => {
                      const active = watch("type") === t.value;
                      return (
                        <label
                          key={t.value}
                          className={cn(
                            "flex items-center justify-center px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200",
                            active
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-400/30"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                            locked && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <input
                            type="radio"
                            value={t.value}
                            {...register("type", { required: true })}
                            disabled={locked}
                            className="sr-only"
                          />
                          <span className="text-[12px] font-bold">{t.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Carburant">
                    <select {...register("carburant")} disabled={locked} className={SELECT_CLASS}>
                      <option value="">— Sélectionner —</option>
                      {FUEL_TYPES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Transmission">
                    <select {...register("transmission")} disabled={locked} className={SELECT_CLASS}>
                      <option value="">— Sélectionner —</option>
                      {TRANSMISSIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Zone / Ville" required error={errors.ville?.message}>
                    <select
                      {...register("ville", { required: "Requis" })}
                      disabled={locked}
                      className={SELECT_CLASS}
                    >
                      <option value="">Sélectionner une zone</option>
                      {ZONES_DAKAR.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Adresse" required error={errors.adresse?.message}>
                    <input
                      {...register("adresse", { required: "Requis" })}
                      disabled={locked}
                      placeholder="Rue, quartier…"
                      className={INPUT_CLASS}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>

            {/* ── Tarification ─────────────────────────────────────────── */}
            <SectionCard icon={CircleDollarSign} title="Tarification" subtitle="Prix de base et règles spécifiques">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Prix / jour (FCFA)"
                    required
                    error={errors.prixParJour ? "Montant invalide (min. 1 000)" : undefined}
                  >
                    <input
                      type="number"
                      {...register("prixParJour", { required: true, min: 1000, valueAsNumber: true })}
                      disabled={locked}
                      placeholder="25 000"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="Durée minimum (jours)">
                    <input
                      type="number"
                      {...register("joursMinimum", { min: 1, valueAsNumber: true })}
                      disabled={locked}
                      placeholder="1"
                      className={INPUT_CLASS}
                    />
                  </FormField>
                </div>

                {/* Hors Dakar */}
                <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoriseHorsDakar"
                      {...register("autoriseHorsDakar")}
                      disabled={locked}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="autoriseHorsDakar" className="text-[13px] font-bold text-slate-700 cursor-pointer">
                      Autoriser les locataires à sortir de la région de Dakar ?
                    </label>
                  </div>
                  {watch("autoriseHorsDakar") && (
                    <div className="pt-2 pl-7">
                      <FormField
                        label="Supplément par jour (FCFA)"
                        error={errors.supplementHorsDakarParJour ? "Montant invalide" : undefined}
                      >
                        <input
                          type="number"
                          {...register("supplementHorsDakarParJour", { min: 0, valueAsNumber: true })}
                          disabled={locked}
                          placeholder="Ex : 5 000"
                          className={INPUT_CLASS}
                        />
                      </FormField>
                    </div>
                  )}
                </div>

                {/* Progressive tiers */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-slate-800 block">Tarification progressive</span>
                      <span className="text-[11px] font-medium text-slate-500">Optionnel — Définissez des réductions pour les longues durées</span>
                    </div>
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => append({ joursMin: (tiersWatch?.length ?? 0) * 3 + 1, prix: 0 })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Ajouter un palier
                      </button>
                    )}
                  </div>

                  {fields.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 bg-slate-50 px-4 py-3 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>À partir de (j)</span>
                        <span>Jusqu&apos;à (j)</span>
                        <span>Prix/j (FCFA)</span>
                        <span />
                      </div>
                      <div className="divide-y divide-slate-100">
                        {fields.map((field, i) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center px-4 py-3 bg-white"
                          >
                            <input
                              type="number"
                              {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                              disabled={locked}
                              placeholder="1"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15 disabled:opacity-50"
                            />
                            <input
                              type="number"
                              {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                              disabled={locked}
                              placeholder="∞"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15 disabled:opacity-50"
                            />
                            <input
                              type="number"
                              {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                              disabled={locked}
                              placeholder="20 000"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15 disabled:opacity-50"
                            />
                            {!locked && (
                              <button
                                type="button"
                                onClick={() => remove(i)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                              </button>
                            )}
                            {locked && <div />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                        Ex : 1–4 j → 25 000 FCFA/j, 5+ j → 20 000 FCFA/j. Attirez plus de longues réservations en ajoutant des paliers de réduction.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ── Conditions ───────────────────────────────────────────── */}
            <SectionCard icon={FileText} title="Conditions" subtitle="Règles et couverture d'assurance">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Âge minimum">
                    <input
                      type="number"
                      {...register("ageMinimum", { min: 18, max: 99, valueAsNumber: true })}
                      disabled={locked}
                      placeholder="21"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="Zone de conduite">
                    <select {...register("zoneConduite")} disabled={locked} className={SELECT_CLASS}>
                      <option value="">— Sélectionner —</option>
                      {ZONES.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Couverture assurance">
                      <select {...register("assurance")} disabled={locked} className={SELECT_CLASS}>
                        <option value="">— Sélectionner —</option>
                        {ASSURANCES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField label="Politique Carburant">
                      <select {...register("carburantCondition")} disabled={locked} className={SELECT_CLASS}>
                        <option value="">— Sélectionner —</option>
                        <option value="Plein à plein">Plein à plein (restitution avec le plein)</option>
                        <option value="Niveau identique">Niveau identique (même niveau qu'au départ)</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField label="Règles spécifiques">
                      <textarea
                        {...register("reglesSpecifiques")}
                        disabled={locked}
                        rows={3}
                        placeholder="Ex : Non-fumeur, pas d'animaux, restitution avec plein…"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[16px] font-medium text-slate-900 placeholder-slate-300 outline-none resize-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Équipements ─────────────────────────────────────────── */}
            <SectionCard icon={Settings2} title="Équipements" subtitle="Sélectionnez les options de votre véhicule">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {EQUIPMENTS.map((eq) => {
                  const active = equipements.includes(eq.value);
                  return (
                    <button
                      key={eq.value}
                      type="button"
                      disabled={locked}
                      onClick={() => toggleEquipment(eq.value)}
                      className={cn(
                        "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-200",
                        active
                          ? "border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-400/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                        locked && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                          active
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}
                      >
                        {active ? (
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[12px] sm:text-[13px] font-bold leading-tight",
                          active ? "text-emerald-900" : "text-slate-600"
                        )}
                      >
                        {eq.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {equipements.length === 0 && (
                <p className="text-[12px] text-slate-400 text-center py-4 bg-slate-50 rounded-xl mt-3 font-medium border border-dashed border-slate-200">
                  Aucun équipement sélectionné. Ajoutez-en pour attirer plus de locataires !
                </p>
              )}
            </SectionCard>

            {/* ── Photos ───────────────────────────────────────────────── */}
            <SectionCard icon={Camera} title="Photos" subtitle="Gérez les photos de votre véhicule (jusqu'à 8)">
              {/* Existing photos */}
              {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {existingPhotos.map((photo, i) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "relative group aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all duration-200",
                        draggedIndex === i && "opacity-50 scale-95",
                        dragOverIndex === i ? "border-emerald-400 scale-105" : "border-slate-200",
                        photo.estPrincipale ? "border-emerald-400 shadow-sm shadow-emerald-500/15" : ""
                      )}
                    >
                      <Image
                        src={photo.url}
                        alt="photo"
                        fill
                        className="object-cover"
                        sizes="120px"
                      />

                      {/* Drag handle */}
                      <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-sm px-2 py-1 text-[9px] font-medium text-white">
                          <GripVertical className="h-3 w-3" strokeWidth={2} />
                          Glisser
                        </div>
                      </div>

                      {photo.estPrincipale && (
                        <div className="absolute bottom-1.5 left-1.5 rounded-lg bg-emerald-500 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                          Principale
                        </div>
                      )}
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(photo.id)}
                          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}

                  {newPhotos.map((photo, i) => (
                    <div key={i} className="relative group aspect-[4/3] overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(photo.file)}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-1.5 left-1.5 rounded-lg bg-emerald-500 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                        Nouveau
                      </div>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNew(i)}
                          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uploadingPhotos && (
                <div className="flex items-center justify-center gap-2 py-3 text-[12px] text-emerald-600 font-bold bg-emerald-50 rounded-xl mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                  Upload en cours…
                </div>
              )}

              {/* Add photos button */}
              {canAddMore && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50",
                      "py-8 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all",
                    )}
                  >
                    <Upload className="h-6 w-6" strokeWidth={1.5} />
                    <span className="text-[13px] font-bold">
                      Ajouter des photos
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {totalPhotoCount} / 8 photo(s)
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </>
              )}

              {totalPhotoCount === 0 && (
                <p className="text-[12px] font-medium text-amber-600 bg-amber-50 rounded-xl py-3 text-center border border-amber-200 mt-4">
                  ⚠️ Aucune photo. Les locataires ignorent souvent les annonces sans photo.
                </p>
              )}

              {!locked && totalPhotoCount >= 8 && (
                <p className="text-[11px] font-bold text-slate-400 text-center mt-3 uppercase tracking-wider">
                  Maximum 8 photos atteint.
                </p>
              )}
            </SectionCard>

            {/* ── Documents ───────────────────────────────────────────── */}
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between gap-3 bg-[var(--bg-page)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10"
          >
            Annuler
          </Button>

          {locked ? (
            <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
              Véhicule verrouillé
            </div>
          ) : (
            <Button
              type="submit"
              form="edit-vehicle-form"
              disabled={loading}
              className="gap-2 bg-emerald-500 text-black font-semibold hover:bg-emerald-400 h-10 shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)] transition-all"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</>
              ) : (
                <><Save className="h-4 w-4" strokeWidth={1.5} />Enregistrer</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
