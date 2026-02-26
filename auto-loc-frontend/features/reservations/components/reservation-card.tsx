"use client";

import Link from "next/link";
import { Calendar, User, Car, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReservationStatusBadge } from "./reservation-status";
import type { Reservation } from "@/lib/nestjs/reservations";

// ── Component ──────────────────────────────────────────────────────────────────

interface OwnerReservationCardProps {
    reservation: Reservation;
    className?: string;
}

export function OwnerReservationCard({ reservation: r, className }: OwnerReservationCardProps) {
    const dateDebut = new Date(r.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const dateFin = new Date(r.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

    return (
        <Link
            href={`/dashboard/owner/reservations/${r.id}`}
            className={cn(
                "group block rounded-xl border border-[hsl(var(--border))] bg-card p-4",
                "hover:shadow-md hover:border-slate-300 transition-all duration-200",
                className,
            )}
        >
            {/* Top row: vehicle + status */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 shrink-0">
                        <Car className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {r.vehicule.marque} {r.vehicule.modele}
                        </p>
                        {r.vehicule.immatriculation && (
                            <p className="text-xs text-muted-foreground">{r.vehicule.immatriculation}</p>
                        )}
                    </div>
                </div>
                <ReservationStatusBadge status={r.statut} />
            </div>

            {/* Info row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateDebut} → {dateFin}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{r.locataire.prenom} {r.locataire.nom}</span>
                </div>
            </div>

            {/* Bottom row: price + actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                <div>
                    <span className="text-sm font-bold">{r.montantProprietaire} FCFA</span>
                    <span className="text-xs text-muted-foreground ml-1">/ {r.nbJours}j</span>
                </div>
                <div className="flex items-center gap-2">
                    {r.contratUrl && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                            <FileText className="w-3.5 h-3.5" />
                            Contrat
                        </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </Link>
    );
}
