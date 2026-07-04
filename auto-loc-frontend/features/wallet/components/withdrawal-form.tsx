'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { requestWithdrawalAction } from '@/features/wallet/actions/request-withdrawal';
import { cn } from '@/lib/utils';

type Methode = 'WAVE' | 'ORANGE_MONEY';

interface WithdrawalFormProps {
    soldeDisponible: string;
    soldeWave: string;
    soldeOrangeMoney: string;
}

const METHODS: { value: Methode; label: string; logo: string; color: string; border: string; bg: string; activeBorder: string; activeBg: string }[] = [
    {
        value: 'WAVE',
        label: 'Wave',
        logo: '/wavelogo.jpeg',
        color: 'text-blue-700',
        border: 'border-slate-200',
        bg: 'bg-slate-50',
        activeBorder: 'border-blue-400',
        activeBg: 'bg-blue-50',
    },
    {
        value: 'ORANGE_MONEY',
        label: 'Orange Money',
        logo: '/orangeMoneylogo.jpg',
        color: 'text-orange-700',
        border: 'border-slate-200',
        bg: 'bg-slate-50',
        activeBorder: 'border-orange-400',
        activeBg: 'bg-orange-50',
    },
];

const QUICK_PERCENTS = [25, 50, 75, 100] as const;

export function WithdrawalForm({ soldeDisponible, soldeWave, soldeOrangeMoney }: WithdrawalFormProps) {
    const solde = Math.floor(Number(soldeDisponible));
    const soldeWaveNum = Math.floor(Number(soldeWave));
    const soldeOMNum = Math.floor(Number(soldeOrangeMoney));
    const [methode, setMethode] = useState<Methode | null>(null);
    const [numero, setNumero] = useState('');
    const [montant, setMontant] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Solde disponible selon la méthode sélectionnée
    const soldeMethode = methode === 'WAVE' ? soldeWaveNum : methode === 'ORANGE_MONEY' ? soldeOMNum : solde;

    const amount = Number(montant);
    const numeroClean = numero.replace(/\s/g, '');
    const numeroValid = /^[0-9]{9,12}$/.test(numeroClean);
    const isValid = methode !== null && numeroValid && amount >= 500 && amount <= soldeMethode;

    function applyPercent(pct: typeof QUICK_PERCENTS[number]) {
        setMontant(Math.floor(soldeMethode * pct / 100).toString());
        setStatus('idle');
        setErrorMsg('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid || !methode) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            await requestWithdrawalAction({ montant: amount, methode, numeroDestinataire: numeroClean });
            setStatus('success');
            setMontant('');
            setNumero('');
            setMethode(null);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div id="withdraw" className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
                </div>
                <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[14px] font-black text-slate-900">Demande envoyée</p>
                        <p className="text-[12px] text-slate-400 mt-1 max-w-[260px] mx-auto">
                            Votre retrait est en cours de traitement. Les fonds seront versés sous 24–48 h.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-2 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        Faire un autre retrait
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="withdraw" className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">Retrait</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                {/* Solde disponible */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[11.5px] font-semibold text-emerald-700">
                        {methode === 'WAVE' ? 'Solde Wave disponible' : methode === 'ORANGE_MONEY' ? 'Solde Orange Money disponible' : 'Solde disponible'}
                    </span>
                    <span className="text-[14px] font-black text-emerald-700 tabular-nums">
                        {soldeMethode.toLocaleString('fr-FR')} FCFA
                    </span>
                </div>

                {/* Méthode */}
                <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
                        Méthode de réception
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {METHODS.map((m) => {
                            const active = methode === m.value;
                            return (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => { setMethode(m.value); setStatus('idle'); }}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all',
                                        active ? `${m.activeBorder} ${m.activeBg}` : `${m.border} ${m.bg} hover:border-slate-300`,
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 relative">
                                        <Image
                                            src={m.logo}
                                            alt={m.label}
                                            width={24}
                                            height={24}
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className={cn('text-[13px] font-bold', active ? m.color : 'text-slate-600')}>
                                        {m.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Numéro */}
                <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
                        {methode === 'WAVE' ? 'Numéro Wave' : methode === 'ORANGE_MONEY' ? 'Numéro Orange Money' : 'Numéro de réception'}
                    </label>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={numero}
                        onChange={(e) => { setNumero(e.target.value); setStatus('idle'); }}
                        placeholder="ex : 77 000 00 00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                    {numero && !numeroValid && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">Numéro invalide (9 à 12 chiffres)</p>
                    )}
                </div>

                {/* Montant */}
                <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">Sélection rapide</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {QUICK_PERCENTS.map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => applyPercent(pct)}
                                disabled={soldeMethode === 0}
                                className="py-2 rounded-xl border border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {pct === 100 ? 'Tout' : `${pct}%`}
                            </button>
                        ))}
                    </div>

                    <label className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
                        Montant (FCFA)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min={500}
                            max={soldeMethode}
                            step={100}
                            value={montant}
                            onChange={(e) => { setMontant(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                            placeholder="ex : 25 000"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
                            FCFA
                        </span>
                    </div>
                    {montant && amount < 500 && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">Montant minimum : 500 FCFA</p>
                    )}
                    {montant && amount > soldeMethode && soldeMethode > 0 && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">
                            Montant supérieur au solde {methode === 'WAVE' ? 'Wave' : methode === 'ORANGE_MONEY' ? 'Orange Money' : ''} disponible
                        </p>
                    )}
                    {soldeMethode === 0 && methode && (
                        <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                            Aucun solde {methode === 'WAVE' ? 'Wave' : 'Orange Money'} disponible pour le moment
                        </p>
                    )}
                </div>

                {/* Error */}
                {status === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                        <p className="text-[12px] font-medium text-red-600">{errorMsg}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isValid || status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-[13px] font-bold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                            Traitement…
                        </>
                    ) : (
                        <>
                            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                            Demander le retrait
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
