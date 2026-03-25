"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OwnerReservationCard } from "@/features/reservations/components/reservation-card";
import Link from "next/link";
import { Archive, Car } from "lucide-react";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   FILTER TABS
════════════════════════════════════════════════════════════════ */
const FILTERS: { label: string; value: ReservationStatut | "ALL"; dot?: string }[] = [
    { label: "Toutes",     value: "ALL" },
    { label: "À valider",  value: "PAYEE",    dot: "bg-slate-700" },
    { label: "Confirmées", value: "CONFIRMEE", dot: "bg-emerald-500" },
    { label: "En cours",   value: "EN_COURS",  dot: "bg-emerald-500" },
    { label: "Terminées",  value: "TERMINEE",  dot: "bg-slate-300" },
    { label: "Annulées",   value: "ANNULEE",   dot: "bg-red-400" },
    { label: "Litiges",    value: "LITIGE",    dot: "bg-orange-400" },
];

/* ── Stats strip ──────────────────────────────────────────────── */
function StatsStrip({ reservations }: { reservations: Reservation[] }) {
    const urgent = reservations.filter(r => r.statut === "PAYEE").length;
    const active  = reservations.filter(r => ["CONFIRMEE", "EN_COURS"].includes(r.statut)).length;
    if (reservations.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {urgent > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11.5px] font-bold text-white">
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
                {reservations.length} réservation{reservations.length > 1 ? "s" : ""}
            </span>
        </div>
    );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 rounded-2xl border border-dashed border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Archive className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-center">
                <p className="text-[13.5px] font-bold text-slate-500">Aucune réservation</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Les réservations de vos locataires apparaîtront ici une fois vos véhicules publiés.
                </p>
            </div>
            <Link
                href="/dashboard/owner/vehicles"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-slate-800 transition-colors"
            >
                <Car className="w-3.5 h-3.5" strokeWidth={2} />
                Gérer mes véhicules
            </Link>
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

    const filtered = activeFilter === "ALL"
        ? initialReservations
        : initialReservations.filter(r => r.statut === activeFilter);

    return (
        <div className="space-y-5">

            <StatsStrip reservations={initialReservations} />

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
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800",
                            )}
                        >
                            {f.dot && (
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    f.dot,
                                    !isActive && "opacity-50",
                                )} />
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

            {/* Cards grid — flat, no pipeline sections */}
            {filtered.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(r => (
                        <OwnerReservationCard key={r.id} reservation={r} />
                    ))}
                </div>
            )}

        </div>
    );
}
