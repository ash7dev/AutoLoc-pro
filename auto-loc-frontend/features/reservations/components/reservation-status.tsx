"use client";

import { cn } from "@/lib/utils";
import type { ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   TOKENS
   Chaque statut = une identité visuelle claire.
   Dark pill pour PAYEE (action urgente), teinté pour les autres.
════════════════════════════════════════════════════════════════ */
interface StatusConfig {
    label: string;
    pill: string;          // background + border + text du badge
    dot: string;           // couleur du dot
    pulse?: boolean;
}

const STATUS: Record<string, StatusConfig> = {
    INITIEE: {
        label: "Initiée",
        pill: "bg-slate-100 border-slate-200 text-slate-500",
        dot: "bg-slate-400",
    },
    EN_ATTENTE_PAIEMENT: {
        label: "Attente paiement",
        pill: "bg-slate-100 border-slate-200 text-slate-600",
        dot: "bg-slate-500",
        pulse: true,
    },
    PAYEE: {
        label: "À valider",
        pill: "bg-slate-900 border-slate-900 text-white",
        dot: "bg-emerald-400",
        pulse: true,
    },
    CONFIRMEE: {
        label: "Confirmée",
        pill: "bg-indigo-50 border-indigo-200 text-indigo-700",
        dot: "bg-indigo-500",
    },
    EN_COURS: {
        label: "En cours",
        pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
        dot: "bg-emerald-500",
        pulse: true,
    },
    TERMINEE: {
        label: "Terminée",
        pill: "bg-slate-100 border-slate-200 text-slate-400",
        dot: "bg-slate-300",
    },
    ANNULEE: {
        label: "Annulée",
        pill: "bg-red-50 border-red-200 text-red-500",
        dot: "bg-red-400",
    },
    EXPIREE: {
        label: "Expirée",
        pill: "bg-slate-50 border-slate-200 text-slate-400",
        dot: "bg-slate-300",
    },
    LITIGE: {
        label: "Litige",
        pill: "bg-orange-50 border-orange-200 text-orange-600",
        dot: "bg-orange-400",
        pulse: true,
    },
};

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
interface ReservationStatusBadgeProps {
    status: ReservationStatut;
    size?: "sm" | "md";
    className?: string;
}

export function ReservationStatusBadge({
    status,
    size = "sm",
    className,
}: ReservationStatusBadgeProps) {
    const cfg = STATUS[status] ?? STATUS.INITIEE;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap",
            cfg.pill,
            size === "sm" ? "px-2.5 py-[3px] text-[10.5px]"
                : "px-3.5 py-1.5 text-[12px]",
            className,
        )}>
            <span className={cn(
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                cfg.dot,
                cfg.pulse && "animate-pulse",
            )} />
            {cfg.label}
        </span>
    );
}

export function getStatusLabel(status: ReservationStatut): string {
    return STATUS[status]?.label ?? status;
}