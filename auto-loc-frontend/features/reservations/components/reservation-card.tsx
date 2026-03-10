"use client";

import Link from "next/link";
import { CalendarRange, UserRound, CarFront, FileText, ArrowRight, Clock, Truck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReservationStatusBadge } from "./reservation-status";
import type { Reservation } from "@/lib/nestjs/reservations";

type LegacyAmounts = {
    totalLocataire?: string;
    montantCommission?: string;
    netProprietaire?: string;
};

/* ── Barre accent gauche ─────────────────────────────────────── */
const ACCENT_BAR: Record<string, string> = {
    PAYEE: "before:bg-slate-900",
    EN_COURS: "before:bg-emerald-500",
    LITIGE: "before:bg-orange-400",
    ANNULEE: "before:bg-red-400",
    CONFIRMEE: "before:bg-indigo-400",
    EN_ATTENTE_PAIEMENT: "before:bg-slate-300",
    TERMINEE: "before:bg-slate-200",
    INITIEE: "before:bg-slate-100",
    EXPIREE: "before:bg-slate-100",
};

export function OwnerReservationCard({
    reservation: r,
    className,
}: {
    reservation: Reservation;
    className?: string;
}) {
    const legacy = r as Reservation & LegacyAmounts;
    const revenue = Number(r.montantProprietaire ?? legacy.netProprietaire ?? 0);
    const isPaye = r.statut === "PAYEE";
    const hasDelivery = !!r.adresseLivraison;

    const dateDebut = new Date(r.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const dateFin = new Date(r.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

    return (
        <Link
            href={`/dashboard/owner/reservations/${r.id}`}
            className={cn(
                /* Layout */
                "group relative flex flex-col bg-white rounded-2xl overflow-hidden border",
                /* Accent bar — 3px left */
                "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[3px] before:rounded-full",
                ACCENT_BAR[r.statut] ?? "before:bg-slate-100",
                /* Border */
                isPaye ? "border-slate-200" : "border-slate-100",
                /* Hover */
                "hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1 hover:border-slate-200",
                "transition-all duration-300 ease-out",
                className,
            )}
        >
            {/* ══ HEADER ══════════════════════════════════════════════ */}
            <div className="flex items-start justify-between gap-3 pl-6 pr-4 pt-4 pb-3">

                <div className="flex items-center gap-3 min-w-0">
                    {/* Vehicle icon badge */}
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300",
                        isPaye
                            ? "bg-slate-900 border-slate-900 group-hover:bg-slate-800"
                            : "bg-gradient-to-br from-emerald-50 to-white border-emerald-100 group-hover:from-emerald-100",
                    )}>
                        <CarFront className={cn(
                            "w-4.5 h-4.5 transition-colors",
                            isPaye ? "text-emerald-400" : "text-emerald-500",
                        )} strokeWidth={1.75} />
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                        <p className="text-[13.5px] font-black text-slate-900 truncate leading-none">
                            {r.vehicule.marque}{" "}
                            <span className="text-emerald-500">{r.vehicule.modele}</span>
                        </p>
                        {r.vehicule.immatriculation && (
                            <p className="text-[10px] font-mono text-slate-400 mt-[3px] tracking-wider">
                                {r.vehicule.immatriculation}
                            </p>
                        )}
                    </div>
                </div>

                <ReservationStatusBadge status={r.statut} size="sm" />
            </div>

            {/* ══ META ════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-2 pl-6 pr-4 pb-4">
                {/* Dates with icon badge */}
                <div className="flex items-center gap-2.5 text-[11.5px] font-medium text-slate-500">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <CalendarRange className="w-3 h-3 text-blue-500" strokeWidth={2} />
                    </span>
                    <span>{dateDebut} → {dateFin}</span>
                    <span className="text-slate-300">·</span>
                    <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3 h-3 text-amber-500" strokeWidth={2} />
                    </span>
                    <span className="font-bold">{r.nbJours}j</span>
                </div>

                {/* Tenant with icon badge */}
                <div className="flex items-center gap-2.5 text-[11.5px] font-medium text-slate-500">
                    <span className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <UserRound className="w-3 h-3 text-violet-500" strokeWidth={2} />
                    </span>
                    <span className="truncate">{r.locataire.prenom} {r.locataire.nom}</span>
                </div>

                {/* Delivery badge */}
                {hasDelivery && (
                    <div className="flex items-center gap-2.5 text-[11.5px] font-medium text-slate-500">
                        <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Truck className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                        </span>
                        <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" strokeWidth={2} />
                            <span className="truncate text-emerald-600 font-semibold">{r.adresseLivraison}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ FOOTER ══════════════════════════════════════════════ */}
            <div className={cn(
                "flex items-center justify-between gap-3 pl-6 pr-4 py-3 border-t mt-auto transition-colors duration-300",
                isPaye
                    ? "bg-slate-900 border-slate-900/10 group-hover:bg-slate-800"
                    : "bg-slate-50/60 border-slate-100",
            )}>

                {/* Revenue */}
                <div>
                    <p className={cn(
                        "text-[9px] font-black uppercase tracking-[0.14em] mb-0.5",
                        isPaye ? "text-white/30" : "text-slate-400",
                    )}>
                        Revenu net
                    </p>
                    <p className={cn(
                        "text-[18px] font-black tabular-nums leading-none",
                        isPaye ? "text-emerald-400" : "text-emerald-600",
                    )}>
                        {revenue.toLocaleString("fr-FR")}
                        <span className={cn(
                            "text-[10px] font-semibold ml-1",
                            isPaye ? "text-emerald-400/50" : "text-emerald-500/50",
                        )}>FCFA</span>
                    </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {r.contratUrl && (
                        <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border",
                            isPaye
                                ? "bg-white/8 border-white/10 text-white/50"
                                : "bg-blue-50 border-blue-100 text-blue-500",
                        )}>
                            <FileText className="w-3 h-3" strokeWidth={2} />
                            Contrat
                        </span>
                    )}

                    {hasDelivery && (
                        <span className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border",
                            isPaye
                                ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-400"
                                : "bg-emerald-50 border-emerald-100 text-emerald-600",
                        )}>
                            <Truck className="w-3 h-3" strokeWidth={2} />
                            Livraison
                        </span>
                    )}

                    {/* Arrow button */}
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                        isPaye
                            ? "bg-white/8 group-hover:bg-emerald-500"
                            : "bg-white border border-slate-200 group-hover:bg-emerald-500 group-hover:border-emerald-500",
                    )}>
                        <ArrowRight className={cn(
                            "w-3.5 h-3.5 group-hover:text-white group-hover:translate-x-0.5 transition-all",
                            isPaye ? "text-white/30" : "text-slate-400",
                        )} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}