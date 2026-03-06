"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OwnerReservationCard } from "@/features/reservations/components/reservation-card";
import { Search, Archive, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   FILTER TABS
════════════════════════════════════════════════════════════════ */
const FILTERS: { label: string; value: ReservationStatut | "ALL"; dot?: string }[] = [
    { label: "Toutes", value: "ALL" },
    { label: "À valider", value: "PAYEE", dot: "bg-black" },
    { label: "Confirmées", value: "CONFIRMEE", dot: "bg-indigo-400" },
    { label: "En cours", value: "EN_COURS", dot: "bg-emerald-500" },
    { label: "Terminées", value: "TERMINEE", dot: "bg-slate-400" },
    { label: "Annulées", value: "ANNULEE", dot: "bg-red-400" },
    { label: "Litiges", value: "LITIGE", dot: "bg-orange-400" },
];

/* ════════════════════════════════════════════════════════════════
   PIPELINE SECTIONS
════════════════════════════════════════════════════════════════ */
const SECTIONS = [
    {
        key: "urgent", label: "Action requise",
        statuts: ["PAYEE"] as string[],
        bar: "bg-black",
        dotCls: "bg-white animate-pulse",
        countCls: "bg-white/20 border-white/10 text-white",
        defaultOpen: true,
    },
    {
        key: "active", label: "Actives",
        statuts: ["CONFIRMEE", "EN_COURS"] as string[],
        bar: "bg-emerald-500",
        dotCls: "bg-emerald-400 animate-pulse",
        countCls: "bg-emerald-400/15 border-emerald-400/30 text-emerald-400",
        defaultOpen: true,
    },
    {
        key: "pending", label: "En attente",
        statuts: ["INITIEE", "EN_ATTENTE_PAIEMENT"] as string[],
        bar: "bg-slate-400",
        dotCls: "bg-slate-400",
        countCls: "bg-white/8 border-white/10 text-slate-400",
        defaultOpen: true,
    },
    {
        key: "litige", label: "Litiges",
        statuts: ["LITIGE"] as string[],
        bar: "bg-orange-400",
        dotCls: "bg-orange-400 animate-pulse",
        countCls: "bg-orange-400/15 border-orange-400/30 text-orange-400",
        defaultOpen: true,
    },
    {
        key: "closed", label: "Historique",
        statuts: ["TERMINEE", "ANNULEE"] as string[],
        bar: "bg-white/15",
        dotCls: "bg-white/20",
        countCls: "bg-white/6 border-white/8 text-slate-500",
        defaultOpen: false,
    },
] as const;

/* ── Pipeline section ─────────────────────────────────────────── */
function PipelineSection({
    section,
    reservations,
}: {
    section: typeof SECTIONS[number];
    reservations: Reservation[];
}) {
    const [open, setOpen] = useState(section.defaultOpen);
    if (reservations.length === 0) return null;

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 group"
            >
                <div className={cn("w-[3px] h-5 rounded-full flex-shrink-0", section.bar)} />
                <div className="flex items-center gap-2.5 flex-1 bg-slate-900 rounded-xl px-3.5 py-2.5 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", section.dotCls)} />
                    <span className="text-[12px] font-black uppercase tracking-[0.1em] text-white/80 group-hover:text-white transition-colors flex-1 text-left">
                        {section.label}
                    </span>
                    <span className={cn(
                        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full border text-[10px] font-black tabular-nums",
                        section.countCls,
                    )}>
                        {reservations.length}
                    </span>
                    <ChevronDown className={cn(
                        "w-3.5 h-3.5 text-white/25 group-hover:text-white/60 transition-all flex-shrink-0",
                        open && "rotate-180",
                    )} strokeWidth={2.5} />
                </div>
            </button>

            {open && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pl-4">
                    {reservations.map(r => <OwnerReservationCard key={r.id} reservation={r} />)}
                </div>
            )}
        </div>
    );
}

/* ── Stats strip ──────────────────────────────────────────────── */
function StatsStrip({ reservations }: { reservations: Reservation[] }) {
    const urgent = reservations.filter(r => r.statut === "PAYEE").length;
    const active = reservations.filter(r => ["CONFIRMEE", "EN_COURS"].includes(r.statut)).length;
    if (reservations.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {urgent > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-black text-[11.5px] font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {urgent} à valider
                </span>
            )}
            {active > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {active} active{active > 1 ? "s" : ""}
                </span>
            )}
            <span className="ml-auto text-[12px] font-medium text-slate-400 tabular-nums">
                {reservations.length} réservation{reservations.length > 1 ? "s" : ""} au total
            </span>
        </div>
    );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center gap-4 py-20 rounded-2xl border border-dashed border-slate-200 bg-white">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Archive className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-center">
                <p className="text-[14px] font-bold text-slate-500">
                    {query ? `Aucun résultat pour « ${query} »` : "Aucune réservation"}
                </p>
                <p className="text-[12px] text-slate-400 mt-1">
                    {query ? "Essayez un autre terme" : "Vos réservations apparaîtront ici"}
                </p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
export function OwnerReservationsList({
    initialReservations,
}: {
    initialReservations: Reservation[];
}) {
    const [activeFilter, setActiveFilter] = useState<ReservationStatut | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

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

            <StatsStrip reservations={initialReservations} />

            {/* Dark search bar */}
            <div className="flex gap-2.5 bg-slate-900 rounded-2xl p-2.5">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Véhicule, locataire, référence…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium bg-white/6 border border-white/8 text-white placeholder-white/25 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all"
                    />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/6 border border-white/8 text-[12px] font-bold text-white/40 tabular-nums flex-shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
                    {filtered.length}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTERS.map(f => {
                    const count = f.value === "ALL"
                        ? initialReservations.length
                        : initialReservations.filter(r => r.statut === f.value).length;
                    if (f.value !== "ALL" && count === 0) return null;
                    const isActive = activeFilter === f.value;

                    return (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setActiveFilter(f.value)}
                            className={cn(
                                "flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150",
                                isActive
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800 shadow-sm",
                            )}
                        >
                            {f.dot && (
                                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", f.dot, !isActive && "opacity-60")} />
                            )}
                            {f.label}
                            <span className={cn(
                                "text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full",
                                isActive ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-500",
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 && <EmptyState query={searchQuery} />}

            {/* Pipeline */}
            {activeFilter === "ALL" && filtered.length > 0 && (
                <div className="space-y-4">
                    {SECTIONS.map(section => (
                        <PipelineSection
                            key={section.key}
                            section={section}
                            reservations={filtered.filter(r => section.statuts.includes(r.statut))}
                        />
                    ))}
                </div>
            )}

            {/* Flat filtered list */}
            {activeFilter !== "ALL" && filtered.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(r => <OwnerReservationCard key={r.id} reservation={r} />)}
                </div>
            )}
        </div>
    );
}