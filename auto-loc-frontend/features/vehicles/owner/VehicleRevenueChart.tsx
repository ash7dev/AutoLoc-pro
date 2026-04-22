'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface VehicleRevenueChartProps {
    reservations: any[];
}

export function VehicleRevenueChart({ reservations }: VehicleRevenueChartProps) {
    const data = useMemo(() => {
        // Obtenir les 6 derniers mois
        const months: { date: Date; label: string; yearMonth: string; revenu: number }[] = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                date: d,
                label: d.toLocaleDateString('fr-FR', { month: 'short' }),
                yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                revenu: 0
            });
        }

        // Agréger les revenus des réservations TERMINÉES
        reservations.forEach(r => {
            if (r.statut === 'TERMINEE') {
                const rDate = new Date(r.dateFin); // La date de fin de location marque le gain
                const yearMonth = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}`;
                
                const monthEntry = months.find(m => m.yearMonth === yearMonth);
                if (monthEntry) {
                    monthEntry.revenu += Number(r.montantProprietaire || 0);
                }
            }
        });

        return months;
    }, [reservations]);

    // Calcul de la tendance (Mois en cours vs Mois précédent)
    const currentMonthRev = data[5]?.revenu || 0;
    const previousMonthRev = data[4]?.revenu || 0;
    
    let trend = 0;
    if (previousMonthRev === 0 && currentMonthRev > 0) trend = 100;
    else if (previousMonthRev > 0) {
        trend = ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100;
    }

    const formatFCFA = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

    // S'il n'y a eu aucun revenu sur la période
    const totalRevenue = data.reduce((sum, m) => sum + m.revenu, 0);
    
    if (totalRevenue === 0) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 flex flex-col items-center justify-center gap-3 h-[300px]">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <DollarSign className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-700">Aucun revenu récent</h3>
                <p className="text-[12px] text-slate-400 text-center max-w-xs">
                    Terminez des locations pour voir l'évolution de vos gains sur ce graphique.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/50">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-black tracking-tight text-slate-800">Évolution des revenus</h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">Sur les 6 derniers mois</p>
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {trend >= 0 ? (
                        <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                    ) : (
                        <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
                </div>
            </div>

            <div className="p-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}
                            labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                            formatter={(value: any) => [formatFCFA(Number(value)), 'Revenus nets']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenu" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenu)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
