"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (heureDebut: string) => void;
    loading?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, loading = false }: ConfirmModalProps) {
    const [heureDebut, setHeureDebut] = useState("");

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setHeureDebut("");
        }
    }, [open]);

    const canConfirm = heureDebut.length === 5 && !loading;

    const handleConfirm = () => {
        if (canConfirm) {
            onConfirm(heureDebut);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !loading && onClose()} />

            {/* Mobile: Bottom sheet | Desktop: Centered modal */}
            <div className="relative w-full sm:max-w-sm sm:max-h-[90vh] sm:overflow-y-auto sm:rounded-2xl bg-white border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 fixed bottom-0 sm:relative sm:bottom-auto rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
                {/* Mobile drag handle */}
                <div className="sm:hidden flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200">
                    <div>
                        <h2 className="text-[17px] font-black text-slate-900">Confirmer la réservation</h2>
                        <p className="text-[12px] text-slate-500 mt-0.5">
                            Définissez l'heure de remise des clés
                        </p>
                    </div>
                    <button
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40"
                    >
                        <X className="w-4 h-4 text-slate-500" strokeWidth={2} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Importance message with modern icon */}
                    <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-4">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-[13px] font-black tracking-tight text-emerald-900 mb-1">Important</h4>
                            <p className="text-[11.5px] font-medium text-emerald-800/90 leading-relaxed">
                                L'heure exacte de remise est cruciale pour le bon déroulement de la location. Elle détermine le début officiel de la période de location et le déclenchement automatique du paiement.
                            </p>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-9 h-9 rounded-[10px] bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0 text-slate-600 mt-0.5">
                            <Clock className="w-4.5 h-4.5" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-[14.5px] font-black tracking-tight text-slate-900">Heure de remise des clés</h4>
                            <p className="text-[11.5px] font-medium text-slate-600 mt-1 leading-snug">
                                À quelle heure le véhicule sera-t-il disponible pour le locataire ?
                            </p>
                        </div>
                    </div>

                    {/* Time input */}
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="time"
                                value={heureDebut}
                                onChange={e => setHeureDebut(e.target.value)}
                                className="w-full text-center text-[28px] tracking-tight font-black rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all hover:border-slate-400"
                            />
                        </div>
                        <div className="flex items-start gap-2.5 px-2 bg-emerald-50 rounded-lg p-2.5 border border-emerald-200/50">
                            <div className="mt-0.5 text-emerald-600">
                                <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </div>
                            <p className="text-[11px] font-semibold text-emerald-800/90 leading-relaxed">
                                L'heure de retour sera automatiquement ajustée à <span className="font-bold text-emerald-900">l'heure de remise + 1h de courtoisie</span>. Le locataire sera notifié de vos disponibilités.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-white/95 backdrop-blur-md border-t border-slate-200 mt-auto">
                    <button
                        onClick={() => !loading && onClose()}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all disabled:opacity-40"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200",
                            canConfirm
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                        )}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
                        Confirmer la location
                    </button>
                </div>
            </div>
        </div>
    );
}
