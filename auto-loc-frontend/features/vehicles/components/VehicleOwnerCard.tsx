'use client';

/* ═══════════════════════════════════════════════════════════════════
   VehicleOwnerCard
   Shows verified owner info at the bottom of the left column
═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import {
    ShieldCheck, Star, ChevronUp, CreditCard, ArrowRight,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';

import { useCurrency } from '@/providers/currency-provider';

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
                            {[vehicle.proprietaire?.prenom, vehicle.proprietaire?.nom].filter(Boolean).join(' ') || 'Propriétaire'}
                        </p>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                            Vérifié KYC
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[12px] text-slate-700 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                            {vehicle.note != null ? Number(vehicle.note).toFixed(1) : '—'}
                            <span className="text-slate-600">({vehicle.totalAvis ?? 0} avis)</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[12px] text-slate-700 font-semibold">
                            {vehicle.totalLocations ?? 0} locations
                        </span>
                    </div>
                    <p className="mt-2.5 text-[13px] text-slate-700 leading-relaxed line-clamp-2">
                        Ce véhicule a été inspecté et validé par notre équipe. Le propriétaire dispose d&apos;un profil vérifié et d&apos;un KYC valide sur AutoLoc.
                    </p>
                </div>
            </div>

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
    const { formatPrice: currencyFormat } = useCurrency();

    return (
        <>
            {/* ── Bottom bar ─────────────────────────────────────────── */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-3 pb-safe flex items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dès</p>
                    <p className="text-[20px] font-black text-slate-900 tabular-nums leading-tight">
                        {currencyFormat(Math.round(prixParJour * 1.15))}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">/j</span>
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
                    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92dvh]">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-slate-200" />
                        </div>
                        {/* Title */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
                            <h3 className="text-[16px] font-black text-slate-900">Réserver ce véhicule</h3>
                            <button
                                type="button"
                                onClick={() => setSheetOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                            >
                                <ChevronUp className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                            </button>
                        </div>
                        {/* Content + sticky footer */}
                        <SheetReservationForm
                            vehicleId={vehicleId}
                            prixParJour={prixParJour}
                            joursMinimum={joursMinimum}
                        />
                    </div>
                </>
            )}
        </>
    );
}

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { ReservationGateModal } from '@/features/reservations/components/ReservationGateModal';

function SheetReservationForm({ vehicleId, prixParJour, joursMinimum }: MobileBarProps) {
    const router = useRouter();
    const { formatPrice: currencyFormat } = useCurrency();
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loadingPricing, setLoadingPricing] = useState(false);
    const [contractAccepted, setContractAccepted] = useState(false);
    const [gateOpen, setGateOpen] = useState(false);
    const [gateProfile, setGateProfile] = useState<ProfileResponse | null>(null);
    const [gateLoading, setGateLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const nbJours = dateDebut && dateFin
        ? Math.max(1, Math.round((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000) + 1)
        : 0;

    const datesValid = nbJours >= joursMinimum;
    const canReserve = datesValid && contractAccepted && pricing && !loadingPricing;

    const buildParams = () => new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });

    async function handleReserve() {
        if (!canReserve || gateLoading) return;
        setGateLoading(true);
        try {
            const profile = await apiFetch<ProfileResponse>('/auth/me');
            if (!profile.phoneVerified || !profile.phone || profile.kycStatus !== 'VERIFIE') {
                setGateProfile(profile);
                setGateOpen(true);
                return;
            }
            router.push(`/vehicle/${vehicleId}/payment?${buildParams()}`);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
                router.push(`/login?redirect=${redirect}`);
                return;
            }
            router.push(`/vehicle/${vehicleId}/payment?${buildParams()}`);
        } finally {
            setGateLoading(false);
        }
    }

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
        <>
            <ReservationGateModal
                open={gateOpen}
                onOpenChange={setGateOpen}
                profile={gateProfile}
                onProceed={() => router.push(`/vehicle/${vehicleId}/payment?${buildParams()}`)}
            />

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-4 space-y-4">
                <ReservationCalendar
                    vehicleId={vehicleId}
                    joursMinimum={joursMinimum}
                    dateDebut={dateDebut}
                    dateFin={dateFin}
                    onDateDebutChange={setDateDebut}
                    onDateFinChange={setDateFin}
                />

                {datesValid && pricing && !loadingPricing && (
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
                        <div className="flex justify-between text-[13px]">
                            <span className="text-slate-500">{currencyFormat(pricing.prixParJour)} × {nbJours}j</span>
                            <span className="font-semibold text-slate-700 tabular-nums">{currencyFormat(pricing.totalBase)}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                            <span className="text-slate-500">Frais de service (15%)</span>
                            <span className="font-semibold text-slate-700 tabular-nums">{currencyFormat(pricing.montantCommission)}</span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-900">Total</span>
                            <span className="font-black text-emerald-600 text-[16px] tabular-nums">{currencyFormat(pricing.totalLocataire)}</span>
                        </div>
                    </div>
                )}
                {loadingPricing && (
                    <div className="flex justify-center py-3">
                        <ArrowRight className="w-4 h-4 animate-spin text-emerald-400" />
                    </div>
                )}
            </div>

            {/* Sticky footer */}
            <div className="flex-shrink-0 border-t border-slate-100 px-5 pt-4 pb-8 space-y-3 bg-white">
                <label className="flex items-start gap-3 cursor-pointer">
                    <div className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        contractAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
                        {contractAccepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" checked={contractAccepted} onChange={e => setContractAccepted(e.target.checked)} className="sr-only" />
                    <span className="text-[12px] text-slate-500 leading-relaxed">
                        J&apos;accepte les <span className="text-emerald-600 underline decoration-dotted">conditions</span> et le <span className="text-emerald-600 underline decoration-dotted">contrat</span>.
                    </span>
                </label>

                <button
                    type="button"
                    disabled={!canReserve}
                    onClick={handleReserve}
                    className={cn(
                        'w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all duration-200',
                        canReserve
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed',
                    )}
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
        </>
    );
}
