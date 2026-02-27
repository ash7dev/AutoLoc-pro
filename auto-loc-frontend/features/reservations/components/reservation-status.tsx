"use client";

import { cn } from "@/lib/utils";
import type { ReservationStatut } from "@/lib/nestjs/reservations";

// ── Status Config ──────────────────────────────────────────────────────────────

interface StatusConfig {
    label: string;
    color: string;
    bg: string;
    dot: string;
}

const STATUS_MAP: Record<ReservationStatut, StatusConfig> = {
    INITIEE: { label: "Initiée", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
    EN_ATTENTE_PAIEMENT: { label: "En attente paiement", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400" },
    PAYEE: { label: "Payée", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
    CONFIRMEE: { label: "Confirmée", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" },
    EN_COURS: { label: "En cours", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    TERMINEE: { label: "Terminée", color: "text-teal-700", bg: "bg-teal-50 border-teal-200", dot: "bg-teal-500" },
    ANNULEE: { label: "Annulée", color: "text-red-700", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
    EXPIREE: { label: "Expirée", color: "text-gray-600", bg: "bg-gray-100 border-gray-300", dot: "bg-gray-400" },
    LITIGE: { label: "Litige", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
};

// ── Component ──────────────────────────────────────────────────────────────────

interface ReservationStatusBadgeProps {
    status: ReservationStatut;
    className?: string;
    size?: "sm" | "md";
}

export function ReservationStatusBadge({ status, className, size = "sm" }: ReservationStatusBadgeProps) {
    const config = STATUS_MAP[status] ?? STATUS_MAP.INITIEE;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-medium",
                config.bg,
                config.color,
                size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
                className,
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
            {config.label}
        </span>
    );
}

/**
 * Returns human-readable French label for a reservation status.
 */
export function getStatusLabel(status: ReservationStatut): string {
    return STATUS_MAP[status]?.label ?? status;
}
