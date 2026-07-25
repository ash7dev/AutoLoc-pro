'use client';

/* ═══════════════════════════════════════════════════════════════════
   VehicleOwnerCard
   Shows verified owner info at the bottom of the left column
═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import {
    ShieldCheck, Star, ChevronUp, CreditCard, ArrowRight,
    Check, MapPin, Truck, Wallet, Banknote,
} from 'lucide-react';
import { cn, getCommissionRate, getTenantPricePerDay } from '@/lib/utils';
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
    ageMinimum?: number;
    fraisLivraison?: number | null;
    autoriseHorsDakar?: boolean;
    supplementHorsDakarParJour?: number | null;
    blockedRanges?: any[];
}

export function MobileReservationBar({ vehicleId, prixParJour, joursMinimum, ageMinimum, fraisLivraison, autoriseHorsDakar, supplementHorsDakarParJour, blockedRanges }: MobileBarProps): React.ReactElement {
    const [sheetOpen, setSheetOpen] = useState(false);
    const { formatPrice: currencyFormat } = useCurrency();

    // Calcul du prix par jour dynamique
    const basePrice = Number(prixParJour);
    const dynamicPrice = getTenantPricePerDay(basePrice); // avec commission

    return (
        <>
            {/* ── Bottom bar ─────────────────────────────────────────── */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dès</p>
                    <p className="text-[20px] font-black text-slate-900 tabular-nums leading-tight">
                        {currencyFormat(Math.round(dynamicPrice))}
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">/j</span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="group flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-emerald-400 text-[14px] font-bold px-6 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-slate-900/30 hover:shadow-xl hover:shadow-slate-900/40"
                >
                    Réserver
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
            </div>

            {/* ── Bottom sheet ─────────────────────────────────────── */}
            {sheetOpen && (
                <>
                    {/* Backdrop with fade-in */}
                    <div
                        className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSheetOpen(false)}
                    />
                    {/* Sheet with slide-up animation */}
                    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom duration-300">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 transition-colors hover:bg-slate-300" />
                        </div>
                        {/* Premium Header with gradient */}
                        <div className="relative flex-shrink-0 px-5 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[18px] font-black text-slate-900 tracking-tight">Réserver ce véhicule</h3>
                                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                                        Paiement sécurisé • Confirmation instantanée
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSheetOpen(false)}
                                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
                                >
                                    <ChevronUp className="w-4.5 h-4.5 text-slate-600" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                        {/* Content + sticky footer */}
                        <SheetReservationForm
                            vehicleId={vehicleId}
                            prixParJour={prixParJour}
                            joursMinimum={joursMinimum}
                            ageMinimum={ageMinimum}
                            fraisLivraison={fraisLivraison}
                            autoriseHorsDakar={autoriseHorsDakar}
                            supplementHorsDakarParJour={supplementHorsDakarParJour}
                            blockedRanges={blockedRanges}
                        />
                    </div>
                </>
            )}
        </>
    );
}

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { useProfileStore } from '@/features/auth/stores/profile.store';
import { ReservationGateModal } from '@/features/reservations/components/ReservationGateModal';
import { AgeRestrictionModal } from '@/features/reservations/components/AgeRestrictionModal';

function calcAge(dateStr: string): number {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function SheetReservationForm({ vehicleId, prixParJour, joursMinimum, ageMinimum, fraisLivraison, autoriseHorsDakar, supplementHorsDakarParJour, blockedRanges }: MobileBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { formatPrice: currencyFormat } = useCurrency();
    const [dateDebut, setDateDebut] = useState(searchParams.get('dateDebut') ?? '');
    const [dateFin, setDateFin] = useState(searchParams.get('dateFin') ?? '');
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loadingPricing, setLoadingPricing] = useState(false);
    const [contractAccepted, setContractAccepted] = useState(false);
    const [gateOpen, setGateOpen] = useState(false);
    const [gateProfile, setGateProfile] = useState<ProfileResponse | null>(null);
    const [gateLoading, setGateLoading] = useState(false);
    const [inlineError, setInlineError] = useState<React.ReactNode | null>(null);
    const [ageBlockOpen, setAgeBlockOpen] = useState(false);
    const [ageBlockData, setAgeBlockData] = useState<{ userAge: number } | null>(null);
    const [horsDakar, setHorsDakar] = useState(false);
    const [wantsDelivery, setWantsDelivery] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [modePaiement, setModePaiement] = useState<'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN'>('TOTAL_EN_LIGNE');
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const deliveryAvailable = fraisLivraison != null && fraisLivraison > 0;
    const deliveryFee = wantsDelivery && deliveryAvailable ? fraisLivraison : 0;

    const nbJours = dateDebut && dateFin
        ? Math.max(1, Math.round((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000))
        : 0;

    const datesValid = nbJours >= joursMinimum;
    const canReserve = datesValid && contractAccepted && pricing && !loadingPricing
        && (!wantsDelivery || deliveryAddress.trim().length > 0);

    const buildParams = () => {
        const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
        if (wantsDelivery && deliveryAddress.trim()) {
            params.set('livraison', '1');
            params.set('adresseLivraison', deliveryAddress.trim());
        }
        if (horsDakar) {
            params.set('horsDakar', '1');
        }
        if (modePaiement !== 'TOTAL_EN_LIGNE') {
            params.set('modePaiement', modePaiement);
        }
        return params;
    };

    async function handleReserve() {
        if (!canReserve || gateLoading) return;
        setInlineError(null);
        setGateLoading(true);
        try {
            const profile = useProfileStore.getState().profile ?? await apiFetch<ProfileResponse>('/auth/me');

            // ── Age Block (independent from Gate) ──────────────────────────────
            // Only fires when: user is logged in + birth date KNOWN + age < minimum.
            // Hard restriction — NOT a completable step — do NOT open Gate.
            if (ageMinimum && ageMinimum > 0 && profile.dateNaissance) {
                const birth = new Date(profile.dateNaissance);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                if (age < ageMinimum) {
                    setAgeBlockData({ userAge: age });
                    setAgeBlockOpen(true);
                    return; // Stop here — do NOT open the Gate
                }
            }

            // ── Gate (profile completion) ──────────────────────────────────────
            setGateProfile(profile);
            setGateOpen(true);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                const queryParams = buildParams().toString();
                const nextPath = `${window.location.pathname}${queryParams ? '?' + queryParams : ''}`;
                const next = encodeURIComponent(nextPath);
                router.push(`/login?next=${next}`);
                return;
            }
            setInlineError(
                err instanceof Error
                    ? err.message
                    : 'Impossible de vérifier votre profil pour le moment. Réessayez.',
            );
        } finally {
            setGateLoading(false);
        }
    }

    const doFetch = useCallback(async (days: number) => {
        setLoadingPricing(true);
        try {
            const r = await fetchVehiclePricing(vehicleId, days, horsDakar);
            setPricing(r);
        } catch {
            // Fallback local avec supplément hors Dakar
            const supp = horsDakar && autoriseHorsDakar ? (supplementHorsDakarParJour ?? 0) : 0;
            const rate = getCommissionRate(prixParJour + supp);
            setPricing({
                nbJours: days,
                autoriseHorsDakar,
                supplementHorsDakar: supp,
                prixParJour,
                totalBase: (prixParJour + supp) * days,
                tauxCommission: rate,
                montantCommission: Math.round((prixParJour + supp) * days * rate),
                totalLocataire: Math.round((prixParJour + supp) * days * (1 + rate)),
                netProprietaire: (prixParJour + supp) * days,
            });
        } finally { setLoadingPricing(false); }
    }, [vehicleId, prixParJour, horsDakar, autoriseHorsDakar, supplementHorsDakarParJour]);

    useEffect(() => {
        if (nbJours >= 1) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => doFetch(nbJours), 300);
        } else setPricing(null);
        return () => clearTimeout(debounceRef.current);
    }, [nbJours, horsDakar, doFetch]);

    return (
        <>
            {/* ── Age Restriction Block (hard stop — independent of Gate) ── */}
            {ageBlockData && (
                <AgeRestrictionModal
                    open={ageBlockOpen}
                    onClose={() => setAgeBlockOpen(false)}
                    ageMinimum={ageMinimum!}
                    userAge={ageBlockData.userAge}
                />
            )}

            {/* ── Profile completion Gate ───────────────────────────────── */}
            <ReservationGateModal
                open={gateOpen}
                onOpenChange={setGateOpen}
                profile={gateProfile}
                ageMinimum={ageMinimum}
                userAge={gateProfile?.dateNaissance ? calcAge(gateProfile.dateNaissance) : undefined}
                onProceed={() => {
                    const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
                    if (wantsDelivery && deliveryAddress.trim()) {
                        params.set('livraison', '1');
                        params.set('adresseLivraison', deliveryAddress.trim());
                    }
                    if (horsDakar) {
                        params.set('horsDakar', '1');
                    }
                    if (modePaiement !== 'TOTAL_EN_LIGNE') {
                        params.set('modePaiement', modePaiement);
                    }
                    router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
                }}
            />

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pt-5 pb-4 space-y-5">
                {/* Section: Dates */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
                            <span className="text-white text-[14px]">📅</span>
                        </div>
                        <h4 className="text-[14px] font-black text-slate-900">Choisir vos dates</h4>
                    </div>
                    <ReservationCalendar
                        vehicleId={vehicleId}
                        joursMinimum={joursMinimum}
                        dateDebut={dateDebut}
                        dateFin={dateFin}
                        onDateDebutChange={setDateDebut}
                        onDateFinChange={setDateFin}
                        initialBlockedRanges={blockedRanges}
                    />
                </div>

                {loadingPricing && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-[12px] font-semibold text-slate-400">Calcul du tarif...</p>
                    </div>
                )}

                {/* Section: Options supplémentaires */}
                {(deliveryAvailable || (autoriseHorsDakar && supplementHorsDakarParJour != null)) && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                                <span className="text-white text-[14px]">⚡</span>
                            </div>
                            <h4 className="text-[14px] font-black text-slate-900">Options</h4>
                        </div>

                        {/* Delivery toggle */}
                        {deliveryAvailable && (
                            <div className={cn(
                                "relative rounded-2xl border-2 p-4 space-y-3 transition-all duration-300",
                                wantsDelivery
                                    ? "bg-emerald-50/50 border-emerald-200 shadow-sm shadow-emerald-500/10"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                            )}>
                                <label className="flex items-start gap-3.5 cursor-pointer group">
                                    <button
                                        type="button"
                                        onClick={() => setWantsDelivery(!wantsDelivery)}
                                        className={cn(
                                            'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                                            wantsDelivery
                                                ? 'bg-emerald-500 border-emerald-500 scale-110'
                                                : 'border-slate-300 group-hover:border-emerald-400 bg-white',
                                        )}
                                    >
                                        {wantsDelivery && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Truck className={cn(
                                                    "w-4 h-4 transition-colors",
                                                    wantsDelivery ? "text-emerald-600" : "text-slate-500"
                                                )} strokeWidth={2} />
                                                <span className={cn(
                                                    "text-[13.5px] font-bold transition-colors",
                                                    wantsDelivery ? "text-emerald-900" : "text-slate-700"
                                                )}>
                                                    Livraison à domicile
                                                </span>
                                            </div>
                                            <span className="text-[15px] font-black tabular-nums text-emerald-600">
                                                + {currencyFormat(fraisLivraison)}
                                            </span>
                                        </div>
                                        <p className="text-[11.5px] text-slate-500 font-medium">
                                            Le véhicule vous sera livré à l'adresse de votre choix
                                        </p>
                                    </div>
                                </label>
                                {wantsDelivery && (
                                    <div className="space-y-2 pl-9 animate-in slide-in-from-top-2 duration-300">
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={2} />
                                            <input
                                                type="text"
                                                value={deliveryAddress}
                                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                                placeholder="Entrez votre adresse complète…"
                                                className="w-full h-11 rounded-xl border-2 border-emerald-200 bg-white pl-11 pr-4
                                                    text-[13px] font-semibold text-slate-800 placeholder-slate-400
                                                    focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                                            />
                                        </div>
                                        {wantsDelivery && !deliveryAddress.trim() && (
                                            <div className="flex items-center gap-1.5 text-amber-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <p className="text-[11px] font-bold">Adresse requise pour continuer</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hors Dakar toggle */}
                        {autoriseHorsDakar && supplementHorsDakarParJour != null && (
                            <div className={cn(
                                "relative rounded-2xl border-2 p-4 transition-all duration-300",
                                horsDakar
                                    ? "bg-blue-50/50 border-blue-200 shadow-sm shadow-blue-500/10"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                            )}>
                                <label className="flex items-start gap-3.5 cursor-pointer group">
                                    <button
                                        type="button"
                                        onClick={() => setHorsDakar(!horsDakar)}
                                        className={cn(
                                            'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                                            horsDakar
                                                ? 'bg-blue-500 border-blue-500 scale-110'
                                                : 'border-slate-300 group-hover:border-blue-400 bg-white',
                                        )}
                                    >
                                        {horsDakar && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin className={cn(
                                                    "w-4 h-4 transition-colors",
                                                    horsDakar ? "text-blue-600" : "text-slate-500"
                                                )} strokeWidth={2} />
                                                <span className={cn(
                                                    "text-[13.5px] font-bold transition-colors",
                                                    horsDakar ? "text-blue-900" : "text-slate-700"
                                                )}>
                                                    Voyage Hors Dakar
                                                </span>
                                            </div>
                                            <span className="text-[15px] font-black tabular-nums text-emerald-600">
                                                + {currencyFormat(supplementHorsDakarParJour)}<span className="text-[11px] font-semibold text-slate-400"> /jour</span>
                                            </span>
                                        </div>
                                        <p className="text-[11.5px] text-slate-500 font-medium">
                                            Partez explorer les régions du Sénégal
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {/* Section: Pricing Summary — AFTER options, dark glass+blur */}
                {datesValid && pricing && !loadingPricing && (
                    <>
                    {/* Mode de paiement toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md shadow-slate-500/30">
                                <Wallet className="w-4 h-4 text-white" strokeWidth={2} />
                            </div>
                            <h4 className="text-[14px] font-black text-slate-900">Mode de paiement</h4>
                        </div>

                        {/* Option: Paiement Total */}
                        <button
                            type="button"
                            onClick={() => setModePaiement('TOTAL_EN_LIGNE')}
                            className={cn(
                                'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300',
                                modePaiement === 'TOTAL_EN_LIGNE'
                                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm shadow-emerald-500/10'
                                    : 'bg-white border-slate-200 hover:border-slate-300',
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                    modePaiement === 'TOTAL_EN_LIGNE'
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-slate-300',
                                )}>
                                    {modePaiement === 'TOTAL_EN_LIGNE' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <CreditCard className={cn(
                                            'w-3.5 h-3.5 transition-colors',
                                            modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-600' : 'text-slate-400'
                                        )} strokeWidth={2} />
                                        <span className={cn(
                                            'text-[13px] font-bold transition-colors',
                                            modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-900' : 'text-slate-700'
                                        )}>
                                            Payer 100% en ligne
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        Payez la totalité maintenant. Réservation confirmée instantanément.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Option: Accompte 30% */}
                        <button
                            type="button"
                            onClick={() => setModePaiement('ACOMPTE_SOLDE_CHECKIN')}
                            className={cn(
                                'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300',
                                modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm shadow-emerald-500/10'
                                    : 'bg-white border-slate-200 hover:border-slate-300',
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                    modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-slate-300',
                                )}>
                                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Banknote className={cn(
                                            'w-3.5 h-3.5 transition-colors',
                                            modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-600' : 'text-slate-400'
                                        )} strokeWidth={2} />
                                        <span className={cn(
                                            'text-[13px] font-bold transition-colors',
                                            modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-900' : 'text-slate-700'
                                        )}>
                                            Accompte 30% + Solde à la remise
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        Payez 30% maintenant, le reste au propriétaire lors de la remise des clés.
                                    </p>
                                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing && (
                                        <div className="mt-2 flex items-center gap-3 text-[11px] font-bold animate-in fade-in duration-300">
                                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                                En ligne : {currencyFormat(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}
                                            </span>
                                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                À la remise : {currencyFormat(Math.round((pricing.totalLocataire + deliveryFee) * 0.7))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Pricing summary dark card */}
                    <div className="relative rounded-2xl overflow-hidden p-5 space-y-3 shadow-xl">
                        {/* Dark glass background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl" />
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative space-y-2.5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                                </div>
                                <h4 className="text-[13px] font-black text-white/90 uppercase tracking-wide">Résumé de la réservation</h4>
                            </div>

                            <div className="flex justify-between items-center text-[13.5px]">
                                <span className="text-slate-300 font-medium">{currencyFormat(Math.round(pricing.totalLocataire / nbJours))} × {nbJours} jour{nbJours > 1 ? 's' : ''}</span>
                                <span className="font-bold text-white tabular-nums">{currencyFormat(pricing.totalLocataire)}</span>
                            </div>

                            {deliveryFee > 0 && (
                                <div className="flex justify-between items-center text-[13.5px]">
                                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                                        Livraison
                                    </span>
                                    <span className="font-bold text-white tabular-nums">{currencyFormat(deliveryFee)}</span>
                                </div>
                            )}

                            {pricing.supplementHorsDakar != null && pricing.supplementHorsDakar > 0 && (
                                <div className="flex justify-between items-center text-[13.5px]">
                                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                                        Supplément Hors Dakar
                                    </span>
                                    <span className="font-bold text-white tabular-nums">
                                        {currencyFormat(pricing.supplementHorsDakar * nbJours)}
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 mt-1 border-t border-white/15 flex justify-between items-center">
                                <span className="font-black text-white text-[14px]">Total à payer</span>
                                <div className="text-right">
                                    <div className="font-black text-emerald-400 text-[22px] tabular-nums leading-none">
                                        {currencyFormat(pricing.totalLocataire + deliveryFee)}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">FCFA</div>
                                </div>
                            </div>

                            {/* Breakdown accompte if deposit mode */}
                            {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && (
                                <div className="pt-2.5 mt-0.5 border-t border-white/10 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between items-center text-[12.5px]">
                                        <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                                            <CreditCard className="w-3 h-3" strokeWidth={2} />
                                            À payer maintenant (30%)
                                        </span>
                                        <span className="font-black text-emerald-300 tabular-nums">
                                            {currencyFormat(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[12.5px]">
                                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                            <Banknote className="w-3 h-3" strokeWidth={2} />
                                            Solde à la remise (70%)
                                        </span>
                                        <span className="font-semibold text-slate-400 tabular-nums">
                                            {currencyFormat(Math.round((pricing.totalLocataire + deliveryFee) * 0.7))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* Sticky footer with premium design */}
            <div className="flex-shrink-0 border-t-2 border-slate-100 bg-gradient-to-b from-white to-slate-50/30 px-5 pt-4 pb-8 space-y-3">
                {/* Error message with animation */}
                {inlineError && (
                    <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <ShieldCheck className="w-4.5 h-4.5 text-red-600" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-black text-red-900">Impossible de continuer</p>
                                <p className="text-[12px] text-red-700 mt-1 leading-relaxed font-medium">{inlineError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Terms checkbox with premium style */}
                <label className="flex items-start gap-3.5 cursor-pointer group">
                    <button
                        type="button"
                        onClick={() => setContractAccepted(!contractAccepted)}
                        className={cn(
                            'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                            contractAccepted
                                ? 'bg-emerald-500 border-emerald-500 scale-105'
                                : 'border-slate-300 group-hover:border-emerald-400 bg-white'
                        )}
                    >
                        {contractAccepted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </button>
                    <input
                        type="checkbox"
                        checked={contractAccepted}
                        onChange={e => setContractAccepted(e.target.checked)}
                        className="sr-only"
                    />
                    <span className="text-[12.5px] text-slate-600 leading-relaxed font-medium">
                        J&apos;accepte les{' '}
                        <span className="text-emerald-600 font-bold underline decoration-emerald-600/30 decoration-2 underline-offset-2">
                            conditions générales
                        </span>
                        {' '}et le{' '}
                        <span className="text-emerald-600 font-bold underline decoration-emerald-600/30 decoration-2 underline-offset-2">
                            contrat de location
                        </span>
                    </span>
                </label>

                {/* Premium CTA button — full width, taller, high contrast */}
                <button
                    type="button"
                    disabled={!canReserve}
                    onClick={handleReserve}
                    className={cn(
                        'group relative w-full flex items-center justify-center gap-3 rounded-2xl py-[18px] text-[16px] font-black tracking-tight transition-all duration-300 overflow-hidden',
                        canReserve
                            ? modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-emerald-400 shadow-xl shadow-slate-900/40 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:scale-[0.98]'
                                : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-emerald-400 shadow-xl shadow-slate-900/40 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:scale-[0.98]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                    )}
                >
                    {/* Shine effect */}
                    {canReserve && (
                        <>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                            <span className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        </>
                    )}
                    <CreditCard className="w-5 h-5 flex-shrink-0 relative z-10" strokeWidth={2.5} />
                    <span className="relative z-10">
                        {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing
                            ? `Payer l'accompte ${currencyFormat(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}`
                            : 'Confirmer et réserver'
                        }
                    </span>
                    <ArrowRight className={cn(
                        "w-5 h-5 flex-shrink-0 relative z-10 transition-transform",
                        canReserve && "group-hover:translate-x-1"
                    )} strokeWidth={2.5} />
                </button>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                    <p className="text-[11.5px] font-semibold">
                        Paiement sécurisé • Débité après validation
                    </p>
                </div>
            </div>
        </>
    );
}
