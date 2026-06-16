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

// ── Types ──────────────────────────────────────────────────────────────────────

type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CARTE_BANCAIRE';

interface IntouchWidgetConfig {
    scriptUrl: string;
    merchantId: string;
    token: string;
    domain: string;
    successUrl: string;
    cancelUrl: string;
    amount: number;
    city: string;
    idFromClient: string;
}

// ── Méthodes de paiement ───────────────────────────────────────────────────────

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sublabel: string }[] = [
    { id: 'WAVE',          label: 'Wave',          sublabel: 'Paiement mobile instantané · Sans frais' },
    { id: 'ORANGE_MONEY',  label: 'Orange Money',  sublabel: 'Paiement via votre compte Orange' },
    { id: 'CARTE_BANCAIRE', label: 'Carte bancaire', sublabel: 'Visa, Mastercard · Paiement sécurisé' },
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

function CarteBancaireLogo({ size = 40 }: { size?: number }) {
    return (
        <div
            className="rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ width: size, height: size }}
        >
            <Image
                src="/cb.png"
                alt="Carte bancaire"
                width={size}
                height={size}
                className="object-contain"
                style={{ width: size * 0.75, height: size * 0.75 }}
            />
        </div>
    );
}

function MethodLogo({ method, size = 40 }: { method: PaymentMethod; size?: number }) {
    if (method === 'WAVE')          return <WaveLogo size={size} />;
    if (method === 'ORANGE_MONEY')  return <OrangeMoneyLogo size={size} />;
    return <CarteBancaireLogo size={size} />;
}

/* ════════════════════════════════════════════════════════════════
   OPTION DE MÉTHODE
════════════════════════════════════════════════════════════════ */
const METHOD_COLORS: Record<PaymentMethod, { border: string; bg: string; dot: string }> = {
    WAVE:          { border: 'border-[#1B68F9]',  bg: 'bg-blue-50/60',   dot: 'border-[#1B68F9] bg-[#1B68F9]' },
    ORANGE_MONEY:  { border: 'border-[#FF6600]',  bg: 'bg-orange-50/60', dot: 'border-[#FF6600] bg-[#FF6600]' },
    CARTE_BANCAIRE: { border: 'border-slate-700', bg: 'bg-slate-50/60',  dot: 'border-slate-700 bg-slate-700' },
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

// ── Chargement dynamique du SDK TouchPay ───────────────────────────────────────

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Échec chargement SDK : ${src}`));
        document.head.appendChild(script);
    });
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
type PaymentStep = 'recap' | 'redirecting' | 'error';

export default function PaymentPage() {
    const router       = useRouter();
    const { formatPrice } = useCurrency();
    const searchParams = useSearchParams();
    const vehicleId    = typeof window !== 'undefined'
        ? window.location.pathname.split('/vehicle/')[1]?.split('/payment')[0] ?? ''
        : '';

    const dateDebut       = searchParams.get('dateDebut') ?? '';
    const dateFin         = searchParams.get('dateFin') ?? '';
    const nbJours         = Number(searchParams.get('nbJours') ?? 0);
    const horsDakar       = searchParams.get('horsDakar') === '1';
    const wantsDelivery   = searchParams.get('livraison') === '1';
    const adresseLivraison = searchParams.get('adresseLivraison') ?? '';

    const [vehicle,          setVehicle]          = useState<Vehicle | null>(null);
    const [pricing,          setPricing]          = useState<PricingResponse | null>(null);
    const [loading,          setLoading]          = useState(true);
    const [step,             setStep]             = useState<PaymentStep>('recap');
    const [method,           setMethod]           = useState<PaymentMethod>('WAVE');
    const [contractAccepted, setContractAccepted] = useState(false);
    const [errorMsg,         setErrorMsg]         = useState('');
    const [retryCount,       setRetryCount]       = useState(0);

    const activeRole    = useRoleStore((s) => s.activeRole);
    const setActiveRole = useRoleStore((s) => s.setActiveRole);
    const { authFetch } = useAuthFetch();

    // Précharger les scripts InTouch dès le montage pour éviter la latence au clic
    useEffect(() => {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js')
            .then(() => loadScript('https://touchpay.gutouch.net/touchpayv2/script/prod_touchpay-0.0.1.js'))
            .catch(() => { /* silencieux — on réessaiera au clic */ });
    }, []);

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
            // Vérification du prix avant paiement
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

            const { reservationId, paymentUrl, widgetConfig } = await authFetch<
                { reservationId: string; paymentUrl: string | null; widgetConfig?: IntouchWidgetConfig },
                { vehiculeId: string; dateDebut: string; dateFin: string; fournisseur: 'INTOUCH'; idempotencyKey: string }
            >('/reservations', {
                method: 'POST',
                body: {
                    vehiculeId:    vehicleId,
                    dateDebut,
                    dateFin,
                    fournisseur:   'INTOUCH',
                    idempotencyKey: crypto.randomUUID(),
                    ...(wantsDelivery && adresseLivraison ? { adresseLivraison } : {}),
                    ...(horsDakar ? { horsDakar: true } : {}),
                },
            });

            // Persister l'ID pour les pages success/cancel
            sessionStorage.setItem('pending_reservation_id', reservationId);

            if (widgetConfig) {
                // CryptoJS requis par le SDK TouchPay (dépendance non bundlée)
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js');
                await loadScript(widgetConfig.scriptUrl);
                (window as unknown as { sendPaymentInfos: (...args: unknown[]) => void }).sendPaymentInfos(
                    widgetConfig.idFromClient,
                    widgetConfig.merchantId,
                    widgetConfig.token,
                    widgetConfig.domain,
                    widgetConfig.successUrl,
                    widgetConfig.cancelUrl,
                    widgetConfig.amount,
                    widgetConfig.city,
                    '', '', '', '',
                );
            } else if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                throw new Error('Aucune URL de paiement reçue');
            }

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

    const mainPhoto  = vehicle?.photos?.find((p) => p.estPrincipale)?.url ?? vehicle?.photos?.[0]?.url ?? null;
    const fmtDate    = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const deliveryFee = wantsDelivery && vehicle?.fraisLivraison ? Number(vehicle.fraisLivraison) : 0;
    const grandTotal  = pricing ? pricing.totalLocataire + deliveryFee : 0;

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

    /* ── Redirection en cours ── */
    if (step === 'redirecting') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-5 px-4">
                <div className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-black text-slate-800">Ouverture du paiement…</p>
                    <p className="text-[13px] text-slate-400 mt-1">
                        Vous allez être redirigé vers{' '}
                        {PAYMENT_METHODS.find((m) => m.id === method)?.label ?? 'la page de paiement'}
                    </p>
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
                        <span className="text-[15px] font-black text-slate-800">Total à payer</span>
                        <span className="text-[22px] font-black text-emerald-600 tabular-nums">{formatPrice(grandTotal)}</span>
                    </div>
                </div>

                {/* Méthode de paiement */}
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
                    <p className="text-[10.5px] text-slate-300 mt-3 text-center">🔒 Paiement sécurisé via InTouch</p>
                </div>

                {/* Avertissement changement de prix */}
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

                {/* Bouton payer — desktop : dans le flux normal */}
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
                    Payer {formatPrice(grandTotal)}
                </button>

                <p className="text-center text-[11px] text-slate-300 mt-4">
                    Paiement 100% sécurisé · Réservation instantanée
                </p>

            </div>

            {/* Bouton payer — mobile : fixe en bas de l'écran */}
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
                    Payer {formatPrice(grandTotal)}
                </button>
            </div>
        </main>
    );
}
