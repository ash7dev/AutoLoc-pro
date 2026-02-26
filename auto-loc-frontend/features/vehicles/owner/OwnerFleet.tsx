"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid, List, MoreHorizontal, CalendarDays, Pencil,
  ExternalLink, Archive, Car, Star, MapPin,
  AlertCircle, ArrowRight, Users, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { Vehicle, VehicleStatus } from "@/lib/nestjs/vehicles";
import { VEHICLE_PATHS } from "@/lib/nestjs/vehicles";
import { EditVehicleSheet } from "./EditVehicleSheet";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { STATUS_CONFIG, TYPE_LABELS, FUEL_LABELS, StatusChip, formatPrice, mainPhoto } from "./vehicle-helpers";

// ── Config ─────────────────────────────────────────────────────────────────────

type FilterKey = "all" | VehicleStatus;

const FILTER_LABELS: Record<FilterKey, string> = {
  all:                   "Tous",
  BROUILLON:             "En attente",
  EN_ATTENTE_VALIDATION: "En attente",
  VERIFIE:               "Actifs",
  SUSPENDU:              "Suspendus",
  ARCHIVE:               "Archivés",
};

// Shared list grid — header and rows must match exactly
const LIST_COLS = "80px 1fr 130px 160px 130px 150px 36px";

// ── Actions dropdown ───────────────────────────────────────────────────────────

function VehicleActions({
  vehicle,
  onEdit,
  onArchive,
}: {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onArchive: (v: Vehicle) => void;
}) {
  const locked = vehicle.estVerrouille === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors duration-150"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-2xl border-border/70 shadow-xl shadow-black/8 p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={() => onEdit(vehicle)}
          className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer"
        >
          {locked
            ? <Lock className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
            : <Pencil className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
          <span className="flex-1">{locked ? "Voir (verrouillé)" : "Modifier"}</span>
          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" strokeWidth={1.5} />
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/owner/vehicles/${vehicle.id}/reservations`}
            className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="flex-1">Réservations</span>
            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" strokeWidth={1.5} />
          </Link>
        </DropdownMenuItem>

        {vehicle.statut === "VERIFIE" && (
          <DropdownMenuItem asChild>
            <Link
              href={`/vehicles/${vehicle.id}`}
              target="_blank"
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="flex-1">Voir l&apos;annonce</span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" strokeWidth={1.5} />
            </Link>
          </DropdownMenuItem>
        )}

        {vehicle.statut !== "ARCHIVE" && (
          <>
            <DropdownMenuSeparator className="my-1.5 bg-border/50" />
            <DropdownMenuItem
              onClick={() => onArchive(vehicle)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
              Archiver ce véhicule
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Vehicle card (grid) ────────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  archiving,
  onEdit,
  onArchive,
  onOpen,
}: {
  vehicle: Vehicle;
  archiving: boolean;
  onEdit: (v: Vehicle) => void;
  onArchive: (v: Vehicle) => void;
  onOpen: (v: Vehicle) => void;
}) {
  const photo = mainPhoto(vehicle);
  const reservations = vehicle._count?.reservations ?? vehicle.totalLocations;
  const isActive = vehicle.statut === "VERIFIE";

  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-2xl bg-card",
      "shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/12",
      // Active: visible green border all around
      isActive
        ? "border-2 border-[#34D399]/50 hover:border-[#34D399]/80 shadow-[0_0_0_0px_#34D399]"
        : "border border-[hsl(var(--border))]",
      archiving && "opacity-40 pointer-events-none",
    )}
    onClick={() => onOpen(vehicle)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === "Enter") onOpen(vehicle); }}
    >

      {/* ── Green glow ribbon (active only) — visible, proud ── */}
      {isActive && (
        <div
          className="absolute top-0 inset-x-0 h-1 z-20"
          style={{ background: "linear-gradient(90deg, #34D399, #059669 50%, #34D399)" }}
        />
      )}

      {/* ── Photo area ── */}
      <div className="relative overflow-hidden bg-muted/30" style={{ height: "11.5rem" }}>
        {photo ? (
          <>
            <Image
              src={photo}
              alt={`${vehicle.marque} ${vehicle.modele}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            {/* Deep gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              isActive ? "bg-[#34D399]/10" : "bg-muted/60",
            )}>
              <Car className={cn("h-6 w-6", isActive ? "text-[#34D399]/60" : "text-muted-foreground/30")} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/40 tracking-widest uppercase">
              Aucune photo
            </p>
          </div>
        )}

        {/* Brand + status — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300">
            AutoLoc
          </span>
          {vehicle.estVerrouille && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80
              bg-amber-50/95 backdrop-blur-sm px-2.5 py-[3px] text-[10px] font-bold uppercase
              tracking-widest text-amber-700 shadow-sm">
              <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
              En cours
            </span>
          )}
          <StatusChip statut={vehicle.statut} />
        </div>

        {/* Actions — top right */}
        <div className="absolute top-2 right-2 z-10">
          <div className="rounded-full bg-black/30 backdrop-blur-sm">
            <VehicleActions vehicle={vehicle} onEdit={onEdit} onArchive={onArchive} />
          </div>
        </div>

        {/* Name + price overlay at bottom of photo */}
        {photo && (
          <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
              <p className="font-display text-[17px] font-black text-white tracking-tight leading-tight drop-shadow truncate">
                {vehicle.marque} {vehicle.modele}
              </p>
                <p className="text-[11px] text-white/50 font-semibold mt-0.5 tracking-wide">
                  {vehicle.annee} · {vehicle.immatriculation}
                </p>
              </div>
              {/* Price pill */}
              <div
                className="shrink-0 rounded-xl px-3 py-1.5 border border-white/10"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}
              >
                <span className="font-display text-[15px] font-black text-white tabular-nums leading-none">
                  {formatPrice(vehicle.prixParJour)}
                </span>
                <span className="text-[10px] text-white/50 font-bold ml-1">FCFA/j</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col p-4 gap-3">

        {/* No photo: show name + price here */}
        {!photo && (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display text-[17px] font-black tracking-tight leading-tight truncate">
                {vehicle.marque} {vehicle.modele}
              </p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 tracking-wide">
                {vehicle.annee} · {vehicle.immatriculation}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg font-black tracking-tight tabular-nums leading-none">
                {formatPrice(vehicle.prixParJour)}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">FCFA/j</p>
            </div>
          </div>
        )}

        {/* Type + fuel tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "rounded-lg px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-widest",
            isActive ? "bg-[#34D399]/10 text-[#059669]" : "bg-muted/60 text-muted-foreground",
          )}>
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>
          {vehicle.carburant && (
            <span className="rounded-lg bg-muted/60 px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}
            </span>
          )}
        </div>

        <div className="h-px bg-border/50" />

        {/* Footer: location + stats */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
            <span className="truncate uppercase">{vehicle.ville}</span>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            {vehicle.note > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                {vehicle.note.toFixed(1)}
              </span>
            )}
            {reservations > 0 && (
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-semibold">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                {reservations}
              </span>
            )}
            {vehicle.nombrePlaces && (
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-semibold">
                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                {vehicle.nombrePlaces}
              </span>
            )}
          </div>
        </div>

        {/* "Voir l'annonce" CTA — only for active, inline, no extra button clutter */}
        {isActive && (
          <Link
            href={`/vehicles/${vehicle.id}`}
            target="_blank"
            className="group/cta flex items-center justify-between rounded-xl px-3.5 py-2.5
              border border-[#34D399]/30 bg-[#34D399]/8
              hover:bg-[#34D399]/15 hover:border-[#34D399]/50
              transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[12px] font-bold text-[#059669] tracking-wide">
              Voir l&apos;annonce publique
            </span>
            <ExternalLink
              className="h-3.5 w-3.5 text-[#34D399] opacity-70 group-hover/cta:opacity-100 transition-opacity"
              strokeWidth={2}
            />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Vehicle row (list) ─────────────────────────────────────────────────────────

function VehicleRow({
  vehicle,
  archiving,
  onEdit,
  onArchive,
  onOpen,
}: {
  vehicle: Vehicle;
  archiving: boolean;
  onEdit: (v: Vehicle) => void;
  onArchive: (v: Vehicle) => void;
  onOpen: (v: Vehicle) => void;
}) {
  const photo = mainPhoto(vehicle);
  const reservations = vehicle._count?.reservations ?? vehicle.totalLocations;
  const isActive = vehicle.statut === "VERIFIE";

  return (
    <div
      className={cn(
        "group relative grid items-center gap-5 rounded-xl border bg-card",
        "px-5 py-4 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:shadow-black/5",
        isActive
          ? "border-[#34D399]/30 hover:border-[#34D399]/60"
          : "border-[hsl(var(--border))]",
        archiving && "opacity-40 pointer-events-none",
      )}
      style={{ gridTemplateColumns: LIST_COLS }}
      onClick={() => onOpen(vehicle)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(vehicle); }}
    >
      {/* Left accent stripe — active only */}
      {isActive && (
        <div
          className="absolute left-0 inset-y-0 w-[3px] rounded-l-xl"
          style={{ background: "linear-gradient(180deg, #34D399, #059669)" }}
        />
      )}

      {/* Col 1 — Thumbnail */}
      <div className="relative h-[52px] w-[72px] overflow-hidden rounded-xl bg-muted/40 shrink-0">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="72px"
          />
        ) : (
          <div className={cn(
            "flex h-full items-center justify-center",
            isActive ? "bg-[#34D399]/8" : "",
          )}>
            <Car className={cn("h-5 w-5", isActive ? "text-[#34D399]/40" : "text-muted-foreground/30")} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Col 2 — Name */}
      <div className="min-w-0">
        <p className="font-display text-[16px] font-black tracking-tight truncate leading-snug">
          {vehicle.marque} {vehicle.modele}
        </p>
        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate tracking-wide">
          {vehicle.annee} · {vehicle.immatriculation}
          {vehicle.carburant && (
            <span className="text-muted-foreground/50 ml-1.5">
              · {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}
            </span>
          )}
        </p>
      </div>

      {/* Col 3 — Status */}
      <div className="flex flex-col items-start gap-1">
        <StatusChip statut={vehicle.statut} />
        {vehicle.estVerrouille && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <Lock className="h-2.5 w-2.5" strokeWidth={2} />
            En cours
          </span>
        )}
      </div>

      {/* Col 4 — Price */}
      <div>
        <p className="font-display text-[16px] font-black tracking-tight tabular-nums leading-none">
          {formatPrice(vehicle.prixParJour)}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">
          FCFA / jour
        </p>
      </div>

      {/* Col 5 — City */}
      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
        <span className="text-[13px] font-semibold text-muted-foreground truncate uppercase">{vehicle.ville}</span>
      </div>

      {/* Col 6 — Stats */}
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
        {vehicle.note > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
            <span className="font-black text-foreground tabular-nums">{vehicle.note.toFixed(1)}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-bold tabular-nums">{reservations}</span>
        </span>
        {vehicle.nombrePlaces && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="font-bold">{vehicle.nombrePlaces}</span>
          </span>
        )}
      </div>

      {/* Col 7 — Actions */}
      <div className="flex justify-end">
        <VehicleActions vehicle={vehicle} onEdit={onEdit} onArchive={onArchive} />
      </div>
    </div>
  );
}

// ── Skeletons ──────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card">
          <Skeleton className="h-[11.5rem] w-full rounded-none" />
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-muted/10 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
        {filtered
          ? <AlertCircle className="h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} />
          : <Car className="h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} />
        }
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-sm font-black tracking-tight">
          {filtered ? "Aucun véhicule dans ce filtre" : "Aucun véhicule pour l'instant"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {filtered
            ? "Essayez un autre filtre pour voir vos véhicules."
            : "Publiez votre premier véhicule pour commencer à générer des revenus."}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/dashboard/owner/vehicles/new"
          className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white
            transition-all duration-200 hover:shadow-lg hover:shadow-[#34D399]/25 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #34D399 0%, #059669 100%)" }}
        >
          Ajouter un véhicule
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function OwnerFleet({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [view, setView]         = useState<"grid" | "list">("list");
  const [filter, setFilter]     = useState<FilterKey>("all");
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [archivingId, setArchivingId]       = useState<string | null>(null);
  const [editVehicle, setEditVehicle]       = useState<Vehicle | null>(null);
  const [detailVehicle, setDetailVehicle]   = useState<Vehicle | null>(null);

  const { authFetch } = useAuthFetch();

  const handleVehicleSaved = useCallback((updated: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => v.id === updated.id ? { ...updated, estVerrouille: v.estVerrouille } : v),
    );
  }, []);

  const counts = vehicles.reduce<Partial<Record<VehicleStatus, number>>>((acc, v) => {
    acc[v.statut] = (acc[v.statut] ?? 0) + 1;
    return acc;
  }, {});

  const filtered =
    filter === "ARCHIVE"
      ? vehicles.filter((v) => v.statut === "ARCHIVE")
      : filter === "all"
        ? vehicles.filter((v) => v.statut !== "ARCHIVE")
        : vehicles.filter((v) => v.statut === filter);

  const handleArchiveConfirm = useCallback(async () => {
    if (!confirmVehicle) return;
    setArchivingId(confirmVehicle.id);
    try {
      await authFetch(VEHICLE_PATHS.archive(confirmVehicle.id), { method: "DELETE" });
      setVehicles((prev) =>
        prev.map((v) => v.id === confirmVehicle.id ? { ...v, statut: "ARCHIVE" as const } : v),
      );
    } catch {
      // silently ignore
    } finally {
      setArchivingId(null);
      setConfirmVehicle(null);
    }
  }, [confirmVehicle, authFetch]);

  const visibleFilters: FilterKey[] = [
    "all",
    ...(Object.keys(STATUS_CONFIG) as VehicleStatus[]).filter((s) => (counts[s] ?? 0) > 0),
  ];

  return (
    <div className="font-body space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Brand badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          AutoLoc Fleet
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 rounded-xl border border-[hsl(var(--border))] bg-muted/30 p-1">
          {visibleFilters.map((f) => {
            const count = f === "all" ? vehicles.length : (counts[f as VehicleStatus] ?? 0);
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60",
                )}
              >
                {FILTER_LABELS[f]}
                {count > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums min-w-[18px] text-center transition-all duration-200",
                    active
                      ? "bg-[#34D399]/15 text-[#059669]"
                      : "bg-border/60 text-muted-foreground",
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-xl border border-[hsl(var(--border))] bg-muted/30 p-1">
          {(["grid", "list"] as const).map((v) => {
            const Icon = v === "grid" ? LayoutGrid : List;
            const active = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === "grid" ? "Vue grille" : "Vue liste"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                  active
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60",
                )}
                style={active ? { color: "#34D399" } : {}}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState filtered={filter !== "all"} />

      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              archiving={archivingId === v.id}
              onEdit={setEditVehicle}
              onArchive={setConfirmVehicle}
              onOpen={setDetailVehicle}
            />
          ))}
        </div>

      ) : (
        <div className="flex flex-col gap-2">
          {/* Header — exact same gridTemplateColumns as VehicleRow */}
          <div
            className="grid items-center gap-5 px-5 py-1.5"
            style={{ gridTemplateColumns: LIST_COLS }}
          >
            {["", "Véhicule", "Statut", "Prix / jour", "Ville", "Stats", "Actions"].map((col, i) => (
              <span
                key={i}
                className="text-[10px] font-black uppercase tracking-widest text-foreground/80"
              >
                {col}
              </span>
            ))}
          </div>

          {filtered.map((v) => (
            <VehicleRow
              key={v.id}
              vehicle={v}
              archiving={archivingId === v.id}
              onEdit={setEditVehicle}
              onArchive={setConfirmVehicle}
              onOpen={setDetailVehicle}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        onClose={() => setDetailVehicle(null)}
        onEdit={(v) => {
          setDetailVehicle(null);
          setEditVehicle(v);
        }}
        onArchive={(v) => {
          setDetailVehicle(null);
          setConfirmVehicle(v);
        }}
      />

      {/* Edit sheet */}
      <EditVehicleSheet
        vehicle={editVehicle}
        open={!!editVehicle}
        onClose={() => setEditVehicle(null)}
        onSaved={handleVehicleSaved}
      />

      {/* Archive confirmation */}
      <AlertDialog
        open={!!confirmVehicle}
        onOpenChange={(open: boolean) => { if (!open) setConfirmVehicle(null); }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-black tracking-tight text-lg">
              Archiver ce véhicule ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {confirmVehicle && (
                <>
                  <strong className="font-bold text-foreground">
                    {confirmVehicle.marque} {confirmVehicle.modele}
                  </strong>{" "}
                  sera retiré de la recherche et ses photos supprimées de Cloudinary.
                  Cette action ne peut pas être annulée.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveConfirm}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
              {archivingId ? "Archivage…" : "Archiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GridSkeleton as OwnerFleetSkeleton };
