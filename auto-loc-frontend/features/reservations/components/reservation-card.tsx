"use client";

import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReservationStatusBadge } from "./reservation-status";
import type { Reservation } from "@/lib/nestjs/reservations";

type LegacyAmounts = {
    totalLocataire?: string;
    netProprietaire?: string;
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
    const isUrgent = r.statut === "PAYEE";
    const hasDelivery = !!r.adresseLivraison;

    const dateDebut = new Date(r.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const dateFin   = new Date(r.dateFin  ).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const initials  = `${r.locataire.prenom[0]}${r.locataire.nom[0]}`.toUpperCase();

    return (
        <Link
            href={`/dashboard/owner/reservations/${r.id}`}
            className={cn(
                "group relative flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden",
                "hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-[2px] hover:border-slate-300",
                "transition-all duration-200 ease-out",
                isUrgent ? "border-slate-300" : "border-slate-200/70",
                className,
            )}
        >
            {/* Urgency accent — thin top line for PAYEE */}
            {isUrgent && (
                <div className="h-[2.5px] w-full bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900" />
            )}

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3.5">
                <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-black text-slate-900 truncate leading-tight tracking-[-0.01em]">
                        {r.vehicule.marque}{" "}
                        <span className="text-emerald-500">{r.vehicule.modele}</span>
                    </p>
                    {r.vehicule.immatriculation && (
                        <p className="text-[10.5px] font-mono text-slate-400 mt-[3px] tracking-wider">
                            {r.vehicule.immatriculation}
                        </p>
                    )}
                </div>
                <ReservationStatusBadge status={r.statut} size="sm" />
            </div>

            {/* ── Divider ────────────────────────────────── */}
            <div className="mx-5 h-px bg-slate-100" />

            {/* ── Body ───────────────────────────────────── */}
            <div className="px-5 py-3.5 flex-1 space-y-2">

                {/* Dates + duration */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-slate-500">
                        {dateDebut}
                        <span className="mx-1.5 text-slate-300">→</span>
                        {dateFin}
                    </span>
                    <span className="flex-shrink-0 text-[10.5px] font-bold text-slate-500 tabular-nums bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                        {r.nbJours}j
                    </span>
                </div>

                {/* Tenant */}
                <div className="flex items-center gap-2">
                    <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-black text-emerald-700 leading-none">{initials}</span>
                    </div>
                    <span className="text-[12px] font-medium text-slate-600 truncate">
                        {r.locataire.prenom} {r.locataire.nom}
                    </span>
                </div>

                {/* Delivery — inline, no badge */}
                {hasDelivery && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                        <Truck className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                        <span className="truncate">{r.adresseLivraison}</span>
                    </div>
                )}
            </div>

            {/* ── Footer ─────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/40 mt-auto">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                        Revenu net
                    </p>
                    <p className="text-[18px] font-black text-emerald-600 tabular-nums leading-none mt-0.5">
                        {revenue.toLocaleString("fr-FR")}
                        <span className="text-[10px] font-semibold text-emerald-400/70 ml-1">FCFA</span>
                    </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-200">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
                </div>
            </div>
        </Link>
    );
}
