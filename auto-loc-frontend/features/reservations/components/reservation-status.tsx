"use client";

import { cn } from "@/lib/utils";
import type { ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   STATUS CONFIG
   Palette : fond teinté léger + bordure colorée + texte foncé
   Cohérent avec le système émeraude/slate du projet
════════════════════════════════════════════════════════════════ */
interface StatusConfig {
    label: string;
    cls: string;
    dot: string;
    pulse?: boolean;
}

const STATUS_MAP: Record<string, StatusConfig> = {
    INITIEE: {
        label: "Initiée",
        cls:   "bg-slate-100 border-slate-200 text-slate-600",
        dot:   "bg-slate-400",
    },
    EN_ATTENTE_PAIEMENT: {
        label: "Attente paiement",
        cls:   "bg-amber-50 border-amber-200 text-amber-700",
        dot:   "bg-amber-400",
        pulse: true,
    },
    PAYEE: {
        label: "Payée",
        cls:   "bg-blue-50 border-blue-200 text-blue-700",
        dot:   "bg-blue-500",
        pulse: true,
    },
    CONFIRMEE: {
        label: "Confirmée",
        cls:   "bg-indigo-50 border-indigo-200 text-indigo-700",
        dot:   "bg-indigo-500",
    },
    EN_COURS: {
        label: "En cours",
        cls:   "bg-emerald-50 border-emerald-200 text-emerald-700",
        dot:   "bg-emerald-500",
        pulse: true,
    },
    TERMINEE: {
        label: "Terminée",
        cls:   "bg-slate-100 border-slate-200 text-slate-500",
        dot:   "bg-slate-400",
    },
    ANNULEE: {
        label: "Annulée",
        cls:   "bg-red-50 border-red-200 text-red-600",
        dot:   "bg-red-400",
    },
    EXPIREE: {
        label: "Expirée",
        cls:   "bg-slate-100 border-slate-200 text-slate-400",
        dot:   "bg-slate-300",
    },
    LITIGE: {
        label: "Litige",
        cls:   "bg-orange-50 border-orange-200 text-orange-700",
        dot:   "bg-orange-400",
        pulse: true,
    },
};

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
interface ReservationStatusBadgeProps {
    status: ReservationStatut;
    className?: string;
    size?: "sm" | "md";
}

export function ReservationStatusBadge({
    status,
    className,
    size = "sm",
}: ReservationStatusBadgeProps) {
    const cfg = STATUS_MAP[status] ?? STATUS_MAP.INITIEE;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
                cfg.cls,
                size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[12px]",
                className,
            )}
        >
            <span className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                cfg.dot,
                cfg.pulse && "animate-pulse",
            )} />
            {cfg.label}
        </span>
    );
}

/**
 * Retourne le label français d'un statut de réservation.
 */
export function getStatusLabel(status: ReservationStatut): string {
    return STATUS_MAP[status]?.label ?? status;
}