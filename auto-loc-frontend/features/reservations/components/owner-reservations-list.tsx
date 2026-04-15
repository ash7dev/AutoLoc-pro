"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { OwnerReservationCard } from "@/features/reservations/components/reservation-card";
import Link from "next/link";
import {
    Archive, Car, Zap, CheckCircle2, Timer, Clock,
    XCircle, AlertTriangle, ChevronDown,
} from "lucide-react";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   FILTER TABS
════════════════════════════════════════════════════════════════ */
const FILTERS: { label: string; value: ReservationStatut | "ALL"; dot?: string; icon?: React.ElementType }[] = [
    { label: "Toutes",     value: "ALL",       icon: Car },
    { label: "À valider",  value: "PAYEE",     dot: "bg-amber-500",   icon: Zap },
    { label: "Confirmées", value: "CONFIRMEE", dot: "bg-emerald-500", icon: CheckCircle2 },
    { label: "En cours",   value: "EN_COURS",  dot: "bg-blue-500",    icon: Timer },
    { label: "Terminées",  value: "TERMINEE",  dot: "bg-slate-300",   icon: Clock },
    { label: "Annulées",   value: "ANNULEE",   dot: "bg-red-400",     icon: XCircle },
    { label: "Litiges",    value: "LITIGE",    dot: "bg-orange-400",  icon: AlertTriangle },
];

/* ════════════════════════════════════════════════════════════════
   SECTION GROUPS (for "Toutes" view)
════════════════════════════════════════════════════════════════ */
interface SectionConfig {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    statuses: string[];
    collapsible: boolean;
    defaultOpen: boolean;
}

const SECTIONS: SectionConfig[] = [
    {
        id: "urgent",
        title: "Action requise",
        subtitle: "Ces réservations nécessitent votre validation",
        icon: Zap,
        iconBg: "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200",
        iconColor: "text-amber-600",
        statuses: ["PAYEE"],
        collapsible: false,
        defaultOpen: true,
    },
    {
        id: "active",
        title: "Réservations actives",
        subtitle: "Confirmées et en cours de location",
        icon: Timer,
        iconBg: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
        iconColor: "text-emerald-600",
        statuses: ["CONFIRMEE", "EN_COURS"],
        collapsible: false,
        defaultOpen: true,
    },
    {
        id: "disputes",
        title: "Litiges",
        subtitle: "Réservations nécessitant un suivi",
        icon: AlertTriangle,
        iconBg: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
        iconColor: "text-orange-600",
        statuses: ["LITIGE"],
        collapsible: false,
        defaultOpen: true,
    },
    {
        id: "history",
        title: "Historique",
        subtitle: "Réservations terminées et annulées",
        icon: Archive,
        iconBg: "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200",
        iconColor: "text-slate-500",
        statuses: ["TERMINEE", "ANNULEE"],
        collapsible: true,
        defaultOpen: false,
    },
];

/* ── Stats strip ──────────────────────────────────────────────── */
function StatsStrip({ reservations }: { reservations: Reservation[] }) {
    const urgent = reservations.filter(r => r.statut === "PAYEE").length;
    const active = reservations.filter(r => ["CONFIRMEE", "EN_COURS"].includes(r.statut)).length;
    const litiges = reservations.filter(r => r.statut === "LITIGE").length;
    if (reservations.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {urgent > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-[11.5px] font-bold text-white shadow-md shadow-amber-500/20">
                    <Zap className="w-3 h-3" strokeWidth={2.5} />
                    {urgent} à valider
                </span>
            )}
            {active > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {active} active{active > 1 ? "s" : ""}
                </span>
            )}
            {litiges > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[11.5px] font-bold text-orange-700">
                    <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                    {litiges} litige{litiges > 1 ? "s" : ""}
                </span>
            )}
            <span className="ml-auto text-[12px] font-medium text-slate-400 tabular-nums">
                {reservations.length} réservation{reservations.length > 1 ? "s" : ""}
            </span>
        </div>
    );
}

/* ── Section header ───────────────────────────────────────────── */
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
    const Wrapper = config.collapsible ? "button" : "div";

    return (
        <Wrapper
            {...(config.collapsible ? { type: "button" as const, onClick: onToggle } : {})}
            className={cn(
                "flex items-center gap-3 w-full py-3 group",
                config.collapsible && "cursor-pointer",
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0",
                config.iconBg,
            )}>
                <Icon className={cn("w-4 h-4", config.iconColor)} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-black text-slate-800 tracking-tight">
                        {config.title}
                    </h3>
                    <span className="text-[10px] font-bold tabular-nums text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {count}
                    </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                    {config.subtitle}
                </p>
            </div>
            {config.collapsible && (
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0",
                    isOpen && "rotate-180",
                )} strokeWidth={2} />
            )}
        </Wrapper>
    );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 rounded-2xl border border-dashed border-slate-200 bg-white/60 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                <Archive className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-center">
                <p className="text-[13.5px] font-bold text-slate-500">Aucune réservation</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Les réservations de vos locataires apparaîtront ici une fois vos véhicules publiés.
                </p>
            </div>
            <Link
                href="/dashboard/owner/vehicles"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
                <Car className="w-3.5 h-3.5" strokeWidth={2} />
                Gérer mes véhicules
            </Link>
        </div>
    );
}

/* ── Empty for filtered view ─────────────────────────────────── */
function EmptyFiltered({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-white/40 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Archive className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[12px] font-medium text-slate-400">
                Aucune réservation «&thinsp;{label}&thinsp;»
            </p>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function OwnerReservationsList({
    initialReservations,
}: {
    initialReservations: Reservation[];
}) {
    const [activeFilter, setActiveFilter] = useState<ReservationStatut | "ALL">("ALL");
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(SECTIONS.map(s => [s.id, s.defaultOpen])),
    );

    const toggleSection = (id: string) =>
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

    /* Flat filtered list (for specific tab) */
    const filtered = useMemo(() => {
        if (activeFilter === "ALL") return initialReservations;
        return initialReservations.filter(r => r.statut === activeFilter);
    }, [initialReservations, activeFilter]);

    /* Grouped by section (for "Toutes") */
    const grouped = useMemo(() => {
        return SECTIONS.map(section => ({
            ...section,
            reservations: initialReservations.filter(r => section.statuses.includes(r.statut)),
        })).filter(g => g.reservations.length > 0);
    }, [initialReservations]);

    const activeLabel = FILTERS.find(f => f.value === activeFilter)?.label ?? "Toutes";

    return (
        <div className="space-y-5">

            <StatsStrip reservations={initialReservations} />

            {/* ── Filter tabs ────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {FILTERS.map(f => {
                    const count = f.value === "ALL"
                        ? initialReservations.length
                        : initialReservations.filter(r => r.statut === f.value).length;
                    if (f.value !== "ALL" && count === 0) return null;
                    const isActive = activeFilter === f.value;
                    const Icon = f.icon;

                    return (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setActiveFilter(f.value)}
                            className={cn(
                                "flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-200",
                                isActive
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/15"
                                    : "bg-white/70 backdrop-blur-sm text-slate-500 border-slate-200/60 hover:border-slate-300 hover:text-slate-800 hover:bg-white",
                            )}
                        >
                            {f.dot && (
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    f.dot,
                                    !isActive && "opacity-50",
                                )} />
                            )}
                            {!f.dot && Icon && (
                                <Icon className={cn("w-3 h-3 flex-shrink-0", isActive ? "text-emerald-400" : "text-slate-400")} strokeWidth={2} />
                            )}
                            {f.label}
                            <span className={cn(
                                "text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full",
                                isActive ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-400",
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════
                GROUPED VIEW (Toutes)
            ══════════════════════════════════════════════ */}
            {activeFilter === "ALL" ? (
                initialReservations.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-6">
                        {grouped.map(group => {
                            const isOpen = openSections[group.id] ?? true;

                            return (
                                <section key={group.id}>
                                    <SectionHeader
                                        config={group}
                                        count={group.reservations.length}
                                        isOpen={isOpen}
                                        onToggle={group.collapsible ? () => toggleSection(group.id) : undefined}
                                    />

                                    {/* Animated content area */}
                                    <div className={cn(
                                        "transition-all duration-300 ease-out overflow-hidden",
                                        isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
                                    )}>
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 pt-1">
                                            {group.reservations.map(r => (
                                                <OwnerReservationCard key={r.id} reservation={r} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section divider */}
                                    <div className="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                                </section>
                            );
                        })}
                    </div>
                )
            ) : (
                /* ══════════════════════════════════════════
                    FLAT VIEW (specific filter)
                ══════════════════════════════════════════ */
                filtered.length === 0 ? (
                    <EmptyFiltered label={activeLabel} />
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(r => (
                            <OwnerReservationCard key={r.id} reservation={r} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
