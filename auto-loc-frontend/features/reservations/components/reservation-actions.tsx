"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, LogIn, LogOut, Loader2, Scale } from "lucide-react";
import type { ReservationStatut } from "@/lib/nestjs/reservations";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReservationActionsProps {
    reservationId: string;
    statut: ReservationStatut;
    className?: string;
}

interface ActionConfig {
    label: string;
    icon: React.ElementType;
    variant: "default" | "destructive" | "outline";
    handler: (id: string) => Promise<void>;
    confirm?: string;
}

// ── Dispute dialog state ───────────────────────────────────────────────────────

interface DisputeFormState {
    open: boolean;
    description: string;
    coutEstime: string;
}

// ── Action config per status ───────────────────────────────────────────────────

function getActions(
    statut: ReservationStatut,
    handlers: {
        confirm: (id: string) => Promise<void>;
        cancel: (id: string) => Promise<void>;
        checkin: (id: string) => Promise<void>;
        checkout: (id: string) => Promise<void>;
        dispute: (id: string) => Promise<void>;
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
                { label: "Déclarer un litige", icon: Scale, variant: "outline", handler: handlers.dispute },
            ];
        case "TERMINEE":
            return [
                { label: "Déclarer un litige", icon: Scale, variant: "outline", handler: handlers.dispute },
            ];
        default:
            return [];
    }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ReservationActions({ reservationId, statut, className }: ReservationActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [disputeForm, setDisputeForm] = useState<DisputeFormState>({
        open: false,
        description: "",
        coutEstime: "",
    });
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
        dispute: async (_id: string) => {
            // Opens the inline form instead of calling the API directly
            setDisputeForm((f) => ({ ...f, open: true }));
        },
    };

    const actions = getActions(statut, handlers);
    if (actions.length === 0) return null;

    const handleAction = async (action: ActionConfig) => {
        if (action.confirm && !window.confirm(action.confirm)) return;
        setError(null);
        setLoading(action.label);
        try {
            await action.handler(reservationId);
            if (action.label !== "Déclarer un litige") {
                router.refresh();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Une erreur est survenue";
            setError(msg);
        } finally {
            setLoading(null);
        }
    };

    const submitDispute = async () => {
        if (disputeForm.description.length < 10) {
            setError("La description doit faire au moins 10 caractères.");
            return;
        }
        setError(null);
        setLoading("Déclarer un litige");
        try {
            const body: Record<string, unknown> = { description: disputeForm.description };
            const parsed = parseFloat(disputeForm.coutEstime);
            if (!isNaN(parsed) && parsed > 0) body.coutEstime = parsed;
            await authFetch(`/reservations/${reservationId}/dispute`, { method: "POST", body });
            setDisputeForm({ open: false, description: "", coutEstime: "" });
            router.refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Une erreur est survenue";
            setError(msg);
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

            {/* Dispute inline form */}
            {disputeForm.open && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-destructive">Déclarer un litige</p>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Description <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            value={disputeForm.description}
                            onChange={(e) => setDisputeForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Décrivez le problème en détail (min. 10 caractères)…"
                            rows={3}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Montant estimé (FCFA) — optionnel
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={disputeForm.coutEstime}
                            onChange={(e) => setDisputeForm((f) => ({ ...f, coutEstime: e.target.value }))}
                            placeholder="Ex: 25000"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-destructive">{error}</p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={loading !== null}
                            onClick={submitDispute}
                            className="gap-1.5"
                        >
                            {loading === "Déclarer un litige" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Scale className="w-3.5 h-3.5" />
                            )}
                            Confirmer le litige
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading !== null}
                            onClick={() => {
                                setDisputeForm({ open: false, description: "", coutEstime: "" });
                                setError(null);
                            }}
                        >
                            Annuler
                        </Button>
                    </div>
                </div>
            )}

            {error && !disputeForm.open && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
        </div>
    );
}
