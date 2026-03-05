"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { STATUS_CONFIG, TYPE_LABELS, FUEL_LABELS, StatusChip, formatPrice, mainPhoto } from "./vehicle-helpers";

// ── Config ─────────────────────────────────────────────────────────────────────

type FilterKey = "all" | VehicleStatus;

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Tous",
  BROUILLON: "En attente",
  EN_ATTENTE_VALIDATION: "En attente",
  VERIFIE: "Actifs",
  SUSPENDU: "Suspendus",
  ARCHIVE: "Archivés",
};

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

// ── Vehicle card (grid) — premium ──────────────────────────────────────────────

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
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] bg-card cursor-pointer",
        "border border-border/50",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/[0.08] hover:border-border",
        archiving && "opacity-40 pointer-events-none",
      )}
      onClick={() => onOpen(vehicle)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(vehicle); }}
    >
      {/* ── Photo area ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20" style={{ height: "13rem" }}>
        {photo ? (
          <>
            <Image
              src={photo}
              alt={`${vehicle.marque} ${vehicle.modele}`}
              fill
              className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
              <Car className="h-7 w-7 text-muted-foreground/20" strokeWidth={1.25} />
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground/25 tracking-[0.15em] uppercase">
              Pas de photo
            </p>
          </div>
        )}

        {/* Status — top left */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
          <StatusChip statut={vehicle.statut} />
          {vehicle.estVerrouille && (
            <span className="inline-flex items-center gap-1 rounded-full
              bg-amber-500/90 backdrop-blur-sm px-2 py-[3px]
              text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
              <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
              Loué
            </span>
          )}
        </div>

        {/* Actions — top right (reveal on hover) */}
        <div className="absolute top-3 right-3 z-10 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-xl shadow-lg shadow-black/10 border border-white/20">
            <VehicleActions vehicle={vehicle} onEdit={onEdit} onArchive={onArchive} />
          </div>
        </div>

        {/* Price pill — bottom right, frosted glass */}
        {photo && (
          <div className="absolute bottom-3.5 right-3.5 z-10">
            <div className="rounded-xl px-3.5 py-2 bg-white/95 dark:bg-white/90 backdrop-blur-xl shadow-lg shadow-black/15 border border-white/60">
              <span className="font-display text-[16px] font-black text-slate-900 tabular-nums leading-none tracking-tight">
                {formatPrice(vehicle.prixParJour)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold ml-1">/ jour</span>
            </div>
          </div>
        )}

        {/* Name overlay at bottom of photo */}
        {photo && (
          <div className="absolute bottom-3.5 left-4 z-10 min-w-0 max-w-[55%]">
            <p className="font-display text-[18px] font-extrabold text-white tracking-tight leading-tight drop-shadow-md truncate">
              {vehicle.marque} {vehicle.modele}
            </p>
            <p className="text-[11px] text-white/50 font-medium mt-0.5">
              {vehicle.annee} · <span className="font-mono text-[10px]">{vehicle.immatriculation}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col px-5 py-4 gap-3">

        {/* No photo fallback: name + price */}
        {!photo && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-[17px] font-extrabold tracking-tight leading-snug truncate">
                {vehicle.marque} {vehicle.modele}
              </p>
              <p className="text-[12px] text-muted-foreground/60 font-medium mt-0.5">
                {vehicle.annee} · <span className="font-mono text-[11px]">{vehicle.immatriculation}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-[18px] font-black tracking-tight tabular-nums leading-none">
                {formatPrice(vehicle.prixParJour)}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">FCFA/j</p>
            </div>
          </div>
        )}

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            isActive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-muted/50 text-muted-foreground/70",
          )}>
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>
          {vehicle.carburant && (
            <span className="rounded-lg bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}
            </span>
          )}
          {vehicle.transmission && (
            <span className="rounded-lg bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {vehicle.transmission === "AUTOMATIQUE" ? "Auto" : "Manuel"}
            </span>
          )}
        </div>

        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Footer: location + stats */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground/70 font-medium min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" strokeWidth={1.5} />
            <span className="truncate">{vehicle.ville}</span>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            {vehicle.note > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                {Number(vehicle.note).toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50 font-semibold tabular-nums">
              <CalendarDays className="h-3 w-3" strokeWidth={1.5} />
              {reservations}
            </span>
            {vehicle.nombrePlaces && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50 font-semibold">
                <Users className="h-3 w-3" strokeWidth={1.5} />
                {vehicle.nombrePlaces}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vehicle row (list) — premium ───────────────────────────────────────────────

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
        "group relative grid items-center gap-5 rounded-2xl border bg-card cursor-pointer",
        "px-5 py-3.5 transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-black/[0.04] hover:bg-accent/30",
        "border-border/50 hover:border-border",
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
          className="absolute left-0 inset-y-2 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, #34D399, #059669)" }}
        />
      )}

      {/* Col 1 — Thumbnail */}
      <div className="relative h-[52px] w-[72px] overflow-hidden rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 shrink-0 border border-border/30">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="72px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-5 w-5 text-muted-foreground/20" strokeWidth={1.25} />
          </div>
        )}
      </div>

      {/* Col 2 — Name */}
      <div className="min-w-0">
        <p className="font-display text-[15px] font-extrabold tracking-tight truncate leading-snug">
          {vehicle.marque} {vehicle.modele}
        </p>
        <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5 truncate">
          {vehicle.annee} · <span className="font-mono text-[10px]">{vehicle.immatriculation}</span>
          {vehicle.carburant && (
            <span className="text-muted-foreground/40 ml-1.5">
              · {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}
            </span>
          )}
        </p>
      </div>

      {/* Col 3 — Status */}
      <div className="flex flex-col items-start gap-1">
        <StatusChip statut={vehicle.statut} />
        {vehicle.estVerrouille && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <Lock className="h-2.5 w-2.5" strokeWidth={2} />
            Loué
          </span>
        )}
      </div>

      {/* Col 4 — Price */}
      <div>
        <p className="font-display text-[16px] font-black tracking-tight tabular-nums leading-none">
          {formatPrice(vehicle.prixParJour)}
        </p>
        <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mt-1">
          FCFA / jour
        </p>
      </div>

      {/* Col 5 — City */}
      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" strokeWidth={1.5} />
        <span className="text-[13px] font-medium text-muted-foreground/70 truncate">{vehicle.ville}</span>
      </div>

      {/* Col 6 — Stats */}
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground/60">
        {vehicle.note > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
            <span className="font-bold text-foreground tabular-nums">{Number(vehicle.note).toFixed(1)}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-semibold tabular-nums">{reservations}</span>
        </span>
        {vehicle.nombrePlaces && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="font-semibold">{vehicle.nombrePlaces}</span>
          </span>
        )}
      </div>

      {/* Col 7 — Actions (reveal on hover) */}
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <div key={i} className="overflow-hidden rounded-[20px] border border-border/50 bg-card">
          <Skeleton className="h-[13rem] w-full rounded-none" />
          <div className="flex flex-col gap-3 px-5 py-4">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <div className="flex gap-1.5">
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
    <div className="flex flex-col items-center gap-6 rounded-[20px] border border-dashed border-border/60 bg-muted/5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 border border-border/30">
        {filtered
          ? <AlertCircle className="h-7 w-7 text-muted-foreground/30" strokeWidth={1.25} />
          : <Car className="h-7 w-7 text-muted-foreground/30" strokeWidth={1.25} />
        }
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-sm font-extrabold tracking-tight">
          {filtered ? "Aucun véhicule dans ce filtre" : "Aucun véhicule pour l'instant"}
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
          {filtered
            ? "Essayez un autre filtre pour voir vos véhicules."
            : "Publiez votre premier véhicule pour commencer à générer des revenus."}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/dashboard/owner/vehicles/new"
          className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white
            transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const { authFetch } = useAuthFetch();
  const router = useRouter();

  const handleOpenVehicle = useCallback((v: Vehicle) => {
    router.push(`/dashboard/owner/vehicles/${v.id}`);
  }, [router]);

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
    <div className="font-body space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/20 p-1">
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
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-border/50 text-muted-foreground",
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
        <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/20 p-1">
          {(["grid", "list"] as const).map((v) => {
            const Icon = v === "grid" ? LayoutGrid : List;
            const active = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === "grid" ? "Vue grille" : "Vue liste"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                  active
                    ? "bg-card shadow-sm text-emerald-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60",
                )}
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
              onOpen={handleOpenVehicle}
            />
          ))}
        </div>

      ) : (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div
            className="grid items-center gap-5 px-5 py-2"
            style={{ gridTemplateColumns: LIST_COLS }}
          >
            {["", "Véhicule", "Statut", "Prix / jour", "Ville", "Stats", ""].map((col, i) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50"
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
              onOpen={handleOpenVehicle}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
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
