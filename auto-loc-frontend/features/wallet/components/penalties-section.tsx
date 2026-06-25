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
            <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 border-b border-red-600">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-black text-white leading-tight">
                                Pénalités en attente
                            </h3>
                            <p className="text-[12px] text-red-100 mt-0.5 font-medium">
                                {data.count} pénalité{data.count > 1 ? "s" : ""} · Sera{data.count > 1 ? "ont" : ""} prélevée{data.count > 1 ? "s" : ""} sur votre prochain paiement
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-red-100 font-bold uppercase tracking-wide">Total dette</p>
                        <p className="text-[22px] font-black text-white leading-none mt-1 tabular-nums">
                            {fmtMoney(data.totalDette)}
                        </p>
                        <p className="text-[11px] text-red-100 font-semibold">FCFA</p>
                    </div>
                </div>
            </div>

            {/* Explication */}
            <div className="px-5 py-3.5 bg-red-100/50 border-b border-red-200">
                <p className="text-[12px] text-red-800 font-medium leading-relaxed">
                    💡 <strong className="font-bold">Comment ça marche :</strong> À votre prochaine location, ce montant sera automatiquement déduit de votre revenu. Par exemple, si vous devez recevoir 50,000 FCFA et que vous avez {fmtMoney(data.totalDette)} FCFA de pénalités, vous recevrez {fmtMoney(50000 - data.totalDette)} FCFA.
                </p>
            </div>

            {/* Liste des pénalités */}
            <div className="divide-y divide-red-200 bg-white">
                {data.penalites.map((penalty) => (
                    <Link
                        key={penalty.id}
                        href={`/dashboard/owner/reservations/${penalty.reservationId}`}
                        className="block px-5 py-4 hover:bg-red-50/50 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon véhicule */}
                            <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Car className="w-4 h-4 text-red-600" strokeWidth={2} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                                    {penalty.vehicule}
                                </p>
                                <p className="text-[12px] text-red-600 font-semibold mt-1">
                                    {penalty.raison}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-slate-400" strokeWidth={2} />
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            {fmtDate(penalty.dateLocation)}
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-slate-300">•</span>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Créée le {fmtDate(penalty.creeLe)}
                                    </p>
                                </div>
                            </div>

                            {/* Montant */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-[16px] font-black text-red-600 tabular-nums">
                                    {fmtMoney(penalty.montant)}
                                </p>
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide mt-0.5">
                                    FCFA
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer avec avertissement */}
            <div className="px-5 py-3.5 bg-amber-50 border-t border-amber-200">
                <p className="text-[11.5px] text-amber-900 font-medium leading-relaxed">
                    ⚠️ <strong className="font-bold">Attention :</strong> Les annulations répétées peuvent entraîner la suspension de votre compte propriétaire.
                </p>
            </div>
        </div>
    );
}
