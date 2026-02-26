'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TarifTier } from '@/lib/nestjs/vehicles';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props {
    prixParJour: number;
    tiers: TarifTier[];
}

export function VehiclePricingTable({ prixParJour, tiers }: Props): React.ReactElement {
    if (tiers.length === 0) {
        return (
            <div className="space-y-3">
                <h2 className="text-[16px] font-black tracking-tight text-black">Tarification</h2>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <Tag className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    <p className="text-[14px] font-semibold text-emerald-800">
                        {formatPrice(prixParJour)} FCFA <span className="font-medium text-emerald-600">/ jour</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h2 className="text-[16px] font-black tracking-tight text-black">
                Tarifs dégressifs
            </h2>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-black/30">
                                Durée
                            </th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-black/30 text-right">
                                Prix / jour
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map((tier, i) => {
                            const label = tier.joursMax
                                ? `${tier.joursMin} – ${tier.joursMax} jours`
                                : `${tier.joursMin}+ jours`;
                            const isLast = i === tiers.length - 1;
                            return (
                                <tr
                                    key={tier.id}
                                    className={cn(
                                        'transition-colors hover:bg-slate-50/50',
                                        !isLast && 'border-b border-slate-50',
                                    )}
                                >
                                    <td className="px-4 py-3 text-[13px] font-medium text-black/70">
                                        {label}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] font-bold text-emerald-600 text-right tabular-nums">
                                        {formatPrice(tier.prix)} <span className="text-[11px] font-medium text-emerald-400">FCFA</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
