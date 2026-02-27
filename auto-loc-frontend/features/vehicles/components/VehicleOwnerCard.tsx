'use client';

/* ═══════════════════════════════════════════════════════════════════
   VehicleOwnerCard
   Shows verified owner info at the bottom of the left column
═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import {
    ShieldCheck, Star, MessageCircle, ChevronUp, CreditCard, ArrowRight,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface OwnerCardProps { vehicle: Vehicle }

export function VehicleOwnerCard({ vehicle }: OwnerCardProps): React.ReactElement {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-black tracking-tight text-slate-900">Le propriétaire</h2>
                <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Avatar */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-[18px] font-black">
                        {(vehicle.proprietaire?.prenom?.[0] ?? 'P').toUpperCase()}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-bold text-slate-900">
                            {vehicle.proprietaire?.prenom ?? 'Propriétaire'}
                            {vehicle.proprietaire?.nom ? ` ${vehicle.proprietaire.nom[0]}.` : ''}
                        </p>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                            Vérifié KYC
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[12px] text-slate-500 font-medium">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                            {vehicle.note?.toFixed(1) ?? '—'}
                            <span className="text-slate-400">({vehicle.totalAvis ?? 0} avis)</span>
                        </span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[12px] text-slate-500 font-medium">
                            {vehicle.totalLocations ?? 0} locations
                        </span>
                    </div>
                    <p className="mt-2.5 text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                        Ce véhicule a été inspecté et validé par notre équipe. Le propriétaire dispose d&apos;un profil vérifié et d&apos;un KYC valide sur AutoLoc.
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 text-[13.5px] font-semibold text-slate-700"
            >
                <MessageCircle className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                Contacter le propriétaire
            </button>
        </section>
    );
}


/* ═══════════════════════════════════════════════════════════════════
   MobileReservationBar
   Sticky bottom CTA on mobile — opens a sheet with the full form
═══════════════════════════════════════════════════════════════════ */

interface MobileBarProps {
    vehicleId: string;
    prixParJour: number;
    joursMinimum: number;
}

export function MobileReservationBar({ vehicleId, prixParJour, joursMinimum }: MobileBarProps): React.ReactElement {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
        <>
            {/* ── Bottom bar ─────────────────────────────────────────── */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dès</p>
                    <p className="text-[20px] font-black text-slate-900 tabular-nums leading-tight">
                        {formatPrice(prixParJour)}{' '}
                        <span className="text-[11px] font-semibold text-slate-400">FCFA/j</span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-150 active:scale-95"
                >
                    Réserver
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
            </div>

            {/* ── Bottom sheet ─────────────────────────────────────── */}
            {sheetOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSheetOpen(false)}
                    />
                    {/* Sheet */}
                    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-slate-200" />
                        </div>
                        {/* Title */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
                            <h3 className="text-[16px] font-black text-slate-900">Réserver ce véhicule</h3>
                            <button
                                type="button"
                                onClick={() => setSheetOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                            >
                                <ChevronUp className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                            </button>
                        </div>
                        {/* Inline ReservationSidebar content */}
                        <div className="px-5 pb-8 pt-4">
                            {/* Import the sidebar inline for the sheet */}
                            <SheetReservationForm
                                vehicleId={vehicleId}
                                prixParJour={prixParJour}
                                joursMinimum={joursMinimum}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

/* ── Minimal inline form for the bottom sheet ──────────────────── */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';

function SheetReservationForm({ vehicleId, prixParJour, joursMinimum }: MobileBarProps) {
    const router = useRouter();
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loadingPricing, setLoadingPricing] = useState(false);
    const [contractAccepted, setContractAccepted] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const nbJours = dateDebut && dateFin
        ? Math.max(1, Math.round((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000))
        : 0;

    const datesValid = nbJours >= joursMinimum;
    const today = new Date().toISOString().split('T')[0];
    const canReserve = datesValid && contractAccepted && pricing && !loadingPricing;

    const doFetch = useCallback(async (days: number) => {
        setLoadingPricing(true);
        try {
            const r = await fetchVehiclePricing(vehicleId, days);
            setPricing(r);
        } catch {
            setPricing({
                nbJours: days, prixParJour,
                totalBase: prixParJour * days,
                tauxCommission: 0.15,
                montantCommission: Math.round(prixParJour * days * 0.15),
                totalLocataire: Math.round(prixParJour * days * 1.15),
                netProprietaire: prixParJour * days,
            });
        } finally { setLoadingPricing(false); }
    }, [vehicleId, prixParJour]);

    useEffect(() => {
        if (nbJours >= 1) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => doFetch(nbJours), 300);
        } else setPricing(null);
        return () => clearTimeout(debounceRef.current);
    }, [nbJours, doFetch]);

    return (
        <div className="space-y-4">
            {/* Date range */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 focus-within:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date début</p>
                        <input type="date" value={dateDebut} min={today}
                            onChange={e => { setDateDebut(e.target.value); if (dateFin && e.target.value >= dateFin) setDateFin(''); }}
                            className="w-full text-[13.5px] font-semibold text-slate-800 bg-transparent outline-none" />
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Date fin</p>
                        <input type="date" value={dateFin} min={dateDebut || today}
                            onChange={e => setDateFin(e.target.value)}
                            className="w-full text-[13.5px] font-semibold text-slate-800 bg-transparent outline-none" />
                    </div>
                </div>
            </div>

            {/* Pricing */}
            {datesValid && pricing && !loadingPricing && (
                <div className="rounded-2xl bg-slate-50 p-4 space-y-2.5">
                    <div className="flex justify-between text-[13px]">
                        <span className="text-slate-500">{formatPrice(pricing.prixParJour)} × {nbJours}j</span>
                        <span className="font-semibold text-slate-700 tabular-nums">{formatPrice(pricing.totalBase)} FCFA</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                        <span className="text-slate-500">Frais de service (15%)</span>
                        <span className="font-semibold text-slate-700 tabular-nums">{formatPrice(pricing.montantCommission)} FCFA</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-black text-emerald-600 text-[15px] tabular-nums">{formatPrice(pricing.totalLocataire)} FCFA</span>
                    </div>
                </div>
            )}
            {loadingPricing && <div className="flex justify-center py-2"><ArrowRight className="w-4 h-4 animate-spin text-emerald-400" /></div>}

            {/* Contract */}
            <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    contractAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
                    {contractAccepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <input type="checkbox" checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} className="sr-only" />
                <span className="text-[12px] text-slate-500 leading-relaxed">
                    J&apos;accepte les <span className="text-emerald-600 underline decoration-dotted">conditions</span> et le <span className="text-emerald-600 underline decoration-dotted">contrat</span>.
                </span>
            </label>

            {/* CTA */}
            <button
                type="button" disabled={!canReserve}
                onClick={() => canReserve && router.push(`/vehicle/${vehicleId}/payment?${new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) })}`)}
                className={cn('w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all duration-200',
                    canReserve ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed')}
            >
                <CreditCard className="w-4.5 h-4.5" strokeWidth={2} />
                Confirmer et réserver
                <ArrowRight className="w-4 h-4 ml-auto" strokeWidth={2.5} />
            </button>

            <p className="text-[11px] text-center text-slate-400">
                <ShieldCheck className="w-3 h-3 inline mr-1" strokeWidth={1.75} />
                Débité après confirmation du propriétaire
            </p>
        </div>
    );
}
