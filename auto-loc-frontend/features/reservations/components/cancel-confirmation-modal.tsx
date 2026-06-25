"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, XCircle, Ban, Info, Loader2 } from "lucide-react";
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
            // Jour même - BLOQUÉ
            const penalty = _totalBase * 0.4;
            return {
                canCancel: false,
                refundAmount: _totalLocataire,
                refundPercentage: 100,
                penaltyAmount: penalty,
                penaltyPercentage: 40,
                warnings: [
                    "Annulation le jour même impossible",
                    "Contactez le locataire directement",
                ],
                severity: "blocked",
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
            border: "border-emerald-200",
            text: "text-emerald-800",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            btnBg: "bg-emerald-500 hover:bg-emerald-600",
            btnText: "text-white",
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-900",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            btnBg: "bg-amber-500 hover:bg-amber-600",
            btnText: "text-white",
        },
        danger: {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-900",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            btnBg: "bg-red-500 hover:bg-red-600",
            btnText: "text-white",
        },
        blocked: {
            bg: "bg-slate-50",
            border: "border-slate-300",
            text: "text-slate-800",
            iconBg: "bg-slate-200",
            iconColor: "text-slate-600",
            btnBg: "bg-slate-400",
            btnText: "text-white",
        },
    };

    const config = severityConfig[policy.severity];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={() => !loading && onClose()}
            />

            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">

                {/* Header */}
                <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.iconBg)}>
                        {policy.canCancel ? (
                            <AlertTriangle className={cn("w-5 h-5", config.iconColor)} strokeWidth={2.5} />
                        ) : (
                            <Ban className={cn("w-5 h-5", config.iconColor)} strokeWidth={2.5} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-black text-slate-900 leading-tight">
                            {policy.canCancel ? "Confirmer l'annulation ?" : "Annulation impossible"}
                        </h2>
                        <p className="text-[12.5px] text-slate-500 mt-0.5 font-medium">
                            {isOwner ? "Vous êtes propriétaire" : "Vous êtes locataire"}
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4 space-y-4">

                    {/* Résumé des conséquences */}
                    <div className={cn("rounded-2xl border-2 overflow-hidden", config.border)}>
                        <div className={cn("px-4 py-3 border-b", config.bg, config.border)}>
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                                {isOwner ? "Conséquences pour vous" : "Remboursement"}
                            </p>
                        </div>

                        {isOwner ? (
                            // ── VUE PROPRIÉTAIRE ──
                            <div className="p-4 bg-white space-y-3">
                                {/* Remboursement locataire */}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-700">
                                            Remboursement locataire
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            AutoLoc remboursera {policy.refundPercentage}%
                                        </p>
                                    </div>
                                    <p className="text-[17px] font-black text-slate-900 tabular-nums">
                                        {fmtMoney(policy.refundAmount)} F
                                    </p>
                                </div>

                                {/* Pénalité */}
                                {policy.penaltyAmount > 0 && (
                                    <>
                                        <div className="border-t border-slate-100 pt-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[13px] font-semibold text-red-700">
                                                        Votre pénalité
                                                    </p>
                                                    <p className="text-[11px] text-red-600 mt-0.5">
                                                        {policy.penaltyPercentage}% du montant de base
                                                    </p>
                                                </div>
                                                <p className="text-[17px] font-black text-red-600 tabular-nums">
                                                    {fmtMoney(policy.penaltyAmount)} F
                                                </p>
                                            </div>
                                        </div>

                                        {/* Explication prélèvement */}
                                        <div className={cn("rounded-xl border px-3 py-2.5", config.bg, config.border)}>
                                            <p className={cn("text-[11.5px] font-medium leading-relaxed", config.text)}>
                                                💡 Cette pénalité sera <strong className="font-bold">déduite de votre prochaine location</strong>. Si votre wallet n'a pas assez de solde, elle sera enregistrée comme dette.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Aucune pénalité */}
                                {policy.penaltyAmount === 0 && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                                        <p className="text-[11.5px] text-emerald-800 font-medium leading-relaxed">
                                            ✅ <strong className="font-bold">Aucune pénalité</strong> ne vous sera appliquée.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ── VUE LOCATAIRE ──
                            <div className="p-4 bg-white space-y-3">
                                {/* Montant remboursé */}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-700">
                                            Vous serez remboursé
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {policy.refundPercentage}% du montant payé
                                        </p>
                                    </div>
                                    <p className={cn(
                                        "text-[17px] font-black tabular-nums",
                                        policy.refundAmount > 0 ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {fmtMoney(policy.refundAmount)} F
                                    </p>
                                </div>

                                {/* Montant perdu */}
                                {totalLocataire !== undefined && policy.refundAmount < totalLocataire && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-700">
                                                    Frais d'annulation
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {100 - policy.refundPercentage}% non remboursé
                                                </p>
                                            </div>
                                            <p className="text-[17px] font-black text-red-600 tabular-nums">
                                                {fmtMoney(totalLocataire - policy.refundAmount)} F
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Avertissements */}
                    {policy.warnings.length > 0 && (
                        <div className={cn("rounded-xl border px-3.5 py-3 space-y-1.5", config.bg, config.border)}>
                            {policy.warnings.map((warning, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <Info className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", config.iconColor)} strokeWidth={2.5} />
                                    <p className={cn("text-[11.5px] font-medium leading-relaxed", config.text)}>
                                        {warning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Raison */}
                    {policy.canCancel && (
                        <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-2">
                                Raison de l'annulation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={raison}
                                onChange={(e) => setRaison(e.target.value)}
                                placeholder="Expliquez brièvement pourquoi vous annulez..."
                                className="w-full rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 px-4 py-3 text-[13px] resize-none transition-all"
                                rows={3}
                                disabled={loading}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 pt-1">
                        <button
                            onClick={() => !loading && onClose()}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-2xl text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-40"
                        >
                            Retour
                        </button>
                        {policy.canCancel && (
                            <button
                                onClick={() => raison.trim().length >= 10 && onConfirm(raison)}
                                disabled={loading || raison.trim().length < 10}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-bold transition-all duration-200",
                                    raison.trim().length >= 10 && !loading
                                        ? `${config.btnBg} ${config.btnText} shadow-lg hover:-translate-y-px active:translate-y-0`
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed",
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <XCircle className="w-4 h-4" strokeWidth={2.5} />
                                )}
                                Confirmer l'annulation
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
