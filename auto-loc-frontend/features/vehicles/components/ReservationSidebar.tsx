'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarDays, Clock, CreditCard,
    CheckCircle2, ArrowRight, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props {
    vehicleId: string;
    prixParJour: number;
    joursMinimum: number;
}

export function ReservationSidebar({
    vehicleId,
    prixParJour,
    joursMinimum,
}: Props): React.ReactElement {
    const router = useRouter();
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loadingPricing, setLoadingPricing] = useState(false);
    const [contractAccepted, setContractAccepted] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Calculate nbJours from dates
    const nbJours =
        dateDebut && dateFin
            ? Math.max(
                1,
                Math.round(
                    (new Date(dateFin).getTime() - new Date(dateDebut).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
            )
            : 0;

    const datesValid = nbJours >= joursMinimum;

    // Fetch dynamic pricing when dates change
    const fetchPricing = useCallback(
        async (days: number) => {
            if (days < 1) return;
            setLoadingPricing(true);
            try {
                const result = await fetchVehiclePricing(vehicleId, days);
                setPricing(result);
            } catch {
                // Fallback to simple calculation
                setPricing({
                    nbJours: days,
                    prixParJour,
                    totalBase: prixParJour * days,
                    tauxCommission: 0.15,
                    montantCommission: Math.round(prixParJour * days * 0.15),
                    totalLocataire: Math.round(prixParJour * days * 1.15),
                    netProprietaire: prixParJour * days,
                });
            } finally {
                setLoadingPricing(false);
            }
        },
        [vehicleId, prixParJour],
    );

    useEffect(() => {
        if (nbJours >= 1) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => fetchPricing(nbJours), 300);
        } else {
            setPricing(null);
        }
        return () => clearTimeout(debounceRef.current);
    }, [nbJours, fetchPricing]);

    // Min date = today
    const today = new Date().toISOString().split('T')[0];

    const canReserve = datesValid && contractAccepted && pricing;

    function handleReserve() {
        if (!canReserve) return;
        const params = new URLSearchParams({
            dateDebut,
            dateFin,
            nbJours: String(nbJours),
        });
        router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
    }

    return (
        <div className="sticky top-[76px]">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-widest text-white/50">
                            Réservation
                        </p>
                        <span className="text-xl font-black text-emerald-400 tabular-nums">
                            {formatPrice(pricing?.prixParJour ?? prixParJour)}{' '}
                            <span className="text-sm font-semibold text-white/40">FCFA/j</span>
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Date inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                                <CalendarDays className="w-3 h-3" /> Début
                            </label>
                            <input
                                type="date"
                                value={dateDebut}
                                min={today}
                                onChange={(e) => {
                                    setDateDebut(e.target.value);
                                    if (dateFin && e.target.value >= dateFin) {
                                        setDateFin('');
                                    }
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1.5">
                                <CalendarDays className="w-3 h-3" /> Fin
                            </label>
                            <input
                                type="date"
                                value={dateFin}
                                min={dateDebut || today}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-medium text-black focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Duration warning */}
                    {dateDebut && dateFin && !datesValid && (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
                            <p className="text-[12px] text-amber-700 font-medium">
                                Durée minimum : {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {/* Price breakdown */}
                    {pricing && datesValid && (
                        <div className="space-y-2.5 rounded-xl bg-slate-50/60 border border-slate-100 p-4">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-black/50 font-medium">
                                    {formatPrice(pricing.prixParJour)} × {nbJours} jour{nbJours > 1 ? 's' : ''}
                                </span>
                                <span className="font-semibold text-black tabular-nums">
                                    {formatPrice(pricing.totalBase)} FCFA
                                </span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="text-black/50 font-medium">
                                    Frais de service (15%)
                                </span>
                                <span className="font-semibold text-black tabular-nums">
                                    {formatPrice(pricing.montantCommission)} FCFA
                                </span>
                            </div>
                            <div className="my-2 border-t border-slate-200" />
                            <div className="flex justify-between text-[15px]">
                                <span className="font-bold text-black">Total</span>
                                <span className="font-black text-emerald-600 tabular-nums">
                                    {formatPrice(pricing.totalLocataire)} FCFA
                                </span>
                            </div>
                            {loadingPricing && (
                                <div className="flex items-center justify-center py-1">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contract checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={contractAccepted}
                                onChange={(e) => setContractAccepted(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                                    contractAccepted
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-slate-300 group-hover:border-slate-400',
                                )}
                            >
                                {contractAccepted && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                )}
                            </div>
                        </div>
                        <span className="text-[12px] leading-relaxed font-medium text-black/50 group-hover:text-black/70 transition-colors">
                            J&apos;accepte les{' '}
                            <span className="text-emerald-600 underline decoration-dotted">
                                conditions générales de location
                            </span>{' '}
                            et le{' '}
                            <span className="text-emerald-600 underline decoration-dotted">
                                contrat de réservation
                            </span>
                            .
                        </span>
                    </label>

                    {/* Reserve button */}
                    <button
                        type="button"
                        disabled={!canReserve}
                        onClick={handleReserve}
                        className={cn(
                            'w-full flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5',
                            'text-[14px] font-bold tracking-tight transition-all duration-200',
                            canReserve
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-px active:translate-y-0'
                                : 'bg-slate-100 text-black/30 cursor-not-allowed',
                        )}
                    >
                        <CreditCard className="w-4.5 h-4.5" strokeWidth={2} />
                        Réserver maintenant
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </button>

                    {/* Info */}
                    <p className="text-[11px] text-center text-black/30 font-medium">
                        Vous ne serez débité qu'après confirmation du propriétaire.
                    </p>
                </div>
            </div>
        </div>
    );
}
