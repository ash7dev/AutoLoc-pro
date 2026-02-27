"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OwnerReservationCard } from "@/features/reservations/components/reservation-card";
import { Search, SlidersHorizontal, Zap, Clock, CheckCircle2, XCircle, AlertTriangle, Archive, ChevronDown } from "lucide-react";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   FILTER TABS
════════════════════════════════════════════════════════════════ */
const STATUS_FILTERS: {
    label: string;
    value: ReservationStatut | "ALL";
    icon?: React.ElementType;
    dot?: string;
}[] = [
    { label: "Tout",       value: "ALL" },
    { label: "À valider",  value: "PAYEE",      icon: Zap,           dot: "bg-amber-400" },
    { label: "Confirmées", value: "CONFIRMEE",  icon: CheckCircle2,  dot: "bg-blue-400" },
    { label: "En cours",   value: "EN_COURS",   icon: Clock,         dot: "bg-emerald-400" },
    { label: "Terminées",  value: "TERMINEE",   icon: Archive,       dot: "bg-slate-500" },
    { label: "Annulées",   value: "ANNULEE",    icon: XCircle,       dot: "bg-red-500" },
    { label: "Litiges",    value: "LITIGE",     icon: AlertTriangle, dot: "bg-orange-400" },
];

/* ════════════════════════════════════════════════════════════════
   PIPELINE SECTION META
════════════════════════════════════════════════════════════════ */
const SECTIONS = [
    {
        key: "urgent",
        label: "Action requise",
        statuts: ["PAYEE"],
        accent: { bar: "bg-amber-400", badge: "bg-amber-400/10 border-amber-400/20 text-amber-400", dot: "bg-amber-400 animate-pulse" },
    },
    {
        key: "active",
        label: "En cours",
        statuts: ["CONFIRMEE", "EN_COURS"],
        accent: { bar: "bg-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
    },
    {
        key: "pending",
        label: "En attente",
        statuts: ["INITIEE", "EN_ATTENTE_PAIEMENT"],
        accent: { bar: "bg-slate-600", badge: "bg-slate-700/40 border-slate-600/30 text-slate-400", dot: "bg-slate-500" },
    },
    {
        key: "litige",
        label: "Litiges",
        statuts: ["LITIGE"],
        accent: { bar: "bg-orange-400", badge: "bg-orange-400/10 border-orange-400/20 text-orange-400", dot: "bg-orange-400" },
    },
    {
        key: "closed",
        label: "Historique",
        statuts: ["TERMINEE", "ANNULEE"],
        accent: { bar: "bg-slate-700", badge: "bg-slate-800 border-slate-700/40 text-slate-500", dot: "bg-slate-600" },
    },
] as const;

/* ════════════════════════════════════════════════════════════════
   COLLAPSIBLE PIPELINE SECTION
════════════════════════════════════════════════════════════════ */
function PipelineSection({
    label,
    reservations,
    accent,
    defaultOpen = true,
}: {
    label: string;
    reservations: Reservation[];
    accent: (typeof SECTIONS)[number]["accent"];
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    if (reservations.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Section header */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 group"
            >
                <div className={cn("w-1 h-5 rounded-full flex-shrink-0", accent.bar)} />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-white">{label}</span>
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold",
                        accent.badge,
                    )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", accent.dot)} />
                        {reservations.length}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-all duration-200 flex-shrink-0",
                    open && "rotate-180",
                )} strokeWidth={2} />
            </button>

            {/* Cards grid */}
            {open && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pl-4">
                    {reservations.map(r => (
                        <OwnerReservationCard key={r.id} reservation={r} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center gap-4 py-20 rounded-2xl border border-dashed border-white/6 bg-white/2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <Archive className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
            </div>
            <div className="text-center">
                <p className="text-[14px] font-bold text-slate-400">
                    {query ? `Aucun résultat pour "${query}"` : "Aucune réservation"}
                </p>
                <p className="text-[12px] text-slate-600 mt-1">
                    {query ? "Modifiez votre recherche" : "Vos réservations apparaîtront ici"}
                </p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   STATS STRIP  (quick counts at top)
════════════════════════════════════════════════════════════════ */
function StatsStrip({ reservations }: { reservations: Reservation[] }) {
    const counts = {
        urgent:   reservations.filter(r => r.statut === "PAYEE").length,
        active:   reservations.filter(r => ["CONFIRMEE", "EN_COURS"].includes(r.statut)).length,
        total:    reservations.length,
    };
    if (counts.total === 0) return null;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {counts.urgent > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/8 border border-amber-400/15">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[12px] font-bold text-amber-400">{counts.urgent} à valider</span>
                </div>
            )}
            {counts.active > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-400/8 border border-emerald-400/15">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] font-bold text-emerald-400">{counts.active} actives</span>
                </div>
            )}
            <span className="text-[12px] font-medium text-slate-600 ml-auto">
                {counts.total} réservation{counts.total > 1 ? "s" : ""} au total
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
interface OwnerReservationsListProps {
    initialReservations: Reservation[];
}

export function OwnerReservationsList({ initialReservations }: OwnerReservationsListProps) {
    const [activeFilter, setActiveFilter] = useState<ReservationStatut | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    /* Client-side filter */
    const filtered = initialReservations.filter(r => {
        if (activeFilter !== "ALL" && r.statut !== activeFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                r.vehicule.marque.toLowerCase().includes(q) ||
                r.vehicule.modele.toLowerCase().includes(q) ||
                r.locataire.prenom.toLowerCase().includes(q) ||
                r.locataire.nom.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="space-y-5">

            {/* ── Stats strip ───────────────────────────────────── */}
            <StatsStrip reservations={initialReservations} />

            {/* ── Search + count ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Véhicule, locataire, ID…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium",
                            "bg-white/4 border border-white/8 text-white placeholder-slate-600",
                            "focus:outline-none focus:border-emerald-400/30 focus:ring-1 focus:ring-emerald-400/15",
                            "transition-all duration-200",
                        )}
                    />
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-[12px] font-semibold text-slate-500 flex-shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
                    {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* ── Status filter tabs ────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {STATUS_FILTERS.map(f => {
                    const count = f.value === "ALL"
                        ? initialReservations.length
                        : initialReservations.filter(r => r.statut === f.value).length;
                    const isActive = activeFilter === f.value;
                    if (f.value !== "ALL" && count === 0) return null;

                    return (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setActiveFilter(f.value)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 border",
                                isActive
                                    ? "bg-white text-slate-900 border-transparent shadow-sm"
                                    : "bg-white/4 text-slate-500 border-white/8 hover:bg-white/8 hover:text-slate-300",
                            )}
                        >
                            {f.dot && (
                                <span className={cn("w-1.5 h-1.5 rounded-full", f.dot, isActive ? "opacity-100" : "opacity-60")} />
                            )}
                            {f.label}
                            <span className={cn(
                                "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                isActive ? "bg-slate-900/10 text-slate-600" : "bg-white/6 text-slate-600",
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Empty ─────────────────────────────────────────── */}
            {filtered.length === 0 && <EmptyState query={searchQuery} />}

            {/* ── Pipeline view (ALL) ───────────────────────────── */}
            {activeFilter === "ALL" && filtered.length > 0 && (
                <div className="space-y-6">
                    {SECTIONS.map(section => (
                        <PipelineSection
                            key={section.key}
                            label={section.label}
                            reservations={filtered.filter(r => (section.statuts as readonly string[]).includes(r.statut))}
                            accent={section.accent}
                            defaultOpen={section.key !== "closed"}
                        />
                    ))}
                </div>
            )}

            {/* ── Flat list (filtered) ──────────────────────────── */}
            {activeFilter !== "ALL" && filtered.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(r => (
                        <OwnerReservationCard key={r.id} reservation={r} />
                    ))}
                </div>
            )}
        </div>
    );
}