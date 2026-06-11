"use client";

import { X, Clock, ShieldCheck } from "lucide-react";

interface TimeLockedModalProps {
    open: boolean;
    onClose: () => void;
    /** ISO string de la date/heure de début de la réservation */
    dateDebut: string;
    /** Titre personnalisé (ex: "Check-in", "Signalement") */
    title?: string;
}

function formatDateTimeFr(d: string | Date): string {
    return new Date(d).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatTimeFr(d: string | Date): string {
    return new Date(d).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Calcule l'heure exacte de déblocage : 2h avant dateDebut.
 */
function getUnlockTime(dateDebut: string): Date {
    return new Date(new Date(dateDebut).getTime() - 2 * 60 * 60 * 1000);
}

/**
 * Vérifie si on est trop tôt (plus de 2h avant dateDebut).
 */
export function isTooEarlyFor2h(dateDebut?: string): boolean {
    if (!dateDebut) return false;
    return new Date() < getUnlockTime(dateDebut);
}

/**
 * Modal "Action verrouillée" — fond blanc, icône SVG, message clair.
 * S'affiche quand un utilisateur tente une action bloquée jusqu'à 2h avant
 * l'heure de début de la réservation.
 */
export function TimeLockedModal({ open, onClose, dateDebut, title }: TimeLockedModalProps) {
    if (!open) return null;

    const unlockTime = getUnlockTime(dateDebut);
    const debutDate = new Date(dateDebut);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors z-10"
                >
                    <X className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 space-y-5">
                    {/* Icon — shield + clock */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-9 h-9 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shadow-sm">
                            <Clock className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <h2 className="text-[18px] font-black text-slate-900 leading-tight">
                            {title ?? "Action verrouillée"}
                        </h2>
                        <p className="text-[13px] text-slate-400 font-medium">
                            Mesure de sécurité AutoLoc
                        </p>
                    </div>

                    {/* Message */}
                    <div className="space-y-3 w-full">
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                            Pour des raisons de sécurité, cette action sera disponible{" "}
                            <span className="font-bold text-slate-900">
                                2 heures avant le début
                            </span>{" "}
                            de la réservation.
                        </p>

                        {/* Unlock date card */}
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 px-4 py-3.5 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600/60">
                                Débloqué à partir de
                            </p>
                            <p className="text-[20px] font-black text-emerald-700 tabular-nums leading-none">
                                {formatTimeFr(unlockTime)}
                            </p>
                            <p className="text-[12px] font-semibold text-emerald-600/80">
                                {formatDateTimeFr(unlockTime).replace(
                                    formatTimeFr(unlockTime),
                                    ""
                                ).replace(" à ", "").trim()}
                            </p>
                        </div>

                        {/* Info — heure de début */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Début de la réservation
                                </span>
                                <span className="text-[12px] font-bold text-slate-700">
                                    {formatTimeFr(debutDate)}{" "}
                                    <span className="text-slate-400 font-medium">
                                        · {new Date(dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[14px] font-bold hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98]"
                    >
                        J&apos;ai compris
                    </button>
                </div>
            </div>
        </div>
    );
}
