'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface VehicleRevenueChartProps {
    reservations: any[];
}

export function VehicleRevenueChart({ reservations }: VehicleRevenueChartProps) {
    const data = useMemo(() => {
        // Obtenir les 6 derniers mois
        const months: {
            date: Date;
            label: string;
            yearMonth: string;
            revenuTermine: number;
            revenuPrevisionnel: number;
        }[] = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                date: d,
                label: d.toLocaleDateString('fr-FR', { month: 'short' }),
                yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                revenuTermine: 0,
                revenuPrevisionnel: 0
            });
        }

        // Agréger les revenus
        reservations.forEach(r => {
            const rDate = new Date(r.dateFin); // La date de fin de location marque le gain
            const yearMonth = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`;

            const monthEntry = months.find(m => m.yearMonth === yearMonth);
            if (monthEntry) {
                const montant = Number(r.montantProprietaire || 0);

                // Revenus confirmés (locations terminées)
                if (r.statut === 'TERMINEE') {
                    monthEntry.revenuTermine += montant;
                }
                // Revenus prévisionnels (en cours ou confirmées)
                else if (['EN_COURS', 'CONFIRMEE', 'PAYEE'].includes(r.statut)) {
                    monthEntry.revenuPrevisionnel += montant;
                }
            }
        });

        return months;
    }, [reservations]);

    // Calcul des totaux
    const totalTermine = data.reduce((sum, m) => sum + m.revenuTermine, 0);
    const totalPrevisionnel = data.reduce((sum, m) => sum + m.revenuPrevisionnel, 0);
    const totalCombine = totalTermine + totalPrevisionnel;

    // Calcul de la tendance (revenus terminés : Mois en cours vs Mois précédent)
    const currentMonthRev = data[5]?.revenuTermine || 0;
    const previousMonthRev = data[4]?.revenuTermine || 0;

    let trend = 0;
    if (previousMonthRev === 0 && currentMonthRev > 0) trend = 100;
    else if (previousMonthRev > 0) {
        trend = ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100;
    }

    const formatFCFA = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

    // Toujours afficher le graphique (même avec 0)
    const hasData = totalCombine > 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md shadow-slate-100/60">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md shadow-slate-900/20">
                            <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-[14px] sm:text-[15px] font-black text-slate-900 tracking-tight">Évolution des revenus</h3>
                            <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium mt-0.5">Sur les 6 derniers mois</p>
                        </div>
                    </div>

                    {totalTermine > 0 && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                            trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                            {trend >= 0 ? (
                                <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                            ) : (
                                <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
                            )}
                            {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            {hasData && (
                <div className="px-5 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Encaissé</p>
                                <p className="text-[14px] sm:text-[15px] font-black text-slate-900 tabular-nums">
                                    {formatFCFA(totalTermine)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">En cours</p>
                                <p className="text-[14px] sm:text-[15px] font-black text-slate-900 tabular-nums">
                                    {formatFCFA(totalPrevisionnel)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            {!hasData ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-2">
                        <DollarSign className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-700">Aucune activité récente</h3>
                    <p className="text-[12px] text-slate-400 text-center max-w-sm leading-relaxed">
                        Lorsque vous aurez des réservations confirmées ou terminées, vous verrez l'évolution de vos revenus ici.
                    </p>
                </div>
            ) : (
                <div className="p-5 sm:p-6 h-[280px]" style={{ minWidth: 0, minHeight: 280 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenuTermine" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorRevenuPrevisionnel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}
                                formatter={(value: any, name: string) => {
                                    const label = name === 'revenuTermine' ? 'Encaissé' : 'En cours';
                                    const color = name === 'revenuTermine' ? '#10b981' : '#f59e0b';
                                    return [
                                        <span style={{ color, fontWeight: 'bold', fontSize: '13px' }}>
                                            {formatFCFA(Number(value))}
                                        </span>,
                                        label
                                    ];
                                }}
                            />
                            {/* Revenus prévisionnels (en arrière-plan, transparent) */}
                            <Area
                                type="monotone"
                                dataKey="revenuPrevisionnel"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorRevenuPrevisionnel)"
                                activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }}
                            />
                            {/* Revenus terminés (au premier plan, solide) */}
                            <Area
                                type="monotone"
                                dataKey="revenuTermine"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenuTermine)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
