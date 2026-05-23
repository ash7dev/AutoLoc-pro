'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft, Loader2, Shield,
    Clock, Check, Truck,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchVehicle, fetchVehiclePricing, type Vehicle, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { ApiError } from '@/lib/nestjs/api-client';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { useCurrency } from '@/providers/currency-provider';

// ── Payment method mapped to PayTech target_payment values ────────────────────
// PayTech gère tout en un seul gateway — Wave, Orange Money, Free Money, Carte bancaire.
// Le backend reçoit toujours le même webhook /payments/webhook/paytech peu importe le choix.
type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CARTE_BANCAIRE';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sublabel: string; targetPayment: string }[] = [
    { id: 'WAVE', label: 'Wave', sublabel: 'Paiement mobile instantané · Sans frais', targetPayment: 'Wave' },
    { id: 'ORANGE_MONEY', label: 'Orange Money', sublabel: 'Paiement via votre compte Orange', targetPayment: 'Orange Money' },
    { id: 'FREE_MONEY', label: 'Free Money', sublabel: 'Paiement via votre compte Free', targetPayment: 'Free Money' },
    { id: 'CARTE_BANCAIRE', label: 'Carte bancaire', sublabel: 'Visa, Mastercard · Paiement sécurisé', targetPayment: 'Carte Bancaire' },
];

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

function FreeMoneyLogo({ size = 40 }: { size?: number }) {
    return (
        <div
            className="rounded-xl bg-[#E30613] flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]"
            style={{ width: size, height: size }}
        >
            Free
        </div>
    );
}

function CarteBancaireLogo({ size = 40 }: { size?: number }) {
    return (
        <div
            className="rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <svg width={size * 0.55} height={size * 0.4} viewBox="0 0 22 16" fill="none">
                <rect x="0.5" y="0.5" width="21" height="15" rx="2.5" fill="#1e293b" stroke="#475569" />
                <rect y="3" width="22" height="3.5" fill="#475569" />
                <rect x="2" y="9" width="6" height="1.5" rx="0.75" fill="#94a3b8" />
                <rect x="2" y="11.5" width="4" height="1.5" rx="0.75" fill="#94a3b8" />
            </svg>
        </div>
    );
}

function MethodLogo({ method, size = 40 }: { method: PaymentMethod; size?: number }) {
    if (method === 'WAVE') return <WaveLogo size={size} />;
    if (method === 'ORANGE_MONEY') return <OrangeMoneyLogo size={size} />;
    if (method === 'FREE_MONEY') return <FreeMoneyLogo size={size} />;
    return <CarteBancaireLogo size={size} />;
}

/* ════════════════════════════════════════════════════════════════
   PAYMENT METHOD OPTION
════════════════════════════════════════════════════════════════ */
const METHOD_COLORS: Record<PaymentMethod, { border: string; bg: string; dot: string }> = {
    WAVE: { border: 'border-[#1B68F9]', bg: 'bg-blue-50/60', dot: 'border-[#1B68F9] bg-[#1B68F9]' },
    ORANGE_MONEY: { border: 'border-[#FF6600]', bg: 'bg-orange-50/60', dot: 'border-[#FF6600] bg-[#FF6600]' },
    FREE_MONEY: { border: 'border-[#E30613]', bg: 'bg-red-50/60', dot: 'border-[#E30613] bg-[#E30613]' },
    CARTE_BANCAIRE: { border: 'border-slate-700', bg: 'bg-slate-50/60', dot: 'border-slate-700 bg-slate-700' },
};

function PaymentMethodOption({
    selected, onSelect, method,
}: {
    selected: boolean;
    onSelect: () => void;
    method: PaymentMethod;
}) {
    const info = PAYMENT_METHODS.find((m) => m.id === method)!;
    const colors = METHOD_COLORS[method];
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 text-left group',
                selected ? `${colors.border} ${colors.bg}` : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50',
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
type PaymentStep = 'recap' | 'redirecting' | 'error';

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
    const horsDakar = searchParams.get('horsDakar') === '1';
    const wantsDelivery = searchParams.get('livraison') === '1';
    const adresseLivraison = searchParams.get('adresseLivraison') ?? '';

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<PaymentStep>('recap');
    const [method, setMethod] = useState<PaymentMethod>('WAVE');
    const [contractAccepted, setContractAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const activeRole = useRoleStore((s) => s.activeRole);
    const setActiveRole = useRoleStore((s) => s.setActiveRole);
    const { authFetch } = useAuthFetch();

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

    async function handlePay() {
        if (!contractAccepted || !vehicle || !pricing || step !== 'recap') return;
        setErrorMsg('');
        setStep('redirecting');
        try {
            // Re-vérifier le prix avant de payer
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

            const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method)!;

            const { reservationId, paymentUrl } = await authFetch<
                { reservationId: string; paymentUrl: string },
                {
                    vehiculeId: string; dateDebut: string; dateFin: string;
                    fournisseur: 'PAYTECH'; targetPayment: string;
                    idempotencyKey: string;
                }
            >('/reservations', {
                method: 'POST',
                body: {
                    vehiculeId: vehicleId,
                    dateDebut, dateFin,
                    fournisseur: 'PAYTECH',
                    targetPayment: selectedMethod.targetPayment,
                    idempotencyKey: crypto.randomUUID(),
                    ...(wantsDelivery && adresseLivraison ? { adresseLivraison } : {}),
                    ...(horsDakar ? { horsDakar: true } : {}),
                },
            });

            // Sauvegarder le reservationId pour la page de succès/annulation
            sessionStorage.setItem('paytech_pending_reservation_id', reservationId);

            // Rediriger vers la page de paiement PayTech
            window.location.href = paymentUrl;

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

    const mainPhoto = vehicle?.photos?.find((p) => p.estPrincipale)?.url ?? vehicle?.photos?.[0]?.url ?? null;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const deliveryFee = wantsDelivery && vehicle?.fraisLivraison ? Number(vehicle.fraisLivraison) : 0;
    const grandTotal = pricing ? pricing.totalLocataire + deliveryFee : 0;

    /* ── Loading ── */
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </main>
        );
    }

    /* ── Error ── */
    if (!vehicle || !pricing || step === 'error') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-16 h-16 rounded-2xl border bg-red-50 border-red-100 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                </div>
                <div className="text-center max-w-xs">
                    <p className="text-[15px] font-bold text-slate-700">{errorMsg || 'Véhicule introuvable'}</p>
                </div>
                <button type="button" onClick={() => { setStep('recap'); setErrorMsg(''); setRetryCount(c => c + 1); }}
                    className="text-[13px] font-semibold text-slate-400 hover:text-slate-600 underline decoration-dotted">
                    Réessayer
                </button>
            </main>
        );
    }

    /* ── Redirecting to PayTech ── */
    if (step === 'redirecting') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-5 px-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-black text-slate-800">Redirection en cours…</p>
                    <p className="text-[13px] text-slate-400 mt-1">
                        Vous allez être redirigé vers la page de paiement {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                    </p>
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
                        <span className="text-[15px] font-black text-slate-800">Total à payer</span>
                        <span className="text-[22px] font-black text-emerald-600 tabular-nums">{formatPrice(grandTotal)}</span>
                    </div>
                </div>

                {/* ── Payment method ── */}
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
                    <p className="text-[10.5px] text-slate-300 mt-3 text-center">🔒 Paiement sécurisé via PayTech</p>
                </div>

                {/* ── Prix changé — avertissement ── */}
                {errorMsg && step === 'recap' && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 mb-4">
                        <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-[12.5px] font-semibold text-amber-800 leading-relaxed">{errorMsg}</p>
                    </div>
                )}

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
                    disabled={!contractAccepted || step !== 'recap'}
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
                    <MethodLogo method={method} size={22} />
                    Payer {formatPrice(grandTotal)}
                </button>

                <p className="text-center text-[11px] text-slate-300 mt-4">
                    Paiement 100% sécurisé · Réservation instantanée
                </p>

            </div>
        </main>
    );
}

