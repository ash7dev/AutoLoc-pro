"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, Loader2, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (heureDebut: string) => void;
    loading?: boolean;
    dateDebut?: string; // Date de début de la réservation
}

export function ConfirmModal({ open, onClose, onConfirm, loading = false, dateDebut }: ConfirmModalProps) {
    const [heureDebut, setHeureDebut] = useState("");
    const [isPastTime, setIsPastTime] = useState(false);

    useEffect(() => {
        if (!open) {
            setHeureDebut("");
            setIsPastTime(false);
        }
    }, [open]);

    // Validation de l'heure sélectionnée
    useEffect(() => {
        if (!heureDebut || !dateDebut) {
            setIsPastTime(false);
            return;
        }

        const [hours, minutes] = heureDebut.split(':').map(Number);
        const selectedDateTime = new Date(dateDebut);
        selectedDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        setIsPastTime(selectedDateTime < now);
    }, [heureDebut, dateDebut]);

    const canConfirm = heureDebut.length === 5 && !loading && !isPastTime;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={() => !loading && onClose()}
            />

            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4">
                    <div>
                        <h2 className="text-[18px] font-black text-slate-900 leading-tight">
                            Confirmer la réservation
                        </h2>
                        <p className="text-[12.5px] text-slate-400 mt-0.5 font-medium">
                            Définissez l'heure de remise des clés
                        </p>
                    </div>
                    <button
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 flex-shrink-0 ml-3 mt-0.5"
                    >
                        <X className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-5 pb-5 space-y-4">

                    {/* Bloc heure */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-slate-500" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-slate-800 leading-tight">Heure de remise des clés</p>
                                <p className="text-[11px] text-slate-400 font-medium">À quelle heure le véhicule sera disponible ?</p>
                            </div>
                        </div>

                        {/* Time input grand format */}
                        <div className="px-4 py-4">
                            <input
                                type="time"
                                value={heureDebut}
                                onChange={e => setHeureDebut(e.target.value)}
                                className={cn(
                                    "w-full text-center text-[36px] tracking-tight font-black rounded-xl border-2 bg-white px-4 py-3 text-slate-900",
                                    "focus:outline-none transition-all",
                                    isPastTime
                                        ? "border-red-400 focus:ring-4 focus:ring-red-500/10"
                                        : heureDebut
                                        ? "border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                                        : "border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10",
                                )}
                            />
                            {isPastTime && (
                                <p className="text-[11.5px] text-red-600 font-semibold mt-2 text-center">
                                    L'heure sélectionnée est déjà passée. Veuillez choisir une heure future.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bloc important — compact */}
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                            <p className="text-[11.5px] font-black text-emerald-800 uppercase tracking-wide">Important</p>
                        </div>
                        <p className="text-[11.5px] text-emerald-800/80 font-medium leading-relaxed">
                            Cette heure détermine le début officiel de la location et le déclenchement du paiement.
                        </p>
                    </div>

                    {/* Note retour */}
                    <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200/50 rounded-2xl">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11.5px] font-medium text-amber-800 leading-relaxed">
                            L'heure de retour sera ajustée à{" "}
                            <strong className="font-black text-amber-900">heure de remise + 1h de courtoisie</strong>.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 pt-1">
                        <button
                            onClick={() => !loading && onClose()}
                            disabled={loading}
                            className="px-4 py-3 rounded-2xl text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-40 flex-shrink-0"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => canConfirm && onConfirm(heureDebut)}
                            disabled={!canConfirm}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-bold transition-all duration-200",
                                canConfirm
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-px active:translate-y-0"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed",
                            )}
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                            }
                            Confirmer la location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
