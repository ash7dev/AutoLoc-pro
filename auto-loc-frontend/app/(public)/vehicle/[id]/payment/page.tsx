'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft, CheckCircle2, Loader2, Shield,
    Clock, ChevronRight, PartyPopper, Check,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchVehicle, fetchVehiclePricing, type Vehicle, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { useCurrency } from '@/providers/currency-provider';

type PaymentStep = 'recap' | 'processing' | 'success' | 'error';
type PaymentMethod = 'WAVE' | 'ORANGE_MONEY';

/* ════════════════════════════════════════════════════════════════
   BRAND LOGOS
════════════════════════════════════════════════════════════════ */
function WaveLogo({ size = 40 }: { size?: number }) {
    return (
        <Image
            src="/wavelogo.jpeg"
            alt="Wave"
            width={size}
            height={size}
            className="rounded-xl object-cover flex-shrink-0"
            style={{ width: size, height: size }}
        />
    );
}

function OrangeMoneyLogo({ size = 40 }: { size?: number }) {
    return (
        <Image
            src="/orangeMoneylogo.jpg"
            alt="Orange Money"
            width={size}
            height={size}
            className="rounded-xl object-cover flex-shrink-0"
            style={{ width: size, height: size }}
        />
    );
}

/* ════════════════════════════════════════════════════════════════
   PAYMENT METHOD OPTION
════════════════════════════════════════════════════════════════ */
function PaymentMethodOption({
    selected, onSelect, method,
}: {
    selected: boolean;
    onSelect: () => void;
    method: PaymentMethod;
}) {
    const isWave = method === 'WAVE';
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 text-left group',
                selected
                    ? isWave
                        ? 'border-[#1B68F9] bg-blue-50/60'
                        : 'border-[#FF6600] bg-orange-50/60'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50',
            )}
        >
            <div className="flex-shrink-0">
                {isWave ? <WaveLogo size={44} /> : <OrangeMoneyLogo size={44} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-black text-slate-800">
                    {isWave ? 'Wave' : 'Orange Money'}
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                    {isWave ? 'Paiement mobile instantané · Sans frais' : 'Paiement via votre compte Orange'}
                </p>
            </div>
            <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                selected
                    ? isWave ? 'border-[#1B68F9] bg-[#1B68F9]' : 'border-[#FF6600] bg-[#FF6600]'
                    : 'border-slate-200',
            )}>
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
        </button>
    );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function PaymentPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const searchParams = useSearchParams();
    const vehicleId = typeof window !== 'undefined'
        ? window.location.pathname.split('/vehicle/')[1]?.split('/payment')[0] ?? ''
        : '';

    const dateDebut = searchParams.get('dateDebut') ?? '';
    const dateFin = searchParams.get('dateFin') ?? '';
    const nbJours = Number(searchParams.get('nbJours') ?? 0);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<PaymentStep>('recap');
    const [method, setMethod] = useState<PaymentMethod>('WAVE');
    const [contractAccepted, setContractAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [createdReservationId, setCreatedReservationId] = useState('');
    const activeRole = useRoleStore((s) => s.activeRole);
    const setActiveRole = useRoleStore((s) => s.setActiveRole);
    const { authFetch } = useAuthFetch();

    useEffect(() => {
        if (!vehicleId || !dateDebut || !dateFin || nbJours < 1) return;
        Promise.all([
            fetchVehicle(vehicleId),
            fetchVehiclePricing(vehicleId, nbJours),
        ])
            .then(([v, p]) => { setVehicle(v); setPricing(p); })
            .catch(() => setErrorMsg('Impossible de charger les détails'))
            .finally(() => setLoading(false));
    }, [vehicleId, dateDebut, dateFin, nbJours]);

    async function handlePay() {
        if (!contractAccepted || !vehicle || !pricing) return;
        setStep('processing');
        try {
            if (activeRole === 'PROPRIETAIRE') {
                await authFetch('/auth/switch-role', { method: 'PATCH', body: { role: 'LOCATAIRE' } });
                setActiveRole('LOCATAIRE');
            }
            const { reservationId } = await authFetch<
                { reservationId: string; paymentUrl: string },
                { vehiculeId: string; dateDebut: string; dateFin: string; fournisseur: PaymentMethod; idempotencyKey: string }
            >('/reservations', {
                method: 'POST',
                body: {
                    vehiculeId: vehicleId,
                    dateDebut, dateFin,
                    fournisseur: method,
                    idempotencyKey: `${vehicleId}-${dateDebut}-${dateFin}-${Date.now()}`,
                },
            });
            await authFetch(`/reservations/${reservationId}/confirm-payment`, { method: 'PATCH' });
            setCreatedReservationId(reservationId);
            setStep('success');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du paiement');
            setStep('error');
        }
    }

    const mainPhoto = vehicle?.photos?.find((p) => p.estPrincipale)?.url ?? vehicle?.photos?.[0]?.url ?? null;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

    /* ── Loading ── */
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </main>
        );
    }

    /* ── Error ── */
    if (!vehicle || !pricing || (step === 'error' && errorMsg)) {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-bold text-slate-600">{errorMsg || 'Véhicule introuvable'}</p>
                <button type="button" onClick={() => router.back()}
                    className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-dotted">
                    Retour
                </button>
            </main>
        );
    }

    /* ── Processing ── */
    if (step === 'processing') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-5 px-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-black text-slate-800">Traitement en cours…</p>
                    <p className="text-[13px] text-slate-400 mt-1">
                        Paiement via {method === 'WAVE' ? 'Wave' : 'Orange Money'}
                    </p>
                </div>
            </main>
        );
    }

    /* ── Success ── */
    if (step === 'success') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-sm text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center">
                        <PartyPopper className="w-9 h-9 text-emerald-600" strokeWidth={1.5} />
                    </div>

                    {/* Text */}
                    <div>
                        <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Réservation confirmée !</h1>
                        <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                            Votre réservation pour la{' '}
                            <span className="font-semibold text-slate-700">{vehicle.marque} {vehicle.modele}</span>{' '}
                            est confirmée. Votre contrat est disponible.
                        </p>
                    </div>

                    {/* Confirmation badge */}
                    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            {mainPhoto && (
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                    <Image src={mainPhoto} alt="" fill sizes="56px" className="object-cover" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-[13px] font-black text-slate-800 truncate">{vehicle.marque} {vehicle.modele}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{fmtDate(dateDebut)} → {fmtDate(dateFin)}</p>
                                <p className="text-[12px] font-black text-emerald-600 mt-0.5">{formatPrice(pricing.totalLocataire)}</p>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href={createdReservationId ? `/dashboard/reservations/${createdReservationId}/contrat` : '/dashboard/reservations'}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-px"
                            style={{ background: 'linear-gradient(135deg, #34D399, #059669, #047857)' }}
                        >
                            Voir mon contrat
                            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                        </Link>
                        <Link
                            href="/dashboard/reservations"
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 px-5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Mes réservations
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ── Recap ── */
    return (
        <main className="min-h-screen bg-[#F8FAFB]">
            <div className="mx-auto max-w-lg px-4 py-8 lg:py-12">

                {/* Back */}
                <button type="button" onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-7">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Retour au véhicule
                </button>

                {/* Title */}
                <div className="mb-7">
                    <h1 className="text-[26px] font-black tracking-tight text-slate-900">Finaliser la réservation</h1>
                    <p className="text-[13px] text-slate-400 mt-1">Vérifiez les détails puis choisissez votre moyen de paiement</p>
                </div>

                {/* ── Vehicle recap ── */}
                <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden mb-4">
                    {/* Photo banner */}
                    {mainPhoto && (
                        <div className="relative h-36 w-full bg-slate-100">
                            <Image src={mainPhoto} alt={`${vehicle.marque} ${vehicle.modele}`} fill sizes="512px" className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                                <div>
                                    <p className="text-[17px] font-black text-white leading-tight">{vehicle.marque} {vehicle.modele}</p>
                                    <p className="text-[11px] text-white/60">{vehicle.ville} · {vehicle.annee}</p>
                                </div>
                                <span className="rounded-xl bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white">
                                    {nbJours}j
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Dates row */}
                    <div className="px-4 py-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" strokeWidth={2} />
                        <span className="text-[12.5px] font-semibold text-slate-500">
                            {fmtDate(dateDebut)}
                        </span>
                        <span className="text-slate-200 mx-1">→</span>
                        <span className="text-[12.5px] font-semibold text-slate-500">
                            {fmtDate(dateFin)}
                        </span>
                        <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {nbJours} jour{nbJours > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* ── Price ── */}
                <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5 mb-4">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Récapitulatif du prix</h2>

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] text-slate-500">
                            {formatPrice(Math.round(pricing.totalLocataire / pricing.nbJours))} × {nbJours} jour{nbJours > 1 ? 's' : ''}
                        </span>
                        <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                            {formatPrice(pricing.totalLocataire)}
                        </span>
                    </div>

                    <div className="h-px bg-slate-100 mb-3" />

                    <div className="flex items-center justify-between">
                        <span className="text-[15px] font-black text-slate-800">Total à payer</span>
                        <span className="text-[22px] font-black text-emerald-600 tabular-nums">{formatPrice(pricing.totalLocataire)}</span>
                    </div>
                </div>

                {/* ── Payment method ── */}
                <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5 mb-4">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Moyen de paiement</h2>
                    <div className="space-y-2.5">
                        <PaymentMethodOption selected={method === 'WAVE'} onSelect={() => setMethod('WAVE')} method="WAVE" />
                        <PaymentMethodOption selected={method === 'ORANGE_MONEY'} onSelect={() => setMethod('ORANGE_MONEY')} method="ORANGE_MONEY" />
                    </div>
                    <p className="text-[10.5px] text-slate-300 mt-3 text-center">🔒 Simulation — Aucun vrai paiement ne sera effectué</p>
                </div>

                {/* ── Contract checkbox ── */}
                <label className={cn(
                    'flex items-start gap-3 cursor-pointer rounded-2xl border-2 p-4 mb-6 transition-all duration-200',
                    contractAccepted ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-100 bg-white',
                )}>
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={contractAccepted}
                            onChange={(e) => setContractAccepted(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                            contractAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300',
                        )}>
                            {contractAccepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-slate-800">Accepter les conditions</p>
                        <p className="text-[12px] leading-relaxed text-slate-400 mt-0.5">
                            J&apos;accepte les{' '}
                            <Link href="/cgu" target="_blank" onClick={e => e.stopPropagation()}
                                className="text-emerald-600 font-semibold underline decoration-dotted hover:text-emerald-700">
                                conditions générales
                            </Link>{' '}
                            et le{' '}
                            <Link href="/contrat-reservation" target="_blank" onClick={e => e.stopPropagation()}
                                className="text-emerald-600 font-semibold underline decoration-dotted hover:text-emerald-700">
                                contrat de réservation
                            </Link>
                            . Je comprends que l&apos;annulation est soumise à la politique en vigueur.
                        </p>
                    </div>
                </label>

                {/* ── Pay button ── */}
                <button
                    type="button"
                    disabled={!contractAccepted}
                    onClick={handlePay}
                    className={cn(
                        'w-full relative flex items-center justify-center gap-3 rounded-2xl px-6 py-4 overflow-hidden',
                        'text-[15px] font-black tracking-tight transition-all duration-300',
                        contractAccepted
                            ? 'text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed',
                    )}
                    style={contractAccepted ? { background: 'linear-gradient(135deg, #34D399 0%, #059669 55%, #047857 100%)' } : {}}
                >
                    {contractAccepted && (
                        <span
                            className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                        />
                    )}
                    {method === 'WAVE'
                        ? <WaveLogo size={22} />
                        : <OrangeMoneyLogo size={22} />
                    }
                    Payer {formatPrice(pricing.totalLocataire)}
                </button>

                <p className="text-center text-[11px] text-slate-300 mt-4">
                    Paiement 100% sécurisé · Réservation instantanée
                </p>

            </div>
        </main>
    );
}
