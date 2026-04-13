"use client";

import type { Vehicle, VehicleStatus } from "@/lib/nestjs/vehicles";
import { Archive, CheckCircle2, Clock, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const STATUS_CONFIG: Record<VehicleStatus, {
  label: string;       // display label (user-facing)
  icon: React.ElementType;
  className: string;
  dot: string;
}> = {
  // BROUILLON & EN_ATTENTE → Ambre (Conservé selon demande utilisateur)
  BROUILLON:             { label: "En attente",  icon: Clock,        className: "bg-amber-50 text-amber-600 border-amber-200/60",          dot: "bg-amber-500" },
  EN_ATTENTE_VALIDATION: { label: "En attente",  icon: Clock,        className: "bg-amber-50 text-amber-600 border-amber-200/60",          dot: "bg-amber-500" },
  VERIFIE:               { label: "Actif",       icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 border-emerald-200/60",    dot: "bg-emerald-500" },
  SUSPENDU:              { label: "Suspendu",    icon: ShieldOff,    className: "bg-red-50 text-red-600 border-red-200/60",                dot: "bg-red-500" },
  ARCHIVE:               { label: "Archivé",     icon: Archive,      className: "bg-black/[0.04] text-black/40 border-black/[0.06]",       dot: "bg-black/20" },
};

export const TYPE_LABELS: Record<string, string> = {
  BERLINE:    "Berline",
  SUV:        "SUV",
  PICKUP:     "Pick-up",
  MINIVAN:    "Minivan",
  CITADINE:   "Citadine",
  MONOSPACE:  "Monospace",
  MINIBUS:    "Minibus",
  UTILITAIRE: "Utilitaire",
  LUXE:       "Luxe",
  FOUR_X_FOUR:"4x4",
};

export const FUEL_LABELS: Record<string, string> = {
  ESSENCE: "Essence", DIESEL: "Diesel",
  HYBRIDE: "Hybride", ELECTRIQUE: "Électrique",
};

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function mainPhoto(v: Vehicle): string | null {
  return v.photos.find((p) => p.estPrincipale)?.url ?? v.photos[0]?.url ?? null;
}

export function StatusChip({ statut }: { statut: VehicleStatus }) {
  const cfg = STATUS_CONFIG[statut];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px]",
      "text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
      cfg.className,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
