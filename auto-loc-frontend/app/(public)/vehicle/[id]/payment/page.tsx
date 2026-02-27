'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft, CreditCard, CheckCircle2,
    Loader2, Shield, Clock, Smartphone, Zap,
    ChevronRight, PartyPopper,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchVehicle, fetchVehiclePricing, type Vehicle, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

type PaymentStep = 'recap' | 'processing' | 'success' | 'error';
type PaymentMethod = 'WAVE' | 'ORANGE_MONEY';

export default function PaymentPage() {
    const router = useRouter();
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
    const activeRole = useRoleStore((s) => s.activeRole);
    const setActiveRole = useRoleStore((s) => s.setActiveRole);
    const { authFetch } = useAuthFetch();

    useEffect(() => {
        if (!vehicleId || !dateDebut || !dateFin || nbJours < 1) return;
        Promise.all([
            fetchVehicle(vehicleId),
            fetchVehiclePricing(vehicleId, nbJours),
        ])
            .then(([v, p]) => {
                setVehicle(v);
                setPricing(p);
            })
            .catch(() => setErrorMsg('Impossible de charger les détails'))
            .finally(() => setLoading(false));
    }, [vehicleId, dateDebut, dateFin, nbJours]);

    async function handlePay() {
        if (!contractAccepted || !vehicle || !pricing) return;
        setStep('processing');
        try {
            if (activeRole === 'PROPRIETAIRE') {
                await authFetch('/auth/switch-role', {
                    method: 'PATCH',
                    body: { role: 'LOCATAIRE' },
                });
                setActiveRole('LOCATAIRE');
            }
            const { reservationId } = await authFetch<{ reservationId: string; paymentUrl: string }>(
                '/reservations',
                {
                    method: 'POST',
                    body: {
                        vehiculeId: vehicleId,
                        dateDebut,
                        dateFin,
                        fournisseur: method,
                        idempotencyKey: `${vehicleId}-${dateDebut}-${dateFin}-${Date.now()}`,
                    },
                },
            );

            // Simulate successful payment (no real API keys)
            await authFetch(`/reservations/${reservationId}/confirm-payment`, { method: 'PATCH' });
            setStep('success');
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du paiement');
            setStep('error');
        }
    }

    const mainPhoto = vehicle?.photos?.find((p) => p.estPrincipale)?.url
        ?? vehicle?.photos?.[0]?.url ?? null;

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </main>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (!vehicle || !pricing || (step === 'error' && errorMsg)) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-bold text-black/60">{errorMsg || 'Véhicule introuvable'}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-[13px] font-medium text-emerald-600 hover:text-emerald-700 underline"
                >
                    Retour
                </button>
            </main>
        );
    }

    // ── Success state ─────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-75 duration-500">
                    <PartyPopper className="w-9 h-9 text-emerald-600" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-black">Réservation confirmée !</h1>
                    <p className="mt-2 text-[14px] text-black/50 max-w-sm mx-auto leading-relaxed">
                        Votre réservation pour la{' '}
                        <span className="font-semibold text-black">{vehicle.marque} {vehicle.modele}</span>{' '}
                        a été confirmée avec succès. Le propriétaire sera notifié.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <Link
                        href="/reservations"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all"
                    >
                        Mes réservations
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/explorer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-black hover:bg-slate-50 transition-all"
                    >
                        Explorer
                    </Link>
                </div>
            </main>
        );
    }

    // ── Processing state ──────────────────────────────────────────────────────
    if (step === 'processing') {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                        <CreditCard className="w-3 h-3 text-white" />
                    </div>
                </div>
                <p className="text-[15px] font-bold text-black/60">Traitement en cours…</p>
                <p className="text-[12px] text-black/30">Simulation du paiement {method === 'WAVE' ? 'Wave' : 'Orange Money'}</p>
            </main>
        );
    }

    // ── Recap state ───────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
                {/* Back link */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-black/50 hover:text-black transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au véhicule
                </button>

                <h1 className="text-2xl font-black tracking-tight text-black">
                    Finaliser la réservation
                </h1>
                <p className="text-[14px] text-black/40 mt-1 mb-8">
                    Confirmez votre réservation et procédez au paiement
                </p>

                {/* Vehicle recap */}
                <div className="rounded-2xl border border-slate-100 p-5 flex items-center gap-4 mb-6 bg-slate-50/40">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {mainPhoto && (
                            <Image src={mainPhoto} alt="" fill sizes="112px" className="object-cover" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-black truncate">
                            {vehicle.marque} {vehicle.modele}
                        </p>
                        <p className="text-[12px] text-black/40 mt-0.5">
                            {vehicle.ville} · {vehicle.annee}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-black/40">
                                <Clock className="w-3 h-3" />
                                {new Date(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                {' → '}
                                {new Date(dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {nbJours} jour{nbJours > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-2xl border border-slate-100 p-5 mb-6 space-y-3">
                    <h2 className="text-[14px] font-bold text-black mb-3">Détail du prix</h2>
                    <div className="flex justify-between text-[13px]">
                        <span className="text-black/50">
                            {formatPrice(pricing.prixParJour)} × {nbJours} jour{nbJours > 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold text-black tabular-nums">
                            {formatPrice(pricing.totalBase)} FCFA
                        </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                        <span className="text-black/50">Frais de service</span>
                        <span className="font-semibold text-black tabular-nums">
                            {formatPrice(pricing.montantCommission)} FCFA
                        </span>
                    </div>
                    <div className="border-t border-slate-100 pt-3" />
                    <div className="flex justify-between text-[16px]">
                        <span className="font-bold text-black">Total à payer</span>
                        <span className="font-black text-emerald-600 tabular-nums">
                            {formatPrice(pricing.totalLocataire)} FCFA
                        </span>
                    </div>
                </div>

                {/* Payment method */}
                <div className="rounded-2xl border border-slate-100 p-5 mb-6">
                    <h2 className="text-[14px] font-bold text-black mb-4">Moyen de paiement</h2>
                    <div className="space-y-3">
                        <PaymentMethodOption
                            selected={method === 'WAVE'}
                            onSelect={() => setMethod('WAVE')}
                            icon={Zap}
                            label="Wave"
                            description="Paiement mobile instantané"
                            color="blue"
                        />
                        <PaymentMethodOption
                            selected={method === 'ORANGE_MONEY'}
                            onSelect={() => setMethod('ORANGE_MONEY')}
                            icon={Smartphone}
                            label="Orange Money"
                            description="Paiement mobile Orange"
                            color="orange"
                        />
                    </div>
                    <p className="text-[11px] text-black/30 mt-3 text-center">
                        🔒 Simulation — Aucun vrai paiement ne sera effectué
                    </p>
                </div>

                {/* Contract checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group mb-8 rounded-2xl border border-slate-100 p-5">
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
                    <div>
                        <p className="text-[13px] font-semibold text-black">
                            Accepter les conditions
                        </p>
                        <p className="text-[12px] leading-relaxed text-black/40 mt-0.5">
                            En cochant cette case, j&apos;accepte les{' '}
                            <span className="text-emerald-600 underline decoration-dotted">
                                conditions générales de location
                            </span>{' '}
                            et le{' '}
                            <span className="text-emerald-600 underline decoration-dotted">
                                contrat de réservation
                            </span>
                            . Je comprends que l&apos;annulation est soumise aux conditions du propriétaire.
                        </p>
                    </div>
                </label>

                {/* Pay button */}
                <button
                    type="button"
                    disabled={!contractAccepted}
                    onClick={handlePay}
                    className={cn(
                        'w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4',
                        'text-[15px] font-bold tracking-tight transition-all duration-200',
                        contractAccepted
                            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-px active:translate-y-0'
                            : 'bg-slate-100 text-black/30 cursor-not-allowed',
                    )}
                >
                    <CreditCard className="w-5 h-5" strokeWidth={2} />
                    Finaliser le paiement — {formatPrice(pricing.totalLocataire)} FCFA
                </button>
            </div>
        </main>
    );
}

// ── PaymentMethodOption ───────────────────────────────────────────────────────

function PaymentMethodOption({
    selected,
    onSelect,
    icon: Icon,
    label,
    description,
    color,
}: {
    selected: boolean;
    onSelect: () => void;
    icon: React.ElementType;
    label: string;
    description: string;
    color: 'blue' | 'orange';
}) {
    const colors = {
        blue: {
            bg: selected ? 'bg-blue-50/80' : 'bg-white',
            border: selected ? 'border-blue-400' : 'border-slate-200',
            icon: 'bg-blue-100 text-blue-600',
            ring: 'bg-blue-500',
        },
        orange: {
            bg: selected ? 'bg-orange-50/80' : 'bg-white',
            border: selected ? 'border-orange-400' : 'border-slate-200',
            icon: 'bg-orange-100 text-orange-600',
            ring: 'bg-orange-500',
        },
    }[color];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 text-left',
                colors.bg,
                colors.border,
                !selected && 'hover:border-slate-300',
            )}
        >
            <span className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colors.icon)}>
                <Icon className="w-5 h-5" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-black">{label}</p>
                <p className="text-[12px] text-black/40">{description}</p>
            </div>
            <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selected ? colors.border : 'border-slate-300',
            )}>
                {selected && (
                    <div className={cn('w-2.5 h-2.5 rounded-full', colors.ring)} />
                )}
            </div>
        </button>
    );
}
