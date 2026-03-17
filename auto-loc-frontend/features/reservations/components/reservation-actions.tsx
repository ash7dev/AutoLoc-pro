"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Check, X, LogIn, LogOut, Loader2, Scale,
    AlertTriangle, ChevronRight, CheckCircle2, FileWarning, ShieldAlert, Clock, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationStatut } from "@/lib/nestjs/reservations";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import { translateError } from "@/lib/utils/api-error-fr";
import { CheckinModal } from "./checkin-modal";
import { CheckoutModal } from "./checkout-modal";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface ReservationActionsProps {
    reservationId: string;
    statut: ReservationStatut;
    locataireKycStatus?: string;
    checkinProprietaireLe?: string;
    checkinLocataireLe?: string;
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
   ACTION CONFIGS
════════════════════════════════════════════════════════════════ */
function getActions(statut: ReservationStatut): ActionConfig[] {
    switch (statut) {
        case "PAYEE":
            return [
                {
                    key: "confirm", label: "Confirmer la réservation",
                    description: "Le locataire sera notifié immédiatement",
                    icon: Check, style: "primary",
                    requireConfirm: true, confirmLabel: "Oui, confirmer",
                },
                {
                    key: "cancel", label: "Refuser",
                    description: "Le paiement sera remboursé automatiquement",
                    icon: X, style: "danger",
                    requireConfirm: true, confirmLabel: "Oui, refuser",
                },
            ];
        case "CONFIRMEE":
            return [
                {
                    key: "checkin", label: "Démarrer le check-in",
                    description: "Marque la remise des clés au locataire",
                    icon: LogIn, style: "primary",
                    requireConfirm: true, confirmLabel: "Confirmer le check-in",
                },
                {
                    key: "cancel", label: "Annuler",
                    description: "Annulation avec remboursement du locataire",
                    icon: X, style: "danger",
                    requireConfirm: true, confirmLabel: "Oui, annuler",
                },
            ];
        case "EN_COURS":
            return [
                {
                    key: "checkout", label: "Démarrer le check-out",
                    description: "Marque la restitution du véhicule",
                    icon: LogOut, style: "primary",
                    requireConfirm: true, confirmLabel: "Confirmer le check-out",
                },
                {
                    key: "dispute", label: "Ouvrir un litige",
                    description: "Signalez un problème avec cette location",
                    icon: Scale, style: "ghost",
                },
            ];
        case "TERMINEE":
            return [
                {
                    key: "dispute", label: "Ouvrir un litige",
                    description: "Vous avez 24h après la fin de location",
                    icon: Scale, style: "ghost",
                },
            ];
        default:
            return [];
    }
}

/* ════════════════════════════════════════════════════════════════
   ACTION BUTTON
════════════════════════════════════════════════════════════════ */
const BTN_VARIANTS: Record<ActionConfig["style"], string> = {
    /* Dark pill — action principale */
    primary:
        "bg-slate-900 text-white border-slate-900 " +
        "hover:bg-emerald-500 hover:border-emerald-500 " +
        "shadow-sm hover:shadow-md hover:shadow-emerald-500/20 " +
        "hover:-translate-y-0.5 active:translate-y-0",

    /* Red tint — action destructive */
    danger:
        "bg-red-50 text-red-600 border-red-200 " +
        "hover:bg-red-500 hover:text-white hover:border-red-500 " +
        "shadow-sm hover:shadow-md hover:shadow-red-500/15 " +
        "hover:-translate-y-0.5 active:translate-y-0",

    /* Ghost — action secondaire */
    ghost:
        "bg-white text-slate-500 border-slate-200 " +
        "hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50 " +
        "shadow-sm",
};

function ActionButton({
    action, loading, disabled, onClick,
}: {
    action: ActionConfig;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    const Icon = action.icon;
    const isLoading = loading;

    /* Icon box color */
    const iconBoxCls = cn(
        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
        action.style === "primary" ? "bg-white/15"
            : action.style === "danger" ? "bg-red-100 group-hover:bg-red-500/20"
                : "bg-slate-100 group-hover:bg-slate-200",
    );

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 border",
                "text-left w-full sm:w-auto transition-all duration-200",
                disabled && "opacity-50 cursor-not-allowed",
                BTN_VARIANTS[action.style],
            )}
        >
            {/* Icon */}
            <div className={iconBoxCls}>
                {isLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                }
            </div>

            {/* Text */}
            <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold leading-none">{action.label}</span>
                <span className={cn(
                    "text-[11px] font-medium leading-none",
                    action.style === "primary" ? "text-white/50 group-hover:text-white/70"
                        : action.style === "danger" ? "text-red-400 group-hover:text-white/70"
                            : "text-slate-400",
                )}>
                    {action.description}
                </span>
            </div>

            {/* Chevron */}
            {!isLoading && (
                <ChevronRight
                    className="w-4 h-4 ml-auto flex-shrink-0 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
                    strokeWidth={2.5}
                />
            )}
        </button>
    );
}

/* ════════════════════════════════════════════════════════════════
   INLINE CONFIRM  — clean white card, no dark hacks
════════════════════════════════════════════════════════════════ */
function InlineConfirm({
    action, onConfirm, onCancel, loading, reason, onReasonChange,
}: {
    action: ActionConfig;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
    reason?: string;
    onReasonChange?: (v: string) => void;
}) {
    const isCancel = action.key === "cancel";
    const canConfirm = !isCancel || (reason?.trim() ?? "").length >= 5;

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                </div>
                <p className="text-[13px] font-semibold text-slate-700 leading-tight">
                    {action.description} — confirmer ?
                </p>
            </div>

            {/* Raison d'annulation — uniquement pour cancel */}
            {isCancel && onReasonChange !== undefined && (
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Raison <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={reason ?? ""}
                        onChange={e => onReasonChange(e.target.value)}
                        placeholder="Ex : Véhicule indisponible pour cette période…"
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-300/15 resize-none transition-all"
                    />
                    {(reason?.trim().length ?? 0) > 0 && (reason?.trim().length ?? 0) < 5 && (
                        <p className="text-[11px] text-red-500 font-medium">Minimum 5 caractères</p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading || !canConfirm}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                        action.style === "danger"
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20"
                            : "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm",
                    )}
                >
                    {loading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    }
                    {action.confirmLabel ?? "Confirmer"}
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   DISPUTE FORM  — light card with orange accent top-bar
════════════════════════════════════════════════════════════════ */
function DisputeForm({
    onSubmit, onCancel, loading, error,
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
        <div className="rounded-2xl border border-orange-200 bg-white overflow-hidden shadow-sm">
            {/* Orange accent header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-orange-50 border-b border-orange-100">
                <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center flex-shrink-0">
                    <FileWarning className="w-4 h-4 text-orange-500" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[13px] font-black text-slate-900">Ouvrir un litige</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Décrivez le problème rencontré avec ce locataire</p>
                </div>
            </div>

            <div className="p-5 space-y-4">

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ex : Le véhicule a été restitué avec un dommage sur l'aile avant droite…"
                        rows={3}
                        className={cn(
                            "w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-slate-800 placeholder-slate-400",
                            "focus:outline-none focus:ring-2 resize-none transition-all duration-200",
                            tooShort
                                ? "border-red-300 focus:border-red-400 focus:ring-red-400/15"
                                : "border-slate-200 focus:border-orange-400 focus:ring-orange-400/15",
                        )}
                    />
                    <div className="flex items-center justify-between">
                        {tooShort
                            ? <p className="text-[11px] text-red-500 font-medium">Minimum 10 caractères</p>
                            : <span />
                        }
                        <p className="text-[10.5px] text-slate-400 tabular-nums">{description.length} car.</p>
                    </div>
                </div>

                {/* Cost */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        Montant estimé{" "}
                        <span className="text-slate-400 font-semibold normal-case tracking-normal">— optionnel, en FCFA</span>
                    </label>
                    <input
                        type="number"
                        min={0}
                        value={cout}
                        onChange={e => setCout(e.target.value)}
                        placeholder="25 000"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                        <p className="text-[12px] font-semibold text-red-600">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => onSubmit(description, cout)}
                        disabled={!canSubmit}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                            canSubmit
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 hover:shadow-md hover:shadow-orange-500/25 hover:-translate-y-0.5"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed",
                        )}
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Scale className="w-4 h-4" strokeWidth={2} />
                        }
                        Soumettre le litige
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
export function ReservationActions({
    reservationId, statut, locataireKycStatus,
    checkinProprietaireLe, checkinLocataireLe,
    className,
}: ReservationActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmKey, setConfirmKey] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [checkinOpen, setCheckinOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const { authFetch } = useAuthFetch();

    const actions = getActions(statut);

    /* ── Statuts sans actions — messages informatifs ── */
    if (statut === "LITIGE") {
        return (
            <div className={cn("flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5", className)}>
                <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[12.5px] font-bold text-orange-800">Litige en cours</p>
                    <p className="text-[11.5px] text-orange-700 mt-0.5 leading-relaxed">
                        Un litige a été déclaré sur cette réservation. Notre équipe examine le dossier et vous contactera dans les plus brefs délais.
                    </p>
                </div>
            </div>
        );
    }

    if (statut === "EXPIREE") {
        return (
            <div className={cn("flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5", className)}>
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Ban className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                </div>
                <div>
                    <p className="text-[12.5px] font-bold text-slate-600">Réservation expirée</p>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                        Le locataire n&apos;a pas finalisé le paiement dans les délais impartis. La réservation a été annulée automatiquement.
                    </p>
                </div>
            </div>
        );
    }

    if (actions.length === 0) return null;

    // KYC locataire — bloque la confirmation si non vérifié
    const kycBlocked = statut === "PAYEE" && locataireKycStatus !== "VERIFIE";
    const kycLabel =
        !locataireKycStatus || locataireKycStatus === "NON_VERIFIE"
            ? "Le locataire n'a pas encore soumis son KYC."
            : locataireKycStatus === "EN_ATTENTE"
                ? "Le KYC du locataire est en cours de vérification."
                : locataireKycStatus === "REJETE"
                    ? "Le KYC du locataire a été rejeté."
                    : null;

    const apiMap: Record<string, () => Promise<void>> = {
        confirm: () => authFetch(`/reservations/${reservationId}/confirm`, { method: "PATCH" }),
        cancel: () => authFetch(`/reservations/${reservationId}/cancel`, { method: "PATCH", body: { raison: cancelReason.trim() } }),
        checkin: () => authFetch(`/reservations/${reservationId}/checkin?role=PROPRIETAIRE`, { method: "PATCH" }),
        checkout: () => authFetch(`/reservations/${reservationId}/checkout`, { method: "PATCH" }),
    };

    const handleAction = async (action: ActionConfig) => {
        if (action.key === "dispute") { setDisputeOpen(true); return; }
        if (action.key === "checkin") { setCheckinOpen(true); return; }
        if (action.key === "checkout") { setCheckoutOpen(true); return; }
        if (action.requireConfirm && confirmKey !== action.key) { setConfirmKey(action.key); return; }
        setError(null); setLoading(action.key); setConfirmKey(null); setCancelReason('');
        try {
            await apiMap[action.key]();
            router.refresh();
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(null);
        }
    };

    const handleDispute = async (description: string, coutEstime: string) => {
        setError(null); setLoading("dispute");
        try {
            const body: Record<string, unknown> = { description };
            const parsed = parseFloat(coutEstime);
            if (!isNaN(parsed) && parsed > 0) body.coutEstime = parsed;
            await authFetch(`/reservations/${reservationId}/dispute`, { method: "POST", body });
            setDisputeOpen(false);
            router.refresh();
        } catch (err) {
            setError(translateError(err));
        } finally {
            setLoading(null);
        }
    };

    const isLoading = loading !== null;
    const confirmingAction = actions.find(a => a.key === confirmKey);

    return (
        <div className={cn("space-y-3", className)}>

            {/* Check-in propriétaire déjà fait — attente locataire */}
            {statut === "CONFIRMEE" && checkinProprietaireLe && !checkinLocataireLe && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold text-emerald-800">Vous avez confirmé le check-in</p>
                        <p className="text-[11.5px] text-emerald-700 mt-0.5 leading-relaxed">
                            En attente de confirmation du locataire pour démarrer la location.
                        </p>
                    </div>
                </div>
            )}

            {/* Blocage KYC locataire */}
            {kycBlocked && kycLabel && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold text-amber-800">Confirmation bloquée</p>
                        <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">{kycLabel} Vous pourrez confirmer une fois son identité vérifiée.</p>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
                {actions
                    .filter(action =>
                        // Cacher le bouton checkin si le propriétaire a déjà confirmé
                        !(action.key === "checkin" && checkinProprietaireLe)
                    )
                    .map(action => (
                        <ActionButton
                            key={action.key}
                            action={action}
                            loading={loading === action.key}
                            disabled={isLoading || (action.key === "confirm" && kycBlocked)}
                            onClick={() => handleAction(action)}
                        />
                    ))
                }
            </div>

            {/* Inline confirm */}
            {confirmingAction && (
                <InlineConfirm
                    action={confirmingAction}
                    loading={isLoading}
                    onConfirm={() => handleAction(confirmingAction)}
                    onCancel={() => { setConfirmKey(null); setCancelReason(''); }}
                    reason={cancelReason}
                    onReasonChange={setCancelReason}
                />
            )}

            {/* Dispute form */}
            {disputeOpen && (
                <DisputeForm
                    loading={loading === "dispute"}
                    error={error}
                    onSubmit={handleDispute}
                    onCancel={() => { setDisputeOpen(false); setError(null); }}
                />
            )}

            {/* Global error */}
            {error && !disputeOpen && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                    <p className="text-[12px] font-semibold text-red-600">{error}</p>
                </div>
            )}

            {/* Modaux check-in / check-out */}
            <CheckinModal
                reservationId={reservationId}
                open={checkinOpen}
                onClose={() => setCheckinOpen(false)}
            />
            <CheckoutModal
                reservationId={reservationId}
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
            />
        </div>
    );
}