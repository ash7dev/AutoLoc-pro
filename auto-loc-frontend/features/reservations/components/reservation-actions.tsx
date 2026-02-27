"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Check, X, LogIn, LogOut, Loader2, Scale,
    AlertTriangle, ChevronRight, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationStatut } from "@/lib/nestjs/reservations";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { CheckinModal } from "./checkin-modal";
import { CheckoutModal } from "./checkout-modal";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface ReservationActionsProps {
    reservationId: string;
    statut: ReservationStatut;
    role?: "PROPRIETAIRE" | "LOCATAIRE";
    className?: string;
}

interface ActionConfig {
    key: string;
    label: string;
    description: string;
    icon: React.ElementType;
    style: "primary" | "danger" | "ghost";
    requireConfirm?: boolean;
    confirmLabel?: string;
}

/* ════════════════════════════════════════════════════════════════
   ACTION CONFIGS PER STATUS
════════════════════════════════════════════════════════════════ */
function getActions(statut: ReservationStatut): ActionConfig[] {
    switch (statut) {
        case "PAYEE":
            return [
                {
                    key: "confirm",
                    label: "Confirmer la réservation",
                    description: "Le locataire sera notifié immédiatement",
                    icon: Check,
                    style: "primary",
                    requireConfirm: true,
                    confirmLabel: "Oui, confirmer",
                },
                {
                    key: "cancel",
                    label: "Refuser",
                    description: "Le paiement sera remboursé automatiquement",
                    icon: X,
                    style: "danger",
                    requireConfirm: true,
                    confirmLabel: "Oui, refuser",
                },
            ];
        case "CONFIRMEE":
            return [
                {
                    key: "checkin",
                    label: "Confirmer le check-in",
                    description: "Double confirmation requise (propriétaire + locataire)",
                    icon: LogIn,
                    style: "primary",
                },
                {
                    key: "cancel",
                    label: "Annuler",
                    description: "Annulation avec remboursement du locataire",
                    icon: X,
                    style: "danger",
                    requireConfirm: true,
                    confirmLabel: "Oui, annuler",
                },
            ];
        case "EN_COURS":
            return [
                {
                    key: "checkout",
                    label: "Démarrer le check-out",
                    description: "Marque la restitution du véhicule",
                    icon: LogOut,
                    style: "primary",
                },
                {
                    key: "dispute",
                    label: "Ouvrir un litige",
                    description: "Signalez un problème avec cette location",
                    icon: Scale,
                    style: "ghost",
                },
            ];
        case "TERMINEE":
            return [
                {
                    key: "dispute",
                    label: "Ouvrir un litige",
                    description: "Vous avez 48h après la fin de location",
                    icon: Scale,
                    style: "ghost",
                },
            ];
        default:
            return [];
    }
}

/* ════════════════════════════════════════════════════════════════
   ACTION BUTTON STYLES
════════════════════════════════════════════════════════════════ */
function actionBtn(style: ActionConfig["style"], disabled: boolean) {
    const base = cn(
        "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 text-left w-full sm:w-auto",
        disabled && "opacity-50 cursor-not-allowed",
    );
    const variants: Record<ActionConfig["style"], string> = {
        primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0",
        danger: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-300",
        ghost: "bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/15 text-slate-400 hover:text-slate-200",
    };
    return cn(base, variants[style]);
}

/* ════════════════════════════════════════════════════════════════
   INLINE CONFIRM  (pas de window.confirm — premium inline)
════════════════════════════════════════════════════════════════ */
function InlineConfirm({
    action,
    onConfirm,
    onCancel,
    loading,
}: {
    action: ActionConfig;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <action.icon className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
            <p className="text-[13px] font-semibold text-white flex-1">{action.description} — confirmer ?</p>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition-all"
                >
                    Non
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all",
                        action.style === "danger"
                            ? "bg-red-500 hover:bg-red-400 text-white"
                            : "bg-emerald-500 hover:bg-emerald-400 text-white",
                    )}
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    {action.confirmLabel ?? "Confirmer"}
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   DISPUTE FORM
════════════════════════════════════════════════════════════════ */
function DisputeForm({
    onSubmit,
    onCancel,
    loading,
    error,
}: {
    onSubmit: (description: string, coutEstime: string) => void;
    onCancel: () => void;
    loading: boolean;
    error: string | null;
}) {
    const [description, setDescription] = useState("");
    const [cout, setCout] = useState("");
    const tooShort = description.trim().length > 0 && description.trim().length < 10;
    const canSubmit = description.trim().length >= 10 && !loading;

    return (
        <div className="rounded-2xl bg-orange-500/6 border border-orange-500/20 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-orange-400" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-white">Ouvrir un litige</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Décrivez le problème rencontré avec ce locataire</p>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Description <span className="text-orange-400">*</span>
                </label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ex : Le véhicule a été restitué avec un dommage sur l'aile avant droite…"
                    rows={3}
                    className={cn(
                        "w-full rounded-xl border bg-white/4 px-4 py-3 text-[13px] text-white placeholder-slate-600",
                        "focus:outline-none focus:ring-1 resize-none transition-all duration-200",
                        tooShort
                            ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
                            : "border-white/8 focus:border-orange-400/40 focus:ring-orange-400/20",
                    )}
                />
                <div className="flex justify-between items-center">
                    {tooShort ? (
                        <p className="text-[11px] text-red-400">Minimum 10 caractères</p>
                    ) : (
                        <span />
                    )}
                    <p className="text-[10px] text-slate-600 tabular-nums">{description.length} car.</p>
                </div>
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Montant estimé FCFA <span className="text-slate-600">— optionnel</span>
                </label>
                <input
                    type="number"
                    min={0}
                    value={cout}
                    onChange={e => setCout(e.target.value)}
                    placeholder="25 000"
                    className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-orange-400/40 focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                />
            </div>

            {error && (
                <p className="text-[12px] text-red-400 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                    {error}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={() => onSubmit(description, cout)}
                    disabled={!canSubmit}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200",
                        canSubmit
                            ? "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20"
                            : "bg-white/5 text-slate-600 cursor-not-allowed",
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" strokeWidth={2} />}
                    Soumettre le litige
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-white/6 border border-white/8 transition-all"
                >
                    Annuler
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function ReservationActions({ reservationId, statut, role = "PROPRIETAIRE", className }: ReservationActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmKey, setConfirmKey] = useState<string | null>(null);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [checkinOpen, setCheckinOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const { authFetch } = useAuthFetch();

    const actions = getActions(statut);
    if (actions.length === 0) return null;

    /* API calls */
    const apiMap: Record<string, () => Promise<void>> = {
        confirm: () => authFetch(`/reservations/${reservationId}/confirm`, { method: "PATCH" }),
        cancel: () => authFetch(`/reservations/${reservationId}/cancel`, { method: "PATCH", body: { raison: "Annulé par le propriétaire" } }),
        checkin: () => authFetch(`/reservations/${reservationId}/checkin`, { method: "PATCH" }),
        checkout: () => authFetch(`/reservations/${reservationId}/checkout`, { method: "PATCH" }),
    };

    const handleAction = async (action: ActionConfig) => {
        if (action.key === "dispute") { setDisputeOpen(true); return; }
        if (action.key === "checkin") { setCheckinOpen(true); return; }
        if (action.key === "checkout") { setCheckoutOpen(true); return; }
        if (action.requireConfirm && confirmKey !== action.key) { setConfirmKey(action.key); return; }

        setError(null);
        setLoading(action.key);
        setConfirmKey(null);
        try {
            await apiMap[action.key]();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(null);
        }
    };

    const handleDispute = async (description: string, coutEstime: string) => {
        setError(null);
        setLoading("dispute");
        try {
            const body: Record<string, unknown> = { description };
            const parsed = parseFloat(coutEstime);
            if (!isNaN(parsed) && parsed > 0) body.coutEstime = parsed;
            await authFetch(`/reservations/${reservationId}/dispute`, { method: "POST", body });
            setDisputeOpen(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(null);
        }
    };

    const isLoading = loading !== null;
    const confirmingAction = actions.find(a => a.key === confirmKey);

    return (
        <div className={cn("space-y-3", className)}>

            {/* ── Buttons row ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-2">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction(action)}
                        className={actionBtn(action.style, isLoading)}
                    >
                        {loading === action.key ? (
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        ) : (
                            <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                                action.style === "primary" ? "bg-white/20" : action.style === "danger" ? "bg-red-500/15" : "bg-white/6",
                            )}>
                                <action.icon className="w-3.5 h-3.5" strokeWidth={2} />
                            </div>
                        )}
                        <div className="flex flex-col text-left">
                            <span className="text-[13px] font-bold leading-none">{action.label}</span>
                            <span className={cn(
                                "text-[11px] font-medium mt-0.5 leading-none",
                                action.style === "primary" ? "text-white/60" : "text-current opacity-60",
                            )}>
                                {action.description}
                            </span>
                        </div>
                        {!isLoading && (
                            <ChevronRight className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={2.5} />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Inline confirm ───────────────────────────────── */}
            {confirmingAction && (
                <InlineConfirm
                    action={confirmingAction}
                    loading={isLoading}
                    onConfirm={() => handleAction(confirmingAction)}
                    onCancel={() => setConfirmKey(null)}
                />
            )}

            {/* ── Dispute form ─────────────────────────────────── */}
            {disputeOpen && (
                <DisputeForm
                    loading={loading === "dispute"}
                    error={error}
                    onSubmit={handleDispute}
                    onCancel={() => { setDisputeOpen(false); setError(null); }}
                />
            )}

            {/* ── Check-in modal ────────────────────────────────── */}
            <CheckinModal
                reservationId={reservationId}
                role={role}
                open={checkinOpen}
                onClose={() => setCheckinOpen(false)}
            />

            {/* ── Check-out modal ───────────────────────────────── */}
            <CheckoutModal
                reservationId={reservationId}
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
            />

            {/* ── Global error ─────────────────────────────────── */}
            {error && !disputeOpen && (
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                    {error}
                </p>
            )}
        </div>
    );
}