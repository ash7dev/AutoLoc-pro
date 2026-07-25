"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutGrid, List, MoreHorizontal, CalendarDays, Pencil,
    ExternalLink, Archive, Car, Star, MapPin,
    AlertCircle, ArrowRight, Users, Lock,
    TrendingUp, Fuel, Settings2, CalendarCheck,
    Eye, Zap, CheckCircle2, Clock, ShieldOff,
    ChevronDown, Banknote, Gauge, Sparkles, Trash2,
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
import { toast } from "sonner";
import { EditVehicleSheet } from "./EditVehicleSheet";
import {
    STATUS_CONFIG, TYPE_LABELS, FUEL_LABELS, StatusChip,
    formatPrice, mainPhoto,
} from "./vehicle-helpers";

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterKey = "all" | VehicleStatus;

// ── Section groups ─────────────────────────────────────────────────────────────

interface SectionConfig {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconGradient: string;     // gradient classes for icon bg
    iconColor: string;
    accent: string;           // border-left color
    statuses: VehicleStatus[];
    collapsible: boolean;
    defaultOpen: boolean;
}

const SECTIONS: SectionConfig[] = [
    {
        id: "active",
        title: "Flotte active",
        subtitle: "Vos véhicules vérifiés et disponibles à la location",
        icon: CheckCircle2,
        iconGradient: "from-emerald-100 to-teal-100 border-emerald-200",
        iconColor: "text-emerald-600",
        accent: "border-l-emerald-500",
        statuses: ["VERIFIE"],
        collapsible: false,
        defaultOpen: true,
    },
    {
        id: "pending",
        title: "En validation",
        subtitle: "En attente de vérification par l'équipe AutoLoc",
        icon: Clock,
        iconGradient: "from-amber-100 to-orange-100 border-amber-200",
        iconColor: "text-amber-600",
        accent: "border-l-amber-500",
        statuses: ["BROUILLON", "EN_ATTENTE_VALIDATION"],
        collapsible: true,
        defaultOpen: true,
    },
    {
        id: "suspended",
        title: "Suspendus",
        subtitle: "Véhicules temporairement retirés de la plateforme",
        icon: ShieldOff,
        iconGradient: "from-red-100 to-rose-100 border-red-200",
        iconColor: "text-red-500",
        accent: "border-l-red-400",
        statuses: ["SUSPENDU"],
        collapsible: true,
        defaultOpen: false,
    },
    {
        id: "archived",
        title: "Archivés",
        subtitle: "Véhicules retirés définitivement de la location",
        icon: Archive,
        iconGradient: "from-slate-100 to-slate-200 border-slate-200",
        iconColor: "text-slate-500",
        accent: "border-l-slate-300",
        statuses: ["ARCHIVE"],
        collapsible: true,
        defaultOpen: false,
    },
];

// Removed FleetSummary

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({
    config,
    count,
    isOpen,
    onToggle,
}: {
    config: SectionConfig;
    count: number;
    isOpen: boolean;
    onToggle?: () => void;
}) {
    const Icon = config.icon;
    const Tag = config.collapsible ? "button" : "div";

    return (
        <Tag
            {...(config.collapsible
                ? { type: "button" as const, onClick: onToggle }
                : {}
            )}
            className={cn(
                "flex items-center gap-3 w-full py-2.5 group",
                config.collapsible && "cursor-pointer",
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0",
                config.iconGradient,
                "bg-gradient-to-br",
            )}>
                <Icon className={cn("w-4 h-4", config.iconColor)} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-black text-slate-800">{config.title}</h3>
                    <span className="text-[10px] font-bold tabular-nums text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {count}
                    </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
                    {config.subtitle}
                </p>
            </div>
            {config.collapsible && (
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0",
                    isOpen && "rotate-180",
                )} />
            )}
        </Tag>
    );
}

// ── Actions dropdown ───────────────────────────────────────────────────────────

function VehicleActions({
    vehicle,
    onEdit,
    onArchive,
    onDelete,
}: {
    vehicle: Vehicle;
    onEdit: (v: Vehicle) => void;
    onArchive: (v: Vehicle) => void;
    onDelete?: (v: Vehicle) => void;
}) {
    const locked = vehicle.estVerrouille === true;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl border border-slate-100 shadow-xl shadow-black/8 p-1.5 bg-white/95 backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuItem
                    onClick={() => onEdit(vehicle)}
                    className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer"
                >
                    {locked
                        ? <Lock className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
                        : <Pencil className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />}
                    <span className="flex-1">{locked ? "Voir (verrouillé)" : "Modifier"}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400" strokeWidth={1.5} />
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href={`/dashboard/owner/vehicles/${vehicle.id}/reservations`}
                        className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                        <span className="flex-1">Réservations</span>
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400" strokeWidth={1.5} />
                    </Link>
                </DropdownMenuItem>

                {vehicle.statut === "VERIFIE" && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/vehicle/${vehicle.id}`}
                            target="_blank"
                            className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                            <span className="flex-1">Voir l&apos;annonce</span>
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400" strokeWidth={1.5} />
                        </Link>
                    </DropdownMenuItem>
                )}

                {vehicle.statut !== "ARCHIVE" && (
                    <>
                        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                        <DropdownMenuItem
                            onClick={() => onArchive(vehicle)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
                        >
                            <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Archiver ce véhicule
                        </DropdownMenuItem>
                    </>
                )}

                {(vehicle.statut === "BROUILLON" || vehicle.statut === "ARCHIVE") && onDelete && (
                    <>
                        {vehicle.statut !== "ARCHIVE" && <DropdownMenuSeparator className="my-1.5 bg-slate-100" />}
                        <DropdownMenuItem
                            onClick={() => onDelete(vehicle)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Supprimer définitivement
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Vehicle card (grid) — Glass premium ───────────────────────────────────────

function VehicleCard({
    vehicle,
    archiving,
    onEdit,
    onArchive,
    onDelete,
    onOpen,
}: {
    vehicle: Vehicle;
    archiving: boolean;
    onEdit: (v: Vehicle) => void;
    onArchive: (v: Vehicle) => void;
    onDelete?: (v: Vehicle) => void;
    onOpen: (v: Vehicle) => void;
}) {
    const photo = mainPhoto(vehicle);
    const reservations = vehicle._count?.reservations ?? vehicle.totalLocations ?? 0;
    const isActive = vehicle.statut === "VERIFIE";
    const isLocked = vehicle.estVerrouille === true;
    const isPending = vehicle.statut === "EN_ATTENTE_VALIDATION" || vehicle.statut === "BROUILLON";
    const isArchived = vehicle.statut === "ARCHIVE";
    const isSuspended = vehicle.statut === "SUSPENDU";
    const estimatedRevenue = Math.round(vehicle.prixParJour * reservations);

    // accent color per status
    const accentBorder = isActive ? "border-l-emerald-500"
        : isPending ? "border-l-amber-400"
        : isSuspended ? "border-l-red-400"
        : "border-l-slate-300";

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer",
                "border border-l-[3px] border-white/70",
                accentBorder,
                "bg-white/70 backdrop-blur-xl",
                "shadow-sm hover:shadow-xl hover:shadow-slate-200/50",
                "hover:-translate-y-[3px] transition-all duration-300 ease-out",
                isArchived && "opacity-60 hover:opacity-100",
                archiving && "opacity-40 pointer-events-none",
            )}
            onClick={() => onOpen(vehicle)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onOpen(vehicle); }}
        >
            {/* ── Photo area ─────────────────────────────── */}
            <div className="relative overflow-hidden bg-slate-100" style={{ height: "10.5rem" }}>

                {/* Active shimmer bar */}
                {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] z-20 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
                )}

                {photo ? (
                    <>
                        <Image
                            src={photo}
                            alt={`${vehicle.marque} ${vehicle.modele}`}
                            fill
                            loading="lazy"
                            className={cn(
                                "object-cover transition-transform duration-700 group-hover:scale-[1.07]",
                                isArchived && "grayscale-[50%]",
                            )}
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl border flex items-center justify-center",
                            isActive ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200",
                        )}>
                            <Car className={cn("h-6 w-6", isActive ? "text-emerald-400" : "text-slate-300")} strokeWidth={1.5} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Pas de photo</p>
                    </div>
                )}

                {/* Status chip — top left */}
                <div className="absolute top-3 left-3.5 flex items-center gap-1.5 z-10">
                    <StatusChip statut={vehicle.statut} />
                    {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-sm px-2 py-[3px] text-[9px] font-black uppercase tracking-widest text-white">
                            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                            Loué
                        </span>
                    )}
                    {vehicle.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-[3px] text-[9px] font-black uppercase tracking-widest text-black shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
                            En vedette
                        </span>
                    )}
                </div>

                {/* Actions — toujours visible sur mobile, hover reveal sur desktop */}
                <div className="absolute top-3 right-3 z-10 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
                    <div className="rounded-xl bg-white/90 backdrop-blur-xl shadow-lg border border-white/30" onClick={(e) => e.stopPropagation()}>
                        <VehicleActions vehicle={vehicle} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
                    </div>
                </div>

                {/* Name overlay (photo) */}
                {photo && (
                    <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3 z-10 flex items-end justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-[16px] font-black text-white leading-tight tracking-tight drop-shadow-sm truncate">
                                {vehicle.marque}{" "}
                                <span className={isActive ? "text-emerald-300" : "text-white/70"}>
                                    {vehicle.modele}
                                </span>
                            </p>
                            <p className="text-[9.5px] text-white/45 font-medium mt-0.5 font-mono truncate">
                                {vehicle.annee}
                                {vehicle.immatriculation && ` · ${vehicle.immatriculation}`}
                            </p>
                        </div>
                        {/* Price frosted pill */}
                        <div className="shrink-0 rounded-xl px-2.5 py-1.5 bg-white/90 backdrop-blur-xl shadow-md border border-white/40">
                            <span className="text-[14px] font-black text-slate-900 tabular-nums leading-none">
                                {formatPrice(vehicle.prixParJour)}
                            </span>
                            <span className="text-[8.5px] text-slate-400 font-bold ml-0.5">/j</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Body ───────────────────────────────────── */}
            <div className="flex flex-1 flex-col px-4 pt-3.5 pb-3 gap-3">

                {/* No-photo: name + price */}
                {!photo && (
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[15px] font-black tracking-tight truncate text-slate-900">
                                {vehicle.marque}{" "}
                                <span className="text-emerald-500">{vehicle.modele}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">
                                {vehicle.annee}
                                {vehicle.immatriculation && ` · ${vehicle.immatriculation}`}
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-[16px] font-black tabular-nums text-slate-900 leading-none">
                                {formatPrice(vehicle.prixParJour)}
                            </p>
                            <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">FCFA/j</p>
                        </div>
                    </div>
                )}

                {/* Specs chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide border",
                        isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-100",
                    )}>
                        <Gauge className="h-2.5 w-2.5" strokeWidth={2} />
                        {TYPE_LABELS[vehicle.type] ?? vehicle.type}
                    </span>

                    {vehicle.carburant && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide text-slate-900">
                            <Fuel className="h-2.5 w-2.5" strokeWidth={2} />
                            {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}
                        </span>
                    )}

                    {vehicle.transmission && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide text-slate-900">
                            <Settings2 className="h-2.5 w-2.5" strokeWidth={2} />
                            {vehicle.transmission === "AUTOMATIQUE" ? "Auto" : "Manuel"}
                        </span>
                    )}

                    {vehicle.nombrePlaces && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide text-slate-900">
                            <Users className="h-2.5 w-2.5" strokeWidth={2} />
                            {vehicle.nombrePlaces} pl.
                        </span>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                    <div className={cn(
                        "flex flex-col items-center justify-center rounded-xl py-2.5 gap-0.5 border",
                        isActive && reservations > 0
                            ? "bg-emerald-50/70 border-emerald-100"
                            : "bg-slate-50/60 border-slate-100",
                    )}>
                        <CalendarCheck className={cn("h-3.5 w-3.5 mb-0.5", isActive ? "text-emerald-500" : "text-slate-800")} strokeWidth={2} />
                        <span className={cn("text-[16px] font-black tabular-nums leading-none", isActive ? "text-emerald-700" : "text-slate-900")}>{reservations}</span>
                        <span className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">Loc.</span>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-xl py-2.5 gap-0.5 bg-slate-50/60 border border-slate-100">
                        <Star className="h-3.5 w-3.5 mb-0.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                        <span className="text-[16px] font-black tabular-nums leading-none text-slate-900">
                            {vehicle.note > 0 ? Number(vehicle.note).toFixed(1) : "—"}
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">Note</span>
                    </div>

                    <div className={cn(
                        "flex flex-col items-center justify-center rounded-xl py-2.5 gap-0.5 border",
                        isActive && estimatedRevenue > 0
                            ? "bg-emerald-50/70 border-emerald-100"
                            : "bg-slate-50/60 border-slate-100",
                    )}>
                        <TrendingUp className={cn("h-3.5 w-3.5 mb-0.5", isActive && estimatedRevenue > 0 ? "text-emerald-500" : "text-slate-800")} strokeWidth={2} />
                        <span className={cn("text-[13px] font-black tabular-nums leading-none", isActive && estimatedRevenue > 0 ? "text-emerald-700" : "text-slate-900")}>
                            {estimatedRevenue > 0
                                ? new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(estimatedRevenue)
                                : "—"}
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wide">Revenu</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

                {/* Footer: city + quick actions */}
                <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-800 font-bold min-w-0">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-800" strokeWidth={2} />
                        <span className="truncate">{vehicle.ville}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isActive && (
                            <Link
                                href={`/vehicle/${vehicle.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                                title="Voir l'annonce"
                            >
                                <Eye className="h-3 w-3" strokeWidth={2} />
                                Annonce
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => onEdit(vehicle)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all duration-200"
                        >
                            <Pencil className="h-3 w-3" strokeWidth={2} />
                            Modifier
                        </button>
                    </div>
                </div>

                {/* Pending info banner */}
                {isPending && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" strokeWidth={2} />
                        <p className="text-[10px] font-semibold text-amber-700 leading-snug">
                            En cours de vérification par l&apos;équipe AutoLoc
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Vehicle row (list view) ────────────────────────────────────────────────────

const LIST_COLS = "80px 1fr 130px 160px 130px 150px 36px";

function VehicleRow({
    vehicle,
    archiving,
    onEdit,
    onArchive,
    onDelete,
    onOpen,
}: {
    vehicle: Vehicle;
    archiving: boolean;
    onEdit: (v: Vehicle) => void;
    onArchive: (v: Vehicle) => void;
    onDelete?: (v: Vehicle) => void;
    onOpen: (v: Vehicle) => void;
}) {
    const photo = mainPhoto(vehicle);
    const reservations = vehicle._count?.reservations ?? vehicle.totalLocations ?? 0;
    const isActive = vehicle.statut === "VERIFIE";

    const accentBorder = isActive ? "border-l-emerald-500"
        : vehicle.statut === "SUSPENDU" ? "border-l-red-400"
        : ["BROUILLON", "EN_ATTENTE_VALIDATION"].includes(vehicle.statut) ? "border-l-amber-400"
        : "border-l-slate-200";

    return (
        <div
            className={cn(
                "group relative grid items-center gap-5 rounded-2xl cursor-pointer",
                "border border-l-[3px] border-white/70",
                accentBorder,
                "bg-white/70 backdrop-blur-sm px-5 py-3.5",
                "hover:shadow-lg hover:shadow-slate-200/40 hover:bg-white/90 transition-all duration-200",
                archiving && "opacity-40 pointer-events-none",
            )}
            style={{ gridTemplateColumns: LIST_COLS }}
            onClick={() => onOpen(vehicle)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onOpen(vehicle); }}
        >
            {/* Thumbnail */}
            <div className="relative h-[52px] w-[72px] overflow-hidden rounded-xl bg-slate-100 shrink-0 border border-slate-100">
                {photo ? (
                    <Image
                        src={photo}
                        alt={`${vehicle.marque} ${vehicle.modele}`}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="72px"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Car className="h-5 w-5 text-slate-300" strokeWidth={1.25} />
                    </div>
                )}
            </div>

            {/* Name */}
            <div className="min-w-0">
                <p className="text-[14.5px] font-extrabold tracking-tight truncate text-slate-900">
                    {vehicle.marque} {vehicle.modele}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                    {vehicle.annee} · <span className="font-mono text-[10px]">{vehicle.immatriculation}</span>
                    {vehicle.carburant && (
                        <span className="text-slate-300 ml-1.5">· {FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}</span>
                    )}
                </p>
            </div>

            {/* Status */}
            <div className="flex flex-col items-start gap-1">
                <StatusChip statut={vehicle.statut} />
                {vehicle.estVerrouille && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                        Loué
                    </span>
                )}
            </div>

            {/* Price */}
            <div>
                <p className="text-[15px] font-black tracking-tight tabular-nums text-slate-900 leading-none">
                    {formatPrice(vehicle.prixParJour)}
                </p>
                <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-1">FCFA / jour</p>
            </div>

            {/* City */}
            <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={1.5} />
                <span className="text-[13px] font-medium text-slate-500 truncate">{vehicle.ville}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-[12px] text-slate-400">
                {vehicle.note > 0 && (
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                        <span className="font-bold text-slate-700 tabular-nums">{Number(vehicle.note).toFixed(1)}</span>
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.5} />
                    <span className="font-semibold text-slate-600 tabular-nums">{reservations}</span>
                </span>
                {vehicle.nombrePlaces && (
                    <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.5} />
                        <span className="font-semibold text-slate-600">{vehicle.nombrePlaces}</span>
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
                <VehicleActions vehicle={vehicle} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
            </div>
        </div>
    );
}

// ── Skeletons ──────────────────────────────────────────────────────────────────

function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white/70 backdrop-blur-sm">
                    <Skeleton className="h-[10.5rem] w-full rounded-none" />
                    <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4">
                        <div className="flex gap-1.5">
                            <Skeleton className="h-5 w-16 rounded-lg" />
                            <Skeleton className="h-5 w-14 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-14 rounded-xl" />
                            <Skeleton className="h-14 rounded-xl" />
                            <Skeleton className="h-14 rounded-xl" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <Skeleton className="h-6 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-slate-200 bg-white/40 backdrop-blur-sm py-20 text-center">
            <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl border",
                filtered ? "bg-slate-50 border-slate-200" : "bg-emerald-50 border-emerald-200",
            )}>
                {filtered
                    ? <AlertCircle className="h-7 w-7 text-slate-300" strokeWidth={1.25} />
                    : <Car className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
                }
            </div>
            <div className="space-y-1.5">
                <p className="text-[14px] font-black tracking-tight text-slate-700">
                    {filtered ? "Aucun véhicule dans ce filtre" : "Aucun véhicule pour l'instant"}
                </p>
                <p className="text-[12px] text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
                    {filtered
                        ? "Essayez un autre filtre pour voir vos véhicules."
                        : "Publiez votre premier véhicule pour commencer à générer des revenus."}
                </p>
            </div>
            {!filtered && (
                <Link
                    href="/dashboard/owner/vehicles/new"
                    className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5"
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
    const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState<Vehicle | null>(null);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(SECTIONS.map(s => [s.id, s.defaultOpen])),
    );

    const { authFetch } = useAuthFetch();
    const router = useRouter();

    const toggleSection = (id: string) =>
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

    const handleOpenVehicle = useCallback((v: Vehicle) => {
        router.push(`/dashboard/owner/vehicles/${v.id}`);
    }, [router]);

    const handleVehicleSaved = useCallback((updated: Vehicle) => {
        setVehicles(prev => prev.map(v => v.id === updated.id ? { ...updated, estVerrouille: v.estVerrouille } : v));
    }, []);

    const counts = useMemo(() => vehicles.reduce<Partial<Record<VehicleStatus, number>>>((acc, v) => {
        acc[v.statut] = (acc[v.statut] ?? 0) + 1;
        return acc;
    }, {}), [vehicles]);

    // Filtered list for specific filter tab
    const filtered = useMemo(() => {
        if (filter === "ARCHIVE") return vehicles.filter(v => v.statut === "ARCHIVE");
        if (filter === "all") return vehicles.filter(v => v.statut !== "ARCHIVE");
        return vehicles.filter(v => v.statut === filter);
    }, [vehicles, filter]);

    // Grouped sections for "All" view
    const grouped = useMemo(() =>
        SECTIONS.map(section => ({
            ...section,
            vehicles: vehicles.filter(v => section.statuses.includes(v.statut as VehicleStatus)),
        })).filter(g => g.vehicles.length > 0),
    [vehicles]);

    const handleArchiveConfirm = useCallback(async () => {
        if (!confirmVehicle) return;
        setArchivingId(confirmVehicle.id);
        try {
            await authFetch(VEHICLE_PATHS.archive(confirmVehicle.id), { method: "DELETE" });
            setVehicles(prev => prev.map(v => v.id === confirmVehicle.id ? { ...v, statut: "ARCHIVE" as const } : v));
            toast.success('Véhicule archivé. Les photos seront supprimées de Cloudinary dans 24h.');
        } catch (err: any) {
            toast.error(err?.message || 'Impossible d\'archiver ce véhicule.');
        } finally {
            setArchivingId(null);
            setConfirmVehicle(null);
        }
    }, [confirmVehicle, authFetch]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!confirmDeleteVehicle) return;
        setDeletingId(confirmDeleteVehicle.id);
        try {
            await authFetch(VEHICLE_PATHS.purgeDraft(confirmDeleteVehicle.id), { method: "DELETE" });
            setVehicles(prev => prev.filter(v => v.id !== confirmDeleteVehicle.id));
            toast.success('Véhicule supprimé définitivement.');
        } catch (err: any) {
            toast.error(err?.message || 'Impossible de supprimer ce véhicule.');
        } finally {
            setDeletingId(null);
            setConfirmDeleteVehicle(null);
        }
    }, [confirmDeleteVehicle, authFetch]);

    // Filter tab list (only show statuses with vehicles, plus "all")
    const visibleFilters: FilterKey[] = useMemo(() => [
        "all",
        ...([
            "VERIFIE", "EN_ATTENTE_VALIDATION", "BROUILLON",
            "SUSPENDU", "ARCHIVE",
        ] as VehicleStatus[]).filter(s => (counts[s] ?? 0) > 0),
    ], [counts]);

    const FILTER_LABELS: Record<FilterKey, string> = {
        all: "Tous",
        BROUILLON: "Brouillons",
        EN_ATTENTE_VALIDATION: "En attente",
        VERIFIE: "Actifs",
        SUSPENDU: "Suspendus",
        ARCHIVE: "Archivés",
    };

    // Correct count for "all" filter (excludes archived vehicles)
    const activeVehiclesCount = useMemo(() =>
        vehicles.filter(v => v.statut !== "ARCHIVE").length,
    [vehicles]);

    return (
        <div className="space-y-6">

            {/* ── Toolbar ────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-1 overflow-x-auto scrollbar-none">
                    {visibleFilters.map((f) => {
                        const count = f === "all" ? activeVehiclesCount : (counts[f as VehicleStatus] ?? 0);
                        const isActive = filter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-all duration-200 whitespace-nowrap",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-700 hover:bg-white/80",
                                )}
                            >
                                {FILTER_LABELS[f]}
                                {count > 0 && (
                                    <span className={cn(
                                        "rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums min-w-[18px] text-center",
                                        isActive ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-400",
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
                <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-1">
                    {(["grid", "list"] as const).map((v) => {
                        const Icon = v === "grid" ? LayoutGrid : List;
                        const isActiveView = view === v;
                        return (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                aria-label={v === "grid" ? "Vue grille" : "Vue liste"}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                                    isActiveView
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-700 hover:bg-white/80",
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ────────────────────────────────── */}

            {/* GROUPED VIEW (filter === all) */}
            {filter === "all" ? (
                vehicles.length === 0 ? (
                    <EmptyState filtered={false} />
                ) : (
                    <div className="space-y-5">
                        {grouped.map(group => {
                            const isOpen = openSections[group.id] ?? true;
                            return (
                                <section key={group.id}>
                                    <SectionHeader
                                        config={group}
                                        count={group.vehicles.length}
                                        isOpen={isOpen}
                                        onToggle={group.collapsible ? () => toggleSection(group.id) : undefined}
                                    />

                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300 ease-out",
                                        isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0",
                                    )}>
                                        {view === "grid" ? (
                                            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3 pt-1">
                                                {group.vehicles.map(v => (
                                                    <VehicleCard
                                                        key={v.id}
                                                        vehicle={v}
                                                        archiving={archivingId === v.id}
                                                        onEdit={setEditVehicle}
                                                        onArchive={setConfirmVehicle}
                                                        onDelete={setConfirmDeleteVehicle}
                                                        onOpen={handleOpenVehicle}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 pt-1">
                                                {group.vehicles.map(v => (
                                                    <VehicleRow
                                                        key={v.id}
                                                        vehicle={v}
                                                        archiving={archivingId === v.id}
                                                        onEdit={setEditVehicle}
                                                        onArchive={setConfirmVehicle}
                                                        onDelete={setConfirmDeleteVehicle}
                                                        onOpen={handleOpenVehicle}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                </section>
                            );
                        })}
                    </div>
                )
            ) : (
                /* FLAT FILTERED VIEW */
                filtered.length === 0 ? (
                    <EmptyState filtered />
                ) : view === "grid" ? (
                    <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(v => (
                            <VehicleCard
                                key={v.id}
                                vehicle={v}
                                archiving={archivingId === v.id}
                                onEdit={setEditVehicle}
                                onArchive={setConfirmVehicle}
                                onDelete={setConfirmDeleteVehicle}
                                onOpen={handleOpenVehicle}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="grid items-center gap-5 px-5 py-2" style={{ gridTemplateColumns: LIST_COLS }}>
                            {["", "Véhicule", "Statut", "Prix / jour", "Ville", "Stats", ""].map((col, i) => (
                                <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{col}</span>
                            ))}
                        </div>
                        {filtered.map(v => (
                            <VehicleRow
                                key={v.id}
                                vehicle={v}
                                archiving={archivingId === v.id}
                                onEdit={setEditVehicle}
                                onArchive={setConfirmVehicle}
                                onDelete={setConfirmDeleteVehicle}
                                onOpen={handleOpenVehicle}
                            />
                        ))}
                    </div>
                )
            )}

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
                <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-black tracking-tight text-lg">
                            Archiver ce véhicule ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed text-slate-500">
                            {confirmVehicle && (
                                <>
                                    <strong className="font-bold text-slate-800">
                                        {confirmVehicle.marque} {confirmVehicle.modele}
                                    </strong>{" "}
                                    sera retiré de la recherche et ses photos supprimées de Cloudinary dans 24h.
                                    Vous pourrez toujours le supprimer définitivement depuis les véhicules archivés.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchiveConfirm}
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {archivingId ? "Archivage…" : "Archiver"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete confirmation */}
            <AlertDialog
                open={!!confirmDeleteVehicle}
                onOpenChange={(open: boolean) => { if (!open) setConfirmDeleteVehicle(null); }}
            >
                <AlertDialogContent className="rounded-2xl border border-red-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-black tracking-tight text-lg text-red-900 flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-600" strokeWidth={2} />
                            Supprimer définitivement ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed text-slate-600">
                            {confirmDeleteVehicle && (
                                <>
                                    <strong className="font-bold text-slate-900">
                                        {confirmDeleteVehicle.marque} {confirmDeleteVehicle.modele}
                                    </strong>{" "}
                                    sera supprimé de manière <strong className="text-red-600">irréversible</strong>.
                                    <br /><br />
                                    <span className="text-red-700 font-semibold">
                                        ⚠️ Toutes les données (photos, historique, réservations) seront perdues définitivement.
                                    </span>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="rounded-xl bg-red-600 text-white hover:bg-red-700 gap-2 shadow-lg shadow-red-600/30"
                        >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            {deletingId ? "Suppression…" : "Supprimer définitivement"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export { GridSkeleton as OwnerFleetSkeleton };
