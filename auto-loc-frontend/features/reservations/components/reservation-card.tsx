"use client";

import Link from "next/link";
import { Calendar, User, Car, FileText, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReservationStatusBadge } from "./reservation-status";
import type { Reservation } from "@/lib/nestjs/reservations";

/* ── Barre gauche colorée par urgence ────────────────────────── */
const LEFT_BAR: Record<string, string> = {
    PAYEE:               "before:bg-amber-400",
    EN_COURS:            "before:bg-emerald-500",
    LITIGE:              "before:bg-orange-400",
    ANNULEE:             "before:bg-red-400",
    CONFIRMEE:           "before:bg-indigo-400",
    EN_ATTENTE_PAIEMENT: "before:bg-amber-300",
    TERMINEE:            "before:bg-slate-300",
    INITIEE:             "before:bg-slate-200",
    EXPIREE:             "before:bg-slate-200",
};

interface OwnerReservationCardProps {
    reservation: Reservation;
    className?: string;
}

export function OwnerReservationCard({ reservation: r, className }: OwnerReservationCardProps) {
    const dateDebut = new Date(r.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const dateFin   = new Date(r.dateFin).toLocaleDateString("fr-FR",   { day: "numeric", month: "short", year: "numeric" });

    return (
        <Link
            href={`/dashboard/owner/reservations/${r.id}`}
            className={cn(
                /* structure */
                "group relative flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden",
                /* barre accent gauche */
                "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
                LEFT_BAR[r.statut] ?? "before:bg-slate-200",
                /* hover */
                "hover:shadow-lg hover:shadow-slate-200/80 hover:border-slate-200 hover:-translate-y-0.5",
                "transition-all duration-200",
                className,
            )}
        >
            {/* ── En-tête ───────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 pl-5 pr-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Icône véhicule */}
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-200",
                        "bg-slate-50 border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100",
                    )}>
                        <Car className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" strokeWidth={1.75} />
                    </div>
                    {/* Nom */}
                    <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-900 truncate leading-none">
                            {r.vehicule.marque}{" "}
                            <span className="text-emerald-500">{r.vehicule.modele}</span>
                        </p>
                        {r.vehicule.immatriculation && (
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-wide">
                                {r.vehicule.immatriculation}
                            </p>
                        )}
                    </div>
                </div>

                <ReservationStatusBadge status={r.statut} />
            </div>

            {/* ── Méta ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 pl-5 pr-4 pb-3">
                <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                    <span>{dateDebut} → {dateFin}</span>
                    <span className="text-slate-300 mx-0.5">·</span>
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                    <span>{r.nbJours}j</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                    <User className="w-3 h-3 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{r.locataire.prenom} {r.locataire.nom}</span>
                </div>
            </div>

            {/* ── Pied de carte ─────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2 pl-5 pr-4 py-3 border-t border-slate-100 mt-auto bg-slate-50/50">
                {/* Revenu net */}
                <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                        Revenu net
                    </p>
                    <p className="text-[17px] font-black text-emerald-600 tabular-nums leading-none">
                        {Number(r.montantProprietaire ?? 0).toLocaleString("fr-FR")}
                        <span className="text-[10px] font-semibold text-emerald-500/60 ml-1">FCFA</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {r.contratUrl && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-500">
                            <FileText className="w-3 h-3" strokeWidth={2} />
                            Contrat
                        </span>
                    )}
                    <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200",
                        "bg-slate-100 group-hover:bg-emerald-500",
                    )}>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}