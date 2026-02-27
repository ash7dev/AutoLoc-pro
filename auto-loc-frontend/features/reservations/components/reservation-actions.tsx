"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, LogIn, LogOut, Loader2 } from "lucide-react";
import type { ReservationStatut } from "@/lib/nestjs/reservations";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

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

function getActions(
    statut: ReservationStatut,
    handlers: {
        confirm: (id: string) => Promise<void>;
        cancel: (id: string) => Promise<void>;
        checkin: (id: string) => Promise<void>;
        checkout: (id: string) => Promise<void>;
    },
): ActionConfig[] {
    switch (statut) {
        case "PAYEE":
            return [
                { label: "Confirmer", icon: Check, variant: "default", handler: handlers.confirm, confirm: "Confirmer cette réservation ?" },
                { label: "Annuler", icon: X, variant: "destructive", handler: handlers.cancel, confirm: "Annuler cette réservation ?" },
            ];
        case "CONFIRMEE":
            return [
                { label: "Check-in", icon: LogIn, variant: "default", handler: handlers.checkin },
                { label: "Annuler", icon: X, variant: "destructive", handler: handlers.cancel, confirm: "Annuler cette réservation ?" },
            ];
        case "EN_COURS":
            return [
                { label: "Check-out", icon: LogOut, variant: "default", handler: handlers.checkout },
            ];
        default:
            return [];
    }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ReservationActions({ reservationId, statut, className }: ReservationActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const { authFetch } = useAuthFetch();

    const handlers = {
        confirm: async (id: string) => {
            await authFetch(`/reservations/${id}/confirm`, { method: "PATCH" });
        },
        cancel: async (id: string) => {
            await authFetch(`/reservations/${id}/cancel`, {
                method: "PATCH",
                body: { raison: "Annulé par le propriétaire" },
            });
        },
        checkin: async (id: string) => {
            await authFetch(`/reservations/${id}/checkin`, { method: "PATCH" });
        },
        checkout: async (id: string) => {
            await authFetch(`/reservations/${id}/checkout`, { method: "PATCH" });
        },
    };

    const actions = getActions(statut, handlers);
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
