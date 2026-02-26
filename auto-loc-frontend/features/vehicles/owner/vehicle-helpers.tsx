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
  // BROUILLON → relabeled "En attente" so user isn't discouraged
  BROUILLON:             { label: "En attente",  icon: Clock,        className: "bg-amber-100 text-amber-800 border-amber-300/80",          dot: "bg-amber-500" },
  EN_ATTENTE_VALIDATION: { label: "En attente",  icon: Clock,        className: "bg-amber-100 text-amber-800 border-amber-300/80",          dot: "bg-amber-500" },
  VERIFIE:               { label: "Actif",       icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-300/80",    dot: "bg-emerald-500" },
  SUSPENDU:              { label: "Suspendu",    icon: ShieldOff,    className: "bg-red-100 text-red-700 border-red-300/80",                dot: "bg-red-500" },
  ARCHIVE:               { label: "Archivé",     icon: Archive,      className: "bg-slate-100 text-slate-700 border-slate-300/70",          dot: "bg-slate-400" },
};

export const TYPE_LABELS: Record<string, string> = {
  BERLINE:    "Berline",
  SUV:        "SUV",
  CITADINE:   "Citadine",
  "4X4":      "4x4",
  PICKUP:     "Pick-up",
  MONOSPACE:  "Monospace",
  MINIBUS:    "Minibus",
  UTILITAIRE: "Utilitaire",
  LUXE:       "Luxe",
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
