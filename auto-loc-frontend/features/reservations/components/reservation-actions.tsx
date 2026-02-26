"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, LogIn, LogOut, Loader2 } from "lucide-react";
import {
    confirmReservation,
    cancelReservation,
    checkinReservation,
    checkoutReservation,
} from "@/lib/nestjs/reservations";
import type { ReservationStatut } from "@/lib/nestjs/reservations";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReservationActionsProps {
    reservationId: string;
    statut: ReservationStatut;
    className?: string;
}

// ── Action Config ──────────────────────────────────────────────────────────────

interface ActionConfig {
    label: string;
    icon: React.ElementType;
    variant: "default" | "destructive" | "outline";
    handler: (id: string) => Promise<void>;
    confirm?: string;
}

function getActions(statut: ReservationStatut): ActionConfig[] {
    switch (statut) {
        case "PAYEE":
            return [
                { label: "Confirmer", icon: Check, variant: "default", handler: confirmReservation, confirm: "Confirmer cette réservation ?" },
                { label: "Annuler", icon: X, variant: "destructive", handler: (id) => cancelReservation(id), confirm: "Annuler cette réservation ?" },
            ];
        case "CONFIRMEE":
            return [
                { label: "Check-in", icon: LogIn, variant: "default", handler: checkinReservation },
                { label: "Annuler", icon: X, variant: "destructive", handler: (id) => cancelReservation(id), confirm: "Annuler cette réservation ?" },
            ];
        case "EN_COURS":
            return [
                { label: "Check-out", icon: LogOut, variant: "default", handler: checkoutReservation },
            ];
        default:
            return [];
    }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ReservationActions({ reservationId, statut, className }: ReservationActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const actions = getActions(statut);
    if (actions.length === 0) return null;

    const handleAction = async (action: ActionConfig) => {
        if (action.confirm && !window.confirm(action.confirm)) return;

        setLoading(action.label);
        try {
            await action.handler(reservationId);
            router.refresh();
        } catch {
            // Error will be thrown as ApiError — toast can be added later
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant={action.variant}
                        size="sm"
                        disabled={loading !== null}
                        onClick={() => handleAction(action)}
                        className="gap-1.5"
                    >
                        {loading === action.label ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <action.icon className="w-3.5 h-3.5" />
                        )}
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
