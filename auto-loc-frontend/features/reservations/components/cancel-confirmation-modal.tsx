"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, XCircle, Ban, Info, Loader2, DollarSign, AlertCircleIcon, CheckCircle2, X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CancelConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (raison: string) => Promise<void>;
    loading?: boolean;
    // Données de la réservation
    statut: string;
    dateDebut?: string;
    totalLocataire?: number;
    totalBase?: number;
    isOwner?: boolean; // true si propriétaire, false si locataire
}

interface PolicyResult {
    canCancel: boolean;
    refundAmount: number;
    refundPercentage: number;
    penaltyAmount: number;
    penaltyPercentage: number;
    warnings: string[];
    severity: "success" | "warning" | "danger" | "blocked";
}

// ── Calcul de la politique d'annulation ────────────────────────────────────────

function calculateCancellationPolicy(
    statut: string,
    dateDebut: string | undefined,
    totalLocataire: number | undefined,
    totalBase: number | undefined,
    isOwner: boolean | undefined,
): PolicyResult {
    // Valeurs par défaut si undefined
    const _totalLocataire = totalLocataire ?? 0;
    const _totalBase = totalBase ?? 0;
    const _isOwner = isOwner ?? true;
    const _dateDebut = dateDebut ?? new Date().toISOString();

    const now = new Date();
    const debut = new Date(_dateDebut);
    const diffMs = debut.getTime() - now.getTime();
    const daysUntil = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

    const isConfirmed = statut !== "PAYEE";

    // ── PROPRIÉTAIRE ──────────────────────────────────────────────────────────
    if (_isOwner) {
        // Refus de réservation (PAYEE - pas encore confirmée)
        if (!isConfirmed) {
            return {
                canCancel: true,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: 0,
                penaltyPercentage: 0,
                warnings: ["Refus de réservation : aucune pénalité"],
                severity: "success",
            };
        }

        // Réservation CONFIRMEE ou EN_COURS
        if (daysUntil < 1) {
            // Jour même - Pénalité 40%
            const penalty = _totalBase * 0.4;
            return {
                canCancel: true,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: penalty,
                penaltyPercentage: 40,
                warnings: [
                    "Annulation le jour même : pénalité de 40% appliquée sur vos prochains revenus",
                    "Avertissement : risque de suspension si répété",
                ],
                severity: "danger",
            };
        }

        if (daysUntil < 3) {
            // < 3 jours - Pénalité 40%
            const penalty = _totalBase * 0.4;
            return {
                canCancel: true,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: penalty,
                penaltyPercentage: 40,
                warnings: [
                    "Pénalité élevée : annulation tardive",
                    "Avertissement : risque de suspension si répété",
                ],
                severity: "danger",
            };
        }

        if (daysUntil <= 7) {
            // 3-7 jours - Pénalité 20%
            const penalty = _totalBase * 0.2;
            return {
                canCancel: true,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: penalty,
                penaltyPercentage: 20,
                warnings: ["Pénalité modérée", "Évitez les annulations répétées"],
                severity: "warning",
            };
        }

        // > 7 jours - Aucune pénalité
        return {
            canCancel: true,
            refundAmount: _totalLocataire,
            refundPercentage: 100,
            penaltyAmount: 0,
            penaltyPercentage: 0,
            warnings: ["Avertissement enregistré"],
            severity: "success",
        };
    }

    // ── LOCATAIRE ─────────────────────────────────────────────────────────────
    else {
        // Réservation PAS encore confirmée (PAYEE)
        if (!isConfirmed) {
            return {
                canCancel: true,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: 0,
                penaltyPercentage: 0,
                warnings: ["Remboursement intégral"],
                severity: "success",
            };
        }

        // Réservation CONFIRMEE
        if (daysUntil > 5) {
            // > 5 jours - Remboursement du totalBase (commission retenue)
            return {
                canCancel: true,
                refundAmount: _totalBase,
                refundPercentage: 100,
                penaltyAmount: 0,
                penaltyPercentage: 0,
                warnings: ["Commission AutoLoc retenue (15%)"],
                severity: "success",
            };
        }

        if (daysUntil >= 3) {
            // 3-5 jours - 75% remboursé
            const refund = _totalLocataire * 0.75;
            return {
                canCancel: true,
                refundAmount: refund,
                refundPercentage: 75,
                penaltyAmount: 0,
                penaltyPercentage: 0,
                warnings: ["25% de frais d'annulation"],
                severity: "warning",
            };
        }

        if (daysUntil >= 1) {
            // 1-3 jours - 50% remboursé
            const refund = _totalLocataire * 0.5;
            return {
                canCancel: true,
                refundAmount: refund,
                refundPercentage: 50,
                penaltyAmount: 0,
                penaltyPercentage: 0,
                warnings: ["50% de frais d'annulation"],
                severity: "danger",
            };
        }

        // < 24h - Aucun remboursement
        return {
            canCancel: true,
            refundAmount: 0,
            refundPercentage: 0,
            penaltyAmount: 0,
            penaltyPercentage: 0,
            warnings: ["Aucun remboursement - Annulation tardive"],
            severity: "blocked",
        };
    }
}

// ── Composant ──────────────────────────────────────────────────────────────────

export function CancelConfirmationModal({
    open,
    onClose,
    onConfirm,
    loading = false,
    statut,
    dateDebut,
    totalLocataire,
    totalBase,
    isOwner,
}: CancelConfirmationModalProps) {
    const [raison, setRaison] = useState("");
    const [policy, setPolicy] = useState<PolicyResult | null>(null);

    useEffect(() => {
        if (open) {
            const result = calculateCancellationPolicy(
                statut,
                dateDebut,
                totalLocataire,
                totalBase,
                isOwner,
            );
            setPolicy(result);
        } else {
            setRaison("");
            setPolicy(null);
        }
    }, [open, statut, dateDebut, totalLocataire, totalBase, isOwner]);

    if (!open || !policy) return null;

    const fmtMoney = (n: number) => Math.round(n).toLocaleString("fr-FR");

    const severityConfig = {
        success: {
            bg: "bg-emerald-50",
            border: "border-emerald-300",
            text: "text-emerald-900",
            iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            iconColor: "text-white",
            btnBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40",
            btnText: "text-white",
            badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-300",
            text: "text-amber-900",
            iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
            iconColor: "text-white",
            btnBg: "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40",
            btnText: "text-white",
            badge: "bg-amber-100 text-amber-700 border-amber-200",
        },
        danger: {
            bg: "bg-red-50",
            border: "border-red-300",
            text: "text-red-900",
            iconBg: "bg-gradient-to-br from-red-500 to-red-600",
            iconColor: "text-white",
            btnBg: "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40",
            btnText: "text-white",
            badge: "bg-red-100 text-red-700 border-red-200",
        },
        blocked: {
            bg: "bg-slate-50",
            border: "border-slate-300",
            text: "text-slate-800",
            iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
            iconColor: "text-white",
            btnBg: "bg-slate-300",
            btnText: "text-slate-500",
            badge: "bg-slate-100 text-slate-600 border-slate-200",
        },
    };

    const config = severityConfig[policy.severity];

    return (
        <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-0 sm:p-6">
            {/* Enhanced backdrop */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 backdrop-blur-md"
                onClick={() => !loading && onClose()}
            />

            {/* Panel */}
            <div className="relative w-full sm:max-w-2xl bg-white/95 backdrop-blur-xl rounded-t-[32px] sm:rounded-[28px] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[92dvh] overflow-y-auto border border-slate-200/60">

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-4 pb-2 sm:hidden">
                    <div className="w-12 h-1.5 rounded-full bg-slate-300/80" />
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-slate-100">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", config.iconBg)}>
                        {policy.canCancel ? (
                            <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                        ) : (
                            <Ban className="w-7 h-7 text-white" strokeWidth={2.5} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-[20px] font-black text-slate-900 leading-tight tracking-tight">
                            {policy.canCancel ? "Confirmer l'annulation ?" : "Annulation impossible"}
                        </h2>
                        <p className={cn("inline-flex items-center gap-1.5 text-[12px] font-bold mt-2 px-2.5 py-1 rounded-full border", config.badge)}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isOwner ? "Vous êtes propriétaire" : "Vous êtes locataire"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 flex-shrink-0"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-5">

                    {/* Résumé des conséquences */}
                    <div className={cn("rounded-3xl border-2 overflow-hidden shadow-sm", config.border)}>
                        <div className={cn("px-5 py-3.5 border-b-2 flex items-center gap-2", config.bg, config.border)}>
                            {isOwner ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
                            ) : (
                                <DollarSign className="w-3.5 h-3.5 text-slate-600" strokeWidth={2.5} />
                            )}
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">
                                {isOwner ? "Conséquences pour vous" : "Remboursement"}
                            </p>
                        </div>

                        {isOwner ? (
                            // ── VUE PROPRIÉTAIRE ──
                            <div className="p-3.5 sm:p-5 bg-white space-y-3.5 sm:space-y-4">
                                {/* Remboursement locataire */}
                                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13.5px] font-bold text-slate-900 truncate">
                                                Remboursement locataire
                                            </p>
                                            <p className="text-[11.5px] text-slate-500 font-medium mt-0.5 truncate">
                                                AutoLoc remboursera {policy.refundPercentage}%
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[20px] font-black text-slate-900 tabular-nums whitespace-nowrap flex-shrink-0">
                                        {fmtMoney(policy.refundAmount)} <span className="text-[14px] font-semibold text-slate-500">F</span>
                                    </p>
                                </div>

                                {/* Pénalité */}
                                {policy.penaltyAmount > 0 && (
                                    <>
                                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <AlertCircleIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13.5px] font-bold text-red-900 truncate">
                                                        Votre pénalité
                                                    </p>
                                                    <p className="text-[11.5px] text-red-700 font-medium mt-0.5 truncate">
                                                        {policy.penaltyPercentage}% du montant de base
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[20px] font-black text-red-600 tabular-nums whitespace-nowrap flex-shrink-0">
                                                {fmtMoney(policy.penaltyAmount)} <span className="text-[14px] font-semibold text-red-500">F</span>
                                            </p>
                                        </div>

                                        {/* Explication prélèvement */}
                                        <div className={cn("rounded-2xl border-2 px-3 py-3 sm:px-4 sm:py-3.5 flex items-start gap-3", config.bg, config.border)}>
                                            <Lightbulb className={cn("w-4 h-4 flex-shrink-0 mt-0.5", config.text)} strokeWidth={2.5} />
                                            <p className={cn("text-[12.5px] font-semibold leading-relaxed", config.text)}>
                                                Cette pénalité sera <strong className="font-black">déduite de votre prochaine location</strong>. Si votre wallet n'a pas assez de solde, elle sera enregistrée comme dette.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Aucune pénalité */}
                                {policy.penaltyAmount === 0 && (
                                    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-3 py-3 sm:px-4 sm:py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                                            </div>
                                            <p className="text-[12.5px] text-emerald-900 font-bold leading-relaxed">
                                                Aucune pénalité ne vous sera appliquée.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ── VUE LOCATAIRE ──
                            <div className="p-3.5 sm:p-5 bg-white space-y-3.5 sm:space-y-4">
                                {/* Montant remboursé */}
                                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13.5px] font-bold text-emerald-900 truncate">
                                                Vous serez remboursé
                                            </p>
                                            <p className="text-[11.5px] text-emerald-700 font-medium mt-0.5 truncate">
                                                {policy.refundPercentage}% du montant payé
                                            </p>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-[20px] font-black tabular-nums whitespace-nowrap flex-shrink-0",
                                        policy.refundAmount > 0 ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {fmtMoney(policy.refundAmount)} <span className="text-[14px] font-semibold opacity-70">F</span>
                                    </p>
                                </div>

                                {/* Montant perdu */}
                                {totalLocataire !== undefined && policy.refundAmount < totalLocataire && (
                                    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                                <XCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13.5px] font-bold text-red-900 truncate">
                                                    Frais d'annulation
                                                </p>
                                                <p className="text-[11.5px] text-red-700 font-medium mt-0.5 truncate">
                                                    {100 - policy.refundPercentage}% non remboursé
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[20px] font-black text-red-600 tabular-nums whitespace-nowrap flex-shrink-0">
                                            {fmtMoney(totalLocataire - policy.refundAmount)} <span className="text-[14px] font-semibold text-red-500">F</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Avertissements */}
                    {policy.warnings.length > 0 && (
                        <div className={cn("rounded-2xl border-2 px-3 py-3 sm:px-4 sm:py-4 space-y-2.5", config.bg, config.border)}>
                            {policy.warnings.map((warning, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", policy.severity === 'blocked' ? 'bg-slate-200' : 'bg-white/80')}>
                                        <Info className={cn("w-3.5 h-3.5", config.text)} strokeWidth={2.5} />
                                    </div>
                                    <p className={cn("text-[12.5px] font-semibold leading-relaxed pt-0.5", config.text)}>
                                        {warning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Raison */}
                    {policy.canCancel && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                                <span>Raison de l'annulation</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={raison}
                                onChange={(e) => setRaison(e.target.value)}
                                placeholder="Expliquez brièvement pourquoi vous annulez..."
                                className="w-full rounded-2xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 px-3 py-3 sm:px-4 sm:py-3.5 text-[13.5px] font-medium resize-none transition-all disabled:opacity-50"
                                rows={3}
                                disabled={loading}
                            />
                            <div className="flex items-center justify-between px-1">
                                <span className={cn(
                                    "text-[11px] font-bold flex items-center gap-1",
                                    raison.trim().length > 0 && raison.trim().length < 10
                                        ? "text-red-500" : "text-slate-400"
                                )}>
                                    {raison.trim().length > 0 && raison.trim().length < 10 && (
                                        <>
                                            <AlertTriangle className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
                                            Minimum 10 caractères requis
                                        </>
                                    )}
                                </span>
                                <span className="text-[11px] text-slate-400 font-semibold tabular-nums">
                                    {raison.length}/500
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                        <button
                            onClick={() => !loading && onClose()}
                            disabled={loading}
                            className="w-full sm:flex-1 px-5 py-3.5 rounded-2xl text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-2 border-slate-200 transition-all disabled:opacity-40"
                        >
                            Retour
                        </button>
                        {policy.canCancel && (
                            <button
                                onClick={() => raison.trim().length >= 10 && onConfirm(raison)}
                                disabled={loading || raison.trim().length < 10}
                                className={cn(
                                    "w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[14px] font-black transition-all duration-200",
                                    raison.trim().length >= 10 && !loading
                                        ? `${config.btnBg} ${config.btnText} hover:-translate-y-0.5 active:translate-y-0 active:shadow-md`
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed",
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                                )}
                                Confirmer l'annulation
                            </button>
                        )}
                    </div>
                </div>

                {/* iOS safe area bottom padding */}
                <div className="sm:hidden pb-[env(safe-area-inset-bottom)]" />
            </div>
        </div>
    );
}
