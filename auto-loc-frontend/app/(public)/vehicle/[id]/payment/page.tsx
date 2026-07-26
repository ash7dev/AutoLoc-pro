'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft, Loader2, Shield,
    Clock, Check, Truck, Phone, Smartphone,
    CreditCard, Banknote, Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchVehicle, fetchVehiclePricing, type Vehicle, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { ApiError, apiFetch } from '@/lib/nestjs/api-client';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { useCurrency } from '@/providers/currency-provider';
import { supabase } from '@/lib/supabase/client';
import { ttqTrack } from '@/lib/tiktok-pixel';

// ── Types ──────────────────────────────────────────────────────────────────────

type PaymentMethod = 'WAVE' | 'ORANGE_MONEY';

// ── Méthodes de paiement ───────────────────────────────────────────────────────

const PAYMENT_METHODS: {
    id: PaymentMethod;
    label: string;
    sublabel: string;
    phonePlaceholder: string;
}[] = [
    {
        id: 'WAVE',
        label: 'Wave',
        sublabel: 'Notification dans votre app Wave',
        phonePlaceholder: 'Numéro Wave (ex: 77 000 00 00)',
    },
    {
        id: 'ORANGE_MONEY',
        label: 'Orange Money',
        sublabel: 'Paiement Orange Money / Maxit',
        phonePlaceholder: 'Numéro Orange (ex: 77 000 00 00)',
    },
];

/* ════════════════════════════════════════════════════════════════
   LOGOS
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

function MethodLogo({ method, size = 40 }: { method: PaymentMethod; size?: number }) {
    if (method === 'WAVE')         return <WaveLogo size={size} />;
    return <OrangeMoneyLogo size={size} />;
}

/* ════════════════════════════════════════════════════════════════
   OPTION DE MÉTHODE
════════════════════════════════════════════════════════════════ */
const METHOD_COLORS: Record<PaymentMethod, { border: string; bg: string; dot: string }> = {
    WAVE:         { border: 'border-[#1B68F9]', bg: 'bg-blue-50/60',   dot: 'border-[#1B68F9] bg-[#1B68F9]' },
    ORANGE_MONEY: { border: 'border-[#FF6600]', bg: 'bg-orange-50/60', dot: 'border-[#FF6600] bg-[#FF6600]' },
};

function PaymentMethodOption({
    selected, onSelect, method,
}: {
    selected: boolean;
    onSelect: () => void;
    method: PaymentMethod;
}) {
    const info   = PAYMENT_METHODS.find((m) => m.id === method)!;
    const colors = METHOD_COLORS[method];
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 text-left',
                selected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50',
            )}
        >
            <MethodLogo method={method} size={44} />
            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-black text-slate-800">{info.label}</p>
                <p className="text-[12px] text-slate-400 mt-0.5">{info.sublabel}</p>
            </div>
            <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                selected ? colors.dot : 'border-slate-200',
            )}>
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
        </button>
    );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
type PaymentStep = 'recap' | 'processing' | 'waiting' | 'error';

export default function PaymentPage() {
    const router            = useRouter();
    const { formatPrice }   = useCurrency();
    const searchParams      = useSearchParams();
    const vehicleId         = typeof window !== 'undefined'
        ? window.location.pathname.split('/vehicle/')[1]?.split('/payment')[0] ?? ''
        : '';

    const dateDebut         = searchParams.get('dateDebut') ?? '';
    const dateFin           = searchParams.get('dateFin') ?? '';
    const nbJours           = Number(searchParams.get('nbJours') ?? 0);
    const horsDakar         = searchParams.get('horsDakar') === '1';
    const wantsDelivery     = searchParams.get('livraison') === '1';
    const adresseLivraison  = searchParams.get('adresseLivraison') ?? '';
    const modePaiement      = (searchParams.get('modePaiement') === 'ACOMPTE_SOLDE_CHECKIN'
        ? 'ACOMPTE_SOLDE_CHECKIN'
        : 'TOTAL_EN_LIGNE') as 'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN';

    const [vehicle,           setVehicle]          = useState<Vehicle | null>(null);
    const [pricing,           setPricing]          = useState<PricingResponse | null>(null);
    const [loading,           setLoading]          = useState(true);
    const [step,              setStep]             = useState<PaymentStep>('recap');
    const [method,            setMethod]           = useState<PaymentMethod>('WAVE');
    const [payerPhone,        setPayerPhone]       = useState('');
    const [contractAccepted,  setContractAccepted] = useState(false);
    const [errorMsg,          setErrorMsg]         = useState('');
    const [retryCount,        setRetryCount]       = useState(0);
    const [waitingId,         setWaitingId]        = useState<string | null>(null);

    const activeRole    = useRoleStore((s) => s.activeRole);
    const setActiveRole = useRoleStore((s) => s.setActiveRole);
    const { authFetch } = useAuthFetch();
    const isMounted     = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ── Charger le véhicule + tarif ──────────────────────────────────────────────
    useEffect(() => {
        if (!vehicleId || !dateDebut || !dateFin || nbJours < 1) return;
        setLoading(true);
        Promise.all([
            fetchVehicle(vehicleId),
            fetchVehiclePricing(vehicleId, nbJours, horsDakar),
        ])
            .then(([v, p]) => { setVehicle(v); setPricing(p); setErrorMsg(''); })
            .catch(() => setErrorMsg('Impossible de charger les détails du véhicule.'))
            .finally(() => setLoading(false));
    }, [vehicleId, dateDebut, dateFin, nbJours, horsDakar, retryCount]);

    // ── TikTok: InitiateCheckout ──────────────────────────────────────────────
    useEffect(() => {
        if (!vehicle || !pricing) return;
        ttqTrack('InitiateCheckout', {
            content_id: vehicleId,
            content_type: 'product',
            content_name: `${vehicle.marque} ${vehicle.modele}`,
            value: pricing.totalLocataire,
            currency: 'XOF',
            quantity: nbJours,
        });
    }, [vehicle?.id, pricing?.totalLocataire]);

    // ── Polling quand en attente de confirmation paiement ────────────────────────
    useEffect(() => {
        if (step !== 'waiting' || !waitingId) return;

        let attempts = 0;
        const MAX_ATTEMPTS = 60; // 60 × 5s = 5 min
        let timeoutId: ReturnType<typeof setTimeout>;

        const poll = async () => {
            if (!isMounted.current) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await apiFetch<{ statut: string }>(`/reservations/${waitingId}`, {
                    accessToken: session?.access_token,
                });
                if (res.statut === 'PAYEE' || res.statut === 'CONFIRMEE' || res.statut === 'EN_COURS') {
                    sessionStorage.removeItem('pending_reservation_id');
                    router.push('/payment/success');
                    return;
                }
            } catch { /* continuer */ }

            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
                if (isMounted.current) {
                    setErrorMsg('Le paiement a pris trop de temps. Vérifiez vos réservations.');
                    setStep('error');
                }
                return;
            }
            timeoutId = setTimeout(poll, 5000);
        };

        poll();
        return () => { clearTimeout(timeoutId); };
    }, [step, waitingId, router]);

    // ── Soumettre le paiement ────────────────────────────────────────────────────
    async function handlePay() {
        if (!contractAccepted || !vehicle || !pricing || step !== 'recap') return;

        const phoneClean = payerPhone.replace(/\s+/g, '').replace(/-/g, '');
        if (phoneClean.length < 8) {
            setErrorMsg('Entrez votre numéro de téléphone mobile.');
            return;
        }

        setErrorMsg('');
        setStep('processing');

        // TikTok: AddPaymentInfo
        ttqTrack('AddPaymentInfo', {
            content_id: vehicleId,
            content_type: 'product',
            content_name: `${vehicle.marque} ${vehicle.modele}`,
            value: amountToPay,
            currency: 'XOF',
            description: method,
        });

        try {
            // Vérification anti-changement de prix
            const freshPricing = await fetchVehiclePricing(vehicleId, nbJours, horsDakar);
            if (freshPricing.totalLocataire !== pricing.totalLocataire) {
                setPricing(freshPricing);
                setErrorMsg(
                    `Le prix a changé : ${freshPricing.totalLocataire} FCFA au lieu de ${pricing.totalLocataire} FCFA. Veuillez vérifier avant de payer.`,
                );
                setStep('recap');
                return;
            }

            if (activeRole === 'PROPRIETAIRE') {
                await authFetch('/auth/switch-role', { method: 'PATCH', body: { role: 'LOCATAIRE' } });
                setActiveRole('LOCATAIRE');
            }

            // Utiliser le provider correspondant directement (Wave ou Orange Money)
            const fournisseur = method === 'WAVE' ? 'WAVE' : 'ORANGE_MONEY';

            const { reservationId, paymentUrl } = await authFetch<
                { reservationId: string; paymentUrl: string | null },
                {
                    vehiculeId: string; dateDebut: string; dateFin: string;
                    fournisseur: 'ORANGE_MONEY' | 'WAVE'; idempotencyKey: string;
                    targetPayment: PaymentMethod; payerPhone: string;
                    modePaiement?: 'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN';
                }
            >('/reservations', {
                method: 'POST',
                body: {
                    vehiculeId:     vehicleId,
                    dateDebut,
                    dateFin,
                    fournisseur,
                    idempotencyKey: crypto.randomUUID(),
                    targetPayment:  method,
                    payerPhone:     phoneClean,
                    modePaiement,
                    ...(wantsDelivery && adresseLivraison ? { adresseLivraison } : {}),
                    ...(horsDakar ? { horsDakar: true } : {}),
                },
            });

            sessionStorage.setItem('pending_reservation_id', reservationId);

            if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }

            setWaitingId(reservationId);
            setStep('waiting');

        } catch (err) {
            if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
                const msg = err.message?.toLowerCase() ?? '';
                if (msg.includes('disponible') || msg.includes('overlap') || msg.includes('conflit') || msg.includes('conflict')) {
                    setErrorMsg('Ce véhicule n\'est plus disponible pour ces dates.');
                } else {
                    setErrorMsg(err.message || 'Erreur lors du paiement');
                }
            } else {
                setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du paiement');
            }
            setStep('error');
        }
    }

    const mainPhoto   = vehicle?.photos?.find((p) => p.estPrincipale)?.url ?? vehicle?.photos?.[0]?.url ?? null;
    const fmtDate     = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const deliveryFee = wantsDelivery && vehicle?.fraisLivraison ? Number(vehicle.fraisLivraison) : 0;
    const grandTotal  = pricing ? pricing.totalLocataire + deliveryFee : 0;
    const amountToPay = modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
        ? Math.round(grandTotal * 0.3)
        : grandTotal;
    const balanceAtCheckin = modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
        ? Math.round(grandTotal * 0.7)
        : 0;
    const methodInfo  = PAYMENT_METHODS.find((m) => m.id === method)!;

    /* ── Loading ── */
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </main>
        );
    }

    /* ── Erreur ── */
    if (!vehicle || !pricing || step === 'error') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl border bg-red-50 border-red-100 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                </div>
                <div className="text-center max-w-xs">
                    <p className="text-[15px] font-bold text-slate-700">{errorMsg || 'Véhicule introuvable'}</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setStep('recap'); setErrorMsg(''); setRetryCount(c => c + 1); }}
                    className="text-[13px] font-semibold text-slate-400 hover:text-slate-600 underline decoration-dotted"
                >
                    Réessayer
                </button>
            </main>
        );
    }

    /* ── Traitement en cours ── */
    if (step === 'processing') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-5 px-4">
                <div className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-black text-slate-800">Envoi de la demande…</p>
                    <p className="text-[13px] text-slate-400 mt-1">Connexion à {methodInfo.label}</p>
                </div>
            </main>
        );
    }

    /* ── En attente de confirmation sur le téléphone ── */
    if (step === 'waiting') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-sm text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
                            Vérifiez votre téléphone
                        </h1>
                        <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                            Une notification de paiement de{' '}
                            <span className="font-bold text-slate-700">{formatPrice(grandTotal)}</span>{' '}
                            a été envoyée sur votre numéro{' '}
                            <span className="font-bold text-slate-700">{payerPhone}</span>{' '}
                            via {methodInfo.label}.
                        </p>
                        <p className="mt-3 text-[13px] text-emerald-600 font-semibold">
                            Approuvez le paiement dans votre app pour confirmer la réservation.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[12px] text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        En attente de votre confirmation…
                    </div>
                    <Link
                        href="/reservations"
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 px-5 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        Voir mes réservations
                    </Link>
                </div>
            </main>
        );
    }

    /* ── Récapitulatif ── */
    return (
        <main className="min-h-screen bg-[#F8FAFB]">
            <div className="mx-auto max-w-lg px-4 py-8 pb-28 lg:py-12 lg:pb-12">

                {/* Retour */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-7"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                    Retour au véhicule
                </button>

                {/* Titre */}
                <div className="mb-7">
                    <h1 className="text-[26px] font-black tracking-tight text-slate-900">Finaliser la réservation</h1>
                    <p className="text-[13px] text-slate-400 mt-1">Vérifiez les détails puis choisissez votre moyen de paiement</p>
                </div>

                {/* Récap véhicule */}
                <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] overflow-hidden mb-4">
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
                    <div className="px-4 py-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" strokeWidth={2} />
                        <span className="text-[12.5px] font-semibold text-slate-500">{fmtDate(dateDebut)}</span>
                        <span className="text-slate-200 mx-1">→</span>
                        <span className="text-[12.5px] font-semibold text-slate-500">{fmtDate(dateFin)}</span>
                        <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {nbJours} jour{nbJours > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Récap prix */}
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
                    {deliveryFee > 0 && (
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] text-slate-500 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5" strokeWidth={2} />
                                Livraison — {adresseLivraison}
                            </span>
                            <span className="text-[13px] font-semibold text-slate-700 tabular-nums">
                                {formatPrice(deliveryFee)}
                            </span>
                        </div>
                    )}
                    <div className="h-px bg-slate-100 mb-3" />
                    <div className="flex items-center justify-between">
                        <span className="text-[15px] font-black text-slate-800">Total</span>
                        <span className="text-[22px] font-black text-emerald-600 tabular-nums">{formatPrice(grandTotal)}</span>
                    </div>

                    {/* Mode de paiement badge */}
                    <div className="h-px bg-slate-100 my-3" />
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-violet-500" strokeWidth={2} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Mode de paiement</span>
                    </div>
                    {modePaiement === 'TOTAL_EN_LIGNE' ? (
                        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                                <span className="text-[13px] font-bold text-emerald-900">Paiement total en ligne</span>
                            </div>
                            <p className="text-[11.5px] text-emerald-700 mt-1 ml-6">Le montant total est débité maintenant.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-violet-200 bg-violet-50/60 p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-violet-600" strokeWidth={2} />
                                <span className="text-[13px] font-bold text-violet-900">Accompte 30% + Solde à la remise</span>
                            </div>
                            <div className="ml-6 space-y-1.5">
                                <div className="flex justify-between items-center text-[12.5px]">
                                    <span className="text-violet-700 font-semibold">À payer maintenant (30%)</span>
                                    <span className="font-black text-violet-700 tabular-nums">{formatPrice(amountToPay)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12.5px]">
                                    <span className="text-slate-500 font-semibold">Solde à la remise (70%)</span>
                                    <span className="font-semibold text-slate-500 tabular-nums">{formatPrice(balanceAtCheckin)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Méthode de paiement + numéro */}
                <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5 mb-4">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Moyen de paiement</h2>
                    <div className="space-y-2.5">
                        {PAYMENT_METHODS.map((m) => (
                            <PaymentMethodOption
                                key={m.id}
                                selected={method === m.id}
                                onSelect={() => setMethod(m.id)}
                                method={m.id}
                            />
                        ))}
                    </div>

                    {/* Champ numéro de téléphone */}
                    <div className="mt-4">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Numéro de téléphone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={2} />
                            <input
                                type="tel"
                                value={payerPhone}
                                onChange={(e) => { setPayerPhone(e.target.value); if (errorMsg) setErrorMsg(''); }}
                                placeholder={methodInfo.phonePlaceholder}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-[14px] font-semibold text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <p className="text-[10.5px] text-slate-300 mt-3 text-center">🔒 Paiement sécurisé</p>
                </div>

                {/* Avertissement */}
                {errorMsg && step === 'recap' && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 mb-4">
                        <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-[12.5px] font-semibold text-amber-800 leading-relaxed">{errorMsg}</p>
                    </div>
                )}

                {/* Acceptation contrat */}
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

                {/* Bouton payer — desktop */}
                <button
                    type="button"
                    disabled={!contractAccepted || step !== 'recap'}
                    onClick={handlePay}
                    className={cn(
                        'hidden lg:flex w-full relative items-center justify-center gap-3 rounded-2xl px-6 py-4 overflow-hidden',
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
                    <MethodLogo method={method} size={22} />
                    Payer {formatPrice(amountToPay)}
                </button>

                <p className="text-center text-[11px] text-slate-300 mt-4">
                    Paiement 100% sécurisé · Réservation instantanée
                </p>

            </div>

            {/* Bouton payer — mobile fixe en bas */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                    type="button"
                    disabled={!contractAccepted || step !== 'recap'}
                    onClick={handlePay}
                    className={cn(
                        'w-full relative flex items-center justify-center gap-3 rounded-2xl px-6 py-4 overflow-hidden',
                        'text-[15px] font-black tracking-tight transition-all duration-300',
                        contractAccepted
                            ? 'text-white shadow-xl shadow-emerald-500/25 active:translate-y-0'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed',
                    )}
                    style={contractAccepted ? { background: 'linear-gradient(135deg, #34D399 0%, #059669 55%, #047857 100%)' } : {}}
                >
                    <MethodLogo method={method} size={22} />
                    Payer {formatPrice(amountToPay)}
                </button>
            </div>
        </main>
    );
}
