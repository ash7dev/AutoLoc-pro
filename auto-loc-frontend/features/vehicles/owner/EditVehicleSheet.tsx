"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Image from "next/image";
import {
  Lock, AlertCircle, Loader2, Save,
  Car, CircleDollarSign, FileText, Camera,
  Plus, Trash2, Info, X, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { Vehicle, VehicleType, FuelType, Transmission, VehiclePhoto } from "@/lib/nestjs/vehicles";
import { VEHICLE_PATHS } from "@/lib/nestjs/vehicles";

// ── Constants ──────────────────────────────────────────────────────────────────

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
  { value: "ESSENCE",    label: "Essence" },
  { value: "DIESEL",     label: "Diesel" },
  { value: "HYBRIDE",    label: "Hybride" },
  { value: "ELECTRIQUE", label: "Électrique" },
];

const TRANSMISSIONS: { value: Transmission; label: string }[] = [
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
  reglesSpecifiques?: string;
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/60">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
const selectCls =
  "w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      marque:            vehicle.marque,
      modele:            vehicle.modele,
      annee:             vehicle.annee,
      immatriculation:   vehicle.immatriculation,
      type:              vehicle.type,
      nombrePlaces:      vehicle.nombrePlaces ?? undefined,
      carburant:         vehicle.carburant ?? "",
      transmission:      vehicle.transmission ?? "",
      ville:             vehicle.ville,
      adresse:           vehicle.adresse,
      prixParJour:       vehicle.prixParJour,
      joursMinimum:      vehicle.joursMinimum,
      tiers:             vehicle.tarifsProgressifs.map((t) => ({
        joursMin: t.joursMin,
        joursMax: t.joursMax ?? undefined,
        prix:     Number(t.prix),
      })),
      ageMinimum:        vehicle.ageMinimum,
      zoneConduite:      vehicle.zoneConduite ?? "",
      assurance:         vehicle.assurance ?? "",
      reglesSpecifiques: vehicle.reglesSpecifiques ?? "",
    });
    setExistingPhotos([...vehicle.photos]);
    setDeletedPhotoIds([]);
    setNewFiles([]);
    setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id, open]);

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setError(null);
      setNewFiles([]);
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

  const handleRemoveExisting = (photoId: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setDeletedPhotoIds((prev) => [...prev, photoId]);
  };

  const handleRemoveNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const totalPhotos = existingPhotos.length + newFiles.length + files.length;
    const allowed = Math.min(files.length, 8 - existingPhotos.length - newFiles.length);
    setNewFiles((prev) => [...prev, ...files.slice(0, allowed)]);
    if (allowed < files.length || totalPhotos > 8) {
      setError(`Maximum 8 photos. ${files.length - allowed} fichier(s) ignoré(s).`);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: EditFormData) => {
    if (!vehicle || locked) return;
    setLoading(true);
    setError(null);

    try {
      // 1. PATCH vehicle fields
      const updated = await authFetch<Vehicle, Record<string, unknown>>(
        VEHICLE_PATHS.update(vehicle.id),
        {
          method: "PATCH",
          body: {
            marque:            data.marque,
            modele:            data.modele,
            annee:             Number(data.annee),
            immatriculation:   data.immatriculation,
            type:              data.type,
            nombrePlaces:      data.nombrePlaces ? Number(data.nombrePlaces) : undefined,
            carburant:         data.carburant   || undefined,
            transmission:      data.transmission || undefined,
            ville:             data.ville,
            adresse:           data.adresse,
            prixParJour:       Number(data.prixParJour),
            joursMinimum:      Number(data.joursMinimum),
            tiers:             (data.tiers ?? []).map((t) => ({
              joursMin: Number(t.joursMin),
              joursMax: t.joursMax ? Number(t.joursMax) : undefined,
              prix:     Number(t.prix),
            })),
            ageMinimum:        data.ageMinimum ? Number(data.ageMinimum) : undefined,
            zoneConduite:      data.zoneConduite      || undefined,
            assurance:         data.assurance         || undefined,
            reglesSpecifiques: data.reglesSpecifiques || undefined,
          },
        },
      );

      // 2. Delete removed photos (best-effort)
      await Promise.allSettled(
        deletedPhotoIds.map((photoId) =>
          authFetch(VEHICLE_PATHS.deletePhoto(vehicle.id, photoId), { method: "DELETE" }),
        ),
      );

      // 3. Upload new photos (best-effort)
      const uploaded: VehiclePhoto[] = [];
      for (const file of newFiles) {
        try {
          const form = new FormData();
          form.append("file", file);
          const photo = await authFetch<VehiclePhoto>(
            VEHICLE_PATHS.addPhoto(vehicle.id),
            {
              method: "POST",
              body: form as unknown as undefined,
            },
          );
          uploaded.push(photo);
        } catch {
          // ignore individual photo upload failures
        }
      }

      // Merge photos into updated vehicle (keep existing that weren't deleted + new uploads)
      const finalVehicle: Vehicle = {
        ...updated,
        photos: [
          ...existingPhotos,
          ...uploaded,
        ],
      };

      onSaved(finalVehicle);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const totalPhotoCount = existingPhotos.length + newFiles.length;
  const canAddMore = totalPhotoCount < 8;

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
            <h2 className="font-display tracking-tight text-base text-emerald-400">
              {vehicle ? `${vehicle.marque} ${vehicle.modele}` : "Modifier le véhicule"}
            </h2>
            <p className="text-xs text-emerald-300/90">
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
            <div className="space-y-4">
              <SectionHeader icon={Car} title="Informations" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Marque" required error={errors.marque?.message}>
                  <input
                    {...register("marque", { required: "Requis" })}
                    disabled={locked}
                    placeholder="Toyota"
                    className={inputCls}
                  />
                </Field>

                <Field label="Modèle" required error={errors.modele?.message}>
                  <input
                    {...register("modele", { required: "Requis" })}
                    disabled={locked}
                    placeholder="Corolla"
                    className={inputCls}
                  />
                </Field>

                <Field label="Année" required error={errors.annee ? "Année invalide" : undefined}>
                  <input
                    type="number"
                    {...register("annee", { required: true, min: 1990, max: new Date().getFullYear() + 1, valueAsNumber: true })}
                    disabled={locked}
                    className={inputCls}
                  />
                </Field>

                <Field label="Immatriculation" required error={errors.immatriculation?.message}>
                  <input
                    {...register("immatriculation", { required: "Requis" })}
                    disabled={locked}
                    placeholder="DK 1234 AB"
                    className={cn(inputCls, "font-mono uppercase")}
                  />
                </Field>

                <Field label="Type" required>
                  <select
                    {...register("type", { required: true })}
                    disabled={locked}
                    className={selectCls}
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Nb. places">
                  <input
                    type="number"
                    {...register("nombrePlaces", { min: 1, max: 50, valueAsNumber: true })}
                    disabled={locked}
                    placeholder="5"
                    className={inputCls}
                  />
                </Field>

                <Field label="Carburant">
                  <select {...register("carburant")} disabled={locked} className={selectCls}>
                    <option value="">— Sélectionner —</option>
                    {FUEL_TYPES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Transmission">
                  <select {...register("transmission")} disabled={locked} className={selectCls}>
                    <option value="">— Sélectionner —</option>
                    {TRANSMISSIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Zone / Ville" required error={errors.ville?.message}>
                  <select
                    {...register("ville", { required: "Requis" })}
                    disabled={locked}
                    className={inputCls}
                  >
                    <option value="">Sélectionner une zone</option>
                    {ZONES_DAKAR.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Adresse" required error={errors.adresse?.message}>
                  <input
                    {...register("adresse", { required: "Requis" })}
                    disabled={locked}
                    placeholder="Rue, quartier…"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* ── Tarification ─────────────────────────────────────────── */}
            <div className="space-y-4">
              <SectionHeader icon={CircleDollarSign} title="Tarification" />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Prix / jour (FCFA)"
                  required
                  error={errors.prixParJour ? "Montant invalide (min. 1 000)" : undefined}
                >
                  <input
                    type="number"
                    {...register("prixParJour", { required: true, min: 1000, valueAsNumber: true })}
                    disabled={locked}
                    placeholder="25 000"
                    className={inputCls}
                  />
                </Field>

                <Field label="Durée minimum (jours)">
                  <input
                    type="number"
                    {...register("joursMinimum", { min: 1, valueAsNumber: true })}
                    disabled={locked}
                    placeholder="1"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Progressive tiers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">Tarification progressive</span>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Optionnel</span>
                  </div>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => append({ joursMin: (tiersWatch?.length ?? 0) * 3 + 1, prix: 0 })}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Ajouter un palier
                    </button>
                  )}
                </div>

                {fields.length > 0 ? (
                  <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 bg-muted/50 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      <span>À partir de (j)</span>
                      <span>Jusqu&apos;à (j)</span>
                      <span>Prix/j (FCFA)</span>
                      <span />
                    </div>
                    {fields.map((field, i) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center px-3 py-2.5 border-t border-[hsl(var(--border))]"
                      >
                        <input
                          type="number"
                          {...register(`tiers.${i}.joursMin` as const, { required: true, min: 1, valueAsNumber: true })}
                          disabled={locked}
                          placeholder="1"
                          className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        />
                        <input
                          type="number"
                          {...register(`tiers.${i}.joursMax` as const, { min: 1, valueAsNumber: true })}
                          disabled={locked}
                          placeholder="∞"
                          className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        />
                        <input
                          type="number"
                          {...register(`tiers.${i}.prix` as const, { required: true, min: 1, valueAsNumber: true })}
                          disabled={locked}
                          placeholder="20 000"
                          className="h-9 rounded-lg border border-[hsl(var(--border))] bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        />
                        {!locked && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                        {locked && <div />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-3">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ex : 1–4 j → 25 000 FCFA/j, 5+ j → 20 000 FCFA/j. Attirez plus de longues réservations.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Conditions ───────────────────────────────────────────── */}
            <div className="space-y-4">
              <SectionHeader icon={FileText} title="Conditions" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Âge minimum">
                  <input
                    type="number"
                    {...register("ageMinimum", { min: 18, max: 99, valueAsNumber: true })}
                    disabled={locked}
                    placeholder="21"
                    className={inputCls}
                  />
                </Field>

                <Field label="Zone de conduite">
                  <select {...register("zoneConduite")} disabled={locked} className={selectCls}>
                    <option value="">— Sélectionner —</option>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </Field>

                <div className="col-span-2">
                  <Field label="Couverture assurance">
                    <select {...register("assurance")} disabled={locked} className={selectCls}>
                      <option value="">— Sélectionner —</option>
                      {ASSURANCES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Règles spécifiques">
                    <textarea
                      {...register("reglesSpecifiques")}
                      disabled={locked}
                      rows={3}
                      placeholder="Ex : Non-fumeur, pas d'animaux…"
                      className="w-full rounded-lg border border-[hsl(var(--border))] bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Photos ───────────────────────────────────────────────── */}
            <div className="space-y-4">
              <SectionHeader icon={Camera} title="Photos" />

              {/* Existing photos */}
              {(existingPhotos.length > 0 || newFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-[4/3] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-muted/40">
                      <Image
                        src={photo.url}
                        alt="photo"
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      {photo.estPrincipale && (
                        <div className="absolute bottom-1 left-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Principale
                        </div>
                      )}
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(photo.id)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}

                  {newFiles.map((file, i) => (
                    <div key={i} className="relative group aspect-[4/3] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        Nouveau
                      </div>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNew(i)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add photos button */}
              {!locked && canAddMore && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full flex flex-col items-center gap-2 rounded-lg border border-dashed border-[hsl(var(--border))]",
                      "py-6 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
                    )}
                  >
                    <Upload className="h-5 w-5" strokeWidth={1.5} />
                    <span className="text-xs font-medium">
                      Ajouter des photos
                    </span>
                    <span className="text-[10px]">
                      {totalPhotoCount}/8 photo(s)
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
                <p className="text-xs text-muted-foreground text-center py-2">
                  Aucune photo — votre annonce sera moins visible.
                </p>
              )}

              {!canAddMore && !locked && (
                <p className="text-[10px] text-muted-foreground text-center">
                  Maximum 8 photos atteint.
                </p>
              )}
            </div>

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
