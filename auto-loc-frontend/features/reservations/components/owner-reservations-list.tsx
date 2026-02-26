"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OwnerReservationCard } from "@/features/reservations/components/reservation-card";
import { ReservationStatusBadge } from "@/features/reservations/components/reservation-status";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

// ── Filter Tabs ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: ReservationStatut | "ALL" }[] = [
    { label: "Tout", value: "ALL" },
    { label: "Payées", value: "PAYEE" },
    { label: "Confirmées", value: "CONFIRMEE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminées", value: "TERMINEE" },
    { label: "Annulées", value: "ANNULEE" },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface OwnerReservationsListProps {
    initialReservations: Reservation[];
}

export function OwnerReservationsList({ initialReservations }: OwnerReservationsListProps) {
    const [activeFilter, setActiveFilter] = useState<ReservationStatut | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side filtering
    const filtered = initialReservations.filter((r) => {
        if (activeFilter !== "ALL" && r.statut !== activeFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
                r.vehicule.marque.toLowerCase().includes(q) ||
                r.vehicule.modele.toLowerCase().includes(q) ||
                r.locataire.prenom.toLowerCase().includes(q) ||
                r.locataire.nom.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q);
            if (!match) return false;
        }
        return true;
    });

    // Group by status for pipeline view
    const urgent = filtered.filter((r) => r.statut === "PAYEE");
    const active = filtered.filter((r) => ["CONFIRMEE", "EN_COURS"].includes(r.statut));
    const closed = filtered.filter((r) => ["TERMINEE", "ANNULEE", "EXPIREE"].includes(r.statut));
    const other = filtered.filter((r) => ["INITIEE", "EN_ATTENTE_PAIEMENT"].includes(r.statut));

    return (
        <div className="space-y-4">
            {/* ── Search + Filter Bar ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher par véhicule, locataire..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-background text-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* ── Status Filter Tabs ───────────────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={cn(
                            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                            activeFilter === f.value
                                ? "bg-black text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        {f.label}
                        {f.value !== "ALL" && (
                            <span className="ml-1.5 opacity-60">
                                {initialReservations.filter((r) => r.statut === f.value).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Empty State ──────────────────────────────────────────────── */}
            {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-card p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        {searchQuery
                            ? `Aucun résultat pour "${searchQuery}"`
                            : "Aucune réservation pour ce filtre"}
                    </p>
                </div>
            )}

            {/* ── Pipeline View ────────────────────────────────────────────── */}
            {activeFilter === "ALL" && filtered.length > 0 && (
                <div className="space-y-6">
                    {urgent.length > 0 && (
                        <Section title="🔴 Action requise" count={urgent.length} variant="urgent">
                            {urgent.map((r) => <OwnerReservationCard key={r.id} reservation={r} />)}
                        </Section>
                    )}
                    {active.length > 0 && (
                        <Section title="🟢 Actives" count={active.length} variant="active">
                            {active.map((r) => <OwnerReservationCard key={r.id} reservation={r} />)}
                        </Section>
                    )}
                    {other.length > 0 && (
                        <Section title="🟡 En attente" count={other.length} variant="pending">
                            {other.map((r) => <OwnerReservationCard key={r.id} reservation={r} />)}
                        </Section>
                    )}
                    {closed.length > 0 && (
                        <Section title="Historique" count={closed.length} variant="closed">
                            {closed.map((r) => <OwnerReservationCard key={r.id} reservation={r} />)}
                        </Section>
                    )}
                </div>
            )}

            {/* ── Flat list when filtered ───────────────────────────────────── */}
            {activeFilter !== "ALL" && filtered.length > 0 && (
                <div className="grid gap-3">
                    {filtered.map((r) => <OwnerReservationCard key={r.id} reservation={r} />)}
                </div>
            )}
        </div>
    );
}

// ── Section Helper ─────────────────────────────────────────────────────────────

function Section({
    title,
    count,
    variant,
    children,
}: {
    title: string;
    count: number;
    variant: "urgent" | "active" | "pending" | "closed";
    children: React.ReactNode;
}) {
    const colors = {
        urgent: "border-l-red-500",
        active: "border-l-emerald-500",
        pending: "border-l-amber-500",
        closed: "border-l-slate-300",
    };

    return (
        <div className={cn("border-l-2 pl-4", colors[variant])}>
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </div>
    );
}
