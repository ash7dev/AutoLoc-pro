"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Car } from "lucide-react";
import type { PenaltiesData } from "@/lib/nestjs/wallet";

interface PenaltiesSectionProps {
    data: PenaltiesData;
}

export function PenaltiesSection({ data }: PenaltiesSectionProps) {
    const fmtMoney = (n: number) => n.toLocaleString("fr-FR");
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 overflow-hidden">
            {/* Header avec badge */}
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 border-b border-red-600">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[13px] sm:text-[15px] font-black text-white leading-tight">
                                Pénalités en attente
                            </h3>
                            <p className="text-[10px] sm:text-[12px] text-red-100 mt-0.5 font-medium truncate">
                                {data.count} pénalité{data.count > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[9px] sm:text-[11px] text-red-100 font-bold uppercase tracking-wide">Dette</p>
                        <p className="text-[18px] sm:text-[22px] font-black text-white leading-none mt-1 tabular-nums">
                            {fmtMoney(data.totalDette)}
                        </p>
                        <p className="text-[9px] sm:text-[11px] text-red-100 font-semibold">FCFA</p>
                    </div>
                </div>
            </div>

            {/* Explication */}
            <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-red-100/50 border-b border-red-200">
                <p className="text-[11px] sm:text-[12px] text-red-800 font-medium leading-relaxed">
                    💡 <strong className="font-bold">Comment ça marche :</strong> Ce montant sera déduit de votre prochain paiement.
                </p>
            </div>

            {/* Liste des pénalités */}
            <div className="divide-y divide-red-200 bg-white">
                {data.penalites.map((penalty) => (
                    <Link
                        key={penalty.id}
                        href={`/dashboard/owner/reservations/${penalty.reservationId}`}
                        className="block px-3 sm:px-5 py-3 sm:py-4 hover:bg-red-50/50 transition-colors active:bg-red-100/50"
                    >
                        <div className="flex items-start gap-2 sm:gap-3">
                            {/* Icon véhicule */}
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" strokeWidth={2} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] sm:text-[13.5px] font-bold text-slate-900 leading-tight truncate">
                                    {penalty.vehicule}
                                </p>
                                <p className="text-[11px] sm:text-[12px] text-red-600 font-semibold mt-1 line-clamp-2">
                                    {penalty.raison}
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" strokeWidth={2} />
                                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                                            {fmtDate(penalty.dateLocation)}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-slate-300 hidden sm:inline">•</span>
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                                        Créée le {fmtDate(penalty.creeLe)}
                                    </p>
                                </div>
                            </div>

                            {/* Montant */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-[14px] sm:text-[16px] font-black text-red-600 tabular-nums">
                                    {fmtMoney(penalty.montant)}
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-wide mt-0.5">
                                    FCFA
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer avec avertissement */}
            <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-amber-50 border-t border-amber-200">
                <p className="text-[10.5px] sm:text-[11.5px] text-amber-900 font-medium leading-relaxed">
                    ⚠️ <strong className="font-bold">Attention :</strong> Les annulations répétées peuvent entraîner la suspension de votre compte.
                </p>
            </div>
        </div>
    );
}
